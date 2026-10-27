# PMSV Batch 110 — Exact-content snapshot fingerprint reuse

27 October 2026 | `gh-pages` prototype only.

## Measured cause

A CDP CPU profile of real 390px Chromium under 4× slowdown reached verified core READY in 50.8 seconds on that runner. Of 47,826 CPU samples, `pmsvReviewSnapshotDigest` accounted for 26,610 (55.6%, approximately 28.1 seconds sampled). The next individual source validators were each about 2–3%. This is a per-run profile, not a real-user field percentile.

Source and original-report read: [Batch110 CPU profile, GitHub Actions](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40454259576).

## Targeted optimization

The three existing FSSAI review snapshots (533-product ledger, 116-case worklist and 32 conditional branches) are still serialized in full with `JSON.stringify` **on every inquiry**. For each kind, the checker retains only the last serialized source and its original existing 16-character fingerprint:

- If the next full serialization is exactly identical, it reuses the mathematically identical fingerprint result.
- If any serialized field, record order or document changes, it recomputes the unchanged fingerprint algorithm and compares the existing pinned digest. Unknown document kinds fail closed.
- A later independent user action still serializes the entire current document. The cache does not trust object identity and does not cache a positive PASS independent of content equality.
- No external source revisions, applied legal numeric limits, lab method/LOQ, customer evidence, browser-local notes, request statuses or signoffs change.

The fingerprints are historical integrity snapshots, not cryptographic signatures or a replacement for independent legal/laboratory review.

## Verification

`tests/pmsv-batch110-snapshot-string-cache.test.cjs` checks all three official fixed digests, exact-repeat hash reuse, in-place mutation, reorder, restoration, altered legal instruction, unsupported kind and later action tamper. The pre-existing 681-record source-integrity suite runs alongside Batch107–109 browser safety and mobile startup checks.

## Mobile speed comparison

A separate post-change CI run recorded 13.931 s normal and 57.108 s throttled on a different runner, slower than Batch109's 9.507 s and 36.278 s. Since runner variation was material, this alone was **not accepted** as evidence of speed improvement.

A controlled A/B comparison then served the original digest and content-exact cache in four isolated mobile contexts on the **same runner**, alternating execution order. Results:

| CPU condition | Original algorithm | Exact-content cache | Change |
| --- | ---: | ---: | ---: |
| Normal | 9,228 ms | 9,003 ms | 2.4% faster |
| 4× CPU slowdown | 37,500 ms | 35,935 ms | 4.2% faster |

All four runs reached true `READY`, displayed `READY`, loaded 35 case controls, kept extended research unloaded and recorded zero releases. The gain is modest; the wider cold-start bottleneck is not solved. The complete paired timing output is retained in [the A/B GitHub Actions run](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40455289178).

The result justifies retaining the content-exact cache, but not claiming that mobile loading is now fast. Independent runs remain sensitive to CI-machine variability.

## Unchanged regulatory status

533 catalogue; 498 conditional first-source references; 35 commercial cases HELD; 175 original evidence requests NOT_SENT/NOT_RECEIVED; 105 downstream dependencies HELD; zero signed legal limits, validated lot PASS or approved product releases. `main`, WordPress and original source data remain unchanged.
