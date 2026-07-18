# ADR 0009 — Static deploy on Cloudflare Pages, guarded manual dispatch

Date: 2026-06-21 · Status: Accepted

## Context

The site is fully static (no runtime deps). Deploy needs to be $0, edge-cached,
and safe — a medical-content site must not auto-deploy on every push without a
green-CI gate.

## Decision

- **Host:** Cloudflare Pages. `wrangler.jsonc` declares
  `pages_build_output_dir: dist`; project name pinned to `materia`.
- **Deploy workflow:** `.github/workflows/deploy.yml` triggers on
  `workflow_dispatch` only (manual). Auto-deploy on push was evaluated and
  reverted to manual dispatch as the safer default for health content.
- **Deploy gate:** `npm run deploy` runs `scripts/manual-deploy.mjs`, which
  refuses unless: on `main`, working tree clean, branch synced with origin, CI
  green on the current `HEAD`, and `gh` authenticated. Only then does it
  dispatch the workflow.

## Consequences

- A production deploy is a deliberate, gated act — not a side effect of a push.
- CI (`.github/workflows/ci.yml`) runs `npm test` + `npm run build` on push/PR
  to `main`; the deploy gate requires that CI be green on the exact commit.
- See [`../../operations/deploy.md`](../../operations/deploy.md) for the
  runbook and [`../../operations/jobs/ci.md`](../../operations/jobs/ci.md) for
  the CI job.

## Alternatives considered

- **Auto-deploy on push to main:** evaluated and verified working, then
  reverted to manual dispatch — health content warrants a human gate.
- **Vercel/Netlify:** rejected — fleet standard is Cloudflare; $0 + unlimited
  bandwidth + edge cache is sufficient for a static site.
