# PMSV Batch 114 — Direct validation callers, mutation safety and current 35-case status

**27 October 2026** · `gh-pages` standalone FSSAI Helper preview · instrumentation and test-only change.

## Practical answer: are the 35 finished?

The **publicly available source-research dossiers and preliminary legal/testing scope for all 35 product categories are complete**. This is distinct from authenticated marketed-product approval. **None of the 35 commercial contaminant cases is approved or released.**

| Current verified source/approval state | Count |
| --- | ---: |
| Catalogue | 533 |
| Conditional source-reference matches | 498 |
| Remaining public-source research dossiers complete | 35/35 |
| Product-specific cases still held | 35 |
| P0 / P1 cases | 13 / 22 |
| Original evidence requests | 175 |
| First independent requests that can be prepared | 70 |
| Downstream dependent gates | 105 |
| Actual named accountable people / agreed dates in the original owner plan | 0 / 0 |
| Original request transmissions / authenticated document receipts recorded | 0 / 0 |
| Signed applicable legal CTR approvals / laboratory method-matrix approvals / tested-lot PASS | 0 / 0 / 0 |

**Required external next action:** route the 35 marketed-product/controlled identity proof requests to the appropriate **manufacturer or supplier QA**, and the 35 original method-source/version adoption requests to the relevant **FSSAI method/source authority and laboratory technical contact**. These are distinct original gates; no case is released by sending a letter. Actual recipient identities must be verified; no email dispatch occurred. The other 105 regulatory, laboratory and independent QA dependencies stay pending until validated upstream evidence exists.

- [Existing 70 unsent original request export](PMSV-BATCH95-70-IMMEDIATE-UNSENT-EVIDENCE-REQUESTS-2026-10-20.csv)
- [35-case case-by-case owner plan](FSSAI-CURRENT35-BATCH55-UNIFIED-175-GATE-OWNER-PLAN-2026-10-16.md)
- [Independent per-request follow-up procedure](PMSV-BATCH97-70-FIRST-ACTION-FOLLOWUP-2026-10-25.md)

The seven cases requiring the **actual named material** first are nonstandardized polyols, Sajji Khar, grouped Appendix-A additives, grouped nutraceutical VA–VF additives, enzymes, Schedule IV/VI/VIII ingredients and functional premixes. The remaining 28 cases also require actual marketed article identity for case-specific applicability. Published FSSAI citations or research conclusions are **not** equivalent to a signed limit, lab result or lot release.

## Browser diagnostic and tampering result

Batch114 intercepted only the response to `fssai-source-proof-panels.js` during a **real 390px Chromium mobile startup**. It wrapped `pmsvReviewSnapshotDigest` to count callers and collect one JavaScript call stack for every seventh digest inquiry. **The original digest ran on every invocation.** No memoization or bypass of any validator was introduced.

| Measured result | Outcome |
| --- | --- |
| Core and displayed startup state | `READY` |
| Direct digest calls during startup | **13,871** |
| Sampled stacks | **1,981 (one per seven)** |
| Open case controls visible | **35** |
| Extended research auto-triggered | **No: `NOT_REQUESTED`** |
| Product releases | **0** |
| Exact ledger clone passed before mutation | PASS |
| Same-turn unauthorized product-name edit changed digest | PASS |
| Same-turn modified record rejected by full integrity guard | PASS |
| Restored exact record passed again | PASS |
| App source changed | **No** |

Observed recurring direct callers (sampled traces) are the historical `pmsv2026FirstSourceValid` → `pmsv2026GolakaFirstSourceValid` → `pmsv2026Current112Valid` / `pmsv2026Current422Valid` / `pmsv2026Current423Valid` chains and the 428, 437, 438, 442 and 444 validators. The highest sampled parent sites were `pmsv444Valid` (196 samples), `pmsv442Valid` (189), `pmsv2026Current428Valid` (154), `pmsv2026Current438Valid` (151), and `pmsv2026Current437Valid` (145). Every-seventh deterministic sampling can alias repeated call patterns, so these are **hotspot leads**, not exact call-frequency shares.

**Safety decision:** do not add a global object-identity or microtask cache. The same-turn mutation test demonstrates why a second integrity check must see the current bytes. A prospective optimization must be scoped to a proven pure validation operation with no intervening source mutation or async boundary, followed by adversarial mutation regression and same-runner mobile A/B improvement.

## Verification / change boundary

- [Batch114 browser trace and same-turn mutation result](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40463764222) — SUCCESS.
- [GitHub Pages preview deployment](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40463762651) — SUCCESS.
- [Full FSSAI verification workflow](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/40463764003) — check final run status in Actions.

Files changed in the Batch114 engineering commit:
- `tests/pmsv-batch114-digest-callsites.test.cjs` (read-only Chromium instrumentation, same-turn mutation test).
- `.github/workflows/profile-pmsv-batch114-digest-callsites.yml` (isolated testing).

No commercial documents were obtained, no outreach was sent, no legal FSSAI numeric rule was altered, and no `main`, WordPress production, app runtime, current 35 case status or supplier data was changed.
