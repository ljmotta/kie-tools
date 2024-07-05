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
import HtmlWebpackPlugin from "html-webpack-plugin";
import patternflyBase from "@kie-tools-core/patternfly-base";

export const config = async (env: any, argv: any) => {
  return merge(common(env, argv), {
    entry: {
      index: "./src/index.tsx",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./static/index.html",
        minify: false,
      }),
    ],

    module: {
      rules: [...(patternflyBase.webpackModuleRules as any)],
    },
    devServer: {
      historyApiFallback: false,
      static: [
        { directory: path.join(import.meta.dirname, "./dist") },
        { directory: path.join(import.meta.dirname, "./static") },
      ],
      compress: false,
      port: 9001,
    },
  } as any);
};

export default config;
