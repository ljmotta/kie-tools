# Drop PatternFly global base + Carbon canvas CSS

**Labels:** ready-for-agent
_Source: ../PRD-workflow-editor-adaptations.md · end-state of ADR-0005; completes Phase 1_

## What to build

The end-state of the single-global-design-system decision, and the slice that
completes Phase 1. Once all editor components are Carbon, remove the temporary
PatternFly/Carbon coexistence:

- Remove PatternFly `base.css` from the composition root so `@carbon/styles` is
  the only global design-system base.
- Replace the engine's `patternfly-customizations.css` with Carbon-flavored
  canvas CSS (fork-owned canvas styling per ADR-0004).

The only PatternFly remaining after this is the engine's 2 internally-rendered
components (`SelectionStatusLabel`, `Draggable`), which are removed in Phase 2;
style them locally or accept minor visual imperfection until then.

## Acceptance criteria

- [ ] PatternFly `base.css` no longer loaded
- [ ] `@carbon/styles` is the only global design-system base
- [ ] `patternfly-customizations.css` replaced with Carbon canvas CSS
- [ ] No global CSS reset / token / portal-z-index conflicts remain
- [ ] Editor is fully Carbon except the 2 known internal engine components
- [ ] Full Carbon Playwright suite green

## Blocked by

- 5-remaining-panels
- 6-canvas-chrome-and-rendering
- 7-canvas-split-commands-orchestration
