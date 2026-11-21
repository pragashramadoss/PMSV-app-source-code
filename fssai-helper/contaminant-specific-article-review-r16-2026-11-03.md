# PMSV R16 — product-specific CTR article gates (3 November 2026)

All 533 product identities retain their source-edition review. R15's "137 without any exact evidence" must be read as **137 lacking an exact product-specific article**, NOT 137 free from contaminants regulation. Version IX (03.02.2026), metal table, explicitly lists **Methyl Mercury (calculated as the element) — All foods — 0.25 ppm**. Its ppm heading uses mg/kg or mg/L; the R16 companion requires a verified solid or liquid matrix and the correct unit, without automatic conversion.

## 137 exact product-article gaps, reclassified

- 14 already had named source-conditional article gates under R15.
- 12 fungi/pickle records now have a possible **Agaric acid — Food containing mushrooms — 100 ppm** article, subject to actual mushroom species/ingredient proof. Ten are newly source-anchored, two overlap existing gates.
- This gives **24 distinct conditional source-article candidates**, none automatically applicable.
- **113 remain without such a safe article anchor**: nine previous locked-only identities, 48 other commodity-only cases and 56 no-direct-route cases.
- Product-specific exact article gaps remain **137 pending context**; no case is marked full current CTR, product approval or commercial lot release.

## Official source checks

- Version IX: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf (metal table pp. 2–13; aflatoxin p. 14; agaric acid p. 15).
- Chapter 2.3, edible fungi 2.3.62: https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf (pp. 97–101).
- The final May 2026 CTR amendment is future-effective 1 December 2026; the October tea-pesticide proposal remains draft.

## Tests

- Structural/preservation assertions: **4,065 passed**.
- Standalone JS guard assertions: **3,212 passed**, including global methyl-mercury matrix/unit, mushroom-species and canned-metal packaging gates.
- Browser: filters 533 / 137 / 24 / 113, individual source details, full 533-ID CSV export, 1440/390/320 px, zero JavaScript errors and page overflow.
- Repository workflow **41626120347** succeeded with **714 source/preimage integrity checks**. Its artifact **13226050878** matched the locally tested core JSON byte-for-byte.
- R16 module SHA-256: `0f32a6cd75deaa43c06872a022a563b23465c8384d6ba9038c26a7d6fbcfb93d`.
- **No previously operative numeric contaminant rule was changed**. All approvals remain false.

The full 137-row queue, 37 conditional source candidates, matrix-safe standalone guard and 533-row reviewer remain downloadable offline companions, not integrated into the live decision engine. PR #2 remains draft and unmerged; production gh-pages is unchanged.

Next substantive work: exact species, product subtype, packaging, processing factor, complete applicable pesticide/veterinary-drug analytes, methods, legal article adjudication and current amendments.