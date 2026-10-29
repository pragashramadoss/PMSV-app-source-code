# PMSV Batch126 — 105 downstream independent-review workpapers

Date: 29 October 2026 (IST)  
Branch: `gh-pages`  
Helper: https://pragashramadoss.github.io/PMSV-app-source-code/fssai-product-helper-preview-01/#formulation

## Delivered

In the pre-existing Batch99 **105 original downstream evidence dependencies / stale-source audit** panel, two additional offline-only downloads are available:

1. **All 105 BLOCKED reviewer worksheets**: exactly 35 Regulatory/Legal, 35 Laboratory technical and 35 independent QA gates for all 35 held cases.
2. **39 P0 BLOCKED reviewer worksheets**: three downstream reviewer gates for each of the 13 highest-priority held cases.

Each row preserves the authoritative source request and case IDs, rank, priority, product, analyte, original evidence gate and exact requirement, upstream dependency, local source revision (expressly unverified), current blocker and recommended next human action. The row explicitly states `BLOCKED_ORIGINAL_NOT_SENT_NOT_RECEIVED` and `ALL35_HELD_NO_LEGAL_LAB_LOT_APPROVAL`.

Eight offline fields are intentionally **blank**: authenticated upstream-source reference, signed legal-applicability reference, accredited method/matrix-scope reference, representative lot CoA reference, independent reviewer name/date, signed review-decision reference and authorised QA-disposition reference.

These are preparatory workpapers; they do not dispatch requests, import evidence, authenticate source texts, approve a limit, qualify a method, pass a lot or release a product.

## Reconciliation and safeguards

- The entire 105-row source is verified before either export. Exactly 35 cases must have three original downstream functional roles each.
- P0 is extracted only after full 105-row validation and must reconcile to 13 distinct cases / 39 requests / 13 each function.
- Altered original request/document states, missing/duplicate request IDs or modified role distributions block worksheet exports.
- Source revision reset warnings still appear on affected Regulatory/Laboratory rows; self-reported local metadata is never treated as authenticated proof.
- CSV formula-like inputs are escaped and downloaded locally only.

## Verification

[GitHub Actions Batch99/126 regression](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40910535188): **SUCCESS**, 29 October 2026. Tests cover the 105-row output, 39 P0 subset, 35+35+35 role reconciliation, blank sign-off fields, unchanged holds, revision reset and tampered-source failure.

## Commercial and regulatory state

- Total catalogue: 533 products.
- Final 35 public-source research dossiers: complete; this is not release approval.
- Original commercial cases: **35 HELD** (13 P0, 22 P1).
- Original evidence gates: 175 `NOT_SENT` / `NOT_RECEIVED`, comprising 70 original first actions and 105 dependent independent reviews.
- Verified legal/method/laboratory/lot approvals and commercial releases: **0**.

The next external step remains approved dispatch of the upstream original evidence requests, independent authentication of actual responses, then signed Regulatory, Laboratory and QA decisions. WordPress is unchanged.
