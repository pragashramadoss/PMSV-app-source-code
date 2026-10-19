# PMSV Batch82 — P1 original-evidence workbench (19 October 2026)

**Deployment:** only `gh-pages` public FSSAI preview; WordPress production and `main` remain untouched.

## What this batch adds
- A P1 annex beside the existing P0 desk review, covering **22 P1 held products and their 110 uniquely identified original documentary requests** (five requests per case).
- Four analytically distinct group filters: **trace metals 15; mycotoxins 3; named pesticide residues 3; unspecified residue 1**.
- Separate published named-product identity research (**16**) from **6 unspecified substance/formulation** cases that **do not** have verified named-product identity standards.
- Search, identity and documentary-owner filters; original source context URL, marketed identity proof, case-specific legal-scope non-transfer reason and laboratory matrix method / LOQ needs.
- Two review-only CSV exports: **22 product cases** and **110 original evidence-request rows**. All exports explicitly retain **NOT_SENT**, **NOT_RECEIVED** / false flags, `HELD`, and zero approvals; no supplier materials are uploaded or stored.

## Source and legal safeguards
The new P1 dataset is *derived only* from four already-pinned existing source files: Batch54 detailed P1 dossiers, Batch56 original 175 evidence gates, Batch59 verified 35-case references, and the Final35 35-case legal-candidate review. These source pin digests are checked each load against the original case IDs, product identity, analyte, legal questions, documentary request IDs, custodian roles, and exact missing documentation. A published FSSR product identity is **not** a CTR contaminant ceiling or evidence that a commercial formulation meets the standard.

All **533** catalogue entries remain unchanged; **498** are conditional research matches and the original **35** cases remain unresolved (**13 P0 / 22 P1**). There are **175** original immutable evidence IDs (65 P0, 110 P1), no requests sent, no signed source adoption or legal limit, no accredited lab matrix approval, no received original CoAs and no lot PASS/release.

Source consultation should not be mislabeled as a verified operative original Gazette. All original-law and source effective-date checks require independent signoff. Do not load confidential supplier CoAs/formulas into the public GitHub preview.

## Verification
The new GitHub Actions workflow `verify-pmsv-batch82-p1-evidence.yml` executes fast source integrity checks, a synthetic browser tamper test, and a full 390px real-preview test after explicitly requesting the extended research chain. The workflow result must be observed after commit.
