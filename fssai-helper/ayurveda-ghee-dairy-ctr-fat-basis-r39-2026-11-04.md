# PMSV R39 — Four Ayurveda ghee ingredient rows: dairy pesticide fat-basis evidence

**4 November 2026 | Draft evidence candidate only. No product regulatory PASS.**

## Delta versus R38

| Metric | Result |
|---|---:|
| Original PMSV catalogue IDs (unchanged) | 533 |
| Original Ayurveda recipe ingredient rows | 46 |
| Ingredients without any raw CTR source candidate after R38 | 20 |
| R39 newly referenced ingredient instances (Ghrita / Goghrita) | **4** |
| Still without a raw CTR source candidate after R39 | **16** |
| New distinct primary-source CTR rows | 2 |
| New ingredient-to-source reference links | 8 |
| Cumulative raw source-reference links R36–R39 | **88** |
| CTR full finished-product applicability decisions pending | **137** |
| Fully legally approved products | **0** |

## Source identity

FSSAI Food Products Standards and Food Additives regulation **2.1.8, Standard for Milk Fat Products**, identifies ghee as a milk-fat product made from milk/milk products. The chapter source was text-inspected; this review does **not** claim current original Gazette, full amendment or page-image revalidation of that identity text. The actual recipe inputs and their chemical grade remain to be confirmed.

## CTR Version IX (03.02.2026) — selected source entries

| Analyte | Exact printed food article | Printed MRL | Official CTR PDF page (1-based) |
|---|---|---|---:|
| Carbendazim | Milk and Milk products | **0.1 mg/kg (F)** | 19 |
| Carbofuran (sum of carbofuran and 3-hydroxy carbofuran expressed as carbofuran) | Milk and Milk products | **0.05 mg/kg (fat basis)** | 19 |

On PDF **page 39**, the printed footnote defines **F** as *Maximum Residue Limit Calculation on Fat Basis*. It is **not** an unqualified milk mass-basis figure. Confirm that the MRL is legally applicable to the actual ghee sample, the appropriate fat/whole-product basis and official analytical method before any comparison. The carbofuran combined-residue definition must be followed, not parent-only testing.

## Four candidate-linked recipe ingredients (identity-only source scope, not a legal approval)

| Recipe | Ingredient | Printed ingredient serial | Scope |
|---|---|---:|---|
| 13.1 Krishara | Ghrita | 7 | Conditional dairy-class references; recipe limit unresolved |
| 14.4 Yava Ksheera | Goghrita | 3 | Conditional dairy-class references; recipe limit unresolved |
| 14.5 Dugdha Kupika | Ghrita | 2 | Conditional dairy-class references; recipe limit unresolved |
| 14.6 Sugandhit Ksheera | Ghrita | 7 | **Additional official source title/method alignment HOLD** |

## Fail-closed rules

- Broad "Milk and Milk products" candidate does **not** automatically establish legal applicability to 99%+ fat ghee, any cooked mixed finished food, or every pesticide in the regulated panel.
- No borrowing "vegetable oils" or generic "edible fats" metal rows, no conversion from fat-basis to whole-food basis without validated processing/sampling evidence, and no unverified MRL default.
- Other 16 no-candidate ingredient instances remain evidence holds.
- No changes to operative product master, numerical limits, production engine or deployed PMSV.
- The original **137** product-specific contaminant-article decisions remain pending, even though all were previously source-screened. No batch release, compliance PASS or PR merge.

## Official sources

- [CTR Version IX 03.02.2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), PDF pages **19** and **39** visually checked.
- [FSSR Chapter 2.1 (Dairy products and analogues)](https://mail.fssai.gov.in/upload/uploadfiles/files/2_%20Chapter%202_1%20%28Dairy%20products%20and%20analogues%29.pdf), section 2.1.8; original/current notification reconciliation still required.
- [FSSAI Dairy FAQ](https://fssai.gov.in/upload/uploadfiles/files/FAQs_Diary_12_07_2022.pdf), dairy-product identity context.

Structured register: `fssai-helper/ayurveda-ghee-dairy-ctr-fat-basis-r39-2026-11-04.json`.
