"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01"),db=JSON.parse(fs.readFileSync(path.join(root,"data/rules/contaminants-v9-core.json"),"utf8")),ps=JSON.parse(fs.readFileSync(path.join(root,"data/standard-search-index-v1.json"),"utf8")).products;
const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),start=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",start+25);assert.ok(start>=0&&end>start);
const ctx=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),isVerifiedFermentedMilkProduct:()=>false});vm.runInContext(html.slice(start,end),ctx);
const run=p=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",ctx)).filter(x=>/verified (hydrogenated\/interesterified oil identity|edible seed oil article)/.test(x.source_basis||"")).map(x=>[x.contaminant,x.limit,x.unit]);
const f=db.chapter_2_2_verified_oil_metal_articles_v9;
test("Version IX nickel article preserves even repeated original FSSAI text without silent simplification",()=>{
 assert.equal(f.hydrogenated_interesterified_nickel.article,"All hydrogenated, partially hydrogenated, interesterified vegetable oils and fats such as vanaspati, table margarine, bakery and industrial margarine, bakery shortening, fat spread and partially hydrogenated margarine, bakery shortening, fat spread and partially hydrogenated soyabean oil");
 assert.equal(db.metal_article_rules_v9.Nickel.find(x=>x.article.startsWith("All hydrogenated, partially hydrogenated"))?.article,f.hydrogenated_interesterified_nickel.article);
});
test("eight exact hydrogenated/interesterified FSSR products get source-pinned Nickel 1.5 mg/kg",()=>{
 assert.equal(f.hydrogenated_interesterified_nickel.verified_identities.length,8);
 for(const x of f.hydrogenated_interesterified_nickel.verified_identities){
   const p=ps.find(z=>z.id===x.catalog_id);assert.ok(p);assert.equal(p.name,x.product_name);assert.equal(p.fssr,x.fssr);
   assert.deepEqual(run(p),[["Nickel",1.5,"mg/kg"]],p.name);
 }
});
test("three exact edible named seed oils get source-pinned Lead and Arsenic 0.1 mg/kg",()=>{
 assert.equal(f.named_edible_seed_oils.verified_identities.length,3);
 for(const x of f.named_edible_seed_oils.verified_identities){
   const p=ps.find(z=>z.id===x.catalog_id);assert.ok(p);
   assert.deepEqual(run(p),[["Lead",0.1,"mg/kg"],["Arsenic",0.1,"mg/kg"]],p.name);
 }
});
test("non-equivalent oils and variant mutation never inherit",()=>{
 for(const id of f.excluded_nearby_catalog_ids){const p=ps.find(x=>x.id===id);assert.ok(p,id);assert.deepEqual(run(p),[],p.name);}
 const p=ps.find(x=>x.id==="02-02-1-vanaspati");
 assert.deepEqual(run({...p,fssr:"2.2.1999"}),[]);
 const tampered=structuredClone(db);tampered.metal_article_rules_v9.Nickel.find(x=>x.article===f.hydrogenated_interesterified_nickel.article).limit=9;ctx.contaminantsDb=tampered;assert.deepEqual(run(p),[]);ctx.contaminantsDb=db;
});
