# PMSV Batch 109 — Mobile cold-start performance baseline

27 October 2026 | `gh-pages` prototype only.

Batch108 restored the live browser's truthful READY label. Mobile/slower-CPU loading time remains unquantified.

## Measurement introduced

`tests/pmsv-batch109-mobile-cold-profile.test.cjs` runs a real 390 × 844 Chromium mobile viewport twice in separate clean browser contexts: nominal CPU (1×) and four-times throttled CPU (4×). It records time to B22 verified READY, DOMContentLoaded, B22 core/proof durations, resource completion and count, and all 35 reviewer controls. The workflow saves a JSON benchmark artifact.

This test does not load optional extended research, ask owners for evidence, transmit local drafts, change FSSAI clauses, or grant regulatory/laboratory approvals. Source integrity, 35-case readiness, visible READY state, 175 requests and zero releases remain guarded.

## Baseline results

Measured in GitHub Actions headless Chromium, 390 × 844 viewport with independent cold contexts (27 October 2026):

| Condition | READY after navigation | B22 core time | Core proof checks | Last resource response |
| --- | ---: | ---: | ---: | ---: |
| Normal CPU | 9,507 ms | 9,302 ms | 8,511 ms | 609 ms |
| CPU slowed 4× | 36,278 ms | 35,312 ms | 33,030 ms | 2,018 ms |

Observed total slowdown: **3.82×**. Both runs loaded 250 resources, exactly 35 case-review buttons, visible `READY`, extended research `NOT_REQUESTED` and zero product releases. The proof-processing stage accounts for approximately **90%** of the time to READY in both runs. This identifies a CPU-bound verification path but does not isolate a particular integrity function or justify bypassing source checks. The data comes from CI hardware, not a claim about all physical Android devices.

[Successful CI run and timing artifact](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40453536673). The artifact is retained by GitHub Actions for 14 days.

Passing means the genuine B22 source reached READY, not that any product passed a compliance review.

## Fixed legal and source hold

533 catalogue / 498 conditional / 35 HELD commercial reviews / 175 NOT_SENT-NOT_RECEIVED original requests / 105 HELD downstream dependencies / zero product releases. Original evidence and `main` are not modified.
