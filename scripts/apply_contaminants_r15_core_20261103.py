"""Apply PMSV R15 contaminant-layer scope metadata on the audit branch only.
No active numerical contaminant limit is changed. The 1 Dec 2026 amendment remains future-effective.
"""
from pathlib import Path
import json,hashlib,collections,sys
BASE=Path(sys.argv[1]) if len(sys.argv)>1 else Path('.')
DATA=BASE/'fssai-product-helper-preview-01/data'
CP=DATA/'rules/contaminants-v9-core.json'
DP=DATA/'rules/contaminants-2026-deferred-amendment-v1.json'
MP=DATA/'product-master-v1.json'
EXPECTED_BLOB={'c':'55b18fb971a957e21f0e145bb81e001c9aa40ffe','d':'c6a716ee6ed8cddc8a1a6224d4ce2304b7c35bff'}
EXPECTED_SHA={'c':'a405d7d1c75f23dd32a1867faa5434b3759a353c9c8639dc836378eb8f62cfdc','d':'da968341786e3af1065dc943d15da9375f3ba47f447e1c22732a3a0c455da424'}
def blob(b): return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
cb,db=CP.read_bytes(),DP.read_bytes()
assert blob(cb)==EXPECTED_BLOB['c'],'contaminant preimage changed'
assert blob(db)==EXPECTED_BLOB['d'],'deferred amendment preimage changed'
c,d=json.loads(cb),json.loads(db);m=json.loads(MP.read_text())
products=m['catalog_products'];pm={p['id']:p for p in products};ids=set(pm)
refs=collections.defaultdict(set)
def collect(x,top):
    if isinstance(x,dict):
        for v in x.values(): collect(v,top)
    elif isinstance(x,list):
        for v in x: collect(v,top)
    elif isinstance(x,str) and x in ids: refs[x].add(top)
for k,v in c.items(): collect(v,k)
exact_keys={
'profiles','explicit_metal_alias_mappings_v9','direct_product_standard_contaminant_rules_v1','spice_crop_contaminant_identity_mappings_v9','explicit_crop_contaminant_article_mappings_v9',
'chapter_2_3_verified_groundnut_aflatoxin_v9','chapter_2_3_exact_soup_sauce_saffrole_v9','chapter_2_3_exact_nut_arecanut_aflatoxin_v9','chapter_2_4_verified_raw_cereal_aflatoxin_v9','chapter_2_4_exact_raw_soybean_oilseed_aflatoxin_v9','chapter_2_3_exact_finished_beverage_saffrole_v9','chapter_2_4_exact_unprocessed_raw_pulses_v9','chapter_14_2_verified_alcoholic_beverage_nots_v9','chapter_2_5_verified_processed_meat_saffrole_v9','chapter_2_10_verified_finished_beverage_saffrole_v9','chapter_2_4_verified_pure_cereal_products_aflatoxin_v9','chapter_2_2_verified_oil_metal_articles_v9','chapter_2_3_fresh_vegetables_exact_metal_v9','chapter_2_5_exact_fresh_egg_source_article_v9','special_exact_metabisulphite_metal_articles_v9','chapter_2_2_other_named_oils_lead_v9','special_guar_gum_exact_metal_article_v9','chapter_2_3_dried_fruit_exact_malathion_v9','chapter_2_7_exact_confectionery_hydrocyanic_v9','chapter_2_1_verified_milk_products_mrl_v9','chapter_13_verified_infant_food_metals_v9','chapter_2_1_additional_milk_commodity_evidence_v9','chapter_2_4_maize_wheat_b1_exact_v9','chapter_special_fresh_fruits_pesticide_article_v9','water_product_standard_pesticide_limits_v1','chapter_2_2_solvent_crude_vegetable_oil_lead_v9'}
conditional_keys={k for k in c if any(t in k for t in ['conditional','locked','variant','package'])}
review_keys={'chapter_2_3_commodity_mrl_review_v1','chapter_2_4_commodity_mrl_review_v1','chapter_2_5_commodity_mrl_review_v1','combined_catalogue_finished_subtype_review_2026_10_10'}
near={
 '99-99-1-acidity-regulators-l-tartaric-acid':"Version IX names L(+)-Tartaric acid, while the catalogue route is L(+/-) tartaric acid. Stereochemical identity must be reconciled before direct use.",
 '01-01-7-frozen-desserts-or-confections-with-added-vegetable-oil-fat-or-vegetable-protein-o':"Version IX names 'Ice-cream, iced lollies and similar frozen confections'; the distinct vegetable-fat/protein frozen-dessert identity is not auto-equated.",
 '02-02-4-frozen-desserts-or-confections-with-added-vegetable-oil-fat-or-vegetable-protein-o':"Version IX names 'Ice-cream, iced lollies and similar frozen confections'; the distinct vegetable-fat/protein frozen-dessert identity is not auto-equated."}
special={
 '04-04-1-catechu-edible':"No exact Catechu finished article found in Version IX text review; generic defaults require explicit legal review before use.",
 '06-06-2-carob-powder':"No exact Carob Powder article found. Do not inherit cocoa-powder contaminant rows.",
 '100-100-cow-or-buffalo-colostrum-and-colostrum-products':"No exact colostrum article found. Do not automatically inherit ordinary milk rows.",
 '100-100-pan-masala':"No exact Pan Masala CTR article found. Ingredient rows are formulation triggers, not automatic finished-product limits.",
 '100-100-silver-leaf-chandi-ka-warq':"No exact Silver Leaf CTR article found; product purity and applicable general provisions remain separate.",
 '11-11-1-edible-lactose':"No exact edible lactose article found. Milk-derived origin does not itself establish a milk article.",
 '99-99-1-trehalose':"No exact Trehalose CTR article found; identity/purity and finished-food use remain separate.",
 '99-99-7-dietary-fibre-dextrin-soluble-fibre':"No exact dextrin/soluble-fibre CTR article found; source-starch commodity rows are not automatically inherited.",
 'formulated-supplements-children':"No exact CTR finished article established. Do not inherit infant-food articles for the >24 to 36 month product.",
 'purified-vending-water':"No exact purified vending-water CTR article found. Packaged/mineral-water rows are not automatically transferred."}
def route_review(pid,p):
    if pid in near:return 'SOURCE_SCOPE_RECONCILIATION_REQUIRED',near[pid]
    if 'analogue-in-the-dairy-context' in pid:return 'NO_EXACT_FINISHED_CTR_ARTICLE_REVIEWED','Dairy analogue is formulation dependent; do not inherit milk/secondary-milk rows by FSSR family alone.'
    if 'edible-dried-seeds-obtained' in pid:return 'SPECIES_PROCESSING_REQUIRED_NO_EXACT_FINISHED_CTR_ARTICLE','Interim licensing category; exact botanical seed, processing state and current commodity/residue article are required.'
    if 'mouth-freshener' in pid:return 'FORMULATION_DRIVEN_NO_EXACT_FINISHED_CTR_ARTICLE','No exact finished mouth-freshener article; ingredient commodity rows are not automatically transferred to the mixture.'
    if pid.startswith('18-18-'):return 'FORMULATION_DRIVEN_NO_EXACT_FINISHED_CTR_ARTICLE','FPC 18 is a sweets/snacks licensing category, not an exact CTR article.'
    if pid.startswith('102-102-'):return 'RECIPE_DRIVEN_NO_EXACT_FINISHED_CTR_ARTICLE','Ayurveda Aahara recipe is composite; ingredient/matrix-specific contaminant and residue rules require recipe review.'
    if pid.startswith('99-99-') or 'polyols-permitted' in pid:return 'INGREDIENT_IDENTITY_REQUIRED_NO_BLANKET_CTR_ARTICLE','Category 99/11.6 is an ingredient/preparation class; exact chemical/INS identity and intended matrix are required.'
    if pid in special:return 'NO_EXACT_FINISHED_CTR_ARTICLE_REVIEWED',special[pid]
    return 'NO_EXACT_FINISHED_CTR_ARTICLE_REVIEWED',"No prior product-level PMSV Version IX route existed; generic 'foods not specified' defaults are not auto-applied."
counts=collections.Counter();unref=[]
for p in products:
    pid=p['id'];ks=refs.get(pid,set());ex=ks&exact_keys;co=ks&conditional_keys;rv=ks&review_keys
    if ex and co:st='EXACT_PARTIAL_PLUS_CONDITIONAL'
    elif ex:st='EXACT_PARTIAL_EVIDENCE'
    elif co:st='CONDITIONAL_OR_LOCKED_ONLY'
    elif rv:st='COMMODITY_SCOPE_REVIEW_ONLY'
    else:
        status,note=route_review(pid,p)
        st='R15_EXPLICIT_ROUTE_REVIEW_NO_EXACT_AUTO_ROUTE'
        unref.append({'catalog_id':pid,'product_name':p['name'],'fssr':p.get('fssr',''),'fcs':p.get('fcs',''),'status':status,'review_note':note,'food_not_specified_default_auto_apply':False,'full_contaminant_panel_verified':False,'review_date':'2026-11-03'})
    counts[st]+=1
assert counts=={'EXACT_PARTIAL_EVIDENCE':360,'EXACT_PARTIAL_PLUS_CONDITIONAL':36,'CONDITIONAL_OR_LOCKED_ONLY':23,'COMMODITY_SCOPE_REVIEW_ONLY':58,'R15_EXPLICIT_ROUTE_REVIEW_NO_EXACT_AUTO_ROUTE':56},counts
assert len(unref)==56
future=set()
for ch in d['changes']:future.update(ch.get('catalog_ids',[]))
assert len(future)==31
c['current_effective_basis']['as_of']='2026-11-03'
c['current_effective_basis']['note']='Version IX (03.02.2026) remains the active consolidated basis on 3 November 2026. Amendment No. 17 published 25 May 2026 commences 1 December 2026 and is not applied yet. The 15 October 2026 tea-pesticide MRL notification is a draft and is not promoted to current limits.'
c['r15_catalogue_contaminant_layer_review']={'review_date':'2026-11-03','catalogue_records':533,'existing_module_referenced_records_before_r15':477,'new_explicit_route_reviews':56,'scoped_contaminant_layer_reviews':533,'status_counts':dict(counts),'products_with_some_exact_current_evidence':396,'products_without_any_exact_current_evidence':137,'full_current_contaminant_panels_verified':0,'foods_not_specified_defaults_auto_apply':False,'future_effective_amendment_date':'2026-12-01','future_amendment_watch_products':31,'tea_pesticide_draft_2026_10_15_applied':False,'source_version':'Version IX (03.02.2026)','full_current_law_complete':False,'commercial_release_authorized':False,'scope_note':'Layer coverage means each catalogue identity has an explicit exact/conditional/commodity/no-exact route review. It does not mean every applicable metal, toxin, pesticide, veterinary-drug, processing-factor or residue row is fully reconciled.'}
c['r15_explicit_no_prior_module_reference_reviews']=unref
d['runtime_policy']['reviewed_on']='2026-11-03'
d['runtime_policy']['active_on_review_date']=False
d['runtime_policy']['affected_catalogue_products']=31
d['runtime_policy']['note']='As of 3 November 2026 these changes are gazetted but not operative. They commence 1 December 2026 and must not update active Version IX numeric rules before that date.'
out=BASE/'contaminants-r15-core-applied';out.mkdir(exist_ok=True)
for key,path,obj in [('c',CP,c),('d',DP,d)]:
    b=(json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode()
    assert hashlib.sha256(b).hexdigest()==EXPECTED_SHA[key],f'{key} output differs from tested candidate'
    path.write_bytes(b);(out/path.name).write_bytes(b)
manifest={'passed':533+56+31+8,'failed':0,'catalogue':533,'scoped_layer_reviews':533,'exact_evidence_products':396,'exact_row_pending':137,'future_watch':31,'full_current_panels_verified':0,'current_baseline':'Version IX (03.02.2026)','as_of':'2026-11-03','december_amendment_active':False,'tea_draft_applied':False,'scope':'Metadata/date-control review only; current numeric limits unchanged.'}
(out/'application-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))
