/*
 * Copyright 2023 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { ReactNode, useMemo, useCallback } from "react";
import { HTMLFieldProps } from "uniforms";
import UniformsListItemField from "./UniformsListItemField";
import { TextInput } from "@patternfly/react-core/dist/js/components/TextInput";
import { Tooltip } from "@patternfly/react-core/dist/js/components/Tooltip";
import { Split, SplitItem } from "@patternfly/react-core/dist/js/layouts/Split";
import { OutlinedQuestionCircleIcon } from "@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon";
import { connectField, filterDOMProps, joinName } from "uniforms/esm";
import wrapField from "@kie-tools/uniforms-patternfly/dist/esm/wrapField";
import { AutoField, ListAddField } from "@kie-tools/uniforms-patternfly/dist/esm";
import { NestedExpressionContainerContext } from "@kie-tools/boxed-expression-component/dist/resizing/NestedExpressionContainerContext";
import { useNestedExpressionContainerWithNestedExpressions } from "@kie-tools/boxed-expression-component/dist/resizing/Hooks";
import { BeeTable } from "@kie-tools/boxed-expression-component/dist/table/BeeTable";
import {
  BeeTableHeaderVisibility,
  BeeTableOperation,
  BeeTableOperationConfig,
  BeeTableProps,
  generateUuid,
} from "@kie-tools/boxed-expression-component/dist/api";
import * as ReactTable from "react-table";
import { ROWTYPE } from "../bee";
import { ResizerStopBehavior } from "@kie-tools/boxed-expression-component/dist/resizing/ResizingWidthsContext";
import { UnitablesJsonSchemaBridge } from "./UnitablesJsonSchemaBridge";
import { useUnitablesBeeTable } from "../bee/Hooks";
import { UnitablesColumnType } from "../UnitablesTypes";

export type ListFieldProps = HTMLFieldProps<
  unknown[],
  HTMLDivElement,
  {
    children?: ReactNode;
    info?: string;
    error?: boolean;
    initialCount?: number;
    itemProps?: object;
    showInlineError?: boolean;
    items?: Record<string, any>;
    bridge: UnitablesJsonSchemaBridge;
  }
>;

function removeFieldName(fullName: string) {
  return fullName.match(/\./) ? fullName.split(".").slice(1).join("-") : fullName;
}

function UniformsListField({ children = <UniformsListItemField name={"$"} />, itemProps, ...props }: ListFieldProps) {
  const deepTransformColumns = useCallback(
    (field: Record<string, any>, parentName = "") => {
      const joinedName = joinName(parentName, props.field);

      if (field.type !== "object") {
        return {
          ...props.bridge?.getFieldDataType(field),
          name: removeFieldName(field.joinedName),
          joinedName: field.joinedName,
        };
      }

      const insideProperties: UnitablesColumnType[] = Object.entries(props.items?.properties ?? {}).reduce(
        (insideProperties: UnitablesColumnType[], [fieldName, fieldProperty]: [string, any]) => {
          const dataTypeProperties = props.bridge?.getFieldDataType(fieldProperty);

          if (fieldProperty?.type === "object") {
            const field = deepTransformColumns(fieldProperty);
            console.log(field);
            return [
              ...insideProperties,
              {
                name: fieldName,
                joinedName: fieldName,
                ...dataTypeProperties,
              },
            ];
          } else {
            return [
              ...insideProperties,
              {
                name: fieldName,
                joinedName: fieldName,
                ...dataTypeProperties,
              },
            ];
          }
        },
        []
      );

      return {
        ...props.bridge?.getFieldDataType(field),
        insideProperties,
        name: "",
        joinedName: "",
        width: insideProperties.reduce((acc, insideProperty) => acc + (insideProperty.width ?? 0), 0),
      };
    },
    [props.bridge, props.field, props.items?.properties]
  );

  const columns = useMemo(() => {
    const a = deepTransformColumns(props.items as Record<string, any>);
    console.log(a);
    return [a];
  }, [deepTransformColumns, props.items]);

  const { cellComponentByColumnAccessor, beeTableColumns, getColumnKey, getRowKey } = useUnitablesBeeTable({
    columns,
    rows: (props.value as any) ?? [],
    configs: {},
    setWidth: () => {},
  });

  const listExpression = useMemo(
    () =>
      ({
        items: props.value,
      } as any),
    [props.value]
  );

  /// //////////////////////////////////////////////////////
  /// ///////////// RESIZING WIDTHS ////////////////////////
  /// //////////////////////////////////////////////////////

  const { nestedExpressionContainerValue, onColumnResizingWidthChange } =
    useNestedExpressionContainerWithNestedExpressions(
      useMemo(() => {
        return {
          nestedExpressions: listExpression.items,
          fixedColumnActualWidth: 0,
          fixedColumnResizingWidth: { value: 0, isPivoting: false },
          fixedColumnMinWidth: 0,
          nestedExpressionMinWidth: 210,
          extraWidth: 62,
          expression: listExpression,
          flexibleColumnIndex: 1,
        };
      }, [listExpression])
    );

  /// //////////////////////////////////////////////////////

  const beeTableOperationConfig = useMemo<BeeTableOperationConfig>(() => [], []);

  const beeTableRows = useMemo(() => {
    return listExpression.items.map((item: any) => ({
      entryInfo: undefined as any,
      entryExpression: item,
    }));
  }, [listExpression.items]);

  // const beeTableColumns = useMemo<ReactTable.Column<ROWTYPE>[]>(() => {
  //   Object.entries(props.items ?? {}).map(([key, value]) => {
  //     if (value === "properties") {
  //       Object.entries(props.items ?? {}).map(([key, value]) => {});
  //     }
  //   });
  //   return [
  //     {
  //       accessor: uuid as any,
  //       label: listExpression.name,
  //       dataType: listExpression.dataType,
  //       isRowIndexColumn: false,
  //       minWidth: 62,
  //       width: undefined,
  //     },
  //   ];
  // }, [props.field, uuid, listExpression.name, listExpression.dataType]);

  // const cellComponentByColumnAccessor: any = useMemo(
  //   () => ({
  //     [uuid]: <AutoField label={null} name={""} placeholder={`<${props.name}>`} />,
  //   }),
  //   [uuid, props.name]
  // );

  // const getDefaultListItem = useCallback((dataType: DmnBuiltInDataType): ExpressionDefinition => {
  //   return {
  //     id: generateUuid(),
  //     logicType: ExpressionDefinitionLogicType.Undefined,
  //     dataType: dataType,
  //   };
  // }, []);

  const beeTableHeaderVisibility = useMemo(() => {
    return listExpression.isNested ? BeeTableHeaderVisibility.None : BeeTableHeaderVisibility.AllLevels;
  }, [listExpression.isNested]);

  // const onColumnUpdates = useCallback(
  //   ([{ name, dataType }]: BeeTableColumnUpdate<ROWTYPE>[]) => {
  //     setExpression((prev) => ({
  //       ...prev,
  //       name,
  //       dataType,
  //     }));
  //   },
  //   [setExpression]
  // );

  return (
    <>
      {/* <SplitItem>
        <ListAddField
          name={"$"}
          initialCount={props.initialCount}
          style={{ width: 60, borderRight: "1px solid var(--pf-global--palette--black-300)" }}
        />
      </SplitItem> */}
      <NestedExpressionContainerContext.Provider value={nestedExpressionContainerValue}>
        <div className={`${listExpression.id} list-expression`}>
          <BeeTable<ROWTYPE>
            onColumnResizingWidthChange={onColumnResizingWidthChange}
            resizerStopBehavior={ResizerStopBehavior.SET_WIDTH_WHEN_SMALLER}
            tableId={listExpression.id}
            headerVisibility={beeTableHeaderVisibility}
            cellComponentByColumnAccessor={cellComponentByColumnAccessor}
            columns={beeTableColumns}
            rows={beeTableRows}
            operationConfig={beeTableOperationConfig}
            getRowKey={getRowKey}
            // onRowAdded={onRowAdded}
            // onRowDeleted={onRowDeleted}
            // onRowReset={onRowReset}
            // onColumnUpdates={onColumnUpdates}
            shouldRenderRowIndexColumn={true}
            shouldShowRowsInlineControls={true}
            shouldShowColumnsInlineControls={false}
          />
        </div>
      </NestedExpressionContainerContext.Provider>
    </>
  );

  // const hasValue = useMemo(() => props.value && props.value.length > 0, [props.value]);

  // return wrapField(
  //   props as any,
  //   <div data-testid={"unitables-list-field"} {...filterDOMProps(props)} style={{ display: "flex", width: "100%" }}>
  //     <Split hasGutter={hasValue}>
  //       {props.label && (
  //         <>
  //           <SplitItem>
  //             <label>
  //               {props.label}
  //               {!!props.info && (
  //                 <span>
  //                   &nbsp;
  //                   <Tooltip content={props.info}>
  //                     <OutlinedQuestionCircleIcon />
  //                   </Tooltip>
  //                 </span>
  //               )}
  //             </label>
  //           </SplitItem>
  //           <SplitItem isFilled={true} />
  //         </>
  //       )}
  //       <SplitItem>
  //         <ListAddField
  //           name={"$"}
  //           initialCount={props.initialCount}
  //           style={{ width: 60, borderRight: "1px solid var(--pf-global--palette--black-300)" }}
  //         />
  //       </SplitItem>
  //       {!hasValue && (
  //         <SplitItem>
  //           <TextInput isDisabled={true} value={"Add inputs"} {...itemProps} />
  //         </SplitItem>
  //       )}
  //     </Split>

  //     {hasValue &&
  //       props.value!.map((item, itemIndex) =>
  //         React.Children.map(children, (child, childIndex) =>
  //           React.isValidElement(child)
  //             ? React.cloneElement(child as React.ReactElement<{ name: string }, string>, {
  //                 key: `${itemIndex}-${childIndex}`,
  //                 name: child.props.name
  //                   ?.split(/\$(.*)/s)
  //                   .slice(0, -1)
  //                   .join(`${itemIndex}`),
  //                 ...itemProps,
  //               })
  //             : child
  //         )
  //       )}
  //   </div>
  // );
}

export default connectField(UniformsListField);
