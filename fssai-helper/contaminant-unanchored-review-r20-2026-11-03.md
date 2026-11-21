# PMSV R20 — review of the remaining 82 CTR source-article cases
**3 November 2026 | FSSAI Version IX (03.02.2026) | audit only**

## Reconciled result
R19 left **82 catalogue identities without a supported product-specific contaminant source-article candidate**. R20 checked all 82, locating **37 additional source-condition rows for 19 distinct catalogue identities**. The remaining **63** lack a defensible additional finished-product article. The previous 55 products/125 conditional rows remain unchanged, so the cumulative conditional-source population is **74 products / 162 rows**. The original **137 product-specific legal article gaps are still unadjudicated**. There are **zero** full current CTR panels verified, zero complete product approvals, and zero commercial releases.

| R20 source analyte | New conditional rows |
|---|---:|
| Lead | 15 |
| Copper | 6 |
| Tin | 4 |
| Arsenic | 5 |
| Total aflatoxins | 4 |
| Aflatoxin B1 | 3 |
| **Total** | **37** |

A compact product-ID/count manifest is saved in `fssai-helper/contaminant-r20-scope-manifest-2026-11-03.json`. The full source-row register, interactive all-533 reviewer, evidence-gate code and 82-product queue are delivered as separate downloadable offline companions.

## Technically important findings
- **Mango chutney versus generic chutney:** Lead **1 mg/kg** and Tin **250 mg/kg** are named *Mango Chutney* source articles, not blanket rules for mixed fruit/vegetable chutney.
- **Jaggery, misri and dried glucose:** Lead **5 mg/kg** under the named high-sulphated-ash sugar/glucose article requires **strictly >1.0%** sulphated ash. Misri has a competing Lead **0.5 mg/kg** source candidate *only if* it is legally refined white sugar with sulphated ash **≤0.03%**. No favourable selection or interpolation is allowed.
- **Tomato-derived vegetables:** Lead **1.5 mg/kg** for processed tomato concentrates, Copper **100 mg/kg on dried tomato solids** for named tomato puree/paste/powder/cocktails, and Tin **250 mg/kg** for processed tomato concentrates all require actual tomato article and correct analytical basis. Ordinary vegetable pulp is not automatically tomato.
- **Dry spice / flavouring / colour preparations:** Source rows are preserved only as conditional candidates. Mixed seasonings, spice oleoresins, colouring foods, synthetic-colour premixes and flavouring premixes need legally verified substance classes and the stated dry-matter/dry-colouring-matter bases.
- **Composite foods and aflatoxins:** Pan Masala and vegetable protein products may need the named *food containing a specified crop* article after ingredient/species verification. Custard powder has competing source article candidates for **15 µg/kg** total aflatoxins (cereal and cereal products) versus **20 µg/kg** (food containing a named article), with **10 µg/kg Aflatoxin B1**—the legal product class is not chosen to obtain the more favourable number.
- **Canned curried vegetables:** The named Tin **250 mg/kg** canned-food article requires an actual canned non-beverage product; retort pouch, bottle or aseptic pack are not automatically cans.
- **Chemical identity:** Catalogue L(+/-)-tartaric acid is not silently equated to the specifically named source L(+)-tartaric acid Lead **2 mg/kg** and Arsenic **3 mg/kg** articles.

## Sources and effective-date safeguards
Official CTR Version IX (03.02.2026), PDF pages 2–11 and 14:
https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf

Captured 56-page source SHA-256: `8300ea34f1e88680ae4bbef52e0ec49331dbbfd1d5d6aa2612852bcb8779b26d`. Each of the 37 new rows has an article-anchor and numeric token found in proximity on the cited source page. Source wording confirmation is **not** a finding that any particular SKU satisfies the legal article.

The 2026 CTR final amendment is expressly effective **1 December 2026**, not operative on **3 November 2026**:
https://www.fssai.gov.in/upload/uploadfiles/files/272840.pdf

The 15 October 2026 proposed pesticide MRLs for tea remain listed as a **Draft**, not activated.

## Checks and integration boundary
- 37/37 official PDF article anchors and 37/37 cited numerical limits checked against captured pages.
- 303 standalone source-row/fail-closed assertions passed.
- 520 deterministic evidence-gate assertions passed, including explicit legal-article selection, high-ash strictness, dry analytical basis, stereochemical identity, primary packaging, numeric unit and no release.
- 33 Chromium checks passed at 1440/390/320 px. Filters returned 82/19/63/533 as designed, search worked and CSV export retained all 533 unique catalogue IDs; no JavaScript errors or horizontal page overflow.
- Chromium used set_content on the exact offline HTML; **not native Android or live PMSV production testing**.

**No operative numeric contaminant module, product master, approval/release flag or production file has been modified in R20.** The R20 GitHub audit checkpoint and manifest document the review and its limits; the complete 37-row source comparator remains a downloadable companion, not a live engine feature. Draft PR #2 remains unmerged.

## Next action
Collect the 19-product evidence sheet: exact SKU/recipe, botanical or stereochemical identity, sulphated ash/dry solids where specified, processing, primary packaging, analytical method, measured basis and exact legal article approval. Continue the remaining 63 cases with original-notification and raw commodity/processing-factor review. No product PASS without independently verified applicable law and actual evidence.
