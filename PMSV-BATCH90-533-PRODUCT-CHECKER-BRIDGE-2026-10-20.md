# PMSV Batch90 — 533-product verified source-status → actual product checker bridge

**20 October 2026.** Implemented only in the isolated `gh-pages` FSSAI helper preview. Main and WordPress are not modified.

## User-facing improvement
Previously the Batch87 searchable source catalogue had only "View held case" for 35 and no way to open any of the 533 catalogue products in the original product-standard checker.

Now every entry exposes **Open in product checker**. Clicking it verifies the entire 533 source ledger and Batch88's original 35 research closeout against the actual standardized-product record using **the exact catalogue ID, product name, FSSR identity and FoSCoS code**. It opens the existing **Product catalogue** tab and `Selected product` card, where the user can explicitly choose **View standard** or **Use with formulation**. Merely clicking the research bridge does **not** alter the active formulation or confirm the product as the regulatory assessment target.

For each of the 35 original research-closed cases, the selected product card explains research closure versus ongoing legal/method/lot hold, the specific unresolved article, the first manufacturer document required, and a link to official FSSAI source. **Return to held source dossier** and **Back to source catalogue** maintain navigation. For 498 conditional source-reference cases, the card states that a reference alone does not prove finished-product compliance.

## Integrity, regression and test
- All **533 actual index catalogue records** match one source row exactly in ID, name, FSSR and FoSCoS.
- 35 source-stage desk reviews CLOSED; 35 actual marketed-product legal/regulatory verification HELD; 498 conditional first-source reference matches. **Zero** source limits auto-assigned, official lot CoAs loaded or lot releases.
- No network sends, upload, external database writes, local storage added or automatic original product selection. Existing user-selected formula is not replaced.
- New independent Node regression checks all 533 identities and case gating. Updated 390px full-preview Chromium test verifies navigation from a conditional reference and a 35-case held record, explicit distinction on selected card, and return to research dossier.
