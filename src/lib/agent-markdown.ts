import type { CollectionEntry } from 'astro:content';

const origin = 'https://materia.significanthobbies.com';

type PublicCollection = 'bodyParts' | 'conditions' | 'remedies' | 'compounds' | 'studies';

export function markdownResponse(markdown: string) {
  return new Response(`${markdown.trimEnd()}\n`, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function collectionMarkdownPaths<K extends PublicCollection>(collection: K) {
  const { getCollection } = await import('astro:content');
  const entries = await getCollection(collection);
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

function link(route: string, id: string, label = id) {
  return `[${label}](${origin}/${route}/${id})`;
}

function values(title: string, items: string[]) {
  return items.length ? `## ${title}\n\n${items.map((item) => `- ${item}`).join('\n')}` : '';
}

function body(entry: { body?: string }) {
  return entry.body?.trim() ? `## Context\n\n${entry.body.trim()}` : '';
}

function footer(path: string) {
  return `## Source and safety

- [Canonical HTML](${origin}${path})
- [Evidence methodology](${origin}/methodology)
- [Medical disclaimer](${origin}/disclaimer)

Materia is an educational evidence aggregator, not medical advice.`;
}

export function renderBodyPartMarkdown(entry: CollectionEntry<'bodyParts'>) {
  const data = entry.data;
  return [
    `# ${data.name}`,
    data.summary,
    values('Anatomy', [
      `Region: ${data.region}`,
      `Systems: ${data.systems.join(', ')}`,
      `Views: ${data.view.join(', ')}`,
    ]),
    values(
      'Related conditions',
      data.conditions.map((condition) => link('condition', condition.id))
    ),
    body(entry),
    footer(`/part/${entry.id}`),
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function renderConditionMarkdown(entry: CollectionEntry<'conditions'>) {
  const data = entry.data;
  return [
    `# ${data.name}`,
    data.summary,
    values('Details', [
      `Severity: ${data.severity}`,
      ...(data.aliases.length ? [`Also known as: ${data.aliases.join(', ')}`] : []),
    ]),
    values(
      'Related body parts',
      data.bodyParts.map((part) => link('part', part.id))
    ),
    values('Red flags', data.redFlags),
    body(entry),
    footer(`/condition/${entry.id}`),
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function renderRemedyMarkdown(entry: CollectionEntry<'remedies'>) {
  const data = entry.data;
  const efficacy = data.efficacy.map((claim) => {
    const citations = [
      ...claim.studies.map((study) => link('study', study.id)),
      ...claim.sources.map((source) => source.id),
    ];
    return `### ${link('condition', claim.condition.id)} — grade ${claim.grade}

${claim.summary}

${citations.length ? `Citations: ${citations.join(', ')}` : ''}`.trim();
  });
  const safety = [
    `Pregnancy: ${data.safety.pregnancy}`,
    ...data.safety.interactions.map((item) => `Recorded interaction: ${item}`),
    ...data.safety.contraindications.map((item) => `Contraindication: ${item}`),
    ...data.safety.sideEffects.map((item) => `Recorded side effect: ${item}`),
  ];
  const typedInteractions = data.interactsWith.map(
    (interaction) =>
      `${link('remedy', interaction.target.id)} — ${interaction.severity}: ${interaction.mechanism}`
  );

  return [
    `# ${data.name}`,
    data.summary,
    values('Classification', [
      `Kind: ${data.kind}`,
      ...(data.aliases.length ? [`Also known as: ${data.aliases.join(', ')}`] : []),
    ]),
    values(
      'Active compounds',
      data.compounds.map((compound) => link('compound', compound.id))
    ),
    efficacy.length ? `## Evidence by condition\n\n${efficacy.join('\n\n')}` : '',
    values('Safety', safety),
    values('Typed interaction edges', typedInteractions),
    body(entry),
    footer(`/remedy/${entry.id}`),
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function renderCompoundMarkdown(entry: CollectionEntry<'compounds'>) {
  const data = entry.data;
  return [
    `# ${data.name}`,
    data.summary,
    values('Details', [
      ...(data.classification ? [`Classification: ${data.classification}`] : []),
      ...(data.aliases.length ? [`Also known as: ${data.aliases.join(', ')}`] : []),
      ...(data.mechanism ? [`Mechanism: ${data.mechanism}`] : []),
      ...(data.targets.length ? [`Targets: ${data.targets.join(', ')}`] : []),
    ]),
    body(entry),
    footer(`/compound/${entry.id}`),
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function renderStudyMarkdown(entry: CollectionEntry<'studies'>) {
  const data = entry.data;
  return [
    `# ${data.title}`,
    data.effect,
    values('Study details', [
      `Design: ${data.design}`,
      `Year: ${data.year}`,
      ...(data.n ? [`Sample size: ${data.n}`] : []),
      ...(data.population ? [`Population: ${data.population}`] : []),
      ...(data.intervention ? [`Intervention: ${data.intervention}`] : []),
      ...(data.outcome ? [`Outcome: ${data.outcome}`] : []),
      ...(data.journal ? [`Journal: ${data.journal}`] : []),
      ...(data.pmid ? [`PMID: ${data.pmid}`] : []),
      ...(data.doi ? [`DOI: ${data.doi}`] : []),
      `Primary source: ${data.url}`,
    ]),
    body(entry),
    footer(`/study/${entry.id}`),
  ]
    .filter(Boolean)
    .join('\n\n');
}
