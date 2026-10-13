# PMSV FSSAI Helper — Batch 15: 35-case evidence transfer and 3 conditional article proof gates

**Date:** 13 October 2026. **Scope:** GitHub Pages `gh-pages` preview. WordPress production remains unchanged.

## Original FSSAI legal-source evidence rechecked

- FSSAI [CTR Version IX, 03 February 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), PDF p.11 (zero-based 10), includes the Tin row **“Canned foods other than beverages” — 250 mg/kg**. It does not prove the marketed pickled egg is canned merely because the food is packed.
- CTR Version IX, PDF p.14 (zero-based 13), separately lists **“Food product containing any of the above mentioned food articles”** — **20 µg/kg total aflatoxins** and **10 µg/kg aflatoxin B1**. These source values do not prove an unknown formulated supplement or functional-ingredient premix contains qualifying crops and legally falls within the composite finished-article scope.
- The conditional routes require **four positive documentary conditions apiece**, or **12 evidence conditions** across the three original cases. Each checkbox in Batch 15 is plainly labelled a *self-reported document claim*, not verified legal source applicability, validated lot analysis or FSSAI approval.
- Before legal first-source promotion, actual as-sold product, processes, recipes, package types, named article, sample basis and signed regulatory interpretation must be reviewed by a competent party.

## Substantive new functionality

1. **Cross-device review file:** download an updated full 35-case JSON transfer including Batch 14 reviewer drafts, Batch 5 received-document marks, and Batch 15's 12 conditional-document claims. **No server upload and no login**.
2. **Restore on another browser/device:** select a PMSV JSON file and explicitly import it into browser-local storage. Accepts new Batch 15 transfers, the old 35-case Batch 14 export and individual Batch 14 case exports. Imports merge on exact canonical catalogue ID rather than silently deleting unrelated drafts.
3. **Fail-closed import:** maximum 2MB, strict type/schema/product-name/FSSR/FCS matching, duplicated/unknown IDs rejected, only allowed text fields and proper official FSSAI/FoSCoS source URLs. Files claiming approved legal source, active threshold, verified assay or compliance PASS are rejected.
4. **Rollback:** storage import attempts preserve a backup of earlier reviewer drafts, document receipts and conditional claims. On browser write failure, existing snapshots are restored where storage permits.
5. **Reviewer readiness summary:** shows 35 not-started/partial/documentary-packet-ready-for-*independent-review* categories and claimed conditions out of 12, always distinct from legal source approval.
6. **Product-level conditional review:** the three pending candidates gain an on-product evidence-claim panel; it synchronizes with the global 35-product review workbench.

## Status and guardrails

- **533** catalogue products; **498 conditional first-source matches**, **35 exact first-source pending**.
- **3 conditional named CTR source candidates**; **32** without a newly confirmed named CTR article.
- **140** prior document-receipt slots; **153** prior specific source questions.
- **0 new exact named-source promotions, 0 newly active numeric finished-food limits, 0 verified lot results, 0 complete regulatory compliance passes**.
- The FSSAI amendment operative **1 December 2026** remains inactive until that date.
- No canonical ledger or WordPress production plugin mutation.

Files: `fssai-product-helper-preview-01/data/rules/fssai-current35-review-transfer-conditional-claims-batch15-2026-10-13.json`, `fssai-product-helper-preview-01/fssai-current35-review-transfer-conditional-claims-batch15-2026-10-13.js`, `tests/fssai-current35-review-transfer-conditional-claims-batch15-2026-10-13.test.cjs`, `.github/workflows/verify-fssai-current35-transfer-candidate-batch15.yml`.

Automated tests include rejected forged approval flags, untrusted official-looking URLs, duplicate IDs, unexpected/oversized data, JSON round-trip, precise prior identity and contingent routes, storage-write rollback, escaped reviewer HTML and no pass despite all 12 self-reported claims.
