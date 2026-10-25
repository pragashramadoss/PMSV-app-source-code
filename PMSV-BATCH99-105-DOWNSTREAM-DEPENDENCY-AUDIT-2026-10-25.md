# PMSV Batch 99 — 105 dependent evidence-request audit

Date: 25 October 2026
Deployment: `gh-pages` preview only. This commit does not alter `main`, production WordPress, original source ledgers or actual compliance decisions.

## Purpose

Expose the **105 dependent requests** in the frozen 175-request, 35-case evidence ledger as a read-only auditable downstream review map. Each held commercial product case has exactly three dependent tasks (Regulatory/Legal, Laboratory, and independent QA). The other 70 preparation-ready evidence requests are untouched.

## Immutable reconciliation

| Measure | Verified count |
| --- | ---: |
| Catalogued products | 533 |
| Conditional source references | 498 |
| Public-source desk-research cases closed | 35/35 |
| Original evidence requests | 175 |
| Preparation-ready originals | 70 |
| Held downstream originals | 105 |
| Downstream Regulatory/Legal | 35 |
| Downstream Laboratory | 35 |
| Downstream independent QA | 35 |
| Authenticated manufacturer commercial source packets | 0 confirmed |
| Signed commercial legal/method determinations | 0 confirmed |
| Representative-lot PASS or authorized product release | 0 confirmed |

The desk-research closure is not commercial approval. All 35 commercial dispositions remain **HELD**; all 175 original requests remain `NOT_SENT`, with original document states `NOT_RECEIVED`.

## Downstream handoff gates

1. **Regulatory/Legal:** manufacturer controlled-source reference/version/date/hash/issuer-origin metadata; locally recorded handoff draft is not a signed decision. Independent legal reviewer must authenticate originals and verify current applicable FSSAI article, category, limit, units and basis.
2. **Laboratory:** current commercial matrix and method-source controlled-original metadata; separately authenticate operative test method, number/version, exact accredited method/matrix/range, relevant LOQ and sampling. Local draft or dispatch report is not technical signoff.
3. **Independent QA:** actual signed legal applicability, accredited laboratory technical fit, representative-lot certificate/report and authorized QA decision. This panel has no mechanism to approve, pass or release.

Batch98 locally maintained source metadata are expressly **self-reported, not authenticated**. Batch99 takes them only as conditional workflow inputs. If Batch98 detects a controlled-source revision change, the Regulatory and Laboratory handoff blockers become `SOURCE_REVISION_RESET_REVIEW_REQUIRED`; previous packets are considered stale. No external evidence is collected, transmitted or adjudicated by this preview.

## Verification

New JavaScript module: `fssai-product-helper-preview-01/pmsv-batch99-downstream-evidence-dependency-audit-2026-10-25.js`.

Node test: `tests/pmsv-batch99-downstream-audit.test.cjs` validates all 105 original IDs and role distributions, immutable source states, empty-approval invariant, draft vs authentication distinction, source-revision reset behavior, 106-line full CSV and fail-closed source tamper handling.

CI: `.github/workflows/verify-pmsv-batch99-downstream-audit.yml` runs on `gh-pages` changes.

The interface offers role/priority/search filters, exact original request detail, link to Batch98 controlled-source case, and local CSV output. Export reflects the current filter and remains informational only.

Preview: https://pragashramadoss.github.io/PMSV-app-source-code/fssai-product-helper-preview-01/
