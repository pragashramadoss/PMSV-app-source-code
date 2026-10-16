# PMSV FSSAI Helper — Batch 27: verified legal text versus finished-product legal applicability

**16 October 2026.** GitHub Pages preview only; WordPress production, canonical 533-product master ledger and previously entered reviewer drafts remain unchanged.

## What was actually resolved in this batch

1. Corrected two Batch26 document links that did not point reliably to the named product standard: coffee-chicory now links to the actual FSSR Chapter 2.10 (clause 2.10.4), and carob powder links to an official FSSR compendium (2.11.7). The Batch26 source checksum was regenerated and pinned.
2. Cross-checked **17 distinct named statutory contaminant source rows** against the actual [FSSAI CTR Version IX PDF, 03 February 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf).
3. Linked those statutory rows to **13 of the 35** outstanding finished-product IDs as *research comparators*, with explicit reasons not to inherit the cited limit. Remaining products are not silently marked clear.
4. Added a searchable statutory-source panel and per-product source-row references to the GitHub preview. Numeric values are shown with a conspicuous **published source only — not a finished-product limit** warning.

The operative-source search includes **17 verified table entries**; this is not 17 newly approved products and not 17 resolved cases.

## Important positive statutory findings

| Legal source article | Analyte | Published maximum | PDF page | Unverified transfer to |
|---|---|---:|---:|---|
| Cocoa powder | Lead | 5 mg/kg, dry fat-free substance basis | 3 | Cocoa beans, mass/liquor, carob and mixed cocoa-and-sugar |
| Cocoa powder | Copper | 70 mg/kg, fat-free substance basis | 7 | The same different cocoa forms |
| Coffee | Ochratoxin A | 5 µg/kg | 15 | Finished coffee-chicory mixture |
| Refined white sugar / dextrose | Lead | 0.5 mg/kg, qualifying refined-sugar ash basis | 2 | Misri and trehalose |
| Sugars/syrups with sulphated ash above 1% | Lead | 5 mg/kg | 2 | Misri and trehalose |
| High-sulphated-ash solid glucose/starch conversion food | Lead | 5 mg/kg | 4 | Dried glucose syrup and dextrin-soluble fibre |
| Refined sugar | Chromium | 0.02 mg/kg | 13 | Misri absent matching refined-sugar classification |
| Sorbitol | Nickel | 2 mg/kg | 13 | Undefined collective polyols |
| Composite food containing listed aflatoxin crop commodities | Total aflatoxins / B1 | 20 / 10 µg/kg | 14 | Generic nutraceutical schedules and premixes without actual ingredient bills |

Further individually verified rows cover sorbitol lead/arsenic, dried or roasted chicory/coffee beans copper, metal-specific fallback rows, and methylmercury in all foods.

## Crucial exclusions and gates

- The CTR PDF lists **different legal articles per analyte**. Lead's generic fallback is not arsenic's, copper's, cadmium's or methylmercury's.
- The CTR named **cocoa powder** row cannot be substituted for cocoa beans, cocoa liquor or carob powder. The dry/fat-free substance sampling basis matters independently.
- The legal text differentiates **sulphated ash** from product standards that measure **total ash** (including trehalose). One measurement cannot be substituted for the other.
- FSSR 2.10.4 positively standardises coffee-chicory mixtures; CTR ochratoxin A currently names coffee, not expressly the composite. A signed applicability decision is still required.
- The FSSR silver leaf purity requirement (minimum 999/1000 silver) is a product-quality/identity standard, not a CTR heavy-metal-specific contaminant article or lot conformity verdict.
- The 25 May 2026 final CTR amendment has a prospective **1 December 2026** commencement and has not been applied to the October 2026 assessment.

## Follow-up: what would genuinely close a source match?

Obtain the named **as-sold product identity** and official FSSR/FoSCoS classification, actual composition and manufacturing/packaging form; identify the operative named CTR article and analyte and its dry/mass/liquid analytical basis; and record the qualified independent legal applicability decision. For claims of sample conformity, obtain an approved sampling plan and actual method-specific lab result. Review documents and user-entered draft notes are **not** regulatory proof.

## Outcome

- 533 canonical product identities.
- 498 conditionally cited first sources, **not 498 lab/compliance passes**.
- 35 unresolved exact first-source adjudications, unchanged.
- 17 source-text rows checked; 13 of the unresolved products received explicit new statutory-source comparisons.
- **0** automatically assigned numeric finished-product limits.
- **0** new legal approvals or lot PASS.
- WordPress unchanged.

Machine-readable file: `fssai-product-helper-preview-01/data/rules/fssai-current35-source-row-proof-register-batch27-2026-10-16.json`.

Preview controls: `fssai-current35-source-row-proof-register-batch27-2026-10-16.js`.

Checks: `node --check fssai-product-helper-preview-01/fssai-current35-source-row-proof-register-batch27-2026-10-16.js` and `node tests/fssai-current35-source-row-proof-register-batch27-2026-10-16.test.cjs`.
