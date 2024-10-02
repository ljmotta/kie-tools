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
    const { path: projectAbsolutePath } = await yargs(process.argv.slice(2))
      .version(false)
      .help(false)
      .usage("Usage: $0 --path [absolute path]")
      .alias("p", "path")
      .demandOption(["p", "path"])
      .describe("p", "Project absolute path")
      .epilog("CLI tool to start the Playwright dev container.")
      .parse();

    if (
      typeof projectAbsolutePath !== "string" ||
      (typeof projectAbsolutePath === "string" && fs.existsSync(projectAbsolutePath) === false)
    ) {
      prettyPrint(LOG_LEVEL.ERROR, `--path value isn't a valid absolute path. --path=${projectAbsolutePath}`);
      return;
    }

    try {
      execSync(`docker image inspect ${getPlaywrightContainerizationImage()}`, {
        stdio: "ignore",
        ...shell(),
      });
    } catch (error) {
      prettyPrint(
        LOG_LEVEL.WARNING,
        `It looks like you don't have the Playwright containerization image "${getPlaywrightContainerizationImage()}" in your local machine.`
      );
      prettyPrint(LOG_LEVEL.WARNING, "Proceeding to build the image...");
      execSync(`pnpm -F playwright-containerization image:docker:build`, { stdio: "inherit", ...shell() });
    }

    try {
      execSync(
        `docker container run -it --rm --ipc=host \
        --mount type=bind,source=${projectAbsolutePath}/tests-e2e,target=/kie-tools/tests-e2e/ \
        --mount type=bind,source=${projectAbsolutePath}/dist-tests-e2e,target=/kie-tools/dist-tests-e2e \
        --network=host \
        ${getPlaywrightContainerizationImage()} \
        /bin/bash`,
        { stdio: "inherit", ...shell() }
      );
    } catch (error) {
      prettyPrint(LOG_LEVEL.NORMAL, `"docker container run" command finished`);
    }
  } catch (error) {
    prettyPrint(LOG_LEVEL.ERROR, "Error while parsing the arguments");
    prettyPrint(LOG_LEVEL.ERROR, error);
  }
}

main();
