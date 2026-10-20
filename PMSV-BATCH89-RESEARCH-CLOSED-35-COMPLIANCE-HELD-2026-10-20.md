# PMSV Batch89 — 35/35 source desk research cases CLOSED in the live catalogue

**20 October 2026.** Research closure is complete; commercial product regulatory approval is **not** granted.

## Actually implemented
- Before this commit Batch88's immutable 35-case signed-off *research conclusion* JSON existed in GitHub but was not loaded into the main searchable 533-product UI. It was possible for the user to misread 35 historic `FIRST_EXACT_SOURCE_PENDING` statuses as 35 **unresearched** cases.
- Batch89 now loads the authoritative 35-case research closeout **only after** the existing 533/498/35 and legal-case evidence have verified. It independently validates the pinned `4d1590738e747a2a` digest, 35 case ranks, product IDs/names, priority, analyte, all 175 immutable original proof IDs, 23 *not applied* named numeric reference amounts, 12 cases with *no single numeric article established*, and 0 legal/method/lot signoffs.
- Re-labels the B87 searchable 533-product UI to show: **0 unresearched desk-review cases**, **35 public-source case reviews CLOSED**, **35 commercial legal and lot verification HELD**. The original ledger's 35 legacy `FIRST_EXACT_SOURCE_PENDING` records remain unchanged for data integrity and historical provenance.
- The existing CSV export now exposes both source and closure/compliance statuses in separate columns. All 533 rows reconcile with 498 conditional-source reference records and 35 completed original-source research cases. **No product's contaminant compliance has been established**.
- A corrupt or unavailable B88 file immediately blocks the catalogue (fail closed), not a misleading "0 pending" claim.

## Legal up-to-date boundary
FSSAI [Contaminants, Toxins and Residues amendments](https://fssai.gov.in/food-law/regulations/amendments/contaminants-toxins) lists the final **25 May 2026** amendment and **17 October 2024** amendment as of the current official index. The [15 October 2026 tea MRL change](https://fssai.gov.in/food-law/notifications) is **draft**, not a general effective food-contaminant amendment. The 25 May 2026 original Gazette states **1 December 2026** commencement; don't forward-apply it to today's cases.

## Remaining externally owned evidence
For all 35 commercial product types, actual supplier/market SKU, original composition, operative Gazette article and signature, accredited analyte×matrix method with LOQ, representative lot CoA and final independent QA approval are not authenticated in this public repo. These are not obtainable or approvable from public-law browsing alone.

Research action: CLOSED. Document/QA validation action: OPEN (35 cases). **No blanket legal limits, lots, contacts sent, external records uploaded, or false approvals.** Branch: only `gh-pages` research prototype; `main` and WordPress production unchanged.
