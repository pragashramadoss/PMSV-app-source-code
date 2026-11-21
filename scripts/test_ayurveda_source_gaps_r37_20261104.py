"""PMSV R37: independent structural, legal-scope and no-PASS regression test."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads((ROOT/p).read_text())
x=read('fssai-helper/ayurveda-unmapped-ingredient-source-review-r37-2026-11-04.json')
prior=read('fssai-helper/ayurveda-ingredient-ctr-crosswalk-r36-2026-11-04.json')
r35=read('fssai-helper/ayurveda-category-a-recipe-evidence-r35-2026-11-04.json')
m=read('fssai-product-helper-preview-01/data/product-master-v1.json')
assert len(m['catalog_products'])==len({r['id'] for r in m['catalog_products']})==533
assert len(r35['records'])==9
assert len(prior['ingredient_source_crosswalk'])==46
original={ (r['recipe_number'],r['source_ingredient_serial']):r for r in prior['ingredient_source_crosswalk'] }
assert len(original)==46
before={k:v for k,v in original.items() if not v['possible_source_row_ids']}
assert len(before)==24
assert x['original_PMSV_catalogue_count']==533
assert x['original_CTR_article_applicability_holds']==137
assert x['original_Ayurveda_ingredient_rows']==46
assert x['r36_source_reference_links']==67
assert x['r36_rows_with_source_candidates']==22
assert x['previously_without_source_references']==24
assert x['new_named_raw_fruit_source_candidates']==9
assert x['newly_reference_linked_ingredient_instances']==2
assert x['remaining_without_named_source_row_in_this_pass']==22
assert x['new_cumulative_source_links']==76
assert x['new_exact_legal_product_article_decisions_closed']==0
assert x['fully_verified_current_CTR_panels']==0
assert x['product_approvals']==0
assert x['commercial_releases']==0
assert x['numeric_CTR_rules_changed'] is False
assert x['live_PMSV_engine_modified'] is False
assert x['source_product_master_modified'] is False
assert x['audit_branch_only'] is True
assert x['recipe_14_6_and_14_7_source_alignment_hold_preserved'] is True
assert x['pomegranate_flower_not_pomegranate_fruit'] is True
assert x['pomegranate_fruit_metiram_source_reference_NOT_applied']['printed_MRL_mg_kg']=='0.05*'
rows=x['new_official_raw_fruit_source_rows']
assert len(rows)==len({r['source_ref_id'] for r in rows})==9
expected={
 ('Amra phala','Alpha naphthyl Acetic Acid','Mango'):(0.05,17),
 ('Amra phala','Azoxystrobin','Mango'):(0.7,17),
 ('Amra phala','Sum of benomyl and carbendazim expressed as carbendazim','Mango'):(2.0,17),
 ('Amra phala','Carbendazim','Mango'):(5.0,19),
 ('Amra phala','Dithiocarbamates (c) Mancozeb','Mango'):(2.0,24),
 ('Kadali','Sum of benomyl and carbendazim expressed as carbendazim','Banana (whole)'):(1.0,17),
 ('Kadali','Carbendazim','Banana (whole)'):(1.0,19),
 ('Kadali','Dithiocarbamates (d) Metiram as CS2','Banana'):(2.0,24),
 ('Kadali','Diuron','Banana'):(0.1,24)
}
actual={(r['source_printed_ingredient'],r['source_pesticide_analyte'],r['printed_food_article']):
        (r['source_MRL'],r['source_pdf_page_one_based']) for r in rows}
assert actual==expected,(actual,expected)
for r in rows:
 assert r['source_edition']=='Version IX 03.02.2026'
 assert r['pdf_source_page_image_verified'] is True
 assert r['requires_exact_residue_definition_and_method'] is True
 assert r['actual_food_part_and_processing_verified'] is False
 assert r['actual_SKU_source_article_adjudicated'] is False
 assert r['current_original_Gazette_reconciled'] is False
 assert r['legal_finished_product_MRL_confirmed'] is False
 assert r['source_row_auto_apply'] is False
 assert r['full_product_compliant'] is False
 assert r['commercial_batch_release_authorized'] is False
review=x['all_24_prior_no_reference_ingredient_rows']
assert len(review)==len({(r['recipe_number'],r['source_ingredient_serial']) for r in review})==24
assert {(r['recipe_number'],r['source_ingredient_serial']) for r in review}==set(before)
assert sum(len(r['r37_named_source_row_ids']) for r in review)==9
assert sum(bool(r['r37_named_source_row_ids']) for r in review)==2
assert sum(not r['r37_named_source_row_ids'] for r in review)==22
assert len({r['source_ref_id'] for r in rows})==len({id for r in review for id in r['r37_named_source_row_ids']})
for r in review:
 base=before[(r['recipe_number'],r['source_ingredient_serial'])]
 assert r['source_name']==base['source_name'] and r['source_identity']==base['source_identity']
 assert r['recipe_title_method_alignment_lock']==(r['recipe_number'] in ('14.6','14.7'))
 assert r['r37_source_scope_guard']
 assert r['source_identity_confirmed_for_actual_SKU'] is False
 assert r['source_ingredient_use_legally_cleared'] is False
 assert r['finished_food_MRL_article_decided'] is False
 assert r['complete_current_residue_panel_reviewed'] is False
 assert r['full_product_legally_verified'] is False
 assert r['commercial_release_authorized'] is False
 assert r['auto_apply_limits'] is False
 if r['r37_named_source_row_ids']:
  assert r['recipe_number']=='14.6'
  assert r['source_name'] in ('Kadali','Amra phala')
pomegranate=[r for r in review if r['source_name']=='Dadima']
assert len(pomegranate)==1
assert pomegranate[0]['r37_named_source_row_ids']==[]
assert 'flower' in pomegranate[0]['r37_source_scope_guard'].lower()
assert not any(r['source_printed_ingredient']=='Dadima' for r in rows)
print(json.dumps({'status':'PASS','source_rows':9,'ingredient_instances_anchored':2,
 'remaining_unanchored':22,'total_reference_links':76,
 'pomegranate_flower_source_guard':'active','original_legal_decisions_open':137,
 'approved_products':0,'checks':'source provenance, overlapping residues and no-PASS'},indent=2))
