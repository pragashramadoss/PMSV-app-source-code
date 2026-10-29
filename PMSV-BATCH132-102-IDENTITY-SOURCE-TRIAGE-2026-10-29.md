# PMSV Batch132 — official Ayurveda Aahara and 102-flag source triage

**29 October 2026. Source-research layer only, NOT regulatory approval.**

## Verified primary source

- [FSSAI FoSCoS official standardized-product listing](https://fcstraining.fssai.gov.in/standard-product) lists each of the ten exact named recipes under **102.1 — Ayurveda Aahara Category A**.
- [FSSAI 2025 KoB introduction for Ayurveda Aahara](https://www.fssai.gov.in/upload/advisories/2025/09/68b67efa6f47520250902103601289.pdf) establishes 102.1 Category A versus 102.2 Category B, with different product approval requirements.
- [FSSAI original Ayurveda Aahara recipe list, 25 July 2025](https://www.fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf) names the recipes. **A catalogue name match alone does not authenticate a commercial formula or license.**

| Recipe number | Named product | Published FoSCoS category | Commercial decision |
|---|---|---|---|
| 12.1 | Lajadi Kashaya (Parched Rice Tea) | 102.1 (source reference, not applied) | Conditional source only |
| 13.1 | Krishara (Khichdi) | 102.1 (source reference, not applied) | Conditional source only |
| 14.1 | Golaka Dugdha (Condensed Milk without Sugar) | 102.1 (source reference, not applied) | Conditional source only |
| 14.2 | Ksheerasara (Sweetened Condensed Milk) | 102.1 (source reference, not applied) | Conditional source only |
| 14.3 | Narikela Ksheerika (Milky Coconut Delight) | 102.1 (source reference, not applied) | Commercial HELD |
| 14.4 | Yava Ksheera (Barley Milk) | 102.1 (source reference, not applied) | Conditional source only |
| 14.5 | Dugdha Kupika (Stuffed Fried Cottage Cheese Dumplings) | 102.1 (source reference, not applied) | Conditional source only |
| 14.6 | Sugandhit Ksheera (Aroma infused milk) | 102.1 (source reference, not applied) | Conditional source only |
| 14.7 | Ksheerapaka (Mystic Milk Quartet) | 102.1 (source reference, not applied) | Commercial HELD |
| 15.1 | Kulmasha (Barley Savory Discs) | 102.1 (source reference, not applied) | Conditional source only |

**Ten of ten** original blank FoSCoS fields have named source candidates. Eight are among 498 conditional source references; two (Narikela Ksheerika and Ksheerapaka) are in the original 35 completed-desk-research/commercially-HELD cases. Actual formula, production/recipe process, license and any claim approval require independent verification. No source code is automatically written back to the original 533-row ledger.

## Other 102 original identity-review flags triaged

### Repeated names

Four same-name groups span **14** distinct catalogue records: dairy analogues (8), frozen desserts (2), papad (2), and retort meat products (2). Within each group the stored FSSR reference is the same, but the FoSCoS subcategory differs. Keep all 14 distinct pending exact form/classification review; do not merge them by label.

### 86 original blank FSSR fields

| FoSCoS family in ledger | Original FSSR blanks | Commercial HELD cases among these |
|---|---:|---:|
| 04 | 8 | 0 |
| 05 | 3 | 0 |
| 13 | 11 | 1 |
| 14 | 20 | 0 |
| 18 | 12 | 0 |
| 99 | 24 | 5 |
| NOT_RECORDED | 8 | 2 |

All **86** remain blank in the original ledger; do not fabricate a standard number. The values may reflect legitimate non-standardized/generic categories or incomplete mapping. Exact current operative primary FSSR or other applicable regulatory route must be checked per product.

## Implementation / control

- Original pinned 533 ledger remains **unchanged** (digest `d142be820899eac5`).
- Original 35 case research closeout remains **unchanged** (digest `4d1590738e747a2a`).
- Additional independent source layer `pmsv-batch132-102-identity-source-triage-2026-10-29.json`, digest `e4dffdcebe0f0eeb`. It verifies 10 named routes, 4 distinct-FoSCoS duplicate groups, and all 86 blank-FSSR classifications.
- Batch131 all-533 UI displays provisional 102.1 source candidate beside each of ten historical blanks and retains 102 **original** flags, 35 commercial HELDs and 0 approvals.
- The downloaded CSV gains a separate `official_named_source_FoSCoS_candidate_NOT_APPLIED` column.
- Existing Batch131 automated regression extended to pin Batch132; no production WordPress files or historical source data modified.

**Do not use the Category A listing as proof that an actual marketed SKU, formula, claim or lot is legally approved.**
