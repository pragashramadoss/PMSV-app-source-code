"""Apply R8's reviewed core corrections to the audit branch only.
The 223-row matrix/variant register and viewer are separate offline companions.
No source/commercial approval flags are upgraded and no production deployment occurs.
"""
from pathlib import Path
import copy,hashlib,json,sys
BASE=Path(sys.argv[1]) if len(sys.argv)>1 else Path('.')
DATA=BASE/'fssai-product-helper-preview-01/data';P=DATA/'rules/chapter-2-10-beverages-v1.json';raw=P.read_bytes()
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
assert blob(raw)=='87a593df3fb96363cf51194704a857b24aa528bc','Preimage changed: reconcile before applying'
m=json.loads(raw);before=copy.deepcopy(m);s={x['key']:x for x in m['standards']};n=0
SOURCE='https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_10_BEVERAGES_Other%20than%20Dairy%20and%20Fruits%20Vegetables%20based.pdf'

def check(x):
 global n;n+=1;assert x

def numeric(parameter,value,page,unit='mg/L',basis='finished water'):
 return {'parameter':parameter,'operator':'<=','value':value,'unit':unit,'analytical_basis':basis,'source_pages':[page]}
# Exact Kangra upper bound was not represented by the old >= operator.
k=next(x for x in s['2.10.1(2)']['composition'] if 'Alkalinity' in x['parameter']);check(k=={'parameter':'Alkalinity of soluble ash as K2O','operator':'>=','value':1,'unit':'% dry basis','max':2.2});k.pop('value');k.update(operator='range',min=1,max=2.2,source_pages=[2])
s['2.10.1(2)']['composition'].append({'parameter':'Extract in printed reflux test','operator':'>=','value':1.2,'unit':'%','source_pages':[2],'source_question':'Printed drying at 180 C, 100 parts distilled water, one-hour reflux and minimum 1.2%. Resolve original notification/method before automatic comparison.','automatic_comparison_blocked':True})
for r in s['2.10.1(1)']['composition']:
 r['analytical_basis']='of total ash' if r['parameter']=='Water-soluble ash' else 'material oven-dried at 103 +/- 2 C'
for r in s['2.10.1(3)']['composition']:
 r['analytical_basis']='of total ash' if r['parameter']=='Water-soluble ash' else 'material oven-dried at 103 +/- 2 C'
 if 'Alkalinity' in r['parameter']:r.update(source_question='Printed minimum uses total ash while preamble uses oven-dried material. Reconcile denominator; do not assume ordinary-tea basis.',automatic_comparison_blocked=True)
for r in s['2.10.1(4)']['composition']:
 if r['parameter']=='Moisture':r.update(source_question='Moisture is by mass under a preamble expressing all figures on oven-dried material. Reconcile before automatic comparison.',automatic_comparison_blocked=True)
# Restore decaffeinated-coffee and instant-mixture requirements without substituting matrices.
c=s['2.10.2'];c['decaffeinated_roasted_ground'].insert(4,{'parameter':'Alkalinity of soluble ash','operator':'range','min':3.5,'max':5,'unit':'ml 0.1 N HCl/g dry material','source_pages':[6]})
for r in c['decaffeinated_roasted_ground']:
 if r['parameter']=='Water-soluble ash':r.update(source_question='The decaffeinated table says 65 percent by mass under a dry-weight preamble, unlike ordinary coffee explicitly saying of total ash. Reconcile denominator.',automatic_comparison_blocked=True)
solubility=copy.deepcopy([r for r in c['soluble_coffee'] if r.get('operator')=='qualitative']);check(len(solubility)==2)
c['decaffeinated_soluble']+=copy.deepcopy(solubility)
cc=s['2.10.4']
for key in ['instant','decaffeinated_instant']:cc[key]+=copy.deepcopy(solubility)
cc['formulation_rules'][0].update(applies_to=['regular_roasted_ground','decaffeinated_roasted_ground'],automatic_comparison_requires_variant=True)
cc['formulation_rules'].append({'parameter':'Coffee content - instant variants','operator':'>=','value':51,'unit':'% by mass on dry basis','applies_to':['instant','decaffeinated_instant'],'automatic_comparison_requires_variant':True,'source_pages':[8,9]})
cc['label_direction_r8']={'url':'https://www.fssai.gov.in/upload/advisories/2026/07/6a604e4037173Direction_Coffee%20Chicory.pdf','document_date':'2026-07-21','revised_declaration_effective_from':'2027-07-01','earlier_notification_in_abeyance':True,'minimum_font_mm':1,'minimum_font_mm_when_PDP_exceeds_100_cm2':2,'other_label_requirements_still_apply':True,'artwork_approved':False}
for r in s['2.10.6(1)']['ester_gum_quality']:r.update(matrix='ester gum ingredient',not_a_finished_beverage_contaminant_limit=True)
s['2.10.6(1)']['ester_gum_identity_note_r8']='The sulphur test detection capability of 50 mg/kg is not a permitted sulphur maximum. Identity/solubility and absence-of-tall-oil tests remain required.'
s['2.10.6(2)']['scope_note_r8']='Caffeine is total from all sources, 145-300 mg/L. Optional ingredient maxima are mg/day, not mg/L. Carbonated-water microbiology is inherited; its ordinary 145 ppm caffeine maximum is not.'
# Restore omitted mineral-water chemical/radioactivity rows, keeping named-table values.
mw=s['2.10.7'];known={r['parameter'] for r in mw['physical_chemical']}
for param,value,page in [('Sulphide as H2S',.05,18),('Manganese',2,18),('Copper',1,18),('Zinc',5,18),('Barium',1,18),('Antimony',.005,18),('Nickel',.02,18),('Borates as B',5,18),('Silver',.01,19),('Chloride',200,19),('Sulphate',200,19),('Magnesium',50,19),('Calcium',100,19),('Sodium',150,19),('Cadmium',.003,19),('Chromium',.05,19),('Mercury',.001,19),('Selenium',.05,19)]:
 check(param not in known);mw['physical_chemical'].append(numeric(param,value,page));known.add(param)
mw['physical_chemical'].append({'parameter':'Alkalinity as HCO3','operator':'range','min':75,'max':400,'unit':'mg/L','analytical_basis':'finished water','source_pages':[19]})
mw['radioactivity_r8']=[numeric('Alpha activity',.1,19,'Bq/L'),numeric('Beta activity',1,19,'Bq/L')]
for r in mw['physical_chemical']:
 if r['parameter']=='Total dissolved solids':r.update(excludes_variant='Natural Spring Water',automatic_comparison_requires_variant=True)
mw['spring_water_special'][0].update(applies_to='Natural Spring Water',replaces_ordinary_TDS_range=True)
mw['qualitative_requirements_r8']=[{'parameter':p,'requirement':req,'source_pages':[pg],'not_a_zero_numeric_limit':True} for p,req,pg in [('Odour','Agreeable',18),('Taste','Agreeable',18),('Mineral oil','Absent',18),('Phenolic compounds','Absent',18),('Surface-active agents','Not detectable',19),('Cyanide','Absent',19),('Polynuclear aromatic hydrocarbons','Not detectable',19),('Polychlorinated biphenyls','Not detectable',19),('Pesticide row 37','Below detectable limits; later numerical pesticide table also applies',19)]]
mw['microbiology']=[x if not x.startswith('Total coliforms') else 'Total coliforms: printed A x 250 ml; sample count unresolved, no automatic acceptance' for x in mw['microbiology']]
mw['microbiology_source_questions_r8']=['Yeast/mould and Salmonella/Shigella rows lack a stated portion. Do not infer a portion.','Total coliform row prints A x 250 ml; sample count requires original-source reconciliation.']
mw['direct_microbiology_r8']=[
 {'organism':'E. coli or thermotolerant coliforms','operator':'absent','portion_ml':250,'source_units':1,'logic':'one_alternative'},
 {'organism':'Faecal streptococci and Staphylococcus aureus','operator':'absent','portion_ml':250,'source_units':1,'logic':'both'},
 {'organism':'Pseudomonas aeruginosa','operator':'absent','portion_ml':250,'source_units':1},
 {'organism':'Sulphite-reducing anaerobes','operator':'absent','portion_ml':50,'source_units':1},
 {'organism':'Vibrio cholerae','operator':'absent','portion_ml':250,'source_units':1},
 {'organism':'Vibrio parahaemolyticus','operator':'absent','portion_ml':250,'source_units':1}]
# Missing PDW chemistry/radioactivity; printed analyte conflict stays unresolved.
pdw=s['2.10.8'];pdw['physical_chemical'].append(numeric('Anionic surface-active agents as MBAS',.2,23))
pdw['radioactivity_r8']=[numeric('Alpha activity',.1,24,'Bq/L'),numeric('Beta activity',1,24,'Bq/L')]
pdw['qualitative_requirements_r8']=[{'parameter':'Phenolic compounds as C6H5OH','requirement':'Absent','source_pages':[23]},{'parameter':'Mineral oil','requirement':'Absent','source_pages':[23]}]
for r in pdw['physical_chemical']:
 if r['parameter']=='Residual free chloride':r.update(source_question='Printed residual free chloride requires exact analyte/method reconciliation. Do not silently rename it chlorine or use ordinary chloride results.',automatic_comparison_blocked=True)
 if r['parameter'] in ['Calcium','Magnesium']:r.update(minimum_exception_only_for_referenced_food_ingredient_water=True,retail_PDW_minimum_remains=True)
for r in pdw['microbiology']:
 if r['parameter']=='Aerobic microbial count at 20–22°C/72h':r['incubation_r8']={'temperature_min_C':20,'temperature_max_C':22,'hours':72}
 if r['parameter']=='Aerobic microbial count at 37±1°C/24h':r['incubation_r8']={'temperature_min_C':36,'temperature_max_C':38,'hours':24}
for x in [mw,pdw]:x['water_scheme_r8']={'url':'https://fssai.gov.in/upload/uploadfiles/files/Scheme%20of%20Testing%20PDW%20MW.pdf','effective_from':'2026-01-01','micro_failure_restart_consecutive_batches':5,'micro_failure_records_minimum_years':5,'corrective_actions_and_stock_recheck_required':True,'no_automatic_restart_or_release':True,'full_scheme_reconciliation':False}
pdw['water_scheme_r8']['six_month_report_noncompliance_monthly_testing_until_consecutive_compliant_batches']=3
s['2.10.9']['route_scope_r8']='IS 10500 reference only in this review. Its complete applicable edition/amendments and numeric requirements are not verified here; no packaged-water table inheritance.'
m['source_review_r8']={'date':'2026-11-03','source_url':SOURCE,'source_sha256':'0515862e5bd26de895dcc188d16115fbd4e816d87305bf011c8e280a1aae380f','scope':'Core source-edition corrections only. Full 223-row variant/matrix register and 21 direct microbial criteria are in the offline companion. Not wired into the live decision engine.','current_law_complete':False,'commercial_release_authorized':False}
# Assertions verify intended changes and preservation of existing source/status fields.
check(len(m['standards'])==14);check(k['operator']=='range' and k['min']==1 and k['max']==2.2 and 'value' not in k)
check(len([r for r in c['decaffeinated_soluble'] if r.get('operator')=='qualitative'])==2)
for old,new in zip(before['standards'],m['standards']):
 check(old['key']==new['key']);check(old['status']==new['status'])
check(before['source_verified_on']==m['source_verified_on']);check(before['source_version']==m['source_version'])
check(len(mw['physical_chemical'])==28);check(len(pdw['physical_chemical'])==27)
check(mw['physical_chemical'][2]['max']==700 and mw['spring_water_special'][0]['value']==750)
check(pdw['physical_chemical'][2]['min']==75 and pdw['physical_chemical'][2]['max']==500)
check(m['source_review_r8']['current_law_complete'] is False)
content=(json.dumps(m,ensure_ascii=False,indent=2)+'\n').encode()
expected='c3eb425ac0b8782d3dd41f1c14bd037d965c9a07c3fc7180d78e6107693e1531'
if expected!='EXPECTED_SHA256':check(hashlib.sha256(content).hexdigest()==expected)
P.write_bytes(content);out=BASE/'beverages-r8-core-applied';out.mkdir(exist_ok=True);(out/P.name).write_bytes(content)
report={'passed':n,'failed':0,'core_module_sha256':hashlib.sha256(content).hexdigest(),'scope':'Core module correction checks only, separate from offline registry/browser/guard suites. No deployment or approval.'}
(out/'application-manifest.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
