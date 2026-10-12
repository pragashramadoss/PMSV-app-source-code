# PMSV FSSAI — Sugandhit Ksheera partial first-source promotion and 111 pending (12 October 2026)

## Reconciliation

Total standardized catalogue: **533**. **422** with a verified product-standard / CTR first-source pairing. **111** remain first-exact-source pending. **Zero** full contaminant assessments, zero sampled-lot PASS, and zero legal compliance certifications.

The previous 417/116, 420/113, 421/112 ledgers are historical evidence baselines, not the current status. 422/111 is canonical only after the most recent source and identity snapshot digests validate.

## Product promoted to partial evidence

**14.6 Sugandhit Ksheera (Aroma-infused Milk)** — FSSAI 25 July 2025 Ayurveda Aahara recipe 14.6 enumerates **Tandula / Rice (Oryza sativa L.), seed, Q.S.**, at official ingredient row 12, alongside other ingredients such as buffalo milk. This is an affirmative source for the *standard-recipe ingredient identity*. It is NOT proof that rice was actually used in a specific manufacturer's batch.

FSSAI Contaminants, Toxins and Residues Regulations 2011, Version IX 03 February 2026, §2.2.1, has the explicit composite-food article **Food product containing any of the above mentioned food articles**. Cereals are listed among those source commodities. The source-article references are:

- **Total aflatoxins: 20 µg/kg**, source category composite food containing a listed commodity.
- **Aflatoxin B1: 10 µg/kg**, same composite article.

Neither the ingredient-only cereal limit of total aflatoxins 15 µg/kg nor separate milk aflatoxin M1 is automatically inherited by this preparation. Q.S. does not establish amount or actual inclusion. If the actual formula excludes rice, the composite-cereal route must not be applied; leave it for separate regulatory identity adjudication.

Official FSSAI product source: https://fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf

Official FSSAI contaminant source: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf

## Data and application controls

New sources: data/rules/fssai-sugandhit-ksheera-listed-rice-aflatoxin-first-source-2026-10-12.json; data/rules/fssai-current-first-source-533-live-ledger-422-111-2026-10-12.json; data/rules/fssai-current-111-first-exact-source-proof-worklist-2026-10-12.json.

Front-end script fssai-first-source-current-422-111.js verifies all 533 identities and the legal source units, 111 still pending review packets, single-product change from 421/112, and unchanged safety flags. It hides older current source status from the live product detail and prevents local evidence collection for already promoted products. Test script tests/fssai-first-source-current-422-111-2026-10-12.test.cjs covers product source, numeric source values, pending identities, and mutation / tamper fail-closed behavior.

WordPress remains unchanged. Only GitHub gh-pages is updated.

## Explicit exclusions reviewed in parallel

Pan Masala FSSR 2.11.5 states it **may contain** betelnut. That wording does not prove arecanut was used, so no automatic composite-aflatoxin match.

FSSAI FoSCoS Food Category 18 Indian Confections is a distinct administrative category from Category 05 Confectionery; the generic NOTS hydrocyanic acid article 'Confectionery' needs affirmative finished-product legal scope before matching every Indian Sweet.

The 111 unresolved products will be evaluated for affirmative matches without borrowing a raw, canned, dried, optional-ingredient, analogue or different-food limit.