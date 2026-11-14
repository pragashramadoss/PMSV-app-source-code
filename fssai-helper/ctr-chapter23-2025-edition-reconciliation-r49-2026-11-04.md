# PMSV R49 — 2025 FSSAI Chapter 2.3 edition reconciliation for R46/R47

**4 Nov 2026. Source-only edition validation, not a regulatory product approval.**

Compared the official FSSAI Food Products Standards Chapter 2.3 **Version 2 (04.11.2024)** with **Version 3 (07.05.2025)** for all six R46/R47 named product standard clauses. Both editions were opened as original FSSAI-hosted PDFs and the specific tables/conditions below were checked from page images. **Selected numeric/qualification fields match**. This is **NOT** a full document diff or complete original-Gazette amendment reconciliation.

| Product | FSSR clause | 2025 source parameters verified | Observed change vs 2024 selected fields |
|---|---|---|---|
| Fruit Cheese | 2.3.33 | TSS ≥65%; prepared fruit ≥45%; ≥25% only for strawberry/raspberry | None found |
| Murabba | 2.3.25 | TSS ≥65%; printed fruit content ≥55%; rigid-container fill ≥90% | None found |
| Frozen Vegetables | 2.3.38 | Product at −18°C thermal centre after stabilisation; negative peroxidase; blanching | None found |
| Coconut Milk (Non-Dairy) | 2.3.51 | Light 6.6–12.6% solids, ≥5% fat; normal 12.7–25.3%, ≥10%; pH ≥5.9; moisture/SNF table | None found |
| Coconut Cream (Non-Dairy) | 2.3.52 | Cream 25.4–37.3% solids, ≥20% fat; concentrate ≥37.4%, ≥29%; moisture/SNF/pH | None found |
| Coconut Milk Powder | 2.3.63 | Moisture ≤2.5%; fat ≥60% **dry basis**; FFA extracted fat ≤0.2% as lauric acid; density 0.3–0.45 g/mL as printed | None found; stray bracket retained |

## Corrections to earlier uncertainty

The R48 audit flagged that its 2025 Chapter 2.3 PDF screenshots were unavailable **at that time**. R49 now visually checks **2025 pages 32,39,41,77–80,105** for the six *different* R46/R47 products. This does not retroactively claim the R48 products (Frozen Fruit, Seedless Tamarind, Quick-Frozen Fried Potato) were visually checked under Version 3.

No change to the six selected standard thresholds or clause families was observed. **Caution:** this is comparison of selected source fields and pages, not a literal word-by-word comparison of all 106 pages, effective Gazettes, Food Additive Appendix A, Microbiology Appendix B, contaminants, label law or original notifications.

### Important legal hold distinctions

- Murabba's printed **55% fruit** requirement remains potentially ambiguous for vegetable/rhizome variants; do not invent an exemption.
- Fruit Cheese strawberry/raspberry **25%** exception is not generic to mixed fruits or mango fruit cheese.
- Frozen Vegetables negative peroxidase does **not** auto-extend to Frozen Fruit standard 2.3.37.
- The coconut milk/cream and powder source clauses allow **milk-derived sodium caseinate**: the actual product may need milk-allergen declaration and may not support vegan/milk-free claims.
- Powder bulk density appears as `0.3–0.45]` in **both** source edition PDFs. Record a typographical-original-Gazette check, not a silent source correction or unlimited bulk density.
- Existing CTR metal/product article candidates remain conditional; no actual formula, lot, supplier, test result, exact Gazette/current MRL panel or current labels were supplied.

### Counters / deployment

**533** original catalogue IDs; original **137** product CTR article applicability cases remain legally **open**; R49 rechecks **6** product source identities (R46 three + R47 three), **5** coconut styles; **0** new legal applicability decisions and **0** full legal product approvals. Separate Ayurveda register remains **94** raw ingredient source links / **14** gaps. No deployed rules, product master, commerce/batch release or draft PR merge.

Official PDFs: [Chapter 2.3 Version 3, 7 May 2025](https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit_Vegetable_products.pdf) and [Version 2, 4 Nov 2024](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf).

Register: `fssai-helper/ctr-chapter23-2025-edition-reconciliation-r49-2026-11-04.json`; audit-only guard and CI regression tests attached.
