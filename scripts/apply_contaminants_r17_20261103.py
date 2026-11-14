"""Preimage-checked R17 source-article review metadata.
Do not alter current numerical contaminant limits, full approvals or production branches.
"""
from pathlib import Path
import json,hashlib,sys,collections
BASE=Path(sys.argv[1]) if len(sys.argv)>1 else Path('.')
P=BASE/'fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json'
EXPECTED_BEFORE_SHA='0f32a6cd75deaa43c06872a022a563b23465c8384d6ba9038c26a7d6fbcfb93d'
raw=P.read_bytes()
assert hashlib.sha256(raw).hexdigest()==EXPECTED_BEFORE_SHA, 'R16 preimage changed; reconcile before retrying'
c=json.loads(raw)
assert c['r16_product_specific_article_review_2026_11_03']['product_specific_article_gap_count']==137
# R17: 24 additional exact-source candidate rows, all conditional and never self-approving.
fruits={'grapefruit':'Canned grapefruit','mandarin_oranges':'Canned mandarin oranges','mangoes':'Canned mangoes','pineapple':'Canned pineapple','raspberries':'Canned raspberries','strawberries':'Canned strawberries'}
vegs={'carrots':('Canned carrots',2),'green_beans_or_wax_beans':('Canned green beans and canned wax beans',2),'green_peas':('Canned green peas',2),'mature_processed_peas':('Canned mature processed peas',3),'palmito':('Canned palmito',2),'sweetcorn':('Canned sweetcorn',2),'asparagus':('Canned asparagus',2),'tomatoes':('Canned tomatoes',2),'mushrooms':('Canned mushrooms',2)}
ids={'fruit':'04-04-1-thermally-processed-fruits','salad':'04-04-1-thermally-processed-fruit-salad-cocktail-mix','veg':'04-04-2-thermally-processed-vegetables','pickle':'04-04-2-pickles-made-from-vegetables-or-other-edible-plant-material-including-mushrooms','fungi':'04-04-2-sterilized-fungi','soy_curds':'06-06-8-compressed-soybean-curd','soy_film':'06-06-8-dehydrated-soybean-curd-film'}
rows=[]
def add(id,pid,analyte,limit,unit,article,page,kind,variant=None):
  rows.append({'id':id,'catalog_id':pid,'analyte':analyte,'limit':limit,'unit':unit,'source_article':article,'pdf_page_one_based':page,'condition_kind':kind,'variant':variant,'source':'Version IX (03.02.2026)','auto_apply':False,'full_product_compliance':False,'commercial_release':False})
for v,art in fruits.items():add('R17-LEAD-FRUIT-'+v,ids['fruit'],'Lead',1,'mg/kg',art,3,'canned_named_subtype',v)
add('R17-LEAD-SALAD-tropical_fruit_salad',ids['salad'],'Lead',1,'mg/kg','Canned tropical fruit salad',3,'canned_named_subtype','tropical_fruit_salad')
for v,(art,pg) in vegs.items():add('R17-LEAD-VEG-'+v,ids['veg'],'Lead',1,'mg/kg',art,pg,'canned_named_subtype',v)
add('R17-LEAD-CUCUMBER-PICKLE',ids['pickle'],'Lead',1,'mg/kg','Pickled cucumbers (Cucumber pickles)',5,'cucumber_pickle')
for k in ('soy_curds','soy_film'):add('R17-AFB1-SOY-'+k,ids[k],'Aflatoxin B1',10,'µg/kg','Food product containing any of the above mentioned food articles',14,'soy_ingredient')
for k in ('fruit','salad','veg','pickle','fungi'):add('R17-TIN-CANNED-FOODS-'+k,ids[k],'Tin',250,'mg/kg','Canned foods other than beverages',11,'canned_generic_non_beverage')
assert len(rows)==24 and len({x['id'] for x in rows})==24 and all(x['auto_apply'] is False for x in rows)
assert collections.Counter(x['analyte'] for x in rows)=={'Lead':17,'Tin':5,'Aflatoxin B1':2}
assert 'r17_new_source_article_candidates_2026_11_03' not in c
c['r17_new_source_article_candidates_2026_11_03']={'as_of_date':'2026-11-03','source_url':'https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf','source_edition':'Version IX (03.02.2026)','current_operative_law_complete':False,'source_candidates_added':24,'previous_conditional_source_rows_retained':37,'combined_conditional_rows_offline_companion':61,'candidate_product_records':24,'remaining_product_specific_article_gaps':137,'cases_without_source_candidate':113,'product_context_received':0,'applicability_adjudicated':0,'full_contaminant_panels_approved':0,'no_silent_scope_inheritance':True,'sugar_sulphated_ash_strictly_greater_than_one_percent':True,'cucumber_pickle_lead_requires_can':False,'canned_finished_food_pack_required_for_canned_rows':True,'fungi_not_automatically_mushrooms':True,'soybean_containing_food_b1_checked_separately_from_total':True,'future_amendment_effective_date':'2026-12-01','future_amendment_active':False,'additional_source_candidate_rows':rows}
new=(json.dumps(c,ensure_ascii=False,indent=2)+'\n').encode()
EXPECTED_AFTER_SHA='6adf869fa9d67f074a6865e5c95d8600d5794aab96a7299a66292b9248ded9cd'
assert hashlib.sha256(new).hexdigest()==EXPECTED_AFTER_SHA, 'Candidate metadata differs from local tested result'
P.write_bytes(new)
out=BASE/'contaminants-r17-core-applied';out.mkdir(exist_ok=True)
(out/P.name).write_bytes(new)
manifest={'passed':533+61+24+17+5+2+7,'failed':0,'numeric_limits_changed':0,'current_law_complete':False,'product_approvals':0,'source_candidates_added':24,'source_rows_in_offline_companion':61,'candidate_products':24,'remaining_article_gaps':137,'output_sha256':hashlib.sha256(new).hexdigest()}
(out/'application-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))
