# PMSV FSSAI — Batch 57: original-source authentication, laboratory scope and independent sign-off prompts

**Review date:** 16 October 2026. **Deployment:** PMSV FSSAI isolated preview on `gh-pages`. **WordPress production:** no changes.

## Primary result

Batch57 adds a documentary verification layer **across all 35 open CTR cases, 175 original evidence gates and 1,470 independently answerable review prompts**. These are **questions, not checked or approved assertions**. No supplier original, applicant record, legal ruling, NABL certificate, physical test sample or laboratory report was supplied; **all source authenticity, method scope, current-CTR article and tested-lot approval remain unverified**.

| Verification group | Original gates | Checks per gate | Unverified checkpoints |
|---|---:|---:|---:|
| FSSAI method source/version and adoption | 35 | 8 | 280 |
| Actual marketed product identity | 35 | 8 | 280 |
| Current legal CTR commodity/analyte article | 35 | 8 | 280 |
| Laboratory accreditation, method/matrix and LOQ | 35 | 10 | 350 |
| Actual lot, CoA and independent review | 35 | 8 | 280 |
| **Total** | **175** | **42 checks per case** | **1,470** |

Earlier baseline unchanged: **533 catalogue items; 498 conditional first-source matches; 35 exact legal CTR holds; 13 P0 and 22 P1 cases; 28 published product identity references but no verified as-sold products; seven class/individual material identity holes.** All original requests remain not sent, all source documents not received or authenticated, all tests unapproved and all 35 lots not passed. Counts do not represent compliance certifications.

## New verified research: September laboratory notification freshness

The [FSSAI Food Laboratories directory](https://fssai.gov.in/food-testing/food-laboratories) currently references the notified **primary lab list dated 7 September 2026**. The [FSSAI Gazette notification index](https://fssai.gov.in/food-law/notifications?notification=gazette-notification) also lists a **30 September 2026** Gazette concerning NABL-accredited laboratories. That later listing means a reviewer must not simply rely on the older laboratory snapshot. **The full later Gazette and its exact individual laboratory entries were not independently analysed here**, so no laboratory's new status or effective date can be inferred.

The [NABL accreditation FAQ](https://nabl-india.org/faq/) explains how to search by test discipline and laboratory/certificate number, inspect the scope/certificate, and distinguish a laboratory's general capabilities from the limited **explicit accredited scope**. [NABL's laboratory search interface](https://nablwp.qci.org.in/laboratorysearchone) is therefore a complementary source to FSSAI's notifications. For every actual proposed case, obtain exact provider identity and source validity **on the date of testing**, together with relevant commodity matrix, analyte, method and reporting range/LOQ.

This is a **source-freshness control**, not evidence that any laboratory's accreditation was granted, suspended, or changed.

The [FSSAI official methods and adoption-order index](https://www.fssai.gov.in/food-testing/manuals-methods-analysis) includes methods and specific adoption orders; a document being hosted does not independently prove final adoption of a consultation version or that its 09.xxx identifier is unique. Preserve the unresolved conflicting metals-manual method numbering until a suitable actual method title/version/adoption decision and accredited lab scope are authenticated.

## How to apply each gate

**1. Source authenticity and method precedence — 8 questions.** Authenticate issuing authority, original official copy, full title and version, operative date, competing 09.xxx codes, relevant analyte, food matrix exclusions, mandatory-use/adoption orders and independent competent source reviewer.

**2. Manufacturer/ingredient identity — 8 questions.** Authenticate actual site and controlled product code, exact composition/label, botanical/chemical/enzyme compound identity, actual traceable lot, fat/moisture/dehydration basis, blend fractions and separate manufacturer QA signature.

**3. Legal contaminant article — 8 questions.** Check actual operative original Gazette, effective date, commodity-specific CTR article, named chemical/toxin/residue definition, signed numeric limit/units and dry/wet basis, category exceptions, current application register where relevant, and independent RA/Legal signoff. The future-effective **1 December 2026** CTR amendment and **1 April 2027** laboratory rules are not applied to this 16 October 2026 assessment.

**4. Laboratory fitness — 10 questions.** Verify exact testing legal entity/site, later FSSAI notification, NABL certificate/status and any suspension, accredited commodity matrix, accredited analyte, exact method/version, LOQ relative to signed actual legal limit, validation/recovery/interference, accreditation applicability on actual analysis date, and independent laboratory review. **A NABL certificate number alone does not mean all 35 matrices are included.**

**5. Lot and independent disposition — 8 questions.** Authenticate original chain-of-custody, CoA issuer and report version, analyte and test basis, scope validity on sample date, result/units/uncertainty, legally signed maximum and comparison, deviations, and independent quality/regulatory lot-specific disposition. Each gate remains open if any required upstream source is unverified.

## Preview interaction and data protections

Batch57 adds a single searchable/facet-filterable workbench across 175 original gate IDs and their **1,470 questions**. Filters support P0/P1 priority, five evidence-gate types, text search and triage-draft presence. Selecting a gate displays its 8 or 10 exact source/method/legal/lab/lot checks. Reviewers can use only **three non-approval triage states**:
- `NOT_REVIEWED_NO_EVIDENCE`
- `REFERENCE_TO_CHECK_NOT_AUTHENTICATED`
- `GAP_OR_CONFLICT_REQUIRES_FOLLOWUP`

A 160-character follow-up note can record a *non-sensitive* reference or missing-evidence question. There is **no VERIFIED, APPROVED or PASS option**, no server transmission, binary upload, localStorage, or auto-save. Session-only drafts can be exported to a clearly marked CSV/JSON and explicitly reimported. JSON import is atomic and rejects unknown original request IDs/checkpoint IDs, any extra keys, malformed statuses, forged approval flags, source-digest mismatches and duplicates without modifying the existing temporary drafts. A separate **blank 1,470-row CSV** intentionally excludes typed notes.

**Caution:** the browser review cannot verify the actual document's existence, issuer, legal force, exact NABL accreditation scope or laboratory results; source inspection and signature checks must occur using authentic documents outside this preview. Reviewers should not paste supplier BOM/CoA contents or sensitive personal information in notes or distribute exported notes without checking confidentiality.

## All 35 pending cases with 42 points each

| Catalogue rank | Priority | Product/ingredient/class | Analyte | Original lab gate request | New checkpoint state |
|---:|---|---|---|---|---|
| 1 | P0 | Drinking Water (Purified) sold through vending machine | Lead | PMSV44-01-04 | 42 unreviewed |
| 3 | P0 | Formulated supplements for children | Lead | PMSV44-03-04 | 42 unreviewed |
| 6 | P0 | Seedless Tamarind | Copper | PMSV44-06-04 | 42 unreviewed |
| 7 | P0 | COCONUT MILK POWDER | Lead | PMSV44-07-04 | 42 unreviewed |
| 8 | P0 | Cocoa Beans | Lead | PMSV44-08-04 | 42 unreviewed |
| 9 | P0 | Dry Mixtures of Cocoa and Sugars | Lead | PMSV44-09-04 | 42 unreviewed |
| 10 | P0 | Cocoa mass or Cocoa/Chocolate Liquor and Cocoa Cake | Lead | PMSV44-10-04 | 42 unreviewed |
| 20 | P0 | Misri | Chromium | PMSV44-20-04 | 42 unreviewed |
| 21 | P0 | Polyols permitted under Appendix-A of FSS(FPS&FA) Regulations,2011 excluding those already standardized | Nickel | PMSV44-21-04 | 42 unreviewed |
| 30 | P0 | Cow or Buffalo Colostrum and Colostrum Products | Lead | PMSV44-30-04 | 42 unreviewed |
| 31 | P0 | Royal Jelly | Antibiotics | PMSV44-31-04 | 42 unreviewed |
| 33 | P0 | 14.3 - Narikela Ksheerika (Milky Coconut Delight) | Lead | PMSV44-33-04 | 42 unreviewed |
| 34 | P0 | 14.7 - Ksheerapaka (Mystic Milk Quartet) | Lead | PMSV44-34-04 | 42 unreviewed |
| 2 | P1 | Coffee-Chicory Mixture | Ochratoxin A | PMSV44-02-04 | 42 unreviewed |
| 4 | P1 | Frozen Fruits/Fruit Products | Residues | PMSV44-04-04 | 42 unreviewed |
| 5 | P1 | Catechu (Edible) | Lead | PMSV44-05-04 | 42 unreviewed |
| 11 | P1 | Chia Seeds | Lead | PMSV44-11-04 | 42 unreviewed |
| 12 | P1 | Carob Powder | Lead | PMSV44-12-04 | 42 unreviewed |
| 13 | P1 | Arrowroot | Pesticide MRLs | PMSV44-13-04 | 42 unreviewed |
| 14 | P1 | WATER CHESTNUT FLOUR (SINGHARE KA ATTA) | Lead | PMSV44-14-04 | 42 unreviewed |
| 15 | P1 | Animal Casings | Lead | PMSV44-15-04 | 42 unreviewed |
| 16 | P1 | Egg powder | Pesticide MRLs | PMSV44-16-04 | 42 unreviewed |
| 17 | P1 | Pickled Eggs | Pesticide MRLs | PMSV44-17-04 | 42 unreviewed |
| 18 | P1 | Dried Glucose Syrup | Lead | PMSV44-18-04 | 42 unreviewed |
| 19 | P1 | Edible Lactose | Lead | PMSV44-19-04 | 42 unreviewed |
| 22 | P1 | Salt Substitutes | Lead | PMSV44-22-04 | 42 unreviewed |
| 23 | P1 | Trehalose | Lead | PMSV44-23-04 | 42 unreviewed |
| 24 | P1 | Sajji Khar | Lead | PMSV44-24-04 | 42 unreviewed |
| 25 | P1 | Additives permitted under Appendix-A of FSS (FPS&FA) Regulations, 2011 and other food safety standards regulations excluding those already standardized and additives of Nutraceutical Regulations | Lead | PMSV44-25-04 | 42 unreviewed |
| 26 | P1 | Additives VA-VF of Nutraceutical Regulations excluding those already standardised | Lead | PMSV44-26-04 | 42 unreviewed |
| 27 | P1 | Permitted enzymes and their preparations excluding those already listed under Processing Aids and Nutraceutical Regulations | Lead | PMSV44-27-04 | 42 unreviewed |
| 28 | P1 | Ingredients listed under Schedule IV, Schedule VI and Schedule VIII of Nutraceutical Regulations | Aflatoxins | PMSV44-28-04 | 42 unreviewed |
| 29 | P1 | Mixtures/preparations/premix of functional ingredients | Aflatoxins | PMSV44-29-04 | 42 unreviewed |
| 32 | P1 | SILVER LEAF (Chandi-ka-warq) | Lead | PMSV44-32-04 | 42 unreviewed |
| 35 | P1 | Dietary Fibre (Dextrin-soluble fibre) | Lead | PMSV44-35-04 | 42 unreviewed |

The full JSON links each case to its original five documentary request IDs and has distinct source/matrix and current commodity-law review cautions inherited from Batch53 and Batch54. The 35 laboratory gates alone now have **350 targeted independent checks**; none has been marked valid.

## Technical delivery

- Source data: `fssai-product-helper-preview-01/data/rules/fssai-current35-source-method-lab-authentication-batch57-2026-10-16.json`
- Read-only review/temporary triage UI: `fssai-product-helper-preview-01/fssai-current35-source-method-lab-authentication-batch57-2026-10-16.js`
- Automated integrity + Playwright browser test: `tests/fssai-current35-source-method-lab-authentication-batch57-2026-10-16.test.cjs`
- GitHub Actions: `.github/workflows/verify-fssai-current35-source-lab-batch57.yml`
- Isolated preview integration: `fssai-product-helper-preview-01/index.html`.

**Closure remains pending for all 35 cases.** Checklists and document-reference metadata are only preparation; real manufacturer identity, legal applicability, primary source/date, independent lab method/scope and actual chain-of-custody/result evidence are still required before a lot-specific compliance conclusion. This is a technical source-review workbench, not legal advice or a release certificate.
