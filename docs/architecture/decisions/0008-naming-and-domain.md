# ADR 0008 — Naming & domain

Date: 2026-06-21 · Status: Accepted (updated 2026-07-17)

## Context

The product needs a name that signals "materia medica / the stuff of medicine"
without claiming medical authority, and a domain.

## Decision

- **Name:** Materia (from *materia medica*).
- **Domain:** `materia.significanthobbies.com` (attached to the existing
  Cloudflare Pages project, verified live 2026-07-17). The original target
  `materia.io` was the chosen domain; `askgalen.com` was reserved as a `.com`
  alternative. The deployed production host is the `significanthobbies.com`
  subdomain.

## Consequences

- Cloudflare Pages project: `materia` (`materia-6bq.pages.dev`).
- `astro.config.mjs` `site` is set to the live domain for sitemap/canonical/OG.
- The name carries no medical-authority claim, consistent with
  [ADR 0004](0004-trust-as-hard-constraint.md).

## Alternatives considered

- **Exact-match `materia.com`:** unavailable.
- **`materia.io`:** available at decision time; superseded by the deployed
  subdomain. Revisit if a dedicated domain is wanted later.
