# PMSV FSSAI Batch 62 — Operative Product-Identity Supersession and Documentary Holds

**As-of date:** 17 October 2026. **Branch:** `gh-pages` only. **No WordPress or main-branch changes.**

## Significant legal finding: current Pickled Eggs standard supersedes 2020 wording

The original **[Food Safety and Standards (Food Products Standards and Food Additives) First Amendment Regulations, 2024](https://fssai.gov.in/upload/notifications/2024/10/671b28f9586dfGAZETTE%20NOTIFICATION%20DATED%2021.10.2024.pdf)** was notified on 21 October 2024. **Clause 1(2) makes its amendments effective on 1 May 2025**, except the specified fortified-rice clauses 24A–24C which commenced on Gazette publication. In **regulation 2.5.3 clause 5** it expressly **replaces** the earlier Pickled Eggs standard with an updated definition and separately described **vinegar-based** and **oil-based** pickled eggs. Therefore:

- The 2020 Tenth Amendment's quoted pickle-solution pH **3.2–3.6** and earlier recipe **must not be used as the only currently operative standards** without reading the replacement clause and identifying which process subtype is sold.
- The 2024 standard is a **product identity/process** standard. It is not a CTR pesticide MRL or certification of the particular manufacturer's product.
- Original 2020 text remains linked as **superseded historical text** for an audit trail. The 2024 original Gazette is in force by this review date, but no actual production record or BOM is present.

Official sources: [2020 original Pickled Eggs Gazette](https://fssai.gov.in/upload/notifications/2020/12/5fedb66ac1b15Gazette_Notification_FPS_Tenth_amendment_31_12_2020.pdf), [2024 replacement Gazette](https://fssai.gov.in/upload/notifications/2024/10/671b28f9586dfGAZETTE%20NOTIFICATION%20DATED%2021.10.2024.pdf), and [current Meat and Meat Products FSSAI chapter](https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_5_Meat%20and%20Meat%20products%281%29.pdf).

## Additional five product-standard safeguards

| Rank | Product | Documented current/operative identity text | Required distinction before assigning CTR or compliance |
|---:|---|---|---|
| **7** | **Coconut Milk Powder** | [Current FPSFA 2.3.63](https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit_Vegetable_products.pdf) defines powder from coconut milk and **explicitly permits maltodextrin and sodium caseinate** in the product. | The old/non-dairy name **does not warrant milk-protein-free claims**. Obtain actual formula and ingredient/allergen assessment. Neither that name nor this clause supplies dairy-milk CTR lead limits. |
| **11** | **Chia Seeds** | [Current FPSFA 2.4.6(25)](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf) identifies **Salvia hispanica L.** | Actual seed identity/processed form and named lead CTR article remain unverified; cereals chapter placement alone does not settle metal-contaminant commodity identity. |
| **14** | **Water Chestnut Flour** | [Current FPSFA 2.3.64](https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit_Vegetable_products.pdf) identifies ground dried **Trapa bispinosa / Trapa quadrispinosa** nuts. | Do not substitute cereal flour, canned water chestnut, or different nut CTR comparator without signed legal match. |
| **15** | **Animal Casings** | [Original FPSFA Tenth Amendment 2020](https://fssai.gov.in/upload/notifications/2020/12/5fedb66ac1b15Gazette_Notification_FPS_Tenth_amendment_31_12_2020.pdf), subregulation 2.5.2(14), describes casings derived from intestines, oesophagus, or urinary bladder of slaughtered food animals. | **Artificial/synthetic casings are not automatically the same article**, and no meat/offal/gelatin lead limit can be assumed. Identify actual casing source/species. |
| **16** | **Egg Powder** | [Original FPSFA Tenth Amendment 2020](https://fssai.gov.in/upload/notifications/2020/12/5fedb66ac1b15Gazette_Notification_FPS_Tenth_amendment_31_12_2020.pdf) separately recognizes egg powder alongside frozen and liquid egg products. | A pesticide–food entry expressed for eggs is not automatically the tested dried-powder basis. Obtain target pesticide and concentration/process details. |

**Source provenance:** The 2020 FSSAI Gazette documents above have official indexed original-law text but their full PDF pages were **not rendered locally during this batch**. 2024 amendment content and the published FSSAI 2025 chapter text were examined from official indexed text. No physical supplier evidence or original lab documents were received.

## Preserved baseline

| Measure | After Batch 62 |
|---|---:|
| Catalogued products | 533 |
| Conditional initial first-source matching | 498 |
| Open CTR-contaminant cases | **35** |
| Batch62 targeted identity/supersession dossiers | 6 |
| Batch62 original inherited gate IDs covered | 30 of original 175 |
| Newly approved signed case-specific CTR numeric limits | **0** |
| Actual supplier BOM, laboratory scope, representative lot release | **0 / 0 / 0** |
| WordPress production changes | **0** |

**Why 6, not 35 new checklists:** This batch corrects a material outdated provision and identifies actual source text that can affect a supplier audit, formula or product identity. The other **29** cases remain **unchanged**; all 35 CTR cases remain **held**. Group counts in the new panel are exact and ancestry-validated.

## Technical delivery

- JSON: `fssai-product-helper-preview-01/data/rules/fssai-current35-identity-supersession-batch62-2026-10-17.json`
- Reader: `fssai-product-helper-preview-01/fssai-current35-identity-supersession-batch62-2026-10-17.js`
- Chromium regression: `tests/fssai-current35-identity-supersession-batch62-2026-10-17.test.cjs`
- CI: `.github/workflows/verify-fssai-current35-identity-supersession-batch62.yml`
- Reader validates the serialized JSON digest; previous B59/B60/B61 hashes, retained original request IDs, and all zero-approval flags. Source comparison CSV explicitly records `false` for original legal case limit, actual manufacturer BOM, accredited lab scope and representative lot PASS.
- The review panel only reads the GitHub preview source; **no emails, no remote evidence submission, no permission grants, no chemical maximum auto-application, no storage, no WordPress edits**.

**Next evidence-first priority:** verify which of the 35 actual marketed articles match their operative FPSFA food-standard identity and obtain controlled manufacturer BOM/specifications. Only then establish exact **operative CTR analyte-food** provisions and currently certified matrix-scoped lab methods. Do not mark a case verified from a product name alone.
