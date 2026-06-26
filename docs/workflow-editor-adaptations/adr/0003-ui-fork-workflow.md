# UI-fork workflow: fork-wins on UI conflicts, logic changes only upstream

## Context

The fork owns a Carbon presentation layer and wants upstream non-UI updates to
keep flowing in with minimal merge effort. 55 of 71 PatternFly files currently
mix UI with domain logic in the same file, so a naive "keep my UI on conflict"
rule would silently drop the domain fixes the fork exists to inherit.

## Decision

- The fork edits **UI only**. Any logic change is made **upstream via PR**,
  never diverged in the fork.
- On merge from upstream, **UI-file conflicts resolve to the fork** by a
  manual/scripted `git checkout --ours -- <ui dirs>` at merge time. **No
  persistent git merge driver** (no `.gitattributes`) — resolution is explicit
  and visible per merge, made trivial by the directory partition (ADR-0004).
- A UI file may be taken with `--ours` **only once it is free of domain logic**.
  Reaching that state is an **upstream extraction PR** (push the panel's domain
  logic into mutations / domain-selectors / validation), done **before** the
  Carbon swap. This gate is **strict**: no panel is Carbon-ized until its
  extraction has landed upstream and been pulled in. (Chosen over a pragmatic
  resolve-now-backfill-later interim, which has a silent-drop window.)

## Consequences

- Migration pace is bounded by upstream review throughput, not just fork effort.
  Front-loading extraction as one upstream campaign is preferred over drip-feed.
- Taking the fork's UI file on conflict ignores upstream's UI adaptations to
  logic-contract changes, so a selector/mutation signature change upstream can
  break a fork UI file that kept its old call. The fork's post-merge
  typecheck/tests are the safety net; stable logic-surface APIs (the Phase-3
  `bpmn-editor-core`) reduce this drift.
- New upstream UI features arrive in PatternFly and must be re-skinned; the fork
  is never "done."
