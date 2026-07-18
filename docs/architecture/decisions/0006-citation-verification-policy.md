# ADR 0006 — Citation verification policy

Date: 2026-06-21 · Status: Accepted

## Context

The seed evidence was verified against PubMed / NCCIH / Cochrane / MSK. A few
specific identifiers could not be 100% confirmed, and a later link-check found
dead secondary links. The policy needs to be explicit so future content stays
honest.

## Decision

- **Do not invent PMIDs/DOIs.** Verify against PubMed / NCCIH / Cochrane / MSK
  before entry.
- **When a specific identifier can't be 100% confirmed**, cite the **confirmed
  umbrella reference / DOI** instead of a doubtful PMID, or grade down. Never
  publish a fabricated citation.
- **Dead secondary links are dropped, not guessed.** If a claim already cites a
  verified primary study, a dead secondary source is removed rather than
  replaced with a guessed URL.

## Recorded exceptions (seed content)

- **Comfrey** individual RCTs → cited via the confirmed *Staiger 2012,
  Phytotherapy Research* overview (PMID 22359388).
- **Menthol** → cited via *Sundstrup 2014* (DOI 10.1155/2014/310913); PMID
  intentionally omitted as unconfirmed.

## Recorded cleanup

A link-check of every source URL found two dead secondary links (NCCIH
`cayenne`, MSK `devils-claw`, both 404). Both were only *secondary* citations
on claims that already cited a verified primary study (Tshering 2024; Cochrane
Oltean 2014), so they were **dropped**. ODS factsheet URLs return 403 to bots
but are the correct canonical pattern.

## Consequences

- Re-run a source-URL link-check before adding new `src/content/sources/*`.
- "When in doubt, cite what is verified, or grade down" is the rule for any
  future uncertain citation.
- This policy is the human complement to the build-enforced citation invariant
  ([ADR 0003](0003-build-enforced-citations.md)): the schema guarantees a
  citation exists; this policy guarantees the citation is real.
