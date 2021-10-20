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
import { PropsWithChildren, useState } from "react";
import { ResizablePanelContext, ResizablePanelId } from "./ResizablePanelContext";

export function ResizablePanelContextProvider(props: PropsWithChildren<any>) {
  // a struct to save an id and the panel height
  const [resizablePanels, setResizablePanels] = useState<Map<ResizablePanelId, number>>(new Map());

  return (
    <ResizablePanelContext.Provider value={{ resizablePanels, setResizablePanels }}>
      {props.children}
    </ResizablePanelContext.Provider>
  );
}
