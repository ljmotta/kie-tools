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

test.describe.only("Change Properties - Decision", () => {
  test.beforeEach(async ({ palette, nodes, propertiesPanel }) => {
    await palette.dragNewNode({ type: NodeType.DECISION, targetPosition: { x: 100, y: 100 } });
    await nodes.select({ name: DefaultNodeName.DECISION });
    await propertiesPanel.open();
  });

  test("should change the Decision node name", async ({ nodes, propertiesPanel }) => {
    await propertiesPanel.changeNodeName({ newName: "Renamed Decision" });

    await expect(nodes.get({ name: "Renamed Decision" })).toBeVisible();
  });

  test("should change the Decision node data type", async ({ nodes, propertiesPanel }) => {
    await propertiesPanel.changeNodeDataType({ newDataType: DataType.Number });

    await nodes.hover({ name: DefaultNodeName.DECISION });
    await expect(nodes.get({ name: DefaultNodeName.DECISION }).getByPlaceholder("Select a data type...")).toHaveValue(
      DataType.Number
    );
  });

  test("should change the Decision node description", async ({ nodes, propertiesPanel }) => {
    await propertiesPanel.changeNodeDescription({ newDescription: "New Decision Description" });

    // assert uisng jsonModel? assert using reopening properties panel? assert using screenshot?
  });

  test("should change the Decision node question", async ({ nodes, propertiesPanel }) => {
    await propertiesPanel.changeNodeQuestion({ newQuestion: "New Decision Question" });

    // assert uisng jsonModel? assert using reopening properties panel? assert using screenshot?
  });

  test("should change the Decision node answers", async ({ nodes, propertiesPanel }) => {
    await propertiesPanel.changeNodeAllowedAnswers({ newAllowedAnswers: "New Allowed Answers" });

    // assert uisng jsonModel? assert using reopening properties panel? assert using screenshot?
  });

  test("should change the Decision node documentation links", async ({ nodes, propertiesPanel }) => {
    await propertiesPanel.addDocumentationLink({ linkText: "Link Texts", linkHref: "http://link.test.com" });

    // assert uisng jsonModel? assert using reopening properties panel? assert using screenshot?
  });

  test("should change the Decision node font", async ({ nodes, propertiesPanel }) => {
    // TODO
  });
  test("should change the Decision node shape", async ({ nodes, propertiesPanel }) => {
    // TODO
  });
});
