import { createContext, useContext } from "react";
import * as RF from "reactflow";
import { StoreApi, UseBoundStore, create } from "zustand";
import { WithImmer, immer } from "zustand/middleware/immer";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { DmnModel } from "@kie-tools/dmn-marshaller";
import { DmnDiagramNodeData } from "../diagram/nodes/Nodes";

export interface DmnEditorDiagramNodeStatus {
  selected: boolean;
  dragging: boolean;
  resizing: boolean;
}
export interface DmnEditorDiagramEdgeStatus {
  selected: boolean;
  draggingWaypoint: boolean;
}

export interface SnapGrid {
  isEnabled: boolean;
  x: number;
  y: number;
}

export type DropTargetNode = undefined | RF.Node<DmnDiagramNodeData>;

export interface State {
  dispatch: Dispatch;
  dmn: { model: DmnModel };
  boxedExpressionEditor: {
    openExpressionId: string | undefined;
    selectedObjectId: string | undefined;
    propertiesPanel: {
      isOpen: boolean;
    };
  };
  dataTypesEditor: {
    activeItemDefinitionId: string | undefined;
    expandedItemComponentIds: string[];
  };
  navigation: {
    tab: DmnEditorTab;
  };
  diagram: {
    drdIndex: number;
    edgeIdBeingUpdated: string | undefined;
    dropTargetNode: DropTargetNode;
    propertiesPanel: {
      isOpen: boolean;
      elementId: string | undefined;
    };
    overlaysPanel: {
      isOpen: boolean;
    };
    externalNodesPanel: {
      isOpen: boolean;
    };
    overlays: {
      enableNodeHierarchyHighlight: boolean;
      enableExecutionHitsHighlights: boolean;
      enableCustomNodeStyles: boolean;
      enableDataTypesToolbarOnNodes: boolean;
    };
    snapGrid: SnapGrid;
    selectedNodes: Array<string>;
    draggingNodes: Array<string>;
    resizingNodes: Array<string>;
    selectedEdges: Array<string>;
    draggingWaypoints: Array<string>;
  };
}

export type Dispatch = {
  dmn: {
    reset: (model: State["dmn"]["model"]) => void;
  };
  boxedExpressionEditor: {
    open: (id: string) => void;
    close: () => void;
    propertiesPanel: {
      open: () => void;
      close: () => void;
      toggle: () => void;
    };
  };
  diagram: {
    propertiesPanel: {
      open: () => void;
      close: () => void;
    };
    togglePropertiesPanel: (state: State) => void;
    toggleOverlaysPanel: (state: State) => void;
    toggleExternalNodesPanel: (state: State) => void;
    setSnapGrid: (state: State, snap: SnapGrid) => void;
    setNodeStatus: (state: State, nodeId: string, status: Partial<DmnEditorDiagramNodeStatus>) => void;
    setEdgeStatus: (state: State, edgeId: string, status: Partial<DmnEditorDiagramEdgeStatus>) => void;
  };
};

export enum DmnEditorTab {
  EDITOR,
  DATA_TYPES,
  INCLUDED_MODELS,
}

export const NODE_LAYERS = {
  GROUP_NODE: 0,
  NODES: 1000, // We need a difference > 1000 here, since ReactFlow will add 1000 to the z-index when a node is selected.
  DECISION_SERVICE_NODE: 2000, // We need a difference > 1000 here, since ReactFlow will add 1000 to the z-index when a node is selected.
  NESTED_NODES: 4000,
};

type ExtractState = StoreApi<State> extends { getState: () => infer T } ? T : never;

export function useDmnEditorStore<StateSlice = ExtractState>(
  selector: (state: State) => StateSlice,
  equalityFn?: (a: StateSlice, b: StateSlice) => boolean
) {
  const store = useContext(DmnEditorStoreApiContext);

  if (store === null) {
    throw new Error("Can't use DMN Editor Store outside of the DmnEditor component.");
  }

  return useStoreWithEqualityFn(store, selector, equalityFn);
}

export function useDmnEditorStoreApi() {
  return useContext(DmnEditorStoreApiContext);
}

export const DmnEditorStoreApiContext = createContext<StoreApiType>({} as any);

export type StoreApiType = UseBoundStore<WithImmer<StoreApi<State>>>;

export const defaultStaticState = () => ({
  boxedExpressionEditor: {
    openExpressionId: undefined,
    selectedObjectId: undefined,
    propertiesPanel: {
      isOpen: false,
    },
  },
  navigation: {
    tab: DmnEditorTab.EDITOR,
  },
  diagram: {
    drdIndex: 0,
    edgeIdBeingUpdated: undefined,
    dropTargetNode: undefined,
    propertiesPanel: {
      isOpen: false,
      elementId: undefined,
    },
    overlaysPanel: {
      isOpen: false,
    },
    externalNodesPanel: {
      isOpen: false,
    },
    overlays: {
      enableNodeHierarchyHighlight: false,
      enableExecutionHitsHighlights: false,
      enableCustomNodeStyles: false,
      enableDataTypesToolbarOnNodes: true,
    },
    snapGrid: { isEnabled: true, x: 20, y: 20 },
    selectedNodes: [],
    draggingNodes: [],
    resizingNodes: [],
    selectedEdges: [],
    draggingWaypoints: [],
  },
});

export function createDmnEditorStore(model: State["dmn"]["model"]) {
  return create(
    immer<State>((set, get) => ({
      dmn: {
        model,
      },
      dataTypesEditor: {
        activeItemDefinitionId: model.definitions.itemDefinition?.[0]?.["@_id"],
        expandedItemComponentIds: [],
      },
      ...defaultStaticState(),
      dispatch: {
        dmn: {
          reset: (model) => {
            set((state) => {
              state.diagram.selectedNodes = [];
              state.diagram.draggingNodes = [];
              state.diagram.resizingNodes = [];
              state.navigation.tab = DmnEditorTab.EDITOR;
              state.boxedExpressionEditor.openExpressionId = undefined;
              state.boxedExpressionEditor.selectedObjectId = undefined;
            });
          },
        },
        boxedExpressionEditor: {
          propertiesPanel: {
            open: () => {
              set((state) => {
                state.boxedExpressionEditor.propertiesPanel.isOpen = true;
              });
            },
            close: () => {
              set((state) => {
                state.boxedExpressionEditor.propertiesPanel.isOpen = false;
              });
            },
            toggle: () => {
              set((state) => {
                state.boxedExpressionEditor.propertiesPanel.isOpen =
                  !state.boxedExpressionEditor.propertiesPanel.isOpen;
              });
            },
          },
          open: (id) => {
            set((state) => {
              state.boxedExpressionEditor.openExpressionId = id;
              state.boxedExpressionEditor.selectedObjectId = undefined;
              state.boxedExpressionEditor.propertiesPanel.isOpen = state.diagram.propertiesPanel.isOpen;
            });
          },
          close: () => {
            set((state) => {
              state.diagram.propertiesPanel.isOpen = state.boxedExpressionEditor.propertiesPanel.isOpen;
              state.boxedExpressionEditor.openExpressionId = undefined;
              state.boxedExpressionEditor.selectedObjectId = undefined;
            });
          },
        },
        diagram: {
          propertiesPanel: {
            open: () => {
              set((state) => {
                state.diagram.propertiesPanel.isOpen = true;
              });
            },
            close: () => {
              set((state) => {
                state.diagram.propertiesPanel.isOpen = false;
              });
            },
          },
          togglePropertiesPanel: (prev) => {
            prev.diagram.propertiesPanel.isOpen = !prev.diagram.propertiesPanel.isOpen;
          },
          toggleOverlaysPanel: (prev) => {
            prev.diagram.overlaysPanel.isOpen = !prev.diagram.overlaysPanel.isOpen;
          },
          toggleExternalNodesPanel: (prev) => {
            prev.diagram.externalNodesPanel.isOpen = !prev.diagram.externalNodesPanel.isOpen;
          },
          setSnapGrid: (prev, snapGrid) => {
            prev.diagram.snapGrid = snapGrid;
          },
          setNodeStatus: (prev, nodeId, newStatus) => {
            //selected
            if (newStatus.selected !== undefined) {
              if (newStatus.selected) {
                prev.diagram.selectedNodes.push(nodeId);
              } else {
                prev.diagram.selectedNodes = prev.diagram.selectedNodes.filter((s) => s !== nodeId);
              }
            }
            //dragging
            if (newStatus.dragging !== undefined) {
              if (newStatus.dragging) {
                prev.diagram.draggingNodes.push(nodeId);
              } else {
                prev.diagram.draggingNodes = prev.diagram.draggingNodes.filter((s) => s !== nodeId);
              }
            }
            // resizing
            if (newStatus.resizing !== undefined) {
              if (newStatus.resizing) {
                prev.diagram.resizingNodes.push(nodeId);
              } else {
                prev.diagram.resizingNodes = prev.diagram.resizingNodes.filter((s) => s !== nodeId);
              }
            }
          },
          setEdgeStatus: (prev, edgeId, newStatus) => {
            //selected
            if (newStatus.selected !== undefined) {
              if (newStatus.selected) {
                prev.diagram.selectedEdges.push(edgeId);
              } else {
                prev.diagram.selectedEdges = prev.diagram.selectedEdges.filter((s) => s !== edgeId);
              }
            }
            //dragging
            if (newStatus.draggingWaypoint !== undefined) {
              if (newStatus.draggingWaypoint) {
                prev.diagram.draggingWaypoints.push(edgeId);
              } else {
                prev.diagram.draggingWaypoints = prev.diagram.draggingWaypoints.filter((s) => s !== edgeId);
              }
            }
          },
        },
      },
    }))
  );
}