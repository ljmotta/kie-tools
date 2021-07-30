import * as React from "react";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AutoTable } from "../core";
import { DmnGrid } from "./DmnGrid";
import { NotificationSeverity } from "@kie-tooling-core/notifications/dist/api";
import JSONSchemaBridge from "uniforms-bridge-json-schema";
import { DmnValidator } from "./DmnValidator";
import { BoxedExpressionDmnTable } from "./BoxedExpression";
import { Clause } from "@kogito-tooling/boxed-expression-component";

export enum EvaluationStatus {
  SUCCEEDED = "SUCCEEDED",
  SKIPPED = "SKIPPED",
  FAILED = "FAILED",
}

export interface DecisionResultMessage {
  severity: NotificationSeverity;
  message: string;
  messageType: string;
  sourceId: string;
  level: string;
}

export type Result = boolean | number | null | object | object[] | string;

export interface DecisionResult {
  decisionId: string;
  decisionName: string;
  result: Result;
  messages: DecisionResultMessage[];
  evaluationStatus: EvaluationStatus;
}

export interface DmnResult {
  details?: string;
  stack?: string;
  decisionResults?: DecisionResult[];
  messages: DecisionResultMessage[];
}

export interface Something {
  grid: DmnGrid;
  model?: any[];
  setModel: (model: (previous: any[]) => any[]) => void;
}

interface DmnTableProps {
  schema: any;
  tableData: any[];
  setTableData: any;
  inputSize?: number;
  results?: Array<DecisionResult[] | undefined>;
}

export function DmnTable(props: DmnTableProps) {
  const [inputLength, setInputLength] = useState<number>(0);
  const [bridge, setBridge] = useState<JSONSchemaBridge>();
  const [tableInputs, setTableInputs] = useState<any>();

  const onSubmit = useCallback((model: any, setModel: (model: (previous: any[]) => any[]) => void, index) => {
    setModel((previous: any[]) => {
      const newModel = previous ? [...previous] : [];
      newModel[index] = model;
      return newModel;
    });
  }, []);

  useEffect(() => {
    const validator = new DmnValidator();
    setBridge(validator.getBridge(props.schema ?? {}));
  }, [props.schema]);

  useEffect(() => {
    const newInputs: ReactNode[] = [];

    if (bridge) {
      // header
      const grid = new DmnGrid(bridge);
      setInputLength(grid.getInputLength());
      newInputs.push(<AutoTable grid={grid} schema={bridge} header={true} />);

      // inputs
      for (let i = 1; i <= (props.inputSize ?? 1); i++) {
        const grid = new DmnGrid(bridge, i);
        newInputs.push(
          <AutoTable
            schema={bridge}
            model={props.tableData[i] ?? {}}
            autosave={true}
            autosaveDelay={500}
            onSubmit={(model: any) => onSubmit(model, props.setTableData, i)}
            placeholder={true}
          />
        );
      }
    }
    setTableInputs(newInputs);
  }, [props.tableData, bridge]);

  const tableOutputs = useMemo(() => {
    return props.results?.map((result: DecisionResult[] | undefined, index) => {
      return result?.map((e, jndex) => {
        return (
          <>
            <div
              style={{
                border: "1px solid",
                backgroundColor: "gray",
                gridColumn: `${inputLength + 1 + jndex} / span 1`,
                gridRow: `1 / span 2`,
              }}
            >
              {e.decisionName}
            </div>
            <div
              style={{
                border: "1px solid",
                backgroundColor: "gray",
                gridColumn: `${inputLength + 1 + jndex} / span 1`,
                gridRow: `${2 + index} / span 1`,
              }}
            >
              {e.result}
            </div>
          </>
        );
      });
    });
  }, [props.results]);

  return (
    <>
      <div style={{ width: "100%", display: "grid", gridTemplateColumns: "auto auto" }}>
        <BoxedExpressionDmnTable schema={props.schema} />

        {/*{tableOutputs}*/}
      </div>
    </>
  );
}
