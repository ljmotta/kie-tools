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

import { JSON_SCHEMA_INPUT_SET_PATH, RECURSION_KEYWORD, RECURSION_REF_KEYWORD } from "./jsonSchemaConstants";
import { DmnAjvSchemaFormat } from "./ajv";
import { ValidateFunction } from "ajv-draft-04";
import { ExtendedServicesFormSchema, DmnInputFieldProperties } from "@kie-tools/extended-services-api/dist/formSchema";
import { Holder } from "@kie-tools-core/react-hooks/dist/Holder";
import { resolveRefs, pathFromPtr } from "json-refs";
import cloneDeep from "lodash/cloneDeep";
import getObjectValueByPath from "lodash/get";
import setObjectValueByPath from "lodash/set";
import unsetObjectValueByPath from "lodash/unset";
import { X_DMN_TYPE_KEYWORD } from "./jitExecutorKeywords";
import {
  DMN_LATEST__tDefinitions,
  DMN_LATEST__tImport,
  DMN_LATEST__tInformationRequirement,
} from "@kie-tools/dmn-marshaller";
import type { JSONSchema4 } from "json-schema";
import { ImportIndex, Model } from "@kie-tools/dmn-language-service";

function getFieldDefaultValue(dmnField: DmnInputFieldProperties): string | boolean | [] | object | undefined {
  if (dmnField?.type === "string" && dmnField?.format === undefined) {
    return undefined;
  }
  if (dmnField?.type === "number") {
    return undefined;
  }
  if (dmnField?.type === "boolean") {
    return false;
  }
  if (dmnField?.type === "array") {
    return [];
  }
  if (dmnField?.type === "object") {
    return {};
  }
  return undefined;
}

/**
 * get default values based on the jsonSchema
 */
export function getDefaultValues(jsonSchema: JSONSchema4) {
  return Object.entries(getObjectValueByPath(jsonSchema, JSON_SCHEMA_INPUT_SET_PATH) ?? {})?.reduce(
    (acc, [key, field]: [string, Record<string, string>]) => {
      acc[key] = getFieldDefaultValue(field);
      return acc;
    },
    {} as Record<string, any>
  );
}

/**
 * Remove properties from "toValidate" that are not present in the "validator" or
 * properties that have they type or format changed.
 */
export function removeChangedPropertiesAndAdditionalProperties<T extends ValidateFunction>(
  validator: T,
  toValidate: Record<string, any>
) {
  const validation = validator(toValidate);
  if (!validation && validator.errors) {
    validator.errors.forEach((error) => {
      if (error.keyword !== "type" && error.keyword !== "format") {
        return;
      }

      // uniforms-patternfly saves the DateTimeField component value as a Date object and
      // AJV handles data-time as a string, causing an error with keyword type.
      // Also, the ajv.ErrorObject doesn't correctly type the parentSchema property
      if (
        error.keyword === "type" &&
        (error.parentSchema as any)?.format === DmnAjvSchemaFormat.DATE_TIME &&
        error.data instanceof Date
      ) {
        return;
      }

      const pathList = error.schemaPath
        .replace(/\['([^']+)'\]/g, "$1")
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .filter((e) => e !== "");

      const path = pathList.length === 1 ? pathList[0] : pathList.slice(0, -1).join(".");
      unsetObjectValueByPath(toValidate, path);
    });
  }
}

/**
 * Resolve references and handle circular references.
 * All circular $refs are changed to "recursionRef" instead of "$ref"
 * The JSON schema is resolved a second time to ensure all circular $ref were removed.
 */
export async function dereferenceAndCheckForRecursion(
  formSchema: ExtendedServicesFormSchema,
  canceled?: Holder<boolean>
): Promise<ExtendedServicesFormSchema | undefined> {
  try {
    const formSchemaCopy = cloneDeep(formSchema);
    const $ref = getObjectValueByPath(formSchemaCopy, "$ref");
    unsetObjectValueByPath(formSchemaCopy, "$ref");

    const { refs, resolved } = await resolveRefs(formSchemaCopy as any);
    if (canceled?.get()) {
      return;
    }

    let reResolve = false;
    Object.entries(refs).forEach(([ptr, properties]) => {
      if (properties?.circular) {
        const path = pathFromPtr(ptr);
        const recursiveRefPath = pathFromPtr(properties.def.$ref);
        setObjectValueByPath(resolved, path.join("."), {
          [`${RECURSION_KEYWORD}`]: true,
          [`${RECURSION_REF_KEYWORD}`]: properties.def.$ref,
          [`${X_DMN_TYPE_KEYWORD}`]: recursiveRefPath[recursiveRefPath.length - 1],
        });
        reResolve = true;
      }
    });

    if (reResolve) {
      const { resolved: reResolved } = await resolveRefs(resolved);
      if (canceled?.get()) {
        return;
      }

      if ($ref) {
        setObjectValueByPath(reResolved, "$ref", $ref);
      }
      return reResolved;
    }

    if ($ref) {
      setObjectValueByPath(resolved, "$ref", $ref);
    }
    return resolved;
  } catch (err) {
    console.log(err);
    return;
  }
}

//To get namespace with decision and it's related inputs
function getDecisionInputDataNodes(
  decisionId: string,
  modelNamespace: string,
  namespaceDrgElementsMap: Map<string, Map<string, NonNullable<DMN_LATEST__tDefinitions["drgElement"]>[number]>>,
  namespaceToImportedModelsMap: Map<string, Model>,
  decisionToInputDataMap: Map<string, Set<string>>
): Set<string> {
  const inputDataIds = new Set<string>();
  decisionToInputDataMap.set(`${modelNamespace}#${decisionId}`, inputDataIds);
  const drgElementsMap = namespaceDrgElementsMap.get(modelNamespace);

  if (!drgElementsMap) return inputDataIds;
  const decision = drgElementsMap.get(decisionId);

  if (!decision || decision["__$$element"] !== "decision") return inputDataIds;

  decision.informationRequirement?.forEach((requirement) => {
    if (requirement.requiredInput) {
      const inputHref = requirement.requiredInput["@_href"];
      const inputDataId = inputHref.startsWith("#") ? inputHref.substring(1) : inputHref;
      inputDataIds.add(inputDataId);
    } else if (requirement.requiredDecision) {
      const decisionHref = requirement.requiredDecision["@_href"];
      const [namespace, decisionId] = decisionHref.includes("#") ? decisionHref.split("#") : ["", decisionHref];
      const includedModelNamespace = namespace.startsWith("http") ? namespace : modelNamespace;
      const IncludedModelName = namespaceToImportedModelsMap.get(includedModelNamespace);
      if (IncludedModelName) {
        getDecisionInputDataNodes(
          decisionId,
          includedModelNamespace,
          namespaceDrgElementsMap,
          namespaceToImportedModelsMap,
          decisionToInputDataMap
        ).forEach((inputId) => inputDataIds.add(inputId));
      }
    }
  });
  return inputDataIds;
}

//To filter only included inputs for decisions / decisionService
function filterRequiredDecisionInputDataNodes(
  namespace: string | undefined,
  namespaceToElementsMap: Map<string, Map<string, NonNullable<DMN_LATEST__tDefinitions["drgElement"]>[number]>>,
  decisionIdToInputIdsMap: Map<string, Set<string>>,
  requiredDecisionsHref: Set<string>
) {
  if (!namespace) return;
  const drgElementsMap = namespaceToElementsMap.get(namespace);
  if (!drgElementsMap) return;
  drgElementsMap.forEach((drgElement) => {
    if (drgElement.__$$element === "decision") {
      drgElement.informationRequirement?.forEach((decision) => {
        if (decision.requiredDecision) {
          const decisionHref = decision.requiredDecision["@_href"];
          if (decisionIdToInputIdsMap.has(decisionHref)) {
            requiredDecisionsHref.add(decisionHref);
          }

          if (decisionHref.includes("#")) {
            const [namespace] = decisionHref.split("#");
            if (namespace) {
              filterRequiredDecisionInputDataNodes(
                namespace,
                namespaceToElementsMap,
                decisionIdToInputIdsMap,
                requiredDecisionsHref
              );
            }
          }
        }
      });
    }

    if (drgElement.__$$element === "decisionService" && drgElement.outputDecision) {
      drgElement.outputDecision.forEach((outputDecision) => {
        const decisionHref = outputDecision["@_href"];
        if (decisionIdToInputIdsMap.has(decisionHref)) {
          requiredDecisionsHref.add(decisionHref);
        }

        if (decisionHref.includes("#")) {
          const [namespace] = decisionHref.split("#");
          if (namespace)
            filterRequiredDecisionInputDataNodes(
              namespace,
              namespaceToElementsMap,
              decisionIdToInputIdsMap,
              requiredDecisionsHref
            );
        }
      });
    }
  });
}

function buildIncludedModelsSchema(
  parentSchema: JSONSchema4,
  readonly__modelName: string,
  readonly__importIndex: ImportIndex,
  readonly__modelNameToImportDefinition: Map<string, DMN_LATEST__tImport>,
  readonly__requiredDecisions: Set<string>,
  readonly__namespaceToDrgElementsMap: Map<
    string,
    Map<string, NonNullable<DMN_LATEST__tDefinitions["drgElement"]>[number]>
  >,
  readonly__modifiedJsonSchema: JSONSchema4,
  readonly__inputSet: JSONSchema4,
  alreadyProcessedIncludedModelNames = new Set<string>()
) {
  if (alreadyProcessedIncludedModelNames.has(readonly__modelName)) return;
  alreadyProcessedIncludedModelNames.add(readonly__modelName);

  const modelHierarchy = readonly__importIndex.hierarchy.get(readonly__modelName);
  if (!modelHierarchy) return;

  // For immediate imported models
  modelHierarchy.immediate.forEach((importedModelName: string) => {
    const importedModel = readonly__modelNameToImportDefinition.get(importedModelName);
    if (!importedModel) return;

    const dmnDefinition = Object.values(readonly__modifiedJsonSchema.definitions!).find((definition) =>
      definition?.["x-dmn-type"]?.includes(importedModel["@_namespace"])
    ) as JSONSchema4 | undefined;

    if (!dmnDefinition?.properties) return;

    // Get required inputs for this namespace
    const inputDataNames = new Set<string>();
    readonly__requiredDecisions.forEach((namespaceDecisionId) => {
      const [namespace, decisionId] = namespaceDecisionId.split("#");
      if (namespace !== importedModel["@_namespace"]) return;

      const drgElementsMap = readonly__namespaceToDrgElementsMap.get(namespace);
      if (!drgElementsMap) return;

      const drgElement = drgElementsMap.get(decisionId);
      if (!drgElement) return;

      if (drgElement.__$$element !== "decision") return;

      drgElement.informationRequirement?.forEach((requirement: DMN_LATEST__tInformationRequirement) => {
        if (requirement.requiredInput) {
          const inputDataId = requirement.requiredInput["@_href"].split("#")[1];
          const inputElement = drgElementsMap.get(inputDataId);
          if (inputElement && inputElement["@_name"]) {
            inputDataNames.add(inputElement["@_name"]);
          }
        }
      });
    });

    // Filter properties to only include required inputs
    const filteredProperties = Object.fromEntries(
      Object.entries(dmnDefinition.properties).filter(([inputDataName]) => {
        const isInInputDataNames = inputDataNames.has(inputDataName);
        const shouldInclude = !(
          !importedModel["@_name"] &&
          readonly__inputSet.properties &&
          inputDataName in readonly__inputSet.properties
        );
        return isInInputDataNames && shouldInclude;
      })
    );

    if (Object.keys(filteredProperties).length > 0) {
      if (!parentSchema.properties) parentSchema.properties = {};

      if (importedModel["@_name"]) {
        // If we have an import name, nest under that importName
        if (!parentSchema.properties[importedModel["@_name"]]) {
          parentSchema.properties[importedModel["@_name"]] = {
            type: "object" as const,
            properties: {},
          };
        }
        const importSchema = parentSchema.properties[importedModel["@_name"]] as JSONSchema4;
        if (!importSchema.properties) importSchema.properties = {};
        Object.assign(importSchema.properties, filteredProperties);

        // Recursively build inputs for import's dependencies
        buildIncludedModelsSchema(
          importSchema,
          importedModelName,
          readonly__importIndex,
          readonly__modelNameToImportDefinition,
          readonly__requiredDecisions,
          readonly__namespaceToDrgElementsMap,
          readonly__modifiedJsonSchema,
          readonly__inputSet,
          alreadyProcessedIncludedModelNames
        );
      } else {
        // If no import name, add directly to properties
        Object.assign(parentSchema.properties, filteredProperties);
        buildIncludedModelsSchema(
          parentSchema,
          importedModelName,
          readonly__importIndex,
          readonly__modelNameToImportDefinition,
          readonly__requiredDecisions,
          readonly__namespaceToDrgElementsMap,
          readonly__modifiedJsonSchema,
          readonly__inputSet,
          alreadyProcessedIncludedModelNames
        );
      }
    }
  });
}

export function buildDmnJsonSchemaWithIncludedModels(jsonSchema: JSONSchema4, importIndex: ImportIndex) {
  if (!jsonSchema.definitions) return jsonSchema;

  const modifiedJsonSchema = cloneDeep(jsonSchema);
  const inputSet = modifiedJsonSchema.definitions?.InputSet || {};
  if (!inputSet.properties) {
    inputSet.properties = {};
  }

  const namespaceToImportedModelsMap = new Map<string, Model>();
  const namespaceToIdToDrgElementsMap = new Map<
    string,
    Map<string, NonNullable<DMN_LATEST__tDefinitions["drgElement"]>[number]>
  >();
  const decisionIdToInputIdsMap = new Map<string, Set<string>>();

  Array.from(importIndex.models.values()).forEach((model) => {
    //To get imports model data
    model.definitions.import?.forEach((importedDmn) => {
      if (importedDmn?.["@_namespace"]) {
        namespaceToImportedModelsMap.set(importedDmn["@_namespace"], model);
      }
    });

    const idToDrgElementsMap = new Map<string, NonNullable<DMN_LATEST__tDefinitions["drgElement"]>[number]>();
    model.definitions?.drgElement?.forEach((element) => {
      idToDrgElementsMap.set(element["@_id"]!, element);
    });
    namespaceToIdToDrgElementsMap.set(model.definitions?.["@_namespace"] ?? "", idToDrgElementsMap);
  });

  namespaceToIdToDrgElementsMap.forEach((elementsMap, namespace) => {
    elementsMap.forEach((element, decisionId) => {
      if (element["__$$element"] === "decision") {
        getDecisionInputDataNodes(
          decisionId,
          namespace,
          namespaceToIdToDrgElementsMap,
          namespaceToImportedModelsMap,
          decisionIdToInputIdsMap
        );
      }
    });
  });

  const requiredDecisionsHref = new Set<string>();
  const currentModel = importIndex.models.values().next().value;
  filterRequiredDecisionInputDataNodes(
    currentModel.definitions?.["@_namespace"],
    namespaceToIdToDrgElementsMap,
    decisionIdToInputIdsMap,
    requiredDecisionsHref
  );

  // Create a map of model filenames to their import definitions
  const modelNameToImportDefinition = new Map<string, DMN_LATEST__tImport>();
  Array.from(importIndex.models.values()).forEach((model) => {
    model.definitions?.import?.forEach((importDefinition) => {
      const locationUri = importDefinition["@_locationURI"];
      if (locationUri) {
        const modelName = locationUri.replace("./", "");
        modelNameToImportDefinition.set(modelName, importDefinition);
      }
    });
  });

  const includedModelSchema: JSONSchema4 = {
    type: "object",
    properties: {},
  };

  // Start building inputs for the current model
  const rootModelFile = Array.from(importIndex.hierarchy.keys())[0];
  buildIncludedModelsSchema(
    includedModelSchema,
    rootModelFile,
    importIndex,
    modelNameToImportDefinition,
    requiredDecisionsHref,
    namespaceToIdToDrgElementsMap,
    modifiedJsonSchema,
    inputSet
  );

  if (Object.keys(includedModelSchema.properties!).length > 0) {
    inputSet.properties["Included Models"] = includedModelSchema;
  }

  return modifiedJsonSchema;
}
