#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const m=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const catalogue=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products,byId=new Map(catalogue.map(p=>[p.id,p]));
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const start=html.indexOf("function pendingContaminantReviewNotice(p){"),end=html.indexOf("function renderProductContaminants(){",start);
const ctx=vm.createContext({contaminantsPendingReviewDb:m,esc:v=>String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")});
vm.runInContext(html.slice(start,end),ctx);
const ui=p=>vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(p)+")",ctx);
const rows=m.records.filter(x=>x.official_2_5_animal_pesticide_candidates_2026_10_11);
test("Exactly 2 rabbit and 4 processed egg standards have exact source-row references but no direct numeric inheritance",()=>{
 assert.equal(m.pending,126);assert.equal(m.verified_evidence_added,138);assert.equal(rows.length,6);
 assert.equal(m.official_2_5_animal_pesticide_candidates_summary_2026_10_11.conditional_source_rows_documented,10);
 assert.equal(m.official_2_5_animal_pesticide_candidates_summary_2026_10_11.new_first_finished_product_exact_ctr_matches,0);
 assert.equal(m.official_2_5_animal_pesticide_candidates_summary_2026_10_11.pending_count_unchanged,126);
 assert.equal(rows.filter(r=>r.catalog_id.includes("rabbit")).length,2);
 assert.equal(rows.filter(r=>r.catalog_id.includes("egg")).length,4);
 let count=0;
 for(const r of rows){
  let q=r.official_2_5_animal_pesticide_candidates_2026_10_11,p=byId.get(r.catalog_id);
  assert.ok(p);
  assert.equal(q.catalog_id,p.id);assert.equal(q.product_name,p.name);assert.equal(q.fssr,p.fssr);
  assert.equal(q.numeric_limit_auto_applied,false);assert.equal(q.product_compliance_result,false);
  assert.equal(q.first_exact_finished_product_ctr_match_promoted,false);
  assert.equal(q.residue_processing_factors_qualified,false);
  assert.equal(q.ingredient_and_tissue_sample_basis_qualified,false);
  assert.equal(r.auto_apply_numeric_limit,false);
  assert.match(q.chapter_2_5_source,/fssai\.gov\.in/);
  assert.match(q.source_ctr_ix,/fssai\.gov\.in/);
  assert.ok(q.product_form_and_processing_sample_gate.length>30);
  let h=ui(p);
  assert.match(h,/11 October FSSAI official rabbit\/egg pesticide article references — CONDITIONAL, NOT APPLIED/);
  assert.match(h,/No processing-factor, edible tissue, actual sample, other residue or current amendment clearance/);
  for(const a of q.official_source_rows_conditional_not_applied){
   assert.equal(a.regulation_2_3_1_pdf_page,16);
   assert.equal(a.verified_against_official_pdf,true);
   assert.equal(a.applies_unconditionally_to_every_finished_subtype,false);
   assert.equal(a.auto_apply_numeric_limit,false);
   assert.equal(a.authorizes_pesticide_compliance_pass,false);
   assert.ok(a.official_mrl>0);assert.equal(a.unit,"mg/kg");
   assert.ok(h.includes(String(a.official_mrl)+" mg/kg"));
   assert.match(h,/CONDITIONAL \/ NOT APPLIED/);
   count++;
  }
  assert.doesNotMatch(ui({...p,fssr:"2.5.X"}),/11 October FSSAI official rabbit\/egg pesticide article/);
 }
 assert.equal(count,10);
});
test("Rabbit source articles are species- and muscle/offal-gated, not goat/poultry veterinary mappings",()=>{
 for(const r of rows.filter(r=>r.catalog_id.includes("rabbit"))){
  const q=r.official_2_5_animal_pesticide_candidates_2026_10_11,items=q.official_source_rows_conditional_not_applied;
  assert.equal(q.fssr,"2.5.2(6)");assert.equal(q.source_food_group,"rabbit");
  assert.equal(items.length,3);
  assert.deepEqual(items.map(x=>x.official_mrl),[0.2,0.05,0.05]);
  assert.deepEqual(items.map(x=>x.named_food_article),["Meat and Poultry","Meat and Meat products","Meat and Meat products"]);
  assert.ok(items.some(x=>x.scope_conditions.includes("edible offal")));
 }
});
test("Processed egg source row is raw commodity 2,4-D eggs on shell-free basis, never an unconditional dried/pickled pass",()=>{
 for(const r of rows.filter(r=>r.catalog_id.includes("egg"))){
  const q=r.official_2_5_animal_pesticide_candidates_2026_10_11,x=q.official_source_rows_conditional_not_applied[0];
  assert.equal(q.official_source_rows_conditional_not_applied.length,1);
  assert.equal(q.source_food_group,"egg");
  assert.equal(x.named_food_article,"Eggs");assert.equal(x.official_mrl,0.05);
  assert.match(x.scope_conditions,/shell-free basis/);
  assert.match(x.scope_conditions,/not automatically/);
  assert.equal(x.auto_apply_numeric_limit,false);
  assert.match(ui(byId.get(r.catalog_id)),/shell-free basis/);
 }
});
