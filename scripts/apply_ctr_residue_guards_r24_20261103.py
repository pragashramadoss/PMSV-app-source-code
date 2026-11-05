"""R24: Complete residue source counts and add fail-closed cross-article guards."""
import hashlib,json,copy,sys
from pathlib import Path
p=Path(sys.argv[1] if len(sys.argv)>1 else 'fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json')
raw=p.read_bytes()
assert hashlib.sha256(raw).hexdigest()=='75260c6c8cfb9c15234fbeead31b30440abe9e2c28b77247e23c592cdeda0116'
d=json.loads(raw);o=copy.deepcopy(d)
r=d['residue_mrls'];v=d['antibiotic_and_pharmacological_substances'];pv=v['prohibited_veterinary_practice_substances']
assert [x['serial'] for x in r['pesticides']]==list(range(1,214))
assert [x['serial'] for x in v['veterinary_tolerance_limits']['rows']]==list(range(1,50))
assert (sum(len(x['rows']) for x in r['pesticides']),sum(len(x['rows']) for x in v['veterinary_tolerance_limits']['rows']))==(1098,358)
assert r['next_serial']==170 and v['stage']=='parts_1_to_3_complete_veterinary_tolerance_table_pending'
assert len(pv['substances'])==14 and len(v['honey_antibiotic_mrpl']['rows'])==12
assert (pv['default_emrl'],pv['chloramphenicol_emrl']['value'],v['honey_antibiotic_mrpl']['unit'])==({'value':'0.001','unit':'mg/kg'},'0.0003','ug/kg')
mal=next(x for x in r['pesticides'] if x['serial']==114)
assert 'malathion and malaoxon' in mal['name'].lower()
assert {x['food']:x['mrl'] for x in mal['rows']}.items() >= {'Wheat':'10.0','Maize':'0.05','Other food grains':'4','Milled food grains':'1'}.items()
assert r['completeness']=='complete_current_version_ix_section_2_3_1' and v['veterinary_tolerance_limits']['stage']=='complete_current_version_ix'
r['next_serial']=214
v['stage']='complete_current_version_ix_section_2_3_2'
d['r24_residue_regulatory_guards_2026_11_03']={
 'review_date':'2026-11-03','source_url':'https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf',
 'edition':'Version IX (03.02.2026)','pesticide_serial_count':213,'pesticide_article_rows':1098,
 'veterinary_serial_count':49,'veterinary_article_rows':358,'prohibited_veterinary_classes':14,'honey_mrpl_rows':12,
 'pesticide_unfixed_mrl_tolerance':{'limit':0.01,'unit':'mg/kg','requires_no_specific_mrl_fixed_for_pesticide':True,'food_article_and_residue_definition_required':True,'auto_apply':False},
 'veterinary_prohibited_use':{'scope':'meat, meat products, milk, milk products, poultry, eggs, aquaculture and their products','default_emrl_mgkg':0.001,'chloramphenicol_emrl_mgkg':0.0003,'emrl_is_not_permission_for_use':True,'requires_actual_drug_and_metabolite_identity':True,'auto_apply':False},
 'honey_antibiotics':{'use_not_permitted_during_production':True,'mrpl_unit':'ug/kg','mrpl_is_detection_threshold_not_use_authorisation':True,'sample_and_method_required':True,'auto_apply':False},
 'malathion':{'source_serial':114,'residue_definition':'sum of malathion and malaoxon','wheat_grain_mgkg':10,'maize_grain_mgkg':0.05,'other_food_grains_mgkg':4,'milled_food_grains_mgkg':1,'finished_processing_form_required':True,'auto_apply':False},
 'next_deferred_amendment_effective':'2026-12-01','deferred_rules_not_activated_as_of_review':True,
 'current_numeric_limits_modified':False,'full_current_law_complete':False,'full_product_approvals':0,'commercial_release_authorized':False,'production_engine_wired':False}
back=copy.deepcopy(d);back.pop('r24_residue_regulatory_guards_2026_11_03');back['residue_mrls']['next_serial']=170;back['antibiotic_and_pharmacological_substances']['stage']='parts_1_to_3_complete_veterinary_tolerance_table_pending'
assert back==o,'Existing numeric or product data changed'
b=(json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode()
assert hashlib.sha256(b).hexdigest()=='31e5b94800b4427d20a249ae3b99f258c912f248340b1dbe76ceac30d22953bf'
p.write_bytes(b)
from pathlib import Path
out=Path('r24-residue-core-applied');out.mkdir(exist_ok=True)
(out/p.name).write_bytes(b)
(out/'manifest.json').write_text(json.dumps({'status':'PASS','pesticide_source_serials':213,'pesticide_article_rows':1098,'vet_source_serials':49,'vet_article_rows':358,'numeric_source_limits_changed':0,'product_approvals':0,'sha256':hashlib.sha256(b).hexdigest()},indent=2)+'\n')
print('R24 source table preservation PASS; SHA256',hashlib.sha256(b).hexdigest())
