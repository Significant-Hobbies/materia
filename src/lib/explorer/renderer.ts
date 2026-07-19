import type { SystemId } from '@/data/systems';

/**
 * The data the explorer needs about each clickable region, independent of how
 * it's drawn. Astro resolves this at build time from the bodyParts collection
 * and hands it to the island as a plain serializable array.
 */
export interface ExplorerPart {
  /** matches a `data-part` / mesh name in the renderer */
  svgId: string;
  /** content slug → /part/[slug] */
  slug: string;
  name: string;
  summary: string;
  systems: SystemId[];
  conditions: { slug: string; name: string }[];
}
