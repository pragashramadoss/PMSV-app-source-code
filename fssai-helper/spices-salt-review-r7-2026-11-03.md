# PMSV R7 — salt, spices, condiments and herbs — 3 November 2026

## Scope and results

46 previously unreviewed catalogue records were examined. The 264 earlier scoped reviews are retained, giving **310 distinct reviewed records out of 533**. These are source-edition reviews, not fully verified products. No full-product or commercial-lot approval is issued.

| Measure | Result |
|---|---:|
| Additional catalogue records | 46 |
| Stored standard objects | 47 |
| Supplementary standards without a current catalogue route | 1 |
| Shared provisions | 1 |
| Normalized requirement records | 638 |
| Numerical rows within that total | 589 |
| Microbiological sampling plans checked | 28 |
| Numerical sampling plans changed | 0 |
| Microbiological category routes corrected | 2 |
| Current records with specific source questions | 10 |
| Cumulative scoped records | 310 / 533 |
| New full-product approvals | 0 |

The supplementary potassium-iodate standard is not counted as a new product. Counts include source variants, solvent rows and qualitative requirements, not only distinct analytical parameters.

## Main corrections in the offline registry

- Restore six cardamom variants and distinct capsule/seed/powder analytical bases.
- Separate whole black, white and green peppers from the ground black/white tables. NA is not zero.
- Preserve the allspice-powder non-volatile ether-extract MAXIMUM of 8.5% on a dry basis.
- Restrict the seasoning-paste exception to the 10% moisture limit; the 2% dry-basis acid-insoluble-ash ceiling is not exempted.
- Keep salt-substitute magnesium on the stated potassium/calcium/ammonium cation denominator, not whole-product mass.
- Separate input-salt purity, finished double-fortified salt, hing/hingra versus compounded hing, and Tejpat versus Laurus nobilis bay leaf.
- Retain residual-solvent requirements and the named oleoresin types without inventing numerical minima for merely named active components.
- Replace unconditional non-ground microbiology mappings for bay leaf and mint with actual non-ground versus ground/powdered/crushed form selection.

All 28 stored Table 3 numerical plans matched independent transcription. The comparator requires complete individual-sample results, the correct organism/unit and specified detection portion. Process-hygiene criteria are not market-release criteria. Fresh-category GMP/GHP provisions are not converted into invented numerical limits.

## Primary sources

Chapter 2.9, Version 4 (01.08.2025), 58 pages:
https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_9_Salt_Spices_Condiments%20and%20related%20products.pdf
SHA-256: 3f80e37f2c181b9dddf58c7ca4bc4b687ad834313b14de63dc2c4f1e7adcf71b

Appendix B, Version 2 (04.11.2024), Table 3 and accompanying provisions, PDF pages 24–29:
https://www.fssai.gov.in/upload/uploadfiles/files/Appendix%20B%281%29.pdf

Tables were examined as page images and parsed text, without OCR. Both compendium PDFs are included in the package.

Tarragon: the 10 July 2025 final notification and its 1 February 2026 commencement were identified. The original commencement page was inspected; original table-image retrieval failed, so the corresponding compendium tables were inspected and original parsed text compared. No local original-notification bytes/hash is claimed:
https://www.fssai.gov.in/upload/notifications/2025/07/6879d8af12522Palm%20Oil_FPSFA_Notification.pdf

The proposed saffron unit correction remains a draft, not an applied final requirement:
https://comments.fssai.gov.in/Bestviewwl.aspx?NOTIFICATION_ID=4353

These targeted checks are not a complete current-amendment reconciliation.

## Remaining source questions

Ten records remain flagged: caraway, cassia, cumin/kalonji, dried ginger, black/white/green peppers, saffron, curry powder, mixed masala, dried mango slices and dried parsley. Questions concern variant/botanical scope, units, analytical bases, a cross-regulation contaminant limit and extraneous-matter denominators. Exact questions remain on their rows; none was cleared to inflate a confirmed count.

## Tests

Local results: 4,462 structural/preservation checks, 7,192 numerical/applicability/sampling-plan checks, and 42 browser checks, all passed. All 533 actual product details rendered. Filters returned 46 current, 10 current questions, 310 cumulative, 264 earlier, 80 existing dairy and 533 total records. Filtered export retained all 533. Widths 1440/390/320 px showed no page-level overflow or JavaScript errors. Earlier review registries and representative comparisons were preserved.

An initial browser run exposed a missing label for the non-numerical fresh GMP/GHP category. An explicit label fallback was added and the complete suite rerun. No limit was invented or requirement weakened. Chromium used set_content on the actual standalone HTML; this was not a native Android or live-site test. These checks do not certify legal completeness.

## Repository application and integration boundary

Workflow 41566919922 succeeded and reported 1,074 core-route checks. It applied only the two microbiology route corrections to the product master and Appendix B on audit/all-533-2026-11-02, committing 63d7b6e02331e481e7a7b1e44457c9dd74396acf. Downloaded artifact 13199511926 was compared locally; both outputs are byte-identical:

- Product master SHA-256: 1e8e75462055fb1428cccff8a7a783a37ab337dd66d45b02c1b31d7b361bd500
- Appendix B SHA-256: d9225920ebe98b0f6734dde9c9003c407a54ca200f270f07fcda0e9aea779658

The standalone guard and report are saved on this draft branch. **The expanded 638-row registry, augmented Chapter 2.9 review module and full viewer are delivered in the downloadable package; they are not fully integrated into the live decision engine.** Historical incomplete numerical summaries remain for traceability and are explicitly unsuitable for activating unchanged legacy comparisons. The offline comparator uses the new scoped registry.

Standalone HTML SHA-256: bfe618a91cd9946280ac9169bd392d5fe0ff03423673f58a6c9e0513c45a84ca
R7 registry SHA-256: 588ed23a57aeac9c8df6717a3bc979988841e85cd183585641df4705b55d6b44

PR #2 remains draft and unmerged. Production gh-pages is unchanged by R7. Complete original-notification/amendment reconciliation, contaminants/residues, additives, validated methods, packaging, labelling, claims, fortification and sales provisions remain product-specific work. A commercial batch report is not required merely to verify regulatory wording; commercial release is separate.
