# PMSV Batch91 — secure-by-default original-evidence reference workbench

Date: 20 October 2026. Scope: only the public GitHub \`gh-pages\` FSSAI product helper *prototype*. WordPress production and \`main\` untouched.

## Actual improvement after Batch90
Batch90 linked all 533 research records to the actual product checker. Batch91 adds a functioning interactive workbench directly below the source catalogue for the **175 immutable original evidence request IDs** tied to the **35 public-source-researched yet commercial-compliance HELD** cases.

- Verify all original 35 cases, 175 unique request IDs, 5 independent owner roles per case, 13 P0 / 22 P1, 70 preparation-ready and 105 dependent request slots.
- Enter only a local **document reference ID** (max 120 characters) and optional document date for each of the five original requests per case. No confidential files, formulations, contact details or CoA content are required or uploaded.
- Switch among all 35 cases, preview the original requested evidence text and upstream dependency, see progress as **references entered**, not as received/validated documents.
- Export a CSV with exactly 175 data records; download an unfilled template; import it back with strict full-file checks. Edited request ID, case ID, priority, role, gate, phase, row count, invalid date or spreadsheet formula causes an **atomic rejection**; prior local session entries remain unchanged.
- Source data must first validate through existing B58/B59 and B87/B88/B89 integrity and signed-off desk-research closeout gates. If data changes or fails validation, reference editing and exports stop.
- The workbench is **in-memory only**. Refreshing or closing the page loses entered references unless the user explicitly exports the CSV. All CSV actions take place on the device.
- No requests sent; no uploads or remote writes; no declaration that the document exists or is authentic; no product/compliance PASS, signed legal limit, approved method, original lot CoA, release or WordPress update.
- Future amendment commencing **1 December 2026** is NOT yet applied.

## Independent tests
\`tests/pmsv-batch91-evidence-register.test.cjs\` validates the immutable source count, safe entry and no-pass constraints. Chromium 390px workflow tests actual UI, export/import roundtrip, 175-row reconciliation, formula-injection rejection, and mutated immutable source-ID rejection.

## Important limit
PMSV cannot adjudicate actual commercial product compliance until it is provided genuine manufacturer identity, authoritative original legal interpretation, accredited method/matrix evidence, representative lot CoA and independent QA release evidence. A reference ID in this register is a **pointer only**; even a full 175/175 count is NOT evidence closure.
