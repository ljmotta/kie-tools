import * as RF from "reactflow";
import * as React from "react";
import { useCallback } from "react";
import { NodeType } from "./connections/graphStructure";
import { NODE_TYPES } from "./nodes/NodeTypes";
import {
  BkmNodeSvg,
  DecisionNodeSvg,
  DecisionServiceNodeSvg,
  GroupNodeSvg,
  InputDataNodeSvg,
  KnowledgeSourceNodeSvg,
  TextAnnotationNodeSvg,
} from "./nodes/NodeSvgs";
import { useDmnEditorStore, useDmnEditorStoreApi } from "../store/Store";
import { addStandaloneNode } from "../mutations/addStandaloneNode";
import { CONTAINER_NODES_DESIRABLE_PADDING, getBounds } from "./maths/DmnMaths";
import { Popover } from "@patternfly/react-core/dist/js/components/Popover";
import { ExternalNodesPanel } from "../externalNodes/ExternalNodesPanel";
import { MigrationIcon } from "@patternfly/react-icons/dist/js/icons/migration-icon";
import {
  BkmIcon,
  DecisionIcon,
  DecisionServiceIcon,
  GroupIcon,
  InputDataIcon,
  KnowledgeSourceIcon,
  TextAnnotationIcon,
} from "../icons/Icons";

export const MIME_TYPE_FOR_DMN_EDITOR_NEW_NODE_FROM_PALLETE = "application/kie-dmn-editor--new-node-from-pallete";

export function Pallete() {
  const onDragStart = useCallback((event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData(MIME_TYPE_FOR_DMN_EDITOR_NEW_NODE_FROM_PALLETE, nodeType);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const dmnEditorStoreApi = useDmnEditorStoreApi();
  const diagram = useDmnEditorStore((s) => s.diagram);
  const rfStoreApi = RF.useStoreApi();

  const groupNodes = useCallback(() => {
    dmnEditorStoreApi.setState((state) => {
      if (state.diagram.selectedNodes.length <= 0) {
        return;
      }

      const newNodeId = addStandaloneNode({
        definitions: state.dmn.model.definitions,
        newNode: {
          type: NODE_TYPES.group,
          bounds: getBounds({
            nodes: rfStoreApi.getState().getNodes(),
            padding: CONTAINER_NODES_DESIRABLE_PADDING,
          }),
        },
      });

      state.dispatch.diagram.setNodeStatus(state, newNodeId, { selected: true });
    });
  }, [dmnEditorStoreApi, rfStoreApi]);

  const toggleExternalNodesPanel = useCallback(() => {
    dmnEditorStoreApi.setState((state) => state.dispatch.diagram.toggleExternalNodesPanel(state));
  }, [dmnEditorStoreApi]);

  return (
    <>
      <RF.Panel position={"top-left"}>
        <aside className={"kie-dmn-editor--pallete"}>
          <button
            className={"kie-dmn-editor--pallete-button dndnode input-data"}
            onDragStart={(event) => onDragStart(event, NODE_TYPES.inputData)}
            draggable={true}
          >
            <InputDataIcon />
          </button>
          <button
            className={"kie-dmn-editor--pallete-button dndnode decision"}
            onDragStart={(event) => onDragStart(event, NODE_TYPES.decision)}
            draggable={true}
          >
            <DecisionIcon />
          </button>
          <button
            className={"kie-dmn-editor--pallete-button dndnode bkm"}
            onDragStart={(event) => onDragStart(event, NODE_TYPES.bkm)}
            draggable={true}
          >
            <BkmIcon />
          </button>
          <button
            className={"kie-dmn-editor--pallete-button dndnode knowledge-source"}
            onDragStart={(event) => onDragStart(event, NODE_TYPES.knowledgeSource)}
            draggable={true}
          >
            <KnowledgeSourceIcon />
          </button>
          <button
            className={"kie-dmn-editor--pallete-button dndnode decision-service"}
            onDragStart={(event) => onDragStart(event, NODE_TYPES.decisionService)}
            draggable={true}
          >
            <DecisionServiceIcon />
          </button>
        </aside>
        <br />
        <aside className={"kie-dmn-editor--pallete"}>
          <button
            className={"kie-dmn-editor--pallete-button dndnode group"}
            onDragStart={(event) => onDragStart(event, NODE_TYPES.group)}
            draggable={true}
            onClick={groupNodes}
          >
            <GroupIcon />
          </button>
          <button
            className={"kie-dmn-editor--pallete-button dndnode text-annotation"}
            onDragStart={(event) => onDragStart(event, NODE_TYPES.textAnnotation)}
            draggable={true}
          >
            <TextAnnotationIcon />
          </button>
        </aside>
        <br />
        <aside className={"kie-dmn-editor--external-nodes-panel-toggle"}>
          <Popover
            key={`${diagram.externalNodesPanel.isOpen}`}
            aria-label="ExternalNodes Panel"
            position={"top-end"}
            hideOnOutsideClick={false}
            showClose={true}
            isVisible={diagram.externalNodesPanel.isOpen}
            enableFlip={true}
            bodyContent={<ExternalNodesPanel />}
          >
            <button className={"kie-dmn-editor--external-nodes-panel-toggle-button"} onClick={toggleExternalNodesPanel}>
              <MigrationIcon size={"sm"} />
            </button>
          </Popover>
        </aside>
      </RF.Panel>
    </>
  );
}