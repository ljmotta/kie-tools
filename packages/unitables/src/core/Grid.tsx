import { Bridge, joinName } from "uniforms";
import * as React from "react";
import { AutoField } from "./AutoField";
import { Cell } from "./Cell";

export class Grid {
  private inputSize: number;
  private outputSize: number;
  private inputsHeader: any[] = [];
  private inputsFields: any[] = [];

  constructor(private readonly bridge: Bridge) {
    this.buildTable();
  }

  public setHeader(header: []): void {
    this.inputsHeader = header;
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

  public buildTable() {
    this.generate().map((row: any, index: number, currentGrid: any) => {
      if (row.length === 0) {
        return;
      }

      const previousRow = currentGrid[index - 1];
      const column = previousRow ? previousRow.columnEnd + 1 : index + 1;
      row.columnEnd = previousRow ? previousRow.columnEnd + row.colSpan : column;

      if (row.emptyCell) {
        this.inputsFields.push(
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
        );
        this.inputsHeader.push(
          <div
            key={`auto-table-empty-cell-${index}`}
            style={{
              border: "1px solid",
              backgroundColor: row?.readOnly ? "gray" : "white",
              gridColumn: `${column} / span 1`,
              gridRow: `1 / span 2`,
            }}
          />
        );
        return;
      }

      // custom nested data type
      if (row.insideProperties) {
        this.inputsHeader.push(
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
        );
        row.insideProperties.map((cellProps: any, jndex: any) => {
          this.inputsFields.push(
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
          );
          this.inputsHeader.push(
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
          );
        });
        return;
      }

      // simple data type
      this.inputsFields.push(
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
      );

      this.inputsHeader.push(
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
      );
    });
  }

  public deepGenerate(fieldName: any, parentName = ""): any {
    const joinedName = joinName(parentName, fieldName);
    const field = this.bridge.getField(joinedName);

    if (field.type === "object") {
      let inputSize = 0;
      const insideProperties = this.bridge.getSubfields(joinedName).reduce((acc: any[], subField: string) => {
        const field = this.deepGenerate(subField, joinedName);
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
      type: this.bridge.getType(joinedName),
      colSpan: 1,
      rowSize: 1,
      name: joinedName,
      children: <AutoField key={joinedName} name={joinedName} />,
    };
  }

  public generate() {
    let myGrid = [[]];
    const subfields = this.bridge.getSubfields();
    const inputs = subfields.reduce((acc: any[], fieldName: string) => [...acc, this.deepGenerate(fieldName)], []);
    if (inputs.length > 0) {
      myGrid = [{ readOnly: true, emptyCell: true }, ...inputs];
    }
    this.inputSize = inputs.reduce((acc, input) => {
      acc += input.colSpan;
      return acc;
    }, 0);
    return myGrid;
  }

  public getInputsHeader() {
    return {
      children: <>{this.inputsHeader}</>,
    };
  }

  public getInputsFields() {
    return {
      children: <>{this.inputsFields}</>,
    };
  }
}
