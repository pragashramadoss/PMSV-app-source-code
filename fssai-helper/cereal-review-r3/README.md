# PMSV cereal / bakery / soy continuation — 2 November 2026

## Actual scope and result

76 additional actual catalogue records were reviewed through 67 Chapter 2.4 standard objects. The review reconciles listed numerical tables, analytical bases, subtype conditions, selected formulation rules and exact product-to-standard links against Chapter 2.4 Version 4 (07.05.2025). This is not a completed current-law assessment, analytical-method validation, full-product confirmation or commercial lot release.

| Measure | Result |
|---|---:|
| Full catalogue retained / unique IDs | 533 / 533 |
| Additional product records reviewed | 76 |
| Standard objects reviewed | 67 |
| Normalized table/formulation records | 705 |
| Numeric records, including variants | 676 |
| Exact product/profile rule links corrected | 15 |
| Explicit numerical-source questions | 23 records in 10 standards |
| Catalogue records affected by source questions | 13 |
| Identity-only record without a numeric panel | 1 |
| Cumulative scoped product-content reviews, including previous 29 | 105 |
| Newly fully legally verified products | 0 |

Counts include conditional variants, qualitative requirements and open questions. They are not counts of independent legal obligations or fully confirmed products. The previous 29 records are unchanged. The detailed nutrient schedule for formulated supplements for children, 2.4.11(4), was excluded and preserved. The other 457 catalogue records are unchanged by this continuation.

## Material corrections

- Separated semolina/suji/rawa from durum maida: maximum moisture 14.5% and 13% respectively in the identified source. The old semolina object carried the durum-maida panel.
- Restored missing atta crude-fibre, granularity and uric-acid requirements with the expressly stated intermediate-product granularity exception.
- Removed the universal 12% combined-grain-defect assumption. Exact named clauses specify wheat 12%, maize 9% and triticale 8% for the stated combined defects.
- Corrected 15 product/profile links: wheat, maize, rice, residual foodgrains, unprocessed raw pulses, oats, quinoa, durum wheat, pulses, chia, basmati, blended rice, millets, triticale and instant noodles. Original catalogue names, FSSR/FCS strings and IDs remain for provenance.
- Restored rice variants, basmati strict expansion and subtype conditions, and distinct fried/non-fried instant-noodle moisture requirements.
- Added missing flour, starch, oat, soy, cassava, bread/rusk, biscuit and papad numerical panels. Bread and rusk do not share one acidity test.
- Corrected the maximum-passing interpretation for the durum-semolina sieve row, retained its nitrogen conversion factor and kept soy-protein classification boundaries strict.
- Kept tofu separate from other soybean curds and arrowroot separate from tapioca/palm sago. Identity-only and ambiguous rows do not inherit nearby numeric requirements.

## Open questions and exclusions

The new question set covers generic Bean identity; the broken-basmati row-15 conflict; instant-noodle acid-value unit; plain malted-milk blank cells; malt-extract density unit; expeller-groundnut acid-value notation; soybean weevil denominator and acid-value unit; sago-flour acidity notation; wheat-bran acid-value unit; and non-fermented-soy inequality wording. Explicit row questions are blocked from automatic comparison.

Unspecified analytical bases, compound criteria and qualitative requirements also require manual review. The four unresolved standards from the previous confectionery/sweetener continuation remain unchanged. Complete current amendments, original notifications, additives, processing aids, microbiology, contaminants/residues, methods, packaging, labels and claims remain to be reconciled as applicable.

## Primary-source provenance

FSSAI Chapter 2.4 — Cereals and Cereal Products, Version 4 (07.05.2025), 85 pages:
https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf

PDF SHA-256: `7f39921459923619bc3907e1e59f433fbfb5eb92ef3302ae24a8074c57bf572f`.

Relevant numerical pages were inspected as PDF images. English parsed text of the 21 October 2024 amendment was additionally checked for the rice substitution and rice-flour provision. Gazette PDF image retrieval failed, so no complete original-notification verification or Gazette file hash is claimed. Draft proposals were not promoted to final law.

## Implementation and tests

The included comparison helper binds each rule to its product, requires subtype context, checks exact units and analytical basis, rejects invalid measurements and refuses ambiguous/qualitative comparisons. Its output can satisfy one numerical limit only; it never grants product or lot approval.

Local tests on the actual 533-record dataset: **3,924 structural/preservation assertions, 3,966 rule/boundary assertions and 30 browser assertions passed; zero failed.** All 533 details rendered. Full export under an active filter, the 76/105/29 filters, source-question blocking and 1440/390/320-pixel widths were tested. Browser tests used Chromium Playwright set_content, not native Android or production-release testing.

GitHub workflow run `41475060676` completed successfully. It reproduced the exact locally tested module/master hashes, reran all 3,966 rule assertions, checked preservation and committed only to `audit/all-533-2026-11-02`. Applied-code commit: `95c3e4f49b737a3d8dbd0a426374f6e352f74430`.

The conditional schema and helper are not wired into the production decision engine. Do not deploy unadapted; consumer integration and tests remain required. PR #2 remains draft/unmerged and production gh-pages is unchanged.

## Output fingerprints

- Chapter module: `d4d23930de6da32140a3edf7aa45d73ab79af073612f91ba1b32598dc5266035`
- Product master: `1b5759b3dae49f565b404c95b4c3e93a276c3479a29459ea24aa423340a7991f`
- Standalone full-catalogue HTML: `d7f26f38a77f21570de9cba1f75dd8b6088ab8df719d7fe11bda9cda6ab0488c`
- Full evidence JSON: `3e2cfd75a7a9de5137a19b8638fdc8e2aad3ba21ee3c888b51a5cd60255c9c53`
- Cereal rule registry: `31d1f5aa5187da95f5ce8025995f3635745cf080f79d51388b00965a24d8f6f0`


## Consumer integration follow-up — 14 November 2026

The audit-branch readiness generator, search index and older quality consumers have now been migrated to the reviewed conditional schema. Displayed rows retain subtype conditions, analytical bases and source questions. The data integration suite passes 1,171 tests, and the unchanged cereal comparison registry passes all 3,966 boundary/refusal assertions. See [the current verification report](../verification-2026-11-14.md) for browser evidence and remaining regulatory boundaries. These changes are on draft PR #2; the production deployment boundary above still applies.
