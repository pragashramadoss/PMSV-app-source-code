# PMSV Batch 112 — Post-cache CPU profile and controlled direct-digest experiment

27 October 2026 | `gh-pages` preview only | no change to application integrity logic.

## Current mobile CPU bottleneck

Re-profiled the actual deployed Batch110 content-exact cache using V8 sampling on a real 390px Chromium context with **4× CPU throttling**. Core reached visible and internal `READY`; 35 commercial case controls visible, extended research `NOT_REQUESTED`, zero releases.

Sampling: **33,912 total samples**; measured test core ready after ~35.6 s on this particular CI runner. CPU-sample attribution:

| Function | CPU samples | Share of samples |
| --- | ---: | ---: |
| `pmsvReviewSnapshotDigest` | 9,231 | **27.2%** |
| `pmsvReviewSnapshotHashSerialized` | 8,095 | **23.9%** |
| `pmsvReviewSnapshotIntact` | 1,311 | 3.9% |
| Garbage collector | 1,784 | 5.3% |
| Next individual historic validator | ~700–750 | ~2.0–2.2% |

Together the direct digest and its hash helper account for approximately **51.1%** of sampled CPU time, even though Batch110 optimized only the 3-kind snapshot `Intact` checker. This is a sampling profile, not a measured share of user waiting time or a field performance percentile. Function cost attribution does not imply the same amount can be removed without a different architecture.

[Current post-cache CPU profile and raw artifact](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40459540630).

## Controlled candidate

A **test-only** source-route interception replaced the generic `pmsvReviewSnapshotDigest` with a content-exact bounded LRU:

- Full `JSON.stringify` **still runs on every inquiry** and thus detects later in-place modifications.
- Repeated serialized strings may reuse their identical 16-character digest result; changed fields, order or records produce a new digest and are checked against the unchanged pinned fingerprint.
- At most **24 entries and 8,000,000 serialized characters** retained; extra old entries evicted.
- Existing 3-kind snapshot cache and original FSSAI source digests left untouched.
- Both baseline and candidate reject altered copies of the current 533-product source ledger; no authorizations or releases can be granted by cache reuse.

The candidate was **not written into the live Helper JavaScript**. Four isolated browser contexts were run on the **same GitHub Actions runner**, in alternated order, with identical data and page settings.

| CPU | Current production preview | 24-entry LRU candidate | Relative outcome |
| --- | ---: | ---: | --- |
| Normal | 11,506 ms | 11,592 ms | Candidate **0.7% slower** |
| 4× slowdown | 45,254 ms | 46,513 ms | Candidate **2.8% slower** |

The candidate retained 24 serialized entries totaling approximately 3.64 million characters at the end of the benchmark. All four contexts reached real `READY`, showed 35 review controls, maintained `NOT_REQUESTED` extended research and zero releases, and rejected tampering.

**Go/no-go: NO-GO.** Full serialized-string Map lookups and bookkeeping appear to offset the benefit from avoiding the secondary digest loop; this is an inference from the measured slower end-to-end result, not an isolated per-function causal proof. No positive speed claim was made and the code was not deployed.

[Same-runner controlled A/B log and complete raw timing artifact](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40460030420).

## Existing safeguards

The repository's complete **Verify PMSV FSSAI standard nutrition** workflow passed at the same `gh-pages` revision: [verified Actions run](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40460030387). The new profiling and comparison scripts are read-only test artifacts; the released Helper logic, rules, original source snapshots, `main`, WordPress and legal evidence do not change.

## Subsequent direction

Do **not** expand the generic cross-action cache. Before Batch113 changes performance-sensitive integrity logic, map the call topology and evaluate whether redundant digest invocations are coming from repeated high-level validation passes, with an explicit **single synchronous validation boundary**. Every independent later action must still freshly verify live source content and changed evidence must fail closed. Require controlled A/B improvement before promoting any code change.

## Regulatory status unchanged

533 products; 498 conditional first-source references; 35 commercial cases **HELD**; 175 original evidence requests **NOT_SENT/NOT_RECEIVED**; 105 downstream dependencies **HELD**; zero signed legal limits, approved methods/lots or product releases.
