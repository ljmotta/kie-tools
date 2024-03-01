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
import { test } from "./__fixtures__/base";
import { DefaultNodeName, NodeType } from "./__fixtures__/nodes";
import { EdgeType } from "./__fixtures__/edges";
import { TestAnnotations } from "@kie-tools/playwright-base/annotations";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("MUTATIONS - Add edge waypoint", () => {
  test("Information Requirement", async ({ diagram, palette, nodes, edges }) => {
    await palette.dragNewNode({ type: NodeType.INPUT_DATA, targetPosition: { x: 100, y: 100 } });
    test.info().annotations.push({
      type: TestAnnotations.WORKAROUND_DUE_TO,
      description: "",
    });
    await diagram.resetFocus();

    await palette.dragNewNode({ type: NodeType.DECISION, targetPosition: { x: 100, y: 300 } });

    await diagram.resetFocus();

    await nodes.dragNewConnectedEdge({
      type: EdgeType.INFORMATION_REQUIREMENT,
      from: DefaultNodeName.INPUT_DATA,
      to: DefaultNodeName.DECISION,
    });

    await edges.addWaypoint({ from: DefaultNodeName.INPUT_DATA, to: DefaultNodeName.DECISION });

    await nodes.get({ name: DefaultNodeName.DECISION }).dragTo(diagram.get(), { targetPosition: { x: 300, y: 300 } });

    await expect(diagram.get()).toHaveScreenshot();
  });

  test("Knowledge Requirement", async ({ diagram, palette, nodes, edges }) => {
    await palette.dragNewNode({ type: NodeType.BKM, targetPosition: { x: 100, y: 100 } });
    test.info().annotations.push({
      type: TestAnnotations.WORKAROUND_DUE_TO,
      description: "",
    });
    await diagram.resetFocus();

    await palette.dragNewNode({ type: NodeType.DECISION, targetPosition: { x: 100, y: 300 } });

    await diagram.resetFocus();

    await nodes.dragNewConnectedEdge({
      type: EdgeType.KNOWLEDGE_REQUIREMENT,
      from: DefaultNodeName.BKM,
      to: DefaultNodeName.DECISION,
    });

    await edges.addWaypoint({ from: DefaultNodeName.BKM, to: DefaultNodeName.DECISION });

    await nodes.get({ name: DefaultNodeName.DECISION }).dragTo(diagram.get(), { targetPosition: { x: 300, y: 300 } });

    await expect(diagram.get()).toHaveScreenshot();
  });

  test("Authority Requirement", async ({ diagram, palette, nodes, edges }) => {
    await palette.dragNewNode({ type: NodeType.INPUT_DATA, targetPosition: { x: 100, y: 100 } });
    test.info().annotations.push({
      type: TestAnnotations.WORKAROUND_DUE_TO,
      description: "",
    });
    await diagram.resetFocus();

    await palette.dragNewNode({ type: NodeType.KNOWLEDGE_SOURCE, targetPosition: { x: 100, y: 300 } });

    await diagram.resetFocus();

    await nodes.dragNewConnectedEdge({
      type: EdgeType.AUTHORITY_REQUIREMENT,
      from: DefaultNodeName.INPUT_DATA,
      to: DefaultNodeName.KNOWLEDGE_SOURCE,
    });

    await edges.addWaypoint({ from: DefaultNodeName.INPUT_DATA, to: DefaultNodeName.KNOWLEDGE_SOURCE });

    await nodes
      .get({ name: DefaultNodeName.KNOWLEDGE_SOURCE })
      .dragTo(diagram.get(), { targetPosition: { x: 300, y: 300 } });

    await expect(diagram.get()).toHaveScreenshot();
  });

  test("Association", async ({ diagram, palette, nodes, edges }) => {
    await palette.dragNewNode({ type: NodeType.INPUT_DATA, targetPosition: { x: 100, y: 100 } });
    test.info().annotations.push({
      type: TestAnnotations.WORKAROUND_DUE_TO,
      description: "",
    });
    await diagram.resetFocus();

    await palette.dragNewNode({ type: NodeType.TEXT_ANNOTATION, targetPosition: { x: 100, y: 300 } });

    await diagram.resetFocus();

    await nodes.dragNewConnectedEdge({
      type: EdgeType.ASSOCIATION,
      from: DefaultNodeName.INPUT_DATA,
      to: DefaultNodeName.TEXT_ANNOTATION,
    });

    await edges.addWaypoint({ from: DefaultNodeName.INPUT_DATA, to: DefaultNodeName.TEXT_ANNOTATION });

    await nodes
      .get({ name: DefaultNodeName.TEXT_ANNOTATION })
      .dragTo(diagram.get(), { targetPosition: { x: 400, y: 400 } });

    await expect(diagram.get()).toHaveScreenshot();
  });
});
