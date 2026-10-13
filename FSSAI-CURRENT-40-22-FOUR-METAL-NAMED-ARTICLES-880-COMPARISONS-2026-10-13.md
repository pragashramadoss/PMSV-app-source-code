# PMSV FSSAI Helper — 40 products × 22 official named four-metal articles (13 October 2026)

**Deployment:** GitHub `gh-pages` evaluation only; WordPress unchanged. **Ledger:** 533 product identities / 493 partial conditional first named contaminant source routes / 40 still pending. No compliance approvals, laboratory results or automatic finished-food numerical limits.

## Only the current FSSAI legal source

[FSSAI Contaminants, Toxins and Residues Regulations, Version IX (03.02.2026), §2.1.1, PDF p.13](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf).

All **22 individually named rows** on this source page were transcribed with legal article name, correct metal, numeric value and unit:
- **Chromium:** 8 named legal articles, notably **refined sugar 0.02 mg/kg**, specific colours, gelatin, fish products, specified water and vegetables.
- **Nickel:** 5 named articles, notably **sorbitol 2 mg/kg**, hydrogenated/partially hydrogenated/interesterified vegetable fats, specified water and vegetables.
- **Selenium:** 5 named articles, including **potassium metabisulphite 5 mg/kg**, sodium metabisulphite 5 mg/kg and sulphur dioxide 20 mg/kg, plus specified water.
- **Antimony:** 4 named articles, including **titanium dioxide 2 mg/kg**, specified water and vegetables.

**Critical legal negative boundary:** §2.1.1 does not list a "Foods not specified" general row for these four elements. Do **not** invent or borrow a numeric catch-all from lead/copper/arsenic/tin/cadmium/mercury, and do not claim a food is legally exempt.

## Work completed

- All **40 pending exact identities** joined to the current 533 ledger and existing 40 worklist.
- **880** explicit product-to-named-row decisions (40 × 22); **160** individual element family checks (40 × 4).
- For possible matching product subtypes, positive unfinished legal questions retained, with all numeric values labelled for official **reference only**.
- Exact boundary safeguards: **vending water ≠ packaged/mineral water**; **cube sugar/misri ≠ automatically refined sugar**; **polyols excluding standardised substances ≠ sorbitol**; **generic permitted additives ≠ known INS compound**; **colouring foods ≠ isolated synthetic food colours or titanium dioxide**; **frozen vegetables require processing/form proof before any vegetable article is assigned**.
- Comparison of a listed impurity limit is **not a legal permission to use the named food additive** and is **not an approval of an actual lot**.

The source matrix is deterministic, includes the preserved original product-specific proof question and legal non-transfer rationale, and displays a panel on each of the 40 pending product pages. Missing/corrupted JSON, unexpected identifiers, altered limits, changed status or incomplete comparison arrays fail closed.

| Authoritative ledger field | Confirmed |
|---|---:|
| Catalogue | 533 |
| Partial conditional named source | 493 |
| Remaining named source pending | 40 |
| First-source promotions | **0** |
| Automatically applied numeric limits | **0** |
| Complete product compliance approvals | **0** |

Source data: `fssai-product-helper-preview-01/data/rules/fssai-current40-four-metal-named-articles-2026-10-13.json`; live preview: `fssai-product-helper-preview-01/fssai-current40-four-metal-named-articles-2026-10-13.js`; dedicated test: `tests/fssai-current40-four-metal-named-articles-2026-10-13.test.cjs`. Integrated with `.github/workflows/verify-fssai-pending-40-quality-coverage.yml`. This is legal source mapping, **not positive finished article proof for the remaining 40**.
