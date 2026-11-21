"""PMSV R30 reproducible source crosswalk and no-auto-PASS regression tests.

This is only a structural/source-reference audit; it does NOT certify legal
applicability, measure samples, or authorize commercial product release.
"""
import json,re,hashlib
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parents[1]
read=lambda p:json.loads((ROOT/p).read_text())
r29=read('fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json')
r30=read('fssai-helper/ctr-26-fssr-clause-reconciliation-r30-2026-11-04.json')
m=read('fssai-product-helper-preview-01/data/product-master-v1.json')
ctr=read('fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json')
product_ids={p['id'] for p in m['catalog_products']}
assert len(product_ids)==len(m['catalog_products'])==533
original={r['catalog_id']:r for r in r29['records']}
assert len(original)==len(r29['records'])==137
target={pid:r for pid,r in original.items() if r['r29_source_screening_route']=='FOSCOS_CLASSIFICATION_ROUTE_NOT_CTR_DECISION'}
assert len(target)==26

rows=r30['records']
assert len(rows)==26==len({r['catalogue_id'] for r in rows})
assert {r['catalogue_id'] for r in rows}==set(target)
assert r30['source_clauses_located']==17
assert r30['category_only']==9
assert r30['original_r29_source_screening_137']==137
assert r30['remaining_legal_applicability_decisions']==137
assert r30['legal_ctr_product_article_adjudications_added']==0
assert r30['full_product_approvals']==0
assert r30['production_gh_pages_changed'] is False
assert r30['operative_numeric_ctr_rules_changed'] is False
assert r30['audit_branch_only'] is True
assert len(product_ids-set(original))==396
assert all(x['legal_article_applicability_status'].startswith('PENDING_') for x in original.values())
source_count=Counter(x['r30_source_classification'] for x in rows)
assert source_count=={
 'OFFICIAL_FSSR_STANDARD_CLAUSE_LOCATED':17,
 'FOSCOS_ONLY_NO_EXACT_FSSR_STANDARD_CLAUSE_CONFIRMED':9
}
expected_codes={
 '2.3.26','2.11.2','2.3.37','2.3.33','2.3.25','2.3.43',
 '2.3.49','2.3.39','2.3.38','2.3.60','2.4.14','2.8.3(3)',
 '2.11.4','2.1.20','2.9.30(6)','3.3.4','2.11.8'
}
assert {r['source_clause'] for r in rows if r['source_clause']}==expected_codes

expected_docs={
 '2.3':r30['source_documents']['fruit'],
 '2.11':r30['source_documents']['other'],
 '2.4':r30['source_documents']['cereals'],
 '2.8':r30['source_documents']['honey'],
 '2.9':r30['source_documents']['salt'],
 '2.1':r30['source_documents']['dairy'],
 '3.3':r30['source_documents']['substances'],
}
for r in rows:
 pid=r['catalogue_id']
 assert pid in product_ids
 o=target[pid]
 assert r['product_name']==o['product_name'] and r['fcs']==o['fcs']
 assert r['fssr_original']==o['fssr']
 assert r['r29_classification']==o['r29_source_screening_route']
 assert r['source_scope_and_evidence'] and r['wrong_source_inheritance_guard']
 assert r['official_ctr_source']==r30['source_documents']['ctr']
 assert r['review_date']=='2026-11-04'
 assert all(r[k] is False for k in (
     'original_notification_crosscheck_completed',
     'exact_finished_product_ctr_article_adjudicated',
     'full_current_ctr_analyte_panel_verified',
     'full_product_legally_verified',
     'commercial_release_authorized',
     'auto_apply_contaminant_rule'))
 assert r['source_uri'].startswith(('https://fssai.gov.in/','https://www.fssai.gov.in/','https://mail.fssai.gov.in/','https://fcstraining.fssai.gov.in/'))
 if r['source_clause']:
  assert r['source_clause']==r['fssr_original']
  assert r['source_heading'] and len(r['source_heading'])>5
  key='.'.join(r['source_clause'].split('.')[:2])
  assert key in expected_docs,(pid,key)
  assert r['source_uri']==expected_docs[key],(pid,r['source_uri'])
  assert r['r30_source_classification']=='OFFICIAL_FSSR_STANDARD_CLAUSE_LOCATED'
 else:
  assert not re.match(r'^\d+\.\d+\.\d+',r['fssr_original'])
  assert r['source_heading'] is None
  assert r['source_uri']==r30['source_documents']['foscos']
  assert r['r30_source_classification']=='FOSCOS_ONLY_NO_EXACT_FSSR_STANDARD_CLAUSE_CONFIRMED'

assert ctr['r15_catalogue_contaminant_layer_review']['products_without_any_exact_current_evidence']==137
assert ctr['r16_product_specific_article_review_2026_11_03']['product_specific_article_gap_count']==137
assert ctr['r21_fpc18_directive_2026_11_03']['full_current_law_complete'] is False
print(json.dumps({
 'result':'PASS',
 'total_catalogue':533,
 'r29_exact_CTR_applicability_holds':137,
 'r30_FoSCoS_reclassified':26,
 'official_FSSR_clause_refs':17,
 'classification_only':9,
 'product_compliance_approvals':0,
 'numeric_CTR_rules_modified':False,
 'note':'Source metadata structural and legal-safety assertion only, not live app or regulatory release testing'
},indent=2))
