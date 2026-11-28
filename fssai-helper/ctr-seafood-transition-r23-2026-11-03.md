# PMSV R23 — FSSAI seafood antibiotic amendment transition (3 November 2026)

## Corrected regulatory interpretation

**Version IX (03.02.2026), 2.3.2(1), PDF page 40** already specifies seafood Tetracycline **0.1**, Oxytetracycline **0.1**, Trimethoprim **0.05** and Oxolinic acid **0.3 mg/kg**. The **2026 final Gazette amendment (effective 1 December 2026)** omits that entire clause and inserts seafood Trimethoprim **0.05** and Oxolinic acid **0.3 mg/kg** into **2.3.2(4)**. Therefore the latter two concentrations were **already in the February compendium**; they are **not newly created numerical limits** effective 1 December.

Separately, the same Version IX **2.3.2(4), PDF p.42**, lists **Oxytetracycline for fish 0.2 mg/kg** and a **0.2 mg/kg group entry for named giant-prawn muscle** involving Tetracycline/Oxytetracycline/Chlortetracycline. The printed giant-prawn identity should be resolved against the original source. **Before 1 December, the old 0.1 and specified 0.2 articles can overlap.** No software routine may select the more favourable number automatically. After 1 December, the deletion of the broad 0.1 entries does not authorize 0.2 for all seafood.

**Official sources:**
- Current February compendium: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf (pp.40/42/50). Captured SHA-256 `8300ea34f1e88680ae4bbef52e0ec49331dbbfd1d5d6aa2612852bcb8779b26d`.
- Original amendment: https://www.fssai.gov.in/upload/uploadfiles/files/272840.pdf (English pp.4–6, future effective date and omission/insertions). Inspected as official PDF text and page images; no local Gazette byte hash is claimed.
- FSSAI MRL processing-study guidance: https://www.fssai.gov.in/upload/uploadfiles/files/Guidance_Document_SOP_MRL_16_03_2022.pdf (technical guidance only; no automatic converted legal MRL).

## Scope

The existing **31-product** December amendment watch and all **533 unique PMSV catalogue identities** are preserved. Of the 31, **22** are seafood identities; the other **9** cover pulse/flour metal article scope, fish-oil arsenic, oilseed aflatoxin wording and mace/nutmeg safrole. The downloadable R23 companion has **88 seafood-analyte rows (22 × 4)** and **seven** source-article conflicts and exclusions. The remaining **55** route-unsupported identities and **137** original article applicability questions are unchanged.

The corrected deferred-amendment metadata is committed only to the **audit branch**; no existing active numeric rule, no approval flag, no commercial-lot release and no production engine/deployment was changed.

## Tests and reproducibility

Offline tests: **14 Python date/scoping scenarios, 54 JavaScript no-PASS guard assertions, 45 Chromium browser/export assertions, 7 structural invariants** — all passing. Browser widths 1440/390/320 px had no JS errors or horizontal overflow; filtered CSV export retained all 533 unique IDs.

Audit CI [workflow 41672037335](https://github.com/pragashramadoss/PMSV-app-source-code/actions/runs/41672037335) succeeded with **18 integrity checks**. GitHub CI SHA-256 of the corrected deferred amendment module: `f166c842bbd1dd47a764899ecd1175d27b57775e7c90cef9b04fea731a821ac9`, matched by independent local reconstruction. The combined number of source/software assertions is **138**, not 138 independently verified legal rules.

**Integration boundary:** Viewer, source-row guard and full registries are *offline audit companions*, not yet wired to the live PMSV engine. PR #2 remains draft and must not be merged as evidence of complete current-law or product compliance.
