# PMSV FSSAI Helper — large 20-product chapter-quality source batch (11 October 2026)

**GitHub `gh-pages` only. WordPress unchanged.**
**Regulatory conclusion:** 533 local catalogue products = **409 with some partial exact contaminant/chemical residue evidence + 124 without a first exact source match**. No finished-product laboratory/contaminant compliance PASS is claimed.

## What is newly available

**20** actual pending FoSCoS product identities now have source-linked FSSR product-standard quality details available on the Helper's product-contaminant screen in a **separate, clearly labelled QUALITY / NOT CONTAMINANT MRL** expandable panel. This adds **75** numerical quality/packing-medium references (including **13** new clause 2.3.2 source criteria), each requiring identity and process/pack qualification. All **20 remain** in the separate **124 still-unresolved CTR article queue**; **0** new first-source contaminant identities were established by this batch.

The source-checked gate requires:
- Exact product **catalogue ID, name, FoSCoS category and chapter rule**;
- Matching current locally loaded FSSAI source row **parameter, inequality, number and unit**, and exact subtype/packing-medium details;
- An official FSSAI source link and matching source rules. If source, identifier or number changes, display is withheld rather than silently substituting an unverified limit;
- **No** automatic PASS, ingredient-to-finished-food transfer, raw-commodity pesticide MRL inheritance or assumption that recorded quality benchmarks are complete compliance.

## All 20 reviewed products

| # | Official local product identity | FSSR clause | Numeric quality criteria | Packing-medium Brix grades | CTR status |
|---:|---|---|---:|---:|---|
| 1 | Cocoa Beans | 2.3.54 | 5 | 0 | Pending exact CTR evidence |
| 2 | WATER CHESTNUT FLOUR (SINGHARE KA ATTA) | 2.3.64 | 4 | 0 | Pending exact CTR evidence |
| 3 | Fruit/Vegetable, Cereal Flakes | 2.3.20 | 3 | 0 | Pending exact CTR evidence |
| 4 | Dry Mixtures of Cocoa and Sugars | 2.7.6 | 1 | 0 | Pending exact CTR evidence |
| 5 | Fruit Cheese | 2.3.33 | 3 | 0 | Pending exact CTR evidence |
| 6 | Dehydrated Vegetables | 2.3.36 | 3 | 0 | Pending exact CTR evidence |
| 7 | Desiccated Coconut | 2.3.45 | 5 | 0 | Pending exact CTR evidence |
| 8 | Date Paste | 2.3.56 | 3 | 0 | Pending exact CTR evidence |
| 9 | Fruit Bar/Toffee | 2.3.19 | 3 | 0 | Pending exact CTR evidence |
| 10 | Thermally Processed Fruits | 2.3.1 | 3 | 0 | Pending exact CTR evidence |
| 11 | Thermally Processed Vegetables | 2.3.3 | 4 | 0 | Pending exact CTR evidence |
| 12 | Icing Sugar | 2.8.1(6) | 3 | 0 | Pending exact CTR evidence |
| 13 | Bura Sugar | 2.8.1(4) | 3 | 0 | Pending exact CTR evidence |
| 14 | Cube Sugar | 2.8.1(5) | 3 | 0 | Pending exact CTR evidence |
| 15 | Misri | 2.8.2 | 3 | 0 | Pending exact CTR evidence |
| 16 | Golden Syrup | 2.8.6 | 3 | 0 | Pending exact CTR evidence |
| 17 | Catechu (Edible) | 2.11.2 | 6 | 0 | Pending exact CTR evidence |
| 18 | Carob Powder | 2.11.7 | 2 | 0 | Pending exact CTR evidence |
| 19 | SILVER LEAF (Chandi-ka-warq) | 2.11.4 | 2 | 0 | Pending exact CTR evidence |
| 20 | Thermally Processed Fruit Salad/Cocktail/Mix | 2.3.2 | 5 | 8 | Pending exact CTR evidence |

## Chapter 2.3.2 fruit-salad/cocktail update, verified against FSSAI Version 2 (04.11.2024)

Official source: https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf, pages 2–4 (printed pages 2–4).

**Eight separate sweetened packing-medium Brix classes**, distinguishing fruit-juice-based media from water/water-and-juice media, each with **10–13.9 °Brix, 14–17.9 °Brix, 18–21.9 °Brix and >=22 °Brix** bands; do not auto-select a class without identifying the actual medium and any added sugars.

**Five additional qualified quality references:** for canned tropical fruit salad, blemished pieces <=2/100 g drained fruit, peel <=6.5 cm²/500 g total contents when the fruit is peeled, and seed/extraneous vegetative material <=2 g/500 g total contents; minimum container fill >=90% of water capacity, and drained weight >=50% of the mass of distilled water at 20°C required to fill the sealed container. The drained-weight **water-capacity basis** differs from Chapter 2.3.1's liquid/solid net-weight basis. The generic FoSCoS fruit-salad/cocktail identity must be qualified as the article and pack type covered by each reference.

**Separate Chapter 2.3.3 correction:** the 25% minimum drained-weight article is **edible fungi/vegetables including baked beans packed in sauce**, not just mushrooms in sauce. Corrected with the same FSSAI Version 2 official source, printed page 6.

## Controls and separation of regulatory layers

- **`chapter-2-3-fruit-vegetable-v1.json`:** Version 2 source-locked new 2.3.2 Brix/quality criteria; amended 2.3.3 label and official URL.
- **`fssai-20-pending-exact-chapter-quality-2026-10-11.json`:** 20 exact product IDs, numerical quality criteria with analytic basis, 8 extra fruit-salad Brix classes, official source links, and no-PASS flags.
- **`scripts/audit-fssai-product-readiness.cjs`:** checks each product's identity and every number/operator/unit against loaded official chapter data; tallies **20 quality-only source attachments** separately from all contaminant/chemical-residue first-source matches.
- **`fssai-product-helper-preview-01/index.html`:** shows source-pinned, collapsible quality panels only after runtime source-integrity reconciliation. A broken source fails closed.
- **`tests/fssai-20-pending-chapter-quality-source-2026-10-11.test.cjs`:** verifies all 20 identities and all 75 criteria, wrong-FSSR and wrong-name rejection, source number/URL drift, packing-medium 2.3.2 tampering and the **409/124** audit conservation.

**Scope limitation:** Several existing chapter data records are transcribed from older official FSSAI compendium versions. Their numerical content is source-linked to those official chapters but has **not** been individually cleared against every subsequently effective amendment in this batch. No result is a completed contaminant, pesticide, microbiological, additive, packaging or labelling verification.

Next priority: source-match actual official **Version IX contaminant/pesticide article applicability** for the **124** identities. Avoid claiming a lower queue merely because additional product-quality standards were documented.
