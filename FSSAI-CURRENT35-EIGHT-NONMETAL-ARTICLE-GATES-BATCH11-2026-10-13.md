# PMSV FSSAI Helper — Batch 11: 280 nonmetal source-scope checks (35 remaining products)

**Date:** 13 October 2026. **Scope:** GitHub `gh-pages` only. WordPress production unchanged.

## Positive regulatory text reviewed
Official [FSSAI CTR Version IX, 03.02.2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), pp. 14–15 (zero-based PDF pages 13–14) contains eight distinct named article families: total aflatoxins, aflatoxin B1, aflatoxin M1, ochratoxin A, patulin, deoxynivalenol, agaric acid, and hydrocyanic acid. These have materially different commodity, product/form, recipe and sampling requirements. No rule is automatically inherited from merely sharing an ingredient name or raw commodity.

## Batch size and findings
- 35 individual first-exact-article-pending records reviewed against each of eight current FSSAI rows: **280 evidence-gated applicability screens**.
- A source-specific evidence question, named article scope, no-transfer warning, and mandatory first-source gate are stored per product; each appears in the individual Helper panel.
- Crucial exclusions include coffee–chicory vs. the named coffee ochratoxin article; coconut-milk powder vs liquid/skim/whole milk aflatoxin M1 articles; frozen fruit vs apple juice patulin article; chia oilseed classification; arrowroot vs cassava/tapioca hydrocyanic article; and wheat/barley scope for mixed functional premixes.
- Baseline unchanged: **533 total, 498 conditional first-source matches, 35 pending**. **0 source promotions, 0 applied numeric finished-product limits, 0 laboratory PASS decisions, and 0 complete regulatory approvals**.
- May 2026 amendment not activated before its 1 December 2026 commencement.
- Fail-closed SHA-like digest, 35-ID identity reconciliation, 280-decision checks, script ordering, data validation and CI tests are included.
- This batch is source-boundary screening; it does **not** certify that all required contaminants are covered. Positive approvals still require actual finished article, formula/process/packaging, regulatory review and suitable lot analytics.

Files: `fssai-product-helper-preview-01/data/rules/fssai-current35-nonmetal-named-scope-batch11-2026-10-13.json`, `fssai-product-helper-preview-01/fssai-current35-nonmetal-named-scope-batch11-2026-10-13.js`, `tests/fssai-current35-nonmetal-named-scope-batch11-2026-10-13.test.cjs`, `.github/workflows/verify-fssai-current35-nonmetal-named-scope-batch11.yml`. Current canonical ledger and WordPress unchanged.
