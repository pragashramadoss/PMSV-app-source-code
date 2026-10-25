# PMSV Batch 101 — Reviewer access and evidence-loader resilience

Date: 25 October 2026
Deployment: `gh-pages` preview only. No changes to `main`, WordPress, original regulatory references or evidence dispositions.

## Observed live problem

Batch100 source-bound review functionality passed Node checks and the GitHub Pages deploy, and the actual Batch100 panel exists in the live DOM. However, a live browser check showed that both the Batch99 audit and Batch100 exception register were nested beneath the closed **Batch70 extended-research** details element, so their summary controls were initially invisible. An attempted Batch100 source load also spent an extended period on `Verifying…` in the remote test browser without a conclusive interactive result. This does **not** prove the product app fails for every user; it identifies discoverability and loading-feedback problems worth correcting.

## Changes

1. Move the **Batch99 downstream 105-request audit** panel to the top-level Product Standard section immediately after the Batch70 details element, rather than inside it.
2. Batch100 remains immediately after Batch99 and is therefore also accessible without opening the Batch70 details element.
3. The underlying Batch98 controlled-source entry panel and original research UI are untouched.
4. Both Batch99 and Batch100 now display explicit progress text while optional extended FSSAI research data load. The status reflects the existing Batch70 source loader; it is descriptive, **not** a claim that a legal or source approval has been obtained.
5. Both modules suppress duplicate concurrent load attempts and re-enable retry after failed upstream verification. Failed or incomplete source checks continue to block local issue entry/export.
6. No change is made to the commercial evidence ledger, source hashes, role separation, accepted issue states or export formats.

## Verification

The new `tests/pmsv-batch101-reviewer-navigation.test.cjs` creates a minimal DOM model to check that Batch99 and Batch100 insert as Product Standard siblings outside collapsed Batch70, that Batch100 still loads exactly once through Batch99, and that overlapping loads are refused while failed prerequisites can be retried. The workflow also runs existing Batch99 and Batch100 original-source/hold/revision controls.

The model remains: 533 catalogued products, 35/35 public-source desk reviews closed, 175 original evidence requests NOT_SENT/NOT_RECEIVED, 105 dependent reviews HELD. **0 of 35 commercial regulatory/lab/lot approvals or releases are verified.**

Files updated: Batch99 JavaScript, Batch100 JavaScript.
Files added: Batch101 test, workflow, report.
The large preview HTML and `main` branch remain untouched.

Preview: https://pragashramadoss.github.io/PMSV-app-source-code/fssai-product-helper-preview-01/#standard
