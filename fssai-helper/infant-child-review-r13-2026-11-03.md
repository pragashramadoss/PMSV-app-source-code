# PMSV R13 — infant and child nutrition — 3 November 2026

## Scope and actual progress

This continuation reviews **12 previously unreviewed catalogue records**: 11 Foods for Infant Nutrition records plus **Formulated supplements for children** under Chapter 2.4. The prior **481** scoped records are preserved, giving **493 of 533** catalogue records with a product-specific scoped source review and **40 pending**. These are not 493 complete legal confirmations. No full-product, current-law, artwork or commercial-lot approval is issued.

| Measure | Result |
|---|---:|
| Additional catalogue records | **12** |
| Requirement rows in R13 registry | **337** |
| Product-linked microbiology rows | **106** |
| Current records with source questions | **10** |
| Cumulative scoped records | **493 / 533** |
| Remaining records | **40** |
| Full-product approvals issued | **0** |

## Main findings and controls

1. FSSAI's **12 March 2024** direction re-operationalises revised limits of Selenium, Manganese, Iron and Biotin from **1 October 2023**. R13 overlays only the specifically affected rows:
   - Infant formula Selenium: **5–40 µg/100 g**, **1–8.5 µg/100 kcal**.
   - Milk-cereal complementary food Selenium: **5–40**, **1–8.5**.
   - Processed cereal complementary food Iron: **2–5.65 mg/100 g**, **0.42–1.20 mg/100 kcal**; Selenium: **5–40**, **1–8.5**.
   - Follow-up formula Biotin: **7.50–50 / 1.60–10.60**; Manganese: **5–500 / 1–106.40**; Selenium: **5–40 / 1–8.5**.
   The overlay does not replace unrelated nutrient rows and is not a complete current-law approval.

2. The FSSAI notifications index lists the **15 October 2026** sucrose/fructose infant-nutrition item as a **Draft**. R13 does not promote it to operative law.

3. For **2.4.11(4) Formulated supplements for children**, R13 exposes the 29-row nutrient table and essential requirements. The printed Protein:Energy wording **“not more than 5–7.5 per cent”** remains an explicit source question and is blocked from automatic numerical interpretation. The standard expressly points to **Follow Up Formula** microbiological requirements, so the selected core update maps it to **milk-08b**.

4. Microbiology is assessed as complete individual-sample plans. R13 does not accept averages/composites in place of n individual units and does not treat numeric zero as an absence result. The Enterobacteriaceae supplemental footnote is not extrapolated to every FSMP/IEM product.

5. FSMP, IEM, hypoallergenic, lactose-free and Infant Milk Food routes retain manual age/product/medical questions where the source requires condition-specific evidence. A standard name is not a whole-product pass.

## Sources

- Foods for Infant Nutrition Compendium Version II (04.01.2024): https://fssai.gov.in/upload/uploadfiles/files/Comp_IFR_VERSION-II_04_01_2024.pdf
- 12 March 2024 trace-nutrient direction: https://www.fssai.gov.in/upload/advisories/2024/03/65f0255c6031ainfant%20direc_merged.pdf
- Chapter 2.4, Version 4 (07.05.2025): https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf
- Appendix B, Version 2 (04.11.2024): https://www.fssai.gov.in/upload/uploadfiles/files/Appendix%20B%281%29.pdf

Captured hashes:
- Infant compendium: `db789ed981634d3716a14a9eb326a47326168e240a7d89dcaac47ed0c506b15f`
- Appendix B: `4b2f41ec2763a9191b4a14aaa12918c8bd3a82b41022ced1e415b05e44812bc7`

## Tests and repository application

Local final suites:
- **4,200** structural/preservation/traceability assertions passed.
- **462** source-comparison/microbiology guard assertions passed.
- **34** browser assertions passed; all **533** actual product screens rendered.
- Viewports **1440 / 390 / 320 px** had no JavaScript errors or page-level horizontal overflow.
- Filtered export retained all **533 unique IDs**.

Workflow **41611206210** succeeded. Exact preimage blobs and exact output SHA-256 values were required before the selected core files were committed. Artifact **13219117080** was downloaded and the three data files were byte-identical to the locally tested outputs.

Applied-core SHA-256:
- Foods for Infant Nutrition module: `f7581f8f20905e32d9b5829330b2446ea951ca8b77d9a53279fc660bd479b50b`
- Chapter 2.4 module: `d86cb8fc86d2ca7442aa99ff9c34c821e46ee038ff050787a4ac069caa745364`
- Product master: `0c63161002e6e9a5088951a831e4d9c90907d1cdee3163186722b2cc11903d71`
- Offline R13 registry: `9ccae38bd57a98f15d914e1e9aa1be4abeb8ecd9cd6cb2e0ed2e79dd0907324d`
- Offline R13 HTML: `044672a44e2d100960653bc703d8600d91744e6a600a1ceaeadc9142d3860f94`

**Integration boundary:** only selected core corrections are committed to the audit branch. The full 337-row registry, 106 product-linked microbiology rows, standalone guard and combined viewer remain offline review companions and are not fully wired into the live PMSV decision engine.

PR #2 remains draft and unmerged. Production `gh-pages` is unchanged. No approval/completeness/release field has been promoted to full confirmation.

## Remaining queue

**40 records remain outside detailed scoped review.** Complete original-notification/current-amendment reconciliation, contaminants/residues, additives, processing aids, adopted analytical methods, packaging, labelling, claims and IMS Act obligations remain separate work even for scoped records.
