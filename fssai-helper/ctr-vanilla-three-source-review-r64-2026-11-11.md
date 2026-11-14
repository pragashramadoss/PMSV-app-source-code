# PMSV R64 — Vanilla pods, cut vanilla and vanilla powder: official source review

**11 November 2026 | Draft PR #2 only; no production/helper/food-release changes.**

## Three original, source-screened cases

| Original catalogue ID | Official source identity | FoSCoS source FPC | FSSR source |
|---|---|---|---|
| `04-04-1-vanilla-pods` | Vanilla pods | **04.1.1.1** | **2.3.50** |
| `04-04-1-cut-vanilla` | Cut vanilla | **04.1.1.1** | **2.3.50** |
| `04-04-1-vanilla-powder` | Vanilla powder | **04.1.2.2** | **2.3.50(1)(c)** |

All three are original **R50 P2**, not invented new master products. The historical catalogue ID prefix **04-04-1** is **not** proof that powder's current FoSCoS food category matches fresh/cut pods.

## Official FSSR 2.3.50 — visually checked

The official [FSSAI Chapter 2.3 Version 3 (07.05.2025)](https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit_Vegetable_products.pdf), **PDF page 75** (zero-based screenshot 74), names *Vanilla fragrans* (Salisbury) Ames, synonym *Vanilla planifolia* Andrews. Whole pods can be split; cut vanilla consists of deliberately cut/broken pieces. Both require appropriate natural state and absence of listed insect/mould/rodent/oxidation damage. **Powder is ground from compliant pods or cut vanilla**, must possess natural vanilla flavour, be clean and pass **1.25 mm aperture**; this sieve requirement is **not** automatically assigned to whole/cut forms.

The same official PDF **page 76** (zero-based screenshot 75) prints:

| Parameter | Whole pods | Cut vanilla | Vanilla powder | Reporting basis |
|---|---:|---:|---:|---|
| Moisture **maximum** | 30.0% | 30.0% | **20.0%** | Percent as stated |
| Vanillin content **minimum** | 2.0% | 2.0% | 2.0% | **Wet basis** |
| Total ash **maximum** | 5.0% | 5.0% | 5.0% | **Dry basis** |
| Acid-insoluble ash **maximum** | 1.0% | 1.0% | 1.0% | **Dry basis** |
| Appearance | Dark chocolate brown to reddish | Same | Same | Descriptive colour criterion |

The source also prohibits **added colour, undesirable taste and extraneous matter**, and prohibits treatments changing natural vanillin or flavour constituents. **Neither artificial vanillin flavouring nor vanilla essence is automatically identical to the 2.3.50 powder standard.**

Official PDF **pages 76–77** (zero-based screenshots 75–76) separately refer to allowable **Appendix A additives**, applicable **CTR contaminants/toxins/residues**, **Schedule 4** food hygiene, **Appendix B microbiology**, relevant **FSSAI analytical methods**, and labelling. Those external requirements have **not** been independently closed for actual SKUs.

## Source / legal article separation

The official [FoSCoS product index](https://fcstraining.fssai.gov.in/standard-product) lists pods/cut at **04.1.1.1** and vanilla powder at **04.1.2.2**. These are source category identities, not a manufacturer's actual licence or evidence that a commercial lot complies.

The R29 register listed **conditional CTR candidates only**. No generic *spice/dried herb*, *plant raw material*, *flavouring*, or *powder* contaminant row can be automatically selected from appearance, product name or FPC alone. Actual commodity, form, processing and intended use, exact effective named CTR food article, all amendments, accredited methods, units/bases, full panels, actual supplier/manufacturer and real representative lot results must be examined.

The FSSAI [FPSFA amendment list](https://fssai.gov.in/food-law/regulations/amendments/food-products-standards) and [CTR amendments](https://fssai.gov.in/food-law/regulations/amendments/contaminants-toxins) were identified, but **full original Gazette / 2026 applicability reconciliation has not been completed**. FSSAI compendia are for reference; the original Gazette and effective notifications prevail. No future-effective limit is activated from this audit.

## Evidence intake by specific style

- **Pods/cut:** actual botanical and supplier authenticity, no unacceptable defects/treatment, natural vanillin assay on wet basis, moisture, total and acid-insoluble ash on the separately specified dry bases.
- **Powder:** documented grinding of compliant vanilla pods/cut, no substitution with flavouring or extracts, **1.25 mm sieve passage**, 20% moisture ceiling rather than 30%, wet-basis vanillin and dry-basis ash tests.
- **All three:** food category/licence for actual manufacturer, formula and primary pack, additives and disclosure review, effective CTR article and pesticide/toxin/metal rules, Appendix B microbiology, sample/method validation, results, independent competent QA/regulatory decision.

## Preserved audit counts and prohibitions

| Status | At end of R64 |
|---|---:|
| Original PMSV catalogue records | **533** |
| New distinct source-focused R64 cases | **3** |
| Cumulative selected R45–R64 focused cases | **50** |
| Original 137 outside these selected rounds | **87** |
| Exact finished-product CTR legal article decisions still open | **137** |
| New full legal product approvals or releases | **0** |
| Separate Ayurveda raw-ingredient source candidate gaps | **14** |

The **87** may have been covered by broader previous work: it is not 87 never-reviewed cases. The **137** remain source-screened but **not legally resolved**. No live numeric rules, master data, legal PASS decisions, production code, deployment or merged PR are changed.

Structured evidence: `fssai-helper/ctr-vanilla-three-source-review-r64-2026-11-11.json`. Gate/test are **audit-only**; never interpreted as a commercial compliance outcome.
