# PMSV FSSAI Helper — 40 exact named finished-article proof cases

**Reviewed:** 13 October 2026. **Deployment:** GitHub `gh-pages` preview only; WordPress unchanged.

## Current canonical source ledger
| Field | Count |
| --- | ---: |
| FoSCoS/FSSR product identities | 533 |
| Partial conditional first named CTR routes | 493 |
| First named finished-product CTR routes pending | 40 |
| Pending foods with direct, separate FSSR quality evidence | 31 |
| Pending foods without direct finished-standard quality dossier | 9 |
| Product-specific decisive source distinctions written in this batch | 22 |
| Unsupported first-source promotions, numeric limit applications, and laboratory/regulatory approvals | **0** |

## Source-grounded closing decisions, not extra generic comparisons

1. **Cube sugar:** FSSR 2.8.1(5) identifies the raw material as refined crystallised sugar, but finished **cube sugar** remains separately standardized. CTR IX chromium for *refined sugar* is a meaningful conditional research candidate, **not automatically applicable**. FSSR **total ash ≤0.03%** is analytically different from CTR sugar lead's **sulphated ash** qualifier.
2. **Misri:** FSSR 2.8.2 permits a candy from any sugar or palmyrah juice. Its **total ash ≤0.4%** is not a sulphated-ash result or proof of refined-white-sugar identity.
3. **Dried glucose syrup:** FSSR 2.8.7 specifies sulphated ash **at most 1.0%**; CTR lead row on high-ash starch conversion materials requires **more than 1.0%**. Do not assign an internally contradictory high-ash lead threshold to conforming dried glucose syrup.
4. **Fruit cheese:** FSSR 2.3.33 defines cooked fruit pulp/purée and sugar. CTR's *pulp and pulp products of any fruit* is a **candidate requiring finished-article legal interpretation**, not an established threshold for cooked fruit cheese.
5. **Quinoa:** FSSR 2.4.6(18) standardizes the grain; CTR IX lead and cadmium cereal-grain provisions **expressly exclude quinoa**. Evaluate the separately worded aflatoxin cereals article independently.
6. **Chia seeds:** FSSR 2.4.6(25) defines *Salvia hispanica L.*, a mint-family seed. Cereal/oilseed category matches cannot be inferred from navigation placement alone.
7. **Egg powder and pickled eggs:** Identify the egg-derived subtype, whole/white/yolk fraction, veterinary residue and concentration/processing sample basis before applying a CTR *Eggs* article to the marketed processed food.
8. **Coconut milk powder:** FSSR 2.3.63 is coconut-derived and allows maltodextrin and sodium caseinate. This is not automatically a dairy milk powder for named contaminant purposes.
9. **Cocoa beans, mass/cake and cocoa-sugar mixture:** CTR cocoa-powder lead/copper are on a *dry fat-free substance* basis; they do not transfer automatically to other fat/matrix forms.
10. **Vending-machine purified water:** FSSR 2.10.9 differs from packaged drinking water; obtain current IS 10500 and final point-of-sale sampling requirements separately.
11. **Royal jelly:** FSSR 2.8.3(3) is a raw bee-gland secretion rather than honey or beeswax; named honey/beeswax values do not transfer.
12. **Ayurveda Aahara recipes:** Official compendium Ksheera items 29.8 and 29.12 have their own full recipes and Schedule D; the FoSCoS labels 14.3 and 14.7 are not those recipe indexes.

## Implementation
- `fssai-product-helper-preview-01/data/rules/fssai-current40-decisive-positive-article-review-2026-10-13.json` — exactly 40 identity-matched records. Includes 22 specifically written finished-product distinctions, direct official FSSAI/FoSCoS links, preserved original questions and strict unverified status.
- `fssai-product-helper-preview-01/fssai-current40-decisive-positive-article-review-2026-10-13.js` — source review and individual collapsible evidence panel; fails closed on changed source identities.
- `tests/fssai-40-decisive-positive-article-review-2026-10-13.test.cjs` — exact 40/31 ledger join, unassigned numeric limits, 6 specific source-dispute checks, tampering and UI-regression checks.
- `.github/workflows/verify-fssai-40-decisive-positive-review-2026-10-13.yml` — automatically checks JavaScript syntax and independent source regression.

## Regulatory sources (official only)
- [FSSAI Contaminants, Toxins and Residues Regulations, Version IX, 03.02.2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf)
- [FSSR Chapter 2.3, Fruit and Vegetable Products](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf)
- [FSSR Chapter 2.8, Sweetening Agents](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf)
- [FSSR Chapter 2.4, Cereals and Cereal Products](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_4%20%28Cereals%20and%20Cereal%20products%29%281%29.pdf)
- [FoSCoS standardized product catalogue](https://foscos.fssai.gov.in/standard-product)

**Outcome:** These are actionable positive-evidence requests, **not closure of the 40 first named-article cases**. No actual manufacturing batch documents, laboratory reports or authoritative exact-article applicability determinations were submitted in this batch.
