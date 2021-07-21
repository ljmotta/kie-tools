import * as React from "react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "uniforms";
import { Grid } from "./Grid";
import { Cell } from "./Cell";
import { TextInput } from "@patternfly/react-core/dist/js/components/TextInput";
import { AutoField } from "uniforms-patternfly";
import { context, TableContext } from "./Context";

export function Table() {
  const form = useContext<TableContext<any> | null>(context);
  const [grid, setGrid] = useState<Grid>();

  useEffect(() => {
    const myGrid = form?.grid ?? new Grid(form?.schema!);
    myGrid.generate();
    setGrid(myGrid);
  }, [form?.schema, form?.grid]);

  const tableBody = useMemo(() => {
    return grid?.getGrid().map((row: any, index: number, currentGrid: any) => {
      console.log(row);
      if (row.length === 0) {
        return;
      }

      const previousRow = currentGrid[index - 1];
      const column = previousRow ? previousRow.columnEnd + 1 : index + 1;
      row.columnEnd = previousRow ? previousRow.columnEnd + row.colSpan : column;

      if (row.emptyCell) {
        return (
          <>
            <div
              key={`auto-table-empty-cell-${index}`}
              style={{
                border: "1px solid",
                backgroundColor: row?.readOnly ? "gray" : "white",
                gridColumn: `${column} / span 1`,
                gridRow: `1 / span 2`,
              }}
            />
            <div
              key={`auto-table-input-${index}`}
              style={{
                border: "1px solid",
                backgroundColor: row?.readOnly ? "gray" : "white",
                gridColumn: `${column} / span 1`,
                gridRow: `3 / span 1`,
              }}
            >
              <span>Input 1</span>
            </div>
          </>
        );
      }

      // custom nested data type
      if (row.insideProperties) {
        return (
          <>
            <div
              key={`auto-table-nested-cell-${index}`}
              style={{
                border: "1px solid",
                backgroundColor: row.readOnly ? "gray" : "white",
                gridColumn: `${column} / span ${row.colSpan ?? 1}`,
                gridRow: `1 / span 1`,
              }}
            >
              {<Cell {...row} />}
            </div>
            {row.insideProperties.map((cellProps: any, jndex: any) => (
              <>
                <div
                  key={`auto-table-nested-cell-${index}-${jndex}`}
                  style={{
                    border: "1px solid",
                    backgroundColor: cellProps.readOnly ? "gray" : "white",
                    gridColumn: `${jndex + column} / span ${cellProps.colSpan ?? 1}`,
                    gridRow: `2 / span 1`,
                  }}
                >
                  {!cellProps.emptyCell && <Cell {...cellProps} />}
                </div>
                <div
                  key={`auto-table-nested-input-${index}-${jndex}`}
                  style={{
                    border: "1px solid",
                    gridColumn: `${jndex + column} / span ${cellProps.colSpan ?? 1}`,
                    gridRow: `3 / span 1`,
                  }}
                >
                  <p>b</p>
                  {/*<AutoField key={cellProps.name} name={cellProps.name} />*/}
                </div>
              </>
            ))}
          </>
        );
      }

      // simple data type
      return (
        <>
          <div
            key={`auto-table-normal-cell-${index}`}
            style={{
              border: "1px solid",
              backgroundColor: row?.readOnly ? "gray" : "white",
              gridColumn: `${column} / span 1`,
              gridRow: `1 / span 2`,
            }}
          >
            <Cell {...row} />
          </div>
          <div
            key={`auto-table-normal-input-${index}`}
            style={{
              border: "1px solid",
              backgroundColor: row?.readOnly ? "gray" : "white",
              gridColumn: `${column} / span 1`,
              gridRow: `3 / span 1`,
            }}
          >
            <AutoField key={row.name} name={row.name} />
            {/*<p>a</p>*/}
          </div>
        </>
      );
    });
  }, [grid]);

  return (
    <div id={"auto-table"} style={{ display: "grid", gridTemplateColumns: "auto auto" }}>
      {tableBody}
      {/*{tableInputs}*/}
    </div>
  );
}
