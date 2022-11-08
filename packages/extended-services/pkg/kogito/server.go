/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
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

package kogito

import (
	"bufio"
	"context"
	"crypto/tls"
	"net"

	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/kiegroup/kie-tools/extended-services/pkg/config"
	"github.com/phayes/freeport"
)

type Proxy struct {
	ctx                context.Context
	view               *KogitoSystray
	server             *http.Server
	Started            bool
	URL                string
	Port               int
	RunnerPort         int
	jitexecutorPath    string
	InsecureSkipVerify bool
}

func NewProxy(ctx context.Context, port int, jitexecutor []byte, insecureSkipVerify bool) *Proxy {
	return &Proxy{
		ctx:                ctx,
		jitexecutorPath:    createJitExecutor(jitexecutor),
		Started:            false,
		Port:               port,
		InsecureSkipVerify: insecureSkipVerify,
	}
}

func (p *Proxy) Start() {
	var config config.Config
	conf := config.GetConfig()

	p.RunnerPort = getFreePort()
	runnerPort := strconv.Itoa(p.RunnerPort)
	p.URL = "http://127.0.0.1:" + runnerPort

	cmd := exec.CommandContext(p.ctx, p.jitexecutorPath, "-Dquarkus.http.port="+runnerPort)
	stdout, _ := cmd.StdoutPipe()

	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			msg := scanner.Text()
			fmt.Printf("msg: %s\n", msg)
		}
	}()

	go func() {
		cmd.Start()
	}()

	router := mux.NewRouter()
	router.PathPrefix("/devsandbox").HandlerFunc(p.devSandboxHandler())
	router.PathPrefix("/ping").HandlerFunc(p.pingHandler())
	router.PathPrefix("/").HandlerFunc(p.proxyHandler())

	addr := conf.Proxy.IP + ":" + strconv.Itoa(p.Port)
	p.server = &http.Server{
		Handler:      router,
		Addr:         addr,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	fmt.Printf("Server started: %s \n", addr)

	go p.server.ListenAndServe()
}

func (p *Proxy) Stop() {
	log.Println("Shutting down")

	if err := p.server.Shutdown(p.ctx); err != nil {
		log.Fatalf("Server Shutdown Failed:%+v", err)
	}
	log.Println("Shutdown complete")

	p.RunnerPort = 0
}

func (p *Proxy) devSandboxHandler() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			w.Header().Add("Access-Control-Allow-Origin", "*")
			w.Header().Add("Access-Control-Allow-Methods", "*")
			w.Header().Add("Access-Control-Allow-Headers", "*")
			return
		}

		targetUrl, err := url.Parse(r.Header.Get("Target-Url"))
		if err != nil {
			log.Fatal(err)
		}
		emptyUrl, _ := url.Parse("")
		r.URL = emptyUrl
		r.Host = r.URL.Host

		proxy := httputil.NewSingleHostReverseProxy(targetUrl)

		// tolerate p-signed certificates
		proxy.Transport = &http.Transport{
			Proxy: http.ProxyFromEnvironment,
			DialContext: (&net.Dialer{
				Timeout:   30 * time.Second,
				KeepAlive: 30 * time.Second,
			}).DialContext,
			ForceAttemptHTTP2:     true,
			MaxIdleConns:          10,
			IdleConnTimeout:       60 * time.Second,
			TLSHandshakeTimeout:   10 * time.Second,
			ExpectContinueTimeout: 1 * time.Second,
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: p.InsecureSkipVerify,
			},
		}

		proxy.ModifyResponse = func(resp *http.Response) error {
			resp.Header.Add("Access-Control-Allow-Origin", "*")
			resp.Header.Add("Access-Control-Allow-Methods", "*")
			resp.Header.Add("Access-Control-Allow-Headers", "*")
			return nil
		}
		proxy.ServeHTTP(w, r)
	}
}

func (p *Proxy) proxyHandler() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		target, err := url.Parse(p.URL)
		if err != nil {
			log.Fatal(err)
		}
		proxy := httputil.NewSingleHostReverseProxy(target)
		r.Host = r.URL.Host
		proxy.ServeHTTP(w, r)
	}
}

func (p *Proxy) pingHandler() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Access-Control-Allow-Origin", "*")
		w.Header().Add("Access-Control-Allow-Methods", "GET")
		var config config.Config
		conf := config.GetConfig()
		conf.Proxy.Port = p.Port
		w.WriteHeader(http.StatusOK)
		json, _ := json.Marshal(conf)
		w.Write(json)
	}
}

func createJitExecutor(jitexecutor []byte) string {
	cacheDir, err := os.UserCacheDir()
	if err != nil {
		log.Fatal(err)
	}

	cachePath := filepath.Join(cacheDir, "org.kogito")

	if _, err := os.Stat(cachePath); os.IsNotExist(err) {
		os.Mkdir(cachePath, os.ModePerm)
	}

	var jitexecutorPath string
	if runtime.GOOS == "windows" {
		jitexecutorPath = filepath.Join(cachePath, "runner.exe")
	} else {
		jitexecutorPath = filepath.Join(cachePath, "runner")
	}

	if _, err := os.Stat(jitexecutorPath); err == nil {
		os.Remove(jitexecutorPath)
	}
	if err != nil {
		log.Fatal(err)
	}

	f, err := os.Create(jitexecutorPath)
	if err != nil {
		log.Fatal(err)
	}

	f.Chmod(0777)

	_, err = f.Write(jitexecutor)
	if err != nil {
		log.Fatal(err)
	}
	f.Close()
	return jitexecutorPath
}

func getFreePort() int {
	port, err := freeport.GetFreePort()
	if err != nil {
		log.Fatal(err)
	}
	return port
}
