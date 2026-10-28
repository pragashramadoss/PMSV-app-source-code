# PMSV Batch123 — verified live snapshot gate for evidence handoff

Date: 28 October 2026 (IST)  
Branch: `gh-pages`  
Preview: https://pragashramadoss.github.io/PMSV-app-source-code/fssai-product-helper-preview-01/#formulation

## Change

The existing Batch121 **70-request detailed evidence CSV** and Batch122 **13-case / 26-request P0 packet** now use a stricter handoff integrity gate.

Before either export, the helper independently recomputes the full original 70-request queue from the currently verified Batch97 follow-up source at the requested as-of date. It compares the original request/case ID, priority, rank, owner role, evidence gate, immutable request/document states, operator self-reported state, references, dates and resulting action label **in the canonical sorted order**. A caller-supplied object with `valid: true` is no longer enough.

This protects against stale/altered source snapshots incorrectly exporting fabricated response, sent or approval-like action labels. Missing dates, malformed source records and swapped rows also fail closed.

## Verification

- [GitHub Actions regression](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40690993952): **SUCCESS**.
- Tests cover altered action, operator stage, follow-up date, documentary state, catalogue identity and row order.
- A valid earlier snapshot is rejected after the local (still self-reported) follow-up state changes; a freshly recomputed snapshot exports.
- Existing 70-request and 26-request CSV schemas and buttons are unchanged.

## Legal and operational boundary

The 533 catalogue identities and 498 conditional first-source references do **not** represent 498 full product approvals. All 35 original commercial reviews remain **HELD**. The 175 original evidence requests are still `NOT_SENT`/`NOT_RECEIVED`, 105 downstream gates remain dependent, and full product approvals/releases remain **0**. The new code does not dispatch requests, authenticate outside evidence, store recipients, change WordPress or assign regulatory/laboratory authority.

## Next action

Named functional owners must approve and dispatch the P0 method-authority and manufacturer/supplier evidence requests through controlled external channels. Genuine original texts, product identity/formulation, accredited exact-matrix methods, CoAs, lot traceability and independent decisions remain necessary before any closure.
