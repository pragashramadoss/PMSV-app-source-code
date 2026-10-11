# PMSV FSSAI Helper — 533-product current-status consolidation & Chapter 2.3 official-version reconciliation

Date: **11 October 2026**. Branch: `gh-pages`.

## Current inventory: first-source evidence, not regulatory compliance

| Measure | Count |
| --- | ---: |
| Catalogue identities | **533** |
| At least one partial exact-source contaminant / toxin / residue article | **417** |
| No first exact-source article verified yet | **116** |
| Full finished-product compliance approvals | **0** |

These are the most recent source-status counts. They **supersede** historical 412/121 and 415/118 checkpoints without rewriting historical evidence datasets. The five source-positive identities moved out of the original 121-product gap queue are two food-composite Ayurveda products, one 'Other Foodgrains' product and two rabbit-meat products. Older review queues remain archived and source-qualified; they must **not** be interpreted as the current number of pending products.

## New product-specific live status coverage

`fssai-product-helper-preview-01/data/rules/fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json` lists all **533 IDs**, with exact FoSCoS identity/FSSR/FCS, current first-source status, evidence provenance, review group and explicit no-compliance flags.

The active `fssai-source-proof-panels.js` module fetches and authenticates the current ledger (catalogue count, exact product identity, source version and 116/417 balance). Each product receives a read-only source status. In source failure or identity mismatch, no compliance conclusion is inferred. It is independent of user-supplied laboratory data and does not silently convert ingredient-level references into finished-product limits.

**116 current pending products are preserved in four nonoverlapping review cohorts:**
- 20 fungi/fruit/tomato subtype cases.
- 14 sugars/processed eggs/confectionery subtype cases.
- 56 cross-form exclusion cases.
- 26 residual individually scoped conditions.

Each cohort has documented official-source applicability checks. Reviewing an item does not clear its first-source gap. No new first-source promotions were made in this round.

## Version 2 (04.11.2024) Chapter 2.3 source check

Two existing quality/purity entries were checked against FSSAI **Chapter 2.3 — Fruit and Vegetable Products, Version 2 (04.11.2024)**. Their primary source URLs and version metadata have been corrected from the older chapter publication. Their numerical requirements did not change.

**FSSR 2.3.65 Colouring Foods**: the official definition specifies aqueous extraction from ordinarily consumed fruits, vegetables, spices or herbs, with *no selective extraction of pigments*, and retention of characteristic food properties. Finished **liquid** colouring foods have total solids **≥45 g/100g**, marker pigment **≥0.5%**, and added nutritive sugar **≤20%**. Finished **powder** colouring foods have total solids **≥90 g/100g** and marker pigment **≥1%**. The liquid nutritive-sugar limit is not indiscriminately copied to powder. Appendix A food-colour additives, and the CTR heavy-metal article 'Food colours other than caramel', are **not automatically equated** with colouring food ingredients without a separately proved legal matrix match.

**FSSR 2.3.64 Water Chestnut Flour (Singhare Ka Atta)**: the official numeric quality table gives moisture **≤12%**, alcoholic acidity as H2SO4 on dry basis **≤0.18%**, acid-insoluble ash **≤0.5%**, and dry-basis protein **≥9%**. The separately listed **uric acid 100 mg/kg** has no explicit operator in the displayed source table; PMSV therefore preserves it as a reference without inventing a 'maximum' or sample compliance result.

References:
- FSSAI Chapter 2.3, Version 2 (04.11.2024): https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf
- FSSAI Contaminants, Toxins and Residues, Version IX (03.02.2026): https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf
- Official standardized product list: https://foscos.fssai.gov.in/standard-product

## Regression tests

New integrated regression test `tests/fssai-current-533-417-116-source-ledger-and-2024-quality-2026-10-11.test.cjs` checks:
1. Conservation across all 533 FoSCoS identities.
2. Exactly 116 unresolved from historic 121 less the five independently source-positive products.
3. Exact partition across 20 + 14 + 56 + 26 current pending identities.
4. No numeric/lab/compliance PASS flags on any of the 533 products.
5. Actual Helper rendering for all 533 products and fail-closed version/identity tampering.
6. Updated November 2024 FSSR clause identity and variant-specific numerical quality baselines.
7. Preserved original historical source panels and no misleading status when a new ledger has not yet loaded.

**WordPress remains unchanged.** GitHub Pages continues to publish the independent Helper files.
