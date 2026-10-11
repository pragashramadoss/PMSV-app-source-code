# PMSV FSSAI Helper — 11 sugar and syrup sulphite source dispositions (11 October 2026)

## Strict scope and source
- **Official FSSAI Appendix A, Version 3 (01 August 2025), Table 11 — Sweeteners including honey:** https://fssai.gov.in/upload/uploadfiles/files/Appendix%20A%284%29.pdf (PDF pp. 264–266, zero-based indexing).
- **Current-source machine mirror:** `fssai-product-helper-preview-01/data/rules/appendix-a-v3-core.json`.
- **Identity catalogue:** `fssai-product-helper-preview-01/data/standard-search-index-v1.json`.
- **Dedicated 11-product source checks:** `fssai-product-helper-preview-01/data/rules/fssai-sugar-sulphites-appendix-a-v3-2026-10-11.json`.

The Chapter 2.8 product clause and FoSCoS category are different routing objects. Every entry below was checked against its actual catalogue ID, product name, FSSR chapter key, and FCS. **Additive maximum permission is not the same thing as an automatically applicable heavy-metal, pesticide or chemical-residue contaminant specification.**

## Exact finished-product sulphite evidence — TWO newly partial

| Product | FSSR | FCS | Exact source and disposition |
|---|---|---|---|
| Gur or Jaggery | 2.8.4(1) | 11.1.6 | Appendix A 11.1.6 explicitly says sulphite residue **not to exceed 50 mg/kg in the end product**. First exact residue evidence; no compliance PASS. |
| Cane jaggery or cane gur | 2.8.4(2) | 11.1.6.1 | Appendix A names Cane Jaggery/Gur as child 11.1.6.1 below parent 11.1.6; parent **50 mg/kg end-product sulphite residue** applies subject to existing rule and current amendments; no compliance PASS. |

## Nine additional identity/permission checks — NO first contaminant evidence assigned

| Identity | FSSR | FCS checked | Appendix A source status |
|---|---|---|---|
| Icing Sugar | 2.8.1(6) | 11.1.2 | SULFITES **20 mg/kg**, additive permission with applicable notes, not a CTR metal/pesticide limit. |
| Khandsari Sugar | 2.8.1(3) | 11.1.3 | **150 mg/kg** sulphites only for the correct sulphur-sugar form; **Khandsari (desi) has no additives permitted**. Do not merge forms. |
| Bura Sugar | 2.8.1(4) | 11.1.3 | SULFITES **150 mg/kg**, category additive provision only. |
| Dried Glucose Syrup | 2.8.7 | 11.1.3.1 | **20 mg/kg** in narrower category for manufacture of sugar confectionery; intended end use must be verified. |
| Plantation White Sugar | 2.8.1(1) | 11.1.5 | SULFITES **70 mg/kg**, additive provision only. |
| Cube Sugar | 2.8.1(5) | 11.1.5 | SULFITES **70 mg/kg**, no assumption of a related ash-conditioned Lead article. |
| Misri | 2.8.2 | 11.1.5 | SULFITES **70 mg/kg**, no assumed separate metal panel approval. |
| Golden Syrup | 2.8.6 | 11.3 | **70 mg/kg** for sugar solutions and syrups; **do not inherit the distinct 11.1.3.2 = 20 mg/kg** sugar-confectionery glucose-syrup provision without demonstrated use/form equivalence. |
| Edible Lactose | 2.1.20 | 11.1.4 | **No additives permitted**; this does not demonstrate zero contaminants or safety PASS. |

## Audit reconciliation and safeguards

| Measure | Prior live | New verified live |
|---|---:|---:|
| Local standardized/FoSCoS product identities | 533 | 533 |
| Partial exact-product evidence (not full compliance) | 407 | **409** |
| Lacking first exact contaminant / chemical residue evidence | 126 | **124** |
| Complete product contaminant/pesticide compliance verified | 0 | **0** |

- `scripts/audit-fssai-product-readiness.cjs` registers precisely two new source-verified finished-product sulphite residue evidence kinds. None of the other nine Appendix A additive permissions is promoted to contaminant clearance.
- `scripts/audit-fssai-evidence-ledger-conservation.cjs` checks exclusive membership in live 409/124 categories, confirms both were present in the historical 126 queue, and preserves prior 136-case audit history.
- `fssai-product-helper-preview-01/index.html` shows the exact residue only when both the input product identity and current Appendix A data pass source-integrity checks. Missing, mismatched or edited source numbers are **withheld**. Other nine sugar rules display as *ADDITIVE PERMISSION ONLY — NOT A CONTAMINANT MRL*.
- `tests/fssai-appendix-a-11-sugar-sulphites-regression.test.cjs` covers all 11 identity locks, two genuine residue provisions, no-additive subtype, wrong FCS, tampered source and no compliance PASS.
- The `2026-10-10` 126-product review and its large conditional named-article gate register remain **dated historical source review records**, not the current live count. Do not edit their old counts to erase provenance.

**Validation:** GitHub Actions `Verify PMSV FSSAI standard nutrition` run [38111941261](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/38111941261) reports **517 tests passed / 0 failed**; generated first-source ledger: **533 = 409 + 124**. GitHub Pages release run [38111941125](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/38111941125) succeeded.

**Remaining work:** For the 124 unresolved identities, continue individual exact official Version IX, standard, pesticide commodity, veterinary, chemical residue and operative-amendment source matching. Products do not become compliant merely because some partial source article applies; laboratory results and all applicable criteria must still be established. WordPress remains unchanged.
