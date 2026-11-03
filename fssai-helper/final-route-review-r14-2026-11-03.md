# PMSV R14 — final regulatory-route scope review — 3 November 2026

The final **40** catalogue records have been reviewed at their correct regulatory-route level. The catalogue now has **533 / 533 product identities with a scoped source review** and **0 unscoped records**. This is not 533 full legal confirmations, and no product/artwork/lot approval is issued.

## R14 scope
- 12 Indian sweets/snacks FPC 18 routes
- 8 Ayurveda Aahara Category A recipes
- 6 fresh/minimally processed produce routes
- 3 traditional mouth-freshener routes
- 2 edible dried-seed interim licensing routes
- 9 Category 99/11.6 ingredient/preparation routes
- 2 retained source questions (the edible-seed standard remains a draft proposal in this review)

## Source-scope findings
- FPC 18 is a licensing/registration route for Indian sweets/snacks where product standards were unavailable; it does not apply where the product is already standardized/mapped in FPC 01–14. Annexure II additive mapping, base-product microbiology and contaminant rules remain applicable.
- The 15 March 2024 edible-dried-seed order assigns fruit seeds to 4.1.2.2 and vegetable seeds to 4.2.2.2 until a specific standard is notified. The 26 May 2026 edible-seed proposal remains listed as Draft and is not activated.
- FoSCoS/FPC fresh produce, mouth-freshener and Category 99/11.6 entries are classification/ingredient routes, not blanket composition/use approvals.
- Exact Ayurveda Category A recipe identities remain route entries; Part-2 recipes were published 19 June 2026, so the July 2025 list is not treated as exhaustive. Recipe/process, additives, safety/microbiology, packaging, labelling and claims still require product-specific compliance.

## Tests and application
Local suites passed **1,635** structural/preservation checks, **231** route/safety controls and **26** browser checks. All 533 IDs are unique; filters return 40 current, 2 R14 source-question, 493 prior and 533 total records. No review object promotes full current-law, product approval or commercial release.

Workflow **41620049523** succeeded and applied only reviewed route metadata to `audit/all-533-2026-11-02`. Artifact **13223396908** was downloaded and matched the locally tested files byte-for-byte.

SHA-256:
- special-regulatory-routes-v1.json: `5f31a60b7d542ddaba7d20bd2195a199d0ec84cd7c591fe76bc2ab7667170eae`
- product-master-v1.json: `8818be3ca1e4f99a47eb47dd47db5529a5fd6f33f5e286dbc9afaec611ac9c5c`
- offline R14 HTML: `d59dc73300f84d70938323148c2a290b487efaa636dd13dc53d03c74dd1d5803`

**Integration boundary:** catalogue-wide scoped review coverage is complete. Full current-amendment, contaminants/residues, additives/processing aids, analytical-method, microbiology, packaging, labelling/claims and commercial-release assessment remains a separate layer. PR #2 stays draft/unmerged; production `gh-pages` is unchanged.
