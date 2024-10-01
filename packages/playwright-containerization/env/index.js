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

const { varsWithName, composeEnv, getOrDefault } = require("@kie-tools-scripts/build-env");

const rootEnv = require("@kie-tools/root-env/env");

module.exports = composeEnv([rootEnv], {
  vars: varsWithName({
    PLAYWRIGHT_CONTAINERIZATION__ubuntuImageTag: {
      default: "22.04",
      description: "The ubuntu tag used in the FROM import.",
    },
    PLAYWRIGHT_CONTAINERIZATION__nodeVersion: {
      default: "20.14.0",
      description: "Node version used in the project",
    },
    PLAYWRIGHT_CONTAINERIZATION__imageRegistry: {
      default: "docker.io",
      description: "E.g., `docker.io` or `quay.io`.",
    },
    PLAYWRIGHT_CONTAINERIZATION__imageAccount: {
      default: "apache",
      description: "E.g,. `apache` or `kie-tools-bot`",
    },
    PLAYWRIGHT_CONTAINERIZATION__imageName: {
      default: "incubator-kie-playwright-containerization",
      description: "Name of the image itself.",
    },
    PLAYWRIGHT_CONTAINERIZATION__imageBuildTag: {
      default: rootEnv.env.root.streamName,
      description: "Tag version of this image. E.g., `main` or `10.0.x` or `10.0.0",
    },
  }),
  get env() {
    return {
      playwrightContainerization: {
        ubuntuImageTag: getOrDefault(this.vars.PLAYWRIGHT_CONTAINERIZATION__ubuntuImageTag),
        nodeVersion: getOrDefault(this.vars.PLAYWRIGHT_CONTAINERIZATION__nodeVersion),
        registry: getOrDefault(this.vars.PLAYWRIGHT_CONTAINERIZATION__imageRegistry),
        account: getOrDefault(this.vars.PLAYWRIGHT_CONTAINERIZATION__imageAccount),
        name: getOrDefault(this.vars.PLAYWRIGHT_CONTAINERIZATION__imageName),
        buildTag: getOrDefault(this.vars.PLAYWRIGHT_CONTAINERIZATION__imageBuildTag),
      },
    };
  },
});
