# R73 — dietary fibre claims and the dextrin conflict

Reviewed 17 November 2026. Six numerical reference thresholds agree with the original December 2022 Claims amendment and the R12 data. The dextrin-specific source conflict remains open. All 137 product-specific CTR decisions remain open.

## Findings

The original 13 July 2016 notification, published 15 July, inserts FPSFA 2.11.8 through amendment 2(C), PDF page 5. Its high-source proviso prints both a lower and an upper bound: 3–6 g/100 g or 1.5–3 g/100 kcal. The older core note attributes this too broadly to former Packaging and Labelling rules. The provision is in the food-product standard itself; the same document contains a separate labelling amendment. R73 corrects this attribution in the displayed source review without silently declaring that the product-standard proviso was repealed.

The original 19 November 2018 Claims regulation, PDF page 28, already sets higher minimums for high/rich fibre claims. The 13 December 2022 amendment replaces Schedules I–III through clause 6; Schedule I row 14, PDF page 13, expressly distinguishes solids, liquids and energy:

| Basis | Source minimum | High/rich minimum |
|---|---:|---:|
| Fibre per 100 g solids | 3 g | 6 g |
| Fibre per 100 ml liquids | 1.5 g | 3 g |
| Fibre per 100 kcal | 1.5 g | 3 g |

These are alternatives, inclusive minimums, with no serving-size alternative in this row. Amendment 3(a) also replaces Claims regulation 5(3). Schedule I Note 1 directs health-supplement categories to their separate regulations. This review verifies the generic thresholds but does not establish an express repeal or reconciliation of FPSFA 2.11.8.

The 2020 amendment changes oil provisions and protein claim labels; August 2022 replaces the edible-oil schedule. Neither changes the fibre row. The scanned 5 July 2023 direction, uploaded 6 July, was visually checked: its extension concerns regulation 4(7) brand-name disclaimers only. It does not defer fibre thresholds.

## Implemented behavior

The dextrin product detail now displays the source conflict, a six-value comparison table and direct original-source links. Its optional arithmetic reference compares a selected basis against the relevant minimum. It rejects missing, negative and non-finite values, keeps mass, volume and energy separate, and never treats an ingredient dosage as measured fibre. A result below one threshold does not decide the untested alternative bases. Changing an input invalidates the previous displayed result.

No arithmetic result grants label, product or lot approval. Health-claim substantiation, finished-food test-method suitability, special-category provisions and the dextrin conflict require separate assessment. Core regulatory objects and their historical values are preserved; R73 is an explicit review overlay. The full review export retains these findings even when the visible case list is filtered.

## Source traceability

The JSON companion records seven downloaded PDF SHA-256 fingerprints, targeted pages and clauses. Selected pages were read as text; the 2016 proviso, 2022 table and scanned 2023 direction were also inspected as page images. Main-site notification URLs returned errors for some older documents; those originals were retrieved from FSSAI's official archive host.

- [2016 dextrin notification, page 5](https://www.fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Plant_Sterol_HFD_25_07_2016.pdf#page=5)
- [2018 Claims notification, page 28](https://www.fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Advertising_Claims_27_11_2018.pdf#page=28)
- [2020 amendment, page 5](https://stg-old.fssai.gov.in/upload/notifications/2020/10/5f86e06ba342fGazette_Notification_Claims_Edible_Oil_14_10_2020.pdf#page=5)
- [August 2022 amendment, page 4](https://stg-old.fssai.gov.in/upload/notifications/2022/09/63106ab314c26Gazette_Notification_Advertisement_01_09_2022.pdf#page=4)
- [December 2022 amendment, pages 10–13](https://stg-old.fssai.gov.in/upload/notifications/2022/12/63998e33c2ad6Gazette_Notification_Amendment_14_12_2022.pdf#page=13)
- [July 2023 direction](https://stg-old.fssai.gov.in/upload/advisories/2023/07/64a669e74d46edirection_Ads_06072023.pdf)
- [Claims compendium, page 9](https://www.fssai.gov.in/upload/uploadfiles/files/Compendium_Advertising_Claims_Regulations_14_12_2022.pdf#page=9), secondary comparison only.

The current official Claims amendment index lists the 2020, August 2022 and December 2022 amendments. Targeted searches did not establish a later reconciliation of the dextrin proviso; this is not an exhaustive current-law certification.

## Verification

`node scripts/verify-helper.cjs` includes threshold-boundary, invalid-input, source metadata and review-register checks. `node scripts/test-helper-browser.cjs` exercises the form, stale-result clearing, source links, export, mobile widths and all 533 product views. Exact execution outcomes are recorded in the draft PR and its CI artifacts; production remains unchanged.
