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
import { useCallback } from "react";

export function PrToolbar(props: {
  onSeeAsDiagram: () => void;
  toggleOriginal: () => void;
  closeDiagram: () => void;
  textMode: boolean;
  showOriginalChangesToggle: boolean;
  originalDiagram: boolean;
  fileStatusOnPr: FileStatusOnPr;
}) {
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
    (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      props.toggleOriginal();
    },
    [props.toggleOriginal]
  );

  return (
    <div style={{ display: "flex" }}>
      {!props.textMode && props.fileStatusOnPr === FileStatusOnPr.CHANGED && props.showOriginalChangesToggle && (
        <div style={{ margin: "5px" }}>
          <button
            className={"btn gl-mr-3 btn-default btn-md gl-button"}
            style={{ borderRadius: "0.25rem 0px 0px 0.25rem", margin: "0px" }}
            tabIndex={0}
            type={"button"}
            onClick={toggleOriginal}
          >
            Original
          </button>
          <button
            className={"btn gl-mr-3 btn-default btn-md gl-button"}
            style={{ borderRadius: "0px 0.25rem 0.25rem 0px", margin: "0px" }}
            tabIndex={0}
            type={"button"}
            onClick={toggleOriginal}
          >
            Changes
          </button>
        </div>
      )}

      {!props.textMode && (
        <button
          className={"btn gl-mr-3 btn-default btn-md gl-button"}
          style={{ margin: "5px" }}
          tabIndex={0}
          type={"button"}
          onClick={closeDiagram}
        >
          Close Diagram
        </button>
      )}
      {props.textMode && (
        <button
          className={"btn gl-mr-3 btn-default btn-md gl-button"}
          style={{ margin: "5px" }}
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
