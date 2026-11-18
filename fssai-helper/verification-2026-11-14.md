# PMSV FSSAI Helper verification — 14 November 2026

Subsequent source review: [R72, 17 November 2026](ctr-toxin-gazette-concordance-r72-2026-11-17.md) compares 37 toxin-limit/sampling rows and 119 histamine species entries with original notifications. It adds a separate draft histamine species/sampling gate and source notes in the current review UI. The earlier verification totals below retain their original tested revisions; current CI evidence is recorded on [draft PR #2](https://github.com/pragashramadoss/PMSV-app-source-code/pull/2).

R73 follow-up: [dietary fibre claims, 17 November 2026](ctr-fibre-claims-source-r73-2026-11-17.md) verifies six thresholds against original notifications and adds a basis-aware arithmetic reference. The dextrin source conflict remains open.

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

The subsequent [R70 original-Gazette reconciliation](ctr-original-gazette-concordance-r70-2026-11-14.md) matches all **382 stored metal entries and 27 crop-contaminant entries** to original notifications, including the two 2024 replacements operative from April 2025. It preserves source qualifiers, records nine future December 2026 changes separately, and adds that evidence to the Helper's review page and export. The expanded local current audit passes **48/48 checks**. The earlier integration totals above identify their tested revision; this follow-up does not change that legacy core or its numeric rules.

- [May 2026 CTR Gazette](https://fssai.gov.in/upload/uploadfiles/files/272840.pdf): commencement is **1 December 2026**, still future on the review date. Product-specific amended articles require their own scope checks.
- [Original 6 November 2026 milk-logo notification](https://www.fssai.gov.in/docs/food-law/notice-comment/FSS%28Labelling%20and%20Display%29%20-%20Milk%20logo.pdf): English clause 1(2) specifies **1 July 2028**. The graphic table was checked, with literal intermediate range wording retained. No dimensions were activated. This does not adjudicate the earlier milk-logo direction chain.
- FPC18 paragraph 3 eligibility, Annexure II additive mapping and base-food microbiology/toxin conditions remain explicit. It is not a general contaminant fallback for other foods.
- Compendium retrieval and source hashes are not an exhaustive original-Gazette amendment reconciliation. Draft notifications were not promoted into final rules.

## Remaining regulatory and release boundaries

**137 exact CTR application decisions remain OPEN.** Some need the actual food identity, formulation, processing or packaging; others retain source interpretation or amendment questions. A laboratory report is not required to check statutory wording. Actual lot results and authorized QA assessment belong to the separate product/lot decision.

The 14 Ayurveda ingredient CTR source gaps, recipe 14.6/14.7 clarification, recorded numerical-source ambiguities, current IS 10500 reconciliation, legacy dextrin claim wording and any outstanding original-Gazette/cross-regulatory checks remain visible. No full all-533 legal certification, product PASS or commercial lot release is claimed.

Native Android/PWA push delivery and production integration remain untested in this pass. PR #2 stays draft and unmerged.

## R71 residue-source follow-up

[R71](ctr-residue-gazette-concordance-r71-2026-11-14.md) compares **1,098 pesticide entries, 358 veterinary entries, 12 honey entries and 14 prohibited substance classes** with the original 2018 and 2024 notifications. The pesticide count includes 27 nonnumeric copper pointers. All numerical literals and LOQ markers agree; no core threshold changed. Original cells, headings, symbols, page references and source hashes are preserved in the accompanying JSON.

The draft source-comparison module now holds the Chlorpyriphos grain-label discrepancy and five chemical-name discrepancies affecting 24 rows. It requires an explicit Alpha Cypermethrin sub-entry check before using that cottonseed-oil value. Existing duplicate pesticide, repeated veterinary Muscle, seafood-overlap, units, method and misuse-testing guards remain. The review page and export include eight source findings and a link to the full comparison.

**49/49 current audit checks passed locally**, including the new one-to-one source reconciliation and negative guard tests. The draft PR records the current Helper CI run and browser screenshots for the final revision. The earlier 1,265 integration-test result above belongs to its stated revision; R71 leaves the legacy preview core and consumers unchanged.

The original 2021 pesticide-scope clarification and the 2024 spice/herb order were retrieved and visually checked. Neither is applied as an unconditional pesticide default or a blanket processed-food exemption. All 137 product-specific CTR decisions and the earlier Ayurveda/legal-completeness questions remain open.


## R74 water-source follow-up

[R74](ctr-water-source-review-r74-2026-11-17.md) separates the original vending-water definition from ingredient-water documentation guidance. BIS public metadata confirms IS 10500:2012, its August 2023 reaffirmation and four amendments; the full normative text remains to be reconciled. The retrieved June 2025 replacement tables remain draft-only and inactive.

Five product views receive source notes. Four recipe views provide a supplier-specific document checklist from FoSCoS FAQs 121–123, with the private-supplier report-age condition, financial-year/minimum-gap wording and municipal evidence conditions kept in context. Mixed or unknown supply does not receive a concession, changing supply clears the prior result, and reopening a product resets the form. No due date, quality approval or numeric limit is calculated. The original four recipe-water identities and the 14.6/14.7 title–method hold are preserved.

The local current audit passed **52/52 checks**, including 25 route/invalid-input cases and rejection of draft activation, false gap closure or modified source hosts. Browser CI is recorded against its exact revision in draft PR #2. All 137 CTR decisions and all 14 Ayurveda ingredient source gaps remain open.


## R75 IS 10500 source concordance

[R75](ctr-water-standard-concordance-r75-2026-11-17.md) resolves the earlier full-text access gap: the base standard and all four amendments were obtained from the public BIS service. **74 source entries** cover Tables 1–6 and the MS2/protozoan requirements, including 18 pesticide entries and eight scoped microbial entries. The amendment-3 heading is February 2021, correcting reliance on the catalogue's 2020 metadata label.

The searchable reference keeps acceptable and conditional permissible columns, mixed units, minimum chlorine, 100 mL/1 L/10 L sample volumes, method notes and source links distinct. The iron amendment and retained Fe + Mn combined remark remain an interpretation hold. Uranium is not automatically omitted under the ingredient-water FAQ exclusion. No analytical comparison or water/product approval is made.

The expanded local current audit passed **53/53 checks**, including amendment precedence and 17 altered-evidence refusals. Browser CI and artifact fingerprints are recorded against the tested revision in draft PR #2. All 137 product-specific CTR decisions and all 14 Ayurveda ingredient applicability gaps remain open.

## R76 asafoetida purity sources

[R76](ctr-asafoetida-purity-r76-2026-11-17.md) compares **11 grade-specific purity entries** in FPSFA 2.9.29 with the original 2011 Gazette and the retrieved 2024 compendium. Hing, Hingra and compounded/Bandhani Hing have separate references. Alcoholic-extract minima, the 90% extraction solvent, U.S.P. 1936 method citation and the absence of a stated dry basis remain explicit. The 1% starch maximum is not copied into the compounded grade.

The grade selector starts empty and resets when changing products. Khichdi retains its water evidence and gains a Hingu note preserving the recipe's oleoresin-gum identity and Q.S. quantity. Compounded substitution, botanical identity and adopted ingredient purity criteria remain unresolved. No contaminant rule changes and no automatic grade or product approval are introduced.

The local current audit passed **54/54 checks**, including four primary-document fingerprints and 16 altered-evidence refusals. Browser verification checks all three grades, clearing and switching products, full filtered export, preserved water evidence and narrow/desktop layout. Exact CI revisions and results are recorded in draft PR #2. The R75 legacy integration run 44032542482 subsequently passed all five jobs.

All 137 product-specific CTR decisions and all 14 Ayurveda ingredient applicability gaps remain open. The later-amendment/corrigendum chain, analytical-method acceptance and remaining pharmacopoeial sources still require review.

## R77 natural-camphor source and recipe scope

[R77](ctr-camphor-source-r77-2026-11-17.md) resolves the base-monograph access gap for Karpura using the original Government of India publication digitised by Wellcome Collection. The title/publication leaves establish API Part I, Volume VI, first edition 2008, effective 1 January 2009. Five source entries comprise three parsed quantitative references, one unresolved optical-rotation literal and one pesticide-appendix pointer. Image fingerprints identify the exact inspected scan assets.

Recipe 14.5 gains a material-source review distinguishing Cinnamomum, Ocimum, synthetic and unidentified material. The wider pharmacopoeial definition does not authorize a recipe substitution. Recipe 14.6 retains its method-only Karpura and official source-alignment hold for every selection. The medicinal dose and therapeutic claims are not imported as food-use guidance. Material selection resets across recipes; the source entries remain separate from any analytical pass/fail calculation.

The local current audit passed **55/55 checks**, including 39 scope/invalid-input cases, five scan fingerprints and 22 altered-evidence refusals. Browser checks cover both recipe notes, all four material choices, the unresolved source literal, preserved earlier controls, full filtered exports, all 533 product pages and mobile/desktop layout. The draft PR records the exact CI revision and artifacts. R76 legacy integration run 44038907942 has passed all five jobs.

The 2026 API amendment text was read through the available web extract; direct PDF/screenshot retrieval failed, so no PDF fingerprint or visual-verification claim is made. The complete amendment chain, referenced methods, actual ingredient criteria and food-use safety remain open. All 137 CTR decisions and all 14 Ayurveda ingredient applicability gaps remain open; nothing is deployed.


## R78 Lajadi Kashaya botanical sources

[R78](ctr-lajadi-botanicals-r78-2026-11-17.md) retrieves three monographs from the original Government of India API Part I, Volume III (first edition, copyright 2001), digitised by Wellcome Collection. The 17 purity entries distinguish Juniperus communis fruit, Santalum album heart wood and Vetiveria root. Hribera/Hapusa naming and the recipe/API botanical spelling difference remain explicit and unresolved. Ten visually checked page-image fingerprints cover the title, publication leaves, monographs and selected method bases.

The ingredient and material selectors start empty, reset independently when changing ingredients/products, and distinguish named dried material, other species/parts, oils/extracts and unknown composition. Archived percentages retain air-dried and volume/weight bases; alcohol strength and complete method acceptance remain open. The water-reduction instruction creates no contaminant multiplier. All existing recipe-water references are retained.

The local current audit passed **56/56 checks**. The R78 regression covers 132 form/invalid-input combinations, ten source fingerprints and 24 altered-evidence refusals, including malformed and duplicate entries. Browser CI checks all 533 products, all three botanical ingredients and 12 material branches, reset/clearing behavior, combined water/botanical panels, full filtered export and mobile/desktop layout. Exact revision, result and artifact fingerprints are recorded in draft PR #2. R77 legacy integration run 44041298766 passed all five jobs.

All 137 product-specific CTR decisions and all 14 Ayurveda ingredient applicability gaps remain open. Base-source retrieval does not establish current adoption, complete amendments, actual ingredient identity, a safe food dose, substitution permission, finished-tea limits or a batch release. The draft is not deployed.

## R79 juniper berry in the Lajadi Kashaya recipe

The [juniper review](ctr-juniper-spice-r79-2026-11-18.md) links four Gazette rows to authenticated culinary-spice-grade dried fruit. The review register now identifies 33 of 46 raw ingredient instances with at least one candidate and lists the remaining 13. The original 14 ingredient applicability decisions and the 137 finished-product decisions remain open.

The current audit passed **57/57 checks**. The juniper regression covers source links, units, dry-matter qualifiers, four supplied styles, 36 ingredient/material combinations and 22 altered-evidence cases. Browser verification exercises the supply and style selectors, clearing a previous selection, the distinction between an empty cell, N/A and zero, the full export and layouts at 320, 390 and 1440 pixels. Chromium verification runs on GitHub Actions. The R78 integration run (44054842646) passed its data job and all four browser jobs. Current revision and run links are recorded in draft PR #2.
