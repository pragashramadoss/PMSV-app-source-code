"""Apply the core R6 fish corrections on the audit branch only.
The expanded 326-row source review and standalone comparator are in the R6 evidence
package. This script does not claim to reproduce that entire offline companion.
No product or commercial-lot approval is granted.
"""
import copy, hashlib, json, pathlib, subprocess
ROOT=pathlib.Path('.')
BASE=ROOT/'fssai-product-helper-preview-01/data'
EXPECTED={
 'rules/chapter-2-6-fish-v1.json':'d30731d0276cfedbc0472b7461e9f3c12d92d3a955115d6ca72794bd0e4b8576',
 'rules/appendix-b-v2-core.json':'5f60de2219708dc2bb8872794811687a9dcfe1c27d24c67fe064a86eed56ab97',
 'product-master-v1.json':'1b5759b3dae49f565b404c95b4c3e93a276c3479a29459ea24aa423340a7991f'
}
source={'url':'https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_6_Fish_and_Fish_products.pdf','edition':'Version 3 (07.05.2025)','sha256':'e5975724499be68dd77b460fcccfb99fdbcbb56ab5048ca1028b2a51bec8c33c'}
micro_source={'url':'https://www.fssai.gov.in/upload/uploadfiles/files/Appendix%20B%281%29.pdf','edition':'Version 2 (04.11.2024)','sha256':'4b2f41ec2763a9191b4a14aaa12918c8bd3a82b41022ced1e415b05e44812bc7'}
original={}
for rel,sha in EXPECTED.items():
 raw=(BASE/rel).read_bytes()
 assert hashlib.sha256(raw).hexdigest()==sha,'Concurrent source change: reconcile before applying '+rel
 original[rel]=json.loads(raw)
fish,app,master=[copy.deepcopy(original[k]) for k in EXPECTED]
std={s['key']:s for s in fish['standards']}
fish.update(source_version=source['edition'],source_verified_on='2026-11-02')
fish['official_sources'][0]={'authority':'FSSAI','title':'Chapter 2.6 Fish and Fish Products, '+source['edition'],**source}
fish['official_sources'].append({'authority':'FSSAI','title':'21 October 2024 final amendment; fish-oil substitution effective 1 May 2025','url':'https://www.fssai.gov.in/upload/uploadfiles/files/GAZETTE%20NOTIFICATION%20DATED%2021_10_2024_ammendments.pdf','sha256':'7658eb4ddc0b793ffb66d7cecf2ed3d9784727183f64a61fb584d5fd1018c2ad'})
cf=fish['cross_cutting_rules'][0]
cf['limits'].insert(1,{'group':'Group II — Freshwater-origin finfish, crustaceans and molluscans','operator':'<=','value':4,'unit':'mg/kg'})
cf['source_note']='Version 3 PDF p55: the merged 4.0 mg/kg cell spans Groups I and II; p56 defines III=8 and IV=100. Group IV is frozen-stored marine fish products. No generic 100 ppm catch-all is stated in this captured source.'
cf.pop('additional_rule',None)
for r in std['2.6.1(10)']['process_rules']:
 if isinstance(r,dict):
  r['applies_when']={'presentation':'smoke_dried'}
  if 'moisture' in r.get('parameter','').lower():r.update(parameter='Parenthetical smoke-dried moisture; not an OR substitute',automatic_comparison=False,source_question='Moisture-only substitution not established by source.')
for r in std['2.6.1(15)']['process_rules']:
 if isinstance(r,dict) and r.get('parameter')=='Cold-storage temperature':
  r.update(source_text='not less than −23°C',automatic_comparison=False,source_question='Direction requires original-source reconciliation; do not use as a warm-storage pass.');r.pop('operator',None)
for n in [8,11,14]:
 for r in std[f'2.6.1({n})'].get('composition',[]):
  if isinstance(r,dict) and ((n==8 and 'Sodium chloride' in r.get('parameter','')) or(n==11 and 'salt' in r.get('parameter','').lower())or(n==14 and 'acidity' in r.get('parameter','').lower())):
   r['automatic_comparison']=False;r['source_question']='Printed value/operator requires reconciliation; consult R6 normalized source record in the evidence package.'
for r in std['2.6.1(20)']['composition']:
 if r['parameter']=='Traditional-product pH':r.update(automatic_comparison=False,interpretation='Described as typical, not an unconditional rejection threshold.')
for r in std['2.6.1(25)']['physical_ranges']:r.update(automatic_comparison=False,interpretation='Descriptive physical range; not promoted to a mandatory composition limit.')
std['2.6.1(21)']['composition'] += [{'parameter':'Fish flesh in fish sticks only','operator':'>=','value':50,'unit':'%','basis':'average fish flesh / total stick weight','applies_when':{'presentation':'fish_stick'}},{'parameter':'Fish stick thickness','operator':'>=','value':10,'unit':'mm','applies_when':{'presentation':'fish_stick'}}]
std['2.6.1(17)']['quality_rules'].append('Heat used only to open shells does not make cooked-clam identity; heat-shucked microbiology remains a separate decision.')
for cat in app['tables']['fish']['categories']:
 cat['source_review_r6']={'date':'2026-11-02','source':micro_source,'numeric_values_changed':False,'scope':'Independent n/c/m/M transcription and category interpretation; methods not fully validated.'}
 if cat['id']=='fish-14':cat['safety']['listeria_monocytogenes'].update(automatic_comparison=False,source_question='Table 1B prints n=5,c=5,Absent/25g; retain literal source and block automated acceptance.')
clam=next(p for p in master['catalog_products'] if p.get('rule_key')=='2.6.1(17)')
for c in clam.get('microbiology_candidates',[]):
 if c['profile_key']=='fish-05':c['condition']='Raw frozen clam meat not heat-shucked'
 if c['profile_key']=='fish-06':c['condition']='Frozen heat-shucked clam meat, including heat used solely to open shells; cooked identity must be assessed separately'
smoked=next(p for p in master['catalog_products'] if p.get('rule_key')=='2.6.1(10)')
smoked['microbiology_profile_key']='';smoked['microbiology_status']='conditional_source_scope_review_r6'
smoked['microbiology_candidates']=[{'condition':'Hot-smoked fish with complete protein coagulation and exact Appendix B definition confirmed','profile_key':'fish-10'}]
smoked['microbiology_notes']='Cold-smoked, smoke-flavoured and smoke-dried presentations are not automatically assigned fish-10. Resolve exact applicable category.'
app['product_mappings']['exact']=[x for x in app['product_mappings']['exact'] if x.get('catalog_id')!=smoked['id']]
app['product_mappings'].setdefault('conditional',[]).append({'catalog_id':smoked['id'],'status':'conditional_source_scope_review_r6','candidates':copy.deepcopy(smoked['microbiology_candidates']),'notes':smoked['microbiology_notes']})
for row in app['product_mappings'].get('conditional',[]):
 if row.get('catalog_id')==clam['id']:row['source_review_r6']='Distinguish raw non-heat-shucked from frozen heat-shucked; shell-opening heat is not cooked identity.'
# Structural checks are distinct from the independently performed source review.
checks=0
def check(ok):
 global checks;checks+=1;assert ok
check(len(master['catalog_products'])==533)
check(len({p['id'] for p in master['catalog_products']})==533)
for before,after in zip(original['product-master-v1.json']['catalog_products'],master['catalog_products']):
 check(before['id']==after['id'])
 if before['id'] not in [clam['id'],smoked['id']]:check(before==after)
for key in original['product-master-v1.json']:
 if key!='catalog_products':check(master[key]==original['product-master-v1.json'][key])
for key,val in original['rules/appendix-b-v2-core.json']['tables'].items():
 if key!='fish':check(app['tables'][key]==val)
for b,a in zip(original['rules/appendix-b-v2-core.json']['tables']['fish']['categories'],app['tables']['fish']['categories']):
 for layer in ['hygiene','safety']:
  for org,br in b.get(layer,{}).items():
   ar=a[layer][org]
   for k,v in br.items():check(ar[k]==v)
check(next(x for x in cf['limits'] if 'Group II —' in x['group'])['value']==4)
check(smoked['microbiology_profile_key']=='')
check(std['2.6.1(21)']['composition'][-2]['value']==50)
check(app['tables']['fish']['categories'][13]['safety']['listeria_monocytogenes']['automatic_comparison'] is False)
fish['r6_review_provenance']={'date':'2026-11-02','source':source,'scope':'Core corrections applied; expanded 326-row registry and tested comparator retained in the separately supplied R6 evidence package. Not all current law.','current_law_complete':False,'commercial_release_authorized':False}
out=pathlib.Path('fish-r6-applied');out.mkdir(exist_ok=True)
manifest={'scope':'Core repository corrections, not a byte-identical copy of the expanded offline registry. No production deployment.','checks_passed':checks,'failed':0,'catalogue':533,'files':{}}
for rel,d in zip(EXPECTED,[fish,app,master]):
 raw=(json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode();(BASE/rel).write_bytes(raw);(out/pathlib.Path(rel).name).write_bytes(raw)
 manifest['files'][rel]={'before_sha256':EXPECTED[rel],'after_sha256':hashlib.sha256(raw).hexdigest()}
(out/'application-manifest.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps(manifest,indent=2))
