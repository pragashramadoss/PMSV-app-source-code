"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const base=path.resolve(__dirname,"../fssai-product-helper-preview-01/data");
const load=s=>JSON.parse(fs.readFileSync(path.join(base,s),"utf8"));
const id="06-06-3-fruit-vegetable-cereal-flakes", source="2.3.20";
const master=load("product-master-v1.json"),index=load("standard-search-index-v1.json"),ch23=load("rules/chapter-2-3-fruit-vegetable-v1.json"),ch24=load("rules/chapter-2-4-cereals-v1.json");
const pend=load("rules/contaminants-v9-unresolved-264-review-v1.json"),history=load("rules/fssai-full-136-identity-applicability-review-2026-10-10.json");
const m=master.profiles.find(x=>x.id===id),c=master.catalog_products.find(x=>x.id===id),i=index.products.find(x=>x.id===id),p=pend.records.find(x=>x.catalog_id===id),h=history.records.find(x=>x.catalog_id===id),q=ch23.standards.find(x=>x.key===source);
test("FSSAI 2.3.20 exact-name standard routes same in 533 index and full product master; Breakfast Cereal remains separate",()=>{
 assert.equal(master.catalog_products.length,533);assert.equal(index.products.length,533);
 for(const x of [m,c,i,p,h])assert.equal(x.fssr,source);
 for(const x of [m,c,i]){assert.equal(x.rule_key,source);assert.match(x.rule_file,/chapter-2-3-fruit-vegetable-v1\.json$/);assert.equal(x.microbiology_profile_key,"");assert.ok(!x.microbiology_candidates.some(y=>y.profile_key==="grain-03"));}
 assert.equal(m.regulation_chapter,"2.3");assert.equal(m.standard_name,"Fruit/Vegetable, Cereal Flakes");
 assert.equal(index.products.find(x=>x.id==="06-06-3-breakfast-cereal").fssr,"2.4.35");
 assert.ok(ch24.standards.some(x=>x.key==="2.4.35"&&x.name==="Breakfast Cereal"));
 assert.equal(index.generated_from_blob.length,40);assert.notEqual(index.generated_from_blob,"2432fec2880d74df91b413df27b811625e108f4a");
});
test("Three Chapter 2.3.20 numeric FSSR quality limits; no contaminant or microbiology PASS",()=>{
 assert.ok(q);assert.equal(q.source_pdf_page_one_based,28);assert.match(q.source_url,/fssai\.gov\.in/);
 assert.deepEqual(q.composition.map(x=>[x.parameter,x.operator,x.value]),[["Moisture","<=",6],["Acid insoluble ash","<=",0.5],["Starch","<=",25]]);
 assert.equal(q.full_compliance_assessment_enabled,false);assert.equal(q.numeric_evidence.compliance_assessment_enabled,false);
 assert.equal(p.auto_apply_numeric_limit,false);assert.equal(p.unconditional_compliance_pass,false);
 assert.equal(p.assessment_status,"exact_contaminant_evidence_not_yet_established");
 assert.equal(p.official_standard_route_correction_2026_10_11.retained_exact_contaminant_evidence_unresolved,true);
 assert.ok(!index.products.find(x=>x.id===id).microbiology_candidates.some(y=>y.profile_key));
 assert.equal(pend.pending,126);assert.equal(pend.current_snapshot_summary_2026_10_10.exact_partial_evidence,407);
 assert.equal(history.full_contaminant_compliance_passes,0);
});
test("All 533 fast routes agree with their full master catalogue record",()=>{
 const byId=new Map(master.catalog_products.map(x=>[x.id,x]));assert.equal(byId.size,533);
 for(const x of index.products){const y=byId.get(x.id);assert.ok(y,x.id);for(const k of ["fssr","rule_file","microbiology_profile_key","microbiology_status"]) assert.equal(x[k],y[k],x.id+" "+k); if(x.rule_key!==y.rule_key){assert.equal(y.rule_key,"2.4.6",x.id);assert.match(x.rule_key,/^2\\.4\\.6\\(\\d+\\)$/,x.id)}}
});
