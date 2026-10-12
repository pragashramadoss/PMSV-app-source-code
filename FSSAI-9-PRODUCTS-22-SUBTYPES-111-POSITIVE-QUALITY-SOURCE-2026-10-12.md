# PMSV FSSAI Helper — 9 products, 22 source-proven finished-product subtypes, 111 quality requirements

**Review date:** 12 October 2026. **Scope:** GitHub `gh-pages` standalone Helper only. WordPress unchanged.

## Current legal evidence status

| Measure | Count |
|---|---:|
| FSSAI/FoSCoS catalogue products | 533 |
| Partial exact CTR evidence (prior/current, unchanged) | 417 |
| Awaiting first exact finished-food CTR article (unchanged) | 116 |
| Distinct new quality-source product identities | 9 |
| Product-form profiles | 22 |
| Individually sourced FSSR product-quality criteria | 111 |
| Related CTR article candidates (review-only, not applied) | 12 |
| New exact first-CTR matches | **0** |
| Finished-product compliance or laboratory PASS | **0** |

## Positive primary-source criteria implemented

| Current unresolved route | Forms | Source proof / critical distinction |
|---|---:|---|
| Frozen Egg Products, §2.5.3(2) | 3 | Hen whole / yolk / albumen have **different solids, fat, protein, pH** requirements. Beta-hydroxybutyric acid, lactic acid, succinic acid and foreign matter are separately retained. |
| Liquid Egg Products, §2.5.3(4) | 3 | Corresponding liquid whole / yolk / albumen composition; pasteurisation, approved ingredients and frozen-versus-liquid handling not conflated. |
| Egg Powder, §2.5.3(3) | 3 | White/yolk/whole powders have distinct total-solids criteria; 2% maximum moisture. Do not replace powder measurement or legal sample basis with the raw-egg pesticide MRL. |
| Pickled Eggs, §2.5.3(5) | 2 | Vinegar-based: acidity ≥0.8%, salt ≤3%, pickling solution pH ≤3.2. Oil-based: acidity ≥0.6%, salt ≤3%, pH ≤3.6. Species, recipe and process remain key. |
| Royal Jelly, §2.8.3(3) | 2 | Bee-feed Type 1 vs Type 2, 10-HDA min 1.4%, sugar fraction differences and distinct δ13C reference ranges. No honey or beeswax metal borrowing. |
| Colouring Foods, §2.3.65 | 2 | Liquid: total solids ≥45 g/100g, marker pigment ≥0.5%. Powder: solids ≥90 g/100g, pigment ≥1.0%. These are ingredient-derived colouring foods; do not automatically equate them with purified colour additives. |
| Thermally Processed Fruits, §2.3.1 | 3 | Canned liquid-pack vs solid-pack **50% vs 70% drained weight**, and non-can formats. Rigid container fill 90% water capacity where applicable. |
| Thermally Processed Fruit Salad/Cocktail/Mix, §2.3.2 | 2 | Canned fruit salad/cocktail is a specific finished article, but the FSSR product also permits bottled, flexible and aseptic forms. Drained-weight unit uses container water capacity, not the fruit net weight basis. |
| Thermally Processed Vegetables, §2.3.3 | 2 | Named canned species vs bottled/flexible/aseptic product. Requires species, packaging, liquid/solid pack before any canned-specific article reference. |

**Critical FSSAI distinction:** The CTR Version IX `2,4-D` article for eggs is **0.05 mg/kg on shell-free basis**. It is recorded only as a review reference for the processed egg products; it is NOT automatically applied to powders, frozen egg, liquid egg or oil/vinegar pickles. Likewise, metal articles for specific canned fruit, canned vegetable and canned foods cannot be transferred to any heat-processed bottled, flexible or aseptic product. Official lead 1 mg/kg, tin 250 mg/kg references remain review-only.

## Safety and test controls

- All 9 routes are confirmed to be among the **116 presently unresolved** in the live source ledger; source-basis FSSR/FoSCoS identity and article candidate fields are tied to the authenticated current ledger.
- Every quality profile has its own display row and necessary subtype evidence; a user choice displays **the official source as a research reference**, never a laboratory or legal PASS.
- Nine-route manifest is build-fingerprinted; any numerical, source URL, proof question, candidate or status change after load disables the whole new reference panel.
- The loaded original 533/417/116 ledger's independent snapshot guard must pass before these new quality panels render.
- The manifest carries source page numbers and full original FSSAI PDF links. These are quality/legal definition criteria, not proof of full regulatory coverage or testing.
- Regression tests cover all 22 branches / 111 quality requirements, product IDs, official numerical reference examples and tampering, including forbidden cross-article inheritance.
- Annual amendments, food additive appendix, Appendix B microbiology, processing specifications and actual sample testing still require independent review.

### Regulatory primary sources (official FSSAI only)
1. [FSSR Meat and Meat Products, Version 4 (01.08.2025) — §2.5.3](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_5_Meat%20and%20Meat%20products(1).pdf), PDF pages 25–30 (1-based).
2. [FSSR Sweetening Agents Including Honey, Version 1 (01.09.2023) — §2.8.3(3)](https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf), PDF pages 9–10 (1-based).
3. [FSSR Fruit & Vegetable Products, Version 2 (04.11.2024) — §2.3.1, §2.3.2, §2.3.3 and §2.3.65](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf), PDF pages 1–6 and 106 (1-based).
4. [CTR Version IX (03.02.2026)](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), exact named metal or pesticide article rows remain **conditional comparisons** only.

### Files created or updated
- `fssai-product-helper-preview-01/data/rules/fssai-nine-finished-quality-subtype-positive-source-2026-10-12.json`
- `fssai-product-helper-preview-01/fssai-nine-quality-finished-subtypes.js`
- `fssai-product-helper-preview-01/index.html`
- `tests/fssai-nine-quality-22-forms-111-criteria-official-source-2026-10-12.test.cjs`
- `.github/workflows/verify-fssai-standard-nutrition.yml`

**Remaining priority:** separate exact CTR article adjudication and complete tested-lot regulatory coverage for 116 first-source-pending products. This 111-criterion positive source expansion is meaningful for **product-quality clauses**, but it makes **no exact finished-product CTR contaminant promotions**.
