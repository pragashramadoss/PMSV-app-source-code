# R76 — Asafoetida grade-specific purity sources

Reviewed 17 November 2026. Eleven numeric purity entries match between the original 2011 Gazette and the retrieved 2024 compendium. This is a source comparison, not full current-law verification or product approval.

| Parameter | Hing | Hingra | Compounded / Bandhani Hing |
|---|---:|---:|---:|
| Total ash, maximum | 15% by weight | 20% by weight | 10% |
| Ash insoluble in dilute HCl, maximum | 2.5% by weight | 8% by weight | 1.5% |
| Alcoholic extract, minimum | 12% | 50% | 5% |
| Starch, maximum | 1% by weight | 1% by weight | No numeric maximum stated here |

Alcoholic extract uses 90% alcohol and cites U.S.P. 1936 for all three grades. The solvent concentration is not the ingredient's alcohol content. No dry-basis qualification appears in these entries; the helper does not add one. The method text, laboratory method equivalence and subsequent method notifications have not been reconciled.

Hing/Hingra are oleogumresin from Ferula rhizomes and roots. Their definition prohibits the named foreign resins and other foreign resin. Compounded asafoetida has a separate composition (Irani/Pathani Hing with gum arabic, edible starches or edible cereal flour) and additionally prohibits coal-tar dyes and mineral pigment. Its absent numeric starch maximum must not be filled with the 1% Hing/Hingra limit or treated as unlimited permission.

## Recipe 13.1 boundary

The 2025 recipe order, PDF page 88 / printed page 53, ingredient 5, lists **Hingu**, part **Oleoresin gum**, ratio **Q.S.** The botanical entry is printed `Asfoetida/ Ferula asfoetida Regel.`; that source spelling is preserved separately from the normalized catalogue term. The broad Ferula definition in FPSFA does not resolve this botanical wording. No grade is automatically selected and no substitution of compounded Hing is approved.

Ayurveda Aahara regulation 3(5), original 2022 notification PDF page 16, permits specified sources for adopted ingredient purity criteria and requires the FBO to disclose its adopted criteria at licensing and subsequent changes. This food-standard comparison is a candidate source for that assessment; it does not establish the actual adopted criterion.

## Sources and review boundaries

- [Original FPSFA notification, 1 August 2011](https://fssai.gov.in/upload/uploadfiles/files/Food_Additives_Regulations.pdf#page=115). Reviewed PDF pages 115, 116; SHA-256 `bd31da71e3a3ea438d53e095187b72c337d89a0089bcfcc862ce252979e94f63`.
- [FSSAI Chapter 2.9, Version 2 (4 November 2024)](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_9_Salt%20Spices%20Condiments%20and%20related%20products.pdf#page=34). Reviewed PDF pages 34, 35; SHA-256 `7f7cd2a3a5efd6f114299872d45ef2b1b50260818bf695be6cefe4430547a447`.
- [FSSAI Ayurveda recipe order, 25 July 2025](https://fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf#page=88). Reviewed PDF pages 88; SHA-256 `498d6f579357e7bb8e8d7b9f7741db5863f6eea8d29ffd559ff9add7d32d7edc`.
- [Original Ayurveda Aahara Regulations, 2022](https://www.fssai.gov.in/docs/food-law/notice-comment/62789a20b54bdGazette_Notification_Ayurveda_Aahara_09_05_2022.pdf#page=16). Reviewed PDF pages 16; SHA-256 `1ae8cfc632fad0a775316a84999a48adb6cf4b47d05bd4faa75f5190c511f699`.

The original Gazette's numeric entries are on PDF page 116 / printed page 402; its grade definition starts on PDF page 115 / printed page 401. Compendium pages 34–35 retain all 11 limits. Visual checks confirmed the numeric rows, grade boundaries, recipe part and Q.S. entry. The official amendment index was also consulted, but it does not establish a complete later-amendment/corrigendum chain. The compendium itself is a reference aid; original notifications prevail.

Pharmacopoeial full-text retrieval was incomplete. No purity limits were inferred from PCIMH indexes, a similarly named plant, a different part or a substituted species. No broader claim is made about the remaining botanical monographs.

No contaminant, residue or microbiological limit is added to the rule engine. The existing water note for Khichdi remains available. All 137 product-specific CTR decisions remain open. All 14 Ayurveda ingredient applicability gaps remain open, including Hingu's CTR scope and adopted-purity/application questions. No product, recipe substitution, label or batch is approved.

## Software verification

The R76 regression checks cover all three grade boundaries, source fingerprints, missing/invalid grades, the absent compounded-starch row, raw-gum recipe identity, preserved water evidence, full review export and altered-evidence rejection. Browser CI checks the grade selector, product switching and mobile/desktop layout; its tested revision and results are recorded in draft PR #2.
