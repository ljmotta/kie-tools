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

import { generateForms } from "../generation/index";
import { checkKogitoProjectHasForms, checkKogitoProjectStructure } from "../generation/fs/checks";
import { input, confirm, rawlist } from "@inquirer/prompts";

export async function run() {
  const validateProjectPath = (path: string): string | boolean => {
    if (!path || path === "") {
      return "Please type a Kogito Project path";
    }
    try {
      checkKogitoProjectStructure(path);
    } catch (err) {
      return err.message;
    }

    return true;
  };

  const isOverwriteVisible = (path: string): boolean => {
    return checkKogitoProjectHasForms(path);
  };
  console.log(`
Kogito Form Generation CLI
===========================

This tool will help you generate forms for the Processes and User Tasks in your Kogito Projects.
The generated forms will be stored as resources in your project (in src/main/resources/forms folder).
`);

  const path = await input({ message: "Type your Kogito Project path", validate: validateProjectPath });
  const overwrite = isOverwriteVisible(path)
    ? await confirm({ message: "The project already contains forms, do you want to overwrite the existing ones?" })
    : undefined;
  const type = await rawlist({
    message: "Select the Form type",
    choices: [
      { name: "patternfly", value: "patternfly" },
      { name: "bootstrap", value: "bootstrap" },
    ],
  });

  console.log(`
Current selection
===========================

Project path: ${path}
Form type: ${type}
${overwrite !== undefined ? `Overwrite existing forms: ${overwrite}` : ""} 
`);

  const confirmOperation = await confirm({ message: "Do you want to continue?" });

  if (confirmOperation) {
    generateForms({ path, overwrite: overwrite ?? false, type });
  }
  console.log("\nGood bye!");
}
