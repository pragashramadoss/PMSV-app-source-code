# PMSV R71 — pesticide and veterinary original-source comparison

14 November 2026. **1,098 pesticide entries and 358 veterinary entries were compared with the original Gazette tables. No stored numerical limit was changed.** Source names, article scope, symbols and repeated rows remain part of the result; matching a number alone does not approve its application to a product.

## Coverage

| Source layer | Comparison result |
|---|---|
| 2018 pesticide replacement, 213 serials | 1,070 original table cells expand to 1,098 stored entries: 1,071 numeric/LOQ entries and 27 copper references; no numerical mismatch |
| 2024 veterinary replacement, 49 serials | All 358 entries match the printed limits and units; two repeated Muscle rows remain locked |
| Honey misuse testing | All 12 entries and two collective-group conditions match |
| Prohibited veterinary substances | All 14 classes and their EMRL provisions match |
| Pesticide scope directions | Original 11 January 2021 clarification and 8 April 2024 spice/herb order checked |

The 2018 notification is dated 24 December 2018 and commences on Gazette publication. The January 2019 filename is an upload label. The 2024 veterinary replacement commences on **1 April 2025**. December 2026 changes recorded in R70 remain future on this review date.

## Findings and safeguards

- **Duplicate pesticide articles:** Original page 33 contains both Carbaryl/Maize entries (0.02 within the food-grain cell and 0.5 separately) and both Carbendazim/Rice entries (2.0 and 2*). The latter is a marker distinction even though the numerical values are equal. Both pairs remain held.
- **Chlorpyriphos grain scope:** Original page 34 says Wheat 0.5, Rice 0.5 and Food grains 0.05. The stored label adds “Other.” The draft comparison module now holds that normalized Other food grains row until its scope is reconciled. It does not alter wheat/rice limits.
- **Alpha Cypermethrin:** Original page 36 gives Cypermethrin cottonseed oil 0.01, then a separate Alpha Cypermethrin sub-entry at 0.05. The higher value now requires explicit, verified sub-entry identity; food-label spacing cannot select it. Serial 5 separately contains the same Alpha cypermethrin value.
- **Five chemical-name differences:** The draft holds 24 affected rows pending identity reconciliation. It retains both printed and stored names without inventing an official alias or silently correcting the source.
- **Repeated veterinary Muscle rows:** Page 19 repeats Muscle after the Amoxicillin Sheep block and after the tetracycline Cattle block. There is no new heading explaining either repetition. Both source locks remain; no missing species is invented.
- **Species and units:** Three cattle-milk entries expressly use mg/l: Ceftiofur, Gentamicin and Spectinomycin. The fish row at serial 7 expressly narrows the drug column to Oxytetracycline. The pre-December seafood-clause overlap remains held.
- **Honey/prohibited-use interpretation:** Honey values test antibiotic misuse; they do not authorize treatment. The prohibited list retains its 0.001 mg/kg EMRL and 0.0003 mg/kg chloramphenicol exception. Neither creates a drug-use permission.

| Serial | Original Gazette name | Stored name | Entries |
|---|---|---|---:|
| 7 | Ametroctradin | Ametoctradin | 4 |
| 37 | Chlothianidin, with the printed metabolite wording | Clothianidin, with different metabolite spelling | 7 |
| 46 | Cyantranilipole | Cyantraniliprole | 11 |
| 55 | Diclosulam | Dicosulam | 1 |
| 142 | Penoxuslum | Penoxsulum | 1 |

The full names and metabolite wording are retained in the accompanying JSON. These are source differences requiring reconciliation, not findings that either spelling has been legally corrected. The original commodity spelling “Stawberry” is also preserved alongside the normalized Strawberry label.

## Qualifiers and directions

The pesticide comparison preserves **172 asterisk/LOQ entries, 27 dollar/copper references, 19 fat/carcass-fat conditions, 10 shell-free conditions and 39 Dithiocarbamate subgroup entries**. Nine shell-free entries are eggs; the original Ethion row also applies that wording to Dry fruits. The source's unusual qualifier is not silently replaced. Dithiocarbamate results retain their CS2 expression and subgroup requirement.

The 2021 clarification addresses the 213-table and default-tolerance scope for agricultural commodities and their physically processed forms. The 2024 spice/herb order has distinct commodity-MRL, Codex and registration-dependent branches, and supersedes the two 2022 orders. The older orders are appended to the same PDF: their presence is not evidence that they remain operative. This review enables neither a blanket processed-food exemption nor an automatic 0.01/0.1 mg/kg fallback. Actual process classification and the applicable direction chain still need to be established.

The honey paragraph expands MRPL as Minimum Required Performance Limit, whereas the table heading says Maximum Residue Performance Limit. The evidence keeps the MRPL abbreviation and the express misuse-testing purpose.

## Evidence and reproducibility

The JSON records source URLs and SHA-256 hashes, each original article/limit cell, PDF page and table row, inherited species headings, drug overrides, compound-cell expansion and the exact stored row index. Selected key pages were also visually inspected. The Praziquantel pig row at the top of page 25 was recovered from the rendered page because its open border defeats grid extraction. All 358 veterinary rows are accounted for after that extraction repair.

These changes affect the **draft** source-comparison module and review evidence. **137 product-specific CTR decisions remain open.** The 14 Ayurveda ingredient gaps, recipe 14.6/14.7 discrepancy and broader legal-completeness review are not closed. No live deployment, PR merge, product/lot approval or native Android/push verification is claimed.

## Original sources

- [2018 pesticide Gazette](https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_MRL_Pesticides_03_01_2019.pdf), English pages 30–51 — SHA-256 `4e46563bc34cc1f4da630a48266aec723cdd666d448803bd965c5aa20c86fc20`.
- [2024 veterinary/honey/prohibited-use Gazette](https://fssai.gov.in/upload/uploadfiles/files/2_Notification%20dt%2017_10_2024.pdf), English pages 17–27 — SHA-256 `7f677539c1bd4adbe524e998b7e81d81f712e2d3dd6568282aae21b14ec49dd6`.
- [11 January 2021 scope clarification](https://fssai.gov.in/docs/whatsnew/advisories-orders/5ffd3100b024cLetter_Clarifications_Tolerance_Limit_11_01_2021.pdf), page 1 — SHA-256 `8e5043901ddfa2502b2ee3566cc19fb9a6391118a1e7b292ab9442a97718f27a`.
- [8 April 2024 spice/herb order](https://www.fssai.gov.in/upload/advisories/2024/04/6616351c775b5Order%20MRL%20Spices%20and%20culinary%20herbs.pdf), page 1 — SHA-256 `6d24121a58571f00206cf3f4b919e2e72e0741e9dfcd4645f8b8577f09a60b30`.
