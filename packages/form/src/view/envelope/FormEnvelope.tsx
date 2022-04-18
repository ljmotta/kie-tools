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

import { Envelope, EnvelopeDivConfig, EnvelopeIFrameConfig } from "@kie-tools-core/envelope";
import { EnvelopeBus } from "@kie-tools-core/envelope-bus/dist/api";
import * as React from "react";
import { FormEnvelopeApi } from "../api";
import { FormEnvelopeApiImpl } from "./FormEnvelopeApiImpl";
import { FormFactory } from "./FormFactory";

export type FormViewType = HTMLElement | void;

export function init(args: {
  bus: EnvelopeBus;
  config: EnvelopeDivConfig | EnvelopeIFrameConfig;
  formViewFactory: FormFactory;
}) {
  const envelope = new Envelope<FormEnvelopeApi, {}, FormViewType, {}>(args.bus, args.config);

  return envelope.start(
    () => Promise.resolve(() => {}),
    {},
    { create: (apiFactoryArgs) => new FormEnvelopeApiImpl(apiFactoryArgs, args.formViewFactory) }
  );
}
