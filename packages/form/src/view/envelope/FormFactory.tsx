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

import { FormChannelApi, FormInitArgs } from "../api";
import { MessageBusClientApi } from "@kie-tools-core/envelope-bus/dist/api";
import * as React from "react";
import { FormComponentProps } from "../../FormComponent";
import { FormEnvelopeView, FormEnvelopeViewApi } from "./FormEnvelopeView";

export class FormFactory {
  constructor(private setView: React.Dispatch<React.SetStateAction<React.ReactElement>>) {}

  public create(initArgs: FormInitArgs, channelApi: MessageBusClientApi<FormChannelApi>) {
    const ref = React.createRef<FormEnvelopeViewApi>();

    this.setView(<FormEnvelopeView ref={ref} initArgs={initArgs} channelApi={channelApi} />);

    return () => ref.current;
  }
}
