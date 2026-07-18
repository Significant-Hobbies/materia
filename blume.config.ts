// @ts-check
/**
 * Blume configuration — PRESENTATION ONLY.
 *
 * The committed Markdown under `docs/` is the source of truth. Blume renders
 * and searches it; it is not authoritative for any fact. Code and executable
 * config (`src/`, `scripts/`, `.github/`, `*.config.*`) remain authoritative
 * for implementation details and schedules. Never edit generated `.blume/`
 * output.
 *
 * `blume` is intentionally NOT a package.json dependency — docs validate via
 * `npm run docs:check` (a standalone script) and stand on their own without
 * Blume. Install Blume on demand (`npx blume dev`) when you want to preview.
 *
 * OUTPUT COLLISION: both Astro (`npm run build`) and Blume (`blume build`)
 * write to `dist/` by default. Do NOT run `blume build` in the same working
 * tree as `npm run build` without overriding the output directory. See
 * docs/operations/deploy.md.
 */
import { defineConfig } from 'blume';

export default defineConfig({
  title: 'Materia — docs',
  description:
    'The Examine.com of the whole body. Architecture, decisions, development, operations, and durable learnings for the Materia knowledge-graph reference.',

  content: {
    // The Markdown source of truth. Blume scans this folder; it does not own
    // the content.
    root: 'docs',
  },

  // The docs site is a separate publishing surface from the product
  // (materia.significanthobbies.com). Set the canonical origin when you pick a
  // docs host/subdomain — left unset until the publishing target is decided
  // (see STATUS.md "Unresolved questions").
  deployment: {
    output: 'static',
    // site: "https://docs.materia.significanthobbies.com",
  },

  search: {
    provider: 'orama',
  },

  // Keep AI surfaces aligned with the product's own agent-indexing posture
  // (llms.txt / llms-full.txt / api/ai already ship on the product site).
  ai: {
    llmsTxt: true,
  },

  seo: {
    og: { enabled: true },
    sitemap: true,
    robots: true,
  },
});
