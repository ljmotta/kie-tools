/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { varsWithName, composeEnv, getOrDefault } from "@kie-tools-scripts/build-env";
import * as rootEnv from "@kie-tools/root-env/env/index.mjs";
import packageJson from "../package.json" with { type: "json" };
import { env as devDeploymentBaseImageEnv } from "@kie-tools/dev-deployment-base-image/env/index.mjs";
import { env as mavenM2RepoViaHttpImageEnv } from "@kie-tools/maven-m2-repo-via-http-image/env/index.mjs";

const { devDeploymentBaseImage } = devDeploymentBaseImageEnv;
const { mavenM2RepoViaHttpImage } = mavenM2RepoViaHttpImageEnv;

export const { env, vars, self } = composeEnv([rootEnv], {
  vars: varsWithName({
    DEV_DEPLOYMENT_KOGITO_QUARKUS_BLANK_APP_IMAGE__builderImage: {
      default: `${devDeploymentBaseImage.registry}/${devDeploymentBaseImage.account}/${devDeploymentBaseImage.name}:${devDeploymentBaseImage.buildTag}`,
      description: "The image used in the FROM import.",
    },
    DEV_DEPLOYMENT_KOGITO_QUARKUS_BLANK_APP_IMAGE__registry: {
      default: "docker.io",
      description: "E.g., `docker.io` or `quay.io`.",
    },
    DEV_DEPLOYMENT_KOGITO_QUARKUS_BLANK_APP_IMAGE__account: {
      default: "apache",
      description: "E.g,. `apache` or `kie-tools-bot`",
    },
    DEV_DEPLOYMENT_KOGITO_QUARKUS_BLANK_APP_IMAGE__name: {
      default: "incubator-kie-sandbox-dev-deployment-kogito-quarkus-blank-app",
      description: "Name of the image itself.",
    },
    DEV_DEPLOYMENT_KOGITO_QUARKUS_BLANK_APP_IMAGE__buildTag: {
      default: rootEnv.env.root.streamName,
      description: "Tag version of this image. E.g., `main` or `10.0.x` or `10.0.0",
    },
    DEV_DEPLOYMENT_KOGITO_QUARKUS_BLANK_APP_IMAGE__mavenM2RepoViaHttpImage: {
      default: `${mavenM2RepoViaHttpImage.registry}/${mavenM2RepoViaHttpImage.account}/${mavenM2RepoViaHttpImage.name}:${mavenM2RepoViaHttpImage.tag}`,
      description: "The image tag for the Maven M2 Repo via HTTP. Used during the build only.",
    },
  }),
  get env() {
    return {
      devDeploymentKogitoQuarkusBlankAppImage: {
        builderImage: getOrDefault(this.vars.DEV_DEPLOYMENT_KOGITO_QUARKUS_BLANK_APP_IMAGE__builderImage),
        registry: getOrDefault(this.vars.DEV_DEPLOYMENT_KOGITO_QUARKUS_BLANK_APP_IMAGE__registry),
        account: getOrDefault(this.vars.DEV_DEPLOYMENT_KOGITO_QUARKUS_BLANK_APP_IMAGE__account),
        name: getOrDefault(this.vars.DEV_DEPLOYMENT_KOGITO_QUARKUS_BLANK_APP_IMAGE__name),
        buildTag: getOrDefault(this.vars.DEV_DEPLOYMENT_KOGITO_QUARKUS_BLANK_APP_IMAGE__buildTag),
        version: packageJson.version,
        dev: {
          mavenM2RepoViaHttpImage: getOrDefault(
            this.vars.DEV_DEPLOYMENT_KOGITO_QUARKUS_BLANK_APP_IMAGE__mavenM2RepoViaHttpImage
          ),
        },
      },
    };
  },
});
