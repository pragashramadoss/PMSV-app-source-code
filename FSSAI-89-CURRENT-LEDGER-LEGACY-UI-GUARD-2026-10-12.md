# PMSV FSSAI — current 89 queue supersedes archived 116 (12 October 2026)

**Deployment scope:** GitHub `gh-pages` only; WordPress remains unchanged.

## Verified current counts
- 533 catalogue identities, 444 with partial exact-source evidence, 89 awaiting a first exact contaminant article.
- The earlier 116-case evidence collection snapshot is archived. **27 identities in that archive have since been promoted** to conditional partial source evidence. Neither checklists nor local analyst notes establish legal or laboratory compliance.
- No newly verified contaminant articles or product promotions were created by this user-interface consistency change. **No complete regulatory PASS.**

## Functional corrections
1. The original 121-item research panel now checks the digest-validated current 444/89 ledger before showing a historical pending-source article. It no longer shows old first-source warnings for currently partially matched products.
2. The historical 116-item local evidence collector is preserved for the 89 entries still pending, and hidden for its 27 now-partially-sourced entries. Existing browser-local notes retain their storage keys.
3. The latest wrapper now checks the **actual current status of all 533 identities** instead of suppressing only the last two promoted whole-egg subtypes.
4. Each pending evidence panel keeps its non-transfer, identity/processing and analytical requirements; no numeric limit, lab test or full compliance status is granted.

## Official sources reviewed during this batch
- FSSAI Contaminants Version IX (03 February 2026), Chapter 2, including separate commodity terms and sample-specific conditions:
  https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf
- FSSAI Chapter 2.3 Fruit and Vegetable Product Standards (04 November 2024), clause 2.3.13 covering *fruit/vegetable* concentrates and clauses 2.3.16, 2.3.17 and 2.3.41; these standards do not on their own establish a named CTR finished-food contaminant article:
  https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf

## Regression check
`node scripts/audit-fssai-current-89-ui-regression.cjs` verifies the current 533 source joins, 89 pending, 444 partial, 27 previously pending now promoted, and fail-closed archival UI safeguards. It must pass before any deployment claim. Full browser integration and GitHub Actions must also be reviewed separately.

**Next positive-evidence blockers:** processed/reconstituted commodities, unspecified analogue matrices, concentration-dependent milk and sugar subtypes, raw-ingredient-to-finished-product pesticide transfers and non-equivalent Appendix A/legal food articles. Do not convert these to partial simply to decrease the count.
