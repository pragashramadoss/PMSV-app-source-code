"""R25: clarify source dollar footnote and lock duplicate pesticide articles."""
from pathlib import Path
import hashlib,json,copy,collections,sys
base=Path(sys.argv[1]) if len(sys.argv)>1 else Path('.')
path=base/'fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json'
before=path.read_bytes()
assert hashlib.sha256(before).hexdigest()=='31e5b94800b4427d20a249ae3b99f258c912f248340b1dbe76ceac30d22953bf','preimage changed'
d=json.loads(before)
assert 'r25_pesticide_source_symbol_conflict_gates_2026_11_04' not in d
orig=copy.deepcopy(d)
res=d['residue_mrls']
pests=res['pesticides']
vet=d['antibiotic_and_pharmacological_substances']
assert len(pests)==213 and sum(len(p['rows']) for p in pests)==1098
assert len(vet['veterinary_tolerance_limits']['rows'])==49
assert sum(len(p['rows']) for p in vet['veterinary_tolerance_limits']['rows'])==358
star,dollar,fat,shell,grouped=[],[],[],[],[]
for p in pests:
 for idx,row in enumerate(p['rows']):
  token=str(row['mrl']);cond=str(row.get('condition',''))
  if token.endswith('*'):star.append((p['serial'],idx))
  if token=='$':
   assert p['serial'] in (42,43,44,45) and row['unit']==''
   dollar.append((p['serial'],idx))
   row['condition']='Official $ footnote points to copper limits under section 2.1 METAL CONTAMINANTS; no independent numeric pesticide MRL. Exact copper article, analytical basis and method must be established; no automatic fallback or use approval.'
  if '(F)' in cond or 'fat basis' in cond.lower() or 'carcass fat basis' in cond.lower():fat.append((p['serial'],idx))
  if 'shell free' in cond.lower():shell.append((p['serial'],idx))
  if row.get('subgroup'):grouped.append((p['serial'],idx))
assert (len(star),len(dollar),len(fat),len(shell),len(grouped))==(172,27,18,10,39)
conflicts=[]
for serial,food in ((22,'Maize'),(23,'Rice')):
 p=next(p for p in pests if p['serial']==serial)
 entries=[{'row_index_zero_based':i,'printed_limit':r['mrl'],'unit':r['unit'],'condition':r.get('condition','')} for i,r in enumerate(p['rows']) if r['food']==food]
 assert len(entries)==2 and len({r['printed_limit'] for r in entries})==2
 conflicts.append({'pesticide_serial':serial,'pesticide_name':p['name'],'article_exact':food,'competing_source_rows':entries,'status':'SOURCE_COLLISION_REQUIRES_ORIGINAL_NOTIFICATION_RECONCILIATION','any_row_auto_apply':False})
assert conflicts[0]['competing_source_rows'][0]['printed_limit']=='0.02' and conflicts[0]['competing_source_rows'][1]['printed_limit']=='0.5'
assert conflicts[1]['competing_source_rows'][0]['printed_limit']=='2.0' and conflicts[1]['competing_source_rows'][1]['printed_limit']=='2*'
res['symbol_policy']='* means limit fixed at LOQ; F means fat-basis MRL; $ refers to copper METAL CONTAMINANTS section 2.1 instead of a numeric pesticide MRL. Shell-free, carcass-fat, subgroup and source note qualifiers must be preserved. No automatic interpretation or favorable-limit choice without legal article, test method and matrix evidence.'
d['r25_pesticide_source_symbol_conflict_gates_2026_11_04']={
 'review_date':'2026-11-04','source_edition':'Version IX (03.02.2026)',
 'source_url':'https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf',
 'source_pages_pdf_zero_based':[17,18,20,22,23,38,39,40],
 'pesticide_serials_preserved':213,'pesticide_article_rows_preserved':1098,
 'veterinary_serials_preserved':49,'veterinary_article_rows_preserved':358,
 'pesticide_loq_star_rows':len(star),'copper_section_2_1_dollar_reference_rows':len(dollar),
 'fat_or_carcass_fat_basis_rows':len(fat),'shell_free_egg_rows':len(shell),
 'dithiocarbamate_subgroup_rows':len(grouped),
 'conflicting_same_pesticide_article':conflicts,
 'dithiocarbamates_serial':64,'dithiocarbamate_test_expression':'mg CS2/kg where source specifies, subgroup must match substance/use; no blanket parent-family result',
 'no_auto_select_when_duplicate_article':True,'copper_dollar_is_not_0_01_unfixed_pesticide_fallback':True,
 'loq_star_requires_method_loq_confirmation':True,'fat_and_shell_basis_requires_sample_basis':True,
 'current_december_amendment_active':False,'december_amendment_effective_date':'2026-12-01',
 'numeric_source_limits_changed':False,'source_candidate_only':True,'full_current_law_verified':False,
 'full_product_approvals':0,'commercial_release_authorised':False,'live_engine_wired':False}
d2=copy.deepcopy(d);d2.pop('r25_pesticide_source_symbol_conflict_gates_2026_11_04')
d2['residue_mrls']['symbol_policy']=orig['residue_mrls']['symbol_policy']
for p0,p1 in zip(d2['residue_mrls']['pesticides'],orig['residue_mrls']['pesticides']):
 assert p0['serial']==p1['serial']
 for r0,r1 in zip(p0['rows'],p1['rows']):
  if r1['mrl']=='$':r0['condition']=r1['condition']
assert d2==orig,'unintended change'
output=(json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode()
assert hashlib.sha256(output).hexdigest()=='acc284f0e99407cc133983b551a6dff533fccd731b559ecf4340ce4f6de2e2f8','output differs from locally tested candidate'
path.write_bytes(output)
print('R25 source patch PASS: 213 pesticide serials, 1098 rows, 49 vet, 27 clarified dollar tokens, 2 source collisions')
