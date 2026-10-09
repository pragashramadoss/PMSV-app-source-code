# PMSV FSSAI Product List — Coverage & Matching Audit
**Audit:** 2026-10-09 · **Scope:** GitHub FSSAI Product Helper, `gh-pages`; not WordPress.

## Determination
**Full live FoSCoS/FSSAI standardized-product coverage cannot currently be certified.**
The stored product master explicitly marks `coverage.foscos_full_standardized_product_snapshot = pending_ingestion`. A checked-in snapshot, even with correct cross-references, does **not** prove that the current live official FoSCoS list has been ingested in full.

Official current comparison source: [FoSCoS — View all FSSAI Standardized Food Products](https://foscos.fssai.gov.in/standard-product).
Product variant basis: [FoSCoS official clubbing of variants](https://foscos.fssai.gov.in/assets/docs/Final_Track%20change_Clubbing%20in%20the%20list%20of%20Standardized%20Food%20Products%20having%20variants%20%28types%20%20subtypes%29%20DFA%2034233.pdf).
Chapter 2.4 legal source: [Official FSSAI Chapter 2.4](https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_4%20%28Cereals%20and%20Cereal%20products%29%281%29.pdf).

## Objective current GitHub snapshot
| Audit check | Snapshot result | Conclusion |
|:--|--:|:--|
| Stored FoSCoS catalogue product rows | 533 | Loaded, not live-completeness proof |
| Stored lightweight search-index rows | 533 | Same IDs, CI checks consistency |
| Stored profiles | 533 | Base-profile identity is not full legal compliance |
| Product rows with verified `chapter_rule_link_status=file_and_key_verified` | 390 | 73.2% internally linked |
| Product rows lacking those verified chapter links | 143 | 26.8% unlinked; no final verdict |
| Cereals-category product entries (category 06) | 75 | Loaded |
| Cereals-category entries lacking verified chapter link | 10 | Exact category/standard ingestion pending |
| Duplicate exact-name groups (across FoSCoS categories/subcategories) | 4 | 14 rows share just 4 names; require category confirmation |
| Product master assertion of fully validated compliance engine | 1 detailed profile | Do not interpret 533 base profiles as 533 end-to-end validated engines |

**The 143 unlinked catalogue entries by top-level FoSCoS category:** 04: 54; 05: 3; 06: 10; 11: 1; 12: 10; 14: 18; 18: 12; 99: 27; 102: 8.

**Important distinctions:** an entry in FoSCoS, a linked product-standard clause, verified product-specific composition, and fully evaluated additives / contaminants / microbiology / processing aids / claims are four different readiness levels. A lookup alias is not a new FoSCoS product.

## Corrected form-sensitive matching across the entire loaded catalogue
- Exact official `Millets` FoSCoS product `06-06-1-millets` with `2.4.6(23)` is used for **whole/dehulled** millet variants: Amaranthus (Chaulai / Rajgira), Barnyard (Sanwa / Jhangora), Brown-top (Korale), Buckwheat (Kuttu), Crab-finger (Sikiya), Finger Millet (Ragi / Mandua), Fonio (Acha), Foxtail (Kangni / Kakun), Job's tears (Adlay), Kodo, Little (Kutki), Pearl (Bajra), Proso (Cheena), Sorghum (Jowar), and Teff.
- Distinct standardized **flours** remain distinct: Jowar / Sorghum Flour `2.4.18`; Bajra / Pearl Millet Flour `2.4.17`; Ragi Flour `2.4.34`.
- Partial raw-material names are **not** allowed to borrow flour, starch, powder, oil, butter, paste, extract, juice, or similar processed product classes merely because the crop tokens overlap.
- Unsupported flour identities (for example, Kodo Flour where no exact FoSCoS indexed identity has been confirmed) must **not** be assigned the general millet grain standard or another unrelated flour automatically. User can review manually; automated legal verdict remains unavailable.
- A finished-product name entered in Step 2 is a **search basis**, not proof that any particular FSSR product standard authorizes the final formulation.

## Remaining product-catalogue work
1. Obtain a versioned *complete* current official FoSCoS standardized-product export or verified line-by-line snapshot; compare its stable identities (not only name strings) against all 533 stored records and report added/removed/changed rows.
2. Reconcile 143 unlinked records with current official product standards or explicitly mark genuinely unstandardized/special-route products.
3. Disambiguate duplicate exact-name entries using FoSCoS category/subcategory before treating a selection as unique.
4. Continue per-product legal-rule verification and cross-layer compliance coverage. The improved search **does not** claim that all FSSAI clauses are already structured or validated.
5. Add more official aliases only if their standardized source identity is confirmed. Use manual selection / fail-closed behaviour for ambiguous or unsupported finished foods.

## Regression evidence
- `tests/fssai-catalogue-audit-v485.test.cjs` checks **all 533 IDs** across master/index, exact-name consistency, 143 link gaps, 4 ambiguous repeated-name groups, and grain-to-processed-form safety checks.
- `tests/fssai-ragi-grain-v483.test.cjs` tests all 15 millet names and the three individually standardized flour identities.
- `tests/ragi-browser-e2e-v484.cjs` types into the **real Step 2 webpage** with Chromium and checks Jowar, Sorghum, Ragi, Bajra and multiple millets before/after switching flours and confirming the selection.

All sources used for the official regulatory mappings above are official FSSAI/FoSCoS. ICMR-NIN IFCT is the only authority for the separate nutrition-composition layer.
