"""R28: independent invariants for the 55-case official-source identity register.

This is an audit of source scope and preservation, NOT legal-completeness proof,
an FSSAI compliance certificate or permission to change live PMSV numeric rules.
"""
from pathlib import Path
from collections import Counter
import json
import re

ROOT=Path(__file__).resolve().parents[1]
R27=ROOT/'fssai-helper/ctr-137-evidence-queue-r27-2026-11-04.json'
R28=ROOT/'fssai-helper/ctr-55-source-identity-r28-2026-11-04.json'
MASTER=ROOT/'fssai-product-helper-preview-01/data/product-master-v1.json'
d27=json.loads(R27.read_text())
d28=json.loads(R28.read_text())
master=json.loads(MASTER.read_text())
ids={p['id'] for p in master['catalog_products']}
assert len(ids)==len(master['catalog_products'])==533

a27={r['catalog_id']:r for r in d27['records']}
a28={r['catalog_id']:r for r in d28['records']}
assert len(a27)==137==len(d27['records'])
assert len(a28)==55==len(d28['records'])
assert set(a28)=={r['catalog_id'] for r in d27['records'] if r['priority']=='P3_ORIGINAL_SOURCE_LOOKUP'}
assert set(a28)<=set(a27)<=ids
assert d27['with_source_candidates']==82
assert d27['without_defensible_additional_article']==55
assert d28['original_unadjudicated_exact_article_cases']==137
assert d28['reference_candidate_cases']==82
assert d28['without_additional_source_article_in_r27']==55
assert d28['newly_authenticated_exact_ctr_finished_article_decisions']==0
assert d28['full_current_ctr_panels_approved']==0
assert d28['full_products_approved']==0
assert d28['live_engine_changed'] is False
assert d28['legal_numeric_rule_modified'] is False
assert d28['exact_article_status']=='EVIDENCE_HOLD'

source_kind=Counter(r['source_kind'] for r in d28['records'])
assert source_kind=={
 'general_identity_definition':8,
 'product_identity_standard':8,
 'interim_licensing_direction':2,
 'negative_named_article_scope':2,
 'none':35}
assert d28['source_kind_counts']=={
 'source_definition_or_standard':16,'licensing_only':2,
 'negative_cross_article':2,'remaining_no_additional_identity_anchor':35}
assert sum(d28['source_kind_counts'].values())==55
assert d28['by_family']==dict(Counter(r['family'] for r in d28['records']))
assert set(d28['by_family'])=={
 'dairy_analogue','frozen_vegetable_fat_dessert','coconut_kernel_product',
 'colostrum','trapa_chestnut_flour','vending_purified_water','edible_dried_seed_license',
 'cocoa_name_collision','other_unanchored'}

for r in d28['records']:
 pid=r['catalog_id']
 assert a27[pid]['source_status']=='NO_DEFENSIBLE_ADDITIONAL_EXACT_ARTICLE',pid
 assert len(r['product_name'])>2
 assert r['exact_ctr_product_article_adjudicated'] is False
 assert r['full_current_ctr_panel_verified'] is False
 assert r['full_product_approved'] is False
 assert r['commercial_release_authorized'] is False
 assert r['source_auto_apply'] is False
 assert r['source_kind'] in source_kind
 assert r['reviewed_on']=='2026-11-04'
 assert r['scope_note'] and r['forbidden_inference'] and r['minimum_evidence']
 assert r['source_urls'] and all(u.startswith(('https://www.fssai.gov.in/','https://fssai.gov.in/')) for u in r['source_urls'])
 assert d28['sources']['ctr'] in r['source_urls']
 if r['source_kind']!='none':
  assert r['source_clause'] and r['source_page_1based']>=1
 else:
  assert r['source_clause'] is None and r['source_page_1based'] is None
 if r['family']=='dairy_analogue':
  assert r['source_clause']=='2.1.1, item 1(aa)'
  assert 'replacement' in r['scope_note'].lower()
  assert d28['sources']['faq'] in r['source_urls']
 if r['family']=='frozen_vegetable_fat_dessert':
  assert r['source_clause']=='2.1.15'
 if r['family']=='coconut_kernel_product':
  assert r['source_clause'] in ('2.3.51','2.3.52','2.3.63')
  assert d28['sources']['fruit'] in r['source_urls']
 if r['family']=='colostrum':
  assert r['source_clause']=='2.1.23'
 if r['family']=='trapa_chestnut_flour':
  assert r['source_clause']=='2.3.64' and 'Trapa' in r['scope_note']
 if r['family']=='vending_purified_water':
  assert r['source_clause']=='2.10.9' and 'IS 10500' in r['scope_note']
 if r['family']=='edible_dried_seed_license':
  assert '15 March 2024' in r['source_clause']
  assert d28['sources']['seed'] in r['source_urls']
 if r['family']=='cocoa_name_collision':
  assert 'Cocoa powder' in r['source_clause']
  assert 'dry fat-free' in r['scope_note']

# Conspicuously prevent a source identity from being treated as a compliance flag.
for r in d28['records']:
 fabricated_external={
  'legalArticleVerified':True,'allMeasurementsWithinLimits':True,
  'fullProductApproved':True,'productStatus':'PASS'
 }
 verdict={
  'status':r['source_status'],
  'exactCTRArticleAdjudicated':r['exact_ctr_product_article_adjudicated'],
  'fullCurrentCTRPanelVerified':r['full_current_ctr_panel_verified'],
  'fullProductApproved':r['full_product_approved'],
  'commercialReleaseAuthorized':r['commercial_release_authorized']
 }
 assert verdict['fullProductApproved'] is False and verdict['commercialReleaseAuthorized'] is False
 assert verdict['status']!='PASS' and verdict['exactCTRArticleAdjudicated'] is False
 assert verdict['fullCurrentCTRPanelVerified'] is False

print(json.dumps({
 'result':'PASS','catalogue_ids':533,'r27_gaps':137,'r28_cases':55,
 'identity_or_definition_sources':16,'interim_licensing_only':2,
 'negative_article_guards':2,'other_unanchored':35,
 'full_ctr_article_adjudications':0,'product_approvals':0,
 'source_and_preservation_assertions':'all passed',
 'interpretation':'offline metadata validation, NOT live app or regulatory approval'
},indent=2))
