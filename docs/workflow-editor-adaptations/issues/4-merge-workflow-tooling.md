# Merge-workflow tooling & runbook

**Labels:** ready-for-agent
_Source: ../PRD-workflow-editor-adaptations.md · implements ADR-0003_

## What to build

The operational backbone of the "inherit updates" goal. A repeatable procedure to
pull upstream and resolve conflicts so the fork keeps its UI and inherits all
logic.

- A scripted resolution that takes the **fork's** version of the UI-owned
  directories on conflict (`git checkout --ours` over those directories). **No
  `.gitattributes` / no persistent merge driver** — resolution is explicit per
  merge.
- A documented runbook: merge upstream → resolve UI directories to the fork →
  run the post-merge typecheck/test gate.
- Validation by replaying an upstream-style change to the slice-3 Carbon panel and
  confirming the fork wins on UI files while logic-directory changes merge
  normally.

## Acceptance criteria

- [ ] A script/command resolves UI-owned directories to the fork's version after a merge
- [ ] Runbook documents the upstream-merge procedure and the post-merge typecheck/test gate
- [ ] Demonstrated: an upstream change touching the converted panel resolves to the fork cleanly; a change in a logic directory merges normally
- [ ] A simulated logic-contract drift (changed selector/mutation signature) in a fork UI file is caught by the post-merge typecheck/tests

## Blocked by

- 3-first-panel-end-to-end (needs a real fork-owned UI file to conflict against)
