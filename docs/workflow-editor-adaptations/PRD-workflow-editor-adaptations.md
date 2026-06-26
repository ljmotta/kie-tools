# PRD: Workflow Editor adaptations of the BPMN Editor

> Vocabulary follows `CONTEXT.md`; decisions respect ADR-0001…0005.

## Problem Statement

I maintain a fork of `@kie-tools/bpmn-editor` because I need the editor presented
in IBM Carbon instead of PatternFly. The editor I'm forking is valuable mostly
for its **logic** — the BPMN model, mutations, normalization, validation — which
upstream keeps improving with features and bugfixes. I want those non-UI updates
to keep flowing into my fork with minimal effort, while I freely own the
**presentation layer**.

Today that's hard: the editor's **panel-embedded logic** is fused into PatternFly
components (55 of 71 UI files import domain logic directly), and the shared
**engine** (`xyflow-react-kie-diagram`) and **canvas** are also PatternFly-bound.
So naively re-skinning would either fork the logic (losing inheritance) or force
painful, conflict-ridden merges on every upstream pull.

## Solution

Re-skin the editor onto Carbon as a **hard fork of the monorepo** (the **fork
vehicle**), structured so that **logic** and **presentation** never live in the
same file. Domain logic is pushed behind an **inheritance boundary** of three
upstream-owned surfaces — **mutations**, **domain selectors**, and
**validation** — which the fork consumes but never edits. Everything else
(layout, widgets, **view-models**, **interaction behavior**) is fork-owned Carbon
UI.

The fork follows the **UI-fork workflow**: it edits UI only; any logic change is
contributed **upstream via PR**; on merge, UI-file conflicts are resolved to the
fork with an explicit `git checkout --ours` over the UI directories. A strict
**extraction gate** ensures a panel is Carbon-ized only after its domain logic
has been extracted upstream, so the fork-wins resolution never silently drops an
inherited fix.

Work proceeds in phases: **Phase 1** Carbon-izes the editor's own components
(the long pole); **Phase 2** makes the engine design-system-agnostic; **Phase 3**
extracts a `bpmn-editor-core` package, at which point the editor's logic surfaces
become a formal dependency and the fork is "just another consumer" (the
**upstream goal**).

## User Stories

1. As a fork maintainer, I want upstream's mutation/validation bugfixes to reach my Carbon editor without manual porting, so that I inherit logic improvements for free.
2. As a fork maintainer, I want logic and presentation to never share a file, so that I can resolve merge conflicts by simply taking my UI version.
3. As a fork maintainer, I want a directory partition where each directory has a single, path-evident owner, so that conflict resolution is a one-line, auditable command.
4. As a fork maintainer, I want to resolve UI conflicts with an explicit per-merge `git checkout --ours` over UI directories, so that resolution is visible and I avoid a silent always-ours merge driver.
5. As a fork maintainer, I want a strict extraction gate, so that I never Carbon-ize a panel whose domain logic is still trapped in the component (which would drop inherited fixes).
6. As a fork maintainer, I want domain logic extracted into mutations/domain-selectors/validation upstream first, so that both the PatternFly upstream and my Carbon fork share the same logic.
7. As an upstream contributor, I want my extractions to be behavior-neutral refactors, so that they are easy for maintainers to accept and risk nothing for upstream users.
8. As a fork maintainer, I want each panel re-skinned in Carbon, so that the properties panels match my product's design system.
9. As a fork maintainer, I want the canvas chrome (palette, empty state, top-right panels, version label, node-morphing panel) re-skinned in Carbon, so that the whole editor is visually coherent.
10. As a fork maintainer, I want to recompose the UI freely — reorder fields, merge or split panels, change widgets and positioning — so that the Carbon editor can have its own interaction behavior.
11. As a fork maintainer, I want to keep upstream's domain behavior identical, so that re-composition changes presentation only and stays inheritable.
12. As a fork maintainer, I want any intentional domain-behavior divergence to be an explicit, marked exception, so that I know exactly which fixes I've opted out of inheriting.
13. As a fork maintainer, I want components to call mutations directly and read domain selectors directly (no per-panel controller hook), so that the UI owns its interaction glue without an extra abstraction.
14. As a fork maintainer, I want domain selectors to return UI-agnostic model facts, so that the shared read surface never accretes Carbon-isms and stays inheritable.
15. As a fork maintainer, I want view-model shaping (Carbon dropdown items, table column configs) to live in the fork-owned component, so that UI-specific concerns never leak into the inherited surface.
16. As a fork maintainer, I want `computed`/`ComputedStateCache` reserved for expensive cache-worthy derivations, so that simple reads stay plain selectors.
17. As a fork maintainer, I want the canvas (`diagram/`) split by rendering-vs-data/orchestration, so that I own the rendering while inheriting canvas command orchestration.
18. As a fork maintainer, I want `BpmnDiagramCommands` reduced to thin UI bindings over mutation/orchestration functions, so that command behavior is inherited while the trigger surface is mine.
19. As a fork maintainer, I want the canvas split sequenced last in Phase 1, so that I capture the easy, high-value panel extractions before the hardest area.
20. As a fork maintainer, I want the diagram engine to eventually carry no design system, so that it becomes reusable by my Carbon canvas later.
21. As an upstream contributor, I want the engine's composed building blocks relocated into the consumers, so that each consumer owns its styled version.
22. As an upstream contributor, I want the engine's internally-rendered components (`SelectionStatusLabel`, `Draggable`) rewritten as headless HTML/CSS, so that the engine depends on neither PatternFly nor Carbon.
23. As a fork maintainer, I want the engine refactor deferred to Phase 2 and contributed upstream, so that I don't carry the heaviest possible merge surface in my fork.
24. As a fork maintainer, I want one global design system (Carbon) loaded, so that I avoid two fighting CSS resets, token sets, fonts, and portal z-indexes.
25. As a fork maintainer, I want to drop PatternFly's `base.css` at the composition root and load `@carbon/styles`, so that the editor has one coherent global theme.
26. As a fork maintainer, I want the engine's `patternfly-customizations.css` replaced with Carbon-flavored canvas CSS, so that the canvas matches the rest of the editor.
27. As a fork maintainer, I want the 2 surviving PatternFly engine components styled locally (or temporarily imperfect) during Phase 1, so that I don't reintroduce the full PatternFly base.
28. As a fork maintainer, I want a CI guard that fails when a fork-owned UI directory imports a model-building helper or inlines a mutation/validation rule, so that incomplete extractions are caught before they reach `--ours`.
29. As a fork maintainer, I want a typecheck/test pass after every upstream merge, so that I catch UI files that kept an old call against a changed logic-surface contract.
30. As a fork maintainer, I want stable logic-surface APIs, so that fork-wins UI files drift less when upstream changes contracts.
31. As a fork maintainer, I want new upstream UI features (arriving in PatternFly) to be visibly flagged, so that I know what still needs Carbon re-skinning.
32. As an upstream contributor, I want the centralized logic homes to anticipate the `bpmn-editor-core` surface, so that extraction doubles as Phase-3 groundwork.
33. As a fork maintainer, I want characterization tests pinning domain behavior before extraction, so that I can prove an extraction changed nothing.
34. As a fork maintainer, I want domain behavior tested at the three-surface API rather than through the UI, so that logic tests survive the presentation swap.
35. As a fork maintainer, I want Carbon components tested at the existing Storybook/Playwright seam, so that I validate interaction behavior and view-model rendering.
36. As a fork maintainer, I want upstream-owned logic tests inherited while I drop upstream's UI suite wholesale and author a fresh Carbon Playwright suite, so that test ownership follows the same partition as code and no PatternFly-oriented assertions linger.
37. As a fork maintainer, I want the e2e/test directories treated as UI-owned (resolved to the fork on merge), so that incoming upstream UI tests are dropped as routine re-skin upkeep rather than merged.

## Implementation Decisions

**Inheritance boundary (ADR-0001).** Domain logic lives in three upstream-owned
surfaces — **mutations** (writes), **domain selectors** (UI-agnostic model-fact
reads), **validation** (rules). Components consume them and contain none of it
inline. No per-panel controller hook. **View-model** shaping is fork-owned in the
component. `computed`/`ComputedStateCache` is for expensive cached derivations
only.

**Divergence rule.** Only **interaction behavior** diverges in the Carbon UI;
**domain behavior** stays identical and inherited. Intentional domain divergence
is a marked exception.

**Fork vehicle & workflow (ADR-0003).** Hard fork of the monorepo. Fork edits UI
only; logic changes go upstream as PRs. UI-file conflicts resolve to the fork via
manual/scripted `git checkout --ours -- <ui dirs>` — **no `.gitattributes`, no
merge driver**. Strict **extraction gate**: a panel is Carbon-ized only after its
domain logic has been extracted upstream and pulled in.

**Directory partition (ADR-0004).** Ownership is by directory. Extraction
relocates domain logic into central upstream-owned homes (`mutations/`, `store/`
domain selectors, `validation/`), leaving presentation directories fork-owned.
Panels (`propertiesPanel/`, `overlaysPanel/`) partition cleanly — done first.
The **canvas** (`diagram/`) is split by rendering-vs-data/orchestration: fork owns
rendering, chrome, and composition shells; upstream owns data shapes, domain, and
command orchestration (`BpmnDiagramCommands` → thin bindings over mutation
sequences). Canvas split sequenced last in Phase 1.

**Engine (ADR-0002, Phase 2).** `xyflow-react-kie-diagram` becomes
design-system-agnostic: composed blocks relocate to consumers; internally-
rendered blocks (`SelectionStatusLabel`, `Draggable`) become headless HTML/CSS.
Contributed upstream; not held in the fork.

**CSS (ADR-0005).** One global base: Carbon. Composition root swaps PatternFly
`base.css` → `@carbon/styles`. Engine `patternfly-customizations.css` → Carbon
canvas CSS. The 2 Phase-1 PatternFly engine components get local/scoped CSS.

**Phasing.** Phase 1 = Carbon-ize the editor's own components. Phase 2 = agnostic
engine. Phase 3 = extract `bpmn-editor-core` and repoint the fork's imports.

**Consumption.** The editor is consumed via deep imports into `dist/` (the
repo's established pattern); the fork's logic-surface imports are the only thing
that changes when `bpmn-editor-core` lands.

## Testing Decisions

**What makes a good test here.** Tests assert **external behavior**, not
implementation. For domain logic that means: given a **Normalized** BPMN model
and a mutation/validation call (or a domain selector read), assert the resulting
model / boolean / model-fact — never internal call sequences. For UI that means
asserting rendered output and interaction outcomes, not component internals.

**Primary seam (highest, single ideal seam): the three-surface API.** Test
domain behavior directly against **mutations + domain selectors + validation** as
pure operations over the model. Because extraction is **behavior-neutral**, write
**characterization tests at this seam before each extraction** to pin current
behavior, then prove the extraction leaves them green. These tests are
upstream-owned and **inherited** by the fork — they survive the PatternFly→Carbon
swap untouched because they never touch the UI.

**Secondary seam: Carbon UI via Playwright.** Keep Playwright as the UI test
tool, but **drop all upstream UI tests wholesale** — they assert PatternFly DOM
and divergent interaction behavior, so they are discarded rather than rewritten.
The fork authors a **fresh** Carbon Playwright suite validating Carbon
**interaction behavior** and **view-model** rendering. (Storybook may still host
the stories the suite drives; the assertions are new.)

**Test ownership follows the code partition.** Logic tests = upstream-owned,
inherited (and may be newly authored at the three-surface seam). UI tests =
fork-owned; upstream's UI suite is **dropped and replaced**, not merged. The
e2e/test directories are UI-owned, so on merge they resolve to the fork via
`git checkout --ours`; new upstream UI tests arrive as PatternFly-oriented files
and are dropped as part of normal re-skin upkeep.

**Prior art.** The package already ships a Playwright-over-Storybook e2e setup
(`test-e2e` scripts) — the UI seam reuses it. The three-surface seam mirrors how
the marshaller-backed model and mutations are already exercised as plain
functions over `Normalized<BpmnLatestModel>`.

## Out of Scope

- **How the fork is delivered/consumed** (own host app vs. envelope / VS Code /
  online-editor channels). Explicitly out of scope.
- **Phase 2 (agnostic engine)** and **Phase 3 (`bpmn-editor-core` extraction)**
  as build-out — only their boundaries and groundwork inform Phase 1.
- **UI injection / theming architecture** (an editor that imports neither design
  system and receives a component kit). The chosen model is a Carbon fork, not
  injection.
- **`dmn-editor`** — it does not consume the engine and is unaffected.
- **Changing domain behavior** — divergence is interaction-only; any domain
  change is a marked exception, not a goal of this work.

## Further Notes

- The fork is never "done": new upstream UI features arrive in PatternFly and
  must be re-skinned.
- The fork-wins resolution ignores upstream's UI adaptations to logic-contract
  changes; the post-merge typecheck/tests are the safety net, and stable
  logic-surface APIs (Phase 3) reduce drift.
- Extraction work is deliberately front-loaded as an upstream campaign rather
  than drip-fed, both to unblock Carbon-ization and to build the `bpmn-editor-core`
  surface early.
- Companion docs: `CONTEXT.md` (glossary) and `adr/0001-0005`.
