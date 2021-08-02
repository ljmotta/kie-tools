import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  BoxedExpressionEditor,
  ContextProps,
  DecisionTableProps,
  DecisionTableRule,
  ExpressionProps,
  FunctionProps,
  InvocationProps,
  ListProps,
  LiteralExpressionProps,
  LogicType,
  RelationProps,
} from "@kogito-tooling/boxed-expression-component";
import { DmnTableJsonSchemaBridge } from "../../../dist/dmn/DmnTableJsonSchemaBridge";
import { DmnValidator } from "../DmnValidator";
import { DecisionResult, DmnGrid } from "../../";
import { AutoRow } from "../../core";
import { createPortal } from "react-dom";
import { context as UniformsContext } from "uniforms";

interface Props {
  schema: any;
  tableData?: any;
  setTableData?: any;
  results?: Array<DecisionResult[] | undefined>;
}

const FORMS_ID = "forms";

// input length is controlled by the table.. so need to export data
// [{ input1 }, { input2 }, ...]

export function DmnAutoTable(props: Props) {
  const [selectedExpression, setSelectedExpression] = useState<DecisionTableProps>();

  const [bridge, setBridge] = useState<DmnTableJsonSchemaBridge>();
  useEffect(() => {
    const validator = new DmnValidator();
    setBridge(validator.getBridge(props.schema ?? {}));
  }, [props.schema]);

  const onSubmit = useCallback((model: any, index) => {
    props.setTableData((previousTableData: any) => {
      const newTableData = [...previousTableData];
      newTableData[index] = model;
      return newTableData;
    });
  }, []);

  useEffect(() => {
    if (bridge) {
      const grid = new DmnGrid(bridge);
      const rules = [
        {
          inputEntries: ["-"],
          outputEntries: [""],
          annotationEntries: [""],
          rowDelegate: ({ children }: any) => {
            return (
              <>
                <AutoRow
                  schema={bridge}
                  header={false}
                  model={props.tableData[0]}
                  autosave={true}
                  autosaveDelay={500}
                  onSubmit={(model: any) => onSubmit(model, 0)}
                  placeholder={true}
                >
                  <UniformsContext.Consumer>
                    {(ctx) => (
                      <>
                        {createPortal(
                          <form id={"myfirstform"} onSubmit={ctx?.onSubmit} />,
                          document.getElementById(FORMS_ID)!
                        )}
                        {children}
                      </>
                    )}
                  </UniformsContext.Consumer>
                </AutoRow>
              </>
            );
          },
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
      // update input length;
      // update rules
      // update what was filled.
      // expose get method?
      if (bridge) {
        setSelectedExpression((previous) => {
          if (!previous) {
            return;
          }
          if (previous.input === selectedExpression?.input) {
            return previous;
          }
          const rules = [...(updatedExpression.rules ?? [])].map((rule: DecisionTableRule, ruleIndex: number) => {
            rule.rowDelegate = ({ children }: any) => (
              <AutoRow
                schema={bridge}
                model={props.tableData[ruleIndex]}
                autosave={true}
                autosaveDelay={500}
                onSubmit={(model: any) => onSubmit(model, ruleIndex)}
                placeholder={true}
              >
                <UniformsContext.Consumer>
                  {(ctx) => (
                    <>
                      {createPortal(
                        <form id={`dmn-auto-form-${ruleIndex}`} onSubmit={ctx?.onSubmit} />,
                        document.getElementById(FORMS_ID)!
                      )}
                      {children}
                    </>
                  )}
                </UniformsContext.Consumer>
              </AutoRow>
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
    [bridge, selectedExpression]
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
        </>
      )}
      <div id={FORMS_ID} />
    </>
  );
}
