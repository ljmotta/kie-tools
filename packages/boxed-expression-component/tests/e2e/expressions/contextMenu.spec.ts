import { test, expect } from "../fixtures/boxedExpression";

test.describe("Expression context menu", () => {
  test.beforeEach(async ({ boxedExpressionEditor, browserName }) => {
    test.skip(
      browserName !== "chromium",
      "Playwright Webkit doesn't support clipboard permissions: https://github.com/microsoft/playwright/issues/13037"
    );

    await boxedExpressionEditor.goto();
    await boxedExpressionEditor.selectLiteralExpression();
  });

  test("should reset expression", async ({ page }) => {
    await page.getByTestId("logic-type-button-test-id").click();
    await page.getByRole("menuitem", { name: "Reset" }).click();
    await expect(page.getByText("Expression Name (<Undefined>)")).toBeAttached();
    await expect(page.getByText("Select expression")).toBeAttached();
  });

  test("should copy, reset and paste expression", async ({ page, clipboard }) => {
    await page.getByTestId("logic-type-button-test-id").click();
    clipboard.use();
    await page.getByRole("menuitem", { name: "copy" }).click();
    await page.getByTestId("logic-type-button-test-id").click();
    await page.getByRole("menuitem", { name: "Reset" }).click();
    await expect(page.getByText("Expression Name (Literal)")).not.toBeAttached();
    await page.getByText("Select expression").click();
    await page.getByRole("menuitem", { name: "Paste" }).click();
    await expect(page.getByText("Expression Name (Literal)")).toBeAttached();
  });

  test("should cut and paste expression", async ({ page, clipboard }) => {
    await page.getByTestId("logic-type-button-test-id").click();
    clipboard.use();
    await page.getByRole("menuitem", { name: "cut" }).click();
    await expect(page.getByText("Expression Name (Literal)")).not.toBeAttached();
    await page.getByText("Select expression").click();
    await page.getByRole("menuitem", { name: "Paste" }).click();
    await expect(page.getByText("Expression Name (Literal)")).toBeAttached();
  });
});