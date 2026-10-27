# PMSV Batch 107 — Reduce cold-start duplicate evidence rendering

27 October 2026 | GitHub Pages `gh-pages` prototype only.

## Scope and rationale

Batch106 removed repeated per-case source validation but the real browser still showed `B22 RUNNING` for an extended period. This batch optimizes the **startup display path**, not the documentary or legal decision rules.

- B20 and B21 continue to fetch and validate their original signed/reference JSON during core load. They defer their immediate draft-audit DOM render only when B22 is already `RUNNING`.
- Once core B22 verifies the integrated B21/B20 evidence graph, its single final sync renders B20 and B21 through functions that reuse that same synchronous validated decision.
- A separately requested public sync, refresh, export, case inquiry, or subsequent source reload still starts with its normal full source validation; a changed or corrupted source fails closed.
- No evidence-source, formula, applicable limit, lab method, local draft-storage or downstream reviewer-approval logic was changed.

## Verification

Added `tests/pmsv-batch107-cold-render-deferral.test.cjs` and a targeted CI workflow. They verify the cold-load B20/B21 digest gates remain invoked, initial duplicate DOM renders are skipped, later source reloads render, B22 public sync validates once, and tampered source blocks later sync. Existing Batch20/21/105/106 regressions also run.

Performance impact must be confirmed by a new live-browser cold load after publishing; no mobile speed or completion-time guarantee is made.

## Documentary decision boundary — unchanged

- 533 catalogue products and 498 conditional references.
- 35 finished-product desk reviews closed for public-source research; all 35 commercial reviews **HELD**.
- 175 original evidence requests **NOT_SENT / NOT_RECEIVED** and 105 downstream requests **HELD**.
- Zero verified signed legal numeric limits, accredited lot PASS, independent QA releases or authorized product releases.

No changes to `main`, original FSSAI source ledgers, WordPress production, or real-world request/send workflows.
