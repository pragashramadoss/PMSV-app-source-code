# PMSV FSSAI Helper — current 116 first-source evidence capture (12 October 2026)

**Platform:** GitHub Pages `gh-pages` standalone FSSAI product Helper only. **WordPress:** untouched.

## Scope and counts

The live 533-product first-source ledger remains **417 partial exact contaminant evidence / 116 first exact finished-article matches pending / 0 full compliance approvals**. This change adds a working evidence-capture checklist to **all 116 pending identities** (20 fungal/fruit/tomato, 14 sugar/egg/confectionery, 56 cross-form exclusions, and 26 other blockers) without changing that regulatory status.

- A user's finished-product subtype selection is a research **hypothesis**, never legally verified.
- Operators can mark specific existing positive documentary-evidence prompts as available, keep local notes and export JSON for subsequent specialist review. None of these actions loads or approves a numeric limit.
- Notes remain only in the current browser's local storage (no server upload, sync, or shared approval). A source change invalidates saved evidence checkmarks.
- Exports deliberately contain `first_exact_source_verified:false`, `finished_article_applicability_verified:false`, `numeric_finished_product_limit_applied:false`, `laboratory_pass:false` and `full_compliance_approval:false`.
- Current 533/417/116 source integrity is required at rendering and before saving. Tampering, wrong product identity or changed official source record withholds the checklist.
- Underlying FSSAI Version IX references: https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf ; finished-product identity references are drawn from each corresponding official FSSAI/FoSCoS evidence packet.

This is a documentary collection aid, **not** first-source closure, a determination of article applicability, a product-quality verdict, or a compliant-lot PASS. The 116 remain open until independently supported by the actual finished form, regulatory clause, amendments and lab/sampling basis.

## Code

- `fssai-product-helper-preview-01/fssai-evidence-capture-116.js`
- `fssai-product-helper-preview-01/index.html`
- `tests/fssai-evidence-capture-116-2026-10-12.test.cjs`
- `.github/workflows/verify-fssai-standard-nutrition.yml`
