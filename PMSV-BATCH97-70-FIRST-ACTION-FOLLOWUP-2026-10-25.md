# PMSV Batch97 — 70 first-action follow-up register (research preview)

**25 October 2026.** This batch converts the existing Batch95 70 first preparatory documentary requests into an operator-controlled follow-up workbench within the standalone FSSAI Helper. Batch96 laboratory method-authority cautions remain unchanged. Only gh-pages preview is affected; main and live WordPress are unchanged.

## Source baseline

- 533 standardized catalogue entries.
- 498 conditional source references, **35/35 completed public-source research dossiers**, 35 real commercial cases **HELD**.
- 175 original immutable evidence request IDs, with **70 preparatory** (35 manufacturer/supplier identity and 35 FSSAI method/source authority) plus **105 still upstream-dependent**.
- The published original source request states remain NOT_SENT, NOT_RECEIVED. No document receipt, original-source authentication, legal limit adoption, accredited method signoff, representative tested-lot PASS or independent QA release is inferred or recorded as fact.

## New workflow

The new read-only-source, locally editable panel adds 70 individual action notes. The operator can select a case, evidence role or priority, then record one of four distinct LOCAL and SELF-REPORTED follow-up states:

1. NOT_PREPARED — original default, no metadata.
2. DRAFT_READY — locally drafted; no send or receipt.
3. SENT_SELF_REPORTED — user asserts an external request was sent; requires an outgoing reference and valid sent date; it does not prove delivery.
4. RESPONSE_SELF_REPORTED — user asserts an external response exists; requires original send reference/date plus response reference/date; it does not prove document receipt, authenticity or applicability.

Optional next-follow-up date cannot precede send date. The system never sends messages. All original 175 source request states remain immutable, so an operator note cannot promote the 105 blocked legal, lab or QA gates.

The panel offers a 70-row blank template and fully validated CSV export/import for resuming work on the same or another device. Every imported row must match the same original request ID, catalogue case, rank, functional owner, gate and original source status; invalid or duplicated IDs, malformed dates, injected spreadsheet formulas, schema changes or unsafe references reject the entire import, preserving previous notes. No browser localStorage, server storage, upload, email send or external database update occurs. Local notes disappear when the tab reloads unless exported.

No confidential actual BOM, full COA, personal details or PDF evidence should be entered into this publicly hosted preview. Use short controlled reference IDs only.

## Quality check

- Test: tests/pmsv-batch97-first70-followup.test.cjs
- Workflow: .github/workflows/verify-pmsv-batch97-first70-followup.yml
- Invariants: exactly 70 preparatory requests, 105 blocked, 35 per functional role, 35 cases, 175 distinct original IDs, original all NOT_SENT/NOT_RECEIVED, zero approvals.
- Regression: valid local status progression and round-trip CSV; rejects fake receipt dates, unsafe references, immutable source tampering, duplicate IDs and altered imports without partial writes.

The feature supports operational follow-up planning only. Commercial compliance remains NOT DETERMINED / HELD until authentic evidence and independent competent human review are obtained.
