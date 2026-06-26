# First panel end-to-end (tracer bullet)

**Labels:** ready-for-agent
_Source: ../PRD-workflow-editor-adaptations.md · exercises ADR-0001, ADR-0003, ADR-0004 (panels), ADR-0005 (coexisting)_

## What to build

Take the **simplest panel** through the entire workflow once, to prove every
architectural decision on a single real example. After this slice the pattern is
repeatable and the approach is de-risked.

End-to-end path:

1. **Characterization tests** at the three-surface API pin the panel's current
   domain behavior (given a `Normalized` BPMN model, assert the model/boolean/
   model-fact results).
2. **Extraction** — move the panel's domain logic out of the component into
   mutations / domain selectors / validation. This is a behavior-neutral refactor
   suitable for an upstream PR; the characterization tests stay green.
3. **Carbon re-skin** — rebuild the panel in Carbon. Domain reads come from
   domain selectors; **view-model shaping stays in the component**; the component
   calls mutations directly (no controller hook).
4. **Tests** — drop the panel's upstream UI test; author a fresh Carbon Playwright
   test asserting interaction behavior and view-model rendering.

## Acceptance criteria

- [ ] Characterization tests at the three-surface seam pin the panel's domain behavior and remain green through extraction
- [ ] Domain logic moved into mutations/domain-selectors/validation; the component holds only interaction + view-model shaping
- [ ] CI guard (issue 2) passes for the converted panel
- [ ] Panel renders and behaves correctly in Carbon
- [ ] Upstream UI test removed; a Carbon Playwright test added and passing
- [ ] The extraction diff is behavior-neutral and ready to submit upstream

## Blocked by

- 1-carbon-toolchain-coexisting-styles
- 2-extraction-gate-ci-guard
