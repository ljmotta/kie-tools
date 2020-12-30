/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
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

import { createAndGetMainContainer } from "../../utils";
import * as ReactDOM from "react-dom";
import * as React from "react";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import { Logger } from "../../../Logger";
import { ExternalEditorManager } from "../../../ExternalEditorManager";
import { PrEditorsApp } from "./PrEditorsApp";

export interface Globals {
  id: string;
  editorEnvelopeLocator: EditorEnvelopeLocator;
  logger: Logger;
  extensionIconUrl: string;
  externalEditorManager?: ExternalEditorManager;
}

export function renderBitbucketPr(args: Globals & { contentPath: string }) {
  checkIfPageIsReady()
    .then(() => {
      ReactDOM.render(
        <PrEditorsApp
          id={args.id}
          contentPath={args.contentPath}
          logger={args.logger}
          envelopeLocator={args.editorEnvelopeLocator}
        />,
        createAndGetMainContainer(args.id, document.body),
        () => args.logger.log("Mounted.")
      );
    })
    .catch(args.logger.log);
}

function checkIfPageIsReady() {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const interval = setInterval(() => {
      const mainElement = document.getElementsByTagName("main")[0];
      if (tries > 20) {
        clearInterval(interval);
        reject("Couldn't load the BitBucket Extension");
      }
      if (mainElement) {
        resolve();
        clearInterval(interval);
      }
      tries++;
    }, 500);
  });
}

export interface PrInfo {
  repo: string;
  targetOrg: string;
  targetGitRef: string;
  org: string;
  gitRef: string;
}
