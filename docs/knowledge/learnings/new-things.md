# new-things — study queue

Short stubs for non-standard tech in this repo. 3–5 lines each. Fill `Why here:`
yourself after learning; never invent rationale.

## Astro Content Collections with Zod + reference()
- What: Build-time type-safe content with cross-collection references enforced at build time
- Why here: The whole product is a typed graph of Markdown entities; `reference()` makes every edge build-checked so a typo'd slug can't ship. See ADR 0002.
- Gotcha (from code): `src/content.config.ts:84-86` — `.refine((c) => c.studies.length + c.sources.length > 0)` enforces that every efficacy claim MUST cite at least one study — build fails otherwise
- Source: https://docs.astro.build/en/guides/content-collections/

## Build-enforced citation integrity
- What: Schema-level guarantee that medical claims cannot ship without citations — the invariant lives in the Zod schema, not runtime checks
- Why here: "Every claim is cited" must be a guarantee, not a promise — human review alone leaks under content churn. See ADR 0003.
- Gotcha (from code): `src/content.config.ts:74-86` — the refine block checking `c.studies.length + c.sources.length > 0` is the only place this invariant is enforced; no runtime fallback
- Source: https://zod.dev/

## Herb×Drug safety checker with additive risk classes
- What: Client-side interaction checker that flags explicit interactions, additive risks, duplicate compounds, and pregnancy cautions
- Why here: A free herb-AND-drug interaction checker is a differentiator moat — the one rigorous tool (herb×drug) today is locked behind NatMed Pro's paywall.
- Gotcha (from code): `src/components/react/SafetyChecker.tsx:82-95` — additive risk detection uses keyword matching (e.g. "anticoag", "warfarin") to warn when ≥2 items share a risk class, even without explicit interaction edges
- Source: https://www.ncbi.nlm.nih.gov/books/NBK556026/

## 3D anatomy explorer with per-mesh raycasting
- What: React Three Fiber loading GLB models with true per-part mesh raycasting — hover/click real bones/muscles, not bounding boxes
- Why here: The body is the entry point of the product; per-mesh (not bounding-box) clicking is what makes "click any part" feel real. 2D SVG remains the fallback.
- Gotcha (from code): highlight is imperative O(1) with no React re-render — label isolated to its own subscriber, only recolors on selection change
- Source: https://pmnd.rs/docs/

## Knowledge graph with first-class compounds
- What: Modeling active compounds as graph nodes with their own collection, not just string properties on remedies
- Why here: Compound-as-page is a combinatorial SEO long-tail and powers "every remedy containing this compound" — a core moat. See ADR 0002.
- Gotcha (from code): `src/content.config.ts:138-151` — compounds have `mechanism`, `targets`, `classification`; remedies reference them, enabling "every remedy containing this compound" queries
- Source: https://neo4j.com/developer/graph-data-model/

## Evidence grading methodology (A/B/C/D/insufficient)
- What: Examine-style consumer letter grade on top of GRADE-inspired certainty, graded per remedy × condition
- Why here: A single consumer-facing letter on top of GRADE-inspired certainty is the trust signal; per remedy×condition (not global) prevents overclaiming. See ADR 0004.
- Gotcha (from code): `src/content.config.ts:13` — grades are in a const array `['A', 'B', 'C', 'D', 'insufficient']` — this is the single source of truth for grade ordering
- Source: https://examine.com/

## Bulk-import pipeline from public APIs (PubChem, openFDA, Wikidata)
- What: Importing entities from public APIs with CC0/public-domain data only — import scaffolds breadth, research adds grades
- Why here: Scaffolding breadth from public-domain APIs lets curation focus on the copyrighted-elsewhere grading work; imported stubs stay efficacy-free so the citation invariant stays meaningful. See ADR 0007 + the import pipeline job doc.
- Gotcha (from code): imported entities carry NO efficacy claims — grading stays curated/verified. The import adds the entity; the human adds the evidence
- Source: https://pubchem.ncbi.nlm.nih.gov/
