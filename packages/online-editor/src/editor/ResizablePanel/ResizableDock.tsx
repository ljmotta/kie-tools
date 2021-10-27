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
import { useCallback, useMemo, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core/dist/js/components/ToggleGroup";
import { KeyboardIcon } from "@patternfly/react-icons/dist/js/icons/keyboard-icon";

export interface ResizablePanelProperties {
  title: string;
  onClick: () => void;
  icon?: React.ReactNode;
  info?: React.ReactNode;
  position: number;
}

interface Props {
  properties: Map<string, ResizablePanelProperties>;
}

export function ResizableDock(props: Props) {
  const [currentTab, setCurrentTab] = useState<string>();

  const envelopeKeyboardIcon = useMemo(() => {
    const envelope = document.getElementById("kogito-iframe");
    if (envelope) {
      return (envelope as HTMLIFrameElement).contentDocument?.querySelector(
        ".kogito-tooling--keyboard-shortcuts-icon"
      ) as HTMLButtonElement;
    }
  }, []);

  const onKeyboardIconClick = useCallback(() => {
    envelopeKeyboardIcon?.click();
  }, [envelopeKeyboardIcon]);

  const onChange = useCallback((id: string, callback?: () => void) => {
    setCurrentTab((previous: any) => {
      if (previous === id) {
        return undefined;
      }
      return id;
    });
    callback?.();
  }, []);

  const renderToggleItem = useCallback(
    (id: string, properties: ResizablePanelProperties) => {
      return (
        <ToggleGroupItem
          style={{
            borderLeft: "solid 1px",
            borderRadius: 0,
            borderColor: "rgb(211, 211, 211)",
            padding: "1px",
          }}
          key={id}
          buttonId={id}
          isSelected={currentTab === id}
          onChange={() => onChange(id, properties.onClick)}
          text={
            <div style={{ display: "flex" }}>
              {properties.icon && <div style={{ paddingRight: "5px", width: "30px" }}>{properties.icon}</div>}
              {properties.title}
              {properties.info && <div style={{ paddingLeft: "5px", width: "30px" }}>{properties.info}</div>}
            </div>
          }
        />
      );
    },
    [currentTab]
  );

  return (
    <>
      <div onClick={onKeyboardIconClick} className={"kogito-tooling--keyboard-shortcuts-icon"}>
        <KeyboardIcon />
      </div>
      <div
        style={{
          borderTop: "rgb(221, 221, 221) solid 1px",
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <ToggleGroup>
          {Array.from(props.properties.entries()).map(([keys, values]) => renderToggleItem(keys, values))}
        </ToggleGroup>
      </div>
    </>
  );
}
