import { test, expect } from "../fixtures/boxedExpression";
import { TestAnnotations } from "@kie-tools/playwright-base/annotations";

test.describe("Cell context menu", () => {
  test.describe("Rows control", () => {
    test.beforeEach(async ({ expressions, page }) => {
      await expressions.openRelationExpression();
      await page.getByTestId("monaco-container").click();
      await page.keyboard.type('"test"');
      await page.keyboard.press("Enter");
      await page.getByRole("cell", { name: "1" }).click({ button: "right" });
    });

    test("shouldn't render column context menu", async ({ page }) => {
      test.skip(true, "https://github.com/kiegroup/kie-issues/issues/420");
      test.info().annotations.push({
        type: TestAnnotations.REGRESSION,
        description: "https://github.com/kiegroup/kie-issues/issues/420",
      });

      await expect(page.getByRole("heading", { name: "ROWS" })).toBeAttached();
      await expect(page.getByRole("heading", { name: "SELECTION" })).toBeAttached();
      await expect(page.getByRole("heading", { name: "COLUMNS" })).not.toBeAttached();
    });

    test("should open row context menu and insert row above", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert above" }).click();
      await expect(page.getByRole("row", { name: "2" })).toContainText("test");
    });

    test("should open row context menu and insert row below", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert below" }).click();
      await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
      await expect(page.getByRole("row", { name: "2" })).toBeAttached();
    });

    test("should open row context menu and insert multiples rows above", async ({ page }) => {
      test.skip(true, "https://github.com/kiegroup/kie-issues/issues/420");

      await page.getByRole("menuitem", { name: "Insert", exact: true }).click();
      await page.getByRole("button", { name: "plus" }).click();
      await page.getByRole("button", { name: "Insert" }).click();
      await expect(page.getByRole("row", { name: "4" })).toContainText("test");
    });

    test("should open row context menu and insert multiples rows below", async ({ page }) => {
      test.skip(true, "https://github.com/kiegroup/kie-issues/issues/420");

      await page.getByRole("menuitem", { name: "Insert", exact: true }).click();
      await page.getByRole("button", { name: "minus" }).click();
      await page.getByLabel("Below").click();
      await page.getByRole("button", { name: "Insert" }).click();
      await expect(page.getByRole("row", { name: "2" })).toBeAttached();
    });

    test("should open row context menu and delete row", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert above" }).click();
      await expect(page.getByRole("row", { name: "2" })).toContainText("test");
      await page.getByRole("cell", { name: "1" }).click({ button: "right" });
      await page.getByRole("menuitem", { name: "Delete" }).click();
      await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
    });

    test("should open row context menu and duplicate row", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Duplicate" }).click();
      await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
      await expect(page.getByRole("row", { name: "2" })).toContainText("test");
    });
  });

  test.describe("Columns controls", () => {
    test.beforeEach(async ({ expressions, page }) => {
      await expressions.openRelationExpression();
      await page.getByTestId("monaco-container").click();
      await page.keyboard.type('"test"');
      await page.keyboard.press("Enter");
      await page.getByRole("columnheader", { name: "column-1 (<Undefined>)" }).click({
        button: "right",
      });
    });

    test("shouldn't render row context menu", async ({ page }) => {
      test.skip(true, "https://github.com/kiegroup/kie-issues/issues/420");
      test.info().annotations.push({
        type: TestAnnotations.REGRESSION,
        description: "https://github.com/kiegroup/kie-issues/issues/420",
      });

      await expect(page.getByRole("heading", { name: "COLUMNS" })).toBeAttached();
      await expect(page.getByRole("heading", { name: "SELECTION" })).toBeAttached();
      await expect(page.getByRole("heading", { name: "ROWS" })).not.toBeAttached();
    });

    test("should open column context menu and insert column right", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert right" }).click();
      await expect(page.getByRole("cell").nth(1)).toContainText("test");
    });

    test("should open column context menu and insert column left", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert left" }).click();
      await expect(page.getByRole("cell").nth(2)).toContainText("test");
    });

    test("should open column context menu and insert multiples columns on right", async ({ page }) => {
      test.skip(true, "https://github.com/kiegroup/kie-issues/issues/420");

      await page.getByRole("menuitem", { name: "Insert", exact: true }).click();
      await page.getByRole("button", { name: "plus" }).click();
      await page.getByRole("button", { name: "Insert" }).click();
      await expect(page.getByRole("cell").nth(1)).toContainText("test");
      await expect(page.getByRole("cell")).toHaveCount(5);
    });

    test("should open column context menu and insert multiples columns on left", async ({ page }) => {
      test.skip(true, "https://github.com/kiegroup/kie-issues/issues/420");

      await page.getByRole("menuitem", { name: "Insert", exact: true }).click();
      await page.getByRole("button", { name: "minus" }).click();
      await page.getByLabel("Left").click();
      await page.getByRole("button", { name: "Insert" }).click();
      await expect(page.getByRole("cell").nth(2)).toContainText("test");
      await expect(page.getByRole("cell")).toHaveCount(3);
    });

    test("should open column context menu and delete column", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert left" }).click();
      await expect(page.getByRole("cell").nth(2)).toContainText("test");

      await page.getByTestId("expression-container").getByText("column-2").click({
        button: "right",
      });
      await page.getByRole("menuitem", { name: "Delete" }).click();
      await expect(page.getByRole("cell").nth(1)).toContainText("test");
      await expect(page.getByRole("cell")).toHaveCount(2);
    });
  });

  test("should reset insert multiples menu when opening another cell context menu", async ({ expressions, page }) => {
    test.skip(true, "https://github.com/kiegroup/kie-issues/issues/421");
    test.info().annotations.push({
      type: TestAnnotations.REGRESSION,
      description: "https://github.com/kiegroup/kie-issues/issues/421",
    });

    await expressions.openRelationExpression();
    await page.getByTestId("monaco-container").click();
    await page.keyboard.type('"test"');
    await page.keyboard.press("Enter");
    await page.getByTestId("monaco-container").click({ button: "right" });
    await page.getByRole("menuitem", { name: "Insert", exact: true }).first().click();
    await page.getByRole("cell", { name: "1" }).click({ button: "right" });
    await expect(page.getByRole("heading", { name: "ROWS" })).toBeAttached();
    await expect(page.getByRole("heading", { name: "SELECTION" })).toBeAttached();
  });

  test.describe("Add rows/columns by hovering", () => {
    test.beforeEach(async ({ expressions, page }) => {
      await expressions.openRelationExpression();
      await page.getByTestId("monaco-container").click();
      await page.keyboard.type('"test"');
      await page.keyboard.press("Enter");
    });

    test("should add row above by positioning mouse on the index cell upper section", async ({ page }) => {
      await page.getByRole("cell", { name: "1" }).hover({ position: { x: 0, y: 0 } });
      await page.getByRole("cell", { name: "1" }).locator("svg").click();
      await expect(page.getByRole("row", { name: "2" })).toContainText("test");
    });

    test("should add row below by positioning mouse on the index cell lower section", async ({ page }) => {
      await page.getByRole("cell", { name: "1" }).hover();
      await page.getByRole("cell", { name: "1" }).locator("svg").click();
      await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
      await expect(page.getByRole("row", { name: "2" })).toBeAttached();
    });

    test("should add column left by positioning mouse on the header cell left section", async ({ page }) => {
      await page.getByRole("columnheader", { name: "column-1 (<Undefined>)" }).hover({ position: { x: 0, y: 0 } });
      await page.getByRole("row", { name: "column-1 (<Undefined>)" }).locator("svg").click();
      await expect(page.getByRole("columnheader", { name: "column-2 (<Undefined>)" })).toBeAttached();
      await expect(page.getByRole("cell").nth(2)).toContainText("test");
      await expect(page.getByRole("cell")).toHaveCount(3);
    });

    test("should add column right by positioning mouse on the header cell right section", async ({ page }) => {
      await page.getByRole("columnheader", { name: "column-1 (<Undefined>)" }).hover();
      await page.getByRole("row", { name: "column-1 (<Undefined>)" }).locator("svg").click();
      await expect(page.getByRole("columnheader", { name: "column-2 (<Undefined>)" })).toBeAttached();
      await expect(page.getByRole("cell").nth(1)).toContainText("test");
      await expect(page.getByRole("cell")).toHaveCount(3);
    });
  });

  test.describe("Selection context menu", () => {
    test.beforeEach(async ({ expressions, page }) => {
      await expressions.openRelationExpression();
      await page.getByTestId("monaco-container").click();
      await page.keyboard.type('"test"');
      await page.keyboard.press("Enter");
    });

    test.describe(() => {
      test.beforeEach(async ({ browserName }) => {
        test.skip(
          browserName !== "chromium",
          "Playwright Webkit doesn't support clipboard permissions: https://github.com/microsoft/playwright/issues/13037"
        );
      });

      test("should open selection context menu and copy/paste row", async ({ page, clipboard }) => {
        await page.getByTestId("monaco-container").click({ button: "right" });
        await page.getByRole("menuitem", { name: "Copy" }).click();
        await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
        await page.getByTestId("monaco-container").click();
        await page.keyboard.press("Delete");
        await expect(page.getByRole("row", { name: "1" }).nth(1)).not.toContainText("test");
        await clipboard.paste();
        await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
      });

      test("should open selection context menu and cut row", async ({ page, clipboard }) => {
        await page.getByTestId("monaco-container").click({ button: "right" });
        await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
        await page.getByRole("menuitem", { name: "Cut" }).click();
        await expect(page.getByRole("row", { name: "1" }).nth(1)).not.toContainText("test");
        await page.getByTestId("monaco-container").click();
        await clipboard.paste();
        await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
      });

      test("should open selection context menu and paste row", async ({ page, context }) => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
        await page.getByTestId("monaco-container").click({ button: "right" });
        await page.getByRole("menuitem", { name: "Cut" }).click();
        await expect(page.getByRole("row", { name: "1" }).nth(1)).not.toContainText("test");
        await page.getByTestId("monaco-container").click();
        await page.getByTestId("monaco-container").click({ button: "right" });
        await page.getByRole("menuitem", { name: "Paste" }).click();
        await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
      });
    });

    test("should open selection context menu and reset row", async ({ page }) => {
      await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
      await page.getByTestId("monaco-container").click({ button: "right" });
      await page.getByRole("menuitem", { name: "Reset" }).click();
      await expect(page.getByRole("row", { name: "1" }).nth(1)).not.toContainText("test");
    });
  });
});