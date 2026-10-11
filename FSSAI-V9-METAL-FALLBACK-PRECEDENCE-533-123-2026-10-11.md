# PMSV FSSAI Helper — Metal article precedence audit, 11 October 2026

**GitHub `gh-pages` only; WordPress unchanged.** Official source: [FSSAI Contaminants Regulations Version IX (03.02.2026), Section 2.1, pages 4, 7, 9–12](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf).

## Source verification
The source states the following **Foods not specified** articles in mg/kg: Lead **2.5**, Copper **30**, Arsenic **1.1**, Tin **250**, Cadmium **1.5**, Mercury **1.0**. They are fallback named articles: the exact relevant commodity/subtype-specific rule must be checked first, and no default source row can be auto-copied into a finished food compliance PASS.

The separate **Methyl Mercury (calculated as the element) — All foods — 0.25 mg/kg** row is universal, not a product-specific first exact article. It is **not identical to total Mercury** and requires the correct analytical species and sample measurement; its presence in a database does not signify laboratory compliance.

## Large audit coverage

- **533** loaded catalogue identities checked for the universal Methyl Mercury source obligation.
- **123** first-exact-source unresolved identities individually checked against **6** metal default precedence questions = **738** controlled source-review decisions.
- **410** existing partially source-backed product identities are preserved; **123** remain unresolved.
- **0** new first-exact product-specific article promotions and **0** finished-product lab or regulatory PASS declarations.
- Three independent regression tests verify all numeric source rows, the analytical separation and 533-row / 738-review conservation.
- 123 product-specific research worklists receive the fallback source priority questions independently from prior metal and tin scopes.

## Sources and scope
Source is FSSAI-only. This audit documents law/source prioritization and the **remaining evidence needed**, not automatically applicable finished product metal MRLs. Species/recipe, packaging, amendments and sample-based verification remain open.
