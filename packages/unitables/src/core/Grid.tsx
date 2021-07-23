import { Bridge, joinName, useForm } from "uniforms/es5";
import * as React from "react";
import { AutoField } from "./AutoField";
import { Cell } from "./Cell";

export class Grid {
  private header: [];
  private footer: [];
  private inputSize: number;
  private outputSize: number;

  public setHeader(header: []): void {
    this.header = header;
  }

  public setFooter(footer: []): void {
    this.footer = footer;
  }

  public generateHeader() {
    return [{ readOnly: true, colSpan: this.getColumns(), value: "DMN Runner" }];
  }

  public generateFooter() {
    return [{}];
  }

  public getColumns() {
    return this.inputSize + this.outputSize + 1;
  }

  public removeInputName(fullName: string) {
    return fullName.match(/\./) ? fullName.split(".").slice(1).join(".") : fullName;
  }

  public buildTable(bridge: Bridge) {
    return (
      <div id={"auto-table"} style={{ display: "grid", gridTemplateColumns: "auto auto" }}>
        {this.generate(bridge).map((row: any, index: number, currentGrid: any) => {
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
                      {cellProps.children}
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
                {row.children}
              </div>
            </>
          );
        })}
      </div>
    );
  }

  public deepGenerate(bridge: Bridge, fieldName: any, parentName = ""): any {
    const joinedName = joinName(parentName, fieldName);
    const field = bridge.getField(joinedName);

    if (field.type === "object") {
      let inputSize = 0;
      const insideProperties = bridge.getSubfields(joinedName).reduce((acc: any[], subField: string) => {
        const field = this.deepGenerate(bridge, subField, joinedName);
        inputSize += field.colSpan;
        if (field.insideProperties) {
          return [...acc, ...field.insideProperties];
        }
        return [...acc, field];
      }, []);

      return {
        readOnly: true,
        value: this.removeInputName(joinedName),
        insideProperties,
        colSpan: inputSize,
        rowSize: 2,
        name: joinedName,
      };
    }
    return {
      readOnly: true,
      value: this.removeInputName(joinedName),
      type: bridge.getType(joinedName),
      colSpan: 1,
      rowSize: 1,
      name: joinedName,
      children: <AutoField key={joinedName} name={joinedName} />,
    };
  }

  public generate(bridge: Bridge) {
    let myGrid = [[]];
    const subfields = bridge.getSubfields();
    const inputs = subfields.reduce(
      (acc: any[], fieldName: string) => [...acc, this.deepGenerate(bridge, fieldName)],
      []
    );
    if (inputs.length > 0) {
      myGrid = [{ readOnly: true, emptyCell: true }, ...inputs];
    }
    this.inputSize = inputs.reduce((acc, input) => {
      acc += input.colSpan;
      return acc;
    }, 0);
    return myGrid;
  }

  public myComponent(bridge: Bridge) {
    return {
      children: this.buildTable(bridge),
    };
  }
}
