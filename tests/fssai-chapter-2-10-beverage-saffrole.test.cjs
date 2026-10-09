"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const db=JSON.parse(fs.readFileSync(path.join(root,"data/rules/contaminants-v9-core.json"),"utf8"));
const products=JSON.parse(fs.readFileSync(path.join(root,"data/standard-search-index-v1.json"),"utf8")).products;
const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),begin=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",begin+25);assert.ok(begin>=0&&end>begin);
const ctx=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),isVerifiedFermentedMilkProduct:()=>false});vm.runInContext(html.slice(begin,end),ctx);
const check=p=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",ctx)).filter(x=>x.source_basis?.includes("verified finished Chapter 2.10 nonalcoholic beverage")).map(x=>[x.contaminant,x.limit,x.unit]);
const family=db.chapter_2_10_verified_finished_beverage_saffrole_v9;
test("exact four finished Chapter 2.10 beverage standards receive source-backed saffrole",()=>{
 assert.equal(family.verified_finished_product_identities.length,4);
 for(const x of family.verified_finished_product_identities){const p=products.find(z=>z.id===x.catalog_id);assert.ok(p);assert.equal(p.name,x.product_name);assert.equal(p.fssr,x.fssr);assert.deepEqual(check(p),[["Saffrole",10,"ppm"]],p.name);}
});
test("dry coffee/tea, alcohol, concentrates and changed names never inherit beverage row",()=>{
 for(const id of family.excluded_nearby_catalog_ids){const p=products.find(z=>z.id===id);if(p)assert.deepEqual(check(p),[],p.name);}
 const p=products.find(x=>x.id==="coconut-neera");
 assert.deepEqual(check({...p,name:"Palm Wine / Toddy"}),[]);
 assert.deepEqual(check({...p,fssr:"2.10.111"}),[]);
 const changed=structuredClone(db);changed.naturally_occurring_toxic_substances.saffrole.find(x=>x.article==="Non-alcoholic beverages").limit=99;ctx.contaminantsDb=changed;
 assert.deepEqual(check(p),[]);ctx.contaminantsDb=db;
});
