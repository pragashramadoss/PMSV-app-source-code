# PMSV Batch133 — 86 missing-FSSR regulatory source-navigation crosswalk

**29 October 2026. Research and source-navigation overlay only; NOT regulatory approvals.**

## Objective

The Batch132 identity QA found 86 out of 533 original catalogue records with a blank stored FSSR number. A blank field does not establish either non-compliance or legal exemption: it can arise because a product is covered by a separate specialized FSSAI regulation, because FoSCoS has a licensing category without a direct product-standard number, or because ingredient-level permissions depend on context. Batch133 creates **one exact-ID crosswalk for all 86 original blanks**, without writing a substitute numeric FSSR code to the historical ledger.

## Reconciled routing groups (86 rows)

| Regulatory navigation group | Original FSSR blanks | Commercially held cases | Official evidence |
| --- | ---: | ---: | --- |
| Fresh produce: FoSCoS-listed, no per-entry FSSR number | 6 | 0 | [FSSAI source](https://fcstraining.fssai.gov.in/standard-product) |
| Edible dried seeds: March 2024 licensing order | 2 | 0 | [FSSAI source](https://www.fssai.gov.in/upload/advisories/2024/03/65f3f4541cd9dFSSAI%20order%20dated%2015-Mar-2024.pdf) |
| Traditional mouth fresheners: FoSCoS 5.2.4 listing | 3 | 0 | [FSSAI source](https://fcstraining.fssai.gov.in/standard-product) |
| Infant nutrition: stand-alone 2020 regulations | 11 | 1 | [FSSAI source](https://fssai.gov.in/upload/uploadfiles/files/Comp_IFR_VERSION-II_04_01_2024.pdf) |
| Alcohol: stand-alone 2018 regulations and amendments | 20 | 0 | [FSSAI source](https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Alcoholic_Beverages_05_04_2018.pdf) |
| Indian sweets and savouries: Category 18 licensing direction | 12 | 0 | [FSSAI source](https://fssai.gov.in/upload/advisories/2021/07/60f6a6554438dDirection_Indian_Sweets_Snacks_20_07_2021.pdf) |
| Named food additives: FPSFA Chapter 3 / Appendix A | 18 | 0 | [FSSAI source](https://www.fssai.gov.in/food-law/regulations/compendium/food-products-standards) |
| Other substances, enzymes, flavour premixes and functional ingredients | 6 | 5 | [FSSAI source](https://fcstraining.fssai.gov.in/standard-product) |
| Ayurveda Aahara named recipes: category A source reference | 8 | 2 | [FSSAI source](https://www.fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf) |

Rollup: 31 separate product-regulation routes; 14 licensing-direction routes (not a standalone numeric FSSR number); 9 official FoSCoS entries with no direct listed FSSR number; 24 Food Category 99 substance and ingredient use-matrix routes; 8 Ayurveda Aahara named-product special-regulation routes. **78 conditional-source references and 8 commercially held cases.**

## High-consequence legal distinctions

1. **Alcohol (20):** The [Food Safety and Standards (Alcoholic Beverages) Regulations, 2018](https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Alcoholic_Beverages_05_04_2018.pdf) and [subsequent amendments](https://fssai.gov.in/food-law/regulations/amendments/alcoholic-beverages) are the regulatory starting point, not an invented Food Products Standards and Food Additives (FPSFA) numeric chapter assignment. Specific beverage types, such as toddy, require individual examination.
2. **Infant nutrition (11):** The [Foods for Infant Nutrition Regulations, 2020](https://fssai.gov.in/upload/uploadfiles/files/Comp_IFR_VERSION-II_04_01_2024.pdf) require category-specific standards and, for non-standard articles, food and label prior approval. The [October 2026 proposed sucrose/fructose restriction](https://www.fssai.gov.in/food-law/notifications?notification=draft-notification) is a **draft**, not a commercial pass/fail limit. The formulated-supplement case remains held.
3. **Indian sweets and savouries (12):** The [19 July 2021 FoSCoS Category 18 direction](https://fssai.gov.in/upload/advisories/2021/07/60f6a6554438dDirection_Indian_Sweets_Snacks_20_07_2021.pdf) establishes licensing/registration placement when a standardized product code is absent. It expressly excludes products already standardized under FoSCoS Categories 1–14. No exact numeric FSSR standard is fabricated.
4. **Edible dried fruit/vegetable seeds (2):** The [15 March 2024 order](https://www.fssai.gov.in/upload/advisories/2024/03/65f3f4541cd9dFSSAI%20order%20dated%2015-Mar-2024.pdf) states a specific standard had not been established and maps the two licensing categories. The [26 May 2026 edible-seed proposed FPSFA standard](https://fssai.gov.in/upload/uploadfiles/files/Draft%20Notification-FSS_FPSFA_Amendment%20Regulations_2026_Minor%20seed%20oils_Edible%20seeds_Appendix%20A.pdf) is only a draft as of this batch; proposed limits must never be treated as enforceable requirements.
5. **Fresh produce (6) and mouth fresheners (3):** [FoSCoS training catalogue](https://fcstraining.fssai.gov.in/standard-product) lists the selected named subcategories with FSSR "NA." This is a source-catalogue observation, not an exemption from applicable standards, pesticide limits, contaminant rules, food hygiene, or additive restrictions.
6. **Food Category 99 ingredients/additives (24):** [FPSFA Chapter 3 and Appendix A](https://www.fssai.gov.in/food-law/regulations/compendium/food-products-standards) set additive permissions and food-category-specific maximum levels; exact formula and use conditions must be separately verified. Sajji Khar, nutraceutical schedules, enzymes, flavour premixes and functional ingredients cannot receive a blanket pass from a FoSCoS 99 code.
7. **Ayurveda Aahara recipes (8 with blank FSSR):** [Ayurveda Aahara Regulations, 2022](https://fssai.gov.in/upload/notifications/2022/05/62789a20b54bdGazette_Notification_Ayurveda_Aahara_09_05_2022.pdf) and the [July 2025 named-list order](https://www.fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf) offer source-routing references under 102.1 only. Commercial formula/label requirements remain unverified; two cases held.

*FSSAI's online compendium is explanatory and the original Gazette notification/amendments prevail in case of differences; product-specific applicability should be checked against current originals before release.*

## Strict data / release controls

- Sources pinned: legacy 533 ledger `d142be820899eac5`; 35 closeouts `4d1590738e747a2a`; Batch132 `e4dffdcebe0f0eeb`; Batch133 crosswalk `464f450d6fbe367c`.
- A checksum and ID-set validator cross-checks **all 86 original blank FSSR entries, all 9 route-group counts and all 8 held cases**. Any mismatch fails closed rather than displaying partial findings or allowing CSV export.
- All original 533 identity records, stored FSSR/FoSCoS fields, 498/35 source research states, 102 mechanical flags, and 35 commercial holds remain unchanged.
- No numeric FSSR code is inferred, no formula verified, no product limit signed, no method/lot testing approved, no regulatory pass and no release.
- The Batch131 identity QA page adds a distinct Batch133 route column, official source links, nine-group summary and CSV columns. The historical ledger stays untouched.

## What remains open

1. For each of the 86, authenticate product formulation, intended use and precise current standard/notification with owner-signed documentation (especially 8 held cases).
2. For substances/additives, verify the ingredient specification, food matrix, allowed concentration, processing purpose, and all relevant safety limits.
3. Continue the 35-case commercial evidence requests: 175 original evidence IDs had not been received as of Batch88. A source-navigation assignment is not regulatory signoff.

**This batch is an auditable routing improvement; none of the 86 records is declared commercially compliant.**
