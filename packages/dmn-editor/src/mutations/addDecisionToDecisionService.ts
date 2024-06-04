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

import { DMN15__tDefinitions, DMNDI15__DMNShape } from "@kie-tools/dmn-marshaller/dist/schemas/dmn-1_5/ts-gen/types";
import { getContainmentRelationship, getDecisionServiceDividerLineLocalY } from "../diagram/maths/DmnMaths";
import { addOrGetDrd } from "./addOrGetDrd";
import { repopulateInputDataAndDecisionsOnDecisionService } from "./repopulateInputDataAndDecisionsOnDecisionService";
import { SnapGrid } from "../store/Store";
import { MIN_NODE_SIZES } from "../diagram/nodes/DefaultSizes";
import { NODE_TYPES } from "../diagram/nodes/NodeTypes";
import { Normalized } from "../normalization/normalize";
import { ExternalDmnsIndex } from "../DmnEditor";
import { buildXmlHref } from "../xml/xmlHrefs";
import { getXmlNamespaceDeclarationName } from "../xml/xmlNamespaceDeclarations";
import { buildXmlQName } from "@kie-tools/xml-parser-ts/dist/qNames";

export function addDecisionToDecisionService({
  definitions,
  __readonly_decisionId,
  __readonly_decisionNamespace,
  __readonly_decisionServiceId,
  __readonly_externalDmnsIndex,
  __readonly_drdIndex,
  __readonly_snapGrid,
  __readonly_isAlternativeInputDataShape,
}: {
  definitions: Normalized<DMN15__tDefinitions>;
  __readonly_decisionId: string;
  __readonly_decisionNamespace: string | undefined;
  __readonly_decisionServiceId: string;
  __readonly_externalDmnsIndex: ExternalDmnsIndex;
  __readonly_drdIndex: number;
  __readonly_snapGrid: SnapGrid;
  __readonly_isAlternativeInputDataShape: boolean;
}) {
  console.debug(
    `DMN MUTATION: Adding Decision '${__readonly_decisionId}' to Decision Service '${__readonly_decisionServiceId}'`
  );

  // Normalize the namespace
  const namespace =
    __readonly_decisionNamespace === definitions["@_namespace"] ? undefined : __readonly_decisionNamespace;
  // Get the external model from that namespace
  const externalDmn = namespace === undefined ? undefined : __readonly_externalDmnsIndex.get(namespace);

  const decision =
    externalDmn === undefined
      ? definitions.drgElement?.find((s) => s["@_id"] === __readonly_decisionId)
      : externalDmn.model.definitions.drgElement?.find((s) => s["@_id"] === __readonly_decisionId);
  if (decision?.__$$element !== "decision") {
    throw new Error(
      `DMN MUTATION: DRG Element with id '${__readonly_decisionId}' is either not a Decision or doesn't exist.`
    );
  }

  const decisionService = definitions.drgElement?.find((s) => s["@_id"] === __readonly_decisionServiceId);
  if (decisionService?.__$$element !== "decisionService") {
    throw new Error(
      `DMN MUTATION: DRG Element with id '${__readonly_decisionServiceId}' is either not a Decision Service or doesn't exist.`
    );
  }

  const diagram = addOrGetDrd({ definitions, drdIndex: __readonly_drdIndex });

  let decisionShape: Normalized<DMNDI15__DMNShape> | undefined = undefined;
  if (externalDmn === undefined) {
    for (const diagramElement of diagram.diagramElements) {
      if (
        diagramElement["@_dmnElementRef"] === __readonly_decisionId &&
        diagramElement.__$$element === "dmndi:DMNShape"
      ) {
        decisionShape = diagramElement;
        break;
      }
    }
  } else {
    const externalNamespaceName = getXmlNamespaceDeclarationName({
      rootElement: definitions,
      namespace: externalDmn?.model.definitions["@_namespace"],
    });
    // Search for the first Decision depiction
    for (const diagramElement of diagram.diagramElements) {
      if (
        diagramElement["@_dmnElementRef"] ===
          buildXmlQName({ type: "xml-qname", prefix: externalNamespaceName, localPart: __readonly_decisionId }) &&
        diagramElement.__$$element === "dmndi:DMNShape"
      ) {
        decisionShape = diagramElement;
        break;
      }
    }
  }
  if (decisionShape === undefined) {
    throw new Error(`DMN MUTATION: Decision with id '${__readonly_decisionServiceId}' doesn't have DMNShape.`);
  }

  const decisionServiceShape = diagram.diagramElements.find(
    (s) => s["@_dmnElementRef"] === __readonly_decisionServiceId && s.__$$element === "dmndi:DMNShape"
  ) as Normalized<DMNDI15__DMNShape>;

  if (!decisionShape["dc:Bounds"] || !decisionServiceShape?.["dc:Bounds"]) {
    throw new Error(
      `DMN MUTATION: Can't determine Decision Service section for Decision '${decisionShape["@_dmnElementRef"]}' because it doens't have a DMNShape.`
    );
  }

  const contaimentRelationship = getContainmentRelationship({
    bounds: decisionShape["dc:Bounds"],
    container: decisionServiceShape["dc:Bounds"],
    divingLineLocalY: getDecisionServiceDividerLineLocalY(decisionServiceShape),
    snapGrid: __readonly_snapGrid,
    isAlternativeInputDataShape: __readonly_isAlternativeInputDataShape,
    containerMinSizes: MIN_NODE_SIZES[NODE_TYPES.decisionService],
    boundsMinSizes: MIN_NODE_SIZES[NODE_TYPES.decision],
  });

  if (!contaimentRelationship.isInside) {
    throw new Error(
      `DMN MUTATION: Decision '${decisionShape["@_dmnElementRef"]}' can't be added to Decision Service '${decisionServiceShape["@_dmnElementRef"]}' because its shape is not visually contained by the Decision Service's shape.`
    );
  }
  const section = contaimentRelationship.section === "upper" ? "output" : "encapsulated";

  if (section === "encapsulated") {
    decisionService.encapsulatedDecision ??= [];
    decisionService.encapsulatedDecision.push({ "@_href": buildXmlHref({ namespace, id: __readonly_decisionId }) });
  } else if (section === "output") {
    decisionService.outputDecision ??= [];
    decisionService.outputDecision.push({ "@_href": buildXmlHref({ namespace, id: __readonly_decisionId }) });
  } else {
    throw new Error(`DMN MUTATION: Invalid section to add decision to: '${section}' `);
  }

  repopulateInputDataAndDecisionsOnDecisionService({ definitions, decisionService });
}
