# PMSV Batch 113 — Synchronous validation-call topology

27 October 2026 | `gh-pages` preview only | read-only instrumentation.

## Motivation

Batch112 confirmed that a generic 24-entry cache keyed by full serialized JSON was **slower** in controlled same-runner A/B tests. A different design would need to reduce redundant validations within known safe synchronous review operations, without allowing any future action to reuse stale verified content. Batch113 maps repeated source-digest inquiries instead of prematurely deploying an identity cache.

## Observed real 390px mobile startup

The existing `pmsvReviewSnapshotDigest` was temporarily **wrapped in the benchmark response only** (through Chromium request interception). The original function still executed on **every** invocation; no hash values were reused by the tracer. Calls were grouped by JS object identity and by synchronous execution windows separated by microtask checkpoints.

| Metric | Observed |
| --- | ---: |
| Browser core and visible status | `READY` |
| Mobile cold startup (instrumented, normal CPU) | 14,459 ms |
| Generic digest inquiries | **13,871** |
| Distinct source objects queried | 79 |
| Synchronous execution windows | 59 |
| Calls repeating the same object within one window | **11,334 (81.7%)** |
| Largest synchronous window | 3,784 calls on 59 objects |
| Original pinned 533-ledger digest test | PASS |
| Changed record rejected by digest and ledger checker | PASS |
| Commercial case controls | 35 |
| Extended research | `NOT_REQUESTED` |
| Product releases | 0 |

The measured digest time includes instrumentation and must **not** be compared directly with an uninstrumented time. The microtask-based grouping is an observable approximation of synchronous execution windows, not proof of a formally enforced validation transaction.

Source identity frequency was concentrated in historical ledgers and worklists: the first two source documents were each hashed 360 times across 59 windows; several later source ledgers and worklists were checked more than 340 times each. A single window contained 3,725 repeat calls on 59 objects within 3,784 total calls. This shows repeated nested check topology, but not that those checks are legally or functionally dispensable.

[Successful Batch113 trace and complete original result](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40461807945).

## Safety decision

An object-identity or per-microtask digest cache would skip the full current serialization on a repeat call. If a nested source record is modified **between two calls in the same synchronous turn**, that cache could reuse an earlier approval-like integrity result without observing the change. This would weaken the current deliberate fail-closed rule. The fact that normal startup appears read-only does not prove all future code paths or adversarial cases are immutable.

**No-go** for an unguarded object-identity cache.

## Next engineering path

1. Identify the two or three highest-volume **upstream validators** that recursively call the historical chain. Instrument their **return values and state mutations** over one real startup.
2. Where a group is demonstrably pure and no mutation can intervene, consider an **explicitly scoped, one-operation decision** rather than a global cached `pmsvReviewSnapshotDigest`; never share a result across independently initiated actions or an `await` boundary.
3. Add deliberate same-turn mutation and restoration tests before any refactor. The test must show a modified source fails closed even if it changes after a prior successful check.
4. Require same-runner mobile A/B speed gains and complete legal/review regressions before shipping.

## Verification and boundaries

The Batch113 specific Chromium topology, tamper rejection, original 681-source and isolated historic-module tests passed. [Full FSSAI verification](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40461807954) and [Pages deployment](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40461806236) also completed successfully. Only a test and its CI workflow were added; no operational source, app JS, numeric standard, testing claim, `main`, or WordPress code changed.

Regulatory status remains **533 catalogue, 498 conditional source references, 35 commercial cases HELD, 175 original requests NOT_SENT/NOT_RECEIVED, 105 downstream dependencies HELD, zero signed legal/lab/lot approvals and zero product releases**.
