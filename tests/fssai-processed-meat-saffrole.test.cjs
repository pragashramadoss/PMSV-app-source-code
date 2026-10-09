"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const db=JSON.parse(fs.readFileSync(path.join(root,"data/rules/contaminants-v9-core.json"),"utf8"));
const ps=JSON.parse(fs.readFileSync(path.join(root,"data/standard-search-index-v1.json"),"utf8")).products;
const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),begin=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",begin+25);assert.ok(begin>=0&&end>begin);
const ctx=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),isVerifiedFermentedMilkProduct:()=>false});
vm.runInContext(html.slice(begin,end),ctx);
const run=p=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",ctx)).filter(x=>x.source_basis?.includes("verified finished processed meat")).map(x=>[x.contaminant,x.limit,x.unit,x.article]);
const f=db.chapter_2_5_verified_processed_meat_saffrole_v9,expected=[["Saffrole",10,"ppm",f.official_article]];
test("nineteen exact finished meat identities inherit FSSAI grouped saffrole only",()=>{
 assert.equal(f.verified_finished_product_identities.length,19);assert.equal(f.excluded_related_catalog_ids.length,18);
 for(const m of f.verified_finished_product_identities){const p=ps.find(x=>x.id===m.catalog_id);assert.ok(p);assert.equal(p.name,m.product_name);assert.equal(p.fssr,m.fssr);assert.deepEqual(run(p),expected,p.name);}
});
test("animal casings, raw/frozen meat and egg items fail closed",()=>{
 for(const id of f.excluded_related_catalog_ids){const p=ps.find(x=>x.id===id);assert.ok(p);assert.deepEqual(run(p),[],p.name);}
 const p=ps.find(x=>x.id===f.verified_finished_product_identities[0].catalog_id);
 assert.deepEqual(run({...p,name:"unverified meat component"}),[]);
 assert.deepEqual(run({...p,fssr:"2.5.999"}),[]);
 const copy=structuredClone(db);copy.naturally_occurring_toxic_substances.saffrole.find(x=>x.article===f.official_article).limit=100;
 ctx.contaminantsDb=copy;assert.deepEqual(run(p),[]);ctx.contaminantsDb=db;
});
