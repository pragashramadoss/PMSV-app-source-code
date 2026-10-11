#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),load=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const d=load(base+"rules/fssai-ten-edible-fungi-2-3-62-quality-and-ctr-gates-2026-10-11.json");
const ix=load(base+"standard-search-index-v1.json").products;
const fungi=load(base+"rules/chapter-2-3-fungi-agaric-conditional-v1.json");
const contaminantCore=load(base+"rules/contaminants-v9-core.json");
const current=load("audit-output/fssai-live-first-source-ledger-533.json");
const map=new Map(ix.map(x=>[x.id,x])),pending=new Set(current.pending_product_details.map(x=>x.id));
assert.deepEqual([current.product_count,current.partial_first_source_evidence,current.unresolved_first_source_gaps],[533,410,123]);
assert.equal(d.records.length,10);assert.equal(d.verified_local_products,10);
assert.equal(d.records.reduce((n,x)=>n+x.criteria.length,0),d.quality_source_rows);
assert.equal(new Set(d.records.map(x=>x.catalog_id)).size,10);
assert.equal(d.official_chapter_source,"https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf");
assert.equal(fungi.source_contaminants.limit,100);
assert.equal(contaminantCore.source_version,"Version IX (03.02.2026)");
const sourceCheck=(metal,article,limit,unit)=>{
 const table=metal==="Agaric acid"?contaminantCore.naturally_occurring_toxic_substances.agaric_acid:(contaminantCore.metal_article_rules_v9[metal]||[]);
 assert.equal(table.filter(x=>x.article===article&&Number(x.limit)===limit&&x.unit===unit).length,1,
  "Official CTR Version IX source mismatch: "+metal+" / "+article);
};
sourceCheck("Agaric acid","Food containing mushrooms",100,"ppm");
sourceCheck("Lead","Canned mushrooms",1,"mg/kg");
sourceCheck("Tin","Canned mushrooms",250,"mg/kg");
assert.equal(fungi.source_contaminants.unit,"ppm");
assert.equal(fungi.records.length,10);
for(const record of d.records){
 const p=map.get(record.catalog_id);
 assert.ok(p&&pending.has(p.id)&&record.product_name===p.name&&record.fssr===p.fssr&&record.fcs===p.fcs,record.catalog_id);
 const source=fungi.records.find(x=>x.catalog_id===p.id);
 assert.ok(source&&source.numeric_auto_apply===false);
 assert.equal(record.first_exact_contaminant_article_matched,false);
 assert.equal(record.finished_product_ctr_numeric_limit_auto_apply,false);
 assert.equal(record.complete_regulatory_compliance_pass,false);
 assert.ok(record.criteria.length>=3);
 for(const row of record.criteria){
  assert.ok(row.parameter&&row.unit&&row.subtype);assert.ok(row.pdf_page_one_based>=98&&row.pdf_page_one_based<=103);
  assert.ok(["<=",">=","range","absent","identity_target"].includes(row.operator));
  if(row.operator==="range")assert.ok(Number.isFinite(row.min)&&Number.isFinite(row.max)&&row.min<=row.max);
  else if(row.operator!=="absent")assert.ok(Number.isFinite(row.value));
 }
}
assert.deepEqual([d.conditional_contaminants.agaric_acid.limit,d.conditional_contaminants.tin.limit,d.conditional_contaminants.lead.limit],[100,250,1]);
for(const x of Object.values(d.conditional_contaminants))assert.equal(x.auto_apply,false);
fs.mkdirSync(path.join(root,"audit-output"),{recursive:true});
fs.writeFileSync(path.join(root,"audit-output/fssai-ten-edible-fungi-quality-vs-ctr-review.json"),JSON.stringify({verified_products:10,quality_source_rows:d.quality_source_rows,first_exact_contaminant_evidence_added:0,finished_product_compliance_pass:0,records:d.records},null,2)+"\n");
console.log("PASS: ten FoSCoS FSSR 2.3.62 variants with "+d.quality_source_rows+" quality source rows; species/canpack source gates held; no CTR promotion");
