# Adding / replacing a 3D body model

The explorer already ships 3D. `src/pages/index.astro` maps each anatomical
system to a GLB in `MODEL_FILES` and, at build time, includes only the ones that
exist under `public/models/` (`models` map + `hasAnyModel` flag). When the active
layer has a model, `BodyExplorer` renders `ThreeBody` (true per-part mesh
clicking); otherwise it falls back to the 2D `AnatomyBody`. Nine layers currently
ship (`body.glb` for skeletal + `body-<system>.glb` for the rest). Drop a new or
replacement GLB at the matching `public/models/<file>` path and the build picks it
up with no code change.

This guide produces those GLBs from **Z-Anatomy** (the best free,
per-part-named anatomy source).

## Why Blender is required

Z-Anatomy ships as a Blender `.blend` (built on BodyParts3D). It is **CC-BY-SA 4.0** — so the
exported model stays CC-BY-SA and must be attributed (already slotted in `ATTRIBUTIONS.md`). The
sandbox can't download it or run Blender, so this step is done on your machine.

## Steps

1. **Get the source.** The shipped GLBs were extracted from Z-Anatomy's
   pre-built models repo, https://github.com/Z-Anatomy/Models-of-human-anatomy
   (see `ATTRIBUTIONS.md` for the exact collections + licenses). To author a new
   one from scratch, clone the full atlas https://github.com/Z-Anatomy/The-blend
   and open the `.blend` in **Blender 4.x**.
2. **Keep only the system you're exporting.** Z-Anatomy separates systems into
   collections. Each shipped GLB is a single system (skeletal, muscular,
   nervous, …), so keep just that system's collection and hide/delete the rest
   to shrink the file. Export one system per GLB (matching `MODEL_FILES`).
3. **DO NOT "Join" meshes.** Keep structures as **separate named objects** — those object names
   become the glTF mesh names my code matches on. Joining everything into one mesh destroys per-part
   clicking.
4. **Decimate for the web.** The full atlas is huge. Select the meshes → add a **Decimate** modifier
   (Collapse, ratio ~0.2–0.4) and apply. Aim for a final GLB **under ~15 MB**.
5. **Export.** `File → Export → glTF 2.0 (.glb)`:
   - Format: **glTF Binary (.glb)**
   - Include: **Visible Objects** (or Selected)
   - Transform: leave **+Y Up** on (default) — my code expects Y-up; Blender converts automatically.
   - Data → Mesh: **on**. Material: **on**.
   - **Draco compression ON.** The shipped GLBs are Draco-compressed and the
     loader already decodes it: `ThreeBody.tsx` calls `useGLTF(url, '/draco/')`
     with the decoder self-hosted at `public/draco/` (no external CDN).
6. **Drop it:** save as `public/models/<file>.glb` for its system (e.g.
   `body.glb` = skeletal, `body-nervous.glb` = nervous — see `MODEL_FILES` in
   `src/pages/index.astro`).
7. **Build/deploy** (`npm run build`) — the new/updated layer is picked up.

## Wiring the names to our parts

My component (`src/components/react/ThreeBody.tsx`) maps each mesh name → a part slug via
`PART_KEYWORDS` (keyword substring match, walking up parents), e.g. `femur`/`vastus`→`thigh`,
`patella`→`knee`, `tibia`/`gastrocnemius`→`calf`, `carpal`/`phalan`→`hand`, `lumbar`/`L1–L5`→
`lower-back`. Z-Anatomy uses standard anatomical names, so most match out of the box.

`PART_KEYWORDS` currently maps all 24 body-part slugs. After you add a model,
**open the browser console** — it logs `[ThreeBody] unmapped meshes: [...]`.
Extend `PART_KEYWORDS` for any relevant structure that isn't mapped yet so it
becomes clickable. Meshes that map to no part are still visible but toggle by
raw name (shown as a "no data yet" card), so nothing is inert.

## Notes

- Hosting stays **$0** (static, Cloudflare unlimited bandwidth); the GLBs are just cached assets.
- Keep each GLB lean — the active layer's model loads on the homepage. Draco is
  already wired (loader + self-hosted `/draco/` decoder), so keep exporting with
  Draco on.
- The 2D `AnatomyBody` remains the fallback, so the site never breaks if a model is missing.
