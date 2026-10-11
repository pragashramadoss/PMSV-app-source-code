# FSSAI Helper — 29 unmatched legal article gaps and 20 loaded-row checks (11 October 2026)

Scope: GitHub `gh-pages` only. WordPress unchanged.

This round records individual identity, process, tissue, composition and article-qualification blockers for all **29** pending products that lacked even a safe named contaminant article candidate. These are **not** exemptions or compliance outcomes. It also revises one Nickel source transcription to retain the full official table wording and installs a CI comparison of **20** referenced contaminant/NOTS/pesticide rows against the local Version IX official data tables. Test failures block any claim of verified article integrity.

### Baseline
533 catalogue products; 412 partial exact-source products; 121 products still without first exact evidence; **zero full approvals or new first-source promotions**.

### Important exclusions
- Carob powder is not cocoa powder; royal jelly is not honey; pan masala is not merely raw betelnut; salt substitutes are not sodium chloride food-grade salt.
- Processed egg, rabbit tissue and animal casing samples need legally appropriate species/tissue/processing bases.
- Colouring foods, enzyme preparations, food additives, polyols, nutraceutical schedules and functional premixes require exact additive or ingredient identity, not grouped FoSCoS code.
- Mixed pickles, desiccated coconut, thermally processed vegetables and vegetable protein products must not borrow a raw commodity or canned-product MRL.

Official FSSAI CTR Version IX source: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf.

### Files changed
`fssai-product-helper-preview-01/data/rules/fssai-next29-no-source-proof-dossiers-2026-10-11.json` (29 independent dossiers); `fssai-product-helper-preview-01/data/rules/fssai-next121-positive-subtype-proof-2026-10-11.json` (corrected full Nickel literal and source provenance for 20 rows); `tests/fssai-next29-unmatched-source-dossiers-2026-10-11.test.cjs`, `tests/fssai-next121-live-version-ix-source-row-lock-2026-10-11.test.cjs` (regression/source checks), plus continuous verification workflow. No finished-food numeric limit is auto-applied by this change.
