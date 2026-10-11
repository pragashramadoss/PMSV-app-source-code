# PMSV FSSAI Helper — Chapter 2.3.20 corrected cross-chapter standards mapping (11 October 2026)

## Current source-backed correction

The exact **Fruit/Vegetable, Cereal Flakes** local catalogue identity \`06-06-3-fruit-vegetable-cereal-flakes\` was incorrectly linked to **FSSR 2.4.35 Breakfast Cereal**. FSSAI Chapter 2.3 itself defines the exact named finished product under **2.3.20**; the PDF page is **28 (1-based)**. This update corrects the full source master, the 533-product fast-search catalogue, and the linked pending-evidence record. The separate **Breakfast Cereal** product remains under **2.4.35**.

Official source: https://fssai.gov.in/upload/uploadfiles/files/4_%20Chapter%202_3%20%28Fruit%20%26%20Vegetable%20products%29.pdf

| Official 2.3.20 requirement | Limit | Scope |
|---|---:|---|
| Moisture | ≤ 6.0% m/m | Product-quality requirement, not a CTR metal limit |
| Acid-insoluble ash | ≤ 0.5% m/m | Product-quality requirement, not a pesticide limit |
| Starch | ≤ 25.0% m/m | Product-quality requirement, not a mycotoxin limit |

## Explicit safety gates

- Cereal ingredient presence **does not** permit automatic inheritance of Chapter 2.4.35 grain-first composition, ready-to-eat cereal microbiology, cereal crop pesticide MRLs, or Version IX cereal-product mycotoxin limits.
- Actual FoSCoS category 06.3 needs a separate Appendix A/B route review. No microbiology profile is selected by default.
- The **126** product identities without a first exact contaminant/residue article remain unresolved; **407** identities still have partial evidence only, and **0** complete contaminant compliance passes are claimed.
- The two chapter-family review counts are now **2.3: 49, 2.4: 11** within the historical 136-product review. This is a standards-routing correction, not a new contaminant-evidence match.

Automated regression additionally compares 533 product routes between the search index and source master, and checks that Breakfast Cereal has not been changed.
