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
import { useCallback, useContext, useEffect } from "react";

export interface ResizablePanelContext {
  resizablePanels: Map<ResizablePanelId, number>;
  setResizablePanels: React.Dispatch<React.SetStateAction<Map<ResizablePanelId, number>>>;
}

export const ResizablePanelContext = React.createContext<ResizablePanelContext>({} as any);

export function useResizable() {
  return useContext(ResizablePanelContext);
}

export enum ResizablePanelId {
  DMN_RUNNER_TABULAR = "dmn-runner-tabular",
  NOTIFICATIONS_PANEL = "notifications-panel",
}

export function useResizableConnect(
  id: ResizablePanelId,
  initialWidth = 360
): [(newHeight: number) => void, ResizablePanelContext] {
  const resizable = useResizable();

  useEffect(() => {
    resizable.setResizablePanels((previousResizablePanels) => new Map(previousResizablePanels).set(id, initialWidth));

    return () => {
      resizable.setResizablePanels((previousResizablePanels) => {
        const newResizablePanels = new Map(previousResizablePanels);
        newResizablePanels.delete(id);
        return newResizablePanels;
      });
    };
  }, []);

  const setHeight = useCallback((newHeight) => {
    resizable.setResizablePanels((previousResizablePanels) => new Map(previousResizablePanels).set(id, newHeight));
  }, []);

  return [setHeight, resizable];
}
