/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
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

import { createAndGetMainContainer, extractOpenFileExtension, runScriptOnPage } from "../utils";
import * as ReactDOM from "react-dom";
import { EditorApp } from "./EditorApp";
import * as React from "react";
import { useCallback, useEffect } from "react";
import { KOGITO_IFRAME_CONTAINER_CLASS } from "../constants";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import { Logger } from "../../Logger";
import { ExternalEditorManager } from "../../ExternalEditorManager";
import { EditorAppEdit } from "./EditorAppEdit";

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

export function renderGitlabEdit(args: Globals & { fileInfo: FileInfoBitBucket }) {
  const openFileExtension = extractOpenFileExtension(window.location.href);
  if (!openFileExtension) {
    args.logger.log(`Unable to determine file extension from URL`);
    return;
  }

  if (!args.editorEnvelopeLocator.mapping.has(openFileExtension)) {
    args.logger.log(`No enhanced editor available for "${openFileExtension}" format.`);
    return;
  }

  ReactDOM.render(
    <EditorViewApp
      fileInfo={args.fileInfo}
      openFileExtension={openFileExtension}
      id={args.id}
      editorEnvelopeLocator={args.editorEnvelopeLocator}
    />,
    createAndGetMainContainer(args.id, document.body),
    () => args.logger.log("Mounted.")
  );
}

function checkIfPageIsReady() {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const interval = setInterval(() => {
      const diffsDiv = document.querySelector(".file-editor");
      if (tries > 20) {
        clearInterval(interval);
        reject("Couldn't load the GitLab Extension");
      }
      if (diffsDiv) {
        resolve();
        clearInterval(interval);
      }
      tries++;
    }, 500);
  });
}

const GITLAB_CONTENT_DIV_ID = "kogito-gitlab-content-div";

function EditorViewApp(props: {
  fileInfo: FileInfoBitBucket;
  openFileExtension: string;
  id: string;
  editorEnvelopeLocator: EditorEnvelopeLocator;
}) {
  useEffect(() => {
    runScriptOnPage(
      `var div = document.createElement('div');
    div.dataset.value = window.monaco.editor.getModels()[0].getValue();
    div.id = '${GITLAB_CONTENT_DIV_ID}';
    div.style.display = 'none';
    document.body.appendChild(div)`
    );
  });

  const getFileContents = () =>
    Promise.resolve().then(() => document.getElementById(GITLAB_CONTENT_DIV_ID)?.dataset.value);

  const getFileName = useCallback(() => {
    return decodeURIComponent(props.fileInfo.path.split("/").pop()!);
  }, [props.fileInfo.path]);

  return (
    <EditorAppEdit
      editorEnvelopeLocator={props.editorEnvelopeLocator}
      openFileExtension={props.openFileExtension}
      getFileName={getFileName}
      getFileContents={getFileContents}
      iframeContainer={iframeContainer(props.id)}
      fileInfo={props.fileInfo}
    />
  );
}

function iframeContainer(id: string): HTMLElement {
  const element = () => document.querySelector(`.${KOGITO_IFRAME_CONTAINER_CLASS}.${id}`)!;
  const fileContent = document.querySelector(".code") as HTMLDivElement;
  if (!element() && fileContent !== null) {
    fileContent.insertAdjacentHTML("afterend", `<div class="${KOGITO_IFRAME_CONTAINER_CLASS} ${id} view"></div>`);
  }

  return element() as HTMLElement;
}
