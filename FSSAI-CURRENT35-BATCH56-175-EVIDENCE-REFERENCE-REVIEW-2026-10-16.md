# PMSV FSSAI Batch 56 — 175-gate documentary reference triage and safe import/export

**Review date:** 16 October 2026.  
**Branch / environment:** GitHub `gh-pages` isolated FSSAI helper preview; **WordPress production unchanged**.  
**Previous prerequisite:** Batch55 successful Chromium run [GitHub Actions #38905728224](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/38905728224).

## What Batch56 really changes

Batch56 adds a browser-only, **self-reported evidence reference metadata** layer for the 35 existing product/article cases and all 175 original requests. It enables locating a request ID, recording a document *reference* and source for follow-up, filtering and exporting draft metadata, and recovering previously exported JSON by an explicit local file-selection action.

It does **not** authenticate the underlying evidence; **no document content is uploaded**. Product compositions, actual legal article/CTR limit, laboratory accreditation/method/matrix, analytical result, chain of custody and independent review **cannot be verified by typing an identifier or importing JSON**. No available user control marks a gate approved, method validated or product lot passed.

## Entire baseline retained

| Control | Batch56 state |
|---|---:|
| Full product catalogue | 533 |
| Conditional first-source matches (not full legal compliance) | 498 |
| Open current CTR legal/article cases | 35 |
| High priority P0 / P1 | 13 / 22 |
| Published named product identity references | 28 |
| Unnamed real marketed material/mixture cases | 7 |
| Distinct pre-existing Batch44 request IDs | 175 |
| Independent document/source requests that can be prepared | 70 |
| Downstream conditional approval gates | 105 |
| Functional owner roles and requests per role | 5 × 35 |
| Actual reference metadata at publication | 0 |
| Actual documents received / authenticated | 0 / 0 |
| Signed legal CTR articles, method-scope approvals, tested-lot PASS | 0 / 0 / 0 |

The four earlier provenance layers (Batch52 all 35, Batch53 P0, Batch54 P1, Batch55 unified owner register) are checked before Batch56 renders. Every request ID, 5-gate sequence, role, evidence text and dependency code must match B55. A single changed source digest blocks the new panel.

## Documentary reference-only workflow

1. Open the Batch56 panel, search a case, prioritise P0 or P1, filter to a functional reviewer role or to the 70 preparable versus 105 evidence-dependent gates.
2. Select one original gate ID. Read the complete prior evidence request, listed responsible **role** (not an assigned person), and the exact upstream dependency. An official-linked source is shown as background, never as automatic approval.
3. Optionally record a non-sensitive **document reference ID**, an **issuer/custodian**, one of the six evidence-document types, a reported reference date, preliminary follow-up stage and a short comment. The allowed stages are exclusively:
   - `REFERENCE_REPORTED_UNVERIFIED`
   - `AWAITING_ISSUER_AND_SOURCE_CHECK`
   - `MISSING_REQUIRED_CONTENT_OR_SCOPE`
4. As entries are typed, the only newly reported status is **REFERENCE LOGGED — UNVERIFIED**, not document received, current limit legally approved, method validated or lot PASS.
5. Export a **blank 175-row CSV** for external coordination (deliberately excludes all self-entered draft reference metadata), an explicitly labeled metadata-only CSV containing only currently reported records, or the session metadata JSON. User can later select the exported JSON for **local-only reload**.
6. Import enforces exact expected schema, unchanged pinned source digest, known 175 request IDs, unique IDs, allowed metadata-only fields, fixed maximum lengths, allowed reference types and triage statuses, and hard **0 approved legal articles / 0 PASS**. It rejects unknown fields and any positive approval, method or product pass fields without applying a partial import.

**Important disclosure:** No auto-save or email/GitHub write occurs. Data remain in **browser memory only** until the page reloads. Exported JSON/CSV may contain custodian or document reference metadata typed by the user: inspect before sharing or uploading. Do not type confidential controlled BOMs, individual personal details, sensitive legal advice or actual CoA contents.

## Actual evidence-review gates required before a real regulatory decision

| Original gate | Functional reviewer role | Evidence cannot be closed until |
|---|---|---|
| Official method/version precedence | FSSAI method-source authority and laboratory director | Authentic current manual/order, title, date, method scope and adoption are verified; competing 2024 09.xxx method identities reconciled |
| Commercial product identity | Manufacturer or supplier QA | Exact marketed finished form, manufacturer formulation/label, authorised source and controlled sample identity independently confirmed |
| Actual legal CTR article and analyte | Regulatory Affairs / Legal | Enacted effective notified commodity article, named analyte, matrix basis, units and numeric maximum signed for the actual product |
| Laboratory matrix and method | Laboratory Technical Manager | Selected method, validated analyte-specific matrix and LOQ, current NABL scope, laboratory notification status if applicable, and representative sample conditions independently checked |
| Lot CoA and independent sign-off | Site QA plus independent Regulatory reviewer | Traceable lot and representative accredited method report with uncertainty, actual result, date and separate human legal/quality release determination |

### New official laboratory provenance

The [FSSAI official Food Laboratories page](https://fssai.gov.in/food-testing/food-laboratories) describes **NABL-accredited, FSSAI-notified primary food laboratories** and links the list **as of 7 September 2026**. That establishes a place to check notification, not proof that *any particular chosen lab* holds the right current **product-matrix, analyte, method/LOQ and accreditation scope**. No specific lab has been selected for the 35 unresolved cases. Independent scope and current certificate verification remain mandatory.

Other governing sources retained:
- [FSSAI CTR Version IX hosted 3 February 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf) — source reference, not automatically a signed commodity-to-limit matching.
- [FSSAI official testing methods index](https://www.fssai.gov.in/food-testing/manuals-methods-analysis) — full method title, official adoption and appropriate matrix still need verification.
- [Original May 2026 notified CTR Gazette](https://www.fssai.gov.in/upload/uploadfiles/files/272840.pdf) — effective **1 December 2026**, not applicable as current 16 October law.
- [Laboratory/sample analysis amendment Gazette 2026](https://egazette.gov.in/WriteReadData/2026/276298.pdf) — future **1 April 2027** effect, not a retroactive method-approval mechanism.

## All 35 inherited case registers

| Existing catalogue rank | Priority | Product / ingredient / class | Original request range | Signed gate count |
|---:|---|---|---|---|
| 1 | P0 | Drinking Water (Purified) sold through vending machine | PMSV44-01-01–PMSV44-01-05 | 0/5 signed |
| 3 | P0 | Formulated supplements for children | PMSV44-03-01–PMSV44-03-05 | 0/5 signed |
| 6 | P0 | Seedless Tamarind | PMSV44-06-01–PMSV44-06-05 | 0/5 signed |
| 7 | P0 | COCONUT MILK POWDER | PMSV44-07-01–PMSV44-07-05 | 0/5 signed |
| 8 | P0 | Cocoa Beans | PMSV44-08-01–PMSV44-08-05 | 0/5 signed |
| 9 | P0 | Dry Mixtures of Cocoa and Sugars | PMSV44-09-01–PMSV44-09-05 | 0/5 signed |
| 10 | P0 | Cocoa mass or Cocoa/Chocolate Liquor and Cocoa Cake | PMSV44-10-01–PMSV44-10-05 | 0/5 signed |
| 20 | P0 | Misri | PMSV44-20-01–PMSV44-20-05 | 0/5 signed |
| 21 | P0 | Polyols permitted under Appendix-A of FSS(FPS&FA) Regulations,2011 excluding those already standardized | PMSV44-21-01–PMSV44-21-05 | 0/5 signed |
| 30 | P0 | Cow or Buffalo Colostrum and Colostrum Products | PMSV44-30-01–PMSV44-30-05 | 0/5 signed |
| 31 | P0 | Royal Jelly | PMSV44-31-01–PMSV44-31-05 | 0/5 signed |
| 33 | P0 | 14.3 - Narikela Ksheerika (Milky Coconut Delight) | PMSV44-33-01–PMSV44-33-05 | 0/5 signed |
| 34 | P0 | 14.7 - Ksheerapaka (Mystic Milk Quartet) | PMSV44-34-01–PMSV44-34-05 | 0/5 signed |
| 2 | P1 | Coffee-Chicory Mixture | PMSV44-02-01–PMSV44-02-05 | 0/5 signed |
| 4 | P1 | Frozen Fruits/Fruit Products | PMSV44-04-01–PMSV44-04-05 | 0/5 signed |
| 5 | P1 | Catechu (Edible) | PMSV44-05-01–PMSV44-05-05 | 0/5 signed |
| 11 | P1 | Chia Seeds | PMSV44-11-01–PMSV44-11-05 | 0/5 signed |
| 12 | P1 | Carob Powder | PMSV44-12-01–PMSV44-12-05 | 0/5 signed |
| 13 | P1 | Arrowroot | PMSV44-13-01–PMSV44-13-05 | 0/5 signed |
| 14 | P1 | WATER CHESTNUT FLOUR (SINGHARE KA ATTA) | PMSV44-14-01–PMSV44-14-05 | 0/5 signed |
| 15 | P1 | Animal Casings | PMSV44-15-01–PMSV44-15-05 | 0/5 signed |
| 16 | P1 | Egg powder | PMSV44-16-01–PMSV44-16-05 | 0/5 signed |
| 17 | P1 | Pickled Eggs | PMSV44-17-01–PMSV44-17-05 | 0/5 signed |
| 18 | P1 | Dried Glucose Syrup | PMSV44-18-01–PMSV44-18-05 | 0/5 signed |
| 19 | P1 | Edible Lactose | PMSV44-19-01–PMSV44-19-05 | 0/5 signed |
| 22 | P1 | Salt Substitutes | PMSV44-22-01–PMSV44-22-05 | 0/5 signed |
| 23 | P1 | Trehalose | PMSV44-23-01–PMSV44-23-05 | 0/5 signed |
| 24 | P1 | Sajji Khar | PMSV44-24-01–PMSV44-24-05 | 0/5 signed |
| 25 | P1 | Additives permitted under Appendix-A of FSS (FPS&FA) Regulations, 2011 and other food safety standards regulations excluding those already standardized and additives of Nutraceutical Regulations | PMSV44-25-01–PMSV44-25-05 | 0/5 signed |
| 26 | P1 | Additives VA-VF of Nutraceutical Regulations excluding those already standardised | PMSV44-26-01–PMSV44-26-05 | 0/5 signed |
| 27 | P1 | Permitted enzymes and their preparations excluding those already listed under Processing Aids and Nutraceutical Regulations | PMSV44-27-01–PMSV44-27-05 | 0/5 signed |
| 28 | P1 | Ingredients listed under Schedule IV, Schedule VI and Schedule VIII of Nutraceutical Regulations | PMSV44-28-01–PMSV44-28-05 | 0/5 signed |
| 29 | P1 | Mixtures/preparations/premix of functional ingredients | PMSV44-29-01–PMSV44-29-05 | 0/5 signed |
| 32 | P1 | SILVER LEAF (Chandi-ka-warq) | PMSV44-32-01–PMSV44-32-05 | 0/5 signed |
| 35 | P1 | Dietary Fibre (Dextrin-soluble fibre) | PMSV44-35-01–PMSV44-35-05 | 0/5 signed |

These lines represent a **documentary evidence-triage queue** only. A complete regulatory review is still contingent on real externally supplied and authenticated evidence. Historical request numbering and prior no-PASS dispositions remain unchanged.

## GitHub preview delivery and test controls

- `fssai-product-helper-preview-01/data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json` — 35 × 5 immutable gate schema, reviewed FSSAI source pointers and allowed reference types.
- `fssai-product-helper-preview-01/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.js` — searchable/filterable 175-gate panel, memory-only reference input, blank/metadata CSV and local JSON import/export, no approval controls.
- `tests/fssai-current35-proof-reference-triage-batch56-2026-10-16.test.cjs` — Node assertions and Playwright Chromium checks for 35/175 gate continuity, 70/105 dependency split, five roles, filters, reference entry and export, JSON local restore, and atomic rejection of unknown/positive approval imports.
- `.github/workflows/verify-fssai-current35-proof-reference-batch56.yml` — standalone automated run in GitHub Actions.
- `fssai-product-helper-preview-01/index.html` — includes Batch56 JS after Batch55 in the **isolated preview only**.

**No FSSAI official or laboratory has been contacted or committed by this batch; none of the 35 cases has moved to a compliant or authorised state.**
