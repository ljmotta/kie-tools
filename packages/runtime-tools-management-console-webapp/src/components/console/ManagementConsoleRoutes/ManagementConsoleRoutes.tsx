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
import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { JobsPage, ProcessDetailsPage, TasksPage, TaskDetailsPage } from "../../pages";
import { PageNotFound } from "@kie-tools/runtime-tools-shared-webapp-components/dist/PageNotFound";
import { NoData } from "@kie-tools/runtime-tools-shared-webapp-components/dist/NoData";

const ManagementConsoleRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/">
        <Navigate to="/ProcessInstances" />
      </Route>
      <Route path="/ProcessInstances">ProcessListPage</Route>
      <Route path="/Jobs">
        <JobsPage />
      </Route>
      <Route path="/Process/:instanceID">
        <ProcessDetailsPage />
      </Route>
      <Route path="/Tasks">
        <TasksPage />
      </Route>
      <Route path="/TaskDetails/:taskId">
        <TaskDetailsPage />
      </Route>
      <Route path="/NoData">{<NoData defaultPath="/Jobs" defaultButton="Go to Jobs" />}</Route>
      <Route path="*">{<PageNotFound defaultPath="/Jobs" defaultButton="Go to Jobs" />}</Route>
    </Routes>
  );
};

export default ManagementConsoleRoutes;
