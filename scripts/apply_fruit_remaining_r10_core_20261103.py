"""Apply selected R10 source-edition corrections on the draft audit branch.
This does not deploy, approve products, or activate a new decision engine.
The complete 365-row registry and combined viewer are separate companions.
"""
from pathlib import Path
import copy, hashlib, json, sys
ROOT=Path(sys.argv[1]) if len(sys.argv)>1 else Path('.')
D=ROOT/'fssai-product-helper-preview-01/data';P=D/'rules/chapter-2-3-fruit-vegetable-v1.json'
raw=P.read_bytes();sha=lambda b:hashlib.sha256(b).hexdigest()
assert sha(raw)=='03b90ee40a818064ea50946342ded18934ed0bc8c610b98412a5c64861adbd06','Changed chapter preimage: reconcile, do not overwrite'
master_bytes=(D/'product-master-v1.json').read_bytes();micro_bytes=(D/'rules/appendix-b-v2-core.json').read_bytes()
assert sha(master_bytes)=='84f24ec89ae9265473caf1f1ee11ecdb8aa6dd8fd051d6e4064792f266d634f8'
assert sha(micro_bytes)=='e797945c0996cd54091e663b0377da6808420e9f514ea5b924190e6ebc9da3e7'
m=json.loads(raw);before=copy.deepcopy(m);s={x['key']:x for x in m['standards']};checks=3
URL='https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf'
SOURCE_SHA='1e82574ab21d28aab9ea6a1ce083113e0a0fb0c9f775e0ce5d4506d98a8cc6cd'
REGISTRY_SHA='c166919ecaab92d2e832873022f58adf45d7621c5a901d665d1091e35bdd37cd'
KEYS={f'2.3.{i}' for i in list(range(35,47))+list(range(49,66))}|{f'2.3.47({i})' for i in range(1,9)}
assert len(KEYS)==37
changed=set()
def ck(ok):
 global checks
 checks+=1
 assert ok

def row(key,parameter):
 found=[r for r in s[key]['composition'] if r['parameter']==parameter];ck(len(found)==1);changed.add(key);return found[0]

def add(key,r):
 ck(not any(x['parameter']==r['parameter'] for x in s[key]['composition']));s[key]['composition'].append(r);changed.add(key)

def meta(r,page,basis,matrix='finished product'):
 r.update(source_pages=[page],analytical_basis=basis,analytical_matrix=matrix)
# Correct applicability; the 8/5 values were already correct.
r=row('2.3.36','Moisture — all dehydrated vegetables');r['parameter']='Moisture — non-powder dehydrated vegetables';r.update(applies_to='Non-powder forms',automatic_comparison_requires_variant=True);meta(r,40,'finished product mass')
r=row('2.3.36','Moisture — powders of vegetables');r.update(applies_to='Vegetable powder',automatic_comparison_requires_variant=True);meta(r,40,'finished product mass')
# Restore missing vanilla ash rows; apply to all three source forms.
for parameter,value in [('Total ash — pods/cut/powder',5),('Acid-insoluble ash — pods/cut/powder',1)]:
 add('2.3.50',{'parameter':parameter,'operator':'<=','value':value,'unit':'% dry basis','analytical_basis':'dry matter mass','source_pages':[76]})
meta(row('2.3.50','Vanillin content — pods/cut/powder'),76,'wet product mass')
# Extracted oil is not whole-product mass. Preserve the original values.
meta(row('2.3.45','Total acidity of extracted oil as lauric acid'),63,'extracted oil mass','extracted oil')
row('2.3.45','Foreign matter').update(test_portion_g=100,not_a_numeric_zero=True,source_pages=[63])
# Coconut milk powder: dry-matter fat, extracted-fat acidity and actual bulk density.
for r in s['2.3.63']['composition']:
 if 'Fat'==r['parameter'] or 'Fat on dry basis'==r['parameter'] or ('fat' in r['parameter'].lower() and 'acid' not in r['parameter'].lower() and 'free' not in r['parameter'].lower() and 'ffa' not in r['parameter'].lower()):meta(r,105,'dry matter mass');changed.add('2.3.63')
 if 'lauric' in r['parameter'].lower():meta(r,105,'extracted fat mass','extracted fat');changed.add('2.3.63')
# Add exact container-capacity rules; not percentages of net product weight.
s['2.3.61']['container_requirements_r10']={
 'source_pages':[95,96], 'reference_temperature_C':20,
 'fill_min_pct_water_capacity_after_necessary_GMP_headspace':90,
 'headspace_must_be_established_not_assumed_zero':True,
 'drained_weight_applies_to':'Product packed in liquid packing medium',
 'drained_weight_denominator':'Mass of distilled water at 20 C filling the sealed container',
 'drained_weight_variants':[{'water_capacity_ml_less_than':300,'minimum_average_pct':55},{'water_capacity_ml_at_least':300,'minimum_average_pct':60}],
 'average_must_meet_limit_without_unreasonable_shortage_in_individual_containers':True,
 'no_automatic_whole_product_approval':True};changed.add('2.3.61')
# Exact combined-defect membership complements existing individual caps.
s['2.3.47(6)']['defect_group_r10']={'source_pages':[68],'combined_max_pct_m_m':10,'source_rows':['ii','iii','iv','v','vi','vii'],'individual_caps_still_apply':True,'source_defined_disjoint_accounting_required':True,'excluded_from_this_sum':['viii chipped/scratched','ix doubles/twins']};changed.add('2.3.47(6)')
s['2.3.47(7)']['defect_group_r10']={'source_pages':[71],'combined_max_pct_by_mass':5,'components':['Superficial damage','Immature or shrivelled kernels','Speckled or spotted kernels','Presence of testa','Insect damage','Foreign matter','Extraneous vegetable matter'],'individual_caps_still_apply':True,'source_defined_disjoint_accounting_required':True};changed.add('2.3.47(7)')
# The source says concentrated TO 7/24%; do not turn that into an unqualified minimum.
for v in s['2.3.62']['variant_composition']:
 if v['variant'] in ['Fungi extract','Fungi concentrate']:
  for r in v['composition']:
   if r['parameter']=='Saltless extract':r.update(automatic_comparison_blocked=True,source_question='The definition says concentrated to the printed percentage, not an explicit minimum. Reconcile original notification/method before using the historical >= operator.',source_pages=[102]);changed.add('2.3.62')
# Preserve current R9's pickle-medium interpretation and its unresolved salt denominator.
pickle=s['2.3.43'];ck(any(r.get('automatic_comparison_blocked') for v in pickle['variant_composition'] for r in v['composition'] if 'chloride' in r['parameter'].lower()))
# Source-index only: the full normalized registry is not falsely presented as live engine integration.
master=json.loads(master_bytes)
products=[p for p in master['catalog_products'] if p.get('rule_key') in KEYS and Path(p.get('rule_file','')).name=='chapter-2-3-fruit-vegetable-v1.json']
ck(len(products)==51);overlap=[p['id'] for p in products if p['rule_key'] in ['2.3.40','2.3.41','2.3.42','2.3.43']];ck(len(overlap)==6)
index={'date':'2026-11-03','source_url':URL,'source_sha256':SOURCE_SHA,'full_offline_registry_sha256':REGISTRY_SHA,'records_examined':51,'new_relative_to_current_repository_R9':45,'overlap_rechecks':6,'previous_repository_scoped_records':379,'cumulative_scoped_records':424,'remaining_records':109,'requirements_in_offline_registry':365,'new_full_product_approvals':0,'overlap_ids':overlap,'products':[{'id':p['id'],'product':p['name'],'standard':p['rule_key'],'previous_repository_R9_review':p['id'] in overlap} for p in products],'scope':'Source-edition companion review, not complete legal verification. Only selected core corrections applied by this script; full registry, guard and viewer are separate companions.'}
m['source_review_r10_core']={'date':'2026-11-03','source_url':URL,'source_sha256':SOURCE_SHA,'changed_standard_keys':sorted(changed),'full_offline_registry_sha256':REGISTRY_SHA,'full_regulatory_approval':False,'commercial_release_authorized':False,'live_engine_integration_complete':False}
for old,new in zip(before['standards'],m['standards']):
 ck(old['key']==new['key']);ck(old['status']==new['status'])
 if old['key'] not in changed:ck(old==new)
 for k in ['full_compliance_assessment_enabled','coverage_scope','numeric_evidence']:
  if k in old:ck(old[k]==new[k])
ck(s['2.3.50']['composition'][-2]['value']==5 and s['2.3.50']['composition'][-1]['value']==1)
ck(m['source_verified_on']==before['source_verified_on']);ck(m['source_review_r9']==before['source_review_r9'])
ck((D/'product-master-v1.json').read_bytes()==master_bytes);ck((D/'rules/appendix-b-v2-core.json').read_bytes()==micro_bytes)
content=(json.dumps(m,ensure_ascii=False,indent=2)+'\n').encode()
ck(sha(content)=='4a5ae994d039abe8af24f307a30b6c2411d3cf8924cb80f5efb0815b0c1cabd1')
P.write_bytes(content);H=ROOT/'fssai-helper';H.mkdir(exist_ok=True)
index_bytes=(json.dumps(index,ensure_ascii=False,indent=2)+'\n').encode();(H/'fruit-vegetable-r10-review-index-2026-11-03.json').write_bytes(index_bytes)
out=ROOT/'fruit-remaining-r10-applied';out.mkdir(exist_ok=True);(out/P.name).write_bytes(content);(out/'review-index.json').write_bytes(index_bytes)
report={'passed':checks,'failed':0,'changed_standard_keys':sorted(changed),'chapter_sha256':sha(content),'index_sha256':sha(index_bytes),'product_master_unchanged':True,'appendix_b_unchanged':True,'scope':'Selected core corrections only; no deployment, approval or activation of the full companion comparator.'}
(out/'application-manifest.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
