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

import { test, expect } from "../__fixtures__/base";
import { DEFAULT_DRD_NAME } from "../__fixtures__/diagram";
import { DataType } from "../__fixtures__/jsonModel";
import { DefaultNodeName, NodeType } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Type attribution", () => {
  test.describe("Input Data", () => {
    test.only("should change Input Data data type", async ({ page, palette, nodes }) => {
      await palette.dragNewNode({ type: NodeType.INPUT_DATA, targetPosition: { x: 100, y: 100 } });

      await nodes.hover({ name: DefaultNodeName.INPUT_DATA });
      await nodes.get({ name: DefaultNodeName.INPUT_DATA }).getByLabel(DataType.Undefined).click();
      await page.pause();
      await nodes
        .get({ name: DefaultNodeName.INPUT_DATA })
        .getByRole("option")
        .getByText(DataType.Number, { exact: true })
        .click();

      await page.pause();

      await nodes.hover({ name: DefaultNodeName.INPUT_DATA });
      await page.pause();
    });
  });

  test.describe("Decision", () => {});

  test.describe("Decision Service", () => {});

  test.describe("BKM", () => {});
});
