# PMSV — 121 pending identities: positive subtype and source-proof gates (11 October 2026)

GitHub `gh-pages` only; WordPress unchanged. This batch extends the review-only technical evidence register, **without claiming product compliance or reducing the unresolved queue**.

- Total FoSCoS identities: **533**.
- Partial exact contaminant/chemical evidence: **412**.
- First-exact-article identity gaps: **121**.
- Complete regulatory/laboratory compliance approvals: **0**.
- Newly first-source-promoted identities: **0**.
- Individually source-qualification-gated identities: **121**.
- Identities with a specific reference article requiring positive evidence: **92**.
- Identities with no safe proposed named article, retained as unresolved: **29**.
- Conditional source-article checks: **153**, from **20** official Version IX articles.

## Purpose

Each remaining product now has a machine-readable, ID-locked source-proof blocker: actual species, finished matrix, process, packaging, sampling/testing basis, analytically defined residue, official named article, effective amendment, and verified laboratory result. Candidate articles remain **reference-only**. No candidate is an applied finished-food limit, a complete assessment or a compliant lot result.

## Critical official exceptions

1. FSSAI Version IX explicitly lists lead **2 mg/kg** and arsenic **3 mg/kg** for **L(+) tartaric acid**; the FoSCoS identity says **L(+/-) tartaric acid**, so optical isomer must be positively established before applying either.
2. Cocoa powder lead **5 mg/kg** is on a dry fat-free basis. Cocoa beans and cocoa mass/cake cannot inherit it without confirming the actual finished article.
3. Canned fruit cocktail and canned mushrooms have lead **1 mg/kg** named articles. Frozen, pickled and dried material, or an otherwise sterilized food, is not necessarily canned.
4. Dehydrated onion lead **10 mg/kg (dry matter)** differs from dehydrated **non-onion** vegetables lead **5 mg/kg**.
5. The nickel **1.5 mg/kg** article covers named hydrogenated, partially hydrogenated and interesterified fats, not all possible fat-spread processing routes.
6. The eggs **2,4-D 0.05 mg/kg** MRL is on a shell-free basis; egg powder, liquid/frozen products and pickled eggs require processing/analytical qualification.
7. Raw-fruit pesticide, cereal mycotoxin, low-fat Minarine, high-sulphated-ash sugar, mushroom Agaric acid and packaged-water metals also require a positively identified article; the source's existence alone is not proof of applicability.

**Official source:** https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf. Section 2.1 (metal tables), 2.2 (crop contaminants and naturally occurring toxic substances), and 2.3 (insecticide MRLs). As of 11 October 2026; later operative amendments still require review.

## Machine checks

The new test verifies the live 121-identity inventory; exact FoSCoS IDs/names/FSSR/FCS; cross-product reference uniqueness; operator-specific units; optical isomer, packaging and dry-matter conditions; prohibition on automatic numeric inheritance or PASS. CI runs these tests before the remaining verification suite.

**Files:** `fssai-product-helper-preview-01/data/rules/fssai-next121-positive-subtype-proof-2026-10-11.json`, `tests/fssai-next121-positive-subtype-proof-2026-10-11.test.cjs`, this review report, and `.github/workflows/verify-fssai-standard-nutrition.yml`.
