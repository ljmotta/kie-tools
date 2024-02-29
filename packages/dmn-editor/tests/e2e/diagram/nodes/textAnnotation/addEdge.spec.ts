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
import { DefaultNodeName, NodeType, NodePosition } from "../../../__fixtures__/nodes";
import { EdgeType } from "../../../__fixtures__/edges";
import { TestAnnotations } from "@kie-tools/playwright-base/annotations";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Text Annotation Node - Add new edge", () => {
  test.beforeEach(async ({ palette, diagram }) => {
    await palette.dragNewNode({ type: NodeType.TEXT_ANNOTATION, targetPosition: { x: 100, y: 100 } });
    test.info().annotations.push({
      type: TestAnnotations.WORKAROUND_DUE_TO,
      description: "",
    });
    await diagram.resetFocus();
  });

  test.describe("From Text Annotation", () => {
    test("should add an edge to Input Data node", async ({ diagram, palette, nodes, edges }) => {
      await palette.dragNewNode({
        type: NodeType.INPUT_DATA,
        targetPosition: { x: 100, y: 400 },
      });
      await diagram.resetFocus();
      await nodes.dragNewConnectedEdge({
        type: EdgeType.ASSOCIATION,
        from: DefaultNodeName.TEXT_ANNOTATION,
        to: DefaultNodeName.INPUT_DATA,
      });

      expect(await edges.get({ from: DefaultNodeName.TEXT_ANNOTATION, to: DefaultNodeName.INPUT_DATA })).toBeAttached();
      expect(await edges.getType({ from: DefaultNodeName.TEXT_ANNOTATION, to: DefaultNodeName.INPUT_DATA })).toEqual(
        EdgeType.ASSOCIATION
      );
      await expect(diagram.get()).toHaveScreenshot();
    });

    test("should add an edge to Decision node", async ({ diagram, palette, nodes, edges }) => {
      await palette.dragNewNode({ type: NodeType.DECISION, targetPosition: { x: 100, y: 400 } });
      await nodes.dragNewConnectedEdge({
        type: EdgeType.ASSOCIATION,
        from: DefaultNodeName.TEXT_ANNOTATION,
        to: DefaultNodeName.DECISION,
      });

      expect(await edges.get({ from: DefaultNodeName.TEXT_ANNOTATION, to: DefaultNodeName.DECISION })).toBeAttached();
      expect(await edges.getType({ from: DefaultNodeName.TEXT_ANNOTATION, to: DefaultNodeName.DECISION })).toEqual(
        EdgeType.ASSOCIATION
      );
      await expect(diagram.get()).toHaveScreenshot();
    });

    test("should add an edge to BKM node", async ({ diagram, palette, nodes, edges }) => {
      await palette.dragNewNode({ type: NodeType.BKM, targetPosition: { x: 100, y: 400 } });
      await nodes.dragNewConnectedEdge({
        type: EdgeType.ASSOCIATION,
        from: DefaultNodeName.TEXT_ANNOTATION,
        to: DefaultNodeName.BKM,
      });

      expect(await edges.get({ from: DefaultNodeName.TEXT_ANNOTATION, to: DefaultNodeName.BKM })).toBeAttached();
      expect(await edges.getType({ from: DefaultNodeName.TEXT_ANNOTATION, to: DefaultNodeName.BKM })).toEqual(
        EdgeType.ASSOCIATION
      );
      await expect(diagram.get()).toHaveScreenshot();
    });

    test("should add an edge to Knowledge Source node", async ({ diagram, palette, nodes, edges }) => {
      await palette.dragNewNode({ type: NodeType.KNOWLEDGE_SOURCE, targetPosition: { x: 100, y: 400 } });
      await nodes.dragNewConnectedEdge({
        type: EdgeType.ASSOCIATION,
        from: DefaultNodeName.TEXT_ANNOTATION,
        to: DefaultNodeName.KNOWLEDGE_SOURCE,
      });

      expect(
        await edges.get({ from: DefaultNodeName.TEXT_ANNOTATION, to: DefaultNodeName.KNOWLEDGE_SOURCE })
      ).toBeAttached();
      expect(
        await edges.getType({ from: DefaultNodeName.TEXT_ANNOTATION, to: DefaultNodeName.KNOWLEDGE_SOURCE })
      ).toEqual(EdgeType.ASSOCIATION);
      await expect(diagram.get()).toHaveScreenshot();
    });

    test("should add an edge to Decision Service node", async ({ diagram, palette, nodes, edges }) => {
      await palette.dragNewNode({ type: NodeType.DECISION_SERVICE, targetPosition: { x: 300, y: 300 } });
      await nodes.dragNewConnectedEdge({
        type: EdgeType.ASSOCIATION,
        from: DefaultNodeName.TEXT_ANNOTATION,
        to: DefaultNodeName.DECISION_SERVICE,
        position: NodePosition.TOP,
      });

      expect(
        await edges.get({ from: DefaultNodeName.TEXT_ANNOTATION, to: DefaultNodeName.DECISION_SERVICE })
      ).toBeAttached();
      expect(
        await edges.getType({ from: DefaultNodeName.TEXT_ANNOTATION, to: DefaultNodeName.DECISION_SERVICE })
      ).toEqual(EdgeType.ASSOCIATION);
      await expect(diagram.get()).toHaveScreenshot();
    });

    test("should add an edge to Group node", async ({ diagram, palette, nodes, edges }) => {
      // FIXME: Not implemented yet. DMN SPEC 1.5 pag 34
      test.skip(true, "");
      test.info().annotations.push({
        type: TestAnnotations.REGRESSION,
        description: "",
      });

      await palette.dragNewNode({ type: NodeType.GROUP, targetPosition: { x: 300, y: 300 } });
      await nodes.dragNewConnectedEdge({
        type: EdgeType.ASSOCIATION,
        from: DefaultNodeName.TEXT_ANNOTATION,
        to: DefaultNodeName.GROUP,
        position: NodePosition.TOP,
      });

      expect(await edges.get({ from: DefaultNodeName.TEXT_ANNOTATION, to: DefaultNodeName.GROUP })).toBeAttached();
      expect(await edges.getType({ from: DefaultNodeName.TEXT_ANNOTATION, to: DefaultNodeName.GROUP })).toEqual(
        EdgeType.ASSOCIATION
      );
      await expect(diagram.get()).toHaveScreenshot();
    });
  });
});
