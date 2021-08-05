import { Bridge, joinName } from "uniforms";
import * as React from "react";
import { AutoField } from "./AutoField";
import { Cell } from "./Cell";
import { Clause, DataType } from "@kogito-tooling/boxed-expression-component";
import { DecisionResult, Result } from "../dmn";

export class Grid {
  private inputLength: number = 0;
  private outputSize: number;
  private inputsHeader: any[] = [];
  private inputsFields: any[] = [];

  constructor(private readonly bridge: Bridge, private readonly input = 1) {
    this.buildTable();
  }

  public getBridge() {
    return this.bridge;
  }

  public getInputLength() {
    return this.inputLength;
  }

  public generateHeader() {
    return [{ readOnly: true, colSpan: this.getColumns(), value: "DMN Runner" }];
  }

  public getColumns() {
    return this.input + this.outputSize + 1;
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
              gridRow: `${2 + this.input} / span 1`,
            }}
          >
            <span>Input {this.input}</span>
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
                gridRow: `${2 + this.input} / span 1`,
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
            gridRow: `${2 + this.input} / span 1`,
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
    this.inputLength = inputs.reduce((acc, input) => {
      acc += input.colSpan;
      return acc;
    }, 1);
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

  public determineDataType(type: string): DataType {
    const extractedType = type.split("FEEL:").pop();
    switch (extractedType) {
      case "Any":
        return DataType.Any;
      case "boolean":
        return DataType.Boolean;
      case "context":
        return DataType.Context;
      case "date":
        return DataType.Date;
      case "date and time":
        return DataType.DateTime;
      case "days and time duration":
        return DataType.DateTimeDuration;
      case "number":
        return DataType.Number;
      case "string":
        return DataType.String;
      case "time":
        return DataType.Time;
      case "years and months duration":
        return DataType.YearsMonthsDuration;
      default:
        return DataType.Undefined;
    }
  }

  public deepGenerateBoxed(fieldName: any, parentName = ""): Clause[] {
    const joinedName = joinName(parentName, fieldName);
    const field = this.bridge.getField(joinedName);

    if (field.type === "object") {
      return [
        {
          dataType: this.determineDataType(field["x-dmn-type"]),
          name: joinedName,
          cellDelegate: ({ formId }: any) => <AutoField key={joinedName} name={joinedName} form={formId} />,
        },
      ];
    }
    return [
      {
        dataType: this.determineDataType(field["x-dmn-type"]),
        name: this.removeInputName(joinedName),
        cellDelegate: ({ formId }: any) => <AutoField key={joinedName} name={joinedName} form={formId} />,
      },
    ];
  }

  public generateBoxedInputs(): Clause[] {
    let myGrid: Clause[] = [];
    const subfields = this.bridge.getSubfields();
    const inputs = subfields.reduce(
      (acc: Clause[], fieldName: string) => [...acc, ...this.deepGenerateBoxed(fieldName)],
      [] as Clause[]
    );
    if (inputs.length > 0) {
      myGrid = inputs;
    }
    return myGrid;
  }

  public generateBoxedOutputs(
    schema: any,
    results: Array<DecisionResult[] | undefined>
  ): [Map<string, Clause>, Result[]] {
    const outputTypeMap = Object.entries(schema?.definitions?.OutputSet?.properties ?? []).reduce(
      (acc: Map<string, DataType>, [name, properties]: [string, any]) => {
        acc.set(name, this.determineDataType(properties["x-dmn-type"]));

        return acc;
      },
      new Map<string, DataType>()
    );

    const outputSet = results.reduce((acc: Map<string, Clause>, result: DecisionResult[] | undefined) => {
      if (result) {
        result.forEach(({ decisionName }) => {
          acc.set(decisionName, {
            name: decisionName,
            dataType: outputTypeMap.get(decisionName)!,
          });
        });
      }
      return acc;
    }, new Map<string, Clause>());

    const outputEntries = results.reduce((acc: Result[], result: DecisionResult[] | undefined) => {
      if (result) {
        const outputResults = result.map(({ result }) => {
          if (result === null) {
            return "null";
          }
          return result;
        });
        return [...acc, outputResults];
      }
      return acc;
    }, []);

    return [outputSet, outputEntries];
  }
}
