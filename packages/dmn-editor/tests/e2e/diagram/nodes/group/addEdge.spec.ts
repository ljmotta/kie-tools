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
import { TestAnnotations } from "@kie-tools/playwright-base/annotations";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Group Node - Add new edge", () => {
  test("should add an edge to Text Annotation node", async ({ diagram, palette, nodes, edges }) => {
    await palette.dragNewNode({ type: NodeType.GROUP, targetPosition: { x: 100, y: 100 } });
    test.info().annotations.push({
      type: TestAnnotations.WORKAROUND_DUE_TO,
      description: "",
    });
    await diagram.resetFocus();
    await palette.dragNewNode({ type: NodeType.TEXT_ANNOTATION, targetPosition: { x: 500, y: 500 } });

    await nodes.dragNewConnectedEdge({
      type: EdgeType.ASSOCIATION,
      from: DefaultNodeName.GROUP,
      to: DefaultNodeName.TEXT_ANNOTATION,
    });

    expect(await edges.get({ from: DefaultNodeName.GROUP, to: DefaultNodeName.TEXT_ANNOTATION })).toBeAttached();
    expect(await edges.getType({ from: DefaultNodeName.GROUP, to: DefaultNodeName.TEXT_ANNOTATION })).toEqual(
      EdgeType.ASSOCIATION
    );
    await expect(diagram.get()).toHaveScreenshot();
  });
});
