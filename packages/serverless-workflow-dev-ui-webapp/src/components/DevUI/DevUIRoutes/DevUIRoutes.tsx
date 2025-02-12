/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { NoData } from "@kie-tools/runtime-tools-shared-webapp-components/dist/NoData";
import React, { useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDevUIAppContext } from "../../contexts/DevUIAppContext";
import { WorkflowsPage } from "../../pages";
import CloudEventFormPage from "../../pages/CloudEventFormPage/CloudEventFormPage";
import CustomDashboardListPage from "../../pages/CustomDashboardListPage/CustomDashboardListPage";
import CustomDashboardViewPage from "../../pages/CustomDashboardViewPage/CustomDashboardViewPage";
import FormDetailPage from "../../pages/FormDetailsPage/FormDetailsPage";
import FormsListPage from "../../pages/FormsListPage/FormsListPage";
import MonitoringPage from "../../pages/MonitoringPage/MonitoringPage";
import WorkflowFormPage from "../../pages/WorkflowFormPage/WorkflowFormPage";
import WorkflowDetailsPage from "../../pages/WorkflowDetailsPage/WorkflowDetailsPage";

interface IOwnProps {
  dataIndexUrl: string;
  navigate: string;
}

type DevUIRoute = { enabled: () => boolean; node: React.ReactNode };

const DevUIRoutes: React.FC<IOwnProps> = ({ dataIndexUrl, navigate }) => {
  const context = useDevUIAppContext();

  const routes: DevUIRoute[] = useMemo(
    () => [
      {
        enabled: () => true,
        node: <Route key="0" path="/" element={<Navigate to={`/${navigate}`} />} />,
      },
      {
        enabled: () => context.isWorkflowEnabled,
        node: <Route key="1" path="/Workflows" element={<WorkflowsPage />} />,
      },
      {
        enabled: () => context.isWorkflowEnabled,
        node: <Route key="2" path="/Workflow/:instanceID" element={<WorkflowDetailsPage />} />,
      },
      {
        enabled: () => context.isWorkflowEnabled,
        node: <Route key="5" path="/Forms" element={<FormsListPage />} />,
      },
      {
        enabled: () => context.isWorkflowEnabled,
        node: <Route key="6" path="/Forms/:formName" element={<FormDetailPage />} />,
      },
      {
        enabled: () => context.isWorkflowEnabled,
        node: <Route key="8" path="/WorkflowDefinition/Form/:workflowName" element={<WorkflowFormPage />} />,
      },
      {
        enabled: () => context.isWorkflowEnabled,
        node: <Route key="9" path="/CustomDashboard" element={<CustomDashboardListPage />} />,
      },
      {
        enabled: () => context.isWorkflowEnabled,
        node: <Route key="10" path="/CustomDashboard/:customDashboardName" element={<CustomDashboardViewPage />} />,
      },
      {
        enabled: () => context.isWorkflowEnabled,
        node: <Route key="13" path="/Monitoring" element={<MonitoringPage dataIndexUrl={dataIndexUrl} />} />,
      },
      {
        enabled: () => context.isWorkflowEnabled,
        node: <Route key="15" path="/Workflows/CloudEvent/:instanceId" element={<CloudEventFormPage />} />,
      },
      {
        enabled: () => context.isWorkflowEnabled,
        node: <Route key="16" path="/Workflows/CloudEvent" element={<CloudEventFormPage />} />,
      },
      {
        enabled: () => context.isWorkflowEnabled,
        node: <Route key="17" path="/WorkflowDefinitions/CloudEvent" element={<CloudEventFormPage />} />,
      },
    ],
    [context.isWorkflowEnabled, dataIndexUrl, navigate]
  );

  return <Routes>{routes.filter((r) => r.enabled()).map((r) => r.node)}</Routes>;
};

export default DevUIRoutes;
