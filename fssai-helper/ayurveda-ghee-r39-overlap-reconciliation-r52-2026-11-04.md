# PMSV R52 — Duplicate R39 ghee evidence reconciled

**4 November 2026 | No legal product PASS, no operative regulation change.**

Two different R39 files on the draft branch concern the **same four** Ayurveda ghee ingredient occurrences, so their results must **not** be added as though eight unique ingredients were verified. The canonical R39 covers **Carbendazim and Carbofuran**, while the supplementary R39 covers **Carbofuran and Phorate**.

| Reconciliation check | Count |
|---|---:|
| Distinct original ghee ingredient occurrences | **4** |
| Pesticide source examples across both documents, without deduplication | 4 |
| Distinct cited source examples after removing duplicate Carbofuran | **3** |
| Naively summed ingredient-source links | 16 |
| Actual deduplicated cross-file ghee ingredient-source links | **12** |
| Supplementary-only unique Phorate example links not in canonical R39 | **4** |
| Established R40 canonical raw ingredient source links | **94** |
| Potential deduplicated total if those four supplemental example links are explicitly incorporated | **98** |
| Established R40 ingredient occurrences still lacking CTR source candidates | **14** |
| Original finished-product CTR legal article decisions remaining open | **137** |
| Full legal product approvals | **0** |

**Use 94 as the present canonical R40 reference count.** The theoretical **98** reflects inclusion of four supplementary Phorate references and is **not** a newly verified full regulatory requirement set. Both sets of examples remain conditional, not automatically applicable to the actual ghee, any cooked recipe or a commercial finished food.

## Verified printed source examples

| Pesticide | Source food article | CTR Version IX printed MRL | 1-based PDF page |
|---|---|---:|---:|
| Carbendazim | Milk and Milk products | 0.1 mg/kg (F) | 19 |
| Carbofuran, sum including 3-hydroxy carbofuran | Milk and Milk products | 0.05 mg/kg, fat basis | 19 |
| Phorate, sum of printed oxidized residues | Milk and Milk products | 0.05 mg/kg (F) | 33 |

The official CTR PDF page **39** states **F = Maximum Residue Limit Calculation on Fat Basis**. All source references have a separate legal article, sample matrix, residue-definition, method, full pesticide panel and amendment-currentness hold. A different printed expression of the same analyte must not be treated as an additional independent regulatory limit.

This check preserves existing R40 counts (**32/46 ingredient occurrences with some source reference, 14 without**), the original **137 open product article decisions**, and recipe **14.6** title/table/method source hold. No changes were made to deployed PMSV, numerical rules, original source registers or commercial release fields. PR #2 remains a draft.

Official source: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf (PDF pp. 19, 33, 39 visually inspected).
