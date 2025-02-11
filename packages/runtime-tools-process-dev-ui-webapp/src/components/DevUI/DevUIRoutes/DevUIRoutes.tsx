/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useMemo } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { JobsManagementPage, ProcessesPage } from "../../pages";
import ProcessDetailsPage from "../../pages/ProcessDetailsPage/ProcessDetailsPage";
import TaskInboxPage from "../../pages/TaskInboxPage/TaskInboxPage";
import TaskDetailsPage from "../../pages/TaskDetailsPage/TaskDetailsPage";
import FormsListPage from "../../pages/FormsListPage/FormsListPage";
import FormDetailPage from "../../pages/FormDetailsPage/FormDetailsPage";
import ProcessFormPage from "../../pages/ProcessFormPage/ProcessFormPage";
import { useDevUIAppContext } from "../../contexts/DevUIAppContext";
import { PageNotFound } from "@kie-tools/runtime-tools-shared-webapp-components/dist/PageNotFound";
import { NoData } from "@kie-tools/runtime-tools-shared-webapp-components/dist/NoData";

interface IOwnProps {
  navigate: string;
}

type DevUIRoute = { enabled: () => boolean; node: React.ReactNode };

const defaultPath = "/Jobs";

const defaultButton = "Go to Jobs";

const DevUIRoutes: React.FC<IOwnProps> = ({ navigate }) => {
  const context = useDevUIAppContext();

  const routes: DevUIRoute[] = useMemo(
    () => [
      {
        enabled: () => true,
        node: (
          <Route key="0" exact path="/">
            <Redirect to={`/${navigate}`} />
          </Route>
        ),
      },
      {
        enabled: () => context.isProcessEnabled,
        node: (
          <Route key="1" exact path="/Processes">
            <ProcessesPage />
          </Route>
        ),
      },
      {
        enabled: () => context.isProcessEnabled,
        node: (
          <Route key="2" exact path="/Process/:instanceID">
            <ProcessDetailsPage />
          </Route>
        ),
      },
      {
        enabled: () => context.isProcessEnabled,
        node: (
          <Route key="3" exact path="/Jobs">
            <JobsManagementPage />
          </Route>
        ),
      },
      {
        enabled: () => context.isProcessEnabled,
        node: (
          <Route key="4" exact path="/Tasks">
            <TaskInboxPage />
          </Route>
        ),
      },
      {
        enabled: () => context.isProcessEnabled,
        node: (
          <Route key="5" exact path="/Forms">
            <FormsListPage />
          </Route>
        ),
      },
      {
        enabled: () => context.isProcessEnabled,
        node: (
          <Route key="6" exact path="/Forms/:formName">
            <FormDetailPage />
          </Route>
        ),
      },
      {
        enabled: () => context.isProcessEnabled,
        node: (
          <Route key="7" exact path="/ProcessDefinition/Form/:processName">
            <ProcessFormPage />
          </Route>
        ),
      },
      {
        enabled: () => context.isProcessEnabled,
        node: (
          <Route key="11" exact path="/TaskDetails/:taskId">
            {(routeProps) => <TaskDetailsPage {...routeProps} />}
          </Route>
        ),
      },
      {
        enabled: () => true,
        node: (
          <Route key="14" path="/NoData">
            {(_props) => <NoData {..._props} defaultPath={defaultPath} defaultButton={defaultButton} />}
          </Route>
        ),
      },
      {
        enabled: () => true,
        node: (
          <Route key="18" path="*">
            {(_props) => <PageNotFound {..._props} defaultPath={defaultPath} defaultButton={defaultButton} />}
          </Route>
        ),
      },
    ],
    [context.isProcessEnabled]
  );

  return <Switch>{routes.filter((r) => r.enabled()).map((r) => r.node)}</Switch>;
};

export default DevUIRoutes;
