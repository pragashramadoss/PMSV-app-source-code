"""R9 scoped fruit/vegetable corrections, applied only to the existing audit branch.
Core changes are deliberately narrower than the 404-row offline review.
No full-product approval, current-law confirmation or production deployment.
"""
from pathlib import Path
import copy,hashlib,json,sys
B=Path(sys.argv[1]) if len(sys.argv)>1 else Path('.')
D=B/'fssai-product-helper-preview-01/data'
expected={'rules/chapter-2-3-fruit-vegetable-v1.json':'4b2200c2d102d707afec62aa25484883898c6c9b','rules/appendix-b-v2-core.json':'05a9d2a49a32562a6cae59437a2eb2d15cc4e86c','product-master-v1.json':'d9fd9ba65df648f9a141c6f0d29ad8242fdba29f'}
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
obj={};n=0
def ck(x,msg=''):
 global n;n+=1;assert x,msg
for rel,sha in expected.items():
 b=(D/rel).read_bytes();ck(blob(b)==sha,'Preimage changed; reconcile '+rel);obj[rel]=json.loads(b)
before=copy.deepcopy(obj);module=obj['rules/chapter-2-3-fruit-vegetable-v1.json'];micro=obj['rules/appendix-b-v2-core.json'];master=obj['product-master-v1.json'];s={x['key']:x for x in module['standards']}
URL='https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf'
fruit_data=[('Cashew apple',11.5),('Pineapple',10),('Soursop',14.5),('Sugar apple',14.5),('Carambola / starfruit',7.5),('Watermelon',7),('Lime',7),('Lemon',6),('Grapefruit',8),('Sweetie grapefruit',7.5),('Mandarine / tangerine / orange',10),('Sweet orange',10),('Coconut water',4.5),('Melon',4.5),('Casaba melon',7.5),('Honeydew',10),('Quince',11.2),('Crowberry',6),('Suriname cherry',6),('Fig',18),('Strawberry',7.5),('Genipap',17),('Buckthorn / sallowthorn berry',6),('Litchi / lychee',11.2),('Acerola',6.5),('Apple',10),('Crab apple',15.4),('Mango',13.5),('Passion fruit',12),('Date',18.5),('Apricot',10),('Sweet cherry',20),('Sour cherry',14),('Stonesbaer',17),('Plum / quetsche',10),('Prune',18.5),('Nectarine',10.5),('Peach',10),('Sloe',6),('Guava',8.5),('Pomegranate',12),('Pear',10),('Black currant',11),('Red / white currant',10),('Gooseberry',7.5),('Rosehip',9),('Cloudberry',9),('Blackberry',9),('Dewberry',10),('Red raspberry',8),('Loganberry',10.5),('Black raspberry',11.1),('Boysenberry',10),('Youngberry',10),('Elderberry',10.5),('Rowanberry',11),('Caja',10),('Umbu',9),('Tamarind',13),('Cocoa pulp',14),('Cupuacu',9),('Cranberry',7.5),('Bilberry / blueberry',10),('Lingonberry',10),('Grape',16),('Tomato: non-thermal / cold-pressed / fresh only',5),('Sapota',16),('Jamun',9),('Banana',19),('Other fruit',10),('Juice of two or more fruits',10),('Monk fruit',14)]
ck(len(fruit_data)==72)
table=[]
for i,(fruit,tss) in enumerate(fruit_data,1):
 page=13 if i<=15 else 14 if i<=31 else 15 if i<=51 else 16 if i<=68 else 17
 table.append({'source_table_row':i,'fruit':fruit,'tss_min_degree_Brix':tss,'acidity_operator':'>=' if i in [7,8] else '<=','acidity_value_pct':{11:1.2,12:1.1,67:.5,69:1.5,72:.013}.get(i,3.5),'acidity_basis':'malic acid' if i==26 else 'citric acid','source_pages':[page],'scope':'Exact clause 2.3.6 juice identity only; not nectar, puree or industrial concentrate. Botanical identity and current amendments remain separate checks.'})
s['2.3.6']['fruit_juice_table_r9']=table
s['2.3.6']['juice_table_scope_r9']={'actual_fruit_required':True,'coconut_means_water_not_milk':True,'tomato_entry_excludes_thermally_processed_2_3_8':True,'grape_botanical_column_reconciliation_required':True,'source_pages':[12,13,14,15,16,17],'full_regulatory_verification':False}
s['2.3.6']['method_control_r9']={'withdrawn_method':'2.11','manual':'Manual of Methods of Analysis of Foods - Fruit and Vegetable Products','analyte':'fruit content in fruit juices','effective_date':'2026-06-12','source_url':'https://www.fssai.gov.in/upload/advisories/2026/06/6a2bc69152297Fruit%20Content%20Order.pdf','replacement_method_not_assigned':True,'requirement':'Use an appropriately validated recognised method under the order, pending the revised approved method; do not treat the method number alone as an analyte/commodity match.'}
s['2.3.8']['original_notification_check_r9']={'source_url':'https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Fruits_Vegetables_28_11_2017.pdf','notification_date':'2017-11-17','source_pages':[10],'finding':'Original table confirms 10.0% maximum titratable acidity and 42.0% maximum sugar. They are unusual printed values, not permission to ignore other requirements.'}
for k in ['2.3.13','2.3.17']:
 for row in s[k]['relative_composition']:
  row.update(auto_evaluate=False,requires_prescribed_original_identity=True,reference_scope_note='Use the applicable prescribed original-product soluble-solids requirement. An arbitrary measured raw-material value is not a substitute. Exact juice versus pulp/puree and fruit versus vegetable identity must first be established.')
alt=s['2.3.30']['conditional_requirements'][0]
alt.update(condition='Printed 3A wording: below 10% but at least 5%; 2.5% in case of lime or lemon.',source_question='The printed lime/lemon alternative overlaps the main 5% minimum. Do not infer an unstated upper bound or an exclusive naming category without reconciliation.',auto_evaluate=False,source_pages=[36])
for row in s['2.3.31']['composition']:
 if row['parameter'].startswith('Total soluble solids'):
  row['condition']='Ordinary product, not the specifically designated reduced/low-sugar variant.'
s['2.3.31']['reduced_sugar_variant_r9']={'parameter':'Total soluble solids','operator':'<=','value':45,'unit':'% by weight','source_pages':[38],'applies_when':'Specifically designated reduced or low-sugar jam/jelly/marmalade','does_not_waive_other_requirements':True}
s['2.3.31']['scope_exclusion_r9']='The current substituted text excludes products clearly intended and marked for special dietary use; do not restore broader exclusions from a superseded notification.'
s['2.3.26']['reducing_sugar_denominator_r9']='Minimum 25% of total sugar, not 25% of whole-product mass. A ratio calculation must use mutually consistent analytical bases.'
s['2.3.41']['industrial_bulk_pack_exception_r9']={'source_pages':[55],'scope':'Only the stated container-fill requirement is waived for bulk industrial packs under this clause; composition requirements and the separate mango-chutney clause are not waived.'}
for variant in s['2.3.43']['variant_composition']:
 for row in variant.get('composition',[]):
  if variant.get('medium')=='vinegar' and 'Acidity' in row['parameter']:row.update(analytical_matrix='packing medium',source_pages=[56])
  if variant.get('medium')=='brine' and 'Sodium chloride' in row['parameter']:row.update(automatic_comparison_blocked=True,source_question='Establish the exact source sample/denominator for the brine-salt percentage; do not silently use a whole-product or liquid-only basis.')
s['2.3.43']['operative_amendment_reference']['effective_from_r9']='2025-05-01'
fm=micro['product_mappings']['fruits'];changed_exclusions=0
for route in fm['conditional']:
 if route['catalog_id']=='vegetable-juices':
  for option in route.get('options',[]):
   if 'listeria_monocytogenes' in option.get('exclude_criteria',[]):
    option.pop('exclude_criteria');option.update(condition='Pasteurized vegetable juice, including pH below 4.4; fruit-juice exclusion not established',message='Appendix B footnote 4 names pasteurized fruit juices, not vegetable juices. Retain the Listeria criterion unless another exact applicable provision is established.');changed_exclusions+=1
ck(changed_exclusions==1)
new_routes={'2.3.8':['fruit-04a','fruit-07-liquid','fruit-08-liquid'],'2.3.13':['fruit-07','fruit-07-liquid','fruit-08','fruit-08-liquid'],'2.3.22':['fruit-03-liquid','fruit-07-liquid','fruit-08-liquid'],'2.3.21':['fruit-03-liquid','fruit-07-liquid','fruit-08-liquid'],'2.3.42':['fruit-03','fruit-07','fruit-08'],'2.3.25':['fruit-03','fruit-07','fruit-08'],'2.3.26':['fruit-06','fruit-07'],'2.3.11':['fruit-07','fruit-07-liquid','fruit-08','fruit-08-liquid'],'2.3.12':['fruit-07','fruit-07-liquid','fruit-08','fruit-08-liquid'],'2.3.18':['fruit-03','fruit-03-liquid','fruit-07','fruit-07-liquid','fruit-08','fruit-08-liquid'],'2.3.19':['fruit-06'],'2.3.3A':['fruit-07','fruit-08'],'2.3.14':['fruit-07','fruit-07-liquid','fruit-08','fruit-08-liquid'],'2.3.28':['fruit-03','fruit-03-liquid','fruit-07','fruit-07-liquid','fruit-08','fruit-08-liquid'],'2.3.20':['fruit-06'],'2.3.5':['fruit-07-liquid','fruit-08-liquid'],'2.3.15':['fruit-06'],'2.3.27':['fruit-03','fruit-03-liquid','fruit-07','fruit-07-liquid','fruit-08','fruit-08-liquid'],'2.3.29':['fruit-03-liquid','fruit-07-liquid','fruit-08-liquid']}
existing={r['catalog_id'] for kind in ['exact','conditional'] for r in fm[kind]}
profiles={r['id']:r for r in micro['tables']['fruits']['categories']};added=[]
for p in master['catalog_products']:
 if not p.get('rule_file','').endswith('chapter-2-3-fruit-vegetable-v1.json') or p.get('rule_key') not in new_routes or p['id'] in existing:continue
 refs=new_routes[p['rule_key']];ck(all(r in profiles for r in refs));added.append(p['id'])
 fm['conditional'].append({'catalog_id':p['id'],'status':'variant_required','reason':'Conditional category candidates only. Establish actual fruit/vegetable matrix, preservation process, intended use and liquid/non-liquid presentation. An unlisted or composite presentation requires manual category review; no default category is assigned.','options':[{'condition':profiles[r]['name']+'; actual source-definition match required','profile_key':r} for r in refs],'source_pages':[34,35],'reviewed_on':'2026-11-03','automatic_category_assignment':False})
ck(len(added)==24)
fm['no_direct_table_mapping']=[r for r in fm['no_direct_table_mapping'] if r.get('catalog_id') not in added]
for collection in [master['catalog_products'],master['profiles']]:
 for p in collection:
  if p['id'] in added:p.update(microbiology_profile_key='',microbiology_status='conditional_appendix_b_variant_required',microbiology_verified_on='2026-11-03',microbiology_note='R9 adds conditional source-category candidates only. Actual matrix/process/form must be established; no automatic category or release decision.')
micro['tables']['fruits']['source_content_review_r9']={'date':'2026-11-03','primary_plans_checked':63,'liquid_derived_variants_checked':31,'numerical_plans_changed':0,'incorrect_exclusions_removed':1,'new_conditional_routes':24,'full_regulatory_verification':False,'commercial_release_authorized':False}
module['source_review_r9']={'date':'2026-11-03','source_url':URL,'edition':'Version 2 (04.11.2024)','source_sha256':'1e82574ab21d28aab9ea6a1ce083113e0a0fb0c9f775e0ce5d4506d98a8cc6cd','scope':'Selected core corrections only. Full 404-row review, comparative guards and combined viewer are separate offline companions. Existing source statuses and approval restrictions remain unchanged.','current_law_complete':False,'commercial_release_authorized':False}
ck(len(master['catalog_products'])==len({p['id'] for p in master['catalog_products']})==533)
ck(micro['tables']['fruits']['categories']==before['rules/appendix-b-v2-core.json']['tables']['fruits']['categories'])
ck([r['status'] for r in module['standards']]==[r['status'] for r in before['rules/chapter-2-3-fruit-vegetable-v1.json']['standards']])
ck(table[6]['acidity_operator']==table[7]['acidity_operator']=='>=');ck(table[25]['acidity_basis']=='malic acid');ck(table[71]['acidity_value_pct']==.013)
for collection in ['catalog_products','profiles']:
 for a,b in zip(before['product-master-v1.json'][collection],master[collection]):
  ck(a['id']==b['id'])
  if a['id'] not in added:ck(a==b,a['id'])
  else:
   for k,v in a.items():
    if k not in ['microbiology_profile_key','microbiology_status','microbiology_verified_on','microbiology_note']:ck(v==b[k],a['id']+k)
for group in micro['product_mappings']:
 if group!='fruits':ck(micro['product_mappings'][group]==before['rules/appendix-b-v2-core.json']['product_mappings'][group])
for key in micro['tables']:
 if key!='fruits':ck(micro['tables'][key]==before['rules/appendix-b-v2-core.json']['tables'][key])
out=B/'fruit-vegetable-r9-core-applied';out.mkdir(exist_ok=True);files=[]
EXPECTED_OUTPUTS={'rules/chapter-2-3-fruit-vegetable-v1.json':'00e02f9acb49f37e7b8ac5941028b85beaa36cbd3f1aca12305413378944f5d9','rules/appendix-b-v2-core.json':'e797945c0996cd54091e663b0377da6808420e9f514ea5b924190e6ebc9da3e7','product-master-v1.json':'84f24ec89ae9265473caf1f1ee11ecdb8aa6dd8fd051d6e4064792f266d634f8'}
for rel,value in obj.items():
 content=(json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode();sha=hashlib.sha256(content).hexdigest()
 ck(sha==EXPECTED_OUTPUTS[rel],'Generated file differs from locally tested output')
 (D/rel).write_bytes(content);(out/Path(rel).name).write_bytes(content);files.append({'path':rel,'sha256':sha})
report={'passed':n,'failed':0,'source_juice_table_entries':72,'new_conditional_routes':24,'incorrect_exclusions_removed':1,'numeric_sampling_plans_changed':0,'files':files,'scope':'Preimage and selected-core integrity checks only; no full-law, product approval or production deployment.'}
(out/'application-manifest.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
