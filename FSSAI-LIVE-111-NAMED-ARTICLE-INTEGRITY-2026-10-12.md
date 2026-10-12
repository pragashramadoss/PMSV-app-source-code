# PMSV FSSAI current 111 — named CTR article integrity review (12 October 2026)

**Scope:** GitHub `gh-pages` standalone Helper only. WordPress unchanged.

**Authoritative ledger:** 533 catalogue, 422 partial first-source matches, **111 pending**, **0 complete contaminant or tested-lot PASS**. No new positive first-source promotions in this change.

Across **all 111 current pending products**, the official FSSAI Version IX crosswalk identifies **114 referenced candidate article links**, involving **87 products**. These collapse to **29 distinct reference labels**. **28 have verifiable named source rows**, and one lacks an analyte (the vague label `Hard boiled sugar confectionery`): its number is deliberately withheld. The remaining **24 products** have no named candidate in their active proof packets.

The new source-row crosscheck validates the exact contaminant name, article, published value and unit against the application's FSSAI Version IX data at render time. It withholds the entire reference panel if a row or ledger is changed. Each item is explicitly an **official source reference, NOT a product-specific applicable limit**. Special notes preserve shell-free egg basis and dried tomato solids basis. No sample test, full compliance, exemption or automatic product clearance is recorded.

**Bug fix:** Five identities already promoted from the historical 116 pending batch no longer display the obsolete '116-product local evidence collector withheld' panel. Current local evidence remains available only for the authentic 111 pending entries.

**Official regulatory source:** https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf

**Added:** `data/rules/fssai-live-111-official-article-crosswalk-2026-10-12.json`, `fssai-live-111-official-article-crosswalk.js`, regression test `tests/fssai-live-111-official-article-crosswalk-2026-10-12.test.cjs`. Index and official-source CI workflow updated. Historical ledgers remain immutable.

**Evidence policy:** The source references still require positive documentation proving finished-product identity, legally applicable article, processing form, packaging, ingredient species and analytical basis. A compound food is not equivalent to its raw ingredient, a sugar cube is not automatically legally identical to refined sugar for a Chromium assignment, and a local checklist is not independent proof.
