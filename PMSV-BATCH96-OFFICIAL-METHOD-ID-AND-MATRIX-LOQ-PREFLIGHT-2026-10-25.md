# PMSV Batch96 — FSSAI method identifier and analytical sensitivity preflight

**25 October 2026. Preview only.** The 533-product catalogue and 35 completed public-source dossiers stay unchanged. There are **27 metal-analyte cases** (24 Lead; Copper, Chromium and Nickel 1 each) and **8 nonmetal cases** within the original **35 HELD** products. Their **175 immutable requests** remain 70 preparatory + 105 upstream-dependent. Manufacturer/legal/method/CoA/QA approvals are still **0/35**.

## New original-source finding

The following two different documents are hosted on FSSAI's own domain:

1. [52-page Metals and Minerals manual](https://fssai.gov.in/upload/uploadfiles/files/Manual%20of%20Methods%20of%20Analysis%20of%20Foods-%20Metals%20and%20Minerals.pdf), listed with the [26 June 2024 notice seeking public comments](https://www.fssai.gov.in/food-law/notifications?notification=notice-for-comments). In this document, **FSSAI 09.001:2024** is a microwave-digestion **ICP-OES** multielement method. Its printed source-specific LOQ table gives **Lead 6 mg/kg, Copper 0.3 mg/kg, Chromium 5 mg/kg, Nickel 3 mg/kg**. It also contains food **ICP-MS** method **09.004:2024**, and water ICP-MS **09.003:2024**.
2. [61-page Trace Elements manual](https://fssai.gov.in/upload/uploadfiles/files/MANUAL_FOR_ANALYSIS_OF_METALS_dt_18_04_2024.pdf). Here **FSSAI 09.001:2024** means microwave digestion and **AAS** for Lead, Cadmium, Zinc, Copper and Iron, a different procedure. It warns that the method is **not applicable to food with fat ≥40% or milk powder**. Its **09.005:2024** is a food ICP-MS procedure.

Thus the **number alone is ambiguous** across the hosted PDFs. The two methods are not interchangeable and neither FSSAI-hosting nor scientific-panel approval by itself proves the final currently adopted procedure for a marketed commercial SKU. Obtain the relevant final adoption/supersession order and actual laboratory's accredited analyte/matrix/method scope.

Further technical caution: the 52-page 09.001 ICP-OES **Lead LOQ of 6 mg/kg is a method-table figure, not a legal permitted limit or guarantee of sensitivity for any actual laboratory**. A method's achieved LOQ must be sufficiently low relative to a *separately verified current legally applicable finished-product limit*. No numeric limit is transferred into the 35 PMSV cases by this review.

## UI change

File: fssai-product-helper-preview-01/pmsv-batch96-method-authority-preflight-2026-10-25.js

A new independent panel immediately after the Batch93 legal/lab review provides:

- FSSAI source document links with the different titles/IDs, and the consultation/adoption distinction.
- Source-verified **35-case**, **27 metals / 8 other analytes** search/filter, case-specific methodological caution and source-specific LOQ context.
- Downloadable **UNSENT** case-specific method-authority clarification draft for competent method/Lab/Regulatory review.
- Downloadable **HELD**, source-version-unverified filtered CSV; no numeric legal limits, lot PASS or release.
- If 533/35/175 source integrity, immutable request IDs, initial request state or count checks fail, **outputs fail closed**.

Read-only; no confidential file input, document upload, network sending, browser storage, external changes or automatic approval.

## Acceptance

Run: node tests/pmsv-batch96-method-authority-preflight.test.cjs

The test validates 35 immutable cases, 175 original request IDs, 27/8 analyte grouping, source-specific caution for metals, distinct nonmetals handling, no false approvals, and rejection of tampered document state and duplicate proof IDs. GitHub Actions workflow: .github/workflows/verify-pmsv-batch96-method-authority.yml.

**Still needed from actual commercial stakeholders:** signed manufacturer identity/formulation, final legally effective source and applicable food article, authenticated full method/adoption document, current NABL lab scope and demonstrated matrix LOQ, representative-lot CoA, independent QA decision. None is claimed to exist in this preview.

Only gh-pages changed; main and live WordPress production are unchanged.
