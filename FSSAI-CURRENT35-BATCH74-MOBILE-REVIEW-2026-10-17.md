# PMSV FSSAI Helper — Batch74 mobile evidence-review navigation

**17 October 2026. `gh-pages` preview only. WordPress production and `main` unchanged.**

## Scope
The FSSAI helper already offers core-first loading (B70) and synchronous, nonpersistent integrity optimization (B73). Batch74 adds a small, read-only mobile layer after B70 without modifying regulatory decision functions or any legal/method source packs.

- Show actual research section visibility from 0–6; never mislabel the count as signed-off research, a percentage of compliance, or approved cases.
- Permit navigation to the six research sections only when B70 reports core READY, extended READY, **and all six sections are actually present**.
- A blocked core, integrity-blocked extended review, or missing panel disables navigation even if sections from an earlier attempt are on screen. The regulatory hold survives every UI state.
- Mobile (up to 700px): touch-sized 44px load and section controls, single-column navigation, focus indication, keyboard-scrollable wide evidence tables with accessible labels, and no oversized controls.
- No storage, transport, new numerical limits, inherited matrices, legal case approval, NABL lab signoff, actual CoAs, releases or changes to protected source data.

## Verification
The B74 workflow checks syntax and a synthetic Chromium state progression including NOT_REQUESTED, LOADING, INTEGRITY_BLOCKED, READY, a missing source section and non-READY core; then tests actual GitHub Pages HTML in 390px Playwright Chromium with B22 core and full B70 opt-in B23–B68 evidence review. It confirms 35 held cases, 175 immutable evidence IDs, the mobile navigation and table accessibility without pretending any compliance approval.

**Regulatory state: 533 products; 498 conditional source matches; 35 CTR cases HELD (13 P0, 22 P1); 175 documentary evidence IDs OPEN; 0 approved case limits, lab method scopes, lots, or releases.**
