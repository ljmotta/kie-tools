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

    observer.observe((document.querySelector(".diffs") as HTMLElement | null)!, {
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
          envelopeLocator={props.envelopeLocator}
          bitbucketTextEditorToReplace={container}
        />
      ))}
    </>
  );
}

function parsePrInfo(): PrInfo {
  const repository = window.location.pathname.split("/")[2];
  const targetOrg = window.location.pathname.split("/")[1];

  const originOrg = (document.querySelector(".author-link")! as any).pathname.split("/").pop();
  const originGitRef = (document.querySelector('[data-testid="ref-name"]') as any)!.outerText;
  const targetGitRef = (document
    .querySelector(".mr-version-menus-container")!
    .querySelector(".gl-new-dropdown-button-text")! as any).outerText;

  return {
    repo: repository,
    targetOrg: targetOrg,
    targetGitRef: targetGitRef,
    org: originOrg,
    gitRef: originGitRef
  };
}

function supportedPrFileElements(id: string, logger: Logger, envelopeLocator: EditorEnvelopeLocator) {
  return prFileElements(id)?.filter(container => envelopeLocator.mapping.has(getFileExtension(container)));
}

function prFileElements(id: string): HTMLElement[] {
  const elements = Array.from(document.querySelectorAll(".file-holder")).map(e => e as HTMLElement);
  return elements.length > 0 ? (elements as HTMLElement[]) : [];
}

function getFileExtension(prFileContainer: HTMLElement): string {
  return getUnprocessedFilePath(prFileContainer)
    .trim()
    .split(".")
    .pop()!;
}

export function getUnprocessedFilePath(prFileContainer: any) {
  return prFileContainer.querySelector(".file-title-name")!.outerText;
}
