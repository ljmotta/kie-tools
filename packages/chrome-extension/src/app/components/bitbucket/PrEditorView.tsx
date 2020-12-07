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

export interface FileInfoBitBucket {
  user: string;
  repo: string;
  branch: string;
  path: string;
}

export interface Globals {
  id: string;
  editorEnvelopeLocator: EditorEnvelopeLocator;
  logger: Logger;
  extensionIconUrl: string;
  externalEditorManager?: ExternalEditorManager;
}

export function renderBitbucketPr(args: Globals & { contentPath: string }) {
  console.log("PRINFO", parsePrInfo());
  ReactDOM.render(
    <PrEditorsApp
      id={args.id}
      prInfo={parsePrInfo()}
      contentPath={args.contentPath}
      logger={args.logger}
      envelopeLocator={args.editorEnvelopeLocator}
    />,
    createAndGetMainContainer(args.id, document.body),
    () => args.logger.log("Mounted.")
  );
}

export interface PrInfo {
  repo: string;
  targetOrg: string;
  targetGitRef: string;
  org: string;
  gitRef: string;
}

export function parsePrInfo(): PrInfo {
  const repository = window.location.pathname.split("/")[2];

  const prInfos = Array.from(
    document.querySelector("div[data-qa='pr-branches-and-state-styles']")!.getElementsByTagName("span")
  )!.map((element: any) => element.outerText.trim(""));

  const [origin, , target] = prInfos;

  // Cross Repo
  if (origin.indexOf(":") > 0) {
    const [originInfos, originGitRef] = origin.split(":");
    const [originOrg] = originInfos.split("/");

    const [targetInfos, targetGitRef] = target.split(":");
    const [targetOrg] = targetInfos.split("/");
    return {
      repo: repository,
      targetOrg: targetOrg,
      targetGitRef: targetGitRef,
      org: originOrg,
      gitRef: originGitRef
    };
  }

  const targetOrganization = window.location.pathname.split("/")[1];
  return {
    repo: repository,
    targetOrg: targetOrganization,
    targetGitRef: target,
    org: targetOrganization,
    gitRef: origin
  };
}
