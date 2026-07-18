# CI job

Workflow: [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml).
Triggers: push and pull_request to `main`/`master`.

## Steps

1. `actions/checkout@v4`
2. `actions/setup-node@v4` — Node 22, `cache: npm`
3. `npm ci`
4. `npm test` — Vitest
5. `npm run build` — Astro build (enforces Zod schemas + citation invariant)
6. `npm run docs:check` — lints the `docs/` tree (links + structure)

`npm run docs:check` is the docs-integrity gate. It is a standalone Node
script (`scripts/docs-check.mjs`) with no Blume dependency, so CI doesn't need
to install Blume to validate docs.

## Relationship to the deploy gate

The deploy workflow (`deploy.yml`) is `workflow_dispatch` only.
`scripts/manual-deploy.mjs` requires the latest `ci.yml` run on `main` to be
green **on the exact `HEAD` SHA** before it will dispatch a deploy. So CI is
the gate that production deploys depend on — keep it green. See
[`../deploy.md`](../deploy.md) and
[ADR 0009](../../architecture/decisions/0009-static-deploy-cloudflare-pages.md).

## Package manager

The repo ships `package-lock.json` (npm) as canonical and CI uses `npm ci`. A
`pnpm-lock.yaml` also exists in the working tree; do not introduce a second
lockfile-driven CI path — npm is the fleet standard here. (If pnpm is adopted
deliberately, update this page and CI together.)
