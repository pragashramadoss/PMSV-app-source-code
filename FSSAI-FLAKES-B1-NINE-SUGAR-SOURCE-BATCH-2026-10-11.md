# PMSV FSSAI Helper — Source applicability batch: FSSR 2.3.20 + nine sugar identities

**Date:** 11 October 2026
**Target:** `gh-pages`, PMSV FSSAI Helper preview only; **no WordPress changes**.
**Live ledger after batch:** **533 = 410 with at least some partial exact chemical/contaminant source evidence + 123 awaiting first exact source**. **Zero** laboratory or full-regulatory compliance approvals.

## 1. One first exact source-backed product, not full compliance

**Fruit/Vegetable, Cereal Flakes**; catalogue ID `06-06-3-fruit-vegetable-cereal-flakes`; FSSR `2.3.20`; FoSCoS FCS `06.3`.

1. FSSAI Chapter 2.3, clause 2.3.20, expressly requires cereals and starch in the fruit/vegetable puree blend dehydrated into flakes. Official chapter PDF, **PDF page 28**: https://fssai.gov.in/upload/uploadfiles/files/4_%20Chapter%202_3%20%28Fruit%20%26%20Vegetable%20products%29.pdf
2. FSSAI Contaminants Regulations, **Version IX dated 03.02.2026, §2.2.1, PDF page 14**, separately specify **Aflatoxin B1 10 µg/kg** for **Cereal and cereal products** and **Food product containing any of the above mentioned food articles**. Source: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf
3. The first partially applicable finished-identity contaminant source is consequently recorded as **B1 10 µg/kg only**. Because **Total Aflatoxins are 15 µg/kg for cereal products versus 20 µg/kg for the broader composite-food article**, the Helper withholds a finished-food Total Aflatoxins value until exact legal article is resolved.
4. The number is withheld if the catalog ID, name, FSSR, FCS, mandatory cereal requirement, current Version IX source, exact article limits/units or underlying source tables change. No sample/lab result, amendment review or other chemical compliance is approved.

**Excluded inheritance:** Breakfast Cereal (a different FSSR 2.4.35 route), ordinary fruit bars, plain dehydrated vegetables, Biscuits 2.4.15(1), and cereal-free products cannot copy this mapping by default. Do not interpret "contains cereals" as proof of a specific pesticide-commodity MRL.

## 2. Nine-product Refined Sugar Chromium source review — conditional only

**Official source article:** `Chromium — Refined sugar — 0.02 mg/kg`, FSSAI CTR Version IX §2.1, PDF page 13. Product-standard source: https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf, **PDF page 3** for Cube Sugar 2.8.1(5).

| FoSCoS product | FSSR | Exact article/processing reason | Can automatically transfer 0.02 mg/kg to finished product? |
|---|---|---|---|
| Cube Sugar | 2.8.1(5) | *Manufactured from refined crystallised sugar*; additives may be present and finished article selection is not yet established | **No** — conditional refined-sugar input source only |
| Icing Sugar | 2.8.1(6) | Refined **or plantation-white** sugar, optionally starch | **No** |
| Khandsari Sugar | 2.8.1(3) | Separate Khandsari sulphur/desi sugar standard, not necessarily refined | **No** |
| Bura Sugar | 2.8.1(4) | Product made from **any kind of sugar** | **No** |
| Dried Glucose Syrup | 2.8.7 | Glucose/starch-hydrolysis product, not refined sucrose | **No** |
| Edible Lactose | 2.1.20 | Milk-derived lactose, not refined sucrose | **No** |
| Plantation White Sugar | 2.8.1(1) | Earlier sugar class distinct from Refined Sugar 2.8.1(2) | **No** |
| Misri | 2.8.2 | Any sugar or palmyrah juice | **No** |
| Golden Syrup | 2.8.6 | Inverted sugar syrup, not crystalline refined sucrose | **No** |

The nine catalogue records are present in the **123 still unresolved** first-exact-finished-source identities. The displayed 0.02 mg/kg is **a qualifying source comparison, not a permitted, tested or autoapplied limit for the nine finished products**. The **Lead** article `refined white sugar (sulphated ash not exceeding 0.03%)` requires a *sulphated ash* analytical basis; **Cube Sugar's total-ash ≤0.03% is not a substitute**. No lead numerical inheritance.

## 3. Changed repository files and verification

- **`chapter-2-3-fruit-vegetable-v1.json`**: source-pinned proof of cereals and Version IX B1 article agreement for 2.3.20.
- **`scripts/audit-fssai-product-readiness.cjs`**: first exact 2.3.20 evidence and separate nine-sugar conditional reviews; all 533 source-gated.
- **`scripts/audit-fssai-evidence-ledger-conservation.cjs`**: 410 partial / 123 unresolved; historical 126-case review still preserved as dated evidence, not live queue.
- **`fssai-product-helper-preview-01/index.html`**: displayed product-specific B1 with fail-closed gating; conditional sugar article comparison; stale historical missing-first-source message hidden for flakes **only when the exact B1 remains source-verified**.
- **`fssai-nine-sugar-refined-chromium-scope-2026-10-11.json`**: 9 product identity/exclusion gates; 0 promotions.
- **`tests/fssai-2-3-20-cereal-flakes-exact-b1-2026-10-11.test.cjs`**: four wrong-identity, numeric-drift and ledger-conservation checks.
- **`tests/fssai-nine-sugar-refined-chromium-scope-2026-10-11.test.cjs`**: four wrong-subtype, source-integrity, 0-pass and conditional-display checks.
- **`.github/workflows/verify-fssai-standard-nutrition.yml`** includes both new test suites in its watch list and executable command.

At v504 the 534-test regulatory CI passed; v505 code change hides an obsolete historical pending notice for the now B1-partial flakes identity, and is under equivalent required CI verification. Both still use the same **410/123 ledger**.

**Important:** These results do **not** establish full FSSAI legal compliance, current FoSCoS completeness beyond the local 533, laboratory acceptance, all pesticide MRLs, or all effective future amendments. The next 123 identities remain queued for exact finished article verification; never treat an ingredient metal MRL or general quality criterion as an automatic finished-product MRL.
