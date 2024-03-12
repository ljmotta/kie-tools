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
import { TestAnnotations } from "@kie-tools/playwright-base/annotations";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe.only("Invalid edge - Information Requirement", () => {
  test.describe("From Input Data", () => {
    test.beforeEach(async ({ palette }) => {
      await palette.dragNewNode({
        type: NodeType.INPUT_DATA,
        targetPosition: { x: 100, y: 100 },
      });
    });

    test("shouldn't add an Information Requirement edge from Input Data node to Input Data node", async ({
      palette,
    }) => {});

    test("shouldn't add an Information Requirement edge from Input Data node to BKM node", async ({ palette }) => {});

    test("shouldn't add an Information Requirement edge from Input Data node to Decision Service node", async ({
      palette,
    }) => {});

    test("shouldn't add an Information Requirement edge from Input Data node to Knowledge Source node", async ({
      palette,
    }) => {});

    test("shouldn't add an Information Requirement edge from Input Data node to Group node", async ({ palette }) => {});

    test("shouldn't add an Information Requirement edge from Input Data node to Text Annotation node", async ({
      palette,
    }) => {});
  });

  test.describe("From Decision", () => {
    test.beforeEach(async ({ palette }) => {
      await palette.dragNewNode({
        type: NodeType.DECISION,
        targetPosition: { x: 100, y: 100 },
      });
    });

    test("shouldn't add an Information Requirement edge from Decision node to Input Data node", async ({
      palette,
    }) => {});

    test("shouldn't add an Information Requirement edge from Decision node to BKM node", async ({ palette }) => {});

    test("shouldn't add an Information Requirement edge from Decision node to Decision Service node", async ({
      palette,
    }) => {});

    test("shouldn't add an Information Requirement edge from Decision node to Knowledge Source node", async ({
      palette,
    }) => {});

    test("shouldn't add an Information Requirement edge from Decision node to Group node", async ({ palette }) => {});

    test("shouldn't add an Information Requirement edge from Decision node to Text Annotation node", async ({
      palette,
    }) => {});
  });
});
