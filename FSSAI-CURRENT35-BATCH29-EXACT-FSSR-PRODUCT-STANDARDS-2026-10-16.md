# PMSV FSSAI Helper — Batch 29: Product-standard sources confirmed separately from CTR contaminant rules

**Review date:** 16 October 2026. **Destination:** GitHub Pages preview only. WordPress production and the canonical 533-product ledger remain unchanged.

## Key result

After the 35-case CTR article-scope work in B26–B28, identify **7 directly named FSSR product standards** and **21 official published product-quality requirements** that can be shown separately from the unresolved contaminant applicability decisions. This is a real product-identity source improvement, **not** a claim that these products have passed sample testing or that their CTR metal/toxin source questions have been resolved.

| Canonical measure | Result |
|---|---:|
| Catalogue products | 533 |
| Existing conditional reference links | 498 (not compliance passes) |
| CTR first exact-source cases still pending | **35** |
| Named FSSR finished product standards located in this batch | **7** |
| Published FSSR quality requirements extracted | **21** |
| Actual tested / compliance-approved lots | **0** |
| Newly proven exact CTR source applicability | **0** |

## Official clause-by-clause product standards

Sources: [Official FSSR Chapter 2.11 — Other food products and ingredients](https://www.fssai.gov.in/upload/uploadfiles/files/12_%20Chapter%202_11%20(Other%20food%20product%20and%20%20ingredients).pdf), [Official FSSR Chapter 2.10 — Beverages](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_10%20(BEVERAGES%20(Other%20than%20Dairy%20and%20Fruits%20and%20Vegetables%20based).pdf), and [Official FSSR Chapter 3 — Substances added to food](https://fssai.gov.in/upload/uploadfiles/files/Chapter%203_Substances_added_to_food.pdf).

| Finished-food identity | Legal clause | Exact statutory product-quality text (published, not lot-tested) | Important guard |
|---|---|---|---|
| Catechu (edible), dried aqueous Acacia catechu heartwood extract | 2.11.2 | Max 16% loss on drying, 25% water-insoluble residue, 30% alcohol-insoluble residue, 8% dry-basis total ash and 0.5% dry-basis HCl-insoluble ash | Bhatti Katha has a **separate 1.5% HCl-insoluble-ash proviso**; actual identity must be demonstrated. |
| Silver leaf (Chandi-ka-warq) | 2.11.4 | Max foil weight **2.8 g/m²**; silver fineness minimum **999/1000** | Requires no materials of animal origin, and separate CTR compliance; silver purity is **not** a CTR lead/cadmium result. |
| Carob powder | 2.11.7 | Max total ash **1.2%**, max acid-insoluble matter **5%**, tannin **0.10–0.15%** | Derived from roasted *Ceratonia siliqua* pods, not the CTR cocoa-powder article. |
| Dietary fibre (dextrin-soluble fibre) | 2.11.8 | Average degree of polymerization **12–25** | Origin/process must be verified; not the high-ash solid glucose CTR article by default. |
| Trehalose | 3.3.4 | Max loss on drying **1.5%**; max **total ash 0.05%** | **Total ash is not sulphated ash**. GMP use excludes infant food; do not promote the high-sulphated-ash sugar comparator. |
| Drinking water (purified) sold by vending machine | 2.10.9 | Shall be visibly clear, free of suspended particles/sediment and conform to **IS 10500** | It is distinct from packaged drinking water and mineral water; packaged-water CTR limits do not automatically transfer. |
| Coffee-chicory mixture, **roasted and ground variant only** | 2.10.4 | Coffee at least **51%**; max moisture **5%**, total ash **7.5%** (dry basis), acid-insoluble ash **0.6%** (dry basis); caffeine min **0.6%** (dry basis) | Instant mixture has a different finished-food standard. Both need a separate adjudication of CTR ochratoxin A for the final blend. |

## Technical reason these are not CTR first-source promotions

Food Products Standards and Food Additives (FPSFA/FSSR) regulates **what the product is and selected identity, quality and compositional requirements**. The Food Safety and Standards (Contaminants, Toxins and Residues) Regulations define separate metal, toxin and residue articles with their own analytical bases. A source can be correct for the product standard and still not establish which finished-product contaminant maximum to enforce.

In particular, **silver's 999/1000 fineness**, **carob total ash**, **trehalose total ash**, and **dextrin polymerization** are genuine published criteria, but none is a contaminant limit for lead/arsenic/copper/cadmium. All are shown explicitly with no laboratory verdict. A vendor COA, applicable regulator source and signed scope judgment are still needed before any actual sample PASS.

## Release safety and test coverage

- The new JSON evidence data uses exactly the seven canonical product IDs; the review UI refuses it if an ID, FSSR number, identity name, document fingerprint or unchanged 35-case ledger disagrees.
- Viewer has search by product, FSSR clause or parameter, official source citations, and a link to the existing individual reviewer form. It does not write source statuses.
- Real Chromium integration verifies 7 product dossiers, 21 quality entries, source fingerprints, cross-case identity, navigation and untouched 533/498/35 counts.
- WordPress production unchanged; official references not automatically assigned as CTR contaminant thresholds.

**Preview data:** `fssai-product-helper-preview-01/data/rules/fssai-current35-product-identity-first-sources-batch29-2026-10-16.json`.

**Application layer:** `fssai-product-helper-preview-01/fssai-current35-product-identity-first-sources-batch29-2026-10-16.js`.

**Regression:** `tests/fssai-current35-product-identity-first-sources-batch29-2026-10-16.test.cjs`.

### Further closure evidence required

Get actual product identity and variant, material and process records, relevant methods and test reports, documented legal contaminant article precedence and analytical basis, and independent approval. Do not use these FSSR product criteria as substitutes for those gates.
