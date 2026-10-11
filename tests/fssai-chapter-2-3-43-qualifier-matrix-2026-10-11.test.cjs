#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const rd=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const m=rd("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const cat=rd("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const byId=new Map(cat.map(x=>[x.id,x]));
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const a=html.indexOf("function pendingContaminantReviewNotice(p){"),b=html.indexOf("function renderProductContaminants(){",a);
const ctx=vm.createContext({contaminantsPendingReviewDb:m,esc:s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")});
vm.runInContext(html.slice(a,b),ctx);
const notice=x=>vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(x)+")",ctx);
const rows=m.records.filter(r=>r.chapter_2_3_qualifier_matrix_2026_10_11);
test("all 43 current chapter 2.3 pending IDs have five source/review qualifiers, no numeric pass",()=>{
 assert.equal(cat.length,533);
 assert.equal(m.records.length,126);assert.equal(m.pending,126);assert.equal(m.verified_evidence_added,138);
 assert.equal(rows.length,43);assert.equal(new Set(rows.map(x=>x.catalog_id)).size,43);
 assert.equal(m.chapter_2_3_qualifier_matrix_summary_2026_10_11.reviewed,43);
 assert.equal(m.chapter_2_3_qualifier_matrix_summary_2026_10_11.review_buckets,19);
 assert.equal(m.chapter_2_3_qualifier_matrix_summary_2026_10_11.new_first_exact_ctr_matches,0);
 assert.equal(m.chapter_2_3_qualifier_matrix_summary_2026_10_11.still_unresolved,126);
 for(const r of rows){
   const x=r.chapter_2_3_qualifier_matrix_2026_10_11,p=byId.get(r.catalog_id);
   assert.ok(p&&r.regulatory_family==="2.3",r.catalog_id);
   assert.equal(x.catalog_id,p.id);
   assert.equal(x.product_name,p.name);
   assert.equal(x.fssr,p.fssr);
   assert.equal(x.qualifier_fields_required_before_source_applicability_decision.length,5);
   assert.equal(new Set(x.qualifier_fields_required_before_source_applicability_decision).size,5);
   assert.ok(x.product_specific_identity_gate.length>30&&x.excluded_transfer.length>30);
   assert.equal(x.numeric_limit_applied,false);
   assert.equal(x.explicit_compliance_clearance,false);
   assert.equal(x.applicable_mrl_panel_complete,false);
   assert.equal(r.auto_apply_numeric_limit,false);
   assert.equal(r.unconditional_compliance_pass,false);
   assert.ok(x.chapter_source_url.includes("fssai.gov.in/"));
   assert.ok(x.ctr_source_url.includes("fssai.gov.in/"));
   let output=notice(p);
   assert.match(output,/11 October Chapter 2\.3 — five required product\/analytical qualifiers/);
   assert.match(output,/NOT APPLIED/);
   assert.match(output,/No sample or complete MRL compliance established/);
   assert.match(output,/Official Chapter 2\.3/);
 }
});
test("the eleven previously checked metal source references stay conditional and grouped correctly",()=>{
 let sum=0;
 for(const r of rows){
  const q=r.chapter_2_3_qualifier_matrix_2026_10_11;
  const old=r.chapter_2_3_targeted_evidence_review_2026_10_10;
  assert.equal(q.conditional_named_source_articles_previously_checked.length,old.conditional_named_articles.length);
  for(let i=0;i<q.conditional_named_source_articles_previously_checked.length;i++){
   const x=q.conditional_named_source_articles_previously_checked[i],y=old.conditional_named_articles[i];
   assert.equal(x.metal,y.metal);assert.equal(x.reference_limit,y.limit);
   assert.equal(x.unit,y.unit);assert.equal(x.official_article,y.official_article);
   assert.equal(x.auto_apply,false);assert.equal(x.review_only,true);
   assert.ok(notice(byId.get(r.catalog_id)).includes(String(x.reference_limit)+" "+x.unit),r.catalog_id);
   sum++;
  }
 }
 assert.equal(sum,11);
});
test("canned and dried/frozen forms do not conflate specific articles",()=>{
 const ids=[
 ["04-04-2-dehydrated-vegetables","Onion or non-onion"],
 ["04-04-2-sterilized-fungi","Metal can versus glass"],
 ["04-04-1-thermally-processed-fruit-salad-cocktail-mix","Canned fruit cocktail"],
 ["04-04-1-frozen-fruits-fruit-products","Frozen whole raw"],
 ["04-04-1-coconut-milk-non-dairy","Coconut extraction"],
 ["04-04-2-cocoa-beans","Cocoa bean species"]
 ];
 for(const [id,pattern] of ids){
  const r=rows.find(x=>x.catalog_id===id);assert.ok(r,id);
  const x=r.chapter_2_3_qualifier_matrix_2026_10_11;
  assert.ok(x.qualifier_fields_required_before_source_applicability_decision.some(v=>v.toLowerCase().includes(pattern.toLowerCase())),id);
  assert.match(notice({...byId.get(id),fssr:"wrong"}),/identity mismatch/);
  assert.doesNotMatch(notice({...byId.get(id),fssr:"wrong"}),/11 October Chapter 2\.3/);
 }
});
