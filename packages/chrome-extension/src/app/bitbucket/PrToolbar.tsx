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
import { FileStatusOnPr } from "./FileStatusOnPr";
import { useCallback, useLayoutEffect, useState } from "react";

export function PrToolbar(props: {
  onSeeAsDiagram: () => void;
  toggleOriginal: (original: boolean) => void;
  closeDiagram: () => void;
  textMode: boolean;
  showOriginalChangesToggle: boolean;
  originalDiagram: boolean;
  fileStatusOnPr: FileStatusOnPr;
}) {
  const [buttonStyle, setButtonStyle] = useState("");

  const closeDiagram = useCallback(
    (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      props.closeDiagram();
    },
    [props.closeDiagram]
  );

  const seeAsDiagram = useCallback(
    (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      props.onSeeAsDiagram();
    },
    [props.onSeeAsDiagram]
  );

  const toggleOriginal = useCallback(
    (e: any, value) => {
      e.stopPropagation();
      e.preventDefault();
      props.toggleOriginal(value);
    },
    [props.toggleOriginal]
  );

  useLayoutEffect(() => {
    setButtonStyle(getParentButton(document.querySelector("span[aria-label='More']")!).classList.value);
  }, []);

  return (
    <div style={{ display: "flex" }}>
      {!props.textMode && props.fileStatusOnPr === FileStatusOnPr.CHANGED && props.showOriginalChangesToggle && (
        <div style={{ margin: "5px" }}>
          <button
            className={buttonStyle}
            style={{ borderRight: "solid 1px", borderRadius: "0px", paddingRight: "5px" }}
            tabIndex={0}
            type={"button"}
            onClick={e => toggleOriginal(e, true)}
          >
            Original
          </button>
          <button
            className={buttonStyle}
            style={{ paddingLeft: "5px" }}
            tabIndex={0}
            type={"button"}
            onClick={e => toggleOriginal(e, false)}
          >
            Changes
          </button>
        </div>
      )}

      {!props.textMode && (
        <button
          className={buttonStyle}
          style={{ margin: "5px", paddingLeft: "5px", paddingRight: "5px" }}
          tabIndex={0}
          type={"button"}
          onClick={closeDiagram}
        >
          Close Diagram
        </button>
      )}
      {props.textMode && (
        <button
          className={buttonStyle}
          style={{ margin: "5px", paddingLeft: "5px", paddingRight: "5px" }}
          tabIndex={0}
          type={"button"}
          onClick={seeAsDiagram}
        >
          See as Diagram
        </button>
      )}
    </div>
  );
}

function getParentButton(element: Element): Element {
  if (element.tagName !== "BUTTON") {
    return getParentButton(element.parentElement!);
  }
  return element;
}
