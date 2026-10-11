#!/usr/bin/env node
"use strict";
/**
 * Product-specific source evidence handoff for all remaining 123 FoSCoS products.
 * All candidate values remain REVIEW ONLY; this job is not a compliance engine.
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const ledger=load("audit-output/fssai-live-first-source-ledger-533.json");
const products=load(base+"standard-search-index-v1.json").products;
const source=load(base+"rules/contaminants-v9-unresolved-264-review-v1.json").records;
const audit=load("audit-output/fssai-product-readiness-audit.json").products;
const cross=load(base+"rules/fssai-v9-31-cross-form-metal-source-nontransfer-2026-10-11.json");
const tin=load(base+"rules/fssai-v9-tin-conditional-source-matrix-2026-10-11.json");
const metalPriorityDb=load(base+"rules/fssai-v9-metal-fallback-precedence-2026-10-11.json");
const ayurveda=load(base+"rules/fssai-ayurveda-nine-recipe-b1-cross-article-source-review-2026-10-11.json");
const fungiQuality=load(base+"rules/fssai-ten-edible-fungi-2-3-62-quality-and-ctr-gates-2026-10-11.json");
const fruitQuality=load(base+"rules/fssai-11-fruit-pickles-pastes-chutney-quality-2026-10-11.json");
const indexed=new Map(products.map(p=>[p.id,p]));
const historic=new Map(source.map(p=>[p.catalog_id,p]));
const examined=new Map(audit.map(p=>[p.id,p]));
const remaining=ledger.pending_product_details;
assert.deepEqual([ledger.product_count,ledger.partial_first_source_evidence,ledger.unresolved_first_source_gaps,ledger.legal_or_laboratory_compliance_passes],[533,410,123,0]);
assert.equal(remaining.length,123);
assert.equal(new Set(remaining.map(x=>x.id)).size,123);
assert.equal(indexed.size,533);
const fallback={
 "2.1":["Confirm whether the product contains dairy milk or is an analogue/non-dairy food","Confirm exact standardized finished form and processing state","Establish fat basis, concentration factor and reconstitution state","Find exact named metal/toxin/pesticide article, not ingredient-only milk row","Review effective amendments and sample analytical/residue definitions"],
 "2.3":["Confirm botanical food species and named raw commodity","Identify frozen, dried, canned, fermented, pureed or composite processing","Verify packing material and can/sterilization conditions","Distinguish finished food from raw-fruit, vegetable or ingredient-specific pesticide rows","Reconcile named article, sample basis and effective FSSAI amendments"],
 "2.4":["Confirm cereal, pseudo-cereal, pulse, seed or tuber source","Prove actual ingredient composition rather than options in a standard","Distinguish grain from flour, baked product and prepared food","Check explicit article exclusions and commodity-specific pesticide scope","Verify source row, unit, basis and latest amendments"],
 "2.5":["Confirm exact species and edible tissue or processed egg form","Keep veterinary-drug muscle, organ and egg commodity MRLs separate","Document processing and ingredient-to-finished-product residue basis","Identify current contaminant, pesticide and veterinary-drug articles independently","Check analytical residue definition and effective amendments"],
 "2.8":["Determine exact sugar or syrup identity and manufacturing route","Confirm measured sulphated ash rather than assuming total ash equivalence","Test whether named CTR threshold operator is actually satisfied","Do not inherit refined sugar thresholds from optional sugar ingredients","Verify source and current amendments before any numeric application"],
 special:["Determine operative special FoSCoS regulation and source route","Confirm formula ingredient-by-ingredient and finished matrix","Do not transfer raw seed, nut, cereal or milk limits by recipe name","Identify exact CTR article and any processing or use-condition exclusions","Check lab basis, legal amendments, chemical and pesticide categories"]
};
const pickDefaults=family=>fallback[family]||[
 "Confirm the exact legally standardized finished product identity",
 "Confirm composition, botanical/animal species and ingredient proportions",
 "Establish processing state, packaging, sample basis and intended use",
 "Match the complete named regulatory commodity and analyte without inheritance",
 "Check relevant official amendments, residue definitions and laboratory conditions"];
const clean=x=>String(x||"").replace(/\s+/g," ").trim();
function harvest(node,out,depth=0){
 if(!node||depth>5||out.length>=25)return;
 if(Array.isArray(node)){for(const x of node)harvest(x,out,depth+1);return;}
 if(typeof node==="string"){let v=clean(node);if(v.length>28&&v.length<460)out.push(v);return;}
 if(typeof node==="object"){
  for(const [k,v] of Object.entries(node)){
   if(/qualifier|question|prohibited_limit_transfer|nontransfer|required.*confirm|existing_precision_source_gate|source_qualifying|source_gates/i.test(k))harvest(v,out,depth+1);
  }
 }
}
const outputs=remaining.map((x,i)=>{
 const p=indexed.get(x.id),old=historic.get(x.id),r=examined.get(x.id);
 assert.ok(p&&old&&r,"Pending product identity missing: "+x.id);
 for(const k of ["name","fssr","fcs"])assert.equal(p[k],r[k],"Catalogue/readiness mismatch for "+x.id);
 assert.equal(old.catalog_id,x.id);assert.equal(old.product_name,x.name);
 assert.equal(old.auto_apply_numeric_limit,false);assert.equal(old.unconditional_compliance_pass,false);assert.equal(old.exemption_asserted,false);
 assert.equal(r.compliance_decision,"not_established_by_route_evidence");
 const articleGates=cross.scope_guards.filter(g=>g.catalog_id===x.id).map(g=>({
  source_reference_id:g.reference_id,
  named_official_source_article:cross.named_source_rows.find(s=>s.id===g.reference_id)?.article||"",
  source_limit_review_only:cross.named_source_rows.find(s=>s.id===g.reference_id)?.limit,
  unit:cross.named_source_rows.find(s=>s.id===g.reference_id)?.unit||"",
  required_applicability_or_exclusion:g.required_qualifier,
  is_applied:false
 }));
 const tinArticleGates=tin.scope_guards.filter(g=>g.catalog_id===x.id).map(g=>({
  source_reference_id:g.source_id,
  named_official_source_article:tin.named_source_rows.find(s=>s.id===g.source_id)?.article||"",
  source_limit_mgkg_review_only:tin.named_source_rows.find(s=>s.id===g.source_id)?.maximum_mg_per_kg,
  unit:"mg/kg",required_applicability_or_exclusion:g.required_qualifier,
  is_applied:false,first_exact_source_confirmed:false
 }));
 const metalArticlePriority=metalPriorityDb.rows.map(a=>({
  metal:a.metal,article:a.article,limit_review_only:a.limit,unit:a.unit,row_type:a.row_type,
  named_product_article_precedence_checked:false,applicability_to_this_product_unconditionally_confirmed:false,
  counts_as_first_exact_product_article:false,applied_limit:false,compliance_pass:false
 }));
 const verifiedRecipe=ayurveda.records.find(r=>r.catalog_id===x.id);
 if(verifiedRecipe){
  assert.equal(verifiedRecipe.product_name,x.name);
  assert.equal(verifiedRecipe.fssr,x.fssr);
  assert.equal(verifiedRecipe.fcs,x.fcs);
  assert.equal(verifiedRecipe.first_exact_product_article_cleared,false);
  assert.equal(verifiedRecipe.finished_product_numeric_limit_applied,false);
 }
 const recipeIngredientB1Review=verifiedRecipe?{
  official_recipe:verifiedRecipe.official_recipe_id,ingredient_list:verifiedRecipe.recipe_ingredient_evidence,
  official_source:verifiedRecipe.recipe_source,
  relevant_crop_table_reference:verifiedRecipe.has_b1_recipe_candidate?{
   analyte:"Aflatoxin B1",common_cereal_pulse_composite_reference_ugkg:10,
   is_finished_product_limit:false,exact_finished_product_source_article_confirmed:false
  }:null,
  pending_scope:verifiedRecipe.qualification_required,
  article_applied:false,first_exact_product_source_cleared:false,complete_compliance:false
 }:null;
 const fungiRecord=fungiQuality.records.find(r=>r.catalog_id===x.id);
 if(fungiRecord){
  assert.equal(fungiRecord.product_name,x.name);assert.equal(fungiRecord.fssr,x.fssr);assert.equal(fungiRecord.fcs,x.fcs);
  assert.equal(fungiRecord.first_exact_contaminant_article_matched,false);
  assert.equal(fungiRecord.finished_product_ctr_numeric_limit_auto_apply,false);
 }
 const exactFungiQualitySourceReview=fungiRecord?{
  clause:fungiRecord.fssr,source:fungiRecord.source_pdf,
  exact_quality_criteria:fungiRecord.criteria,source_quality_rows:fungiRecord.criteria.length,
  required_species_and_subtype_confirmation:true,
  mushroom_agaric_acid_article_auto_applied:false,
  canned_mushroom_tin_or_lead_auto_applied:false,
  first_exact_ctr_source_cleared:false,complete_compliance_pass:false
 }:null;
 const chapter23Quality=fruitQuality.records.find(r=>r.catalog_id===x.id);
 if(chapter23Quality){
  assert.equal(chapter23Quality.product_name,x.name);
  assert.equal(chapter23Quality.fssr,x.fssr);
  assert.equal(chapter23Quality.fcs,x.fcs);
  assert.equal(chapter23Quality.first_exact_contaminant_article_promoted,false);
 }
 const chapter23QualityEvidence=chapter23Quality?{
  exact_foscos_source_clause:chapter23Quality.fssr,
  source:fruitQuality.official_chapter_url,
  quality_parameters:chapter23Quality.criteria,
  numerical_and_qualitative_criteria:chapter23Quality.criteria.length,
  required_subtype:chapter23Quality.source_qualifier,
  required_product_process_evidence:chapter23Quality.scope_note,
  first_exact_ctr_source_cleared:false,
  mango_chutney_or_fruit_pulp_metal_article_auto_inherited:false,
  product_compliance_pass:false
 }:null;
 const extracted=[];
 for(const [key,value] of Object.entries(old)){
  if(/2026_10_11|2026_10_10/.test(key)&&typeof value==="object")harvest(value,extracted);
 }
 const qs=[...articleGates.map(g=>g.required_applicability_or_exclusion),...tinArticleGates.map(g=>g.required_applicability_or_exclusion),...extracted,...pickDefaults(x.family)];
 const questions=[...new Set(qs.map(clean).filter(v=>v.length>25))].slice(0,16);
 assert.ok(questions.length>=5,x.id);
 return {
  priority:i+1,catalog_id:x.id,product:x.name,fssr:x.fssr,fcs:x.fcs,family:x.family,
  status:"UNRESOLVED_FIRST_EXACT",official_fssai_ctr_source:cross.source,
  case_specific_questions:questions,
  named_article_references_review_only:articleGates,
  tin_named_article_references_review_only:tinArticleGates,
  generic_metal_precedence_references_review_only:metalArticlePriority,
  ayurveda_recipe_ingredient_source_review_only:recipeIngredientB1Review,
  fungi_exact_quality_source_review_only:exactFungiQualitySourceReview,
  fruit_pickle_paste_quality_source_review_only:chapter23QualityEvidence,
  supporting_source_urls:(r.official_source_urls||[]).filter(u=>/^https:\/\/(www\.)?fssai\.gov\.in\//.test(u)).slice(0,10),
  required_evidence:["exact operative named article","identity and processing qualification","analytical/residue basis","effective amendment verification","sample measurement before compliance determination"],
  numeric_finished_product_limit_applied:false,first_exact_source_confirmed:false,full_compliance_pass:false,
  exemption_asserted:false};
});
const esc=x=>'"'+String(x??"").replaceAll('"','""')+'"';
const cols=["priority","catalog_id","product","fssr","fcs","family","status","case_specific_questions","named_article_references_review_only","tin_named_article_references_review_only","generic_metal_precedence_references_review_only","ayurveda_recipe_ingredient_source_review_only","fungi_exact_quality_source_review_only","fruit_pickle_paste_quality_source_review_only","official_fssai_ctr_source","numeric_finished_product_limit_applied","first_exact_source_confirmed","full_compliance_pass"];
const csv=[cols.join(","),...outputs.map(r=>cols.map(k=>esc(Array.isArray(r[k])?r[k].map(v=>typeof v==="string"?v:JSON.stringify(v)).join(" | "):r[k])).join(","))].join("\n")+"\n";
const dir=path.join(root,"audit-output");
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,"fssai-next-123-first-exact-source-research-queue.csv"),csv);
fs.writeFileSync(path.join(dir,"fssai-next-123-first-exact-source-research-queue.json"),
 JSON.stringify({snapshot:"2026-10-11",source:"generated-live-533-ledger",total:533,pending:123,partial:410,full_compliance_passes:0,
 guard_source_rows:cross.named_source_rows.length,scope_nontransfer_cases:cross.scope_guards.length,
 products_with_scope_nontransfer_cases:outputs.filter(x=>x.named_article_references_review_only.length>0).length,
 fruit_pickle_paste_quality_products:outputs.filter(x=>x.fruit_pickle_paste_quality_source_review_only!==null).length,
 fruit_pickle_paste_quality_rules:outputs.reduce((n,x)=>n+(x.fruit_pickle_paste_quality_source_review_only?.numerical_and_qualitative_criteria||0),0),
 fruit_pickle_paste_first_exact_ctr_promotions:0,
 fungi_quality_products:outputs.filter(x=>x.fungi_exact_quality_source_review_only!==null).length,
 fungi_quality_source_rows:outputs.reduce((n,x)=>n+(x.fungi_exact_quality_source_review_only?.source_quality_rows||0),0),
 fungi_first_exact_contaminant_promotions:0,
 ayurveda_recipe_reviews:outputs.filter(x=>x.ayurveda_recipe_ingredient_source_review_only!==null).length,
 ayurveda_recipe_b1_overlap_candidates:outputs.filter(x=>x.ayurveda_recipe_ingredient_source_review_only?.relevant_crop_table_reference!==null&&x.ayurveda_recipe_ingredient_source_review_only!==null).length,
 metal_priority_source_rows:metalPriorityDb.rows.length,
 metal_default_precedence_reviews:outputs.reduce((n,x)=>n+x.generic_metal_precedence_references_review_only.filter(r=>r.row_type==="default").length,0),
 all_foods_methyl_mercury_research_references:outputs.reduce((n,x)=>n+x.generic_metal_precedence_references_review_only.filter(r=>r.row_type==="all_foods").length,0),
 tin_named_source_rows:tin.named_source_rows.length,
 tin_conditional_source_cases:tin.scope_guards.length,
 tin_products_with_conditional_source_cases:outputs.filter(x=>x.tin_named_article_references_review_only.length>0).length,
 records:outputs},null,2)+"\n");
console.log("Generated 123 individual FSSAI source-verification worklists including 11 fruit/pickle/paste quality reviews with 48 source checks, 10 FSSAI fungi product-quality reviews, 55 criteria, 9 Ayurveda recipe reviews, 4 B1 recipe overlap candidates; 738 fallback priority and 123 universal-only checks; "+cross.scope_guards.length+" earlier metal and "+tin.scope_guards.length+" Tin nontransfer cases; 0 numeric approvals");
