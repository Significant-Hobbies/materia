# Materia — product overview

**Materia is "the Examine.com of the whole body."** A classy, ad-free, content-first
reference where you explore a layered human body, click any part, and find the herbs,
supplements, chemicals, and drugs that may help — each one **evidence-graded** and **linked
to the studies behind it**.

## The white space

Nobody joins interactive anatomy to evidence-graded, cited remedies. BioDigital has the body
but no remedies; Examine has the rigor but no body; NatMed has herb×drug data but is
paywalled/clinical. Materia is the join, built on a knowledge graph:

**body → condition → remedy → active compound → mechanism → study**, traversable from any
direction.

See [`competitive-analysis.md`](competitive-analysis.md) for the full landscape and the
moats this drove.

## Scope

**In scope:** interactive 3D layered explorer (per-part mesh clicking; 2D SVG fallback); per-entity content pages (body
part, condition, remedy, compound, study); evidence grading + study-level citations;
search; the differentiator moats (knowledge graph + first-class compounds, herb×drug
safety checker, tradition-vs-evidence overlay, evidence heatmap + comparisons,
research-paper focus).

**Out of scope (now):** diagnosis, accounts/user data, e-commerce. A "where to find it"
commerce layer is **architecturally reserved but firewalled** from evidence — deferred
until there is traffic.

**Not** a diagnosis tool, **not** medical advice, **not** sponsored. No ads, no affiliate
links, no supplement sales (also the lowest FTC-liability posture — see
[`trust-posture.md`](trust-posture.md)).

## Live product

`https://materia.significanthobbies.com/` — static, deployed to Cloudflare Pages. The full
knowledge graph is downloadable as JSON at `/data/materia-graph.json` (CC BY 4.0). Agent
surfaces: `/llms.txt`, `/llms-full.txt`, `/api/ai`, `/index.md`.

For the current content inventory (page counts, collection sizes), see
[`../../PROJECT_STATUS.md`](../../PROJECT_STATUS.md) under "Products".
