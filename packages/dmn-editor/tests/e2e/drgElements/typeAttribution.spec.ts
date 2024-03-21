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
import { DataType } from "../__fixtures__/jsonModel";
import { DefaultNodeName, NodeType } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe.only("Type attribution", () => {
  test("should change Input Data node data type", async ({ palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.INPUT_DATA, targetPosition: { x: 100, y: 100 } });

    await nodes.changeDataType({ nodeName: DefaultNodeName.INPUT_DATA, from: DataType.Undefined, to: DataType.Number });

    await expect(nodes.get({ name: DefaultNodeName.INPUT_DATA }).locator("input")).toHaveValue(DataType.Number);
  });

  test("should change Decision node data type", async ({ palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.DECISION, targetPosition: { x: 100, y: 100 } });

    await nodes.changeDataType({ nodeName: DefaultNodeName.DECISION, from: DataType.Undefined, to: DataType.Number });

    await expect(nodes.get({ name: DefaultNodeName.DECISION }).locator("input")).toHaveValue(DataType.Number);
  });

  test("should change Decision Service node data type", async ({ palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.DECISION_SERVICE, targetPosition: { x: 100, y: 100 } });

    await nodes.changeDataType({
      nodeName: DefaultNodeName.DECISION_SERVICE,
      from: DataType.Undefined,
      to: DataType.Number,
    });

    await expect(nodes.get({ name: DefaultNodeName.DECISION_SERVICE }).locator("input")).toHaveValue(DataType.Number);
  });

  test("should change BKM node data type", async ({ palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.BKM, targetPosition: { x: 100, y: 100 } });

    await nodes.changeDataType({ nodeName: DefaultNodeName.BKM, from: DataType.Undefined, to: DataType.Number });

    await expect(nodes.get({ name: DefaultNodeName.BKM }).locator("input")).toHaveValue(DataType.Number);
  });
});
