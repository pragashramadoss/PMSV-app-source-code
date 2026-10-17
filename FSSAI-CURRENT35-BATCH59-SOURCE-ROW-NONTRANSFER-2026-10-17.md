# PMSV FSSAI Batch 59 — Exact official CTR reference-row comparison without illegal commodity transfer

**Research date:** 17 October 2026.  
**Implementation:** Isolated FSSAI helper on GitHub Pages (`gh-pages` branch), **not** WordPress production or app `main`.

## Completed research and release constraint
The official FSSAI-hosted [Contaminants, Toxins and Residues Compendium version IX, dated 3 February 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf) was inspected for relevant named rows, source basis and different commodity expressions. **The compendium is not itself the original operative Gazette**: if any overlap, amendment or dispute occurs, the [FSSAI original-amendment index](https://fssai.gov.in/food-law/regulations/amendments/contaminants-toxins) must be checked before adoption.

Research recorded **15 cited, specifically different source rows** against existing cases. These are authentic as-published *comparison references*, **not confirmed legal standards for the selected cases**. Another **20 cases have no comparator selected in this batch**, which is *not* a claim that no legal limit exists. All 35 cases remain OPEN.

| Existing baseline | Count |
|---|---:|
| Product catalogue / conditional source matches | 533 / 498 |
| Current CTR cases held | 35 |
| P0 / P1 | 13 / 22 |
| Immutable existing `PMSV44` source request IDs | 175 |
| Independent preparatory / dependent unsent owner requests | 70 / 105 |
| Related source comparator rows inspected (no transfer) | 15 |
| No selected research comparator in this batch | 20 |
| Original authenticated case-specific Gazettes, marketed-product identity, signed case maximum, selected accredited lab/method scope, actual lot PASS | 0 |

## 15 higher-risk non-transfer comparisons

The page column is **PDF page number, counted from 1** (not chapter section). Every value below applies **to the quoted source article as published in the compendium** and **must never be automatically shown as the regulatory maximum for the catalogue product**.

| Catalogue rank | Held article (analyte) | Different CTR compendium article (PDF p.) | Published comparator only | What must not be assumed |
|---|---|---|---|---|
| 1 | Purified vending water (Lead) | Packaged drinking water excluding mineral water (p.5) | 0.01 mg/L | Vending dispense form is not necessarily packaged water. |
| 2 | Coffee–chicory mixture (Ochratoxin A) | Coffee (p.15) | 5 µg/kg | Blended coffee–chicory is not explicitly the named coffee article. |
| 3 | Formulated child supplements (Lead) | Infant milk substitutes/infant foods (p.4) | 0.2 mg/kg | Children’s supplements are not necessarily infant foods. |
| 6 | Seedless tamarind (Copper) | Pulp and pulp products of any fruit (p.7) | 5 mg/kg | Need actual processed commodity form. |
| 7 | Coconut milk powder (Lead) | Milks (p.5) | 0.02 mg/kg | Coconut milk is plant-derived, not dairy milk. |
| 8 | Cocoa beans (Lead) | Cocoa powder (p.3) | 5 mg/kg, dry fat-free basis | Bean does not have powder's validated conversion basis. |
| 9 | Dry cocoa/sugar mixtures (Lead) | Cocoa powder (p.3) | 5 mg/kg, dry fat-free basis | Composite mixtures are not identical to pure powder. |
| 10 | Cocoa mass/liquor/cake (Lead) | Cocoa powder (p.3) | 5 mg/kg, dry fat-free basis | Different processing and fat basis; no transfer. |
| 18 | Dried glucose syrup (Lead) | Solid glucose and starch conversion products with sulphated ash above 1.0% (p.4) | 5 mg/kg, conditional | Must establish named form and ash threshold. |
| 20 | Misri (Chromium) | Refined sugar (p.13) | 0.02 mg/kg | Misri cannot be silently treated as refined sugar. |
| 21 | Generic polyols class (Nickel) | Sorbitol (p.13) | 2.0 mg/kg | One individually named polyol does not set whole-class maximum. |
| 22 | Salt substitutes (Lead) | Food-grade salt (p.6) | 2.0 mg/kg | Different salt substitute constituent/form. |
| 30 | Colostrum/products (Lead) | Milks (p.5) | 0.02 mg/kg | Colostrum and processed colostrum not automatically ordinary milk. |
| 33 | Narikela Ksheerika (Lead) | Milks (p.5) | 0.02 mg/kg | Coconut/ayurvedic composite product not dairy milk. |
| 34 | Ksheerapaka (Lead) | Milks (p.5) | 0.02 mg/kg | Composite Ayurvedic food requires separate identity and original law. |

**Original page verification in this batch:** lead/cocoa powder p.3; packaged drinking water/milk p.5; lead/sugar/supplements p.4; copper/fruit pulp p.7; nickel/sorbitol and chromium/refined sugar p.13; ochratoxin A/coffee p.15. The primary compendium was inspected via PDF page rendering. The value expression is copied only to a *research comparator* field and is expressly blocked from being a case limit.

## Source timing and laboratory notice
The [original 2026 CTR amendment Gazette hosted by FSSAI](https://fssai.gov.in/upload/uploadfiles/files/272840.pdf), Part III Section 4, PDF page 4, was directly inspected on 17 October 2026. **Regulation 1(2) explicitly states that the amendment comes into force on 1 December 2026**. Its changes cover pulse flours, arsenic in oils, cadmium/pulses, aflatoxin oilseeds, safrole and veterinary-antibiotic items; they are **not yet operative on 17 October 2026**, nor is this Gazette evidence of the correct legal product-specific comparator for any of the 35 holds. The original is linked through the [official amendment history](https://fssai.gov.in/food-law/regulations/amendments/contaminants-toxins). The FSSAI [notification index](https://fssai.gov.in/food-law/notifications?notification=gazette-notification) includes the **30 September 2026 NABL-accredited-laboratories Gazette**, which is more recent than some earlier lab directories. A specific lab status or method matrix scope **has not been authenticated** by these index links; obtain the original Gazette, exact laboratory entity/location and certificate/scope for the sample date.

## Preview implementation and safeguards
- JSON: `fssai-product-helper-preview-01/data/rules/fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json`
- UI: `fssai-product-helper-preview-01/fssai-current35-reference-row-nontransfer-batch59-2026-10-17.js`
- Full dataset digest and B56/B57/B58 ancestry are validated before any panel renders.
- Preview provides source-search, P0/P1 and comparator/pending filters, PDF page links and CSV export **always with case-approval false flags**.
- No export is a lab CoA or case-level determination; no send, local browser persistence, third-party data upload or external backend write.
- Test: `tests/fssai-current35-source-comparator-nontransfer-batch59-2026-10-17.test.cjs`
- CI workflow: `.github/workflows/verify-fssai-current35-ctr-source-nontransfer-batch59.yml`

## Next actual closure prerequisites
Obtain actual manufacturer identity and original case-specific Gazette for each product before interpreting a numerical maximum. Resolve laboratory recognition and exact analyte/method/food-matrix/LOQ scope, then representative batch-specific original signed analytical evidence and independently authorized disposition. This preview never grants a PASS.
