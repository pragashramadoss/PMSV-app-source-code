# PMSV R9 — fruit and vegetable products — 3 November 2026

## Scope and actual results

54 previously unreviewed catalogue records are covered in this continuation. All earlier 325 scoped reviews are retained, giving **379 distinct scoped reviews out of 533**, with **154 records remaining outside detailed review**. This is not 379 complete current-law confirmations. No new full-product or commercial-lot approval was issued.

| Measure | Result |
|---|---:|
| Additional catalogue records | 54 |
| Standard objects examined | 37 |
| Requirement records | 404 |
| Numerical records within that total | 337 |
| Fruit-juice table entries within those requirements | 72 |
| Primary Appendix B sampling plans checked | 63 |
| Additional liquid-form variants | 31 |
| Numerical sampling plans changed | 0 |
| New conditional microbiology candidate sets | 24 |
| Incorrect inherited microbiology exclusions removed | 1 |
| Current records with explicit source questions | 13 |
| Cumulative scoped records | 379 / 533 |
| New full-product approvals | 0 |

This batch covers Chapter 2.3 clauses 1–33 (including 3A, excluding absent 32), plus 40–43. The remaining 45 fruit/vegetable records are not counted as reviewed here. Fruit-table entries and microbial criteria are not additional catalogue products.

## Substantive findings and controls

1. **Fruit-juice table restored:** 72 named/combined/other-fruit entries, with separate soluble-solids and acidity values. Lime and lemon acidity are minima, unlike most rows; apple acidity is expressed as malic acid. Coconut water is not coconut milk, and the tomato row is not the thermally processed tomato-juice standard.
2. **Misapplied Listeria exclusion removed:** the stored vegetable-juice route inherited a low-pH exclusion from the fruit-juice footnote. Appendix B footnote 4 names carbonated fruit beverages and pasteurized fruit juices. The vegetable-juice route now retains the full criterion unless another exact applicable provision is established.
3. **Scope and denominators made explicit:** reducing sugar is compared as a percentage of total sugar; container-fill temperature and the stated glass-capacity adjustment are retained; canned-tomato chloride correction uses dry matter; vinegar-pickle acidity concerns the packing medium. Powder, reconstituted drink, packing medium and whole product are distinct matrices.
4. **Concentrate baseline is not arbitrary:** supported original fruit-juice calculations use the prescribed clause 2.3.6 table. Vegetable and pulp/puree baselines are not guessed. The direct ratio rows remain blocked without the exact baseline.
5. **Reduced-sugar and other variant rules:** the ordinary jam/jelly TSS minima do not replace the specific reduced-sugar provision. Carbonated lime/lemon wording that overlaps another naming threshold remains a source question instead of an invented exclusive upper bound.
6. **Complete microbiological plans:** all 63 primary plans and 31 liquid variants match the independently transcribed source numbers. Retort pre-test incubation requires both 37 C/10 days and 55 C/7 days. Low pH is not a blanket exemption; existing results cannot be discarded by requesting one. Process-hygiene checks are not market-release criteria.
7. **New routes are conditional:** 24 previously missing category candidate sets were added, each requiring actual matrix, preservation process and liquid/non-liquid form. No exact category is assigned automatically. Two synthetic-syrup entries are not assigned fruit-product microbiology merely because they occur in Chapter 2.3.

Some values and exceptions were already stored correctly; R9 distinguishes restored detail, corrected applicability and independently rechecked values rather than calling every row a new error.

## Primary evidence

Chapter 2.3, Version 2 (04.11.2024), 106 pages:
https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf
SHA-256: `1e82574ab21d28aab9ea6a1ce083113e0a0fb0c9f775e0ce5d4506d98a8cc6cd`.
Selected clauses use PDF pages 1–39 and 53–57; numerical tables were examined as page images and text, without OCR.

Appendix B, Version 2 (04.11.2024), Table 4 and accompanying definitions/notes, PDF pages 30–39:
https://www.fssai.gov.in/upload/uploadfiles/files/Appendix%20B%281%29.pdf
SHA-256: `4b2f41ec2763a9191b4a14aaa12918c8bd3a82b41022ced1e415b05e44812bc7`.
The captured PDF bytes date from 2 November and were rechecked on 3 November; they are not represented as newly downloaded original notifications.

Targeted original-source checks:

- The 21 October 2024 final amendment, PDF pages 24 and 26, omits copper from the pickle-standard wording from **1 May 2025**. This does not waive separate contaminant obligations. The baseline already contained the omission; the original commencement was rechecked.
  https://www.fssai.gov.in/upload/uploadfiles/files/GAZETTE%20NOTIFICATION%20DATED%2021_10_2024_ammendments.pdf
- The 17 November 2017 notification, PDF page 10, confirms the unusual printed tomato-juice values of 10.0% maximum titratable acidity and 42.0% maximum sugar. Neither was silently decimal-corrected. A later retrieval retry timed out after the relevant original page had already been inspected.
  https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Fruits_Vegetables_28_11_2017.pdf
- The 12 June 2026 order withdrawing fruit-content method 2.11 in the named Fruit and Vegetable Products manual was rechecked. No replacement identifier was invented; the order's validated-method route remains separate.
  https://www.fssai.gov.in/upload/advisories/2026/06/6a2bc69152297Fruit%20Content%20Order.pdf

Only the two captured compendium PDFs have local bytes/hashes in the package. No local hash is asserted for the three original-notification/direction documents inspected through official web text/page images. These checks do not constitute a complete current-amendment reconciliation.

## Tests and actual integration

- **6,539** structural/preservation/traceability assertions passed.
- **23,250** numerical, variant, matrix, denominator and microbiological assertions passed. Repeated assertions include ensuring that no comparison grants product approval, current-law completion or release.
- **53** browser assertions passed; all 533 actual product details rendered.
- **3,243** core application/replay integrity checks passed.
- **338** core/offline table and route comparisons passed.
- All **3** final downloaded repository files matched local expected bytes.

Filters returned 54 current, 13 current questions, 379 cumulative, 325 earlier, 80 earlier dairy and 533 total. Export under an active display filter retained 533 unique IDs. All 479 products outside this continuation and earlier review registries were preserved. Browser checks used Chromium set_content at 1440/390/320 px, with no JavaScript errors or page-level overflow. Prior comparisons remained available. This is not native Android or live production testing.

The comparator tests exercised all 404 requirement rows and the 78 microbial rows having actual candidate owners in the current batch. No artificial product was invented for the other 16 microbial rows.

Core workflow **41574010943** succeeded; its correction commit was `c702db96bf52330f8688159d53a64a594aef8b9f`. A final locator check corrected one adjacent-page reference for reduced-sugar TSS from page 38 to page 37 without changing its value. Workflow **41574138508** succeeded, producing `273cfaf981253a288367d5e081c58ae1f310256f`; the replay script was corrected too. Final artifact **13203310179** was downloaded and compared locally.

Final repository hashes:

- Chapter 2.3: `03b90ee40a818064ea50946342ded18934ed0bc8c610b98412a5c64861adbd06`
- Appendix B: `e797945c0996cd54091e663b0377da6808420e9f514ea5b924190e6ebc9da3e7`
- Product master: `84f24ec89ae9265473caf1f1ee11ecdb8aa6dd8fd051d6e4064792f266d634f8`

Offline HTML SHA-256: `63b0dad5f133c2cc30181c384b2990276e499f7fa0747a844e25a8e799e0f100`.
Offline R9 registry SHA-256: `7e3b6df99c1c43eee24d746325fc6254cba6be0168e36bf59554f383825fd671`.

**Core repository changes are narrower than the full offline review.** The 404-row registry, 94-row microbiology register, expanded chapter module, comparison guard and combined viewer are packaged companions and are not fully integrated into the live decision engine. PR #2 remains draft/unmerged; production gh-pages has not been changed by R9.

## Remaining work

The 13 current question-bearing records concern the combined fruit-juice identity, six concentrate identities, fruit syrup, carbonated fruit beverages, tamarind and three pickle identities. Questions remain visible rather than being cleared to increase a confirmed count.

The 154 not-yet-detailed records comprise 45 fruit/vegetable, 58 special/unassigned routes, 27 alcoholic beverages, 11 infant nutrition, 7 other-food products, 3 hemp, 2 Chapter 3 substances and one children's cereal-supplement identity. These are work-queue counts, not compliance determinations.

Complete original-notification/current-amendment reconciliation, contaminants/residues, additives, processing aids, adopted methods, packaging, labelling and claims remain open. Laboratory batch reports are not required just to verify regulatory wording; commercial release is a different authorized assessment.
