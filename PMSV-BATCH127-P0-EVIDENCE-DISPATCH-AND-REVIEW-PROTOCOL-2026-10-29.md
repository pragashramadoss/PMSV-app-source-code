# PMSV Batch127 — P0 evidence dispatch and review protocol

**Date:** 29 October 2026  
**Scope:** 13 P0 cases / 26 first-action requests. This is an execution protocol, not proof of dispatch or compliance.

## 1. Source of truth and work order
Use the original 70-row source-verified queue in the FSSAI Helper. Filter to P0 (13 cases, two first-action requests per case). The request ending `-01` goes to the regulatory/method-source functional owner; `-02` goes to manufacturer/supplier QA. Never generate a new case ID or substitute another product's records. Use the Batch125 **P0 26 UNSENT drafts** and Batch122 evidence packet together. Both are offline planning outputs.

## 2. Dispatch register (private, not in public GitHub Pages)
Create one controlled register row for **each original request ID** with: case ID; priority; product; analyte; original evidence gate; internal accountable owner; verified external recipient and organization; internal approval reference; approved sending channel; draft revision; dispatch date/time and timezone; outbound message ID; response due date; reminder date; original attachments; response received date; immutable response-file reference; independent verification status; reviewer and review date; next action. Keep personal contact information and proprietary formulation/CoA documents out of the public repository.

## 3. Controlled transitions
- **Drafted:** source-matched template prepared; original request remains `NOT_SENT`.
- **Authorized:** internal approver, recipient and channel verified; still `NOT_SENT` until actual dispatch is confirmed.
- **Sent (verified):** retain outbound message/transaction evidence. The current Helper's operator `SENT_SELF_REPORTED` flag alone is not proof.
- **Response received (verified):** retain original files and correspondence; do not equate `RESPONSE_SELF_REPORTED` with received evidence.
- **Technical review:** regulatory owner checks operative source and applicability; laboratory owner checks method, scope and results; manufacturer QA checks product identity, specification and traceability.
- **Accepted/rejected/clarification:** document reviewer, source, version, reason and dated disposition per gate. Rejected or incomplete evidence does not close a gate.
- **Case closure:** only after all applicable original and downstream gates, independent approvals and authorized commercial disposition are documented.

## 4. P0 triage meeting agenda (30 minutes)
1. Reconcile 13 unique P0 cases and 26 original request IDs against the source; fail closed if counts differ.
2. Assign 13 accountable internal case owners and 26 functional dispatch owners, with an escalation owner for each missing recipient.
3. Verify approved recipient and original-document requirement for each `-01` / `-02` pair.
4. Set internal dispatch approval and due dates; agree follow-up cadence based on urgency and actual response times (no invented SLA).
5. Record blockers separately: legal source/effective date, product formulation/specification, method and laboratory scope, lot evidence, or authorized sign-off.
6. Review the remaining 22 P1 cases in a parallel workstream; do not hold P1 preparatory requests until P0 closes.

## 5. Evidence acceptance tests
- **Regulatory:** primary FSSAI publication and amendment chain identified; operative version and effective date established; finished-product category and analyte applicability explained; any exclusion is sourced, not inferred.
- **Manufacturer:** controlled finished-product identity and specification match the case; documents have owner, revision and approval; ingredient/batch records are traceable.
- **Laboratory:** test method suits the product matrix/analyte; laboratory authorization/scope, sampling plan, date, report, results and uncertainties where relevant are reviewed by a qualified owner.
- **Commercial:** legal applicability, manufacturer identity, laboratory conclusions, dependent gates and QA decision are consistent and signed off by authorized decision-makers.

## 6. Fail-closed controls
Do not auto-send drafts; do not publish contact lists or confidential evidence; do not convert self-reported statuses into authenticated receipts; do not mark an article, laboratory result, lot or case approved from a template or checklist; do not clear a HOLD solely because a message was sent. Any mismatch of original case/request identity or evidence text stops the handoff for correction.

## 7. Status at creation
35 commercial cases **HELD** (13 P0, 22 P1); 175 evidence requirements not verified; 70 first-action requests originally `NOT_SENT` / `NOT_RECEIVED`; no documented new external dispatch, evidence receipt, legal approval, lot approval or product release from this batch.
