/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
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
import { PropsWithChildren, useCallback, useRef } from "react";

interface ResizablePanelProps {
  isOpen: boolean;
  setHeight?: (newSize: number) => void;
}

export function ResizablePanel(props: PropsWithChildren<ResizablePanelProps>) {
  const resizableDivRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const iframe = document.getElementById("kogito-iframe");
      if (iframe && resizableDivRef.current) {
        iframe.style.pointerEvents = "none";
        resizableDivRef.current.style.userSelect = "none";
        resizableDivRef.current.style.pointerEvents = "none";
      }

      const resizablePanelDiv = resizableDivRef.current?.getBoundingClientRect();
      const newResizablePanelSize = resizablePanelDiv!.bottom - e.clientY;
      resizableDivRef.current?.style?.setProperty("height", `${newResizablePanelSize}px`);
      props.setHeight?.(newResizablePanelSize);
    },
    [props]
  );

  const onMouseUp = useCallback(
    (e: MouseEvent) => {
      const iframe = document.getElementById("kogito-iframe");
      if (iframe && resizableDivRef.current) {
        iframe.style.pointerEvents = "";
        resizableDivRef.current.style.userSelect = "";
        resizableDivRef.current.style.pointerEvents = "";
      }

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    },
    [onMouseMove]
  );

  const onMouseDown = useCallback(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [onMouseMove, onMouseUp]);

  return (
    <div className={props.isOpen ? "kogito--editor__resizable-panel-open" : "kogito--editor__resizable-panel-close"}>
      <div onMouseDown={onMouseDown} className={"kogito--editor__resizable-panel-div"} />
      <div ref={resizableDivRef} className={"kogito--editor__resizable-panel"}>
        {props.children}
      </div>
    </div>
  );
}
