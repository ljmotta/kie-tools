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
import { useCallback, useContext, useEffect, useState } from "react";

export interface ResizablePanelProperties {
  title: string;
  onClick: () => void;
  height: number;
  icon?: React.ReactNode;
  info?: React.ReactNode;
}

export enum ResizablePanelId {
  DMN_RUNNER_TABULAR = "dmn-runner-tabular",
  NOTIFICATIONS_PANEL = "notifications-panel",
}

export interface ResizablePanelContext {
  resizablePanels: Map<ResizablePanelId, ResizablePanelProperties>;
  setResizablePanels: React.Dispatch<React.SetStateAction<Map<ResizablePanelId, ResizablePanelProperties>>>;
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ResizablePanelContext = React.createContext<ResizablePanelContext>({} as any);

export function useResizable() {
  return useContext(ResizablePanelContext);
}

export function useConnectResizable(
  id: ResizablePanelId,
  title: string,
  onClick: () => void,
  height = 360,
  icon?: React.ReactNode,
  info?: React.ReactNode
): { resizable: ResizablePanelContext; setHeight: (newHeight: number) => void } {
  const resizable = useResizable();
  const [isOpen, setOpen] = useState<boolean>();

  useEffect(() => {
    resizable.setResizablePanels((previousResizablePanels) => {
      const previousProperties = previousResizablePanels.get(id);
      if (previousProperties) {
        return new Map(previousResizablePanels).set(id, { ...previousProperties, onClick, title, icon, info });
      }
      return new Map(previousResizablePanels).set(id, { title, onClick, height, icon, info });
    });

    return () => {
      resizable.setResizablePanels((previousResizablePanels) => {
        const newResizablePanels = new Map(previousResizablePanels);
        newResizablePanels.delete(id);
        return newResizablePanels;
      });
    };
  }, [title, onClick, icon, info]);

  const setHeight = useCallback((newHeight) => {
    resizable.setResizablePanels((previousResizablePanels) => {
      const previousProperties = previousResizablePanels.get(id)!;
      return new Map(previousResizablePanels).set(id, { ...previousProperties, height: newHeight });
    });
  }, []);

  return { resizable, setHeight };
}
