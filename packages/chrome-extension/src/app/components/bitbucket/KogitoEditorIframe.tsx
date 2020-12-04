/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
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

import { ChannelType } from "@kogito-tooling/channel-common-api";
import { EmbeddedEditor } from "@kogito-tooling/editor/dist/embedded";
import * as React from "react";
import { useContext, useMemo } from "react";
import { IsolatedEditorContext } from "../common/IsolatedEditorContext";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";

interface Props {
  openFileExtension: string;
  contentPath: string;
  getFileContents: () => Promise<string | undefined>;
  readonly: boolean;
  editorEnvelopeLocator: EditorEnvelopeLocator;
}

export function KogitoEditorIframe(props: Props) {
  const { fullscreen, onEditorReady } = useContext(IsolatedEditorContext);

  const file = useMemo(() => {
    return {
      fileName: props.contentPath,
      fileExtension: props.openFileExtension,
      getFileContents: props.getFileContents,
      isReadOnly: props.readonly
    };
  }, [props.contentPath, props.openFileExtension, props.getFileContents, props.readonly]);

  console.log("envelopeLOCATORRRR", props.editorEnvelopeLocator);

  return (
    <>
      <div className={`kogito-iframe ${fullscreen ? "fullscreen" : "not-fullscreen"}`}>
        <EmbeddedEditor
          file={file}
          channelType={ChannelType.GITHUB}
          receive_ready={onEditorReady}
          editorEnvelopeLocator={props.editorEnvelopeLocator}
          locale={"en-US"}
        />
      </div>
    </>
  );
}
