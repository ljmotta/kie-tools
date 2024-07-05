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

import * as buildEnv from "./env/index.mjs";
import path from "path";
import fs from "fs";
import prettier from "prettier";
import { createRequire } from "module";

async function updateChromeExtensionManifest(version, manifestFilePath) {
  const formattedManifest = await prettier.format(
    JSON.stringify({ ...createRequire(import.meta.url)(manifestFilePath), version }),
    {
      ...(await prettier.resolveConfig(".")),
      parser: "json",
    }
  );
  fs.writeFileSync(manifestFilePath, formattedManifest);
}

async function main() {
  console.info("[chrome-extension-serverless-workflow-editor-install] Updating manifest files...");
  const version = buildEnv.env.swfChromeExtension.version;
  await updateChromeExtensionManifest(version, path.resolve("manifest.dev.json"));
  await updateChromeExtensionManifest(version, path.resolve("manifest.prod.json"));
  console.info("[chrome-extension-serverless-workflow-editor-install] Done.");
}

main();
