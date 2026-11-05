"""PMSV R32: five further CTR source rows; NEVER full product approval."""
from pathlib import Path
from collections import Counter
import copy,hashlib,json
R=Path(__file__).resolve().parents[1]
paths={k:R/v for k,v in {
 'r31':'fssai-helper/ctr-26-named-article-scope-r31-2026-11-04.json',
 'r29':'fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json',
 'master':'fssai-product-helper-preview-01/data/product-master-v1.json',
 'core':'fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json'}.items()}
sha={k:hashlib.sha256(v.read_bytes()).hexdigest() for k,v in paths.items()}
data={k:json.loads(v.read_text()) for k,v in paths.items()}
p=data['r31'];m=data['master'];ctr=data['core'];r29=data['r29']
assert len(m['catalog_products'])==len({x['id'] for x in m['catalog_products']})==533
assert len(p['records'])==26 and p['article_row_candidates_found']==8
assert len(r29['records'])==137 and r29['exact_CTR_product_article_applicability_still_open']==137
assert ctr['r15_catalogue_contaminant_layer_review']['products_without_any_exact_current_evidence']==137
P='04-04-2-frozen-vegetables'
url='https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf'
std='https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf'
items=[
 ('Chromium','Vegetables',1.0,13),
 ('Nickel','Vegetables',1.0,13),
 ('Antimony','Vegetables',1.0,13),
 ('Lead','Other vegetables',2.5,5),
 ('Cadmium','Other vegetables',1.5,12)
]
rows=[]
for name,article,limit,page in items:
 rows.append({
  'row_id':'R32_'+name.upper(),
  'product_id':P,'analyte':name,'source_food_article_exact':article,
  'source_limit_ppm':limit,'source_pdf_page_one_based':page,
  'source_url':url,'official_pdf_page_image_checked':True,
  'source_edition':'CTR Version IX (03.02.2026)',
  'article_subtype':'GENERIC_VEGETABLES_ARTICLE' if article=='Vegetables' else 'OTHER_VEGETABLES_RESIDUAL_SUBTYPE',
  'legal_use_condition':(
   'Verify actual vegetable species, processed frozen/blanched form, any added other ingredients, sample/method and current legal finished article'
   if article=='Vegetables' else
   'Verify residual Other vegetables class instead of more specific vegetable/leafy/legume/potato/root/tuber source article; confirm actual species and processing'
  ),
  'printed_source_typography_warning':'PDF has stray quote/bracket trailing the Antimony Vegetables row; check original Gazette before activation' if name=='Antimony' else '',
  'requires_original_gazette_reconciliation':True,
  'finished_sku_article_confirmed':False,'limit_auto_apply':False,
  'all_ctr_analytes_complete':False,'fully_legally_verified':False,
  'commercial_release_authorised':False
 })
all26=[]
for old in p['records']:
 rec=copy.deepcopy(old)
 rec['r32_new_candidate_rows']=copy.deepcopy(rows) if rec['catalogue_id']==P else []
 rec['r32_article_applicability']='EVIDENCE_HOLD'
 rec['r32_full_product_approval']=False
 rec['r32_no_current_lab_report_submitted']=True
 all26.append(rec)
assert len(all26)==26 and sum(len(x['r32_new_candidate_rows']) for x in all26)==5
assert sum(len(x['ctr_named_source_row_candidates']) for x in all26)==8
assert sum(bool(x['ctr_named_source_row_candidates'] or x['r32_new_candidate_rows']) for x in all26)==3
assert all(x['r32_article_applicability']=='EVIDENCE_HOLD' and not x['r32_full_product_approval'] for x in all26)
assert len({x['row_id'] for x in rows})==5
assert all(hashlib.sha256(v.read_bytes()).hexdigest()==sha[k] for k,v in paths.items())
out={
 'review':'PMSV R32',
 'date':'2026-11-04',
 'catalogue_total':533,
 'original_legal_article_applicability_open':137,
 'source_row_count_r31':8,'source_row_count_new_r32':5,
 'source_row_count_cumulative':13,
 'product_id_count_with_candidates':3,
 'new_product_id_count_with_candidates':0,
 'other_23_records_unchanged_candidates':23,
 'new_named_article_rows':dict(Counter(x['source_food_article_exact'] for x in rows)),
 'product_full_legal_approvals':0,'full_current_CTR_panels_verified':0,
 'commercial_lot_releases':0,
 'frozen_vegetable_FSSR_standard':'2.3.38',
 'source_url':url,'standard_url':std,
 'original_source_input_hashes':sha,
 'audit_branch_only':True,
 'production_engine_changed':False,'operative_numeric_CTR_rules_changed':False,
 'future_1_Dec_2026_amendment_inactive':True,
 'scope':'Source article candidates only. Actual food species, processed/frozen form, legal residual versus specific article, original Gazette, methods, full panel and lab evidence required.',
 'additional_rows':rows,'records':all26}
OUT=R/'fssai-helper/ctr-26-vegetables-metal-layer-r32-2026-11-04.json'
OUT.write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n')
lines=[
 '# PMSV R32: additional vegetable-metal source rows',
 '',
 '**4 November 2026. This source-row review does not constitute whole-product regulatory approval.**',
 '',
 '| Check | Count |','|---|---:|',
 '| Catalogue records preserved | 533 |',
 '| R31 source-table rows retained | 8 |',
 '| R32 additional source-table rows | 5 |',
 '| Cumulative source-table candidates | 13 |',
 '| Product identities with candidates | 3 |',
 '| Exact legal finished-product article decisions still open | 137 |',
 '| Fully verified contaminant panels | 0 |',
 '| Full-product approvals or commercial releases | 0 |',
 '',
 '## Additional source-table rows (not applied)',
 '',
 '| Contaminant | Printed article | Limit, ppm | Source PDF page |',
 '|---|---|---:|---:|',
]
for a in rows:
 lines.append('| '+a['analyte']+' | '+a['source_food_article_exact']+' | '+str(a['source_limit_ppm'])+' | '+str(a['source_pdf_page_one_based'])+' |')
lines.extend([
 '',
 'The CTR table lists Vegetables for Chromium, Nickel and Antimony at 1 mg/kg each; these augment Copper, Arsenic and Mercury recorded in R31. Lead and Cadmium are printed under the separate Other vegetables article, whose residual category cannot be applied until species and competing specific vegetable articles are established.',
 '',
 'Standard 2.3.38 Frozen Vegetables permits blanching, freezing and certain added salt, spices, milk solids and other ingredients. Neither the catalogue name nor this identity standard demonstrates that an exact CTR finished-food article applies to a particular SKU or processed matrix.',
 '',
 'The Version IX PDF has a stray punctuation mark after Antimony Vegetables 1.0. Original Gazette reconciliation is required before this row is used in a legal comparator.',
 '',
 'Check actual SKU, exact vegetable species, added ingredients, process, final primary packaging, sampling basis, validated analytical methods, relevant test reports, current amendment law and all metals/toxins/pesticide/veterinary residues. A single matched source row is not a full regulatory PASS.',
 '',
 'The 1 December 2026 CTR amendment is not operative on the 4 November 2026 review date.',
 '',
 'Official CTR source: '+url,
 'Official FSSR Chapter 2.3: '+std,
 '',
 'Machine-readable record: ctr-26-vegetables-metal-layer-r32-2026-11-04.json',
 'No existing regulatory rule, product master record, approval, production app or earlier audit file changed.',
 ''])
MD=R/'fssai-helper/ctr-26-vegetables-metal-layer-r32-2026-11-04.md'
MD.write_text('\n'.join(lines))
assert len(json.loads(OUT.read_text())['records'])==26
assert all(hashlib.sha256(v.read_bytes()).hexdigest()==sha[k] for k,v in paths.items())
print(json.dumps({'result':'PASS','new_rows':5,'cumulative_rows':13,
 'unadjudicated_article_cases':137,'full_approvals':0,
 'json_sha256':hashlib.sha256(OUT.read_bytes()).hexdigest(),
 'report_sha256':hashlib.sha256(MD.read_bytes()).hexdigest()},indent=2))
