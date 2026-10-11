"use strict";const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8")),pre="fssai-product-helper-preview-01/data/";
const m=load(pre+"rules/fssai-11-fruit-pickles-pastes-chutney-quality-2026-10-11.json");
const by=new Map(load(pre+"standard-search-index-v1.json").products.map(p=>[p.id,p]));
test("11 current pending FoSCoS products contain 48 exact chapter-quality references without contaminant clearance",()=>{
 assert.deepEqual([m.catalogue_size,m.prior_partial_first_exact,m.prior_unresolved_first_exact,m.reviewed_product_identities,m.source_specific_quality_rows],[533,410,123,11,48]);
 for(const r of m.records){const p=by.get(r.catalog_id);assert.ok(p);
  assert.equal(r.product_name,p.name);assert.equal(r.fssr,p.fssr);assert.equal(r.fcs,p.fcs);
  assert.equal(r.first_exact_contaminant_article_promoted,false);assert.equal(r.overall_compliance_pass,false);
 }
});
test("Three FoSCoS pickle families retain exact brine, citrus, oil, vinegar or no-medium distinctions",()=>{
 const r=m.records.filter(x=>x.fssr==="2.3.43");assert.equal(r.length,3);
 for(const p of r){
  assert.equal(p.criteria.length,8);
  assert.equal(p.criteria.find(x=>x.parameter==="Sodium chloride").value,12);
  assert.equal(p.criteria.find(x=>x.parameter==="Acidity as citric acid").value,1.2);
  assert.equal(p.criteria.find(x=>x.parameter==="Acidity of vinegar as acetic acid").value,2);
  assert.ok(p.scope_note.length>=60 && p.criteria.every(q=>q.condition.length>=12), "Pickle medium, subtype and transfer notes must remain explicit");
 }
});
test("Chutney mango-only metal source is not inherited, and fruit/vegetable/spicy TSS are distinct",()=>{
 const r=m.records.find(x=>x.fssr==="2.3.41");assert.ok(r);
 assert.deepEqual(r.criteria.filter(x=>x.parameter==="Total soluble solids").map(x=>x.value),[50,25,25]);
 assert.equal(r.criteria.find(x=>x.parameter==="pH").value,4.6);
 assert.equal(r.criteria.find(x=>x.parameter==="Fruit and vegetable content").value,40);
 assert.equal(m.mango_chutney_2_3_42_cannot_transfer_to_chutney_2_3_41,true);
});
test("Culinary 8% TSS and ginger paste 3% must remain separate",()=>{
 const a=m.records.find(x=>x.product_name==="Culinary Pastes");
 const b=m.records.find(x=>x.product_name==="Ginger paste");
 assert.ok(a&&b);
 assert.equal(a.criteria.find(x=>x.parameter.includes("Total soluble solids")).value,8);
 assert.equal(b.criteria.find(x=>x.parameter.includes("Total soluble solids")).value,3);
});
test("No implicit fruit pulp copper/tin, pickle zero-metal or quality-as-contaminant PASS",()=>{
 assert.equal(m.product_specific_quality_is_not_ctr_evidence,true);
 for(const r of m.records)for(const q of r.criteria)assert.equal(q.analytical_compliance_automatically_passed,false);
 assert.equal(m.finished_product_numeric_contaminant_approvals,0);
 assert.equal(m.finished_product_laboratory_passes,0);
});
