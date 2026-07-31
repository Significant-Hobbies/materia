## Why

Materia already exposes several discovery files, but they are hand-maintained and cover only a small subset of the 553-page static knowledge graph. Search engines and non-JavaScript agents need one source-derived, testable contract that covers every canonical public route without accidentally indexing operational or nonexistent URLs.

## What Changes

- Define the canonical public route inventory from Astro pages and content collections.
- Generate Markdown mirrors for public HTML pages and a compact `/api/ai` catalog from the same source data.
- Generate aligned sitemap, `llms.txt`, robots, canonical/Open Graph metadata, and structured data.
- Exclude 404, internal data endpoints, and other non-public surfaces from the public index.
- Add coverage tests that fail when a canonical route lacks its required discovery or agent-readable representation.

## Capabilities

### New Capabilities

- `public-discovery-coverage`: Canonical route inventory, search-engine discovery metadata, agent-readable mirrors, catalog output, and coverage guarantees.

### Modified Capabilities

None.

## Impact

This affects Astro route generation, build-time scripts, public discovery artifacts, metadata components, and tests. It adds no runtime service, production dependency, private data exposure, or deployment step; the site remains fully static.
