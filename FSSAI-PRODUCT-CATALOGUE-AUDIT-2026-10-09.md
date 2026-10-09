# PMSV FSSAI/FoSCoS Product Catalogue — Coverage and Matching Audit

**Date:** 09 October 2026  
**Scope:** GitHub source on `gh-pages`; no WordPress changes.

## Conclusion

**Not yet 100% of the live official FoSCoS standardized-product list.** The repository does not currently contain a documented, independently reconciled complete download of the current live official FoSCoS listing. The list is a dynamic government web application; 533 imported records alone cannot prove completeness.

Do not describe either the catalogue or a product's full cross-regulation applicability as exhaustively covered solely because the product name is present.

## Reproducible loaded-catalogue checks

Based on `fssai-product-helper-preview-01/data/product-master-v1.json` and `data/standard-search-index-v1.json`:

| Check | Status |
|---|---:|
| Loaded catalogue identities | **533** |
| Same identities in lightweight search index | **533** |
| Identities marked `chapter_rule_link_status=file_and_key_verified` | **390** |
| Not marked with verified chapter-rule link | **143** |
| Unique normalized catalogue names | **519** |
| Duplicated normalized names requiring food-category choice | **4 groups / 14 records** |
| Complete current official FoSCoS snapshot | **Not independently reconciled** |

A verified chapter-rule *link* is not a fully validated compliance assessment; remaining food-specific rules, variants, Appendix A, Appendix B, contaminants, labels and process aids have separate coverage.

### Where unverified chapter-rule links are concentrated

| FCS category | Loaded | Link verified | Not link verified |
|---|---:|---:|---:|
| 04 | 74 | 20 | **54** |
| 99 | 33 | 6 | **27** |
| 14 | 63 | 45 | **18** |
| 18 | 12 | 0 | **12** |
| 06 | 74 | 64 | **10** |
| 12 | 59 | 49 | **10** |
| 102 | 10 | 2 | **8** |
| Other categories combined | 208 | 204 | **4** |
| **Total** | **533** | **390** | **143** |

The 143 records are **not assumed to be missing from FSSAI**: they lack the specific verified rule-file/key link in PMSV, or require a category/variant/special-regulation decision.

### Repeated names intentionally NOT auto-selected

- Analogue in the Dairy Context — 8 category identities.
- Frozen Desserts/Confections with vegetable oil/fat/protein — 2 category identities.
- Papad — 2 distinct food-category identities.
- Canned or Retort Pouch Meat Products — 2 identities.

The same label can have different FoSCoS food-category routes; the user must choose the appropriate category rather than letting the first ranked row silently win.

## Grain/flour separation rectified

- **Jowar, Sorghum, Ragi, Bajra, and 15 officially named millet families** → FSSAI **2.4.6(23)** for whole/dehulled millet grain.
- **Jowar Flour** → 2.4.18, **Ragi Flour** → 2.4.34, **Bajra Flour** → 2.4.17.
- Separate `grain` and `flour` forms are never conflated by substring ranking.
- **Masur, Moong, Chana, Arhar, Urd, Rajma, Lobia, Matki and other officially listed pulses** → FSSAI **2.4.6(22)** for whole/dehusked/split pulses; moisture requirements differ by seed-coat state.
- Besan, Chana Sattu and pulse flour/powder do **not** automatically inherit pulse-grain composition.
- **Soybean** retains its own catalogue identity and should be separately cross-checked for its applicable regulations.

## Regression gates

1. All **519 uniquely named** catalogue records must rank their exact identity first.
2. The four duplicate-name groups require explicit manual food-category selection.
3. All 15 millet families: unmilled name must display grain, **not flour**.
4. Named Jowar/Ragi/Bajra flours: exact flour clause, **not grain**.
5. Official pulse synonyms and split/whole descriptors: Pulses 2.4.6(22); processed pulse forms must fail closed.
6. Chromium test: actual Step 2 typing, Find nearest, Confirm and product-gate output.
7. Official FSSAI Chapter 2.4, Version 4, 07.05.2025: https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4_Cereals_and_Cereal_products.pdf

## Remaining steps before an all-FSSAI-products claim

1. Obtain a dated **official** FoSCoS standardized-product export or a reliable, exhaustive extraction from the government catalogue.
2. Diff official identities, food-category codes, aliases and operative FSSR clauses against the 533 locally loaded identities; add proven missing entries.
3. Resolve or explicitly fail closed each of the **143** missing verified chapter-rule links.
4. Review category/variant matrices, product-specific rules, cross-regulation scope and subsequent amendments independently.
5. Publish a machine-generated coverage report with counts of **official matched, missing, unresolved, superseded and variant-dependent** products before setting any `complete` status.

**Source policy:** Official FSSAI/FoSCoS for regulation; official ICMR-NIN IFCT 2017 for food composition. Never use unofficial websites to fill missing standards.
