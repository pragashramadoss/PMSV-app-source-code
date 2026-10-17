# FSSAI Preview — Batch76: Five-gate dossiers for all 35 held cases

**17 October 2026 · `gh-pages` only.** WordPress production and `main` unchanged.

Batch76 builds an isolated case-by-case evidence review directly after the Batch75 queue. Its source is limited to the **verified** original B58 owner and immutable B59 case inventory plus explicit B70 fresh-source readiness.

## Capabilities

- Browse all 35 current HELD CTR cases (13 P0, 22 P1) and search/filter without using any unverified crosswalk rows.
- Each selected case displays exactly **five original immutable evidence IDs** with its responsible function, documentary request, original dependency codes, and NOT_SENT / NOT_RECEIVED state.
- Distinguish two prerequisite-free *request-preparation* tasks versus three tasks dependent on upstream original evidence per case. Across all cases retain 70 and 105 respectively.
- Export the selected case as spreadsheet-safe five-row CSV or human-readable role handoff TXT clearly labeled **UNSENT / NOT APPROVED**. Exports happen locally only after renewed source checks.
- Fail closed on stale B70 readiness, a missing source validator, new document-received flags, a forged lot pass, mismatched ID, duplicate original request ID, incomplete owner distribution, missing dependency or source tampering. Never display a fabricated regulatory PASS.
- Adaptive one-column selection controls on phones, accessible table region, touch targets and keyboard focus. No storage, email, webhook, backend connection or user document uploading.

## Tests

A Chromium synthetic test validates all 35 cases/175 unique IDs, five functions per case, 2 preparatory/3 dependent tasks per case, filtered case selection, spreadsheet-formula hardening and multiple deliberate source mutations. The existing Batch75 fixture and static Batch69 all-case coverage also run in CI. Passing CI is required before claiming this batch verified.

## Decision boundary

533 catalogue products; 498 conditional first-source matches; **35 original CTR cases remain HELD**; 175 documentary requests outstanding. **0 signed applicable law approvals, 0 accredited laboratory scope validations, 0 actual original lot CoAs or PASS decisions, and 0 releases.** No published comparator is automatically inherited.
