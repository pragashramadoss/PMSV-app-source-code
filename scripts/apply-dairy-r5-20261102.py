"""Apply reviewed R5 dairy corrections on the audit branch only. No approval changes."""
from pathlib import Path
import json,copy,re,hashlib,os
BASE=Path(os.environ.get('PMSV_R5_TEST_ROOT','.'))
RULES=BASE/'fssai-product-helper-preview-01/data/rules'
OUTPUT=BASE/'dairy-r5-applied';OUTPUT.mkdir(exist_ok=True)
EXPECTED={'chapter-2-1-dairy-v1.json': {'before': '73dae126ba7b801149a952a3d7c2a0e0610b9b9e', 'after': '2546fbac87d679dd0be3361da4e8e7d2a87eedbcb6c5b8b99f163486b44714e3'}, 'appendix-b-v2-core.json': {'before': '0d66aff5d970b81be179688369e3d2a6d86a4e59', 'after': '5f60de2219708dc2bb8872794811687a9dcfe1c27d24c67fe064a86eed56ab97'}}
for name,h in EXPECTED.items():
 raw=(RULES/name).read_bytes()
 assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==h['before'],f'Preimage changed: {name}'
before=json.loads((RULES/'chapter-2-1-dairy-v1.json').read_text());M0=json.loads((RULES/'appendix-b-v2-core.json').read_text())
mod=copy.deepcopy(before);mb=copy.deepcopy(M0);S={s['key']:s for s in mod['standards']};BATCH='DAIRY_R5_2026_11_02'
URL='https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_1_Dairy_products_and_analogues.pdf'
MURL='https://www.fssai.gov.in/upload/uploadfiles/files/Appendix%20B%281%29.pdf'
GAZ='https://fssai.gov.in/upload/notifications/2024/10/671b28f9586dfGAZETTE%20NOTIFICATION%20DATED%2021.10.2024.pdf'
SHA='dfb7d059cdc37091e1bbe2adab200e7844acd637ac97a4e0a1949072a03923d7'
MSHA='4b2f41ec2763a9191b4a14aaa12918c8bd3a82b41022ced1e415b05e44812bc7'
PAGES={1:[1,2,3,4,5,6,7,8],2:[9,10,11],3:[13],4:[15,16,17],5:[18,19],6:[20],7:[23,24,25],8:[27,28],9:[30,31],10:[32,33],11:[36,37],12:[39],13:[41,43,44,45,46],14:[49,50,51],15:[52,53,54],16:[56,57],17:[58,59,60,61,62,63,64,65,66,67,68,69],18:[70,71],20:[73],21:[74,75],22:[75,76],23:[77,78,79],24:[80,81]}
# Correct the operative dairy amendments; do not restore superseded rows.
S['2.1.6']['composition'][0]['milk_fat_dry_matter_min_pct']=27
S['2.1.6']['amendment_evidence']={'url':GAZ,'pdf_pages':[24],'effective_from':'2025-05-01','change':'30.0 replaced by 27.0 percent milk fat on dry matter basis'}
# Restore omitted analytical rows in the milk-fat-products table.
for v,ffa,pv in zip(S['2.1.8']['composition'],[.4,.3,2],[.6,.3,None]):
 v['free_fatty_acids_as_oleic_acid_max_pct']=ffa
 if pv is not None:v['peroxide_value_max_meq_oxygen_per_kg_fat']=pv
 v['baudouin_test']='Negative';v['beta_sitosterol']='Absent'
g=S['2.1.8']['composition'][2];g.update(iodine_value_min=25,iodine_value_max=38,saponification_value_min=205,saponification_value_max=235)
S['2.1.8']['ghee_fatty_acid_profile']=[{'fatty_acid':n,'min_pct_total_fatty_acids':lo,'max_pct_total_fatty_acids':hi} for n,lo,hi in [('C4:0',1,5),('C6:0',.5,2.2),('C8:0',.4,1.5),('C10:0',.8,5),('C12:0',1.5,4),('C14:0',6,13),('C16:0',22,38),('C18:0',8,19),('C16:1 cis-9',.9,2.8),('C18:1 cis-9',19,32),('C18:2 cis-9,12',.5,3.5),('C18:3 cis-9,12,15',.3,1)]]
S['2.1.8']['analytical_notes']=['Beta-sitosterol absence refers to the RP-HPLC method specified in the footnote (FSSAI notification dated 25 March 2019); method validity and detection capability still require separate review.','A dash is not a zero: the table does not specify a ghee peroxide-value number.','Ghee-specific iodine, saponification and fatty-acid rows must not transfer to butter oil or anhydrous milk fat.']
# Dairy-whitener rows, preserving the stated transition note rather than assuming it remains active.
for i,v in enumerate(S['2.1.11']['composition']):
 v.update(insolubility_index_max_ml=1.5,total_ash_max_pct_moisture_added_sugar_fat_free_basis=9.3,acid_insoluble_ash_max_pct=.1,added_sugar_as_sucrose_max_pct=18,titratable_acidity_as_lactic_acid_max_pct=1.2 if i==3 else 1.5,scorched_particles_max='Disc B')
S['2.1.11']['sugar_transition_note']='Source page 37 permits 24% added sugar for two years from the final notification. Do not activate a new two-year window from this review or from the compendium date. Exact notification/extension reconciliation is not complete here.'
S['2.1.14']['dried_mix_rule']='On prescribed addition of water, dried ice cream mix conforms to the applicable composition EXCEPT the weight-per-litre requirement; Appendix A additive limits apply after reconstitution.'
S['2.1.14']['portion_rule']='When a non-dairy coating, base or layer forms a separate part, the dairy ice-cream / milk-ice / milk-lolly portion alone is assessed against its composition.'
S['2.1.15']['protein_conversion_factor']=6.25
S['2.1.15']['portion_rule']='When a coating, base or layer of non-dairy ingredients forms a separate part, only the frozen-dessert portion is assessed against the corresponding composition.'
# Cheese rows manually transcribed from pages 64-68, with no interpolation across varieties.
cheese=[]
def cv(name,moist=None,fat=None,lactose=None,**extra):
 d={'variant':name}
 if moist is not None:d['moisture_max_pct']=moist
 if fat is not None:d['milk_fat_dry_matter_min_pct']=fat
 if lactose is not None:d['lactose_max_pct']=lactose
 d.update(extra);cheese.append(d)
for name,m,f in [('Hard-pressed cheese',39,48),('Semi-hard cheese',45,40),('Semi-soft cheese',52,45),('Soft cheese',80,20),('Extra-hard cheese',36,32),('Extra Hard Grating Cheese',36,32),('Cheddar',39,48),('Danbo',39,45),('Edam',46,40),('Gouda',43,48),('Havarti',48,45),('30% Havarti',53,30),('60% Havarti',60,60),('Tilsiter',47,45),('30% Tilsiter',53,30),('60% Tilsiter',39,60),('Cottage Cheese',80,None),('Creamed Cottage Cheese',80,None),('Cream Cheese',55,70),('Coulommiers',56,46),('30% Camembert',62,30),('40% Camembert',59,40),('45% Camembert',57,45),('55% Camembert',52,55),('Brie',56,40),('Saint Paulin',56,40),('Samsoe',44,45),('30% Samsoe',50,30),('Emmental',40,45),('Smoked Provolone',45,45),('Unsmoked Provolone',47,45)]:cv(name,m,f)
next(v for v in cheese if v['variant']=='Creamed Cottage Cheese')['milk_fat_min_pct']=4
cv('Processed Cheese - standard',47,40,5)
cv('Processed Cheese - chiplets or packed sliced in non-tin pack',50,40,5)
for moist,fat in [(60,50),(70,30),(75,25)]:cv(f'Processed Cheese Spread - paired row {moist}/{fat}',moist,fat,5)
cv('Creamed Whey Cheese',fat=33)
cv('Whey Cheese',fat=10,milk_fat_dry_matter_lt_pct=33)
cv('Skimmed Whey Cheese',milk_fat_dry_matter_lt_pct=10)
cv('Soft Cheese in Brine',fat=40);cv('Semi-hard Cheese in Brine',fat=40)
S['2.1.17']['composition']=cheese
S['2.1.17']['mozzarella_table']=[{'fat_in_dry_matter_min_pct':a,'fat_in_dry_matter_lt_pct':b,'low_moisture_min_dry_matter_pct':l,'high_moisture_min_dry_matter_pct':h,'designation':name} for a,b,l,h,name in [(18,30,34,None,'Partially skimmed'),(20,30,None,24,'Partially skimmed'),(30,40,39,26,'Medium fat'),(40,45,42,29,'Medium fat'),(45,50,45,31,'Full fat'),(50,60,47,34,'Full fat'),(60,85,53,38,'High fat')]]
S['2.1.17']['amendment_evidence']={'url':GAZ,'pdf_pages':[24,25,26],'effective_from':'2025-05-01','changes':['Old generic Mozzarella and Pizza Cheese rows omitted','Three paired processed-cheese-spread rows substituted','Moisture-type/FDM-dependent Mozzarella Table 2 introduced']}
S['2.1.17']['composition_scope_notes']=['Named-variety rows take their own exact scope. Generic texture rows require classification; ripened or mould-ripened does not alone choose one texture row.','Processed spread moisture/fat/lactose values form coupled alternatives; do not independently select 75% moisture and 50% fat minima from different rows.','Creamed cottage cheese minimum fat 4% is on product mass, unlike the dry-matter fat column.','Mozzarella requires actual FDM and low/high-moisture identity. No extrapolation at FDM >=85%.','No new limit is inferred for omitted Pizza Cheese; determine its actual standardized identity.']
S['2.1.17']['validation_state']='Principal composition tables and amended conditional rows reviewed against identified source editions; no full current-law confirmation.'
# Source-basis notes deliberately do not change correctly stored IgG-specific requirements.
for key in ['2.1.10','2.1.12','2.1.18','2.1.24']:
 S[key]['water_basis_note']='Moisture excludes water of crystallization of lactose, as specified in the source footnote.'
S['2.1.20']['ph_basis']='10% solution';S['2.1.23']['analytical_note']='IgG is not total immunoglobulins. Existing IgG limits 1.8% / 8.5% are preserved.'
mod['official_sources'].insert(0,{'authority':'FSSAI','title':'Chapter 2.1 Version 3 (07.05.2025)','url':URL,'sha256':SHA,'pdf_pages':81})
mod['official_sources'].append({'authority':'FSSAI','title':'First Amendment Regulations 2024, notification 21 October 2024','url':GAZ,'relevant_pdf_pages':[24,25,26]})
mod['source_verified_on']='2026-11-02'
for s in mod['standards']:
 if s['key']=='2.1.19':continue
 n=int(s['key'].split('.')[-1]);s['source_content_review']={'batch_id':BATCH,'date':'2026-11-02','source_url':URL,'source_sha256':SHA,'edition':'Version 3 (07.05.2025)','pdf_pages':PAGES[n],'scope':'Principal composition, selected conditional requirements and source-link applicability; not complete current-law reconciliation.','current_law_complete':False,'commercial_release_authorized':False}
# Independently transcribed microbiological expectations, excluding infant rows 8a/8b/8c.
C={c['id']:c for c in mb['tables']['milk']['categories']};expected={}
def e(cat,stage,org,n,c,m,M,unit):expected[(cat,stage,org)]=(n,c,m,M,unit)
def h(cat,org,c,m,M=None,unit='cfu/g'):e(cat,'hygiene',org,5,c,m,M,unit)
def a(cat,org,portion=25,unit='g'):e(cat,'safety',org,5,0,f'Absent/{portion if portion!=1 else ""}{unit}',None,'qualitative')
h('milk-01','aerobic_plate_count',3,30000,50000,'cfu/ml');h('milk-01','coliform_count',0,'<10/ml',unit='cfu/ml')
h('milk-02','aerobic_plate_count',3,50000,75000);h('milk-02','coliform_count',0,'<10/g')
h('milk-05','aerobic_plate_count',3,500,1000)
for x in ['coliform_count','staphylococcus_aureus','yeast_and_mold_count']:h('milk-05',x,0,'<10/g')
for cat,rows in {
 'milk-06':[('aerobic_plate_count',3,25000,50000),('coliform_count',2,10,20),('staphylococcus_aureus',2,10,50),('yeast_and_mold_count',3,20,50),('escherichia_coli',0,'Absent/g',None)],
 'milk-07':[('aerobic_plate_count',2,30000,50000),('coliform_count',2,10,50),('staphylococcus_aureus',2,10,100),('yeast_and_mold_count',0,50,None)],
 'milk-09':[('aerobic_plate_count',3,100000,200000),('coliform_count',3,10,100),('staphylococcus_aureus',2,10,100),('escherichia_coli',0,'Absent/g',None)],
 'milk-10':[('aerobic_plate_count',2,25000,50000),('coliform_count',0,'<10/g',None),('staphylococcus_aureus',0,'<10/g',None)],
 'milk-11':[('coliform_count',3,100,500),('staphylococcus_aureus',3,10,100),('yeast_and_mold_count',3,100,500),('escherichia_coli',0,'<10/g',None)],
 'milk-12':[('coliform_count',2,10,100),('staphylococcus_aureus',2,10,100),('yeast_and_mold_count',3,50,100),('escherichia_coli',0,'Absent/g',None)],
 'milk-13':[('aerobic_plate_count',3,150000,350000),('coliform_count',3,10,100),('staphylococcus_aureus',3,10,100),('yeast_and_mold_count',3,50,150),('escherichia_coli',0,'<10/g',None)],
 'milk-14':[('aerobic_plate_count',3,25000,75000),('coliform_count',2,50,100),('staphylococcus_aureus',3,10,100),('yeast_and_mold_count',3,10,50),('escherichia_coli',0,'<10/g',None)]}.items():
 for org,c,m,M in rows:h(cat,org,c,m,M,'qualitative' if isinstance(m,str) and m.startswith('Absent') else 'cfu/g')
for n in [1,2,5,6,7,9,10,11,12,13,14]:
 cat=f'milk-{n:02d}';a(cat,'salmonella',25,'ml' if n==1 else 'g');a(cat,'listeria_monocytogenes',25 if n in [1,2,10,11] else 1,'ml' if n==1 else 'g')
e('milk-07','safety','bacillus_cereus',5,3,500,1000,'cfu/g');e('milk-07','safety','sulphite_reducing_clostridia',5,3,50,100,'cfu/g')
norm=lambda x:re.sub(r'\s+','',str(x)).lower()
for (cat,stage,org),exp in expected.items():
 raw=C[cat][stage][org];got=tuple(raw[k] for k in ['n','c','m','M','unit'])
 assert tuple(map(norm,got))==tuple(map(norm,exp)),(cat,stage,org,got,exp)
actual={(c['id'],stage,org) for c in C.values() if c['id'] not in ['milk-08a','milk-08b','milk-08c'] for stage in ['hygiene','safety'] for org in c.get(stage,{})}
assert actual==set(expected)
micro=[]
for (cat,stage,org),values in expected.items():
 raw=C[cat][stage][org];r=dict(raw,id=f'{cat}:{stage}:{org}',category=cat,category_name=C[cat]['name'],stage=stage,organism=org,source_url=MURL,source_pdf_pages=list(range(11,21)),source_edition='Version 2 (04.11.2024)',method_identifiers=mb['tables']['milk']['reference_methods'][org])
 if isinstance(r['m'],str) and r['m'].startswith('<'):r['strict_upper']=float(re.search(r'[\d.]+',r['m']).group())
 if r['unit']=='qualitative':
  mm=re.search(r'Absent/\s*(\d+)?\s*(ml|g)',r['m'],re.I);assert mm;r['test_portion']=int(mm.group(1) or 1);r['test_portion_unit']=mm.group(2).lower()
 if cat=='milk-07' and org=='yeast_and_mold_count':r['required_scope']={'is_casein_powder':True}
 if cat=='milk-11' and org=='yeast_and_mold_count':r['required_scope']={'is_mould_ripened':False}
 if cat=='milk-06' and org=='aerobic_plate_count':r['required_scope']={'is_ripened_butter':False}
 micro.append(r)
 C[cat][stage][org]['r5_source_controls']={k:r[k] for k in ['strict_upper','test_portion','test_portion_unit','required_scope'] if k in r}
sterility=[{'category':'milk-03','requirement':'Commercial sterility','method':'IS 4238 Appendix C or D','source_pdf_pages':[15]},{'category':'milk-04','requirement':'Commercial sterility','method':'IS 4884','source_pdf_pages':[15]},{'category':'milk-05','requirement':'Accelerated storage test','method':'IS 1166 (latest version)','source_pdf_pages':[18,19]}]
mb['tables']['milk']['r5_source_review']={'date':'2026-11-02','scope':'Non-infant rows 1-7 and 9-14 only; exact stored sampling values independently matched; conditional and strict/portion controls added.','numeric_plans_checked':len(micro),'additional_noncount_requirements':sterility,'current_law_complete':False,'commercial_release_authorized':False}
route_evidence={
 '01-01-3-milk-protein-concentrate':('2.1.21(4)',75,'milk powder'),
 '01-01-8-whey-protein-concentrate':('2.1.22(4)',76,'whey-based powder'),
 '01-01-5-dairy-permeate-powders':('2.1.24(4)',81,'milk powders'),
 '100-100-cow-or-buffalo-colostrum-and-colostrum-products':('2.1.23(4)',78,'milk powder')}
milk_routes=mb['product_mappings']['milk']
for cid,(clause,page,article) in route_evidence.items():
 old=[x for x in milk_routes['no_direct_table_mapping'] if x.get('catalog_id')==cid];assert len(old)==1
 milk_routes['no_direct_table_mapping']=[x for x in milk_routes['no_direct_table_mapping'] if x.get('catalog_id')!=cid]
 entry={'catalog_id':cid,'profile_key':'milk-07','status':'mapped_explicit_chapter_cross_reference','note':f'Chapter {clause}, PDF page {page}, explicitly refers this product to Appendix B requirements for {article}. This is a regulatory cross-reference, not an inferred ingredient equivalence. Footnote 3 yeast/mould applies only to casein powder and is excluded.','exclude_criteria':['yeast_and_mold_count'],'source_url':URL,'source_clause':clause,'source_pdf_pages':[page],'current_law_complete':False}
 if 'colostrum' in cid:entry['matrix_scope_note']='The chapter cross-reference is unqualified, including liquid and powdered colostrum. Preserve the source g-based test units/portions; liquid-matrix sampling and method suitability require explicit assessment. Never silently substitute ml or a liquid-milk table.'
 milk_routes['exact'].append(entry)
bid='01-01-1-buttermilk-plain';old=[x for x in milk_routes['exact'] if x.get('catalog_id')==bid];assert len(old)==1
milk_routes['exact']=[x for x in milk_routes['exact'] if x.get('catalog_id')!=bid]
milk_routes['conditional'].append({'catalog_id':bid,'status':'conditional_identity_required','note':'Do not assume a plain-buttermilk name establishes a fermented-milk identity. Confirm process, composition and actual product route.','options':[{'when':'Confirmed fermented-milk product/drink meeting Chapter 2.1.13 identity','profile_key':'milk-12'},{'when':'Butter-churning residual liquid or identity not established','requires_source_scope_review':True}],'source_url':URL,'source_clause':'2.1.13','source_pdf_pages':[41],'current_law_complete':False})
# Every modified byte must reproduce the locally tested JSON; unrelated tables are retained.
for name,data in [('chapter-2-1-dairy-v1.json',mod),('appendix-b-v2-core.json',mb)]:
 raw=(json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode()
 assert hashlib.sha256(raw).hexdigest()==EXPECTED[name]['after'],f'Output mismatch: {name}'
 (RULES/name).write_bytes(raw);(OUTPUT/name).write_bytes(raw)
assert len(micro)==66
assert all(s.get('source_content_review',{}).get('commercial_release_authorized') is not True for s in mod['standards'])
for k in M0['tables']:
 if k!='milk':assert M0['tables'][k]==mb['tables'][k]
for c0,c1 in zip(M0['tables']['milk']['categories'],mb['tables']['milk']['categories']):
 if c0['id'].startswith('milk-08'):assert c0==c1
summary={'files':EXPECTED,'non_infant_microplans_independently_matched':66,'explicit_cross_references_restored':4,'buttermilk_unconditional_route_removed':1,'scope':'Source-edition corrections only. No full-law or release approvals; no live deployment.'}
(OUTPUT/'application-manifest.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
