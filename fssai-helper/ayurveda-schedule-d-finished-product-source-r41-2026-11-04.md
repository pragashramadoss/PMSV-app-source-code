# PMSV R41 — Independent Schedule D finished-product safety layer for Ayurveda Aahara

**4 November 2026 | Gazette source audit only; ZERO legal finished-product approvals**

## Critical scope correction

The prior R35–R40 work catalogued **46 Ayurveda recipe ingredient rows** and **94 conditional raw-ingredient CTR references**. That does NOT establish finished-product microbial or contaminant compliance. Regulation **5** of the FSSAI **Food Safety and Standards (Ayurveda Aahara) Regulations, 2022** expressly directs products to the **Schedule D** safety requirements. This is a **separate regulatory evidence layer**, not a replacement for the source-based CTR ingredient review.

| Item | Result |
|---|---:|
| Original PMSV catalogue identity count | 533 |
| Original Category A recipe IDs cross-referenced | **9** |
| Independent Schedule D contaminant source analytes transcribed | **10** |
| Schedule D food safety organism/route entries | **4** (2 organisms × 2 relevant categories) |
| Process hygiene groups indexed | 3 |
| Raw-ingredient CTR candidate gaps left unchanged | **14** |
| Original product-specific CTR decisions pending | **137** |
| Full legal product PASS / commercial releases | **0** |

## Microbiological criteria: do not mix hygiene with food safety

**Table 1A** is *process hygiene*, not a market-release specification. For **Ayurveda Aahara for direct consumption**, the extracted table records n=5, c=2 for each of three count tests:

| Test | m (cfu/g or mL) | M (cfu/g or mL) |
|---|---:|---:|
| Aerobic Plate Count | 10^4 | 10^5 |
| Yeast and Mould Count | 10^2 | 10^3 |
| Enterobacteriaceae count | 10^2 | 10^3 |

The source also provides a different **unprocessed, not-for-direct-consumption** row (n=5, c=3), and a special **fermented** route. Do **not** presume that all nine named recipes are necessarily ready-to-eat or fermented.

**Table 1B** is *food safety / batch-lot acceptability*: direct-consumption and fermented product source rows specify **Salmonella absent in 25g (n=5, c=0)** and **Listeria monocytogenes absent in 25g (n=5, c=0)**. Source rules on special retail-pack sampling require FSSAI prior approval; do not create an automatic 5g/10g exception. FBO internal tests do not automatically establish compliance testing method validity.

**PDF extraction limitation:** The official Gazette text was checked; screenshot attempts for the relevant pages failed. Powers-of-ten rendered as 104/105 etc in the PDF extract were transcribed as 10^4/10^5 only for **human-source audit**, with **NO operational limit enabled** pending image confirmation.

## Source Schedule D Table 2: contamination limits for review

| Parameter | Source maximum | Source unit |
|---|---:|---|
| Lead | 2.5 | mg/kg or mg/L |
| Copper | 30 | mg/kg or mg/L |
| Arsenic | 1.1 | mg/kg or mg/L |
| Tin | 250 | mg/kg or mg/L |
| Cadmium | 1.5 | mg/kg or mg/L |
| Mercury | 1 | mg/kg or mg/L |
| Methyl Mercury (calculated as element) | 0.25 | mg/kg or mg/L |
| Total Aflatoxins | 20 | µg/kg |
| Aflatoxin B1 | 10 | µg/kg |
| Melamine | 2.5 | mg/kg |

**Aflatoxin scope:** The starred aflatoxin values are tied to foods containing specified materials (arecanut/betelnut, cereals, dried figs, nuts, oilseeds/oils, pulses, spices/spice mixes). Actual ingredient proportions, processing and applicable current legal classification must be checked. These source maximums are not new automatic product rules and do not override other legally applicable current CTR provisions.

## 9 original Category A recipe IDs cross-referenced, no products approved

- 12.1 — 12.1 - Lajadi Kashaya (Parched Rice Tea) — Schedule D SOURCE ONLY
- 13.1 — 13.1 - Krishara (Khichdi) — Schedule D SOURCE ONLY
- 14.1 — 14.1 - Golaka Dugdha (Condensed Milk without Sugar) — Schedule D SOURCE ONLY
- 14.3 — 14.3 - Narikela Ksheerika (Milky Coconut Delight) — Schedule D SOURCE ONLY
- 14.4 — 14.4 - Yava Ksheera (Barley Milk) — Schedule D SOURCE ONLY
- 14.5 — 14.5 - Dugdha Kupika (Stuffed Fried Cottage Cheese Dumplings) — Schedule D SOURCE ONLY
- 14.6 — 14.6 - Sugandhit Ksheera (Aroma infused milk) — Schedule D SOURCE ONLY — **source title/method hold**
- 14.7 — 14.7 - Ksheerapaka (Mystic Milk Quartet) — Schedule D SOURCE ONLY — **source title/method hold**
- 15.1 — 15.1 - Kulmasha (Barley Savory Discs) — Schedule D SOURCE ONLY

## Separate source-provenance guard for 14.6 Ketaki

Schedule C includes a maximum of **0.5% Kewda/Kewra oil (from Ketaki)** as a particular **additive form**. Recipe 14.6's original ingredient is **Ketaki flower**. A permitted oil additive does not license the raw flower, fix the source recipe's title/method discrepancy, or establish a raw-flower CTR source article.

## Next evidence gates

- Reconcile original current Gazette amendments and official page images before activating limits.
- Obtain each real SKU's recipe/matrix, intended consumption, processing type, and applicable FSSAI/FoSCoS product classification.
- Choose the correct Schedule D sampling plan, accredited method, test scope and actual laboratory results.
- Keep the original **14 raw-ingredient CTR evidence gaps**, **137 product-specific CTR holds**, and **two printed-recipe source alignment holds** intact until adjudicated.
- No changes to live PMSV, raw numeric CTR rules, product master or draft-PR merge state.

### Primary official text
- [FSSAI Ayurveda Aahara Gazette (5 May 2022 notification; 6 May 2022 Gazette)](https://www.fssai.gov.in/upload/notifications/2022/05/62789a20b54bdGazette_Notification_Ayurveda_Aahara_09_05_2022.pdf), Regulation 5, Schedules C and D, Gazette printed pp.22–25.
- [FSSAI FoSCoS standard Category A product list](https://fcstraining.fssai.gov.in/standard-product).

Structured source register: `fssai-helper/ayurveda-schedule-d-finished-product-source-r41-2026-11-04.json`. Evidence-only guard: `fssai-helper/ayurveda-schedule-d-evidence-gate-r41-20261104.mjs`.
