# PMSV R43 — Ingredient purity and authentic 2025 recipe variants

**4 November 2026 | Source-evidence work only; zero product legal PASS**

## Actual R43 progress

| Measure | Outcome |
|---|---:|
| Existing catalogue identities preserved | 533 |
| Official Category A recipe IDs | 9 |
| Original recipe ingredient entries | 46 |
| R40 original ingredient entries with no raw CTR source candidates | **14** |
| R43 entries individually classified into evidence routes | **14** |
| Ingredient/process-water entries | **4** |
| Non-water botanical entries | **10** |
| Source-recipe flower entries needing use/transfer assessment | **5** |
| Raw CTR source links, cumulative R36–R43 | **94, unchanged** |
| Remaining legally undecided raw CTR source candidates | **14, unchanged** |
| Finished-product CTR article decisions held | **137, unchanged** |
| Whole-product legal PASS | **0** |

## Primary law: 2022 Regulation 3(5) purity source

The original FSSAI Ayurveda Aahara Gazette Regulation **3(5)** permits adoption of ingredient purity criteria from applicable FSSAI standards, recognised pharmacopoeias, relevant BIS specifications, or Quality Standards of Indian Medicinal Plants. The FBO **must provide information on the adopted purity criteria at licensing or when amended**. This is **not** blanket approval of any botanical grade, pharmacopoeia standard, safe-use dose, pesticide MRL or a finished product.

For each of the **10 botanicals**, this register now requests: precise actual species/part/grade, selected monograph and edition, supplier lot/specification, adopted criteria reported in licensing records, actual process exposure/use, legally correct contaminant/article test basis, laboratory evidence, and independent product review. For each of the **4 water** ingredient rows, request the actual potable water source, point-of-use records, accepted potability standard and sampling evidence. Recipe water is **not** automatically regulated as a packaged-water commercial product.

## Two official recipe-method warnings are stronger than a simple ingredient listing

### Recipe 14.6 — Sugandhit Ksheera (Aroma Infused Milk)

The **25 July 2025 FSSAI Category A order** prints **13 ingredients** under this recipe, but the method describes **four separately collected variants**: Ksheerapaka, Lehya, Ghatika and Sharkara, with different stage-specific additions. Before serving, it directs removal of floral matter.

| Published variant | Source method additions (conditional source transcription) |
|---|---|
| Ksheerapaka | Ginger and Jati / other aromatic flowers |
| Lehya | Dates and Punnaga flowers |
| Ghatika | Mango, ghee, honey, Dadima flower, cooked rice |
| Sharkara | Banana, sugar, Punnaga flowers, **Karpura** and **Kasturi** |

**Karpura and Kasturi** appear in the method but not in the 13-row ingredient table; **Ketaki** is in the table but is not separately named in these four addition steps. Do **not** silently repair the source or assign every ingredient to every marketed variant. More importantly, **flowers removed during processing do not imply that their residues or transferred constituents are absent in the finished food**. Source recipe title/method alignment remains **HOLD**.

### Recipe 14.7 — Ksheerapaka (Mystic Milk Quartet)

The official 2025 source lists **four ingredients** (buffalo milk, unidentified aromatic flowers, water, sugar) and describes **aromatic-flower water infusion, removal of the flowers, addition of milk, and cooking off the water**. Flower species and actual transferred material are unresolved. The source title/method discrepancy remains **HOLD**.

## Remaining 14 original ingredient entries, independently identifiable

| Recipe | Ingredient | Printed part | Evidence route |
|---|---|---|---|
| 12.1 | Jala | - | PROCESS_INGREDIENT_WATER_QUALITY |
| 12.1 | Hribera | Fruit | BOTANICAL_IDENTITY_FOOD_USE |
| 12.1 | Chandana | Heartwood | BOTANICAL_IDENTITY_FOOD_USE |
| 12.1 | Ushira | Root | BOTANICAL_IDENTITY_FOOD_USE |
| 13.1 | Jala | - | PROCESS_INGREDIENT_WATER_QUALITY |
| 13.1 | Hingu | Oleoresin gum | BOTANICAL_RESIN_IDENTITY |
| 14.5 | Karpura | Substance extract | CAMphOR_EDIBLE_GRADE_AND_SAFETY |
| 14.6 | Ketaki | Flower | FLOWER_PROCESS_STAGE |
| 14.6 | Jati | Flower | FLOWER_PROCESS_STAGE |
| 14.6 | Dadima | Flower | FLOWER_PROCESS_STAGE |
| 14.6 | Punnaga | Flower | FLOWER_PROCESS_STAGE |
| 14.7 | Sugandhita pushpa | Flower | FLOWER_PROCESS_STAGE |
| 14.7 | Jala | - | PROCESS_INGREDIENT_WATER_QUALITY |
| 15.1 | Ushna Jala | - | PROCESS_INGREDIENT_WATER_QUALITY |

No legitimate new raw CTR numbers were verified for these 14; reducing the gap count merely by finding a purity standard would be misleading.

## Audit boundaries

- Official 2022 Gazette parsed text and 2025 order parsed recipe tables/methods were read; independent PDF screenshots for those specific pages could not be reliably retrieved, so these are **text-grounded** findings, not visually verified PDF text.
- Current source amendments, actual SKUs and usage quantities, prescribed monographs, exact raw commodity/sample basis, processing transfers and laboratory results still need evidence.
- No numeric rules added, no new source article automatically assigned, no product approvals, no release, no production deployment.
- Source recipe 14.6/14.7 hold continues.

**Source**: [2022 Ayurveda Aahara regulation](https://fssai.gov.in/upload/notifications/2022/05/62789a20b54bdGazette_Notification_Ayurveda_Aahara_09_05_2022.pdf), Reg 3(5), and [25 July 2025 Category A official recipe order](https://fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf), printed pp.60–62.

Structured data: `fssai-helper/ayurveda-purity-and-variant-holds-r43-2026-11-04.json`; deterministic guard: `fssai-helper/ayurveda-purity-variant-gate-r43-20261104.mjs`.
