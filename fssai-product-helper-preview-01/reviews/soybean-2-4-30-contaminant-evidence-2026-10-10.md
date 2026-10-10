# FSSAI 2.4.30 — non-fermented soybean products: evidence review (10 October 2026)

## Official sources
- Chapter 2.4 clause 2.4.30: https://www.fssai.gov.in/upload/uploadfiles/files/Comp_Food.pdf
- Contaminants, Toxins and Residues Regulations, Version IX (03.02.2026), section 2.2.1, PDF page 14 (zero-based page 13): https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf

## Five catalogue identity families to assess
1. Soybean beverages and related products — distinguish plain, composite/mixed/flavoured, and soybean-based beverages.
2. Soybean curd and related products — distinguish semisolid soybean curd and soybean curd.
3. Compressed soybean curd.
4. Dehydrated soybean curd film.
5. Tofu — verify whether an exact catalogue alias maps to soybean curd, and do not create a duplicate legal standard without proof.

## Official source table, NOT a blanket finished-product conclusion
Section 2.2.1 lists:
| Contaminant | Oilseeds/oil articles | Food product containing any listed articles |
| --- | --- | --- |
| Total aflatoxins | 15 µg/kg | 20 µg/kg |
| Aflatoxin B1 | 10 µg/kg | 10 µg/kg |

The matching Aflatoxin B1 numeric values do NOT establish that every soybean derivative qualifies automatically. Raw soybean seed is not interchangeable with beverages, curd, film, tofu or mixed formulations. Select the finished-product article only after confirming product identity and scope of the composite-food row. Other contaminant and pesticide limits remain to be reviewed.

## Safe implementation contract
- Do not copy raw-soybean oilseed limit rows directly to processed soybean identities.
- Where the finished food qualifies as a 'Food product containing any of the above mentioned food articles', retain the source article, a reason for its applicability, and ingredient/product-form evidence.
- Record total aflatoxins separately: **20 µg/kg** for the qualifying composite-food row, versus **15 µg/kg** for the oilseed row; do not copy 15 to finished composite products.
- Do not mark any of these identities as *fully contaminant compliant* based on aflatoxin data alone.
- Check metal contaminants and pesticide MRL commodity applicability independently; do not auto-transfer raw soyabean seed MRLs.
- Preserve distinct identifiers for semisolid curd, curd, compressed curd and film; treat “tofu” as an alias only when its exact FSSR/category is confirmed.

## Review status
This is a SOURCE-VERIFIED PARTIAL-EVIDENCE REVIEW, **not** a deployed runtime mapping. Exact catalogue IDs, existing data shape and regression integration require inspection before editing existing records. No claim of complete product compliance is made.
