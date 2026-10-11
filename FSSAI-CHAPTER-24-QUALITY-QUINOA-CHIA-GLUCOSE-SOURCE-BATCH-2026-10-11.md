# PMSV FSSAI Helper — Chapter 2.4 full-quality subtypes, grain exceptions and Dried Glucose Lead exclusion

**Completed:** 11 October 2026. Scope: GitHub `gh-pages` FSSAI Helper preview **only**. **WordPress unchanged**.

### Live first-exact contaminant ledger remains 533 = 410 partial + 123 unresolved, 0 product compliance PASS

This batch reviews **9 current unresolved FoSCoS identities** (6 Chapter 2.4 source-quality identity records + quinoa/chia + Dried Glucose Syrup). It adds and source-locks **19 quality benchmarks** across the six product-standard routes, including *fried vs non-fried* instant noodles. **Zero new exact CTR contaminant or pesticide first-source matches** were established in this particular batch. Do **not** mislabel product-standard Uric acid, ash, moisture, fat acidity or acid value as source-confirmed Version IX metal/toxin/pesticide coverage.

### A. Direct FSSR quality requirements transcribed from official Version 4 (07.05.2025)

Official FSSAI source: https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf

| FoSCoS exact product identity | FSSR | Official criteria (maximum unless noted) | Source printed page |
|---|---|---|---|
| Biscuit (FCS 07.2.1) | 2.4.15(1) | Acid insoluble ash 0.1% dry mass; extracted-fat acidity as oleic acid 2% | 56 |
| Wafer Biscuit (FCS 07.2.2) | 2.4.15(1) | Same source-backed biscuit standard, independently ID-locked | 56 |
| Macaroni Products (Pasta Products) FCS 06.4.2 | 2.4.10 | Moisture 12.5%; ash insoluble in dilute HCl 0.1% on dry basis | 33 |
| Macaroni Products (Instant noodle) FCS 06.4.3 — **fried** | 2.4.10 | Moisture 10%; acid insoluble ash 0.3% on dry matter basis; acid value 2.0 (as stated; method/basis to be verified) | 34 |
| Macaroni Products (Instant noodle) FCS 06.4.3 — **non-fried** | 2.4.10 | Moisture 13%; acid insoluble ash 0.3% on dry matter basis; **no fried-noodle acid-value requirement auto-transferred** | 34 |
| Papad (FCS 06.7) | 2.4.40 | Moisture 15%; acid insoluble ash 0.25% dry mass; alcoholic acidity as H2SO4 0.2% dry mass; Uric acid 100 mg/kg | 85 |
| Papad (FCS 15.1) | 2.4.40 | Same four numeric product-standard clauses, distinct named FoSCoS route | 85 |

**19 product-specific numeric quality references** after accounting for the two independently indexed Biscuit routes, two distinct Papad routes, and the five processing-qualified Instant Noodle rows.

**Conditional source scope:** Both pasta and instant noodles permit recipes using tapioca or other tuber flour, and Chapter 2.4.15(1) Biscuit lists ingredients permissively. Merely having a cereal/pulse/legume *candidate* in the standard is not proof that every possible finished formulation contains a named Version IX cereal/pulse contaminant article. Do not auto-transfer Aflatoxin B1 10 µg/kg, Total Aflatoxins 15/20 µg/kg or agricultural pesticide MRLs from an unselected ingredient. Papad can also contain vegetable-based ingredients, so the same restriction applies.

### B. Quinoa and Chia — two explicit non-inheritance checks

Official Version IX (03.02.2026): https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf

- **Quinoa**, FSSR 2.4.6 / FoSCoS 06.1: Lead source is explicitly named **"Cereal grains, except buckwheat, canihua and quinoa" — 0.2 mg/kg**. The source **excludes quinoa**. Under no circumstances may this excluded cereal-grain Lead row be copied into a Quinoa result.
- **Chia Seeds**, FSSR 2.4.6 / FoSCoS 06.1: The Version IX **Oilseeds** Aflatoxin B1 10 µg/kg row cannot be inherited without establishing actual commodity/article coverage for Chia's botanical seed product. Chia remains unresolved, without implying an exemption from applicable food safety obligations.

### C. Dried Glucose Syrup — exact incompatibility for ONE named Lead row

Official Chapter 2.8 Version 1 (01.09.2023), **FSSR 2.8.7**, printed page 13: https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf

FSSR requires: **sulphated ash ≤1.0% by weight**, total solids ≥93%, reducing sugars ≥20%.

Version IX Section 2.1 Lead table (printed page 4) has a conditional article: **"Edible molasses, caramel liquid, solid glucose and starch conversion products with a sulphated ash content exceeding 1.0 per cent" — Lead 5.0 mg/kg**.

Mathematical and regulatory scope: **≤1.0% is NOT >1.0%**. This exact >1.0% Lead article cannot be selected merely because the product is Dried Glucose Syrup under FSSR 2.8.7. This is **not** a blanket lead exemption, finished-product PASS, or permission to skip other possibly applicable contaminants and amendments. Any source conflict must fail closed.

### D. Data controls and regression safeguards

**Github changes:**
- `fssai-product-helper-preview-01/data/rules/chapter-2-4-cereals-v1.json`: FSSR numeric-quality source pins, separately labelled fried/non-fried noodles.
- `fssai-product-helper-preview-01/data/rules/fssai-eight-cereal-bakery-papad-quality-and-commodity-guards-2026-10-11.json`: six indexed quality routes and two botanical/commodity exclusions; no CTR numeric approval.
- `fssai-product-helper-preview-01/data/rules/fssai-nine-sugar-refined-chromium-scope-2026-10-11.json`: source reconciliation for Dried Glucose Syrup sulphated ash versus the incompatible Version IX Lead article.
- `scripts/audit-fssai-product-readiness.cjs`: checks identity, source title, operator, numeric value, unit, category, subtype and absent PASS; separately tallies eight Chapter 2.4 evidence reviews and the Dried Glucose exclusion.
- `fssai-product-helper-preview-01/index.html`: source-verified expandable quality/commodity-exclusion display; tampering or missing source withholds values.
- `tests/fssai-eight-chapter-2-4-quality-exclusions-source-2026-10-11.test.cjs`: five quality, product identity, source integrity and 410/123 ledger tests.
- `tests/fssai-nine-sugar-refined-chromium-scope-2026-10-11.test.cjs`: three extra tests for the Dried Glucose incompatibility; source mutations cause fail-closed withholding.
- `.github/workflows/verify-fssai-standard-nutrition.yml`: includes all added regression tests.

**Test URL:** https://pragashramadoss.github.io/PMSV-app-source-code/fssai-product-helper-preview-01/

### Unresolved next actions

The original 123 entries still need matching against **exact operative finished-product contaminant/pesticide provisions**. Legal and analytical applicability cannot be inferred from a product being in a broader FoSCoS category, having ingredient options, or merely passing quality/food-safety tests in isolation. No WordPress changes have been made.
