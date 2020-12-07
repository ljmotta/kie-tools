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

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Logger } from "../../../Logger";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { FileStatusOnPr } from "./FileStatusOnPr";
import { useInitialAsyncCallEffect } from "../common/customEffects";
import {
  GITHUB_RENAMED_FILE_ARROW,
  KOGITO_IFRAME_CONTAINER_CLASS,
  KOGITO_IFRAME_CONTAINER_PR_CLASS,
  KOGITO_OPEN_WITH_ONLINE_EDITOR_LINK_CONTAINER_PR_CLASS,
  KOGITO_TOOLBAR_CONTAINER_PR_CLASS,
  KOGITO_VIEW_ORIGINAL_LINK_CONTAINER_PR_CLASS
} from "../../constants";
import { PrInfo } from "./PrEditorView";
import { IsolatedEditorContext } from "../common/IsolatedEditorContext";
import { KogitoEditorIframe } from "./KogitoEditorIframe";

export function PrEditorsApp(props: {
  id: string;
  prInfo: PrInfo;
  contentPath: string;
  logger: Logger;
  envelopeLocator: EditorEnvelopeLocator;
}) {
  const [prFileContainers, setPrFileContainers] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      console.log(mutations);
      const addedNodes = mutations.reduce((l, r) => [...l, ...Array.from(r.addedNodes)], []);
      if (addedNodes.length <= 0) {
        return;
      }
      console.log("addedNodes", addedNodes);

      const newContainers = supportedPrFileElements(props.id, props.logger, props.envelopeLocator);
      if (newContainers.length === prFileContainers.length) {
        props.logger.log("Found new unsupported containers");
        return;
      }

      console.log("newcontainer", newContainers);
      newContainers.forEach(container => {
        (container as any).querySelector("div[data-qa='bk-file__content']")!.style.display = "none";
      });

      props.logger.log("Found new containers...");
      setPrFileContainers(newContainers);
    });

    observer.observe((document.getElementsByTagName("main")[0] as HTMLElement | null)!, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [prFileContainers, props]);

  return (
    <>
      {prFileContainers.map(container => (
        <IsolatedPrEditor
          id={props.id}
          key={getUnprocessedFilePath(container)}
          prInfo={props.prInfo}
          contentPath={props.contentPath}
          prFileContainer={container}
          fileExtension={getFileExtension(container)}
          prFilePath={getUnprocessedFilePath(container)}
          prFileStatus={getUnprocessedFileStatus(container)}
          envelopeLocator={props.envelopeLocator}
          bitbucketTextEditorToReplace={container}
        />
      ))}
    </>
  );
}

function supportedPrFileElements(id: string, logger: Logger, envelopeLocator: EditorEnvelopeLocator) {
  return prFileElements(id)?.filter(container => envelopeLocator.mapping.has(getFileExtension(container)));
}

function prFileElements(id: string): HTMLElement[] {
  const elements = Array.from(document.querySelectorAll("article[data-qa='pr-diff-file-styles']")).map(
    e => e as HTMLElement
  );
  const htmlElements = elements.length > 0 ? (elements as HTMLElement[]) : [];

  htmlElements.forEach(htmlElement => {
    htmlElement.insertAdjacentHTML("afterend", `<div class="${KOGITO_IFRAME_CONTAINER_CLASS} ${id} view"></div>`);
  });

  return htmlElements;
}

function getFileExtension(prFileContainer: HTMLElement): string {
  return getUnprocessedFilePath(prFileContainer)
    .split(".")
    .pop()!;
}

export function getUnprocessedFilePath(prFileContainer: any) {
  return prFileContainer.querySelector("h3[data-qa='bk-filepath']")!.outerText;
}

export function getUnprocessedFileStatus(prFileContainer: any): string {
  return (Array.from(
    prFileContainer.querySelector("div[data-qa='bk-file__header']").querySelectorAll("span[role='img']")
  ) as HTMLElement[]).reduce(
    (acc: string, container: any): string => (isFileStatus(container.ariaLabel) ? container.ariaLabel : acc),
    ""
  );
}

function isFileStatus(status: string) {
  return status === "Added" || status === "Modified" || status === "Deleted";
}

function IsolatedPrEditor(props: {
  id: string;
  prInfo: PrInfo;
  prFileContainer: HTMLElement;
  fileExtension: string;
  contentPath: string;
  bitbucketTextEditorToReplace: HTMLElement;
  prFilePath: string;
  prFileStatus: string;
  envelopeLocator: EditorEnvelopeLocator;
}) {
  const [editorReady, setEditorReady] = useState(false);

  const getFileContents = useMemo(() => {
    const something =
      discoverFileStatusOnPr(props.prFileStatus) !== FileStatusOnPr.DELETED
        ? () => getOriginalFileContents(props.prInfo, props.prFilePath)
        : () => Promise.resolve("");
    console.log("file", something);
    return something;
  }, [props.prFileStatus, props.prInfo, props.prFilePath]);

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

  return (
    <React.Fragment>
      <IsolatedEditorContext.Provider
        value={{
          onEditorReady: () => null,
          fullscreen: false,
          textMode: false,
          repoInfo
        }}
      >
        {ReactDOM.createPortal(
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

function discoverFileStatusOnPr(prFileStatus: string) {
  if (prFileStatus === "Added") {
    console.log("added");
    return FileStatusOnPr.ADDED;
  }

  if (prFileStatus === "Modified") {
    console.log("modified");
    return FileStatusOnPr.CHANGED;
  }

  if (prFileStatus === "Deleted") {
    console.log("deleted");
    return FileStatusOnPr.DELETED;
  }

  console.log("impossibru");
  throw new Error("Impossible status for file on PR");
}

function iframeContainer(id: string, container: HTMLElement) {
  const element = () => container.querySelector(`.${KOGITO_IFRAME_CONTAINER_PR_CLASS}.${id}`);

  if (!element()!) {
    container.insertAdjacentHTML("beforeend", `<div class="${KOGITO_IFRAME_CONTAINER_PR_CLASS} ${id}"></div>`);
  }

  return element() as HTMLElement;
}

function getOriginalFileContents(prInfo: PrInfo, originalFilePath: string) {
  return fetch(
    `https://bitbucket.org/${prInfo.org}/${prInfo.repo}/raw/${prInfo.gitRef}/${originalFilePath}`
  )
    .then(res => res.text())
    .then(res => res);
}
