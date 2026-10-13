"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const root="fssai-product-helper-preview-01/";
const read=(n)=>JSON.parse(fs.readFileSync(root+"data/rules/"+n));
const d=read("fssai-current35-positive-fssr-ctr-boundaries-batch12-2026-10-13.json");
const q=read("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=read("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
test("exact source still 498/35 and no compliance PASS",()=>{
 assert.equal(ledger.first_source_pending,35);
 assert.deepEqual(d.baseline,{total:533,first_source_conditional:498,first_exact_source_pending:35,compliance_approvals:0});
 assert.equal(d.conclusions.promotions,0);
 assert.equal(d.conclusions.auto_assigned_numeric_finished_limits,0);
 assert.equal(d.conclusions.verified_lot_lab_passes,0);
 assert.equal(d.conclusions.full_finished_product_compliance_approvals,0);
 assert.equal(d.conclusions.canonical_ledger_changed,false);
 assert.equal(d.conclusions.wordpress_modified,false);
});
test("22 distinct identities and 88 exact document proof questions",()=>{
 assert.equal(d.cases.length,22);assert.equal(new Set(d.cases.map(x=>x.catalog_id)).size,22);
 const m=new Map(q.review_records.map(x=>[x.catalog_id,x]));
 assert.equal(d.cases.reduce((a,x)=>a+x.four_independent_proof_questions.length,0),88);
 for(const x of d.cases){
  const r=m.get(x.catalog_id);assert.ok(r);
  assert.equal(x.product_name,r.product_name);assert.equal(x.fssr,r.fssr||"");
  assert.equal(x.product_specific_CTR_first_source_positively_verified,false);
  assert.equal(x.finished_food_numeric_limit_applied,false);
  assert.equal(x.real_lot_lab_pass,false);assert.equal(x.finished_food_legal_approval,false);
  assert.ok(/^https:\/\/(?:www\.)?(?:fssai\.gov\.in|foscos\.fssai\.gov\.in)\//.test(x.product_standard_source),x.catalog_id);
  assert.ok(x.competing_named_CTR_source.length>15);
 }
});
test("three decisive official contradictions retained",()=>{
 const m=new Map(d.cases.map(x=>[x.catalog_id,x]));
 assert.match(m.get("purified-vending-water").official_fssr_product_identity_clause,/excludes packaged/);
 assert.match(m.get("11-11-1-dried-glucose-syrup").official_fssr_product_identity_clause,/≤1.0%/);
 assert.match(m.get("11-11-1-misri").first_product_specific_positive_proof,/sulphated-ash/);
 assert.match(m.get("100-100-silver-leaf-chandi-ka-warq").official_fssr_product_identity_clause,/999\/1000/);
});
test("preview integration after batch 11; official sources only",()=>{
 const html=fs.readFileSync(root+"index.html","utf8");
 assert.equal(html.split("fssai-current35-positive-fssr-ctr-boundaries-batch12-2026-10-13.js").length,2);
 assert.ok(html.indexOf("fssai-current35-positive-fssr-ctr-boundaries-batch12-2026-10-13.js")>html.indexOf("fssai-current35-nonmetal-named-scope-batch11-2026-10-13.js"));
 assert.equal(d.legal_scope,"OFFICIAL_FSSAI_FOSCOS_ONLY");
});
