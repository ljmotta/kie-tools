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
    PLAYWRIGHT_BROWSERS_SERVER__playwrightImageTag: {
      default: "v1.45.2-focal",
      description: "The image tag used in the FROM import. Should match the @playwright/test version",
    },
    PLAYWRIGHT_BROWSERS_SERVER__imageRegistry: {
      default: "docker.io",
      description: "E.g., `docker.io` or `quay.io`.",
    },
    PLAYWRIGHT_BROWSERS_SERVER__imageAccount: {
      default: "apache",
      description: "E.g,. `apache` or `kie-tools-bot`",
    },
    PLAYWRIGHT_BROWSERS_SERVER__imageName: {
      default: "incubator-kie-playwright-browsers-web-sever",
      description: "Name of the image itself.",
    },
    PLAYWRIGHT_BROWSERS_SERVER__imageBuildTag: {
      default: rootEnv.env.root.streamName,
      description: "Tag version of this image. E.g., `main` or `10.0.x` or `10.0.0",
    },
    PLAYWRIGHT_BROWSERS_SERVER__chromiumPort: {
      default: 10001,
      description: "Chromium websocket port",
    },
    PLAYWRIGHT_BROWSERS_SERVER__chromePort: {
      default: 10010,
      description: "Chrome websocket port",
    },
    PLAYWRIGHT_BROWSERS_SERVER__webkitPort: {
      default: 10100,
      description: "Webkit websocket port",
    },
  }),
  get env() {
    return {
      playwrightBrowsersServer: {
        port: {
          chromium: getOrDefault(this.vars.PLAYWRIGHT_BROWSERS_SERVER__chromiumPort),
          chrome: getOrDefault(this.vars.PLAYWRIGHT_BROWSERS_SERVER__chromePort),
          webkit: getOrDefault(this.vars.PLAYWRIGHT_BROWSERS_SERVER__webkitPort),
        },
        image: {
          playwrightImageTag: getOrDefault(this.vars.PLAYWRIGHT_BROWSERS_SERVER__playwrightImageTag),
          registry: getOrDefault(this.vars.PLAYWRIGHT_BROWSERS_SERVER__imageRegistry),
          account: getOrDefault(this.vars.PLAYWRIGHT_BROWSERS_SERVER__imageAccount),
          name: getOrDefault(this.vars.PLAYWRIGHT_BROWSERS_SERVER__imageName),
          buildTag: getOrDefault(this.vars.PLAYWRIGHT_BROWSERS_SERVER__imageBuildTag),
        },
      },
    };
  },
});
