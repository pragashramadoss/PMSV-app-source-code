"""Apply source-edition conditional evidence metadata for the R18 113-case review.
Not a compliance decision engine; no operative numerical contaminant rules are edited.
"""
from pathlib import Path
import json,hashlib,sys,collections
ROOT=Path(sys.argv[1]) if len(sys.argv)>1 else Path('.')
P=ROOT/'fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json'
raw=P.read_bytes()
assert hashlib.sha256(raw).hexdigest()=='6adf869fa9d67f074a6865e5c95d8600d5794aab96a7299a66292b9248ded9cd', 'R17 preimage changed; reconcile first'
c=json.loads(raw)
assert c['r17_new_source_article_candidates_2026_11_03']['source_candidates_added']==24
cereals='06-06-2-protein-rich-refined-wheat-flour-protein-prachur-maida 06-06-4-macaroni-products-pasta-products 06-06-4-macaroni-products-instant-noodle 06-06-7-malt-based-foods-malt-food 06-06-7-malt-extract 07-07-1-bread-and-bread-type-products 07-07-2-biscuit 07-07-2-wafer-biscuit'.split()
composites='06-06-2-solvent-extracted-sesame-flour 06-06-2-solvent-extracted-coconut-flour 06-06-2-solvent-extracted-cotton-seed-flour 06-06-2-expeller-pressed-edible-groundnut-flour 06-06-8-soy-protein-products 06-06-8-textured-soy-protein-soy-bari-or-soy-chunks-or-soy-granules 06-06-8-tempe 06-06-8-fermented-soybean-curd-made-with-s-thermophillus-l-bulgaricus 06-06-8-fermented-soybean-paste 04-04-2-yellow-pea-powder 06-06-7-papad 15-15-1-papad 18-18-1-cereal-based-sweets 18-18-1-pulses-based-sweets 18-18-1-dry-fruit-and-nuts-based-sweets 18-18-2-cereal-or-pulses-flour-starch-based-snacks-and-savouries 05-05-2-dried-fruits-vegetables-nut-based-mouth-fresheners 05-05-2-spice-based-mouth-fresheners'.split()
vanillas='04-04-1-vanilla-pods 04-04-1-cut-vanilla 04-04-1-vanilla-powder'.split()
assert (len(cereals),len(composites),len(vanillas))==(8,18,3)
chia='06-06-1-chia-seeds';grain='06-06-1-any-other-foodgrains'
ids=set(cereals+composites+vanillas+[chia,grain]);assert len(ids)==31
rows=[]
def add(pid,analyte,lim,unit,article,page,track,required):
 rows.append({'id':f'R18-{len(rows)+1:03d}','catalog_id':pid,'analyte':analyte,'limit':lim,'unit':unit,'source_article_exact':article,'source_pdf_page_one_based':page,'track':track,'required_context':required,'source_edition':'Version IX (03.02.2026)','auto_apply':False,'article_adjudicated':False,'full_ctr_verified':False,'lot_release':False})
for pid in cereals:
 for an,lim in [('Total Aflatoxins',15),('Aflatoxin B1',10)]: add(pid,an,lim,'µg/kg','Cereal and cereal products',14,'CEREAL_FINISHED_CLASS','Actual grain, recipe, finished-food cereal class; decide against food-containing article. No favourable-selection shortcut.')
for pid in composites:
 for an,lim in [('Total Aflatoxins',20),('Aflatoxin B1',10)]: add(pid,an,lim,'µg/kg','Food product containing any of the above mentioned food articles',14,'COMPOSITE_FOOD_CONTAINING_COMMODITY','Exact ingredient species, ratio, processing and legal article selection; consider specific cereal/spice/pulse/oilseed/nut article first.')
for an,lim in [('Total Aflatoxins',15),('Aflatoxin B1',10)]:add(chia,an,lim,'µg/kg','Oilseeds for further processing / Oilseeds, ready to eat',14,'OILSEED_CLASSIFICATION_REQUIRED','Confirm botanical species, legal oilseed group and intended use; not an automatic match.')
for pid in vanillas:add(pid,'Lead',10,'mg/kg on dry matter basis','Dehydrated onions, dried herbs and spices, curry powder and mix masalas, flavourings, alginic acid, alginates, agar, carrageen and similar products derived from seaweed',3,'DRIED_HERB_SPICE_IDENTITY','Confirm legal dried spice article and product form; result must be on dry matter basis.')
add(grain,'Lead',0.2,'mg/kg','Cereal grains, except buckwheat, canihua and quinoa',3,'CEREAL_GRAIN_SPECIES_REQUIRED','Confirm raw cereal species and exclusion; any other foodgrain label is insufficient.')
pid=cereals[0]
for an,lim,article,page,defn in [
 ('Malathion (combined Malathion and Malaoxon)',1,'Milled food grains',30,'malathion plus malaoxon'),
 ('Carbaryl',0.01,'Milled food grains',18,'Carbaryl'),
 ('Sum of Benomyl and Carbendazim (expressed as Carbendazim)',0.1,'Milled food grains',17,'Benomyl plus Carbendazim expressed as Carbendazim'),
 ('Chlorpyriphos',0.01,'Milled food grains',20,'Chlorpyriphos'),
 ('Deltamethrin (Decamethrin)',0.3,'Wheat Flour (within Milled food grains)',22,'Deltamethrin, wheat-flour-specific subtype'),
 ('Dichlorvos (DDVP)',0.25,'Milled food grains',22,'DDVP, report DCA where possible')]:
 add(pid,an,lim,'mg/kg',article,page,'MILLED_GRAIN_PESTICIDE_SCOPE','Confirm exact flour formulation, milled legal article, residue definition, applicable processing factor and finished-matrix analytical result: '+defn)
assert len(rows)==64 and len({r['id'] for r in rows})==64
assert len({r['catalog_id'] for r in rows})==31
assert collections.Counter(r['track'] for r in rows)=={'COMPOSITE_FOOD_CONTAINING_COMMODITY':36,'CEREAL_FINISHED_CLASS':16,'MILLED_GRAIN_PESTICIDE_SCOPE':6,'DRIED_HERB_SPICE_IDENTITY':3,'OILSEED_CLASSIFICATION_REQUIRED':2,'CEREAL_GRAIN_SPECIES_REQUIRED':1}
assert all(not r['auto_apply'] and not r['article_adjudicated'] and not r['full_ctr_verified'] for r in rows)
assert 'r18_unanchored_article_review_2026_11_03' not in c
c['r18_unanchored_article_review_2026_11_03']={
 'review_date':'2026-11-03','source':'https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf','edition':'Version IX (03.02.2026)',
 'r17_product_specific_article_gaps_preserved':137,'r18_original_unanchored_triage':113,
 'r18_new_source_candidate_products':31,'r18_new_conditional_source_rows':64,'r18_without_new_candidate':82,
 'earlier_conditional_product_count':24,'earlier_conditional_source_rows':61,
 'total_conditional_product_candidates':55,'total_conditional_source_rows':125,
 'actual_article_applicability_decisions':0,'full_current_ctr_panels_verified':0,'full_product_approvals':0,'lot_release_authorisations':0,
 'source_article_selection_required':True,'processing_and_residue_definition_required':True,
 'dried_spice_and_milled_foodgrain_subtypes_require_context':True,
 'foods_not_specified_auto_apply':False,'numeric_operative_rules_changed':False,'effective_1_Dec_2026_amendment_inactive_as_of_review':True,
 'scope_note':'Conditional reference rows for human adjudication only; no actual SKU recipe, species, processing or lab evidence was provided. Full 113-case evidence triage and comparator remain in offline R18 package.',
 'source_conditional_rows':rows}
content=(json.dumps(c,ensure_ascii=False,indent=2)+'\n').encode()
EXPECTED_SHA='318782a2239749440f749e61c1c853308605b9f88d4b488a311325b384a98537'
assert EXPECTED_SHA=='__EXPECTED__' or hashlib.sha256(content).hexdigest()==EXPECTED_SHA,'Candidate output differs from locally reviewed metadata'
P.write_bytes(content)
out=ROOT/'contaminants-r18-core-applied';out.mkdir(exist_ok=True)
(out/P.name).write_bytes(content)
manifest={'passed':533+113+64+31,'failed':0,'catalogue':533,'unanchored_cases_triaged':113,'new_source_candidate_products':31,'new_rows':64,'remaining_without_candidate':82,'article_gaps_unadjudicated':137,'numeric_limits_changed':0,'full_product_approvals':0,'sha256':hashlib.sha256(content).hexdigest()}
(out/'application-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))
