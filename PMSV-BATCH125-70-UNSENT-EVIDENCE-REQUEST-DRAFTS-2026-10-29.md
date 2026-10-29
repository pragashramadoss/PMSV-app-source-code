# PMSV Batch125 — offline original evidence-request draft packets

Date: 29 October 2026 (IST)  
Branch: `gh-pages`  
Preview: https://pragashramadoss.github.io/PMSV-app-source-code/fssai-product-helper-preview-01/#formulation

## Delivered

The Batch118 First-70 evidence-owner next-actions panel now offers:

1. **Download all 70 UNSENT evidence-request drafts** — one per original first-action request, covering 35 method/source-authority and 35 manufacturer/supplier quality functions across all 35 held commercial cases.
2. **Download 26 urgent P0 UNSENT request drafts** — 13 method/source-authority and 13 manufacturer/supplier requests for the 13 highest-priority held cases.

Each 18-column offline CSV carries priority, original case and request IDs, functional role, exact finished-product name/analyte, original evidence gate and source-specific documentary requirement, and a separate draft email subject and body. It leaves internal coordinator, verified recipient, channel, approval reference and planned dispatch date **blank**.

The draft text is role-specific. Method/source-authority requests seek original applicable regulations, amendments, precise finished-food article and methodological basis; manufacturer/supplier requests seek approved product identity, composition, batch traceability and relevant original CoAs. It asks for independent clarification where an article may not apply, without importing analog limits. The exact original required-evidence text is included in each draft.

## Fail-closed safeguards

- Both exports depend on a live verification of the full 70 original immutable identities, priorities, ranks, functional roles, evidence gates and `NOT_SENT`/`NOT_RECEIVED` status.
- The P0 subset must reconcile to exactly 13 distinct priority cases and 26 original requests.
- Stale/forged action snapshots, missing original sources and altered gates block exports.
- CSV values are quoted and formula-like leading strings escaped.
- Draft files are generated only on the user's device; no recipient is looked up, no message is sent, no backend/storage is added and no documentary evidence is declared received.

## Verification

- [GitHub Actions regression, Batch125](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40893743764): **SUCCESS** on 29 October 2026.
- Tests verify all 70 source-specific draft message contents, 35+35 functional roles, the 13-case/26-request P0 subset, blank recipient and approval fields, unchanged legal holds, and failure cases.
- A test-fixture CSV parser was adjusted to read the larger generated draft output. The live 150 KB limit for importing Batch97 operator follow-up notes was **not** relaxed.

## Regulatory state and next real-world action

The catalogue still contains **533 products**. Public-source desk research for the final 35 cases is complete, but **35/35 commercial reviews remain HELD** (13 P0, 22 P1); all 175 original documentary gates remain unverified, including 70 first actions and 105 downstream dependencies; legal/laboratory/QA approvals and product releases remain **0**.

The next controlled action is for authorised internal owners to assign and verify recipients, approve dispatch through the organisation's approved channels and then obtain and authenticate the actual original documentary evidence. No request may be marked officially sent or evidence verified solely because a draft CSV exists. WordPress remains untouched.
