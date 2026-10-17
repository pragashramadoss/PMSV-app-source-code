# PMSV FSSAI — Batch58 owner-specific documentary outreach packets

**Date:** 17 October 2026  
**Environment:** Isolated GitHub Pages FSSAI Helper preview, `gh-pages` branch. **WordPress production remains unchanged.**

## Purpose and actual change
Convert the already-existing **35 unresolved current CTR cases** and **175 immutable evidence-gate IDs** into a usable owner-facing **unsent request worklist**. This is a dependency-aware communication aid, **not new scientific evidence**, a regulatory legal determination, a laboratory scope approval, a supplier instruction automatically delivered, or an FSSAI product PASS.

The new **Batch58 · Owner outreach packets** panel appears within the existing FSSAI Helper preview after the two Batch57 source and laboratory review panels. It reads the pinned historical Batch56 and both Batch57 datasets and **refuses to render if their full integrity chains fail**.

| Preserved baseline | Quantity |
|---|---:|
| Catalogue products | 533 |
| Conditional first-source matches, not compliance approvals | 498 |
| Exact-product CTR legal holds | 35 |
| P0 / P1 cases | 13 / 22 |
| Original unchanged gate IDs | 175 |
| Independent preparatory gates | 70 |
| Dependent follow-on gates | 105 |
| 2026 Batch57 secondary source/lab review questions | 1,295 and 1,470 (not additive compliance checks) |
| Documents received or authenticated | 0 |
| Current signed CTR articles, lab scope approvals, tested-lot PASS | 0 / 0 / 0 |

## Owner-specific routing
There are **35 evidence requests per owner function**, each uniquely mapped back to the original `PMSV44-xx-yy` ID. Functional owner roles are:
1. FSSAI QA Division / laboratory director — 35 source/version/method authority requests; prepare these first.
2. Manufacturer or supplier QA — 35 controlled marketed-product formulation/identity requests; prepare these first.
3. Regulatory Affairs and Legal — 35 exact current CTR article / analyte / numeric-basis determinations; hold approval review until actual product identity is evidenced.
4. Laboratory technical manager — 35 exact food-matrix, analyte, FSSAI notification, valid NABL scope, full method, LOQ and validation requests; hold selection/signoff until source, identity and CTR legal basis are resolved.
5. Site QA and independent regulatory reviewer — 35 representative lot chain of custody, original CoA, results/uncertainty and signed release disposition requests; hold until upstream identity/CTR/laboratory scope controls are addressed.

### What the panel actually provides
- Priority `P0`, `P1` or both; filter by all five owner roles; preparatory, dependent or both; product/analyte/request text search.
- Dynamic table and read-only detailed unsent owner briefing text, containing **product-specific original request wording**, assigned function, dependencies, analyte, and original request IDs.
- CSV or text download of selected unsent requests, or manual local copy of the read-only text.
- No named recipient, address, deadline, staff assignment, document, actual laboratory or sample lot is invented or populated.

CSV files quote cells and protect against spreadsheet-formula injection. Exports carry `NOT_SENT`, `NOT_RECEIVED` and hardcoded `false` regulatory-approval/lab-approval/lot-PASS controls. Browsing the preview does **not** send emails or regulatory applications.

## Security and regulatory boundaries
- No new evidence received. No fictitious matching of 35 finished products to generic raw-material limits.
- No client-side storage, backend writes, downloads from third parties or transmission of supplier composition; locally generated exports only.
- Contaminant limits remain unresolved wherever a precise product identity, effective original Gazette, analyte and legally expressed basis are not demonstrably authenticated.
- Consultation-status methods, colliding 2024 `09.xxx` numbers and named laboratory accreditation must not be represented as approved by selecting a draft or copying text.
- The May 2026 CTR amendment is **not operative until 1 December 2026**, and 2027 laboratory provisions are not treated as operative in this 17 October 2026 batch.
- No change to WordPress, `main`, or separate application releases; only the `gh-pages` isolated helper.

## Verification
`tests/fssai-current35-owner-outreach-batch58-2026-10-17.test.cjs` enforces exact 35-case/175-ID source lineage, 13 P0 / 22 P1, five owner functions × 35 records, exactly 70 initial and 105 blocked requests, no received documents / approvals / lot PASS, CSV safety flags, preview rendering and browser no-error checks. Workflow: `.github/workflows/verify-fssai-current35-owner-outreach-batch58.yml`.

**Closure remains pending real supplier/manufacturer evidence, source authentication, current-law signoff, confirmed selected-laboratory accreditation for the exact method/analyte/matrix/LOQ, and lot-specific independent disposition.** Copying a draft is not completion.
