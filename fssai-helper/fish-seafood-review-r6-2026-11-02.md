# PMSV R6 — fish and seafood — 2 November 2026

## Actual scope and cumulative reconciliation

This continuation adds 24 fish/seafood catalogue records linked to 24 standard sections. The source review contains 326 normalized requirements, including 161 fatty-acid table cells across seven named-oil profiles. Non-applicable cells are retained, not treated as zero limits. The 73 microbiological records comprise 71 independently checked n/c/m/M sampling plans and two method-based requirements; their existing numeric values did not need correction.

The full viewer retains all 533 actual IDs. It also integrates the separate 80-record dairy review already saved in this branch (69 principal-composition and 11 identity/route-only records). That is existing work, not 80 newly reviewed products in R6. The actual unique union is **160 earlier records + 80 existing dairy records + 24 new fish records = 264 scoped records**. The previous dairy report's 222 total was based on the prior 142 and did not include the separate 18-record fats/oils continuation.

These are source-edition review counts, not complete current-law confirmations. No full-product approval or commercial release is granted.

## Source corrections and interpretation controls

1. Chapter 2.6 source metadata is updated to Version 3 (7 May 2025). The captured final 21 October 2024 Gazette supports the fish-oil substitution and its 1 May 2025 commencement.
2. Formaldehyde Group II freshwater has a 4 mg/kg ceiling: the 4.0 table cell on page 55 spans Groups I and II. Group III is 8 and Group IV is 100 on page 56; the latter is the specified marine frozen-storage group, not a generic fallback or a freshwater exemption. No transfer to a derived/composite article without exact scope proof.
3. Appendix B fish-10 expressly describes hot smoking with complete protein coagulation. The broader chapter identity includes other smoking presentations; its unconditional fish-10 mapping is replaced by a conditional candidate.
4. Heat applied only to open clam shells does not make the chapter's cooked-clam identity, but Appendix B separately provides for frozen heat-shucked molluscs. Raw non-heat-shucked and heat-shucked candidates are distinguished.
5. The fish-stick-specific average fish-flesh minimum (50%) and thickness (10 mm) are restored without applying them indiscriminately to all battered/breaded fillets.
6. Fish-oil acid value retains the phospholipid-dependent exception; a krill name alone does not establish measured phospholipid content. TOTOX is 2 × peroxide value + anisidine value and does not replace the separate limits. The offline review exposes the complete selected fatty-acid table and matrix/variant conditions.
7. A printed Listeria plan for battered/breaded products has n=5, c=5 and Absent/25g. The literal source is retained but automatic acceptance is disabled pending reconciliation; the anomaly is not silently rewritten as c=0.
8. Round-can vacuum is documented as 100 mmHg at 25°C using FSSAI 06.008:2023. This is a scoped unit/method reference check, not validation of all laboratory procedures.
9. Canned/retort salt wording, fish-pickle acidity, mince storage direction, smoke-dried parenthetical moisture and the freeze-dried moisture boundary remain explicit questions. Typical fish-sauce pH and descriptive gelatin thermal ranges are not promoted to unconditional mandatory limits.

Seven current product records have source questions: canned products, retort curry, smoked fish, frozen mince, freeze-dried shrimp, fish pickle and battered/breaded products. Complete methods, subsequent amendments and other regulatory layers remain open.

## Primary documents retained

- Chapter 2.6, Version 3 (07.05.2025), 56 pages: https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_6_Fish_and_Fish_products.pdf — SHA-256 e5975724499be68dd77b460fcccfb99fdbcbb56ab5048ca1028b2a51bec8c33c.
- Appendix B, Version 2 (04.11.2024), 72 pages: https://www.fssai.gov.in/upload/uploadfiles/files/Appendix%20B%281%29.pdf — SHA-256 4b2f41ec2763a9191b4a14aaa12918c8bd3a82b41022ced1e415b05e44812bc7.
- Fish methods manual 2023, 109 pages: https://www.fssai.gov.in/upload/advisories/2023/07/64b655b00a2b9Manual%20of%20Methods%20of%20Analysis%20for%20Fish%20%26%20Fish%20Products.pdf — SHA-256 6488f063c7d773b5152fbe7a534d607aae479d96814849088b30b91b3b425779.
- Final Gazette 21 October 2024, 42 pages: https://www.fssai.gov.in/upload/uploadfiles/files/GAZETTE%20NOTIFICATION%20DATED%2021_10_2024_ammendments.pdf — SHA-256 7658eb4ddc0b793ffb66d7cecf2ed3d9784727183f64a61fb584d5fd1018c2ad.

Relevant numerical tables were inspected as page images. A timed-out manual screenshot was checked in the locally rendered captured PDF. No OCR was used. A separate Gazette URL returned 404 and is recorded as failed, not fabricated. Draft proposals were not applied as final standards. Complete current-index reconciliation is not asserted.

## Tests actually run

- 6,933 local structure, traceability and preservation assertions passed; 0 failed.
- 2,778 standalone numerical/scope/sampling-plan assertions passed; 0 failed.
- 42 browser assertions passed; 0 failed. All 533 actual detail views rendered. Filters produced 24/7/80/264/240/533 as applicable. Filtered export retained all 533. Widths 1440/390/320 px showed no page-level overflow or JavaScript errors. Earlier cereal, meat and fats controls were preserved.

The first browser fixture tried to select controls in a closed details panel and timed out. The fixture was corrected to open that panel; the complete suite passed afterward. No source rule was weakened. Chromium set_content testing is not a native Android-app or live-site end-to-end test.

## Repository versus offline package

Workflow 41491011309 applied the readable, source-preimage-checked core correction script only on this audit branch and passed 1,452 repository preservation checks. Artifact 13163124384 was downloaded. Its product master and Appendix B are byte-identical to the corresponding locally tested outputs; 191 core fish fields were compared successfully, with a disclosed caveat-prose difference.

**The expanded 326-row registry and standalone comparator are supplied in the downloadable R6 package, not fully integrated into the repository's live decision engine.** The branch contains the core data corrections and this report; it is not claimed to be a byte-identical copy of the complete offline companion. The standalone flags must not be assumed to be enforced by the production engine.

Capture provenance: workflow 41487696847, artifact 13161804822. Existing dairy artifact 13160904858 was separately retrieved and retained.

PR #2 remains draft and unmerged. Production gh-pages is unchanged. Complete current-law verification, contaminants/residues, additives, processing aids, adopted analytical methods, packaging, labelling and claims remain incomplete. A laboratory batch report is not required merely to verify regulatory wording; commercial release is a separate authorized decision.
