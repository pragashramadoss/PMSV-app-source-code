# PMSV R38 — Coconut and date fruit conditional CTR source crosswalk

**4 November 2026 | Draft audit evidence only — no regulatory product PASS**

## What changed

| Metric | Count |
|---|---:|
| All PMSV catalogue identities preserved | 533 |
| Exact finished-product CTR article decisions still open | **137** |
| R37 Ayurveda ingredient rows with no conditional source candidates | 22 |
| R38 additional ingredient rows with conditional source candidates | **2** |
| R38 conditional source rows captured | **4** |
| Remaining original Ayurveda ingredient rows with no source candidate | **20** |
| Cumulative original Ayurveda ingredient rows with a candidate (of 46) | **26** |
| Cumulative raw ingredient/source reference links (R36+R37+R38) | **80** |
| Legal product approvals or batch releases | **0** |

## Source rows visually inspected in the FSSAI CTR Version IX PDF

| Recipe/ingredient | Pesticide / printed article | Printed value | PDF page |
|---|---|---|---:|
| 14.3 Narikela (coconut endosperm) | Copper Oxychloride (elemental copper) — **Coconut** | **$** — see Section 2.1 | 21 |
| 14.3 Narikela | Copper Sulphate (elemental copper) — **Coconut** | **$** — see Section 2.1 | 21 |
| 14.6 Khajura (date fruit) | Malathion + malaoxon residues — **Fruits** | 4 mg/kg | 30 |
| 14.6 Khajura | Malathion + malaoxon residues — **Dried fruits** | 8 mg/kg | 30 |

**Footnote on PDF page 39:** the symbol **$** directs copper to the limits in CTR regulation **2.1 (metal contaminants)**. It is neither a numeric pesticide MRL in that cell nor an exemption. Check the exact coconut endosperm/ingredient article and applicable copper matrix before selecting a value. The generic pesticide 0.01 mg/kg note must not be substituted for this printed $ cross-reference.

The two malathion entries are **alternative broad commodity/processing-state candidates**, not two simultaneously applicable limits. The official source does not specifically name “Dates” in these rows. The actual Khajura fruit processing state (fresh, dried or other) is not established. R35’s **14.6 source table/method alignment hold also remains active**. Do not choose the more favourable figure.

## Guards maintained

- Do not silently transfer the cited Coconut source references to coconut oil, coconut water, coconut milk or the finished dairy-coconut food. The recipe names **endosperm**, while the CTR table prints **Coconut**.
- No named **Ginger**, **Ghee**, **Asafoetida**, **Sandalwood**, **Vetiver**, or **unidentified edible flower** source is manufactured from generic crop group labels.
- **Dried figs** are not **dates**. Do not inherit the dried-fig aflatoxin line merely because both could be dried fruit.
- Recipe source issues 14.6 and 14.7 and all 137 finished-product article decisions remain unresolved. No change to deployed engine, limits, product master, commercial release fields or PR merge state.

## Sources

- [FSSAI CTR Version IX 03.02.2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf) — PDF pages 21, 30 and 39, visually checked.
- [FSSAI Ayurveda Aahara Category A recipe order, 25.07.2025](https://fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf) — ingredient identities per prior R35 evidence, source alignment review still pending.
- Prior: `ayurveda-unmapped-ingredient-source-review-r37-2026-11-04.json`; current structured delta: `ayurveda-coconut-dates-copper-malathion-r38-2026-11-04.json`.

**Scope boundary:** This is source candidate indexing only, not a declaration that a legal pesticide, copper or finished-food panel has been decided. Original Gazette currency, actual raw material grade, sampling basis, analytical method and actual SKU evidence still have to be verified.
