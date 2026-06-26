# Canvas chrome + node/edge rendering in Carbon

**Labels:** ready-for-agent
_Source: ../PRD-workflow-editor-adaptations.md · respects ADR-0004; engine untouched (ADR-0002 is Phase 2)_

## What to build

Re-skin the canvas presentation in Carbon: the chrome (palette, empty state,
top-right panels, version label, node-morphing panel) and the node/edge rendering.

For the engine's **composed** building blocks (`EditableNodeLabel`,
`InfoNodePanel`, `OutgoingStuffNodePanel`), supply **fork-owned Carbon versions**
and have the node/edge components import those instead of the engine's PatternFly
ones. **Do not edit `xyflow-react-kie-diagram`** — the engine's agnostic refactor
is Phase 2. The 2 internally-rendered engine components (`SelectionStatusLabel`,
`Draggable`) stay PatternFly for now.

Per ADR-0004, this slice owns _rendering_ only: data shapes and domain
(`BpmnDiagramDomain`, node/edge `*Data`) remain upstream-owned and unchanged.

## Acceptance criteria

- [ ] Canvas chrome rendered in Carbon
- [ ] Node/edge components use fork-owned Carbon building blocks instead of the engine's PatternFly ones
- [ ] No edits to `xyflow-react-kie-diagram`
- [ ] Canvas data shapes / domain remain upstream-owned and unchanged
- [ ] CI guard passes for the canvas presentation directories
- [ ] Carbon Playwright coverage for the re-skinned chrome

## Blocked by

- 1-carbon-toolchain-coexisting-styles
- 3-first-panel-end-to-end
