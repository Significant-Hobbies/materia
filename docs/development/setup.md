# Local setup

## Prerequisites

- **Node 22** (pinned in `.nvmrc`). `nvm use` if you use nvm.
- **npm** (lockfile is `package-lock.json`; a `pnpm-lock.yaml` also exists but
  npm is the canonical package manager here — see
  [`../operations/jobs/ci.md`](../operations/jobs/ci.md)).
- **Blender 4.x** — only if you're producing/editing 3D anatomy GLBs. See
  [`../operations/runbooks/add-3d-body-model.md`](../operations/runbooks/add-3d-body-model.md).
- **`gh` CLI** authenticated — only if you're running a production deploy. See
  [`../operations/deploy.md`](../operations/deploy.md).

## First run

```bash
npm install
npm run dev        # http://localhost:4321
```

The dev server hot-reloads content collections. Editing a Markdown file under
`src/content/` is reflected immediately.

## Commands

The authoritative list is `package.json` `scripts`; restated here for
orientation:

| Command | What it does |
| --- | --- |
| `npm run dev` | Astro dev server |
| `npm run build` | Static build → `dist/` |
| `npm run check` | `astro check` (type check, includes Zod schema validation) |
| `npm run checks` | Soft content-integrity warnings (`scripts/content-checks.mjs`) |
| `npm run lint` / `npm run format` | Biome 2.5 |
| `npm test` | Vitest |
| `npm run deploy` | Guarded manual deploy dispatch (see deploy runbook) |
| `npm run docs:check` | Lint `docs/` structure + links (see below) |

## What fails the build (and what doesn't)

- **Build-failing (hard):** any Zod schema violation, including a missing
  `reference()` target or an efficacy claim with no studies/sources. See
  [ADR 0003](../architecture/decisions/0003-build-enforced-citations.md).
- **Soft warnings (`npm run checks`):** a `bodyParts` `svgId` with no matching
  explorer region; remedy prose that reads like a dose. Review, don't panic.

## Docs tooling (Blume — optional, presentation only)

The `docs/` tree is plain Markdown and stands on its own. Blume is an optional
presentation/search layer:

```bash
npx blume dev     # serve docs/ as a docs site
npx blume build   # static build (see note on output dir)
```

`blume` is **not** a dependency of this repo and is not required to read or
edit docs. See [`../operations/deploy.md`](../operations/deploy.md) for the
`dist/` collision note before running `blume build`. The committed Markdown is
the source of truth; `.blume/` is generated and gitignored.
