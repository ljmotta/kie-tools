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

import * as React from "react";
import { I18nDictionariesProvider } from "@kie-tools-core/i18n/dist/react-components";
import { Route, Routes, useParams } from "react-router";
import { HashRouter, Navigate } from "react-router-dom";
import { AppContext, AppContextType } from "./AppContext";
import { AppContextProvider } from "./AppContextProvider";
import { DmnFormErrorPage } from "./DmnFormErrorPage";
import { DmnFormPage } from "./DmnFormPage";
import { DmnFormI18nContext, dmnFormI18nDefaults, dmnFormI18nDictionaries } from "./i18n";
import { NoMatchPage } from "./NoMatchPage";
import { routes } from "./Routes";

export function DmnFormApp() {
  return (
    <I18nDictionariesProvider
      defaults={dmnFormI18nDefaults}
      dictionaries={dmnFormI18nDictionaries}
      initialLocale={navigator.language}
      ctx={DmnFormI18nContext}
    >
      <AppContextProvider>
        <AppContext.Consumer>
          {(app) =>
            app.fetchDone && (
              <HashRouter>
                <Routes>
                  {app.data && (
                    <Route
                      path={routes.form.path({ modelName: ":modelName*" })}
                      element={<DmnFormPageRoute app={app} />}
                    />
                  )}
                  {app.data?.forms[0] && (
                    <Route
                      path={routes.root.path({})}
                      element={<Navigate to={routes.form.path({ modelName: app.data.forms[0].modelName })} />}
                    />
                  )}
                  <Route path={routes.error.path({})} element={<DmnFormErrorPage />} />
                  {!app.data && <Navigate to={routes.error.path({})} />}
                  <Route element={<NoMatchPage />} />
                </Routes>
              </HashRouter>
            )
          }
        </AppContext.Consumer>
      </AppContextProvider>
    </I18nDictionariesProvider>
  );
}

function DmnFormPageRoute(props: { app: AppContextType }) {
  const { modelName } = useParams();

  const formData = props.app.data!.forms.find((form) => form.modelName === modelName);
  return formData ? <DmnFormPage formData={formData} /> : <Navigate to={routes.error.path({})} />;
}
