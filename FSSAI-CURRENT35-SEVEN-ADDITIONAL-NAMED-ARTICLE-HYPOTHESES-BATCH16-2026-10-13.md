# PMSV FSSAI Helper — Batch 16: seven additional exact legal commodity *research* hypotheses

**Date:** 13 October 2026. **Branch:** GitHub `gh-pages` preview only. WordPress production not modified.

## Source facts checked (official sources only)

[FSSAI Contaminants, Toxins and Residues Version IX, 03 February 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), CTR §2.3.1 pesticide table p.16 (zero-based 15), names **2,4-D Fruits — 2 mg/kg**, **Eggs — 0.05 mg/kg (shell-free basis)**, and **Milk and Milk products — 0.05 mg/kg**. These are **legal-source reference values**, not assigned to frozen fruit, deseeded tamarind, dried egg, crystalline lactose or processed colostrum until commodity identity, processing, sample basis and exact legal scope are substantiated.

The same CTR Version IX §2.2.1 p.14 (zero-based 13) gives **total aflatoxins 15 µg/kg and aflatoxin B1 10 µg/kg for oilseeds**, both ready-to-eat and further-processing; however, FSSR 2.4.6(25) defines chia (`Salvia hispanica`) from the mint family, **not** as an expressly classified oilseed or cereal grain under the contaminant regulation. Chia's legal oilseed category remains *unproven*. [FSSR Chapter 2.4](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_4%20(Cereals%20and%20Cereal%20products)(1).pdf), PDF p.27 (zero-based 26).

The CTR §2.1.1 Lead p.3 (zero-based 2) names **Cattle, edible offal of — 0.5 mg/kg**. FSSR 2.5.2(14) describes casings from intestines, oesophagus and urinary bladder of food animals, with wet-salted/dried processing. Actual animal species, edible-offal legal scope and processing-matrix status are **not confirmed**. [FSSR Chapter 2.5](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_5_Meat%20and%20Meat%20products(1).pdf).

The [FSSR 2.1.20/2.1.23](https://fssai.gov.in/upload/uploadfiles/files/Compendium_Food_Additives_Regulations_29_10_2021.pdf) standards distinguish edible lactose from whey and colostrum products (colostrum before normal milk), so even the broad "Milk and Milk products" MRL is not applied without legal confirmation of the as-sold finished class.

## Substantive current-source review

- **Seven distinct new named-article *hypotheses*** among the 35 unresolved cases, each with **four specific positive-evidence gates (28 new questions)**:
  1. Frozen fruits: 2,4-D "Fruits", conditional on actual species/form and valid processed matrix.
  2. Seedless tamarind: 2,4-D "Fruits", conditional on ripe fruit versus finished pulp, seed removal and any processing factor.
  3. Egg powder: 2,4-D "Eggs", shell-free 0.05 mg/kg is not an automatic dried-powder limit.
  4. Edible lactose: 2,4-D "Milk and Milk products", conditional on 2.1.20 versus FoSCoS sweetener identity and legal coverage of purified lactose.
  5. Colostrum products: same 2,4-D category, but lacteal pre-milk secretion and powder/composite scope require confirmation.
  6. Chia seeds: aflatoxin oilseed class, botanical and legal crop-category gate not yet established.
  7. Animal casings: lead cattle edible-offal row, only possible for proven cattle-derived legally qualifying processed casing tissue.
- **Existing three** conditional named-source branches from Batch 15 remain separate (canned pickled eggs, formulated children supplement and functional ingredient premix).
- The other **25** first-source dossiers do not receive a guessed new article. The new matrix groups all 35 as **3 previous conditional, 7 new hypotheses, 25 no additional match**.
- Source references, full commodity article titles, correct units, competing processing restrictions, negative transfer reasons and next definitive proof question are attached to the seven products' Helper panels.
- **No new source promotions; canonical source status remains 533 total / 498 conditional / 35 first-exact pending.**
- **Zero** approved numeric limits, finished-lot analyses, complete contaminant panels or compliance PASS decisions. The May 2026 amendment commencing 01.12.2026 is not applied early.

## Verification files

- `fssai-product-helper-preview-01/data/rules/fssai-current35-seven-named-commodity-research-batch16-2026-10-13.json`
- `fssai-product-helper-preview-01/fssai-current35-seven-named-commodity-research-batch16-2026-10-13.js`
- `tests/fssai-current35-seven-commodity-hypotheses-batch16-2026-10-13.test.cjs`
- `.github/workflows/verify-fssai-current35-seven-commodity-hypotheses-batch16.yml`

The test suite verifies exact canonical identity and 3/7/25 partition, 28 evidence gates, published official source values, 35-pending and no-PASS flags, corrupted data rejection, and the preview-only insertion order.
