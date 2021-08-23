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
import { useCallback, useEffect, useMemo, useState } from "react";
import { FileStatusOnPr } from "./FileStatusOnPr";
import { KOGITO_IFRAME_CONTAINER_PR_CLASS, KOGITO_TOOLBAR_CONTAINER_PR_CLASS } from "../constants";
import * as React from "react";
import { IsolatedEditorContext } from "../components/common/IsolatedEditorContext";
import * as ReactDOM from "react-dom";
import { PrToolbar } from "./PrToolbar";
import { KogitoEditorIframe } from "./KogitoEditorIframe";

export function IsolatedPrEditor(props: {
  id: string;
  prInfo: PrInfo;
  prFileContainer: HTMLElement;
  fileExtension: string;
  contentPath: string;
  bitbucketTextEditorToReplace: HTMLElement;
  prFilePath: string;
  prFileStatus: FileStatusOnPr;
  envelopeLocator: EditorEnvelopeLocator;
}) {
  const [editorReady, setEditorReady] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [textMode, setTextMode] = useState(true);

  useEffect(() => {
    const fileContent = props.prFileContainer.querySelector("div[data-qa='bk-file__content']");
    const iframe = props.prFileContainer.querySelector(`.${KOGITO_IFRAME_CONTAINER_PR_CLASS}.${props.id}`);
    if (fileContent && iframe) {
      if (!textMode) {
        fileContent.classList.add("hidden");
        iframe.classList.remove("hidden");
      } else {
        fileContent.classList.remove("hidden");
        iframe.classList.add("hidden");
      }
    }
  }, [props.prFileContainer, props.id, textMode]);

  const getFileContents = useMemo(() => {
    return showOriginal || props.prFileStatus === FileStatusOnPr.DELETED
      ? () => getTargetFileContents(props.prInfo, props.prFilePath) // master
      : () => getOriginFileContents(props.prInfo, props.prFilePath); // branch
  }, [showOriginal, props.prFileStatus, props.prInfo, props.prFilePath]);

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

  const toggleOriginal = useCallback(
    (original: boolean) => {
      setShowOriginal(original);
    },
    [showOriginal]
  );

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
            fileStatusOnPr={props.prFileStatus}
            textMode={textMode}
            originalDiagram={showOriginal}
            toggleOriginal={toggleOriginal}
            closeDiagram={closeDiagram}
            onSeeAsDiagram={setDiagramMode}
          />,
          toolbarContainer(
            props.id,
            props.prFileContainer,
            props.prFileContainer.querySelector("div[data-qa='bk-file__actions']")! as HTMLElement
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

function getBranchHash(org: string, repo: string, ref: string) {
  return fetch(`https://bitbucket.org/api/2.0/repositories/${org}/${repo}/commits/${ref.trim()}`, {
    method: "GET",
    headers: {
      "Cache-Control": "no-cache"
    }
  })
    .then(res => res.json())
    .then(res => res.values.shift().hash);
}

function getTargetFileContents(prInfo: PrInfo, targetFilePath: string) {
  console.log("prInfo", prInfo);
  return getBranchHash(prInfo.targetOrg, prInfo.repo, prInfo.targetGitRef).then(refHash =>
    fetch(
      `https://bitbucket.org/api/2.0/repositories/${prInfo.targetOrg}/${prInfo.repo}/src/${refHash}/${targetFilePath}`,
      {
        method: "GET"
      }
    )
      .then(res => res.text())
      .then(res => res)
  );

  // fetch(`https://bitbucket.org/${prInfo.targetOrg}/${prInfo.repo}/raw/${prInfo.targetGitRef}/${targetFilePath}`)
  //   .then(res => res.text())
  //   .then(res => res);
}

function getOriginFileContents(prInfo: PrInfo, originFilePath: string) {
  console.log("prInfo", prInfo);
  return getBranchHash(prInfo.org, prInfo.repo, prInfo.gitRef).then(refHash =>
    fetch(`https://bitbucket.org/api/2.0/repositories/${prInfo.org}/${prInfo.repo}/src/${refHash}/${originFilePath}`, {
      method: "GET"
    })
      .then(res => res.text())
      .then(res => res)
  );

  // return fetch(`https://bitbucket.org/${prInfo.org}/${prInfo.repo}/raw/${prInfo.gitRef}/${originFilePath}`)
  //   .then(res => res.text())
  //   .then(res => res);
}
