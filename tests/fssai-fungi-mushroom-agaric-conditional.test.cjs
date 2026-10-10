"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const evidence=read("fssai-product-helper-preview-01/data/rules/chapter-2-3-fungi-agaric-conditional-v1.json");
const catalogue=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const standard=read("fssai-product-helper-preview-01/data/rules/chapter-2-3-fruit-vegetable-v1.json");
const contaminants=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
test("10 distinct Chapter 2.3.62 edible-fungi identities have CONDITIONAL species review but no numeric auto-application",()=>{
 assert.equal(evidence.records.length,10);
 const ids=new Set(evidence.records.map(x=>x.catalog_id));
 assert.equal(ids.size,10);
 assert.equal(evidence.auto_apply,false);
 assert.equal(evidence.assume_all_fungi_are_mushrooms,false);
 assert.equal(evidence.require_exact_species_confirmation,true);
 assert.equal(evidence.requires_input,"product.confirmed_edible_mushroom_species");
 assert.equal(evidence.full_contaminant_compliance,false);
 const actual=catalogue.filter(x=>x.fssr==="2.3.62");
 assert.equal(actual.length,10);
 assert.deepEqual(ids,new Set(actual.map(x=>x.id)));
 for(const x of evidence.records){
   const product=actual.find(z=>z.id===x.catalog_id);
   assert.equal(product.name,x.product_name);
   assert.equal(x.numeric_auto_apply,false);
   assert.equal(x.status,"species_identity_required_before_limit_selection");
 }
});
test("Official source has exact agaric acid 100 ppm only for food containing mushrooms",()=>{
 assert.match(contaminants.source_version,/Version IX.*03\.02\.2026/);
 const row=contaminants.naturally_occurring_toxic_substances.agaric_acid.filter(x=>x.article==="Food containing mushrooms");
 assert.equal(row.length,1,"Agaric acid mushroom category must have one unambiguous current source row");
 assert.equal(Number(row[0].limit),100);
 assert.equal(row[0].unit,"ppm");
 assert.equal(evidence.source_contaminants.exact_article,row[0].article);
 assert.equal(evidence.source_contaminants.limit,row[0].limit);
 assert.equal(evidence.source_contaminants.unit,row[0].unit);
 assert.match(evidence.source_contaminants.url,/^https:\/\/fssai\.gov\.in\//);
});
test("Edible-fungi standard explicitly distinguishes genus/species and never constitutes a mushroom-only standard",()=>{
 const st=standard.standards.find(x=>x.key==="2.3.62");
 assert.ok(st);
 assert.equal(st.name,"EDIBLE FUNGI PRODUCTS");
 assert.equal(st.variant_resolution_required,true);
 assert.ok(st.quality_rules.some(x=>/species/.test(x)));
 assert.equal(evidence.source_standard.clause,st.key);
 assert.ok(evidence.source_standard.url.includes("fssai.gov.in"));
 assert.equal(evidence.exemption_if_not_confirmed,false);
});
