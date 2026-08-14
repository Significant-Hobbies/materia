#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';

const origin = 'https://materia.significanthobbies.com';
const seenSitemaps = new Set();

function locations(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function collectSitemap(filename) {
  if (seenSitemaps.has(filename)) return [];
  seenSitemaps.add(filename);
  const xml = readFileSync(`dist/${filename}`, 'utf8');
  const entries = locations(xml);
  if (!xml.includes('<sitemapindex')) return entries;
  return entries.flatMap((entry) => collectSitemap(new URL(entry).pathname.slice(1)));
}

const urls = [
  ...new Set(
    ['sitemap-index.xml', 'sitemap.xml']
      .filter((filename) => existsSync(`dist/${filename}`))
      .flatMap(collectSitemap)
  ),
];
const issues = [];

for (const value of urls) {
  const url = new URL(value);
  const relative = decodeURIComponent(url.pathname);
  const filename = relative === '/' ? 'dist/index.html' : `dist${relative}.html`;
  if (!existsSync(filename)) {
    issues.push(`${value}: no generated HTML file at ${filename}`);
    continue;
  }
  const html = readFileSync(filename, 'utf8');
  const tag = html.match(/<link\b[^>]*\brel=(['"])canonical\1[^>]*>/i)?.[0];
  const canonical = tag?.match(/\bhref=(['"])(.*?)\1/i)?.[2];
  const openGraphTag = html.match(/<meta\b[^>]*\bproperty=(['"])og:url\1[^>]*>/i)?.[0];
  const openGraphUrl = openGraphTag?.match(/\bcontent=(['"])(.*?)\1/i)?.[2];
  const expected = new URL(url.pathname, origin).href;
  if (!canonical) issues.push(`${value}: missing canonical`);
  else if (new URL(canonical, origin).href !== expected) {
    issues.push(`${value}: canonical is ${canonical}`);
  }
  if (!openGraphUrl) issues.push(`${value}: missing og:url`);
  else if (new URL(openGraphUrl, origin).href !== expected) {
    issues.push(`${value}: og:url is ${openGraphUrl}`);
  }
}

if (issues.length > 0) {
  console.error(`Built SEO verification failed: ${issues.length}/${urls.length} sitemap URLs`);
  for (const issue of issues.slice(0, 50)) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Built SEO verification passed: ${urls.length}/${urls.length} sitemap URLs`);
