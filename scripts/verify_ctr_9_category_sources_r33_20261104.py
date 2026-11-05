"""R33 independent CI: named ingredient sources not blanket category limits.

Only source-scope metadata. Full product legal assessment is NOT performed.
"""
import json
from pathlib import Path
from collections import Counter
ROOT=Path(__file__).resolve().parents[1]
def read(path):return json.loads((ROOT/path).read_text())
r33=read('fssai-helper/ctr-9-broad-categories-source-guards-r33-2026-11-04.json')
r30=read('fssai-helper/ctr-26-fssr-clause-reconciliation-r30-2026-11-04.json')
r32=read('fssai-helper/ctr-26-vegetables-metal-layer-r32-2026-11-04.json')
r29=read('fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json')
master=read('fssai-product-helper-preview-01/data/product-master-v1.json')
core=read('fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json')
catalogue={x['id'] for x in master['catalog_products']}
assert len(catalogue)==len(master['catalog_products'])==533
assert len(r29['records'])==137
assert r29['exact_CTR_product_article_applicability_still_open']==137
assert r32['original_legal_article_applicability_open']==137
assert r32['source_row_count_cumulative']==13
assert r33['catalogue_total']==533
assert r33['original_exact_ctr_product_applicability_decisions_unresolved']==137
assert r33['broad_FoSCoS_category_items_reviewed']==9
assert r33['categories_with_named_child_ingredient_sources']==2
assert r33['categories_without_safe_named_child_source_in_this_pass']==7
assert r33['named_official_ctr_source_rows']==9
assert r33['distinct_exact_source_substances']==4
assert r33['new_verified_product_ctr_article_decisions']==0
assert r33['full_product_approvals']==0 and r33['full_current_ctr_panels_verified']==0
assert r33['production_engine_modified'] is False
assert r33['operative_numeric_limits_modified'] is False
assert r33['do_not_transfer_dry_matter_qualifier'] is True
assert r33['effective_december_2026_amendment_not_active_on_review_date'] is True
assert r33['original_gazette_precedence'] is True

r30_unknown={x['catalogue_id']:x for x in r30['records'] if x['source_clause'] is None}
assert len(r30_unknown)==9
a={x['catalog_id']:x for x in r33['records']}
assert len(a)==len(r33['records'])==9
assert set(a)==set(r30_unknown)<=catalogue
assert len([x for x in a.values() if x['official_example_source_rows']])==2
assert sum(len(x['official_example_source_rows']) for x in a.values())==9
assert all(x['full_product_legally_verified'] is False
           and x['current_full_ctr_panel_verified'] is False
           and x['commercial_release_authorized'] is False
           and x['generic_source_article_fallback_auto_apply'] is False
           and x['actual_substance_identity_provided'] is False
           and x['actual_lab_reports_provided'] is False
           for x in a.values())

expected={
 ('Sorbitol','Lead'):(1,6),
 ('Sorbitol','Arsenic'):(3,10),
 ('Sorbitol','Nickel'):(2,13),
 ('Sodium benzoate','Lead'):(2,6),
 ('Sodium benzoate','Arsenic'):(3,10),
 ('Steviol glycoside','Lead'):(1,6),
 ('Steviol glycoside','Arsenic'):(1,10),
 ('Synthetic food colour-preparation and mixtures','Lead'):(10,6),
 ('Synthetic food colour-preparation and mixtures','Arsenic'):(3,10)
}
assert len(expected)==9
actual={(x['printed_food_article'],x['analyte']):
          (x['source_limit'],x['ctr_pdf_page_one_based']) for x in r33['examples']}
assert actual==expected,(actual,expected)
assert len(r33['examples'])==len({x['row_id'] for x in r33['examples']})==9
for x in r33['examples']:
 assert x['category_id'] in a
 assert x['printed_unit']=='ppm (mg/kg or mg/L)'
 assert x['expected_solid_sample_unit']=='mg/kg'
 assert x['source_checked_against_pdf_page_image'] is True
 assert x['matched_to_particular_ingredient_or_SKU'] is False
 assert x['exact_substance_name_and_characterization_needed'] is True
 assert x['additive_use_permission_and_formulation_needed'] is True
 assert x['source_analytical_method_and_basis_needed'] is True
 assert x['original_gazette_amendment_check_needed'] is True
 assert x['is_category_wide_limit'] is False
 assert x['source_row_auto_apply'] is False
 assert x['full_product_approved'] is False
 assert x['ctr_source_uri']==r33['source_pdf_uri']
 assert x['row_id'] in {r['row_id'] for r in a[x['category_id']]['official_example_source_rows']}
 assert x['category_id'].startswith('11-11-6-') if x['printed_food_article']=='Sorbitol' else x['category_id'].startswith('99-99-1-')

colour=[r for r in r33['examples'] if r['printed_food_article']=='Synthetic food colour-preparation and mixtures' and r['analyte']=='Arsenic']
assert len(colour)==1
assert 'no explicit dry-matter' in colour[0]['colour_arsenic_basis_caution']
assert 'different broader class' in colour[0]['colour_arsenic_basis_caution']
# Neither generic food-colour source article nor its separate dry-matter
# basis was spliced into the specific synthetic-colour article.
assert all(x['source_row_auto_apply'] is False for x in r33['examples'])
assert core['r15_catalogue_contaminant_layer_review']['products_without_any_exact_current_evidence']==137
print(json.dumps({
 'result':'PASS','catalogue':533,'previous_legal_applicability_gaps':137,
 'categories_reviewed':9,'named_exact_substances':4,
 'source_rows':9,'no_exact_source_for_other_categories':7,
 'new_product_approvals':0,'production_changed':False,
 'scope':'Source-row wording, qualifiers and safeguards only'
},indent=2))
