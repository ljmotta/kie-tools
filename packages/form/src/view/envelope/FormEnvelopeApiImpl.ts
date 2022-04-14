/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Association, FormEnvelopeApi } from "../api";
import { EnvelopeApiFactoryArgs } from "@kie-tools-core/envelope";
import { FormComponentProps } from "../../FormComponent";
import { FormEnvelopeViewApi } from "./FormEnvelopeView";

export class FormEnvelopeApiImpl implements FormEnvelopeApi {
  private view: () => FormEnvelopeViewApi;

  constructor(private readonly args: EnvelopeApiFactoryArgs<FormEnvelopeApi, {}, FormEnvelopeViewApi, {}>) {}

  public async formView__init(association: Association, initArgs: FormComponentProps<any, any>): Promise<void> {
    this.args.envelopeClient.associate(association.origin, association.envelopeServerId);
    console.info("something");
    this.view = await this.args.viewDelegate();
  }

  public async formView__updateFormSchema(schema: object): Promise<void> {
    return this.view?.()?.updateFormSchema(schema);
  }
  public async formView__getFormInputs(): Promise<object> {
    return this.view?.()?.getFormInputs() ?? {};
  }
  public async formView__getFormError(): Promise<boolean> {
    return this.view?.()?.getFormError() ?? false;
  }
}
