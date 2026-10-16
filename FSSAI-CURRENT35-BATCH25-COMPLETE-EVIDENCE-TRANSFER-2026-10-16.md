# PMSV FSSAI Helper — Batch 25: complete, selected transfer of unverified evidence

**Date:** 16 October 2026. **Environment:** `gh-pages` GitHub preview only. WordPress production remains unchanged.

## Finding addressed
The previous B15/B23/B24 transfer could carry all 35 reviewer draft forms, four receipt checkboxes per case, and three conditional-article claims, but not the separately stored Batch5 **evidence-reference IDs and follow-up notes**. On a new browser/device the reviewer could see receipt checkmarks without the corresponding local documentary details. Existing notes on the destination were preserved by the old importer, which avoided overwrites but also silently omitted legitimate incoming notes.

## New Batch25 safeguards
- Export now includes the existing strict B15 packet **plus** 35 identity-pinned B5 evidence-reference and follow-up-note entries. Up to 300 characters for each reference and 500 characters for each note.
- The B25 envelope requires exact catalogue ID and name, exactly 35 distinct canonical cases, and explicit zero verified sources, legal approvals and lab passes. Invalid / duplicate / forged packets are rejected before any browser-local write.
- The B23 **preflight** and B24 **explicit case selection** also account for notes-only changes, distinguishing fresh information, replacement of existing notes, empty incoming notes, and no change.
- Only selected cases receive imported references and notes; unselected cases retain all local reviewer drafts and receipt metadata. Claims still require a separate opt-in.
- Legacy B15 exports remain compatible and **never erase local reference/notes**.
- A failure during the extra notes save attempts rollback of all three browser-local keys, with no successful import reported. Exports contain potentially sensitive reviewer notes; do not post publicly.
- Existing tests for old B23 and B24 functionality are retained; real Chromium Batch25 regression exercises tampered inputs, newly entered metadata, explicit selection, legacy interoperability, failure rollback and 533/498/35 ledger conservation.

## Regulatory source / hard stop

Official, current FSSAI **Food Safety and Standards (Contaminants, Toxins and Residues) Regulations, 2011, Version IX (03 February 2026)**:
https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf

The metal table includes named product articles and separate metal-specific fallback rows; a reference or proof of receipt **does not** establish the finished product's exact legal article, analytical basis, applicable amendment or laboratory conformity.

The prospective 01 December 2026 amendment is **not active as of this batch date**.

## Invariant — no compliance promotion
- 533 catalogue identities.
- 498 **conditional first-source** matches; not finished-product approvals.
- 35 exact first-source cases still pending independent adjudication.
- 140 evidence-document receipt slots (four per pending case).
- 0 new regulatory source promotions; 0 assigned legal thresholds; 0 accepted lot laboratory passes; 0 finished-product compliance approvals.
- WordPress unchanged.

**Verification:** `node --check fssai-product-helper-preview-01/fssai-current35-complete-evidence-transfer-batch25-2026-10-16.js`; `node tests/fssai-current35-complete-evidence-transfer-batch25-2026-10-16.test.cjs`; `verify-fssai-current35-full-evidence-transfer-batch25.yml`.
