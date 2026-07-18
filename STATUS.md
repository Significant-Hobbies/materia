# Materia — STATUS

Short, current-state view. Updated when work starts, pauses, or ships. For the
full historical timeline and feature inventory, see
[`PROJECT_STATUS.md`](PROJECT_STATUS.md). For navigation, see
[`AGENTS.md`](AGENTS.md) and [`docs/index.md`](docs/index.md).

Last updated: 2026-07-18

## Current objective

**Finish-and-pause (since 2026-07-10).** The deployed, cited 553-page reference
corpus is the frozen baseline. The product is live and intentionally paused —
reopen only with sustained traffic and a defined evidence/content budget.

Active work this branch (`docs/knowledge-system`): consolidate the repo's
scattered documentation into one coherent, local-first knowledge system
(`docs/` tree + `STATUS.md` + Blume presentation layer). No product/code
behavior changes.

## Active work

- Building out the `docs/` tree: ADRs, architecture (data model, explorer),
  development, operations (deploy, CI, import pipeline), knowledge
  (learnings, failed approaches).
- Adding `STATUS.md` as the short current-state record (this file).
- Adding `blume.config.ts` as a presentation-only layer over the Markdown.
- Adding `scripts/docs-check.mjs` (link + structure lint) and wiring it into CI.

## Blockers

None. The product baseline is frozen by decision, not blocked.

## Unresolved questions

- **Blume output directory collision.** Both Astro (`npm run build`) and Blume
  (`blume build`) write to `dist/` by default. Blume is a separate publishing
  surface and is not part of `npm run build`; decide whether to publish docs
  to a separate host/subdomain and whether to override Blume's output dir
  before running `blume build` in CI. See [`docs/operations/deploy.md`](docs/operations/deploy.md).
- **`lower-back` body part** is content-only (no anterior SVG region yet — not
  clickable in the explorer). Flagged by `npm run checks`. Resumes if the
  anatomy art pass is reopened.
- **A few seed citations** could not be 100% verified and cite a confirmed
  umbrella reference/DOI instead of a specific PMID (comfrey, menthol). See
  [ADR 0006](docs/architecture/decisions/0006-citation-verification-policy.md).

## Next steps

1. Finish the `docs/` consolidation on this branch and commit for review.
2. Land `docs:check` into CI (`.github/workflows/ci.yml`).
3. Decide Blume publishing target (separate Cloudflare Pages project vs.
   subpath) — out of scope for this branch; tracked here.
4. Product remains paused; no content or feature work planned.
