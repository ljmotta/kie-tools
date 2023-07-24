import * as React from "react";
import * as RF from "reactflow";
import { EdgeType, NodeType } from "../connections/graphStructure";
import { Flex, FlexItem } from "@patternfly/react-core/dist/js/layouts/Flex";
import {
  AssociationPath,
  AuthorityRequirementPath,
  InformationRequirementPath,
  KnowledgeRequirementPath,
} from "../edges/Edges";
import {
  handleStyle,
  InputDataNodeSvg,
  DecisionNodeSvg,
  BkmNodeSvg,
  DecisionServiceNodeSvg,
  KnowledgeSourceNodeSvg,
  TextAnnotationNodeSvg,
  GroupNodeSvg,
} from "./Nodes";

const handleButtonSize = 34; // That's the size of the button. This is a "magic number", as it was obtained from the rendered page.
const svgViewboxPadding = Math.sqrt(Math.pow(handleButtonSize, 2) / 2) - handleButtonSize / 2; // This lets us create a square that will perfectly fit inside the button circle.

const edgeSvgViewboxSize = 25;

const nodeSvgProps = { width: 100, height: 70, x: 8, y: 24, strokeWidth: 8 };
const nodeSvgViewboxSize = nodeSvgProps.width + 2 * nodeSvgProps.strokeWidth;

export function OutgoingStuffNodePanel(props: { isVisible: boolean; nodes: NodeType[]; edges: EdgeType[] }) {
  const style: React.CSSProperties = React.useMemo(
    () => ({
      visibility: props.isVisible ? undefined : "hidden",
    }),
    [props.isVisible]
  );

  return (
    <>
      <Flex className={"kie-dmn-editor--outgoing-stuff-node-panel"} style={style}>
        <FlexItem>
          {props.edges.map((e) => (
            <RF.Handle
              key={e}
              id={e}
              isConnectableEnd={false}
              type={"source"}
              style={handleStyle}
              position={RF.Position.Top}
            >
              <svg
                width={"100%"}
                height={"100%"}
                viewBox={`0 0 ${edgeSvgViewboxSize} ${edgeSvgViewboxSize}`}
                style={{ padding: `${svgViewboxPadding}px`, pointerEvents: "none" }}
              >
                {e === "edge_informationRequirement" && (
                  <InformationRequirementPath d={`M2,${edgeSvgViewboxSize - 2} L${edgeSvgViewboxSize - 2},0`} />
                )}
                {e === "edge_knowledgeRequirement" && (
                  <KnowledgeRequirementPath d={`M2,${edgeSvgViewboxSize - 2} L${edgeSvgViewboxSize - 2},0`} />
                )}
                {e === "edge_authorityRequirement" && (
                  <AuthorityRequirementPath
                    d={`M2,${edgeSvgViewboxSize - 2} L${edgeSvgViewboxSize - 2},2`}
                    centerToConnectionPoint={false}
                  />
                )}
                {e === "edge_association" && (
                  <AssociationPath d={`M2,${edgeSvgViewboxSize - 2} L${edgeSvgViewboxSize},0`} strokeWidth={2} />
                )}
              </svg>
            </RF.Handle>
          ))}
        </FlexItem>

        <FlexItem>
          {props.nodes.map((n) => (
            <RF.Handle
              key={n}
              id={n}
              isConnectableEnd={false}
              type={"source"}
              style={handleStyle}
              position={RF.Position.Top}
            >
              <svg
                width={"100%"}
                height={"100%"}
                viewBox={`0 0 ${nodeSvgViewboxSize} ${nodeSvgViewboxSize}`}
                style={{ padding: `${svgViewboxPadding}px`, pointerEvents: "none" }}
              >
                {n === "node_inputData" && <InputDataNodeSvg {...nodeSvgProps} />}
                {n === "node_decision" && <DecisionNodeSvg {...nodeSvgProps} />}
                {n === "node_bkm" && <BkmNodeSvg {...nodeSvgProps} />}
                {n === "node_decisionService" && (
                  <DecisionServiceNodeSvg
                    {...nodeSvgProps}
                    height={nodeSvgProps.width}
                    dividerLineY={nodeSvgProps.width / 3}
                  />
                )}
                {n === "node_knowledgeSource" && <KnowledgeSourceNodeSvg {...nodeSvgProps} />}
                {n === "node_textAnnotation" && <TextAnnotationNodeSvg {...nodeSvgProps} />}
                {n === "node_group" && <GroupNodeSvg {...nodeSvgProps} />}
              </svg>
            </RF.Handle>
          ))}
        </FlexItem>
      </Flex>
    </>
  );
}