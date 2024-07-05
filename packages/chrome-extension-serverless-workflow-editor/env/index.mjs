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
import { createRequire } from "module";
import packageJson from "../package.json";
// const packageJson = createRequire(import.meta.url)("../package.json");

export const { env, vars, self } = composeEnv([rootEnv], {
  vars: varsWithName({
    SWF_CHROME_EXTENSION__routerTargetOrigin: {
      default: "https://localhost:9000",
      description: "Route of resources such as Editors and other static assets.",
    },
    SWF_CHROME_EXTENSION__routerRelativePath: {
      default: "",
      description: "Relative path to applied to CHROME_EXTENSION__routerTargetOrigin when finding resources.",
    },
    SWF_CHROME_EXTENSION__manifestFile: {
      default: "manifest.dev.json",
      description: "Chrome Extension manifest file path relative to this package's root dir.",
    },
    SWF_CHROME_EXTENSION__e2eTestingToken: {
      default: "",
      description: "GitHub token used to 'log-in' during E2E tests. 'Log-in' will be skipeed if it is empty.",
    },
  }),
  get env() {
    return {
      swfChromeExtension: {
        dev: {
          port: 9000,
        },
        version: packageJson.version,
        routerTargetOrigin: getOrDefault(this.vars.SWF_CHROME_EXTENSION__routerTargetOrigin),
        routerRelativePath: getOrDefault(this.vars.SWF_CHROME_EXTENSION__routerRelativePath),
        manifestFile: getOrDefault(this.vars.SWF_CHROME_EXTENSION__manifestFile),
        e2eTestingToken: getOrDefault(this.vars.SWF_CHROME_EXTENSION__e2eTestingToken),
      },
    };
  },
});
