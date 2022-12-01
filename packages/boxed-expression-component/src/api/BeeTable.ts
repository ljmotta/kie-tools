/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
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

import { DmnBuiltInDataType } from "./DmnBuiltInDataType";
import * as React from "react";
import * as ReactTable from "react-table";

export interface BeeTableColumnsUpdateArgs<R extends object> {
  columns: ReactTable.ColumnInstance<R>[];
  operation?: BeeTableOperation;
  columnIndex?: number;
}

export interface BeeTableRowsUpdateArgs<R extends object> {
  rows: R[];
  operation?: BeeTableOperation;
  rowIndex?: number;
  columns?: ReactTable.ColumnInstance<R>[];
}

export interface BeeTableProps<R extends object> {
  /** Table identifier, useful for nested structures */
  tableId?: string;
  /** Optional children element to be appended below the table content */
  children?: React.ReactElement[];
  /** Gets the prefix to be used for the next column name */
  getColumnPrefix?: (groupType?: string) => string;
  /** Optional label, that may depend on column, to be used for the popover that appears when clicking on column header */
  editColumnLabel?: string | { [groupType: string]: string };
  /** Option to enable or disable header edits */
  editableHeader?: boolean;
  /** Top-left cell custom content */
  controllerCell?: string | JSX.Element;
  /** For each column there is a default component to be used to render the related cell */
  defaultCellByColumnId?: { [columnId: string]: React.FunctionComponent<BeeTableCell> };
  /** Table's columns */
  columns: ReactTable.ColumnInstance<R>[];
  /** Table's cells */
  rows: R[];
  /** Function to be executed when columns are modified */
  onColumnsUpdate?: (args: BeeTableColumnsUpdateArgs<R>) => void;
  /** Function to be executed when one or more rows are modified */
  onRowsUpdate?: (args: BeeTableRowsUpdateArgs<R>) => void;
  /** Function to be executed when adding a new row to the table */
  onNewRow?: () => R;
  /** Custom configuration for the table handler */
  operationHandlerConfig?: BeeTableOperationHandlerConfig;
  /** The way in which the header will be rendered */
  headerVisibility?: BeeTableHeaderVisibility;
  /** Number of levels in the header, 0-based */
  headerLevels?: number;
  /** True, for skipping the creation in the DOM of the last defined header group */
  skipLastHeaderGroup?: boolean;
  /** Custom function for getting row key prop, and avoid using the row index */
  getRowKey?: (row: ReactTable.Row<R>) => string;
  /** Custom function for getting column key prop, and avoid using the column index */
  getColumnKey?: (column: ReactTable.ColumnInstance<R>) => string;
  /** Custom function called for manually resetting a row */
  resetRowCustomFunction?: (row: R) => R;
  /** Disable/Enable cell edits. Enabled by default */
  readOnlyCells?: boolean;
  /** Enable the  Keyboar Navigation */
  enableKeyboardNavigation?: boolean;
}

/** Possible status for the visibility of the Table's Header */
export enum BeeTableHeaderVisibility {
  Full,
  LastLevel,
  SecondToLastLevel,
  None,
}

/** Table allowed operations */
export enum BeeTableOperation {
  ColumnInsertLeft,
  ColumnInsertRight,
  ColumnDelete,
  RowInsertAbove,
  RowInsertBelow,
  RowDelete,
  RowClear,
  RowDuplicate,
}

export interface BeeTableOperationHandlerGroup {
  /** Name of the group (localized) */
  group: string;
  /** Collection of operations belonging to this group */
  items: {
    /** Name of the operation (localized) */
    name: string;
    /** Type of the operation */
    type: BeeTableOperation;
  }[];
}

export type BeeTableOperationHandlerConfig =
  | BeeTableOperationHandlerGroup[]
  | { [columnGroupType: string]: BeeTableOperationHandlerGroup[] };

export type BeeTableRow = {
  /** Row identifier */
  id: string;
  /** Cells */
  cells: string[];
};

export interface BeeTableColumn {
  /** Column identifier */
  id: string;
  /** Column name */
  name: string;
  /** Column data type */
  dataType: DmnBuiltInDataType;
  /** Column width */
  width?: string | number;
  /** Set column width */
  setWidth?: (width: string | number) => void;
}

export interface BeeTableCell {
  /** Cell's row properties */
  rowIndex: number;
  /** Cell's column properties */
  columnId: string;
}

/**
 * Interface to be inherited from the table cell components (td, th)
 */
export interface BeeTableCellComponent {
  /** event fired when the user press a key */
  onKeyDown: (rowSpan?: number) => (e: KeyboardEvent) => void;
  /** the row index */
  rowIndex: number;
  /** the cell index */
  cellIndex: number;
  /** the x position of the cell. Colspan are counted */
  xPosition?: number;
  /** the y position of the cell */
  yPosition?: number;
}

export type ROWGENERICTYPE = any;