import { test, expect } from "../fixtures/boxedExpression";

test.describe("Context expression", () => {
  test("Check if expression rendered correctly", async ({ boxedExpressionEditor, standaloneExpression, page }) => {
    await standaloneExpression.openContextExpression();
    await expect(page.getByText("Expression Name (Context)")).toBeAttached();
    await expect(page.getByRole("columnheader", { name: "Expression Name (<Undefined>)" })).toBeAttached();
    await expect(page.getByRole("cell", { name: "ContextEntry-1 (<Undefined>)" })).toBeAttached();
    await expect(page.getByRole("cell", { name: "<result>" })).toBeAttached();
    await expect(page.getByText("Select expression")).toHaveCount(2);
    await expect(page.getByRole("columnheader")).toHaveCount(1);
    await expect(page.getByRole("cell")).toHaveCount(4);
    await expect(boxedExpressionEditor.getContainer()).toHaveScreenshot("context-expression.png");
  });
});