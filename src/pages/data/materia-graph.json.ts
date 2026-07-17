// Build-time endpoint: exports the full Materia knowledge graph as JSON.
// Reads every content collection and emits nodes + edges so external tools
// (network visualisers, research notebooks, LLM pipelines) can consume the
// exact same data the site renders — no scraping required.
//
// GET /data/materia-graph.json

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const [remedies, conditions, studies, compounds, sources, bodyParts] = await Promise.all([
    getCollection('remedies'),
    getCollection('conditions'),
    getCollection('studies'),
    getCollection('compounds'),
    getCollection('sources'),
    getCollection('bodyParts'),
  ]);

  const nodes: Record<string, unknown>[] = [];
  const edges: Record<string, unknown>[] = [];

  // -- Body-part nodes ---------------------------------------------------
  for (const bp of bodyParts) {
    nodes.push({
      id: bp.id,
      type: 'bodyPart',
      label: bp.data.name,
      region: bp.data.region,
      systems: bp.data.systems,
      summary: bp.data.summary,
    });
    // condition → bodyPart edges
    for (const condRef of bp.data.conditions) {
      edges.push({
        source: condRef.id,
        target: bp.id,
        type: 'condition-located-at',
      });
    }
  }

  // -- Condition nodes ---------------------------------------------------
  for (const c of conditions) {
    nodes.push({
      id: c.id,
      type: 'condition',
      label: c.data.name,
      aliases: c.data.aliases,
      severity: c.data.severity,
      summary: c.data.summary,
      redFlags: c.data.redFlags,
    });
  }

  // -- Study nodes -------------------------------------------------------
  for (const s of studies) {
    nodes.push({
      id: s.id,
      type: 'study',
      label: s.data.title,
      design: s.data.design,
      year: s.data.year,
      n: s.data.n ?? null,
      population: s.data.population ?? null,
      intervention: s.data.intervention ?? null,
      outcome: s.data.outcome ?? null,
      effect: s.data.effect,
      journal: s.data.journal ?? null,
      pmid: s.data.pmid ?? null,
      doi: s.data.doi ?? null,
      url: s.data.url,
    });
  }

  // -- Source nodes ------------------------------------------------------
  for (const src of sources) {
    nodes.push({
      id: src.id,
      type: 'source',
      label: src.data.title,
      publisher: src.data.publisher,
      url: src.data.url,
      year: src.data.year ?? null,
      kind: src.data.type,
    });
  }

  // -- Compound nodes ----------------------------------------------------
  for (const comp of compounds) {
    nodes.push({
      id: comp.id,
      type: 'compound',
      label: comp.data.name,
      aliases: comp.data.aliases,
      classification: comp.data.classification ?? null,
      summary: comp.data.summary,
      mechanism: comp.data.mechanism ?? null,
      targets: comp.data.targets,
    });
  }

  // -- Remedy nodes + edges ----------------------------------------------
  for (const r of remedies) {
    nodes.push({
      id: r.id,
      type: 'remedy',
      label: r.data.name,
      kind: r.data.kind,
      aliases: r.data.aliases,
      summary: r.data.summary,
      typicalUse: r.data.typicalUse ?? null,
      pregnancy: r.data.safety.pregnancy,
    });

    // remedy → compound (contains)
    for (const compRef of r.data.compounds) {
      edges.push({
        source: r.id,
        target: compRef.id,
        type: 'remedy-contains-compound',
      });
    }

    // remedy → condition (efficacy claim, graded) + remedy → study/source
    for (const claim of r.data.efficacy) {
      edges.push({
        source: r.id,
        target: claim.condition.id,
        type: 'remedy-treats-condition',
        grade: claim.grade,
        summary: claim.summary,
        tradition: claim.tradition,
      });
      for (const studyRef of claim.studies) {
        edges.push({
          source: r.id,
          target: studyRef.id,
          type: 'remedy-cites-study',
          viaCondition: claim.condition.id,
        });
      }
      for (const srcRef of claim.sources) {
        edges.push({
          source: r.id,
          target: srcRef.id,
          type: 'remedy-cites-source',
          viaCondition: claim.condition.id,
        });
      }
    }

    // remedy → remedy (typed interactions — powers the safety checker)
    for (const ix of r.data.interactsWith) {
      edges.push({
        source: r.id,
        target: ix.target.id,
        type: 'remedy-interacts-with',
        severity: ix.severity,
        mechanism: ix.mechanism,
        citationSource: ix.source?.id ?? null,
      });
    }
  }

  const graph = {
    generated: new Date().toISOString(),
    schema: 'materia-knowledge-graph/v1',
    description:
      'Evidence-graded knowledge graph: body → condition → remedy → compound → study. Every remedy×condition edge carries a letter grade and links to the studies/sources behind it.',
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodes,
    edges,
  };

  return new Response(JSON.stringify(graph, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
