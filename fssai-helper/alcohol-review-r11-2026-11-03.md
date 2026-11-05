# PMSV R11 — alcoholic beverages — 3 November 2026

## Scope and actual progress

All 27 remaining alcoholic-beverage catalogue records received scoped source-edition reviews. The earlier 424 records are preserved, giving **451 distinct scoped reviews of 533**, with **82 pending**. These are not fully legally verified products. No new full-product or commercial-lot approval is issued.

| Measure | Result |
|---|---:|
| Additional catalogue records | 27 |
| Standard keys / source-table profiles | 26 / 30 |
| Requirement records / numerical rows | 455 / 397 |
| Table 1–4 cells within the requirements | 396 |
| Microbiological table cells within the total | 24 |
| Current question-bearing records | 7 |
| Cumulative scoped / pending | 451 / 82 |
| New full-product approvals | 0 |

The 396 cells comprise Table 1: 195, Table 2: 112, Table 3: 78 and Table 4: 11. The 24 microbial cells include strict counts, absence entries and four cells where a limit is not prescribed. They are not 24 new sampling plans. Profiles, variants and aliases are not additional catalogue products.

## Substantive findings

1. Keep finished-drink and absolute-alcohol denominators distinct. No mass/volume or concentration conversion is automatic.
2. Table 2 row 7 column 7 changes fruit-wine esters to 3.0 g/L absolute alcohol from 1 June 2026, replacing 0.2. The fruit-wine column includes honey wine; the change is not transferred to cider, perry or other-plant-wine columns.
3. The RTD definition says up to 15%, while amended Table 4 says below 15%. Exactly 15% is blocked for source reconciliation; the lower boundary remains strictly above 0.5%.
4. Wine-based beverages use the specific at-least-3.5 and below-14.5% range. The amended Table 2 reference excludes inherited ethyl alcohol. The printed wine-fraction unit remains unresolved, and a wine-only expiry exemption is not silently applied to wine-based beverages.
5. Mead's honey-only carbohydrate definition does not inherit the general wine sugar/jaggery allowance. Incompatible grape/fruit-denominator rows are not automatically transferred to honey or sap matrices. Flavoured/premix spirit exceptions are limited to expressly named general variants, not every named subtype.
6. Strict beer count limits and exclusion of brewer's yeast are retained. Absence is not numeric zero. No test portion or n/c/m/M plan is invented. An exception request cannot erase a supplied result.
7. Warning font: at least 1.5 mm for packs up to and including 200 ml, and 3 mm above 200 ml. Wine sulphite declaration uses >10 mg/L. The November 2025 direction concerns labelling, not a blanket composition delay. October 2025 draft proposals are not applied as final law.

Seven records retain specific questions: brandy, beer, draught beer, sparkling wine, pot/column-distilled spirit, alcoholic RTD and wine-based beverages. Some values were already correct; not every reviewed row is a newly discovered error.

## Primary sources and retrieval limits

Compendium Version V (04.12.2025), relevant definitions/labels and Tables 1–4, PDF pages 1–22:
https://fssai.gov.in/upload/uploadfiles/files/Comp_Alcoholic_Beverages_V_04_12_2025.pdf
Captured SHA-256: 84b1bd45f79ede347412345db348d95f9307db38759ef5b48b2a3bfbe70c4800.
Existing captured bytes from 2 November were reused and checked. Numerical tables were inspected as page images and text; no OCR was used. The Annexure name list is not counted as additional reviewed products.

First amendment, notified 20 June 2025, effective 1 January 2026; original English PDF pages 8–10 inspected:
https://fssai.gov.in/upload/uploadfiles/files/Food%20Safety%20and%20Standards_Alcoholic%20Beverages_First%20Amendment%20Regulations%202025.pdf

Second amendment, notified 19 November 2025, effective 1 June 2026; original English text on PDF page 2:
https://www.fssai.gov.in/upload/notifications/2025/11/692846cca9b19Final%20Notification%20of%20alcoholic%20beverages.pdf
Original page-image requests failed; the operative text and corresponding compendium table image were checked. No original-notification byte capture/hash is claimed.

Corrigendum, 6 January 2026, page 1: changes Mumbai to New Delhi, not the numeric amendment or commencement:
https://fssai.gov.in/upload/uploadfiles/files/269202.pdf

Labelling direction, 27 November 2025, page 1; extended labelling date 1 July 2026:
https://fssai.gov.in/upload/notifications/2025/11/692845eaf1ef1Labelling%20direction%20for%20FSS%20alcoholic%20beverages%20amendment%20Regulations%202025.pdf

Draft, 30 October 2025, pages 2–3 inspected:
https://fssai.gov.in/upload/uploadfiles/files/Notification%20dt%2030_10_2025.pdf
It is not activated. No superseding final provision was located in the searched indexes; this is not proof that no later direction exists. These are targeted checks, not complete current-amendment reconciliation. Only the compendium has local PDF bytes/hash in the offline package.

## Actual tests and application

- **4,004** structural/preservation/traceability assertions passed.
- **29,407** guard assertions across **5,878** comparison calls passed.
- **48** browser assertions passed; all **533** actual product screens rendered.
- Filters: 27 current, seven current questions, 451 cumulative, 424 earlier, 80 dairy, 533 total. Filtered export retained all 533 unique IDs and no current-law approvals.
- Widths 1440/390/320 pixels had no page-level overflow or JavaScript errors.

454 rows with actual product/variant owners were exercised. The general cider ABV row remains source-reference-only because the actual variants use specific soft/hard ranges. No artificial product owner was invented. Counts include repeated no-approval assertions, not independent laws verified. Earlier registries and 506 unrelated product records are preserved; representative earlier comparisons were rerun, not every historical suite.

A structural fixture initially expected an absence literal in a numeric field; it was corrected to inspect the qualitative operator. Final suites passed without changing that source rule. Chromium used set_content on real offline HTML, not native Android or live deployment testing.

Workflow **41585104840** succeeded, passed **58 core checks**, and produced commit **cefddd4207bec070e55dafdd41aa57e0bf144342**. Artifact **13208000089** was downloaded; the core module and application manifest are byte-identical to local tested outputs. Eight standard objects receive selected corrections. Product master and production files were not modified by this workflow.

Core SHA-256: 2e9673b70905181558eaffa0cd22d7a6fec67bd263c41eb15c3f1c59f90336fd.

**Integration boundary:** selected core findings are applied to repository data. The complete 455-row registry, variant routing, standalone guard and combined viewer are downloadable companions, not fully wired into the live engine. The original final-compliance lock is preserved. PR #2 remains draft/unmerged; gh-pages is unchanged.

## Remaining queue

82 unreviewed records: 58 special/unassigned routes, 11 infant-nutrition records, seven other-food records, three hemp records, two Chapter 3 substances and one children's cereal supplement. Complete original-notification/current-amendment reconciliation, contaminants, additives, methods, packaging, general labelling, claims and relevant state/GI provisions remain open even for scoped records. A batch report is not needed merely to verify regulatory wording; commercial release is a separate authorized decision.
