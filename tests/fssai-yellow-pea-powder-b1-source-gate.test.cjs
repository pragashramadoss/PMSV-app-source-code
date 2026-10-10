"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-4-cereals-v1.json");
const index=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const audit=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const id="04-04-2-yellow-pea-powder",product=index.find(x=>x.id===id),record=chapter.standards.find(x=>x.key==="2.4.36");
test("Exact FSSAI Yellow Pea Powder is exclusively Pisum sativum pulse flour",()=>{
 assert.ok(product&&record);
 assert.equal(product.name,"YELLOW PEA POWDER");
 assert.equal(product.fssr,"2.4.36");
 assert.equal(record.name,"Yellow Pea Powder");
 assert.equal(record.source_verified_identity.botanical_identity,"Pisum sativum L.");
 assert.equal(record.source_verified_identity.no_foreign_ingredient,true);
 assert.equal(record.source_verified_identity.total_aflatoxins_assigned,false);
 assert.equal(record.source_verified_identity.metal_limits_assigned,false);
});
const start=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",start+30);
assert.ok(start>=0&&end>start);
const ctx={contaminantsDb:db,chapterRuleDbs:[chapter],ruleDbStandards:db=>db.standards||[],
 exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
 normIngredient:v=>String(v||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),isVerifiedFermentedMilkProduct:()=>false};
vm.runInNewContext(html.slice(start,end),ctx);
const run=p=>Array.from(ctx.productBaselineContaminantRules(p)).filter(x=>String(x.source_basis||"").includes("exact Yellow Pea Powder"));
test("Exact source checks show B1 10 µg/kg and do not infer other contaminants",()=>{
 assert.deepEqual(run(product).map(x=>[x.contaminant,x.limit,x.unit]),[["Aflatoxin B1",10,"µg/kg"]]);
 assert.equal(run({...product,name:"Pea protein isolate"}).length,0);
 assert.equal(run({...product,id:"04-04-2-pea-paste"}).length,0);
 assert.equal(run({...product,fssr:"2.4.6"}).length,0);
 const g=db.crop_contaminants;
 assert.equal(g.aflatoxin_b1.rules.find(x=>x.article==="Pulses").limit,10);
 assert.equal(g.aflatoxin_b1.rules.find(x=>x.article==="Food product containing any of the above mentioned food articles").limit,10);
 assert.equal(g.total_aflatoxins.rules.find(x=>x.article==="Pulses").limit,15);
 assert.equal(g.total_aflatoxins.rules.find(x=>x.article==="Food product containing any of the above mentioned food articles").limit,20);
});
test("Source mutation, missing chapter, and wrong version fail closed",()=>{
 const original=ctx.contaminantsDb;
 for(const change of [
  d=>{d.crop_contaminants.aflatoxin_b1.rules.find(x=>x.article==="Pulses").limit=11},
  d=>{d.crop_contaminants.aflatoxin_b1.unit="mg/kg"},
  d=>{d.source_version="Version VIII"}
 ]){
  const edited=structuredClone(db);change(edited);ctx.contaminantsDb=edited;
  assert.equal(run(product).length,0);
 }
 ctx.contaminantsDb=original;ctx.chapterRuleDbs=[];
 assert.equal(run(product).length,0);
 const mutated=structuredClone(chapter);
 mutated.standards.find(x=>x.key==="2.4.36").source_verified_identity.botanical_identity="other";
 ctx.chapterRuleDbs=[mutated];assert.equal(run(product).length,0);
 ctx.chapterRuleDbs=[chapter];assert.equal(run(product).length,1);
});
test("Audit records B1 partial evidence and withholds future pulse-flour metal inheritance",()=>{
 assert.match(audit,/fssai_v9_exact_yellow_pea_powder_b1_partial_evidence/);
 assert.match(audit,/exact_yellow_pea_powder_b1:exactYellowPeaPowderB1Evidence/);
 assert.match(audit,/auto_assign_pulse_flour_metals:false/);
 assert.match(audit,/no_complete_contaminant_assessment:true/);
});
