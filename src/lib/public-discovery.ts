import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE_ORIGIN = 'https://materia.significanthobbies.com';

export type PublicRoute = {
  path: string;
  markdownPath: string;
  kind: 'static' | 'part' | 'condition' | 'remedy' | 'compound' | 'study';
  title: string;
  description: string;
  markdown: string;
};

const STATIC_PAGES = [
  [
    '/',
    'Materia',
    'Explore evidence-graded remedies through an interactive map of the human body.',
  ],
  ['/about', 'About Materia', 'What Materia is, who it is for, and how the project is governed.'],
  [
    '/checker',
    'Safety checker',
    'Check known interactions among herbs, supplements, and medicines.',
  ],
  [
    '/compounds',
    'Compounds',
    'Browse active constituents represented in the Materia knowledge graph.',
  ],
  [
    '/conditions',
    'Conditions',
    'Browse conditions linked to body parts and evidence-graded remedies.',
  ],
  [
    '/data',
    'Data and sources',
    'How Materia sources, structures, and validates its public evidence graph.',
  ],
  ['/disclaimer', 'Medical disclaimer', 'Important limits and safety guidance for using Materia.'],
  [
    '/faq',
    'Frequently asked questions',
    'Answers about evidence grades, citations, safety, and project scope.',
  ],
  [
    '/methodology',
    'Evidence methodology',
    'How Materia assigns evidence grades and separates efficacy from safety.',
  ],
  ['/parts', 'Body parts', 'Browse anatomical parts and their linked conditions.'],
  ['/remedies', 'Remedies', 'Browse herbs, supplements, nutrients, medicines, and practices.'],
  ['/search', 'Search', 'Search Materia across parts, conditions, remedies, and compounds.'],
] as const;

const absolute = (path: string) => new URL(path, SITE_ORIGIN).href;
const markdownPathFor = (path: string) => (path === '/' ? '/index.md' : `${path}.md`);
const link = (label: string, path: string) => `[${label}](${absolute(path)})`;
const list = (heading: string, values: string[]) =>
  values.length > 0 ? `\n## ${heading}\n\n${values.map((value) => `- ${value}`).join('\n')}\n` : '';

function staticMarkdown(path: string, title: string, description: string) {
  const directoryLinks = STATIC_PAGES.filter(([candidate]) => candidate !== path).map(
    ([candidate, label]) => link(label, candidate)
  );
  return `# ${title}\n\nCanonical: ${absolute(path)}\n\n${description}\n${list('Explore Materia', directoryLinks)}\n> Materia is an educational reference, not medical advice.\n`;
}

function referenceId(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string')
    return value.id;
  return undefined;
}

function referenceLinks(values: unknown, family: string) {
  if (!Array.isArray(values)) return [];
  return values.flatMap((value) => {
    const id = referenceId(value);
    return id ? [link(id, `/${family}/${id}`)] : [];
  });
}

function entityMarkdown(
  kind: PublicRoute['kind'],
  entry: CollectionEntry<'bodyParts' | 'conditions' | 'remedies' | 'compounds' | 'studies'>
) {
  const data = entry.data as Record<string, unknown>;
  const title = String(data.name ?? data.title ?? entry.id);
  const summary = String(data.summary ?? data.effect ?? 'Materia knowledge-graph entry.');
  const path = `/${kind}/${entry.id}`;
  const aliases = Array.isArray(data.aliases) ? data.aliases.map(String) : [];
  const sections = [
    list('Also known as', aliases),
    list('Body parts', referenceLinks(data.bodyParts, 'part')),
    list('Conditions', referenceLinks(data.conditions, 'condition')),
    list('Compounds', referenceLinks(data.compounds, 'compound')),
  ];

  if (kind === 'remedy' && Array.isArray(data.efficacy)) {
    const claims = data.efficacy.flatMap((claim) => {
      if (!claim || typeof claim !== 'object') return [];
      const record = claim as Record<string, unknown>;
      const condition = referenceId(record.condition);
      if (!condition) return [];
      return [
        `${link(condition, `/condition/${condition}`)} — grade ${String(record.grade)}: ${String(record.summary)}`,
      ];
    });
    sections.push(list('Evidence by condition', claims));
  }

  if (kind === 'study') {
    const details = [
      data.design && `Design: ${String(data.design)}`,
      data.year && `Year: ${String(data.year)}`,
      data.journal && `Journal: ${String(data.journal)}`,
      data.pmid && `PMID: ${String(data.pmid)}`,
      data.doi && `DOI: ${String(data.doi)}`,
      data.url && link('Primary source', String(data.url)),
    ].filter((value): value is string => Boolean(value));
    sections.push(list('Study details', details));
  }

  const body =
    typeof entry.body === 'string' && entry.body.trim()
      ? `\n## Notes\n\n${entry.body.trim()}\n`
      : '';
  return `# ${title}\n\nCanonical: ${absolute(path)}\n\n${summary}\n${sections.join('')}${body}\n> Materia is an educational reference, not medical advice.\n`;
}

export async function getPublicRoutes(): Promise<PublicRoute[]> {
  const routes: PublicRoute[] = STATIC_PAGES.map(([path, title, description]) => ({
    path,
    markdownPath: markdownPathFor(path),
    kind: 'static',
    title,
    description,
    markdown: staticMarkdown(path, title, description),
  }));

  const families = [
    ['bodyParts', 'part'],
    ['conditions', 'condition'],
    ['remedies', 'remedy'],
    ['compounds', 'compound'],
    ['studies', 'study'],
  ] as const;

  for (const [collection, kind] of families) {
    for (const entry of await getCollection(collection)) {
      const data = entry.data as Record<string, unknown>;
      const path = `/${kind}/${entry.id}`;
      routes.push({
        path,
        markdownPath: markdownPathFor(path),
        kind,
        title: String(data.name ?? data.title ?? entry.id),
        description: String(data.summary ?? data.effect ?? 'Materia knowledge-graph entry.'),
        markdown: entityMarkdown(kind, entry),
      });
    }
  }

  return routes.sort((a, b) => a.path.localeCompare(b.path));
}

export function createAgentCatalog(routes: PublicRoute[]) {
  return {
    name: 'Materia',
    version: 2,
    url: SITE_ORIGIN,
    llms: absolute('/llms.txt'),
    sitemap: absolute('/sitemap-index.xml'),
    robots: absolute('/robots.txt'),
    openapi: absolute('/openapi.json'),
    markdown: { suffix: '.md', homepage: absolute('/index.md'), negotiation: true },
    routes: routes.map(({ path, markdownPath, kind, title, description }) => ({
      path,
      url: absolute(path),
      markdown: absolute(markdownPath),
      kind,
      title,
      description,
    })),
  };
}

export function createLlmsText(routes: PublicRoute[]) {
  const directories = routes.filter((route) => route.kind === 'static');
  return `# Materia\n\n> Evidence-graded reference for remedies organized by body part, with study-level citations.\n\n## When to use this\n\n- Looking up evidence-graded remedies for a specific body part, condition, or compound\n- Checking the strength of research behind an herb, supplement, or drug before recommending it\n- Browsing a knowledge graph of body → condition → remedy → compound → study with citations\n- Getting the full public catalog as JSON or per-page markdown for agent consumption\n\n## Public pages\n\n${directories.map((route) => `- ${link(route.title, route.path)}: ${route.description}`).join('\n')}\n\n## Machine-readable access\n\n- ${link('Agent catalog', '/api/ai')}: complete JSON route and Markdown inventory\n- ${link('OpenAPI spec', '/openapi.json')}: machine-readable API contract for all agent surfaces\n- ${link('Sitemap', '/sitemap-index.xml')}: canonical public HTML pages\n- ${link('Robots', '/robots.txt')}: crawler policy\n- Markdown mirrors use the cataloged \`.md\` URL for every public page.\n\nMateria is an educational reference, not medical advice. Prefer cited page content over unsupported medical claims.\n`;
}

export function createLlmsFullText(routes: PublicRoute[]) {
  return `${createLlmsText(routes)}\n## Complete route inventory\n\n${routes
    .map(
      (route) =>
        `- ${link(route.title, route.path)} — [Markdown](${absolute(route.markdownPath)}): ${route.description}`
    )
    .join('\n')}\n`;
}
