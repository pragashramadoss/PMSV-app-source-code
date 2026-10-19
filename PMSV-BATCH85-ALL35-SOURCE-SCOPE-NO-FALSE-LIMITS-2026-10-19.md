# PMSV Batch85 — complete 35/35 original-law article review, not fabricated contaminant limits

Date: 2026-10-19. Branch: `gh-pages` only. Does NOT edit `main` or live WordPress.

## What changed
- All **35/35** unresolved original cases are now selectable in the **existing** case/legal-source panel (not a new status dashboard).
- Preserve 23 verified numeric *other-article* source comparisons; add 12 case-specific nonnumeric scope exclusions with FSSAI CTR IX references and explicit market evidence required.
- For the 12 where no single source amount can defensibly be attributed to the as-marketed product, displayed amount is **NO SINGLE NUMERIC LIMIT AVAILABLE**. Export uses empty amount and unit cells, never `0`, `null`, blanket unspecified-food lead or a fabricated PASS.
- The 12 ranks completed: 3, 4, 5, 6, 13, 19, 23, 24, 26, 27, 31, 35. Original cases remain HELD, no signed applicability/lab method/CoA.
- Correct the `URL.createObjectURL` shadowing bug in the comparator CSV download: the document's local `URL` was a string used as a source path; use `window.URL` for a working CSV download.
- Export all 35 case legal-source scopes and original nontransfer reasons with 23 numerical reference cells + 12 deliberately blank cells.

## Direct source support
The FSSAI [CTR Version IX, 3 Feb 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf) records:
- Copper: pulp and pulp products of any fruit, 5 mg/kg, versus unspecified foods, 30 mg/kg (PDF p7). Seedless tamarind is not automatically pulp.
- Pesticide MRL table, `2.3.1`, enumerates each named insecticide and food. The 2,4-D line includes fruits and eggs but not a universal frozen-fruit, processed arrowroot or all-residues concentration (PDF p16).
- Dairy lead entries refer to milks or secondary milk products (PDF pp5–6); edible purified lactose needs its own article decision.
- The honey-production antimicrobial MRPL table explicitly concerns **honey production** (PDF pp40–41), not an expressed royal-jelly standard.
- Individually named additives, sugar classes and chemicals have different lead rows (PDF pp2–6). Generic enzyme, Sajji Khar, VA–VF additive, trehalose or soluble dextrin cannot inherit a named source value without proving identity.
- FSSR food-product compendium has a dedicated edible lactose chapter 2.1.20 and arrowroot chapter 2.4.14; product identity is distinct from CTR analyte applicability.

## Testing
Fast Node source-scope test: 35/35 exact case ranking, 23 numeric/12 null, immutable 175 original requests, zero approvals, zero lot releases.
Real Chromium integration: mobile 390px, all 35 selectable, negative royal-jelly and tamarind evidence, original 23 numeric cases, all-35 CSV `36` lines, actual browser CSV download event.

Never use the public GitHub preview to accept confidential supplier records. All original 35 cases require the actual commercial identities and signed legal and analytical adoption, not another source-only migration.
