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
import { DefaultNodeName, NodeType } from "../__fixtures__/nodes";
import { EdgeType } from "../__fixtures__/edges";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Add node - from Decision node", () => {
  test.beforeEach(async ({ palette }) => {
    // Renaming to avoid ambiguity
    await palette.dragNewNode({
      type: NodeType.DECISION,
      targetPosition: { x: 100, y: 100 },
      thenRenameTo: "Decision - A",
    });
  });

  test("should add connected Decision node from Decision node", async ({ diagram, nodes, edges }) => {
    await nodes.dragNewConnectedNode({
      from: "Decision - A",
      type: NodeType.DECISION,
      targetPosition: { x: 100, y: 300 },
    });

    expect(await edges.get({ from: "Decision - A", to: DefaultNodeName.DECISION })).toBeAttached();
    expect(await edges.getType({ from: "Decision - A", to: DefaultNodeName.DECISION })).toEqual(
      EdgeType.INFORMATION_REQUIREMENT
    );
    await expect(diagram.get()).toHaveScreenshot();
  });

  test("should add connected Knowledge Source node from Decision node", async ({ diagram, nodes, edges }) => {
    await nodes.dragNewConnectedNode({
      from: "Decision - A",
      type: NodeType.KNOWLEDGE_SOURCE,
      targetPosition: { x: 100, y: 300 },
    });

    expect(await edges.get({ from: "Decision - A", to: DefaultNodeName.KNOWLEDGE_SOURCE })).toBeAttached();
    expect(await edges.getType({ from: "Decision - A", to: DefaultNodeName.KNOWLEDGE_SOURCE })).toEqual(
      EdgeType.AUTHORITY_REQUIREMENT
    );
    await expect(diagram.get()).toHaveScreenshot();
  });

  test("should add connected Text Annotation node from Decision node", async ({ diagram, nodes, edges }) => {
    await nodes.dragNewConnectedNode({
      from: "Decision - A",
      type: NodeType.TEXT_ANNOTATION,
      targetPosition: { x: 100, y: 300 },
    });

    expect(await edges.get({ from: "Decision - A", to: DefaultNodeName.TEXT_ANNOTATION })).toBeAttached();
    expect(await edges.getType({ from: "Decision - A", to: DefaultNodeName.TEXT_ANNOTATION })).toEqual(
      EdgeType.ASSOCIATION
    );
    await expect(diagram.get()).toHaveScreenshot();
  });
});
