"""PMSV R37: reconcile 24 previously unmapped Ayurveda source ingredient rows.

FSSAI CTR IX named RAW commodity pesticide rows are conditional references,
not applied to processed/cooked Ayurveda formulations or released products.
"""
from pathlib import Path
from collections import Counter
import json,hashlib,copy
ROOT=Path(__file__).resolve().parents[1]
INPUTS={
 'r36':ROOT/'fssai-helper/ayurveda-ingredient-ctr-crosswalk-r36-2026-11-04.json',
 'r35':ROOT/'fssai-helper/ayurveda-category-a-recipe-evidence-r35-2026-11-04.json',
 'r29':ROOT/'fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json',
 'master':ROOT/'fssai-product-helper-preview-01/data/product-master-v1.json',
 'core':ROOT/'fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json',
}
HASHES={k:hashlib.sha256(v.read_bytes()).hexdigest() for k,v in INPUTS.items()}
a={k:json.loads(v.read_text()) for k,v in INPUTS.items()}
d=a['r36'];m=a['master'];prior=a['r29']
assert len(m['catalog_products'])==len({x['id'] for x in m['catalog_products']})==533
assert len(prior['records'])==137 and prior['exact_CTR_product_article_applicability_still_open']==137
assert d['original_ingredient_records']==46 and d['raw_ingredient_source_reference_links']==67
assert d['distinct_official_reference_rows']==22
original=d['ingredient_source_crosswalk']
no_source=[x for x in original if not x['possible_source_row_ids']]
assert len(original)==46 and len(no_source)==24
pdf='https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf'
# Source rows inspected in official PDF page images; use exact source name and
# the separate printed analyte/residue expression, never an invented generic MRL.
# Page labels are one-based PDF pages, NOT physical footer page numbers.
spec=[
 ('MANGO_ALPHA_NAA','Amra phala','Alpha naphthyl Acetic Acid','Mango',.05,'mg/kg',17,'Parent pesticide name as printed; confirm residue definition and source crop/MRL scope'),
 ('MANGO_AZOXYSTROBIN','Amra phala','Azoxystrobin','Mango',.7,'mg/kg',17,'Actual raw mango fruit MRL candidate only, not an automatic mixed cooked milk beverage limit'),
 ('MANGO_BENOMYL_CARBENDAZIM_SUM','Amra phala','Sum of benomyl and carbendazim expressed as carbendazim','Mango',2.0,'mg/kg',17,'Combined residue definition; not interchangeable with the separately printed Carbendazim source row'),
 ('MANGO_CARBENDAZIM','Amra phala','Carbendazim','Mango',5.0,'mg/kg',19,'Separate printed Carbendazim entry; conflicting/overlapping benomyl sum source must be legally reconciled, no favourable-limit selection'),
 ('MANGO_MANCOZEB_CS2','Amra phala','Dithiocarbamates (c) Mancozeb','Mango',2.0,'mg/kg',24,'Mancozeb subgroup and CS2 reporting basis; no blanket dithiocarbamate result'),
 ('BANANA_BENOMYL_CARBENDAZIM_SUM','Kadali','Sum of benomyl and carbendazim expressed as carbendazim','Banana (whole)',1.0,'mg/kg',17,'WHOLE banana source article; do not transfer to peeled fruit without residue/sample basis evidence'),
 ('BANANA_CARBENDAZIM','Kadali','Carbendazim','Banana (whole)',1.0,'mg/kg',19,'Distinct Carbendazim entry for WHOLE banana; review overlap with benomyl/carbendazim sum source'),
 ('BANANA_METIRAM_CS2','Kadali','Dithiocarbamates (d) Metiram as CS2','Banana',2.0,'mg/kg',24,'Metiram subgroup expression as CS2; actual species, processing and residue method required'),
 ('BANANA_DIURON','Kadali','Diuron','Banana',.1,'mg/kg',24,'Single source article; not a complete pesticide panel and not a milk-fruit finished-food standard')
]
assert len(spec)==9
lookup={}
rows=[]
for sid,source_name,analyte,article,limit,unit,page,guard in spec:
  assert sid not in lookup
  r={
   'source_ref_id':'R37_'+sid,'source_printed_ingredient':source_name,
   'source_pesticide_analyte':analyte,'printed_food_article':article,
   'source_MRL':limit,'source_unit':unit,'source_pdf_page_one_based':page,
   'source_url':pdf,'source_edition':'Version IX 03.02.2026',
   'pdf_source_page_image_verified':True,
   'requires_exact_residue_definition_and_method':True,
   'source_article_qualifier':guard,
   'actual_food_part_and_processing_verified':False,
   'actual_SKU_source_article_adjudicated':False,
   'current_original_Gazette_reconciled':False,
   'legal_finished_product_MRL_confirmed':False,
   'source_row_auto_apply':False,'full_product_compliant':False,
   'commercial_batch_release_authorized':False
  }
  rows.append(r)
  lookup[sid]=r
ids_by_name={
 'Amra phala':[x['source_ref_id'] for x in rows if x['source_printed_ingredient']=='Amra phala'],
 'Kadali':[x['source_ref_id'] for x in rows if x['source_printed_ingredient']=='Kadali']
}
assert list(map(len,ids_by_name.values()))==[5,4]
guards={
 'water':'Recipe process water requires potable/process-water specifications and actual source verification; packaged drinking-water/IS14543 and natural mineral-water metal rows do not auto apply.',
 'ghee':'Clarified butter/ghee needs exact milk-fat and residue matrix; cannot borrow generic vegetable oil or liquid milk methods/limits merely by origin.',
 'coconut_endosperm':'Coconut kernel is not coconut oil, coconut water or coconut milk: no automatic inheritance.',
 'camphor_extract':'Camphor extract: verify species, chemical grade, actual permitted edible use, toxicological/source conditions; do not treat arbitrary camphor as safe.',
 'pomegranate_flower':'Pomegranate flower is not the legally printed Pomegranate FRUIT pesticide article. Source Metiram as CS2 Pomegranate 0.05* mg/kg is deliberately excluded pending botanical-part scope adjudication.',
 'unidentified_aromatic_flowers':'Aromatic flowers without specified species/part cannot be assigned plant-specific or generic spice MRLs.',
 'ginger_rhizome':'Ginger rhizome fresh versus dried spice powder, food-use and processing condition; no exact Ginger source article added in this narrow pass.',
 'asafoetida_oleoresin':'Asafoetida gum/oleoresin is not automatically the dried-herbs/spices or flavouring dry-matter article.',
 'date_fruit':'Dates (fresh or dried unknown) are not dried figs, nor automatically a generic dry-fruits MRL.',
 'sandalwood_heartwood':'Sandalwood heartwood is not a dried culinary spice by default; verify edible-use permission, species, quality and sample basis.',
 'juniper_fruit':'Juniper fruit botanical identity and edible-use grade required before inheriting a broad spice/dried herb article.',
 'vetiver_root':'Vetiver root is not automatically a generic root/tuber vegetable commodity for pesticide MRLs.',
 'screw_pine_flower':'Screw-pine flower product and botanical identity must be established before any spice or fruit article mapping.',
 'jasmine_flower':'Jasmine flower is not jasmine essential oil, and is not automatically a dried spice.',
 'ball_tree_flower':'Calophyllum inophyllum flower requires actual ingredient grade, identity, safety and legal-use check; do not apply seed/oil article.',
}
# All remaining categories retain source holds; no numeric fallback, exemption
# or unsupported source article is invented for them.
enriched=[]
for x in no_source:
  y=copy.deepcopy(x)
  newids=ids_by_name.get(x['source_name'],[])
  key=x['source_family']
  y['r37_named_source_row_ids']=list(newids)
  y['r37_review_status']='RAW_FRUIT_PESTICIDE_SOURCE_ROWS_IDENTIFIED_RECIPE_LOCKED' if newids else 'NO_DEFENSIBLE_NAMED_INGREDIENT_SOURCE_ADDED_THIS_PASS'
  y['r37_source_scope_guard']=guards.get(key,'Botanical identification, exact grade and actual legal source article must be independently established; no generic source inference.')
  y['recipe_title_method_alignment_lock']=x['recipe_number'] in ('14.6','14.7')
  y['source_identity_confirmed_for_actual_SKU']=False
  y['source_ingredient_use_legally_cleared']=False
  y['finished_food_MRL_article_decided']=False
  y['complete_current_residue_panel_reviewed']=False
  y['full_product_legally_verified']=False
  y['commercial_release_authorized']=False
  y['auto_apply_limits']=False
  enriched.append(y)
assert len(enriched)==24
assert sum(bool(x['r37_named_source_row_ids']) for x in enriched)==2
assert sum(len(x['r37_named_source_row_ids']) for x in enriched)==9
assert all(x['recipe_title_method_alignment_lock'] for x in enriched if x['r37_named_source_row_ids'])
assert sum(not x['r37_named_source_row_ids'] for x in enriched)==22
assert sum(bool(x['possible_source_row_ids']) for x in original)==22
all_refs=sum(len(x['possible_source_row_ids']) for x in original)+sum(len(x['r37_named_source_row_ids']) for x in enriched)
assert all_refs==76
other=Counter(x['source_family'] for x in enriched if not x['r37_named_source_row_ids'])
out={
 'review_id':'PMSV_R37_2026_11_04',
 'reviewed_on':'2026-11-04',
 'scope':'Targeted official-source pesticide crosswalk for R36 24 no-reference Ayurveda ingredient rows. Actual cooked/composite product MRLs NOT adjudicated.',
 'original_PMSV_catalogue_count':533,
 'original_CTR_article_applicability_holds':137,
 'original_Ayurveda_ingredient_rows':46,
 'r36_rows_with_source_candidates':22,
 'r36_distinct_source_rows':22,
 'r36_source_reference_links':67,
 'previously_without_source_references':24,
 'new_named_raw_fruit_source_candidates':9,
 'newly_reference_linked_ingredient_instances':2,
 'remaining_without_named_source_row_in_this_pass':22,
 'new_cumulative_source_links':76,
 'raw_fruit_source_candidate_recipe':'14.6',
 'recipe_14_6_and_14_7_source_alignment_hold_preserved':True,
 'pomegranate_flower_not_pomegranate_fruit':True,
 'pomegranate_fruit_metiram_source_reference_NOT_applied':{
   'analyte':'Dithiocarbamates (d) Metiram as CS2',
   'food_article':'Pomegranate','printed_MRL_mg_kg':'0.05*',
   'source_pdf_page_one_based':24,
   'reason':'Published recipe ingredient is Punica granatum FLOWER, not pomegranate fruit; asterisk is LOQ marker, not automatic flower MRL.'
 },
 'new_exact_legal_product_article_decisions_closed':0,
 'fully_verified_current_CTR_panels':0,'product_approvals':0,'commercial_releases':0,
 'fssai_source_url':pdf,'source_as_of':'Version IX 03.02.2026',
 'future_1_Dec_2026_amendment_not_active':True,
 'numeric_CTR_rules_changed':False,'source_product_master_modified':False,
 'live_PMSV_engine_modified':False,'audit_branch_only':True,
 'input_sha256':HASHES,
 'new_official_raw_fruit_source_rows':rows,
 'all_24_prior_no_reference_ingredient_rows':enriched,
 'remaining_unanchored_group_counts':dict(other)
}
OUT=ROOT/'fssai-helper/ayurveda-unmapped-ingredient-source-review-r37-2026-11-04.json'
REPORT=ROOT/'fssai-helper/ayurveda-unmapped-ingredient-source-review-r37-2026-11-04.md'
OUT.write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n')
lines=[
 '# PMSV R37 — 24 original no-reference Ayurveda ingredients, raw fruit source scope',
 '',
 '**4 November 2026. Source references are not full product legal approval.**',
 '',
 '| Check | Outcome |','|---|---:|',
 '| Catalogue IDs preserved | 533 |',
 '| Previously open exact product CTR article decisions | 137 |',
 '| R36 Ayurveda original ingredient rows | 46 |',
 '| R36 rows already containing a source reference | 22 |',
 '| R37 no-reference rows reviewed | 24 |',
 '| Additional source candidates for mango/banana fruit ingredients | 9 |',
 '| New ingredient-row identities with a conditional source reference | 2 |',
 '| Ingredient rows still without added named source reference | 22 |',
 '| Cumulative raw source-reference links, R36+R37 | **76** |',
 '| New fully adjudicated finished product articles or full product approvals | **0** |',
 '',
 '## New exact named raw-fruit pesticide source rows (conditional only)',
 '',
 '| Recipe ingredient | Analyte and printed residue article | MRL (mg/kg) | Official PDF page (1-based) |',
 '|---|---|---:|---:|'
]
for r in rows:
 lines.append('| '+r['source_printed_ingredient']+' | '+r['source_pesticide_analyte']+' — '+r['printed_food_article']+
              ' | '+str(r['source_MRL'])+' | '+str(r['source_pdf_page_one_based'])+' |')
lines+=['',
 '## Important legal article and sampling distinctions','',
 '- Mango Sum of benomyl and carbendazim expressed as carbendazim 2.0 mg/kg and separately printed Carbendazim Mango 5.0 mg/kg are two distinct source-table analyte expressions. The right legal article, cumulative residues, effective notification and method must be determined; do not select a favourable value.',
 '- Banana (whole) source entries cannot automatically be assigned to peeled banana ingredient. The actual botanical part and analytical residue basis matter.',
 '- Banana Metiram uses the as-CS2 expression; Mango Mancozeb is another specified dithiocarbamate subgroup, not a generic result. No generic dithiocarbamate 0.01 mg/kg fallback is allowed.',
 '- The R35 recipe ingredient Dadima is *pomegranate flower*, not the Pomegranate fruit source article. The Version IX Metiram as CS2 Pomegranate 0.05* entry is logged as an **explicit non-assignment** until floral food-part applicability has independent evidence.',
 '- All newly referenced fruit rows occur in Ayurveda recipe **14.6**, which retains a separate official source title/method alignment hold. They are only raw material source candidate rows; NO legal finished food route has been assigned.',
 '- Water, ghee, unusual botanical flowers, sandalwood heartwood, ginger rhizome, asafoetida oleoresin, coconut kernel, dates and edible camphor retain distinct identity/matrix/food-use gates. No blanket raw fruit, spice, packaged-water, vegetable oil or milk contaminant limits are assigned.',
 '- Reference source rows are not the full residue or contaminant panel. Full current notification status, methods, processing factors and actual SKU/lab evidence remain necessary.',
 '',
 '## Remaining 22 original ingredient rows without additional named source references',
 '',
 '| Recipe | Ingredient | Source family | Missing legal evidence |','|---|---|---|---|'
]
for x in enriched:
 if not x['r37_named_source_row_ids']:
  lines.append('| '+x['recipe_number']+' | '+x['source_name']+' | '+x['source_family']+
  ' | '+x['r37_source_scope_guard'].replace('|','/')+' |')
lines+=['',
 '## Evidence boundary',
 '',
 'Official CTR source: '+pdf,
 'Original 25-Jul-2025 Ayurveda recipe list: '+a['r35']['primary_source_url'],
 'Draft audit branch only. R36, all original source files, numerical CTR rules and deployed PMSV application remain unchanged. No legal PASS, batch release or inferred regulatory exemption.',
 '',
 'Structured 24-ingredient register: ayurveda-unmapped-ingredient-source-review-r37-2026-11-04.json',''
]
REPORT.write_text('\n'.join(lines))
assert len(json.loads(OUT.read_text())['all_24_prior_no_reference_ingredient_rows'])==24
assert all(hashlib.sha256(v.read_bytes()).hexdigest()==HASHES[k] for k,v in INPUTS.items())
print(json.dumps({
 'result':'PASS','original_unmapped':24,'named_ingredient_instances_newly_referenced':2,
 'new_source_rows':9,'still_no_extra_named_row':22,
 'cumulative_source_references':76,'legal_product_approvals':0,
 'source_alignment_hold_14_6':True,
 'register_sha256':hashlib.sha256(OUT.read_bytes()).hexdigest(),
 'report_sha256':hashlib.sha256(REPORT.read_bytes()).hexdigest()},indent=2))
