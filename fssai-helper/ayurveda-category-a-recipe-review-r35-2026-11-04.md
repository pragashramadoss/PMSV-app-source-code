# PMSV R35 — nine official Ayurveda Aahara ingredient tables

**4 November 2026 | Source-ingredient audit only. No product compliance PASS.**

R29 verified that nine of the original 137 contaminant article gaps belong to named Ayurveda Aahara Category A recipes. R35 records **46 actual official ingredient-table rows** across those nine recipes, with botanical identity, part used and ratio where printed.

| Outcome | Count |
|---|---:|
| Catalogue identities preserved | 533 |
| Actual Category A recipe identities indexed | 9 |
| Official ingredient-table entries captured | **46** |
| Recipes with suspected source text mismatch | **2** |
| Original exact contaminant article applicability decisions still pending | 137 |
| New full product approvals or releases | **0** |

## Recipe-by-recipe ingredient register

| Official recipe | Printed recipe pages | Ingredient rows | Source ingredient names |
|---|---:|---:|---|
| 12.1 Lajadi Kashaya (Parched Rice Tea) | 50-51 | 6 | Jala, Laja, Hribera, Chandana, Ushira, Sharkara |
| 13.1 Krishara (Khichdi) | 52-53 | 8 | Jala, Dala, Tandula, Ardraka, Hingu, Saindhava Lavana, Ghrita, Haridra |
| 14.1 Golaka Dugdha (Condensed Milk without Sugar) | 54-54 | 1 | Godugdha |
| 14.3 Narikela Ksheerika (Milky Coconut Delight) | 56-57 | 2 | Godugdha, Narikela |
| 14.4 Yava Ksheera (Barley Milk) | 58-58 | 3 | Godugdha, Yava, Goghrita |
| 14.5 Dugdha Kupika (Stuffed Fried Cottage Cheese Dumplings) | 59-59 | 5 | Godugdha, Ghrita, Sharkara, Tandula, Karpura |
| 14.6 Sugandhit Ksheera (Aroma infused milk) | 59-61 | 13 | Mahishi Ksheera, Ketaki, Madhu, Ardraka, Sharkara, Kadali, Ghrita, Amra phala, Jati, Dadima, Punnaga, Tandula, Khajura |
| 14.7 Ksheerapaka (Mystic Milk Quartet) | 61-62 | 4 | Mahishi Ksheera, Sugandhita pushpa, Jala, Sharkara |
| 15.1 Kulmasha (Barley Savory Discs) | 63-64 | 4 | Yava, Ushna Jala, Saindhava Lavana, Sarshapa Taila |

## Two source inconsistencies requiring human resolution

**14.6 Sugandhit Ksheera (Aroma infused milk)** is printed with a **13-ingredient table** (including buffalo milk, honey, fruits, jasmine and rice), yet its preparation method describes **four distinct milk reductions** called Ksheerapaka, Lehya, Ghatika and Sharkara. The method additionally refers to **Karpura** and **Kasturi**, absent from its printed ingredient table.

**14.7 Ksheerapaka (Mystic Milk Quartet)** is printed with **four ingredients**: buffalo milk, aromatic flowers, water and sugar. Its method describes flower infusion in water followed by buffalo milk cooking.

This is an **apparent title–ingredient–method alignment problem in the published source**, not evidence that a particular swap or correction has been approved. Do not swap or merge the two formulas silently. Keep both on **OFFICIAL_SOURCE_TEXT_ALIGNMENT_HOLD** until an official clarification/corrigendum or independent regulatory review settles the precise mapping.

## Material recipe-specific compliance distinctions

- **15.1 Kulmasha:** The ingredient table specifies barley, hot water, rock salt and mustard oil; its method allows **green gram or black gram instead of barley**. SKU-level actual substitution determines species/allergen and raw ingredient toxicant/pesticide evidence.
- **14.1 Golaka Dugdha:** Cow milk only, repeatedly heated and concentrated; liquid milk results must not be transferred to a concentrated product without analytical-method and processing-factor assessment.
- **14.3 Narikela Ksheerika:** Cow milk plus coconut endosperm, not a simple coconut-milk beverage or dairy analogue.
- **14.4 Yava Ksheera:** Cow milk with barley and clarified butter; both cereal and dairy sources need review when appropriate.
- **14.5 Dugdha Kupika:** Includes camphor extract as well as cow milk, rice, ghee and sugar. Actual camphor identity, food-grade permission and applicable safety conditions require independent verification.
- **12.1 Lajadi Kashaya:** Contains parched rice, juniper fruit, sandalwood heartwood, vetiver root, sugar and water; do not inherit generic spice or crop contaminant limits without verifying the correct source article.
- **13.1 Krishara:** Contains rice, lentils, ginger, asafoetida, rock salt, ghee and turmeric. Actual pulse species and finished preparation still matter.

## Current evidence and technical boundary

The companion fail-closed reviewer `ayurveda-recipe-evidence-gate-r35-20261104.mjs` blocks 14.6/14.7 even when callers claim all evidence is complete. For the other seven, reported evidence completeness can only enable **source ingredient review readiness** and never legal compliance or batch release. Exact source articles, original Gazette/current amendments, whole contaminant/residue/microbiology panels and analytical results remain separate.

**PDF inspection limitation:** FSSAI's official parsed document text was inspected, but remote page screenshots timed out. This audit does not claim that the ingredient tables were independently visually checked against page images. The two flagged source titles require visual validation and official clarification before production rule activation.

Neither the live PMSV application, `gh-pages`, product master, operative contaminant limits, nor prior audit registers have been altered. Draft PR #2 remains unmerged.

## Official sources

- [FSSAI Category A order and recipes, 25 July 2025](https://fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf)
- [FSSAI Part-2 additional recipes, 19 June 2026](https://fssai.gov.in/upload/advisories/2026/06/6a34f644db631Annexure%20No_part-2%20Compendium%20of%20Ayurveda%20Aahara%20recipes.pdf)
- [FoSCoS registered product category list](https://fcstraining.fssai.gov.in/standard-product)

Complete 46-row machine-readable dataset: `fssai-helper/ayurveda-category-a-recipe-evidence-r35-2026-11-04.json`.
