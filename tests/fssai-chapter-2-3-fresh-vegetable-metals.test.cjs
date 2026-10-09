"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const d=JSON.parse(fs.readFileSync(path.join(root,"data/rules/contaminants-v9-core.json"),"utf8"));
const products=JSON.parse(fs.readFileSync(path.join(root,"data/standard-search-index-v1.json"),"utf8")).products;
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const at=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",at+25);
assert.ok(at>=0&&end>at);
const c=vm.createContext({contaminantsDb:d,chapterRuleDbs:[],ruleDbStandards:()=>[],exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),isVerifiedFermentedMilkProduct:()=>false});
vm.runInContext(html.slice(at,end),c);
const assess=p=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",c)).filter(x=>x.source_basis?.includes("exact FoSCoS fresh vegetable grouped metal")).map(x=>[x.contaminant,x.limit,x.unit]);
const r=d.chapter_2_3_fresh_vegetables_exact_metal_v9;
test("three exact fresh vegetable identities receive only source-pinned grouped Chromium and Nickel",()=>{
 assert.equal(r.identities.length,3);
 for(const x of r.identities){
   const p=products.find(z=>z.id===x.catalog_id);assert.ok(p);assert.equal(p.name,x.product_name);assert.equal(p.fcs,x.fcs);
   assert.deepEqual(assess(p),[["Chromium",1,"mg/kg"],["Nickel",1,"mg/kg"]]);
 }
});
test("source drift or alternate food category never auto-inherits grouped vegetable values",()=>{
 const p=products.find(x=>x.id===r.identities[0].catalog_id);assert.ok(p);
 assert.deepEqual(assess({...p,fcs:"04.1.1"}),[]);
 assert.deepEqual(assess({...p,name:"Canned Fruit"}),[]);
 for(const wrong of ["04-04-2-dried-fungi","04-04-1-untreated-fresh-fruit"]){
  const x=products.find(z=>z.id===wrong);if(x)assert.deepEqual(assess(x),[]);
 }
 const changed=structuredClone(d);changed.metal_article_rules_v9.Chromium.find(x=>x.article==="Vegetables").limit=99;
 c.contaminantsDb=changed;assert.deepEqual(assess(p),[["Nickel",1,"mg/kg"]]);c.contaminantsDb=d;
});