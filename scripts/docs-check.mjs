/**
 * Docs integrity check — local-first, no Blume dependency.
 *
 * Validates the `docs/` tree:
 *   1. Required entry files exist.
 *   2. No content directory is empty (every dir under docs/ has ≥1 .md file,
 *      directly or in a subtree — but a leaf dir with zero .md is flagged).
 *   3. Internal Markdown links resolve to a real file (relative paths + anchors).
 *   4. Root files referenced from docs (../STATUS.md, ../AGENTS.md,
 *      ../PROJECT_STATUS.md, ../README.md, ../ATTRIBUTIONS.md) exist.
 *   5. ADRs referenced from docs/decision-log.md exist.
 *
 * External http(s) links are NOT checked here (network checks belong in a
 * separate, opt-in step). Blume's `blume validate` can do external links when
 * installed.
 *
 * Run: `npm run docs:check`
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');

const REQUIRED = [
  'docs/index.md',
  'docs/decision-log.md',
  'docs/architecture/overview.md',
  'docs/architecture/data-model.md',
  'docs/architecture/explorer.md',
  'docs/product/overview.md',
  'docs/product/trust-posture.md',
  'docs/product/competitive-analysis.md',
  'docs/product/launch-post.md',
  'docs/development/setup.md',
  'docs/development/authoring-content.md',
  'docs/development/testing.md',
  'docs/operations/deploy.md',
  'docs/operations/jobs/ci.md',
  'docs/operations/jobs/import-pipeline.md',
  'docs/operations/runbooks/add-3d-body-model.md',
  'docs/knowledge/learnings/new-things.md',
  'docs/knowledge/failed-approaches.md',
  'AGENTS.md',
  'STATUS.md',
  'PROJECT_STATUS.md',
  'README.md',
  'ATTRIBUTIONS.md',
];

let errors = 0;
const err = (msg) => {
  errors++;
  console.error(`  ✖ ${msg}`);
};
const ok = (msg) => console.log(`  ✓ ${msg}`);

/* --- gather all markdown files under docs/ --- */
function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) acc.push(full);
  }
  return acc;
}

/* --- find empty leaf directories under docs/ --- */
function emptyDirs(dir, acc = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  if (entries.length === 0) {
    acc.push(dir);
    return acc;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      const sub = join(dir, e.name);
      const subEntries = readdirSync(sub, { withFileTypes: true });
      const hasMd = subEntries.some(
        (s) => s.isFile() && (s.name.endsWith('.md') || s.name.endsWith('.mdx'))
      );
      const hasSubdir = subEntries.some((s) => s.isDirectory());
      if (!hasMd && !hasSubdir) acc.push(sub);
      else emptyDirs(sub, acc);
    }
  }
  return acc;
}

/* --- link extraction: [text](url) but skip inline-code spans --- */
const LINK_RE = /(?<!`)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)(?!`)/g;

function extractLinks(text) {
  const links = [];
  for (const m of text.matchAll(LINK_RE)) {
    links.push({ text: m[1], url: m[2] });
  }
  return links;
}

/* --- resolve a link target relative to a source file --- */
function resolveTarget(fromFile, url) {
  if (url.startsWith('#')) return { anchor: url.slice(1), file: fromFile };
  if (/^https?:\/\//i.test(url)) return null; // external — skip
  if (url.startsWith('mailto:')) return null;
  const [pathPart, anchorPart] = url.split('#');
  const base = dirname(fromFile);
  const resolved = normalize(join(base, pathPart));
  return { file: resolved, anchor: anchorPart || null };
}

/* --- check an anchor exists as a heading in the target file --- */
function headingExists(file, anchor) {
  if (!anchor) return true;
  if (!existsSync(file)) return false;
  const text = readFileSync(file, 'utf8');
  const headingRe = /^#{1,6}\s+(.+?)\s*$/gm;
  const slugify = (s) =>
    s
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  for (const m of text.matchAll(headingRe)) {
    if (slugify(m[1]) === anchor) return true;
  }
  return false;
}

console.log('Docs checks…');

/* 1. required files */
console.log('• required files');
for (const rel of REQUIRED) {
  const full = join(ROOT, rel);
  if (!existsSync(full)) err(`missing required file: ${rel}`);
}
ok(`${REQUIRED.length} required files present`);

/* 2. empty directories */
console.log('• empty content directories');
const empties = emptyDirs(DOCS);
for (const d of empties) err(`empty directory: ${relative(ROOT, d) || '(docs root)'}`);
if (empties.length === 0) ok('no empty directories under docs/');

/* 3 + 4. internal links */
console.log('• internal links');
const mdFiles = walk(DOCS);
let checked = 0;
let broken = 0;
for (const file of mdFiles) {
  const text = readFileSync(file, 'utf8');
  for (const link of extractLinks(text)) {
    const target = resolveTarget(file, link.url);
    if (!target) continue; // external
    checked++;
    if (!existsSync(target.file)) {
      err(
        `broken link in ${relative(ROOT, file)}: [${link.text}](${link.url}) → ${relative(ROOT, target.file)} not found`
      );
      broken++;
      continue;
    }
    if (target.anchor && !headingExists(target.file, target.anchor)) {
      err(
        `broken anchor in ${relative(ROOT, file)}: [${link.text}](${link.url}) → #${target.anchor} not a heading in ${relative(ROOT, target.file)}`
      );
      broken++;
    }
  }
}
ok(`${checked} internal links checked, ${broken} broken`);

/* 5. ADRs referenced from decision-log.md exist */
console.log('• ADR references in decision-log.md');
const logFile = join(DOCS, 'decision-log.md');
if (existsSync(logFile)) {
  const logText = readFileSync(logFile, 'utf8');
  const adrRe = /\((architecture\/decisions\/\d{4}-[^)]+\.md)\)/g;
  let adrCount = 0;
  let adrMissing = 0;
  for (const m of logText.matchAll(adrRe)) {
    adrCount++;
    const full = join(DOCS, m[1]);
    if (!existsSync(full)) {
      err(`decision-log.md references missing ADR: ${m[1]}`);
      adrMissing++;
    }
  }
  ok(`${adrCount} ADR references, ${adrMissing} missing`);
} else {
  err('docs/decision-log.md not found (skipping ADR reference check)');
}

/* 6. every ADR file should be linked from decision-log.md */
console.log('• ADRs linked from decision-log.md');
const adrDir = join(DOCS, 'architecture', 'decisions');
if (existsSync(adrDir)) {
  const adrs = readdirSync(adrDir).filter((f) => f.endsWith('.md'));
  const logText2 = readFileSync(logFile, 'utf8');
  let orphan = 0;
  for (const a of adrs) {
    if (!logText2.includes(`architecture/decisions/${a}`)) {
      err(`ADR not linked from decision-log.md: architecture/decisions/${a}`);
      orphan++;
    }
  }
  ok(`${adrs.length} ADR files, ${orphan} orphaned`);
}

console.log(errors === 0 ? '\n✓ Docs OK.' : `\nDone — ${errors} error(s).`);
process.exit(errors === 0 ? 0 : 1);
