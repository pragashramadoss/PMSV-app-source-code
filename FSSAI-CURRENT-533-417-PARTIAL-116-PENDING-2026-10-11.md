# PMSV FSSAI Helper — Current 533 / 417 / 116 source reconciliation (11 October 2026)

## Source status (current)
- FSSAI/FoSCoS standardized catalogue: **533** product identities.
- Products with some exact-source contaminant evidence: **417**.
- Products still awaiting a first exact-source contaminant match: **116**.
- Complete finished-product compliance approvals or laboratory PASS decisions: **0**.
- Prior source checkpoint: 415 partial / 118 pending. The historical 412/121 and 415/118 review manifests remain **archival** and should not be reported as the latest inventory.

## Newly source-matched first-source identities (2)
1. `08-08-1-fresh-or-chilled-rabbit-meat` — Fresh or Chilled Rabbit meat.
2. `08-08-2-frozen-rabbit-meat` — Frozen Rabbit meat.

**Regulatory proof:** FSSR Meat and Meat Products Version 4 (01.08.2025) §2.5.2(6) expressly identifies fresh, chilled, and frozen meat of domestic rabbits (`Oryctolagus cuniculus`) as edible carcasses, cuts, and offals. The official Contaminants, Toxins and Residues Regulations Version IX (03.02.2026), veterinary tolerance table §2.3.2, serial 48, states **Xylazine 0.01 mg/kg** for **all edible animal tissues except in fish; fats derived from animal tissues**. Rabbit tissue is a positive legal scope match; the product need not be goat/sheep/cattle meat. This is one source-specific veterinary residue per product, **not** a complete residue panel or an automatic measurement or compliance approval.

The pre-existing Lead lock remains: **no automatic species-specific Rabbit Meat Lead article** and no unverified product family inheritance. Other veterinary residues, pesticides, sampling, applicable amendments, analytical verification, quality and microbiological criteria remain outstanding.

Official sources:
- Product definition: https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_5_Meat%20and%20Meat%20products%281%29.pdf
- Veterinary article: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf

## Newly reviewed final 28 of historical 118 gaps
- The last 28 previously unhandled identities were individually reconciled against existing FSSR/FoSCoS identity evidence.
- Two rabbit identities now have the positive first-source reference above.
- The other 26 have specific missing finished-food identity, stereochemical, packaging, botanical, process or analyte-scope proof requirements and remain unresolved.
- All historical 118 first-source gaps have now been included in the recently added research-review datasets: prior 20 fungi/fruit/tomato + 14 sugar/egg/confectionery + 56 cross-form + these final 28 = 118 distinct identities. **Review coverage is not source-resolution coverage.**

## Reproducible GitHub verification
- `scripts/audit-fssai-current-417-116-and-rabbit-veterinary-first-source-2026-10-11.cjs`
- `tests/fssai-current-417-116-rabbit-first-source-and-28-remaining-ui-2026-10-11.test.cjs`
- `fssai-product-helper-preview-01/data/rules/fssai-28-final-remainder-and-two-rabbit-veterinary-first-source-2026-10-11.json`
- `fssai-product-helper-preview-01/fssai-source-proof-panels.js`
- GitHub Actions automatically writes `audit-output/fssai-current-first-source-533-reconciliation-v2.json` and uploads it as an audit artifact.

The Helper fails closed on missing official data, changed source table, or mismatched product identity. It displays the two positive references separately from lab PASS and hides the superseded historical research-pending panel for those rabbit identities after current source authentication. **WordPress was not changed.**
