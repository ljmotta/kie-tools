import { useDmnRunner } from "../DmnRunnerContext";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { diff } from "deep-object-diff";
import { DmnRunnerStatus } from "../DmnRunnerStatus";
import { DecisionResult } from "../DmnRunnerService";
import { DmnAutoTable } from "@kogito-tooling/unitables";

interface Props {
  editor: any;
}

function usePrevious(value: any) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export function DmnRunnerTable(props: Props) {
  const dmnRunner = useDmnRunner();
  const [dmnRunnerResults, setDmnRunnerResults] = useState<Array<DecisionResult[] | undefined>>();
  const [inputSize, setInputSize] = useState<number>(1);

  const updateDmnRunnerResults = useCallback(
    async (tableData: any[]) => {
      if (!props.editor?.isReady || dmnRunner.status !== DmnRunnerStatus.RUNNING) {
        return;
      }

      const results = await Promise.all(
        tableData.map(async (formData, index) => {
          try {
            // header/
            if (Object.keys(formData).length === 0) {
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
  }, [dmnRunner.tableData, updateDmnRunnerResults]);

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

  const previousFormSchema: any = usePrevious(dmnRunner.formSchema);
  useEffect(() => {
    dmnRunner.setTableData((previousTableData) => {
      const newTableData = [...previousTableData];
      const propertiesDifference = diff(
        previousFormSchema?.definitions?.InputSet?.properties ?? {},
        dmnRunner.formSchema?.definitions?.InputSet?.properties ?? {}
      );
      return newTableData.map((tableData) => {
        return Object.entries(propertiesDifference).reduce(
          (form, [property, value]) => {
            if (Object.keys(form).length === 0) {
              return form;
            }
            if (!value || value.type || value.$ref) {
              delete (form as any)[property];
            }
            if (value?.["x-dmn-type"]) {
              (form as any)[property] = undefined;
            }
            return form;
          },
          { ...tableData }
        );
      });
    });
  }, [dmnRunner.formSchema, inputSize]);

  return (
    <>
      <DmnAutoTable
        schema={dmnRunner.formSchema}
        tableData={dmnRunner.tableData}
        setTableData={dmnRunner.setTableData}
        // results={dmnRunnerResults}
      />
    </>
  );
}
