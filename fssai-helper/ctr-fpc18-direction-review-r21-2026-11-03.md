# PMSV R21 — FPC18 contaminant-direction correction (3 November 2026)

**Scope:** Source-edition, category-directed audit. Not full current-law verification, product approval, or live deployment.

## Official direction and correction
The FSSAI section 16(5) Indian sweets/snacks order of 19 July 2021, clause 4(f), expressly applies the Contaminants, Toxins and Residues **"Foods not specified"** heavy-metal/contaminant and pesticide category to eligible FPC18 foods. This is a specific legal exception to the earlier audit's too-broad no-default rule. Clause 3 excludes foods already standardized/mapped in food categories 01–14. Clause 4(g) additionally points to base-product Appendix B microbiology, and clause 4(h) to base-ingredient aflatoxins, DON and naturally occurring toxic substances.

Source: https://www.fssai.gov.in/upload/advisories/2021/07/60f6a6554438dDirection_Indian_Sweets_Snacks_20_07_2021.pdf
CTR Version IX (03.02.2026): https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf

Current Version IX **"Foods not specified"** source rows, expressed in ppm subject to correct sample matrix:
- Lead 2.5 (PDF p.4)
- Copper 30 (p.7)
- Arsenic 1.1 (p.9)
- Tin 250 (p.11)
- Cadmium 1.5 (p.12)
- Mercury 1.0 (p.12)

Methyl mercury 0.25 ppm under "All foods" was already recorded in R16; it is not double-counted. Hydrocyanic acid 5 ppm under "Confectionery" is an additional *conditional* candidate for FPC18 Indian Confections (18.1.4), pending proof of exact legal article.

## Catalogue and safety totals
- **533** catalogue identities preserved; **12** FPC18 category entries receive the conditional direction route.
- **8** of the **63** previously unanchored cases have the category-directed route; **55** remain without a newly supported route.
- Four additional FPC18 entries already had previous conditional evidence; those also receive this new route.
- **72** category-directed metal source rows (12 × 6) plus **1** separate NOTS candidate = **73** new rows.
- **82** distinct products with conditional candidates and **235** cumulative conditional source rows, compared with 74 products and 162 rows in R20.
- Original **137** product-specific article/applicability gaps remain unadjudicated without SKU evidence. **Zero** full CTR panels, product approvals or lot releases.

### Other classification correction
Water chestnut flour (Singhare ka Atta) must not appear in vending-water product scope; route to root/tuber flour and botanical/process evidence. No water MRL transfer.

## Evidence gates and tests
A SKU needs actual FoSCoS FPC18 identity, proof that no standardized category 01–14 governs, verification that the direction remains operative, formulation, processing, matrix/method, laboratory results, and base-ingredient toxin/pesticide obligations. Category name alone is not a PASS.

Local offline verification: **325** source/structure/preservation assertions and **33** Chromium browser/filter/export assertions; **0** failures. 533 product IDs export intact at 1440/390/320 px without JS errors or page overflow. No native Android, live engine or whole-product law completeness test was claimed.

GitHub workflow **41663736446** succeeded, with strict preimage and output locks; artifact **13244116411** matched local tested CTR data byte-for-byte. Output SHA-256 **75260c6c8cfb9c15234fbeead31b30440abe9e2c28b77247e23c592cdeda0116**. **Only audit-source metadata was added**, not operative numeric rules or approval fields. The detailed 63-product triage, 12-product evidence sheet, 73-row source register, interactive reviewer and tests are downloadable offline companions, not integrated into live PMSV.

PR #2 remains draft/unmerged; production gh-pages is unchanged. The May 2026 CTR amendment applies from 1 December 2026, not 3 November 2026.
