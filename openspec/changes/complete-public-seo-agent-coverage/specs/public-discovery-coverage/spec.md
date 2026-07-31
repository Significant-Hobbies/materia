## Purpose

Ensure every canonical public Materia page is discoverable by search engines and available to non-JavaScript agents through source-derived, mutually consistent artifacts.

## ADDED Requirements

### Requirement: Canonical public route inventory
The system SHALL derive one canonical inventory containing every public HTML route and SHALL exclude error, operational, redirect-only, and data-only routes.

#### Scenario: Content and static routes are inventoried
- **WHEN** the site is built
- **THEN** every canonical static page and every generated public content page appears exactly once in the inventory

#### Scenario: Non-public routes are excluded
- **WHEN** the inventory is generated
- **THEN** 404 pages, internal data endpoints, redirect targets, and nonexistent routes do not appear

### Requirement: Search discovery surfaces stay aligned
The system SHALL expose robots, sitemap, canonical metadata, Open Graph metadata, and structured data that use the production origin and agree with the canonical inventory.

#### Scenario: Indexed page metadata is canonical
- **WHEN** a crawler requests a canonical HTML page
- **THEN** the page exposes an absolute self-canonical URL, matching Open Graph URL, and appropriate structured data

#### Scenario: Sitemap contains public HTML routes only
- **WHEN** the sitemap is generated
- **THEN** it contains every canonical public HTML route and excludes agent artifacts and non-public routes

### Requirement: Agent-readable route coverage
The system SHALL expose a plain Markdown representation for every canonical public HTML route without requiring JavaScript.

#### Scenario: Agent requests a Markdown mirror
- **WHEN** an agent appends `.md` to a canonical public route
- **THEN** it receives a successful Markdown response containing the page title, canonical URL, meaningful page content, and relevant graph links

### Requirement: Compact agent catalog
The system SHALL expose `/api/ai` as a compact JSON catalog describing discovery artifacts and every canonical public route with its Markdown mirror.

#### Scenario: Agent requests the catalog
- **WHEN** an agent requests `/api/ai`
- **THEN** it receives valid JSON generated from the same canonical inventory used by the other discovery surfaces

### Requirement: Coverage drift fails validation
The system MUST detect missing, duplicate, stale, or non-public entries across the route inventory, Markdown mirrors, sitemap inputs, and agent catalog.

#### Scenario: A new canonical route lacks agent coverage
- **WHEN** validation runs after a public route is added without its required mirror or catalog entry
- **THEN** validation fails with the uncovered route identified

