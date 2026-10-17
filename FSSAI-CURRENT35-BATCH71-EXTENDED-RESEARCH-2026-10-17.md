# Batch71 — Optional end-to-end FSSAI evidence workbench, core reuse and compliance holds

**17 October 2026. Changes limited to the GitHub Pages `gh-pages` FSSAI prototype. No WordPress or `main` changes.**

## Improvements

- **Core integrity reuse at B23:** the optional B23–B68 extended evidence loader does not rerun the original B14–B21 fetch/render work **if and only if** the unchanged `pmsvB21Valid()` chain proves the complete core dataset is still valid. If the core is stale/missing, it reruns its original parent loader and throws a non-approval integrity error if validation remains false. This makes staged loading faster without skipping a necessary signature or source gate.
- **Visible opt-in progress:** the existing Batch70 button now displays how many of the six major downstream research panels have appeared. A panel appearing is **not** labelled verified/compliant. A final READY requires unchanged whole-chain runtime validators, 35 cases, 175 immutable request IDs, and all six panels. Errors identify which validation stage is still unavailable and remain fail-closed.
- **Complete live Chromium opt-in regression:** serves the real prototype HTML, waits for B22 READY/B14/B21, invokes actual optional source loader, requires all B59/B63/B64/B65/B66/B67/B68 valid and six panels present; checks original 175 IDs and 12 held P1 lead rows. No mocked regulatory data.
- **Independent rejected-source test:** downstream fetch failure or invalid core must always be `INTEGRITY_BLOCKED`, with 0 product approvals and releases.
- **Immutable coverage audit:** previous Batch69 test is rerun, preserving all original 35 cases and 175 evidence requirements.

## Disclosure

Loading reference-data research material does not establish legal applicability, determine an operative contaminant maximum, prove accredited laboratory scope or establish a lot PASS. The original 533 catalogue items / 498 conditional first-source matches / 35 held CTR cases (P0 13, P1 22) remain. All original 175 requests are open and unsent; no manufacturing lot released.
