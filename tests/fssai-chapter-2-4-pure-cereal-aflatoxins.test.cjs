"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01"),db=JSON.parse(fs.readFileSync(path.join(root,"data/rules/contaminants-v9-core.json"),"utf8")),ps=JSON.parse(fs.readFileSync(path.join(root,"data/standard-search-index-v1.json"),"utf8")).products;
const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),start=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",start+25);assert.ok(start>=0&&end>start);
const c=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),isVerifiedFermentedMilkProduct:()=>false});vm.runInContext(html.slice(start,end),c);
const run=p=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",c)).filter(x=>x.source_basis?.includes("verified exact cereal product")).map(x=>[x.contaminant,x.limit,x.unit]);
const family=db.chapter_2_4_verified_pure_cereal_products_aflatoxin_v9;
test("FSSAI grouped Cereal and cereal products: 15 exact pure cereal identities only",()=>{
 assert.equal(family.verified_product_identities.length,15);assert.deepEqual(family.rules.map(x=>x.limit),[15,10]);
 for(const x of family.verified_product_identities){const p=ps.find(z=>z.id===x.catalog_id);assert.ok(p);assert.equal(p.name,x.product_name);assert.equal(p.fssr,x.fssr);assert.deepEqual(run(p),[["Total Aflatoxins",15,"µg/kg"],["Aflatoxin B1",10,"µg/kg"]],p.name);}
});
test("pulse, soy, cassava and composite flour forms cannot inherit cereal article",()=>{
 for(const id of family.excluded_non_equivalent_ids){const p=ps.find(x=>x.id===id);assert.ok(p,id);assert.deepEqual(run(p),[],p.name);}
 const p=ps.find(x=>x.id==="06-06-2-jowar-flour-sorghum-flour");assert.ok(p);
 assert.deepEqual(run({...p,name:"Jowar with soy flour"}),[]);
 assert.deepEqual(run({...p,fssr:"2.4.999"}),[]);
 const tampered=structuredClone(db);tampered.crop_contaminants.total_aflatoxins.rules.find(x=>x.article==="Cereal and cereal products").limit=99;c.contaminantsDb=tampered;
 assert.deepEqual(run(p),[["Aflatoxin B1",10,"µg/kg"]]);c.contaminantsDb=db;
});
