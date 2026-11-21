# PMSV R46 — Finished-article identity checks for three FSSR Chapter 2.3 products

**4 November 2026 | Source-audit only. Zero new legal product CTR article closures.**

## Actual source scope — not just product names

| Original FSSR product | Official clause | Standard-specific identity/controls | Existing CTR candidates, still NOT legally applied |
|---|---|---|---:|
| Fruit Cheese | 2.3.33 | Fruit pulp/puree cooked to set; TSS **>=65%**; prepared fruit **>=45%**, except strawberry or raspberry **>=25%** | 3 |
| Murabba | 2.3.25 | Whole/cut/grated fruit, rhizomes or vegetables impregnated with sweetener; TSS **>=65%**, fruit content printed **>=55%** | 2 |
| Frozen Vegetables | 2.3.38 | Wash and blanch, **−18°C at thermal centre** after stabilization, **negative peroxidase**, Appendix B criteria; check species-specific substandard A–D | 8 |

These clauses were read and their PDF page images **32, 39, and 41** (1-based) viewed in the official FSSR Version 2 (04.11.2024). Note the published Murabba standard permits vegetable/rhizome material but still states fruit-content 55%: **do not invent a nonfruit exception or declare a nonfruit SKU legally compliant** without original Gazette and specific legal review.

## Existing 13 CTR source rows cross-checked, not auto-applied

### Fruit Cheese

- Copper: Pulp and pulp products of any fruit, 5 ppm; PDF p.7; existing `R31-2333-1` **source only**
- Arsenic: Pulp and pulp products of any fruit, 0.2 ppm; PDF p.10; existing `R31-2333-2` **source only**
- Tin: Pulp and pulp products of any fruit, 250 ppm; PDF p.11; existing `R31-2333-3` **source only**

**Scope guard:** Preparation from pulp/puree does not itself prove finished fruit-cheese matches CTR Pulp and pulp products of any fruit article

### Murabba

- Lead: Jam (fruit preserves) and jellies, 1 ppm; PDF p.4; existing `R31-2325-1` **source only**
- Tin: Jam, Jellies and Marmalade, 250 ppm; PDF p.11; existing `R31-2325-2` **source only**

**Scope guard:** Murabba is not automatically Jam (fruit preserves)/Jellies or Jam/Jellies/Marmalade; broad fruit-rhizome-vegetable scope requires exact CTR article adjudication

### Frozen Vegetables

- Copper: Vegetables, 30 ppm; PDF p.8; existing `R31-2338-1` **source only**
- Arsenic: Vegetables, 1.1 ppm; PDF p.10; existing `R31-2338-2` **source only**
- Mercury: Vegetables, 1 ppm; PDF p.12; existing `R31-2338-3` **source only**
- Chromium: Vegetables, 1 ppm; PDF p.13; existing `R32_CHROMIUM` **source only**
- Nickel: Vegetables, 1 ppm; PDF p.13; existing `R32_NICKEL` **source only**
- Antimony: Vegetables, 1 ppm; PDF p.13; existing `R32_ANTIMONY` **source only**
- Lead: Other vegetables, 2.5 ppm; PDF p.5; existing `R32_LEAD` **source only**
- Cadmium: Other vegetables, 1.5 ppm; PDF p.12; existing `R32_CADMIUM` **source only**

**Scope guard:** Frozen vegetable category does not equal canned vegetables. Generic Vegetables and residual Other vegetables metal rows may compete with species-specific articles


The generic "Vegetables" metal rows for Copper, Arsenic, Mercury, Chromium, Nickel and Antimony are not automatically a *finished frozen vegetable SKU* limit. R32 also contains **Lead 2.5 ppm** and **Cadmium 1.5 ppm** specifically printed as *Other vegetables* (residual article). This must NOT override more specific species/part articles for leafy, legume, brassica etc. Antimony Vegetables compendium cell has a visible stray typographic symbol; original Gazette recheck before numeric activation.

**Competing articles:** Fruit cheese's pulp **ingredient** does not prove its cooked set finished food is "Pulp and pulp products of any fruit" under CTR. Murabba is not automatically CTR "Jam (fruit preserves) and jellies"/"Jam, Jellies and Marmalade". Even where a candidate appears identical, packaging form, species, processing, current Gazette and actual full panel remain necessary.

## Remaining legal gates

- Real manufactured SKU formula/fruit species and percentage, soluble solids, intended form, process records, packaging and FSSR exact clause.
- Fruit Cheese fruit-species exception and genuine original prepared-fruit calculation.
- Murabba fruit/rhizome/vegetable identity and printed fruit-content interpretation for nonfruit variants.
- Frozen vegetable species/subclause, validated thermal-centre −18°C evidence, negative peroxidase, Appendix B labs.
- Legal article-by-article CTR matrix, analytes, amendments, original Gazette, analytical sample method/units/actual lab results, additives and other requirements.

| Status | Count |
|---|---:|
| Full PMSV catalogue preserved | 533 |
| R46 original product cases | **3** |
| Previously indexed R31/R32 source-row candidates reviewed | **13** |
| New legally adjudicated CTR article applications | **0** |
| Original product CTR applicability cases still open | **137** |
| Full product approvals / commercial releases | **0** |
| Ayurveda raw ingredient CTR source gaps (independent workflow) | 14 |

## Official evidence
- [FSSR Chapter 2.3 Version 2 (04.11.2024)](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf) — visual page checks p.32,39,41.
- [CTR Version IX (03.02.2026)](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf) — visual table checks p.5,7,8,10,11,13. Original Gazette/current amendments pending.

Audit-only register `fssai-helper/ctr-fruit-cheese-murabba-frozen-vegetables-r46-2026-11-04.json`, source guard `fssai-helper/ctr-fruit-vegetable-article-gate-r46-20261104.mjs`. Live engine, numeric limits, product master and draft-PR status untouched.
