# Authoring content

Content is the product. Every body part, condition, remedy, compound, and
study is a Markdown file under `src/content/<collection>/*.md` whose
frontmatter wires the graph. The schema is authoritative:
[`../../src/content.config.ts`](../../src/content.config.ts). Read
[`../architecture/data-model.md`](../architecture/data-model.md) first for the
shape and invariants.

## The non-negotiables

1. **Every efficacy claim cites ≥1 study or source.** The build fails
   otherwise. Don't invent PMIDs/DOIs — verify against PubMed/NCCIH/Cochrane/MSK
   first; see [ADR 0006](../architecture/decisions/0006-citation-verification-policy.md).
2. **Grade per remedy × condition**, conservatively. Efficacy and safety are
   separate axes. See [`../product/trust-posture.md`](../product/trust-posture.md).
3. **Describe, don't prescribe.** `typicalUse.studiedRange` = "studied at …",
   never "take …". The dosing lint will warn.
4. **Cross-link with `reference()`** (slug strings) so integrity is
   build-checked.

## Adding a new remedy (typical workflow)

1. **Create the studies/sources first** if they don't exist
   (`src/content/studies/*.md`, `src/content/sources/*.md`). A study needs
   `title, design, year, effect, url, accessed` and ideally `pmid`/`doi`/`n`.
2. **Create the compound** if the remedy has an active constituent not yet
   modeled (`src/content/compounds/*.md`).
3. **Create the remedy** `src/content/remedies/<slug>.md`:
   - `kind`: `herb | supplement | nutrient | chemical | medicine | drug | practice`
   - `compounds`: slug list referencing `compounds`
   - `efficacy`: array of `{ condition, grade, summary, studies, sources, tradition }`
     — each element **must** cite ≥1 study/source.
   - `typicalUse.studiedRange`: what was studied, not a dose.
   - `safety`: `interactions`, `contraindications`, `sideEffects`, `pregnancy`.
   - `interactsWith`: typed edges `{ target, severity, mechanism, source? }`
     powering the safety checker.
4. **Link from the condition** if appropriate (conditions list `bodyParts`;
   remedies are discovered via the `efficacy` matrix, not stored on conditions).
5. **Run:** `npm run check` (schema + types), `npm run checks` (soft warnings),
   `npm run build` (full guarantee).

## Frontmatter format

The collections use YAML frontmatter. Arrays of references are slug strings,
e.g. `compounds: ["curcuminoids"]`, `studies: ["curcumin-zeng-2022"]`. Inline
flow style (`{...}`) is used in some seed files for compactness; block style
is fine too — YAML is equivalent.

## Bulk import vs. curation

The bulk-import pipeline (`scripts/import/`) scaffolds breadth from
public-domain APIs (PubChem, openFDA, Wikidata). **Imported entities carry no
efficacy claims** — grading stays curated and verified. The loop is:
import scaffolds the entity, a human adds the verified evidence. See
[`../operations/jobs/import-pipeline.md`](../operations/jobs/import-pipeline.md).

## Honest negatives

Keep them. Vitamin-D-alone D (VITAL), D-mannose D (MERIT), ginkgo for
cognitive decline, nettle insufficient — all shipped as honest "insufficient"
or "D" grades. Conservative grading is the point; don't inflate to fill a row.
