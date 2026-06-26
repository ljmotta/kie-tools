# Extraction-gate CI guard

**Labels:** ready-for-agent
_Source: ../PRD-workflow-editor-adaptations.md · enforces ADR-0001, ADR-0003_

## What to build

A CI check that enforces the inheritance boundary: a fork-owned UI directory must
not contain domain logic that belongs in the three surfaces (mutations, domain
selectors, validation). It fails the build when a UI file inlines model writes or
validation rules, or imports a low-level model-building helper.

Crucially, it must **not** flag legitimate usage: a component _calling_ a named
mutation is allowed, and **view-model shaping** (Carbon dropdown items, table
column configs) is legitimately UI-owned. The guard targets _model-building_
leakage, not data-shaping.

It starts passing vacuously against today's tree and becomes the enforcement
mechanism every later slice relies on.

## Acceptance criteria

- [ ] Check runs both in CI and locally
- [ ] Fails when a UI-owned directory imports a model-building helper (e.g. `_elementVisitor`, `addOrGet*`) or inlines a validation rule
- [ ] Does **not** flag a component calling a named mutation, nor view-model shaping
- [ ] Denylist and the procedure to extend it are documented
- [ ] Green against the current (pre-migration) tree

## Blocked by

- None - can start immediately
