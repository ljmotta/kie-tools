/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { test, expect } from "../fixtures/base";

test.describe("DMN runner", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // open dmn file;
    test.slow();
  });

  // check node creation;
  // check type change;
  // check node deletion;
  // check download/import inputs;

  test.describe("Form", () => {
    test("", async ({ page, upload, kieSandbox }) => {});
  });

  test.describe("Table", () => {
    test("", async ({ page, upload, kieSandbox }) => {});
  });

  // check change between form/table view

  // open another file with form/table opened
});