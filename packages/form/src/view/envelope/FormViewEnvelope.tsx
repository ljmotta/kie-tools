/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { useImperativeHandle, useState } from "react";
import { FormComponent } from "../../FormComponent";
import { MessageBusClientApi } from "@kie-tools-core/envelope-bus/dist/api";
import { FormInitArgs } from "../api";

export interface FormProps {
  channelApi: MessageBusClientApi<{}>;
  initArgs: FormInitArgs;
}

export interface FormViewEnvelopeApi {
  updateFormSchema(schema: object): void;
  getFormInputs(): object;
  getFormError(): boolean;
}

const example = {
  title: "Address",
  type: "object",
  properties: {
    city: { type: "string" },
    state: { type: "string" },
    street: { type: "string" },
    zip: { type: "string", pattern: "[0-9]{5}" },
  },
  required: ["street", "zip", "state"],
};

export const FormViewEnvelope = React.forwardRef<FormViewEnvelopeApi, React.PropsWithChildren<FormProps>>(
  (props, forwardedRef) => {
    const [formError, setFormError] = useState<boolean>(false);
    const [formSchema, setFormSchema] = useState<object>(example);
    const [formInputs, setFormInputs] = useState<object>({});

    useImperativeHandle(
      forwardedRef,
      () => {
        return {
          updateFormSchema: (schema: object) => setFormSchema(schema),
          getFormInputs: () => formInputs,
          getFormError: () => formError,
        };
      },
      [formError, formInputs]
    );

    return (
      <>
        <FormComponent
          locale={window.navigator.language}
          formError={formError}
          setFormError={setFormError}
          formSchema={formSchema}
          formInputs={formInputs}
          setFormInputs={setFormInputs}
          {...props.initArgs}
        >
          {props.children}
        </FormComponent>
      </>
    );
  }
);
