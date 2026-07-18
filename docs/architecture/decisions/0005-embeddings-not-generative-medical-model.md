# ADR 0005 — In-browser AI: embeddings, not a generative medical model

Date: 2026-06-21 · Status: Accepted (feature deferred — product paused)

## Context

Research finding (2026-06): no prebuilt medical LLM exists for browser
runtimes; the one capable small model (MedGemma 4B) is license-barred from
patient-facing use; and medical fine-tunes underperform generalists
(RAG > fine-tuning). Generative medical prose also creates liability and trust
risk that contradicts [ADR 0004](0004-trust-as-hard-constraint.md).

## Decision

Use a **small embedding model client-side** for semantic search / RAG over our
own cited content. The model ranks and retrieves vetted passages; it **never
generates medical prose**. Generative chat is out of scope.

## Consequences

- Search/RAG surfaces only content that already passed the citation invariant
  ([ADR 0003](0003-build-enforced-citations.md)) — the trust guarantee extends
  to the AI surface.
- No server, no model API cost, no PII flow — consistent with the static,
  no-accounts posture.
- **Status:** deferred under the finish-and-pause (2026-07-10). The current
  search is a deterministic client-side index + filter. Embeddings resume only
  if the product reopens.

## Alternatives considered

- **Server-side generative medical chat:** rejected — liability, cost, and
  contradicts the "aggregator, not authority" posture.
- **Browser MedGemma fine-tune:** rejected — license bars patient-facing use.
