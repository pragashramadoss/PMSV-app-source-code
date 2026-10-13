# PMSV FSSAI Helper — Batch 14: 35-case documentary first-source adjudication workbench

**Date:** 13 October 2026. **Scope:** GitHub Pages `gh-pages` preview only. WordPress production unchanged.

## Why this batch
Prior broad legal-scope screening has not yielded confirmed first-source promotions for the remaining 35. Repeating general CTR defaults cannot establish the legal article for an actual marketed finished product. The primary blocker is **positive documents for the product's identity, processing, formulation, applicable exact finished CTR article, analytical basis and lot evidence**.

## Functional update
- One global browser-side review queue in the Product Standard view for **all 35** `FIRST_EXACT_SOURCE_PENDING` cases.
- Each case includes positive FSSR/FoSCoS identity findings and specific questions from Batches 12 and 13, with direct official source citations.
- **3 conditionally identified named CTR article routes** are clearly marked: physically canned pickled eggs (tin) and qualifying recipe-specific functional premix and formulated children’s supplement (aflatoxins). **32** other cases have no *newly confirmed named-article candidate* and are not falsely promoted.
- Priority breakdown from the existing evidence: **P1 3**, **P2 24** and **P3 8**. P3 cases require exact chemical/substance identity before any formula or contaminant row.
- Reuses the existing Batch 5 **140 evidence-receipt slots**; a checked receipt records only document delivery, not verification. Extends the 35 dossiers with **153 existing individual product-specific evidence questions**.
- Reviewer can enter actual marketed finished product/recipe, proposed **exact** CTR article, official FSSAI/FoSCoS URL, named analyte, analytical basis, source references, reviewer ID and optional lot ID.
- Reviewer drafts are **browser-local only** (no email account, login, server write or file upload). Local values are size-limited and escaped in HTML.
- Case or full 35-case queue can be downloaded in **JSON** for independent legal review. A documentary packet can reach `DOCUMENTARY_PACKET_READY_FOR_INDEPENDENT_REVIEW_UNVERIFIED` only after all 4 document receipts and the mandatory fields including a recognised official URL. This label does not signal legal article applicability or test PASS.
- Existing per-product panels also expose the same workbench, with product identity guards. JSON remains explicitly **unverified**; approval flags, numeric threshold assignment and finished lot PASS remain **false**.
- Validated official CTR Version IX, 03.02.2026: [FSSAI consolidated regulations](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf). An amendment due to take effect 1 December 2026 is not applied ahead of its commencement.

## Source-ledger status
**533 catalogue products / 498 conditional sources / 35 pending exact first-source decisions.** No first-source promotions, activated numeric contaminant limits, lab PASS results, complete contaminant panel clearances or full approvals. The preview commit does not alter the canonical ledger or WordPress plugin.

## Reproducibility
- `fssai-product-helper-preview-01/data/rules/fssai-current35-adjudication-workbench-batch14-2026-10-13.json`
- `fssai-product-helper-preview-01/fssai-current35-evidence-workbench-batch14-2026-10-13.js`
- `tests/fssai-current35-documentary-adjudication-workbench-batch14-2026-10-13.test.cjs`
- `.github/workflows/verify-fssai-current35-adjudication-batch14.yml`

Automated tests check 35 product identity preservation, 22+13 exact dossier partition, 140 document slots, 153 question rows, three conditional candidates, malicious-source URL rejection, explicit non-PASS exports and browser module integration.
