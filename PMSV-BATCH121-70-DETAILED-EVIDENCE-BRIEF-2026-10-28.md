# PMSV Batch121 — detailed first-70 evidence brief

Date: 28 October 2026 (IST)  
Branch: `gh-pages`  
Preview: https://pragashramadoss.github.io/PMSV-app-source-code/fssai-product-helper-preview-01/#formulation

## Change

The existing **Batch118 · First-70 evidence-owner next actions** panel now includes a separate **Download detailed evidence requirements CSV** button. The new 70-row, offline-only brief includes:

- Original priority, catalogue/case ID, request ID and functional owner.
- Source-verified finished-product name, analyte, original evidence gate and full documentary requirement.
- Current local next action, clearly distinguished from immutable original documentary states.
- Five **blank** human-assignment fields: internal coordinator, verified external recipient, planned dispatch date, approved channel and internal approval reference.
- Immutable `NOT_SENT` and `NOT_RECEIVED` source states plus `ALL35_HELD_NO_LEGAL_LAB_LOT_APPROVAL`.

The Batch120 simpler owner worksheet remains intact, so existing offline copies are not invalidated.

## Safety and integrity

The helper refuses the new export if the verified 70-request source fails, a record is missing/duplicated, any case/priority/rank/role/gate join differs from the current follow-up queue, or an original documentary state is changed. The CSV protects formula-like leading text from spreadsheet execution. It sends no messages, uploads no confidential documents, collects no recipient data and persists no assignments.

The export is a **preparatory allocation document**, not an authenticated request dispatch receipt or evidence import. All original 175 requests remain `NOT_SENT`/`NOT_RECEIVED`. All 35 commercial cases remain **HELD**, with 105 dependent gates blocked. Product approvals, signed article applicability, approved laboratory scope and representative lot releases remain **0**.

## Verification

- The detailed source join was exercised against the original 35-case/175-gate register: 70 rows, 17 columns, 26 P0 and 44 P1 requests, 35 method-authority and 35 manufacturer/supplier requests.
- Original requirement text and product/analyte values were verified across all 70 rows.
- Missing/duplicate/mismatched source records fail closed; no blank person/approval fields are populated.
- [GitHub Actions first-70 queue contract](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40686724844): **SUCCESS**.

## Next operational handoff

Download the detailed brief, assign named internal owners and verify external recipients offline, obtain approval for external dispatch through the organisation's channels, and track independently authenticated original documents in the controlled regulatory/lab process. Do not use self-reported progress or a populated worksheet to clear a product.
