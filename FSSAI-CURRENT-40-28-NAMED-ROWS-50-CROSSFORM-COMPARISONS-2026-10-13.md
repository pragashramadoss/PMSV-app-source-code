# PMSV FSSAI Helper — 40 current named-contaminant-article comparison dossier (13 October 2026)

**Deployment:** GitHub `gh-pages` preview only; WordPress unchanged. **Authoritative baseline unchanged:** 533 total product identities / 493 partial conditional first named CTR routes / 40 exact named article routes pending / 31 pending products separately linked to FSSR quality standards / 9 quality dossiers still not linked. **No laboratory PASS, no complete contaminant compliance approval, no auto numeric limit applied.**

## Official source reviewed

[FSSAI Contaminants, Toxins and Residues Regulations, Version IX, 03.02.2026](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf), §§2.1.1 and 2.3 (veterinary drug residues), especially PDF pp.2–12 and p.41.

- **40/40** pending identities now include individual, current-ledger-joined source comparison dossiers.
- **28** official specific metal / veterinary drug residue source rows transcribed with their exact finished-article legal name, figure, unit/basis, PDF page and official link.
- **50** product-to-article comparisons drawn against **36** distinct identities. Four generic cases rightly have *no safely preselected named numeric comparison* (enzyme preparation, heterogenous nutraceutical ingredient schedules, functional ingredient premix, and royal jelly).
- Each comparison is explicitly **NOT APPLICABLE TO THE PENDING FINISHED FOOD WITHOUT AFFIRMATIVE EVIDENCE**, not a threshold in the Helper's compliance engine. A negative match never means a product is exempt.
- Validation checks product name, FSSR and FoSCoS metadata against all **40** pending queue entries and corresponding **533** ledger records. Tampering with the source rows, limit, approval flags, universal classification, or identity fails closed.

## Concrete legal non-transfers and separate exact article evidence

| Pending finished identity | Actual official CTR named *comparison* | Why NOT assigned automatically |
|---|---|---|
| Cocoa beans | Lead **5 mg/kg**, named **cocoa powder**, on dry fat-free substance basis (PDF p.3); Copper **70 mg/kg**, cocoa powder, fat-free basis (PDF p.7) | Theobroma beans are not pressed/defatted cocoa powder |
| Cocoa mass/liquor/cake | Same two cocoa powder source rows | Material has different residual-fat state/standard; powder limit analytical basis cannot transfer |
| Dry mixture of cocoa and sugar | Cocoa powder Lead 5 on dry fat-free basis; refined white sugar Lead **0.5 mg/kg** only when sulphated ash ≤0.03% (PDF p.2) | Mixed marketed product is neither pure cocoa powder nor refined white sugar |
| Coffee-chicory mixture | Copper **30 mg/kg** for individually named *dried/roasted chicory and coffee beans* (PDF p.7) | Finished standardized coffee-chicory mixture is a distinct article |
| Dried glucose syrup | Lead **5 mg/kg** starch conversion products with sulphated ash **exceeding 1%** (PDF p.4) | FSSR 2.8.7 specifies a maximum sulphated ash of 1%; no over-1%-ash transfer to a compliant product |
| Quinoa | Lead **0.2 mg/kg** for cereal grains **explicitly excluding quinoa** (PDF p.3); separate Cd grain article also excludes quinoa (PDF pp.11–12) | Explicit source exclusion defeats cereal grouping |
| Chia seeds | 'Cereal grains' and 'pulses' comparison rows | Salvia hispanica seed cannot be designated those articles by FoSCoS placement alone |
| Egg powder and pickled eggs | Veterinary Amprolium **7 mg/kg** for poultry **egg** (PDF p.41) | Must first establish actual processed egg matrix, substance and legal extrapolation |
| Coconut milk powder and colostrum | Lead **0.02 mg/kg or mg/L** for **milks** (PDF p.5) | Non-dairy coconut is not milk; colostrum subtype/form and concentration require proof |
| Vending-machine purified drinking water | Lead **0.01 mg/L**, Cd **0.003 mg/L**, Hg **0.001 mg/L** for **packaged drinking water** (PDF pp.5 and 12) | FSSR 2.10.9 vending water is not automatically packaged water |
| Salt substitute | Lead **2 mg/kg**, *food-grade salt* (PDF p.6) | Salt substitutes are a separate mixed-mineral food |
| General polyols | Lead **1 mg/kg**, specifically *sorbitol* (PDF p.6) | Cannot apply sorbitol article to all polyols |
| Frozen vegetables | Canned-food Tin **250 mg/kg**, named canned food (PDF p.11) | Freezing differs from commercial canning |
| Colouring foods | Pb **10 mg/kg**, named *food colours other than caramel*, dry-colour basis (PDF p.4) | Concentrated food-derived ingredients are not automatically synthetic/isolated colour additives |

## Critical distinction: universal CTR provision versus named-article gaps

CTR IX §2.1.1 PDF p.12 also lists **Methyl Mercury (calculated as the element): “All foods” — 0.25 mg/kg**. This is an explicit universal-type source row, different from the product-specific CTR *named finished-article* match currently missing for the 40 queue records. The Helper now displays this distinction, instead of implying a missing named row means no applicable contaminant rules. Whether the marketed item is legally a food in scope, analytical method, any overriding conditions and actual test results require separate determination. This source statement is **not** an automatic tested-lot PASS.

## Files and checks

- Data: `fssai-product-helper-preview-01/data/rules/fssai-40-current-named-ctr-crossform-comparisons-2026-10-13.json`
- Preview UI and source-loader validation: `fssai-product-helper-preview-01/fssai-40-current-named-ctr-comparisons-2026-10-13.js`
- Exact identity, numerical source-row nontransfer, universal-rule distinction, and tamper regression: `tests/fssai-40-current-named-ctr-comparisons-2026-10-13.test.cjs`
- Fast CI: `.github/workflows/verify-fssai-pending-40-quality-coverage.yml`

**Overall first exact named CTR queue still 40, not zero.** This is a verified comparison matrix, not a claimed regulatory clearance, promotion or proof that legal product-specific articles do not exist.
