# Carbon toolchain wired, coexisting with PatternFly

**Labels:** ready-for-agent
_Source: ../PRD-workflow-editor-adaptations.md · respects ADR-0005_

## What to build

The walking skeleton for the presentation swap. Add Carbon (`@carbon/react`,
`@carbon/styles`) to the package and load its global styles at the composition
root so Carbon components can render inside the editor, while PatternFly remains
in place for every not-yet-converted component.

This is deliberately a **coexisting** state: Carbon's global styles sit alongside
PatternFly's `base.css` for now. Dropping the PatternFly base is the _final_
Phase-1 slice (ADR-0005); doing it here would break all still-PatternFly panels.
Nothing is re-skinned in this slice — the goal is only that Carbon is wired,
builds, and renders.

## Acceptance criteria

- [ ] `@carbon/react` and `@carbon/styles` added as dependencies
- [ ] Carbon global styles loaded at the fork-owned composition root, alongside the existing PatternFly base
- [ ] Editor builds and runs; all existing PatternFly UI is visually unaffected
- [ ] At least one Carbon component renders correctly in the running editor (smoke check)
- [ ] React 18 compatibility confirmed (no peer/runtime issues)

## Blocked by

- None - can start immediately
