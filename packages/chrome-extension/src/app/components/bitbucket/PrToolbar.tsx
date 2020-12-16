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
import {useCallback, useEffect} from "react";

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
      e.preventDefault();
      props.closeDiagram();
    },
    [props.closeDiagram]
  );

  const seeAsDiagram = useCallback(
    (e: any) => {
      e.preventDefault();
      props.onSeeAsDiagram();
    },
    [props.onSeeAsDiagram]
  );

  const toggleOriginal = useCallback(
    (e: any) => {
      e.preventDefault();
      props.toggleOriginal();
    },
    [props.toggleOriginal]
  );

  useEffect(() => {
    console.log("showOriginalChangesToggle", props.showOriginalChangesToggle)
    console.log("fileStatusOnPr", props.fileStatusOnPr)
    console.log("textMode", props.textMode)
  }, [props])

  return (
    <>
      {!props.textMode && (
        <button disabled={props.textMode} onClick={closeDiagram}>
          Close Diagram
        </button>
      )}

      {props.textMode && (
        <button className={"btn btn-sm kogito-button"} onClick={seeAsDiagram}>
          See as Diagram
        </button>
      )}

      {!props.textMode && props.fileStatusOnPr === FileStatusOnPr.CHANGED && props.showOriginalChangesToggle && (
        <div>
          <button
            disabled={props.originalDiagram}
            className={props.originalDiagram ? "disabled" : ""}
            type={"button"}
            onClick={toggleOriginal}
          >
            Original
          </button>
          <button
            disabled={!props.originalDiagram}
            className={!props.originalDiagram ? "disabled" : ""}
            type={"button"}
            onClick={toggleOriginal}
          >
            Changes
          </button>
        </div>
      )}
    </>
  );
}
