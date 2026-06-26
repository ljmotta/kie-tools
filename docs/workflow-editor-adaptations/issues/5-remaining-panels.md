# Remaining panels (simple + complex)

**Labels:** ready-for-agent
_Source: ../PRD-workflow-editor-adaptations.md · respects ADR-0001, ADR-0004 (panels)_

## What to build

Apply the proven slice-3 pattern to **all remaining** `propertiesPanel/` and
`overlaysPanel/` panels — from the straightforward ones through the heavy ones
(`singleNodeProperties` with its many files, `dataMapping`, `variables`,
`correlations`).

For each panel, the same end-to-end path: characterization tests at the
three-surface seam → behavior-neutral extraction to mutations/domain-selectors/
validation (upstreamable) → Carbon re-skin with view-model shaping in the
component → drop the upstream UI test and add a Carbon Playwright test.

The outcome is that `propertiesPanel/` and `overlaysPanel/` become clean,
fork-owned UI directories with no domain logic inline.

## Acceptance criteria

- [ ] Every remaining panel re-skinned in Carbon
- [ ] Each panel's domain logic extracted to the three surfaces; CI guard passes across both directories
- [ ] Characterization tests cover the extracted domain behavior
- [ ] Upstream UI tests dropped; Carbon Playwright tests cover the panels
- [ ] `propertiesPanel/` and `overlaysPanel/` contain only fork-owned UI (no inline domain logic)
- [ ] Extractions are behavior-neutral and ready to submit upstream

## Blocked by

- 3-first-panel-end-to-end
