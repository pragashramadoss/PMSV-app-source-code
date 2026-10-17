# PMSV FSSAI Batch67 — six source-bounded analyte and physical-matrix reviews

**17 October 2026; GitHub `gh-pages` FSSAI helper preview only. WordPress and `main` untouched.**

## Six original cases reviewed

| Original priority / rank | Marketed category | Official reference and legal evidence gate |
|---|---|---|
| P1 #2 | Coffee–Chicory Mixture — OTA | Official CTR IX §2.2.1 p.15 lists **coffee** OTA as 5 µg/kg. This *published coffee-only comparator is not an approved mixture limit*. Require actual coffee/chicory mix, original operative OTA clause, accredited method and original lot CoA. |
| P1 #4 | Frozen Fruits/Fruit Products — pesticide residues | §2.3.1 p.16 onward identifies named pesticides and food crops; fruit species, blend, processing and individual pesticide matter; no universal frozen-fruit MRL inferred. |
| P1 #13 | Arrowroot — pesticide MRLs | A root-derived purified starch/flour is not automatically potato, cassava or grain under individual residue rows; botanical, finished form, current named clause and matrix proof needed. |
| P1 #16 | Egg powder — pesticide MRLs | Certain Eggs pesticide rows specify **shell-free basis**. A fresh egg expression is not automatically a powder maximum; egg fraction, moisture/dehydration and exact analyte require evaluation. |
| P1 #17 | Pickled Eggs — pesticide MRLs | Eggs, peeled egg portion, brine and whole jar may represent different material bases. Signed sampling/matrix and processed-product adjudication are missing. |
| P0 #31 | Royal Jelly — antibiotics | CTR §2.3.2 p.40 concerns antibiotic misuse in **honey production**. Royal jelly is not automatically honey; no honey MRPL inherited without original operative legal source applicable to royal jelly. |

**Original FSSAI source:** [Food Safety and Standards (Contaminants, Toxins and Residues) Regulations, 2011 — Compendium IX dated 3 February 2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf). Its p.15 OTA, p.16 pesticide and p.40 antibiotic provisions were reviewed, including page imagery. Compendium text is not, on its own, a signed original Gazette adjudication for an unidentified commercial product.

## Result and safeguards

The batch adds **six case-specific source non-transfer explanations**, each with **four next documentary proof actions** (material identity; original and currently operative legal food × analyte provision; laboratory accredited method/matrix; original representative lot CoA). These four actions **do not replace** the original **five immutable evidence request IDs** per case: **30 original IDs** retained. The new JSON is pinned to Batch59, Batch60 and Batch66. Browser checks all original product IDs, analytes, priority categories, legal gate IDs, evidence IDs and data signature.

**Ledger stays 533 catalogue products / 498 conditional first-source matches / 35 unresolved CTR cases (13 P0, 22 P1) / 175 original evidence requirements; 0 product-specific numeric CTR approvals, 0 accredited matrix/lot approvals, 0 releases.** The preview adds a searchable and filterable six-case panel plus **unsent, formula-safe CSV**.

## CI scope
- `fssai-product-helper-preview-01/data/rules/fssai-current35-six-matrix-evidence-batch67-2026-10-17.json`: verified-source research and safeguards.
- `fssai-product-helper-preview-01/fssai-current35-six-matrix-evidence-batch67-2026-10-17.js`: isolated preview panel and optional CSV export.
- `tests/fssai-current35-six-matrix-evidence-batch67-2026-10-17.test.cjs`: Node assertions plus real **isolated Chromium** checks for 6 cases, correct P0/P1, 30 immutable request IDs, filtering, source URLs, CSV false statuses, invalid parent identity rejection.
- `.github/workflows/verify-fssai-current35-matrix-batch67.yml`: scoped GitHub Actions workflow.
- `fssai-product-helper-preview-01/index.html`: script load after Batch66.

**Important:** an isolated Chromium component result **is not** an end-to-end full-preview startup pass; prior full-app startup diagnostic remains unresolved. This batch makes no production or compliance decision.
