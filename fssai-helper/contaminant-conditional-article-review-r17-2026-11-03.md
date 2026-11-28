# PMSV R17 — conditional contaminant article source review — 3 November 2026

Version IX source-article comparison has been extended for the existing **24** conditional product identities. They retain **37** previous conditional rows and gain **24** further rows: **17 Lead**, **5 Tin**, **2 Aflatoxin B1**. Total **61** source rows. The 533 catalogue identities are all preserved. The **137** product-specific article gaps remain pending actual product evidence; 113 currently have no supported conditional candidate. No full contaminant panel, product or lot approval is issued.

## Source findings
- Named canned-fruit and canned-vegetable Lead rules are **1 mg/kg** with actual subtype and final can required. Thermally processed does not automatically mean canned; Chapter 2.3 explicitly allows bottled, flexible and aseptic packaging.
- For **Pickled cucumbers (Cucumber pickles)**, Lead **1 mg/kg** is printed without a canned qualifier, so no metal-can requirement was invented.
- Tin **250 mg/kg** for **Canned foods other than beverages** is modelled only as a can- and non-beverage-confirmed source candidate; it is not a generic thermally processed-food limit.
- Aflatoxin B1 **10 µg/kg** for a food containing a named crop article is a separate possible condition from **Total Aflatoxins 20 µg/kg** for soybean-derived products. Actual soybean/formulation identity and finished-food sampling are required.
- Prior condition checks are preserved: sugar Lead **5 mg/kg** only for the named >1.0% sulphated-ash article; frozen ice cream not dry mix; Agaric acid **100 ppm** only where actual mushroom identity/ingredient is established. None is a blanket product pass.

## Primary sources
Version IX (03.02.2026): https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf
Chapter 2.3: https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf
Future amendment (effective 1 December 2026): https://www.fssai.gov.in/upload/uploadfiles/files/272840.pdf

## Tests and audit application
- **386** local structure/source preservation assertions passed.
- **816** standalone JavaScript scope, boundary, unit and no-approval assertions passed.
- **45** browser assertions passed at 1440/390/320 px; all 533 catalogue IDs render and export unfiltered from any display filter.
- Workflow **41629560468** succeeded with **649** audit core assertions and generated artifact **13227378216**, matching tested SHA-256 **6adf869fa9d67f074a6865e5c95d8600d5794aab96a7299a66292b9248ded9cd** byte-for-byte.

**Integration boundary:** only the 24 source-conditional metadata rows are committed to the draft audit branch. The full 61-row comparator, 24-product evidence request list, and HTML viewer are downloadable offline companions, not wired into the live PMSV decision engine. No operative numeric limit was changed. No full-current-law or commercial lot approval was granted. PR #2 remains draft/unmerged; production gh-pages is unchanged.

Next: collect actual product identity/packaging/species/recipe/test evidence for the 24 cases, then reconcile the other 113 without conditional source anchors and the complete analyte/pesticide/veterinary-drug/method/packaging/label layers.
