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

import { AnyMxRecord } from "dns";
import path from "path";
import common from "@kie-tools-core/webpack-base/webpack.common.config.mts";
import { merge } from "webpack-merge";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import patternflyBase from "@kie-tools-core/patternfly-base";

export const config = async (env: AnyMxRecord, argv: any) => {
  return merge(common(env, argv), {
    mode: "development",
    entry: {
      index: path.resolve(import.meta.dirname, "./index.tsx"),
    },
    output: {
      path: path.resolve("../dist-dev"),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./static/index.html",
        minify: false,
      }),
      new CopyPlugin({
        patterns: [
          { from: path.resolve(import.meta.dirname, "manifest.dev.json"), to: "." },
          { from: path.resolve(import.meta.dirname, "sampleSchema.json"), to: "." },
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
        { directory: path.join(import.meta.dirname, "../static") },
      ],
      compress: false,
      port: 9001,
    },
  } as any);
};

export default config;
