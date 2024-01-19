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

import * as React from "react";
import { UniqueNameIndex } from "../../Dmn15Spec";
import { DescriptionField, LabelField, NameField, TypeRefField } from "./Fields";
import { ExpressionPath } from "../../boxedExpressions/getBeeMap";

export function LabelNameTypeDescriptionCell({
  allUniqueNames,
  description,
  dmnEditorRootElementRef,
  expressionPath,
  label,
  id,
  isReadonly,
  name,
  onChangeDescription,
  onChangeLabel,
  onChangeName,
  onChangeTypeRef,
  typeRef,
}: {
  allUniqueNames: UniqueNameIndex;
  description: string;
  dmnEditorRootElementRef: React.RefObject<HTMLElement>;
  expressionPath: ExpressionPath[];
  id: string;
  isReadonly: boolean;
  label: string;
  name: string;
  onChangeName: (newName: string) => void;
  onChangeTypeRef: (newTypeRef: string) => void;
  onChangeDescription: (newDescription: string, expressionPath: ExpressionPath[]) => void;
  onChangeLabel: (newLabel: string) => void;
  typeRef: string;
}) {
  return (
    <>
      <NameField isReadonly={isReadonly} id={id} name={name} allUniqueNames={allUniqueNames} onRename={onChangeName} />
      <TypeRefField
        isReadonly={isReadonly}
        typeRef={typeRef}
        dmnEditorRootElementRef={dmnEditorRootElementRef}
        onChange={onChangeTypeRef}
      />
      <DescriptionField
        isReadonly={isReadonly}
        initialValue={description}
        onChange={onChangeDescription}
        expressionPath={expressionPath}
      />
      <LabelField label={label} onChange={onChangeLabel} />
    </>
  );
}
