"use strict";
const {test}=require("node:test"), assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const index=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-4-cereals-v1.json");
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const helper=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const audit=fs.readFileSync(path.join(root,"scripts/audit-fssai-product-readiness.cjs"),"utf8");
const bread=index.find(x=>x.id==="07-07-1-bread-and-bread-type-products");
const at=helper.indexOf("function productBaselineContaminantRules(p){"),end=helper.indexOf("\nfunction ",at+30);
assert.ok(at>0&&end>at,"Source-gated baseline function missing");
const ctx=vm.createContext({contaminantsDb:db,chapterRuleDbs:[chapter],ruleDbStandards:d=>d.standards||[],
 exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
 normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
 isVerifiedFermentedMilkProduct:()=>false});
vm.runInContext(helper.slice(at,end),ctx);
const run=p=>Array.from(ctx.productBaselineContaminantRules(p)).filter(x=>String(x.source_basis||"").includes("exact Bread and Bread-Type Products FSSR"));
test("Official Chapter 2.4 exact bread definition requires wheat atta and/or maida",()=>{
 assert.equal(bread.name,"Bread and Bread-Type Products");
 assert.equal(bread.fssr,"2.4.15(2)");
 const standard=chapter.standards.find(x=>x.key===bread.fssr),identity=standard.official_finished_cereal_identity_source_v1;
 assert.equal(identity.clause,bread.fssr);
 assert.equal(identity.wheat_flour_mandatory,true);
 assert.equal(identity.other_flour_substitution_alone_qualifies,false);
 assert.equal(identity.source_version,"Version 4 (07.05.2025)");
 assert.ok(chapter.official_sources.some(x=>x.url===identity.official_source_url));
 assert.equal(identity.full_contaminant_coverage_verified,false);
});
test("Bread B1 10 µg/kg requires BOTH current cereal/composite source rows and never assigns Total Aflatoxins",()=>{
 const g=db.crop_contaminants.aflatoxin_b1,ta=db.crop_contaminants.total_aflatoxins;
 assert.equal(g.unit,"µg/kg");
 for(const article of ["Cereal and cereal products","Food product containing any of the above mentioned food articles"])
   assert.equal(g.rules.filter(x=>x.article===article&&Number(x.limit)===10).length,1);
 assert.equal(ta.rules.find(x=>x.article==="Cereal and cereal products").limit,15);
 assert.equal(ta.rules.find(x=>x.article==="Food product containing any of the above mentioned food articles").limit,20);
 assert.deepEqual(run(bread).map(x=>[x.contaminant,x.limit,x.unit]),[["Aflatoxin B1",10,"µg/kg"]]);
 for(const wrong of [
  {...bread,id:"07-07-2-biscuit"},{...bread,name:"Biscuit"},
  {...bread,fssr:"2.4.15(1)"},index.find(x=>x.id==="06-06-3-breakfast-cereal")])
   assert.equal(run(wrong).length,0,"Do not share the precise bread evidence with other products");
});
test("Tampered source version, numeric value, article, units, or missing chapter fail closed",()=>{
 const original=ctx.contaminantsDb;
 const modes=[
  d=>{d.source_version="Version VIII"},
  d=>{d.crop_contaminants.aflatoxin_b1.rules.find(x=>x.article==="Cereal and cereal products").limit=11},
  d=>{d.crop_contaminants.aflatoxin_b1.rules=d.crop_contaminants.aflatoxin_b1.rules.filter(x=>x.article!=="Food product containing any of the above mentioned food articles")},
  d=>{d.crop_contaminants.aflatoxin_b1.unit="mg/kg"}
 ];
 for(const mutate of modes){const changed=structuredClone(db);mutate(changed);ctx.contaminantsDb=changed;assert.equal(run(bread).length,0)}
 ctx.contaminantsDb=original;
 ctx.chapterRuleDbs=[];
 assert.equal(run(bread).length,0);
 ctx.chapterRuleDbs=[chapter];
 const changed=structuredClone(chapter);
 changed.standards.find(x=>x.key==="2.4.15(2)").official_finished_cereal_identity_source_v1.wheat_flour_mandatory=false;
 ctx.chapterRuleDbs=[changed];assert.equal(run(bread).length,0);
 ctx.chapterRuleDbs=[chapter];assert.equal(run(bread).length,1);
});
test("Readiness audit records partial bread B1 only, with independent residue and total-aflatoxin review",()=>{
 assert.match(audit,/official_v9_exact_bread_wheat_cereal_composite_b1_partial/);
 assert.match(audit,/exact_bread_cereal_composite_b1_partial:exactBreadB1Evidence/);
 assert.match(audit,/total_aflatoxins_auto_assigned:false/);
 assert.match(audit,/complete_contaminant_compliance:false/);
});
