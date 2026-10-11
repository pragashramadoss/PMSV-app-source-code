"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),load=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8")),base="fssai-product-helper-preview-01/data/";
const d=load(base+"rules/fssai-ten-edible-fungi-2-3-62-quality-and-ctr-gates-2026-10-11.json");
const ix=load(base+"standard-search-index-v1.json").products, by=new Map(ix.map(x=>[x.id,x]));
const ctr=load(base+"rules/contaminants-v9-core.json");
test("Every Chapter 2.3.62 subtype has source-pinned exact quality, no assumed chemical MRL",()=>{
 assert.equal(d.verified_local_products,10);assert.equal(d.records.length,10);
 assert.ok(d.quality_source_rows>=50);assert.equal(d.first_exact_contaminant_source_promotions,0);
 const pending=load(base+"rules/fssai-v9-metal-fallback-precedence-2026-10-11.json");
 for(const r of d.records){
  const p=by.get(r.catalog_id);assert.ok(p);
  assert.equal(r.product_name,p.name);assert.equal(r.fssr,p.fssr);assert.equal(r.fcs,p.fcs);
  assert.ok(pending.unresolved_first_exact_catalog_ids.includes(p.id));
  assert.ok(r.criteria.length>=3);
  assert.equal(r.first_exact_contaminant_article_matched,false);
  assert.equal(r.finished_product_ctr_numeric_limit_auto_apply,false);
 }
});
test("Frozen -18C, dried-shiitake distinctions and quick-frozen process separate",()=>{
 const get=key=>d.records.find(r=>r.process_variant===key);
 const frozen=get("quick_frozen").criteria;
 assert.ok(frozen.some(x=>x.parameter==="Thermal centre temperature"&&x.value===-18&&x.unit==="°C"));
 const dried=get("dried").criteria.filter(x=>x.parameter==="Water content");
 assert.deepEqual(dried.map(x=>x.value),[6,12,13]);
 const ground=get("grits_or_powder").criteria.filter(x=>x.parameter==="Water content");
 assert.deepEqual(ground.map(x=>x.value),[13,9]);
});
test("Salt, fermentation, vinegar, impurities, extract and concentration must not inherit between subtypes",()=>{
 const get=key=>d.records.find(r=>r.process_variant===key).criteria;
 assert.ok(get("salted").some(x=>x.parameter==="Salt"&&x.operator==="range"&&x.min===15&&x.max===18));
 assert.ok(get("fermented").some(x=>x.parameter==="Naturally occurring lactic acid"&&x.operator===">="&&x.value===1));
 assert.ok(get("pickled").some(x=>x.parameter==="Vinegar (as acetic acid)"&&x.value===2));
 assert.ok(get("extract_or_concentrate").some(x=>x.parameter.includes("concentrate identity")&&x.value===24&&x.operator==="identity_target"));
 assert.ok(get("dried_concentrate").some(x=>x.parameter==="Water content"&&x.value===9));
 assert.ok(get("sterilized").some(x=>x.parameter==="Salt"&&x.value===2));
 assert.ok(get("oil_packed").some(x=>x.parameter==="Salt"&&x.value===1));
});
test("FSSAI NOTS mushroom species and metal packaging conditions remain REVIEW ONLY",()=>{
 for(const [metal,article,limit,unit] of [["Lead","Canned mushrooms",1,"mg/kg"],["Tin","Canned mushrooms",250,"mg/kg"]]){
  const xs=ctr.metal_article_rules_v9[metal]||[];
  assert.equal(xs.filter(r=>r.article===article&&Number(r.limit)===limit&&r.unit===unit).length,1,metal);
 }
 const a=ctr.naturally_occurring_toxic_substances.agaric_acid;
 assert.equal(a.filter(r=>r.article==="Food containing mushrooms"&&r.limit===100&&r.unit==="ppm").length,1);
 assert.equal(d.conditional_contaminants.agaric_acid.article,"Food containing mushrooms");
 assert.equal(d.conditional_contaminants.agaric_acid.limit,100);
 assert.equal(d.conditional_contaminants.tin.article,"Canned mushrooms");
 assert.equal(d.conditional_contaminants.tin.limit,250);
 assert.equal(d.conditional_contaminants.lead.limit,1);
 for(const x of Object.values(d.conditional_contaminants))assert.equal(x.auto_apply,false);
 assert.ok(d.mandatory_qualifiers.some(x=>x.includes("Agaricus")));
 assert.equal(d.full_compliance_passes,0);
});
test("Audit artefact contains all named quality without converting it to contaminant evidence",()=>{
 const a=load("audit-output/fssai-ten-edible-fungi-quality-vs-ctr-review.json");
 assert.deepEqual([a.verified_products,a.quality_source_rows,a.first_exact_contaminant_evidence_added,a.finished_product_compliance_pass],[10,d.quality_source_rows,0,0]);
 assert.equal(a.records.length,10);
});
