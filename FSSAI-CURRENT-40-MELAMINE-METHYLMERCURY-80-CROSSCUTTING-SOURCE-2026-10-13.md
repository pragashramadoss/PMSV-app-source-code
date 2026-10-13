# PMSV FSSAI Helper — 40 current products, 80 additional cross-cutting CTR source checks
Date: 13 October 2026. GitHub `gh-pages` evaluation only; **WordPress unchanged**.

## Official source and article distinctions

Official [FSSAI Contaminants, Toxins and Residues Regulations, Version IX (03.02.2026)](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf):

- §2.5.1, PDF **p.51**: Melamine — **Powdered infant formula 1.0 mg/kg**, **Liquid infant formula 0.15 mg/kg**, **Other foods 2.5 mg/kg**. These are **three distinct statutory articles**, not interchangeable.
- §2.1.1, PDF **p.12**: Methyl Mercury (calculated as the element) — **All foods 0.25 mg/kg**. This is a methylmercury-specific row, not permission to substitute **total mercury** analysis.
- §2.1.1 also lists specific metals and conditional "Foods not specified" metal rows; screen named legal articles first. **Other foods** in melamine does not license indiscriminate inheritance of an unrelated named metal, toxin, or pesticide article.

## What changed

Added **40 exact identity-matched review records**, each holding its original product identifier, FoSCoS/FSSR information, legal food/article distinction, original remaining proof question, individual check for melamine Other foods versus infant formula, and methylmercury species-specific analytical requirement. The four real official source rows are linked to the original FSSAI PDF. These create **80 additional individual conditional legal source comparisons** (melamine Other foods + methylmercury All foods), and **80 infant-formula nontransfer decisions** (two infant articles × 40). All 40 panels render within the existing product review interface, with numeric values labeled **source comparison / conditional**, not automatically applied compliance thresholds.

Special guard: formulated supplements for children aged above 24–36 months must not inherit infant formula thresholds just because they target children; chemistry/additive and Ayurveda routes must first establish the legally regulated finished article; a milk-derived food is not automatically infant formula.

## Baseline preserved

| Field | Value |
|---|---:|
| Catalogued identities | 533 |
| Conditional partial *named* contaminant-source routes | 493 |
| Exact named finished-article source routes pending | 40 |
| New named first-source promotions | 0 |
| Auto-assigned finished product numeric limits | 0 |
| Verified actual lab results and full regulatory passes | 0 |

Data: `fssai-product-helper-preview-01/data/rules/fssai-current40-melamine-methylmercury-2026-10-13.json`. UI: `fssai-product-helper-preview-01/fssai-current40-melamine-methylmercury-2026-10-13.js`. Integrity test: `tests/fssai-current40-melamine-methylmercury-2026-10-13.test.cjs`. CI: `.github/workflows/verify-fssai-pending-40-quality-coverage.yml`. Record checksum guards against accidental changes; it is not an independent regulatory authentication or a test result.
