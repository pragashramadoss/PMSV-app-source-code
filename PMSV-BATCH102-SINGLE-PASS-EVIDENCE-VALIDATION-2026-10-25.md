# PMSV Batch 102 — Single-pass evidence review validation

Date: 25 October 2026
Branch: `gh-pages` only. No change to `main`, the live WordPress app, original regulatory data or commercial decision states.

## Problem observed

The published PMSV Helper now exposes Batch99/100 directly in Product Standard. Extended FSSAI research loaded to its stated READY condition when initiated in the live browser, but interacting with the downstream register could still cause long stalls.

A controlled Node/browser-stub measurement of a single Batch100 review load showed **39 calls** to the same expensive B87 source-closure integrity check. Repetition came from nested public gate functions: Batch98 validated original sources, Batch99 validated Batch98 and the same sources again, and Batch100 repeatedly called Batch99 validation when building its summary, selection and issue table.

This is an unnecessary recalculation within one uninterrupted operation. It should **not** be fixed by disabling source checks, approving anything, or caching trust across separate user actions.

## Change

- **Batch98:** Keep public source/case/export checks fail-closed. For a load or save that has already passed the original 175-request verification, reuse that verified source within its uninterrupted private render path.
- **Batch99:** Reuse the verified Batch98 35-case snapshot; derive its 105 downstream rows once per operation. Standalone public calls still verify the frozen source.
- **Batch100:** Remove the double precheck of Batch99 rows and pass a strictly checked 105-row list through the same synchronous render/export/save. Every separate public inquiry and external action still revalidates its original 105 request identities and HELD states.
- Preserve source-version staleness, explicit re-anchoring, 105 role-bound requests, 35/35 commercial HELD, and local-only draft/exception records.
- No longer touch the 900 KB preview HTML or upstream B70/B87 regulation-source definitions.

In the same in-memory controlled test, the source-closure checks required for a Batch100 load dropped from **39 to 3**. A *separate* `issues()` inquiry adds a fresh check; no persistent trust cache is introduced.

## Regression and acceptance

New test `tests/pmsv-batch102-single-pass-evidence-guards.test.cjs` verifies:

- Full load performs at most five expensive closure/ledger validations (versus 39 before).
- Subsequent inquiries perform a fresh source check.
- Original frozen 175 requests, 105 dependent role-bound HELD gates and 35 commercial holds remain unchanged.
- Locally recorded manufacturer version changes still make affected reviewer entries stale and require explicit re-anchoring.
- Any tampering with original `NOT_RECEIVED` documentary status blocks outputs (source validation, request rows, CSV and JSON).
- Existing Batch98, 99, 100 and 101 workflow regressions continue to pass.

No exact legal applicability, signed method scope, representative-lot CoA, result PASS or QA product release is supplied or inferred. The 35/35 public-source desk research closure is separate from commercial decisions.

Preview: https://pragashramadoss.github.io/PMSV-app-source-code/fssai-product-helper-preview-01/#standard
