# Data model — the knowledge graph

The schema is the single source of truth and lives in
[`../../src/content.config.ts`](../../src/content.config.ts). This page
explains the shape and the invariants so you can author content correctly
without re-reading the whole schema. Don't restate field definitions here —
link to the schema for the authoritative list.

## Six collections

| Collection | Role | Key edges |
| --- | --- | --- |
| `bodyParts` | Anatomical regions; the explorer's clickable nodes | → `conditions` |
| `conditions` | Symptoms / disorders; the link between body and remedy | → `bodyParts` |
| `remedies` | Herbs, supplements, chemicals, drugs | → `compounds`, → `studies`/`sources` (via efficacy), → `remedies` (interactions) |
| `compounds` | Active constituents as first-class nodes | ← `remedies` |
| `studies` | Primary research (PMID/DOI, design, n, effect) | ← `remedies` (via efficacy) |
| `sources` | Non-study citations (fact sheets, monographs, .gov pages) | ← `remedies` (via efficacy) |

All cross-collection edges use Astro `reference()`, so a typo'd slug fails the
build. Content files are Markdown under `src/content/<collection>/*.md`; the
frontmatter **is** the graph.

## The efficacy claim (the heart of the model)

A `remedies` entry has an `efficacy` array. Each element is one
**(remedy × condition)** claim:

```ts
{
  condition: reference('conditions'),
  grade: 'A' | 'B' | 'C' | 'D' | 'insufficient',
  summary: string,            // plain-language one-liner, required
  studies: reference('studies')[],   // ≥1 of studies/sources required
  sources: reference('sources')[],
  tradition: { system, claim, alignment }[],
}
```

This array is the Examine-style remedy×outcome matrix and the source data for
condition pages, the planned evidence heatmap, and comparison tables.

## Invariants

1. **Every efficacy claim cites ≥1 study or source.** Enforced by
   `.refine((c) => c.studies.length + c.sources.length > 0)` — the build
   **fails** on violation. See
   [ADR 0003](decisions/0003-build-enforced-citations.md). This is the hard
   invariant; there is no runtime fallback.
2. **Referential integrity.** Every `reference()` must resolve to an existing
   entry — build-checked by Astro.
3. **Grades are per remedy × condition**, never global. The grade vocabulary
   (`GRADES = ['A','B','C','D','insufficient']`) is defined once in the schema
   and rendered via `src/lib/grades.ts`. See
   [`../product/trust-posture.md`](../product/trust-posture.md).
4. **Efficacy and safety are separate axes.** `safety` (interactions,
   contraindications, sideEffects, pregnancy) is independent of `efficacy`
   grades.
5. **Describe, don't prescribe.** `typicalUse.studiedRange` reports what
   researchers studied, never a dose to take. A soft lint in
   `scripts/content-checks.mjs` flags imperative dosing prose.

## Typed interaction edges

`remedies.interactsWith` carries `{ target, severity, mechanism, source }` —
this powers the `/checker` safety surface. Severity vocabulary:
`severe | moderate | minor | theoretical`. The checker also detects
**additive risk classes** by keyword matching (e.g. "anticoag", "warfarin")
so it can warn when ≥2 items in a stack share a risk class even without an
explicit edge.

## Resolving the graph at build time

`src/lib/graph.ts` exposes helpers that resolve the joins so pages don't
re-implement them:

- `getExplorerParts()` — body parts shaped for the explorer island.
- `remediesForCondition(slug)` — graded remedies for a condition, sorted by
  grade (A first).
- (and the rest — read the file for the full list.)

**Use these helpers; don't re-implement joins** in pages.

## Soft checks (warnings, non-fatal)

`scripts/content-checks.mjs` catches issues that should be reviewed but not
block a build:

1. A `bodyParts` `svgId` with no matching region in the explorer SVG
   (`SVG_REGIONS` set in the script — keep in sync with `AnatomyBody.tsx`).
2. Remedy prose that reads like a dose/prescription.

Run with `npm run checks`. Warnings are intentional soft signals; the hard
invariants are schema-enforced at build time.
