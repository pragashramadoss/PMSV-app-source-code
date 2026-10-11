#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const data=read(base+"rules/fssai-ayurveda-nine-recipe-b1-cross-article-source-review-2026-10-11.json");
const db=read(base+"rules/contaminants-v9-core.json");
const index=read(base+"standard-search-index-v1.json").products;
const ledger=read("audit-output/fssai-live-first-source-ledger-533.json");
const ix=new Map(index.map(x=>[x.id,x])),pending=new Set(ledger.pending_product_details.map(x=>x.id));
assert.deepEqual([ledger.product_count,ledger.partial_first_source_evidence,ledger.unresolved_first_source_gaps],[533,410,123]);
assert.deepEqual([data.records.length,data.mandatory_commodity_b1_overlap_candidates,data.recipe_source_gaps_or_exclusions,data.automatic_product_article_promotions],[9,4,5,0]);
assert.equal(data.official_sources_only,true);
assert.equal(db.source_version,"Version IX (03.02.2026)");
const af=db.crop_contaminants.aflatoxin_b1,total=db.crop_contaminants.total_aflatoxins;
assert.equal(af.unit,"µg/kg");assert.equal(total.unit,"µg/kg");
const articles={"Cereal and cereal products":10,"Pulses":10,"Food product containing any of the above mentioned food articles":10};
for(const [name,limit] of Object.entries(articles))assert.equal(af.rules.filter(x=>x.article===name&&Number(x.limit)===limit).length,1,"B1 source mismatch "+name);
assert.equal(total.rules.find(x=>x.article==="Cereal and cereal products").limit,15);
assert.equal(total.rules.find(x=>x.article==="Food product containing any of the above mentioned food articles").limit,20);
for(const row of data.records){
 const p=ix.get(row.catalog_id);
 assert.ok(p&&pending.has(p.id),row.catalog_id);
 assert.equal(p.name,row.product_name);assert.equal(p.fssr,row.fssr);assert.equal(p.fcs,row.fcs);
 assert.equal(row.recipe_source,data.official_recipe_order);assert.equal(row.official_ctr_source,data.official_ctr_version_ix);
 assert.ok(row.recipe_ingredient_evidence.length>18&&row.qualification_required.length>28);
 assert.equal(row.first_exact_product_article_cleared,false);
 assert.equal(row.finished_product_numeric_limit_applied,false);
 assert.equal(row.complete_regulatory_compliance_pass,false);
 if(row.has_b1_recipe_candidate)assert.equal(row.reference_limit_ugkg,10);
 else assert.equal(row.reference_limit_ugkg,null);
}
const out={catalogue:533,first_exact_pending:123,partial_exact:410,reviewed_recipes:9,
 mandated_composition_overlap_candidates:4,source_recipe_holds:5,final_compliance_passes:0,
 article_scope_interpretation_still_required:true,records:data.records};
fs.mkdirSync(path.join(root,"audit-output"),{recursive:true});
fs.writeFileSync(path.join(root,"audit-output/fssai-ayurveda-nine-recipe-source-review.json"),JSON.stringify(out,null,2)+"\n");
console.log("PASS: 9 Ayurveda recipes, 4 mandatory cereal/pulse candidate overlaps, 5 safeguards, FSSAI crop-table B1 10 ug/kg pinned; first exact gaps remain 123; no approvals");
