# PMSV semantic continuation — 2 November 2026

## Scope and actual progress

This continuation examines 28 stored standards in Chapters 2.7 and 2.8, linked to 29 actual catalogue products. It is a review against the identified source editions, not a completed reconciliation of all original notifications/current amendments and not commercial lot release.

216 numerical rule records were examined: 210 have no outstanding numerical-source interpretation question; six records in four standards are explicitly flagged. Nine compound classification rows and four absence/identity rows are retained separately, making 229 normalized records in the downloadable review package.

25 product records have no outstanding numerical-source interpretation question in this batch; four retain questions. The other 504 product records are unchanged. All 533 original full-verification and release fields are preserved.

## Corrections and scope improvements

Fourteen change groups cover:

1. Cocoa-powder crude fibre: restore maximum 7% on moisture- and fat-free basis for all three types.
2. Chocolate acid-insoluble ash: attach moisture-, fat- AND sugar-free basis to the 0.2% limit for the six table classes.
3. Cocoa-powder alkalinity: attach moisture- and fat-free basis to the 12% K2O limit.
4. Spice-centre confectionery: apply the special ash rows instead of the general rows; retain dry-basis toffee requirements.
5. Lozenges/gums: artificial-sweetener-only sugar exemptions do not exempt unrelated ash, moisture or gum parameters.
6. Cocoa mixtures: remove an unsourced <25% upper bound from the source's >=20% category; do not invent exclusive classification from overlapping minimum rows.
7. Chocolate powder: remove unsupported wet-basis terminology for 32%; preserve the 32/29 wording as unresolved.
8. Khandsari: restore moisture-test conditions and distinguish diagnostic characteristics; flag the conductivity unit notation.
9. Jaggery: restore dry-weight bases and the palm liquid/semi-liquid moisture exception; flag cane moisture wording.
10. Royal jelly: separate Type 1-only sugars and type-specific isotope limits; flag moisture Max./range wording.
11. Honey: distinguish origin, pressed process, MRPL, peak-area basis and HMF classification.
12. Dextrose: restore the cuprous-oxide identity reaction.
13. Beeswax: restore the named JECFA Beeswax INS 901 method reference.
14. Saccharins: restore the IS 5345 reference without inventing its edition.

These groups include newly explicit scope controls for values already stored correctly; they are not fourteen newly discovered wrong limits.

## Primary sources

Chapter 2.7, Version 1 (01.09.2023):
https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_7%20%28Sweets%20and%20Confectionary%29.pdf
SHA-256: 7448a5506e3680cd81b0d34581a2c8cc610b128e5f91501e6b408a54bf34ef25

Chapter 2.8, Version 1 (01.09.2023):
https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf
SHA-256: be22ccb88678427d978dd63b5062c47292ac3ca5d0df6f3246f8ee09536b2d99

HMF advisory, 7 November 2025, page 1:
https://fssai.gov.in/upload/advisories/2025/11/690dd80e5809fHMF%20to%20be%20considered%20as%20quality%20parameter%20in%20honey.pdf
The 80 mg/kg maximum remains; HMF non-compliance is classified as Substandard, not an inference about all other safety parameters.

## Tests and limits

Local checks passed: 1,072 structural/preservation assertions, 64 rule/boundary assertions, 31 browser assertions. Browser testing used all 533 actual products, checked new filters, full export under active filtering and widths 1440/390/320 px. Chromium set_content testing is not a native Android or production-release test.

The standalone comparison helper refuses missing subtype context, unresolved source interpretations and mismatched units/bases. It never returns full product approval and is not wired into the live decision engine.

Remaining work: original-notification/current-amendment reconciliation; complete additives, processing aids, microbiology, contaminants/residues, analytical procedures, packaging, labelling and claims. Missing batch reports are not a prerequisite for verifying source wording. Production gh-pages is not changed by this audit branch.
