import * as React from "react";
import {
  BoxedExpressionEditor,
  Clause,
  ContextProps,
  DataType,
  DecisionTableProps,
  ExpressionContainerProps,
  ExpressionProps,
  FunctionProps,
  InvocationProps,
  ListProps,
  LiteralExpressionProps,
  LogicType,
  RelationProps,
} from "@kogito-tooling/boxed-expression-component";
import { useEffect, useMemo, useState } from "react";

interface Props {
  inputs: Clause[];
}

export function BoxedExpressionDmnTable(props: Props) {
  const [selectedExpression, setSelectedExpression] = useState<DecisionTableProps>({
    name: "DMN Runner",
    logicType: LogicType.DecisionTable,
  });
  const [updatedExpression, setUpdatedExpression] = useState(selectedExpression);

  useEffect(() => {
    setSelectedExpression((previous) => {
      return {
        ...previous,
        input: props.inputs,
        output: [],
        annotation: [],
        rules: updatedExpression.rules,
      };
    });
  }, [props.inputs, updatedExpression]);

  //Defining global function that will be available in the Window namespace and used by the BoxedExpressionEditor component
  window.beeApi = {
    broadcastContextExpressionDefinition(definition: ContextProps): void {},
    broadcastFunctionExpressionDefinition(definition: FunctionProps): void {},
    broadcastInvocationExpressionDefinition(definition: InvocationProps): void {},
    broadcastListExpressionDefinition(definition: ListProps): void {},
    broadcastLiteralExpressionDefinition(definition: LiteralExpressionProps): void {},
    broadcastRelationExpressionDefinition(definition: RelationProps): void {},
    resetExpressionDefinition(definition: ExpressionProps): void {},
    broadcastDecisionTableExpressionDefinition: (definition: DecisionTableProps) => setUpdatedExpression(definition),
  };

  return (
    <>
      <BoxedExpressionEditor expressionDefinition={{ selectedExpression }} />
      <div className="updated-json">
        <pre>{JSON.stringify(updatedExpression, null, 2)}</pre>
      </div>
    </>
  );
}
