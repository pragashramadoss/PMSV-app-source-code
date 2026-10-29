# PMSV Batch126 — Evidence closure playbook (29 October 2026)

## Authoritative baseline
- 533 catalogue products; 35 unresolved commercial compliance cases: 13 P0 and 22 P1.
- 175 original evidence gates: 70 independent first-action requests (35 legal/method authority, 35 manufacturer/supplier QA) and 105 dependent requests.
- Original source records show NOT_SENT and NOT_RECEIVED. All 35 cases remain HOLD. Zero approved articles and zero lot passes. Offline draft generation is not dispatch or receipt.

## Execution sequence
1. **P0 first:** assign named internal coordinator for each of 13 P0 cases; confirm appropriate recipient and dispatch authority for 13 source/method requests and 13 manufacturer/supplier requests. Keep names and addresses out of the public preview.
2. **Send only after approval:** use the Batch125 offline P0 drafts; preserve request ID in subject, outbound message ID, dispatch date, recipient and response deadline in an access-controlled internal register. A draft is not a sent request.
3. **P1 parallel queue:** repeat for 22 P1 cases (44 first-action requests) without delaying P0.
4. **Verify each response:** retain original source PDF/notification, issuer, amendment chain, effective date, finished-product identity, analytical method and laboratory scope, CoA, batch/lot traceability and review decision. Mark evidence received only on document receipt, never on operator self-report.
5. **Unlock dependencies:** process 105 dependent requests only when their prerequisite original evidence gates are independently verified; do not assume they are closed when first-action requests are sent.
6. **Independent sign-off:** Regulatory verifies applicable operative legal article and exclusions; Laboratory verifies matrix-appropriate methods, accreditation/scope and valid results; QA verifies product specification, lot traceability and disposition. All applicable gates must pass before any case leaves HOLD.

## Blockers and escalation
- Missing operative regulation or amendment: escalate to Regulatory, keep HOLD.
- Missing revision-controlled product identity or manufacturer data: escalate to manufacturer/supplier QA, keep HOLD.
- Missing validated method, lab scope or representative lot result: escalate to Laboratory and QA, keep HOLD.
- Conflicting evidence: record the conflict, source documents and decision owner; do not infer a legal limit or approve by analogy.
- No verified recipient or internal authority: retain offline drafts; do not send externally.

## Audit-ready closure checklist per case
- [ ] Verified applicable legal source and effective date
- [ ] Approved revision-controlled product identity and specification
- [ ] Original laboratory method and scope appropriate for matrix/analyte
- [ ] Representative lot results and traceable CoA, where required
- [ ] All dependent evidence gates verified
- [ ] Regulatory, Laboratory and QA reviews recorded with dates
- [ ] Formal documented commercial release decision by authorized owner

**This document is an operational plan, not evidence of compliance, approvals, dispatch, receipt or lot release.**