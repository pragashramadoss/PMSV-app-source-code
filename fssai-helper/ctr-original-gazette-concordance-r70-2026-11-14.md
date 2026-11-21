# PMSV R70 — original Gazette reconciliation

14 November 2026. **382 metal-table entries and 27 crop-contaminant entries now have a one-to-one comparison with original FSSAI notifications.** No stored threshold was changed. This closes the original-source transcription check for these two tables; it does not settle every product-specific article choice.

## What was checked

| Layer | Result |
|---|---|
| Metal table, 2020 replacement | 382 entries across 11 metals; 371 direct article matches and 11 matches after retaining separately stored packaging/milk conditions |
| Crop-contaminant table | 27 entries reconciled, with two 2024 replacements effective 1 April 2025 |
| Latest listed CTR amendment | Nine scoped changes recorded for 1 December 2026, all future on the review date |
| Operative rule changes | None |

The 2020 notification replaces the whole metal sub-regulation and crop-contaminant clause. The 2024 notification replaces the Ochratoxin A and Deoxynivalenol entries. Its Ochratoxin A row is **5 µg/kg for wheat, wheat bran, rye, barley and coffee**; its Deoxynivalenol row is **1,000 µg/kg for wheat, wheat bran and barley**. The existing Helper data already match these operative entries.

The official amendment index lists 17 amendments. The latest original notification is dated **14 May 2026**, the Gazette issue is dated **19 May**, and FSSAI lists/uploads it on **25 May**; commencement is **1 December 2026**. These are different dates.

## Source qualifiers and unresolved interpretation

- The original 2020 Gazette itself prints 76 for Fish and Crustaceans and 86 for Molluscs. This is not resolved as a compendium-only transcription problem. No decimal, footnote or corrected value has been inferred.
- The original infant-food copper entry states 15 with a lower condition of not less than 2.8. An upper-limit-only comparison loses source meaning.
- Ten meat/tin rows depend on other containers versus tinplate containers. A separate broad meat-products row also appears; exact article and packaging selection remain necessary.
- The Milks lead row expressly requires a concentration factor for partially or wholly dehydrated milks. Its 0.02 value is not an unqualified powder limit.
- Four normalized crop-contaminant rows sit under the original Oilseeds or oil heading. The full heading remains in this evidence register; flattened seed labels alone do not decide oil applicability.
- All six Foods not specified entries are present in the original Gazette. Their existence does not prove that a particular product lacks a named article. Existing conditional/FPC18 restrictions remain; no fallback was enabled.
- The original table retains potentially overlapping article descriptions, including fruit juice entries and broad versus packaging-specific meat entries. Matching the printed numbers does not adjudicate those scopes.

## Changes scheduled for 1 December 2026

| Change | Scope to retain |
|---|---|
| Lead: pulse flours | The article text expands; keep the existing lead number and actual pulse/flour identity separate. The amendment is not a blanket pulse-based composite-food rule. |
| Inorganic arsenic in fish oils | Below-ML total arsenic needs no further test under the stated note; above-ML total arsenic requires inorganic arsenic testing. The source does not expressly describe total arsenic exactly equal to ML; do not invent that screening shortcut. |
| Cadmium: pulse flours | Retain the dry-soybean exclusion; this does not assign a raw pulse/flour article to every processed soy product. |
| Total aflatoxins: oil and oilseed wording | This is an article-wording substitution, not a new numerical threshold. The PDF repeats a ready-to-eat-oilseeds bullet; preserve provenance without making a third numerical row. |
| Aflatoxin B1: oil and oilseed wording | Keep oil, further-processing seed and ready-to-eat seed identity explicit; the stated numerical limits are not replaced by this instruction. |
| Saffrole: amended food scope | The whole serial-number-4 entry is substituted. Do not keep the former broad beverage/soup/meat rows as universally current after commencement. |
| Seafood antibiotic clause (1) omission | The omission does not authorize prohibited veterinary substances or remove surviving clauses (2)–(4). |
| Trimethoprim: seafood row | Added after the existing entries; retain the drug, matrix and residue-method requirements. |
| Oxolinic acid: new seafood row | Do not insert a future row into the current 49-drug source table before commencement. |

The fish-oil total-arsenic screening note uses below/above wording. Equality is not silently converted into a screening permission. The future changes are informational; none is activated in the current rules.

## Ayurveda follow-up

The retrieved June 2026 Part-2 PDF starts with recipe group 23.1. It does not provide a correction to the earlier 14.6/14.7 mapping. A separate corrigendum has not been definitively ruled out. The 14 earlier ingredient entries comprise **4 water-quality routes and 10 botanical entries**; this pass does not turn purity or potability evidence into a raw-commodity CTR decision.

## Reproducibility and limits

The accompanying JSON preserves each original article/limit cell, PDF page, source URL and SHA-256, the core snapshot, and the separately stored qualifiers. Rows that explicitly specify mg/L retain that unit. For other rows, the table's ppm header (mg/kg or mg/L) does not replace actual matrix and reporting-basis verification. Numerically unusual source literals and overlapping articles remain explicit. Selected commencement and qualified table pages were also inspected as rendered images; the full 382-row comparison used extracted table cells.

This pass does not reconcile every pesticide/veterinary row or all original NOTS amendments, methods, packaging, labelling, claims, directions or legal interpretations. **137 exact article decisions remain open; no product/lot approval, production deployment or PR merge is issued.**

## Official sources

- [CTR First Amendment Regulations, 2020](https://fssai.gov.in/docs/whatsnew/gazette/5f3d09f97b78aGazette_Notification_Limit_Metal_19_08_2020.pdf) — SHA-256 `5d376f55999049e7272b84294b3b5e5bfc228c3ef772754bfbd328045212c3dd`.
- [CTR First Amendment Regulations, 2024](https://fssai.gov.in/upload/uploadfiles/files/2_Notification%20dt%2017_10_2024.pdf) — SHA-256 `7f677539c1bd4adbe524e998b7e81d81f712e2d3dd6568282aae21b14ec49dd6`.
- [CTR Amendment Regulations, 2026](https://fssai.gov.in/upload/uploadfiles/files/272840.pdf) — SHA-256 `f625a2629d2eb28a6dcc9e1035920228f4592be5589232cdcbd2bab22bc573ea`.
- [ayurvedaPart2](https://fssai.gov.in/upload/advisories/2026/06/6a34f644db631Annexure%20No_part-2%20Compendium%20of%20Ayurveda%20Aahara%20recipes.pdf) — SHA-256 `b3ddeaa286202c4a9698a7cbd28c4b2eab76e11d7505d33bad6388014c85037b`.
