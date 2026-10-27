# PMSV Batch 108 — Live core startup status follows the real verdict

27 October 2026 | `gh-pages` preview only.

## Observed live mismatch

Batch107 source-render tests and GitHub Pages deployment passed. The live preview showed the 35 B20/B21 review controls while the Batch70 status label still displayed `RUNNING`. B70 had rendered its snapshot during initial loading and had no subscription to the later B22 asynchronous startup completion. That label alone was not proof that source verification was still running.

## Change

- B22 now emits a single `pmsv-core-startup-settled` DOM event after its normal asynchronous READY / INTEGRITY_BLOCKED verdict and stats update.
- B70 receives this event and reads the **actual** B22 core status afresh. It updates its existing display only; an event payload cannot confer READY, a legal limit, lab PASS or QA release.
- The first visible RUNNING state stays truthful while the source really loads. Both success and integrity-blocked outcomes receive an update automatically, without another user click.
- No polling interval, network telemetry, data mutation, evidence upload, automatic owner request or special override was added.

## Regression

`tests/pmsv-batch108-startup-state-display.test.cjs` simulates the cold async transition with both valid and invalid original-source checks; it checks the visible B70 label and zero approval/release counts. The targeted workflow reruns B105–B107 guards. Existing real Chromium B22 and B70 workflows are independently triggered by the touched scripts.

## Immutable review status

533 catalogue / 498 conditional / 35 commercial cases HELD; 175 original requests NOT_SENT/NOT_RECEIVED; 105 downstream HELD; 0 signed numeric-product approvals, 0 lot PASS and 0 released products. `main`, live WordPress, and original source ledgers remain unchanged.
