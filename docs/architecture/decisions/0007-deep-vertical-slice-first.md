# ADR 0007 — Build sequence: deep vertical slice first

Date: 2026-06-21 · Status: Accepted

## Context

The target is the full vision (all body systems, all differentiator moats).
Building breadth-first would delay the moment the whole product shape is
visible and risk building moats on a shaky foundation.

## Decision

Build a **complete-but-narrow slice** (musculoskeletal) wired through the
entire feature set — data model, explorer, entity pages, evidence components,
grading, citations, search — so the whole product is visible early. Breadth
(organ systems, then every-disease scope) is then incremental and uses the
same surfaces.

v1 anatomy art is an original stylized region map — a deliberate placeholder
for a later segmented per-system art pass (sources/licensing in
`ATTRIBUTIONS.md`).

## Consequences

- The musculoskeletal seed validated every layer of the stack before breadth
  scaling.
- The bulk-import pipeline (`scripts/import/`) then scaffolded breadth
  (conditions, drug stubs, herb stubs) while grading stayed curated —
  imported entities carry no efficacy claims until the curated loop reaches
  them.
- The 3D explorer (Z-Anatomy GLBs) was added later and now covers all 9
  systems; the 2D SVG body remains the fallback.

## Alternatives considered

- **Breadth-first (all conditions stubbed, then deepen):** rejected — delays
  validating the citation/grading/explorer loop that everything depends on.
