/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import "./ListExpression.css";
import * as React from "react";
import { useCallback, useMemo } from "react";
import {
  ContextExpressionDefinitionEntry,
  DmnBuiltInDataType,
  generateUuid,
  ListExpressionDefinition,
  LiteralExpressionDefinition,
  ExpressionDefinitionLogicType,
  BeeTableRowsUpdateArgs,
  BeeTableOperationHandlerConfig,
  BeeTableHeaderVisibility,
  BeeTableOperation,
  BeeTableProps,
} from "../../api";
import { ContextEntryExpressionCell } from "../ContextExpression";
import { BeeTable } from "../../table/BeeTable";
import { useBoxedExpressionEditorI18n } from "../../i18n";
import * as ReactTable from "react-table";

export const LIST_EXPRESSION_MIN_WIDTH = 430;
type ROWTYPE = any;

export const ListExpression: React.FunctionComponent<ListExpressionDefinition> = (
  listExpression: ListExpressionDefinition
) => {
  const { i18n } = useBoxedExpressionEditorI18n();

  const generateLiteralExpression: () => LiteralExpressionDefinition = useCallback(
    () => ({
      id: generateUuid(),
      name: "",
      dataType: DmnBuiltInDataType.Undefined,
      logicType: ExpressionDefinitionLogicType.LiteralExpression,
      content: "",
    }),
    []
  );

  const operationHandlerConfig: BeeTableOperationHandlerConfig = useMemo(
    () => [
      {
        group: i18n.rows,
        items: [
          { name: i18n.rowOperations.insertAbove, type: BeeTableOperation.RowInsertAbove },
          { name: i18n.rowOperations.insertBelow, type: BeeTableOperation.RowInsertBelow },
          { name: i18n.rowOperations.delete, type: BeeTableOperation.RowDelete },
          { name: i18n.rowOperations.clear, type: BeeTableOperation.RowClear },
        ],
      },
    ],
    [
      i18n.rowOperations.clear,
      i18n.rowOperations.delete,
      i18n.rowOperations.insertAbove,
      i18n.rowOperations.insertBelow,
      i18n.rows,
    ]
  );

  const beeTableRows = useMemo(() => {
    if (listExpression.items === undefined || listExpression.items?.length === 0) {
      return [{ entryExpression: generateLiteralExpression() }];
    } else {
      return listExpression.items.map((item) => ({ entryExpression: item }));
    }
  }, [listExpression.items, generateLiteralExpression]);

  const setListWidth = useCallback((newInfoWidth) => {}, []);

  const beeTableColumns = useMemo<ReactTable.Column<ROWTYPE>[]>(
    () => [
      {
        accessor: "list",
        label: "",
        dataType: undefined as any,
        isRowIndexColumn: false,
        width: undefined,
      },
    ],
    []
  );

  const onRowsUpdate = useCallback(({ rows }: BeeTableRowsUpdateArgs<ROWTYPE>) => {
    const newEntryExpressions = rows.map((row) => {
      return { entryExpression: row.entryExpression };
    });
  }, []);

  const getRowKey = useCallback((row: ReactTable.Row<ROWTYPE>) => {
    return (row.original as ContextExpressionDefinitionEntry).entryExpression.id!;
  }, []);

  const cellComponentByColumnId: BeeTableProps<ROWTYPE>["cellComponentByColumnId"] = useMemo(
    () => ({
      list: ContextEntryExpressionCell,
    }),
    []
  );

  return (
    <div className={`${listExpression.id} list-expression`}>
      <BeeTable
        tableId={listExpression.id}
        headerVisibility={BeeTableHeaderVisibility.None}
        cellComponentByColumnId={cellComponentByColumnId}
        columns={beeTableColumns}
        rows={beeTableRows}
        onRowsUpdate={onRowsUpdate}
        operationHandlerConfig={operationHandlerConfig}
        getRowKey={getRowKey}
      />
    </div>
  );
};