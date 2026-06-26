# BPMN Editor — Workflow Editor adaptations

Vocabulary for the effort to re-skin `@kie-tools/bpmn-editor` onto IBM Carbon
while continuing to inherit non-UI updates from upstream `incubator-kie-tools`.

## Language

**Logic** (non-UI):
Behavior independent of any component library: the in-memory model, the
mutations that change it, normalization, validation, and the store. The updates
the fork wants to keep inheriting from upstream.
_Avoid_: "business logic", "core" (reserve "core" for the future package).

**Presentation layer** (UI):
The component-library-bound rendering: PatternFly today, Carbon in the fork.
_Avoid_: "view", "frontend".

**Separated logic**:
Logic that already lives outside component files — `store/`, `mutations/`,
`normalization/`, `validation/`, `commands/`, and marshaller glue. Inherited
automatically because the fork never edits it.

**Panel-embedded logic**:
Logic baked _inside_ a PatternFly panel component — which mutation a field
calls, its view-model, its inline validation. The fork's hardest problem: it is
the kind of update the fork wants, trapped in the files being replaced.

**Engine**:
`@kie-tools/xyflow-react-kie-diagram` — the shared `reactflow`-based diagram
package. Consumed by `bpmn-editor` only (NOT `dmn-editor`, which has its own
`reactflow` diagram). Carries a small (6-file) PatternFly footprint.

**Canvas**:
The diagram surface and its chrome (palette, overlays, morphing panel, node
labels). PatternFly-styled; kept as-upstream under the chosen scope.

**Panel**:
A side-drawer properties/overlays component under `propertiesPanel/` or
`overlaysPanel/`. The surface being rewritten in Carbon (~60 files).

**Inheritance boundary**:
The three encapsulated surfaces a component may consume but never inline:
**mutations** (writes), **selectors** (simple reads / view-model), and
**validation** (rules). Nothing domain-shaped remains in a component; this is
what makes upstream logic fixes flow to the fork automatically.

**Domain selector** vs **View-model**:
Domain selector = a UI-agnostic read of model facts from the store; returns
domain-shaped data and is upstream-owned/inherited. View-model = data shaped for
a specific UI (Carbon dropdown items, table columns); UI-specific and fork-owned
in the component. Only domain selectors belong in the inherited surface.
_Avoid_: putting view-model shaping in selectors.

**Computed**:
`ComputedStateCache`-backed derivation, reserved for expensive results worth
caching, not for simple reads.
_Avoid_: using "computed" for trivial reads.

**Interaction behavior** vs **Domain behavior**:
Interaction = layout, positioning, sequencing, widget choice — free to diverge
in the Carbon UI. Domain = effect on the BPMN model — kept identical so it stays
inherited. Any intentional domain divergence is a marked exception.

**Fork vehicle** vs **Upstream goal**:
Vehicle = private hard fork of the monorepo, merging upstream `main`
periodically (chosen, immediate). Goal = upstream adopting a headless
core/UI split so the Carbon editor is just another consumer (pursued in
parallel).

**UI-fork workflow**:
The merge model: fork edits UI only; logic changes go upstream as PRs; on merge,
UI-file conflicts are resolved to the fork with `git checkout --ours` over the UI
directories (no persistent merge driver). See ADR-0003.

**Extraction gate**:
The strict rule that a panel's domain logic must be extracted to the three
surfaces upstream _before_ that panel is Carbon-ized and taken with `--ours`.
Prevents the fork-wins resolution from silently dropping inherited domain fixes.

**UI file** vs **Logic file**:
The path partition the workflow depends on. A UI file (fork-owned, `merge=ours`)
holds only interaction + presentation. A logic file (upstream-owned, merged
normally) holds mutations, selectors, or validation. After extraction the two
never mix in one file.
