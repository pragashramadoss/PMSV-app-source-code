# PMSV FSSAI product catalogue coverage — 09 October 2026 (special-route update)

**Only GitHub `gh-pages`; WordPress not modified.** This report supersedes the earlier 475/58 route summary; it does **not** change the chapter-rule link count.

## Coverage (different verification levels)

| Status | Products |
|---|---:|
| Catalogue identities loaded | 533 |
| Exact chapter-rule file and key verified | **475** |
| Additional official special-regulation category or recipe routes verified | **20** |
| Combined products with at least one verified regulatory route | **495** |
| Products with neither route confirmed | **38** |

**Important:** A category/recipe route is not a chapter product-standard link. Special-route products remain `chapter_rule_link_status=not_linked` and do not receive invented FSSR clauses. Complete numeric/compliance assessments remain pending.

## Official special routes added

- **12 FPC 18 Indian sweets/snacks**: exact Annexure I category, plus Annexure II corresponding additive-category scopes. FSSAI specifically says this category is for products *not already standardized* in FPC 01–14. It requires ingredient-specific contaminant and microbiology checks. [Official direction](https://www.fssai.gov.in/upload/advisories/2021/07/60f6a6554438dDirection_Indian_Sweets_Snacks_20_07_2021.pdf).
- **8 FPC 102 Ayurveda Aahara recipes**: named FoSCoS Category A recipe identities and FSSAI 25 July 2025 order linked. The additional **19 June 2026 Part 2 Ayurveda Aahara recipes** are officially published and require independent full coverage ingestion. [Official FSSAI advisories](https://www.fssai.gov.in/food-law/advisories?division=Science%20and%20Standards).

## Tests

- 533 master/index/profile identities: PASS.
- All 20 special-route keys exist in special-regulation rule file and match master/index/profile: PASS.
- No FSSR chapter clause fabricated: PASS.
- New end-to-end Chromium browser workflow: NOT RUN.
- Full regulatory applicability, recipe details and numerical limits: NOT COMPLETE.
- Official live FoSCoS export completeness: NOT RECONCILED.

See [machine-readable special route audit](FSSAI-SPECIAL-ROUTE-COVERAGE-2026-10-09.json) and [rule file](fssai-product-helper-preview-01/data/rules/special-regulatory-routes-v1.json).
