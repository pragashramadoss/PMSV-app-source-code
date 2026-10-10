# Official FSSAI Version IX — finished ice-cream, canned mushrooms and canned fruit cocktail (10 October 2026)

**Audit disposition: subtype-conditional reference rows only.** All three combined product catalogue identities remain unresolved for unconditional exact article evidence. None of these references is a finished-product compliance PASS or a claim of complete contaminants/MTL/MRL coverage.

Primary official sources:
- [FSSAI Contaminants, Toxins and Residues, Version IX (03.02.2026)](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), §2.1.1 metal table, PDF pages 2, 3, 4, 9, 10 and 11.
- [FSSAI Chapter 2.3 Fruit and Vegetable Products](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf), §§2.3.2 and 2.3.62.
- [FSSAI ice cream standard clarification including §2.1.14](https://fssai.gov.in/upload/uploadfiles/files/Myth%20buster%20on%20Ice%20cream%20and%20frozen%20dessert%20.pdf).

| PMSV combined identity and required exact subtype | Source article | Selected metal | Limit | Safeguard |
|---|---|---|---:|---|
| 2.1.14 frozen Ice Cream/Kulfi/Softy/Milk Ice/Milk Lolly only | Ice-cream, iced lollies and similar frozen confections | Lead | 1 mg/kg | Dried ice-cream mix excluded |
| Same | Same | Arsenic | 0.5 mg/kg | Dried ice-cream mix excluded |
| 2.3.62 sterilized fungi only if finished product is **canned mushrooms** | Canned mushrooms | Lead | 1 mg/kg | Other fungi, pouch and bottled products excluded |
| Same | Same | Tin | 250 mg/kg | Food-can packaging must be verified |
| 2.3.2 thermally processed fruit salad/cocktail/mix only if finished product is **canned fruit cocktail** | Canned fruit cocktail | Lead | 1 mg/kg | Other fruits/mixes, bottles, pouches and aseptic packages excluded |
| Same | Canned citrus fruits, stone fruits, vegetables, fruit cocktail, mangoes, pineapple, raspberries, strawberries, tropical fruit salad | Tin | 250 mg/kg | Exact canned package and fruit-cocktail identity required |

All six rows require an explicit **product.exact_subtype** selection. The PMSV runtime cross-checks the FSSAI loaded source article, contaminant, value and unit before returning *either* metal rule for a selected subtype; any mismatch fails closed.

**Queue consequence:** These conditional rows are **not counted** as newly resolved exact catalogue identities. The pending count remains at the immediately preceding GitHub verified baseline; other contaminants, pesticides, processing and effective amendments need separate review.
