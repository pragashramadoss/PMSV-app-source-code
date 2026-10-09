# PMSV FSSAI/FoSCoS catalogue coverage audit — updated 09 October 2026

> **Update superseding the earlier 390/143 checkpoint.** All work remains on GitHub `gh-pages`; WordPress has not been changed.

## Link validation

- Product identities: **533**
- Exact catalogue/index/profile identity count: **533**
- Chapter-rule links with verified local file + key: **474**
- Unverified chapter-rule links: **59**
- Rule-file and key integrity check: **474/474 PASS** (including alternate legacy schema fields)
- Index points to current product-master blob: **PASS**
- Complete independently reconciled latest FoSCoS catalogue: **NOT VERIFIED**
- End-to-end Chromium verification for this new reconciliation: **NOT RUN**
- Cross-regulation/full numeric specification verification: **NOT COMPLETE**

## Remaining products by category

| Category | Not yet chapter-rule verified |
|---|---:|
| 99 | 26 |
| 18 | 12 |
| 04 | 9 |
| 102 | 8 |
| 05 | 3 |
| 11 | 1 |

## Important classification

FoSCoS lists category descriptors, special-regulation entries, and ingredient/additive identities that cannot legitimately be assigned a made-up Chapter 2 product-standard clause. Category 18 Indian sweets and category 102 Ayurveda Aahara require their own regulations and item-specific evidence. Categories 11/99 require substance- and food-use-specific sources, not a guessed product clause.

For each remaining entry, see [`FSSAI-UNVERIFIED-ROUTE-MANIFEST-2026-10-09.json`](FSSAI-UNVERIFIED-ROUTE-MANIFEST-2026-10-09.json). It includes the exact identity, a source link, and why the record remains fail-closed.

## What verified links do—and do not—mean

A verified link means that PMSV has a concrete local rule file and key matched to an official named clause. Identity-only rule stubs deliberately keep complete specification, product variant, additives, microbiology, contaminants, labelling, claims and full compliance conclusions separate.

## Next verification gates

1. Retrieve and reconcile an exhaustive dated official FoSCoS standardized-product catalogue export against all 533 identities.
2. For each outstanding identity, establish the exact applicable FSSAI clause, or a distinct official special-regulation/food-category route without inventing FSSR numbers.
3. Ingest complete numerical quality and safety limits from source and evaluate variant applicability.
4. Re-run actual browser product-matching and compliance cross-layer tests before claiming application coverage.
5. Only mark `file_and_key_verified` where the mapped file and key are present and correspond to the correct operative product standard.
