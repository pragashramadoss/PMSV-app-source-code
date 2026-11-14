# PMSV R30 — 17 FSSR identity standards found within the 26 FoSCoS-only routes

**4 November 2026 | Source review only | Audit branch; no production deployment**

## Finding

The R29 screen placed 26 products in a FoSCoS-classification-only group. This R30 check reconciles the existing PMSV `fssr` fields to official FSSAI FPSFA chapter documents. **17 products have a named FSSR clause** (identity/composition, not an automatically applicable CTR analyte article). **9 have only a broad product-category, ingredient-class or licensing route** with no exact official standard clause confirmed in this pass.

| Source reference status | Product records |
|---|---:|
| Explicit named FSSR source clause matched to an official chapter | 17 |
| FoSCoS/classification route only; exact FSSR clause not confirmed | 9 |
| Original unadjudicated product-level CTR article applicability cases | 137 |
| New fully verified CTR panels or product legal approvals | 0 |

## Official FSSR clause matches (17)

| Product | Original FSSR reference | Source document | Key legal-applicability distinction |
|---|---|---|---|
| Candied, Crystallised And Glazed Fruit / Vegetable / Rhizome / Fruit Peel (`04-04-1-candied-crystallised-and-glazed-fruit-vegetable-rhizome-fruit-peel`) | 2.3.26 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf) | Sweetener impregnation is not equivalent to a canned-fruit, fresh-fruit or juice CTR article |
| Catechu (Edible) (`04-04-1-catechu-edible`) | 2.11.2 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/12_%20Chapter%202_11%20%28Other%20food%20product%20and%20%20ingredients%29.pdf) | Do not inherit unnamed spice, raw-wood or other botanical CTR rows |
| Frozen Fruits/Fruit Products (`04-04-1-frozen-fruits-fruit-products`) | 2.3.37 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf) | Frozen product standard does not automatically transfer fresh or canned fruit metal/MRL rows |
| Fruit Cheese (`04-04-1-fruit-cheese`) | 2.3.33 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf) | Fruit cheese is not dairy cheese; do not inherit milk CTR articles or automatically treat as jam |
| Murabba (`04-04-1-murabba`) | 2.3.25 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf) | Do not assume generic jam, canned fruit or fruit-juice CTR article |
| Pickles (made from Fruits) (`04-04-1-pickles-made-from-fruits`) | 2.3.43 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf) | The specific pickled-cucumber or mango-chutney CTR row is not a generic pickle limit |
| Seedless Tamarind (`04-04-1-seedless-tamarind`) | 2.3.49 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf) | Do not borrow fresh-fruit or root/tuber limit automatically |
| Frozen Curried Vegetables/Ready-to-Eat Vegetables (`04-04-2-frozen-curried-vegetables-ready-to-eat-vegetables`) | 2.3.39 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf) | Frozen curried vegetables are not automatically canned vegetables or raw vegetables |
| Frozen Vegetables (`04-04-2-frozen-vegetables`) | 2.3.38 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf) | No automatic generic transfer of raw vegetable or canned vegetable limits |
| Quick Frozen Fried Potatoes (`04-04-2-quick-frozen-fried-potatoes`) | 2.3.60 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf) | Do not automatically apply peeled raw potato cadmium or raw root/tuber limits to processed finished food |
| Arrowroot (`06-06-2-arrowroot`) | 2.4.14 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf) | Do not treat manufactured arrowroot starch as raw root and tuber vegetable |
| Royal Jelly (`100-100-royal-jelly`) | 2.8.3(3) | [Official chapter](https://mail.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20%28Sweetening%20agents%20including%20Honey%29.pdf) | Beeswax lead 2 mg/kg and honey-specific antibiotic method-performance rows must not be silently inherited |
| SILVER LEAF (Chandi-ka-warq) (`100-100-silver-leaf-chandi-ka-warq`) | 2.11.4 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/12_%20Chapter%202_11%20%28Other%20food%20product%20and%20%20ingredients%29.pdf) | Minimum 999/1000 silver purity is not a full toxic metal/CTR analyte-panel confirmation |
| Edible Lactose (`11-11-1-edible-lactose`) | 2.1.20 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_1_Dairy_products_and_analogues.pdf) | Milk origin alone does not make it ordinary milk or dehydrated milk for CTR articles |
| Salt Substitutes (`12-12-1-salt-substitutes`) | 2.9.30(6) | [Official chapter](https://mail.fssai.gov.in/upload/uploadfiles/files/Chapter%202_9_Salt%20Spices%20Condiments%20and%20related%20products.pdf) | Do not inherit sodium chloride/food-grade common salt CTR rows solely from the word salt |
| Trehalose (`99-99-1-trehalose`) | 3.3.4 | [Official chapter](https://fssai.gov.in/upload/uploadfiles/files/Chapter%203_Substances_added_to_food.pdf) | Ingredient GMP permission is not a contaminant limit or permission for all infant foods |
| Dietary Fibre (Dextrin-soluble fibre) (`99-99-7-dietary-fibre-dextrin-soluble-fibre`) | 2.11.8 | [Official chapter](https://www.fssai.gov.in/upload/uploadfiles/files/12_%20Chapter%202_11%20%28Other%20food%20product%20and%20%20ingredients%29.pdf) | Starch origin or dietary fibre class does not automatically inherit commodity cereal pesticide/metal limits |

## FoSCoS-only routes still requiring exact chemical/product reference (9)

| Product | Original FSSR reference | Missing evidence |
|---|---|---|
| Other traditional mouth fresheners not covered under 5.2.4.1 and 5.2.4.2 (`05-05-2-other-traditional-mouth-fresheners-not-covered-under-5-2-4-1-and-5-2-4-2`) | None in catalogue | Class/substance/mixture title alone is insufficient: obtain exact chemical/botanical identity, legally applicable ingredient/formulation standard and current Gazette before assessing CTR. |
| Polyols permitted under Appendix-A of FSS(FPS&FA) Regulations,2011 excluding those already standardized (`11-11-6-polyols-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-excluding-th`) | FSS (FPS&FA) Regulations | Class/substance/mixture title alone is insufficient: obtain exact chemical/botanical identity, legally applicable ingredient/formulation standard and current Gazette before assessing CTR. |
| Additives permitted under Appendix-A of FSS (FPS&FA) Regulations, 2011 and other food safety standards regulations excluding those already standardized and additives of Nutraceutical Regulations (`99-99-1-additives-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-and-other-`) | FSS (FPS&FA) Regulations | Class/substance/mixture title alone is insufficient: obtain exact chemical/botanical identity, legally applicable ingredient/formulation standard and current Gazette before assessing CTR. |
| Additives VA-VF of Nutraceutical Regulations excluding those already standardised (`99-99-1-additives-va-vf-of-nutraceutical-regulations-excluding-those-already-standardised`) | None in catalogue | Class/substance/mixture title alone is insufficient: obtain exact chemical/botanical identity, legally applicable ingredient/formulation standard and current Gazette before assessing CTR. |
| Sajji Khar (`99-99-1-sajji-khar`) | None in catalogue | Class/substance/mixture title alone is insufficient: obtain exact chemical/botanical identity, legally applicable ingredient/formulation standard and current Gazette before assessing CTR. |
| Permitted enzymes and their preparations excluding those already listed under Processing Aids and Nutraceutical Regulations (`99-99-2-permitted-enzymes-and-their-preparations-excluding-those-already-listed-under-proc`) | None in catalogue | Class/substance/mixture title alone is insufficient: obtain exact chemical/botanical identity, legally applicable ingredient/formulation standard and current Gazette before assessing CTR. |
| Ingredients listed under Schedule IV, Schedule VI and Schedule VIII of Nutraceutical Regulations (`99-99-7-ingredients-listed-under-schedule-iv-schedule-vi-and-schedule-viii-of-nutraceutica`) | None in catalogue | Class/substance/mixture title alone is insufficient: obtain exact chemical/botanical identity, legally applicable ingredient/formulation standard and current Gazette before assessing CTR. |
| Mixtures/preparations/premix of functional ingredients (`99-99-7-mixtures-preparations-premix-of-functional-ingredients`) | None in catalogue | Class/substance/mixture title alone is insufficient: obtain exact chemical/botanical identity, legally applicable ingredient/formulation standard and current Gazette before assessing CTR. |
| Formulated supplements for children (`formulated-supplements-children`) | None in catalogue | Class/substance/mixture title alone is insufficient: obtain exact chemical/botanical identity, legally applicable ingredient/formulation standard and current Gazette before assessing CTR. |

## Primary-source and legal controls

- FSSAI publishes FPSFA chapter compendia for ready reference and explicitly states that original Gazette notifications prevail if there are errors or overlaps in the compendium.
- **FSSR product identity ≠ CTR heavy-metal or pesticide article.** A matching 2.x or 3.x clause establishes which product/ingredient standard should be assessed, not that a particular CTR metal/toxin/residue rule or limit applies.
- In particular, fruit cheese is defined as a fruit-pulp product and not dairy cheese. Royal jelly is distinct from beeswax and honey. Salt substitutes must not be assigned common-salt contaminant thresholds from the name.
- Trehalose 3.3.4 includes product-quality and ingredient-use requirements, including exclusion of infant food in the referenced permission; those requirements are not a blanket contaminant-panel PASS.
- The 1 December 2026 CTR amendment remains future-effective on the 4 November review date; avoid applying future limits now.
- For all 26, confirm product form, legal article, all applicable analytes and method/units/processing factors; actual laboratory evidence is a different assessment from naming a source clause.

## Source references

- [FSSAI official FPSFA chapter compendium index](https://www.fssai.gov.in/food-law/regulations/compendium/food-products-standards)
- [FSSAI CTR Version IX, 3 February 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf)
- [FoSCoS standard product catalogue](https://fcstraining.fssai.gov.in/standard-product)

The complete per-product source URL and evidence fields are saved in `ctr-26-fssr-clause-reconciliation-r30-2026-11-04.json`. Existing R27/R28/R29 audit records, product master, operative CTR numerical rules, full approval fields and `gh-pages` are unchanged. PR #2 remains draft/unmerged.
