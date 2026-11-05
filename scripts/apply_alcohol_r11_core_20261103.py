"""Apply selected R11 source findings on the audit branch only.
The complete 455-row offline review and its comparator are separate deliverables.
No final compliance lock or original verification date is upgraded.
"""
from pathlib import Path
import copy, hashlib, json, sys
B=Path(sys.argv[1]) if len(sys.argv)>1 else Path('.')
p=B/'fssai-product-helper-preview-01/data/rules/alcoholic-beverages-v5.json'
raw=p.read_bytes()
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
assert blob(raw)=='492781910b40bdf16c37d51f9894fa6821d2a393','Preimage changed; reconcile before applying'
m=json.loads(raw);before=copy.deepcopy(m);s=m['standards'];n=0
source='https://fssai.gov.in/upload/uploadfiles/files/Comp_Alcoholic_Beverages_V_04_12_2025.pdf'
amend1='https://fssai.gov.in/upload/uploadfiles/files/Food%20Safety%20and%20Standards_Alcoholic%20Beverages_First%20Amendment%20Regulations%202025.pdf'
amend2='https://www.fssai.gov.in/upload/notifications/2025/11/692846cca9b19Final%20Notification%20of%20alcoholic%20beverages.pdf'
direction='https://fssai.gov.in/upload/notifications/2025/11/692845eaf1ef1Labelling%20direction%20for%20FSS%20alcoholic%20beverages%20amendment%20Regulations%202025.pdf'
def ck(x,msg=''):
 global n;n+=1
 assert x,msg
ck(len(s)==26)
notes=m['current_effective_notes']
notes[0]='Version V includes final June 2025 provisions effective 1 January 2026. The 27 November 2025 direction extends labelling provisions to 1 July 2026; it is not treated here as a blanket composition extension.'
notes[1]='RTD definition says more than 0.5% and up to 15%, while amended Table 4 says below 15%. Exactly 15% is blocked for source reconciliation, not approved through the definition alone.'
notes.append('The final November 2025 Table 2 fruit-wine ester amendment is effective 1 June 2026. The January 2026 corrigendum changes the place of notification only.')
s['1.2.4a/1.3.9']['definition_summary']+=' The amended definition uses up to 15%, unlike the strict upper bound in Table 4.'
s['1.2.4a/1.3.9']['source_questions_r11']=[{'field':'ethyl_alcohol_abv','conflict_at':15,'automatic_acceptance_blocked':True,'source_pages':[1,3,22],'original_amendment_url':amend1,'original_pages':[8,10]}]
s['3.1.6']['table_basis']='Table 2 table-wine requirements except ethyl alcohol content, as amended. Actual base-wine category must be established.'
s['3.1.6']['composition_core']=[{'parameter':'Ethyl alcohol','operator':'range','min':3.5,'max':14.5,'min_inclusive':True,'max_inclusive':False,'unit':'% v/v','basis':'finished beverage at 20 C','source_pages':[8,9]}]
s['3.1.6']['definition_summary']='Wine-based beverage with the printed at least 50 by volume wine wording, permitted treatments and additions. The missing percentage symbol/denominator is retained as a source question, not silently repaired.'
s['3.1.6']['source_questions_r11']=['Printed wine-fraction wording needs original-source unit reconciliation. Do not automatically invoke the wine-specific expiry exemption for a wine-based beverage without establishing scope.']
s['3.1.4.4']['current_effective_note']='Mead composition insertion is in the final first amendment effective 1 January 2026. The 27 November 2025 direction specifically extends labelling compliance to 1 July 2026; source-scope distinction retained.'
s['3.1.4']['ester_limit_r11']={'parameter':'Esters as ethyl acetate','operator':'<=','value':3.0,'unit':'g/L of absolute alcohol','effective_from':'2026-06-01','previous_value':0.2,'table':2,'row':7,'column':7,'includes_honey_wine':True,'excludes_other_columns':True,'source_url':amend2,'source_pages':[2],'current_law_complete':False}
s['3.1.4.4']['ester_limit_reference_r11']='The Table 2 fruit-wine column including honey wine: 3.0 g/L absolute alcohol from 1 June 2026; do not transfer to cider, perry or other-plant-wine columns.'
for key in ['4.1','4.2']:
 s[key]['microbiology_scope_r11']={'total_plate_count_excludes_brewers_yeast':True,'beer_regular_strong_operator':'<','beer_regular_strong_value':10,'draught_craft_operator':'<','draught_craft_value':100,'unit':'cfu/ml','source_pages':[20,21],'n_c_m_M_plan_invented':False,'absence_is_not_numeric_zero':True,'method_and_report_scope_required':True,'automatic_lot_release':False}
 s[key]['source_questions_r11']=['Table 3 carbonation heading says Min while cells print 1.8-3.6. Source interpretation is required before automatic range acceptance. CO2/N2 mixture permission is craft-specific.']
s['2.1']['source_questions_r11']=['Indian brandy is defined but has no separately labelled Table 1 column; do not select grape/blended limits by name alone.']
s['2.9']['source_questions_r11']=['Catalogue groups pot and column distillation, but clause 2.9/Table 1 identifies pot-distilled spirit. Column-only mapping remains unresolved.']
m['label_controls_r11']={'source_url':source,'source_pages':[11,12],'warning_font':{'pack_up_to_including_200_ml_min_mm':1.5,'pack_above_200_ml_min_mm':3},'nonwine_expiry':{'abv_operator':'<','abv':10,'wine_based_beverage_exemption_scope_pending':True},'wine_sulphur_dioxide_declaration':{'operator':'>','value':10,'unit':'mg/L'},'standard_drink_declaration':'optional_in_inspected_final_text','draft_30_oct_2025_not_applied':True,'label_extension_direction_url':direction,'label_extension_date':'2026-07-01','artwork_approved':False}
m['source_review_r11']={'date':'2026-11-03','source_url':source,'source_sha256':'84b1bd45f79ede347412345db348d95f9307db38759ef5b48b2a3bfbe70c4800','reviewed_catalogue_records':27,'full_offline_requirement_records':455,'source_table_cells':396,'direct_microbiology_cells':24,'scope':'Selected core source findings only. The full variant/row registry and comparator are offline companions and not wired into the live engine.','complete_current_law':False,'product_approval':False,'lot_release':False}
for k in ['table_1','table_2','table_3','table_4']:m['table_matrix_status'][k]+='; R11 complete source table transcribed in offline registry, not yet integrated into live comparisons'
# Preserve standard identities, source provenance and existing final lock.
ck(set(s)==set(before['standards']));ck(m['final_compliance_lock']==before['final_compliance_lock'])
for k in ['source_verified_on','source_version','official_sources','general_requirements','shared_wine_rules','alcohol_specific_labelling']:ck(m[k]==before[k],k)
changed={'1.2.4a/1.3.9','3.1.6','3.1.4.4','3.1.4','4.1','4.2','2.1','2.9'}
for k in s:
 ck(s[k]['name']==before['standards'][k]['name'])
 if k not in changed:ck(s[k]==before['standards'][k],k)
ck(s['3.1.6']['composition_core'][0]['max_inclusive'] is False)
ck(s['3.1.4']['ester_limit_r11']['effective_from']=='2026-06-01')
ck(m['label_controls_r11']['warning_font']['pack_up_to_including_200_ml_min_mm']==1.5)
ck(m['source_review_r11']['complete_current_law'] is False)
content=(json.dumps(m,ensure_ascii=False,indent=2)+'\n').encode()
expected='2e9673b70905181558eaffa0cd22d7a6fec67bd263c41eb15c3f1c59f90336fd'
if expected!='EXPECTED_HASH':ck(hashlib.sha256(content).hexdigest()==expected,'Output differs from tested module')
p.write_bytes(content);out=B/'alcohol-r11-core-applied';out.mkdir(exist_ok=True);(out/p.name).write_bytes(content)
report={'passed':n,'failed':0,'sha256':hashlib.sha256(content).hexdigest(),'changed_standard_objects':len(changed),'scope':'Selected core corrections only; full offline registry and guard are separate. Original locks preserved; no deployment.'}
(out/'application-manifest.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
