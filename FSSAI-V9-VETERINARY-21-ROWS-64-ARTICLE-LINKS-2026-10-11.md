# PMSV FSSAI Helper — 21 official veterinary rows / 64 product-article links

Date: 11 October 2026. Branch: `gh-pages`.

## Scope and evidence

Twenty named FSSAI Version IX §2.3.2 veterinary tolerance rows for **all edible animal tissues** (or all edible animal tissues other than fish), plus one separately named `Virginiamycin / Poultry and egg` row, are source-checked against the existing current FSSAI database. The 20 edible-tissue rows each carry **0.01 mg/kg**. They are separate analytes and must never be combined into one tolerance limit.

**Product mapping (7 catalogue identities; 64 links):**

| Finished identity / group | Product count | Named source-row links | Regulatory decision |
| --- | ---: | ---: | --- |
| Rabbit meat, fresh/chilled and frozen (FSSR 2.5.2(6)) | 2 | 40 (20 per product) | Direct edible rabbit tissue scope — *partial source evidence only*. Two Xylazine links were already source-backed; this extends each of those two products to 20 veterinary analytes (38 additional source links). |
| Animal casings (FSSR 2.5.2(14)) | 1 | 20 | Conditional tissue-class candidate. Actual edible prepared casing, animal tissue identity, species, processing, sampling and treatment-specific applicability must be demonstrated. **Do not automatically assign limits.** |
| Egg powder, frozen egg products, liquid egg products and pickled eggs (FSSR 2.5.3(2–5)) | 4 | 4 | `Virginiamycin / Poultry and egg` 0.01 mg/kg is a research reference only. Pasteurised, frozen, powdered or pickled finished egg applicability has not been established. **Do not apply as a finished-product limit without evidence.** |

## Legal definitions and safeguards

The current official FSSR Chapter 2.5 Version 4 (01.08.2025) defines rabbit as a food animal, rabbit meat as edible carcass parts/offal, and animal casings as cleaned, salted or dried intestines, oesophagus or urinary bladder. Processed casings **must not automatically** be equated with direct edible-tissue MRL testing.

The current official Version IX §2.3.2 veterinary table, serials 1–49, distinguishes universal edible-tissue tolerances from species- or matrix-specific tissue values. Do not transfer cattle/sheep/goat/pig/poultry/egg-specific limits to rabbit or to other matrices.

The standards and named references are not evidence of laboratory compliance. Measured results, validity of applicable amendments, exact sampling basis, metal/other pesticide and veterinary residues, other naturally occurring toxins, microbiological standards and all regulatory tests remain open.

## Source and code audit

- Product standard: https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_5_Meat%20and%20Meat%20products%281%29.pdf
- Version IX source: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf
- Dataset: `fssai-product-helper-preview-01/data/rules/fssai-v9-21-vet-article-source-64-links-2026-10-11.json`
- Helper evidence UI: `fssai-product-helper-preview-01/fssai-source-proof-panels.js`
- Regression suite: `tests/fssai-v9-veterinary-21-rows-64-article-links-2026-10-11.test.cjs`

## Current first-source position

**533 total / 417 with partial first-source evidence / 116 without a first exact-source match / zero complete regulatory approvals.**

This batch does **not** change that inventory; it increases valid evidence depth for the previously matched rabbit products while preserving the pending status of casings and processed eggs. WordPress was not changed.
