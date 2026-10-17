# Batch74 — Fail-closed source freshness after B73 performance optimization

17 October 2026. **`gh-pages` FSSAI prototype only**; no production WordPress or `main` modifications.

## Why

After Batch71 a complete B23–B68 run could return READY, but this state remained stale until a reload if its source data or one mandatory evidence panel subsequently disappeared. This was misleading even though individual exported source checks still validated. B73 added per-synchronous-operation validator memoization, not any cache that persists across events.

## Changes

- Every subsequent explicit request to `window.pmsvB70ExtendedResearch.getState()` when READY now recomputes the entire B59/B63–B68 validation chain, original 35 held cases, 175 distinct original evidence request IDs and all six mandatory panels. It **does not** reuse past event's validation.
- If any check fails, immediately change review status to `INTEGRITY_BLOCKED`, not READY; replace the static `all35Held` flag with the currently verified READY state; clear panel progress and show a specific evidence-freshness error.
- Add **Recheck loaded source integrity** user control for explicit manual verification. This neither transmits evidence nor approves law, laboratory scope, lot testing or release.
- Real Chromium negative tests first validate 35 held synthetic cases and 175 IDs, then mutate source validity between events, remove an expected panel and fabricate a case approval. READY must fail closed. The standalone Batch69 complete integrity audit remains required.
- Full-preview live B73 performance/opt-in suite reruns from the corrected script-order test to guard against UX and startup regressions. It must pass before the batch is certified.

## Regulatory boundary

533 catalogue, 498 conditional first-source matches, **35 original CTR cases HELD** (P0 13/P1 22), 175 original documentary evidence requests still outstanding. 0 legal contaminant limit signoffs, 0 accredited method/matrix laboratory scope signoffs, 0 lot CoAs/PASS, 0 releases. Preview only.
