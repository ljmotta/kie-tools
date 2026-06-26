# Canvas split: commands → thin bindings + orchestration

**Labels:** ready-for-agent
_Source: ../PRD-workflow-editor-adaptations.md · the hardest partition in ADR-0004 (sequenced last)_

## What to build

Split the canvas commands along the rendering-vs-data/orchestration line. Today a
single command fuses _what triggers it_ (keyboard shortcut / context-menu item)
with _what it does to the model_ (a sequence of mutations).

- **Orchestration** — the model-changing sequence each command performs — moves
  into **named orchestration functions in the logic layer** (upstream-owned,
  inherited). Example: a "duplicate selected nodes" function that clones the
  elements, their edges, and repositions them.
- **Trigger bindings** — which shortcut / menu item fires which orchestration
  function — stay **fork-owned** interaction and may diverge in the Carbon UI.

Result: command _behavior_ keeps flowing from upstream; the _trigger surface_ is
the fork's.

## Acceptance criteria

- [ ] Command orchestration (model-changing sequences) extracted into named functions in the logic layer
- [ ] Canvas retains only thin trigger bindings that call those functions
- [ ] Orchestration covered by characterization tests at the three-surface seam
- [ ] Trigger surface (shortcuts/menu) is fork-owned and free to diverge
- [ ] CI guard passes; the orchestration extraction is behavior-neutral and upstreamable

## Blocked by

- 6-canvas-chrome-and-rendering
