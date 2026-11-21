# PMSV R18 — CTR source-article review of 113 previously unanchored products
**3 November 2026 | draft audit branch only | not a current-law/lot approval**

## Actual scope and status
All 533 catalogue identities remain intact. R17 left **137 product-specific exact article gaps**: 24 had source-conditional candidates (61 rows), while 113 had no safe candidate. R18 reviewed every one of the 113 records. It identified **31 additional candidate products, 64 new conditional source rows**, leaving **82 products without a new defensible product-specific candidate**. The combined R17–R18 register has **55 product identities / 125 conditional rows**. **All 137 exact product-specific article gaps remain unadjudicated**; no full current contaminant panel is verified and no product/lot release is approved.

| Group | Products / rows |
|---|---:|
| R18 cereal products with conditional aflatoxin source articles | 8 / 16 |
| R18 composite food-containing-commodity candidates | 18 / 36 |
| R18 chia oilseed candidate | 1 / 2 |
| R18 vanilla dried-spice Lead candidates | 3 / 3 |
| R18 any-other-foodgrains raw grain Lead candidate | 1 / 1 |
| Additional milled-foodgrain pesticide rows for one of the above cereal products | 0 new products / 6 more rows |
| **R18 total unique products and new rows** | **31 / 64** |

## Source checks and limitations
Primary: [FSSAI CTR Compendium Version IX, 03.02.2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf). Page 14: Total Aflatoxins for 'Cereal and cereal products' 15 µg/kg versus 'Food product containing any of the above mentioned food articles' 20 µg/kg, with Aflatoxin B1 10 µg/kg for each specified article. Oilseed processing status is significant. Page 3: dried herbs/spices Lead 10 mg/kg dry matter and cereal grains excluding buckwheat/canihua/quinoa 0.2 mg/kg. Pesticide residue pages include milled-foodgrain article distinctions; Malathion requires combined Malathion/Malaoxon analytical residue reporting, not parent-only. The six scoped milled-foodgrain candidates belong to a named protein-rich refined flour only pending exact formulation and legal article selection. No composite article is assigned merely because a product contains grain, spice or soybean.

No actual recipe, species, processing factor, final product article or laboratory evidence was supplied in this review. The 64 source rows are reference candidates only: `auto_apply=false`, `article_adjudicated=false`, `full_ctr_verified=false`, `lot_release=false`. No generic 'foods not specified' numeric shortcut is enabled. The Version IX methyl-mercury universal all-foods rule remains separately applicable by its exact analytical matrix and unit. May 2026 CTR amendment commences 1 December 2026 and is not active on 3 November.

## Tests
Locally: **23,044 preservation assertions, 707 source/guard assertions and 36 Chromium browser assertions**, zero failures. All 533 catalogue IDs rendered/exported. Filter counts were 113 original unanchored, 31 newly conditionally anchored, 82 still unanchored, 24 previously conditionally anchored and 533 total. Three viewports (1440/390/320 px) had no page-level horizontal overflow or JS errors. These are software assertion counts, not independent laws or native Android release tests.

## Audit branch application
The preimage and output SHA-256 checks succeeded in [GitHub workflow run 41639464248](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/41639464248), with **741 core assertions**. Artifact 13231793770 was downloaded and **byte-identical** to the tested local core output. SHA-256 `318782a2239749440f749e61c1c853308605b9f88d4b488a311325b384a98537`.

**Integration boundary:** Only the selected 64 source-conditional candidates and review metadata were added to the current audit-branch contaminant module. The 113-case tailored evidence queue, remaining 82 list, all-533 standalone viewer, full JS comparator and test package remain offline companions and are not yet wired into the live PMSV decision engine. Earlier data and numeric limits remain unchanged. PR #2 stays draft/unmerged and production `gh-pages` unchanged.

**Next:** obtain actual finished-product recipes, commodity identity, processing/storage/packaging, test methods/residue definitions and current article confirmation, to adjudicate the 55 conditional products. Continue the 82 without safe candidates, then complete full contaminant panels and cross-regulatory layers. Do not mark PASS without verified evidence.
