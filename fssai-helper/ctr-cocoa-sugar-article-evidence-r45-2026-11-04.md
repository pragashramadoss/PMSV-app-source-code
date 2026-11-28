# PMSV R45 — Exact source article vs food identity: cocoa beans, carob and five sugars

**4 November 2026 | Draft legal-source audit only. No final product CTR decisions closed.**

## Seven original catalogue records reviewed

| R29 food entry | FSSR identity | Evidence needed to choose legal CTR article |
|---|---|---|
| Cocoa Beans | 2.3.54 | Properly fermented and dried WHOLE seeds of Theobroma cacao; not processed cocoa powder |
| Carob Powder | 2.11.7 | Roasted carob POD powder from Ceratonia siliqua; not cocoa powder from Theobroma cacao |
| Bura Sugar | 2.8.1(4) | Fine grained product from any kind of sugar; FSSR acid-insoluble ash is not sulphated ash |
| Cube Sugar | 2.8.1(5) | Blocks from refined crystallised sugar; FSSR total ash max 0.03% is NOT sulphated ash |
| Icing Sugar | 2.8.1(6) | Powdered refined or plantation-white sugar, with/without edible starch; source ingredient not same finished regulatory article |
| Khandsari Sugar | 2.8.1(3) | Sugar from open-pan cane-juice processing, Desi or Sulphur variant; acid-insoluble ash is NOT sulphated ash |
| Plantation White Sugar | 2.8.1(1) | Sugarcane/beet crystallised product distinct from FSSR refined white sugar; do not assign refined CTR article from colour alone |

Of seven original catalogue rows, **two** had a previously blocked wrong article inheritance (cocoa beans, carob), **five** are conditional sugar categories. None had an actual finished SKU formula, legally matched current CTR article, validated sample method and result set. **0** exact finished-product CTR article decisions are newly closed.

## Official Version IX 03.02.2026 CTR named metal rows, visually checked

| Metal | Named food article | Limit (mg/kg) | Printed condition | PDF page |
|---|---|---:|---|---:|
| Lead | Cocoa powder | 5 | dry fat-free substance basis | 3 |
| Copper | Cocoa powder | 70 | fat-free substance basis | 7 |
| Lead | Refined white sugar | 0.5 | sulphated ash not exceeding 0.03% | 2 |
| Lead | All types of sugars; sugar syrup; invert sugar; direct-consumption coloured sugars | 5 | sulphated ash exceeding 1.0% | 2 |
| Lead | Raw sugars, qualified by end use | 5 | except raw sugars sold for direct consumption or used in manufacture other than refined sugar | 5 |
| Lead | Hard boiled sugar confectionery | 2 | specific named finished product article | 4 |
| Copper | Hard boiled sugar confectionery | 5 | specific named finished product article | 7 |

**Cocoa warning:** Lead **5.0 mg/kg on DRY FAT-FREE SUBSTANCE** and copper **70 mg/kg on FAT-FREE SUBSTANCE** specifically name **Cocoa powder**. FSSR 2.3.54 defines cocoa beans as fermented/dried **whole Theobroma cacao seeds**. FSSR 2.11.7 defines carob powder as **roasted Ceratonia siliqua pods**, not cocoa. Neither may inherit these cocoa-powder fat-free limits merely from a shared chocolate/cocoa context. A separately identified SKU, legal product article, updated Gazette and lab basis are required.

**Sugar warning:** Lead **0.5 mg/kg** names refined white sugar with sulphated ash **not exceeding 0.03%**. The **5.0 mg/kg** source article covers named sugars/syrups/coloured sugars with sulphated ash **exceeding 1.0%**. At **exactly 1.0%**, this second condition is not met. The interval **0.03% < sulphated ash ≤ 1.0%** cannot trigger either row merely from ash alone; it must be resolved under other applicable law, not interpolated.

**Do not mix analytical ash methods:** FSSR Cube sugar has **total ash ≤0.03%**; Khandsari **acid-insoluble ash** has Desi/Sulphur variants; Bura also specifies **acid-insoluble ash**. Those FSSR purity results do **not** automatically establish CTR **sulphated ash**, even if the numbers resemble one another. Icing sugar may include starch (up to the standard's limits), so parent refined-sugar input alone does not prove finished icing sugar is the CTR refined-white-sugar article.

**Additional competing articles to screen:** CTR Lead **5.0 mg/kg** for *qualified raw sugars* has industrial end-use conditions; **Hard boiled sugar confectionery** is a different named food with Lead **2.0 mg/kg** and Copper **5.0 mg/kg**. No borrowing from those rows by generic food category, input ingredient or label claim.

## Regulatory status preserved

- **533** total catalogue entries, **137** previously source-screened but legally unresolved product-specific CTR article cases.
- R45 reviewed **7** of those 137 more deeply, without assuming any became legally approved. **137 still unresolved**.
- Separate Ayurveda ingredient-level register remains **94** raw source-reference links with **14** ingredient source gaps (not part of the 137 completed legal-product count).
- No full laboratory panels, original Gazette/current amendments or actual manufactured SKU evidence assessed to legally close these cases.
- No numeric production rules changed, no product master changes, no live PMSV Helper deployment, no commercial batch release, and **PR #2 stays draft/unmerged**.

## Official sources

- [CTR Version IX, 3 February 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), PDF pages **2, 3, 4, 5, 7** individually viewed.
- [FSSR Chapter 2.8 Sweetening Agents, Version 1, 1 September 2023](https://www.fssai.gov.in/upload/uploadfiles/files/9_%20Chapter%202_8%20%28Sweetening%20agents%20including%20Honey%29.pdf), PDF pages **1–3** individually viewed.
- [Official Cocoa Beans 2.3.54 compendium](https://fssai.gov.in/upload/uploadfiles/files/Compendium_Food_Additives_Regulations_01_11_2022.pdf) and [Official Carob Powder 2.11.7 compendium](https://fssai.gov.in/upload/uploadfiles/files/Compendium_Food_Additives_Regulations_09_12_2021.pdf) — text checked, original Gazette/current amendment reconciliation pending.

Machine-readable register: `fssai-helper/ctr-cocoa-sugar-article-evidence-r45-2026-11-04.json`. Audit-only guard: `fssai-helper/ctr-cocoa-sugar-source-gate-r45-20261104.mjs`.
