# PMSV FSSAI Helper — first-exact evidence research and cross-form metal source guards

**Review date:** 11 October 2026. **Environment:** GitHub `gh-pages` preview and GitHub Actions only. **WordPress:** unchanged.

## Scope and evidence classification

- Catalogue: **533** exact FoSCoS/FSSAI product identities.
- **410** products have at least one partial identity-specific chemical/contaminant source reference; **123** still lack a first exact source match.
- **0** full regulatory/laboratory compliance approvals.
- This round does **not** promote any of the 123 cases to verified first-exact contaminant coverage. A qualifying named source reference remains distinct from establishing product identity, effective applicability and a tested food sample.

## What this batch adds

1. **18 official Version IX Section 2.1 metal source rows** checked against the loaded `contaminants-v9-core.json` table. Their article, analyte, numeric value and mg/kg or mg/L unit are checked by regression test.
2. **31 named-article transfer and exclusion cases for 26 currently unresolved catalogue identities** across fresh/frozen/canned produce, preserved fungi, cocoa forms, coconut milk, dairy frozen confections, fat spread and vending water. Each explicitly prohibits auto-assignment of the reference limit.
3. **123 individually generated source-research worklists**, now incorporating catalogued source-qualification questions, relevant cross-form exceptions, original FSSR/FoSCoS identity, amendment checks and laboratory/matrix conditions. CSV and JSON worksheets are uploaded as GitHub Actions artifacts.
4. Separate automated test gates for all 18 source rows, all 31 scope cases and all 123 pending identity-specific worklists. A mismatch fails CI rather than creating a product compliance PASS.

## Examples of critical regulatory distinctions

| Context | Official source wording / value | Scope rule |
|---|---|---|
| Cocoa powder vs cocoa mass | Lead **5 mg/kg** on dry fat-free basis; Copper **70 mg/kg** on fat-free basis | Do not copy powder limits to cocoa beans, cocoa mass or cake by name. |
| Fruit cocktail | Lead **1 mg/kg**, specifically canned fruit cocktail | Thermally processed or frozen fruit requires positive proof of can and named product scope. |
| Mushrooms | Lead **1 mg/kg**, specifically canned mushrooms | Freezing, drying or sterilizing edible fungi is not automatically canned mushrooms. |
| Dehydrated vegetables | Lead **5 mg/kg** for dried/dehydrated vegetables other than onions; a separate **10 mg/kg** dry-matter grouping includes dehydrated onions | Determine exact article and onion/non-onion source before applying anything. |
| Ice cream | Lead **1 mg/kg** and Arsenic **0.5 mg/kg** for ice cream, iced lollies and similar frozen confections | A catalogue entry also including dried ice-cream mix cannot inherit frozen-confection limits for every subtype. |
| Dairy versus coconut | Lead **0.02 mg/kg** for Milks; concentration factor applies to partially or wholly dehydrated milks | The dairy article cannot be inherited by plant-derived coconut milk/cream/powder. |
| Vending water | Lead **0.01 mg/L** for packaged drinking water (other than mineral water) | Dispensed purified vending water is not proved to be packaged drinking water. |
| Fat spread | Lead **0.1 mg/kg** for Minarine (Low Fat Spread) | A broad fat-spread identity needs Minarine subtype verification. |

**Primary source:** [FSSAI Contaminants, Toxins and Residues Regulations Version IX (03 February 2026)](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), Section 2.1 metal tables, PDF pages 2–10. The unit or concentration basis is part of the source context, not a transferable default.

## GitHub files

- `fssai-product-helper-preview-01/data/rules/fssai-v9-31-cross-form-metal-source-nontransfer-2026-10-11.json`
- `scripts/export-fssai-next-123-source-research-queue.cjs`
- `tests/fssai-v9-31-cross-form-metal-source-nontransfer-2026-10-11.test.cjs`
- `tests/fssai-next-123-actionable-worklist-2026-10-11.test.cjs`
- `.github/workflows/verify-fssai-standard-nutrition.yml`

## Next step

Investigate the **123 still-unresolved** individually using the actionable worksheets; establish the operative named article and confirmed subtype or ingredient scope, complete amendments/pesticide/residue-definition review, then record exactly which *partial evidence* has been added. Never claim whole-product compliance based on a source article alone.

**Scope notice:** The new review tables and exported worklists are audit/research controls, not a new numerical PASS in the Helper. The live product screen's previous verified source safeguards remain active; no WordPress deployment is included.
