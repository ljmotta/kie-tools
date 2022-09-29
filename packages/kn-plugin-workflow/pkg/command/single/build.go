/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package single

import (
	"bufio"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/kiegroup/kie-tools/packages/kn-plugin-workflow/pkg/common"
	"github.com/moby/buildkit/client/llb"
	"github.com/moby/buildkit/client/llb/imagemetaresolver"
	"github.com/moby/buildkit/session"
	"github.com/moby/buildkit/session/filesync"
	"github.com/ory/viper"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	fsutiltypes "github.com/tonistiigi/fsutil/types"
	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc"
)

type BuildCmdConfig struct {
	Extesions string // List of extensions separated by "," to be add on the Quarkus project

	// Image options
	Image      string // full image name
	Registry   string // image registry (overrides image name)
	Repository string // image repository (overrides image name)
	ImageName  string // image name (overrides image name)
	Tag        string // image tag (overrides image name)
}

// Client that panics when used after Close()
type closeGuardingClient struct {
	pimpl  client.CommonAPIClient
	m      sync.RWMutex
	closed bool
}

func NewBuildCommand() *cobra.Command {
	var cmd = &cobra.Command{
		Use:        "build",
		Short:      "Build a workflow project",
		Long:       ``,
		Example:    ``,
		SuggestFor: []string{"biuld", "buidl", "built"},
		PreRunE:    common.BindEnv("extension", "image", "image-registry", "image-repository", "image-name", "image-tag"),
	}

	cmd.RunE = func(cmd *cobra.Command, args []string) error {
		return runBuild(cmd, args)
	}

	cmd.Flags().StringP("extension", "e", "", "Project custom Maven extensions, separated with a comma.")
	cmd.Flags().StringP("image", "i", "", "Full image name in the form of [registry]/[repository]/[name]:[tag]")
	cmd.Flags().String("image-registry", "", "Image registry, ex: quay.io, if the --image flag is in use this option overrides image [registry]")
	cmd.Flags().String("image-repository", "", "Image repository, ex: registry-user or registry-project, if the --image flag is in use, this option overrides image [repository]")
	cmd.Flags().String("image-name", "", "Image name, ex: new-project, if the --image flag is in use, this option overrides the image [name]")
	cmd.Flags().String("image-tag", "", "Image tag, ex: 1.0, if the --image flag is in use, this option overrides the image [tag]")

	cmd.SetHelpFunc(common.DefaultTemplatedHelp)

	return cmd
}

func runBuild(cmd *cobra.Command, args []string) error {
	cfg, err := runBuildCmdConfig(cmd)
	if err != nil {
		return fmt.Errorf("initializing build config: %w", err)
	}

	if err := common.CheckDocker(); err != nil {
		return err
	}

	if err := runBuildImage(cfg, cmd); err != nil {
		return err
	}

	return nil
}

func runBuildCmdConfig(cmd *cobra.Command) (cfg BuildCmdConfig, err error) {
	cfg = BuildCmdConfig{
		Extesions:  viper.GetString("extension"),
		Image:      viper.GetString("image"),
		Registry:   viper.GetString("registry"),
		Repository: viper.GetString("repository"),
		ImageName:  viper.GetString("name"),
		Tag:        viper.GetString("tag"),
	}
	if len(cfg.Image) == 0 && len(cfg.ImageName) == 0 {
		fmt.Println("ERROR: either --image or --image-name should be used")
		err = fmt.Errorf("missing flags")
	}

	return
}
func runBuildImage(cfg BuildCmdConfig, cmd *cobra.Command) (err error) {
	start := time.Now()
	ctx := cmd.Context()
	dockerCli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return fmt.Errorf(err.Error())
	}

	// creates a grpc session for the dir
	// TODO: path flag?
	session, err := trySession(".", false)
	if err != nil {
		log.Fatal(err, " : failed session")
	}
	if session == nil {
		return fmt.Errorf("buildkit not supported by daemon")
	}

	// Adds the fs methods to the grpc
	session.Allow(filesync.NewFSSyncProvider([]filesync.SyncedDir{
		{
			Name: "context",
			Dir:  ".",
			Map:  resetUIDAndGID,
		},
		{
			Name: "dockerfile",
			Dir:  ".",
		},
	}))
	session.Allow(filesync.NewFSSyncTargetDir("./kubernets"))

	eg, ctx := errgroup.WithContext(ctx)
	eg.Go(func() error {
		return session.Run(context.TODO(), func(ctx context.Context, proto string, meta map[string][]string) (net.Conn, error) {
			return dockerCli.DialHijack(ctx, "/session", proto, meta)
		})
	})

	registry, repository, name, tag := common.GetImageConfig(cfg.Image, cfg.Registry, cfg.Repository, cfg.ImageName, cfg.Tag)
	if err := common.CheckImageName(name); err != nil {
		return err
	}

	var workflowSwJson string = common.WORKFLOW_SW_JSON

	// set buildargs
	buildArgs := map[string]*string{
		common.DOCKER_BUILD_ARG_WORKFLOW_FILE:            &workflowSwJson,
		common.DOCKER_BUILD_ARG_CONTAINER_IMAGE_REGISTRY: &registry,
		common.DOCKER_BUILD_ARG_CONTAINER_IMAGE_GROUP:    &repository,
		common.DOCKER_BUILD_ARG_CONTAINER_IMAGE_NAME:     &name,
		common.DOCKER_BUILD_ARG_CONTAINER_IMAGE_TAG:      &tag,
		common.DOCKER_BUILD_ARG_WORKFLOW_NAME:            &cfg.ImageName,
	}

	// check if exist extensions, multistage-build
	existExtensions := strconv.FormatBool(len(cfg.Extesions) > 0)
	buildArgs[common.DOCKER_BUILD_ARG_EXTENSIONS] = &existExtensions

	// check if has extensions
	if len(cfg.Extesions) > 0 {
		buildArgs[common.DOCKER_BUILD_ARG_EXTENSIONS_LIST] = &cfg.Extesions
	}

	// Check if exist or start buildkit container
	buildkitdContainer, err := dockerCli.ContainerCreate(ctx, &container.Config{
		Image:        "moby/buildkit:latest",
		AttachStdin:  false,
		AttachStdout: false,
		AttachStderr: false,
	}, &container.HostConfig{
		Privileged: true,
		AutoRemove: true,
	}, nil, nil, "buildkitd")
	if err != nil {
		fmt.Println("✅ Buildkit container is running")
	} else {
		if err := dockerCli.ContainerStart(ctx, buildkitdContainer.ID, types.ContainerStartOptions{}); err != nil {
			fmt.Println("error starting buildkitd")
			return err
		}
	}
	os.Setenv("BUILDKIT_HOST", "docker-container://buildkitd")

	base := createLLBBaseImage()
	// generate output llb
	outputReader, outputWriter, err := os.Pipe()
	if err != nil {
		return fmt.Errorf("pipe error: %w", err)
	}
	output, err := createLLBOutputFiles(base).Marshal(ctx)
	if err != nil {
		return fmt.Errorf("error output: %w", err)
	}

	// generate runner llb
	runnerReader, runnerWriter, err := os.Pipe()
	if err != nil {
		return fmt.Errorf("runner pipe error: %w", err)
	}
	runner, err := createLLBRunnerImage(base).Marshal(ctx)
	if err != nil {
		return fmt.Errorf("error output: %w", err)
	}

	// output folder
	command := exec.CommandContext(ctx, "buildctl", "build", "--progress", "plain", "--local", "context=.", "--output", "type=local,dest=output")
	llb.WriteTo(output, outputWriter)
	command.Stdin = outputReader
	stdout, _ := command.StdoutPipe()
	stderr, _ := command.StderrPipe()

	if err = command.Start(); err != nil {
		fmt.Printf("ERROR: starting command \"%s\" failed\n", "output command")
		return err
	}

	stdoutScanner := bufio.NewScanner(stdout)
	for stdoutScanner.Scan() {
		m := stdoutScanner.Text()
		fmt.Println(m)
	}

	stderrScanner := bufio.NewScanner(stderr)
	for stderrScanner.Scan() {
		m := stderrScanner.Text()
		fmt.Println(m)
	}

	if err = command.Wait(); err != nil {
		fmt.Printf("ERROR: something went wrong during command \"%s\"\n", "output command")
		return err
	}

	// output tar
	command2 := exec.CommandContext(ctx, "buildctl", "build", "--progress", "plain", "--local", "context=.", "--output", "type=oci,dest=output.tar")
	llb.WriteTo(runner, runnerWriter)
	command2.Stdin = runnerReader
	stdout2, _ := command2.StdoutPipe()
	stderr2, _ := command2.StderrPipe()

	if err = command2.Start(); err != nil {
		fmt.Printf("ERROR: starting command2 \"%s\" failed\n", "tar command2")
		return err
	}

	stdoutScanner2 := bufio.NewScanner(stdout2)
	for stdoutScanner2.Scan() {
		m := stdoutScanner2.Text()
		fmt.Println(m)
	}

	stderrScanner2 := bufio.NewScanner(stderr2)
	for stderrScanner2.Scan() {
		m := stderrScanner2.Text()
		fmt.Println(m)
	}

	if err = command2.Wait(); err != nil {
		fmt.Printf("ERROR: something went wrong during command2 \"%s\"\n", "tar command2")
		return err
	}

	fmt.Println("✅ Build success")
	fmt.Printf("🚀 Build took: %s \n", time.Since(start))
	return nil
}

func createLLBBaseImage() llb.State {
	var extensions = false
	var extensionList = "quarkus-jsonb"
	var workflowName = "test"
	var containerRegistry = "quay.io"
	var containerGroup = "lmotta"
	var containerName = "my-proj"
	var containerTag = "llb"

	opts := []llb.ImageOption{llb.LinuxAmd64}
	opts = append(opts, imagemetaresolver.WithDefault)
	base := llb.
		Image("quay.io/lmotta/kn-workflow:2.10.0.Final", opts...).
		Dir("/tmp/kn-plugin-workflow")

	if extensions {
		base = base.
			Run(
				llb.Shlex(fmt.Sprintf("./mvnw quarkus:add-extension -Dextensions=%s", extensionList)),
			).
			Root()
	} else {
		base = base.
			Run(
				llb.Shlex("echo \"WITHOUT ADDITIONAL EXTENSIONS\""),
			).
			Root()
	}

	base = base.File(llb.Copy(llb.Local("context"), "./workflow.sw.json", "./src/main/resources/workflow.sw.json"))
	if _, err := os.Stat("application.properties"); err == nil {
		base = base.File(llb.Copy(llb.Local("context"), "application.properties", "./src/main/resources/application.properties"))
	}

	base = base.
		Run(
			llb.Shlex(
				"./mvnw package" +
					" -Dquarkus.kubernetes.deployment-target=knative" +
					fmt.Sprintf(" -Dquarkus.knative.name=%s", workflowName) +
					fmt.Sprintf(" -Dquarkus.container-image.registry=%s", containerRegistry) +
					fmt.Sprintf(" -Dquarkus.container-image.group=%s", containerGroup) +
					fmt.Sprintf(" -Dquarkus.container-image.name=%s", containerName) +
					fmt.Sprintf(" -Dquarkus.container-image.tag=%s", containerTag),
			)).
		Root()

	return base
}

var CopyOptions = &llb.CopyInfo{
	FollowSymlinks:      true,
	CopyDirContentsOnly: true,
	AttemptUnpack:       false,
	CreateDestPath:      true,
	AllowWildcard:       true,
	AllowEmptyWildcard:  true,
}

func createLLBOutputFiles(base llb.State) llb.State {
	outputFiles := llb.Scratch().
		File(
			llb.Copy(base, "/tmp/kn-plugin-workflow/target/kubernetes", ".", CopyOptions),
		)
	return outputFiles
}

func createLLBRunnerImage(base llb.State) llb.State {
	opts := []llb.ImageOption{llb.LinuxAmd64}
	opts = append(opts, imagemetaresolver.WithDefault)

	runner := llb.Image("openjdk:11", opts...).
		File(
			llb.Copy(base, "/tmp/kn-plugin-workflow/target/quarkus-app/lib/", "/runner/", CopyOptions),
		)
	return runner
}

// Session is a long running connection between client and a daemon
type Session struct {
	id         string
	name       string
	sharedKey  string
	ctx        context.Context
	cancelCtx  func()
	done       chan struct{}
	grpcServer *grpc.Server
	conn       net.Conn
}

// Creates a new session
// A session is a grpc server that enables the Docker sdk to have a longer connection
func trySession(contextDir string, forStream bool) (*session.Session, error) {
	sessionHash := sha256.Sum256([]byte(fmt.Sprintf("%s", contextDir)))
	sharedKey := hex.EncodeToString(sessionHash[:])
	session, err := session.NewSession(context.Background(), filepath.Base(contextDir), sharedKey)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create session")
	}
	return session, nil
}

func resetUIDAndGID(_ string, s *fsutiltypes.Stat) bool {
	s.Uid = 0
	s.Gid = 0
	return true
}

type ErrorDetail struct {
	Message string `json:"message"`
}

type ErrorLine struct {
	Error       string      `json:"error"`
	ErrorDetail ErrorDetail `json:"errorDetail"`
}

func print(rd io.Reader) error {
	var lastLine string

	scanner := bufio.NewScanner(rd)
	for scanner.Scan() {
		lastLine = scanner.Text()
		fmt.Println(scanner.Text())
	}

	errLine := &ErrorLine{}
	json.Unmarshal([]byte(lastLine), errLine)
	if errLine.Error != "" {
		return errors.New(errLine.Error)
	}

	if err := scanner.Err(); err != nil {
		return err
	}

	return nil
}
