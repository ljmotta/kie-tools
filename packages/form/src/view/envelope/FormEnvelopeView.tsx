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
import { FormComponent, FormComponentProps } from "../../FormComponent";
import { FormApi, FormChannelApi, FormInitArgs } from "../api";
import { MessageBusClientApi } from "@kie-tools-core/envelope-bus/dist/api";
import { useImperativeHandle, useState } from "react";
import { Validator } from "../../Validator";
import { FormI18n } from "../../i18n";
import { EnvelopeDivConfig, EnvelopeIFrameConfig } from "@kie-tools-core/envelope";

export interface FormProps {
  initArgs: FormInitArgs;
  channelApi: MessageBusClientApi<FormChannelApi>;
}

// export interface FormProps<Input, Schema> {
//   id?: string;
//   name?: string;
//   locale: string;
//   formRef?: React.RefObject<HTMLFormElement>;
//   showInlineError?: boolean;
//   autoSave?: boolean;
//   autoSaveDelay?: number;
//   placeholder?: boolean;
//   onSubmit?: (model: object) => void;
//   onValidate?: (model: object, error: object) => void;
//   errorsField?: () => React.ReactNode;
//   submitField?: () => React.ReactNode;
//   notificationsPanel: boolean;
//   openValidationTab?: () => void;
//   formError: boolean;
//   setFormError: React.Dispatch<React.SetStateAction<boolean>>;
//   formInputs: Input;
//   setFormInputs: React.Dispatch<React.SetStateAction<Input>>;
//   formSchema?: Schema;
// }
//
// export interface FormHook<Input extends Record<string, any>, Schema extends Record<string, any>> {
//   name?: string;
//   formError: boolean;
//   setFormError: React.Dispatch<React.SetStateAction<boolean>>;
//   formInputs: Input;
//   setFormInputs: React.Dispatch<React.SetStateAction<Input>>;
//   formSchema?: Schema;
//   onSubmit?: (model: object) => void;
//   onValidate?: (model: object, error: object) => void;
//   propertiesEntryPath?: string;
//   validator?: Validator;
//   removeRequired?: boolean;
//   i18n: FormI18n;
// }

/**
 * Form receive schema
 * Fill form retrieves model/inputs
 */

export interface FormEnvelopeViewApi {
  updateFormSchema(schema: object): void;
  getFormInputs(): object;
  getFormError(): boolean;
}

export const FormEnvelopeView = React.forwardRef<FormEnvelopeViewApi, React.PropsWithChildren<FormProps>>(
  (props, forwardedRef) => {
    const [formError, setFormError] = useState<boolean>(false);
    const [formSchema, setFormSchema] = useState<object>();
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
          notificationsPanel={false}
          formError={formError}
          setFormError={setFormError}
          formSchema={formSchema}
          formInputs={formInputs}
          setFormInputs={setFormInputs}
        >
          {props.children}
        </FormComponent>
      </>
    );
  }
);
