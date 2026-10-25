# PMSV Batch98 — controlled-source revision and independent reviewer handoff

**25 October 2026 — standalone gh-pages FSSAI Helper only.** Source desk research stays complete at **35/35** and the 533-product catalogue still has 498 conditional first-source references. The original evidence register remains **175 NOT_SENT / NOT_RECEIVED** requests: 70 preparatory and 105 dependent. Actual commercial legal/method/lot/QA signoffs: **0/35**; all actual case dispositions **HELD**.

## Scope and evidence boundaries

A source document may be on an official website, but its URL, ID or SHA-256 fingerprint cannot prove it is legally effective, genuinely issued for this supplier, authentic, applicable to an actual commercial SKU or suitable for a particular laboratory. The public preview cannot access actual manufacturer-held commercial documents or perform independent origin checks. Batch98 records **operator-supplied metadata and outside verification reference IDs only**. It never marks a document as independently authenticated.

The new Batch98 panel is attached to the existing Batch97/96/93 workflow for the same original 35 cases and their five original proof IDs. It provides:

1. **Manufacturer original-source registry:** controlled document reference, explicit version/revision, date, optional local SHA-256 calculation, issuer/custodian verification reference (self-reported).
2. **Method-source original registry:** separate controlled FSSAI/lab method-document reference and version, date, local SHA-256, outside source/custodian-check reference. Different 2024 FSSAI 09.xxx method texts are not assumed identical or adopted.
3. **Independent reviewer packets:** separate *UNSENT* Regulatory/Legal and Laboratory technical text briefs, each addressed to a different original evidence gate. Regulatory draft requires complete manufacturer metadata; Laboratory draft requires complete manufacturer AND method-source metadata. A draft is never an approved CTR article, legal limit, NABL method, CoA, PASS or lot release.
4. **Local revision history:** each changed metadata or handoff is a numbered revision, up to 20 per case. If a manufacturer or method-source record changes after reviewer handoffs, **both handoff states reset to NOT_PREPARED**, and the prior version is retained in the exported history.
5. **External-send logging only:** each handoff can be NOT_PREPARED, DRAFT_READY or SENT_SELF_REPORTED. A self-reported external send requires date and controlled outbound ID, which does not prove actual receipt.
6. **All-in-browser processing:** when explicitly selected, files of at most 30 MB are hashed locally with SHA-256 and discarded from the tool's handling. No contents are uploaded to PMSV, no persistent browser/server storage is used. Export/import of controlled-source metadata is a local JSON file, with full 35-case original-ID and version-chain validation.

## Security and import controls

The 35-case export has a fixed schema, current source identity, immutable five request IDs per product, typed document metadata and historical revision records. Import must match all 35 original source identities, require well-formed safe reference strings, real issue/send dates, exact 64-character lowercase SHA-256 if entered, no forged extra approval fields, and valid handoff reset on supersession. The entire import is rejected atomically on mismatch; prior notes are not overwritten.

Do not enter confidential BOMs, actual document text, customer names, private lab reports, full commercial CoAs or credentials. Only reference IDs, versions, dates and checksums should be used. Local notes disappear when the page is refreshed unless an export was downloaded. Source research and 175 immutable proof statuses remain unchanged.

## Test and release

- Code: fssai-product-helper-preview-01/pmsv-batch98-source-authentication-handoff-2026-10-25.js
- Test: tests/pmsv-batch98-source-handoff.test.cjs
- Workflow: .github/workflows/verify-pmsv-batch98-source-handoff.yml
- Acceptance: 533/35/175 original identity checks; 13 P0 and 22 P1, source change invalidation, version-preserving handoff reset, distinct reviewer prerequisites, exact no-approval status, safe atomic JSON transfer, tampering rejection.

**Unchanged:** live WordPress, main branch, original FSSAI case legal scope, numeric contaminant limits, original request send/receipt state and all true commercial compliance dispositions. Independent human original-document authentication, signed product applicable legislation, matrix-method accreditation, commercial lot CoA and authorized QA review remain required outside PMSV.
