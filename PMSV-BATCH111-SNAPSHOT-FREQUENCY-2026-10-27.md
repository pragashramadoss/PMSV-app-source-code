# PMSV Batch 111 — Live snapshot-validation frequency

27 October 2026 | `gh-pages` preview only | **Measurement-only**.

## Why this batch

Batch110's same-runner A/B test showed the content-exact string cache improved mobile startup by 2.4% at normal CPU and 4.2% at 4× CPU throttling. Before considering less frequent integrity checks, Batch111 measured precisely how often the existing full-content validation happens during the **actual core startup**.

Instrumented in GitHub Actions on a 390px mobile Chromium viewport using request interception, without editing the delivered app scripts or regulatory data.

## Results

| Live core-startup metric | Normal CPU | 4× CPU slowdown |
| --- | ---: | ---: |
| Browser reaches READY | 14,184 ms | 59,719 ms |
| Ledger fingerprint inquiries | 720 | 720 |
| Ledger fingerprint time (instrumented) | 371 ms | 1,659 ms |
| 116-case worklist inquiries | 358 | 358 |
| Worklist fingerprint time (instrumented) | 141 ms | 595 ms |
| 32-branch fingerprint inquiries | 0 | 0 |
| Total inquiries | **1,078** | **1,078** |
| Total measured fingerprint-check time | **512 ms** | **2,254 ms** |
| Failed fingerprint checks before deliberate tamper | 0 | 0 |
| Commercial case controls visible | 35 | 35 |
| Product releases | 0 | 0 |

**Caution:** The benchmark instrumentation itself adds cost, and CI runner capacity varies. Do not compare these wall-clock times directly with Batch109/110 cold-start times or interpret the breakdown as complete browser CPU attribution. Batch110's previously observed 55.6% CPU share was recorded before its cache optimization. These numbers are explicitly **after** Batch110's cache and are not contradictory.

At cold core startup, the 32 conditional branch database is not queried for fingerprints; this does not imply those branches are approved or unnecessary during later reviews.

## Safety regression

- Both runs reported `READY` in the application core state and visible UI.
- The optional extended research remained `NOT_REQUESTED`.
- A **separate fresh** inquiry after startup incremented the ledger check counter once.
- A cloned ledger with an altered product name was rejected in both runs.
- Existing Batch110 exact-content cache, original 681-record historical snapshot, and Batch108 startup display suites passed.
- Original data, source hashes, FSSAI rules, local review drafts, owner communications and release states are untouched.

[Batch111 benchmark workflow and complete logs](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40456897793).

## Technical judgment and next direction

The ledger is verified 720 times and the worklist 358 times; there is repeated work. But with Batch110's content-exact cache, their measured total is a relatively small share of startup. Therefore **do not weaken per-inquiry source validation** for an unproven marginal speed win.

For Batch112, rerun V8 CPU profiling *after* the content-exact cache and identify the new dominant function(s) before applying a change. Use a controlled same-runner comparison for any performance claim. All later independent review actions must revalidate their live content, including in-place modifications.

## Regulatory boundary unchanged

533 products; 498 conditional first-source references; 35 commercial cases **HELD**; 175 original evidence requests **NOT_SENT/NOT_RECEIVED**; 105 downstream dependencies **HELD**; zero legal-limit signoffs, laboratory lot approvals or product releases. No authority has been inferred from test success.
