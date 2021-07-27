import * as React from "react";
import {
  BoxedExpressionEditor,
  ExpressionProps,
  DataType,
  ExpressionContainerProps,
} from "@kogito-tooling/boxed-expression-component";

export function BoxedExpressionDmnTable() {
  const selectedExpression: ExpressionProps = {
    name: "Expression Name",
    dataType: DataType.Undefined,
  };

  const expressionDefinition: ExpressionContainerProps = { selectedExpression };
  return (
    <>
      <BoxedExpressionEditor expressionDefinition={expressionDefinition} />
    </>
  );
}
