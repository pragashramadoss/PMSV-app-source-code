# PMSV Batch81 — original evidence continuity + CI stabilization (19 October 2026)

**Destination:** `gh-pages`, isolated FSSAI research preview. **No** changes to `main`, WordPress production, original regulatory source files, commercial evidence receipts, approved limits or laboratory data.

## Corrections
- Repair Batch59 and Batch61 browser tests after the Batch80 opt-in loading migration by removing the duplicate second request; original source-chain integrity remains checked.
- Repair Batch60's obsolete *source-code text pattern* assertion for the Batch59 ancestry accessor. Verify runtime getter output, all 35 inherited cases, 15 non-binding comparator references, and zero signed limits.
- Return defensive copies of nested `reference` metadata from Batch59 `getAllCases`, not just cloned outer records and request-ID arrays. Added browser mutation-isolation assertions. Preventing consumers from altering source state is not a regulatory approval.

## New fast consolidated CI gate
A dependency-free Node verifier covers the pinned dataset hashes and exact cross-batch ancestry:

| Invariant | Required |
| --- | ---: |
| Catalogue / conditional first-source entries | 533 / 498 |
| Still-held original cases | 35 |
| P0 original-source briefs / original documentary IDs | 13 / 65 |
| P1 detailed cases / original documentary IDs | 22 / 110 |
| Total unique original immutable evidence IDs | 175 |
| Batch59 other-article reference comparators | 15, non-transferable |
| Batch60 remaining legal-source routing cases | 20, research-only |
| Automatic case legal signoffs, method signoffs, CoAs, lot releases | **0** |

No owner requests are transmitted; source discussions and historical comparators are not numeric regulatory approvals. The 1 December 2026 original Gazette commencement boundary remains explicitly *future*, as of this October 2026 snapshot. Review later regulatory changes separately.

## Verification scope
The new `verify-pmsv-batch81-original-evidence.yml` fast workflow checks all original ID lineages in seconds without Chromium; old Playwright suites remain responsible for actual UI and CSV checks. The CI result must be observed after pushing.
