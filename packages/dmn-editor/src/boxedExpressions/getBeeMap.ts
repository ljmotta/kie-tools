/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  DMN15__tConditional,
  DMN15__tContext,
  DMN15__tDecisionTable,
  DMN15__tFilter,
  DMN15__tFor,
  DMN15__tFunctionDefinition,
  DMN15__tInformationItem,
  DMN15__tInputClause,
  DMN15__tInvocation,
  DMN15__tList,
  DMN15__tLiteralExpression,
  DMN15__tOutputClause,
  DMN15__tQuantified,
  DMN15__tRelation,
  DMN15__tUnaryTests,
} from "@kie-tools/dmn-marshaller/dist/schemas/dmn-1_5/ts-gen/types";
import { AllExpressionTypes, AllExpressions, AllExpressionsWithoutTypes } from "../dataTypes/DataTypeSpec";

interface PathType {
  type: AllExpressionTypes;
}

interface LiteralExpressionPath extends PathType {
  type: "literalExpression";
}

interface ContextExpressionPath extends PathType {
  type: "context";
  row: number;
  column: "variable" | "expression";
}

interface DecisionTableHeaderPath extends PathType {
  type: "decisionTable";
  header: "input" | "output";
  row: number;
  column: number;
}

interface RelationExpressionPath extends PathType {
  type: "relation";
  row: number;
  column: number;
}

interface InvocationExpressionPath extends PathType {
  type: "invocation";
  row: number;
  column: "parameter" | "expression";
}

interface ListExpressionPath extends PathType {
  type: "list";
  row: number;
}

interface FunctionDefinitionExpressionPath extends PathType {
  type: "functionDefinition";
  parameterIndex: number;
}

interface ForExpressionPath extends PathType {
  type: "for";
  row: "in" | "return";
}

interface EveryExpressionPath extends PathType {
  type: "every";
  row: "in" | "statisfies";
}

interface SomeExpressionPath extends PathType {
  type: "some";
  row: "in" | "statisfies";
}

interface ConditionalExpressionPath extends PathType {
  type: "conditional";
  row: "if" | "else" | "then";
}

interface FilterExpressionPath extends PathType {
  type: "filter";
  row: "in" | "match";
}

export type ExpressionPath =
  | LiteralExpressionPath
  | ContextExpressionPath
  | DecisionTableHeaderPath
  | RelationExpressionPath
  | InvocationExpressionPath
  | ListExpressionPath
  | FunctionDefinitionExpressionPath
  | ForExpressionPath
  | EveryExpressionPath
  | SomeExpressionPath
  | ConditionalExpressionPath
  | FilterExpressionPath;

/**
 * A map of "@_id" to cell (expression) and its path in the expression hierarchy
 */
type BeeMap = Map<string, { expressionPath: ExpressionPath[]; cell: AllExpressionsWithoutTypes }>;

export function generateBeeMap(
  expression: AllExpressions,
  parentMap: BeeMap,
  parentExpressionPath: ExpressionPath[]
): BeeMap {
  const map: BeeMap = parentMap ? parentMap : new Map();
  switch (expression?.__$$element) {
    case "literalExpression":
      expression["@_id"] &&
        map.set(expression["@_id"], {
          expressionPath: [...parentExpressionPath, { type: "literalExpression" }],
          cell: expression,
        });
      return map;
    case "invocation":
      expression.binding?.forEach((b, row) => {
        b.parameter["@_id"] &&
          map.set(b.parameter["@_id"], {
            expressionPath: [...parentExpressionPath, { type: "invocation", row, column: "parameter" }],
            cell: b.parameter,
          });
        b.expression &&
          generateBeeMap(b.expression, map, [
            ...parentExpressionPath,
            { type: "invocation", row, column: "expression" },
          ]);
      });
      expression.expression;
      expression.expression &&
        expression.expression["@_id"] &&
        map.set(expression.expression["@_id"], {
          expressionPath: [...parentExpressionPath, { type: "invocation", row: -1, column: "expression" }],
          cell: expression.expression,
        });
      return map;
    case "decisionTable":
      expression.output.forEach(
        (o, column) =>
          o["@_id"] &&
          map.set(o["@_id"], {
            expressionPath: [...parentExpressionPath, { type: "decisionTable", header: "output", row: -1, column }],
            cell: o,
          })
      );
      expression.input?.forEach((i, column) => {
        i["@_id"] &&
          map.set(i["@_id"], {
            expressionPath: [...parentExpressionPath, { type: "decisionTable", header: "input", row: -1, column }],
            cell: i,
          });
      });
      expression.rule?.forEach((r, row) => {
        r.outputEntry?.forEach(
          (ro, column) =>
            ro["@_id"] &&
            map.set(ro["@_id"], {
              expressionPath: [...parentExpressionPath, { type: "decisionTable", header: "output", row, column }],
              cell: ro,
            })
        );
        r.inputEntry?.forEach(
          (ri, column) =>
            ri["@_id"] &&
            map.set(ri["@_id"], {
              expressionPath: [...parentExpressionPath, { type: "decisionTable", header: "input", row, column }],
              cell: ri,
            })
        );
      });
      return map;
    case "context":
      expression.contextEntry?.forEach((ce, row) => {
        ce.variable?.["@_id"] &&
          map.set(ce.variable["@_id"], {
            expressionPath: [...parentExpressionPath, { type: "context", row, column: "variable" }],
            cell: ce.variable,
          });
        generateBeeMap(ce.expression, map, [...parentExpressionPath, { type: "context", row, column: "expression" }]);
      });
      return map;
    case "functionDefinition":
      if (expression.expression?.["@_id"]) {
        generateBeeMap(expression.expression, map, [
          ...parentExpressionPath,
          { type: "functionDefinition", parameterIndex: -1 },
        ]);
      }
      expression.formalParameter?.forEach((fp, parameterIndex) => {
        fp["@_id"] &&
          map.set(fp["@_id"], {
            expressionPath: [...parentExpressionPath, { type: "functionDefinition", parameterIndex: parameterIndex }],
            cell: fp,
          });
      });
      return map;
    case "relation":
      expression.column?.forEach(
        (c, column) =>
          c["@_id"] &&
          map.set(c["@_id"], {
            expressionPath: [...parentExpressionPath, { type: "relation", row: -1, column }],
            cell: c,
          })
      );
      expression.row?.forEach((r, row) =>
        r.expression?.forEach((re, column) => {
          re["@_id"] &&
            map.set(re["@_id"], {
              expressionPath: [...parentExpressionPath, { type: "relation", row, column }],
              cell: r,
            });
        })
      );
      return map;
    case "list":
      expression.expression?.forEach((e, row) =>
        generateBeeMap(e, map, [...parentExpressionPath, { type: "list", row }])
      );
      return map;
    case "for":
      generateBeeMap(expression.in.expression, map, [...parentExpressionPath, { type: "for", row: "in" }]);
      generateBeeMap(expression.return.expression, map, [...parentExpressionPath, { type: "for", row: "return" }]);
      return map;
    case "every":
      generateBeeMap(expression.in.expression, map, [...parentExpressionPath, { type: "every", row: "in" }]);
      generateBeeMap(expression.satisfies.expression, map, [
        ...parentExpressionPath,
        { type: "every", row: "statisfies" },
      ]);
      return map;
    case "some":
      generateBeeMap(expression.in.expression, map, [...parentExpressionPath, { type: "some", row: "in" }]);
      generateBeeMap(expression.satisfies.expression, map, [
        ...parentExpressionPath,
        { type: "some", row: "statisfies" },
      ]);
      return map;
    case "conditional":
      generateBeeMap(expression.if.expression, map, [...parentExpressionPath, { type: "conditional", row: "if" }]);
      generateBeeMap(expression.else.expression, map, [...parentExpressionPath, { type: "conditional", row: "else" }]);
      generateBeeMap(expression.then.expression, map, [...parentExpressionPath, { type: "conditional", row: "then" }]);
      return map;
    case "filter":
      generateBeeMap(expression.in.expression, map, [...parentExpressionPath, { type: "filter", row: "in" }]);
      generateBeeMap(expression.match.expression, map, [...parentExpressionPath, { type: "filter", row: "match" }]);
      return map;
  }
}

export enum BeePanelField {
  DESCRIPTION = "description",
  EXPRESSION_LANGUAGE = "expressionLanguage",
  KIE_CONSTRAINT_TYPE = "kieConstraintType",
  LABEL = "label",
  NAME = "name",
  TEXT = "text",
  TYPE_REF = "typeRef",
}

export enum CellType {
  CONTENT = "content",
  EXPRESSION = "expression",
  HEADER = "header",
  INPUT_HEADER = "inputHeader",
  OUTPUT_HEADER = "outputHeader",
  PARAMETER = "parameter",
  ROOT = "root",
  INPUT_RULE = "inputRule",
  OUTPUT_RULE = "outputRule",
  VARIABLE = "variable",
}

interface CellIdentification {
  type: AllExpressionTypes;
}

// LITERAL - START
interface LiteralExpressionCells extends CellIdentification {
  type: "literalExpression";
  [CellType.CONTENT]: Pick<DMN15__tLiteralExpression, "@_expressionLanguage" | "@_label" | "description" | "text">;
}
// LITERAL - END

// CONTEXT - START
interface ContextExpressionCells extends CellIdentification {
  type: "context";
  [CellType.ROOT]: Pick<DMN15__tContext, "@_label" | "description">;
  [CellType.VARIABLE]: Pick<DMN15__tInformationItem, "@_label" | "@_name" | "@_typeRef" | "description">;
}
// CONTEXT - END

// DECISION TABLE - START
interface DecisionTableCells extends CellIdentification {
  type: "decisionTable";
  [CellType.ROOT]: Pick<
    DMN15__tDecisionTable,
    "@_aggregation" | "@_hitPolicy" | "@_label" | "@_outputLabel" | "description"
  >;
  [CellType.INPUT_HEADER]: Pick<DMN15__tInputClause, "@_label" | "description"> & {
    inputExpression: Pick<
      DMN15__tLiteralExpression,
      "@_expressionLanguage" | "@_label" | "description" | "text" | "@_typeRef"
    >;
    inputValues: Pick<
      DMN15__tUnaryTests,
      "@_expressionLanguage" | "@_kie:constraintType" | "@_label" | "description" | "text"
    >;
  };
  [CellType.OUTPUT_HEADER]: Pick<DMN15__tOutputClause, "@_label" | "@_name" | "@_typeRef" | "description"> & {
    outputValues: Pick<
      DMN15__tUnaryTests,
      "@_expressionLanguage" | "@_kie:constraintType" | "@_label" | "description" | "text"
    >;
    defaultOutputEntry: Pick<DMN15__tLiteralExpression, "@_expressionLanguage" | "@_label" | "description" | "text">;
  };
  [CellType.INPUT_RULE]: Pick<DMN15__tUnaryTests, "@_expressionLanguage" | "@_label" | "description" | "text">;
  [CellType.OUTPUT_RULE]: Pick<DMN15__tLiteralExpression, "@_expressionLanguage" | "@_label" | "description" | "text">;
}
// DECISION TABLE - END

// RELATION - START
interface RelationCells extends CellIdentification {
  type: "relation";
  [CellType.ROOT]: Pick<DMN15__tRelation, "@_label" | "description">;
  [CellType.HEADER]: Pick<DMN15__tInformationItem, "@_label" | "@_name" | "@_typeRef" | "description">;
  [CellType.CONTENT]: Pick<DMN15__tLiteralExpression, "@_expressionLanguage" | "@_label" | "description" | "text">;
}
// RELATION - END

// INVOCATION - START
interface InvocationCells extends CellIdentification {
  type: "invocation";
  [CellType.ROOT]: Pick<DMN15__tInvocation, "@_label" | "description">;
  [CellType.EXPRESSION]: Pick<DMN15__tLiteralExpression, "@_expressionLanguage" | "@_label" | "description" | "text">;
  [CellType.PARAMETER]: Pick<DMN15__tInformationItem, "@_label" | "@_name" | "@_typeRef" | "description">;
}
// INVOCATION - END

// FUNCTION - START
interface FunctionDefinitionCells extends CellIdentification {
  type: "functionDefinition";
  [CellType.ROOT]: Pick<DMN15__tFunctionDefinition, "@_kind" | "@_label" | "description">;
  [CellType.PARAMETER]: {
    formalParameters: Pick<DMN15__tInformationItem, "@_label" | "@_name" | "@_typeRef" | "description">[];
  };
}
// FUNCTION - END

// LIST - START
interface ListCells extends CellIdentification {
  type: "list";
  [CellType.ROOT]: Pick<DMN15__tList, "@_label" | "description">;
}
// LIST - END

// For - START
interface ForCells extends CellIdentification {
  type: "for";
  [CellType.ROOT]: Pick<DMN15__tFor, "@_label" | "description">;
}
// For - END

// Every - START
interface EveryCells extends CellIdentification {
  type: "every";
  [CellType.ROOT]: Pick<DMN15__tQuantified, "@_label" | "description">;
}
// Every - END

// Some - START
interface SomeCells extends CellIdentification {
  type: "some";
  [CellType.ROOT]: Pick<DMN15__tQuantified, "@_label" | "description">;
}
// Some - END

// Conditional - START
interface ConditionalCells extends CellIdentification {
  type: "conditional";
  [CellType.ROOT]: Pick<DMN15__tConditional, "@_label" | "description">;
}
// Conditional - END

// Filter - START
interface FilterCells extends CellIdentification {
  type: "filter";
  [CellType.ROOT]: Pick<DMN15__tFilter, "@_label" | "description">;
}
// Filter - END

export type AllCells =
  | ContextExpressionCells
  | DecisionTableCells
  | FunctionDefinitionCells
  | InvocationCells
  | LiteralExpressionCells
  | RelationCells
  | ListCells
  | ForCells
  | SomeCells
  | EveryCells
  | ConditionalCells
  | FilterCells;

export type AllCellsByType = {
  [x in ContextExpressionCells["type"]]: Omit<ContextExpressionCells, "type">;
} & {
  [x in DecisionTableCells["type"]]: Omit<DecisionTableCells, "type">;
} & {
  [x in FunctionDefinitionCells["type"]]: Omit<FunctionDefinitionCells, "type">;
} & {
  [x in InvocationCells["type"]]: Omit<InvocationCells, "type">;
} & {
  [x in LiteralExpressionCells["type"]]: Omit<LiteralExpressionCells, "type">;
} & {
  [x in RelationCells["type"]]: Omit<RelationCells, "type">;
} & {
  [x in ListCells["type"]]: Omit<ListCells, "type">;
} & {
  [x in ForCells["type"]]: Omit<ForCells, "type">;
} & {
  [x in SomeCells["type"]]: Omit<SomeCells, "type">;
} & {
  [x in EveryCells["type"]]: Omit<EveryCells, "type">;
} & {
  [x in ConditionalCells["type"]]: Omit<ConditionalCells, "type">;
} & {
  [x in FilterCells["type"]]: Omit<FilterCells, "type">;
};

export const allCellsByType: AllCellsByType = {
  context: {
    root: { "@_label": "", description: { __$$text: "" } },
    variable: { "@_label": "", "@_name": "", "@_typeRef": "", description: { __$$text: "" } },
  },
  decisionTable: {
    root: {
      "@_aggregation": "COUNT",
      "@_hitPolicy": "ANY",
      "@_label": "",
      "@_outputLabel": "",
      description: { __$$text: "" },
    },
    outputHeader: {
      "@_label": "",
      "@_name": "",
      "@_typeRef": "",
      description: { __$$text: "" },
      outputValues: {
        "@_expressionLanguage": "",
        "@_label": "",
        description: { __$$text: "" },
        text: { __$$text: "" },
        "@_kie:constraintType": "enumeration",
      },
      defaultOutputEntry: {
        "@_expressionLanguage": "",
        "@_label": "",
        description: { __$$text: "" },
        text: { __$$text: "" },
      },
    },
    inputHeader: {
      "@_label": "",
      description: { __$$text: "" },
      inputValues: {
        "@_expressionLanguage": "",
        "@_kie:constraintType": "enumeration",
        "@_label": "",
        description: { __$$text: "" },
        text: { __$$text: "" },
      },
      inputExpression: {
        "@_expressionLanguage": "",
        "@_label": "",
        description: { __$$text: "" },
        text: { __$$text: "" },
        "@_typeRef": "",
      },
    },
    inputRule: { "@_expressionLanguage": "", "@_label": "", description: { __$$text: "" }, text: { __$$text: "" } },
    outputRule: { "@_expressionLanguage": "", "@_label": "", description: { __$$text: "" }, text: { __$$text: "" } },
  },
  functionDefinition: {
    parameter: {
      formalParameters: [{ "@_label": "", "@_name": "", "@_typeRef": "", description: { __$$text: "" } }],
    },
    root: { "@_kind": "FEEL", "@_label": "", description: { __$$text: "" } },
  },
  invocation: {
    expression: { "@_expressionLanguage": "", "@_label": "", description: { __$$text: "" }, text: { __$$text: "" } },
    parameter: { "@_label": "", "@_name": "", "@_typeRef": "", description: { __$$text: "" } },
    root: { "@_label": "", description: { __$$text: "" } },
  },
  literalExpression: {
    content: { "@_expressionLanguage": "", "@_label": "", description: { __$$text: "" }, text: { __$$text: "" } },
  },
  relation: {
    content: { "@_expressionLanguage": "", "@_label": "", description: { __$$text: "" }, text: { __$$text: "" } },
    header: { "@_label": "", "@_name": "", "@_typeRef": "", description: { __$$text: "" } },
    root: { "@_label": "", description: { __$$text: "" } },
  },
  list: {
    root: { "@_label": "", description: { __$$text: "" } },
  },
  for: {
    root: { "@_label": "", description: { __$$text: "" } },
  },
  some: {
    root: { "@_label": "", description: { __$$text: "" } },
  },
  every: {
    root: { "@_label": "", description: { __$$text: "" } },
  },
  conditional: {
    root: { "@_label": "", description: { __$$text: "" } },
  },
  filter: {
    root: { "@_label": "", description: { __$$text: "" } },
  },
};

// TODO: COMPLETE
export function getBeePropertiesPanel(
  selectedObjectPath: ExpressionPath
): ({ cell: any } & { title?: string }) | undefined {
  if (selectedObjectPath.type === "literalExpression") {
    const cell = allCellsByType["literalExpression"][CellType.CONTENT];
    return { cell, title: "Literal Expression" };
  }
  if (selectedObjectPath.type === "invocation") {
    if (selectedObjectPath.column === "parameter") {
      const cell = allCellsByType["invocation"][CellType.PARAMETER];
      return { cell, title: "Boxed Invocation Parameter" };
    }
    if (selectedObjectPath.column === "expression") {
      const cell = allCellsByType["invocation"][CellType.EXPRESSION];
      return { cell, title: "Boxed Invocation" };
    }
    const cell = allCellsByType["invocation"][CellType.ROOT];
    return { cell, title: "Boxed Invocation" };
  }
  if (selectedObjectPath.type === "decisionTable") {
    if (selectedObjectPath.header === "input") {
      if (selectedObjectPath.row < 0) {
        const cell = allCellsByType["decisionTable"][CellType.INPUT_HEADER];
        return { cell, title: "Decision Table Input Header" };
      }
      const cell = allCellsByType["decisionTable"][CellType.INPUT_RULE];
      return { cell, title: "Decision Table Input Cell" };
    }
    if (selectedObjectPath.header === "output") {
      if (selectedObjectPath.row < 0) {
        const cell = allCellsByType["decisionTable"][CellType.OUTPUT_HEADER];
        return { cell, title: "Decision Table Output Header" };
      }
      const cell = allCellsByType["decisionTable"][CellType.OUTPUT_RULE];
      return { cell, title: "Decision Table Output Cell" };
    }
    const cell = allCellsByType["decisionTable"][CellType.ROOT];
    return { cell, title: "Decision Table" };
  }
  if (selectedObjectPath.type === "context") {
    if (selectedObjectPath.column === "variable") {
      const cell = allCellsByType["context"][CellType.VARIABLE];
      return { cell, title: "Boxed Context Variable" };
    }
    const cell = allCellsByType["context"][CellType.ROOT];
    return { cell, title: "Boxed Context" };
  }
  if (selectedObjectPath.type === "functionDefinition") {
    if (selectedObjectPath.parameterIndex < -1) {
      const cell = allCellsByType["functionDefinition"][CellType.ROOT];
      return { cell, title: "Function Definition" };
    }

    const cell = allCellsByType["functionDefinition"][CellType.PARAMETER];
    return { cell, title: "Function Parameters" };
  }
  if (selectedObjectPath.type === "relation") {
    if (selectedObjectPath.row < 0) {
      const cell = allCellsByType["relation"][CellType.HEADER];
      return { cell, title: "Boxed Relation Header" };
    }
    const cell = allCellsByType["relation"][CellType.CONTENT];
    return { cell, title: "Boxed Relation Cell" };
    // TODO: ROOT
  }
  // TODO: LIST, FOR, SOME, EVERY, CONDITIONAL, FILTER;
  return;
}

export function getDmnObject(
  paths: ExpressionPath[],
  expressionRoot: AllExpressions | undefined
): AllExpressionsWithoutTypes | undefined {
  if (!expressionRoot) {
    return;
  }
  return paths.reduce((expressionToEdit: AllExpressionsWithoutTypes, path) => {
    switch (path.type) {
      case "filter":
        if (path.row === "in") {
          return (expressionToEdit as DMN15__tFilter).in.expression;
        }
        return (expressionToEdit as DMN15__tFilter).match.expression;
      case "literalExpression":
        return expressionToEdit as DMN15__tLiteralExpression;
      case "invocation":
        if (path.column === "parameter") {
          return (expressionToEdit as DMN15__tInvocation).binding?.[path.row].parameter;
        }
        return (expressionToEdit as DMN15__tInvocation).binding?.[path.row].expression;
      case "decisionTable":
        if (path.header === "input") {
          if (path.row < 0) {
            return (expressionToEdit as DMN15__tDecisionTable).input?.[path.column];
          }
          return (expressionToEdit as DMN15__tDecisionTable).rule?.[path.row].inputEntry?.[path.column];
        }
        if (path.row < 0) {
          return (expressionToEdit as DMN15__tDecisionTable).output?.[path.column];
        }
        return (expressionToEdit as DMN15__tDecisionTable).rule?.[path.row].outputEntry?.[path.column];
      case "context":
        if (path.column === "expression") {
          return (expressionToEdit as DMN15__tContext).contextEntry?.[path.row].expression;
        }
        return (expressionToEdit as DMN15__tContext).contextEntry?.[path.row].variable;
      case "functionDefinition":
        return (expressionToEdit as DMN15__tFunctionDefinition).expression;
      case "relation":
        if (path.row < 0) {
          return (expressionToEdit as DMN15__tRelation).column?.[path.column];
        }
        return (expressionToEdit as DMN15__tRelation).row?.[path.row].expression?.[path.column];
      case "list":
        return (expressionToEdit as DMN15__tList).expression?.[path.row];
      case "for":
        if (path.row === "in") {
          return (expressionToEdit as DMN15__tFor).in.expression;
        }
        return (expressionToEdit as DMN15__tFor).return.expression;
      case "every":
        if (path.row === "in") {
          return (expressionToEdit as DMN15__tQuantified).in.expression;
        }
        return (expressionToEdit as DMN15__tQuantified).satisfies.expression;
      case "some":
        if (path.row === "in") {
          return (expressionToEdit as DMN15__tQuantified).in.expression;
        }
        return (expressionToEdit as DMN15__tQuantified).satisfies.expression;
      case "conditional":
        if (path.row === "if") {
          return (expressionToEdit as DMN15__tConditional).if.expression;
        }
        if (path.row === "else") {
          return (expressionToEdit as DMN15__tConditional).else.expression;
        }
        return (expressionToEdit as DMN15__tConditional).then.expression;
    }
  }, expressionRoot);
}
