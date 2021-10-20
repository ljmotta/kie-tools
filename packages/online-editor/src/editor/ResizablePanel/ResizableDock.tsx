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
import { Tab, Tabs, TabTitleText } from "@patternfly/react-core/dist/js/components/Tabs";
import { KeyboardIcon } from "@patternfly/react-icons/dist/js/icons/keyboard-icon";
import { ResizablePanelId, useResizable } from "./ResizablePanelContext";

interface ResizableDockProps {
  isEditorReady: boolean;
}

export function ResizableDock(props: ResizableDockProps) {
  const resizable = useResizable();
  const [currentTab, setCurrentTab] = useState<ResizablePanelId>(ResizablePanelId.NOTIFICATIONS_PANEL);

  const envelopeKeyboardIcon = useMemo(() => {
    const envelope = document.getElementById("kogito-iframe");
    if (envelope) {
      return (envelope as HTMLIFrameElement).contentDocument?.querySelector(
        ".kogito-tooling--keyboard-shortcuts-icon"
      ) as HTMLButtonElement;
    }
  }, [props.isEditorReady]);

  const onKeyboardIconClick = useCallback(() => {
    envelopeKeyboardIcon?.click();
  }, [envelopeKeyboardIcon]);

  const onTabSelect = useCallback((event, tabIndex) => {
    setCurrentTab(tabIndex);
  }, []);

  const resizablePanelEntries = useMemo(
    () => Array.from(resizable.resizablePanels.entries()).reverse(),
    [resizable.resizablePanels]
  );

  return (
    <>
      <div onClick={onKeyboardIconClick} className={"kogito-tooling--keyboard-shortcuts-icon"}>
        <KeyboardIcon />
      </div>
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
        <Tabs activeKey={currentTab} onSelect={onTabSelect}>
          {/* Fix overflow bug */}
          {resizablePanelEntries.length === 0 ? (
            <Tab eventKey={0} title={""} />
          ) : (
            resizablePanelEntries.map(([id, properties]) => (
              <Tab
                key={id}
                eventKey={id}
                title={
                  <TabTitleText>
                    <>
                      {properties.icon}
                      {properties.title}
                      {properties.info}
                    </>
                  </TabTitleText>
                }
              />
            ))
          )}
        </Tabs>
      </div>
    </>
  );
}
