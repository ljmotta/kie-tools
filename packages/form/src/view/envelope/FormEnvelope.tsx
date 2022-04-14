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
import * as ReactDOM from "react-dom";
import { FormEnvelopeApi } from "../api";
import { FormEnvelopeApiImpl } from "./FormEnvelopeApiImpl";
import { FormEnvelopeView, FormEnvelopeViewApi } from "./FormEnvelopeView";
import { ContainerType } from "@kie-tools-core/envelope/dist/api";

export type FormViewType = HTMLElement | void;

export function init(args: {
  container: HTMLElement;
  bus: EnvelopeBus;
  config: EnvelopeDivConfig | EnvelopeIFrameConfig;
}) {
  const envelope = new Envelope<FormEnvelopeApi, {}, FormEnvelopeViewApi, {}>(args.bus, args.config);

  const envelopeViewDelegate = async () => {
    const ref = React.createRef<FormEnvelopeViewApi>();
    return new Promise<() => FormEnvelopeViewApi>((res) => {
      ReactDOM.render(
        <FormEnvelopeView ref={ref} initArgs={{}} channelApi={envelope.channelApi} />,
        args.container,
        () => res(() => ref.current!)
      );
    });
  };

  return envelope.start(
    envelopeViewDelegate,
    {},
    { create: (apiFactoryArgs) => new FormEnvelopeApiImpl(apiFactoryArgs) }
  );
}
