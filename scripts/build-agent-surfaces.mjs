#!/usr/bin/env node

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = resolve(root, 'public');
const contentDir = resolve(root, 'src/content');
const origin = 'https://materia.significanthobbies.com';
const surfaces = JSON.parse(readFileSync(resolve(root, 'src/data/public-surfaces.json'), 'utf8'));

const collections = [
  {
    id: 'body-parts',
    source: 'body-parts',
    route: 'part',
    title: 'Body parts',
    titleField: 'name',
  },
  {
    id: 'conditions',
    source: 'conditions',
    route: 'condition',
    title: 'Conditions',
    titleField: 'name',
  },
  {
    id: 'remedies',
    source: 'remedies',
    route: 'remedy',
    title: 'Remedies',
    titleField: 'name',
  },
  {
    id: 'compounds',
    source: 'compounds',
    route: 'compound',
    title: 'Compounds',
    titleField: 'name',
  },
  {
    id: 'studies',
    source: 'studies',
    route: 'study',
    title: 'Studies',
    titleField: 'title',
  },
];

function writePublic(pathname, content) {
  const output = resolve(publicDir, pathname.replace(/^\//, ''));
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${content.trimEnd()}\n`, 'utf8');
}

function readEntries(collection) {
  const directory = resolve(contentDir, collection.source);
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && ['.md', '.mdx'].includes(extname(entry.name)))
    .map((entry) => {
      const slug = entry.name.replace(/\.(md|mdx)$/, '');
      const source = readFileSync(resolve(directory, entry.name), 'utf8');
      const match = source.match(new RegExp(`^${collection.titleField}:\\s*(.+)$`, 'm'));
      let title = slug.replaceAll('-', ' ');
      if (match) {
        try {
          title = JSON.parse(match[1]);
        } catch {
          title = match[1].trim();
        }
      }
      return { slug, title };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

const inventories = new Map(
  collections.map((collection) => [collection.id, readEntries(collection)])
);
const surfaceCollections = new Map([
  ['parts', 'body-parts'],
  ['conditions', 'conditions'],
  ['remedies', 'remedies'],
  ['compounds', 'compounds'],
]);
const totalCollectionPages = [...inventories.values()].reduce(
  (total, entries) => total + entries.length,
  0
);

function collectionLinks(collectionId) {
  const collection = collections.find((item) => item.id === collectionId);
  const entries = inventories.get(collectionId);
  if (!collection || !entries) return '';
  return entries
    .map(
      (entry) =>
        `- [${entry.title}](${origin}/${collection.route}/${entry.slug}) ([Markdown](${origin}/${collection.route}/${entry.slug}.md))`
    )
    .join('\n');
}

for (const surface of surfaces) {
  const relatedCollection = surfaceCollections.get(surface.id);
  const inventory = relatedCollection
    ? `\n\n## Public entries\n\n${collectionLinks(relatedCollection)}`
    : '';
  const dataNote =
    surface.id === 'data'
      ? `\n\n## Export\n\n- [Materia knowledge graph JSON](${origin}/data/materia-graph.json)\n- ${totalCollectionPages} public collection records across five page types`
      : '';

  writePublic(
    surface.markdownPath,
    `# ${surface.title}

${surface.description}

${surface.markdown}${inventory}${dataNote}

## Links

- [HTML page](${origin}${surface.path})
- [Agent catalog](${origin}/api/ai)
- [Medical disclaimer](${origin}/disclaimer)`
  );
}

const catalog = {
  name: 'Materia',
  version: '2',
  url: origin,
  llms: `${origin}/llms.txt`,
  llmsFull: `${origin}/llms-full.txt`,
  sitemap: `${origin}/sitemap-index.xml`,
  robots: `${origin}/robots.txt`,
  markdown: { suffix: '.md', negotiation: false },
  surfaces: surfaces.map((surface) => ({
    id: surface.id,
    url: `${origin}${surface.path}`,
    md: `${origin}${surface.markdownPath}`,
    kind: 'static',
    description: surface.description,
  })),
  collections: collections.map((collection) => ({
    id: collection.id,
    count: inventories.get(collection.id).length,
    urlTemplate: `${origin}/${collection.route}/{slug}`,
    mdTemplate: `${origin}/${collection.route}/{slug}.md`,
    source: `Checked-in Astro ${collection.source} content collection`,
  })),
  dataResources: [
    {
      id: 'knowledge-graph',
      kind: 'dataset',
      url: `${origin}/data/materia-graph.json`,
      description: `${totalCollectionPages} public collection nodes plus cited graph relationships`,
    },
  ],
  auth: {
    public: true,
    notes:
      'Materia has no accounts or private content routes. The safety checker keeps the visitor-selected stack in the browser. The 404 page and machine resources are not public HTML index entries.',
  },
};

writePublic('/api-ai.json', JSON.stringify(catalog, null, 2));
writePublic(
  '/llms.txt',
  `# Materia

> Evidence-graded reference connecting body parts, conditions, remedies, compounds, and studies.

## Public pages

${surfaces.map((surface) => `- [${surface.title}](${origin}${surface.path})`).join('\n')}

## Collection templates

${collections
  .map(
    (collection) =>
      `- ${collection.title}: ${origin}/${collection.route}/{slug} and ${origin}/${collection.route}/{slug}.md (${inventories.get(collection.id).length} entries)`
  )
  .join('\n')}

## Machine surfaces

- [Agent catalog](${origin}/api/ai)
- [Sitemap](${origin}/sitemap-index.xml)
- [Knowledge graph JSON](${origin}/data/materia-graph.json)
- [Homepage Markdown](${origin}/index.md)

Materia is an educational evidence aggregator, not medical advice.`
);
writePublic(
  '/llms-full.txt',
  `# Materia — full agent brief

Materia publishes ${surfaces.length} static public pages and ${totalCollectionPages} collection pages: ${collections
    .map(
      (collection) => `${inventories.get(collection.id).length} ${collection.title.toLowerCase()}`
    )
    .join(', ')}.

${surfaces
  .map(
    (surface) =>
      `## ${surface.title}\n\n${surface.description}\n\n${surface.markdown}\n\n- HTML: ${origin}${surface.path}\n- Markdown: ${origin}${surface.markdownPath}`
  )
  .join('\n\n')}

## Content and safety boundary

The checked-in Astro content collections are the source for the public HTML, Markdown, and knowledge-graph export. Materia does not diagnose, prescribe, or replace clinical care. Every efficacy claim must carry at least one citation, and grades apply per remedy-condition pair rather than globally.`
);

process.stdout.write(
  `Generated ${surfaces.length} static Markdown surfaces and catalog templates for ${totalCollectionPages} collection pages.\n`
);
