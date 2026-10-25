# PMSV Batch 100 — Independent reviewer exception and source-revision register

Date: 25 October 2026
Target: `gh-pages` prototype only. No change to `main` or live WordPress.

## Scope and evidence boundary

The previously authenticated *public-source desk-research inventory* continues to show 533 products, 35/35 desk-research cases closed, 175 original documentary evidence requests and 105 dependent review requests. **Desk closure is not commercial compliance clearance.** All 35 commercial dispositions remain HELD. All original manufacturer, method, legal, laboratory, lot and QA evidence tasks remain `NOT_SENT / NOT_RECEIVED`; no operative product-specific limit, accredited method applicability, test result, authorized PASS or QA release is approved in PMSV.

Batch 100 adds a private-to-the-browser, metadata-only issue register across the exact frozen 105 dependent original requests:

| Function | Original dependent requests | New statuses allowed |
| --- | ---: | --- |
| Independent Regulatory/Legal | 35 | OPEN, FOLLOW_UP_REQUESTED, REFERRED_TO_INDEPENDENT_REVIEW |
| Independent Laboratory/Technical | 35 | OPEN, FOLLOW_UP_REQUESTED, REFERRED_TO_INDEPENDENT_REVIEW |
| Site QA + independent regulatory reviewer | 35 | OPEN, FOLLOW_UP_REQUESTED, REFERRED_TO_INDEPENDENT_REVIEW |
| **Total HELD** | **105** | No closed, approved, pass or release state |

Each local issue retains the exact original request ID, case ID, functional role, metadata-only source snapshot, unresolved issue type and criticality, external ticket reference, next action, follow-up date, local entry revision and entry date. Only short action/ticket references are expected; users should not paste personal information or original document contents. No email, approval or document upload is performed.

## Revision-based reviewer safety

- Regulatory issues are bound to the Batch 98 manufacturer controlled-source reference, version/date, byte checksum and *self-reported* issuer-check reference.
- Laboratory and QA issues are bound to both manufacturer and method-source metadata.
- When a relevant source identity changes, prior issue entries become **STALE_RECHECK_REQUIRED**. The UI refuses ordinary follow-up saving until an explicit new-source acknowledgement creates a new local history revision. The previous entry remains in the export.
- This control detects local metadata changes; it does not independently authenticate the manufacturer, official Gazette, laboratory, reviewer signatures, commercial matrix or representative lot.

## Local handoff outputs and verification

The register exports a 105-row CSV summary and a JSON version-history bundle. JSON import checks the exact 105 request/role/case identifiers, allowed unresolved workflow states, local source-snapshot shape and revision sequences. It rejects altered IDs, states suggesting approval, oversized payloads and overwriting existing in-tab records. Imported historical entries whose Batch 98 source data are absent in the new tab are flagged stale rather than treated as authenticated.

The Batch 100 module is loaded by a small addition to the Batch 99 script. **The 900 KB preview HTML file is intentionally not changed**, limiting unnecessary GitHub workflow triggers. No original evidence ledger is modified.

Files:
- `fssai-product-helper-preview-01/pmsv-batch100-independent-review-exception-register-2026-10-25.js`
- `fssai-product-helper-preview-01/pmsv-batch99-downstream-evidence-dependency-audit-2026-10-25.js` (module loader only)
- `tests/pmsv-batch100-reviewer-exceptions.test.cjs`
- `.github/workflows/verify-pmsv-batch100-reviewer-exceptions.yml`

Test expectations: 105 unique HELD original requests, 35 each role, source-version stale detection for appropriate roles, explicit re-anchoring, closed-state and spreadsheet-formula rejection, fail-closed import, 106-row CSV including header, and 0 approvals/releases.

Preview: https://pragashramadoss.github.io/PMSV-app-source-code/fssai-product-helper-preview-01/
