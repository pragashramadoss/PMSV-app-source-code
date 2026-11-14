# PMSV FSSAI Helper verification — 14 November 2026

## Result

Automated software verification passed: the data integration suite, all older browser groups, current Helper checks and numerical comparison guards. **Full regulatory verification remains incomplete:** linked source reviews do not establish every current-law requirement or a product approval.

Work is saved on draft PR #2. Production `gh-pages`, WordPress and live rules have not been deployed or changed by this work.

## Implemented corrections

- Migrated the older readiness generator and consumers to the reviewed cereal/soy conditional schema. Restored the ordered preparation pipeline so downstream audits receive their required fixtures.
- Regenerated the search index from the 533-product master, updating 152 index records (including the seven reconciled microbiology routes). Seven microbiology routes now agree with the reviewed Appendix B module. A check detects future index drift.
- Preserved subtype conditions, analytical bases, strict boundaries and source questions in displayed quality rows. Corrected the lactose sulphated-ash unit and the cereal-flakes source citation. The instant-noodle child rule now carries its existing qualified quality reference.
- Reconciled old quality-reference snapshots with their canonical source rows. Numerical thresholds were preserved. Source fingerprints were updated only after checking what changed; test assertions were not disabled.
- Fixed the benchmark that still expected the pre-optimization digest function. It now compares the current content-checked WeakMap with an isolated LRU candidate; tampered source objects must still be rejected.
- Updated seven active Ayurveda source references to the retrieved original PDF at its current official location; historical audit reports retain their original URLs.
- The current Helper refuses missing/duplicated catalogue data, handles malformed records and URL fragments, preserves all 137 cases in exports under a display filter, and exposes source-review findings beside each affected product.

## Verification evidence

Data and older-browser tested revision: `cf74577d918cd77d5f94a5e00d3e066dc55d0d4a`.

| Check | Observed result |
|---|---|
| Data integration, 264 test files | **1,171 tests passed; 0 failed** |
| Current audit scripts and generated review register | **47 checks passed; 0 failed** |
| Older browser integrations, 79 files | **94 tests passed; 0 failed** after repairing the outdated benchmark fixture |
| Cereal numerical comparison guards | **3,966 assertions passed; 0 failed**, covering strict/inclusive boundaries, subtype context, unit/basis mismatches and refusal of ambiguous rows |
| Current Helper browser | **Passed:** all 533 product detail views, all 137 review cases, filtered/full export, six views at 320/390/1440 px, missing/duplicated catalogue rejection and malformed fragments; no page errors |

- [Current Helper CI and screenshots](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/43564018582)
- [Complete data/browser integration run](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/43564018545)

The final status-link, report and official-URL display changes are covered by the current Helper checks; the older integration component is unchanged from the tested revision.

The earlier 1,237-test / 127-failure baseline is retained in `historical-regression-failures-2026-11-14.json`. Its counts are not directly comparable with the repaired split suites: failing files and missing fixtures previously prevented some contained tests from running. Browser tests now run in isolated CI Chromium workers; local Chromium could not launch in this execution environment. No native Android installation or push-delivery test is implied.

Reproduce the data checks with:

```sh
node scripts/prepare-helper-integration.cjs
node scripts/run-helper-integration.cjs data
node scripts/verify-helper.cjs
node fssai-helper/cereal-review-r3/test_cereal_guard.js fssai-helper/cereal-review-r3/cereal-review-r3.json /tmp/pmsv-cereal-guard-results.json
```

The browser workflow supplies Playwright/Chromium and runs four isolated shards. See `.github/workflows/verify-helper-integration.yml` and `.github/workflows/verify-current-helper.yml`.

## Source review completed in this pass

[R69](ctr-remaining-source-scope-r69-2026-11-14.md) adds a fresh source-wording and scope check for the **70** identities outside the selected earlier focused rounds. The review register now links **137/137** queue identities to a focused review: 67 from the earlier rounds and 70 from R69. The 533 original catalogue identities are retained.

Twelve official-source files have recorded URLs and SHA-256 fingerprints. The checks cover dairy analogues/frozen products, fruit/vegetable forms, cereal/soy variants, ingredient classes, FPC18 and all nine Ayurveda recipes. These are source findings and conditional routes, not 137 newly approved products.

The scanned Ayurveda pages are now available and visually checked. Recipe 14.6 has a 13-ingredient table followed by the four-preparation method, including two method-only names. Recipe 14.7 has the flower-infusion method. **The discrepancy is confirmed, not corrected by inference.** This resolves the earlier image-access limitation, but the authority-clarification issue and 14 ingredient CTR source gaps remain.

## Official-source currency

- [May 2026 CTR Gazette](https://fssai.gov.in/upload/uploadfiles/files/272840.pdf): commencement is **1 December 2026**, still future on the review date. Product-specific amended articles require their own scope checks.
- [Original 6 November 2026 milk-logo notification](https://www.fssai.gov.in/docs/food-law/notice-comment/FSS%28Labelling%20and%20Display%29%20-%20Milk%20logo.pdf): English clause 1(2) specifies **1 July 2028**. The graphic table was checked, with literal intermediate range wording retained. No dimensions were activated. This does not adjudicate the earlier milk-logo direction chain.
- FPC18 paragraph 3 eligibility, Annexure II additive mapping and base-food microbiology/toxin conditions remain explicit. It is not a general contaminant fallback for other foods.
- Compendium retrieval and source hashes are not an exhaustive original-Gazette amendment reconciliation. Draft notifications were not promoted into final rules.

## Remaining regulatory and release boundaries

**137 exact CTR application decisions remain OPEN.** Some need the actual food identity, formulation, processing or packaging; others retain source interpretation or amendment questions. A laboratory report is not required to check statutory wording. Actual lot results and authorized QA assessment belong to the separate product/lot decision.

The 14 Ayurveda ingredient CTR source gaps, recipe 14.6/14.7 clarification, recorded numerical-source ambiguities, current IS 10500 reconciliation, legacy dextrin claim wording and any outstanding original-Gazette/cross-regulatory checks remain visible. No full all-533 legal certification, product PASS or commercial lot release is claimed.

Native Android/PWA push delivery and production integration remain untested in this pass. PR #2 stays draft and unmerged.
