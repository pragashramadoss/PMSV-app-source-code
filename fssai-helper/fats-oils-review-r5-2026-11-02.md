# PMSV R5 — fats, oils and spreads — 2 November 2026

## Completed scope

This continuation reviews all 18 catalogue records using the Chapter 2.2 fats/oils module. The earlier 142 scoped reviews are preserved, giving **160 of 533** catalogue records with detailed source-edition reviews. This is not 160 complete current-law confirmations. No product or commercial lot approval is granted.

| Scope | Count |
|---|---:|
| Additional catalogue records | 18 |
| Product-specific standard sections | 17 |
| Shared sections (fatty acids, peroxide, two PRS provisions) | 4 |
| Total normalized requirement records | 377 |
| Numerical/formula records, including conditional variants | 343 |
| Fatty-acid table cells within that total | 127 |
| Selected fatty-acid profiles | 6 |
| Crude-oil table variants | 12 |
| Current records with source-reconciliation questions | 3 |
| Full-product approvals issued | 0 |

The records include five refined-oil catalogue identities, Moringa oil, three margarine/spread identities, peanut butter, crude oils, interesterified fat, Vanaspati, shortening and four soybean-name aliases representing two hydrogenated-soy standards. Alias IDs are retained; they are not four different underlying soybean standards.

## What changed

1. The five refined-oil profiles already named their source standards. The prior review did not expose the detailed inherited requirements, and some source objects were placeholders. The review now shows general refined-oil rules alongside exact oil-specific identity checks. Only the source acid-value ceiling is displaced by the refined-oil acid-value provision.
2. Ordinary domestic safflower, imported ordinary safflower and high-oleic safflower are selectable scopes. The grouped product name does not establish a high-oleic identity.
3. Interesterified-fat, Vanaspati and shortening requirements are no longer merely identity references in the review. Moisture, trans fat, unsaponifiables, vitamin A, nickel where stated, Baudouin preparation and aeration conditions are explicit.
4. BR/refractive index and FFA/acid value are retained as the source's OR alternatives. A favourable test cannot be selected while ignoring a contradictory supplied result.
5. Table-margarine vitamin A is per gram of product at sale; bakery-margarine conditions under the separated-fat heading keep that basis. Fat-spread salt is on the aqueous phase; vegetable-only provisions are not imposed on milk-fat spread.
6. Fatty-acid limits retain the total-fatty-acid chromatographic basis. ND is <=0.05%; a dash is not a zero limit. Raw-soy profiles are not transferred to hydrogenated soy.
7. All 12 crude-oil rows remain intermediates, not direct-human-consumption products. Olive-pomace refractive index is at 20°C; the other table rows are at 40°C. Crude flash-point minima are not replaced with refined-oil minima.
8. Conditional rice-bran exceptions require the stated proportion and declaration/evidence. The physical-refining oryzanol formula is not extrapolated below 20% or interpolated between the source's 5%-steps.

## Official sources and targeted amendment checks

Chapter 2.2, Version 5 (01.08.2025), 57 pages:
https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_2_Fats_oils%20and%20fat%20emulsions.pdf
SHA-256: `07dc7cea2d78cd6fef5307c58b0553a554f05a593c8dab4912fe61ad2e0ee2d9`.
Relevant numerical tables were read as page images as well as text. One page-image timeout was resolved using the locally captured PDF render; no OCR was used.

Final PRS amendment notified 23 May 2026:
https://www.fssai.gov.in/upload/uploadfiles/files/prohibition_final.pdf
The amendment omits PRS 2.3.14(8). Its printed Gazette date is 27 May 2026 and its digital identifier is CG-DL-E-02062026-273066; commencement is publication in the Official Gazette. It is operative by the November review date. It does not itself remove the separate Vanaspati 10% sal-seed composition provision.

Final PRS first amendment notified 17 October 2024:
https://fssai.gov.in/upload/uploadfiles/files/FSS_Prohibition%20restriction%20on%20sales_First%20Amendment%20Reg%202024.pdf
The AGMARK wording is omitted from PRS 2.3.14(11)/(13). Chapter 2.2 still carries AGMARK wording in its spread provisions. That cross-regulation reconciliation is explicitly flagged, not converted into a blanket certification conclusion.

PRS Version XI (02.04.2025), pages 1, 6 and 7:
https://www.fssai.gov.in/upload/uploadfiles/files/Comp_Prohibition%20and%20Restrcition%20of%20sales%20XI_01042025.pdf
The industrial trans-fat denominator is total oils/fats present in the food, not whole-food mass; natural dairy/meat/fish trans fats are excluded by the PRS definition. The residual-hexane scope is retained separately.

The additional PRS documents were inspected through official-source text/page images. Local direct download was unavailable, so their bytes/hashes are not claimed in the downloadable package. The local package does contain the captured Chapter 2.2 PDF. The May 2026 minor-seed-oils/edible-seeds proposal was identified as a draft and not applied as final limits.

## Actual tests and repository application

Local results: **1,977 structural/preservation checks**, **2,477 numerical-boundary/condition checks**, and **34 browser checks**, all passed. Every actual product detail was rendered; all-533 export under an active filter, previous cereal comparisons and previous microbiological-plan comparisons were retained. Widths 1440, 390 and 320 px were checked with no JavaScript errors or page-level overflow.

Browser testing used Chromium set_content with the actual offline HTML, not a native Android app or live deployment.

Repository workflow `41485085453` succeeded. It applied the readable, preimage-checked script only on `audit/all-533-2026-11-02`, ran **2,462** repository guard assertions, preserved the product master, and committed the generated module as `88c1ced2c39f23a266f9714e6472152c211a4404`. Artifact `13160463854` was downloaded and independently compared locally.

All comparison-relevant fields of all 377 rows match the locally tested registry, as do all 18 product-route lists and fixed contexts. Descriptive prose/schema are not claimed to be byte-identical.
Semantic SHA-256: `3867320a2ee5c3176ff873253dcd3d9f5ce4624e6f60419b67e2af816d6846d3`.
Repository module SHA-256: `5323d3dc02dcefcf2fe45b93896123a2cca07521fb6d844ca0ee967df4461495`.

## Remaining scope and deployment

The three source-question records are fat spread, Vanaspati and bakery shortening. The detailed prior review questions remain intact. Complete original-notification/amendment reconciliation, contaminants/residues, additives, processing aids, microbiology where applicable, validated methods, packaging, labelling and claims remain incomplete.

A laboratory batch report is not required just to verify source wording. Commercial release is a different authorized decision. No original source-status/release lock has been promoted to full approval. The standalone guards are review controls and are not wired into the live decision engine. PR #2 remains draft and unmerged; production gh-pages was not changed by this continuation.
