# PMSV FSSAI Contaminant Evidence Review Queue — 10 October 2026

> **Status: unresolved evidence, not an exemption, noncompliance finding or zero-limit conclusion.**

Original baseline: GitHub Actions verification run [38032990695](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/38032990695) from the latest 533-product identity inventory. Re-run after new commits; this queue is a dated baseline, not a continuously refreshed list.

| Measure | Value |
|---|---:|
| Local FoSCoS/FSSAI product identities | 533 |
| Some exact product evidence, partial only | 407 |
| No exact product-identity contaminant evidence established by current index | 126 |
| Products with complete contaminant compliance independently established | 0 claimed |
| Original source-article applicability triage records (2026-10-10 baseline) | 236 |
| Unresolved identities with conditional official-source article references recorded after source-scope correction (NOT automatically applied) | 43 |

Selected Version IX named-article candidates are documented in `fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json` and displayed as review-only notes in the Helper. The original 236-item queue was **not** reduced by conditional candidates. A separate exact FSSR 2.2.9 crude-vegetable-oil lead mapping reduced the queue to 235; subsequent three exact dried-fruit Malathion commodity source matches reduced it to 232; exact FoSCoS 05.2 confectionery hydrocyanic-acid source evidence for Lozenges and Soft Candy has now reduced it to 230. On 10 October, a further source/identity check removed 42 misleading conditional article candidates across 38 products without falsely reducing the unresolved count. See `FSSAI-V9-CANDIDATE-SCOPE-CORRECTIONS-2026-10-10.md`.

## New exact commodity/source evidence — 39 identities (10 October 2026)

The latest 533-product audit has added **27 named cheeses** (FSSR 2.1.17), **6 fermented-milk products** (FSSR 2.1.13) and **6 infant-food identities** (FoSCoS FCS 13.1/13.2) as **partial source-backed evidence, not full compliance**. For the named dairy identities, the official FSSAI Section 2.3.1 pesticide commodity article **Milk and Milk products** is source-pinned using the Acetamiprid **0.02 mg/kg** row. **No pesticide MRL is automatically assigned to processed cheese**: residue definition, fat basis, processing, other pesticide rows and operative amendments require review. Infant-food metals use independently checked Version IX **Arsenic 0.05 mg/kg** and **Cadmium 0.1 mg/kg** source rows; general infant-food lead **0.2 mg/kg** is withheld rather than overwriting the separate ready-to-use infant-formula **0.02 mg/kg** article. These 39 products remain unapproved for overall contaminant/MRL compliance. Official source: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf.

### Next large evidence batch — 22 source-matched identities (10 October 2026)

Twenty exact named **Chapter 2.1 dairy/condensed/powder/fat product identities** are cross-checked against the current official FSSAI Version IX Section 2.3.1 **Milk and Milk products** pesticide commodity, with **Acetamiprid 0.02 mg/kg** as an independent source-integrity reference. These are **commodity-reference matches, not automatic MRL applications**. Fat-based residue conditions, concentration/processing factors, other pesticides, other contaminants and current amendments remain open. Eight dairy analogues, frozen dessert/ice cream mixed standards, edible lactose, colostrum and composite non-standard dairy sweets are excluded from this mapping. Two guaranteed maize/wheat-source FSSR products — **Maize Starch 2.4.7** and **Wheat Protein Products including Wheat Gluten 2.4.22** — now have separately checked FSSAI **Aflatoxin B1 10 µg/kg** evidence, independently matched against the cereal and composite-food rows. **Total aflatoxins are not inferred**, and no complete contaminants/pesticide PASS is asserted. Official FSSAI sources: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf ; https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf ; https://fssai.gov.in/upload/uploadfiles/files/2_%20Chapter%202_1%20(Dairy%20products%20and%20analogues).pdf.

## Next precision applicability review — 167 products assessed (10 October 2026)

**Three exact fresh-fruit FoSCoS identities** (untreated fresh fruit, surface-treated fresh fruit and peeled/cut minimally processed fruit) were cross-checked to the official Section 2.3.1 **Fruits** pesticide commodity article; the **2,4-Dichlorophenoxy Acetic Acid 2 mg/kg** row is a **source integrity anchor only**, never an auto-applied MRL. Crop species, external treatment, edible basis, peeling/cutting, processing factors, analytical residue definition and operative amendments require separate evaluation. The **164 remaining exact identities** now carry individually stored identity-linked applicability checklists (matrix, processing, ingredient, packaging, and source family); **no numeric contaminant or pesticide limit is assigned by those checklists**. The checklists cover every remaining catalogue ID, including composite and special FoSCoS foods. Nothing in this register constitutes finished-product compliance clearance. Official source: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf.

## Next targeted Chapter 2.3 evidence review — 63 identities (10 October 2026)

**Scope disposition only — 63 reviewed; 0 newly cleared by this review.** The catalogue remains 533 products, 369 with some exact source-backed evidence, and 164 awaiting exact product-specific evidence. All 63 still appear in the unresolved queue. No new numerical finished-product compliance limit was applied. Complete contaminant/pesticide coverage is **not** claimed.

The individual records now carry **22 separate product-form review buckets**, with independently identified raw versus dried/frozen/canned/sterilised/fermented/pickled/paste/concentrated/sweetened/composite distinctions. Every record specifies a positive matrix/processing/pack qualification and a separate warning against the nearest misleading FSSAI named article. The existing Helper's pending-evidence notice displays these product-specific checks.

**Eleven conditional metal source-row examples** are recorded for seven identity families: canned mushrooms (sterilised fungi), dehydrated onions versus non-onion dehydrated vegetables, canned fruit cocktail, canned mango/pineapple, canned tomatoes, mango chutney and pickled cucumber. They include the official article, contaminant, value, unit and requisite subtype; **all are REVIEW ONLY** until the operator establishes actual subtype, packaging, sample basis and the operative regulation. Previous independent conditional mappings are preserved.

Critical negative controls: generic frozen fruit cannot inherit canned fruit cocktail Lead 1 mg/kg; coconut cream/milk/powder cannot inherit milk/secondary milk contaminant articles; cocoa beans cannot inherit cocoa powder's dry fat-free substance limit; composite soups, curried vegetables and mixed pickles cannot inherit ingredient-only or cucumber-specific articles. Historical 2026-10-10 164-product checklist records are preserved, and this new detail does not reduce the evidence queue merely by listing a numerical candidate.

**Official sources checked:**
- [FSSAI Contaminants/Toxins/Residues Version IX (03.02.2026), §2.1.1](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), particularly PDF pp. 2–5 and 10–11.
- [FSSAI Food Product Standards, Chapter 2.3 Version 2 (04.11.2024)](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf), §§2.3.1–2.3.4, 2.3.16–2.3.17, 2.3.21, 2.3.43 and 2.3.62. Current amendments and exact crop-specific pesticide MRLs require independent follow-up.

**Evidence and tests:** `fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json` (field `chapter_2_3_targeted_evidence_review_2026_10_10`); `tests/fssai-chapter-2-3-unresolved-63-targeted-article-review.test.cjs`.

## Next source-backed residue corrections — 3 identities (10 October 2026)

The current `gh-pages` audit source checks establish **three additional exact-name product-standard or veterinary drug residue examples** as **partial evidence only**. This reduces the current review queue from 164 to **161**, with **372** products having at least one source-backed piece of evidence. This is not a complete contaminant / pesticide / veterinary drug compliance finding.

- **Spice Oleoresins, FSSR 2.9.32(3):** official food-grade extraction solvent residual maxima: Acetone 30, ethyl acetate 50, n-hexane 25, isopropyl alcohol 30, methyl alcohol 50, diethyl ether 2, butan-1-ol 2, butan-2-ol 2, propan-1-ol 1 and methyl tert-butyl ether 2 (all ppm). Carbon dioxide, water and ethyl alcohol are GMP requirements, **not zero or numeric ppm limits**. Identity-gated to `12-12-2-spice-oleoresins`. Source [FSSAI Chapter 2.9, pp. 40–41](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_9_Salt_Spices_Condiments%20and%20related%20products.pdf).
- **Fresh/chilled and frozen Chevon / Goat Meat, FSSR 2.5.2(9):** checked separate current [FSSAI Version IX veterinary MRL](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf) **Goat—Muscle** rows: Monensin 0.01 mg/kg, Neomycin 0.5 mg/kg and Fenbendazole-related residue group 0.1 mg/kg. Does not apply as a pig/sheep/rabbit limit; does not cover all other veterinary drugs or prove test conformity. Identity-gated to the two named chevon rows.

The **previous 164 unresolved records** are a dated historical review baseline. The new 81-identity detailed family review has no numeric application or claims of compliance by itself: special 36, dairy 14, cereals 13, sugars 11, other meat/eggs 7. The source-gated updates and remaining 161 live records are stored in `contaminants-v9-unresolved-264-review-v1.json`, with the supplements `spice-oleoresin-2-9-32-residual-solvents-evidence-v1.json` and `goat-muscle-veterinary-v9-exact-evidence-v1.json`.

## Final unresolved-family review and source scope reconciliation (10 October 2026)

**Latest status: 533 products; 372 with at least one exact source-backed partial contaminant/residue reference; 161 still pending. Zero complete compliance approvals. No change in unresolved count from this review.** The files now include an exclusive, detailed source/identity gate for *every one of the 161 pending products*: 63 Chapter 2.3 fruit/vegetable forms, 81 previously reviewed dairy/cereal/sugar/meat/special forms, and the final 17 beverage, chocolate/confectionery, spice/condiment, other food, fat spread and trehalose identities. Source reviews are NOT evidence that a finished product has passed every contaminant, pesticide, microbial or chemical test.

### Exact Chapter 2.3 dried-dates source reference — conditional only

FSSR **2.3.47(4)** defines Dates as dried `Phoenix dactylifera` fruit but allows treatment with sugar, glucose syrup, flour and vegetable oil. [Official Chapter 2.3, printed page 66](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf). Version IX §2.3.1, Malathion No. 114, lists **Dried fruits: 8 mg/kg**, with malathion plus malaoxon expressed as malathion. [Official Version IX PDF page 30](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf). The Dates identity remains pending because treatment, finished-matrix and processing conditions must be resolved. No 8 mg/kg finished-product compliance PASS is generated. **Date Paste** and **Dry fruits and Nuts** do not inherit it automatically.

### Rabbit-meat product/tissue-source review — conditional only

Chapter **2.5.2(6)** permits fresh/chilled/frozen rabbit meat as whole carcass, cuts **or edible offals**, not solely skeletal muscle. The FSSAI Version IX pesticide table has **Imidacloprid 0.1 mg/kg** under “Meat and Meat products,” but exact tissue/matrix applicability and the full applicable MRL/veterinary panel must be reconciled. Thus the fresh/chilled and frozen rabbit catalogue identities remain in the 161 queue; they do not inherit the Goat–Muscle veterinary limits. [FSSAI Chapter 2.5, printed page 14](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_5_Meat%20and%20Meat%20products%281%29.pdf); [FSSAI Version IX, PDF page 28](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf).

### Separate egg-product chemical/preservative limits, not pesticide MRLs

The Helper now displays separate, source-linked Chapter 2.5 requirements for **Frozen Egg Products (2.5.3(2))** and **Liquid Egg Products (2.5.3(4))**: extraneous matter at 100 mg/kg; beta-hydroxybutyric acid at 10 mg/kg; lactic acid at 1,000 mg/kg; succinic acid at 25 mg/kg. They remain **product-standard chemical quality/preservative limits**, not pesticide MRLs, and have no direct impact on the contaminant-evidence queue. The display validates product ID, FSSR, stored values and units before showing numbers.

### FSSAI same-name standard mismatch requiring correction

Catalogue identity `06-06-3-fruit-vegetable-cereal-flakes` currently links to Chapter **2.4.35 Breakfast Cereal**. However, the official same-name **Fruit/Vegetable, Cereal Flakes** standard is **2.3.20** (moisture ≤6%; acid-insoluble ash ≤0.5%; starch ≤25%). The Helper flags this as a **cross-chapter route discrepancy requiring confirmation**; it must not silently infer cereal-based contaminant clearance. Source: [Official Chapter 2.3, printed page 29](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf). A final FoSCoS category/recipe reconciliation is required before rerouting.

### Machine-readable accountability

Run `node scripts/audit-all-161-pending-source-matrix-gates.cjs` after the ordinary readiness/triage audit. It rejects missing, duplicated, cross-product or auto-applied source reviews, enforces **63 + 81 + 17 = 161**, checks three review-only commodity candidates and records the exact cereal-flakes discrepancy. Output: `audit-output/fssai-161-detailed-source-applicability-reconciliation.json` in GitHub Actions artifacts. All 161 records retain `no_compliance_pass` status.

## Additional exact FSSAI article evidence — 4 identities (10 October 2026)

**Current baseline: 533 total / 376 with some exact partial regulatory contaminant evidence / 157 needing exact source evidence / 0 complete-compliance approvals.** Four newly matched exact product/class identities were removed from the no-exact-source queue after verification against the official FSSAI Version IX source article. They are **not** fully verified, have **no legal compliance PASS**, and no numerical residue limit is auto-applied to a sample.

| Exact PMSV product | Named Version IX source article | Contaminant / source limit | Important unfinished applicability |
|---|---|---|---|
| Fermented Soybean Paste — FSSR 2.3.57 | Food product containing any of the above-mentioned oilseed/cereal/pulse articles | Aflatoxin B1 **10 µg/kg** | Soybean is required by the official standard, including both fermented paste variants; not the raw oilseed finished-product matrix. Ingredients, fermentation and operative amendments remain open. |
| Cereal based Sweets — FoSCoS 18.1.2.1 | Food product containing any of the above-mentioned cereal articles | Aflatoxin B1 **10 µg/kg** | Category and mandatory cereal basis verified; finished recipe, other toxin and MRL provisions remain open. |
| Pulses based Sweets — FoSCoS 18.1.2.2 | Food product containing any of the above-mentioned pulses articles | Aflatoxin B1 **10 µg/kg** | Category/pulse-based identity verified; no raw-pulse blanket residue inheritance. |
| Soup Powders — FSSR 2.3.15 | Soups and sauces | Saffrole **10 ppm** | Product is a dry soup base; dry powder versus ready-to-serve dilution basis needs independent determination before applying any sample value. |

Sources: [FSSAI Version IX (03.02.2026), Aflatoxin B1 and NOTS tables, PDF pages 14–15](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf); [FSSAI Chapter 2.3, Fermented Soybean Paste p. 88 and Soup Powders p. 26](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf); [FSSAI special Indian Sweets and Snacks categories 18.1.2.1–18.1.2.2](https://www.fssai.gov.in/upload/advisories/2021/07/60f6a6554438dDirection_Indian_Sweets_Snacks_20_07_2021.pdf).

Recorded in `fssai-product-helper-preview-01/data/rules/fssai-4-exact-composite-soup-source-evidence-v1.json`. A failed source-row, product name, FoSCoS category, FSSR identity, or unit check must restore evidence to unresolved; merely changing the text does not authorize a new contaminant PASS. Previous 161-item review records are retained only as historic snapshots and do not establish 161 *currently* unresolved.

## FSSR 2.4.13(4) solvent-extracted coconut flour chemical residue (10 October 2026)

A fifth exact identity now has source-backed **partial** chemical-residue evidence. FSSAI Chapter 2.4 Version 4 (07.05.2025) explicitly lists **food-grade hexane ≤10 ppm** for `Solvent Extracted Coconut Flour`, FSSR **2.4.13(4)**. This value is NOT a pesticide commodity MRL and must not transfer to desiccated coconut, coconut milk/cream or any other flour. It is linked exclusively to catalogue ID `06-06-2-solvent-extracted-coconut-flour`; full heavy-metals, mycotoxins, pesticide MRLs, method/results and amendments remain unchecked. Official [FSSAI Chapter 2.4, PDF p.54](https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf). The source-locked record is `solvent-extracted-coconut-flour-hexane-exact-v1.json`.

**Current total: 377 products with some partial exact source evidence; 156 still awaiting their first exact contaminant/residue article. No full-compliance PASS claimed.** The earlier 157/161 review documents above are retained as historical snapshots, not current counts.

## Unresolved by standard family

| FSSR prefix | Product identities requiring exact review |
|---|---:|
| 2.3 | 43 |
| special | 28 |
| 2.1 | 12 |
| 2.4 | 12 |
| 2.8 | 11 |
| 2.5 | 7 |
| 2.11 | 5 |
| 2.7 | 2 |
| 2.9 | 2 |
| 2.10 | 2 |
| 2.2 | 1 |
| 3.3 | 1 |

## Exact unresolved identities

All entries below have an individually stored precision-applicability gate; confirm form, recipe, source text, packaging/processing and operative amendments before moving a limit into an assessment. Unresolved is not an exemption.

### FSSR 2.1 (12)

| Product | Catalogue identity | Existing FSSR route |
|---|---|---|
| 14.5 - Dugdha Kupika (Stuffed Fried Cottage Cheese Dumplings) | `102-102-1-14-5-dugdha-kupika-stuffed-fried-cottage-cheese-dumplings` | 2.1.17 |
| Analogue in the dairy context | `01-01-3-analogue-in-the-dairy-context` | 2.1.1 |
| Analogue in the dairy context | `01-01-4-analogue-in-the-dairy-context` | 2.1.1 |
| Analogue in the dairy context | `01-01-5-analogue-in-the-dairy-context` | 2.1.1 |
| Analogue in the dairy context | `01-01-6-analogue-in-the-dairy-context` | 2.1.1 |
| Analogue in the dairy context | `01-01-7-analogue-in-the-dairy-context` | 2.1.1 |
| Analogue in the dairy context | `02-02-2-analogue-in-the-dairy-context` | 2.1.1 |
| Analogue in the dairy context | `02-02-3-analogue-in-the-dairy-context` | 2.1.1 |
| Analogue in the dairy context | `02-02-4-analogue-in-the-dairy-context` | 2.1.1 |
| Cow or Buffalo Colostrum and Colostrum Products | `100-100-cow-or-buffalo-colostrum-and-colostrum-products` | 2.1.23 |
| Edible Lactose | `11-11-1-edible-lactose` | 2.1.20 |
| Ice Cream, Kulfi, Chocolate Ice Cream, Softy Ice-Cream, Milk Ice, Milk Lolly and Dried Ice Cream Mix | `01-01-7-ice-cream-kulfi-chocolate-ice-cream-softy-ice-cream-milk-ice-milk-lolly-and-dried-` | 2.1.14 |

### FSSR 2.2 (1)

| Product | Catalogue identity | Existing FSSR route |
|---|---|---|
| Fat spread | `02-02-2-fat-spread` | 2.2.5(3) |

### FSSR 2.3 (43)

| Product | Catalogue identity | Existing FSSR route |
|---|---|---|
| Candied, Crystallised And Glazed Fruit / Vegetable / Rhizome / Fruit Peel | `04-04-1-candied-crystallised-and-glazed-fruit-vegetable-rhizome-fruit-peel` | 2.3.26 |
| Cocoa Beans | `04-04-2-cocoa-beans` | 2.3.54 |
| Coconut cream (Non-Dairy) | `04-04-1-coconut-cream-non-dairy` | 2.3.52 |
| Coconut Milk (Non-Dairy) | `04-04-1-coconut-milk-non-dairy` | 2.3.51 |
| COCONUT MILK POWDER | `04-04-1-coconut-milk-powder` | 2.3.63 |
| Colouring foods | `99-99-1-colouring-foods` | 2.3.65 |
| Concentrated Vegetable Pulp/Puree with Preservatives for industrial use only | `04-04-2-concentrated-vegetable-pulp-puree-with-preservatives-for-industrial-use-only` | 2.3.17 |
| Culinary Pastes | `12-12-6-culinary-pastes` | 2.3.28 |
| Date Paste | `04-04-1-date-paste` | 2.3.56 |
| Dehydrated Vegetables | `04-04-2-dehydrated-vegetables` | 2.3.36 |
| Desiccated Coconut | `04-04-1-desiccated-coconut` | 2.3.45 |
| Dried fungi | `04-04-2-dried-fungi` | 2.3.62 |
| Dried Fungi Concentrate | `04-04-2-dried-fungi-concentrate` | 2.3.62 |
| Dry fruits and Nuts | `04-04-1-dry-fruits-and-nuts` | 2.3.47(5) |
| Fermented Fungi | `04-04-2-fermented-fungi` | 2.3.62 |
| Frozen Curried Vegetables/Ready-to-Eat Vegetables | `04-04-2-frozen-curried-vegetables-ready-to-eat-vegetables` | 2.3.39 |
| Frozen Fruits/Fruit Products | `04-04-1-frozen-fruits-fruit-products` | 2.3.37 |
| Frozen Vegetables | `04-04-2-frozen-vegetables` | 2.3.38 |
| Fruit Bar/Toffee | `04-04-1-fruit-bar-toffee` | 2.3.19 |
| Fruit Cheese | `04-04-1-fruit-cheese` | 2.3.33 |
| Fruits and Vegetable Chutney | `04-04-1-fruits-and-vegetable-chutney` | 2.3.41 |
| Fungi extract and Fungi Concentrate | `04-04-2-fungi-extract-and-fungi-concentrate` | 2.3.62 |
| Fungi Grits and Fungi Powder | `04-04-2-fungi-grits-and-fungi-powder` | 2.3.62 |
| Fungi in olive oil and other vegetable oils | `04-04-2-fungi-in-olive-oil-and-other-vegetable-oils` | 2.3.62 |
| Ginger paste | `04-04-2-ginger-paste` | 2.3.28 |
| Murabba | `04-04-1-murabba` | 2.3.25 |
| Pickled Fungi | `04-04-2-pickled-fungi` | 2.3.62 |
| Pickles (made from Fruits) | `04-04-1-pickles-made-from-fruits` | 2.3.43 |
| Pickles made from combination of fruits or vegetables or other edible plant material including mushrooms (Mixed) | `04-04-2-pickles-made-from-combination-of-fruits-or-vegetables-or-other-edible-plant-materi` | 2.3.43 |
| Pickles made from vegetables or other edible plant material including mushrooms | `04-04-2-pickles-made-from-vegetables-or-other-edible-plant-material-including-mushrooms` | 2.3.43 |
| Quick Frozen Fried Potatoes | `04-04-2-quick-frozen-fried-potatoes` | 2.3.60 |
| Quick Frozen Fungi | `04-04-2-quick-frozen-fungi` | 2.3.62 |
| Salted fungi (semi processed products) | `04-04-2-salted-fungi-semi-processed-products` | 2.3.62 |
| Seedless Tamarind | `04-04-1-seedless-tamarind` | 2.3.49 |
| Sterilized Fungi | `04-04-2-sterilized-fungi` | 2.3.62 |
| Thermally Processed Concentrated Vegetable Juice Pulp/ Puree | `concentrated-vegetable-pulp-puree` | 2.3.13 |
| Thermally processed Curried Vegetables/Ready to Eat Vegetables | `04-04-2-thermally-processed-curried-vegetables-ready-to-eat-vegetables` | 2.3.4 |
| Thermally Processed Fruit Salad/Cocktail/Mix | `04-04-1-thermally-processed-fruit-salad-cocktail-mix` | 2.3.2 |
| Thermally Processed Fruits | `04-04-1-thermally-processed-fruits` | 2.3.1 |
| Thermally Processed Vegetables | `04-04-2-thermally-processed-vegetables` | 2.3.3 |
| Vegetable Protein Products | `12-12-10-vegetable-protein-products` | 2.3.59 |
| Vegetable Pulp/Puree with Preservatives for Industrial Use only | `04-04-2-vegetable-pulp-puree-with-preservatives-for-industrial-use-only` | 2.3.16 |
| WATER CHESTNUT FLOUR (SINGHARE KA ATTA) | `06-06-2-water-chestnut-flour-singhare-ka-atta` | 2.3.64 |

### FSSR 2.4 (12)

| Product | Catalogue identity | Existing FSSR route |
|---|---|---|
| Any other foodgrains | `06-06-1-any-other-foodgrains` | 2.4.6 |
| Arrowroot | `06-06-2-arrowroot` | 2.4.14 |
| Biscuit | `07-07-2-biscuit` | 2.4.15(1) |
| Chia Seeds | `06-06-1-chia-seeds` | 2.4.6 |
| Custard powder | `06-06-2-custard-powder` | 2.4.9 |
| Fruit/Vegetable, Cereal Flakes | `06-06-3-fruit-vegetable-cereal-flakes` | 2.4.35 |
| Macaroni Products (Instant noodle) | `06-06-4-macaroni-products-instant-noodle` | 2.4.10 |
| Macaroni Products (Pasta Products) | `06-06-4-macaroni-products-pasta-products` | 2.4.10 |
| Papad | `06-06-7-papad` | 2.4.40 |
| Papad | `15-15-1-papad` | 2.4.40 |
| Quinoa | `06-06-1-quinoa` | 2.4.6 |
| Wafer Biscuit | `07-07-2-wafer-biscuit` | 2.4.15(1) |

### FSSR 2.5 (7)

| Product | Catalogue identity | Existing FSSR route |
|---|---|---|
| Animal Casings | `08-08-4-animal-casings` | 2.5.2(14) |
| Egg powder | `10-10-2-egg-powder` | 2.5.3(3) |
| Fresh or Chilled Rabbit meat | `08-08-1-fresh-or-chilled-rabbit-meat` | 2.5.2(6) |
| Frozen Egg Products | `10-10-2-frozen-egg-products` | 2.5.3(2) |
| Frozen Rabbit meat | `08-08-2-frozen-rabbit-meat` | 2.5.2(6) |
| Liquid Egg Products | `10-10-2-liquid-egg-products` | 2.5.3(4) |
| Pickled Eggs | `10-10-3-pickled-eggs` | 2.5.3(5) |

### FSSR 2.7 (2)

| Product | Catalogue identity | Existing FSSR route |
|---|---|---|
| Cocoa mass or Cocoa/Chocolate Liquor and Cocoa Cake | `05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake` | 2.7.8 |
| Dry Mixtures of Cocoa and Sugars | `05-05-1-dry-mixtures-of-cocoa-and-sugars` | 2.7.6 |

### FSSR 2.8 (11)

| Product | Catalogue identity | Existing FSSR route |
|---|---|---|
| Bura Sugar | `11-11-1-bura-sugar` | 2.8.1(4) |
| Cane jaggery or cane gur | `11-11-1-cane-jaggery-or-cane-gur` | 2.8.4(2) |
| Cube Sugar | `11-11-1-cube-sugar` | 2.8.1(5) |
| Dried Glucose Syrup | `11-11-1-dried-glucose-syrup` | 2.8.7 |
| Golden Syrup | `11-11-3-golden-syrup` | 2.8.6 |
| Gur or Jaggery | `11-11-1-gur-or-jaggery` | 2.8.4(1) |
| Icing Sugar | `11-11-1-icing-sugar` | 2.8.1(6) |
| Khandsari Sugar | `11-11-1-khandsari-sugar` | 2.8.1(3) |
| Misri | `11-11-1-misri` | 2.8.2 |
| Plantation White Sugar | `11-11-1-plantation-white-sugar` | 2.8.1(1) |
| Royal Jelly | `100-100-royal-jelly` | 2.8.3(3) |

### FSSR 2.9 (2)

| Product | Catalogue identity | Existing FSSR route |
|---|---|---|
| Salt Substitutes | `12-12-1-salt-substitutes` | 2.9.30(6) |
| Seasoning | `12-12-2-seasoning` | 2.9.31 |

### FSSR 2.10 (2)

| Product | Catalogue identity | Existing FSSR route |
|---|---|---|
| Coffee-Chicory Mixture | `coffee-chicory-mixture` | 2.10.4 |
| Drinking Water (Purified) sold through vending machine | `purified-vending-water` | 2.10.9 |

### FSSR 2.11 (5)

| Product | Catalogue identity | Existing FSSR route |
|---|---|---|
| Carob Powder | `06-06-2-carob-powder` | 2.11.7 |
| Catechu (Edible) | `04-04-1-catechu-edible` | 2.11.2 |
| Dietary Fibre (Dextrin-soluble fibre) | `99-99-7-dietary-fibre-dextrin-soluble-fibre` | 2.11.8 |
| Pan Masala | `100-100-pan-masala` | 2.11.5 |
| SILVER LEAF (Chandi-ka-warq) | `100-100-silver-leaf-chandi-ka-warq` | 2.11.4 |

### FSSR 3.3 (1)

| Product | Catalogue identity | Existing FSSR route |
|---|---|---|
| Trehalose | `99-99-1-trehalose` | 3.3.4 |

### FSSR special (28)

| Product | Catalogue identity | Existing FSSR route |
|---|---|---|
| 12.1 - Lajadi Kashaya (Parched Rice Tea) | `102-102-1-12-1-lajadi-kashaya-parched-rice-tea` | Special FoSCoS route |
| 13.1 - Krishara (Khichdi) | `102-102-1-13-1-krishara-khichdi` | Special FoSCoS route |
| 14.1 - Golaka Dugdha (Condensed Milk without Sugar) | `102-102-1-14-1-golaka-dugdha-condensed-milk-without-sugar` | Special FoSCoS route |
| 14.3 - Narikela Ksheerika (Milky Coconut Delight) | `102-102-1-14-3-narikela-ksheerika-milky-coconut-delight` | Special FoSCoS route |
| 14.4 - Yava Ksheera (Barley Milk) | `102-102-1-14-4-yava-ksheera-barley-milk` | Special FoSCoS route |
| 14.6 - Sugandhit Ksheera (Aroma infused milk) | `102-102-1-14-6-sugandhit-ksheera-aroma-infused-milk` | Special FoSCoS route |
| 14.7 - Ksheerapaka (Mystic Milk Quartet) | `102-102-1-14-7-ksheerapaka-mystic-milk-quartet` | Special FoSCoS route |
| 15.1 - Kulmasha (Barley Savory Discs) | `102-102-1-15-1-kulmasha-barley-savory-discs` | Special FoSCoS route |
| Acidity Regulators L(+/-)tartaric Acid | `99-99-1-acidity-regulators-l-tartaric-acid` | Special FoSCoS route |
| Additives permitted under Appendix-A of FSS (FPS&FA) Regulations, 2011 and other food safety standards regulations excluding those already standardized and additives of Nutraceutical Regulations | `99-99-1-additives-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-and-other-` | FSS (FPS&FA) Regulations |
| Additives VA-VF of Nutraceutical Regulations excluding those already standardised | `99-99-1-additives-va-vf-of-nutraceutical-regulations-excluding-those-already-standardised` | Special FoSCoS route |
| Cereal or pulses flour/ Starch based snacks & savouries | `18-18-2-cereal-or-pulses-flour-starch-based-snacks-and-savouries` | Special FoSCoS route |
| Dried fruits/vegetables/nut based mouth fresheners | `05-05-2-dried-fruits-vegetables-nut-based-mouth-fresheners` | Special FoSCoS route |
| Dry Fruit and nuts based Sweets | `18-18-1-dry-fruit-and-nuts-based-sweets` | Special FoSCoS route |
| Edible Dried Seeds obtained from Fruits | `04-04-1-edible-dried-seeds-obtained-from-fruits` | Special FoSCoS route |
| Edible Dried Seeds obtained from Vegetables | `04-04-2-edible-dried-seeds-obtained-from-vegetables` | Special FoSCoS route |
| Formulated supplements for children | `formulated-supplements-children` | Special FoSCoS route |
| Fruit and vegetable based snacks & savouries | `18-18-2-fruit-and-vegetable-based-snacks-and-savouries` | Special FoSCoS route |
| Fruit and Vegetables based Sweets | `18-18-1-fruit-and-vegetables-based-sweets` | Special FoSCoS route |
| Indian Confections | `18-18-1-indian-confections` | Special FoSCoS route |
| Ingredients listed under Schedule IV, Schedule VI and Schedule VIII of Nutraceutical Regulations | `99-99-7-ingredients-listed-under-schedule-iv-schedule-vi-and-schedule-viii-of-nutraceutica` | Special FoSCoS route |
| Mixture/preparations/premix of food additives | `99-99-1-mixture-preparations-premix-of-food-additives` | Food Safety and Standards Regulations |
| Mixtures/preparations/premix of functional ingredients | `99-99-7-mixtures-preparations-premix-of-functional-ingredients` | Special FoSCoS route |
| Other traditional mouth fresheners not covered under 5.2.4.1 and 5.2.4.2 | `05-05-2-other-traditional-mouth-fresheners-not-covered-under-5-2-4-1-and-5-2-4-2` | Special FoSCoS route |
| Permitted enzymes and their preparations excluding those already listed under Processing Aids and Nutraceutical Regulations | `99-99-2-permitted-enzymes-and-their-preparations-excluding-those-already-listed-under-proc` | Special FoSCoS route |
| Polyols permitted under Appendix-A of FSS(FPS&FA) Regulations,2011 excluding those already standardized | `11-11-6-polyols-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-excluding-th` | FSS (FPS&FA) Regulations |
| Sajji Khar | `99-99-1-sajji-khar` | Special FoSCoS route |
| Starch based Sweets | `18-18-1-starch-based-sweets` | Special FoSCoS route |


## Verified partial evidence removed from the unresolved list

- **Peanut Butter — FSSR 2.2.4(11):** The official Version IX Section 2.2.1 composite food product containing oilseed article establishes **Total Aflatoxins 20 µg/kg** and **Aflatoxin B1 10 µg/kg** for a food containing groundnut kernels. The exact product-standard requirement of roasted groundnut kernels and current source values are checked independently. This establishes **only partial exact-product contaminant evidence**; other metals, residues, toxins and amendments are not cleared. This is not a complete compliance PASS or a statement of exemption.

- **Oat Products — FSSR 2.4.12** and **Multigrain flour (atta) — FSSR 2.4.37:** Both exact standards require oat or wheat cereal material. FSSAI Section 2.2.1 sets **Aflatoxin B1 10 µg/kg** for the cereal-product and composite-food categories alike. The source-gated limit is therefore partial, not a whole-product PASS. **Total Aflatoxins is not assigned** because the source categories differ (15 versus 20 µg/kg), pending product subtype or composition evidence. All other contaminants and residues remain to be checked.

- **Besan — 2.4.4** and **Roasted Bengal Gram Flour (Chana Sattu) — 2.4.33:** FSSAI Chapter 2.4 Version 4 (07 May 2025) confirms both standardized foods are based on Bengal gram (*Cicer arietinum*). Current Contaminants Version IX Section 2.2.1 specifies **Aflatoxin B1 10 µg/kg** for both Pulses and a food product containing the listed pulses. The two exact identity mappings supply partial evidence only; differing Total Aflatoxins categories, metal/residue requirements and other provisions are not cleared. Official Chapter source: https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf .

- **Tempe — 2.4.26** and **Textured Soy Protein — 2.4.27:** The official Chapter 2.4 Version 4 (07 May 2025) identifies mandatory soybean or defatted soy flour/grits. Current Contaminants Version IX Section 2.2.1 specifies **Aflatoxin B1 10 µg/kg** in both the ready-to-eat oilseed article and the food-product-containing-listed-oilseed article. Source-gated partial toxin evidence only; Total Aflatoxins, heavy metals, pesticide residues, processing factors and other provisions are not cleared. Standard: https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf .

- **Non-fermented soybean products — 2.4.30:** Five exact FoSCoS product identities (soybean beverages, soybean curd, compressed soybean curd, dehydrated soybean curd film, tofu) are explicitly described within Chapter 2.4.30 Version 4. Official Version IX Section 2.2.1 confirms **Aflatoxin B1 10 µg/kg** for both the ready-to-eat oilseed and food-product-containing-article categories; this shared B1 limit is partially evidenced for these exact products only. **Total Aflatoxins, metals, pesticide residues and other requirements are NOT automatically verified.** Product source: https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf .

- **Six exact Chapter 2.4 oilseed-derived flours/proteins:** Solvent Extract Soya Flour, Solvent Extracted Groundnut Flour, Solvent Extracted Sesame Flour, Solvent Extracted Cotton seed Flour, Expeller Pressed Edible Groundnut Flour, and Soy Protein Products are defined by their respective Chapter 2.4 clauses. Version IX Section 2.2.1 specifies **Aflatoxin B1 10 µg/kg** consistently for oilseeds for further processing, oilseeds ready to eat, and foods containing listed oilseed articles. Only these six exact identities are advanced to **partial** source-verified evidence. **Total Aflatoxins, heavy metals, pesticide residues and complete compliance remain unverified.** FSSAI source: https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf .

- **Fermented Soybean Curd — 2.4.39(1), and Lactobacillus-culture variant — 2.4.39:** Chapter 2.4 Version 4 explicitly requires an aqueous extract of soybean for both. The FSSAI Version IX B1 table confirms the same **10 µg/kg** for ready-to-eat oilseeds and food products containing listed oilseeds. The mapping is *partial*; other contaminant and residue requirements remain unresolved. Source: https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf .

- **Five exact wheat/malt identities verified 10 October 2026:** Protein rich wheat flour (2.4.1(3)), protein rich refined wheat flour (2.4.2(3)), Malted Milk Food (2.4.11(1)), Malt Based Foods (2.4.11(2)) and Malt Extract (2.4.11(3)). Their exact FSSAI Chapter 2.4 definitions guarantee cereal flour, malted cereal and/or grain legumes. Version IX 2.2.1 specifies **Aflatoxin B1 10 µg/kg** under each of Cereal and cereal products, Pulses and Food products containing the listed articles. PMSV requires the exact clause and loaded official chapter record plus all three current source rows. Only this single **partial** B1 value was mapped; the **Total Aflatoxins** category is unresolved because the relevant source rows differ (15 versus 20 µg/kg). Other contaminants, metals, MRLs and amendments remain separately pending. Source: https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf and official Version IX linked below.

- **Yellow Pea Powder FSSR 2.4.36:** Verified official Chapter 2.4 identity is powder made only by grinding dehusked yellow pea (*Pisum sativum*). Version IX Section 2.2.1 lists **Aflatoxin B1 10 µg/kg** for both Pulses and the food-product-containing category. Only this shared B1 numeric value is mapped, subject to runtime source-record checks. Total Aflatoxins differs by category (15 versus 20 µg/kg); metal, pesticide and amendment assessments remain open. In particular, deferred December 2026 pulse-flour metal article expansions must not be treated as current rules. Sources: https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf and Version IX linked below.

- **Bread and Bread-Type Products (FSSR 2.4.15(2)):** Official Chapter 2.4 Version 4 establishes mandatory **atta and/or maida** in bread and rusks. Current Version IX Section 2.2.1 gives **Aflatoxin B1 = 10 µg/kg** under both cereal/cereal-products and foods containing such articles, permitting a single narrowly scoped partial mapping with exact official-source gating. **Total Aflatoxins (15 vs 20 µg/kg categories) remains unassigned**, and metals, residues, other contaminants and amendments are not approved. Clause source: https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf ; CTR source linked below.

- **Breakfast Cereal (FSSR 2.4.35):** Current official Chapter 2.4 Version 4 requires a breakfast cereal prepared from grain-based materials, with cereals/pseudocereals/grains first collectively in the ingredient list. Version IX Section 2.2.1 establishes **Aflatoxin B1 10 µg/kg** for both cereal/cereal-product and food-containing cereal articles. PMSV has a fail-closed exact product and source-row gate for this single partial toxin limit. Total Aflatoxins (15 versus 20 µg/kg articles) and all metals, residues, other toxins and amendments remain unapproved. Official FSSR source: https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf .

## Official reference entry point

- [FSSAI Contaminants compendium — Version IX, 03 February 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf)
- [FSSAI operative contaminants amendments](https://fssai.gov.in/food-law/regulations/amendments/contaminants-toxins)
- [FSSAI food-products standards compendium](https://fssai.gov.in/food-law/regulations/compendium/food-products-standards)
- [Official FoSCoS standardized product finder](https://fcstraining.fssai.gov.in/standard-product)

Version IX numeric limits remain subject to the future amendment dated 25 May 2026 and its 01 December 2026 commencement gate. This document does not override the runtime fail-closed limits or establish an unconditional compliance pass.

## Newly verified partial evidence: FSSR 2.2.9 crude vegetable oils

`100-100-solvent-extracted-crude-vegetable-oils-not-for-direct-human-consumption` moved to partial exact evidence on 10 October 2026. FSSAI Version IX §2.1.1 Lead: **Vegetable Oils, crude — 0.1 mg/kg**, excluding cocoa butter; FSSR 2.2.9 separately identifies the solvent-extracted crude vegetable oil class. **No Arsenic limit is automatically inherited**, because its official source-oil list is narrower. Other metals, pesticide MRLs, refining requirements and amendments still require assessment. This is not a compliance PASS. Official sources: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf and https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_2_Fats_oils%20and%20fat%20emulsions.pdf.

## New exact partial pesticide evidence — dried fruits

FSSAI CTR Version IX §2.3.1 entry Malathion (combined residues of malathion and malaoxon expressed as malathion) has a separate finished **Dried fruits** commodity limit of **8 mg/kg**, distinguished from **Fruits 4 mg/kg**. Source: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf (PDF page 30, one-based).

Three exact dried fruit products have an independently matched Chapter 2.3 identity: **Dehydrated Fruits (2.3.35)**, **Dried Apricots (2.3.53)** and **Raisins (2.3.47(2))**. This moves those three to **partial exact pesticide commodity evidence only**. Dates, dry fruits-and-nuts mixed categories, fruit bars and dehydrated vegetables are not automatically included. No claim about other pesticide residues, processing factors, operative amendments, metals, toxins, or lab test compliance is made.

## Source-pinned confectionery NOTS partial evidence — 10 October 2026

FoSCoS **Lozenges** (`05-05-2-lozenges`, 2.7.2, 05.2.1) and **Sugar boiled confectionery (Soft Candy)** (`05-05-2-sugar-boiled-confectionery-soft-candy`, 2.7.1, 05.2.2) now have limited, source-matched evidence for **Hydrocyanic acid — Confectionery — 5 ppm**, official FSSAI Version IX §2.2.1 Naturally Occurring Toxic Substances. This is a category NOTS rule, **not** permission to inherit Hard Boiled Sugar Confectionery/Cocoa Powder metal limits or claim finished-product compliance. The existing exact metal locks remain and every other contaminant, pesticide MRL, ingredient requirement and effective amendment remains unapproved. Sources: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf and https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_7%20%28Sweets%20and%20Confectionary%29.pdf.

## Exact Chapter 2.9 dried-mango spice aflatoxin evidence — 10 October 2026

FSSR §2.9.23 Dried Mango Slices and §2.9.24 Dried Mango Powder (Amchur), both FoSCoS 12.2.1, are standardized in the Chapter 2.9 spices/condiments scope. Official FSSAI Contaminants Version IX §2.2.1 lists **Spices/Spice Mix** limits of **30 µg/kg total aflatoxins** and **15 µg/kg Aflatoxin B1**. Exact product ID, name, FSSR clause and FCS are required; no inheritance to fresh mango, mango pulp, mixed seasoning 12.2.2 or unrelated spices. Other contaminant and pesticide MRL coverage remains unresolved. No compliance PASS. Official sources: https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_9_Salt_Spices_Condiments%20and%20related%20products.pdf ; https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf.


## Cross-family source article qualification — 26 current pending identities (10 October 2026)

A further **26 identity-linked source gates** have been committed in `fssai-product-helper-preview-01/data/rules/fssai-26-cross-family-condition-review-2026-10-10.json`. They match the live 156-product pending manifest (11 Chapter 2.8 sugars/honey family, 4 Chapter 2.7 confectionery, 3 Chapter 2.9 spices/salt, 3 Chapter 2.10 beverages, 5 Chapter 2.11 other foods). A dedicated regression check is in `tests/fssai-26-cross-family-conditional-review.test.cjs`.

Official Version IX §2.1.1 lead source rows checked by article and unit: sugar/syrup with **sulphated ash >1%: 5 mg/kg** (PDF page 2); edible molasses/solid glucose/starch conversion product with **sulphated ash >1%: 5 mg/kg** (PDF page 4); dehydrated onions/dried herbs and spices/curry powder/mix masalas, **10 mg/kg on dry-matter basis** (PDF page 3); packaged drinking water other than mineral water, **0.01 mg/L** (PDF page 5). The water row is a deliberate *negative gate* for water sold through vending machines where packaged-water status is unestablished. Also considered the distinct refined white sugar **≤0.03% sulphated ash: 0.5 mg/kg** (PDF page 2); no product was assigned that row without demonstrated ash and identity. Source: [FSSAI Version IX](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf).

**Disposition:** All 26 remain pending; this is an applicability qualification batch, not 26 new exact evidence matches. Lead numerical candidates remain conditional. No source article was applied to a finished-product sample, no product passed contaminants/pesticides as a whole, and the live total remains **533 identities / 377 partial source matches / 156 unresolved**. Product forms excluded from borrowed articles include cocoa mass versus cocoa powder, chocolate versus cocoa powder, carob versus cocoa, coffee-chicory mixture versus coffee alone, and salt substitutes versus food-grade salt. Next promotion requires exact identity, matrix/analytical basis and effective amendment evidence. WordPress unchanged.


## Next exact named NOTS article batch — 25 products reviewed (10 October 2026)

**Current live total: 533 products; 387 with partial source-backed contaminant evidence; 146 without their first exact matched article. Zero complete compliance assessments.**

Eight product identities under FSSR §§2.3.21–2.3.24 (Ginger Cocktail, Squash, Crush, Fruit Syrup/Sharbat, Cordial, Barley Water, Synthetic Syrup for Dispensers, Synthetic Syrup or Sharbat) are source-checked against the FSSAI Contaminants Version IX §2.2.1 Naturally Occurring Toxic Substances named **Saffrole — Non-alcoholic beverages — 10 ppm** article. Any syrup/concentrate's dilution, as-prepared sample and final product status remain to be established. These 8 have exact beverage-category **partial source evidence** only; **10 ppm is not automatically applied** to an undiluted syrup or a laboratory result.

Two additional exact finished-confectionery identities, **Chocolate — FSSR 2.7.4** and **Chewing gum and bubble gum — FSSR 2.7.3**, are source-checked against the same Version IX table's **Hydrocyanic acid — Confectionery — 5 ppm** article. These are named category references for finished confectionery, not cocoa mass, cocoa powder, gum base or an unconditional contaminant assessment. The previous Chapter 2.7 lead-profile inheritance locks stay in place.

Fifteen further identities were reviewed **without promotion**: 10 edible-fungi processing forms (the **Agaric acid — Food containing mushrooms — 100 ppm** source article needs actual mushroom-species/form qualification); 3 ice cream/frozen dessert family products (the **Lead — Ice-cream, iced lollies and similar frozen confections — 1 mg/kg** article must not transfer to a dry mix or vegetable-fat analogue without proper identity and form); 1 fat spread (nickel limit depends on fat processing), and 1 Coffee-Chicory Mixture (not automatically coffee alone for Ochratoxin A). These are review-only and still counted in the pending 146.

**Files:** `fssai-product-helper-preview-01/data/rules/fssai-25-beverage-confectionery-fungi-v9-source-evidence-2026-10-10.json` and `tests/fssai-25-v9-nots-source-evidence.test.cjs`; the 533-product audit and live 146-item review manifest were updated. The earlier 156/161 references in historical sections are dated snapshots, not live counts.

**Official sources:** [FSSAI CTR Version IX, §2.2.1 (PDF p.15)](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf); [FSSAI Chapter 2.3 (pp.29–32)](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf); [FSSAI Chapter 2.7 (pp.4–6)](https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_7%20%28Sweets%20and%20Confectionary%29.pdf). Effective amendments, process form, complete metals/toxins/pesticides and test reports remain open. WordPress unchanged.


## Batch 40 — exact FSSAI source-article qualifications and fail-closed reviews (10 October 2026)

**Current authoritative PMSV catalogue snapshot: 533 identities, 397 with some partial exact article evidence, 136 still awaiting a first source match, 0 complete legal/laboratory compliance approvals.** The previous 146/156/161 counts remain historical dated snapshots.

Ten *distinct* identities now have official FSSAI Version IX source-category evidence, not a product-wide PASS:

- Four FoSCoS Indian Sweets 18.1.1.1–18.1.1.4 (Khoa, Chhana, Fermented-milk and Other composite milk-product sweets). FSSAI Indian Sweets Annexure I defines milk ingredients for all four; Version IX §2.3.1 includes **Acetamiprid — Milk and Milk products — 0.02 mg/kg**. This is **milk-source commodity evidence only**, not a ready-to-apply finished-sweet MRL. Recipes, fat basis, processing/concentration factor, pesticide panel and current amendments are not completed.
- Four FSSR 2.3.16–2.3.17 industrial fruit/vegetable juices and concentrated fruit/vegetable juices. Version IX §2.1.1 lists **Lead — Fruit and vegetable juice (excluding lime/lemon juice) — 1 mg/kg**, separately from **Fruit juices including ready-to-drink nectar — 0.05 mg/kg**. This is a **named industrial-juice source family** rather than an approval to use 1 mg/kg on every concentrate. Juice species, concentration, permitted industrial form, product subtype and the applicable overlapping juice article must be established before any sample limit is assigned.
- FSSR 2.9.29 **Asafoetida (Hing/Hingra)**, FoSCoS 12.2.1, matched against the Version IX **Spices/Spice Mix** crop-contaminant references (Total Aflatoxins **30 µg/kg**, Aflatoxin B1 **15 µg/kg**). The Hing/Hingra/compounded variants, carrier powder and other residues remain unresolved.
- FSSR 2.3.40 **Fruit Based Beverage Mix / Powdered Fruit Based Beverage**, FoSCoS 14.1.4.3, matched against **Saffrole — Non-alcoholic beverages — 10 ppm**. The dry powder is not assigned this number automatically; beverage-as-prepared status and reconstitution must be confirmed.

Thirty additional catalogue identities have explicit subtype, ash-test-method, manufacturing, packaging or analytical-sample-basis controls, **all kept in the 136 unresolved queue**. In particular, the existing exclusion of processed egg products from the fresh eggs shell-free MRL article is preserved. No previously recorded partial article has been deleted. This is a 40-identity review, with **10 source-backed partial promotions and 30 negative applicability gates**.

Sources: [FSSAI Version IX, metals p.4, crop toxins p.14 and pesticide MRL p.16](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf); [FSSAI Indian sweets Annexure I](https://www.fssai.gov.in/upload/advisories/2021/07/60f6a6554438dDirection_Indian_Sweets_Snacks_20_07_2021.pdf); [FSSAI Chapter 2.3](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3%20%28Fruit%20%26%20Vegetable%20products%29.pdf); [FSSAI Chapter 2.9](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_9_Salt_Spices_Condiments%20and%20related%20products.pdf).

Machine evidence: `fssai-product-helper-preview-01/data/rules/fssai-batch40-exact-commodity-and-conditional-scope-v1.json`. Full finished-food compliance and current amendment assessment remain incomplete. WordPress unchanged.


## Full 136-product source-applicability reconciliation — 10 new partial article anchors (10 October 2026)

**Authoritative live inventory now: 533 total, 407 with partial official article/source evidence, 126 remaining without their first exact article. Product-wide compliance PASSES remain ZERO.**

This larger review **individually rechecked the identities, regulatory route, matrix/form processing exclusions and negative article-inheritance gates of all 136 products** outstanding at the start. The machine-readable inventory is `fssai-product-helper-preview-01/data/rules/fssai-full-136-identity-applicability-review-2026-10-10.json`. This is not a finished verification of all pesticides, metals, microbiology, analytical samples or amendments.

Ten identities newly obtain **official FSSAI Version IX named regulatory source evidence** (still partial, not a numeric compliance verdict):

1. **Dates (FSSR 2.3.47(4)):** FSSAI Chapter 2.3 expressly defines Dates as dried Phoenix dactylifera fruits. The Version IX **Malathion including malaoxon — Dried fruits — 8 mg/kg** commodity MRL is a source match. Pitted/unpitted, treated with sugar/glucose/flour/oil, edible portion and processing-factor/sample-basis checks remain open.
2. **Vanilla pods, Cut vanilla and Vanilla powder (3 FoSCoS identities, FSSR 2.3.50):** Source-article candidate **Lead — Dehydrated onions, dried herbs and spices, flavourings etc. — 10 mg/kg on dry matter basis**. The Chapter 2.3 standard expressly describes dry/wooded whole pods, cut pods and vanilla powder. Confirm commodity dried-spice status and dry-matter analytical basis; do not use the 10 mg/kg number for a liquid vanilla flavour or an unqualified botanical form.
3. **Harissa (Red Hot Pepper Paste, FSSR 2.3.58):** The official recipe includes Capsicum annuum red peppers, coriander and caraway; this supports only a conditional *composite food containing spice* **Aflatoxin B1 — 10 µg/kg** named category source reference, not a blanket threshold on the finished paste or fresh chillies.
4. **Spice-based mouth freshener (FoSCoS 05.2.4.2):** Conditional **Aflatoxin B1 — Food containing the listed commodity articles — 10 µg/kg** source reference. The particular spice ingredients, ingredient share, finished product matrix and amendment still require identification.
5. **Two Frozen Desserts/Confections (FSSR 2.1.15, FoSCoS 01.7 and 02.4):** Source article **Lead — Ice-cream, iced lollies and similar frozen confections — 1 mg/kg**. This is candidate evidence for the actually frozen confection; **dried frozen dessert mix is explicitly excluded from numerical auto-application** until verified separately.
6. **Instant Tea in Solid Form (FSSR 2.10.1(4)):** Source candidate **Lead — Tea — 5 mg/kg on dry matter basis**. Instant tea is extracted tea solids, not tea leaf: source classification, analytical form and dry-matter conversion remain required.
7. **Flavouring Substances Mixtures/Premix (FoSCoS 99.3):** Source **Lead — Flavourings in dry herbs/spices/flavourings grouped article — 10 mg/kg on dry matter basis**. Confirm powder versus liquid solvent/carrier and constituent recipe before use.

**Historical source references remain auditable**; previously recorded 40-/25-/26-product reviews have not been removed. No outside non-FSSAI regulatory source or nutrition source was introduced.

Relevant primary sources: [FSSAI Version IX (03.02.2026)](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf); [FSSAI Chapter 2.3 (04.11.2024)](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf); [FSSAI Chapter 2.1 Dairy](https://fssai.gov.in/upload/uploadfiles/files/2_%20Chapter%202_1%20%28Dairy%20products%20and%20analogues%29.pdf); [FSSAI Chapter 2.10 Beverages](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_10_BEVERAGES_Other%20than%20Dairy%20and%20Fruits%20Vegetables%20based.pdf); [FoSCoS official product categories](https://fcstraining.fssai.gov.in/standard-product).

The live `gh-pages` manifest now has 126 pending identities. All 136 historical review records are kept separately. WordPress remains unchanged.
