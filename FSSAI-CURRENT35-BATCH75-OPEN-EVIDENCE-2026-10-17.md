# PMSV FSSAI Batch75 — original evidence work queue and mobile regression repair

17 October 2026. `gh-pages` **FSSAI helper only**; WordPress production and `main` unchanged.

## Implemented
- An explicit-review 175-request work queue using the existing verified B58 owner records crosschecked **row by row** with the verified B59 immutable original request IDs.
- Full validation on every **Apply** or **Export** action: READY B70 state, 35 cases (13 P0 / 22 P1), 175 **unique** original evidence IDs, five authorized owner functions each assigned 35, **70 requests eligible for preparation** and 105 dependent on upstream proof. Every original request remains NOT_SENT and document NOT_RECEIVED.
- Accessible mobile layout with P0/P1, functional owner, preparation/dependency, and text search filters; local unsent CSV export with spreadsheet-formula injection hardening.
- Fail-closed behavior: an amended case ID, invented document receipt, broken source digest, missing 35-case hold, or stale READY state removes rows and disables export. No network, correspondence, storage or regulatory approvals.
- Correct B74 browser tests to open the disclosure and navigate to the Product standard tab before testing visible links. The earlier B74 fixture had incorrectly expected visible links inside a closed details element.

## Verification
Batch75 CI runs a Playwright synthetic proof-tampering fixture, checks the original Batch69 case and request inventory, runs the B74 negative mobile test, and runs the **full** 390px real-preview B22 startup / optional B70 research path. Reports success only if tests pass.

## Regulatory status
533 catalogue; 498 conditional first-source matches; **35 original CTR cases HELD** (P0 13 / P1 22); 175 immutable documentary requests OPEN; 0 published comparator transfers, case-specific original signed approvals, accredited laboratory method approvals, actual lot CoAs/PASS, transmissions or releases.
