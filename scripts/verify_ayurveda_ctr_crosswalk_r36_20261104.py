"""R36 structural/source-preservation regression: zero product approval."""
import json
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[1]
def load(path):return json.loads((ROOT/path).read_text())
d=load('fssai-helper/ayurveda-ingredient-ctr-crosswalk-r36-2026-11-04.json')
r35=load('fssai-helper/ayurveda-category-a-recipe-evidence-r35-2026-11-04.json')
r29=load('fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json')
master=load('fssai-product-helper-preview-01/data/product-master-v1.json')
ctr=load('fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json')
assert len(master['catalog_products'])==len({x['id'] for x in master['catalog_products']})==533
assert len(r29['records'])==137 and r29['exact_CTR_product_article_applicability_still_open']==137
assert d['total_catalogue_records']==533 and d['original_exact_CTR_product_article_holds']==137
assert d['recipe_records']==9 and d['original_ingredient_records']==46
assert d['distinct_official_reference_rows']==22
assert d['raw_ingredient_source_reference_links']==67
assert d['method_only_pulse_alternative_records']==2
assert d['whole_product_legal_approvals']==d['full_current_CTR_panels_verified']==0
assert d['exact_finished_product_article_decisions_closed']==0
assert d['production_engine_modified'] is False
assert d['numeric_CTR_rules_modified'] is False
assert d['future_december_CTR_amendment_active_on_review_date'] is False
assert ctr['r15_catalogue_contaminant_layer_review']['products_without_any_exact_current_evidence']==137
source=d['source_rows'];ingredients=d['ingredient_source_crosswalk'];recipes=d['recipe_summaries']
assert len(source)==len({r['source_id'] for r in source})==22
assert len(ingredients)==len({(x['recipe_number'],x['source_ingredient_serial']) for x in ingredients})==46
assert len(recipes)==len({x['recipe_number'] for x in recipes})==9
assert sum(len(x['possible_source_row_ids']) for x in ingredients)==67
assert d['rows_with_any_source_reference']==sum(bool(x['possible_source_row_ids']) for x in ingredients)
rules={r['source_id']:r for r in source}
assert set().union(*(set(r['possible_source_row_ids']) for r in ingredients))==set(rules)
expected={
 'MILK_LEAD':(.02,'mg/kg',5),
 'MILK_AFM1':(.5,'ug/kg',14),
 'MILK_24D':(.05,'mg/kg',16),
 'CEREAL_LEAD':(.2,'mg/kg',3),
 'CEREAL_TOTAL':(15,'ug/kg',14),
 'CEREAL_B1':(10,'ug/kg',14),
 'RICE_24D':(.1,'mg/kg',16),
 'RICE_ACEPHATE':(1,'mg/kg',16),
 'BARLEY_OTA':(5,'ug/kg',15),
 'BARLEY_DON':(1000,'ug/kg',15),
 'PULSE_LEAD':(.2,'mg/kg',5),
 'PULSE_TOTAL':(15,'ug/kg',14),
 'PULSE_B1':(10,'ug/kg',14),
 'MUSTARD_PARATHION':(.01,'mg/kg',30),
 'MUSTARD_CRUDE_LEAD':(.1,'mg/kg',6),
 'MUSTARD_EDIBLE_LEAD':(.1,'mg/kg',6),
 'HONEY_ANTIBIOTIC_BAN':(None,None,40),
 'HONEY_CHLOR_MRPL':(.3,'ug/kg',40),
 'SUGAR_WHITE_LEAD':(.5,'mg/kg',2),
 'SUGAR_HIGH_ASH_LEAD':(5,'mg/kg',2),
 'TURMERIC_LEAD':(10,'mg/kg',6),
 'FOOD_SALT_LEAD':(2,'mg/kg',6)
}
assert {k:(v['limit'],v['unit'],v['pdf_page_one_based']) for k,v in rules.items()}==expected
assert 'dehydrat' in rules['MILK_LEAD']['source_scope_condition'].lower()
assert 'STRICTLY >1.0%' in rules['SUGAR_HIGH_ASH_LEAD']['source_scope_condition']
assert rules['HONEY_ANTIBIOTIC_BAN']['kind']=='USE_PROHIBITION'
assert rules['HONEY_CHLOR_MRPL']['kind']=='METHOD_PERFORMANCE_NOT_ALLOWED_USE'
assert all(r['source_page_image_checked'] for r in source)
assert all(r['source_applies_to_finished_recipe'] is False and
           r['is_full_product_approval'] is False and r['auto_apply_numeric_value'] is False for r in source)
r35_map={(r['recipe_number'],i['serial']):(r,i) for r in r35['records'] for i in r['ingredients']}
for row in ingredients:
 k=(row['recipe_number'],row['source_ingredient_serial'])
 assert k in r35_map
 r,i=r35_map[k]
 assert row['catalogue_id']==r['catalogue_id']
 for col,source_col in [('source_name','source_name'),('source_identity','source_identity'),('source_part_used','part_used'),('source_ratio','source_ratio')]:
  assert row[col]==i[source_col],(k,col)
 assert row['source_ratio_is_QS'] if 'source_ratio_is_QS' in row else True
 assert row['ingredient_row_applicability']=='EVIDENCE_HOLD'
 assert row['all_source_rows_reference_only'] is True
 assert row['whole_product_legally_verified'] is False
 assert row['commercial_batch_release_authorised'] is False
 assert row['actual_SKU_formula_and_species_received'] is False
 assert row['recipe_source_title_method_hold']==(row['recipe_number'] in ('14.6','14.7'))
 for id in row['possible_source_row_ids']:assert id in rules
assert {r['recipe_number'] for r in recipes if r['title_method_source_hold']}=={'14.6','14.7'}
assert all(r['precise_finished_product_CTR_article_adjudicated'] is False and not r['full_product_approved'] for r in recipes)
assert len(d['possible_Kulmasha_method_substitutions'])==2
assert {x['name'] for x in d['possible_Kulmasha_method_substitutions']}=={'Mudga (green gram)','Masha (black gram)'}
assert all(x['in_original_46_ingredient_rows'] is False for x in d['possible_Kulmasha_method_substitutions'])
assert all(x['actual_variant_verified'] is False for x in d['possible_Kulmasha_method_substitutions'])
sourcegroup=Counter(x['source_family'] for x in ingredients)
print(json.dumps({
 'result':'PASS','original_recipe_rows':46,'recipes':9,
 'distinct_conditional_official_rules':22,'source_reference_links':67,
 'linked_ingredient_rows':d['rows_with_any_source_reference'],
 'method_only_variants':2,'recipe_source_holds':['14.6','14.7'],
 'source_groups':dict(sourcegroup),'legal_approvals':0,
 'test_scope':'offline source provenance/guards, not full legal product verification'
},indent=2))
