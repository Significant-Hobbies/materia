# Materia — documentation

This directory is the canonical, hand-editable knowledge base for Materia. The
Markdown here is the **source of truth**; [Blume](https://useblume.dev)
(`blume.config.ts`) only renders and searches it. Code and executable config
(`src/`, `scripts/`, `.github/`, `*.config.*`) remain authoritative for
implementation details and schedules.

For a one-page agent bootloader, see [`../AGENTS.md`](../AGENTS.md). For the
current snapshot of work, see [`../STATUS.md`](../STATUS.md). For the full
historical timeline and feature inventory, see
[`../PROJECT_STATUS.md`](../PROJECT_STATUS.md).

## Map

| Area | Path | What's there |
| --- | --- | --- |
| Product | [`product/`](product/) | What Materia is, positioning, trust posture, launch content |
| Architecture | [`architecture/overview.md`](architecture/overview.md) | System shape, build pipeline, layout |
| Data model | [`architecture/data-model.md`](architecture/data-model.md) | The six-collection knowledge graph + citation invariant |
| Explorer | [`architecture/explorer.md`](architecture/explorer.md) | The renderer contract + nanostores seam (2D↔3D) |
| Decisions | [`decision-log.md`](decision-log.md) → [`architecture/decisions/`](architecture/decisions/) | Dated ADRs — the durable "why" behind non-obvious choices |
| Development | [`development/`](development/) | Local setup, content authoring, testing |
| Operations | [`operations/deploy.md`](operations/deploy.md) · [`operations/jobs/`](operations/jobs/) · [`operations/runbooks/`](operations/runbooks/) | Deploy, CI jobs, the bulk-import pipeline, runbooks |
| Knowledge | [`knowledge/learnings/`](knowledge/learnings/) · [`knowledge/failed-approaches.md`](knowledge/failed-approaches.md) | Durable learnings and reusable failed approaches |

## Maintenance rules

1. **One home per fact.** Don't re-explain something that already has a
   canonical page — link to it. If a fact moves, leave a one-line pointer or
   update the links.
2. **Markdown is the source of truth.** Blume is presentation only; never edit
   generated `.blume/` output.
3. **Don't duplicate code.** If a value lives in `src/content.config.ts`,
   `package.json`, or a workflow YAML, link to it instead of restating it —
   code drifts faster than docs.
4. **Mark unknowns.** Unresolved questions belong in [`../STATUS.md`](../STATUS.md)
   under "Unresolved questions", not silently in prose.
5. **Record the why.** A new non-obvious decision → an ADR under
   [`architecture/decisions/`](architecture/decisions/) and a row in
   [`decision-log.md`](decision-log.md). A reusable failure →
   [`knowledge/failed-approaches.md`](knowledge/failed-approaches.md).
6. **Validate before committing.** `npm run docs:check` lints structure and
   links; CI runs it on every push.
