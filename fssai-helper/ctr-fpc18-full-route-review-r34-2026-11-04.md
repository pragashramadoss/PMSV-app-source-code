# PMSV R34 — Full FPC18 directive routing, Annexure II and evidence-based review

**4 November 2026 · Audit branch only · No product legal approval or production deployment.**

## What was resolved

Earlier R21 verified six Food-not-specified metal source rows for eligible Indian Sweets/Indian Snacks & Savouries but did not provide the actual per-category Annexure II additive route or an executable safe evidence gateway. R34 connects **12 real PMSV Food Category 18 identities** to the official 2021 order's category descriptions, additive-category mappings and base-product testing requirements.

| Audit check | Value |
|---|---:|
| Whole PMSV catalogue preserved | 533 |
| Earlier exact CTR article applicability holds (unchanged) | 137 |
| Actual FPC18 category identities fully routed for source screening | 12 |
| Metal names in FPC18 directed Foods-not-specified article | 6 |
| 12 × 6 per-category reference occurrences (not 72 new rules) | 72 |
| Additional, independent all-food methyl-mercury article | 1 |
| Product legal approvals, finished CTR panels and commercial releases | **0** |

## Official directive clauses that must all be respected

- **Paragraph 3:** FPC18 is excluded if the food is already standardized and mapped to FPC01–14. A product name/category code alone does not confirm eligibility.
- **Paragraph 4(b), Annexure II:** Indian sweets and Indian savouries point to different additive categories. Specific additive/INS permissions, GMP conditions and current amendments still require checking.
- **Paragraph 4(f):** Qualifying FPC18 foods follow Foods not specified under the Contaminants, Toxins and Residues regulations for heavy metals and pesticides.
- **Paragraph 4(g):** Appendix B microbiological requirements follow the actual base food materials (e.g., milk for milk sweets), not a made-up all-sweets default.
- **Paragraph 4(h):** Aflatoxins, DON and naturally occurring toxic substances follow the raw/base products actually in the recipe.
- **Paragraph 4(i):** FPC18 was introduced for licensing. Its horizontal mapping to established categories is not proof that all product-specific standards have been met.

## Category-to-additive source crosswalk (Annexure II; not an additive approval)

| PMSV FPC | Product group | Annexure II FSSR mapping | Annexure/page | Typical base-product evidence to obtain |
|---|---|---|---|---|
| 18.1.1.1 | Khoa Based Sweets | 1.7 | Table 1, page 7 | milk; khoa |
| 18.1.1.2 | Chhana based Sweets | 1.7 | Table 1, page 7 | milk; chhana |
| 18.1.1.3 | Fermented milk products based Indian Sweets | 1.7 | Table 1, page 7 | fermented milk products |
| 18.1.1.4 | Other composite milk products based Indian Sweets | 1.7 | Table 1, page 7 | milk; cereal or nut ingredients when actually present |
| 18.1.2.1 | Cereal based Sweets | 6.5 | Table 1, page 7 | cereal grains; grain flour |
| 18.1.2.2 | Pulses based Sweets | 6.5 | Table 1, page 7 | pulses; pulse flour |
| 18.1.2.3 | Starch based Sweets | 6.5 | Table 1, page 7 | starch |
| 18.1.3 | Dry Fruit and nuts based Sweets | 15.2 | Table 1, page 7 | dried fruits; nuts |
| 18.1.4 | Indian Confections | 5.2.3, 15.1 | Table 1, page 7 | sugar; jaggery; nuts or seeds if in actual recipe |
| 18.1.5 | Fruit and Vegetables based Sweets | 4.1.2.9, 4.2.2.6 | Table 1, page 7 | fruit; vegetables including roots/tubers |
| 18.2.1 | Cereal or pulses flour/ Starch based snacks & savouries | 15.1, 6.3, 6.7 | Table 2, page 8 | cereal; pulses; starch; other actual components |
| 18.2.2 | Fruit and vegetable based snacks & savouries | 15.1 | Table 2, page 8 | fruit; vegetables |

## Directed current metal source articles

| Analyte | Foods not specified reference (ppm) | CTR IX PDF page |
|---|---:|---:|
| Lead | 2.5 | 4 |
| Copper | 30 | 7 |
| Arsenic | 1.1 | 9 |
| Tin | 250 | 11 |
| Cadmium | 1.5 | 12 |
| Mercury | 1 | 12 |

**Separately:** Methyl mercury (calculated as element), All foods: 0.25 ppm (CTR IX PDF p.12), already captured globally and not counted as a seventh Foods-not-specified metal row.

These are **source-table reference values only**, not proof of the right final sample matrix, correct method, applicable original Gazette and product results. Specific pesticide MRL status must be resolved; the 0.01 mg/kg fallback cannot be inferred merely because a product-specific MRL has not been found in the review.

## Safety improvement delivered

The independent `fpc18-evidence-gate-r34-20261104.mjs` accepts one exact catalogue ID and an actual SKU evidence bundle. It explicitly blocks false eligibility (including standardized foods belonging to FPC01–14), incomplete additives/microbiology/ingredient toxin/pesticide/metal review, invalid dates and post-1 December 2026 CTR amendments until revalidated. It **never returns a whole-product PASS**, even if every evidence input is true; it returns source-route review readiness only, followed by independent legal sign-off and product analytical evidence.

The existing product master, operative numerical contaminant rules and production `gh-pages` are unchanged; draft PR #2 remains unmerged. CI regression tests check all 12 actual category mappings, 533 retained IDs, six source values and fail-closed outcomes.

## Official references

- [FSSAI Section 16(5) direction, 19 July 2021, pp.1–8](https://www.fssai.gov.in/upload/advisories/2021/07/60f6a6554438dDirection_Indian_Sweets_Snacks_20_07_2021.pdf)
- [FSSAI CTR Compendium Version IX, 3 Feb 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf)

Complete 12-product crosswalk: `ctr-fpc18-full-route-evidence-r34-2026-11-04.json`. Source-only router: `fpc18-evidence-gate-r34-20261104.mjs`.
