#!/usr/bin/env node
"use strict";
/**
 * PMSV exact-evidence applicability audit.
 * A regulatory check is a documented source/matrix gate, NEVER an automatic
 * finished-product clearance, no-applicable-limit decision or lab test.
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const m=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const catalog=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const byId=new Map(catalog.map(x=>[x.id,x]));
assert.equal(catalog.length,533);
assert.equal(m.records.length,126);assert.equal(m.count,126);assert.equal(m.pending,126);
assert.equal(m.verified_evidence_added,138);assert.equal(m.full_compliance_achieved,0);
assert.equal(new Set(m.records.map(x=>x.catalog_id)).size,126);
const groups={chapter_2_3:0,previous_81:0,final_17:0},families={},checkpoints=[];
const currentDate="2026-10-11";
const reviewFields=[
 ["exact_subtype_transfer_safeguard_2026_10_11","five_required_product_specific_source_qualifiers","cereals_sugars_other"],
 ["chapter_2_3_qualifier_matrix_2026_10_11","qualifier_fields_required_before_source_applicability_decision","fruit_vegetable"],
 ["special_foscos_identity_matrix_2026_10_11","five_required_ingredient_process_and_source_qualifiers","special_foscos"],
 ["remaining_cross_family_qualifier_matrix_2026_10_11","qualifier_fields_before_named_ctr_limit_may_be_checked","other_chapters"]
];
const reviewCounts=Object.fromEntries(reviewFields.map(row=>[row[2],0]));
let questions=0,conditionalRefs=0,qualityEntries=0,analogues=0,vending=0;

for(const item of m.records){
 const p=byId.get(item.catalog_id);
 assert.ok(p,"Unrecognised catalogue identity "+item.catalog_id);
 assert.equal(item.product_name,p.name,item.catalog_id);
 assert.equal(item.fssr,p.fssr,item.catalog_id);
 assert.equal(item.auto_apply_numeric_limit,false,item.catalog_id);
 assert.equal(item.unconditional_compliance_pass,false,item.catalog_id);
 assert.equal(item.exemption_asserted,false,item.catalog_id);
 const a=item.chapter_2_3_targeted_evidence_review_2026_10_10;
 const b=item.next_family_subtype_review_2026_10_10;
 const c=item.last_unresolved_families_source_scope_review_2026_10_10;
 const active=[!!a,!!b,!!c].filter(Boolean).length;
 assert.equal(active,1,"Exactly one detailed review must match "+item.catalog_id);
 let detail,kind;
 if(a){
  kind="chapter_2_3";detail=a;
  assert.equal(item.regulatory_family,"2.3");
  assert.equal(a.numeric_limit_auto_applied,false);
  assert.equal(a.legal_compliance_pass,false);
  assert.equal(a.source_article_unconditionally_confirmed,false);
  assert.ok(a.product_specific_gate.length>30&&a.nontransferable_lookalike_article.length>30);
  assert.match(a.source_urls.official_version_ix_contaminants,/fssai\.gov\.in/);
 }else if(b){
  kind="previous_81";detail=b;
  assert.equal(b.named_article_applied_to_finished_product,false);
  assert.equal(b.numeric_limit_auto_applied,false);
  assert.equal(b.legal_compliance_pass,false);
  assert.ok(b.first_required_verification.length>20&&b.specific_prohibited_inheritance.length>20);
  assert.match(b.source_regulatory_standard_url,/fssai\.gov\.in/);
 }else{
  kind="final_17";detail=c;
  assert.equal(c.auto_apply_numeric_limit,false);
  assert.equal(c.full_compliance_granted,false);
  assert.equal(c.product_specific_metal_pesticide_vet_panel_complete,false);
  assert.ok(c.requires_check.length>20&&c.prohibited_lookalike_inheritance.length>25);
  assert.match(c.official_standard_source_url,/fssai\.gov\.in/);
 }
 assert.equal(detail.catalog_id,p.id);
 assert.equal(detail.product_name,p.name);
 assert.equal(detail.fssr,p.fssr);
 groups[kind]++;
 families[item.regulatory_family]=(families[item.regulatory_family]||0)+1;
 const special=item.specific_source_commodity_subtype_review_2026_10_10;
 if(special){
  assert.ok(["04-04-1-dates","08-08-1-fresh-or-chilled-rabbit-meat","08-08-2-frozen-rabbit-meat"].includes(p.id));
  assert.equal(special.review_only,true);assert.equal(special.automatically_applied,false);
  assert.equal(special.intentionally_retains_pending_status,true);
  assert.equal(special.product_specific_complete_panel,false);
  assert.ok(special.condition.length>80);
  if(p.id==="04-04-1-dates"){
   assert.equal(p.fssr,"2.3.47(4)");assert.equal(special.source_article,"Dried fruits");
   assert.equal(special.pesticide,"Malathion");assert.equal(special.source_mrl,8);
   assert.equal(special.unit,"mg/kg");
  }else{
   assert.equal(p.fssr,"2.5.2(6)");
   assert.equal(special.species,"Oryctolagus cuniculus");
   assert.equal(special.source_article,"Meat and Meat products");
   assert.equal(special.pesticide,"Imidacloprid");
   assert.equal(special.source_mrl,0.1);assert.equal(special.unit,"mg/kg");
  }
 }
 const mismatch=item.cross_chapter_identical_product_name_discrepancy_2026_10_10;
 if(mismatch){
  assert.equal(p.id,"06-06-3-fruit-vegetable-cereal-flakes");
  assert.equal(mismatch.current_catalogue_fssr,"2.4.35");
  assert.equal(mismatch.source_exact_standard_fssr,"2.3.20");
  assert.equal(mismatch.numeric_rule_from_2_4_35_to_be_withheld_until_product_recipe_confirmation,true);
  assert.equal(mismatch.authorizes_new_compliance_pass,false);
 }
 checkpoints.push({
  catalog_id:p.id,product_name:p.name,fssr:p.fssr,fcs:p.fcs,
  family:item.regulatory_family,review_kind:kind,
  subcategory_or_matrix:detail.review_bucket||detail.review_type||detail.identity_scope,
  source_identity_review_complete:true,
  full_contaminant_review_complete:false,
  pesticide_mrl_panel_complete:false,
  source_amendments_reconciled:false,
  applied_numeric_limit:false,
  product_compliance_pass:false,
  conditional_commodity_reference:special?{
   pesticide:special.pesticide,article:special.source_article,reference:special.source_mrl,
   unit:special.unit,applied:false}:null,
  unresolved_exact_fssr_clash:!!mismatch&&!item.official_standard_route_correction_2026_10_11
 });
 const activeReview=reviewFields.filter(([field])=>!!item[field]);
 assert.equal(activeReview.length,1,"Exactly one current-round five-question matrix for "+p.id);
 const [field,qfield,kind2026]=activeReview[0],matrix=item[field];
 assert.equal(matrix.catalog_id,p.id);assert.equal(matrix.product_name,p.name);
 const mandatory=matrix[qfield];
 assert.ok(Array.isArray(mandatory)&&mandatory.length===5,"Five product-specific questions for "+p.id);
 assert.equal(new Set(mandatory).size,5);
 reviewCounts[kind2026]++;questions+=5;
 const numericCandidates=[];
 const animal=item.official_2_5_animal_pesticide_candidates_2026_10_11;
 if(animal){
  assert.equal(animal.numeric_limit_auto_applied,false);
  for(const x of animal.official_source_rows_conditional_not_applied){
   assert.equal(x.auto_apply_numeric_limit,false);
   numericCandidates.push({name:x.pesticide,article:x.named_food_article,limit:x.official_mrl,unit:x.unit,qualifier:x.scope_conditions,applied:false});
  }
 }
 const hcn=item.official_cassava_sago_hcn_2026_10_11;
 if(hcn){
  assert.equal(hcn.automatically_apply_to_every_named_catalogue_product,false);
  numericCandidates.push({name:"Hydrocyanic acid",article:hcn.exact_ctr_article,limit:hcn.conditional_reference_limit,unit:hcn.unit,qualifier:hcn.product_recipe_qualification,applied:false});
 }
 const fat=item.official_fssai_fat_spread_nickel_2026_10_11;
 if(fat){
  assert.equal(fat.auto_apply_nickel_numeric_mrl,false);
  numericCandidates.push({name:"Nickel",article:fat.exact_nickel_ctr_named_article,limit:fat.conditional_nickel_mg_per_kg,unit:"mg/kg",qualifier:fat.nickel_condition,applied:false});
  qualityEntries+=fat.source_qualified_product_quality_criteria.length;
 }
 const coffee=item.official_coffee_chicory_four_variants_2026_10_11;
 if(coffee){
  assert.equal(coffee.no_ctr_numeric_automatic_assignment,true);
  numericCandidates.push({name:"Ochratoxin A",article:coffee.official_ochratoxin_a_named_article,limit:coffee.conditional_reference_limit,unit:coffee.ota_unit,qualifier:"Coffee-only official article; not yet qualified for finished coffee-chicory mixture",applied:false});
  qualityEntries+=coffee.variants.reduce((n,v)=>n+v.quality_criteria.length,0);
 }
 const quality=item.verified_chapter_quality_only_2026_10_11;
 if(quality){
  assert.equal(quality.new_exact_contaminant_match,false);
  qualityEntries+=quality.quality_criteria.length;
 }
 const eggQuality=item.chapter_2_5_variant_quality_provisions_2026_10_11;
 if(eggQuality){
  assert.equal(eggQuality.any_lab_sample_compliance_pass,false);
  qualityEntries+=eggQuality.variants.reduce((n,v)=>n+v.quality_criteria.length,0);
 }
 const analogue=item.official_fssai_dairy_analogue_definition_2026_10_11;
 if(analogue){assert.equal(analogue.no_automatic_milk_mrl,true);analogues++;}
 const vendingRecord=item.official_vending_purified_water_is10500_gate_2026_10_11;
 if(vendingRecord){
  assert.equal(vendingRecord.packaged_water_pesticide_or_metal_limit_applied,false);
  assert.equal(vendingRecord.any_is10500_numeric_limit_copied_into_fssai_database,false);
  vending++;
 }
 conditionalRefs+=numericCandidates.length;
 const checkpoint=checkpoints[checkpoints.length-1];
 checkpoint.current_round_2026_10_11={
  review_group:kind2026,
  source_qualifier_questions:mandatory,
  qualifier_and_laboratory_verification_complete:false,
  named_numeric_source_article_references_review_only:numericCandidates,
  current_product_compliance_approved:false,
  has_unqualified_numeric_ctr_evidence:false
 };
}

assert.deepEqual(reviewCounts,{cereals_sugars_other:28,fruit_vegetable:43,special_foscos:28,other_chapters:27});
assert.equal(questions,630);
assert.equal(conditionalRefs,15);
assert.equal(qualityEntries,108);
assert.equal(analogues,8);
assert.equal(vending,1);
assert.deepEqual(groups,{chapter_2_3:43,previous_81:70,final_17:13});
assert.equal(Object.values(families).reduce((a,b)=>a+b,0),126);
assert.equal(checkpoints.filter(x=>x.conditional_commodity_reference).length,2);
assert.equal(checkpoints.filter(x=>x.unresolved_exact_fssr_clash).length,0);
const result={
 schema_version:"1.0",as_of:currentDate,products_total:533,
 partial_exact_evidence:407,pending_exact_source_evidence:126,
 documented_detailed_source_identity_applicability_reviews:126,
 disposition_buckets:groups,regulatory_families:families,
 source_qualifications_not_numeric_approvals:true,
 exact_regulatory_route_mismatches_requiring_resolution:0,
 historical_2026_10_10_conditional_commodity_references_not_applied:2,
 source_qualifier_questions_2026_10_11:questions,
 review_groups_2026_10_11:reviewCounts,
 conditional_numeric_ctr_articles_review_only_2026_10_11:conditionalRefs,
 separate_numeric_product_quality_values_2026_10_11:qualityEntries,
 dairy_analogue_identity_exclusion_guards_2026_10_11:analogues,
 purified_vending_water_noninheritance_guards_2026_10_11:vending,
 legal_compliance_passes_claimed:0,
 warning:"Scope review evidence does not establish safety, source amendment completeness or laboratory compliance. Official source and ingredient recipe must be confirmed before applying numerical limits.",
 checkpoints
};
const out=path.join(root,"audit-output");
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,"fssai-126-detailed-source-applicability-reconciliation.json"),JSON.stringify(result,null,2)+"\n");
console.log("PASS: 533 = 407 partial + 126 unresolved; all 126 retain exact identity-bound reviews (28+43+28+27), 630 mandatory unverified source qualifiers, 15 conditional CTR source references, 108 separate quality benchmarks; no false numeric MRL or compliance PASS.");
