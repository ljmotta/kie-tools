import * as React from "react";
import { BoxedExpressionEditorBase } from "../../boxedExpressionEditorBase";
import { DmnBuiltInDataType, ExpressionDefinitionLogicType } from "../../../../../src/api";

export function RequiredMonthlyInstallment() {
  return (
    <BoxedExpressionEditorBase
      expressionDefinition={{
        id: "",
        name: "",
        dataType: DmnBuiltInDataType.Undefined,
        logicType: ExpressionDefinitionLogicType.Undefined,
      }}
    />
  );
}