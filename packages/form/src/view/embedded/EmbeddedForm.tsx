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

import { FormApi, FormEnvelopeApi } from "../api";
import * as React from "react";
import { useCallback, useEffect } from "react";
import { EmbeddedEnvelopeProps, RefForwardingEmbeddedEnvelope } from "@kie-tools-core/envelope/dist/embedded";
import { EnvelopeServer } from "@kie-tools-core/envelope-bus/dist/channel";
import { ContainerType } from "@kie-tools-core/envelope/dist/api";
import { init } from "../envelope";

export type EmbeddedFormProps = {
  apiImpl: {};
  targetOrigin: string;
  container: HTMLElement;
};

export type EmbeddedFormRef = FormApi & { envelopeServer: EnvelopeServer<{}, FormEnvelopeApi> };

export const EmbeddedForm = React.forwardRef<EmbeddedFormRef, EmbeddedFormProps>((props, forwardedRef) => {
  const refDelegate = useCallback(
    (envelopeServer: EnvelopeServer<{}, FormEnvelopeApi>) => ({
      envelopeServer,
      updateFormSchema: (schema: object) => envelopeServer.envelopeApi.requests.formView__updateFormSchema(schema),
      getFormInputs: () => envelopeServer.envelopeApi.requests.formView__getFormInputs(),
      getFormError: () => envelopeServer.envelopeApi.requests.formView__getFormError(),
    }),
    []
  );

  const pollInit = useCallback(async (envelopeServer: EnvelopeServer<{}, FormEnvelopeApi>) => {
    return envelopeServer.envelopeApi.requests.formView__init(
      { origin: envelopeServer.origin, envelopeServerId: envelopeServer.id },
      {}
    );
  }, []);

  useEffect(() => {
    init({
      container: props.container,
      bus: {
        postMessage: (message, targetOrigin, transfer) => window.parent.postMessage(message, "*", transfer),
      },
      config: { containerType: ContainerType.DIV, envelopeId: "" },
    });
  }, [props.container]);

  return (
    <EmbeddedFormEnvelope
      ref={forwardedRef}
      apiImpl={props.apiImpl}
      origin={props.targetOrigin}
      refDelegate={refDelegate}
      pollInit={pollInit}
      config={{ containerType: ContainerType.DIV }}
    />
  );
});

const EmbeddedFormEnvelope =
  React.forwardRef<FormApi, EmbeddedEnvelopeProps<{}, FormEnvelopeApi, FormApi>>(RefForwardingEmbeddedEnvelope);
