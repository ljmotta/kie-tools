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

import { useEffect, useState } from "react";
import { Logger } from "../../Logger";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import * as React from "react";
import { PrInfo } from "./PrEditorView";
import { IsolatedPrEditor } from "./IsolatedPrEditor";

export function PrEditorsApp(props: {
  id: string;
  contentPath: string;
  logger: Logger;
  envelopeLocator: EditorEnvelopeLocator;
}) {
  const [prFileContainers, setPrFileContainers] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      const addedNodes = mutations.reduce((l, r) => [...l, ...Array.from(r.addedNodes)], []);
      if (addedNodes.length <= 0) {
        return;
      }

      const newContainers = supportedPrFileElements(props.id, props.logger, props.envelopeLocator);
      if (newContainers.length === prFileContainers.length) {
        props.logger.log("Found new unsupported containers");
        return;
      }

      props.logger.log("Found new containers...");
      setPrFileContainers(newContainers);
    });

    observer.observe((document.querySelector("section[aria-label='Diffs']") as HTMLElement | null)!, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [prFileContainers, props]);

  useEffect(() => {
    setPrFileContainers(supportedPrFileElements(props.id, props.logger, props.envelopeLocator));
  }, []);

  return (
    <>
      {prFileContainers.map(container => (
        <IsolatedPrEditor
          id={props.id}
          key={getUnprocessedFilePath(container)}
          prInfo={parsePrInfo()}
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

function parsePrInfo(): PrInfo {
  const repository = window.location.pathname.split("/")[2];

  const prInfos = Array.from(
    document.querySelector("div[data-qa='pr-branches-and-state-styles']")!.getElementsByTagName("span")
  )!.map((element: any) => element.outerText.trim(""));

  const [, , origin, , , , target] = prInfos;

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

function supportedPrFileElements(id: string, logger: Logger, envelopeLocator: EditorEnvelopeLocator) {
  return prFileElements(id)?.filter(container => envelopeLocator.mapping.has(getFileExtension(container)));
}

function prFileElements(id: string): HTMLElement[] {
  const elements = Array.from(document.querySelectorAll("article[data-qa='pr-diff-file-styles']")).map(
    e => e as HTMLElement
  );
  return elements.length > 0 ? (elements as HTMLElement[]) : [];
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
