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

import { createAndGetMainContainer, extractOpenFileExtension, removeAllChildren } from "../../utils";
import * as ReactDOM from "react-dom";
import { EditorApp } from "./EditorApp";
import * as React from "react";
import { useCallback } from "react";
import { KOGITO_IFRAME_CONTAINER_CLASS } from "../../constants";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import { Logger } from "../../../Logger";
import { ExternalEditorManager } from "../../../ExternalEditorManager";
import { Dependencies } from "../../Dependencies";
import { PrInfo } from "../pr/IsolatedPrEditor";
import { PrEditorsApp } from "../pr/PrEditorsApp";

export interface FileInfoBitBucket {
  user: string;
  repo: string;
  branch: string;
  path: string;
}

export interface Globals {
  id: string;
  editorEnvelopeLocator: EditorEnvelopeLocator;
  githubAuthTokenCookieName: string;
  logger: Logger;
  extensionIconUrl: string;
  externalEditorManager?: ExternalEditorManager;
}

export function renderBitbucketPr(args: Globals & { contentPath: string }) {
  ReactDOM.render(
    <PrEditorsApp prInfo={parsePrInfo()} contentPath={args.contentPath} />,
    createAndGetMainContainer(args.id, document.body),
    () => args.logger.log("Mounted.")
  );
}

export function parsePrInfo(): PrInfo {
  // TODO REMOVE DEPENDENCIES AND USE THE QUERY SELECTOR
  const prInfos = dependencies.all.array.pr__prInfoContainer()!.map(e => e.textContent!);

  const targetOrganization = window.location.pathname.split("/")[1];
  const repository = window.location.pathname.split("/")[2];

  // PR is within the same organization
  if (prInfos.length < 6) {
    return {
      repo: repository,
      targetOrg: targetOrganization,
      targetGitRef: prInfos[1],
      org: targetOrganization,
      gitRef: prInfos[3]
    };
  }

  // PR is from a fork to an upstream
  return {
    repo: repository,
    targetOrg: targetOrganization,
    targetGitRef: prInfos[2],
    org: prInfos[4],
    gitRef: prInfos[5]
  };
}
