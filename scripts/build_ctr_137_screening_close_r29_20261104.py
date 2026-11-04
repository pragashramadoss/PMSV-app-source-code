"""PMSV R29: source-screening workstream closure for 137 products.

No product legal approval, no full CTR panel verification, no numeric-rule
application, no commercial lot release, and no production deployment.
"""
from pathlib import Path
from collections import Counter
import hashlib,json,re

BASE=Path(__file__).resolve().parents[1]
PATHS={
 'r27':BASE/'fssai-helper/ctr-137-evidence-queue-r27-2026-11-04.json',
 'r28':BASE/'fssai-helper/ctr-55-source-identity-r28-2026-11-04.json',
 'master':BASE/'fssai-product-helper-preview-01/data/product-master-v1.json',
 'ctr':BASE/'fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json',
}
BEFORE={k:hashlib.sha256(p.read_bytes()).hexdigest() for k,p in PATHS.items()}
d27=json.loads(PATHS['r27'].read_text())
d28=json.loads(PATHS['r28'].read_text())
m=json.loads(PATHS['master'].read_text())
c=json.loads(PATHS['ctr'].read_text())
p27={r['catalog_id']:r for r in d27['records']}
p28={r['catalog_id']:r for r in d28['records']}
ids={p['id'] for p in m['catalog_products']}
assert len(ids)==len(m['catalog_products'])==533
assert len(p27)==len(d27['records'])==137
assert len(p28)==len(d28['records'])==55
assert set(p27)<=ids
assert set(p28)=={pid for pid,r in p27.items() if r['priority']=='P3_ORIGINAL_SOURCE_LOOKUP'}
assert len([r for r in d27['records'] if r['source_candidate_tracks']])==82
assert c['r15_catalogue_contaminant_layer_review']['products_without_any_exact_current_evidence']==137

SOURCE={
 'ctr':'https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf',
 'foscos':'https://fcstraining.fssai.gov.in/standard-product',
 'ayurveda_list':'https://www.fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf',
 'ayurveda_reg':'https://www.fssai.gov.in/upload/notifications/2022/05/62789a20b54bdGazette_Notification_Ayurveda_Aahara_09_05_2022.pdf',
 'fpc18':'https://www.fssai.gov.in/upload/advisories/2021/07/60f6a6554438dDirection_Indian_Sweets_Snacks_20_07_2021.pdf',
}
AY_IDS={'12.1','13.1','14.1','14.3','14.4','14.5','14.6','14.7','15.1'}
RECORDS=[]
for pid in sorted(p27):
 p=p27[pid];r28=p28.get(pid);tracks=p['source_candidate_tracks']
 source_ids=[];note='';route='';clause=None
 if 'FPC18_R21' in tracks:
  route='CONDITIONAL_FPC18_DIRECTION'
  source_ids=['fpc18','ctr']
  note='Apply FPC18 Section 16(5) clause 4(f) only if qualified and not separately standardized FPC 01-14; also clauses 4(g/h) base-product microbiology and ingredient contaminants.'
 elif tracks:
  route='CONDITIONAL_CTR_SOURCE_CANDIDATE'
  source_ids=['ctr']
  note='Existing R16/R18/R20 candidate CTR rows require source article, recipe/species, pack, analytical basis and conflicting article reconciliation before legal applicability.'
 else:
  assert r28 is not None
  kind=r28['source_kind']
  if kind in ('general_identity_definition','product_identity_standard'):
   route='SOURCE_IDENTITY_STANDARD_NOT_CTR_DECISION'
   source_ids=['ctr']
   note=r28['scope_note']+' '+r28['forbidden_inference']
   clause=r28['source_clause']
  elif kind=='interim_licensing_direction':
   route='INTERIM_LICENSING_ROUTE_NOT_CTR_DECISION'
   source_ids=['foscos','ctr']
   note='The March 2024 edible dried seeds order establishes a provisional licensing category, not product-specific CTR metal/pesticide limit.'
   clause=r28['source_clause']
  elif kind=='negative_named_article_scope':
   route='WRONG_ARTICLE_INHERITANCE_BLOCKED'
   source_ids=['ctr']
   note='CTR Cocoa Powder article must not automatically be inherited by whole cocoa beans or carob powder.'
   clause=r28['source_clause']
  else:
   assert kind=='none'
   if pid.startswith('102-102-1-'):
    match=re.match(r'102-102-1-(\d+)-(\d+)-',pid)
    assert match,pid
    clause=match.group(1)+'.'+match.group(2)
    assert clause in AY_IDS
    route='AYURVEDA_CATEGORY_A_RECIPE_SOURCE_ANCHORED'
    source_ids=['ayurveda_list','ayurveda_reg','foscos','ctr']
    note='Exact category A recipe identifier is in FSSAI 25 July 2025 listing. This is a defined recipe route, NOT a verified finished-product CTR analyte panel.'
   else:
    route='FOSCOS_CLASSIFICATION_ROUTE_NOT_CTR_DECISION'
    source_ids=['foscos','ctr']
    note='FoSCoS recognizes this product/category route; taxonomy itself is not an exact CTR article, numeric limit, approval or exemption.'
 assert route and note and source_ids
 assert p['article_applicability_decision']=='EVIDENCE_HOLD'
 RECORDS.append({
  'catalog_id':pid,'product_name':p['product_name'],
  'fcs':p.get('fcs',''),'fssr':p.get('fssr',''),
  'prior_candidate_tracks':tracks,
  'r29_source_screening_route':route,
  'source_ids':source_ids,
  'official_source_urls':[SOURCE[k] for k in source_ids],
  'specific_identity_clause_or_recipe':clause,
  'source_screening_closed':True,
  'source_screening_closed_date':'2026-11-04',
  'source_screening_reason':note,
  'generic_article_not_auto_applied':True,
  'all_foods_methyl_mercury_source_guard':'CTR IX 2.1.1 all foods, methyl mercury 0.25 ppm; sample matrix and method required',
  'december_2026_CTR_amendment_future_effective':True,
  'legal_article_applicability_status':'PENDING_ACTUAL_PRODUCT_IDENTITY_AND_LEGAL_SOURCE_ADJUDICATION',
  'fully_legally_verified':False,
  'full_current_CTR_panel_verified':False,
  'commercial_lot_released':False,
  'numeric_rule_applied':False,
  'blocking_evidence':p['evidence_needed']
 })
assert len(RECORDS)==137==len({r['catalog_id'] for r in RECORDS})
COUNTS=Counter(r['r29_source_screening_route'] for r in RECORDS)
EXPECT={
 'CONDITIONAL_FPC18_DIRECTION':12,
 'CONDITIONAL_CTR_SOURCE_CANDIDATE':70,
 'SOURCE_IDENTITY_STANDARD_NOT_CTR_DECISION':16,
 'INTERIM_LICENSING_ROUTE_NOT_CTR_DECISION':2,
 'WRONG_ARTICLE_INHERITANCE_BLOCKED':2,
 'AYURVEDA_CATEGORY_A_RECIPE_SOURCE_ANCHORED':9,
 'FOSCOS_CLASSIFICATION_ROUTE_NOT_CTR_DECISION':26,
}
assert COUNTS==EXPECT,(COUNTS,EXPECT)
assert {r['specific_identity_clause_or_recipe'] for r in RECORDS if r['r29_source_screening_route']=='AYURVEDA_CATEGORY_A_RECIPE_SOURCE_ANCHORED'}==AY_IDS
assert all(x['source_screening_closed'] and not x['fully_legally_verified']
           and not x['full_current_CTR_panel_verified'] and not x['commercial_lot_released']
           and not x['numeric_rule_applied'] for x in RECORDS)
assert all(hashlib.sha256(p.read_bytes()).hexdigest()==BEFORE[k] for k,p in PATHS.items())
OUTPUT=BASE/'fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json'
REPORT=BASE/'fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.md'
RESULT={
 'review':'PMSV R29 desk-source screening closure','date':'2026-11-04',
 'catalogue':533,'original_137_source_screening_cases':137,
 'source_screening_closed':137,
 'exact_CTR_product_article_applicability_still_open':137,
 'full_current_CTR_panels_verified':0,'products_fully_legally_verified':0,
 'commercial_lot_releases_authorized':0,'source_only_closure_not_legal_confirmation':True,
 'source_screening_disposition_counts':dict(COUNTS),
 'source_urls':SOURCE,'input_sha256':BEFORE,
 'audit_branch_only':True,'production_modified':False,
 'operative_numeric_rules_modified':False,
 'screening_scope':'Classifies the source and the precise missing evidence for each record. It does NOT prove actual source article applicability or whole-product legal compliance.',
 'records':RECORDS
}
OUTPUT.write_text(json.dumps(RESULT,ensure_ascii=False,indent=2)+'\n')
lines=[
 '# PMSV R29 - 137 source-screening dispositions (4 November 2026)','',
 '**Source screening: CLOSED 137/137. Exact finished-product CTR applicability: OPEN 137/137. Legal full-product confirmation: ZERO.**',
 '',
 'Closing the research/triage worklist must not falsely be used as product approval, complete current CTR analyte-panel verification or commercial release. All decisions remain evidence-gated.',
 '',
 '## Sources and reviewed dispositions','',
 '| R29 screening disposition | Records |','|---|---:|'
]
for k in EXPECT:lines.append('| '+k.replace('_',' ').title()+' | '+str(COUNTS[k])+' |')
lines.extend([
 '| **TOTAL** | **137** |','',
 '### Legal safety gates','',
 '- The FSSAI February 2026 CTR IX table has an All foods methyl-mercury article 0.25 ppm; actual analytical matrix and method determine application.',
 '- FPC18 Indian sweets/snacks: 2021 Section 16(5) direction expressly directs eligible FPC18 to Foods not specified metal/pesticide articles, with FPC 01-14 category exclusion. This exception is not globally transferable.',
 '- The nine Category A Ayurveda recipes 12.1, 13.1, 14.1, 14.3, 14.4, 14.5, 14.6, 14.7, 15.1 are individually listed in the 25 July 2025 official recipe annexure; the recipe list is not itself a CTR numeric standard.',
 '- FoSCoS classification, identity standards and licensing orders do not establish a particular contaminant source article or prove its sample result.',
 '- Any source table candidate may have a narrower source article, another competing limit, matrix caveat, processing condition, amendment or qualifying exception.',
 '- The May 2026 CTR amendment with 1 December 2026 effective date is not operative in this 4 November review.',
 '- Full legal source mapping can be verified independently of a commercial lot release, but whole-product compliance also needs applicable analytical and manufacturing evidence.',
 '','## All 137 catalogue decisions','',
 '| Product | FCS | Source-screening disposition | Missing legal-applicability evidence |',
 '|---|---|---|---|'
])
for x in RECORDS:
 why=x['blocking_evidence'][0] if x['blocking_evidence'] else 'Exact source article, SKU/recipe, sample matrix'
 lines.append('| '+x['product_name'].replace('|','/')+' (ID '+x['catalog_id']+') | '+str(x['fcs']).replace('|','/')+' | '+x['r29_source_screening_route']+' | '+why.replace('|','/')+' |')
lines.extend(['','## Official references',''])
for k,v in SOURCE.items():lines.append('- '+k+': '+v)
lines.extend(['','**Operational boundary:** Audit branch only. This report does not change the existing catalogue, numeric rules, live PMSV helper, PASS/release fields or PR merge status.',''])
REPORT.write_text('\n'.join(lines))
assert len(json.loads(OUTPUT.read_text())['records'])==137
assert all(hashlib.sha256(p.read_bytes()).hexdigest()==BEFORE[k] for k,p in PATHS.items())
print(json.dumps({'result':'PASS','source_screening_closed':137,'legal_applicability_open':137,
                  'source_dispositions':dict(COUNTS),'full_product_approvals':0,
                  'manifest_sha256':hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),
                  'report_sha256':hashlib.sha256(REPORT.read_bytes()).hexdigest()},indent=2))
