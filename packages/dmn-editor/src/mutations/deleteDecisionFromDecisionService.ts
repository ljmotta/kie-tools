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

import { DMN15__tDefinitions } from "@kie-tools/dmn-marshaller/dist/schemas/dmn-1_5/ts-gen/types";
import { repopulateInputDataAndDecisionsOnDecisionService } from "./repopulateInputDataAndDecisionsOnDecisionService";
import { Normalized } from "../normalization/normalize";
import { ExternalDmnsIndex } from "../DmnEditor";
import { buildXmlHref } from "../xml/xmlHrefs";

export function deleteDecisionFromDecisionService({
  definitions,
  __readonly_decisionId,
  __readonly_decisionNamespace,
  __readonly_decisionServiceId,
  __readonly_externalDmnsIndex,
}: {
  definitions: Normalized<DMN15__tDefinitions>;
  __readonly_decisionId: string;
  __readonly_decisionNamespace: string | undefined;
  __readonly_decisionServiceId: string;
  __readonly_externalDmnsIndex: ExternalDmnsIndex;
}) {
  console.debug(
    `DMN MUTATION: Deleting Decision '${__readonly_decisionId}' from Decision Service '${__readonly_decisionServiceId}'`
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

  decisionService.outputDecision = (decisionService.outputDecision ?? []).filter(
    (s) => s["@_href"] !== buildXmlHref({ namespace, id: __readonly_decisionId })
  );
  decisionService.encapsulatedDecision = (decisionService.encapsulatedDecision ?? []).filter(
    (s) => s["@_href"] !== buildXmlHref({ namespace, id: __readonly_decisionId })
  );

  repopulateInputDataAndDecisionsOnDecisionService({ definitions, decisionService });
}
