# PMSV: all-533 evidence review — 2 November 2026

## Result and scope

The actual 533-product production catalogue was included, not the earlier 123-product review subset and not a synthetic fixture. All profile and stored rule/category-route links resolve. This is a complete catalogue-coverage and source-evidence audit, **not a completed legal verification of every requirement for every product**. No new full-product verification or commercial release approval has been issued.

Production base: `c9336325770dff63169860664634f91a550b8d6e` (`gh-pages`). Audit branch: `audit/all-533-2026-11-02`.

## Actual dataset results

| Check | Result |
|---|---:|
| Catalogue records / unique stable IDs | 533 / 533 |
| Product-to-profile links resolved | 533 |
| Products linked to stored standard objects | 475 |
| Products resolved through special/category routes | 58 |
| Unique stored standard objects used by the 475 records | 338 |
| Special-route records with an existing explicit Chapter 3 identity/purity standard additionally exposed | 18 |
| Broken profile/rule/category-route links found | 0 |
| Products with a related primary PDF captured | 533 |
| Distinct captured official PDF hashes | 44 |
| Stored numeric parameter records exposed across products | 2,276 |
| Products with core Appendix-B routes attached | 270 |
| Products with core contaminant profiles/article aliases attached | 170 |
| Reversed explicit min/max intervals or invalid core microbiological n/c/m/M relationships found | 0 |
| Separately verified primary-source findings | 7 |
| Products newly confirmed fully legally verified | 0 |

A related PDF is sometimes a whole chapter or a category/licensing order. It is not necessarily a complete product-specific standard. Numerical token presence is only triage, not semantic verification. Core microbiology/contaminant counts do not describe total legal coverage; conditional and special modules may also apply. A missing direct core mapping is not an exemption.

The 498 legacy partial-source and 35 first-exact-pending classifications are preserved. They must not be presented as 498 fully verified products or 35 remaining legal checks. Original commercial release fields are also preserved. Regulatory source verification does not require a commercial batch report; commercial lot release is a different decision.

## Verified primary-source findings

See `verified-source-directions-2026-11-02.json` for official URLs, inspected pages, dates and qualified findings:

1. Actual Contaminants Version IX document authenticated for this capture, resolving the previous VIII/IX retrieval discrepancy.
2. The May 2026 contaminant amendment expressly commences on **1 December 2026**, not on the 2 November review date. The existing batch47 date was already correct and has not been overwritten by an unrelated January 2027 control.
3. Coffee–chicory direction dated **21 July 2026** (website listing 22 July) keeps the earlier notification in abeyance and specifies **1 July 2027** for the revised declaration. Its minimum font heights are scoped to the stated PDP condition.
4. The fruit-content method **2.11** in the named Fruit and Vegetable Products manual was withdrawn immediately on **12 June 2026**. No automatic substitute method number is assigned; unrelated methods numbered 2.11 are not blocked.
5. The final Pan Masala packaging amendment is effective from Gazette publication, **10 August 2026**. Its restrictions are product-specific.
6. The meat-sausage direction grants six months from **1 May 2026**; it is not an indefinite extension into November. Current continuation status still requires a later-direction check. No later extension was located in the searched official results; this is not proof that none exists.
7. The **15 March 2024** edible-seed order provides licensing categories and states that no specific product standard had then been prescribed. It must not be turned into an invented numeric standard or treated as proof that a later draft is operative.

## Tested controls and review companion

The standalone `regulatory-source-guards-2026-11-02.js` contains scoped date and withdrawn-method guards. It is **not yet wired into the live decision engine**.

The generated full-catalogue review companion contains all 533 real records, original rule objects, supplementary identity standards, source fingerprints, candidate source pages, core microbiology/contaminant routes, findings and open checks. It exports all 533 even with a filtered display. No external scripts, fonts or analytics are needed.

Test results on the actual production data:

- **1,612 structural/preservation assertions passed; 0 failed.** These include preservation of all original IDs/source/release fields and resolution of every attached direction flag.
- **26 source-guard assertions passed; 0 failed.** These cover date boundaries, method/manual scope, invalid inputs and absence of automatic approval.
- **26 desktop/mobile/browser assertions passed; 0 failed.** Every product detail was rendered. Filters, final catalogue entry search and full export were tested. Widths 1440, 390 and 320 px were checked; a 320-px select overflow was corrected. No JavaScript errors were observed.
- Browser tests loaded the exact HTML content into Chromium with Playwright `set_content`, because managed-browser policy blocked `file://` navigation. This is not a native Android-app or end-to-end production-release test.

Final standalone HTML SHA-256: `1eea871bceaf97eb871a87d350ab8aa61532617795e14625fae6e763389156f7`.
Final evidence JSON SHA-256: `ebd986354f20dc0427bc3928c1771ccd2004f92ade98614629890656c808a589`.

## Acquisition provenance

- Production Pages snapshot: workflow run `41454458964`, artifact `13145448033`.
- First official-source capture: workflow run `41459476602`, artifact `13148825644`.
- Missing-source recovery: workflow run `41460313336`, artifact `13149277380`.

The recovery workflow downloaded PDF bytes but its missing `pdftotext` executable caused some successful downloads to be labelled failed. Captured bytes were subsequently opened locally, hashed and compared with their recorded SHA-256. The original and reconciled manifests are retained separately in the evidence package; document acquisition and text extraction are not conflated.

## Not completed

Full semantic validation of every numeric value, unit, qualifier, product variant, sample plan, analyte/matrix mapping, analytical method, additive/processing-aid permission and relevant amendment has not been completed. Packaging, labelling, claims and special-regulation completeness also remain product-specific work. Candidate clause locators may hit cross-references and are deliberately not called verified readings.

No draft requirement was deliberately promoted to final law, no release flag was unlocked, and no production `gh-pages` file was changed by this audit branch. This report, the source-finding register and guards are review work, not a claim that all 533 products are ready for regulatory sign-off.
