"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const m=read(base+"rules/fssai-ayurveda-nine-recipe-b1-cross-article-source-review-2026-10-11.json");
const core=read(base+"rules/contaminants-v9-core.json");
const index=read(base+"standard-search-index-v1.json").products;
const byId=new Map(index.map(x=>[x.id,x])),q=read("audit-output/fssai-live-first-source-ledger-533.json");
const pending=new Set(q.pending_product_details.map(x=>x.id));
test("Nine individually identified FoSCoS Ayurveda Aahara products are currently first-exact unresolved",()=>{
 assert.deepEqual([m.catalogue_size,m.current_partial_exact_evidence,m.current_first_exact_pending,m.reviewed_recipe_count],[533,410,123,9]);
 assert.equal(m.records.length,9);assert.equal(new Set(m.records.map(x=>x.catalog_id)).size,9);
 assert.equal(m.mandatory_commodity_b1_overlap_candidates,4);assert.equal(m.recipe_source_gaps_or_exclusions,5);
 for(const r of m.records){
   const p=byId.get(r.catalog_id);assert.ok(p&&pending.has(r.catalog_id),r.catalog_id);
   assert.equal(r.product_name,p.name);assert.equal(r.fssr,p.fssr);assert.equal(r.fcs,p.fcs);
   for(const k of ["first_exact_product_article_cleared","finished_product_numeric_limit_applied","complete_regulatory_compliance_pass"])assert.equal(r[k],false);
   assert.equal(r.total_aflatoxins_article_scope_still_ambiguous,true);
 }
});
test("Exactly four documented compulsory cereal/pulse recipe scenarios carry B1 source article review at 10 ug/kg",()=>{
 const ids=["102-102-1-12-1-lajadi-kashaya-parched-rice-tea","102-102-1-13-1-krishara-khichdi","102-102-1-14-4-yava-ksheera-barley-milk","102-102-1-15-1-kulmasha-barley-savory-discs"];
 assert.deepEqual(new Set(m.records.filter(x=>x.has_b1_recipe_candidate).map(x=>x.catalog_id)),new Set(ids));
 assert.match(core.source_version,/Version IX/);
 const group=core.crop_contaminants.aflatoxin_b1;assert.equal(group.unit,"µg/kg");
 for(const article of ["Cereal and cereal products","Pulses","Food product containing any of the above mentioned food articles"])
    assert.equal(group.rules.filter(x=>x.article===article&&x.limit===10).length,1,article);
 for(const x of m.records.filter(r=>r.has_b1_recipe_candidate))assert.equal(x.reference_limit_ugkg,10);
});
test("Five non-qualifying or ambiguous recipe cases explicitly prohibit auto-PASS",()=>{
 assert.equal(m.records.filter(x=>!x.has_b1_recipe_candidate).length,5);
 for(const r of m.records.filter(x=>!x.has_b1_recipe_candidate)){
   assert.equal(r.reference_limit_ugkg,null);assert.equal(r.review_status,"NOT_SUFFICIENT_FOR_B1_ARTICLE");
 }
 const dugdha=m.records.find(x=>x.official_recipe_id==="14.5");
 assert.ok(dugdha&&dugdha.recipe_form==="rice_in_method_not_table");
});
test("Regulatory-source divergence for total aflatoxins remains unresolved while B1 is common",()=>{
 const tot=core.crop_contaminants.total_aflatoxins;
 assert.equal(tot.unit,"µg/kg");
 assert.equal(tot.rules.find(x=>x.article==="Cereal and cereal products").limit,15);
 assert.equal(tot.rules.find(x=>x.article==="Food product containing any of the above mentioned food articles").limit,20);
 assert.equal(m.automatic_product_article_promotions,0);
 assert.equal(m.finished_product_compliance_passes,0);
});
