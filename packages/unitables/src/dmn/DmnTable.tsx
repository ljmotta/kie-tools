import * as React from "react";
import { AutoTable } from "../core";
import { DmnGrid } from "./DmnGrid";
import { DmnValidator } from "./DmnValidator";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import JSONSchemaBridge from "uniforms-bridge-json-schema";
import { Button } from "@patternfly/react-core/dist/js/components/Button";
import { NotificationSeverity } from "@kie-tooling-core/notifications/dist/api";
import { Bridge } from "uniforms";

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
  setModel: (model: any[]) => void;
}

interface DmnTableProps {
  inputs?: Map<number, Something>;
  results?: Array<DecisionResult[] | undefined>;
}

export function DmnTable(props: DmnTableProps) {
  const [inputLength, setInputLength] = useState<number>(0);

  const onSubmit = useCallback((model: any, setModel: any, index) => {
    setModel((previous: any) => {
      const newModel = previous ? [...previous] : [];
      newModel[index] = model;
      return newModel;
    });
  }, []);

  const inputsTable = useMemo(() => {
    const inputs: ReactNode[] = [];
    props.inputs?.forEach((value, key) => {
      if (key === 0) {
        setInputLength(value.grid.getInputLength());
        inputs.push(<AutoTable grid={value.grid} schema={value.grid.getBridge()} header={true} />);
      } else {
        inputs.push(
          <AutoTable
            grid={value.grid}
            schema={value.grid.getBridge()}
            header={false}
            model={value.model?.[key] ?? {}}
            autosave={true}
            autosaveDelay={500}
            onSubmit={(model: any) => onSubmit(model, value.setModel, key)}
          />
        );
      }
    });
    return inputs;
  }, [props.inputs]);

  const outputTable = useMemo(() => {
    return props.results?.map((result: DecisionResult[] | undefined, index) => {
      return result?.map((e) => {
        return (
          <>
            <div
              style={{
                border: "1px solid",
                backgroundColor: "gray",
                gridColumn: `${inputLength + 1} / span 1`,
                gridRow: `1 / span 2`,
              }}
            >
              {e.decisionName}
            </div>
            <div
              style={{
                border: "1px solid",
                backgroundColor: "gray",
                gridColumn: `${inputLength + 1} / span 1`,
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

  if (true) {
    return (
      <>
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "auto auto" }}>
          {inputsTable}
          {outputTable}
        </div>
      </>
    );
  }

  return <></>;
}
