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

import path from "path";
import common from "@kie-tools-core/webpack-base/webpack.common.config.mts";
import { merge } from "webpack-merge";
import CopyPlugin from "copy-webpack-plugin";
import patternflyBase from "@kie-tools-core/patternfly-base";

// eslint-disable-next@kie-tools/dashbuilder-client pt-eslint/ban-ts-comment
// @ts-ignore
import dashbuilderClient from "@kie-tools/dashbuilder-client";
// eslint-disable-next./env/index.mjs pt-eslint/ban-ts-comment
// @ts-ignore
import { env } from "./env/index.mjs";
const buildEnv: any = env;

export const config = async (env: any, argv: any) => {
  return merge(common(env, argv), {
    entry: {
      index: "./src/index.tsx",
      "dashbuilder-viewer-envelope-app": "./src/envelope/DashbuilderViewerEnvelopeApp.ts",
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "./static/resources", to: "./resources" },
          { from: "./static/favicon.svg", to: "./favicon.svg" },
          { from: "./static/index.html", to: "./index.html" },
          { from: "./static/dashboard.dash.yaml", to: "./dashboard.dash.yaml" },
          {
            from: "./static/dashbuilder-viewer-deployment-webapp-data.json",
            to: "./dashbuilder-viewer-deployment-webapp-data.json",
          },
          { from: "./static/setup.js", to: "./setup.js" },
          {
            from: "./static/envelope/dashbuilder-viewer-envelope.html",
            to: "./dashbuilder-viewer-envelope.html",
          },
          {
            from: dashbuilderClient.dashbuilderPath(),
            to: "./",
            globOptions: { ignore: ["**/WEB-INF/**/*"] },
          },
        ],
      }),
    ],
    module: {
      rules: [...patternflyBase.webpackModuleRules],
    },
    devServer: {
      historyApiFallback: false,
      static: [
        { directory: path.join(import.meta.dirname, "./dist") },
        { directory: path.join(import.meta.dirname, "./static") },
      ],
      compress: true,
      port: buildEnv.dashbuilderViewerDeploymentWebApp.dev.port,
    },
  } as any);
};

export default config;
