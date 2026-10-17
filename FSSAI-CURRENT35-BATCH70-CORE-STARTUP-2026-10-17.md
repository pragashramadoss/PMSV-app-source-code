# Batch70 — Core-first startup and explicit research-mode loading

**17 October 2026 | Isolated FSSAI GitHub Pages preview (`gh-pages`) only. No `main` or WordPress changes.**

## Root cause and design boundary

Batch69 diagnostic: `pmsvB22StartupState=RUNNING` at 24 seconds, no failed network requests and no JS exceptions. Batch70 deep probe confirms the *contaminants loader finishes* while B22 is still running the full, increasingly costly research-wrapper chain; by 45 seconds the chain was checking Batch63. B22 accidentally called the **latest** `pmsvLoadPositiveSourceProof`, which now includes batches through B68, rather than the **B21 core validator registered when B22 was installed**.

The source-critical fix is surgical: B22 captures `pmsvB22CoreProofLoader` at module registration and calls only that B14–B21 chain during startup, then computes `pmsvB22Ready()` as before. **No validation checks or numeric compliance criteria were weakened.**

## Extended research source controls

The 35-case read-only documentary workbench is still available via a separately labeled **Load extended FSSAI evidence panels** button inside the Standard section. B70 explicitly holds this second stage until B22 core integrity is `READY`. It invokes the original full B68 source chain with no skipped predecessors and reports the research panels loaded *only if* B59/B63/B64/B65/B66/B67/B68 validators all return true, the 35 cases retain their original **175 unique requests**, no product-level approved/lab/lot evidence flags are set, and all requested panels exist. Otherwise it reports **INTEGRITY_BLOCKED**. Button provides loading text, no transmission and no legal approval.

## Verification

- GitHub Actions real Chromium loads the **full HTML preview** and requires B22 `READY` and B14/B21 validators to be true, before any optional extended chain runs.
- Separate isolated Chromium test injects source-loader failure, checks that B70 blocks instead of declaring reviewed/compliant, and blocks when B22 is invalid.
- Batch69 35-case immutable evidence audit must continue passing.
- The extended **all-68 overlay chain under a real browser** has not been newly certified as a complete end-to-end pass; B70 is a core-startup fix with an explicit manual-load boundary.

**Regulatory status unchanged:** 533 catalogue products, 498 conditional first-source matches, 35 original CTR cases open (13 P0 / 22 P1), 175 outstanding evidence request IDs. 0 signed case limits, 0 lab/method/matrix scope approvals, 0 original lot CoAs, 0 PASS, 0 released products.
