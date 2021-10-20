/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
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

import * as React from "react";
import { useDmnRunner } from "./DmnRunnerContext";
import { DmnRunnerMode } from "./DmnRunnerStatus";
import { Button } from "@patternfly/react-core";
import { ResizablePanel, ResizablePanelId, useConnectResizable } from "../ResizablePanel";
import { useCallback } from "react";

interface Props {}

export function DmnRunnerTabular(props: Props) {
  const onClick = useCallback(() => undefined, []);
  const { setHeight } = useConnectResizable(ResizablePanelId.DMN_RUNNER_TABULAR, "DMN Runner", onClick);
  const dmnRunner = useDmnRunner();

  return (
    <div>
      <ResizablePanel isOpen={dmnRunner.isExpanded} setHeight={setHeight}>
        <Button onClick={() => dmnRunner.setMode(DmnRunnerMode.DRAWER)}>Drawer</Button>

        <div>test</div>
      </ResizablePanel>
    </div>
  );
}
