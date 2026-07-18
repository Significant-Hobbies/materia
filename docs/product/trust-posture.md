# Trust & legal posture

Materia's whole differentiator is trust. This page is the canonical statement of the
grading method and the legal posture that protects it. The enforcement mechanics live in
[`../architecture/data-model.md`](../architecture/data-model.md) and
[`../architecture/decisions/0003-build-enforced-citations.md`](../architecture/decisions/0003-build-enforced-citations.md).

## Grading method

Grades are assigned **per remedy × condition**, never to a remedy as a whole. Turmeric
might be a B for knee osteoarthritis and "insufficient" for everything else. Under the hood
the reasoning is GRADE-inspired (certainty of evidence), but the consumer-facing output is
a single letter:

| Grade | Meaning |
| --- | --- |
| **A** | Consistent results from high-quality RCTs or systematic reviews/meta-analyses |
| **B** | Some RCTs, but limited in number, size, or consistency |
| **C** | Preliminary, small, or observational human evidence |
| **D** | Traditional use, anecdote, or only lab/animal data |
| **—** | Insufficient evidence to grade in either direction |

The grade vocabulary is defined once in `src/content.config.ts` (`GRADES`) and rendered via
`src/lib/grades.ts` (`GRADE_META`). Don't restate the letters elsewhere — link here.

**Efficacy and safety are separate axes.** A high efficacy grade says nothing about safety
— interactions, contraindications, side effects, and pregnancy status are tracked
independently and shown next to every efficacy claim.

## Citation policy

- **Every efficacy claim must cite ≥1 study or source.** Enforced in the Zod schema
  (`.refine((c) => c.studies.length + c.sources.length > 0)`); the build fails otherwise.
- **Do not invent PMIDs/DOIs.** Verify against PubMed / NCCIH / Cochrane / MSK before entry.
- **When a specific identifier can't be 100% confirmed**, cite the confirmed umbrella
  reference / DOI instead of a doubtful PMID, or grade down. Never publish a fabricated
  citation. See
  [`../architecture/decisions/0006-citation-verification-policy.md`](../architecture/decisions/0006-citation-verification-policy.md)
  for the recorded exceptions (comfrey, menthol) and the dead-secondary-link cleanup.

## Describe, don't prescribe

Use `typicalUse.studiedRange` ("studied at 300–600 mg/day in trials"), never a dose to
take. `scripts/content-checks.mjs` lints for imperative dosing prose (`take 500 mg`,
`apply 2 drops`) and warns. Schema validation (which does fail the build) enforces the
citation requirement; the dosing lint is a soft warning by design — review, don't auto-block.

## Legal posture

Mirror Examine: **ad-free, no supplement sales, no affiliate links, no money from companies
whose products we describe.** This is both a differentiator and the lowest-liability stance
— selling or affiliate-linking would make us an "advertiser" with FTC claim-substantiation
duties. Grade conservatively, cite everything, gate red-flag conditions, and describe
studied amounts rather than prescribing.

The commerce / "where to find it" layer is architecturally reserved but **firewalled from
evidence** — it must never influence grades or citations.

## Disclaimers

Non-negotiable and unavoidable: sitewide banner + inline disclaimer block on every entity
page + red-flag gating on conditions that warrant clinical attention. The short disclaimer
line lives in `src/data/site.ts` (`DISCLAIMER_SHORT`); the dedicated page is `/disclaimer`.
