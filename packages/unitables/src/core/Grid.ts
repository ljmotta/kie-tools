import { Bridge, joinName, useForm } from "uniforms/es5";
import * as React from "react";

/**
 * create table. make api to append to final element
 * create cell, option to pass component inside cell, access cell
 *
 * separate of concerns, possibility to add a header, a footer, and the middle.
 *
 * element mapping : x,y?
 * onSelect : x,y or row?
 *
 * create grid with components
 *
 * precisa auto gerar o form
 * bridge está correta, retorna o tipo certo dos dados.
 * e da acesso a estrutura do schema
 * preciso criar um intermediario que trata os tipos comuns de dados e gera a table
 * depois adicionar os tipos especificos do dmn.
 *
 *
 * [
 *  [{  }, {  }],
 *  [{  }],
 *  [{  }]
 * ]
 *
 *
 * @constructor
 */

export class Grid {
  private header: [];
  private footer: [];
  private inputSize: number;
  private outputSize: number;
  private grid: any[][] | any[] = [[]];

  constructor(private readonly bridge: Bridge) {
    this.generate();
  }

  public getGrid() {
    return this.grid;
  }

  public setHeader(header: []): void {
    this.header = header;
  }

  public setFooter(footer: []): void {
    this.footer = footer;
  }

  public getTable(): Array<Array<any>> {
    return [[]];
  }

  public fillGaps(): void {}

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
      };
    }
    return {
      readOnly: true,
      value: this.removeInputName(joinedName),
      type: this.bridge.getType(joinedName),
      colSpan: 1,
      rowSize: 1,
    };
  }

  public generate() {
    const subfields = this.bridge.getSubfields();
    const inputs = subfields.reduce((acc: any[], fieldName: string) => [...acc, this.deepGenerate(fieldName)], []);
    console.log([{ readOnly: true, emptyCell: true }, ...inputs]);
    this.grid = [{ readOnly: true, emptyCell: true }, ...inputs];
    const inputSize = inputs.reduce((acc, input) => {
      acc += input.colSpan;
      return acc;
    }, 0);
    console.log("input size ", inputSize);
    this.inputSize = inputSize;
  }
}
