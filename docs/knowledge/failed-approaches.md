# Failed approaches (reusable)

Things that were tried and didn't work, recorded so they aren't retried. Each
entry: what was tried, why it failed, what we do instead. Keep entries even
after they're superseded — the negative result is the value.

## Auto-deploy on push to main

- **Tried:** CI deploy on push trigger (verified working 2026-06-26).
- **Why it failed the bar:** a health-content site must not ship to production
  as a side effect of a push. The risk of an uncited or mis-graded claim
  reaching production before human review outweighs the convenience.
- **Instead:** `deploy.yml` is `workflow_dispatch` only, gated by
  `scripts/manual-deploy.mjs` (clean tree, synced, CI green on exact HEAD).
  See [ADR 0009](../architecture/decisions/0009-static-deploy-cloudflare-pages.md).

## openFDA `pharm_class` as the drug class

- **Tried:** use openFDA's `pharm_class` field directly for imported drug
  stubs.
- **Why it failed:** unreliable for combination products — metformin and
  lisinopril were misclassified in the initial import.
- **Instead:** the importer adds the stub; the drug class is hand-curated.
  See [`../operations/jobs/import-pipeline.md`](../operations/jobs/import-pipeline.md).

## Curcumin × tendinopathy

- **Tried:** add curcumin as a graded remedy for tendinopathy.
- **Why it failed:** no verifiable human RCT could be confirmed.
- **Instead:** dropped rather than graded on weak evidence. Collagen (C) was
  kept for tendinopathy. Honest negatives > filling rows. See
  [`../development/authoring-content.md`](../development/authoring-content.md)
  "Honest negatives".

## Inventing a PMID when the specific ID is uncertain

- **Tried (and rejected before shipping):** guessing a PMID for comfrey
  individual RCTs and menthol.
- **Why it failed:** violates the trust posture — a fabricated citation is
  worse than no citation.
- **Instead:** cite the confirmed umbrella reference/DOI (Staiger 2012 for
  comfrey; Sundstrup 2014 DOI for menthol) or grade down. See
  [ADR 0006](../architecture/decisions/0006-citation-verification-policy.md).

## Browser MedGemma fine-tune for in-browser medical AI

- **Tried (research, 2026-06):** use MedGemma 4B for a patient-facing
  in-browser generative medical model.
- **Why it failed:** license bars patient-facing use; medical fine-tunes
  underperform generalists (RAG > fine-tuning); generative medical prose
  creates liability contradicting the trust posture.
- **Instead:** small client-side embeddings for semantic search/RAG over our
  own cited content; no generation. Deferred under the product pause. See
  [ADR 0005](../architecture/decisions/0005-embeddings-not-generative-medical-model.md).

## Keeping dead secondary source links

- **Tried (and rejected):** leave a dead NCCIH/MSK URL on a claim because the
  claim also cites a verified primary study.
- **Why it failed:** a dead link erodes trust and looks like careless
  citation.
- **Instead:** drop the dead secondary link; the claim stays fully cited by
  its primary study. Don't guess a replacement URL. See
  [ADR 0006](../architecture/decisions/0006-citation-verification-policy.md).
