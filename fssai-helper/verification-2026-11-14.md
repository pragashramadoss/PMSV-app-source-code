# PMSV FSSAI Helper verification — 14 November 2026

## Result

Overall verification is **incomplete**. The current audit-script suite passes, but the wider historical preview suite contains unresolved failures and complete current-law reconciliation has not been established for all catalogue products. This update must stay on draft PR #2; it does not authorize a production deployment or any change to a product limit.

## Implemented fixes

- The Helper now exposes the existing R45–R68 focused source reviews in its product detail and a searchable review-progress view. Counts are generated from canonical IDs, not incremented by hand: **533** catalogue identities, **137** open CTR article decisions, **67** identities covered by the selected focused rounds and **70** outside those rounds. Earlier broader reviews remain available; “outside selected rounds” does not mean never researched.
- An unavailable or duplicated full catalogue now stops product lookup/export. The cached 123-row subset is no longer presented as a usable replacement for the 533-product catalogue.
- R50, R66, R67 and R68 now handle malformed input without throwing or accepting a truthy non-boolean evidence flag. No legal interpretation, numerical threshold, source master or release decision was changed by these fixes.
- Malformed URL fragments no longer abort startup. Review status exports preserve all 137 cases even under an active display filter.
- Source-text verification and commercial lot assessment are explicitly separated. **A laboratory report is not required to verify the wording of a regulation.** Actual SKU/formulation/lot evidence remains necessary where a product-specific application or release decision requires it.

## Verification evidence

| Check | Observed result |
|---|---|
| Existing remote checks at `ad13bc4a47c084df280e25ad7594c13aa710ad5d` | 33 workflow runs succeeded, including R66–R68 |
| Current audit scripts before fixes | 44/44 passed locally |
| Current consolidated checks after fixes | 46/46 passed locally (44 existing, one new integrity suite, one generated-register check) |
| Historical `tests/*.test.cjs` suite before fixes | 1,237 reported tests: 1,110 passed, 127 failed |
| Historical failure classification | 76 failed entries in browser test files; 51 other failures. These are not declared resolved or all environmental. |
| Current browser verification | Pending the new CI workflow at the time of this checkpoint; update after observing its result. |

Local Chromium could not start in this execution environment; an isolated GitHub Actions browser job was added instead. It exercises all 533 product detail views, the 137-case queue, filtered/full exports, malformed fragments, missing/duplicate catalogue rejection and six views at 320/390/1440 px. A successful browser job will not constitute a native Android/PWA push-notification test.

Run current checks with `node scripts/verify-helper.cjs`. The separate historical test suite is not silently included in that passing count. Do not remove failed assertions or refresh source fingerprints merely to obtain a green overall result; reconcile their intended source version and meaning first.

## Official-source currency check

- [May 2026 CTR Gazette](https://fssai.gov.in/upload/uploadfiles/files/272840.pdf): clause 1(2) states commencement on **1 December 2026**. Rechecked on 14 November; it is still a future commencement on that review date. This does not determine each product’s amended article.
- [FSSAI notifications](https://www.fssai.gov.in/food-law/notifications): the official listing includes a **6 November 2026** Labelling and Display Second Amendment concerning milk-logo graphics. The original notification text and commencement were not successfully retrieved in this check. No dimensions or effective date were inferred from the earlier draft or an older FAQ.
- [FPSFA amendment index](https://fssai.gov.in/food-law/regulations/amendments/food-products-standards) and [CTR amendment index](https://fssai.gov.in/food-law/regulations/amendments/contaminants-toxins) were searched. Index retrieval is not a full original-Gazette reconciliation.

## Work still required for full verification

1. Resolve the historical source/integrity and numeric-baseline failures against the applicable editions, preserving real regression checks.
2. Finish semantic review for the 70 cases outside the selected focused rounds, then reconcile all 137 exact CTR article decisions; those 137 are not the entire all-533 legal-completeness workload.
3. Complete original-Gazette/amendment, method, microbiology, additives, packaging, labelling and claim reconciliation as applicable across the catalogue. The 14 Ayurveda raw-ingredient source gaps remain open.
4. Retrieve and assess the new milk-logo notification. Do not treat absence from an amendment index as proof that a listed notification does not apply.
5. Perform native Android/PWA and production integration checks before any release. Production WordPress plugin v1.0.23 was observed active, but no production files, numerical rules or approvals were changed in this session.

No new product was declared legally verified and no batch was released.
