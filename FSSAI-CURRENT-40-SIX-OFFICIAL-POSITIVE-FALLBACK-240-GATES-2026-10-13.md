# PMSV FSSAI Helper — positive generic CTR metal source path for all 40 pending identities

**Date:** 13 October 2026. **Scope:** GitHub `gh-pages` evaluation preview only; WordPress unchanged. Current ledger remains **533 / 493 conditional partial named sources / 40 first exact named finished-article source pending**. This work **does not** award compliance clearance or promote a product from pending.

## Official FSSAI legal source and direct findings

[FSSAI Food Safety and Standards (Contaminants, Toxins and Residues) Regulations, Version IX, 03.02.2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), §2.1.1, PDF pages 1, 4, 7, 9, 11–12.

The official table contains six actual **"Foods not specified"** rows:

| Metal contaminant | Official article | Limit | PDF page |
| --- | --- | ---: | ---: |
| Lead | Foods not specified | 2.5 mg/kg | 4 |
| Copper | Foods not specified | 30 mg/kg | 7 |
| Arsenic | Foods not specified | 1.1 mg/kg | 9 |
| Tin | Foods not specified | 250 mg/kg | 11 |
| Cadmium | Foods not specified | 1.5 mg/kg | 12 |
| Mercury | Foods not specified | 1.0 mg/kg | 12 |

The same official table specifies **Methyl Mercury (Calculated as the element) — All foods: 0.25 mg/kg**, PDF page 12. That is a different **all-foods legal article**, not a resolution of a missing named product-specific contaminant row.

**§2.1.1 also addresses chemicals described in monographs of the Indian Pharmacopoeia when used in foods.** Where relevant, the substance identity and any applicable monograph need to be checked rather than automatically choosing a catch-all food article.

## What was done

A regulator-source-locked JSON dossier now covers all 40 currently first-named-article-pending identities, including:

- Each product's exact unchanged FoSCoS category ID and FSSR identity, official CTR IX source, known named-product non-transfer boundary, positive evidence question, and original product-specific review group.
- A source-first *decision hierarchy*: verify what the actual marketed finished food is; find any specifically named metal article and its processing/analytical conditions; check Indian Pharmacopoeia monographs where relevant; consider each metal's **"Foods not specified"** row only if no named article governs that metal and the item is in legal food scope.
- Six exact official *source rows* per identity (**240 conditional source paths**) whose published legal thresholds are shown as reference evidence, **not** auto-assigned numerical limits.
- A separate universal methylmercury reference with explicit laboratory and finished-article conditions.

The 40 products include cocoa beans, cocoa mass/cake, composite cocoa sugar mix, quinoa, chia, frozen produce, purified vending water, egg products, sugars, dairy analogues, additives, enzymes, nutraceutical premixes, royal jelly, silver leaf and Ayurveda Aahara recipes. The source classification cannot be assumed merely because one source row is labeled "Foods not specified"; absence of a proven named row is not evidence of its legal absence.

## Regression, negative-transfer and status guarantees

The new preview module `fssai-current40-positive-metal-fallback-sources-2026-10-13.js` loads the official-source evidence after the previous 40 comparison panels and before the quality reconciliation panel. It requires exact joins to the current 533-product ledger and the 40-product pending queue. If it detects unexpected product changes, status changes, source URL, any numerical limit changes, incomplete branches, or tampered data, it fails closed.

Test suite: `tests/fssai-current40-positive-metal-fallback-sources-2026-10-13.test.cjs` (included in the fast `verify-fssai-pending-40-quality-coverage.yml` GitHub Action).

The **negative** findings are still separate from these **positive generic source** rows: named cocoa powder limits do not transfer to cocoa mass, packaged water to vending water, milks to coconut milk powder, processed eggs to shell-egg tissue matrices, named sugar ash subtypes to other sugars, or cereal grain metal limits to explicitly excluded quinoa.

**Outcome:** 533 identities; 493 partial conditional first named sources; 40 named finished-product source gaps still awaiting positive applicability; 31 of the pending 40 have separate FSSR-quality dossier linkage and 9 do not. There are **zero source promotions, zero numeric limits automatically applied, zero laboratory passes and zero product regulatory approvals** in this batch.
