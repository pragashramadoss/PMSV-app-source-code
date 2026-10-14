# PMSV FSSAI Helper — Batch 24: selective review restoration without accidental data loss

**14 October 2026.** GitHub Pages preview only, independent of WordPress production.

## Concrete issue and fix

Batch23 made JSON imports require preview and confirmation, but confirming an entire 35-case packet could still overwrite local reviewer work **in all 35 cases**, including cases with blank incoming values. This was a significant data-loss risk during cross-device synchronization.

Batch24 keeps Batch15's strict product identity/source URL/official-source/zero-approval validator and Batch23's preflight and stale snapshot checks, then adds explicit **per-case selection** before committing:
- All 35 cases **unchecked by default**; no import can proceed with zero selected changes.
- Each case clearly marks unchanged, empty incoming, new information or **overwrites existing**. Reviewer content is not shown inside the choice list.
- **Select only new evidence** shortcut excludes overwrites. An explicit **Select all changed (includes overwrites)** option and **Clear** are provided for power users.
- Unselected cases preserve existing B14 reviewer text and B5 receipt claims. New drafts, changed drafts and evidence receipts for explicitly selected cases are committed atomically by the established B15 implementation.
- Conditional candidate legal-source checkbox assertions (B15) have a **separate opt-in**. Claim changes never imply regulatory scope sign-off.
- File identity and all three localStorage key values are rechecked immediately before saving; stale review previews cannot overwrite newer local evidence.
- Only explicitly selected current cases have their open evidence forms redrawn following import.

## Real Chromium coverage

Loads the full application with the Batch22 verified startup recovery. Creates two separate saved reviewer drafts, prepares a 35-case transfer with three changed cases and one conditional claim. Checks default-zero selection, restores selected trehalose and coffee drafts, preserves unselected royal jelly, preserves candidate claims unless independently selected, then verifies claim-only import and 'new evidence' shortcut. Preserves current **533 / 498 / 35** ledger and zero legal approvals/lot PASS.

## Statutory reference

[FSSAI Food Safety and Standards (Contaminants, Toxins and Residues) Regulations Version IX, 03 February 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf). The metal-contaminant table contains metal-specific fallback articles; a draft selecting “Foods not specified” is **not proof** of any finished-product exact article match.

The prospective 01 December 2026 amendment remains inactive as of the 14 October 2026 batch date.
