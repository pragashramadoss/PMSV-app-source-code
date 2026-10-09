# PMSV FSSAI / FoSCoS Catalogue Coverage Audit — 2026-10-09

## Scope and precise claim
This is an audit **only of the currently loaded PMSV GitHub catalogue snapshot** (`product-master-v1.json`, data build 262). It is **not proof of the complete official FoSCoS standardized-product list**. The source metadata explicitly states `foscos_full_standardized_product_snapshot: pending_ingestion`.

| Metric | Count / status |
|---|---:|
| Loaded catalogue product identities | **533** |
| Standard-search-index identities, reconciled by GitHub tests | **533** |
| Identities with `file_and_key_verified` chapter rule link | **390** |
| Identities without a verified chapter rule link (`not_linked`) | **143** |
| Unique exact displayed names | **523** (including four ambiguous duplicate-name groups) |
| Complete official FoSCoS snapshot comparison | **Not completed** |
| Fully validated formulation/product compliance for every product | **Not completed** |

A verified chapter-rule link is **not** evidence that all applicable contaminants, microbiological criteria, additives, packaging, labelling and cross-regulations have been integrated or checked.

## Grain / flour disambiguation
The finished-product name is interpreted with **form-specific matching**, without using a whole-grain name as evidence for a processed flour, oil, extract or powder:
- **Jowar**, **Sorghum** → grain identity under Millets, FSSAI **2.4.6(23)**; the visible choice should say **Jowar** for that query
- **Jowar Flour** / **Sorghum Flour** → FSSAI **2.4.18**
- **Ragi / Finger Millet** → grain under **2.4.6(23)**; **Ragi Flour** → **2.4.34**
- **Bajra / Pearl Millet** → grain under **2.4.6(23)**; **Bajra Flour** → **2.4.17**
- Additional named whole/dehulled millet varieties are linked to the Millets category, with their names retained. A flour not evidenced by the current official identity map is not automatically sent to an unrelated grain or flour standard.
- Existing Wheat, Rice, Atta, Maida, and specialized FRK rice flour clauses stay separate; the generic grain prefix cannot activate an unrelated flour standard.

## Loaded snapshot broken down by catalogue category
| FoSCoS catalogue category | Loaded identities | Verified chapter-rule link | Awaiting link |
|---|---:|---:|---:|
| 01 | 68 | 68 | 0 |
| 02 | 25 | 25 | 0 |
| 03 | 1 | 1 | 0 |
| 04 | 74 | 20 | 54 |
| 05 | 11 | 8 | 3 |
| 06 | 75 | 65 | 10 |
| 07 | 3 | 3 | 0 |
| 08 | 32 | 32 | 0 |
| 09 | 21 | 21 | 0 |
| 10 | 5 | 5 | 0 |
| 11 | 21 | 20 | 1 |
| 12 | 58 | 48 | 10 |
| 13 | 12 | 12 | 0 |
| 14 | 63 | 45 | 18 |
| 15 | 1 | 1 | 0 |
| 18 | 12 | 0 | 12 |
| 99 | 33 | 6 | 27 |
| 100 | 5 | 5 | 0 |
| 101 | 3 | 3 | 0 |
| 102 | 10 | 2 | 8 |

## Remaining ingestion and assurance tasks
1. Obtain and compare against the **current official FoSCoS standardized-product list** for every category, identify missing or superseded identities, and record source/version evidence before claiming completeness.
2. Investigate the **143 not-linked identities**, matching against exact active FSSAI chapters and official FoSCoS evidence. `Not linked` must not be described as `not standardized`.
3. Separate repeated catalogue display names by actual FCS and regulation; force user confirmation when identity is ambiguous.
4. Keep all product-specific clause, contaminant, microbiology, additive and labelling decisions fail-closed until the exact identity and conditions are proven.
5. Re-run GitHub catalogue audit, IFCT and FSSAI regression suites and Chromium end-to-end searches after each ingestion batch.

## Machine-readable backing
See [CSV](./fssai-catalogue-coverage-2026-10-09.csv) for every loaded product, mapped clause, source rule file, and linkage status.

This report contains no externally invented product standards or compliance verdicts.
