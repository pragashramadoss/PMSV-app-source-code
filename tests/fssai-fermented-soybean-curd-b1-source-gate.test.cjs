"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read(base+"data/rules/contaminants-v9-core.json");
const chapter=read(base+"data/rules/chapter-2-4-cereals-v1.json");
const products=read(base+"data/standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
const audit=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const subjects=[
 ["06-06-8-fermented-soybean-curd","Fermented Soybean Curd","2.4.39(1)"],
 ["06-06-8-fermented-soybean-curd-made-with-s-thermophillus-l-bulgaricus",
  "Fermented Soybean Curd (made with S. thermophillus + L. bulgaricus)","2.4.39"]
];
const start=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",start+25);
assert.ok(start>=0&&end>start);
const ctx=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],
 exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
 normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
 isVerifiedFermentedMilkProduct:()=>false});
vm.runInContext(html.slice(start,end),ctx);
const run=p=>Array.from(ctx.productBaselineContaminantRules(p)).filter(x=>
 String(x.source_basis||"").includes("exact fermented soybean curd identity and shared oilseed/composite B1"));
test("Fermented curd source and two FoSCoS identities exactly match FSSAI Chapter 2.4.39",()=>{
 const record=chapter.standards.find(x=>x.key==="2.4.39");
 const evidence=record.source_verified_fermented_soy_identity;
 assert.equal(evidence.mandatory_source,"Aqueous extract of soybean");
 assert.equal(evidence.chapter_compendium_version,"Version 4 (07.05.2025)");
 assert.ok(chapter.official_sources.some(x=>x.url===evidence.official_source_url));
 assert.equal(evidence.exact_variants.length,2);
 for(const [id,name,fssr] of subjects){
  const p=products.find(x=>x.id===id);
  assert.ok(p,id);assert.equal(p.name,name);assert.equal(p.fssr,fssr);
  assert.equal(p.rule_key,"2.4.39");
  const v=evidence.exact_variants.find(x=>x.catalog_id===id);
  assert.equal(v.catalogue_name,name);assert.equal(v.catalogue_fssr,fssr);
  assert.ok(record.variants.some(x=>x.name===v.standard_variant));
 }
});
test("Both current official source categories agree on B1 10 µg/kg, and no other contaminant is inferred",()=>{
 const g=db.crop_contaminants.aflatoxin_b1;
 assert.equal(g.unit,"µg/kg");
 for(const article of ["Oilseeds, ready to eat","Food product containing any of the above mentioned food articles"])
  assert.equal(g.rules.filter(x=>x.article===article&&x.limit===10).length,1);
 for(const [id] of subjects){
  const p=products.find(x=>x.id===id);
  assert.deepEqual(run(p).map(x=>[x.contaminant,x.limit,x.unit]),[["Aflatoxin B1",10,"µg/kg"]]);
  assert.deepEqual(run({...p,id:"06-06-8-unknown-soy"}),[]);
  assert.deepEqual(run({...p,fssr:"2.4.30"}),[]);
 }
});
test("Version mismatch, missing B1 article, wrong unit or number fail closed",()=>{
 const p=products.find(x=>x.id===subjects[0][0]);
 for(const mutate of [
  d=>{d.crop_contaminants.aflatoxin_b1.rules.find(x=>x.article==="Oilseeds, ready to eat").limit=12},
  d=>{d.crop_contaminants.aflatoxin_b1.rules=d.crop_contaminants.aflatoxin_b1.rules.filter(x=>x.article!=="Oilseeds, ready to eat")},
  d=>{d.crop_contaminants.aflatoxin_b1.unit="mg/kg"},
  d=>{d.source_version="Version VIII"}
 ]){
  const modified=structuredClone(db);mutate(modified);ctx.contaminantsDb=modified;
  assert.deepEqual(run(p),[]);
 }
 ctx.contaminantsDb=db;
});
test("Audit checks source and classifies only partial contaminant evidence",()=>{
 assert.match(audit,/official_v9_exact_fermented_soybean_curd_b1_partial/);
 assert.match(audit,/exact_fermented_soybean_curd_b1:fermentedSoyCurdB1Evidence/);
 assert.match(audit,/source\.exact_variants\?\.length!==2/);
 assert.match(audit,/full_contaminant_coverage:false/);
});
