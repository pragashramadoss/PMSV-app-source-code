# PMSV FSSAI Helper — Eight standard rechecks, two new jaggery quality panels (11 October 2026)

**Scope:** GitHub `gh-pages` preview / Actions only. **WordPress unchanged.** **Product identity ledger unchanged:** 533 total / 412 with partial identity-specific contaminant or chemical-residue evidence / 121 still without a first exact source / 0 finished-product full compliance approvals.

## Why this batch is additive, not a duplicate

The following six identities **already had live chapter-quality panels** and remain there without duplicate panels: Edible Lactose (2.1.20), Cow/Buffalo Colostrum (2.1.23), Custard Powder (2.4.9), Cocoa Mass/Cocoa Cake (2.7.8), Khandsari Sugar (2.8.1(3)) and Dried Glucose Syrup (2.8.7).

This batch **reconciles their stored FSSR source payloads again** and makes a separate two-product quality-panel addition for:

1. **Gur or Jaggery — FSSR 2.8.4(1)** (palm/date/coconut source, not cane): six Chapter 2.8 quality requirements, including separate moisture exception for liquid or semi-liquid jaggery. These are *not CTR contaminant limits*.
2. **Cane jaggery / cane gur — FSSR 2.8.4(2)** (sugarcane origin): eight Chapter 2.8 quality requirements, including distinct reducing-sugar **minimum 5.5% and maximum 20%**, with the official stated test basis. These must not transfer to palm/date/coconut gur.

Across the eight exact catalogue identities, the manifest covers **11 finished-product forms and 61 quality source criteria**. All forms and their values are checked against the matching locally loaded official FSSAI Chapter data **at runtime**. The new Helper panels fail closed if a product name, FoSCoS code, FSSR clause, analytical value/unit, food form or source record does not match.

## The 11 distinct forms

| Product identity | Distinct forms | Quality criteria checked |
|---|---|---:|
| Edible Lactose | Edible lactose | 5 |
| Cow/Buffalo Colostrum | Liquid colostrum; colostrum powder | 5 + 6 |
| Custard Powder | Custard powder | 3 |
| Cocoa Mass/Cocoa Cake | Cocoa mass/liquor; cocoa cake | 7 + 6 |
| Khandsari Sugar | Sulphur Khandsari; Desi Khandsari | 6 + 6 |
| Gur or Jaggery | Palm/date/coconut gur | 6 |
| Cane Jaggery or Cane Gur | Sugarcane jaggery | 8 |
| Dried Glucose Syrup | Dried glucose syrup | 3 |
| **Total** | **11 forms** | **61** |

## Specific source and amendment corrections guarded

- **Colostrum (May 2025 official dairy compendium):** the applicable immunoglobulin requirement is specifically **IgG ≥1.8%** for liquid colostrum and **IgG ≥8.5%** for colostrum powder; the older generic powder total-immunoglobulin minimum **12.5%** must not be substituted for IgG. This is an official FSSR quality parameter, *not* a CTR MRL or a sample result.
- **Cocoa mass versus cocoa cake:** the maximum cocoa shell on alkali-free basis is **1.75%** for mass and **4.5%** for cake, respectively; cocoa butter range 47–60% is specific to cocoa mass/liquor.
- **Khandsari sulphur versus Desi:** sucrose minimum **96.5%** versus **93%**, respectively; keep process/identity-specific ash and conductivity rules distinct.
- **Dried glucose syrup:** sulphated ash must be **≤1% by weight** under FSSR 2.8.7; do not treat a CTR lead article conditional on sulphated ash **>1%** as automatically applicable to this product.
- **Cane Jaggery:** 5.5% and 20% are a lower and upper bound for reducing sugars, respectively, not contradictory duplicate clauses.

## Primary official FSSAI sources

- Chapter 2.1 Version 3 (07.05.2025) dairy amendments: https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_1_Dairy_products_and_analogues.pdf
- Chapter 2.4 Version 4 (07.05.2025): https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf
- Chapter 2.7 Version 1 (01.09.2023): https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_7%20%28Sweets%20and%20Confectionary%29.pdf
- Chapter 2.8 Version 1 (01.09.2023): https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf

**Not an exhaustive amendment or compliance assessment.** Referenced values are standardized-food **quality/identity requirements**, not a determination that any particular formula or laboratory sample passes. No contaminant, pesticide, veterinary drug, microbiology, additive, packaging, labelling or full legal compliance PASS was added.

## GitHub changes

- `fssai-product-helper-preview-01/data/rules/fssai-eight-pending-chapter-quality-subtypes-2026-10-11.json`
- `fssai-product-helper-preview-01/index.html` (new jaggery views only, existing six remain nonduplicated)
- `tests/fssai-eight-pending-chapter-quality-subtypes-2026-10-11.test.cjs` (source drift, 2025 IgG, subtype and fail-closed regressions)
- `.github/workflows/verify-fssai-standard-nutrition.yml` (test wired into continuous verification)

**Next priority:** resolve the 121 remaining *first exact CTR source* gaps individually. Chapter quality evidence must not decrement the 121 figure.
