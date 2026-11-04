"""PMSV R31: verify fixed Version IX article rows and no automatic product approval.

Only source/crosswalk metadata is assessed. Not an actual regulatory
certification; current original Gazettes, SKU/matrix and lab evidence remain open.
"""
from collections import Counter
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
def load(x):return json.loads((ROOT/x).read_text())
r29=load('fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json')
r30=load('fssai-helper/ctr-26-fssr-clause-reconciliation-r30-2026-11-04.json')
r31=load('fssai-helper/ctr-26-named-article-scope-r31-2026-11-04.json')
master=load('fssai-product-helper-preview-01/data/product-master-v1.json')
core=load('fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json')

master_ids={p['id'] for p in master['catalog_products']}
r30_ids={p['catalogue_id'] for p in r30['records']}
r31_ids={p['catalogue_id'] for p in r31['records']}
r29_ids={p['catalog_id'] for p in r29['records']}
assert len(master_ids)==len(master['catalog_products'])==533
assert len(r29_ids)==len(r29['records'])==137
assert len(r30_ids)==len(r30['records'])==26
assert r30_ids==r31_ids<=r29_ids<=master_ids
assert r31['r30_fssr_named_standard_records']==17
assert r31['r30_category_only_records']==9
assert r31['originally_unadjudicated_product_ctr_article_cases']==137
assert r31['historical_source_screening_closed']==137
assert r31['products_with_article_row_candidates']==3
assert r31['article_row_candidates_found']==8
assert r31['no_new_source_row_candidates_in_this_pass']==23
assert r31['exact_ctr_finished_article_adjudications_added']==0
assert r31['full_ctr_panels_verified']==0
assert r31['products_fully_legally_verified']==0
assert r31['production_engine_modified'] is False
assert r31['operative_numeric_limits_modified'] is False
assert r31['amendment_17_future_effective_date']=='2026-12-01'
assert core['r15_catalogue_contaminant_layer_review']['products_without_any_exact_current_evidence']==137

# Product and analyte, legal source article, printed source limit,
# 1-based page in official CTR IX, exact legal article not yet adjudicated.
expected={
 ('04-04-1-fruit-cheese','Copper'):('Pulp and pulp products of any fruit',5,7),
 ('04-04-1-fruit-cheese','Arsenic'):('Pulp and pulp products of any fruit',0.2,10),
 ('04-04-1-fruit-cheese','Tin'):('Pulp and pulp products of any fruit',250,11),
 ('04-04-1-murabba','Lead'):('Jam (fruit preserves) and jellies',1,4),
 ('04-04-1-murabba','Tin'):('Jam, Jellies and Marmalade',250,11),
 ('04-04-2-frozen-vegetables','Copper'):('Vegetables',30,8),
 ('04-04-2-frozen-vegetables','Arsenic'):('Vegetables',1.1,10),
 ('04-04-2-frozen-vegetables','Mercury'):('Vegetables',1.0,12),
}
assert len(expected)==8
observed={}
for r in r31['records']:
 assert r['catalogue_id'] in r30_ids
 assert r['wrong_article_guard']
 assert r['exact_finished_product_ctr_article_decision']=='EVIDENCE_HOLD'
 assert r['eligible_for_commercial_release_from_this_review'] is False
 assert r['full_current_law_verified'] is False
 assert r['no_current_lab_method_or_sample_evidence_supplied'] is True
 assert r['competing_source_articles_require_adjudication'] is True
 assert r['primary_pack_and_processing_scope_needed'] is True
 assert r['finished_sku_identity_and_recipe_required'] is True
 assert r['original_r30_classification'] in ('OFFICIAL_FSSR_STANDARD_CLAUSE_LOCATED','FOSCOS_ONLY_NO_EXACT_FSSR_STANDARD_CLAUSE_CONFIRMED')
 for a in r['ctr_named_source_row_candidates']:
  k=(r['catalogue_id'],a['analyte'])
  assert k not in observed
  assert a['source_row_wording_verified_against_official_pdf'] is True
  assert a['source_row_applicability_to_catalogue_identity']=='NOT_ADJUDICATED'
  assert a['source_row_applies_auto'] is False
  assert a['full_product_approved'] is False
  assert a['current_law_complete'] is False
  assert a['commercial_release_authorized'] is False
  assert a['printed_unit']=='ppm (mg/kg or mg/L)'
  assert a['comparison_unit']=='mg/kg'
  assert a['source_limit']>0
  assert 'fssai.gov.in' in a['ctr_pdf_url']
  assert 'finish' in a['analytical_basis'].lower()
  assert a['qualifier'] and a['source_scope_comment']
  observed[k]=(a['source_article'],a['source_limit'],a['ctr_pdf_page_one_based'])
assert observed==expected,(observed,expected)

# Original named Tin sources did not print a can-only qualifier.
for k in (('04-04-1-fruit-cheese','Tin'),('04-04-1-murabba','Tin')):
 assert 'canned' not in observed[k][0].lower()
 r=next(x for x in r31['records'] if x['catalogue_id']==k[0])
 candidate=next(x for x in r['ctr_named_source_row_candidates'] if x['analyte']=='Tin')
 assert 'NOT' in candidate['qualifier'] or 'not' in candidate['qualifier']
assert r31['source_not_canned_specific_note'].startswith('Tin source article')

# User-level product controls remain unchanged in both prior audit ledgers.
assert all(not r['fully_legally_verified'] and not r['numeric_rule_applied'] for r in r29['records'])
assert all(not r['full_product_legally_verified'] and not r['auto_apply_contaminant_rule'] for r in r30['records'])
print(json.dumps({
 'result':'PASS','catalogue':533,'historical_exact_article_holds':137,
 'FSSR_identity_rows':17,'category_routes':9,
 'CTR_named_source_rows':len(observed),'source_conditional_products':3,
 'tin_without_printed_can_requirement':2,'new_product_approvals':0,
 'scope':'Source-table tokens, preserved legal holds and audit integrity only'
},indent=2))
