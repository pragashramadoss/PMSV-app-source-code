# PMSV R55 — Three mouth-freshener cases: signed 2021 FSSAI direction and FoSCoS verification

**4 November 2026 | Regulatory-source audit only. No legally approved finished products.**

## Evidence: original signed direction, not a generic FSSR

Located the **signed FSSAI direction dated 22 September 2021**, order **RCD-12005/1/2021-Regulatory/FSSAI-Part (1)**. Its original one-page signed image was inspected in a PFNDAI-hosted copy. Independently, the **FSSAI-owned current FoSCoS product listing** retains all three categories, and the official FPC guidance (PDF **pages 3–4**) explicitly cites this signed order.

| Original PMSV catalogue identity | FCS | R50 queue |
|---|---|---|
| Dried fruits/vegetables/nut based mouth fresheners | 05.2.4.1 | P2 |
| Other traditional mouth fresheners not covered under 5.2.4.1 and 5.2.4.2 | 05.2.4.3 | P3 |
| Spice based mouth fresheners | 05.2.4.2 | P2 |

### Exact direction scope, clauses 3–6

- **Clause 3:** The new **5.2.4 Mouth Freshener** subcategories were an *interim licensing route*; the 2021 letter notes no specific FSSR product standard at the time, with prior proprietary classification under broad 5.0.
- **Clause 4:** General Manufacturing applies the specific 5.2.4.x products; petty manufacturers and other KoBs were instructed to use **broad 05** for licensing/registration. Verify actual licence status rather than automatically changing it.
- **Clause 5:** Products under the new classes follow **horizontal parameters of the largest/major ingredient**, and additives permitted in **main category 5.2** apply. This is not an unconditional transfer of all ingredient MRLs to the finished mix, nor exemption from otherwise applicable food-safety/label/packaging rules. Identifying that *largest/major actual ingredient* is a prerequisite.
- **Clause 6:** FBOs already licensed for these products were **not required to modify solely due to the new classification**; new/renewal registrations follow the categories. No actual FBO licence was provided in the audit.

**Currentness boundary:** The current FoSCoS index still displays all 3 categories, but this targeted pass does *not* claim an exhaustive search of every subsequent Gazette/order, amendment or regulatory direction through 4 November 2026.

## Per-category ingredient and article decision gates

| FCS | Mandatory first proof | Wrong-article trap |
|---|---|---|
| 5.2.4.1 | Quantified actual dried fruit/vegetable/nut species and largest proportion | A mixed mouth freshener is not automatically dried figs, arecanut, one nut species or a generic dry-fruit residue sample |
| 5.2.4.2 | Actual spice species, percent, plant part and dried/fresh/roasted status | Do not borrow dry spice/spice mix CTR values before raw and processed-food article adjudication |
| 5.2.4.3 | Actual full traditional recipe and evidence it does not belong to .1 or .2 | “Other traditional” is not an open food-use permit or a blanket CTR exemption |

## Pan Masala identity is **separate** from an arbitrary mouth freshener

FSSR **2.11.5** provides a separate *Pan Masala* standardized product definition. The 2.11 chapter source was visually checked on **PDF page 3**. Its example numerical limits (total ash **8.0% maximum, dry basis** and acid-insoluble ash **0.5% maximum, dry basis**) are **not** new automatic limits for all 5.2.4 mouth fresheners. A real recipe must first be examined for proper identity and any legally operative later amendments, packaging or use conditions.

## Not yet confirmed

A real manufacturer/SKU, formula with percentages, the major ingredient, full additive composition, registered licence/KoB, finished article in current CTR, full microbiology/contaminant/pesticide panel and actual laboratory results were **not supplied**. The 2021 direction is a licensing/source scope, not a validated finished-product release standard.

| Audit counter | Verified state |
|---|---:|
| Original PMSV catalogue IDs | **533** |
| R55 original category direction checks | **3/3** |
| Original R51 missing FSSR string fields | **33**, no silent fill |
| Original 137 CTR finished-food article legal holds | **137**, unchanged |
| Newly legally adjudicated finished-product CTR decisions | **0** |
| Whole product legal PASS / commercial releases | **0** |
| Separate Ayurveda raw-source gaps | **14**, unchanged |

No production rules, helper deployment, product master, numerical contaminant thresholds or the historical R29/R50/R51 records were modified. Draft PR #2 remains unmerged.

### Sources

- [Signed FSSAI 22 September 2021 direction hosted by PFNDAI](https://www.pfndai.org/Document/Gazette/FSSAI/08Oct2021/Direction_Mouth_Freshner_23_09_2021.pdf) — signed image of original order, page 1.
- [Official FoSCoS FPC guide](https://fcstraining.fssai.gov.in/assets/docs/Compiled%20FPC_FoSCoS.pdf) — pages 3–4 visually checked.
- [Official FoSCoS product-category listings](https://fcstraining.fssai.gov.in/standard-product) — source product labels and 5.2.4.x codes.
- [FSSAI Chapter 2.11 Other Food Products](https://fssai.gov.in/upload/uploadfiles/files/12_%20Chapter%202_11%20%28Other%20food%20product%20and%20%20ingredients%29.pdf) — 2.11.5 Pan Masala source, PDF page 3 visually checked; not an auto-assignment to mouth fresheners.

Structured 3-record evidence register: `fssai-helper/ctr-mouth-freshener-2021-direction-r55-2026-11-04.json`. Companion fail-closed guard and CI tests included.
