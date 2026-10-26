# PMSV Batch 106 — Reduce duplicate B20–B22 source validation during core startup

26 October 2026 | `gh-pages` prototype only.

## Observed reason for profiling

After Batch105, the live independent reviewer button correctly waited for core B22 READY, but the source remained RUNNING long enough to block the end-to-end reviewer journey. That result did not implicate a new legal-source failure: the core path already performed repeated, expensive source-integrity graphs within a single synchronous screen calculation.

## Focused optimization

- B20's public `pmsvB20Analyze`, `pmsvB20All` and `pmsvB20Render` still validate original data. During one already-verified B20 render, its 35 row analyses no longer each rerun `pmsvB20Valid`.
- B21 similarly computes its 35-row dashboard after one `pmsvB21Valid` check, without a duplicate B21 check inside that one render. It still invokes B20's public source-verified rows.
- B22 separates the pure synchronous audit DOM refresh from its public source verification. An explicit event, exported public sync or later action still revalidates, while one already-verified startup or sync does not immediately repeat the same B21 source graph across refresh substeps.
- Added in-memory `core_start_ms` and `core_proof_ms` diagnostics to B22. No telemetry is transmitted or persisted.
- Original five-gate readiness, source versioning, signed legal applicability and accredited lab review remain unchanged.

## Verification and limits

`tests/pmsv-batch106-core-validation-cost.test.cjs` instruments source-validator call counts, verifies the former 35-row repeated pattern becomes one fresh source decision per uninterrupted operation, checks separate public action revalidation and tests fail-closed behavior after source invalidation. The Batch106 workflow reruns Batch20, Batch21 and Batch103–105 regressions; the pre-existing Batch70 workflow also exercises real Chromium core-startup integrity because B22 is changed.

This is a targeted reduction of redundant computation, **not** a bypass of authenticity, applicable-rule selection, test method/LOQ, or QA release gates. A passing CI browser startup must not be confused with a guarantee of the same time on every mobile device; live cold-start responsiveness requires renewed observation.

Unchanged counts: 533 catalogue products; 498 conditional references; 35 desk reviews closed but independent commercial reviews HELD; 175 original requests NOT_SENT/NOT_RECEIVED; 105 downstream HELD; no signed numeric limits, lab-lot PASS or QA release.
