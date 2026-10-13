"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const root="fssai-product-helper-preview-01/";
const q=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json"));
const d=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current35-nonmetal-named-scope-batch11-2026-10-13.json"));
const ledger=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json"));
test("canonical 533/498/35 preserved, WordPress untouched",()=>{
 assert.equal(q.review_records.length,35);assert.equal(ledger.first_source_pending,35);
 assert.deepEqual(d.baseline,{catalogue:533,conditional_first_source_matches:498,first_exact_source_pending:35,compliance_approvals:0});
 assert.equal(d.summary.canonical_ledger_modified,false);assert.equal(d.summary.wordpress_modified,false);
 for(const k of ["new_named_article_source_promotions","applied_finished_product_contaminant_limits","verified_laboratory_results","full_contaminant_panels_cleared","full_regulatory_approvals"])assert.equal(d.summary[k],0);
});
test("35 unique finished-product cases, eight exactly named rules per case (280 checks)",()=>{
 assert.equal(d.cases.length,35);assert.equal(d.source_rows.length,8);assert.equal(d.scope_reviews,280);
 const ids=d.source_rows.map(x=>x.id);
 assert.equal(new Set(ids).size,8);
 for(let i=0;i<35;i++){
  const a=d.cases[i],b=q.review_records[i];
  assert.equal(a.catalog_id,b.catalog_id);assert.equal(a.product_name,b.product_name);
  assert.equal(a.source_state,"FIRST_EXACT_SOURCE_PENDING");assert.equal(a.verified_finished_article,false);assert.equal(a.compliance_approved,false);
  assert.deepEqual(a.review_checks.map(x=>x.row),ids);
  for(const c of a.review_checks){
   assert.ok(c.evidence_question.length>15);assert.ok(c.gate.length>3);
   assert.equal(c.finished_product_article_match_verified,false);
   assert.equal(c.lot_analytical_pass,false);assert.equal(c.numeric_limit_applied,false);
  }
 }
});
test("specific dangerous subtype transfers remain blocked",()=>{
 const m=new Map(d.cases.map(x=>[x.catalog_id,x]));
 const gate=(id,r)=>m.get(id).review_checks.find(x=>x.row===r).gate;
 assert.equal(gate("coffee-chicory-mixture","OCHRATOXIN_A"),"COFFEE_CHICORY_MIXTURE_GAP");
 assert.equal(gate("04-04-1-coconut-milk-powder","AF_M1"),"NON_DAIRY_NAME_NOT_MILK");
 assert.equal(gate("04-04-1-frozen-fruits-fruit-products","PATULIN"),"FROZEN_FRUIT_NOT_APPLE_JUICE");
 assert.equal(gate("06-06-1-chia-seeds","AF_B1"),"OILSEED_COMMODITY_CLASSIFICATION");
 assert.equal(gate("06-06-2-arrowroot","HYDROCYANIC_ACID"),"NAMED_PLANT_FLOUR_IDENTITY_MISMATCH");
});
test("Browser panel loaded after batch 10, official citations only",()=>{
 const html=fs.readFileSync(root+"index.html","utf8");
 const s="fssai-current35-nonmetal-named-scope-batch11-2026-10-13.js";
 assert.equal(html.split(s).length,2);
 assert.ok(html.indexOf(s)>html.indexOf("fssai-current35-general-metal-source-batch10"));
 assert.equal(d.source_policy,"OFFICIAL_FSSAI_FOSCOS_ONLY");
 for(const a of d.source_rows)assert.equal(a.official_source,d.official_ctr_source);
});
