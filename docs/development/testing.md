# Testing & verification

There are three layers, in order of how hard they fail.

## 1. Build-time schema (hard — fails the build)

`npm run build` and `npm run check` run Astro's content-collection validation,
which enforces every Zod schema in
[`../../src/content.config.ts`](../../src/content.config.ts). This is where the
citation invariant lives: an efficacy claim with no `studies`/`sources` fails
the build. See [ADR 0003](../architecture/decisions/0003-build-enforced-citations.md).

Use `npm run check` during authoring for a faster feedback loop than a full
build.

## 2. Soft content checks (warnings — non-fatal)

`npm run checks` → `scripts/content-checks.mjs`. Two warnings:

1. A `bodyParts` `svgId` with no matching region in `SVG_REGIONS` (kept in sync
   with `src/components/react/AnatomyBody.tsx`). The content is fine; the part
   just isn't clickable in the 2D explorer yet.
2. Remedy prose that reads like a dose/prescription (`take 500 mg`, `apply 2
   drops`). Use "studied at …" framing instead.

Warnings are intentional soft signals. Don't auto-block; review and decide.

## 3. Unit tests (Vitest)

`npm test` → `vitest run`. Config in `vitest.config.ts`; tests live alongside
code (e.g. `src/lib/__tests__/`, `scripts/__tests__/`). Coverage via
`npm run test:coverage`.

CI runs `npm test` + `npm run build` on every push/PR to `main` — see
[`../operations/jobs/ci.md`](../operations/jobs/ci.md).

## 4. Docs checks

`npm run docs:check` → `scripts/docs-check.mjs`. Lints the `docs/` tree:
required files present, no empty directories with content, internal Markdown
links resolve, no leftover pointers to moved files. Runs in CI. See
[`../operations/jobs/ci.md`](../operations/jobs/ci.md).

## What to run when

- **Authoring content:** `npm run check` → `npm run checks` → `npm run build`.
- **Changing code:** `npm run check` → `npm test` → `npm run build`.
- **Editing docs:** `npm run docs:check`.
- **Before deploy:** the deploy gate (`scripts/manual-deploy.mjs`) requires CI
  green on your `HEAD`, which already runs test + build.
