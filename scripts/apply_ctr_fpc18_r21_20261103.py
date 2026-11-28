"""PMSV R21: audit-only FPC18 direction-specific CTR route metadata.
Not a change to active numeric rules, product approval logic, or live decision engine.
"""
from pathlib import Path
import json,hashlib,sys
BASE=Path(sys.argv[1]) if len(sys.argv)>1 else Path('.')
P=BASE/'fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json'
EXPECT_BEFORE='318782a2239749440f749e61c1c853308605b9f88d4b488a311325b384a98537'
raw=P.read_bytes()
assert hashlib.sha256(raw).hexdigest()==EXPECT_BEFORE,'R18 preimage changed; reconcile before touching the module'
c=json.loads(raw)
assert c['r18_unanchored_article_review_2026_11_03']['total_conditional_product_candidates']==55
assert 'r21_fpc18_directive_2026_11_03' not in c
ids=[
'18-18-1-khoa-based-sweets','18-18-1-chhana-based-sweets',
'18-18-1-fermented-milk-products-based-indian-sweets',
'18-18-1-other-composite-milk-products-based-indian-sweets',
'18-18-1-cereal-based-sweets','18-18-1-pulses-based-sweets',
'18-18-1-starch-based-sweets','18-18-1-dry-fruit-and-nuts-based-sweets',
'18-18-1-indian-confections','18-18-1-fruit-and-vegetables-based-sweets',
'18-18-2-cereal-or-pulses-flour-starch-based-snacks-and-savouries',
'18-18-2-fruit-and-vegetable-based-snacks-and-savouries',
]
assert len(ids)==12 and len(set(ids))==12
metals=[
('Lead',2.5,4),('Copper',30,7),('Arsenic',1.1,9),
('Tin',250,11),('Cadmium',1.5,12),('Mercury',1.0,12)]
assert len(metals)==6
c['r21_fpc18_directive_2026_11_03']={
 'audit_date':'2026-11-03',
 'review_status':'OFFICIAL_CATEGORY_DIRECTIVE_SCOPED_2021_SOURCE_EDITION',
 'direction':'https://www.fssai.gov.in/upload/advisories/2021/07/60f6a6554438dDirection_Indian_Sweets_Snacks_20_07_2021.pdf',
 'additional_official_copy':'https://www.fssai.gov.in/upload/advisories/2021/07/60fa3d363276cDirection_Indian_Sweets_Snacks_22_07_2021.pdf',
 'direction_clause':'Section 16(5) Order, clause 4(f)',
 'current_ctr_source':'https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf',
 'current_ctr_edition':'Version IX (03.02.2026)',
 'specific_regulatory_exception':'For qualifying FPC 18 Indian sweets/snacks, direction 4(f) applies the CTR Foods not specified contaminant and heavy-metal category; this corrects the earlier blanket no-default restriction for this category only.',
 'only_if_eligible':[
   'Confirm actual FoSCoS FPC18 identity, SKU, ingredients, processing, primary pack and release matrix',
   'Direction clause 3: FPC18 not applicable to foods already standardized and mapped under FPC 01-14',
   'Confirm the direction remains operative and no newer stricter relevant article or amendment supersedes it',
   'Determine exact analyte, sample/measurement basis, current approved analytical method and measured test results',
 ],
 'covered_catalogue_ids':ids,
 'fpc_18_names_are_not_finished_product_pass':True,
 'category_directed_metal_articles':[
  {'analyte':name,'source_article':'Foods not specified','limit':value,'source_unit':'ppm (mg/kg or mg/L depending on verified matrix)','source_pdf_page':page,'automatic_comparison_allowed':False,'full_product_approval':False} for name,value,page in metals
 ],
 'base_product_microbiology_ref':'Direction clause 4(g) — Appendix B per base product',
 'base_ingredient_toxin_ref':'Direction clause 4(h) — aflatoxins, DON and NOTS per base ingredient',
 'pesticide_rule_ref':'Direction 4(f) — Foods not specified, apply pesticide-specific MRL/processing rules; never blindly apply 0.01 mg/kg where a specific MRL exists',
 'potential_indian_confections_nots':{'product_id':'18-18-1-indian-confections','analyte':'Hydrocyanic acid','limit':5,'unit':'ppm','source_article':'Confectionery','ctr_pdf_page':15,'automatic_comparison_allowed':False,'source_adjudication_required':True},
 'eight_newly_anchored_among_r20_63':8,
 'previous_r20_no_safe_new_source_count':63,
 'remaining_r20_unanchored_after_direction':55,
 'prior_r20_unique_conditional_product_count':74,
 'total_conditional_product_count_after_source_ref':82,
 'prior_R20_source_conditional_rows':162,
 'new_source_conditional_rows':73,
 'total_source_conditional_rows':235,
 'product_specific_exact_article_gaps_unadjudicated':137,
 'full_current_law_complete':False,
 'actual_product_evidence_received':False,
 'commercial_release_authorized':False,
 'current_numeric_rules_changed':False,
 'production_engine_wired':False,
 'december_2026_amendment_not_in_effect_as_of_review':True,
 'other_product_defaults_auto_apply':False,
}
new=(json.dumps(c,ensure_ascii=False,indent=2)+'\n').encode()
EXPECTED_AFTER_SHA='75260c6c8cfb9c15234fbeead31b30440abe9e2c28b77247e23c592cdeda0116'
assert EXPECTED_AFTER_SHA=='__EXPECTED_AFTER_SHA__' or hashlib.sha256(new).hexdigest()==EXPECTED_AFTER_SHA,'R21 output differs from tested reference'
P.write_bytes(new)
out=BASE/'r21-fpc18-audit-core';out.mkdir(exist_ok=True)
(out/P.name).write_bytes(new)
manifest={'run':'R21','date':'2026-11-03','catalogue_identities':533,'fpc18_route_identities':12,'formerly_unanchored_r20_records_now_source_anchored':8,'remaining_r20_unanchored':55,'new_category_metal_rows':72,'new_nots_candidate_rows':1,'full_product_approvals':0,'numeric_limits_changed':0,'no_auto_PASS':True,'sha256':hashlib.sha256(new).hexdigest()}
(out/'application-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))
