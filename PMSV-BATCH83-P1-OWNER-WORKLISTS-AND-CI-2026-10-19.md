# PMSV Batch83 — accurate P1 evidence-owner worklists and mobile CI regression (19 October 2026)

**Scope:** `gh-pages` FSSAI preview only; no changes to `main` or WordPress production.

## Fixed
- Resolve failed Batch82 Chromium test: open the P1 details panel before using visually hidden controls. Preserve the user-controlled collapsed-by-default interface.
- Selecting **Document owner** now narrows the 110 original P1 evidence-request rows actually displayed and exported, rather than exporting all five requests for every product regardless of the owner filter.
- Five responsible owner roles each receive **22 original unsent request rows**, one per held P1 case. Filter intersections with analyte group and search remain active. The case count may remain 22 because each role covers every case; the *request count* changes explicitly.
- The P1 status distinguishes the currently visible number of requests from **110 immutable original IDs in the full dataset**.
- Resetting owner to ALL restores all 110 visible evidence requests; case CSV continues to disclose all five original IDs per product.

## Verification
- Batch83 dependency-free regression reconciles the 35 original cases, all **175 unique IDs** (13 P0 × 5; 22 P1 × 5), the 22 P1 cases against Batch56, Batch59 and Final35 legal-source decisions, five owner roles × 22 requests, all four analyte families and the 16 named vs 6 unspecified identities.
- Batch82 synthetic Chromium regression now verifies 390px presentation, all five role filters, owner CSV row counts (22 vs 110), the trace-metal intersection (15), search, CSV injection safeguards and fail-closed treatment of falsified document and legal signoffs.
- New Batch83 workflow reruns the original Batch81/B82 integrity checks, the new Batch83 175-ID check, and mobile Chromium. Batch82's existing full 390px real-preview workflow is also retriggered by the test update.

## Regulatory boundary
The 533-product catalogue and 498 conditional matches are unchanged. **35 cases remain HELD**. Original requests sent: **0**; evidence received: **0**; signed legal applicability: **0**; accredited lab method/matrix adoption: **0**; original commercial lot CoAs: **0**; PASS/releases: **0**. FSSR named product identity references and CTR comparators remain research-only, never automatic contaminant limits. Do not upload supplier-confidential material to public preview. Observe GitHub Actions results before marking verification complete.
