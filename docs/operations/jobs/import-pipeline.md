# Bulk-import pipeline

Importers live in [`../../../scripts/import/`](../../../scripts/import/). They
scaffold breadth from **public-domain / CC0** APIs so curation can focus on
grading. The principle: **import adds the entity; a human adds the evidence.**

## Importers

| Script | Source | License | Adds |
| --- | --- | --- | --- |
| `pubchem-compounds.mjs` | PubChem (NIH/NLM) | Public domain | Compounds (CID, formula); each links to its CID |
| `openfda-drugs.mjs` | openFDA / DailyMed (FDA/NLM) | Public domain | Drug reference stubs with curated class + checker risk-keywords |
| `wikidata-herbs.mjs` | Wikidata | CC0 | Herb stubs with taxon QID + scientific name; links to imported compounds |
| `conditions-scaffold.mjs` | (hand-curated, not scraped) | — | Condition stubs across body systems with severity + red-flags |

See [`../../../ATTRIBUTIONS.md`](../../../ATTRIBUTIONS.md) for the full
license/attribution record.

## Critical constraints

- **Imported entities carry NO efficacy claims.** The import writes the entity
  and identity metadata; grading stays curated and verified against
  PubMed/NCCIH/Cochrane. This is what keeps the citation invariant
  ([ADR 0003](../../architecture/decisions/0003-build-enforced-citations.md))
  meaningful — a scaffolded stub has an empty `efficacy` array, not invented
  grades.
- **No proprietary scraping.** Examine, NatMed, Healthline are NOT scraped —
  their graded evidence is copyrighted editorial work; copying it would
  infringe and would defeat Materia's purpose.
- **Drug class is hand-curated.** openFDA's `pharm_class` is unreliable for
  combination products (metformin/lisinopril were misclassified in the initial
  import and fixed by hand). The importer adds the stub; the class is curated.
- **We write our own neutral descriptions.** Only structured facts are
  imported; prose is ours — no CC-BY-SA contamination from sources that carry
  it.

## The import → grade loop

1. Run an importer to scaffold entities (compounds, drug stubs, herb stubs,
   or condition stubs).
2. A curator picks a scaffolded entity, researches the evidence, and adds
   `efficacy` claims — each with verified `studies`/`sources`.
3. `npm run check` / `npm run build` enforce that every new claim is cited.

This loop is how breadth scaled without inventing evidence. The
`PROJECT_STATUS.md` timeline records the waves (first import→grade wave:
andrographis, passionflower, fenugreek, green tea; second wave: rhodiola,
Asian ginseng, holy basil, horse chestnut, gotu kola).

## Running an importer

Importers are standalone Node scripts run on demand (not in CI, not
scheduled). Read each script's header for its arguments and what it writes.
They write Markdown into `src/content/<collection>/` — review the diff before
committing. There are no cron jobs or scheduled runs in this repo.
