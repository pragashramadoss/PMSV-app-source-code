"""R36: Ayurveda raw ingredient / CTR source crosswalk, never a legal product PASS."""
from pathlib import Path
from collections import Counter
import json,hashlib,copy
R=Path(__file__).resolve().parents[1]
f={
 'r35':R/'fssai-helper/ayurveda-category-a-recipe-evidence-r35-2026-11-04.json',
 'r29':R/'fssai-helper/ctr-137-source-screening-closure-r29-2026-11-04.json',
 'master':R/'fssai-product-helper-preview-01/data/product-master-v1.json',
 'core':R/'fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json'}
shas={k:hashlib.sha256(v.read_bytes()).hexdigest() for k,v in f.items()}
a,b,m,c=(json.loads(f[k].read_text()) for k in ['r35','r29','master','core'])
assert len(m['catalog_products'])==len({p['id'] for p in m['catalog_products']})==533
assert len(b['records'])==137 and b['exact_CTR_product_article_applicability_still_open']==137
assert len(a['records'])==9 and sum(len(p['ingredients']) for p in a['records'])==46
URL='https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf'

# ID, analyte/restriction, verbatim or plainly disambiguated printed source article,
# limit, unit, 1-based PDF page. None denotes a prohibition, not a numerical MRL.
specs=[
 ('MILK_LEAD','Lead','Milks (concentration factor for partially/wholly dehydrated milks)',.02,'mg/kg',5),
 ('MILK_AFM1','Aflatoxin M1','Milk (Liquid)',.5,'ug/kg',14),
 ('MILK_24D','2,4-D','Milk and Milk products',.05,'mg/kg',16),
 ('CEREAL_LEAD','Lead','Cereal grains, except buckwheat, canihua and quinoa',.2,'mg/kg',3),
 ('CEREAL_TOTAL','Total Aflatoxins','Cereal and cereal products',15,'ug/kg',14),
 ('CEREAL_B1','Aflatoxin B1','Cereal and cereal products',10,'ug/kg',14),
 ('RICE_24D','2,4-D','Food grains: Rice',.1,'mg/kg',16),
 ('RICE_ACEPHATE','Acephate (mixture of Methamidophos and acephate)','Rice',1,'mg/kg',16),
 ('BARLEY_OTA','Ochratoxin A','Wheat, wheat bran, rye, barley, coffee',5,'ug/kg',15),
 ('BARLEY_DON','Deoxynivalenol','Wheat, wheat bran, barley',1000,'ug/kg',15),
 ('PULSE_LEAD','Lead','Pulses',.2,'mg/kg',5),
 ('PULSE_TOTAL','Total Aflatoxins','Pulses',15,'ug/kg',14),
 ('PULSE_B1','Aflatoxin B1','Pulses',10,'ug/kg',14),
 ('MUSTARD_PARATHION','Methyl parathion and oxygen analogue, combined','Mustard seed or Mustard oil',.01,'mg/kg',30),
 ('MUSTARD_CRUDE_LEAD','Lead','Vegetable Oils, crude, including mustard seed oil',.1,'mg/kg',6),
 ('MUSTARD_EDIBLE_LEAD','Lead','Vegetable Oils, edible, including mustard seed oil',.1,'mg/kg',6),
 ('HONEY_ANTIBIOTIC_BAN','No antibiotic use permitted during honey production','Honey production',None,None,40),
 ('HONEY_CHLOR_MRPL','Chloramphenicol MRPL, misuse surveillance','Honey',.3,'ug/kg',40),
 ('SUGAR_WHITE_LEAD','Lead','Refined white sugar, sulphated ash not exceeding 0.03 percent',.5,'mg/kg',2),
 ('SUGAR_HIGH_ASH_LEAD','Lead','Sugars/syrup/coloured sugar, sulphated ash exceeding 1.0 percent',5,'mg/kg',2),
 ('TURMERIC_LEAD','Lead','Turmeric whole and powder',10,'mg/kg',6),
 ('FOOD_SALT_LEAD','Lead','Salt, food grade',2,'mg/kg',6)
]
assert len(specs)==22 and len({x[0] for x in specs})==22
conditional={
 'MILK_LEAD':'Milk dehydration concentration factor mandatory; not a blanket cooked milk recipe limit.',
 'MILK_AFM1':'Source specifies LIQUID milk; not an automatic condensed milk or mixed product threshold.',
 'BARLEY_OTA':'Barley article, not automatically milk-barley recipe or cooked disc.',
 'BARLEY_DON':'Barley article, finished dish processing and test basis require legal review.',
 'RICE_24D':'Source row Rice 0.1 differs from milled food grains 0.01; establish raw/parched/milled food article.',
 'RICE_ACEPHATE':'Residue definition includes methamidophos and acephate.',
 'MUSTARD_PARATHION':'Combined parent and oxygen analogue; requires the actual mustard seed/oil article and analytical method.',
 'MUSTARD_CRUDE_LEAD':'Only when actual mustard oil is crude and legally this named source article.',
 'MUSTARD_EDIBLE_LEAD':'Only when actual mustard oil is edible and legally this named source article.',
 'HONEY_ANTIBIOTIC_BAN':'Antibiotics are not permitted during honey production; not a test limit or use permission.',
 'HONEY_CHLOR_MRPL':'MRPL is a laboratory test-performance level, NOT permission to use antibiotics.',
 'SUGAR_WHITE_LEAD':'Only refined white sugar with sulphated ash <=0.03%, not generic Sharkara.',
 'SUGAR_HIGH_ASH_LEAD':'Only named sugars/syrups with sulphated ash STRICTLY >1.0%.',
 'TURMERIC_LEAD':'Only turmeric whole/powder; the recipe merely says rhizome.',
 'FOOD_SALT_LEAD':'Rock salt must first be confirmed in food-grade Salt article.'
}
rules=[{
 'source_id':sid,'analyte':an,'article':article,'limit':lim,'unit':unit,
 'pdf_page_one_based':page,'ctr_source_url':URL,
 'source_page_image_checked':True,'source_version':'IX 03.02.2026',
 'kind':('USE_PROHIBITION' if sid=='HONEY_ANTIBIOTIC_BAN' else 'METHOD_PERFORMANCE_NOT_ALLOWED_USE' if sid=='HONEY_CHLOR_MRPL' else 'POTENTIAL_TABLE_ROW'),
 'source_scope_condition':conditional.get(sid,'Raw ingredient/source article, actual analyte, residue definition, processing factor and matrix must be independently verified.'),
 'source_applies_to_finished_recipe':False,'is_full_product_approval':False,
 'auto_apply_numeric_value':False
} for sid,an,article,lim,unit,page in specs]
rule_ids={r['source_id'] for r in rules}
# FSSAI recipe ingredient source names -> source family and conditional source rows.
M={
 'Jala':('water',[]),'Ushna Jala':('water',[]),
 'Laja':('rice',['CEREAL_LEAD','CEREAL_TOTAL','CEREAL_B1','RICE_24D','RICE_ACEPHATE']),
 'Tandula':('rice',['CEREAL_LEAD','CEREAL_TOTAL','CEREAL_B1','RICE_24D','RICE_ACEPHATE']),
 'Yava':('barley',['CEREAL_LEAD','CEREAL_TOTAL','CEREAL_B1','BARLEY_OTA','BARLEY_DON']),
 'Dala':('pulses',['PULSE_LEAD','PULSE_TOTAL','PULSE_B1']),
 'Godugdha':('milk',['MILK_LEAD','MILK_AFM1','MILK_24D']),
 'Mahishi Ksheera':('milk',['MILK_LEAD','MILK_AFM1','MILK_24D']),
 'Sharkara':('sugar',['SUGAR_WHITE_LEAD','SUGAR_HIGH_ASH_LEAD']),
 'Saindhava Lavana':('rock_salt',['FOOD_SALT_LEAD']),
 'Haridra':('turmeric',['TURMERIC_LEAD']),
 'Sarshapa Taila':('mustard_oil',['MUSTARD_PARATHION','MUSTARD_CRUDE_LEAD','MUSTARD_EDIBLE_LEAD']),
 'Madhu':('honey',['HONEY_ANTIBIOTIC_BAN','HONEY_CHLOR_MRPL']),
 'Ghrita':('ghee',[]),'Goghrita':('ghee',[]),
 'Narikela':('coconut_endosperm',[]),
 'Hribera':('juniper_fruit',[]),'Chandana':('sandalwood_heartwood',[]),
 'Ushira':('vetiver_root',[]),'Ardraka':('ginger_rhizome',[]),
 'Hingu':('asafoetida_oleoresin',[]),'Karpura':('camphor_extract',[]),
 'Ketaki':('screw_pine_flower',[]),'Kadali':('banana_fruit',[]),
 'Amra phala':('mango_fruit',[]),'Jati':('jasmine_flower',[]),
 'Dadima':('pomegranate_flower',[]),'Punnaga':('ball_tree_flower',[]),
 'Khajura':('date_fruit',[]),'Sugandhita pushpa':('unidentified_aromatic_flowers',[])
}
source_names={i['source_name'] for rec in a['records'] for i in rec['ingredients']}
assert source_names==set(M),(source_names-set(M),set(M)-source_names)
assert {i for _,rs in M.values() for i in rs}==rule_ids
special={
 'Laja':'Parched rice is not automatically raw Rice or milled food grain.',
 'Godugdha':'Cow milk: source liquid milk and dehydration concentration factor must be assessed for actual finished matrix.',
 'Mahishi Ksheera':'Buffalo milk: source liquid milk and concentration factors not automatically finished mixed product limits.',
 'Yava':'Barley may be substituted by green/black gram in recipe 15.1; actual finished recipe matters.',
 'Sharkara':'Competing ash-conditioned refined white versus high-ash sugar rows must NOT be selected without sulphated ash and identity.',
 'Madhu':'Antibiotics are forbidden during honey production. MRPL is test performance, not permission to use them.',
 'Sarshapa Taila':'Mustard oil crude versus edible lead articles; methyl parathion combined residue expression required.',
 'Haridra':'Turmeric rhizome is not necessarily dried whole/powder turmeric.',
 'Karpura':'Camphor requires independently verified edible grade, permitted use and toxicology; no generic approved limit.',
 'Narikela':'Coconut kernel is not coconut oil or coconut milk.',
 'Saindhava Lavana':'Rock salt requires food-grade salt article confirmation.',
 'Chandana':'Sandalwood heartwood is not automatically a culinary dried spice.',
 'Khajura':'Dates are not dried figs and cannot inherit dried-fig aflatoxin limit.',
 'Ghrita':'Ghee is not mustard oil or a generic vegetable oil.',
 'Goghrita':'Ghee is not mustard oil or a generic vegetable oil.',
 'Sugandhita pushpa':'Unidentified aromatic flower species must be verified before any contaminant mapping.'
}
crosswalk=[]; summaries=[]
for rec in a['records']:
    lock=('SOURCE_TITLE_METHOD_ALIGNMENT_REVIEW_REQUIRED' in rec['source_reconciliation_flags'])
    count=0
    for i in rec['ingredients']:
        name=i['source_name'];family,refs=M[name];count+=len(refs)
        crosswalk.append({
          'recipe_number':rec['recipe_number'],'catalogue_id':rec['catalogue_id'],
          'source_ingredient_serial':i['serial'],'source_name':name,
          'source_identity':i['source_identity'],'source_part_used':i['part_used'],
          'source_ratio':i['source_ratio'],'source_family':family,
          'possible_source_row_ids':list(refs),
          'recipe_source_title_method_hold':lock,
          'source_scope_note':special.get(name,'Confirm actual botanical or chemical identity, quality grade, species, processing and proper legal source article before numeric comparison.'),
          'actual_SKU_formula_and_species_received':False,
          'ingredient_row_applicability':'EVIDENCE_HOLD',
          'all_source_rows_reference_only':True,
          'whole_product_legally_verified':False,
          'commercial_batch_release_authorised':False
        })
    summaries.append({
     'recipe_number':rec['recipe_number'],'catalogue_id':rec['catalogue_id'],
     'printed_ingredient_row_count':len(rec['ingredients']),
     'conditional_source_reference_occurrences':count,
     'title_method_source_hold':lock,
     'precise_finished_product_CTR_article_adjudicated':False,
     'full_product_approved':False
    })
assert len(crosswalk)==46 and len(summaries)==9
assert sum(len(x['possible_source_row_ids']) for x in crosswalk)==67
assert {x['recipe_number'] for x in summaries if x['title_method_source_hold']}=={'14.6','14.7'}
assert len({(x['recipe_number'],x['source_ingredient_serial']) for x in crosswalk})==46
variants=[{'recipe':'15.1','substitutes_for':'barley',
           'name':name,'actual_variant_verified':False,
           'reference_ids':['PULSE_LEAD','PULSE_TOTAL','PULSE_B1'],
           'in_original_46_ingredient_rows':False}
          for name in ('Mudga (green gram)','Masha (black gram)')]
assert len(variants)==2
for k,p in f.items():assert hashlib.sha256(p.read_bytes()).hexdigest()==shas[k]
O=R/'fssai-helper/ayurveda-ingredient-ctr-crosswalk-r36-2026-11-04.json'
MD=R/'fssai-helper/ayurveda-ingredient-ctr-crosswalk-r36-2026-11-04.md'
output={
 'audit':'PMSV R36','review_date':'2026-11-04',
 'total_catalogue_records':533,'original_exact_CTR_product_article_holds':137,
 'recipe_records':9,'original_ingredient_records':46,
 'rows_with_any_source_reference':sum(bool(x['possible_source_row_ids']) for x in crosswalk),
 'distinct_official_reference_rows':len(rules),'raw_ingredient_source_reference_links':67,
 'method_only_pulse_alternative_records':2,
 'recipes_on_source_title_method_hold':['14.6','14.7'],
 'exact_finished_product_article_decisions_closed':0,
 'full_current_CTR_panels_verified':0,'whole_product_legal_approvals':0,
 'commercial_lot_releases':0,
 'production_engine_modified':False,'numeric_CTR_rules_modified':False,
 'future_december_CTR_amendment_active_on_review_date':False,
 'source_pdf':URL,
 'prior_audit_source_pdf_sha256':'8300ea34f1e88680ae4bbef52e0ec49331dbbfd1d5d6aa2612852bcb8779b26d',
 'earlier_input_file_hashes_sha256':shas,
 'scope_warning':'All 22 official source rows are only reference candidates for raw ingredient or food article; no automatic application to cooked/composite finished recipe or whole product compliance.',
 'source_rows':rules,'ingredient_source_crosswalk':crosswalk,
 'recipe_summaries':summaries,'possible_Kulmasha_method_substitutions':variants
}
O.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
lines=[
 '# PMSV R36 - Ayurveda ingredient CTR source reference crosswalk','',
 '4 November 2026 | Draft audit branch only | No whole-product regulatory approvals','',
 '| Review metric | Count |','|---|---:|',
 '| PMSV catalogue identities | 533 |',
 '| Original finished-product CTR article holds | 137 |',
 '| Ayurveda Category A recipes | 9 |',
 '| Original printed ingredient rows | 46 |',
 '| Ingredient rows with one or more source references | '+str(output['rows_with_any_source_reference'])+' |',
 '| Distinct referenced CTR table or regulatory statement rows | 22 |',
 '| Ingredient-to-source reference links | **67** |',
 '| Method-only 15.1 pulse variants (not additional original ingredients) | 2 |',
 '| Source recipe text holds (14.6 and 14.7) | 2 |',
 '| New whole-product regulatory approvals | **0** |','',
 '## Source references verified against CTR IX','',
 '| Reference | Named food article | Limit / restriction | Source PDF page |',
 '|---|---|---|---:|'
]
for x in rules:
  val=('no antibiotic use permitted' if x['source_limit'] is None else str(x['source_limit'])+' '+x['unit'])
  lines.append('| '+x['source_id']+' | '+x['article']+' | '+val+' | '+str(x['pdf_page_one_based'])+' |')
lines += ['','## Recipe and source counts','','| Recipe | Ingredient rows | Source references | Status |','|---|---:|---:|---|']
for x in summaries:
  lines.append('| '+x['recipe_number']+' | '+str(x['printed_ingredient_row_count'])+' | '+str(x['conditional_source_reference_occurrences'])+' | '+('source title/method HOLD' if x['title_method_source_hold'] else 'reference only; no legal PASS')+' |')
lines += [
 '','## Important qualifications','',
 '- Milk Lead 0.02 mg/kg states a concentration factor for partially or wholly dehydrated milks. Liquid milk aflatoxin M1 0.5 ug/kg cannot automatically be assigned to concentrated or cooked composite recipes.',
 '- Barley is named for Ochratoxin A 5 ug/kg and DON 1000 ug/kg; cereal and pulse aflatoxins have different raw article/source conditions. Processing and food-containing-commodity legal article selection still matter.',
 '- Rice 2,4-D is specified as 0.1 mg/kg in the Rice subentry of Food grains; milled food grains have a different value. Acephate Rice residue definition includes methamidophos and acephate.',
 '- Methyl parathion Mustard seed or Mustard oil is 0.01 mg/kg with the named combined-residue definition; edible versus crude mustard oil lead articles require identity review.',
 '- Honey antibiotic use is prohibited in production. Honey chloramphenicol 0.3 ug/kg is MRPL for misuse surveillance and never permission to use antibiotics.',
 '- Refined white sugar Lead 0.5 mg/kg applies only when sulphated ash does not exceed 0.03 percent; high-ash sugar Lead 5 mg/kg requires strictly more than 1.0 percent sulphated ash. Generic Sharkara does not settle either article.',
 '- The 15.1 recipe permits Mudga or Masha instead of barley. Two variant rows are separately listed and not counted among 46 printed ingredient rows.',
 '- 14.6 and 14.7 remain under title-versus-method source-document alignment hold. Official Ayurveda PDF page screenshots were not reliably retrievable, so no correction of the source is assumed.',
 '- These are 67 source references, not 67 verified final-product requirements. Exact ingredient species, current legal article, methods, residues, test results and full current-law analyte panel remain unverified.',
 '- No production rules, product master, commercial release fields, or deployed application were changed.',
 '','Official CTR IX: '+URL,
 'Official Ayurveda recipes: '+a['primary_source_url'],'',
 'Machine-readable 46-ingredient register: ayurveda-ingredient-ctr-crosswalk-r36-2026-11-04.json','']
MD.write_text('\n'.join(lines))
assert len(json.loads(O.read_text())['ingredient_source_crosswalk'])==46
for k,p in f.items():assert hashlib.sha256(p.read_bytes()).hexdigest()==shas[k]
print(json.dumps({
 'result':'PASS','recipes':9,'original_ingredient_rows':46,
 'rows_with_source_refs':output['rows_with_any_source_reference'],
 'distinct_source_rows':22,'reference_links':67,'variants':2,
 'legal_article_decisions_closed':0,'product_approvals':0,
 'register_sha256':hashlib.sha256(O.read_bytes()).hexdigest(),
 'report_sha256':hashlib.sha256(MD.read_bytes()).hexdigest()},indent=2))
