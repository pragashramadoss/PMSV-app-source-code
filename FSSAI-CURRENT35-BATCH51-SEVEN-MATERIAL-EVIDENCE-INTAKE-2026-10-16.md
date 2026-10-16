# Batch 51 — Seven-material identity evidence intake, original 35 CTR legal holds intact

**Date:** 16 October 2026 | **Environment:** isolated `gh-pages` FSSAI helper preview | **WordPress production:** untouched.

## Completed original-source recheck

1. [FSSAI official FoSCoS food-category PDF](https://fcstraining.fssai.gov.in/assets/docs/Compiled%20FPC_FoSCoS.pdf), **PDF page 9 visually inspected** in this batch: category **99.1 Food Additives**, **99.2 Enzymes and Preparations**, **99.4 Processing Aids**, **99.7 Functional Ingredients**. Distinct licensing classifications are **not individual contaminant legal articles, methods or impurity monographs**.
2. [FSSAI compendium index](https://fssai.gov.in/food-law/regulations/compendium/food-products-standards) separately lists Appendix A (additives), B (microbiology), C (processing aids). FSSAI warns compiled text is not legal Gazette authority when discrepant.
3. [Official 2022 notified Gazette Appendix C Table 11A](https://fssai.gov.in/upload/notifications/2022/10/635f6a08b7c16Gazette_Notification_Processing_Aids_31_10_2022.pdf) includes specific genetically-modified-microorganism-derived enzymes with enzyme identity, donor/production organism and technological use. **Not all enzymes are in 11A**.
4. [Non-specified foods official FSSAI portal](https://www.fssai.gov.in/standards/non-specified-food) now advertises application outcomes **as of 1 September 2026**. Batch50 had relied on [June 3 older PDF](https://fssai.gov.in/upload/uploadfiles/files/Status_of_Application_as_on_03_06_2026.pdf) for specific named Sajji Khar closed/withdrawn applications. The September **specific rows have not been independently retrieved or rechecked**, so no claim about current Sajji legal or individual approval status is made.
5. [Live FoSCoS standardized product registry](https://fcstraining.fssai.gov.in/standard-product) is the registration classification layer, **not manufacturer approval**.
6. [Official 2022 Nutra direction](https://www.fssai.gov.in/upload/advisories/2022/03/6243ef28079ceDirection_Nutra_30_03_2022.pdf) informs historic schedule crosswalk; it does not prove every former entry currently operative.

## Seven identities: operational intake requirements

**Zero substances, CoAs, proprietary recipes or actual approvals have been supplied.** To make these cases genuinely actionable, this release implements **four case-specific evidence input fields for each of the seven cases (28 total)**, with source references, legacy legal gate IDs and an explicit request for exact active CTR article and method.

| Rank | Category | Four targeted evidence types |
|---:|---|---|
| 21 | Polyols permitted under Appendix-A of FSS(FPS&FA) Regulations,2011 excluding those already standardized | Exact polyol identity (INS/CAS); Grade and marketed form; Blend constituents and relative proportion; Applicable Ni limit, named purity monograph and method source |
| 24 | Sajji Khar | Sajji Khar exact chemical(s) / CAS; Supplier's product-specific lawful basis; Approval/application check against latest register; Exact applicable lead article and matrix method |
| 25 | Additives permitted under Appendix-A of FSS (FPS&FA) Regulations, 2011 and other food safety standards regulations excluding those already standardized and additives of Nutraceutical Regulations | Specific food additive and INS/CAS; Technological function and food category; Current individual grade/purity monograph; Specific lead impurity basis and matrix test |
| 26 | Additives VA-VF of Nutraceutical Regulations excluding those already standardised | Exact nutraceutical additive name / ID; Legacy schedule and specific entry; Current operative regulation / amendment and effective date; Specific impurity monograph and lead sample matrix |
| 27 | Permitted enzymes and their preparations excluding those already listed under Processing Aids and Nutraceutical Regulations | Named enzyme with EC number; Production organism and donor/source; Technological use, residual role and carriers; Applicable enzyme-grade purity and lead-method reference |
| 28 | Ingredients listed under Schedule IV, Schedule VI and Schedule VIII of Nutraceutical Regulations | Exact ingredient, plant species and used part; Original IV/VI/VIII row and current legal crosswalk; Origin/crop and actual processed lot form; Named aflatoxin analyte, legal article and method |
| 29 | Mixtures/preparations/premix of functional ingredients | Full BOM component identities / secure reference; As-sold marketed form, function and label category; Specific crop ingredient(s) and toxin(s); Signed final-product CTR article and sample-preparation method |

## Preview behaviour and security boundaries

- Browser **memory only**: no local/session storage or POST for the Batch51 input widget, no sync to repo or public back-end; values vanish upon reload/navigation. This applies to the new widget, **not** a security audit of all other scripts on the page.
- Inputs **never affect integrity-pinned baseline FSSAI regulations, CTR article, sample test or product PASS**. Four of four filled means **four entered draft fields**, not four verified documents or a signed product clearance.
- **Blank CSV template** of seven cases does **not** contain any typed commercial details; **explicit session JSON export** and **copy draft** DO include entered fields and carry privacy warning. User must review recipients and protection before sharing.
- Each case's sensitive detail remains optional and is **not** silently made publicly accessible or sent to FSSAI.
- Filters: all / started / no fields / all four entered (unverified). Search, per-case clear, clear entire session.
- Integrity-verifies all 7 legal case IDs against Batch50, all 35 existing legal-gate IDs, 28 field specs, source references and **0 PASS**.

## Status

| Metric | Count |
|---|---:|
| Catalogue | **533** |
| Conditional first-source matches | **498** |
| Current CTR legal/finished-article cases pending | **35** |
| Named official identities/recipes from B48–50 | **28** |
| Still require individual substance/product identity | **7** |
| Specific structured draft fields available | **28** |
| Actual evidence documents received | **0** |
| CTR legal-article approvals | **0** |
| Validated lab passes | **0** |

The older **175** documentary requests, **280** lab preflight questions and **210** future-rule prompts remain untouched. On or after 1 Dec 2026 and 1 Apr 2027, new respective amendments still require independent effective-date review; this batch activates neither.

### Sources
- **FCS_CATEGORY_99:** https://fcstraining.fssai.gov.in/assets/docs/Compiled%20FPC_FoSCoS.pdf. OFFICIAL_FOSCOS_CATEGORY_COMPILATION_VISUALLY_CHECKED_PDF_PAGE9. Individual INS/CAS/EC, GMP conditions, product-specific legal maximum or lot PASS.
- **FCS_STANDARDIZED_PRODUCTS:** https://fcstraining.fssai.gov.in/standard-product. OFFICIAL_CATEGORY_REGISTRY_SEARCH_RESULT. Current individual lawful status for a specific manufacturer and substance.
- **FSSR_APPENDIX_A_C:** https://fssai.gov.in/food-law/regulations/compendium/food-products-standards. OFFICIAL_FSSAI_COMPENDIUM_INDEX. Exact permitted additive or selected method without provision-level check.
- **APPENDIX_C_2022_GMM:** https://fssai.gov.in/upload/notifications/2022/10/635f6a08b7c16Gazette_Notification_Processing_Aids_31_10_2022.pdf. OFFICIAL_2022_NOTIFIED_AMENDMENT_TEXT_INDEXED. All enzyme formulations fall into Table11A or automatically have lead maxima.
- **NON_SPECIFIED_LATEST_INDEX:** https://www.fssai.gov.in/standards/non-specified-food. OFFICIAL_FSSAI_PORTAL_INDEX_OBSERVED_2026_10_16. Specific Sajji Khar outcome in September PDF: document contents not individually checked here.
- **NON_SPECIFIED_JUNE_ORIGINAL:** https://fssai.gov.in/upload/uploadfiles/files/Status_of_Application_as_on_03_06_2026.pdf. PRIOR_OFFICIAL_JUNE_PDF_CASE_SPECIFIC_FINDING_RETENTIVE. Their September 2026 status or current legal status of other applicants.
- **NUTRA_2022_DIRECTION_CONTEXT:** https://www.fssai.gov.in/upload/advisories/2022/03/6243ef28079ceDirection_Nutra_30_03_2022.pdf. OFFICIAL_2022_DIRECTION_HISTORICAL_CONTEXT_ONLY. Current applicability or limits for unspecified ingredients.
