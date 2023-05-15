import {
  BeeTableCellProps,
  BeeTableHeaderVisibility,
  BeeTableOperation,
  BeeTableOperationConfig,
  BeeTableProps,
  generateUuid,
} from "@kie-tools/boxed-expression-component/dist/api";
import { BoxedExpressionEditorI18n } from "@kie-tools/boxed-expression-component/dist/i18n";
import { StandaloneBeeTable } from "@kie-tools/boxed-expression-component/dist/table/BeeTable/StandaloneBeeTable";
import {
  SelectionPart,
  useBeeTableCoordinates,
  useBeeTableSelectableCellRef,
  useBeeTableSelectionDispatch,
} from "@kie-tools/boxed-expression-component/dist/selection/BeeTableSelectionContext";
import * as React from "react";
import { useCallback, useMemo, useReducer, useEffect, useRef, useState } from "react";
import * as ReactTable from "react-table";
import { UnitablesColumnType, UnitablesInputsConfigs, UnitablesCellConfigs } from "../UnitablesTypes";
import "@kie-tools/boxed-expression-component/dist/@types/react-table";
import { ResizerStopBehavior } from "@kie-tools/boxed-expression-component/dist/resizing/ResizingWidthsContext";
import { AutoField } from "@kie-tools/uniforms-patternfly/dist/esm";
import { useField } from "uniforms";
import { AUTO_ROW_ID, DEFAULT_COLUMN_MIN_WIDTH } from "../uniforms/UnitablesJsonSchemaBridge";
import getObjectValueByPath from "lodash/get";
import { useUnitablesContext, useUnitablesRow } from "../UnitablesContext";
import moment from "moment";
import { X_DMN_TYPE } from "@kie-tools/extended-services-api";
import { ROWTYPE, UnitablesBeeTableCell } from "./UnitablesBeeTable";

function getColumnAccessor(c: UnitablesColumnType) {
  return `field-${c.joinedName}`;
}

interface Props {
  rows: object[];
  columns: UnitablesColumnType[];
  configs: UnitablesInputsConfigs;
  setWidth: (newWidth: number, fieldName: string) => void;
}

export function useUnitablesBeeTable({ columns, rows, configs, setWidth }: Props) {
  const uuid = useMemo(() => {
    return generateUuid();
  }, []);

  // starts with 1 due to "index" column
  const columnsCount = useMemo(
    () => columns.reduce((acc, column) => acc + (column.insideProperties ? column.insideProperties.length : 1), 1),
    [columns]
  );

  const cellComponentByColumnAccessor: BeeTableProps<ROWTYPE>["cellComponentByColumnAccessor"] = React.useMemo(() => {
    return columns.reduce((acc, column) => {
      if (column.insideProperties) {
        for (const insideProperty of column.insideProperties) {
          acc[getColumnAccessor(insideProperty)] = (props) => (
            <UnitablesBeeTableCell
              {...props}
              joinedName={insideProperty.joinedName}
              rowCount={rows.length}
              columnCount={columnsCount}
            />
          );
        }
      } else {
        acc[getColumnAccessor(column)] = (props) => (
          <UnitablesBeeTableCell
            {...props}
            joinedName={column.joinedName}
            rowCount={rows.length}
            columnCount={columnsCount}
          />
        );
      }
      return acc;
    }, {} as NonNullable<BeeTableProps<ROWTYPE>["cellComponentByColumnAccessor"]>);
  }, [columns, rows.length, columnsCount]);

  const setColumnWidth = useCallback(
    (fieldName: string) => (newWidthAction: React.SetStateAction<number | undefined>) => {
      const newWidth = typeof newWidthAction === "function" ? newWidthAction(0) : newWidthAction;
      setWidth(newWidth ?? 0, fieldName);
      return newWidth;
    },
    [setWidth]
  );

  const calculateArrayFieldLength = useCallback(
    (columnName: string) => {
      return rows.reduce((length, row) => {
        const arrayInput = getObjectValueByPath(row, columnName) as [] | undefined;
        if (arrayInput && Array.isArray(arrayInput) && arrayInput.length > length) {
          return arrayInput.length;
        }
        return length;
      }, 0);
    },
    [rows]
  );

  const beeTableColumns = useMemo<ReactTable.Column<ROWTYPE>[]>(() => {
    return columns.map((column) => {
      if (column.insideProperties) {
        return {
          originalId: uuid + `field-${column.name}`,
          label: column.name,
          accessor: getColumnAccessor(column),
          dataType: column.dataType,
          isRowIndexColumn: false,
          width: undefined,
          columns: column.insideProperties.flatMap((insideProperty) => {
            let minWidth = insideProperty.minWidth ?? insideProperty.width;
            if (insideProperty.dataType === "array") {
              const length = calculateArrayFieldLength(insideProperty.joinedName);
              minWidth =
                length > 0
                  ? 60 + length * (insideProperty.minWidth ?? insideProperty.width)
                  : insideProperty.minWidth ?? insideProperty.width;
            }
            return {
              originalId: uuid + `field-${insideProperty.joinedName}`,
              label: insideProperty.name,
              accessor: getColumnAccessor(insideProperty),
              dataType: insideProperty.dataType,
              isRowIndexColumn: false,
              width:
                (getObjectValueByPath(configs, insideProperty.joinedName) as UnitablesCellConfigs)?.width ?? minWidth,
              setWidth: setColumnWidth(insideProperty.joinedName),
              minWidth,
            };
          }),
        };
      } else {
        let minWidth = column.width;
        if (column.type === "array") {
          const length = calculateArrayFieldLength(column.joinedName);
          minWidth = length > 0 ? 60 + length * (column.width ?? 0) : column.width;
        }
        return {
          originalId: uuid + `field-${column.name}-parent`,
          label: "",
          accessor: getColumnAccessor(column) + "-parent",
          dataType: undefined as any,
          isRowIndexColumn: false,
          width: undefined,
          columns: [
            {
              originalId: uuid + `field-${column.name}`,
              label: column.name,
              accessor: getColumnAccessor(column),
              dataType: column.dataType,
              isRowIndexColumn: false,
              width: (getObjectValueByPath(configs, column.name) as UnitablesCellConfigs)?.width ?? minWidth,
              setWidth: setColumnWidth(column.name),
              minWidth,
            },
          ],
        };
      }
    });
  }, [columns, uuid, configs, setColumnWidth, calculateArrayFieldLength]);

  const getColumnKey = useCallback((column: ReactTable.ColumnInstance<ROWTYPE>) => {
    return column.originalId ?? column.id;
  }, []);

  const getRowKey = useCallback((row: ReactTable.Row<ROWTYPE>) => {
    return row.original.id;
  }, []);

  return {
    cellComponentByColumnAccessor,
    beeTableColumns,
    getColumnKey,
    getRowKey,
  };
}
