/// <reference types="Cypress" />
import * as buildEnv from "@kogito-tooling/build-env";

describe("Literal Expression Tests", () => {
  beforeEach(() => {
    cy.visit(`http://localhost:${buildEnv.boxedExpressionComponent.dev.port}/`);
  });

  it("Change data type", () => {
    // Entry point for each new expression
    cy.ouiaId("expression-container").click();

    // Define new expression as Literal Expression
    cy.ouiaId("expression-popover-menu").contains("Literal expression").click({ force: true });

    // Change return type to boolean
    cy.get(".literal-expression-header").click();

    cy.ouiaId("edit-expression-data-type").within(($container) => {
      cy.get("input").click({ force: true });
    });

    cy.get("button:contains('boolean')").click({ force: true });

    // check boolean is now also in grid
    cy.get(".expression-data-type").contains("boolean").should("be.visible");
  });
});
