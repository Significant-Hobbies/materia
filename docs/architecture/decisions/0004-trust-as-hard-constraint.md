# ADR 0004 — Trust as a hard constraint (grading, describing, no commerce)

Date: 2026-06-21 · Status: Accepted

## Context

The product reviews health claims. Getting grading, dosing language, or
commercial posture wrong creates both trust damage and legal exposure (FTC
claim-substantiation duties for "advertisers").

## Decision

Four interlocking constraints, enforced by schema + lint + policy:

1. **Grade conservatively, per remedy × condition.** A remedy is never graded
   globally; turmeric can be B for knee OA and "insufficient" elsewhere. Grades
   are GRADE-inspired certainty under an Examine-style A/B/C/D/insufficient
   letter. Efficacy and safety are **separate axes**.
2. **Describe, don't prescribe.** Use `typicalUse.studiedRange` ("studied at
   300–600 mg/day in trials"), never a dose to take. `scripts/content-checks.mjs`
   lints for imperative dosing prose (`take 500 mg`, `apply 2 drops`) as a soft
   warning.
3. **No ads, no affiliate links, no supplement sales.** Mirror Examine's
   posture — both a differentiator and the lowest FTC-liability stance. A
   future commerce / "where to find it" layer is architecturally reserved but
   **firewalled from evidence**: it must never influence grades or citations.
4. **Disclaimers are non-negotiable.** Sitewide banner + inline block on every
   entity page + red-flag gating on conditions that warrant clinical attention.

## Consequences

- The grade vocabulary (`GRADES`) is defined once in `src/content.config.ts`
  and rendered via `src/lib/grades.ts` (`GRADE_META`). See
  [`../../product/trust-posture.md`](../../product/trust-posture.md).
- The dosing lint is a **soft warning by design** — schema validation (which
  does fail the build) enforces citations; the dosing lint flags prose for
  human review rather than auto-blocking, to avoid false-positive build breaks.
- The commerce firewall is a constraint on any future work, not a current
  feature.

## Alternatives considered

- **Affiliate links to recoup costs:** rejected — creates FTC
  claim-substantiation duties and destroys the trust differentiator.
- **Hard build-fail on dosing prose:** rejected — regex dosing detection is too
  lossy to block builds; soft warn + review is the right knob.
