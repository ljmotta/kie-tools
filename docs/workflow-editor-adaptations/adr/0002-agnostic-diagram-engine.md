# Make xyflow-react-kie-diagram a design-system-agnostic engine

## Context

The Carbon fork re-skins every PatternFly-bound component, including the shared
diagram engine. The engine's PatternFly footprint is 6 components in two
mechanically different categories: 4 **composed** blocks (imported by the
consumer, zero engine-internal importers) and 2 **internally-rendered** blocks
(`SelectionStatusLabel`, `Draggable`) that only the engine controls.

## Decision

The engine carries **no** design system. Mechanism per category:

- **Composed blocks** (`EditableNodeLabel`, `InfoNodePanel`,
  `OutgoingStuffNodePanel`, `SectionHeader`) — relocated out of the engine into
  the consumer that composes them. Each consumer owns its styled version
  (PatternFly in upstream `bpmn-editor`, Carbon in the fork).
- **Internally-rendered blocks** (`SelectionStatusLabel`, `Draggable`) —
  rewritten as headless HTML/CSS with stable class names / inline SVG. The
  engine ships neutral structure; each consumer themes it via CSS. The engine
  depends on neither PatternFly nor Carbon.

## Consequences

- This is a refactor of a **shared** package plus upstream `bpmn-editor`'s
  imports. It is only sustainable if contributed upstream; held in the fork it
  is the heaviest possible merge surface. It therefore makes the upstream goal a
  hard dependency for the engine layer (see sequencing in a follow-up decision).
- The fork does **not** need the composed-block relocation to function — it can
  supply its own Carbon blocks and ignore the engine's. Only the 2 internal
  blocks force an engine edit.
