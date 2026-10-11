#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json"),"utf8"));
const products=JSON.parse(fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/data/standard-search-index-v1.json"),"utf8")).products;
const byId=new Map(products.map(p=>[p.id,p]));
const groups=[
 ["exact_subtype_transfer_safeguard_2026_10_11","five_required_product_specific_source_qualifiers",28],
 ["chapter_2_3_qualifier_matrix_2026_10_11","qualifier_fields_required_before_source_applicability_decision",43],
 ["special_foscos_identity_matrix_2026_10_11","five_required_ingredient_process_and_source_qualifiers",28],
 ["remaining_cross_family_qualifier_matrix_2026_10_11","qualifier_fields_before_named_ctr_limit_may_be_checked",27]
];
test("533 = 407 partial + 126 unresolved; exactly 630 source qualifier fields and no false regulatory pass",()=>{
 assert.equal(products.length,533);
 assert.equal(data.records.length,126);assert.equal(data.pending,126);assert.equal(data.verified_evidence_added,138);
 assert.equal(new Set(data.records.map(x=>x.catalog_id)).size,126);
 assert.equal(products.length-data.records.length,407);
 assert.equal(data.full_compliance_achieved,0);
 let count=0;
 for(const r of data.records){
  const active=groups.filter(([k])=>r[k]);
  assert.equal(active.length,1,r.catalog_id);
  const [key,field]=active[0],q=r[key],p=byId.get(r.catalog_id);
  assert.ok(p);
  assert.equal(q.catalog_id,p.id);assert.equal(q.product_name,p.name);
  assert.ok(Array.isArray(q[field]));
  assert.equal(q[field].length,5);
  count+=q[field].length;
  assert.equal(r.auto_apply_numeric_limit,false);
  assert.equal(r.unconditional_compliance_pass,false);
 }
 assert.equal(count,630);
 for(const [key,_,expected] of groups)assert.equal(data.records.filter(x=>x[key]).length,expected);
});
test("Exactly 15 new conditional official numeric contaminant source references remain NOT APPLIED",()=>{
 const animal=data.records.filter(x=>x.official_2_5_animal_pesticide_candidates_2026_10_11);
 const hcn=data.records.filter(x=>x.official_cassava_sago_hcn_2026_10_11);
 const fat=data.records.filter(x=>x.official_fssai_fat_spread_nickel_2026_10_11);
 assert.equal(animal.length,6);assert.equal(hcn.length,3);assert.equal(fat.length,1);
 let n=0;
 for(const r of animal){
  const q=r.official_2_5_animal_pesticide_candidates_2026_10_11;
  assert.equal(q.numeric_limit_auto_applied,false);
  assert.equal(q.product_compliance_result,false);
  for(const x of q.official_source_rows_conditional_not_applied){
   assert.equal(x.auto_apply_numeric_limit,false);
   assert.equal(x.authorizes_pesticide_compliance_pass,false);
   assert.ok(x.official_mrl>0);
   n++;
  }
 }
 for(const r of hcn){
  const q=r.official_cassava_sago_hcn_2026_10_11;
  assert.equal(q.automatically_apply_to_every_named_catalogue_product,false);
  assert.equal(q.legal_compliance_pass,false);
  assert.equal(q.conditional_reference_limit,10);
  n++;
 }
 const coffee=data.records.filter(x=>x.official_coffee_chicory_four_variants_2026_10_11);
 assert.equal(coffee.length,1);
 const ota=coffee[0].official_coffee_chicory_four_variants_2026_10_11;
 assert.equal(ota.conditional_reference_limit,5);
 assert.equal(ota.ota_unit,"µg/kg");
 assert.equal(ota.ota_mixture_applicability_proven,false);
 assert.equal(ota.no_ctr_numeric_automatic_assignment,true);
 assert.equal(ota.no_finished_sample_compliance_pass,true);
 n++;
 const f=fat[0].official_fssai_fat_spread_nickel_2026_10_11;
 assert.equal(f.auto_apply_nickel_numeric_mrl,false);
 assert.equal(f.all_legal_compliance_pass,false);
 assert.equal(f.conditional_nickel_mg_per_kg,1.5);
 n++;
 assert.equal(n,15);
});
test("108 new official quality-criterion entries separated from contaminant numeric evidence",()=>{
 const other=data.records.filter(x=>x.verified_chapter_quality_only_2026_10_11);
 const animal=data.records.filter(x=>x.chapter_2_5_variant_quality_provisions_2026_10_11);
 const fat=data.records.filter(x=>x.official_fssai_fat_spread_nickel_2026_10_11);
 const otherCount=other.reduce((n,r)=>n+r.verified_chapter_quality_only_2026_10_11.quality_criteria.length,0);
 const animalCount=animal.reduce((n,r)=>n+r.chapter_2_5_variant_quality_provisions_2026_10_11.variants.reduce((a,v)=>a+v.quality_criteria.length,0),0);
 const fatCount=fat.reduce((n,r)=>n+r.official_fssai_fat_spread_nickel_2026_10_11.source_qualified_product_quality_criteria.length,0);
 const coffee=data.records.filter(r=>r.official_coffee_chicory_four_variants_2026_10_11);
 assert.equal(coffee.length,1);
 const coffeeCount=coffee[0].official_coffee_chicory_four_variants_2026_10_11.variants.reduce((n,v)=>n+v.quality_criteria.length,0);
 assert.equal(coffeeCount,22);
 assert.deepEqual([otherCount,animalCount,fatCount,coffeeCount],[12,71,3,22]);
 assert.equal(otherCount+animalCount+fatCount+coffeeCount,108);
 for(const r of animal){
  assert.equal(r.chapter_2_5_variant_quality_provisions_2026_10_11.any_lab_sample_compliance_pass,false);
 }
});
test("All eight analogue exemptions are classification only, not a waiver of contaminants for ingredients",()=>{
 const analogues=data.records.filter(x=>x.official_fssai_dairy_analogue_definition_2026_10_11);
 assert.equal(analogues.length,8);
 for(const r of analogues){
  const a=r.official_fssai_dairy_analogue_definition_2026_10_11;
  assert.equal(a.no_automatic_milk_mrl,true);
  assert.equal(a.no_compliance_pass,true);
  assert.match(a.prohibited_assumption,/milk-derived ingredient/);
 }
});

test("Purified vending-machine water 2.10.9 is not packaged drinking water and no IS:10500 limit is invented",()=>{
 const rows=data.records.filter(r=>r.official_vending_purified_water_is10500_gate_2026_10_11);
 assert.equal(rows.length,1);
 const r=rows[0],q=r.official_vending_purified_water_is10500_gate_2026_10_11;
 assert.equal(r.catalog_id,"purified-vending-water");
 assert.equal(q.catalog_id,r.catalog_id);assert.equal(q.product_name,r.product_name);
 assert.equal(q.fssr,"2.10.9");
 assert.match(q.regulatory_identity,/OTHER THAN packaged drinking water and natural mineral water/);
 assert.match(q.legal_composition_reference,/IS:10500/);
 assert.match(q.excluded_wrong_routing,/0\.0001 mg\/L individually/);
 assert.equal(q.treated_as_packaged_drinking_water,false);
 assert.equal(q.packaged_water_pesticide_or_metal_limit_applied,false);
 assert.equal(q.referenced_is10500_text_fully_source_verified,false);
 assert.equal(q.any_is10500_numeric_limit_copied_into_fssai_database,false);
 assert.equal(q.finished_water_compliance_pass,false);
 assert.equal(data.official_vending_water_misclassification_gate_summary_2026_10_11.packaged_water_limits_inherited,0);
});
