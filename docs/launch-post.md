# Materia — an evidence-graded map of every remedy claim

**Show HN / r/supplements / r/Nootropics draft post. Factual voice. ~550 words.**

---

I built [Materia](https://materia.significanthobbies.com) — a static, ad-free reference
that maps every remedy claim to the studies behind it and grades the strength of the
evidence. Think "Examine.com for the whole body," organized as a clickable knowledge graph:
**body → condition → remedy → compound → study**.

## What it is

555 pages covering 207 remedies (herbs, supplements, drugs), 77 conditions, 175 studies,
60 active compounds, and 37 source citations (NCCIH, MedlinePlus, Cochrane, NIH ODS, MSK
About Herbs). Every remedy×condition pair carries an evidence grade and links to the
primary research or authoritative source behind it. The whole graph is downloadable as a
single JSON file at [/data](https://materia.significanthobbies.com/data).

## The grading method

Grades are assigned **per remedy × condition**, never to a remedy as a whole. Turmeric
might be a B for knee osteoarthritis and "insufficient" for everything else. Under the hood
the reasoning is GRADE-inspired (certainty of evidence), but the consumer-facing output is a
single letter:

| Grade | Meaning |
|-------|---------|
| **A** | Consistent results from high-quality RCTs or systematic reviews/meta-analyses |
| **B** | Some RCTs, but limited in number, size, or consistency |
| **C** | Preliminary, small, or observational human evidence |
| **D** | Traditional use, anecdote, or only lab/animal data |
| **—** | Insufficient evidence to grade in either direction |

Efficacy and safety are separate axes. A high efficacy grade says nothing about safety —
interactions, contraindications, side effects, and pregnancy status are tracked
independently and shown next to every efficacy claim.

## What's NOT claimed

- **Not medical advice.** There's a sitewide banner, an inline disclaimer on every entity
  page, and red-flag gating on conditions that warrant clinical attention.
- **No dosing recommendations.** Where amounts appear, they report what researchers
  *studied* ("studied at 300–600 mg/day in trials"), never a dose to take. A content-check
  lint flags imperative dosing prose for review (schema validation, which does
  fail the build, enforces the citation requirement).
- **No ads, no affiliate links, no supplement sales.** The commerce layer is reserved but
  firewalled from evidence.
- **No invented citations.** The schema enforces ≥1 study or source per efficacy claim — the
  build fails if a medical claim has no citation. PMIDs and DOIs are verified against
  PubMed/NCCIH/Cochrane before entry.

## Structure of the data

The site is an Astro 5 static build. Content lives in six typed collections (remedies,
conditions, studies, compounds, bodyParts, sources) with Zod schemas and `reference()`
cross-links — so integrity is build-checked. The knowledge graph is just those
cross-references resolved at build time:

- **remedy → condition** edges carry the grade, a one-line summary, and tradition alignment
- **remedy → study** and **remedy → source** edges record which claim each citation supports
- **remedy → compound** edges connect products to their active constituents
- **remedy → remedy** edges carry typed interaction data (severity + mechanism) — this
  powers the [interaction checker](https://materia.significanthobbies.com/checker), which
  also flags duplicate compounds and risk-class clustering (e.g. multiple items in a stack
  that pile onto bleeding risk or sedation)

The full graph exports at `/data/materia-graph.json` — same data the site renders, no
scraping required. CC BY 4.0.

## How to use it

Browse the body explorer (anterior/posterior layers, click a region), search by symptom
synonym ("joint pain" → arthralgia), or download the JSON and load it into Python, D3,
Gephi, or an LLM context. The interaction checker is client-side and works on the full
combination of what you take, not one item at a time.

Feedback welcome. If you spot a claim that's graded too generously, that's the most useful
thing you can flag — conservative grading is the point.
