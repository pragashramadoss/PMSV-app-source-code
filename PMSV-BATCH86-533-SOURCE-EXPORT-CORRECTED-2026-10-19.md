# PMSV Batch86: real export of 533 FSSAI product-source dispositions

As of 19 October 2026. Only the `gh-pages` isolated FSSAI helper was changed; WordPress and `main` are unchanged.

## Fixed visible faults
1. **Original FINAL35 Export filtered research CSV** was broken because `URL` in the legal-review module is a string containing the JSON address. The browser's `URL.createObjectURL` was shadowed and clicking download threw a TypeError. Centralized export via **`window.URL.createObjectURL`** and revoke and tested actual browser downloads, including the existing all-35 CTR comparison download.
2. The source comparator selector and the main 35-case table operated independently: a person viewing nickel/sorbitol on the first panel could be staring at other products in the second. Added explicit **Show selected case** and **Show all 35 cases** controls that keep the legal source and filtered case aligned, without secretly changing any filter.
3. Added a verified **Download all 533 product source-status records** function to the existing final35 review (not another new review dashboard). The CSV is one row per original catalogue ID, and reports every FSSR/FoSCoS source identity, the source-reference state, signed applicability, analyte, first manufacturer evidence for the 35 held cases, and explicit no-lot-pass flags.

## Data and safety gates
- Fully reconciles exactly **533 unique** live-branch catalogue identifiers: **498 conditional first-source matches** (NOT full compliance), **35 individually documented research cases** (exact contaminant law applicability still open).
- Every held case matched to its case record by unique `catalog_id`, name, original legal scope and proof; no case may be relabelled conditional.
- Every output row expressly reads `NOT_SIGNED` for case limits and `HELD` for lot release. No uploaded evidence or regulatory/laboratory approvals are invented.
- Fail closed if the pinned source ledger `pmsv498Valid()`, original audit `verified()`, or unique/held case crosswalk fails; disable exports if source integrity fails.
- CSV formula injection protection on every field, UTF-8 BOM, CRLF, RFC-compatible quoted strings, full 533-row export **534 lines including header**. The original filtered 35-case CSV has 36 header+case lines, or 2 for one focused case.
- The full PMSV 390px Chromium test exercises two real CSV download events, source count 533, 498/35 split, all values held, and focused product case reset; independent Node integrity workflow also checks completeness.

**Source scope**: all 35 desk reviews are complete, but 35 still lack sufficiently authenticated finished-product legal and lot evidence. This batch fixes use and export; it does not legalize or release anything.
