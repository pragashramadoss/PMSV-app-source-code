# PMSV FSSAI Batch 63 — Cocoa / Misri product-identity source verification and no-transferred CTR contaminant limits

**Review date:** 17 October 2026; **implementation:** isolated `gh-pages` helper preview. **No WordPress production or main-branch update.**

## Source-grounded findings for four P0 cases

The original 35 CTR cases remain legally HELD (13 P0 / 22 P1), and **all original 175 immutable `PMSV44` gate IDs remain preserved**. This batch brings exact **identity-standard clauses, product-type distinctions, and non-equivalent test-method warnings** to four previously unresolved, highest-priority cases (ranks **8, 9, 10 and 20**). Product-quality numerical requirements below are **not heavy-metal contaminants limits, and not evidence of a passed lot.**

| Existing rank | Case | Official FSSAI product-standard content | Why its CTR article is not automatically transferable |
|---:|---|---|---|
| 8 | Cocoa Beans — lead | FPSFA **2.3.54**, [FSSAI Fruit & Vegetable chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3%20%28Fruit%20%26%20Vegetable%20products%29.pdf): fermented/dried whole *Theobroma cacao* seeds; maximum bean moisture **8%**; mouldy-bean defects **4%** by count; slaty beans **8%** by count; insect-damaged **2%** by count; germinated/flat **4%** by count. | Bean/nib/shell matrix is not cocoa powder. These quality checks do not set lead limit. Signed original CTR lead commodity article and suitable lab method are required. |
| 9 | Dry Mixtures of Cocoa and Sugars — lead | FPSFA **2.7.6**, [FSSAI Sweets & Confectionery chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_7%20%28Sweets%20and%20Confectionary%29.pdf): products intended for direct consumption are differentiated by cocoa-powder content and fat grades; named bands include sweetened cocoa at **≥25%**, sweetened cocoa mix **≥20%**, sweetened cocoa-flavoured mix **below 20%**; chocolate powder **≥32%** cocoa powder (**29% dry basis**). | Mixed sugar/cocoa article is not pure cocoa powder, particularly not cocoa powder's lead value expressed on fat-free dry-matter basis. Need actual SKU BOM, powders' proportions, moisture and approved exact legal CTR article. |
| 10 | Cocoa Mass/Liquor and Cocoa Cake — lead | FPSFA **2.7.8**, [FSSAI Sweets & Confectionery chapter](https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_7%20%28Sweets%20and%20Confectionary%29.pdf): cocoa mass/liquor is ground practically shell-free nib; cocoa cake is derived through fat removal from nib or mass; mass cocoa-butter content **47–60%** by weight, both cocoa mass and cake with maximum **10%** moisture. | These are not cocoa powder's sample matrix. The 47–60% is a **product-identity quality specification**, **not a lead limit**, conversion rule, or proof of lab accuracy. |
| 20 | Misri — chromium | FPSFA **2.8.2**, [FSSAI product-standards compendium](https://www.fssai.gov.in/upload/uploadfiles/files/Comp_Food.pdf): candy made from any sugar or **palmyrah juice**, total ash ≤**0.4%**, total sugar expressed as sucrose ≥**98%**. | Misri is standardized separately from refined sugar; the unrelated refined-sugar chromium CTR value cannot automatically be applied. The actual commercial raw sugar/candy form and original named CTR article must be authenticated. |

The FSSAI product-standard compendium expressly states **product covered must also comply with the CTR regulation**; that cross-reference does not itself choose the precise legal heavy-metal table article. [FSSAI official CTR IX compendium (3 February 2026)](https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf) is a compiled reference and **not** a signed original Gazette product-to-metal applicability opinion.

### Critical analytical method mismatch protection

- [FSSAI **04C.018:2024**](https://www.fssai.gov.in/upload/uploadfiles/files/Manual%20of%20methods-sugar%20and%20confectionary%20including%20sweetening%20agent.pdf) explicitly targets **cocoa butter** content in cocoa mass/liquor/cake. It is **not a lead analytical method**.
- The same FSSAI methods reference gives **04C.045 / 04C.046:2024** for **sulphur dioxide** in white/refined sugar and Misri. They are **not chromium analytical methods**.
- Manual titles and scope alone cannot establish adopted version, a named laboratory's **NABL accreditation matrix/parameter scope**, limit of quantification, or an actual sample PASS.

### Original Gazette provenance

The FSSAI historical Gazette archive lists an **FPSFA Fourteenth Amendment 2018** covering cocoa mass/liquor/cake and cocoa powder (uploaded **27 November 2018**), but this particular original Gazette's entire text was **not independently retrieved or authenticated** here. This research relies on official FSSAI chapter wording for product *identity*, preserving the requirement to verify enacted original Gazette and later amendments before a regulatory sign-off. The separate [FSSAI 2018 water vending-machine proposed draft](https://stg-old.fssai.gov.in/all-whatnew.php?pages=128) is **only a draft**, not grounds to treat vending water as packaged water; rank 1 remains untouched/held.

### Unchanged controlled release gate totals

| Metric | After Batch 63 |
|---|---:|
| Catalogue products / conditional first-source matches | 533 / 498 |
| Original unresolved CTR cases, P0/P1 | **35**, 13 / 22 |
| Batch63 exact identity-review cases | **4 (all P0)** |
| Original evidence-request IDs covered by this batch | **20** |
| Total immutable original request IDs | **175** |
| Other held cases unchanged | **31** |
| Signed case CTR limits / manufacturer BOMs / accredited heavy-metal lab scopes / actual lot PASS | **0 / 0 / 0 / 0** |
| WordPress production changes | **0** |

### Technical controls

- JSON: `fssai-product-helper-preview-01/data/rules/fssai-current35-cocoa-sugar-identity-batch63-2026-10-17.json`
- JS: `fssai-product-helper-preview-01/fssai-current35-cocoa-sugar-identity-batch63-2026-10-17.js`
- Chromium test: `tests/fssai-current35-cocoa-sugar-identity-batch63-2026-10-17.test.cjs`
- GitHub CI: `.github/workflows/verify-fssai-current35-cocoa-misri-batch63.yml`
- Validates the B59 and B62 ancestral dataset checksums, full source JSON checksum, exact case ID/rank match, exact 20 original evidence-request IDs, source clause quality/CTR distinction, all false legal/lab/lot flags, no external send or persistence, filter and research-only CSV exports.

**Next real closure:** collect relevant manufacturer/lab original documents, verify authentic original current CTR Gazette article for each specific material and heavy metal, and complete signed, matrix-scoped testing evidence before any legal case is closed. The product-standard quality figures are **not automatically product-limit settings in PMSV**.
