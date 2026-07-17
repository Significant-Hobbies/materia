# Materia — PROJECT STATUS

Last updated: 2026-06-28

## Why / What

**Materia is "the Examine.com of the whole body."** A classy, ad-free, content-first reference
where you explore a layered human body, click any part, and find the herbs, supplements, chemicals,
and drugs that may help — each one **evidence-graded** and **linked to the studies behind it**.

The white space it fills: nobody joins interactive anatomy to evidence-graded, cited remedies.
BioDigital has the body but no remedies; Examine has the rigor but no body; NatMed has herb×drug
data but is paywalled/clinical. Materia is the join, built on a knowledge graph:
**body → condition → remedy → active compound → mechanism → study**, traversable from any direction.

**In scope:** interactive 2D layered explorer (3D-ready); per-entity content pages (body part,
condition, remedy, compound, study); evidence grading + study-level citations; search; the
differentiator moats (knowledge graph + first-class compounds, herb×drug safety checker,
tradition-vs-evidence overlay, evidence heatmap + comparisons, research-paper focus).

**Out of scope (now):** diagnosis, accounts/user data, e-commerce. A "where to find it" commerce
layer is **architecturally reserved but firewalled** from evidence — deferred until there is traffic.

**Not** a diagnosis tool, **not** medical advice, **not** sponsored. No ads, no affiliate links, no
supplement sales (also the lowest FTC-liability posture).

## Dependencies

| Layer | Choice |
|-------|--------|
| Framework | Astro 5 (`output: static`) |
| UI | Tailwind v4 (`@tailwindcss/vite`), Lightning CSS, lucide-react |
| Interactivity | React 19 islands (`@astrojs/react`) + nanostores |
| Content | Astro content collections + Zod + `reference()` |
| Search | client-side index + filter (Pagefind / embeddings planned) |
| Tooling | Biome 2.5, npm, Node 22 |
| Deploy | Cloudflare Pages (`pages_build_output_dir: dist`) |

External runtime deps: **none** (fully static). Content cites NCCIH, MSK About Herbs, NIH ODS,
Cochrane, PubMed. Anatomy art sources tracked in `ATTRIBUTIONS.md`.

Local dev: `npm install && npm run dev`. Build: `npm run build`. Checks: `npm run checks`.

The data model is the single source of truth: `src/content.config.ts` (six collections) +
`src/data/systems.ts` (layers). Graph joins live in `src/lib/graph.ts`.

## Timeline

| Date | Milestone |
|------|-----------|
| 2026-06-21 | Phase 0 scaffold (Astro + Tailwind v4 + Biome + Cloudflare config), green build |
| 2026-06-21 | Knowledge-graph data model: 6 collections, Zod + `reference()`, build-enforced citations |
| 2026-06-21 | Classy "apothecary" design system + base shell (layout, nav, footer, disclaimer) |
| 2026-06-21 | Interactive explorer island (layered SVG body, nanostores, 3D-ready renderer seam) |
| 2026-06-21 | Verified musculoskeletal seed (16 remedies, 6 conditions, 5 parts, 10 compounds, 16 studies, 9 sources) |
| 2026-06-21 | Entity pages + evidence components; deterministic search; content-integrity checks |
| 2026-06-21 | Real 3D explorer: Z-Anatomy GLBs (Blender-extracted, decimated), per-part mesh raycasting, multi-select, page-scroll-safe controls |
| 2026-06-21 | **All 9 anatomy layers** built (skeletal·muscular·organs·nervous·cardiovascular·respiratory·digestive·endocrine·integumentary); layer toggle swaps models |
| 2026-06-21 | Organ-system content wave: heart/liver/stomach/intestines/brain/lungs/kidneys/thyroid + 11 cited conditions (hypertension→thyroiditis) |
| 2026-06-21 | Explorer polish: hover-everything with live labels (imperative O(1) highlight, no re-render), zoom-to-cursor/area, **every mesh clickable** (mapped regions + unmapped structures by name) |
| 2026-06-21 | Herb×drug **safety checker** (`/checker`): build a stack, flags recorded interactions, additive risk classes, duplicate compounds, pregnancy cautions |
| 2026-06-21 | Endocrine/skin content wave: pancreas→type-2-diabetes (berberine·cinnamon·chromium·magnesium), diabetic neuropathy (ALA), skin→acne (zinc·tea-tree·niacinamide), eczema, minor burns (aloe) — **15 new PubMed-verified studies**, all efficacy claims independently citation-checked |
| 2026-06-21 | Mental-health content wave: brain→depression (St John's wort·saffron·SAMe·EPA omega-3, with serotonin-syndrome interaction edge) — **8 new PubMed-verified studies**; neck/shoulder/upper-back linked to chronic MSK pain (de-orphaned) |
| 2026-06-21 | "Get-lots" 5-cluster wave: osteoporosis (Ca/D·K2), nausea (ginger·B6), cognitive decline (bacopa·ginkgo), recurrent UTI (cranberry·D-mannose), allergic rhinitis (butterbur·spirulina·nettle) — **22 new PubMed/Cochrane-verified studies**; honest negatives kept (vit-D-alone D via VITAL, D-mannose D via MERIT, ginkgo D, nettle insufficient). Only forearm/upper-arm/chest remain unlinked. |
| 2026-06-21 | Orphan-cleanup wave: forearm/hand→carpal tunnel (B6 D, ALA C), forearm/upper-arm→tendinopathy (collagen C), chest→GERD + chronic MSK pain — **6 new verified studies**; curcumin×tendinopathy dropped (no verifiable human RCT). **All 24 body parts now linked.** |
| 2026-06-21 | Depth wave: anxiety (+kava·lemon balm·saffron), common cold (+probiotics·vitamin D·elderberry·garlic), insomnia (+ashwagandha·L-theanine·glycine·tart cherry), new sarcopenia node (creatine·protein·vitamin D·HMB) — **22 new verified studies**, flagship A-tier remedy (creatine); kava capped at C for hepatotoxicity, vitamin-D-falls C (STURDY harm signal), HMB/garlic honest negatives |
| 2026-06-21 | **Bulk-import pipeline** (`scripts/import/`, public-domain APIs): PubChem → +30 compounds (CID-cited); openFDA → +44 drug reference stubs (curated class + checker risk-keywords). Caught & fixed openFDA combo-product class errors (metformin/lisinopril). No proprietary scraping; imported entities stay efficacy-free until curated |
| 2026-06-21 | Wired 13 curated **herb→drug interaction edges** into the imported drugs (bleeding: ginkgo/garlic/ginger/turmeric/fish-oil/vitamin-E → warfarin; SJW→warfarin CYP induction; vitamin-K2→warfarin antagonism; berberine→simvastatin; SAMe→sertraline serotonin; calcium→levothyroxine/cipro/doxycycline absorption) — safety checker now flags real herb×drug combos |
| 2026-06-21 | Wikidata import (`wikidata-herbs.mjs`, CC0): +27 herb stubs with taxon QID + scientific name; 10 linked to imported compounds (green tea→EGCG/catechin, thyme→thymol, clove→eugenol…). All 4 chosen sources now wired (PubChem·openFDA·Wikidata clean APIs; NCCIH/ODS cited inline) |
| 2026-06-21 | First **import→grade** wave: upgraded 4 imported herb stubs to graded entries — andrographis→common cold (B), passionflower→anxiety+insomnia (C), fenugreek→type-2-diabetes (B, links soluble-fiber), green tea→high cholesterol (B) — **10 new PubMed/Cochrane-verified studies**. Proves the loop: bulk-import scaffolds breadth, curated research adds the (copyright-safe) grades |
| 2026-06-21 | Second import→grade wave: rhodiola→depression (C), Asian ginseng→cognitive decline (C), holy basil→anxiety+type-2-diabetes (C), + new **chronic venous insufficiency** node (calf) with horse chestnut (B) & gotu kola (C) and a DVT emergency red-flag — **11 new verified studies** (curl-verified via Europe PMC) |
| 2026-06-21 | **Breadth push** (every-disease scope): `conditions-scaffold.mjs` → +39 condition stubs across all body systems (cardio·resp·GI·endocrine·neuro·skin·eye/ear·women's/men's health), severity + red-flags hand-curated (never scraped); `openfda-drugs.mjs` expanded → +54 drugs (98 total) by class w/ checker risk-keywords. 519 pages. Scaffolds carry no remedies/grades until the curated loop reaches them |
| 2026-06-21 | **8-cluster parallel grading sweep** (the throughput lever): AMD (zinc A·lutein/zeaxanthin B·omega-3 D), menopause (soy B·red clover C·black cohosh D), BPH (saw palmetto D·beta-sitosterol C·pygeum C), PMS/period (chasteberry B·ginger B·magnesium C), hair loss (rosemary·pumpkin-seed·saw palmetto C), restless legs (iron B·magnesium D), cold sores (lysine C·lemon balm C), fibromyalgia (vit-D C·CoQ10 D·magnesium D) — **25 verified studies**, 9 new remedies, 8 scaffolds filled. 553 pages |
| 2026-07-17 | **Custom domain** — `materia.significanthobbies.com` attached to the existing Cloudflare Pages project and verified live. |
| 2026-07-03 | **Production deploy** — all 553 cited pages deployed to Cloudflare Pages via `npm run deploy` (guarded `workflow_dispatch`). |

## Products

**Live:** `https://materia.significanthobbies.com/` — all **553 static pages** deployed 2026-07-03 via
guarded `workflow_dispatch` (`npm run deploy` → `scripts/manual-deploy.mjs` → `deploy.yml`).
Cloudflare Pages project: `materia` (`materia-6bq.pages.dev`). Build output: `dist/`.

**Knowledge graph:** 24 body parts · 77 conditions (47 graded + 30 scaffolded stubs) · 207 remedies
(91 curated + 98 drug stubs + 18 herb stubs) · 60 compounds · 175 studies · 37 sources. **9 anatomy layers** as decimated Z-Anatomy
GLBs (~18 MB total) under `public/models/`. **All 24 body parts lead to cited content** (no orphans).

**Bulk-import pipeline** (`scripts/import/`, public-domain/CC0 only): `pubchem-compounds.mjs` (+30
compounds w/ CID), `openfda-drugs.mjs` (+44 drug stubs w/ curated class + checker risk keywords),
`wikidata-herbs.mjs` (+27 herb stubs w/ taxon QID, 10 linked to imported compounds). Imported
entities carry **no efficacy claims** — grading stays curated/verified. See `ATTRIBUTIONS.md`.
Proprietary DBs (Examine/NatMed) are NOT scraped — copyright + moat.

**Primary routes:** `/` (explorer) · `/part/[slug]` · `/condition/[slug]` · `/remedy/[slug]` ·
`/compound/[slug]` · `/study/[slug]` · `/conditions` · `/remedies` · `/compounds` · `/search` ·
`/checker` (safety) · `/methodology` · `/disclaimer` · `/about`.

## Features (shipped)

### Platform & deploy
- Astro 5 static, `format: file` (no trailing-slash redirects), inlined critical CSS.
- Tailwind v4 + Lightning CSS; Biome; Cloudflare Pages config; sitemap.

### Data model (the knowledge graph)
- Six cross-referenced collections with Zod schemas; `reference()` enforces integrity at build.
- **Every efficacy claim must cite ≥1 study/source** — enforced by `.nonempty()`; build fails otherwise.
- Active **compounds** modeled as first-class nodes; **studies** as first-class research nodes.
- Evidence grade A/B/C/D/insufficient, graded per remedy × condition; efficacy ⟂ safety.

### Explorer (3D)
- React island (react-three-fiber): loads the active layer's Z-Anatomy GLB; **true per-part mesh
  raycasting** (hover/click the real bone/muscle/organ) via a name→slug keyword map.
- **Hover everything** — every mesh lights up with a live cleaned label; highlight is imperative
  (O(1), no React re-render), label isolated to its own subscriber; recolor only on selection change.
- **Every structure clickable** — mapped regions toggle their slug (→ cited conditions in the panel);
  unmapped structures toggle by name and show as a "no data yet" card. Nothing is inert.
- **Multi-select** non-blocking side panel lists all selections (clear/remove); drag-rotate;
  **zoom-to-cursor/area** (wheel + +/− buttons, auto-spin pauses on interact); floating-label stripped.
- nanostores selection state decoupled from rendering; 2D SVG body is the fallback.
- **Layer toggle over all 9 systems**, each swapping to its own model.

### Entity pages & components
- Condition: affected parts, graded remedy list, red-flag banner, prose.
- Remedy: evidence-by-condition matrix with per-claim citations, compounds, safety, interactions,
  tradition-vs-evidence overlay, non-prescriptive "what was studied".
- Compound: mechanism + every remedy containing it. Study: structured facts + "cited by" back-links.
- Components: EvidenceBadge, CitationList, SafetyBlock, UseGuidance, TraditionOverlay, Disclaimer.

### Trust & safety
- Sitewide disclaimer banner + inline block on entity pages; red-flag gating on conditions.
- Citations show design/n/journal/PMID/DOI + accessed date. "Studied at…" framing, never doses.
- Deterministic client-side search over conditions/remedies/compounds/parts (+aliases).

### Content (verified, cited — aggregated, never claimed)
- Musculoskeletal: knee/hip/hand OA, low back pain, RA, DOMS, cramps, migraine, tension headache,
  gout, plantar fasciitis.
- Organ systems: hypertension, high cholesterol, NAFLD, GERD, IBS, constipation, insomnia, anxiety,
  common cold, kidney stones, thyroiditis.
- 23 conditions · 49 remedies · 56 studies · 37 sources — every efficacy claim cited (incl. honest
  *negatives*: glucosamine≠hip, CoQ10≠BP, vitamin C≠cold prevention, echinacea weak).
- "Aggregator, not authority" stated on `/methodology` + `/about`; ≥1 source per claim is build-enforced.

## Todo / Planned / Deferred / Blocked

### Planned (next)
1. ~~Anatomy art pass — segmented, classy per-system SVG layers.~~ **Paused** after the deployed 553-page evidence baseline;
   skeletal/organs from Wikimedia CC-BY); posterior view + view toggle (unblocks lower-back in explorer).
2. ~~Evidence heatmap.~~ **Paused**;
3. ~~Semantic search.~~ **Paused**;
   only, never generation); symptom→body-part mapping; ⌘K command palette.
4. ~~Comparison tables and OG/schema polish.~~ **Paused**;
5. ~~Breadth expansion.~~ **Paused**;

### Closure

- **Finish-and-pause (2026-07-10):** the deployed, cited reference corpus is the frozen baseline. Reopen only with sustained traffic and a defined evidence/content budget.

### Deferred
- 3D renderer (`ThreeRenderer` via Z-Anatomy meshes) — abstraction in place, not built.
- Commerce / "where to find it" layer — reserved, firewalled from evidence, awaits traffic.

### Blocked / Known gaps
- `lower-back` body part is content-only (no anterior SVG region yet — not clickable in explorer) — flagged by `npm run checks`.
- A few citations the seed research could not 100% verify are cited via their confirmed umbrella
  reference/DOI (menthol, comfrey individual RCTs) — see `docs/decision-log.md`.
