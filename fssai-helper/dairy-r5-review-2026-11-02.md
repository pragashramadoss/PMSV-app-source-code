# PMSV R5 dairy continuation — 2 November 2026

## Actual scope

80 additional catalogue records are covered: **69 principal-composition reviews and 11 identity/route-only reviews**. The latter are eight dairy-analogue identities, plain buttermilk and two Ayurveda recipe entries. They are not approved by inheriting dairy composition limits.

All 533 actual catalogue IDs and prior review registries are retained. Cumulative scope-defined record reviews are **222**, after the prior 142. This is not a count of fully legally confirmed products. No new full-product approval or commercial lot release is granted.

| Review object | Count |
|---|---:|
| Active dairy standard routes | 23 |
| Normalized requirement records | 490 |
| Numerical bound records within those requirements | 464 |
| Non-infant microbiological sampling plans checked | 66 |
| Additional method-based sterility/storage requirements | 3 |
| Explicit microbiology cross-references restored | 4 |
| Unconditional buttermilk route made conditional | 1 |
| Current product records with specific source questions | 4 |

464 distinct registry rows attach to actual product identities; 26 ghee-specific rows remain at standard level because no additional ghee catalogue identity is created in this batch. The composition-comparison tests exercise 463 distinct rows; the remaining attached identity-only qualitative rule is non-comparable. Numerical minimum/maximum bounds are distinct records, not extra products.

## Corrections and source interpretation

1. Khoa dry-matter milk-fat minimum corrected from 30% to 27%. The identified 21 October 2024 Gazette and Chapter 2.1 V3 agree; the relevant amendment commenced on 1 May 2025.
2. Missing named-cheese composition tables restored, including coupled processed-spread alternatives and moisture-type/FDM-dependent mozzarella rows. Creamed cottage cheese minimum fat is on product-mass basis, not the dry-matter basis used by most other cheese rows.
3. Missing milk-fat-product analytical rows restored where specified; ghee-specific identity and fatty-acid rows stay separate. A source dash does not become zero.
4. Dairy-whitener insolubility, ash basis, acid-insoluble ash, acidity and scorched-particle requirements restored. The two-year sugar transition note is retained as a source question pending original-date/extension reconciliation; the compendium/review date does not restart it.
5. Dried ice-cream mix retains the weight-per-litre exception. Separate non-dairy coatings/base/layers are excluded from the dairy-portion composition assessment. Frozen-dessert protein conversion remains separate from dairy protein calculation.
6. Chapter 2.1 explicitly directs MPC (2.1.21(4), p75), WPC (2.1.22(4), p76), dairy permeate (2.1.24(4), p81) and colostrum (2.1.23(4), p78) to the stated Appendix B powder requirements. Their old 'not expressly named in Appendix B' gaps were corrected using these direct cross-references, not ingredient analogy. Casein-only yeast/mould is excluded. For liquid colostrum the source's gram-based units/portions are preserved; liquid-matrix method suitability is not assumed and ml is not silently substituted.
7. Plain buttermilk's automatic fermented-milk assignment was made conditional on actual identity. Strict `<10`, g versus ml test portions, complete individual-sample plans and casein/mould-ripened/ripened-butter exceptions are explicit.

All 66 non-infant stored n/c/m/M plans matched the independently checked source values; no numerical correction to those plans was necessary. The principal microbiology corrections concern scope, direct cross-references and interpretation. Infant rows 8a/8b/8c and unrelated microbiology tables remain unchanged.

## Source provenance

Current Chapter 2.1: Version 3, 7 May 2025, 81 pages.
https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_1_Dairy_products_and_analogues.pdf
SHA-256: `dfb7d059cdc37091e1bbe2adab200e7844acd637ac97a4e0a1949072a03923d7`.

Appendix B: Version 2, 4 November 2024, 72 pages.
https://www.fssai.gov.in/upload/uploadfiles/files/Appendix%20B%281%29.pdf
SHA-256: `4b2f41ec2763a9191b4a14aaa12918c8bd3a82b41022ced1e415b05e44812bc7`.

Original Gazette text, 21 October 2024:
https://fssai.gov.in/upload/notifications/2024/10/671b28f9586dfGAZETTE%20NOTIFICATION%20DATED%2021.10.2024.pdf
The research browser retrieved its text and relevant provisions were checked. A separate attempt to retain the PDF bytes through the workflow returned 404; the failure is recorded in the downloaded artifact. No fabricated Gazette bytes are included.

The older 105-page dairy source remains available but was not used to revert the newer requirements. Three attempted current-index captures returned challenge HTML, not verified amendment listings. Therefore complete current-amendment reconciliation is not asserted.

## Tests actually completed

- **7,784** structural/preservation/traceability assertions passed, zero failed.
- **5,508** numeric-boundary, unit/basis, applicability, sample-plan and approval-lock assertions passed, zero failed.
- **44** browser assertions passed, zero failed. All 533 actual product details rendered. Filters produced 80 current, four source-question, 222 scoped, 142 previous and 533 total records. Filtered export retained all 533. Widths 1440/390/320 px had no page-level overflow or JavaScript errors. Prior cereal and meat comparison controls remained available.

The initial browser fixture omitted Khoa variant selection; the fixture was corrected to provide the required context and the complete suite rerun. The source requirement was not weakened. Chromium set_content is not a native Android or deployed-site end-to-end test. Tests do not certify legal completeness.

## Saved changes

The readable apply script checks preimage Git blob hashes and output SHA-256, then modifies only the dairy and Appendix B modules on this audit branch. Workflow `41486722166` succeeded. Artifact `13160904858` was downloaded and both corrected JSON files were byte-identical to locally tested outputs.

Corrected dairy SHA-256: `2546fbac87d679dd0be3361da4e8e7d2a87eedbcb6c5b8b99f163486b44714e3`.
Corrected Appendix B SHA-256: `5f60de2219708dc2bb8872794811687a9dcfe1c27d24c67fe064a86eed56ab97`.

The all-533 offline viewer, normalized registries, standalone comparison helper, tests, source PDFs and provenance are supplied in the R5 download package. The standalone comparator is not connected to the live application. The draft PR is not merged; gh-pages production is unchanged.

## Remaining work

Specific questions: plain-buttermilk identity, dairy-whitener sugar transition, and the two Ayurveda finished-recipe routes. The eight dairy analogues remain identity-only. Complete subsequent amendments, contaminants/residues, additives, processing aids, adopted analytical methods, packaging, labelling and claims are still to be reconciled. Source verification is distinct from commercial batch testing and authorized release.
