# The body explorer — renderer contract & state seam

The explorer is the **only** hydrated surface on the site. Everything else is
static HTML. This page documents the contract that makes the body swappable
(2D SVG ↔ 3D GLB) without touching the panel, the layer toggle, or the store.

## The seam: nanostores, not props

Explorer state lives in plain nanostores atoms in
[`../../src/lib/explorer/store.ts`](../../src/lib/explorer/store.ts) —
**slugs only, zero knowledge of how the body is rendered**:

- `$activeSystem` — which anatomical layer is shown (`skeletal`, `muscular`, …)
- `$activeView` — `anterior` | `posterior`
- `$selectedParts` — svgIds of selected parts, in selection order (multi-select)
- `$hoveredPart` — the clickable region under the cursor
- `$hoverLabel` — human-readable name of the exact mesh under the cursor
- `$engaged` — true once the user interacts (stops the idle auto-spin)

The 2D SVG body and the 3D body both read/write these same atoms. Selection is
exchanged purely as part ids. Adding a new renderer means implementing the
contract — not rewiring the UI.

## The renderer contract

`AnatomyRenderer` in
[`../../src/lib/explorer/renderer.ts`](../../src/lib/explorer/renderer.ts)
declares what a renderer consumes:

- `layer: { system, view }` — which layer + view to draw
- `parts: ExplorerPart[]` — the regions to make interactive

…and how it communicates: it reports interaction **up** via the store
(`hoverPart`/`togglePart`) and reads the active multi-selection **down** from
the store (`$selectedParts`).

`ExplorerPart` is the build-time-shaped, serializable data the island needs —
`svgId`, `slug`, `name`, `summary`, `systems`, `conditions`. Astro resolves it
from the `bodyParts` collection via `getExplorerParts()` in `src/lib/graph.ts`
and hands it to the island as a plain array.

## Implementations

- **3D (active):** `src/components/react/ThreeBody.tsx` — react-three-fiber
  loading Z-Anatomy GLBs from `public/models/`. True per-part mesh raycasting
  (hover/click the real bone/muscle/organ) via a name→slug keyword map
  (`PART_KEYWORDS`). Highlight is **imperative O(1)** with no React re-render:
  the label is isolated to its own subscriber, and recolor happens only on
  selection change. Layer toggle swaps the model file.
- **2D (fallback):** `src/components/react/AnatomyBody.tsx` — hand-authored
  stylized region map. The site never breaks if a 3D model file is absent.

`BodyExplorer.tsx` is the island shell that picks the renderer and hosts
`LayerToggle` + `PartPanel`.

## Adding a body part to the explorer

1. Add a `bodyParts/*.md` entry with `svgId` matching a region.
2. For 2D: ensure `svgId` is in `SVG_REGIONS` in `AnatomyBody.tsx` **and** in
   the `SVG_REGIONS` set in `scripts/content-checks.mjs` (keep these in sync).
3. For 3D: mesh names are matched by `PART_KEYWORDS` substring in `ThreeBody.tsx`.
   After adding a model, open the browser console — it logs
   `[ThreeBody] unmapped meshes: [...]`; extend `PART_KEYWORDS` so each
   relevant structure is clickable.
4. Run `npm run checks` — it warns on a `svgId` with no matching region
   (content is fine, the part just isn't clickable in the explorer yet).

See [`../operations/runbooks/add-3d-body-model.md`](../operations/runbooks/add-3d-body-model.md)
for producing a GLB from Z-Anatomy.
