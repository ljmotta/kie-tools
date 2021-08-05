/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import groupBy from "lodash/groupBy";
import find from "lodash/find";
import * as React from "react";
import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ColumnInstance, DataRecord } from "react-table";
import {
  Annotation,
  BuiltinAggregation,
  Clause,
  DataType,
  DecisionTableProps,
  DecisionTableRule,
  GroupOperations,
  HitPolicy,
  LogicType,
  TableHeaderVisibility,
  TableOperation,
} from "../../api";
import { BoxedExpressionGlobalContext } from "../../context";
import { useBoxedExpressionEditorI18n } from "../../i18n";
import { hashfy } from "../Resizer";
import { getColumnsAtLastLevel, Table } from "../Table";
import "./DecisionTableExpression.css";
import { HitPolicySelector } from "./HitPolicySelector";
import { diff } from "deep-object-diff";

enum DecisionTableColumnType {
  InputClause = "input",
  OutputClause = "output",
  Annotation = "annotation",
}

const DASH_SYMBOL = "-";
const EMPTY_SYMBOL = "";
const DECISION_NODE_DEFAULT_NAME = "output-1";

export const DecisionTableExpression: React.FunctionComponent<DecisionTableProps> = ({
  uid,
  isHeadless,
  onUpdatingRecursiveExpression,
  name = DECISION_NODE_DEFAULT_NAME,
  dataType = DataType.Undefined,
  onUpdatingNameAndDataType,
  hitPolicy = HitPolicy.Unique,
  aggregation = BuiltinAggregation["<None>"],
  input,
  output,
  annotations,
  rules,
}) => {
  const { i18n } = useBoxedExpressionEditorI18n();

  const getColumnPrefix = useCallback((groupType?: string) => {
    switch (groupType) {
      case DecisionTableColumnType.InputClause:
        return "input-";
      case DecisionTableColumnType.OutputClause:
        return "output-";
      case DecisionTableColumnType.Annotation:
        return "annotation-";
      default:
        return "column-";
    }
  }, []);

  const generateHandlerConfigurationByColumn = useCallback(
    (groupName: string) => [
      {
        group: groupName,
        items: [
          { name: i18n.columnOperations.insertLeft, type: TableOperation.ColumnInsertLeft },
          { name: i18n.columnOperations.insertRight, type: TableOperation.ColumnInsertRight },
          { name: i18n.columnOperations.delete, type: TableOperation.ColumnDelete },
        ],
      },
      {
        group: i18n.decisionRule,
        items: [
          { name: i18n.rowOperations.insertAbove, type: TableOperation.RowInsertAbove },
          { name: i18n.rowOperations.insertBelow, type: TableOperation.RowInsertBelow },
          { name: i18n.rowOperations.delete, type: TableOperation.RowDelete },
          { name: i18n.rowOperations.duplicate, type: TableOperation.RowDuplicate },
        ],
      },
    ],
    [i18n]
  );

  const { setSupervisorHash } = useContext(BoxedExpressionGlobalContext);

  const getHandlerConfiguration = useMemo(() => {
    const configuration: { [columnGroupType: string]: GroupOperations[] } = {};
    configuration[EMPTY_SYMBOL] = generateHandlerConfigurationByColumn(i18n.ruleAnnotation);
    configuration[DecisionTableColumnType.InputClause] = generateHandlerConfigurationByColumn(i18n.inputClause);
    configuration[DecisionTableColumnType.OutputClause] = generateHandlerConfigurationByColumn(i18n.outputClause);
    configuration[DecisionTableColumnType.Annotation] = generateHandlerConfigurationByColumn(i18n.ruleAnnotation);
    return configuration;
  }, [generateHandlerConfigurationByColumn, i18n.inputClause, i18n.outputClause, i18n.ruleAnnotation]);

  const getEditColumnLabel = useMemo(() => {
    const editColumnLabel: { [columnGroupType: string]: string } = {};
    editColumnLabel[DecisionTableColumnType.InputClause] = i18n.editClause.input;
    editColumnLabel[DecisionTableColumnType.OutputClause] = i18n.editClause.output;
    return editColumnLabel;
  }, [i18n.editClause.input, i18n.editClause.output]);

  const [selectedHitPolicy, setSelectedHitPolicy] = useState(hitPolicy);
  const [selectedAggregation, setSelectedAggregation] = useState(aggregation);

  const onHitPolicySelect = useCallback((itemId: string) => setSelectedHitPolicy(itemId as HitPolicy), []);

  const onBuiltInAggregatorSelect = useCallback(
    (itemId) => setSelectedAggregation((BuiltinAggregation as never)[itemId]),
    []
  );

  const decisionName = useRef(name);
  const decisionDataType = useRef(dataType);
  const singleOutputChildDataType = useRef(DataType.Undefined);

  // // update columns
  // const updateColumns = useCallback(
  //   (updatedInput: Clause[], updatedOutput: Clause[], updatedAnnotation: Annotation[]): ColumnInstance[] => {
  //     const inputColumns = (updatedInput ?? []).map(
  //       (inputClause) =>
  //         ({
  //           label: inputClause.name,
  //           accessor: inputClause.name,
  //           dataType: inputClause.dataType,
  //           width: inputClause.width,
  //           groupType: DecisionTableColumnType.InputClause,
  //           cssClasses: "decision-table--input",
  //           cellDelegate: inputClause.cellDelegate,
  //         } as any)
  //     );
  //     const outputColumns = (updatedOutput ?? []).map(
  //       (outputClause) =>
  //         ({
  //           label: outputClause.name,
  //           accessor: outputClause.name,
  //           dataType: outputClause.dataType,
  //           width: outputClause.width,
  //           groupType: DecisionTableColumnType.OutputClause,
  //           cssClasses: "decision-table--output",
  //         } as ColumnInstance)
  //     );
  //     const annotationColumns = (updatedAnnotation ?? []).map(
  //       (annotation) =>
  //         ({
  //           label: annotation.name,
  //           accessor: annotation.name,
  //           width: annotation.width,
  //           inlineEditable: true,
  //           groupType: DecisionTableColumnType.Annotation,
  //           cssClasses: "decision-table--annotation",
  //         } as ColumnInstance)
  //     );
  //
  //     const inputSection = {
  //       groupType: DecisionTableColumnType.InputClause,
  //       label: "Input",
  //       accessor: "Input",
  //       cssClasses: "decision-table--input",
  //       columns: inputColumns,
  //     };
  //     const outputSection = {
  //       groupType: DecisionTableColumnType.OutputClause,
  //       label: decisionName.current,
  //       accessor: decisionName.current,
  //       dataType: decisionDataType.current,
  //       cssClasses: "decision-table--output",
  //       columns: outputColumns,
  //       appendColumnsOnChildren: true,
  //     };
  //     const annotationSection = {
  //       groupType: DecisionTableColumnType.Annotation,
  //       label: "Annotations",
  //       accessor: "Annotations",
  //       cssClasses: "decision-table--annotation",
  //       columns: annotationColumns,
  //       inlineEditable: true,
  //     };
  //
  //     return [inputSection, outputSection, annotationSection] as ColumnInstance[];
  //   },
  //   []
  // );
  //
  // // update rows
  // const updateRows = useCallback((rules: DecisionTableRule[], columns: ColumnInstance[]): DataRecord[] => {
  //   return rules.map((rule) => {
  //     const rowArray = [...rule.inputEntries, ...rule.outputEntries, ...rule.annotationEntries];
  //     return getColumnsAtLastLevel(columns).reduce((tableRow: any, column, columnIndex: number) => {
  //       tableRow[column.accessor] = rowArray[columnIndex] || EMPTY_SYMBOL;
  //       tableRow.rowDelegate = rule.rowDelegate;
  //       return tableRow;
  //     }, {});
  //   });
  // }, []);

  const spreadDecisionTableExpressionDefinition = useCallback(
    (columns: ColumnInstance[], rows: DataRecord[]) => {
      const groupedColumns = groupBy(getColumnsAtLastLevel(columns), (column) => column.groupType);
      const newInput: Clause[] = (groupedColumns[DecisionTableColumnType.InputClause] ?? []).map((inputClause) => ({
        name: inputClause.accessor,
        dataType: inputClause.dataType,
        width: inputClause.width,
        cellDelegate: (inputClause as any)?.cellDelegate,
      }));
      const newOutput: Clause[] = (groupedColumns[DecisionTableColumnType.OutputClause] ?? []).map((outputClause) => ({
        name: outputClause.accessor,
        dataType: outputClause.dataType,
        width: outputClause.width,
      }));
      const newAnnotations: Annotation[] = (groupedColumns[DecisionTableColumnType.Annotation] ?? []).map(
        (annotation) => ({
          name: annotation.accessor,
          width: annotation.width,
        })
      );
      const newRules: DecisionTableRule[] = rows.map((row: DataRecord) => ({
        inputEntries: newInput.map((inputClause) => row[inputClause.name] as string),
        outputEntries: newOutput.map((outputClause) => row[outputClause.name] as string),
        annotationEntries: newAnnotations.map((annotation) => row[annotation.name] as string),
        rowDelegate: row.rowDelegate as any,
      }));

      const expressionDefinition: DecisionTableProps = {
        uid,
        logicType: LogicType.DecisionTable,
        name: decisionName.current,
        dataType: decisionDataType.current,
        hitPolicy: selectedHitPolicy,
        aggregation: selectedAggregation,
        rules: newRules,
      };

      if (isHeadless) {
        onUpdatingRecursiveExpression?.(expressionDefinition);
      } else {
        setSupervisorHash(hashfy(expressionDefinition));
        window.beeApi?.broadcastDecisionTableExpressionDefinition?.(expressionDefinition);
      }
    },
    [isHeadless, onUpdatingRecursiveExpression, selectedAggregation, selectedHitPolicy, setSupervisorHash, uid]
  );

  const synchronizeDecisionNodeDataTypeWithSingleOutputColumnDataType = useCallback(
    (decisionNodeColumn: ColumnInstance) => {
      if (decisionNodeColumn.columns?.length === 1) {
        const updatedSingleOutputChildDataType = decisionNodeColumn.columns[0].dataType;

        if (updatedSingleOutputChildDataType !== singleOutputChildDataType.current) {
          singleOutputChildDataType.current = updatedSingleOutputChildDataType;
          decisionNodeColumn.dataType = updatedSingleOutputChildDataType;
        } else if (decisionNodeColumn.dataType !== decisionDataType.current) {
          singleOutputChildDataType.current = decisionNodeColumn.dataType;
          decisionNodeColumn.columns[0].dataType = decisionNodeColumn.dataType;
        }
      }
    },
    []
  );

  const memoColumns = useMemo(() => {
    const inputColumns = (input ?? []).map(
      (inputClause) =>
        ({
          label: inputClause.name,
          accessor: inputClause.name,
          dataType: inputClause.dataType,
          width: inputClause.width,
          groupType: DecisionTableColumnType.InputClause,
          cssClasses: "decision-table--input",
          cellDelegate: inputClause.cellDelegate,
        } as any)
    );
    const outputColumns = (output ?? []).map(
      (outputClause) =>
        ({
          label: outputClause.name,
          accessor: outputClause.name,
          dataType: outputClause.dataType,
          width: outputClause.width,
          groupType: DecisionTableColumnType.OutputClause,
          cssClasses: "decision-table--output",
        } as ColumnInstance)
    );
    const annotationColumns = (annotations ?? []).map(
      (annotation) =>
        ({
          label: annotation.name,
          accessor: annotation.name,
          width: annotation.width,
          inlineEditable: true,
          groupType: DecisionTableColumnType.Annotation,
          cssClasses: "decision-table--annotation",
        } as ColumnInstance)
    );

    const inputSection = {
      groupType: DecisionTableColumnType.InputClause,
      label: "Input",
      accessor: "Input",
      cssClasses: "decision-table--input",
      columns: inputColumns,
    };
    const outputSection = {
      groupType: DecisionTableColumnType.OutputClause,
      label: decisionName.current,
      accessor: decisionName.current,
      dataType: decisionDataType.current,
      cssClasses: "decision-table--output",
      columns: outputColumns,
      appendColumnsOnChildren: true,
    };
    const annotationSection = {
      groupType: DecisionTableColumnType.Annotation,
      label: "Annotations",
      accessor: "Annotations",
      cssClasses: "decision-table--annotation",
      columns: annotationColumns,
      inlineEditable: true,
    };

    return [inputSection, outputSection, annotationSection] as ColumnInstance[];
  }, [input, output, annotations]);

  const memoRows = useMemo(() => {
    return (rules ?? []).map((rule) => {
      const rowArray = [...rule.inputEntries, ...rule.outputEntries, ...rule.annotationEntries];
      return getColumnsAtLastLevel(memoColumns).reduce((tableRow: any, column, columnIndex: number) => {
        tableRow[column.accessor] = rowArray[columnIndex] || EMPTY_SYMBOL;
        tableRow.rowDelegate = rule.rowDelegate;
        return tableRow;
      }, {});
    });
  }, [rules]);

  const onColumnsUpdate = useCallback(
    (updatedColumns) => {
      const decisionNodeColumn = find(updatedColumns, { groupType: DecisionTableColumnType.OutputClause });

      synchronizeDecisionNodeDataTypeWithSingleOutputColumnDataType(decisionNodeColumn);

      // setColumns([...updatedColumns]);
      decisionName.current = decisionNodeColumn.label;
      decisionDataType.current = decisionNodeColumn.dataType;
      onUpdatingNameAndDataType?.(decisionNodeColumn.label, decisionNodeColumn.dataType);
      spreadDecisionTableExpressionDefinition([...updatedColumns], memoRows);
    },
    [
      onUpdatingNameAndDataType,
      spreadDecisionTableExpressionDefinition,
      synchronizeDecisionNodeDataTypeWithSingleOutputColumnDataType,
      memoRows,
    ]
  );

  const onRowsUpdate = useCallback(
    (updatedRows) => {
      const newRows = updatedRows.map((row: any) =>
        getColumnsAtLastLevel(memoColumns).reduce((filledRow: DataRecord, column: ColumnInstance) => {
          if (row.rowDelegate) {
            filledRow[column.accessor] = row[column.accessor];
            filledRow.rowDelegate = row.rowDelegate;
          } else if (row[column.accessor] === null || row[column.accessor] === undefined) {
            filledRow[column.accessor] =
              column.groupType === DecisionTableColumnType.InputClause ? DASH_SYMBOL : EMPTY_SYMBOL;
          } else {
            filledRow[column.accessor] = row[column.accessor];
          }
          return filledRow;
        }, {})
      );
      spreadDecisionTableExpressionDefinition(memoColumns, newRows);
    },
    [spreadDecisionTableExpressionDefinition, memoColumns]
  );

  const onRowAdding = useCallback(() => {
    return getColumnsAtLastLevel(memoColumns).reduce((tableRow: DataRecord, column: ColumnInstance) => {
      tableRow[column.accessor] = EMPTY_SYMBOL;
      return tableRow;
    }, {} as DataRecord);
  }, [memoColumns]);

  return (
    <div className={`decision-table-expression ${uid}`}>
      <Table
        headerLevels={1}
        headerVisibility={TableHeaderVisibility.Full}
        getColumnPrefix={getColumnPrefix}
        editColumnLabel={getEditColumnLabel}
        handlerConfiguration={getHandlerConfiguration}
        columns={memoColumns}
        rows={memoRows}
        onColumnsUpdate={onColumnsUpdate}
        onRowsUpdate={onRowsUpdate}
        onRowAdding={onRowAdding}
        controllerCell={
          <HitPolicySelector
            selectedHitPolicy={selectedHitPolicy}
            selectedBuiltInAggregator={selectedAggregation}
            onHitPolicySelect={onHitPolicySelect}
            onBuiltInAggregatorSelect={onBuiltInAggregatorSelect}
          />
        }
      />
    </div>
  );
};
