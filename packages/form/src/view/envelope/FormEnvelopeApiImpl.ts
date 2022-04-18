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

import { Association, FormEnvelopeApi, FormInitArgs } from "../api";
import { EnvelopeApiFactoryArgs } from "@kie-tools-core/envelope";
import { FormFactory } from "./FormFactory";
import { FormViewEnvelopeApi } from "./FormViewEnvelope";
import { FormViewType } from "./FormEnvelope";

export class FormEnvelopeApiImpl implements FormEnvelopeApi {
  private formView: () => FormViewEnvelopeApi | null;

  constructor(
    private readonly args: EnvelopeApiFactoryArgs<FormEnvelopeApi, {}, FormViewType, {}>,
    private readonly formViewFactory: FormFactory
  ) {}

  public async formView__init(association: Association, initArgs: FormInitArgs): Promise<void> {
    this.args.envelopeClient.associate(association.origin, association.envelopeServerId);
    this.formView = await this.formViewFactory.create(initArgs, this.args.envelopeClient.manager.clientApi);
  }

  public async formView__updateFormSchema(schema: object): Promise<void> {
    return this.formView?.()?.updateFormSchema(schema);
  }
  public async formView__getFormInputs(): Promise<object> {
    return this.formView?.()?.getFormInputs() ?? {};
  }
  public async formView__getFormError(): Promise<boolean> {
    return this.formView?.()?.getFormError() ?? false;
  }
}
