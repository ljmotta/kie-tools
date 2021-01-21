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

import * as React from "react";
import { useLayoutEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { IsolatedEditorContext } from "../components/common/IsolatedEditorContext";
import { KogitoEditorIframe } from "./KogitoEditorIframe";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import { GitLabFileInfo } from "../../index";

export function EditorAppEdit(props: {
  openFileExtension: string;
  getFileName: () => string;
  getFileContents: () => Promise<string | undefined>;
  iframeContainer: HTMLElement;
  fileInfo: GitLabFileInfo;
  editorEnvelopeLocator: EditorEnvelopeLocator;
}) {
  useLayoutEffect(() => {
    document.querySelector(".code")!.classList.add("hidden");
    props.iframeContainer.classList.remove("hidden");
  }, [props.iframeContainer]);

  return (
    <React.Fragment>
      <IsolatedEditorContext.Provider
        value={{
          onEditorReady: () => null,
          fullscreen: false,
          textMode: false,
          repoInfo: { gitref: props.fileInfo.branch, owner: props.fileInfo.user, repo: props.fileInfo.repo }
        }}
      >
        {
          <>
            {ReactDOM.createPortal(
              <KogitoEditorIframe
                contentPath={props.fileInfo.path}
                openFileExtension={props.openFileExtension}
                getFileContents={props.getFileContents}
                readonly={false}
                editorEnvelopeLocator={props.editorEnvelopeLocator}
              />,
              props.iframeContainer
            )}
          </>
        }
      </IsolatedEditorContext.Provider>
    </React.Fragment>
  );
}
