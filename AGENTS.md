# Materia — agent guide

The "Examine.com of the whole body": an Astro static, content-first reference
where a layered, clickable human body leads into a knowledge graph of
**body → condition → remedy → compound → study**, with every remedy
evidence-graded and study-cited. Ad-free, not medical advice.

This file is a concise bootloader. Deeper knowledge lives in [`docs/`](docs/)
— read [`docs/index.md`](docs/index.md) for the full map. For the current
snapshot of work, see [`STATUS.md`](STATUS.md). For the full historical
timeline and feature inventory, see [`PROJECT_STATUS.md`](PROJECT_STATUS.md).

## Commands

| Command | What |
| --- | --- |
| `npm run dev` | Astro dev server |
| `npm run build` | Static build → `dist/` (enforces Zod schemas + citation invariant) |
| `npm run check` | `astro check` (types + schema) |
| `npm run checks` | Soft content-integrity warnings |
| `npm run lint` / `npm run format` | Biome 2.5 |
| `npm test` | Vitest |
| `npm run docs:check` | Lint `docs/` structure + links |
| `npm run deploy` | Guarded manual deploy (see `docs/operations/deploy.md`) |

Node 22 (`.nvmrc`), npm. Blume (`npm run docs:dev`) is optional and
presentation-only — the Markdown is the source of truth.

## Critical constraints (do not weaken)

- **Every efficacy claim must cite ≥1 study/source.** Enforced in the Zod
  schema (`src/content.config.ts`); the build fails otherwise. See
  [ADR 0003](docs/architecture/decisions/0003-build-enforced-citations.md).
- **Do not invent PMIDs/DOIs.** Verify against PubMed/NCCIH/Cochrane/MSK; cite
  the confirmed umbrella reference when a specific ID is uncertain. See
  [ADR 0006](docs/architecture/decisions/0006-citation-verification-policy.md).
- **Grade conservatively, per remedy × condition.** Efficacy and safety are
  separate axes. See [`docs/product/trust-posture.md`](docs/product/trust-posture.md).
- **Describe, don't prescribe.** `typicalUse.studiedRange` ("studied at…"),
  never a dose. `scripts/content-checks.mjs` lints imperative dosing prose.
- **Cross-link with `reference()`** so integrity is build-checked. New
  body-part `svgId`s should match a region in `AnatomyBody.tsx` (keep
  `SVG_REGIONS` in `content-checks.mjs` in sync) or they warn.
- **Trust posture:** no ads, no affiliate links, no supplement sales. The
  commerce layer is reserved but firewalled from evidence.
- **Disclaimers are non-negotiable:** sitewide banner + inline block on entity
  pages + red-flag gating.

## Where things live

```
src/
  content.config.ts        # 6 collections + Zod + reference() — the graph schema
  content/<collection>/*.md # canonical, hand-editable content (frontmatter = the graph)
  data/systems.ts          # anatomical layers (single source of truth)
  lib/graph.ts             # build-time graph joins (use these; don't re-implement)
  lib/grades.ts            # grade/tradition/severity metadata
  lib/explorer/            # store.ts (nanostores), renderer.ts (3D-ready contract)
  components/astro/*        # EvidenceBadge, CitationList, SafetyBlock, UseGuidance, …
  components/react/*        # BodyExplorer, AnatomyBody, ThreeBody, LayerToggle, PartPanel, SafetyChecker
  pages/                   # index + part/condition/remedy/compound/study/[slug] + lists + search + checker + data
scripts/
  content-checks.mjs       # soft warnings (svgId↔region, dosing-verb lint)
  docs-check.mjs           # docs/ link + structure lint
  manual-deploy.mjs        # guarded deploy gate
  import/                  # public-domain bulk importers (PubChem, openFDA, Wikidata)
docs/                      # canonical knowledge base (source of truth)
```

## Documentation maintenance rules

1. **One home per fact.** Don't re-explain something that has a canonical page
   — link to it. If a fact moves, leave a one-line pointer or update links.
2. **Markdown is the source of truth.** Blume is presentation only; never edit
   generated `.blume/` output.
3. **Don't duplicate code.** If a value lives in `src/content.config.ts`,
   `package.json`, or a workflow YAML, link to it instead of restating it —
   code drifts faster than docs.
4. **Mark unknowns.** Unresolved questions belong in [`STATUS.md`](STATUS.md)
   under "Unresolved questions", not silently in prose.
5. **Record the why.** A new non-obvious decision → an ADR under
   `docs/architecture/decisions/` and a row in `docs/decision-log.md`. A
   reusable failure → `docs/knowledge/failed-approaches.md`.
6. **Validate before committing.** `npm run docs:check` lints structure and
   links; CI runs it on every push.

## Fleet guidance

Follows the fleet Astro standard (ref: `sarthakagrawal`) and `AGENTS.md` at the
fleet root. Keep changes small and typed; keep the build green; update
`STATUS.md` when work starts/pauses/ships and `PROJECT_STATUS.md` when scope
ships.
