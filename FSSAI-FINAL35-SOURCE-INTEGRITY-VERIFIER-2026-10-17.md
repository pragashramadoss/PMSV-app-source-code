# Final 35 CTR case closeout — independent source-vs-report verifier

This is a **source inventory integrity test**, not a new 35-case dashboard. It compares the edited final 35-case legal-candidate JSON and exported 35-case CSV against original immutable Batch59 case identities and Batch56 documentary gate IDs and statuses, plus the prior Batch77-independent closeout. An assertion fails if original case counts or names change, a legal/laboratory/lot approval is invented, a documentary request is lost, duplicate, marked sent or received, or source-specific rejection findings get promoted to legal case signoffs. It also checks original two-ready/three-dependent gate order and counts.

**The verifier passing does not certify the FSSAI legal conclusions** and does not prove actual manufacturer's market identity, Gazette applicability, NABL lab scope, received CoA or product PASS. It only prevents software and report integrity drift.

Run locally on checked-out repo: `node tests/fssai-final35-research-integrity.test.cjs`.

Research sources and limitations are in [Final 35 legal-candidate audit](./FSSAI-FINAL35-ORIGINAL-LEGAL-CANDIDATE-AUDIT-2026-10-17.md).
