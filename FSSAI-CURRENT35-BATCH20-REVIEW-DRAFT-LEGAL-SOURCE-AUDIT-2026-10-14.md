# PMSV FSSAI Helper — Batch20 (14 October 2026)

**Purpose:** Move from adding checklists to automatically screening the 35 actual browser-local reviewer drafts for product-to-CTR source mismatches and missing evidence. Scope **gh-pages preview only**; WordPress unchanged.

Current baseline: **533 canonical foods; 498 conditional first-source references; 35 exact-first-source unresolved**, all 35 unchanged. Zero auto-assigned contaminant limits, independent approvals and lab PASS.

## Current official source
- [FSSAI CTR Version IX (03 February 2026)](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), §2.1.1: lead/copper/arsenic/tin/cadmium/mercury have their **separate** 'Foods not specified' fallback rows. These references cannot prove a product-specific exact article absent a named-commodity precedence check. Methylmercury states 'All foods'; it is not the all-foods article for arsenic, lead or any other metal.
- [Current Trehalose §3.3.4, FSSR Chapter 3](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%203_Substances%20added%20to%20food.pdf): GMP except infant food. Source drafts reusing obsolete fixed percentage bands receive an explicit superseded-source review flag.
- [FSSAI FoSCoS product directory](https://fcstraining.fssai.gov.in/standard-product): lists distinctions among dry cocoa-sugar mixes, cocoa beans, cocoa mass and powder, vending water, polyols and categories.

## New executable app controls
- 35/35 product IDs bound to canonical source ledger and B14 workbench.
- Seven existing metal/default references cryptographically signed with same digest as the 35-case source audit manifest. General metal fallbacks are surfaced as **priority reviews** only, never legal approvals.
- 13 targeted forbidden/conditional article transfers: cocoa-powder to different cocoa material, dairy milk to coconut or composites, packaged water to vend water, cereal to chia/arrowroot/Trapa flour, salt to substitutes, sorbitol to unspecified polyols, honey to royal jelly, incompatible high-ash glucose, coffee to chicory blend, canned foods to pickled eggs, raw fruits to processed fruits, superseded trehalose rules, single crop article to an unspecified premix.
- Classifies reviewer drafts as **NOT_STARTED**, **INCOMPLETE_DRAFT**, **NEEDS_ARTICLE_CHALLENGE_REVIEW**, or **DOCUMENTARY_DRAFT_UNVERIFIED**, based on existing B14 locally-entered fields and actual receipt checkboxes.
- A new preview dashboard shows per-product evidence issues and exports a 35-case CSV of review flags. No source promotion, no report upload, no claimed PASS.
- Forged JSON, mismatched source identity, wrong CTR default and future-amendment activation fail closed.

## Verify
`node --test tests/fssai-current35-review-draft-source-audit-batch20-2026-10-14.test.cjs` and `node --check fssai-product-helper-preview-01/fssai-current35-review-draft-source-audit-batch20-2026-10-14.js`.

**Important:** A source warning denotes a *potentially unsupported claim* requiring qualified review, not an authoritative legal ruling or failed product laboratory result.
