# PMSV FSSAI Batch 66 — Exact additive/enzyme/nutraceutical identity, legal-version precedence and aflatoxin scope

**Research as of:** 17 October 2026 · **Environment:** only GitHub Pages `gh-pages` FSSAI Helper preview · **Production WordPress:** unchanged.

## Audit outcome

**Five existing P1 CTR cases** (rank 25–29) now have case-specific legal source routing and explicit no-transfer controls: three **lead** cases (additives/enzymes) and two **aflatoxin** cases (functional ingredients and premixes). **25 original `PMSV44` evidence request IDs** are intact. This is **five primary-source research records, not five validated products**.

| Catalogue rank | Subject | Verified distinction and next legal gate |
|---:|---|---|
| **25** | Generic Appendix A food additives — lead | [Official FPSFA compiled Appendix A](https://www.fssai.gov.in/upload/uploadfiles/files/Compendium_Food_Additives_Regulations_29_10_2021.pdf), PDF p.507, states the food category system exists to determine additive uses; food categories **are not legal product designations**. CTR lead lists individually named additives and applies an Indian Pharmacopoeia proviso to relevant chemicals. Request actual INS/CAS chemical, carrier, purity specification and signed exact article before interpreting lead. |
| **26** | Nutraceutical Schedule VA–VF additives — lead | **Do not equate a 2016 schedule label with a 2022 draft or an original final Gazette.** The [FSSAI 18 October 2022 signed direction](https://fssai.gov.in/upload/uploadfiles/files/Direction_New_compressed.pdf) re-operationalized March and May 2022 interim nutraceutical provisions from 1 October 2022. The [June 2022 Gazette](https://www.fssai.gov.in/upload/uploadfiles/files/Draft_Notification_Health_29_06_2022.pdf) is *expressly a draft*. Actual additive use requires full later-law and individual INS/CAS identity verification. |
| **27** | Generic enzyme preparations — lead | Official FPSFA processing-aid text defines **EC** (Enzyme Commission) number and treatment/processing functions, along with food-grade purity and residue requirements. The 2022 FSSAI direction separately addresses enzymes/proteins for health supplements. Request specific EC enzyme, source organism, active concentrate/carriers, function as ingredient vs processing aid, legal substance impurity row and recognized lab/lot testing. |
| **28** | 2016 Nutraceutical Schedule IV/VI/VIII ingredients — aflatoxins | The [FSSAI CTR IX](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), **regulation 2.2.1, PDF p.14**, lists specified crops and **products containing specified foods** for both total aflatoxins and B1. Not every ingredient in the heterogeneous old schedules is proven a specified crop. Authenticate botanical name, part and form, original operative schedule/category and both independent toxin rows. |
| **29** | Functional ingredient premix — aflatoxins | CTR 2.2.1's published containing-product **comparison rows** are **20 µg/kg total aflatoxins** and **10 µg/kg aflatoxin B1**. These are **not assigned as compliant maxima to this unnamed premix**. A complete controlled BOM, origin/percent of each crop ingredient, processing/as-sold form, legally applicable original notification and separate approved analyte/matrix methods are necessary. |

### Source provenance and law-vs-draft safeguards

**Directly inspected FSSAI official sources**

1. [CTR IX, 3 February 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), original printed PDF **p.14** crop contaminants table, inspected by page image. Source explicitly separates **total aflatoxins** and **aflatoxin B1**. The separate rows for food products containing listed cereals, figs, nuts, oilseeds, pulses and spices are comparisons that need actual ingredient/category evidence. CTR *compendium* is not the signed, original case-specific Gazette applicability judgment.
2. [FSSAI 18 October 2022 nutraceutical direction](https://fssai.gov.in/upload/uploadfiles/files/Direction_New_compressed.pdf), **PDF p.1**, visually examined signed document. It says earlier directions of 29 March and 10 May 2022 were re-operationalised from **1 October 2022**, pending finalization of new rules. **This is a signed direction under FSS Act powers, not evidence the draft became a final Gazette notification**. Check later directions and operative regulations by case date.
3. [FSSAI official 24 June 2022 draft Gazette](https://www.fssai.gov.in/upload/uploadfiles/files/Draft_Notification_Health_29_06_2022.pdf), issued for public consultation; expressly labels the proposed nutraceutical framework **draft**. Its schedule numbering/definitions cannot silently replace a legal original on the assumption a draft is enacted.
4. [Historical FPSFA 2021 compiled text](https://www.fssai.gov.in/upload/uploadfiles/files/Compendium_Food_Additives_Regulations_29_10_2021.pdf), official Chapter Appendix C/Appendix A. It distinguishes processing aids, food-grade requirements, EC numbers and additive food categories; it is historical and must be checked against current original notifications.
5. [FSSAI FoSCoS standard product registry](https://fcstraining.fssai.gov.in/standard-product): lists generic additive, enzyme and nutraceutical product-category names. Registry names alone do not authenticate a particular manufacturer's marketed ingredient.
6. [FSSAI FPIVS About](https://fpas.fssai.gov.in/about) specifically cautions that the generated ingredient/additive statement **is not a license or a statement of law**.

**One additional time gate**: the [May 2026 CTR amendment original Gazette](https://fssai.gov.in/upload/uploadfiles/files/272840.pdf) starts **1 December 2026**; it is **not effective on 17 October 2026**. Do not import future metal or crop/amendment rows into current case determinations.

## Controlled outcome table

| Verified condition | Batch 66 |
|---|---:|
| Catalogue / conditional first-source matches | 533 / 498 |
| Held CTR cases unchanged | **35** (P0 13; P1 22) |
| New primary-source reviews for P1 cases | **5** |
| Original request IDs preserved for these five | **25** |
| Original request IDs preserved globally | **175** |
| Other held cases unchanged | **30** |
| Actual authenticated chemical/ingredient identities received | **0** |
| Signed original statutory article and numeric case-specific limits | **0** |
| Original manufacturer-specific lab scopes and CoAs received | **0** |
| Passed lots / case releases / WordPress modifications | **0 / 0 / 0** |

## Preview and CI deliverables

- `fssai-product-helper-preview-01/data/rules/fssai-current35-nutra-ingredient-scope-batch66-2026-10-17.json`
- `fssai-product-helper-preview-01/fssai-current35-nutra-ingredient-scope-batch66-2026-10-17.js`
- `tests/fssai-current35-nutra-ingredient-scope-batch66-2026-10-17.test.cjs`
- `.github/workflows/verify-fssai-current35-nutra-ingredient-batch66.yml`
- `fssai-product-helper-preview-01/index.html` loader registration.

The JSON is pinned by its two-seed digest, and the preview checks exact Batch59, Batch60 and Batch65 ancestry, all five unique case IDs and their 25 immutable evidence IDs. The user can search and filter legal families and download **research-only CSV with false approval columns**.

The CI test is a **real isolated Chromium component regression**. It does *not* attest that the complete legacy preview booted; full-preview startup was separately observed as a legacy blocker in Batches 63–64, and Batch65 added a standalone diagnostic. The isolated test must not be represented as an end-to-end production pass.

## Actual next evidence for closure

A product may move out of regulatory **HELD** only with documented manufacturer/supplier identity including **CAS/INS/EC or botanical origin**, controlled current formula, relevant operative original legal article and exact analyte/table, approved named lab accreditation **specific to that substance and method**, and representative lot test CoA plus authorized disposition. Nothing in this batch fabricates those controls.

**Outcome: legal-source interpretation improved, no product or case approved.**
