# ADR 0003 — Build-enforced citation invariant

Date: 2026-06-21 · Status: Accepted

## Context

Materia's whole differentiator is trust. "Every claim is cited" must be a
**guarantee, not a promise** — a human review step alone will leak under
content churn.

## Decision

Enforce at the **schema level** that every efficacy claim cites ≥1 study or
source. In `src/content.config.ts`, the `efficacyClaim` schema has:

```ts
.refine((c) => c.studies.length + c.sources.length > 0, {
  message: 'Each efficacy claim must cite at least one study or source.',
});
```

The Astro build runs Zod validation, so an uncited medical claim **fails the
build**. There is no runtime fallback.

## Consequences

- "Fully cited" is a build-time guarantee, not a documentation convention.
- Adding a remedy×condition grade requires adding the citation in the same
  edit — the schema makes it impossible to ship one without the other.
- This is the hard invariant. Softer checks (svgId↔region, dosing prose) live
  in `scripts/content-checks.mjs` as warnings by design — review, don't block.
- Verification policy (don't invent PMIDs; cite the confirmed umbrella when a
  specific ID is uncertain) is recorded in
  [ADR 0006](0006-citation-verification-policy.md).

## Alternatives considered

- **Runtime check + lint warning:** rejected — warnings get ignored under
  churn; a medical claim shipping uncited is the one failure mode that must be
  impossible.
- **External CI-only check:** rejected — the schema is the single source of
  truth and is checked on every `astro check`/build locally and in CI.
