# PMSV FSSAI Helper — Batch 18: separate FSSR quality criteria from CTR contaminants

**Date:** 14 October 2026. **Deployment:** GitHub `gh-pages` preview only; WordPress unchanged.

## Verified official sources

- [Current FSSAI CTR Version IX](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf) — current operative contaminant article list. A generic commodity or original ingredient label does not automatically determine an as-sold processed food's exact legal article.
- [FSSR Chapter 2.11](https://fssai.gov.in/upload/uploadfiles/files/12_%20Chapter%202_11%20(Other%20food%20product%20and%20%20ingredients).pdf) §§2.11.2, 2.11.4, 2.11.7, 2.11.8: edible catechu is a heartwood aqueous extract; silver leaf has minimum 999/1000 fineness and up to 2.8 g/m² weight; carob powder is roasted pod powder with total ash requirement; soluble dextrin dietary fibre has specific chemical processing and DP 12–25. **None of these quality limits should be displayed as a CTR metal/mycotoxin limit.**
- [FSSR Chapter 2.3](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf) §§2.3.54, 2.3.63, 2.3.64: cocoa bean moldy-bean percentage is a visual defect metric, coconut milk powder has its own composition even where caseinate is used, and water chestnut flour derives from `Trapa` species and includes a separate uric acid quality criterion.
- [FSSR Chapter 2.4](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_4%20(Cereals%20and%20Cereal%20products)(1).pdf) §2.4.14: arrowroot is purified rhizome starch, not a cereal grain or the unprocessed root/tuber CTR commodity.

## Changes

1. The 24 remaining *without additional named commodity research hypotheses* are all assigned immutable ID-preserving reviewer matrix entries. This does not contradict the previously researched 3 conditional + 7 old + 1 coffee source candidates: **11 research candidates, 24 no additional candidate, all 35 still pending**.
2. Eight exact official-product identity reviews include **32 specific documentary proof requests**, explicitly separating finished-standard quality thresholds from CTR contaminants, and explicitly forbidding unsupported cross-matrix transfers.
3. The remaining sixteen retain their original Batch14-specific signed source questions instead of inventing new CTR articles.
4. Browser-only **export of the 24-case triage worklist to CSV** helps collect legal/quality documentary packets. No server upload, credentials or user identification required.
5. New source panels appear only for exact matching catalogue ID, name, FSSR and FoSCoS; tampered data, identity mismatch, approval claims and future amendment activation fail closed.
6. **533 products / 498 conditional source matches / 35 exact-first-source pending** unchanged. No new numerical CTR contaminant limits, lab analyses, total compliance passes or canonical ledger promotions. December 1, 2026 future amendment remains inactive.

## Acceptance tests

`node --test tests/fssai-current35-identity-quality-gates-batch18-2026-10-14.test.cjs`

**Important:** a standard's quality parameter (e.g., cocoa beans mould count, silver purity, ash, uric acid) is not evidence that an appropriate CTR toxic contaminant limit or pesticide residue MRL has been selected or complied with.
