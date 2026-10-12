# PMSV FSSAI Helper — Batch-wide source integrity after data load (12 October 2026)

This batch strengthens **all 533 catalogue identities, the 116 unresolved current first-source worklists, and 32 reviewed conditional article identities** with post-load validation. WordPress unchanged; no new regulatory approvals issued.

## Gap corrected
Existing prior UI checks validated FSSAI source data at initial load, but downstream UI could render a changed numeric article or source record after loading. The new shared validator fails closed **on each relevant product rendering**. It authenticates:
- Nine **independently fixed Version IX** article/limit references from five legal articles: cereal, processed listed-composite, ready-to-eat nuts, spices/spice mixes and the cassava/sago hydrocyanic acid article.
- Original official-source row values and units in the active contaminants database (not just agreement of two mutable copies).
- Current 533=417+116 source ledger identity, exact name, FSSR/FCS and pending grouping.
- All 116 evidence packet identities, mandatory evidence questions, legal URL host, source provenance, no numeric auto-assignment, no laboratory/finished-food PASS.
- All 32 route product identities, stage flags, source authenticity, branch availability and clean regulatory sources.

The regression suite covers every 116/32 identity plus adversarial changes: each of nine values, source-row units, changed article text, fake source domain, wrong product identity, empty evidence, duplicate ID, and unsupported compliance approval. Default is read-only pending; an operator's subtype selection is never proof of applicable finished-food numeric limits.

**Inventory unchanged:** 533 catalogue; 417 first-source partial; 116 first-source pending; full regulatory approvals 0. No first-source promotions in this batch.

Official reference: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf (version IX, 03.02.2026). Asset and tests run only on GitHub Pages.
