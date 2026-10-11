# PMSV FSSAI Helper — 28 identity-specific contaminant transfer safeguards (11 October 2026)

**Status:** GitHub `gh-pages` only. **NOT** a completed contaminant/pesticide/veterinary compliance review.

| Current measure | Exact number |
|---|---:|
| Local FoSCoS catalogue identities | 533 |
| Products with at least one partial exact contaminant/residue evidence match (unchanged) | 407 |
| Products awaiting first exact contaminant/residue source match (unchanged) | 126 |
| Additional source/matrix nontransferability records added here | 28 |
| Products newly promoted to partial exact CTR evidence in this review | 0 |
| Full contaminant/pesticide compliance approvals | 0 |

## What changed

This is a **product-identity, not blanket matrix**, review of twelve Chapter 2.4 identities, eleven Chapter 2.8 identities and five Chapter 2.11 identities. The 28 new source-identity notes are attached to the exact pending records in `contaminants-v9-unresolved-264-review-v1.json` and displayed in the Helper under **11 October exact subtype transfer safeguard — NOT APPLIED**. A cited quality-criterion value is never treated as an FSSAI CTR metal/pesticide MRL, a laboratory result, or a compliance clearance. Where the source PDF page was not individually verified in this batch, the record says so.

**High-risk differences verified against the official regulations:**

- **Cube Sugar**: FSSR 2.8.1(5) specifies **total ash ≤0.03% by weight**, not the **sulphated ash** criterion needed to choose the separate Version IX refined-white-sugar Lead article. One number matching another does not authorize substituting analytical methods.
- **Khandsari Sugar**: Desi versus Sulphur sugar have different acid-insoluble-ash and sucrose limits. These **do not** measure the sulphated ash required by the metal table.
- **Custard Powder**: FSSR 2.4.9 permits maize or sago/tapioca. A maize pesticide MRL cannot automatically cover every custard powder.
- **Pasta/Instant Noodles**: FSSR 2.4.10 permits alternative tuber, cereal, pulse and other flours; a wheat-only contaminant or pesticide assumption is unsafe.
- **Papad (two different FoSCoS identities)**: FSSR 2.4.40 allows different raw-material blends. Its uric-acid product-quality limit of **100 mg/kg** must not be misclassified as a CTR pesticide MRL.
- **Fruit/Vegetable, Cereal Flakes**: The exact FSSAI Chapter 2.3 named standard is **2.3.20**, while the current catalogue points to **2.4.35 Breakfast Cereal**. The mismatch stays explicitly blocked pending source/master-route reconciliation. No silent change to the source product master is made.
- **Carob Powder and Silver Leaf**: Carob must not inherit the cocoa-powder metal basis; silver fineness **≥999/1000** alone does not prove full heavy-metal compliance.
- **Pan Masala**: Betelnut is *optional* in the Chapter 2.11 identity; the betelnut mycotoxin article requires actual ingredient verification.

## Complete 28-identity accountability

| # | Product | Catalogue ID | Existing family | Checked chapter PDF page (1-based) | Specific prohibited inference |
|---:|---|---|---|---:|---|
| 1 | Any other foodgrains | `06-06-1-any-other-foodgrains` | 2.4 | Further source-page check | No blanket cereal metal or pesticide article without species. |
| 2 | Arrowroot | `06-06-2-arrowroot` | 2.4 | 55 | Arrowroot is not wheat flour or cereal grain. |
| 3 | Biscuit | `07-07-2-biscuit` | 2.4 | 55 | Do not automatically assign one cereal-crop MRL or ingredient-only cocoa metal limit. |
| 4 | Chia Seeds | `06-06-1-chia-seeds` | 2.4 | Further source-page check | Do not apply wheat/pulse residue article to chia from chapter placement. |
| 5 | Custard powder | `06-06-2-custard-powder` | 2.4 | 32 | A tapioca-only custard must not inherit a maize-only crop article. |
| 6 | Fruit/Vegetable, Cereal Flakes | `06-06-3-fruit-vegetable-cereal-flakes` | 2.4 | 29 | Catalogue 2.4.35 Breakfast Cereal is a different standard: routing mismatch; withhold numeric inheritance. |
| 7 | Macaroni Products (Instant noodle) | `06-06-4-macaroni-products-instant-noodle` | 2.4 | 33 | Tuber-based noodles are not necessarily a cereal-only matrix. |
| 8 | Macaroni Products (Pasta Products) | `06-06-4-macaroni-products-pasta-products` | 2.4 | 33 | No universal wheat-based finished-product contaminant classification. |
| 9 | Papad | `06-06-7-papad` | 2.4 | 85 | No assumption of wheat, pulse or soybean as sole base. |
| 10 | Papad | `15-15-1-papad` | 2.4 | 85 | Separate category must not inherit the other papad's crop commodity basis. |
| 11 | Quinoa | `06-06-1-quinoa` | 2.4 | Further source-page check | Version IX cereal-grain lead row excludes quinoa; no cereal-grain default. |
| 12 | Wafer Biscuit | `07-07-2-wafer-biscuit` | 2.4 | 55 | Do not assume wheat-only wafer, nor apply cocoa-powder metal rule to centre filling. |
| 13 | Bura Sugar | `11-11-1-bura-sugar` | 2.8 | 3 | HCl-insoluble ash is not sulphated ash required for CTR sugar lead. |
| 14 | Cane jaggery or cane gur | `11-11-1-cane-jaggery-or-cane-gur` | 2.8 | Further source-page check | Avoid refined white sugar lead article unless chemical/ash basis established. |
| 15 | Cube Sugar | `11-11-1-cube-sugar` | 2.8 | 3 | Total ash <=0.03% DOES NOT substitute for CTR sulphated ash <=0.03%. |
| 16 | Dried Glucose Syrup | `11-11-1-dried-glucose-syrup` | 2.8 | Further source-page check | Do not equate dried glucose syrup with dextrose monohydrate or refined sugar. |
| 17 | Golden Syrup | `11-11-3-golden-syrup` | 2.8 | Further source-page check | Do not apply dry refined sugar threshold without testing sulphated ash. |
| 18 | Gur or Jaggery | `11-11-1-gur-or-jaggery` | 2.8 | Further source-page check | Unverified botanical origin and sulphated ash forbid refined sugar article. |
| 19 | Icing Sugar | `11-11-1-icing-sugar` | 2.8 | 3 | Do not assume pure refined white sugar when starch is permitted. |
| 20 | Khandsari Sugar | `11-11-1-khandsari-sugar` | 2.8 | 2 | Neither Desi nor Sulphur acid-insoluble ash proves CTR sulphated ash threshold. |
| 21 | Misri | `11-11-1-misri` | 2.8 | 4 | Misri is not automatically refined white sugar or a known sulphated ash grade. |
| 22 | Plantation White Sugar | `11-11-1-plantation-white-sugar` | 2.8 | 1 | Do not silently call this refined white sugar for CTR lead with <=0.03% sulphated ash. |
| 23 | Royal Jelly | `100-100-royal-jelly` | 2.8 | Further source-page check | Do not borrow honey-specific HMF or metal MRL without source. |
| 24 | Carob Powder | `06-06-2-carob-powder` | 2.11 | 4 | Carob is not cocoa powder; cocoa-powder dry fat-free lead basis is excluded. |
| 25 | Catechu (Edible) | `04-04-1-catechu-edible` | 2.11 | 1 | Do not assign tea/cocoa/spice rules solely because of botanical extract. |
| 26 | Dietary Fibre (Dextrin-soluble fibre) | `99-99-7-dietary-fibre-dextrin-soluble-fibre` | 2.11 | 4 | Dextrin is not dextrose; exclude dextrose impurity article. |
| 27 | Pan Masala | `100-100-pan-masala` | 2.11 | 3 | Do not apply betelnut aflatoxin by name without betelnut in recipe. |
| 28 | SILVER LEAF (Chandi-ka-warq) | `100-100-silver-leaf-chandi-ka-warq` | 2.11 | 3 | Silver fineness alone cannot establish heavy-metal compliance. |

## Evidence sources (official FSSAI only)

1. [Chapter 2.4 — Cereals and Cereal Products, Version 4 (07.05.2025)](https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf).
2. [Chapter 2.8 — Sweetening Agents Including Honey, Version 1 (01.09.2023)](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf).
3. [Chapter 2.11 — Other Food Products and Ingredients](https://fssai.gov.in/upload/uploadfiles/files/12_%20Chapter%202_11%20(Other%20food%20product%20and%20%20ingredients).pdf).
4. [Chapter 2.3 — Fruit and Vegetable Products, Version 2 (04.11.2024)](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf).
5. [Contaminants, Toxins and Residues, Version IX (03.02.2026)](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf).

## Technical verification

- `tests/fssai-28-subtype-transfer-official-source-2026-10-11.test.cjs` verifies exact catalogue identity, family counts, locked review-only flags, three substance/matrix nontransferability cases, UI visibility and fail-closed mismatches.
- This test is registered in `.github/workflows/verify-fssai-standard-nutrition.yml` so subsequent FSSAI verification runs exercise it.
- **Next evidence needed:** actual exact contaminant article, analytical form, relevant processing/packaging conditions, current amendments and a complete residue/metals panel. No missing limit is assumed zero, irrelevant, or satisfied.

**WordPress unchanged.**
