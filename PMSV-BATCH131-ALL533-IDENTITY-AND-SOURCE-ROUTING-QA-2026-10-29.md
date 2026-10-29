# PMSV Batch131 — full 533-catalogue identity and source-routing QA

**Date:** 29 October 2026  
**Scope:** all 533 original FSSAI Helper catalogue rows, including the 498 conditional first-source references and the 35 completed-public-research/commercially-HELD cases.

## Batch-wide independent mechanical findings

| Data field / routing signal | Review finding | Interpretation |
|---|---:|---|
| Unique original catalogue IDs | **533** | No duplicate stable IDs |
| Conditional first-source records | **498** | Regulatory reference only; not certification |
| Previously public-source-researched / commercially HELD records | **35** | Historic ledger still labels these FIRST_EXACT_SOURCE_PENDING; Batch88 researched all 35 and closed desk stage |
| No FSSR code stored in source ledger | **86** | Mapping gap/blank field for review; **not** proof there is no applicable FSSR |
| No FoSCoS code stored in source ledger | **10** | Mapping gap/blank field for review; **not** proof there is no applicable FoSCoS classification |
| Exact product name repeats under multiple unique IDs | **14 rows / 4 groups** | May be legitimate cross-category product names; do not auto-merge |
| Distinct catalogue rows with any of the above three flags | **102** | Deduplicated review queue |
| Rows with none of these three *mechanical* flags | **431** | Does not imply legal/regulatory compliance |
| Signed product-specific limits, approved method/matrix, original lot CoAs, passes or releases | **0** | All formal commercial compliance controls remain unchanged |

The four repeated-name groups are:
1. Analogue in the dairy context — eight distinct catalogue IDs;
2. Frozen desserts or confections with added vegetable oil/fat or vegetable protein — two IDs;
3. Papad — two IDs;
4. Canned or retort pouch meat products — two IDs.

## Implementation

- Read-only [Batch131 interactive all533 review](./fssai-product-helper-preview-01/pmsv-batch131-533-identity-qa.html) with search, filters for each flag and source status, 50-row paging, and safe CSV export.
- Source ledger pinned digest `d142be820899eac5`; 35-case research closeout pinned digest `4d1590738e747a2a`. On source mismatch, no rows or CSV are displayed.
- The original 533-row and 35-case source files remain **unchanged**. No inferred FSSR/FoSCoS codes are written and no duplicated category labels are merged.
- No external messages, confidential documents, lot releases or regulatory approvals are generated.
- Automated regression `tests/pmsv-batch131-533-identity-source-qa.test.cjs`; workflow `.github/workflows/verify-pmsv-batch131-533-identity-qa.yml`.

**Recommended owner action:** Verify each of the 102 flagged catalogue records against its actual standardized product definition, marketed form and official FoSCoS/FSSR classification before correcting a stored code. Source status, allowable limits, accredited methods, product PASS and lot release must remain separate decisions.

**Legal source reminder:** FSSAI CTR Version IX 3 February 2026 and CTR amendment notified May 2026 effective 1 December 2026 require original-text and applicability review. No product-specific legal conclusion is made by this data-quality audit.
