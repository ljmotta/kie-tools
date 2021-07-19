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
  private grid: any[][] = [[]];

  constructor(private readonly bridge: Bridge) {
    this.test();
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
    return [{ readOnly: true, colSpan: 1 + this.inputSize + this.outputSize, value: "DMN Runner" }];
  }

  public generateFooter() {
    return [{}];
  }

  public determineField(fieldName: any, parentName = ""): any {
    const joinedName = joinName(parentName, fieldName);
    const field = this.bridge.getField(joinedName);

    if (field.type === "object") {
      const subFields = this.bridge.getSubfields(joinedName);
      const insideFields = subFields.reduce((acc: any[], subField: string) => {
        const field = this.determineField(subField, joinedName);
        return [...acc, field];
      }, []);
      const headerSize = insideFields.length - 1 ? insideFields.length - 1 : 1;
      const objectHeader = { readOnly: true, colSpan: headerSize, value: joinedName };
      return [[objectHeader], insideFields];
    }

    return { readOnly: true, value: fieldName };
  }

  public test() {
    const subfields = this.bridge.getSubfields();
    const inputs = subfields.reduce((acc: any[], fieldName: string) => {
      return [...acc, this.determineField(fieldName)];
    }, []);
    const something: any[] = inputs.reduce((acc, input) => acc.concat(input), []);
    if (something.find((e: any) => Array.isArray(e))) {
      const newGrid = something.map((row) => {
        if (row.length > 0) {
          return [{ readOnly: true, value: "" }, ...row];
        }
        return [...row];
      });
      console.log(newGrid);
      this.grid = newGrid;
    } else {
      console.log(something);
      const newGrid = [something].map((row) => {
        if (row.length > 0) {
          return [{ readOnly: true, value: "" }, ...row];
        }
        return [...row];
      });
      console.log(newGrid);
      this.grid = newGrid;
    }
    console.log(something.length);
    const inputSize = something.length - 1 > 0 ? something.length : 1;
    console.log("input size ", inputSize);
    this.inputSize = inputSize;
  }
}
