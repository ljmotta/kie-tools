#!/usr/bin/env node

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

import { execSync } from "child_process";
import yargs from "yargs/yargs";
import fs from "fs";
import set from "lodash/set";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { env } from "../env";
const buildEnv: any = env;

enum LOG_LEVEL {
  NORMAL,
  WARNING,
  ERROR,
}

function shell() {
  return process.platform === "win32" ? { shell: "powershell.exe" } : {};
}

function getPlaywrightContainerizationImage() {
  return `${buildEnv.playwrightContainerization.registry}/${buildEnv.playwrightContainerization.account}/${buildEnv.playwrightContainerization.name}:${buildEnv.playwrightContainerization.buildTag}`;
}

async function main() {
  function prettyPrint(type: LOG_LEVEL, message: string) {
    if (type === LOG_LEVEL.NORMAL) {
      console.log("[playwright-containerization] %s", message);
    }

    if (type === LOG_LEVEL.WARNING) {
      console.log("\x1b[33m[playwright-containerization] %s\x1b[0m", message);
    }

    if (type === LOG_LEVEL.ERROR) {
      console.error("\x1b[31m[playwright-containerization] %s\x1b[0m", message);
    }
  }

  try {
    const { packageAbsolutePath, port, portEnvObjectPath } = await yargs(process.argv.slice(2))
      .version(false)
      .help(false)
      .usage("Usage: $0 --packageAbsolutePath [value] --port [value] --portEnvObjectPath [value]")
      .demandOption(["packageAbsolutePath", "port", "portEnvObjectPath"])
      .describe("packageAbsolutePath", "The package absolute path")
      .describe("port", "The port where the application will be running")
      .describe("portEnvObjectPath", "The env object path that has the port where the application will be running")
      .example(
        "--packageAbsolutePath /path/to/project --port 8080 --portEnvObjectPath path.to.port",
        "The example above"
      )
      .epilog("CLI tool to start the Playwright dev container.")
      .parse();

    // Check if the `packageAbsolutePath` has a valid path
    if (
      typeof packageAbsolutePath !== "string" ||
      (typeof packageAbsolutePath === "string" && fs.existsSync(packageAbsolutePath) === false)
    ) {
      prettyPrint(LOG_LEVEL.ERROR, `--path value isn't a valid absolute path. --path=${packageAbsolutePath}`);
      return;
    }

    // Checks if image exists before starting
    try {
      execSync(`docker image inspect ${getPlaywrightContainerizationImage()}`, {
        stdio: "ignore",
        ...shell(),
      });
    } catch (error) {
      prettyPrint(
        LOG_LEVEL.WARNING,
        `it looks like you don't have the Playwright containerization image "${getPlaywrightContainerizationImage()}" in your local machine.`
      );
      prettyPrint(LOG_LEVEL.WARNING, "proceeding to build the image...");

      // Builds the image
      execSync(`pnpm -F playwright-containerization image:docker:build`, { stdio: "inherit", ...shell() });
    }

    // Starts the container in detached mode. The next step requires a running container.
    try {
      execSync(
        `docker container run -d --ipc=host --name=${buildEnv.playwrightContainerization.containerName} \
        --mount type=bind,source=${packageAbsolutePath}/playwright.config.ts,target=/kie-tools/playwright.config.ts \
        --mount type=bind,source=${packageAbsolutePath}/tests-e2e,target=/kie-tools/tests-e2e/ \
        --mount type=bind,source=${packageAbsolutePath}/dist-tests-e2e,target=/kie-tools/dist-tests-e2e \
        --network=host \
        ${getPlaywrightContainerizationImage()} \
        sleep infinity`,
        { stdio: "ignore", ...shell() }
      );
    } catch (error) {
      prettyPrint(LOG_LEVEL.NORMAL, `"docker container run" command finished with an error`);
      return;
    }

    // Creates a env file with the object that will be used by the `playwright.config.ts` file.
    try {
      execSync(
        `docker exec -i ${buildEnv.playwrightContainerization.containerName} sh -c 'cat > /kie-tools/env/index.js' <<EOF
module.exports = {
  env: ${JSON.stringify(set({}, portEnvObjectPath as string, port))}
}
EOF`,
        { stdio: "inherit", ...shell() }
      );
    } catch (error) {
      prettyPrint(LOG_LEVEL.ERROR, `failed to create env file inside container`);
      return;
    }

    try {
      // Attach a terminal to the running container
      execSync(`docker container exec -it ${buildEnv.playwrightContainerization.containerName} /bin/bash`, {
        stdio: "inherit",
        ...shell(),
      });
    } catch (error) {
      prettyPrint(LOG_LEVEL.NORMAL, `terminal was closed`);
      // Clean up. Remove the container
      execSync(`docker rm ${buildEnv.playwrightContainerization.containerName} -f`, {
        stdio: "ignore",
        ...shell(),
      });
      prettyPrint(LOG_LEVEL.NORMAL, `"${buildEnv.playwrightContainerization.containerName}" container was removed`);
      return;
    }
  } catch (error) {
    prettyPrint(LOG_LEVEL.ERROR, "error while parsing the arguments");
    prettyPrint(LOG_LEVEL.ERROR, error);
  }
}

main();
