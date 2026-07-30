#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const origin = 'https://materia.significanthobbies.com';
const expected = {
  static: 12,
  collections: {
    'body-parts': 24,
    conditions: 77,
    remedies: 207,
    compounds: 60,
    studies: 175,
  },
};
const errors = [];

function fail(message) {
  errors.push(message);
}

const sitemapPath = resolve(dist, 'sitemap-0.xml');
if (!existsSync(sitemapPath)) {
  fail('dist/sitemap-0.xml is missing');
}

const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : '';
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedCollectionCount = Object.values(expected.collections).reduce(
  (total, count) => total + count,
  0
);
const expectedTotal = expected.static + expectedCollectionCount;

if (urls.length !== expectedTotal) {
  fail(`expected ${expectedTotal} canonical URLs, found ${urls.length}`);
}
if (new Set(urls).size !== urls.length) {
  fail('sitemap contains duplicate URLs');
}

for (const url of urls) {
  const pathname = new URL(url).pathname;
  if (pathname.endsWith('.md') || pathname.endsWith('.json') || pathname.startsWith('/api/')) {
    fail(`non-HTML resource appears in sitemap: ${pathname}`);
    continue;
  }
  const relative = pathname === '/' ? 'index' : pathname.slice(1);
  const htmlPath = resolve(dist, `${relative}.html`);
  if (!existsSync(htmlPath)) {
    fail(`missing HTML output for ${pathname}`);
  } else {
    const html = readFileSync(htmlPath, 'utf8');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    const expectedCanonical = new URL(url).href;
    if (!canonical || new URL(canonical).href !== expectedCanonical) {
      fail(`canonical mismatch for ${pathname}: ${canonical ?? 'missing'}`);
    }
    const openGraphUrl = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
    if (!openGraphUrl || new URL(openGraphUrl).href !== expectedCanonical) {
      fail(`Open Graph URL mismatch for ${pathname}: ${openGraphUrl ?? 'missing'}`);
    }
    for (const marker of [
      '<title>',
      '<meta name="description"',
      '<meta property="og:title"',
      '<meta property="og:description"',
      '<meta property="og:image"',
      '<meta name="twitter:card"',
      '<script type="application/ld+json">',
    ]) {
      if (!html.includes(marker)) fail(`missing ${marker} on ${pathname}`);
    }
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.+?)<\/script>/g)];
    for (const schema of schemas) {
      try {
        JSON.parse(schema[1]);
      } catch {
        fail(`invalid JSON-LD on ${pathname}`);
      }
    }
  }
  if (!existsSync(resolve(dist, `${relative}.md`))) {
    fail(`missing Markdown output for ${pathname}`);
  }
}

const catalogPath = resolve(dist, 'api-ai.json');
if (!existsSync(catalogPath)) {
  fail('dist/api-ai.json is missing');
} else {
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  if (catalog.surfaces?.length !== expected.static) {
    fail(`expected ${expected.static} catalog surfaces, found ${catalog.surfaces?.length ?? 0}`);
  }
  for (const [id, count] of Object.entries(expected.collections)) {
    const collection = catalog.collections?.find((item) => item.id === id);
    if (!collection) {
      fail(`catalog collection ${id} is missing`);
    } else if (collection.count !== count) {
      fail(`catalog collection ${id} expected ${count}, found ${collection.count}`);
    }
  }
}

if (!existsSync(resolve(dist, 'data/materia-graph.json'))) {
  fail('knowledge-graph data resource is missing');
}
if (!existsSync(resolve(dist, 'og-image.svg'))) {
  fail('Open Graph image is missing');
}
if (existsSync(resolve(dist, 'sitemap.xml'))) {
  fail('stale standalone sitemap.xml should not coexist with sitemap-index.xml');
}

const markdownFiles = readdirSync(dist, { recursive: true }).filter((path) => path.endsWith('.md'));
if (markdownFiles.length !== expectedTotal) {
  fail(`expected ${expectedTotal} Markdown outputs, found ${markdownFiles.length}`);
}

if (errors.length) {
  process.stderr.write(`${errors.map((error) => `- ${error}`).join('\n')}\n`);
  process.exit(1);
}

process.stdout.write(
  `Verified ${expectedTotal} canonical HTML routes and ${markdownFiles.length} Markdown mirrors (${expected.static} static + ${expectedCollectionCount} collection pages) at ${origin}.\n`
);
