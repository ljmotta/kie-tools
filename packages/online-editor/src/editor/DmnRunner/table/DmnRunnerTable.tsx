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
  const [formDatas, setFormData] = useState<any[]>();

  const updateDmnRunnerResults = useCallback(
    (formDatas: any[]) => {
      if (!props.editor?.isReady || dmnRunner.status !== DmnRunnerStatus.RUNNING) {
        return;
      }

      setDmnRunnerResults(() => {
        const results: Array<DecisionResult[] | undefined> = [];
        formDatas.forEach((formData, index) => {
          // header
          if (index === 0) {
            return;
          }
          props.editor
            .getContent()
            .then((content: any) => {
              dmnRunner.service.result({ context: formData, model: content })?.then((result) => {
                if (Object.hasOwnProperty.call(result, "details") && Object.hasOwnProperty.call(result, "stack")) {
                  dmnRunner.setFormError(true);
                  return;
                }

                results[index] = result?.decisionResults;
              });
            })
            .catch(() => {
              results[index] = undefined;
            });
        });
        return results;
      });
    },
    [props.editor, dmnRunner.status, dmnRunner.service]
  );

  useEffect(() => {
    if (formDatas) {
      updateDmnRunnerResults(formDatas);
    }
  }, [formDatas, updateDmnRunnerResults]);

  useEffect(() => {
    setBridge(validator.getBridge(dmnRunner.formSchema ?? {}));
  }, [dmnRunner.formSchema, validator]);

  useEffect(() => {
    setDmnRunnerInputs(() => {
      const newInputs = new Map<number, Something>();
      if (bridge) {
        // header
        const grid = new DmnGrid(bridge);
        newInputs.set(0, { grid, model: formDatas, setModel: setFormData });

        // inputs
        for (let i = 1; i <= inputSize; i++) {
          const grid = new DmnGrid(bridge, i);
          newInputs.set(i, { grid, model: formDatas, setModel: setFormData });
        }
      }
      return newInputs;
    });
  }, [inputSize, bridge]);

  useEffect(() => {
    console.log("formDatas", formDatas);
    console.log("results", dmnRunnerResults);
  }, [formDatas, dmnRunnerResults]);

  return (
    <>
      <DmnTable inputs={dmnRunnerInputs} results={dmnRunnerResults} />
      <Button onClick={() => setInputSize(inputSize + 1)}>Add input</Button>
    </>
  );
}
