# Deploy runbook

Production: `https://materia.significanthobbies.com/` on Cloudflare Pages
(project `materia`, alias `materia-6bq.pages.dev`). The site is fully static;
`wrangler.jsonc` declares `pages_build_output_dir: dist`.

See [ADR 0009](../architecture/decisions/0009-static-deploy-cloudflare-pages.md)
for why deploys are manual-dispatch only.

## Production deploy (guarded manual dispatch)

From a clean, synced `main` with CI green on `HEAD`:

```bash
npm run deploy
```

`scripts/manual-deploy.mjs` refuses to dispatch unless **all** of:

- current branch is `main`
- working tree is clean
- branch is synced with `origin/main` (not ahead/behind)
- `gh` is authenticated
- the latest `ci.yml` run on `main` is green **on the current `HEAD` SHA**

Only then does it `gh workflow run deploy.yml --ref main`. The workflow
(`.github/workflows/deploy.yml`) builds and runs
`cloudflare/wrangler-action@v3` → `pages deploy dist --project-name=materia
--branch=main`, then smokes `https://materia-6bq.pages.dev/` with curl retries.

Secrets required in GitHub: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
**Do not** commit these or put them in `.env` — they live in GitHub Actions
secrets.

## What can go wrong

- **"CI has not run on current main":** push your commit, wait for `ci.yml` to
  go green, then re-run `npm run deploy`.
- **"working tree is dirty":** commit or stash. The gate is intentionally
  strict — a deploy must correspond to an exact, reviewed commit.
- **Smoke check fails:** the `*.pages.dev` alias may lag a few seconds; the
  workflow retries 5× with 5s delay. A persistent failure means the build
  itself is broken — check the workflow logs.
