# PMSV Batch120 — first 70 owner-assignment worksheet

Date: 27 October 2026
Branch: `gh-pages`
Preview: `fssai-product-helper-preview-01/#formulation`

## Change

The existing Batch118 next-action queue now offers **Download 70-request owner assignment worksheet**. It exports a separate UTF-8 CSV with 70 validated rows, sorted by urgency and P0/P1 priority:

- 35 original method-authority requests and 35 original manufacturer/supplier requests.
- Existing immutable case IDs, request IDs, source request/document states and hold warnings.
- Blank user-fillable columns for named internal coordinator, verified external recipient, planned dispatch date, approved dispatch channel and internal approval reference.

The worksheet is produced locally in the browser. Named recipients and other entries are neither collected nor persisted by the preview. The export deliberately contains no invented names, email addresses, send dates or approvals. It cannot send messages or alter source evidence.

## How to use

1. Open the **Formulation** section, then **Batch118 · First-70 evidence-owner next actions**.
2. Click **Refresh next actions** to show the validated queue.
3. Click **Download 70-request owner assignment worksheet**.
4. Complete its five blank assignment/dispatch fields offline, checking the correct recipient and internal approvals before external sending.
5. Use the existing Batch97 local follow-up CSV for self-reported progress and keep independently authenticated documentary receipts and approvals in the controlled regulatory/laboratory workflow. An edited assignment worksheet is not an evidence import or source of compliance truth.

## Safety and closure boundary

- **Research dossiers:** 35/35 public-source research workstream closed 20 October 2026.
- **Original evidence request set:** all 175 source request records remain NOT_SENT / NOT_RECEIVED unless independently updated by an authorised workflow. The first 70 are preparatory; 105 are dependent.
- **Product regulatory/lab/lot approvals:** all 35 cases remain **HELD**. This worksheet creates no manufacturer document authentication, legal limit decision, analytical-method acceptance, CoA pass or product release.
- **No networking, messaging, browser persistence, uploads or automatic compliance decisions** are added.

Regression coverage extends `tests/pmsv-batch118-next-action-queue.test.cjs` to assert 70 unique IDs, 35+35 owner roles, blank human assignment fields, immutable NOT_SENT / NOT_RECEIVED statuses, output availability only on valid source, and UI exposure.
