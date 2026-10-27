# PMSV Batch 109 — Mobile cold-start performance baseline

27 October 2026 | `gh-pages` prototype only.

Batch108 restored the live browser's truthful READY label. Mobile/slower-CPU loading time remains unquantified.

## Measurement introduced

`tests/pmsv-batch109-mobile-cold-profile.test.cjs` runs a real 390 × 844 Chromium mobile viewport twice in separate clean browser contexts: nominal CPU (1×) and four-times throttled CPU (4×). It records time to B22 verified READY, DOMContentLoaded, B22 core/proof durations, resource completion and count, and all 35 reviewer controls. The workflow saves a JSON benchmark artifact.

This test does not load optional extended research, ask owners for evidence, transmit local drafts, change FSSAI clauses, or grant regulatory/laboratory approvals. Source integrity, 35-case readiness, visible READY state, 175 requests and zero releases remain guarded.

## Baseline results

Pending CI. Timing will be reported after the first successful measured run, with runner-environment caveats. Passing means the genuine B22 source reached READY, not that any product passed a compliance review.

## Fixed legal and source hold

533 catalogue / 498 conditional / 35 HELD commercial reviews / 175 NOT_SENT-NOT_RECEIVED original requests / 105 HELD downstream dependencies / zero product releases. Original evidence and `main` are not modified.
