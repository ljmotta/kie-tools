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

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Delete node - Standalone nodes", () => {
  test("should delete a BKM node", async ({ palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.BKM, targetPosition: { x: 100, y: 100 } });
    await nodes.delete({ name: DefaultNodeName.BKM });

    await expect(nodes.get({ name: DefaultNodeName.BKM })).not.toBeAttached();
  });

  test("should delete a Decision node", async ({ palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.DECISION, targetPosition: { x: 100, y: 100 } });
    await nodes.delete({ name: DefaultNodeName.DECISION });

    await expect(nodes.get({ name: DefaultNodeName.DECISION })).not.toBeAttached();
  });

  test("should delete a Decision Service node", async ({ palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.DECISION_SERVICE, targetPosition: { x: 100, y: 100 } });
    await nodes.delete({ name: DefaultNodeName.DECISION_SERVICE });

    await expect(nodes.get({ name: DefaultNodeName.DECISION_SERVICE })).not.toBeAttached();
  });

  test("should delete a Group node", async ({ palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.GROUP, targetPosition: { x: 100, y: 100 } });
    await nodes.delete({ name: DefaultNodeName.GROUP });

    await expect(nodes.get({ name: DefaultNodeName.GROUP })).not.toBeAttached();
  });

  test("should delete a Input Data node", async ({ palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.INPUT_DATA, targetPosition: { x: 100, y: 100 } });
    await nodes.delete({ name: DefaultNodeName.INPUT_DATA });

    await expect(nodes.get({ name: DefaultNodeName.INPUT_DATA })).not.toBeAttached();
  });

  test("should delete a Knowledge Source node", async ({ palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.KNOWLEDGE_SOURCE, targetPosition: { x: 100, y: 100 } });
    await nodes.delete({ name: DefaultNodeName.KNOWLEDGE_SOURCE });

    await expect(nodes.get({ name: DefaultNodeName.KNOWLEDGE_SOURCE })).not.toBeAttached();
  });

  test("should delete a Text Annotation node", async ({ palette, nodes }) => {
    await palette.dragNewNode({ type: NodeType.TEXT_ANNOTATION, targetPosition: { x: 100, y: 100 } });
    await nodes.delete({ name: DefaultNodeName.TEXT_ANNOTATION });

    await expect(nodes.get({ name: DefaultNodeName.TEXT_ANNOTATION })).not.toBeAttached();
  });
});
