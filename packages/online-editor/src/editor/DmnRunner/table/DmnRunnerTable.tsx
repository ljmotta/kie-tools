import { useDmnRunner } from "../DmnRunnerContext";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { diff } from "deep-object-diff";
import { DmnRunnerStatus } from "../DmnRunnerStatus";
import { AutoTable, DmnGrid, DmnValidator } from "@kogito-tooling/unitables";
import JSONSchemaBridge from "uniforms-bridge-json-schema";
import { DecisionResult } from "../DmnRunnerService";
import { DmnTable } from "@kogito-tooling/unitables";
import { Button } from "@patternfly/react-core/dist/js/components/Button";
import { Something } from "@kogito-tooling/unitables";

interface Props {
  editor: any;
}

export function DmnRunnerTable(props: Props) {
  const dmnRunner = useDmnRunner();
  const [dmnRunnerResults, setDmnRunnerResults] = useState<Array<DecisionResult[] | undefined>>();
  const validator = useMemo(() => new DmnValidator(), []);
  const [bridge, setBridge] = useState<JSONSchemaBridge>();
  const [inputSize, setInputSize] = useState<number>(1);
  const [dmnRunnerInputs, setDmnRunnerInputs] = useState<Map<number, Something>>(new Map());

  const updateDmnRunnerResults = useCallback(
    async (tableData: any[]) => {
      if (!props.editor?.isReady || dmnRunner.status !== DmnRunnerStatus.RUNNING) {
        return;
      }

      const results = await Promise.all(
        tableData.map(async (formData, index) => {
          try {
            // header
            if (index === 0) {
              return undefined;
            }
            const content = await props.editor.getContent();
            const result = await dmnRunner.service.result({ context: formData, model: content });
            if (Object.hasOwnProperty.call(result, "details") && Object.hasOwnProperty.call(result, "stack")) {
              dmnRunner.setFormError(true);
              return;
            }
            return result.decisionResults;
          } catch (err) {
            return undefined;
          }
        })
      );

      setDmnRunnerResults(results);
    },
    [props.editor, dmnRunner.status, dmnRunner.service]
  );

  useEffect(() => {
    updateDmnRunnerResults(dmnRunner.tableData);
  }, [dmnRunner.tableData, updateDmnRunnerResults, bridge]);

  useEffect(() => {
    setBridge(validator.getBridge(dmnRunner.formSchema ?? {}));
  }, [dmnRunner.formSchema, validator]);

  useEffect(() => {
    setDmnRunnerInputs(() => {
      const newInputs = new Map<number, Something>();
      if (bridge) {
        // header
        const grid = new DmnGrid(bridge);
        newInputs.set(0, { grid, model: dmnRunner.tableData, setModel: dmnRunner.setTableData });

        // inputs
        for (let i = 1; i <= inputSize; i++) {
          const grid = new DmnGrid(bridge, i);
          newInputs.set(i, { grid, model: dmnRunner.tableData[i], setModel: dmnRunner.setTableData });
        }
      }
      return newInputs;
    });
  }, [inputSize, bridge]);

  useEffect(() => {
    dmnRunner.setTableData((previous) => {
      const updatedTableData = [...previous];
      for (let i = inputSize; i <= inputSize; i++) {
        if (!updatedTableData[i]) {
          updatedTableData[i] = {};
        }
      }
      return updatedTableData;
    });
  }, [inputSize]);

  return (
    <>
      <DmnTable inputs={dmnRunnerInputs} results={dmnRunnerResults} />
      <Button onClick={() => setInputSize(inputSize + 1)}>Add input</Button>
    </>
  );
}
