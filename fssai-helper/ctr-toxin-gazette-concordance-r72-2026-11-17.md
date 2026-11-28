# PMSV R72 — original toxin tables and histamine applicability

17 November 2026. **37 limit or sampling-plan rows and 119 histamine species entries were compared with original FSSAI notifications. The stored numerical limits agree.** A species-scope omission was identified in the stored histamine data and is explicitly guarded in the new draft comparison module and surfaced in the review interface.

| Layer | Original-source coverage |
|---|---:|
| Naturally occurring toxic substances | 15 rows: 14 in the 2015 replacement and one 2017 insertion |
| Fish PCB/PAH | 3 rows |
| Bivalve biotoxins | 5 rows |
| Melamine | 3 rows plus the original numbering corrigendum |
| Histamine product sampling plans | 11 rows |
| Histamine species entries | 119 entries in 10 families, retained in source order |

## Histamine correction

The original Gazette's **page 12 has a merged applicability cell spanning product rows 1–10**. It restricts the table to the listed fish species with high free histidine. The stored core has an `applicable_to` field only on row 1; that missing metadata must not become a species exemption for processed fish products.

Fish Pickle appears on page 13, row 11, with a blank applicability cell. The new draft gate conservatively requires species confirmation and a separate continuation-scope confirmation for that row. This is an explicit implementation safeguard; it does not invent wording in the blank cell or claim a new legal interpretation has been approved.

The draft `histamineBySource` gate requires an exact listed species/family, exact category, article/matrix/method evidence and all nine individual results. It checks all three original criteria: mean ≤ m; no more than c=2 results above m and at or below M; no result above M. Eight plans use m=100 and M=200 mg/kg; the three dried/fermented/pickle plans use m=200 and M=400 mg/kg. A favourable average cannot hide an excessive individual result. Sparse arrays, negative/nonfinite values, censored strings, partial panels and incompatible units are refused.

Scientific and common names in all 119 source entries agree after whitespace normalization. Source spellings and repeated genus entries are retained; this is not a modern taxonomic reconciliation. The gate accepts exact named species only; it holds genus-only entries and aliases for explicit review.

The review page and JSON export include these findings. All 24 Chapter 2.6 product detail views link to this source note, including identities outside the 137-case queue. A displayed source note does not assign a fish-table limit to fish oil, gelatin, shellfish or any other unmatched article.

## Other confirmed source details

- **NOTS:** the 2015 table provides four toxin groups and 14 article rows. The 2017 insertion adds the separate sago/cassava/tapioca/manihot row at 10 ppm. The confectionery row remains 5 ppm; the higher row cannot be selected merely from a starch ingredient. The shortened stored nougat/marzipan article is explicitly paired with the full original wording.
- **PCB/PAH:** the two PCB articles specify the sum of six congeners at 2.0 and 0.5 ppm. The smoked-fishery Benzo(a)pyrene row is 5.0 **ppb**. Fish habitat, processing and analyte groups remain necessary application evidence.
- **Biotoxins:** the original table heading says µg/kg, but the five individual cells use different units and equivalents. PSP uses µg/100g, ASP uses µg/g, DSP/AZP use named toxin equivalents per kg, and Brevetoxin uses mouse units or equivalent per kg. Individual cell wording must be preserved; the common heading cannot overwrite it.
- **Melamine:** the original 31 March 2016 corrigendum resolves the original notification's 2.4/2.4.1 numbering to **2.5/2.5.1** and changes its title to the Second Amendment Regulations. The three values are unchanged. The `Other foods` article cannot displace an applicable infant-formula article.
- **Saffrole:** the original 2026 notification substitutes the entire serial-number-4 entry from **1 December 2026**. The future ingredient-qualified article is kept separate from the six earlier articles. No future provision is activated in this pass.

## Sources and reproduction

The accompanying JSON records seven official URLs and SHA-256 fingerprints, extracted original cells, PDF page numbers, the exact stored row mapping and differences in wording/scope. Relevant table pages were visually inspected. Histamine species rows were compared in full against the extracted original table; they were not inferred from common food names.

- [2015 NOTS replacement](https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Crop_Contaminants_Natural_Toxic.pdf), PDF page 4.
- [2017 HCN insertion](https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Second_Amendment_FSS_Contaminants_01_08_2017.pdf), PDF page 4, printed page 3. The file begins with an extra blank PDF page.
- [2016 fish PCB/PAH and biotoxin notification](https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Biotoxins_Limits.pdf), page 4.
- [2016 melamine notification](https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Melamine_Milk.pdf), page 3, and [31 March 2016 corrigendum](https://fssai.gov.in/upload/uploadfiles/files/Corrigenda_Amendment_Melamine_09_05_2016.pdf), page 1.
- [2017 histamine notification](https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notificaton_Histamine_Level_25_01_2017.pdf), species pages 10–12 and sampling pages 12–13; effective 1 July 2017.
- [2026 amendment](https://fssai.gov.in/upload/uploadfiles/files/272840.pdf), page 5; effective 1 December 2026.

To rebuild the JSON, place those seven unchanged PDFs in one directory and run `python scripts/build_ctr_toxin_gazette_r72_20261117.py SOURCE_DIRECTORY` using Python with pdfplumber. Run the dedicated R72 test through `node scripts/test_ctr_toxin_gazette_r72_20261117.mjs` or the complete current audit through `node scripts/verify-helper.cjs`.

## Boundaries

**All 137 product-specific CTR decisions remain open.** This closes the identified original-table comparison work for these layers, not exhaustive current-law or product verification. Ayurveda ingredient/recipe questions, SKU-specific applicability, analytical-method scope and other outstanding regulatory questions remain separate. No stored core limit, fingerprint, production website, product approval or lot-release status is changed. The new gate is a draft source-comparison API; it does not replace the older preview engine or constitute a production deployment.
