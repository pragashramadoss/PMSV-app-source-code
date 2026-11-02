# PMSV FSSAI verification checkpoint — 2 November 2026

## Scope and status

The 31 October repository baseline contains 533 catalogue identities. Its 498 PARTIAL_EXACT_SOURCE_MATCH and 35 FIRST_EXACT_SOURCE_PENDING entries are legacy source-status classifications, not counts of fully verified products. The 123-product offline file is a detailed review subset. Its contents must not replace the full catalogue. Restoring an entry is not the same as confirming it.

Regulatory-source verification must be distinct from commercial lot release. A laboratory report is not required merely to verify the wording of a regulation; it is required, with the appropriate matrix/method/LOQ and authorized assessment, to support a commercial release decision. This checkpoint grants no product or lot approval and does not change any previous source-status flag.

## Retrieval issue requiring explicit version control

The requested URL below was retrieved through the research tool on 2 November 2026:

https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf

One retrieval resolved instead to:

https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_2_4_2025_VIII.pdf

The retrieved content identified Version VIII (01.04.2025). A search excerpt separately identified Version IX (03.02.2026). This is an observed retrieval discrepancy, not a conclusion that FSSAI universally redirects the URL. Do not mark the Version IX source verified based on its filename or the older retrieved document. Obtain and compare the actual document bytes, cover/version information, relevant amendments and commencement dates. Preserve both requested and resolved URLs in evidence records.

## Limited source-text checks completed

The following are scoped readings of official source text, not full November 2026 operative-law checks. PDF page-image retrieval failed during this session; table transcription and document-version validation remain open. Do not promote these to a complete compliance status.

### Beverages: Chapter 2.10, Version 4 (01.08.2025)

Source: https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_10_BEVERAGES_Other%20than%20Dairy%20and%20Fruits%20Vegetables%20based.pdf

- Clause 2.10.4 distinguishes roasted/ground, instant, decaffeinated roasted/ground, and decaffeinated instant coffee-chicory mixtures. The stated coffee minimum is 51%; the instant variants explicitly use a dry-mass basis. These are variants of a grouped catalogue identity, not four automatically confirmed catalogue products.
- Clause 2.10.3 permits an aggregate maximum of 2% added edible fats/oils or sugar in roasted chicory.
- Clause 2.10.2(2) describes soluble coffee without chicory or other added substances. It must not be confused with instant coffee-chicory mixture.

### Confectionery: Chapter 2.7

Source: https://mail.fssai.gov.in/upload/uploadfiles/files/8_%20Chapter%202_7%20%28Sweets%20%26%20Confectionary%29.pdf

- Clause 2.7.1: spice-centre confectionery has separate ash exceptions. Milk-toffee protein and fat requirements use a dry basis; butter-toffee has its own fat requirement. Do not apply every variant-specific requirement to every candy.
- Clauses 2.7.2 and 2.7.3: artificial-sweetener-only exceptions affect specified sugar parameters, not all quality requirements.
- Clause 2.7.4: filled chocolate excludes flour confectionery, pastry and biscuits. Filled, composite, praline and couverture definitions have different composition requirements. A chocolate-coated bakery product must not be automatically treated as filled chocolate.

### Draft exclusion

The following official document identifies itself as a draft, dated 26 February 2026. Its proposed substitutions must not be applied as final law merely because it is published in the Gazette:

https://www.fssai.gov.in/upload/uploadfiles/files/Gazette%20notification%20of%20Draft%20FPS%20and%20FA%20Regulation%202026.pdf

## Required data controls

1. Validate catalogue count and unique stable IDs; show an explicit incomplete-data error instead of silently falling back to 123 entries.
2. Display legacy partial-source status separately from attached, traceable evidence and current-law completeness.
3. Record source title/version, requested and resolved URLs, clause/page, applicable variant, unit/basis, check date and outstanding issues.
4. Do not inherit ingredient limits, nearby-category limits or method identifiers without exact scope validation.
5. Export the entire loaded catalogue and unresolved reasons. Preserve every approval lock.
