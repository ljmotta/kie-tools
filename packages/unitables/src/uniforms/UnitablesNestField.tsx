/*
 * Copyright 2023 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { HTMLFieldProps } from "uniforms";
import { connectField } from "uniforms/esm";
import { AutoField } from "@kie-tools/uniforms-patternfly/dist/esm";

export type UnitablesNestFieldProps = HTMLFieldProps<
  object,
  HTMLDivElement,
  { helperText?: string; itemProps?: object }
>;

function UnitablesNestField({
  children,
  error,
  errorMessage,
  fields,
  itemProps,
  label,
  name,
  showInlineError,
  disabled,
  ...props
}: UnitablesNestFieldProps) {
  return (
    <div style={{ display: "flex" }}>
      {children ||
        fields?.map((field) => (
          <div key={field} style={{ width: "100%", borderRight: "1px solid var(--pf-global--palette--black-300)" }}>
            <AutoField disabled={disabled} name={field} {...itemProps} />
          </div>
        ))}
    </div>
  );
}

export default connectField(UnitablesNestField);