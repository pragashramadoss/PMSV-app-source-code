# PMSV FSSAI Helper — Batch 33: Misri, dried glucose syrup, edible lactose, seedless tamarind

**As reviewed:** 16 October 2026. **Scope:** GitHub Pages preview only, not WordPress.

## The verified legal improvement

Following Batches 29–32, four more finished-product legal standards have been identified and mapped to *their own exact product names* without promoting any uncertain contaminant maximum.

Official FSSAI compiled chapters used (legal priority remains with original notified Gazette if inconsistent):

- [FSSR 2.8 — Sweetening agents, Version 1 (1 Sep 2023)](https://stg-old.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf) — **2.8.2 Misri**, PDF page 4, and **2.8.7 Dried Glucose Syrup**, PDF page 13.
- [FSSR 2.3 — Fruit/Vegetable, Version 3 (7 May 2025)](https://stg-old.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit_Vegetable_products.pdf) — **2.3.49 Seedless Tamarind**, PDF pages 73–74.
- [FSSR 2.1 — Dairy products, Version 3 (7 May 2025)](https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_1_Dairy_products_and_analogues.pdf) — **2.1.20 Edible Lactose**, printed page 72 onward, cross-checked against the 2017 original dairy gazette and earlier consolidation.

| Exact as-sold product | Published FSSR quality requirement | Analytical distinction |
|---|---|---|
| Misri | Total ash **≤0.4%**; total sugar, expressed as sucrose, **≥98%** | **Total ash ≠ sulphated ash**; Misri is not automatically the refined-sugar CTR article. |
| Dried glucose syrup | Total solids **≥93%**; reducing sugars **≥20%**; **sulphated ash ≤1.0%** | A high-ash CTR comparator requiring **sulphated ash >1.0%** cannot apply to a product that satisfies this specific FSSR requirement. |
| Edible lactose | Total moisture **≤6%**; lactose **≥99% dry basis**; sulphated ash **≤0.3%**; 10% solution pH **4.5–7.0**; scorched particles maximum **Disc B** | This is a whey-derived purified disaccharide; not automatically dairy milk for CTR metals. |
| Seedless tamarind | Moisture **≤20%**; organic extraneous matter **≤5%**; total ash **≤6% dry basis**; acid-insoluble ash **≤1% dry basis**; crude fibre **≤9% dry basis**; residual seeds **≤0.5%** | Seedless whole tamarind is not a fruit-pulp/puree/concentrate article. Its FSSR ash is not a CTR copper/arsenic limit. |

## An important source-comparator exclusion

The existing source research contains a *high-sulphated-ash solid-glucose/starch conversion* lead comparator. The actual **FSSR 2.8.7 dried glucose syrup** standard unambiguously allows at most 1.0% sulphated ash. Therefore if a lot **conforms to this FSSR specification**, it **cannot meet a separate high-ash article defined as requiring >1% sulphated ash**. That particular high-ash comparator must not be treated as the directly applicable CTR maximum.

This is a **negative applicability finding** only; it **does not identify or certify the correct remaining contaminant limit**, which still needs the legally applicable named article, actual product details, any other applicable CTR provision, independent review and laboratory results.

The same care applies to Misri: 0.4% total ash is not proof of its sulphated-ash fraction and is not proof it is legally refined sugar.

## Review results

| Metric | Recorded result |
|---|---:|
| Canonical catalogue | 533 |
| Conditional first-source records (not full approvals) | 498 |
| CTR cases requiring exact product/legal article adjudication | **35** |
| Named FSSR product-standard dossiers through B32 | 15 |
| Newly named FSSR product standards in B33 | **4** |
| Accumulated named product-standard dossiers through B33 | **19** |
| B33 published quality criteria recorded | **17** |
| Finished CTR maxima or real lot laboratory PASS activated | **0** |

## Required evidence to close a case

For each as-sold commodity, verify its exact product name/classification, process, ingredients, applicable notified version, analytical test basis (particularly total vs sulphated ash and dry basis), actual accredited/validated report, and independent CTR table article/metal/limit selection. Identity standards and comparator sources alone never provide a lab PASS.

**Dataset:** `fssai-product-helper-preview-01/data/rules/fssai-current35-four-sugar-lactose-tamarind-standards-batch33-2026-10-16.json`  
**Preview UI:** `fssai-product-helper-preview-01/fssai-current35-four-sugar-lactose-tamarind-standards-batch33-2026-10-16.js`  
**Real browser CI:** `tests/fssai-current35-four-sugar-lactose-tamarind-standards-batch33-2026-10-16.test.cjs`

**Deployment:** Preview only; WordPress unchanged. Research quality standards are not independent legal approval decisions.
