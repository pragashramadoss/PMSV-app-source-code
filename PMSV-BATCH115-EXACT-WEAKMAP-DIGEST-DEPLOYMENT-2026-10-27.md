# PMSV Batch 115 — Mutation-safe digest acceleration shipped

**27 October 2026** · PMSV isolated FSSAI Helper `gh-pages` preview only.

## Outcome

A byte-exact, identity-indexed `WeakMap` fingerprint memo is **deployed** in `fssai-source-proof-panels.js`. The previous generic 24-entry string-key LRU was rejected in Batch112; this design is different: it indexes by the currently inspected object, but **still serializes the entire live object on every single inquiry and reuses a fingerprint only when the freshly serialized current string equals the previously inspected string byte-for-byte**. The existing source-kind fingerprint integrity guard remains separate and unchanged.

No regulatory rules, source-data snapshots, product approval states, WordPress, Android build or `main` branch were modified.

## Paired real-Chromium mobile performance

Every timing pair was collected on the **same GitHub Actions runner**, in four separate fresh 390px mobile contexts with an alternating variant order: baseline 1×, candidate 1×, candidate 4×, baseline 4×. A second full A/B was run **after** the exact candidate was deployed.

| Run | CPU | Previous digest / READY | New digest / READY | Measured improvement |
| --- | --- | ---: | ---: | ---: |
| Pre-deployment controlled A/B | 1× | 14,513 ms | 10,821 ms | **25.4%** |
| Pre-deployment controlled A/B | 4× | 64,107 ms | 45,422 ms | **29.1%** |
| Post-deployment controlled A/B | 1× | 15,181 ms | 12,089 ms | **20.4%** |
| Post-deployment controlled A/B | 4× | 66,030 ms | 49,308 ms | **25.3%** |

Timings reflect these CI runners and start-up context. They are **not** promises of identical real-device user wait times; CPU throttling and CI variability remain relevant. Both comparisons favored the exact-current-content memo by a large margin. The candidate recorded **13,792 content-exact memo hits**, 84 normal hash misses and two deliberate same-object invalidations per startup trial including the tamper test.

## Why the optimization is fail-closed

The implementation does NOT assume an object is unmodified simply because its identity is the same. On every `pmsvReviewSnapshotDigest(x)` call:

1. Perform `JSON.stringify(x)` again; reject an unrepresentable result.
2. For object-like inputs only, retrieve the previous serialization and digest from a `WeakMap`.
3. Return the prior digest ONLY after an exact full-string equality check.
4. Otherwise compute the original `pmsvReviewSnapshotHashSerialized` digest, replace the memo entry with the current serialization and digest, and return the newly computed result.
5. Retain memo entries only for current serializations up to 1,000,000 characters; the `WeakMap` key does not keep otherwise-dead source objects alive.

Since changed content forces a new digest **on that same call**, mutation before a later independent event, between two checks in one synchronous turn, after an `await`, or between differently ordered source records cannot reuse a stale approval-like integrity result. Restoring authentic content requires another exact check. This is not a digital signature, official source authentication, FSSAI legal confirmation or laboratory compliance result.

New regression `tests/pmsv-batch115-weakmap-digest-contract.test.cjs` independently verifies:

- All three pinned original ledger/work/branch fingerprints unchanged.
- Repeated same-object access reserializes every time but skips only redundant hash loops.
- Same-turn content mutation rejected and restoration reverified.
- Distinct object identities never borrow one another's memo result.
- Reordered worklist fails, original remains accepted.
- Changed content across a later asynchronous event fails closed.

The Batch115 A/B test now works against **both the original code and the shipped code**, so historical performance findings can be reproduced without reverting operational source.

## Verified workflows

- [Pre-deployment A/B with mutation safeguards](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40464804413) — SUCCESS.
- [Post-deployment A/B on shipped exact source](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40465462679) — SUCCESS.
- [Dedicated pinned-fingerprint and mutation-regression test](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40465462880) — SUCCESS.
- [Full FSSAI standard-nutrition verification](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40465462563) — SUCCESS.
- [GitHub Pages deployment](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40465461804) — SUCCESS.

**All 17 workflows triggered by the operational source change concluded SUCCESS; none failed.**

## Remaining 35 products

The outstanding 35 **public-source research dossiers and preliminary case-specific scoping are complete**, but the 35 real-product legal/analytical cases remain **HELD**. Existing 533 catalogue entries and 498 conditional source references are unchanged. Original evidence status remains **175 NOT_SENT / NOT_RECEIVED**: 70 first-step commercial-identity and official-method/source authority requests can be prepared, while 105 regulatory/laboratory/lot decision gates depend on preceding evidence. No signed legal CTR limit, accredited exact-matrix method signoff, authentic representative lot PASS, or independent QA release has been recorded. Nothing in this performance batch converts research completion into commercial legal compliance.

Next dependency for genuine clearance: authenticated outside documents and competent independent reviewers—not more unverified numeric limit assignments.
