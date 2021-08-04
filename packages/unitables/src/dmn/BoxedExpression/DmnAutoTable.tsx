import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BoxedExpressionEditor,
  Clause,
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
import { DmnTableJsonSchemaBridge } from "../DmnTableJsonSchemaBridge";
import { DmnValidator } from "../DmnValidator";
import { DecisionResult, DmnGrid } from "../../";
import { AutoRow } from "../../core";
import { createPortal } from "react-dom";
import { context as UniformsContext } from "uniforms";
import { diff } from "deep-object-diff";

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
  const grid = useMemo(() => (bridge ? new DmnGrid(bridge) : undefined), [bridge]);

  useEffect(() => {
    if (props.results && grid && props.schema) {
      const [outputSet, outputEntries] = grid.generateBoxedOutputs(props.schema, props.results);
      if (!selectedExpression) {
        return;
      }

      const output: Clause[] = Array.from(outputSet.values());
      setSelectedExpression((previous: DecisionTableProps) => {
        if (!previous.rules) {
          return { ...previous, output };
        }

        const rules = outputEntries
          ? [...previous.rules].map((rule, ruleIndex) => {
              rule.outputEntries = (outputEntries[ruleIndex] as string[]) ?? [""];
              return rule;
            })
          : [...previous.rules];
        return {
          ...previous,
          output,
          rules,
        };
      });
    }
  }, [grid, bridge, props.results, props.schema]);

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

  const getAutoRow = useCallback(
    (bridge: DmnTableJsonSchemaBridge, children: any, ruleIndex: number) => {
      return (
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
    },
    [props.tableData, onSubmit]
  );

  const updateExpression = useCallback(
    (updatedExpression: DecisionTableProps) => {
      if (bridge && grid) {
        const input = grid.generateBoxedInputs();

        setSelectedExpression((previous) => {
          let rules = [];
          if (updatedExpression.rules) {
            rules = updatedExpression.rules.map((rule: DecisionTableRule, ruleIndex: number) => {
              if (!rule.rowDelegate) {
                rule.rowDelegate = ({ children }: any) => getAutoRow(bridge, children, ruleIndex);
              }
              return rule;
            });
          } else {
            if (previous?.rules) {
              rules = previous.rules.map((rule: DecisionTableRule, ruleIndex: number) => {
                rule.rowDelegate = ({ children }: any) => getAutoRow(bridge, children, ruleIndex);
                return rule;
              });
            } else {
              const rule: DecisionTableRule = { inputEntries: [""], outputEntries: [""], annotationEntries: [""] };
              rule.rowDelegate = ({ children }: any) => getAutoRow(bridge, children, 0);
              rules = [rule];
            }
          }

          const inputDiff = diff(
            input.map((i) => ({ ...i, cellDelegate: undefined })),
            previous?.input?.map((i) => ({ ...i, cellDelegate: undefined })) ?? {}
          );
          const rulesDiff = diff(
            rules.map((r) => ({ ...r, rowDelegate: undefined })),
            previous?.rules?.map((r) => ({ ...r, rowDelegate: undefined })) ?? {}
          );
          if (Object.keys(inputDiff).length === 0 && Object.keys(rulesDiff).length === 0) {
            return previous;
          }

          if (!previous) {
            return {
              ...updatedExpression,
              input,
              annotation: [],
              rules: rules,
            };
          }
          return {
            ...previous,
            input,
            annotation: [],
            rules: rules,
          };
        });
      }
    },
    [bridge, grid, getAutoRow]
  );

  useEffect(() => {
    updateExpression({
      name: "DMN Runner",
      logicType: LogicType.DecisionTable,
    });
  }, [updateExpression]);

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
