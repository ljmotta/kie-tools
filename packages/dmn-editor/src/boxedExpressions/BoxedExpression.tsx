import * as RF from "reactflow";
import {
  BeeGwtService,
  DmnBuiltInDataType,
  DmnDataType,
  ExpressionDefinition,
  ExpressionDefinitionLogicType,
  PmmlParam,
  generateUuid,
} from "@kie-tools/boxed-expression-component/dist/api";
import { BoxedExpressionEditor } from "@kie-tools/boxed-expression-component/dist/expressions";
import { Divider } from "@patternfly/react-core/dist/js/components/Divider";
import { Label } from "@patternfly/react-core/dist/js/components/Label";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { updateExpression } from "../mutations/updateExpression";
import { DmnEditorTab, useDmnEditorStore, useDmnEditorStoreApi } from "../store/Store";
import { dmnToBee, getUndefinedExpressionDefinition } from "./dmnToBee";
import { getDefaultExpressionDefinitionByLogicType } from "./getDefaultExpressionDefinitionByLogicType";
import {
  DMN15__tBusinessKnowledgeModel,
  DMN15__tDecision,
  DMN15__tItemDefinition,
} from "@kie-tools/dmn-marshaller/dist/schemas/dmn-1_5/ts-gen/types";
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
} from "@patternfly/react-core/dist/js/components/EmptyState";
import { Button } from "@patternfly/react-core/dist/js/components/Button";
import { Title } from "@patternfly/react-core/dist/js/components/Title";
import { ErrorCircleOIcon } from "@patternfly/react-icons/dist/js/icons/error-circle-o-icon";
import { InfoIcon } from "@patternfly/react-icons/dist/js/icons/info-icon";
import { builtInFeelTypes } from "../dataTypes/BuiltInFeelTypes";
import { useDmnEditorDerivedStore } from "../store/DerivedStore";
import "@kie-tools/dmn-marshaller/dist/kie-extensions"; // This is here because of the KIE Extension for DMN.
import { parseXmlQName } from "../xml/xmlQNames";
import { buildXmlHref } from "../xml/xmlHrefs";
import { isStruct, traverseItemDefinition } from "../dataTypes/DataTypeSpec";
import { DmnDiagramNodeData } from "../diagram/nodes/Nodes";
import { DataType, DataTypesById } from "../dataTypes/DataTypes";
import { getTextWidth } from "@kie-tools/boxed-expression-component/dist/resizing/WidthsToFitData";

export function BoxedExpression({ container }: { container: React.RefObject<HTMLElement> }) {
  const thisDmn = useDmnEditorStore((s) => s.dmn);
  const dispatch = useDmnEditorStore((s) => s.dispatch);
  const boxedExpressionEditor = useDmnEditorStore((s) => s.boxedExpressionEditor);

  const dmnEditorStoreApi = useDmnEditorStoreApi();

  const widthsById = useMemo(() => {
    return (
      thisDmn.model.definitions["dmndi:DMNDI"]?.["dmndi:DMNDiagram"]?.[0]["di:extension"]?.[
        "kie:ComponentsWidthsExtension"
      ]?.["kie:ComponentWidths"] ?? []
    ).reduce((acc, c) => {
      if (c["@_dmnElementRef"] === undefined) {
        return acc;
      } else {
        return acc.set(c["@_dmnElementRef"], c["kie:width"] ?? []);
      }
    }, new Map<string, number[]>());
  }, [thisDmn.model.definitions]);

  const expression = useMemo(() => {
    if (!boxedExpressionEditor.openExpressionId) {
      return undefined;
    }

    const drgElementIndex = (thisDmn.model.definitions.drgElement ?? []).findIndex(
      (e) => e["@_id"] === boxedExpressionEditor.openExpressionId
    );
    if (drgElementIndex < 0) {
      return undefined;
    }

    const drgElement = thisDmn.model.definitions.drgElement![drgElementIndex];
    if (!(drgElement.__$$element === "decision" || drgElement.__$$element === "businessKnowledgeModel")) {
      return undefined;
    }

    return {
      beeExpression: drgElementToBoxedExpression(widthsById, drgElement),
      drgElementIndex,
      drgElement,
      drgElementType: drgElement.__$$element,
    };
  }, [boxedExpressionEditor.openExpressionId, thisDmn.model.definitions.drgElement, widthsById]);

  const [lastValidExpression, setLastValidExpression] = useState<typeof expression>(undefined);
  useEffect(() => {
    if (expression) {
      setLastValidExpression(expression);
    }
  }, [expression, setLastValidExpression]);

  const setExpression: React.Dispatch<React.SetStateAction<ExpressionDefinition>> = useCallback(
    (expressionAction) => {
      dmnEditorStoreApi.setState((state) => {
        const newExpression =
          typeof expressionAction === "function"
            ? expressionAction(expression?.beeExpression ?? getUndefinedExpressionDefinition())
            : expressionAction;

        updateExpression({
          definitions: state.dmn.model.definitions,
          expression: newExpression,
          drgElementIndex: expression?.drgElementIndex ?? 0,
        });
      });
    },
    [dmnEditorStoreApi, expression]
  );

  const isResetSupportedOnRootExpression = useMemo(() => {
    return expression?.drgElementType === "decision"; // BKMs are ALWAYS functions, and can't be reset.
  }, [expression?.drgElementType]);

  ////

  const { dataTypesTree, dataTypesByFeelName, nodesById } = useDmnEditorDerivedStore();

  const dataTypes = useMemo<DmnDataType[]>(() => {
    const customDataTypes = dataTypesTree.map((d) => ({
      isCustom: true,
      typeRef: d.itemDefinition.typeRef!,
      name: d.feelName,
    }));

    return [...builtInFeelTypes, ...customDataTypes];
  }, [dataTypesTree]);

  const pmmlParams = useMemo<PmmlParam[]>(() => [], []);

  const beeGwtService = useMemo<BeeGwtService>(() => {
    return {
      getDefaultExpressionDefinition(
        logicType: string,
        typeRef: string | undefined,
        isRoot?: boolean
      ): ExpressionDefinition {
        return getDefaultExpressionDefinitionByLogicType({
          logicType: logicType as ExpressionDefinitionLogicType,
          typeRef: typeRef ?? DmnBuiltInDataType.Undefined,
          dataTypesByFeelName,
          getInputs: () => {
            if (!isRoot || expression?.drgElement.__$$element !== "decision") {
              return undefined;
            } else {
              return determineInputsForDecision(expression?.drgElement, dataTypesByFeelName, nodesById);
            }
          },
          getDefaultColumnWidth: ({ name, typeRef }) => {
            return (
              8 * 2 + // FIXME: Tiago --> Copied from ContextEntry info `getWidthToFit`
              2 + // FIXME: Tiago --> Copied from ContextEntry info `getWidthToFit`
              Math.max(
                getTextWidth(name, "700 11.2px Menlo, monospace"), // FIXME: Tiago --> These values were obtained by looking at the values calculated by BEE columns.
                getTextWidth(
                  `(${typeRef ?? ""})`,
                  "700 11.6667px RedHatText, Overpass, overpass, helvetica, arial, sans-serif"
                ) // FIXME: Tiago --> These values were obtained by looking at the values calculated by BEE columns.
              )
            );
          },
        });
      },
      selectObject(uuid) {
        dmnEditorStoreApi.setState((state) => {
          state.boxedExpressionEditor.selectedObjectId = uuid;
        });
      },
      openDataTypePage() {
        dmnEditorStoreApi.setState((state) => {
          state.navigation.tab = DmnEditorTab.DATA_TYPES;
        });
      },
    };
  }, [dataTypesByFeelName, dmnEditorStoreApi, expression?.drgElement, nodesById]);

  ////

  return (
    <>
      <>
        {!boxedExpressionEditor.propertiesPanel.isOpen && (
          <aside className={"kie-dmn-editor--properties-panel-toggle"}>
            <button
              className={"kie-dmn-editor--properties-panel-toggle-button"}
              onClick={dispatch.boxedExpressionEditor.propertiesPanel.toggle}
            >
              <InfoIcon size={"sm"} />
            </button>
          </aside>
        )}
        <Label
          isCompact={true}
          className={"kie-dmn-editor--boxed-expression-back"}
          onClick={dispatch.boxedExpressionEditor.close}
        >
          Back to Diagram
        </Label>
        <Divider
          inset={{ default: "insetMd" }}
          style={{ paddingRight: boxedExpressionEditor.propertiesPanel.isOpen ? "24px" : "56px" }}
        />
        <br />
        {!expression && (
          <>
            <EmptyState>
              <EmptyStateIcon icon={ErrorCircleOIcon} />
              <Title size="lg" headingLevel="h4">
                {`Expression with ID '${boxedExpressionEditor.openExpressionId}' doesn't exist.`}
              </Title>
              <EmptyStateBody>
                This happens when the DMN file is modified externally while the expression was open here.
              </EmptyStateBody>
              <EmptyStatePrimary>
                <Button variant="link" onClick={dispatch.boxedExpressionEditor.close}>
                  Go back to the Diagram
                </Button>
              </EmptyStatePrimary>
            </EmptyState>
          </>
        )}
        {expression && (
          <>
            <BoxedExpressionEditor
              beeGwtService={beeGwtService}
              pmmlParams={pmmlParams}
              isResetSupportedOnRootExpression={isResetSupportedOnRootExpression}
              decisionNodeId={boxedExpressionEditor.openExpressionId!}
              expressionDefinition={expression.beeExpression}
              setExpressionDefinition={setExpression}
              dataTypes={dataTypes}
              scrollableParentRef={container}
            />
          </>
        )}
      </>
    </>
  );
}

function drgElementToBoxedExpression(
  widthsById: Map<string, number[]>,
  expressionHolder:
    | (DMN15__tDecision & { __$$element: "decision" })
    | (DMN15__tBusinessKnowledgeModel & { __$$element: "businessKnowledgeModel" })
): ExpressionDefinition {
  if (expressionHolder.__$$element === "businessKnowledgeModel") {
    return {
      ...dmnToBee(widthsById, {
        expression: {
          __$$element: "functionDefinition",
          ...expressionHolder.encapsulatedLogic,
        },
      }),
      dataType: (expressionHolder.variable?.["@_typeRef"] ??
        expressionHolder.encapsulatedLogic?.["@_typeRef"] ??
        DmnBuiltInDataType.Undefined) as unknown as DmnBuiltInDataType,
      name: expressionHolder["@_name"],
    };
  } else if (expressionHolder.__$$element === "decision") {
    return {
      ...dmnToBee(widthsById, expressionHolder),
      dataType: (expressionHolder.variable?.["@_typeRef"] ??
        expressionHolder.expression?.["@_typeRef"] ??
        DmnBuiltInDataType.Undefined) as unknown as DmnBuiltInDataType,
      name: expressionHolder["@_name"],
    };
  } else {
    throw new Error(
      `Unknown __$$element of expressionHolder that has an expression '${(expressionHolder as any).__$$element}'.`
    );
  }
}

function determineInputsForDecision(
  decision: DMN15__tDecision,
  dataTypesByFeelName: DataTypesById,
  nodesById: Map<string, RF.Node<DmnDiagramNodeData>>
) {
  try {
    const ret = (decision.informationRequirement ?? []).flatMap((s) => {
      const dmnObject = nodesById.get((s.requiredDecision?.["@_href"] ?? s.requiredInput?.["@_href"])!)!.data.dmnObject;
      if (!(dmnObject.__$$element === "inputData" || dmnObject.__$$element === "decision")) {
        throw new Error(
          "DMN EDITOR: Information requirement can't ever point to anything other than an InputData or a Decision"
        );
      }

      const dataType = dataTypesByFeelName.get(dmnObject.variable!["@_typeRef"]!)!;
      return !isStruct(dataType.itemDefinition)
        ? [
            {
              name: dmnObject.variable!["@_name"]!,
              typeRef: dmnObject.variable?.["@_typeRef"],
            },
          ]
        : (dataType.itemDefinition.itemComponent ?? []).flatMap((ic) =>
            flattenComponents(ic, dmnObject.variable!["@_name"])
          );
    });

    if (ret.length === 0) {
      return undefined;
    }

    return ret;
  } catch (e) {
    console.error(`DMN EDITOR: Error suggesting imports for root expression on '${decision["@_name"]}'.`, e);
    return undefined;
  }
}
function flattenComponents(
  itemDefinition: DMN15__tItemDefinition,
  acc: string
): { name: string; typeRef: string | undefined }[] {
  if (!isStruct(itemDefinition)) {
    return [
      {
        name: `${acc}.${itemDefinition["@_name"]!}`,
        typeRef: itemDefinition.typeRef,
      },
    ];
  }

  return (itemDefinition.itemComponent ?? []).flatMap((ic) => {
    return flattenComponents(ic, `${acc}.${itemDefinition["@_name"]!}`);
  });
}