/*
 * Copyright 2023 Red Hat, Inc. and/or its affiliates.
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

test.describe("New file", () => {
  test.beforeEach(async ({ page }) => {
    test.slow();
  });

  test.describe("Home", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("should create BPMN new file", async ({ page, kieSandbox }) => {
      await page.getByRole("button", { name: "New Workflow" }).click();
      await expect(page.getByRole("button", { name: "Workflow Edit file name" })).toBeAttached();
      await expect(page.getByRole("button", { name: "Workflow Edit file name" })).toContainText("Untitled");
      await expect(kieSandbox.getEditor().getByRole("button", { name: "Start Events" })).toBeAttached();
      await expect(page).toHaveScreenshot("new-file-bpmn.png");
    });

    test("should create DMN new file", async ({ page, kieSandbox }) => {
      await page.getByRole("button", { name: "New Decision" }).click();
      await expect(page.getByRole("button", { name: "Decision Edit file name" })).toBeAttached();
      await expect(page.getByRole("button", { name: "Decision Edit file name" })).toContainText("Untitled");
      await expect(kieSandbox.getEditor().getByRole("button", { name: "DMN Input Data" })).toBeAttached();
      await expect(page).toHaveScreenshot("new-file-dmn.png");
    });

    test("should create PMML new file", async ({ page, kieSandbox }) => {
      await page.getByRole("button", { name: "New Scorecard" }).click();
      await expect(page.getByRole("button", { name: "Scorecard Edit file name" })).toBeAttached();
      await expect(page.getByRole("button", { name: "Scorecard Edit file name" })).toContainText("Untitled");
      await expect(kieSandbox.getEditor().getByRole("button", { name: "Set Data Dictionary" })).toBeAttached();
      await expect(page).toHaveScreenshot("new-file-pmml.png");
    });
  });
});