# PMSV — Six pending FSSR product-standard quality panels (49 criteria)

**Reviewed on:** 11 October 2026. **Environment:** GitHub `gh-pages` only; **WordPress unchanged**. **Source policy:** Official FSSAI and FoSCoS only.

## Outcome

- Catalogue remains **533** products.
- Exactly **412** products have **partial** exact-source chemical/contaminant evidence.
- Exactly **121** products remain without a **first exact finished-product CTR source**.
- New exact FSSR **quality** source details: **6 identities**, **49 source criteria** (47 numeric and 2 separately checked scorched-particle quality grades). **No** contaminant-source promotion.
- **Zero** finished-product laboratory/compliance approvals; source evidence must not be used as a regulatory or product safety certificate.

| Exact FoSCoS identity | FSSR quality clause | Criteria | Qualification |
|---|---|---:|---|
| Edible Lactose | 2.1.20 | 6 | Moisture, lactose dry basis, sulphated ash, pH bounds and scorched particles. |
| Cow or Buffalo Colostrum and Colostrum Products | 2.1.23 | 12 | **Two different states**: liquid colostrum and colostrum powder; correct IgG and analytical basis. |
| Custard powder | 2.4.9 | 3 | Moisture and distinct total-ash/acid-insoluble-ash bases. |
| Khandsari Sugar | 2.8.1(3) | 12 | **Sulphur Sugar vs Desi** requirements including conductivity and calcium oxide. |
| Dried Glucose Syrup | 2.8.7 | 3 | Solids, reducing sugars and sulphated ash, distinct from conditional CTR lead. |
| Cocoa mass or Cocoa/Chocolate Liquor and Cocoa Cake | 2.7.8 | 13 | **Cocoa mass vs cocoa cake**, distinct shell limits, and cocoa-butter range only for mass. |

### Substantive FSSAI 2025 legal correction

FSSR **2.1.23** source `chapter-2-1-dairy-v1.json` previously retained the **superseded total-immunoglobulins** parameter in both variants and the **12.5%** powder minimum.

Official FSSAI **Chapter 2.1 Version 3 (07.05.2025)**, pages **77–78**, prints the amendments effective **1 May 2025**:
- Liquid colostrum: **Immunoglobulins-G (IgG), minimum 1.8% (m/m)**.
- Colostrum powder: **Immunoglobulins-G (IgG), minimum 8.5% (m/m)**.

The stored quality source now pins the amended **IgG-specific analyte**, not a legacy total-immunoglobulins substitute, and the screen fails closed if that amendment or matrix is modified. **IgG assay, formulation identity, effective amendment checks, actual laboratory data and other statutory requirements remain necessary.**

Official source: https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_1_Dairy_products_and_analogues.pdf (FSSR 2.1.23, pp. 77–78).

Other official Chapter sources:
- FSSR 2.4: https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf
- FSSR 2.8: https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf
- FSSR 2.7: https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_7%20%28Sweets%20and%20Confectionary%29.pdf
- Distinct 2026 CTR Version IX: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf

## Source-integrity implementation

- `fssai-product-helper-preview-01/data/rules/fssai-six-pending-chapter-quality-source-2026-10-11.json`: 6 catalogue IDs and exact FSSR/FoSCoS identities, 49 checked quality rows, subtype-specific canonical source snapshots and exact official source URLs. Candidate articles are **not** auto-applied to CTR.
- `fssai-product-helper-preview-01/data/rules/chapter-2-1-dairy-v1.json`: correction of amended IgG values.
- `fssai-product-helper-preview-01/index.html`: new FSSR quality-only panel; all six source records must pass whole-batch integrity validation against their loaded chapter standards. Wrong product identity, changed source value or unit, changed official PDF URL, lost variant, altered 2025 IgG, or fabricated compliance claim withholds the panel.
- `tests/fssai-six-pending-chapter-quality-source-2026-10-11.test.cjs`: seven regression scenarios for the six products, 49 source criteria, amended colostrum IgG, wrong identities, cross-product drift, mutation and conditional subtype presentation.
- `.github/workflows/verify-fssai-standard-nutrition.yml`: runs this specific regression test on GitHub Actions.

**Important:** Some source-structured module records are drawn from the last cited official chapter compilations and are **not independently certified here against all later orders or amendments**. This batch does not clear microbiology, residues, additives, packaging, labelling, pesticide registration, veterinary medicines or actual sample-test results.

### Next review handoff

Continue **121 pending first exact CTR identities** using the latest actionable per-product worklists. A direct source article plus demonstrated exact product identity and processing/sample applicability is needed before a product may move to partial evidence. Do **not** lower the pending count because a Chapter 2 quality standard exists. Keep WordPress unchanged until explicitly asked to deploy.
