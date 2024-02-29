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

import { test, expect } from "../../../__fixtures__/base";
import { DefaultNodeName, NodeType } from "../../../__fixtures__/nodes";
import { EdgeType } from "../../../__fixtures__/edges";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("BKM Node - Add connected node", () => {
  test.beforeEach(async ({ palette }) => {
    // Renaming to avoid ambiguity
    await palette.dragNewNode({
      type: NodeType.BKM,
      targetPosition: { x: 100, y: 100 },
      thenRenameTo: "BKM - A",
    });
  });

  test("should add Decision", async ({ diagram, nodes, edges }) => {
    await nodes.dragNewConnectedNode({
      from: "BKM - A",
      type: NodeType.DECISION,
      targetPosition: { x: 100, y: 300 },
    });

    expect(await edges.get({ from: "BKM - A", to: DefaultNodeName.DECISION })).toBeAttached();
    expect(await edges.getType({ from: "BKM - A", to: DefaultNodeName.DECISION })).toEqual(
      EdgeType.KNOWLEDGE_REQUIREMENT
    );
    await expect(diagram.get()).toHaveScreenshot();
  });

  test("should add BKM", async ({ diagram, nodes, edges }) => {
    await nodes.dragNewConnectedNode({
      from: "BKM - A",
      type: NodeType.BKM,
      targetPosition: { x: 100, y: 300 },
    });

    expect(await edges.get({ from: "BKM - A", to: DefaultNodeName.BKM })).toBeAttached();
    expect(await edges.getType({ from: "BKM - A", to: DefaultNodeName.BKM })).toEqual(EdgeType.KNOWLEDGE_REQUIREMENT);
    await expect(diagram.get()).toHaveScreenshot();
  });

  test("should add Text Annotation", async ({ diagram, nodes, edges }) => {
    await nodes.dragNewConnectedNode({
      from: "BKM - A",
      type: NodeType.TEXT_ANNOTATION,
      targetPosition: { x: 100, y: 300 },
    });

    expect(await edges.get({ from: "BKM - A", to: DefaultNodeName.TEXT_ANNOTATION })).toBeAttached();
    expect(await edges.getType({ from: "BKM - A", to: DefaultNodeName.TEXT_ANNOTATION })).toEqual(EdgeType.ASSOCIATION);
    await expect(diagram.get()).toHaveScreenshot();
  });
});
