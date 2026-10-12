# PMSV FSSAI Helper — Golaka Dugdha source promotion and current 112 proof queue (12 October 2026)

**Current baseline: 533 total identities = 421 independently partial source-matched + 112 first-source pending. Zero full regulatory or tested-lot compliance approvals.**

## One first-source promotion in this batch

| Product | Official finished-product identity | Exact FSSAI CTR article | Legal limitation |
|---|---|---|---|
| 14.1 Golaka Dugdha (Condensed Milk without Sugar) | Ayurveda Aahara 25 July 2025 recipe: only Godugdha (cow milk), 1 part; sieve-filter then repeat gentle boiling and cooling seven times to thicken cow milk. | CTR Version IX (03 Feb 2026), §2.1 Lead: **Milks**, 0.02 mg/kg base, requires concentration factor for partially or wholly dehydrated milks. | Actual concentration factor, final adjusted numeric limit, sample and compliance remain unverified. |

Official first source: https://fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf (14.1 Golaka Dugdha).

Official legal source: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf (§2.1 Lead, printed Version IX page 5, PDF page 5).

The source-pinned reference is **0.02 mg/kg × actual concentration factor**, not an automatically calculated permissible final product maximum. Exact finished-product milk identity is established by the official one-ingredient recipe, not a generic inheritance from a food that merely happens to contain milk. No other 112 items gained source evidence in this batch.

## Current 112-packet reconciliation

Original immutable review archive: fssai-current-116-finished-article-proof-worklist-2026-10-12.json (116 identities). Four already demonstrated source matches (three cereal recipe matches from prior batch and Golaka Dugdha here) must no longer appear in the live worklist.

Current exact 112 file: fssai-current-112-first-exact-source-proof-worklist-2026-10-12.json. Records are exactly the intersection of the old 116 and the 112 presently pending entries in the current 533 identity ledger; each outstanding proof packet remains unchanged.

Current canonical ledger: fssai-current-first-source-533-live-ledger-421-112-2026-10-12.json. Prior dated 420/113 and 417/116 ledgers stay as historical signed baselines for regression, not the live source count.

New JS: fssai-first-source-current-421-112.js and fssai-current-112-worklist-integrity.js; source digests checked independently; aliases and changed limit, source, identity, concentration factor, sample/PASS, historical ledger mutation all fail closed; resolved products cannot be selected/exported from the old browser-local research evidence collector.

New tests: tests/fssai-first-source-current-421-112-2026-10-12.test.cjs; tests/fssai-current-112-worklist-2026-10-12.test.cjs, integrated into .github/workflows/verify-fssai-standard-nutrition.yml. Index loads both scripts after prior 420/113 snapshot.

**Deployment:** GitHub gh-pages only. WordPress website / plugin deliberately unchanged.

## First-source research boundaries

Raw-commodity or ingredient tests cannot be transferred to different processed forms without exact article applicability. Quinoa in FSSR 2.4.6 is a named pseudocereal/grain but explicitly excluded from the CTR cereal-grain **lead** article; a pesticide category such as ‘Other food grains’ needs separately proven crop classification before applying. Compound milk desserts, mixed chutneys, processed egg products, optional-cereal bakery recipes, canned/noncanned forms, fungi other than mushrooms and ingredient additive mixtures must not gain a PASS from resemblance alone.

**Next action:** Pursue authoritative product-definition-to-named-CTR article matches among 112 outstanding records, recording no first-source promotions without affirmative source evidence.