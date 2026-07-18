# Architecture overview

Materia is a **content-first static site** with **one interactive surface** (the body
explorer). Everything else is statically-rendered HTML at build time.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Astro 5 (`output: 'static'`) | Content is the product; per-entity pages need real URLs + SEO. A SPA would pay JS everywhere for no benefit. See [ADR 0001](decisions/0001-astro-not-spa.md). |
| Styling | Tailwind v4 (`@tailwindcss/vite`) + Lightning CSS | Fleet standard (VoidZero ecosystem). Tokens in `src/styles/global.css` (`@theme`). |
| Interactivity | React 19 islands (`@astrojs/react`) + nanostores | Only the explorer hydrates. State is decoupled from rendering via nanostores. |
| Content | Astro content collections + Zod + `reference()` | Type-safe, build-checked cross-collection graph. See [data-model.md](data-model.md). |
| Search | Client-side index + filter | Deterministic; Pagefind/embeddings planned but paused. |
| Tooling | Biome 2.5, npm, Node 22 (`.nvmrc`) | Fleet standard. |
| Deploy | Cloudflare Pages (`pages_build_output_dir: dist`) | $0, unlimited bandwidth, edge-cached. See [`../operations/deploy.md`](../operations/deploy.md). |

External runtime dependencies: **none**. The site is fully static.

## Build pipeline

```
src/content/<collection>/*.md   ──┐
src/data/systems.ts             ──┤
                                  ├─→ Astro build ──→ dist/  ──→ Cloudflare Pages
src/content.config.ts (Zod)     ──┤   (resolves reference(),
src/lib/graph.ts (joins)        ──┤    enforces citations)
src/pages/**.astro              ──┘
```

- `src/content.config.ts` defines six collections and the Zod schemas. The build fails on
  any referential-integrity or citation invariant violation.
- `src/lib/graph.ts` resolves the cross-collection joins at build time. **Use these
  helpers; don't re-implement joins** in pages.
- `astro.config.mjs` sets `build.format: 'file'` (no trailing-slash redirects on
  Cloudflare) and `inlineStylesheets: 'always'` (text-LCP pages render without a CSS
  round-trip).

## Layout

```
src/
  content.config.ts        # 6 collections + Zod + reference() — the graph schema
  content/<collection>/*.md # canonical, hand-editable content (frontmatter = the graph)
  data/systems.ts          # anatomical layers (single source of truth for systems)
  data/site.ts             # site name/nav/disclaimer
  lib/graph.ts             # build-time graph joins (use these; don't re-implement)
  lib/grades.ts            # grade/tradition/severity display metadata
  lib/explorer/            # store.ts (nanostores), renderer.ts (3D-ready contract)
  components/astro/*        # EvidenceBadge, CitationList, SafetyBlock, UseGuidance, …
  components/react/*        # BodyExplorer, AnatomyBody, ThreeBody, LayerToggle, PartPanel, SafetyChecker
  layouts/BaseLayout.astro # shared shell + injected JSON-LD
  pages/                   # index + part/condition/remedy/compound/study/[slug] + lists + search + checker + data
  styles/global.css        # @theme tokens
scripts/
  content-checks.mjs       # soft warnings (svgId↔region, dosing-verb lint)
  manual-deploy.mjs        # guarded deploy gate
  import/                  # public-domain bulk importers (PubChem, openFDA, Wikidata)
```

## Deeper pages

- [`data-model.md`](data-model.md) — the six-collection knowledge graph and the citation
  invariant.
- [`explorer.md`](explorer.md) — the renderer contract and the nanostores seam that makes
  the body swappable 2D↔3D.
- [`decisions/`](decisions/) — ADRs for the non-obvious choices.
