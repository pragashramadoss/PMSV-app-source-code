#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8")),pre="fssai-product-helper-preview-01/data/";
const m=read(pre+"rules/fssai-11-fruit-pickles-pastes-chutney-quality-2026-10-11.json");
const ix=read(pre+"standard-search-index-v1.json").products,by=new Map(ix.map(x=>[x.id,x]));
const r=read("audit-output/fssai-live-first-source-ledger-533.json"),pending=new Set(r.pending_product_details.map(x=>x.id));
assert.deepEqual([r.product_count,r.partial_first_source_evidence,r.unresolved_first_source_gaps],[533,412,121]);
assert.equal(m.records.length,11);assert.equal(m.records.reduce((s,x)=>s+x.criteria.length,0),m.source_specific_quality_rows);
assert.equal(new Set(m.records.map(x=>x.catalog_id)).size,11);
assert.equal(m.mango_chutney_2_3_42_cannot_transfer_to_chutney_2_3_41,true);
for(const row of m.records){
 const p=by.get(row.catalog_id);assert.ok(p&&pending.has(p.id));
 assert.equal(row.product_name,p.name);assert.equal(row.fssr,p.fssr);assert.equal(row.fcs,p.fcs);
 assert.equal(row.first_exact_contaminant_article_promoted,false);
 assert.equal(row.finished_product_ctr_limit_applied,false);assert.equal(row.overall_compliance_pass,false);
 for(const x of row.criteria){
  assert.ok(x.parameter&&x.condition&&x.unit);
  assert.ok(x.official_pdf_page_one_based>=25&&x.official_pdf_page_one_based<=56);
  assert.ok([">=","<=","qualitative"].includes(x.operator));
  assert.equal(x.analytical_compliance_automatically_passed,false);
  if(x.operator!=="qualitative")assert.ok(Number.isFinite(x.value));
 }
}
const pickles=m.records.filter(x=>x.fssr==="2.3.43");assert.equal(pickles.length,3);
for(const r of pickles){assert.equal(r.criteria.length,8);assert.ok(r.criteria.some(c=>c.parameter==="Sodium chloride"&&c.condition==="Pickles in brine only"&&c.value===12));}
const ch=m.records.find(x=>x.fssr==="2.3.41");assert.equal(ch.criteria.length,8);
assert.deepEqual(ch.criteria.filter(x=>x.parameter==="Total soluble solids").map(x=>x.value),[50,25,25]);
assert.equal(ch.criteria.find(x=>x.parameter==="pH").value,4.6);
assert.equal(m.source_specific_quality_rows,48);
assert.deepEqual([m.first_exact_contaminant_source_promotions,m.finished_product_numeric_contaminant_approvals,m.finished_product_laboratory_passes],[0,0,0]);
fs.mkdirSync(path.join(root,"audit-output"),{recursive:true});
fs.writeFileSync(path.join(root,"audit-output/fssai-11-fruit-pickle-sauce-source-quality.json"),JSON.stringify({products:11,quality_rows:m.source_specific_quality_rows,first_exact_contaminant_cleared:0,records:m.records},null,2)+"\n");
console.log("PASS: 11 FSSAI Chapter 2.3 qualified products; 48 source quality rules; no contaminant promotions; 412 partial 121 unresolved");
