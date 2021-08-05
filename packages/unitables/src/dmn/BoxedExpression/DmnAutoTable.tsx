import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { DecisionResult, DmnGrid } from "../";
import { AutoRow } from "../../core";
import { createPortal } from "react-dom";
import { context as UniformsContext } from "uniforms";
import { diff } from "deep-object-diff";
import { ErrorBoundary } from "../../common/ErrorBoundary";
import { EmptyState, EmptyStateBody, EmptyStateIcon } from "@patternfly/react-core/dist/js/components/EmptyState";
import { ExclamationIcon } from "@patternfly/react-icons/dist/js/icons/exclamation-icon";
import { Text, TextContent } from "@patternfly/react-core/dist/js/components/Text";
import { I18nWrapped } from "@kie-tooling-core/i18n/dist/react-components";

interface Props {
  schema: any;
  tableData?: any;
  setTableData?: any;
  results?: Array<DecisionResult[] | undefined>;
  formError: boolean;
  setFormError: React.Dispatch<any>;
}

const FORMS_ID = "forms";

// input length is controlled by the table.. so need to export data
// [{ input1 }, { input2 }, ...]

export function DmnAutoTable(props: Props) {
  // const [selectedExpression, setSelectedExpression] = useState<DecisionTableProps>();
  const bridge = useMemo(() => new DmnValidator().getBridge(props.schema ?? {}), [props.schema]);
  const grid = useMemo(() => (bridge ? new DmnGrid(bridge) : undefined), [bridge]);
  const errorBoundaryRef = useRef<ErrorBoundary>(null);

  const onSubmit = useCallback((model: any, index) => {
    props.setTableData((previousTableData: any) => {
      const newTableData = [...previousTableData];
      newTableData[index] = model;
      return newTableData;
    });
  }, []);

  const [inputSize, setInputSize] = useState<number>(1);

  const selectedExpression = useMemo(() => {
    if (grid && props.results) {
      const input = grid.generateBoxedInputs();
      const [outputSet, outputEntries] = grid.generateBoxedOutputs(props.schema ?? {}, props.results);
      const output: Clause[] = Array.from(outputSet.values());

      console.log(`aaaaaa`, input);
      let rules = [];
      for (let i = 0; i < inputSize; i++) {
        const rule: DecisionTableRule = {
          inputEntries: [""],
          outputEntries: (outputEntries?.[i] as string[]) ?? [],
          annotationEntries: [""],
        };
        rule.rowDelegate = ({ children }: any) => (
          <AutoRow
            schema={bridge}
            model={props.tableData[i]}
            autosave={true}
            autosaveDelay={500}
            onSubmit={(model: any) => onSubmit(model, i)}
            placeholder={true}
          >
            <UniformsContext.Consumer>
              {(ctx) => (
                <>
                  {createPortal(
                    <form id={`dmn-auto-form-${i}`} onSubmit={ctx?.onSubmit} />,
                    document.getElementById(FORMS_ID)!
                  )}
                  {children}
                </>
              )}
            </UniformsContext.Consumer>
          </AutoRow>
        );
        rules.push(rule);
      }

      return {
        // ...previousSelectedExpression,
        name: "DMN Runner",
        logicType: LogicType.DecisionTable,
        input,
        output,
        annotation: [],
        rules,
      };
    }
  }, [grid, bridge, onSubmit, props.tableData, props.schema, props.results, inputSize]);

  // const updateExpression = useCallback(
  //   (updatedExpression: DecisionTableProps) => {
  //     if (grid && props.results) {
  //       const input = grid.generateBoxedInputs();
  //       const [outputSet, outputEntries] = grid.generateBoxedOutputs(props.schema ?? {}, props.results);
  //       const output: Clause[] = Array.from(outputSet.values());
  //       setSelectedExpression((previous) => {
  //         console.log(`aaaaaa`, input);
  //         let rules;
  //         if (updatedExpression.rules) {
  //           rules = [...updatedExpression.rules].map((rule: DecisionTableRule, ruleIndex: number) => {
  //             const newRule = { ...rule };
  //             if (!newRule.rowDelegate) {
  //               newRule.rowDelegate = ({ children }: any) => getAutoRow(bridge!, children, ruleIndex);
  //             }
  //             return newRule;
  //           });
  //         } else {
  //           if (previous?.rules) {
  //             rules = [...previous.rules].map((rule: DecisionTableRule, ruleIndex: number) => {
  //               const newRule = { ...rule };
  //               newRule.rowDelegate = ({ children }: any) => getAutoRow(bridge!, children, ruleIndex);
  //               newRule.outputEntries = (outputEntries[ruleIndex] as string[]) ?? rule.outputEntries;
  //               return newRule;
  //             });
  //           } else {
  //             const rule: DecisionTableRule = { inputEntries: [], outputEntries: [], annotationEntries: [] };
  //             rule.rowDelegate = ({ children }: any) => getAutoRow(bridge!, children, 0);
  //             rules = [rule];
  //           }
  //         }
  //
  //         const inputDiff = diff(
  //           input.map((i) => ({ ...i, cellDelegate: undefined })),
  //           previous?.input?.map((i) => ({ ...i, cellDelegate: undefined })) ?? {}
  //         );
  //         const rulesDiff = diff(
  //           rules.map((r) => ({ ...r, rowDelegate: undefined })),
  //           previous?.rules?.map((r) => ({ ...r, rowDelegate: undefined })) ?? {}
  //         );
  //         const outputDiff = diff(output, previous?.output ?? []);
  //         if (
  //           Object.keys(inputDiff).length === 0 &&
  //           Object.keys(rulesDiff).length === 0 &&
  //           Object.keys(outputDiff).length === 0
  //         ) {
  //           return previous;
  //         }
  //
  //         if (!previous) {
  //           return {
  //             ...updatedExpression,
  //             input,
  //             output,
  //             annotation: [],
  //             rules,
  //           };
  //         }
  //         return {
  //           ...previous,
  //           input,
  //           output,
  //           annotation: [],
  //           rules,
  //         };
  //       });
  //     }
  //   },
  //   [bridge, grid, props.results, getAutoRow]
  // );

  useEffect(() => {
    errorBoundaryRef.current?.reset();
    // updateExpression({
    //   name: "DMN Runner",
    //   logicType: LogicType.DecisionTable,
    // });
  }, [props.formError]);

  //Defining global function that will be available in the Window namespace and used by the BoxedExpressionEditor component
  window.beeApi = {
    broadcastContextExpressionDefinition(definition: ContextProps): void {},
    broadcastFunctionExpressionDefinition(definition: FunctionProps): void {},
    broadcastInvocationExpressionDefinition(definition: InvocationProps): void {},
    broadcastListExpressionDefinition(definition: ListProps): void {},
    broadcastLiteralExpressionDefinition(definition: LiteralExpressionProps): void {},
    broadcastRelationExpressionDefinition(definition: RelationProps): void {},
    resetExpressionDefinition(definition: ExpressionProps): void {},
    broadcastDecisionTableExpressionDefinition: (definition: DecisionTableProps) =>
      setInputSize(definition?.rules?.length ?? 1),
  };

  const formErrorMessage = useMemo(
    () => (
      <div>
        <EmptyState>
          <EmptyStateIcon icon={ExclamationIcon} />
          <TextContent>
            <Text component={"h2"}>Error</Text>
          </TextContent>
          <EmptyStateBody>
            <p>something happened</p>
          </EmptyStateBody>
        </EmptyState>
      </div>
    ),
    []
  );

  // Resets the ErrorBoundary everytime the FormSchema is updated
  useEffect(() => {
    errorBoundaryRef.current?.reset();
  }, [bridge]);

  return (
    <>
      {bridge && selectedExpression && (
        <ErrorBoundary ref={errorBoundaryRef} setHasError={props.setFormError} error={formErrorMessage}>
          <BoxedExpressionEditor expressionDefinition={{ selectedExpression }} />
        </ErrorBoundary>
      )}
      <div id={FORMS_ID} />
    </>
  );
}
