# Single global design system; drop PatternFly base.css

## Context

`BpmnEditor.tsx` (the fork-owned composition root) imports
`@patternfly/react-core/dist/styles/base.css` — a global reset + `:root` token
set. Carbon's `@carbon/styles` ships its own global reset and tokens. Loaded
together they collide on `body`/`*`/`:root`, fonts, box-sizing, and portal
overlay z-indexes.

## Decision

The editor loads **one** global design-system base: Carbon. The fork swaps
`@patternfly/.../base.css` → `@carbon/styles` at the composition root. The only
PatternFly remaining during Phase 1 — the engine's 2 internal components
(`SelectionStatusLabel`, `Draggable`) — get local/scoped CSS or accept minor
visual imperfection until Phase 2 removes them. The engine's
`patternfly-customizations.css` becomes fork-owned canvas CSS, replaced with a
Carbon-flavored equivalent (consistent with ADR-0004).

Rejected: loading both global bases (two fighting resets) and scoping PatternFly
via shadow DOM/prefixing (fragile; PatternFly isn't built for it).
