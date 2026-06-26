# Logic inheritance boundary: mutations + selectors + validation, no shared hooks

## Context

The Carbon fork of `bpmn-editor` must keep inheriting non-UI updates (features,
bugfixes) from upstream while owning a completely different presentation layer.
For that to work, every piece of domain logic must live in a surface the fork
consumes but never edits — otherwise upstream fixes land in files the fork has
replaced and are silently missed.

## Decision

Domain logic is encapsulated in **three surfaces**, and components contain
**none** of it inline:

- **Mutations** (`mutations/`) — all writes to the model.
- **Domain selectors** (`store/`) — UI-agnostic reads of model facts (e.g.
  variables in scope, id validity, resolved called-element). They return
  domain-shaped data, **not** UI view-models: shaping reads into Carbon dropdown
  items, table column configs, etc. is UI-specific and stays in the fork-owned
  component. Keeping selectors domain-only is what keeps this surface
  inheritable. The `ComputedStateCache` (`computed`) is reserved for expensive,
  cache-worthy derivations, not simple reads.
- **Validation** (`validation/`) — all rules; components display results only.

Components own **interaction behavior only** (layout, positioning, sequencing,
widget choice). We deliberately reject the component+hook pattern: there is no
per-panel "controller hook." A component reads selectors and calls mutations
directly and owns its own interaction glue.

## Consequences

- Today panels inline read logic (e.g. `NameDocumentationAndId` derives its
  view-model and calls visitors directly) and invoke validation inline. Reaching
  this boundary requires pushing that logic down into selectors/mutations —
  in-place edits to upstream panel files, done incrementally and contributed
  upstream (the path from the fork vehicle to the upstream goal).
- The "inherit logic automatically" guarantee holds **only** for logic that has
  reached these three surfaces. Logic still inline in a component is on a manual
  watch-list until extracted.
