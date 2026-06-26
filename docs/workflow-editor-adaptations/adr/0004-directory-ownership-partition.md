# Directory partition by owner; extraction centralizes logic

## Context

The UI-fork workflow (ADR-0003) resolves merge conflicts by taking the fork's
version of UI files. That is only safe and easy if every file has a single,
path-evident owner. Today logic and UI are fused in the same files (55/71
panels; nearly all of `diagram/`).

## Decision

Ownership is by directory. Extraction **relocates** domain logic out of feature
folders into central, upstream-owned homes (`mutations/`, `store/` selectors,
`validation/`), leaving the presentation directories logic-free and fork-owned.

- **Panels** (`propertiesPanel/`, `overlaysPanel/`) — become clean fork-owned UI
  directories after extraction. Straightforward; done first.
- **Canvas** (`diagram/`) — entangled; split by **rendering-vs-data/
  orchestration**. Fork owns rendering, chrome, and composition shells
  (palette, empty state, top-right panels, version label, `nodes/`+`edges/`
  rendering, `BpmnDiagram.tsx` shell). Upstream owns data shapes, domain
  (`BpmnDiagramDomain`), and command orchestration — `BpmnDiagramCommands`
  becomes thin UI bindings calling mutation/orchestration functions whose
  sequences live in `mutations/`. Sequenced **last** in Phase 1.

Rejected: fork owning all of `diagram/` (would forfeit canvas-logic
inheritance).

## Consequences

- The centralized logic homes are exactly the future `bpmn-editor-core` surface,
  so this work doubles as Phase-3 groundwork.
- `BpmnDiagram.tsx` as a composition shell is fork-owned; upstream wiring changes
  for new features arrive as re-skin work, not automatic inheritance.
