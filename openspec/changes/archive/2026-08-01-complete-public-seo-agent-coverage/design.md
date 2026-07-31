## Context

Materia is a fully static Astro site whose content collections generate hundreds of entity pages. Discovery artifacts currently live as manually maintained files under `public/`, so they can drift from route generation. See `proposal.md` for motivation and `specs/public-discovery-coverage/spec.md` for the observable contract.

## Goals / Non-Goals

**Goals:**

- Make one typed build-time module the source of truth for public route inventory and agent representations.
- Keep artifacts deterministic, static, and derived from existing content collections.
- Fail tests when route or artifact coverage drifts.

**Non-Goals:**

- Changing medical content, evidence grades, navigation, or visual design.
- Indexing 404, internal graph JSON, deployment operations, or redirect-only paths.
- Adding a runtime API, database, external indexing service, or production dependency.
- Deploying the resulting build as part of this issue.

## Decisions

### Generate discovery artifacts through Astro routes

Build static endpoint routes for Markdown mirrors and `/api/ai`, backed by a shared inventory module. This keeps generation inside Astro's existing content-loading lifecycle and guarantees the output is produced during `npm run build`. A separate post-build script was considered, but it would duplicate route knowledge and create ordering concerns.

### Treat canonical HTML routes as the only sitemap membership

The canonical inventory will distinguish HTML pages from their machine-readable representations. The sitemap contains only canonical HTML pages; `robots.txt` and `llms.txt` link to agent artifacts separately. Including JSON, text, and Markdown alternates in the sitemap was rejected because they are representations, not canonical search results.

### Use deterministic Markdown serializers per page family

Shared helpers will render concise Markdown from existing collection entries and graph relations. Static informational pages use explicitly maintained summaries because their Astro templates are not safe or useful to scrape at build time. HTML-to-Markdown conversion was rejected because it adds a dependency and would preserve presentation noise.

### Validate the contract at source and build output levels

Unit tests cover inventory uniqueness/exclusions and per-route mirror mapping. A post-build coverage check verifies expected files and parses generated JSON/XML where practical. Snapshotting the full corpus was rejected because normal content growth would create noisy diffs.

## Risks / Trade-offs

- [A new route family is not registered in the inventory] → Keep static and content route definitions centralized and make the coverage test compare them against the known Astro page families.
- [Markdown omits presentation-only detail] → Preserve titles, canonical URLs, summaries, evidence fields, safety text, citations, and graph links; visual layout is intentionally excluded.
- [Large generated output increases build time] → Generate small text responses during the existing static build and avoid new parsing dependencies.
- [Hand-authored legacy discovery files conflict with generated routes] → Remove only superseded files and retain stable redirect compatibility where needed.

## Migration Plan

1. Introduce the shared inventory and generated endpoints alongside tests.
2. Remove superseded hand-maintained artifacts once generated equivalents pass validation.
3. Run type checks, targeted tests, and a full static build.
4. Archive the OpenSpec change and merge with `Closes #5`; no deployment is performed.
5. Roll back by reverting the feature commit, restoring the previous static artifacts.
