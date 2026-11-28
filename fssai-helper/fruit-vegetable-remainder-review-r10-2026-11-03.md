# PMSV R10 — remaining Chapter 2.3 records — 3 November 2026

## Reconciled scope

This pass examines **51 records: 45 new scoped reviews relative to the current audit branch and six rechecks**. The user's preceding offline R9 had 373 cumulative records; the newer repository R9 had 379, including beverage mix, fruit/vegetable chutney, mango chutney and three pickle identities. Those six overlaps are not counted twice. Both reconciliations yield **424 distinct scoped reviews of 533**, with **109 pending records**.

All **99 catalogue records linked to the Chapter 2.3 module** now have a scoped source-edition review. This does not complete unassigned fresh-product routes, all applicable regulatory layers, current-law confirmation or commercial release. **No new full-product approval is issued.**

| Measure | Result |
|---|---:|
| Records examined / newly scoped / rechecks | 51 / 45 / 6 |
| Principal standard keys / supplementary frozen subtypes | 37 / 4 |
| Normalized requirements / numerical rows | 365 / 313 |
| Aggregate-defect groups | 7 |
| Existing canonical Table 4 plans rechecked | 63 |
| Plans with current candidate routes | 47 |
| Frozen plans newly exposed in this companion | 8 |
| Current records with source questions | 13 |
| Current records without a selected Table 4 candidate | 8 |
| Cumulative scoped records / pending | 424 / 109 |

The 47 plans are a routed subset, not newly issued laws. No numerical microbiology limits changed. A missing category candidate is not an exemption.

## Substantive findings and controls

- Correct overlapping applicability wording for dehydrated-vegetable moisture: non-powder 8%, powder 5%. The numerical values were already correct.
- Restore vanilla ash requirements for pods/cut/powder: total ash <=5% and acid-insoluble ash <=1%, both dry basis. Vanillin remains >=2% wet basis.
- Keep product mass, dry matter, extracted oil/fat, counts, packing medium and container-water-capacity denominators separate. Coconut milk powder fat is >=60% dry basis; FFA is <=0.2% of extracted fat as lauric acid.
- Assess source-defined individual and combined defect caps together for almonds, cashews and the other modelled defect groups. Source-defined disjoint classification is required.
- Preserve the distinction between pickled fungi's 2% maximum vinegar-as-acetic-acid and vinegar-pickle packing-medium acidity's 2% minimum. Fermented, salted and other fungi styles remain separate.
- Add chestnut liquid-pack drained-weight variants: 55% below 300 ml water capacity; 60% at or above 300 ml. The denominator is distilled-water mass at 20 C, not product net weight. Average and individual-shortage qualifications remain explicit.
- Keep the existing R9 brine-salt denominator question. Fungi extract/concentrate definitions saying concentrated to 7%/24% are not converted into unqualified minima.
- Require actual freezing/dehydration and complete individual-unit microbiology results. A later exemption request cannot discard supplied results. Process hygiene is not a market-release criterion.

## Primary evidence

Chapter 2.3 Version 2 (04.11.2024), selected PDF pages 39–106:
https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf
SHA-256: 1e82574ab21d28aab9ea6a1ce083113e0a0fb0c9f775e0ce5d4506d98a8cc6cd.

Appendix B Version 2 (04.11.2024), Table 4 and associated provisions, PDF pages 30–36:
https://www.fssai.gov.in/upload/uploadfiles/files/Appendix%20B%281%29.pdf
SHA-256: 4b2f41ec2763a9191b4a14aaa12918c8bd3a82b41022ced1e415b05e44812bc7.

Source text and numerical page images were inspected, with local rendering of the identical captured PDF when individual page requests failed. No OCR was used. The two PDFs are in the offline package.

The original 21 October 2024 amendment was rechecked at English commencement/amendment PDF pages 24 and 26:
https://www.fssai.gov.in/upload/uploadfiles/files/GAZETTE%20NOTIFICATION%20DATED%2021_10_2024_ammendments.pdf
Its pickle copper-word omission applies from 1 May 2025. This existing correction does not waive independent contaminant requirements. No local bytes/hash for the original notification are claimed. These targeted checks are not complete current-amendment reconciliation.

## Questions retained

Dates; three pickle identities; cashew; walnut; frozen vegetables; fungi extract/concentrate; frozen curried vegetables; water-chestnut flour; Harissa; vinegar; fermented soybean paste retain precise row-level questions. These involve count/mass or extracted-oil bases, sample sizes, printed wording, operators/tolerances, brine sampling and unspecified GMP headspace. Questions are not cleared merely to raise a confirmed count.

## Actual tests and repository application

**5,806 structural/preservation assertions**, **14,961 guard assertions across 3,649 comparison calls**, and **49 browser assertions** passed. All 533 actual product details rendered. Filters: 51 current, 13 questions, 424 cumulative, 373 retained earlier offline, 80 dairy and 533 total. Filtered export retains 533 unique IDs. Widths 1440/390/320 px show no JavaScript errors or page-level overflow. Tests include repeated no-approval assertions; they are not independent laws verified. Chromium set_content is not native Android or production end-to-end testing.

The strengthened existing-results guard required its test expectation to distinguish supplied-results and no-results cases. All suites were rerun; no limit or source restriction was weakened. The 63 canonical plans were structurally/source-checked; comparator tests exercise only the 47 with actual current product routes.

Workflow **41582370096** succeeded, passing **372 core checks**, and produced commit **d5930f597a9e3565769d42ee2f99ac72acf9c26a**. Artifact **13205379982** was downloaded; all three output files matched the tested local bytes. Selected corrections affect eight standard objects. Product master and Appendix B remain unchanged.

- Applied core Chapter 2.3 SHA-256: 4a5ae994d039abe8af24f307a30b6c2411d3cf8924cb80f5efb0815b0c1cabd1
- Applied index SHA-256: be62790ff8a0b4937acb208474b231b757d84e9d529dbf51ef24c5bf3548ca84
- Full offline registry SHA-256: c166919ecaab92d2e832873022f58adf45d7621c5a901d665d1091e35bdd37cd
- Final offline HTML SHA-256: 9c54e887ea7ac6b8655772c1dfc05c0f61ada575b907fb7474dd020f32e3076c

**Integration boundary:** only the selected core corrections and index are applied to repository data. The complete 365-row registry, aggregate controls, comparison guard and combined viewer are downloadable companions, not fully wired into the live decision engine. The expanded offline chapter and selected applied core are labelled separately. Earlier offline product records and comparator registries remain unchanged; the six newer repository overlaps are explicitly reconciled.

PR #2 remains draft/unmerged; production gh-pages has not changed. No approval/completeness field has been promoted to full confirmation.

## Remaining queue

109 unreviewed records: 58 special/unassigned, 27 alcoholic beverages, 11 infant nutrition, 7 other food products, 3 hemp, 2 Chapter 3 substances and one children's cereal supplement. Complete current amendments, contaminants/residues, additives, processing aids, adopted methods, packaging, labelling and claims remain open even for scoped records. Laboratory batch reports are not prerequisites for verifying regulatory wording; lot release is a separate decision.
