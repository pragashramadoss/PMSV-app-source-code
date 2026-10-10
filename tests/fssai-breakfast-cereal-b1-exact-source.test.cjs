"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const index=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-4-cereals-v1.json");
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const audit=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const p=index.find(x=>x.id==="06-06-3-breakfast-cereal");
const at=html.indexOf("function productBaselineContaminantRules(p){");
const end=html.indexOf("\nfunction ",at+25);assert.ok(at>=0&&end>at);
const ctx=vm.createContext({contaminantsDb:db,chapterRuleDbs:[chapter],
 ruleDbStandards:d=>d.standards||[],
 exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
 normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
 isVerifiedFermentedMilkProduct:()=>false});
vm.runInContext(html.slice(at,end),ctx);
const run=food=>Array.from(ctx.productBaselineContaminantRules(food)).filter(r=>
 String(r.source_basis||"").includes("exact FSSR 2.4.35 Breakfast Cereal product"));
test("FSSAI 2.4.35 verified breakfast cereal identity requires grain basis",()=>{
 assert.ok(p);assert.equal(p.fssr,"2.4.35");assert.equal(p.name,"Breakfast Cereal");
 const standard=chapter.standards.find(x=>x.key==="2.4.35");
 const proof=standard.official_finished_cereal_identity_source_v1;
 assert.equal(proof.clause,p.fssr);assert.equal(proof.grain_basis_required,true);
 assert.equal(proof.exact_finished_product_identity,true);
 assert.equal(proof.complete_contaminant_coverage_verified,false);
 assert.equal(proof.source_version,"Version 4 (07.05.2025)");
 assert.ok(chapter.official_sources.some(x=>x.url===proof.official_source_url));
 assert.ok(standard.ingredient_rules.some(x=>/Cereals\/pseudocereals\/grains taken together must appear as the first ingredient/i.test(x)));
});
test("Breakfast cereal B1 has exact Version IX limit 10 µg/kg in both source articles, not Total Aflatoxins",()=>{
 const b1=db.crop_contaminants.aflatoxin_b1,ta=db.crop_contaminants.total_aflatoxins;
 const articles=["Cereal and cereal products","Food product containing any of the above mentioned food articles"];
 for(const article of articles)assert.equal(b1.rules.filter(x=>x.article===article&&Number(x.limit)===10).length,1);
 assert.equal(ta.rules.find(x=>x.article===articles[0]).limit,15);
 assert.equal(ta.rules.find(x=>x.article===articles[1]).limit,20);
 assert.deepEqual(run(p).map(x=>[x.contaminant,x.limit,x.unit]),[["Aflatoxin B1",10,"µg/kg"]]);
 for(const wrong of [
  {...p,id:"06-06-3-fruit-vegetable-cereal-flakes"},
  {...p,name:"Oat Products"},{...p,fssr:"2.4.12"},
  index.find(x=>x.id==="07-07-2-biscuit")])
  assert.equal(run(wrong).length,0,"Unverified identity must not inherit Breakfast Cereal rule");
});
test("Wrong FSSAI source version/limit/unit or missing legal product definition withholds the numeric limit",()=>{
 const original=ctx.contaminantsDb;
 for(const mutate of [
  d=>{d.source_version="Version VIII"},
  d=>{d.crop_contaminants.aflatoxin_b1.rules.find(x=>x.article==="Cereal and cereal products").limit=12},
  d=>{d.crop_contaminants.aflatoxin_b1.unit="mg/kg"},
  d=>{d.crop_contaminants.aflatoxin_b1.rules=d.crop_contaminants.aflatoxin_b1.rules.filter(x=>x.article!=="Food product containing any of the above mentioned food articles")}
 ]){
  const altered=structuredClone(db);mutate(altered);ctx.contaminantsDb=altered;
  assert.equal(run(p).length,0);
 }
 ctx.contaminantsDb=original;ctx.chapterRuleDbs=[];
 assert.equal(run(p).length,0,"Missing chapter rule must fail closed");
 const altered=structuredClone(chapter);
 altered.standards.find(x=>x.key==="2.4.35").official_finished_cereal_identity_source_v1.grain_basis_required=false;
 ctx.chapterRuleDbs=[altered];assert.equal(run(p).length,0);
 ctx.chapterRuleDbs=[chapter];assert.equal(run(p).length,1);
});
test("Readiness audit classifies breakfast cereal B1 as partial only",()=>{
 assert.match(audit,/official_v9_exact_breakfast_cereal_composite_b1_partial/);
 assert.match(audit,/exact_breakfast_cereal_composite_b1_partial:exactBreakfastCerealB1Evidence/);
 assert.match(audit,/total_aflatoxins_auto_assigned:false/);
 assert.match(audit,/complete_contaminant_compliance:false/);
});
