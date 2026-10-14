# Batch 22 — PMSV browser source review integrity, 14 October 2026

**Scope:** GitHub gh-pages preview only. The canonical 533-product record, 498 conditional first-source matches, 35 exact-source pending products, and live WordPress deployment are unchanged. No automatic CTR numeric limit or lab PASS.

## Directly addressed integration risks

1. B20 previously replaced the whole <details> audit panel during each evidence input event, even though B21 re-opened it. Batch22 now updates summary, counter and table rows **in place**, preserving the original DOM panel and its open state. The B21 search entry and selected review form are untouched.
2. Other-tab evidence edits in browser-local storage could leave the B20/B21 audit stale. A restricted `storage` listener watches only the existing B14, B5 and B15 evidence keys (or storage clear), refreshes the risk/readiness dashboards, and warns before any user-triggered reload of the selected B14 form. It does not silently overwrite open inputs.
3. A visible **Recheck saved evidence** action refreshes the B20/B21 dashboards, preserving the existing category filter and search.
4. A new **real Chromium test**, in addition to existing unit tests, verifies actual PMSV HTML plus B14/B20/B21/B22 scripts together: 533/35 ledger, 35 unstarted drafts, filter-to-Trehalose, open the correct evidence form, flag unsupported 'Foods not specified' as first-exact article, unchanged audit DOM and expanded state, cross-tab storage warning, and zero compliance approvals. No test contaminant PASS is fabricated.

## Official legal source and interpretation
Pinned current [FSSAI Contaminants, Toxins and Residues Regulations Version IX (03 February 2026)](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf). `Foods not specified` is an analyte-specific fallback requiring named-article priority review, not a finished-food exact source certification.

**Tests:** `node --check fssai-product-helper-preview-01/fssai-current35-browser-review-integrity-batch22-2026-10-14.js` and `node tests/fssai-current35-browser-review-integrity-batch22-2026-10-14.test.cjs` (requires Playwright Chromium and a local Python HTTP server).

No change to actual legal source identification, testing results or regulatory sign-off is implied by this browser-reliability batch.
