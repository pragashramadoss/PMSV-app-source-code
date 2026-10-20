# PMSV Batch87 — Search and act on all 533 FSSAI source-research catalogue entries

20 October 2026 · isolated `gh-pages` FSSAI helper only. No `main` or WordPress production changes.

## Delivered
- A new **Browse all 533 product source-research records** disclosure inside the existing FSSAI legal review script. Avoids another data copy or regulatory approval pipeline.
- On-demand source revalidation, full text search across product / stable ID / FSSR / FoSCoS / held analyte; filter all 533, 498 conditional first-source references or all 35 legally HELD, 50 products per page.
- Each of the 35 reviewed-but-HELD products has an explicit **View held case** action that takes the reviewer to its exact original case, source comparator, and nontransfer limitation in the existing 35-case legal panel. Does not change other case views until the reviewer clicks.
- **Export filtered product CSV** (533, 498, 35 or filtered smaller subset). CSV contains status, FSSR, FoSCoS and case identity but NO automatic legal limit, panel PASS or lot release; RFC CSV quotes, formula-injection prefix, UTF-8 BOM, browser object URL cleanup.
- Accessible labels, live counts, 50-row pagination and 390px mobile scroll containment. Lazy initial rendering only after explicit evidence verification, not on normal helper startup.

## Integrity and legal boundaries
- Reuses the original source-pinned Batch86 final legal review, independent `pmsv498Valid()` 533-source ledger, and original B59 35-case evidence inventory.
- Rejects duplicate ID, altered product names, mixed source statuses, changed case legal/lot flags, non-175 original evidence requests, or anything other than exactly 498 + 35 unique catalogue entries.
- **Fact:** 498 partial/conditional source references and 35 public-source-researched but unresolved legal scope cases. 175 original evidence requests (13 P0, 22 P1). Zero signed legal applicability decisions, validated matrix/lab scopes, actual commercial lot CoA passes or releases. Every product remains unapproved for full contaminant compliance.
- No local/cloud user data storage, uploads, email sending, FSSAI article number adoption, unpublished limit inference or authorization to release.

## Verification
- Dependency-free Node integrity test reconciles all 533 IDs, 498/35 split, 175 original ID requests and no approval flags.
- Actual full-preview Playwright Chromium test checks source-load gate, 390px rendering, 50-item pagination, 35 HELD filters, 498 conditional filters, CSV line counts / real CSV download, and exact-case navigation. Existing B84–B86 tests rerun in the dedicated Batch87 workflow.
