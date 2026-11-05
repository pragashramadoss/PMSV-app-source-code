# PMSV R36 - Ayurveda ingredient CTR source reference crosswalk

4 November 2026 | Draft audit branch only | No whole-product regulatory approvals

| Review metric | Count |
|---|---:|
| PMSV catalogue identities | 533 |
| Original finished-product CTR article holds | 137 |
| Ayurveda Category A recipes | 9 |
| Original printed ingredient rows | 46 |
| Ingredient rows with one or more source references | 22 |
| Distinct referenced CTR table or regulatory statement rows | 22 |
| Ingredient-to-source reference links | **67** |
| Method-only 15.1 pulse variants (not additional original ingredients) | 2 |
| Source recipe text holds (14.6 and 14.7) | 2 |
| New whole-product regulatory approvals | **0** |

## Source references verified against CTR IX

| Reference | Named food article | Limit / restriction | Source PDF page |
|---|---|---|---:|
| MILK_LEAD | Milks (concentration factor for partially/wholly dehydrated milks) | 0.02 mg/kg | 5 |
| MILK_AFM1 | Milk (Liquid) | 0.5 ug/kg | 14 |
| MILK_24D | Milk and Milk products | 0.05 mg/kg | 16 |
| CEREAL_LEAD | Cereal grains, except buckwheat, canihua and quinoa | 0.2 mg/kg | 3 |
| CEREAL_TOTAL | Cereal and cereal products | 15 ug/kg | 14 |
| CEREAL_B1 | Cereal and cereal products | 10 ug/kg | 14 |
| RICE_24D | Food grains: Rice | 0.1 mg/kg | 16 |
| RICE_ACEPHATE | Rice | 1 mg/kg | 16 |
| BARLEY_OTA | Wheat, wheat bran, rye, barley, coffee | 5 ug/kg | 15 |
| BARLEY_DON | Wheat, wheat bran, barley | 1000 ug/kg | 15 |
| PULSE_LEAD | Pulses | 0.2 mg/kg | 5 |
| PULSE_TOTAL | Pulses | 15 ug/kg | 14 |
| PULSE_B1 | Pulses | 10 ug/kg | 14 |
| MUSTARD_PARATHION | Mustard seed or Mustard oil | 0.01 mg/kg | 30 |
| MUSTARD_CRUDE_LEAD | Vegetable Oils, crude, including mustard seed oil | 0.1 mg/kg | 6 |
| MUSTARD_EDIBLE_LEAD | Vegetable Oils, edible, including mustard seed oil | 0.1 mg/kg | 6 |
| HONEY_ANTIBIOTIC_BAN | Honey production | no antibiotic use permitted | 40 |
| HONEY_CHLOR_MRPL | Honey | 0.3 ug/kg | 40 |
| SUGAR_WHITE_LEAD | Refined white sugar, sulphated ash not exceeding 0.03 percent | 0.5 mg/kg | 2 |
| SUGAR_HIGH_ASH_LEAD | Sugars/syrup/coloured sugar, sulphated ash exceeding 1.0 percent | 5 mg/kg | 2 |
| TURMERIC_LEAD | Turmeric whole and powder | 10 mg/kg | 6 |
| FOOD_SALT_LEAD | Salt, food grade | 2 mg/kg | 6 |

## Recipe and source counts

| Recipe | Ingredient rows | Source references | Status |
|---|---:|---:|---|
| 12.1 | 6 | 7 | reference only; no legal PASS |
| 13.1 | 8 | 10 | reference only; no legal PASS |
| 14.1 | 1 | 3 | reference only; no legal PASS |
| 14.3 | 2 | 3 | reference only; no legal PASS |
| 14.4 | 3 | 8 | reference only; no legal PASS |
| 14.5 | 5 | 10 | reference only; no legal PASS |
| 14.6 | 13 | 12 | source title/method HOLD |
| 14.7 | 4 | 5 | source title/method HOLD |
| 15.1 | 4 | 9 | reference only; no legal PASS |

## Important qualifications

- Milk Lead 0.02 mg/kg states a concentration factor for partially or wholly dehydrated milks. Liquid milk aflatoxin M1 0.5 ug/kg cannot automatically be assigned to concentrated or cooked composite recipes.
- Barley is named for Ochratoxin A 5 ug/kg and DON 1000 ug/kg; cereal and pulse aflatoxins have different raw article/source conditions. Processing and food-containing-commodity legal article selection still matter.
- Rice 2,4-D is specified as 0.1 mg/kg in the Rice subentry of Food grains; milled food grains have a different value. Acephate Rice residue definition includes methamidophos and acephate.
- Methyl parathion Mustard seed or Mustard oil is 0.01 mg/kg with the named combined-residue definition; edible versus crude mustard oil lead articles require identity review.
- Honey antibiotic use is prohibited in production. Honey chloramphenicol 0.3 ug/kg is MRPL for misuse surveillance and never permission to use antibiotics.
- Refined white sugar Lead 0.5 mg/kg applies only when sulphated ash does not exceed 0.03 percent; high-ash sugar Lead 5 mg/kg requires strictly more than 1.0 percent sulphated ash. Generic Sharkara does not settle either article.
- The 15.1 recipe permits Mudga or Masha instead of barley. Two variant rows are separately listed and not counted among 46 printed ingredient rows.
- 14.6 and 14.7 remain under title-versus-method source-document alignment hold. Official Ayurveda PDF page screenshots were not reliably retrievable, so no correction of the source is assumed.
- These are 67 source references, not 67 verified final-product requirements. Exact ingredient species, current legal article, methods, residues, test results and full current-law analyte panel remain unverified.
- No production rules, product master, commercial release fields, or deployed application were changed.

Official CTR IX: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf
Official Ayurveda recipes: https://fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf

Machine-readable 46-ingredient register: ayurveda-ingredient-ctr-crosswalk-r36-2026-11-04.json
