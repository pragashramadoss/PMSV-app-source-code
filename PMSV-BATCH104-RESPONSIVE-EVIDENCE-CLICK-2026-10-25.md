# PMSV Batch 104 — Responsive evidence-review click path

Date: 25 October 2026. Prototype deployment: `gh-pages` only. No `main`, WordPress, published legal standard or commercial signoff changes.

## Observed defect

On the published Product Standard preview, Batch70's core and extended research reached READY, but the browser automation repeatedly timed out when clicking Batch100's verification button. GitHub CI passed the underlying source checks. The Batch100 status could remain at an intermediate elapsed-time string even when its loading button had returned to idle.

## Technical cause and narrowly scoped fix

Async functions still execute synchronously until their *first await*. Batch100.load called Batch99.loadVerifiedRows, which called Batch98.loadVerifiedCases, which initiated the expensive B87 closure-source graph before the original browser click returned. A cloud-browser input dispatch can time out waiting for that handler.

- Yield once with `setTimeout(resolve,0)` before graph work in each Batch98, Batch99 and Batch100 load. This releases input dispatch and allows the initial Verifying control state to paint. The complete source verification still executes after the yield; no external source trust is cached or skipped.
- Prevent simultaneous Batch98 load calls while awaiting the graph; duplicate request safely returns false and the button is disabled during loading, restored in finally.
- Batch100 now explicitly reports a terminal READY state with verified 105 original held dependencies and elapsed time after successful full validation. Failure states and independent review gates remain fail-closed.
- Batch99 and Batch100 already suppress concurrent loads; their safeguards remain intact.

## Verification

Batch104 tests assert that the expensive source-layer calls are **not** entered synchronously inside a click; separate duplicate actions are suppressed, and insufficient original evidence remains held. Re-run Batch98–103 original-row, source revision, independent review, and tamper regressions.

Browser-event responsiveness is separate from total source research duration. The verification itself may still take time; full live performance must be observed on the published preview. Never interpret UI READY as signed legal applicability, approved laboratory scope, tested-lot PASS or QA release.

Unchanged counters: 533 products; 498 conditional references; 35 desk source reviews closed with commercial verification held; 175 original requests NOT SENT/NOT RECEIVED; 105 downstream held; zero legal, laboratory or lot approvals.
