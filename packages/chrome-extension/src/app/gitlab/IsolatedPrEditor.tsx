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

import { PrInfo } from "./PrEditorView";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FileStatusOnPr } from "./FileStatusOnPr";
import { KOGITO_IFRAME_CONTAINER_PR_CLASS, KOGITO_TOOLBAR_CONTAINER_PR_CLASS } from "../constants";
import { IsolatedEditorContext } from "../components/common/IsolatedEditorContext";
import * as ReactDOM from "react-dom";
import { PrToolbar } from "./PrToolbar";
import { KogitoEditorIframe } from "./KogitoEditorIframe";
import { useInitialAsyncCallEffect } from "../components/common/customEffects";

export function IsolatedPrEditor(props: {
  id: string;
  prInfo: PrInfo;
  prFileContainer: HTMLElement;
  fileExtension: string;
  contentPath: string;
  bitbucketTextEditorToReplace: HTMLElement;
  prFilePath: string;
  envelopeLocator: EditorEnvelopeLocator;
}) {
  const [editorReady, setEditorReady] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [textMode, setTextMode] = useState(true);
  const [fileStatusOnPr, setFileStatusOnPr] = useState(FileStatusOnPr.UNKNOWN);

  useEffect(() => {
    const fileContent = props.prFileContainer.querySelector(".code");
    const fileWarning = props.prFileContainer.querySelector(".collapsed-file-warning");
    const iframe = props.prFileContainer.querySelector(`.${KOGITO_IFRAME_CONTAINER_PR_CLASS}.${props.id}`);

    if (iframe) {
      if (!textMode) {
        if (fileContent) {
          fileContent.classList.add("hidden");
        }
        if (fileWarning) {
          fileWarning.classList.add("hidden");
        }
        iframe.classList.remove("hidden");
      } else {
        if (fileContent) {
          fileContent.classList.remove("hidden");
        }
        if (fileWarning) {
          fileWarning.classList.remove("hidden");
        }
        iframe.classList.add("hidden");
      }
    }
  }, [props.prFileContainer, props.id, textMode]);

  useInitialAsyncCallEffect(() => {
    return discoverFileStatusOnPr(props.prInfo, props.prFilePath);
  }, setFileStatusOnPr);

  const getFileContents = useMemo(() => {
    return showOriginal || fileStatusOnPr === FileStatusOnPr.DELETED
      ? () => getTargetFileContents(props.prInfo, props.prFilePath.trim()) // master
      : () => getOriginFileContents(props.prInfo, props.prFilePath.trim()); // branch
  }, [showOriginal, fileStatusOnPr, props.prInfo, props.prFilePath]);

  const repoInfo = useMemo(() => {
    return {
      owner: props.prInfo.org,
      gitref: props.prInfo.gitRef,
      repo: props.prInfo.repo
    };
  }, [props.prInfo]);

  const onEditorReady = useCallback(() => {
    setEditorReady(true);
  }, []);

  const toggleOriginal = useCallback((original: boolean) => {
    setShowOriginal(original);
  }, []);

  const setDiagramMode = useCallback(() => {
    setTextMode(false);
  }, []);

  const closeDiagram = useCallback(() => {
    setTextMode(true);
    setEditorReady(false);
  }, []);

  return (
    <React.Fragment>
      <IsolatedEditorContext.Provider
        value={{
          onEditorReady,
          fullscreen: false,
          textMode: false,
          repoInfo
        }}
      >
        {ReactDOM.createPortal(
          <PrToolbar
            showOriginalChangesToggle={editorReady}
            fileStatusOnPr={fileStatusOnPr}
            textMode={textMode}
            originalDiagram={showOriginal}
            toggleOriginal={toggleOriginal}
            closeDiagram={closeDiagram}
            onSeeAsDiagram={setDiagramMode}
          />,
          toolbarContainer(
            props.id,
            props.prFileContainer,
            props.prFileContainer.querySelector(".diff-stats")! as HTMLElement
          )
        )}
        {!textMode &&
          ReactDOM.createPortal(
            <KogitoEditorIframe
              getFileContents={getFileContents}
              contentPath={props.contentPath}
              openFileExtension={props.fileExtension}
              readonly={true}
              editorEnvelopeLocator={props.envelopeLocator}
            />,
            iframeContainer(props.id, props.prFileContainer)
          )}
      </IsolatedEditorContext.Provider>
    </React.Fragment>
  );
}

async function discoverFileStatusOnPr(prInfo: PrInfo, prFilePath: string) {
  const targetContent = await getTargetFileStatus(prInfo, prFilePath);
  const originContent = await getOriginFileStatus(prInfo, prFilePath);

  if (targetContent && originContent) {
    return FileStatusOnPr.CHANGED;
  }
  if (targetContent) {
    return FileStatusOnPr.DELETED;
  }
  if (originContent) {
    return FileStatusOnPr.ADDED;
  }

  return FileStatusOnPr.UNKNOWN;
}

function iframeContainer(id: string, container: HTMLElement) {
  const element = () => container.querySelector(`.${KOGITO_IFRAME_CONTAINER_PR_CLASS}.${id}`);

  if (!element()!) {
    container.insertAdjacentHTML("beforeend", `<div class="${KOGITO_IFRAME_CONTAINER_PR_CLASS} ${id}"></div>`);
  }

  return element() as HTMLElement;
}

function toolbarContainer(id: string, prFileContainer: HTMLElement, container: HTMLElement) {
  const element = () => prFileContainer.querySelector(`.${KOGITO_TOOLBAR_CONTAINER_PR_CLASS}.${id}`);

  if (!element()) {
    container.insertAdjacentHTML("beforebegin", `<div class="${KOGITO_TOOLBAR_CONTAINER_PR_CLASS} ${id}"></div>`);
  }

  return element()!;
}

function getTargetFileStatus(prInfo: PrInfo, targetFilePath: string) {
  return fetch(
    `https://gitlab.com/${prInfo.targetOrg}/${prInfo.repo}/-/raw/${prInfo.targetGitRef}/${targetFilePath}`
  ).then(res => res.ok);
}

function getOriginFileStatus(prInfo: PrInfo, originFilePath: string) {
  return fetch(`https://gitlab.com/${prInfo.org}/${prInfo.repo}/-/raw/${prInfo.gitRef}/${originFilePath}`).then(
    res => res.ok
  );
}

function getProjectId(prInfo: PrInfo) {
  return fetch(`https://gitlab.com/api/v4/users/${prInfo.org}/projects`, { method: "GET" })
    .then(res => res.json())
    .then(projects => projects.find((project: any) => project.name === prInfo.repo).id);
}

function getTargetFileContents(prInfo: PrInfo, targetFilePath: string) {
  return getProjectId(prInfo)
    .then(projectId =>
      fetch(
        `https://gitlab.com/api/v4/projects/${projectId}/repository/files/${targetFilePath}/raw?ref=${prInfo.targetGitRef}`
      )
    )
    .then(res => res.text())
    .then(res => res);
  // return fetch(`https://gitlab.com/${prInfo.targetOrg}/${prInfo.repo}/-/raw/${prInfo.targetGitRef}/${targetFilePath}`)
  //   .then(res => res.text())
  //   .then(res => res);
}

function getOriginFileContents(prInfo: PrInfo, originFilePath: string) {
  return getProjectId(prInfo)
    .then(projectId =>
      fetch(
        `https://gitlab.com/api/v4/projects/${projectId}/repository/files/${originFilePath}/raw?ref=${prInfo.gitRef}`
      )
    )
    .then(res => res.text())
    .then(res => res);
  // return fetch(`https://gitlab.com/${prInfo.org}/${prInfo.repo}/-/raw/${prInfo.gitRef}/${originFilePath}`)
  //   .then(res => res.text())
  //   .then(res => res);
}
