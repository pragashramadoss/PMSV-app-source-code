"""Apply selected R12 source-scope corrections on the audit branch only.
This does not integrate the complete offline registry, approve products, or deploy.
Exact input blobs prevent overwriting intervening source edits.
"""
from pathlib import Path
import json,hashlib,copy,sys
B=Path(sys.argv[1]) if len(sys.argv)>1 else Path('.')
D=B/'fssai-product-helper-preview-01/data/rules'
EXPECTED={'chapter-2-11-other-food-products-v1.json':'728f83065fdba67425d32f8f13aa90488d45ce9d','chapter-2-16-hemp-v1.json':'b57a2fde1937f62500c8dbe5648e2656134649be','chapter-3-substances-added-v1.json':'847badf31310452b61bd7991ba812cde78bf5634'}
A={};n=0

def ck(x,msg=''):
 global n;n+=1
 if not x:raise AssertionError(msg)
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
for fn,h in EXPECTED.items():
 b=(D/fn).read_bytes();ck(blob(b)==h,fn+' preimage changed; reconcile before applying');A[fn]=json.loads(b)
old=copy.deepcopy(A)
ot=A['chapter-2-11-other-food-products-v1.json'];he=A['chapter-2-16-hemp-v1.json'];ad=A['chapter-3-substances-added-v1.json']
s={s['key']:s for s in ot['standards']};t={s['key']:s for s in ad['identity_purity_standards']}

def first(rows,predicate):
 found=[r for r in rows if predicate(r)];ck(len(found)==1,'Expected one exact source row');return found[0]
def question(row,text):
 row['source_question_r12']=text;row['automatic_comparison_blocked']=True
# Exact catechu exception, not simultaneous generic/exception ceilings.
rows=s['2.11.2']['composition'];general=first(rows,lambda r:r['parameter']=='Ash insoluble in HCl on dry basis');special=first(rows,lambda r:'Bhatti Katha' in r['parameter']);ck(general['value']==.5 and special['value']==1.5)
general.update(applies_to_r12='ordinary catechu, excluding Bhatti Katha',requires_actual_subtype=True)
special.update(applies_to_r12='Bhatti Katha only',replaces_general_acid_insoluble_ash_limit=True,requires_actual_subtype=True)
question(s['2.11.1'],'Printed monocalcium phosphate names carry INS 341(iii); exact chemical/code reconciliation is needed. No automatic replacement of the printed code.')
s['2.11.8']['claim_reconciliation_r12']={'claims_source':'https://fssai.gov.in/upload/uploadfiles/files/Compendium_Advertising_Claims_Regulations_14_12_2022.pdf','source_page':9,'source_minimums':{'g_per_100g_solids':3,'g_per_100ml_liquids':1.5,'g_per_100kcal':1.5},'high_or_rich_minimums':{'g_per_100g_solids':6,'g_per_100ml_liquids':3,'g_per_100kcal':3},'legacy_high_range_not_activated':True,'label_approved':False,'scope':'Targeted conflict recorded; complete original-notification and label reconciliation remains open.'}
# Ingredient-specific questions previously stored as machine-complete.
r=first(t['3.2.10(4)']['requirements'],lambda r:r['parameter']=='Sulphate');ck(r['value']==.05)
r['previous_interpretation_r12']={k:r[k] for k in ['operator','value','unit']};r.update(operator='unresolved',value_as_printed='0.05',unit='not printed');r.pop('value');question(r,'Source row prints 0.05 without an explicit unit/operator; do not infer a percent maximum.')
r=first(t['3.2.10(4)']['requirements'],lambda r:r['parameter'].startswith('Loss on drying'));question(r,'Printed P3O4 desiccant requires original-method reconciliation; no silent reagent substitution.')
t['3.2.10(4)']['identity_scope_r12']='Named L(+)-tartaric acid only. Catalogue L(+/-) is not proof that a racemate qualifies.'
r=first(t['3.2.11(6)']['requirements'],lambda r:r['parameter'].startswith('Viscosity'));ck(r['value']==250);r['unit']='not printed';question(r,'The minimum 250 for a 1% solution lacks a specified viscosity unit.')
r=first(t['3.2.11(8)']['requirements'],lambda r:r['parameter']=='Ash');ck(r['min']==18 and r['max']==27);r['previous_interpretation_r12']={k:r[k] for k in ['operator','min','max','unit']};r.update(operator='unresolved',value_as_printed='18-27',heading_as_printed='Max');r.pop('min');r.pop('max');question(r,'Source maximum heading conflicts with printed 18-27; do not infer an unqualified range.')
r=first(t['3.2.16(1)']['requirements'],lambda r:r['parameter'].startswith('Purity'));ck(r['value']=='91 or 99');r.update(operator='unresolved',value_as_printed=r.pop('value'));question(r,'91 or 99 depends on method; source-to-method mapping must be verified, not selected for a favourable outcome.')
r=first(t['3.2.11(16)']['requirements'],lambda r:'Salmonella' in r['parameter']);r['basis']='negative per test; portion not stated';question(r,'No test portion is printed. Do not invent 25 g or inherit another gum portion.')
for key in ['3.2.10(4)','3.2.11(6)','3.2.11(8)','3.2.11(16)','3.2.16(1)']:
 t[key]['machine_requirements_complete']=False;t[key]['review_scope_r12']='Specific source question blocks automatic acceptance; resolved rows do not grant full approval.'
# Compound solvent checks are additional to individual rows.
t['3.2.11(15)']['aggregate_control_r12']={'components':['methanol','ethanol','2-propanol'],'component_max_percent':1,'combined_max_percent':1,'all_component_results_required':True,'matrix':'pectin ingredient'}
t['3.2.11(16)']['aggregate_control_r12']={'components':['ethanol','isopropanol','methanol'],'component_max_percent':.1,'combined_max_percent':.1,'all_component_results_required':True,'matrix':'carrageenan ingredient'}
# Direct sample portions; no new n/c/m/M plan.
for key in ['3.2.11(5)','3.2.11(6)','3.2.11(7)','3.2.11(9)','3.2.11(10)','3.2.11(11)','3.2.11(16)']:
 for r in t[key]['requirements']:
  if r.get('operator') in ['negative','absent']:
   basis=r.get('basis','');portion=10 if basis=='in 10 g' else 1 if basis in ['per g','in 1 g'] else None
   if portion is not None:r['test_portion_g_r12']=portion
   r['sampling_plan_r12']='Direct ingredient criterion only; no n/c/m/M lot plan prescribed here.'
first(t['3.2.11(10)']['requirements'],lambda r:r['parameter'].startswith('Protein'))['nitrogen_factor_r12']=5.7
# Preserve hemp concentration values and make their different matrices explicit.
he['total_THC_definition_r12']='Total delta-9 THC and delta-9 THCA as defined by the source; no assumed analytical mass-conversion factor.'
he['scope_controls_r12']={'natural_cannabinoids_only':True,'CBD_limit_is_not_fortification_permission':True,'infant_restriction_includes_month_24':True,'ingredient_seed_oil_limit_not_replaced_by_other_food_limit':True,'no_automatic_concentration_unit_conversion':True,'cultivation_NDPS_authorization_verified':False}
for module in [ot,he,ad]:
 module['source_review_r12']={'date':'2026-11-03','scope':'Selected ingredient/product applicability and source-question controls only; full 252-row offline registry and 19 direct microbial criteria are separate companions. Not integrated into live decisions.','current_law_complete':False,'commercial_release_authorized':False,'finished_food_use_authorized':False}
# Preserve unrelated standard objects and all historical source-version/date values.
for fn,module in A.items():
 for key in ['source_verified_on','source_version']:ck(module.get(key)==old[fn].get(key),fn+' '+key)
 ck(module['source_review_r12']['current_law_complete'] is False)
for before,after in zip(old['chapter-3-substances-added-v1.json']['identity_purity_standards'],ad['identity_purity_standards']):
 ck(before['key']==after['key'])
 if before['key'] not in ['3.2.10(4)','3.2.11(5)','3.2.11(6)','3.2.11(7)','3.2.11(8)','3.2.11(9)','3.2.11(10)','3.2.11(11)','3.2.11(15)','3.2.11(16)','3.2.16(1)']:ck(before==after,'Unrelated identity modified')
ck(old['chapter-3-substances-added-v1.json']['other_substances']==ad['other_substances']);ck(old['chapter-2-16-hemp-v1.json']['standards']==he['standards']);ck(old['chapter-2-16-hemp-v1.json']['cross_cutting_limits']==he['cross_cutting_limits']);ck(old['chapter-2-11-other-food-products-v1.json']['overlay_rules']==ot['overlay_rules'])
expected_after={'chapter-2-11-other-food-products-v1.json': '800606b0b08987d9779000374bcc8003e8b72727d209eba2f470f33ca97e14c3', 'chapter-2-16-hemp-v1.json': '33cdef87d91175a853a2956975466c5521a612dbf66f5a770fc07657d40267b0', 'chapter-3-substances-added-v1.json': 'c06d6c436e8b9299ca6cf39371f7db4ce966dee1a92fbc2592fdebd3365379f3'}
O=B/'ingredients-r12-core-applied';O.mkdir(exist_ok=True);results=[]
for fn,module in A.items():
 content=(json.dumps(module,ensure_ascii=False,indent=2)+'\n').encode();sha=hashlib.sha256(content).hexdigest()
 if expected_after:ck(sha==expected_after[fn],fn+' output differs from tested bytes')
 (D/fn).write_bytes(content);(O/fn).write_bytes(content);results.append({'file':fn,'sha256':sha})
report={'passed':n,'failed':0,'files':results,'scope':'Selected core source-question/subtype/aggregate/micro-portion controls. Full offline registry and live integration are separate. No product master or gh-pages modification.'};(O/'application-manifest.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
