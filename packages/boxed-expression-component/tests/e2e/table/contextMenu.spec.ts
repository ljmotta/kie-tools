import { webkit } from "@playwright/test";
import { test, expect } from "../fixtures/boxedExpression";

test.describe("Cell context menu", () => {
  test.describe("Rows control", () => {
    test.beforeEach(async ({ expressions, page }) => {
      await expressions.openRelationExpression();
      await page.getByTestId("monaco-container").click();
      await page.keyboard.type('"test"');
      await page.keyboard.press("Enter");

      test
        .info()
        .annotations.push({ type: "kie-issue", description: "https://github.com/kiegroup/kie-issues/issues/421" });
      // Click on 1 to prevent kie-issues#421;
      await page.getByRole("cell", { name: "1" }).click();
      await page.getByRole("cell", { name: "1" }).click({ button: "right" });
    });

    test("Open row context menu and insert row above", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert above" }).click();
      await expect(page.getByRole("row", { name: "2" })).toContainText("test");
    });

    test("Open row context menu and insert row below", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert below" }).click();
      await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
      await expect(page.getByRole("row", { name: "2" })).toBeAttached();
    });

    test("Open row context menu and insert multiples rows above", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert", exact: true }).click();
      await page.getByRole("button", { name: "plus" }).click();
      await page.getByRole("button", { name: "Insert" }).click();
      await expect(page.getByRole("row", { name: "4" })).toContainText("test");
    });

    test("Open row context menu and insert multiples rows below", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert", exact: true }).click();
      await page.getByRole("button", { name: "minus" }).click();
      await page.getByLabel("Below").click();
      await page.getByRole("button", { name: "Insert" }).click();
      await expect(page.getByRole("row", { name: "2" })).toBeAttached();
    });

    test("Open row context menu and delete row", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert above" }).click();
      await expect(page.getByRole("row", { name: "2" })).toContainText("test");
      await page.getByRole("cell", { name: "1" }).click({ button: "right" });
      await page.getByRole("menuitem", { name: "Delete" }).click();
      await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
    });

    test("Open row context menu and duplicate row", async ({ page }) => {
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

      test
        .info()
        .annotations.push({ type: "kie-issue", description: "https://github.com/kiegroup/kie-issues/issues/421" });
      // Click on 1 to prevent kie-issues#421;
      await page.getByRole("columnheader", { name: "Expression Name (<Undefined>)" }).click();
      await page.getByTestId("expression-container").getByText("Expression Name").click({
        button: "right",
      });
    });

    test("Open column context menu and insert column right", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert right" }).click();
      await expect(page.getByRole("cell").nth(1)).toContainText("test");
    });

    test("Open column context menu and insert column left", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert left" }).click();
      await expect(page.getByRole("cell").nth(2)).toContainText("test");
    });

    test("Open column context menu and insert multiples columns on right", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert", exact: true }).click();
      await page.getByRole("button", { name: "plus" }).click();
      await page.getByRole("button", { name: "Insert" }).click();
      await expect(page.getByRole("cell").nth(1)).toContainText("test");
      await expect(page.getByRole("cell")).toHaveCount(5);
    });

    test("Open column context menu and insert multiples columns on left", async ({ page }) => {
      await page.getByRole("menuitem", { name: "Insert", exact: true }).click();
      await page.getByRole("button", { name: "minus" }).click();
      await page.getByLabel("Left").click();
      await page.getByRole("button", { name: "Insert" }).click();
      await expect(page.getByRole("cell").nth(2)).toContainText("test");
      await expect(page.getByRole("cell")).toHaveCount(3);
    });

    test("Open column context menu and delete column", async ({ expressions, page }) => {
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

  test("Stress test: add multiple columns and rows", async ({ expressions, page }) => {
    await expressions.openRelationExpression();
    await page.getByTestId("monaco-container").click({ button: "right" });
    await page.getByRole("menuitem", { name: "Insert", exact: true }).nth(0).click();
    await page.getByRole("spinbutton", { name: "number input" }).click();
    await page.getByRole("button", { name: "Insert" }).click();
    await page.getByTestId("monaco-container").nth(0).click({ button: "right" });
    await page.getByRole("menuitem", { name: "Insert", exact: true }).nth(1).click();
    await page.getByRole("spinbutton", { name: "number input" }).click();
    await page.getByLabel("Below").click();
    await page.getByRole("button", { name: "Insert" }).click();
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

      test("Open selection context menu and copy/paste row", async ({ page, clipboard }) => {
        await page.getByTestId("monaco-container").click({ button: "right" });
        await page.getByRole("menuitem", { name: "Copy" }).click();
        await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
        await page.getByTestId("monaco-container").click();
        await page.keyboard.press("Delete");
        await expect(page.getByRole("row", { name: "1" }).nth(1)).not.toContainText("test");
        await clipboard.paste();
        await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
      });

      test("Open selection context menu and cut row", async ({ page, clipboard }) => {
        await page.getByTestId("monaco-container").click({ button: "right" });
        await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
        await page.getByRole("menuitem", { name: "Cut" }).click();
        await expect(page.getByRole("row", { name: "1" }).nth(1)).not.toContainText("test");
        await page.getByTestId("monaco-container").click();
        await clipboard.paste();
        await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
      });

      test("Open selection context menu and paste row", async ({ page, context }) => {
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

    test("Open selection context menu and reset row", async ({ page }) => {
      await expect(page.getByRole("row", { name: "1" }).nth(1)).toContainText("test");
      await page.getByTestId("monaco-container").click({ button: "right" });
      await page.getByRole("menuitem", { name: "Reset" }).click();
      await expect(page.getByRole("row", { name: "1" }).nth(1)).not.toContainText("test");
    });
  });
});