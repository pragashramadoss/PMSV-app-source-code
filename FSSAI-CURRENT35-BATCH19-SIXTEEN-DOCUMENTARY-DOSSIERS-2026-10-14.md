# PMSV FSSAI Helper — Batch19 (14 October 2026)

Scope: GitHub `gh-pages` preview **only**. WordPress unchanged.

## Exact remaining sixteen

- The 16 cases left at Batch18's original documentary-only worklist stage now each have a separate official identity finding, product-specific forbidden contaminant-source transfer, and four documentary proof questions.
- **64 case-specific documentary gates**, 16 product panels and a local CSV evidence-request export. The 8 in-depth Batch18 product dossiers remain separate.
- **Trehalose updated source**: [FSSR Chapter 3, §3.3.4](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%203_Substances%20added%20to%20food.pdf) clarifies GMP use except infant food, loss on drying ≤1.5%, total ash ≤0.05%. Prior pre-2021 permitted food-category percentage tables are superseded; total ash is not a CTR contaminant metal limit.
- **Dry cocoa+sugar mixture**: [FSSR 2.7.6](https://www.fssai.gov.in/upload/uploadfiles/files/8_%20Chapter%202_7%20%28Sweets%20%26%20Confectionary%29.pdf) defines sweetened cocoa and cocoa powder fractions; moisture maximum 7% of finished product. Cocoa powder-specific lead/copper analytics cannot transfer to sweetened composite automatically.
- FoSCoS exact listings and grouped categories: [official standardised products](https://fcstraining.fssai.gov.in/standard-product) list polyols 11.6, Sajji Khar/trehalose/additives 99.1, enzymes 99.2 and functional ingredients 99.7. These are not self-proving source articles for all their constituents.
- Other documented blocks: vending water vs packaged water, cocoa mass/cake, high-ash dried glucose, misri ash types, salt substitutes, royal jelly vs honey, Narikela Ksheerika and Ksheerapaka vs raw milk.

**Contaminants:** [current FSSAI CTR IX](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf). No source promotion from mere ingredient similarity or chemical family. Signature validation and exact catalogue identity required before the new panels display.

## Verification
Run `node --test tests/fssai-current35-sixteen-dossier-gates-batch19-2026-10-14.test.cjs` and `node --check fssai-product-helper-preview-01/fssai-current35-sixteen-dossier-gates-batch19-2026-10-14.js`.

**Ledger unchanged:** 533 total / 498 conditional partial / 35 exact first-source pending; zero active new contaminant limits, official sign-offs, lot PASS, full food compliance PASS. December amendment effective 01.12.2026 not activated in October.
