# PMSV FSSAI — 497 / 36 conditional-source verification (13 October 2026)

**Implementation:** GitHub `gh-pages` preview only, WordPress unchanged. Earlier 533-product 495/38 snapshot retained verbatim. Latest effective ledger **533 standardized/FoSCoS identities, 497 partially verified named-source routes, 36 still pending**. All zero actual lot verification, automatic source limit assignments, and full-compliance claims.

## Newly added narrow source-level routes

1. **Fruit Cheese** — FSSR [2.3.33](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf), PDF page 39. Fruit cheese is a *cooked set fruit pulp/purée and sweetener product*, at least 65% soluble solids. Conditional CTR IX §2.1.1 finished article **Pulp and pulp products of any fruit**: **Copper 5 mg/kg** (PDF page 7), **Arsenic 0.2 mg/kg** (page 10), **Tin 250 mg/kg** (page 11). The broad article must be affirmatively shown to include the marketed cooked fruit cheese. Ingredient pulp by itself is not sufficient. Distinct jam/jellies, confectionery and raw fruit articles cannot be borrowed.
2. **Colouring foods** — FSSR [2.3.65](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf), PDF page 106. Whole-edible-plant aqueous extract retaining ingredients' characteristics, **without selective pigment extraction**. Conditional CTR IX arsenic named article **Food colouring other than synthetic colouring: 5 mg/kg on dry colouring matter basis** (PDF page 9). FSSR minimum marker pigment and total solids are *not* the CTR contaminant test denominator. Do not borrow the unrelated lead `Food colours other than caramel`, copper `Colouring matter`, isolated dye, or titanium dioxide source values without independent proof.

Both records hold a dedicated five-part documentary positive-evidence checklist and six prohibited transfers. The resulting **partial conditional named-source route** is not confirmed applicability to any actual finished good. A qualified formal legal article determination, product identity and actual batch data are still required prior to any numeric limit assignment.

Official source: [FSSAI CTR Version IX, 03.02.2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf).

## Audit controls

Only the two exact FoSCoS product identities transition `FIRST_EXACT_SOURCE_PENDING` -> `PARTIAL_EXACT_SOURCE_MATCH`. All 531 other records are unchanged in order/content. All 36 remaining queue identities and the 78 already promoted IDs persist; 2 new promoted IDs appended. Regression tests verify 497/36 counts, exact source units and analytical bases, no lab PASS, and failure on data/identity tampering.

Files: `fssai-product-helper-preview-01/data/rules/fssai-two-fruit-cheese-colouring-foods-conditional-source-2026-10-13.json`, `fssai-product-helper-preview-01/data/rules/fssai-current-first-source-533-live-ledger-497-36-2026-10-13.json`, `fssai-product-helper-preview-01/data/rules/fssai-current-36-first-exact-source-proof-worklist-2026-10-13.json`, `fssai-product-helper-preview-01/fssai-current-first-source-497-36.js`.
