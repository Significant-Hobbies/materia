## 1. Canonical inventory

- [ ] 1.1 Add a typed source-derived inventory for static pages and every public content collection route.
- [ ] 1.2 Encode exclusions and canonical-to-Markdown mappings without duplicating route data.

## 2. Generated discovery surfaces

- [ ] 2.1 Generate a Markdown mirror for every canonical public page with titles, canonical links, useful content, and graph links.
- [ ] 2.2 Generate the compact `/api/ai` catalog and aligned `llms.txt` surface from the canonical inventory.
- [ ] 2.3 Align sitemap and robots output with canonical public HTML routes while excluding non-public and alternate representations.
- [ ] 2.4 Ensure canonical, Open Graph, and structured metadata remain absolute and route-correct across page families.

## 3. Coverage and verification

- [ ] 3.1 Add targeted tests for inventory completeness, uniqueness, exclusions, mirrors, catalog, and sitemap membership.
- [ ] 3.2 Run OpenSpec strict validation, targeted tests, Astro checks, and the full production build.

## 4. Completion

- [ ] 4.1 Archive the completed OpenSpec change and update `PROJECT_STATUS.md` with shipped product truth.
- [ ] 4.2 Open and merge a passing pull request with `Closes #5`, without deploying production.
