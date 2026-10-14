# PMSV FSSAI Helper — Batch 17: positive research for coffee and explicit legal-source exclusions

**Date:** 14 October 2026. **Branch:** GitHub `gh-pages` preview only. **WordPress remains unchanged.**

## Official regulations inspected

- [FSSAI CTR Version IX, 03.02.2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf): §2.2.1 (PDF p.15) explicitly lists **ochratoxin A, coffee, 5 µg/kg**. This is *not* an established coffee–chicory finished-product limit.
- [FSSR Chapter 2.10, 2.10.4](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_10_BEVERAGES_Other%20than%20Dairy%20and%20Fruits%20Vegetables%20based.pdf): roasted-ground, instant and decaffeinated coffee–chicory mixture are separate defined blend forms containing at least **51% coffee**. Thus coffee alone cannot automatically define the marketed blend.
- [FSSR Chapter 2.8, 2.8.7](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf): dried glucose syrup **sulphated ash ≤1.0%** (PDF p.13). CTR IX §2.1.1 lead PDF p.4 covers *solid glucose and starch conversion products with sulphated ash exceeding 1.0%* at **5 mg/kg**. That high-ash named row cannot describe an FSSR-compliant dried glucose syrup with its legal ≤1.0% ash ceiling.
- [FSSR Chapter 2.8, 2.8.2](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf): misri **total ash ≤0.4%**, whereas CTR IX high-ash sugar row uses **sulphated ash >1.0%**. These are different analytical definitions; source applicability remains unproven.
- Additional positive no-transfer checks: cocoa mass/cake vs cocoa powder; salt substitutes vs food-grade salt; botanical coconut milk vs dairy; carob powder vs cocoa powder. These are **exclusions only**, not new limits.

## Implemented

- One named-commodity legal research candidate, **coffee–chicory mixture / coffee ochratoxin A**, with four affirmative requirements for subtype, recipe, signed legal article determination, and validated as-sold lot analysis.
- Six named, source-grounded **no-transfer findings** in product-specific panels. The dried-glucose high-ash contradiction is highlighted.
- A complete **35-item source matrix**, classified as **3 previous conditional**, **7 prior new research**, **1 additional unverified coffee commodity research**, and **24 without an additional named research candidate**; these are research classifications, *not* source-approval counts.
- Preserve immutable catalogue IDs, require exact product name / FSSR / FCS, validate digest and source data, escape HTML, and fail closed on missing/modified records.
- Current canonical ledger unchanged: **533 catalogue / 498 conditional matches / 35 first-source pending / 0 full compliance passes**.
- 01.12.2026 future amendment not activated. Neither an ingredient limit nor a commodity reference becomes an as-sold product test limit from this batch.
- GitHub Actions test file and workflow added for deterministic regression.

## Requirements to actually close cases

Obtain legally authenticated as-sold finished-product identity, composition/processing and lab basis with authoritative FSSAI/FoSCoS interpretation. No first-source status can be promoted purely on an article comparison. Site preview only; WordPress production unchanged.
