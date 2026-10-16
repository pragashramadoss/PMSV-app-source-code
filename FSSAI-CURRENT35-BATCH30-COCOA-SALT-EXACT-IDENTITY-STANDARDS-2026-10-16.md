# PMSV FSSAI Helper — Batch 30: 3 more named FSSR product standards, 25 condition-specific quality rules

**Reviewed:** 16 October 2026. **Destination:** GitHub Pages preview, **not WordPress production**.

## What is actually resolved

Located the applicable **published named FSSR clauses**, including finished-product variant and analytical-basis distinctions, for:

1. **Dry Mixtures of Cocoa and Sugars** — FSSR **2.7.6**: [official FSSAI sweets/confectionery chapter](https://stg-old.fssai.gov.in/upload/uploadfiles/files/Chapter%202_7%20(Sweets%20and%20Confectionary).pdf#page=10).
2. **Cocoa mass / Cocoa-Chocolate Liquor and Cocoa Cake** — FSSR **2.7.8**: [same official chapter](https://stg-old.fssai.gov.in/upload/uploadfiles/files/Chapter%202_7%20(Sweets%20and%20Confectionary).pdf#page=13).
3. **Salt Substitutes** — FSSR **2.9.30(6)**: [official FSSAI salt/spices chapter](https://stg-old.fssai.gov.in/upload/uploadfiles/files/Chapter%202_9_Salt_Spices_Condiments%20and%20related%20products.pdf#page=37).

Source PDFs are FSSAI chapter-wise regulatory **compendia for reference** (2.7 Version 1 / 1 September 2023; 2.9 Version 4 / 1 August 2025). If the compendium and a primary Gazette differ, the primary notification controls. This research does **not** prove the actual marketed/processed material meets these standards.

## Important published legal distinctions

### FSSR 2.7.6 — Dry mixtures of cocoa and sugars

- Moisture: **≤7%**.
- **Sweetened Cocoa / Drinking Chocolate** names require **≥25% cocoa powder** in the dry mixture (subject to cocoa powder fat-content classification).
- **Sweetened Cocoa Mix / Sweetened Mixture with Cocoa:** a separate designation with **≥20% cocoa powder**.
- **Sweetened Cocoa-flavoured Mix:** the **below-20%** cocoa-powder category.
- **Chocolate Powder:** minimum cocoa-powder content **32% w/w**; the text provides **29% w/w on a dry matter basis** as the corresponding alternate expression. Keep analytical bases separate.
- The fat class (ordinary, fat-reduced, highly fat-reduced) affects the correct identity designation. No blanket cocoa-powder lead/copper limit is assigned to a sugar-containing finished mixture.

### FSSR 2.7.8 — Cocoa mass, liquor and cake

| Requirement | Cocoa mass / liquor | Cocoa cake | Basis |
|---|---:|---:|---|
| Moisture | ≤10% | ≤10% | As sold |
| Shell and germ | ≤5% | ≤5% | Fat-free dry matter |
| Cocoa shell | ≤1.75% | ≤4.5% | Alkali-free basis; shell only |
| Cocoa butter | **47–60%** | Not applicable | Cocoa mass |
| Total ash alkalinity as K₂O | ≤12% | ≤12% | Moisture/fat-free |
| Acid-insoluble ash | ≤1% | ≤1% | Moisture/fat-free |
| Crude fibre | ≤7% | ≤7% | Moisture/fat-free |

**Why it matters:** liquid/paste cocoa mass is not the dry fat-free cocoa powder article merely because the two are made from the same bean. A formula, milling/de-fatting process record and analytical basis are needed before any source transfer.

### FSSR 2.9.30(6) — Salt substitutes

- Sodium: **≤120 mg/100 g** of finished salt substitute.
- Phosphorus: **≤4% of mixture** for the specified mineral-salt combinations; ammonium **≤3%** in the applicable composition.
- Magnesium: maximum **20% of the stated K⁺/Ca²⁺/NH₄⁺ cation total**, *not* 20% of the full mix.
- Choline: maximum **3% of mixture** where choline salt permitted under clause (c).
- Optional colloidal silica or calcium silicate: maximum **1% combined**.
- Mandatory low-sodium designation and quantitative cation declaration as specified in the official standard.
- A salt substitute is **not automatically food-grade NaCl** for metals, even though the published product-standard requirements may apply if the as-sold formula matches 2.9.30(6).

## Source tracking

| Metric | Count |
|---|---:|
| Canonical product records | 533 |
| Conditional previous reference matches (not full compliance) | 498 |
| Current exact CTR first-source pending | **35 unchanged** |
| Earlier identified FSSR product standards in Batch29 | 7 |
| Additional directly named published FSSR clauses | 3 |
| Published FSSR identity-standard dossiers across B29–B30 | 10 |
| Conditional quality/compositional records documented in B30 | **25** |
| New approved CTR article transfer | **0** |
| Actual food-lot passes or independent legal approvals | **0** |
| WordPress production changes | **0** |

This is actual **FSSR source research progress**, not a compliance sign-off. No current data allows a valid blanket metal/toxin limit to be inserted for the three finished articles. Before closing their CTR cases, a qualified reviewer must identify actual finished-product ingredients, material form, specific legal contaminant article, precedence, sampling and analytical conversion basis.

## App and validation

New review files:
- `fssai-product-helper-preview-01/data/rules/fssai-current35-next3-exact-fssr-product-standards-batch30-2026-10-16.json`
- `fssai-product-helper-preview-01/fssai-current35-next3-exact-fssr-product-standards-batch30-2026-10-16.js`
- `tests/fssai-current35-next3-exact-fssr-product-standards-batch30-2026-10-16.test.cjs`

The preview shows separate product-standard criteria by variant, searches those 25 criteria, links to official chapter PDF pages and launches the pre-existing product evidence form. The data loader validates its fingerprint, all 3 product identities, consistency with the earlier 7 and the invariant 533 / 498 conditional / 35 pending. The Chromium integration test checks all of these and the navigation. **No auto limit application** exists in Batch30.

**Legal source caution:** As an FSSAI compendium, the chapter is a convenient consolidated reference, not a substitute for the legally operative Gazette, including subsequent amendments if any.
