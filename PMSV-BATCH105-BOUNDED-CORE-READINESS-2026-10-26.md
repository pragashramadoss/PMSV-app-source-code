# PMSV Batch 105 — Bounded cold-core readiness for independent evidence review

Date: 26 October 2026. Scope: GitHub Pages `gh-pages` prototype only; no changes to `main`, WordPress, FSSAI source tables, or commercial authorizations.

## Live observation after Batch104

The real Batch100 reviewer button responds to browser input, but an immediate cold-page verification fails when B22 core source validation is still RUNNING. Batch70's explicit extended-research button also reports that B22 is not yet READY. This is a prerequisite/race in the user journey, not proof of an applicable limit or laboratory approval. Batch104's event-dispatch-yield test was green; it did not certify full live reviewer readiness.

## Change

- Batch98's cold source handoff waits for the existing B70/B22 verified core to become READY before invoking the expensive B87 533-product catalogue research.
- The wait returns control to the event loop, checks the core at one-second intervals, and ends after at most 60 seconds. An explicit blocked/unknown core state fails immediately. No identity/provenance graph or original ledger check is removed.
- The Batch99 and Batch100 visible reviewer progress now prioritizes an unfinished core-validation prerequisite over a stale extended-research state.
- A pre-existing freshly validated B87 source summary continues through its independent integrity check without a redundant cold-load wait. An unavailable B70 API is still enforced by B87's own source gate in production.
- Duplicate clicks, exceptions, timeout and missing originals remain fail-closed. No requests are sent; metadata remains local to the browser.

## Acceptance checks

`tests/pmsv-batch105-core-readiness-handoff.test.cjs` exercises a core transition RUNNING → READY, a blocked core, a never-ready 60-second bounded wait (using accelerated test timers), duplicate-click suppression, a warm validated summary and downstream progress labels. The workflow re-runs Batch98–104 source, version, reviewer and tamper checks.

A 60-second deadline is a browser usability bound, not a source approval. If the live core stays RUNNING longer than that, users can retry when it is READY; the slow core path still needs separate performance investigation. The published browser's complete cold start is not claimed to be certified by these unit regressions.

Unchanged: 533 products; 498 conditional first-source references; 35 closed public-source desk reviews with commercial verification HELD; 175 original documentary requests NOT_SENT / NOT_RECEIVED; 105 downstream requests HELD. Zero signed legal limits, approved lab methods, tested-lot PASS or QA releases.
