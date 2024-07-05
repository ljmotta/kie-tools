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

import CopyWebpackPlugin from "copy-webpack-plugin";
import patternflyBase from "@kie-tools-core/patternfly-base";
import stunnerEditors from "@kie-tools/stunner-editors";
import vscodeJavaCodeCompletionExtensionPlugin from "@kie-tools/vscode-java-code-completion-extension-plugin";
import common from "@kie-tools-core/webpack-base/webpack.common.config.mts";
import { merge } from "webpack-merge";
import webpack from "webpack";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { ProvidePlugin } = webpack;

const commonConfig = (env: any, argv: any) =>
  merge(common(env, argv), {
    output: {
      library: "BpmnEditor",
      libraryTarget: "umd",
      umdNamedDefine: true,
      globalObject: "this",
    } as any,
    externals: {
      vscode: "commonjs vscode",
    },
  } as any);

export const config = async (env: any, argv: any) => [
  merge(commonConfig(env, argv), {
    target: "node",
    entry: {
      "extension/extension": "./src/extension/extension.ts",
    },
  }),
  merge(commonConfig(env, argv), {
    target: "webworker",
    entry: {
      "extension/extensionWeb": "./src/extension/extension.ts",
    },
    plugins: [
      new ProvidePlugin({
        process: require.resolve("process/browser.js"),
        Buffer: ["buffer", "Buffer"],
      }),
    ],
  }),
  merge(commonConfig(env, argv), {
    target: "web",
    entry: {
      "webview/BpmnEditorEnvelopeApp": "./src/webview/BpmnEditorEnvelopeApp.ts",
    },
    module: {
      rules: [...patternflyBase.webpackModuleRules],
    },
    plugins: [
      new ProvidePlugin({
        process: require.resolve("process/browser.js"),
        Buffer: ["buffer", "Buffer"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: stunnerEditors.bpmnEditorPath(),
            to: "webview/editors/bpmn",
            globOptions: { ignore: ["**/WEB-INF/**/*", "**/*.html"] },
          },
          {
            from: vscodeJavaCodeCompletionExtensionPlugin.path(),
            to: "server/",
            globOptions: { ignore: ["**/WEB-INF/**/*", "**/*.html"] },
          },
        ],
      }),
    ],
  }),
];

export default config;
