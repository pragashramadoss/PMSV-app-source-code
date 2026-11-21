# PMSV R19 — conditional contaminant source and evidence-gate audit — 3 November 2026

## Scope

R17's 61 conditional rows and R18's 64 conditional rows were rechecked against FSSAI CTR Version IX (03.02.2026). **125 source rows across 55 actual catalogue identities** have been reviewed at the source-table level. **23 previously missing PDF-page locators were resolved.** This is not current-law total-panel verification, product approval, or commercial lot release.

| Status | Actual count |
|---|---:|
| All catalogue identities preserved | 533 |
| Conditional rows source/page checked | 125 |
| Product identities with these rows | 55 |
| PDF locators recovered | 23 |
| Same-product/same-analyte overlapping article groups | 8, affecting 5 products |
| Product-specific exact article gaps still pending actual adjudication | 137 |
| Without a defensible conditional article | 82 |
| Fully approved CTR panels / product releases | 0 / 0 |

## Important legal-source controls

1. **Tin**: Version IX names 250 mg/kg for canned foods other than beverages and 150 mg/kg for canned beverages. Actual primary pack and finished-food beverage/non-beverage classification must be established. Canned cannot be inferred solely from thermal processing; no pouch/bottle-to-can substitution.
2. **Pesticides without an MRL**: Version IX prints the 0.01 mg/kg tolerance note for cases of pesticides for which MRLs have not been fixed. This is not a blanket fallback where a product-specific MRL is unknown or a fixed MRL already exists.
3. **Aflatoxins**: cereal/cereal products have total aflatoxins 15 µg/kg; the named food-containing-commodity article has 20 µg/kg. Both named source articles carry aflatoxin B1 10 µg/kg. Legal classification must not be chosen simply to obtain a favourable result.
4. **Grains**: Malathion and Malaoxon must be combined as specified. Milled-foodgrain pesticide values do not automatically transfer to raw grains or enriched/composite flour. Deltamethrin distinguishes ordinary milled foodgrains 0.2 mg/kg and wheat flour 0.3 mg/kg.
5. **Sugar and fungi**: Lead 5 mg/kg for the named high-sulphated-ash sugar article requires strictly >1.0% sulphated ash. Agaric acid 100 ppm concerns food containing mushrooms, not every fungus.
6. Original Gazette amendments prevail where a compendium conflicts. The 1 December 2026 CTR amendment is not active on 3 November 2026; the October tea-pesticide amendment is a draft.

Source PDF: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf
Captured PDF SHA-256: `8300ea34f1e88680ae4bbef52e0ec49331dbbfd1d5d6aa2612852bcb8779b26d`.

For all 125 candidate rows, the reported article anchor and numeric limit token are present in proximity within the relevant PDF page text; this is source provenance, **not** proof of applicability to a SKU. The 23 missing page locators were recovered from the relevant official page tables. Five products have eight same-analyte overlapping article groups: Sterilized Fungi, thermally processed fruit salad/cocktail, thermally processed fruits, thermally processed vegetables, and vegetable/mushroom pickles. The article selection must be recorded, not cherry-picked.

## Test evidence and integration boundary

- 2,964 structural/preservation assertions; 1,080 standalone source guard assertions; 36 Chromium desktop/mobile/browser/export assertions: all passed.
- All 533 catalogue IDs retained; filters returned 55 conditional candidates, five overlapping-article products, 82 without source candidates and 533 total.
- At 1440/390/320 px there were no page-level overflow or JavaScript errors; filtered CSV export retained all 533 IDs.
- Standalone source guard returns only an assessment of a conditionally selected *single source row* after actual article, pack, method and test evidence. It never returns full product compliance, full CTR-panel approval, or batch release.
- The source-article register, 55-product evidence-request sheet, guard, interactive viewer and tests are delivered as offline artifacts. **They are not wired into the production decision engine.** No operative numeric CTR rule or approval field was modified in R19.

PR #2 remains draft/unmerged. Production `gh-pages` is unchanged.

## Next
Collect actual SKU formulation, ingredient species and percentages, process, primary pack, test method and report for the 55 conditional candidate products. Reconcile the other 82 without a safe source candidate. Then perform full current-law analyte/processing-factor/residue-panel completeness review. No product PASS without verified evidence.
