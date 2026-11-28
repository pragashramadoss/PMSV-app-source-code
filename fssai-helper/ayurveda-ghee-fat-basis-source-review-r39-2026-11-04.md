# PMSV R39 — source-anchored Ghee / Ghrita dairy identity and fat-basis CTR review

**4 November 2026 — draft audit branch only. No product compliance or batch release PASS.**

## Audited delta

| Check | R39 result |
|---|---:|
| Catalogue product identities retained | 533 |
| Original product-specific CTR article holds still open | **137** |
| Original Ayurveda ingredient rows | 46 |
| Prior original ingredient rows without a CTR source candidate (R38) | 20 |
| New distinct original ghee ingredient occurrences with conditional CTR source references | **4** |
| Remaining original ingredient occurrences without CTR source candidates | **16** |
| Cumulative original ingredient rows with one or more candidate CTR source references | **30 / 46** |
| New distinct conditional CTR source rows | 2 |
| New raw ingredient-to-CTR source reference links | **8** |
| Total raw ingredient-to-CTR source reference links (R36+R37+R38+R39) | **88** |
| Exact legally adjudicated finished-product CTR article decisions | **0** |
| Whole product legal approvals / batch releases | **0** |

## FSSAI source identity: ghee is a milk-fat product

The official FPSFA dairy chapter **2.1.1, item 1(f)(vii)** lists **ghee** as a **milk product**. Standard **2.1.8** describes ghee as a milk-fat product derived exclusively from milk/milk products, with 99.5% minimum milk fat and 0.5% maximum moisture (2021 Gazette amended standard). The 2021 Gazette's English composition table is visually confirmed on **PDF page 8**.

This resolves only the **named source-category identity** of the recipe ingredient. Actual supplier ghee, its genuine dairy nature, grade, composition and product formulation have not been confirmed.

## Version IX CTR: exact printed source rows (not an automatic ghee limit)

| Pesticide / residue definition | Published CTR food article | Printed source MRL | 1-based PDF page |
|---|---|---:|---:|
| Carbofuran — sum of carbofuran and 3-hydroxy carbofuran, expressed as carbofuran | Milk and Milk products | 0.05 mg/kg (fat basis) | 19 |
| Phorate — sum of phorate, its oxygen analogue and their sulphoxides and sulphones, expressed as phorate | Milk and Milk products | 0.05 mg/kg (F) | 33 |

Official CTR **page 39 footnote** specifies **F = maximum residue limit calculation on fat basis**. The printed milk-products article is a **potential ghee-source article** because ghee is a legally defined milk product, *but no legal determination of the actual ghee SKU, residue basis or final cooked Ayurveda recipe has been completed*. The above are **two examples, not a complete pesticide panel**.

## Four original recipe occurrences linked conditionally

| Recipe | Ingredient | Source identity | Conditional CTR references | Status |
|---|---|---|---:|---|
| 13.1 | Ghrita | Ghee, milk-fat standard 2.1.8 | 2 | HOLD — applicability and lab basis |
| 14.4 | Goghrita | Ghee, milk-fat standard 2.1.8 | 2 | HOLD — applicability and lab basis |
| 14.5 | Ghrita | Ghee, milk-fat standard 2.1.8 | 2 | HOLD — applicability and lab basis |
| 14.6 | Ghrita | Ghee, milk-fat standard 2.1.8 | 2 | HOLD — applicability and lab basis |

### Mandatory guards

- **No vegetable-oil source inheritance:** ghee is not coconut, mustard, refined vegetable or other plant oil.
- **No generic liquid milk equivalence:** milk-product fat-basis reporting is not identical to a mass-based liquid milk assay or the cooked multi-ingredient product.
- **Residue definition matters:** the Carbofuran and Phorate values are each tied to their printed combined residue definitions and fat-basis qualifiers.
- **R35 Ayurveda recipe 14.6 remains on official title/table/method alignment hold.**
- These 2 candidate residue rows are not the full current contaminants, mycotoxins, veterinary drug, pesticide or microbiological panels.
- The **25 May 2026 CTR amendment is effective on 1 December 2026**, after the review date; do not apply it early.
- Neither operative numerical rules, product master, live PMSV engine, nor any commercial or legal PASS was modified.

### Official sources

- [FSSAI dairy product standards, chapter 2.1](https://mail.fssai.gov.in/upload/uploadfiles/files/2_%20Chapter%202_1%20%28Dairy%20products%20and%20analogues%29.pdf) — milk product definition and milk fat products standard 2.1.8.
- [FSSAI notified ghee standard amendment, 2021](https://www.fssai.gov.in/upload/notifications/2021/12/61ce91bf0f10eGazettte_Notification_Ghee_Milk_31_12_2021.pdf) — English page 8.
- [FSSAI CTR Version IX, 3 Feb 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf) — PDF pp. 19, 33 and 39, source page images inspected.

Structured review: `ayurveda-ghee-fat-basis-source-review-r39-2026-11-04.json`. New references are *research citations*, not operable product release rules.
