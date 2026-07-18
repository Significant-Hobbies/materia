# ADR 0001 — Astro static site, not a Vite+React SPA

Date: 2026-06-21 · Status: Accepted

## Context

Materia is a content-first cited reference library (per-entity pages for body
parts, conditions, remedies, compounds, studies) with exactly **one**
interactive surface — the body explorer. The product needs real, stable URLs
per entity for SEO and for citation/linking, and must render content text
instantly on edge caches.

## Decision

Build on **Astro 5** (`output: 'static'`, `build.format: 'file'`) with content
collections. The explorer is a single hydrated React island; everything else is
statically-rendered HTML at build time.

## Consequences

- Per-entity pages get real URLs and full SEO without paying JS everywhere.
- Content collections + Zod + `reference()` give build-checked referential
  integrity — the foundation for the citation invariant
  ([ADR 0003](0003-build-enforced-citations.md)).
- The explorer is the only hydration cost; the rest of the site ships near-zero
  JS and inlines critical CSS (`inlineStylesheets: 'always'`) for text-LCP.
- `build.format: 'file'` avoids trailing-slash 308 redirects on Cloudflare
  Pages (every internal link would otherwise round-trip).

## Alternatives considered

- **Vite + React SPA:** rejected — pays JS on every page for one interactive
  surface; worse SEO; no build-time content integrity.
- **Next.js SSG:** rejected — heavier, fleet standard is Astro
  (VoidZero ecosystem), and Astro's content collections are a closer fit for a
  typed graph of Markdown entities.
