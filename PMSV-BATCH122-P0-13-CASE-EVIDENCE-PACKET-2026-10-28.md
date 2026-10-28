# PMSV Batch122 — high-priority 13-case / 26-request evidence packet

Date: 28 October 2026 (IST)  
Branch: `gh-pages`  
Preview: https://pragashramadoss.github.io/PMSV-app-source-code/fssai-product-helper-preview-01/#formulation

## Change

The **Batch118 · First-70 evidence-owner next actions** panel now offers **Download P0 urgent evidence packet (13 cases · 26 requests)**.

This source-verified CSV selects only the original P0 cases from the full Batch121 70-row detailed evidence brief. It preserves the same 17-column format, including finished-product name, analyte, original gate and complete evidence requirement, plus five empty offline owner/dispatch-assignment fields.

- 13 P0 cases; 26 original preparatory requests.
- 13 method-authority requests; 13 manufacturer/supplier requests.
- Every original request state remains `NOT_SENT` and every original documentary state `NOT_RECEIVED`.
- Every row remains `ALL35_HELD_NO_LEGAL_LAB_LOT_APPROVAL`.
- The broader 70-request detailed export and the Batch120 owner worksheet are unchanged.

## Fail-closed controls

The 26-row subset is offered only after the **entire 70-row original source is reconciled**, including identities, priority/rank/role/gate, source document status, and unique request IDs. An invalid filter, missing or altered source, duplicate ID or incorrect P0 count suppresses the export. In the UI, a blocked P0 export gives a visible message while retaining the 35 commercial compliance holds.

No backend, messaging, uploads, browser persistence, named people, recipient addresses, compliance decisions, laboratory acceptance or product release was added. CSV formula-like strings are escaped.

## Verification

- Source simulation against the original 35-case/175-gate register confirmed 13 distinct P0 cases, 26 requests, 13+13 owner roles and 17 columns.
- The 70-request Batch121 output still contains 70 data rows.
- [GitHub Actions source and UI contract](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40690488091): **SUCCESS**.

## Real-world next step

Competent internal owners must verify recipients, obtain approval for external dispatch and send source-specific requests through approved channels. The signed legal text, authentic manufacturer records, exact-matrix laboratory scope, CoAs and representative lot disposition must be reviewed before any case can be closed. All **35 commercial cases remain HELD**, and no full finished-product compliance approval is asserted.
