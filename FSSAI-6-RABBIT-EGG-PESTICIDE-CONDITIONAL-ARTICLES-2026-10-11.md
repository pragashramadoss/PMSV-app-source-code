# Official FSSAI pesticide reference review — two rabbit and four processed egg products

**Audit date:** 11 October 2026. GitHub `gh-pages`; WordPress unchanged.

**Important: these are official named commodity reference rows, not finished-product laboratory PASS results or automatically applicable MRLs.** The current 533-product baseline remains 407 partial exact evidence / 126 products without their first exact matched article. All six products below remain among those 126 until qualified source applicability and required other rules are independently verified.

### Official source checked

1. [FSSAI Contaminants, Toxins and Residues Version IX (03.02.2026)](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf) §2.3.1, PDF **page 16**: pesticide rows for 2,4-D, Acephate and Acetamiprid.
2. [FSSAI Meat and Meat Products Chapter 2.5, Version 4 (01.08.2025)](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_5_Meat%20and%20Meat%20products(1).pdf): §2.5.1 explicitly includes domestic rabbits (*Oryctolagus cuniculus*) in the animals definition; §2.5.2(6), PDF page 14, permits rabbit carcasses, cuts **and edible offal**, fresh/chilled/frozen. Egg standards §2.5.3(2)–(5), PDF pp.25–29, describe hen-egg freezing, drying, liquid and pickled forms separately.

### Ten official numerical article references reviewed but NOT applied

| # | Exact product | Catalogue ID | Pesticide | Official named article | Reference maximum | Why it remains conditional |
|---:|---|---|---|---|---:|---|
| 1 | Egg powder | `10-10-2-egg-powder` | 2,4-Dichlorophenoxy Acetic Acid | Eggs | 0.05 mg/kg | FSSAI Version IX explicitly says Eggs 0.05 mg/kg on shell-free basis. This is the raw egg commodity reference, not automatically a value for freeze-concentrated, dried, pasteurised liquid, pickled or reconstituted egg products. |
| 2 | Fresh or Chilled Rabbit meat | `08-08-1-fresh-or-chilled-rabbit-meat` | 2,4-Dichlorophenoxy Acetic Acid | Meat and Poultry | 0.2 mg/kg | Domestic rabbit is meat in official Chapter 2.5 definition. Meat-and-poultry CTR article is a candidate for qualifying rabbit carcass/cuts; confirm whether edible offal and sample tissue are within article scope, residue definition and processing. No universal tissue MRL. |
| 3 | Fresh or Chilled Rabbit meat | `08-08-1-fresh-or-chilled-rabbit-meat` | Acephate (expressed as mixture of Methamidophos and acephate) | Meat and Meat products | 0.05 mg/kg | Requires confirm rabbit raw-meat edible tissue and insecticide residue definition; whole carcass, muscle and offal cannot be treated as identical sample bases. |
| 4 | Fresh or Chilled Rabbit meat | `08-08-1-fresh-or-chilled-rabbit-meat` | Acetamiprid | Meat and Meat products | 0.05 mg/kg | Check actual tissue type and current rabbit species/commodity interpretation. No automatic edible-offal transfer. |
| 5 | Frozen Egg Products | `10-10-2-frozen-egg-products` | 2,4-Dichlorophenoxy Acetic Acid | Eggs | 0.05 mg/kg | FSSAI Version IX explicitly says Eggs 0.05 mg/kg on shell-free basis. This is the raw egg commodity reference, not automatically a value for freeze-concentrated, dried, pasteurised liquid, pickled or reconstituted egg products. |
| 6 | Frozen Rabbit meat | `08-08-2-frozen-rabbit-meat` | 2,4-Dichlorophenoxy Acetic Acid | Meat and Poultry | 0.2 mg/kg | Domestic rabbit is meat in official Chapter 2.5 definition. Meat-and-poultry CTR article is a candidate for qualifying rabbit carcass/cuts; confirm whether edible offal and sample tissue are within article scope, residue definition and processing. No universal tissue MRL. |
| 7 | Frozen Rabbit meat | `08-08-2-frozen-rabbit-meat` | Acephate (expressed as mixture of Methamidophos and acephate) | Meat and Meat products | 0.05 mg/kg | Requires confirm rabbit raw-meat edible tissue and insecticide residue definition; whole carcass, muscle and offal cannot be treated as identical sample bases. |
| 8 | Frozen Rabbit meat | `08-08-2-frozen-rabbit-meat` | Acetamiprid | Meat and Meat products | 0.05 mg/kg | Check actual tissue type and current rabbit species/commodity interpretation. No automatic edible-offal transfer. |
| 9 | Liquid Egg Products | `10-10-2-liquid-egg-products` | 2,4-Dichlorophenoxy Acetic Acid | Eggs | 0.05 mg/kg | FSSAI Version IX explicitly says Eggs 0.05 mg/kg on shell-free basis. This is the raw egg commodity reference, not automatically a value for freeze-concentrated, dried, pasteurised liquid, pickled or reconstituted egg products. |
| 10 | Pickled Eggs | `10-10-3-pickled-eggs` | 2,4-Dichlorophenoxy Acetic Acid | Eggs | 0.05 mg/kg | FSSAI Version IX explicitly says Eggs 0.05 mg/kg on shell-free basis. This is the raw egg commodity reference, not automatically a value for freeze-concentrated, dried, pasteurised liquid, pickled or reconstituted egg products. |

### Essential safeguards

- 2,4-D **Eggs**: **0.05 mg/kg, shell-free basis**. An egg-derived powder is concentrated, liquid whole egg has a different basis, and pickled egg contains brine/seasonings. None can receive a blind raw-egg MRL assignment; check legal processing factors and residue definition.
- 2,4-D **Meat and Poultry**: **0.2 mg/kg**. Rabbit is a recognized meat animal, but the exact product identity includes edible offal. A tested rabbit liver or other organ needs the relevant article and sampling tissue qualification.
- Acephate expressed as Methamidophos + Acephate, **Meat and Meat products 0.05 mg/kg**; Acetamiprid, **Meat and Meat products 0.05 mg/kg**. Product source identity is relevant; these do not automatically complete the meat pesticide panel or override animal-specific veterinary residue rules.
- Other effective amendments, contaminants, packaging, matrices, vet-drug MRLs and laboratory evidence remain unresolved. No numerical full-compliance PASS is permitted.

### GitHub implementation

- In the 126-record review manifest: `official_2_5_animal_pesticide_candidates_2026_10_11`, with exact product and standard ID, ten individually pinned reference rows, processing/tissue qualifications and explicit nonapplication.
- UI: `pendingContaminantReviewNotice(p)` displays “FSSAI official rabbit/egg pesticide article references — CONDITIONAL, NOT APPLIED.”
- Tests: `tests/fssai-six-rabbit-processed-egg-mrl-scope-2026-10-11.test.cjs`, registered in the required FSSAI verification GitHub Actions workflow.

**Count conservation:** 533 = 407 + 126, 0 full-compliance approvals. These ten official article values are reviewed source references, not ten new automatic finished-product contaminant results.
