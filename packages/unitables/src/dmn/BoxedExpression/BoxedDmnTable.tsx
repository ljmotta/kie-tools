import * as React from "react";
import {
  BoxedExpressionEditor,
  Clause,
  ContextProps,
  DataType,
  DecisionTableProps,
  DecisionTableRule,
  ExpressionContainerProps,
  ExpressionProps,
  FunctionProps,
  InvocationProps,
  ListProps,
  LiteralExpressionProps,
  LogicType,
  RelationProps,
} from "@kogito-tooling/boxed-expression-component";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DmnTableJsonSchemaBridge } from "../../../dist/dmn/DmnTableJsonSchemaBridge";
import { DmnValidator } from "../DmnValidator";
import { DmnGrid } from "../../";
import { AutoTable } from "../../core";

interface Props {
  schema: any;
}

export function BoxedExpressionDmnTable(props: Props) {
  const [selectedExpression, setSelectedExpression] = useState<DecisionTableProps>();

  const [bridge, setBridge] = useState<DmnTableJsonSchemaBridge>();
  useEffect(() => {
    const validator = new DmnValidator();
    setBridge(validator.getBridge(props.schema ?? {}));
  }, [props.schema]);

  useEffect(() => {
    if (bridge) {
      const grid = new DmnGrid(bridge);
      const rules = [
        {
          inputEntries: ["-"],
          outputEntries: [""],
          annotationEntries: [""],
          controller: (
            <AutoTable
              schema={bridge}
              header={false}
              // model={}
              autosave={true}
              autosaveDelay={500}
              // onSubmit={(model: any) => onSubmit(model, props.setTableData, i)}
              placeholder={true}
            />
          ),
        },
      ];

      setSelectedExpression((previous) => ({
        ...previous,
        name: "DMN Runner",
        logicType: LogicType.DecisionTable,
        input: grid.generateBoxedInputs(),
        rules: rules,
      }));
    }
  }, [bridge]);

  const updateExpression = useCallback(
    (updatedExpression: DecisionTableProps) => {
      if (bridge) {
        setSelectedExpression((previous) => {
          if (!previous) {
            return;
          }
          // if (previous.input === selectedExpression.input) {
          //   return previous;
          // }
          const rules = [...(updatedExpression.rules ?? [])].map((rule: DecisionTableRule) => {
            const grid = new DmnGrid(bridge);
            rule.controller = (
              <AutoTable
                schema={bridge}
                // model={}
                autosave={true}
                autosaveDelay={500}
                // onSubmit={(model: any) => onSubmit(model, props.setTableData, i)}
                placeholder={true}
              />
            );
            return rule;
          });
          const grid = new DmnGrid(bridge);
          return {
            ...previous,
            input: grid.generateBoxedInputs(),
            output: [],
            annotation: [],
            rules: rules,
          };
        });
      }
    },
    [bridge]
  );

  //Defining global function that will be available in the Window namespace and used by the BoxedExpressionEditor component
  window.beeApi = {
    broadcastContextExpressionDefinition(definition: ContextProps): void {},
    broadcastFunctionExpressionDefinition(definition: FunctionProps): void {},
    broadcastInvocationExpressionDefinition(definition: InvocationProps): void {},
    broadcastListExpressionDefinition(definition: ListProps): void {},
    broadcastLiteralExpressionDefinition(definition: LiteralExpressionProps): void {},
    broadcastRelationExpressionDefinition(definition: RelationProps): void {},
    resetExpressionDefinition(definition: ExpressionProps): void {},
    broadcastDecisionTableExpressionDefinition: (definition: DecisionTableProps) => updateExpression(definition),
  };

  return (
    <>
      {bridge && selectedExpression && (
        <>
          <BoxedExpressionEditor expressionDefinition={{ selectedExpression }} />
          <div className="updated-json">
            {/*<pre>*/}
            {/*  {JSON.stringify(*/}
            {/*    [...(selectedExpression.rules ?? [])].map((rule) => {*/}
            {/*      delete rule.controller;*/}
            {/*      return rule;*/}
            {/*    }),*/}
            {/*    null,*/}
            {/*    2*/}
            {/*  )}*/}
            {/*</pre>*/}
          </div>
        </>
      )}
    </>
  );
}
