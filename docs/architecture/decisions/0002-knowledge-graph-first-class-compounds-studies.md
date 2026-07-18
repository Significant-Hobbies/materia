# ADR 0002 — Knowledge graph with first-class compounds & studies

Date: 2026-06-21 · Status: Accepted

## Context

The differentiator is the join: **body → condition → remedy → active compound
→ mechanism → study**, traversable from any direction. Competitors silo these
(BioDigital has the body, Examine has grades, NatMed has interactions) and none
model the join as a graph.

## Decision

Model **six cross-referenced collections** — `bodyParts`, `conditions`,
`remedies`, `compounds`, `studies`, `sources` — with Astro `reference()` so
every edge is build-checked. Crucially, **compounds** and **studies** are
first-class nodes (their own collections), not string properties on remedies.

## Consequences

- Every entity becomes a richly interlinked page → combinatorial SEO long-tail
  (compound → every remedy containing it; study → every claim it supports).
- The graph resolves at build time via `src/lib/graph.ts`; pages call helpers,
  they don't re-implement joins.
- The remedy×condition efficacy matrix (graded, cited) is the source data for
  condition pages, the planned evidence heatmap, and comparison tables.
- Schema is in `src/content.config.ts`; the join helpers in `src/lib/graph.ts`.
  See [`../data-model.md`](../data-model.md).

## Alternatives considered

- **Compounds as a string array on remedies:** rejected — loses the
  compound-as-page surface and the "every remedy containing this compound"
  query, which is a core moat.
- **Studies as inline citation strings:** rejected — loses study pages,
  "cited by" back-links, and the research-paper transparency posture.
