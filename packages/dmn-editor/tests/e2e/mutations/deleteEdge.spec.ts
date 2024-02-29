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

import { expect } from "@playwright/test";
import { test } from "../__fixtures__/base";
import { DefaultNodeName, NodeType } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("MUTATION - Delete edge", () => {
  test("Information Requirement", async ({ edges, diagram, palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.INPUT_DATA, targetPosition: { x: 100, y: 100 } });
    await nodes.dragNewConnectedNode({
      from: DefaultNodeName.INPUT_DATA,
      type: NodeType.DECISION,
      targetPosition: { x: 100, y: 300 },
    });

    expect(await edges.get({ from: DefaultNodeName.INPUT_DATA, to: DefaultNodeName.DECISION })).toBeAttached();

    await diagram.resetFocus();
    await edges.delete({ from: DefaultNodeName.INPUT_DATA, to: DefaultNodeName.DECISION });

    expect(await edges.get({ from: DefaultNodeName.INPUT_DATA, to: DefaultNodeName.DECISION })).not.toBeAttached();

    await expect(nodes.get({ name: DefaultNodeName.INPUT_DATA })).toBeAttached();
    await expect(nodes.get({ name: DefaultNodeName.DECISION })).toBeAttached();
  });

  test("Association", async ({ edges, diagram, palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.INPUT_DATA, targetPosition: { x: 100, y: 100 } });
    await nodes.dragNewConnectedNode({
      from: DefaultNodeName.INPUT_DATA,
      type: NodeType.TEXT_ANNOTATION,
      targetPosition: { x: 100, y: 400 },
    });

    expect(await edges.get({ from: DefaultNodeName.INPUT_DATA, to: DefaultNodeName.TEXT_ANNOTATION })).toBeAttached();

    await diagram.resetFocus();
    await edges.delete({ from: DefaultNodeName.INPUT_DATA, to: DefaultNodeName.TEXT_ANNOTATION });

    expect(
      await edges.get({ from: DefaultNodeName.INPUT_DATA, to: DefaultNodeName.TEXT_ANNOTATION })
    ).not.toBeAttached();

    await expect(nodes.get({ name: DefaultNodeName.INPUT_DATA })).toBeAttached();
    await expect(nodes.get({ name: DefaultNodeName.TEXT_ANNOTATION })).toBeAttached();
  });

  test("Knowledge Requirement", async ({ edges, diagram, palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.BKM, targetPosition: { x: 100, y: 100 } });
    await nodes.dragNewConnectedNode({
      from: DefaultNodeName.BKM,
      type: NodeType.DECISION,
      targetPosition: { x: 100, y: 300 },
    });

    expect(await edges.get({ from: DefaultNodeName.BKM, to: DefaultNodeName.DECISION })).toBeAttached();

    await diagram.resetFocus();
    await edges.delete({ from: DefaultNodeName.BKM, to: DefaultNodeName.DECISION });

    expect(await edges.get({ from: DefaultNodeName.BKM, to: DefaultNodeName.DECISION })).not.toBeAttached();

    await expect(nodes.get({ name: DefaultNodeName.BKM })).toBeAttached();
    await expect(nodes.get({ name: DefaultNodeName.DECISION })).toBeAttached();
  });

  test("Authority Requirement", async ({ edges, diagram, palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.INPUT_DATA, targetPosition: { x: 100, y: 100 } });
    await nodes.dragNewConnectedNode({
      from: DefaultNodeName.INPUT_DATA,
      type: NodeType.KNOWLEDGE_SOURCE,
      targetPosition: { x: 100, y: 300 },
    });

    expect(await edges.get({ from: DefaultNodeName.INPUT_DATA, to: DefaultNodeName.KNOWLEDGE_SOURCE })).toBeAttached();

    await diagram.resetFocus();
    await edges.delete({ from: DefaultNodeName.INPUT_DATA, to: DefaultNodeName.KNOWLEDGE_SOURCE });

    expect(
      await edges.get({ from: DefaultNodeName.INPUT_DATA, to: DefaultNodeName.KNOWLEDGE_SOURCE })
    ).not.toBeAttached();

    await expect(nodes.get({ name: DefaultNodeName.INPUT_DATA })).toBeAttached();
    await expect(nodes.get({ name: DefaultNodeName.KNOWLEDGE_SOURCE })).toBeAttached();
  });
});
