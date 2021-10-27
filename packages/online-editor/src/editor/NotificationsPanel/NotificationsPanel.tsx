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
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@patternfly/react-core/dist/js/components/Badge";
import { Tab, Tabs, TabTitleText } from "@patternfly/react-core/dist/js/components/Tabs";
import { Tooltip } from "@patternfly/react-core/dist/js/components/Tooltip";
import { AngleUpIcon } from "@patternfly/react-icons/dist/js/icons/angle-up-icon";
import { AngleDownIcon } from "@patternfly/react-icons/dist/js/icons/angle-down-icon";
import { useNotificationsPanel } from "./NotificationsPanelContext";
import { NotificationPanelTabContent } from "./NotificationsPanelTabContent";
import { NotificationsApi } from "@kie-tooling-core/notifications/dist/api";
import { useOnlineI18n } from "../../common/i18n";

interface Props {
  tabNames: string[];
  tabsNotifications: Map<string, number>;
  setTabsNotifications: React.Dispatch<React.SetStateAction<Map<string, number>>>;
}

export function NotificationsPanel(props: Props) {
  const notificationsPanel = useNotificationsPanel();
  const { i18n } = useOnlineI18n();

  const tabsMap: Map<string, React.RefObject<NotificationsApi>> = useMemo(
    () => new Map(props.tabNames.map((tabName) => [tabName, React.createRef<NotificationsApi>()])),
    [props.tabNames]
  );

  useEffect(() => {
    notificationsPanel.setTabsMap([...tabsMap.entries()]);
  }, [tabsMap]);

  const onNotificationsLengthChange = useCallback((name: string, newQtt: number) => {
    props.setTabsNotifications((previousTabsNotifications) => {
      const newTabsNotifications = new Map(previousTabsNotifications);
      if (previousTabsNotifications.get(name) !== newQtt) {
        const updatedResult = document.getElementById(`total-notifications`);
        updatedResult?.classList.add("kogito--editor__notifications-panel-error-count-updated");
      }
      newTabsNotifications.set(name, newQtt);
      return newTabsNotifications;
    });
  }, []);

  const onSelectTab = useCallback((event, tabName) => {
    notificationsPanel.setActiveTab(tabName);
  }, []);

  useEffect(() => {
    notificationsPanel.setActiveTab(props.tabNames[0]);
  }, []);

  const [expandAll, setExpandAll] = useState<boolean>();
  const onExpandAll = useCallback(() => {
    setExpandAll(true);
  }, []);

  const onRetractAll = useCallback(() => {
    setExpandAll(false);
  }, []);

  return (
    <>
      <div className={"kogito--editor__notifications-panel-icon-position"}>
        <div onClick={() => onRetractAll()}>
          <Tooltip content={i18n.notificationsPanel.tooltip.retractAll}>
            <AngleUpIcon />
          </Tooltip>
        </div>
        <div onClick={() => onExpandAll()}>
          <Tooltip content={i18n.notificationsPanel.tooltip.expandAll}>
            <AngleDownIcon />
          </Tooltip>
        </div>
      </div>
      <Tabs activeKey={notificationsPanel.activeTab} onSelect={onSelectTab}>
        {[...tabsMap.entries()].map(([tabName, tabRef], index) => (
          <Tab
            key={`tab-${index}`}
            eventKey={tabName}
            title={
              <TabTitleText>
                {tabName} <Badge isRead={true}>{props.tabsNotifications.get(tabName)}</Badge>
              </TabTitleText>
            }
          >
            <div>
              <NotificationPanelTabContent
                name={tabName}
                ref={tabRef}
                onNotificationsLengthChange={onNotificationsLengthChange}
                expandAll={expandAll}
                setExpandAll={setExpandAll}
              />
            </div>
          </Tab>
        ))}
      </Tabs>
    </>
  );
}
