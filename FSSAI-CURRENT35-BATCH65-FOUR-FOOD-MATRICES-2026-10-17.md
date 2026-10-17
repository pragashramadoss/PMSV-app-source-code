# PMSV FSSAI Batch 65 — Four P0 food-matrix classification findings

**Research as of:** 17 October 2026. **Destination:** only `gh-pages/fssai-product-helper-preview-01`, **not** application `main` or WordPress production.

## Executive result

This batch audits four remaining high-priority food identities that can easily be assigned the wrong heavy-metal rule by product-name analogy: **Seedless Tamarind (Copper), Cow or Buffalo Colostrum (Lead), Narikela Ksheerika (Lead), and Ksheerapaka (Lead)**.

These four records are now source-specific and identify the next original legal and real-material evidence needed for the eventual product-specific decision. **No one of the 35 CTR cases has been legally closed; no numerical limit was assigned, no accredited test scope established, no original CoA received, no tested lot released.**

## Exact findings and source limitations

| Original rank | Held food | Current official food identity | Inappropriate CTR comparator transfer avoided |
|---|---|---|---|
| **6 (P0)** | Seedless Tamarind — Copper | [FPSFA 2.3.49, FSSAI fruit/vegetable chapter version 2, PDF pp.73–74](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf). `Tamarindus indica L.` mature/ripe fruits, outer covering and seed removed. Maximum moisture **20%**, residual tamarind seeds **0.5%**, and organic extraneous matter **5%** are source-text product quality criteria. | Seedless fruit differs from **tamarind pulp/puree/concentrate** under 2.3.18 (boiling, sieving and preservation). The CTR fruit-pulp *copper* comparison row cannot be silently adopted as the seedless-fruit legal maximum. Obtain exact sold-product physical form, processing, current original CTR commodity clause and matrix-specific copper lab evidence. |
| **30 (P0)** | Cow/Buffalo Colostrum and Colostrum products — Lead | [FPSFA 2.1.23 dairy chapter v3, PDF p.76](https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_1_Dairy_products_and_analogues.pdf): cow/buffalo colostrum is secretion within **3–5 days after parturition**, before ordinary milk production. Powder is the dried derivative. Importantly, **FPSFA 2.1.1 defines regular milk as free from colostrum** (PDF p.2). | A general provision to read dairy standards together does **not** convert colostrum into ordinary milk for an automatic CTR lead limit. Obtain animal species, wet/powder form, concentration, actual ingredients, original operative lead article and suitable accredited analytical method/lab scope. |
| **33 (P0)** | Ayurveda recipe **14.3 Narikela Ksheerika** — Lead | [FSSAI order dated 25 July 2025](https://fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf) specifies **cow milk (Godugdha, 1 part)**, **coconut endosperm**, reduction/thickening and cooling/cutting as an **Ashita (Eatable)** preparation. | This is a cooked dairy–coconut composite, **not simply cow milk nor coconut milk powder**. An older published [Ayurveda compendium](https://fssai.gov.in/upload/uploadfiles/files/Ayurveda%20Aahara%20Compendium.pdf) presents Narikela Ksheerika as **Pana (Drinkable)**. The apparently differing source descriptions must be reconciled against the relevant current order rather than combined. Neither source proves a CTR composite-food lead limit. |
| **34 (P0)** | Ayurveda recipe **14.7 Ksheerapaka (Mystic Milk Quartet)** — Lead | The [same official 2025 FSSAI order](https://fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf) specifies **buffalo milk (Mahishi Ksheera, 1 part)**, water infused with aromatic flowers (flowers subsequently removed), sugar and a concentration/slow-cooking process. | The marketed dish is **not ordinary milk** solely because buffalo milk is in the ingredients. Actual ratios, flower source, final solids and as-sold matrix, original applicable CTR article and representative lab testing remain unverified. |

**Regulatory distinction:** The [original Food Safety and Standards (Ayurveda Aahara) Regulations, 2022](https://www.fssai.gov.in/upload/notifications/2022/05/62789a20b54bdGazette_Notification_Ayurveda_Aahara_09_05_2022.pdf) provide the regulatory scheme for foods prepared under approved classical texts. The **2025 recipe order** provides named preparation details, but is **not an original CTR notification specifying a lead maximum for a marketed lot**. Category A status is not proof that a manufacturer used a correct approved formulation or that laboratory evidence exists.

**Source provenance:** The compiled FSSAI Tamarind and Dairy PDFs were visually inspected at the specified pages and compared with the parsed text. The 2025 Ayurveda order's exact ingredients and method derive from officially indexed PDF text; the full source PDF has **not** been exhaustively page-rendered by the web reader due fetch limits. The conflicting older compiled recipe is noted openly. Source listing, enacted Gazette, exact commercial product and laboratory determination remain separate.

## Current regulatory control totals

| Controlled value | After Batch65 |
|---|---:|
| Catalogue / initial conditional source matches | **533 / 498** |
| Open CTR cases (P0 / P1) | **35 (13 / 22)** |
| Exact Batch65 P0 article reviews | **4** |
| Original historical evidence request IDs checked in Batch65 | **20** |
| Total historical original requests | **175** |
| Other held cases untouched | **31** |
| Original authenticated case-specific CTR lead/copper maxima | **0** |
| Actual marketed recipes authenticated | **0** |
| Accredited analyte/food-matrix laboratory scopes authenticated | **0** |
| Original signed tested CoAs / released lots | **0 / 0** |
| WordPress / `main` changes | **0** |

## Code and automated verification

- Data: `fssai-product-helper-preview-01/data/rules/fssai-current35-food-matrix-classification-batch65-2026-10-17.json`
- UI: `fssai-product-helper-preview-01/fssai-current35-food-matrix-classification-batch65-2026-10-17.js`
- Tests: `tests/fssai-current35-food-matrix-batch65-2026-10-17.test.cjs`
- Workflow: `.github/workflows/verify-fssai-current35-food-matrices-batch65.yml`
- Non-blocking startup diagnostic: `tests/fssai-preview-startup-diagnostic-batch65-2026-10-17.cjs`. Outputs page errors and preview startup state; its completion is NOT a full integration pass.
- The static cross-check preserves Batch59 and Batch64 dataset digests, all four original case IDs, 20 request IDs and zero-limit/zero-PASS outcomes.
- The Batch65 Chromium test uses a **lightweight isolated panel host** with faithful, pinned read-only source datasets. It tests filtering, searching, CSV output, and no false case approvals; **it is not a full-app end-to-end startup test**.
- Existing Batch63 and Batch64 **full helper-page Chromium smoke tests fail at their shared `pmsvB22StartupState` startup wait** after their static checks; this **remains an unresolved integration issue** and is not hidden by successful isolated tests. It requires follow-up debugging before claiming the entire GitHub preview starts successfully.

**Next closure prerequisite:** actual manufacturer identity/BOM, legal signoff on the exact operative CTR food-metal paragraph, currently verified selected laboratory method/analyte/matrix/LOQ scope and representative original CoA. These cannot be inferred from public product-standard documents.
