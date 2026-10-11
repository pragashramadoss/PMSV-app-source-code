#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const m=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-unresolved-264-review-v1.json");
const cat=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products,byId=new Map(cat.map(x=>[x.id,x]));
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const st=html.indexOf("function pendingContaminantReviewNotice(p){"),en=html.indexOf("function renderProductContaminants(){",st);
const ctx=vm.createContext({contaminantsPendingReviewDb:m,esc:s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")});
vm.runInContext(html.slice(st,en),ctx);
const ui=p=>vm.runInContext("pendingContaminantReviewNotice("+JSON.stringify(p)+")",ctx);
const rows=m.records.filter(r=>r.official_cassava_sago_hcn_2026_10_11);
test("HCN NOTS official 10 ppm article is conditional on sago/cassava/tapioca flour for exactly three catalogue IDs",()=>{
 assert.equal(rows.length,3);assert.equal(m.pending,126);assert.equal(m.verified_evidence_added,138);
 assert.equal(m.official_cassava_sago_hcn_review_summary_2026_10_11.products_checked,3);
 assert.equal(m.official_cassava_sago_hcn_review_summary_2026_10_11.first_exact_unconditional_finished_product_matches,0);
 assert.deepEqual(rows.map(r=>r.catalog_id).sort(),[
  "06-06-2-custard-powder",
  "06-06-4-macaroni-products-instant-noodle",
  "06-06-4-macaroni-products-pasta-products"
 ]);
 for(const r of rows){
  const q=r.official_cassava_sago_hcn_2026_10_11,p=byId.get(r.catalog_id);
  assert.ok(p);assert.equal(q.catalog_id,p.id);
  assert.equal(q.fssr,p.fssr);assert.equal(q.product_name,p.name);
  assert.equal(q.contaminant_name,"Hydrocyanic acid");
  assert.match(q.classification,/NOTS/);
  assert.equal(q.conditional_reference_limit,10);
  assert.equal(q.unit,"ppm");
  assert.equal(q.version_ix_pdf_page_one_based,15);
  assert.match(q.exact_ctr_article,/Sago, Cassava flour, Tapioca flour, Manihot flour and their products/);
  assert.equal(q.qualifying_flour_species_present,false);
  assert.equal(q.product_process_and_proportion_confirmed,false);
  assert.equal(q.automatically_apply_to_every_named_catalogue_product,false);
  assert.equal(q.legal_compliance_pass,false);
  assert.equal(r.auto_apply_numeric_limit,false);
  assert.equal(r.unconditional_compliance_pass,false);
  assert.match(q.fssai_version_ix_ctr_source,/^https:\/\/fssai\.gov\.in/);
  let output=ui(p);
  assert.match(output,/HCN 10 ppm — SAGO\/TAPIOCA FLOUR CONDITIONAL ONLY, NOT APPLIED/);
  assert.match(output,/not a universal product PASS/);
  assert.match(output,/Tapioca flour/);
  assert.doesNotMatch(ui({...p,fssr:"2.4.6"}),/11 October HCN 10 ppm/);
 }
});
test("The all-maize custard, wheat-pasta and cereal-only noodle alternatives must not receive a false HCN 10 ppm MRL",()=>{
 const mapping=[
 ["06-06-2-custard-powder","maize"],
 ["06-06-4-macaroni-products-pasta-products","suji"],
 ["06-06-4-macaroni-products-instant-noodle","grain"]
 ];
 for(const [id,differentFlour] of mapping){
  let q=rows.find(x=>x.catalog_id===id).official_cassava_sago_hcn_2026_10_11;
  assert.ok(q.product_recipe_qualification.toLowerCase().includes(differentFlour),id);
  assert.equal(q.automatically_apply_to_every_named_catalogue_product,false);
 }
});
