#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("data/rules/contaminants-v9-core.json"),ps=read("data/standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const at=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",at+25);
assert.ok(at>=0&&end>at);
const norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const c=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],
 exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
 isVerifiedFermentedMilkProduct:()=>false,normIngredient:norm});
vm.runInContext(html.slice(at,end),c);
const p=ps.find(x=>x.id==="04-04-2-thermally-processed-tomato-puree-and-paste");
assert.ok(p);
const aliasRules=(product=p)=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(product)+")",c))
 .filter(x=>(x.source_basis||"").includes("verified PMSV product/article mapping"))
 .map(x=>[x.contaminant,x.limit,x.unit,x.article]);
test("all explicit alias evidence agrees with the loaded official Version IX exact article and numeric unit",()=>{
 assert.equal(ps.length,533);
 for(const mapping of db.explicit_metal_alias_mappings_v9){
   const identity=ps.find(x=>x.id===mapping.product_id);
   assert.ok(identity,mapping.product_id);
   assert.equal(norm(identity.name),norm(mapping.product_name));
   for(const basis of mapping.verified_alias_basis||[]){
     const matching=(db.metal_article_rules_v9[basis.metal]||[]).filter(row=>norm(row.article)===norm(basis.article)
      &&row.row_type==="exact"&&Number(row.limit)===Number(basis.limit)
      &&String(row.unit).toLowerCase()===String(basis.unit).toLowerCase());
     assert.equal(matching.length,1,mapping.product_id+": "+basis.article);
   }
 }
});
test("verified tomato concentrate carries exactly three mapped official metals",()=>{
 assert.deepEqual(aliasRules().map(x=>x[0]).sort(),["Copper","Lead","Tin"]);
 assert.ok(aliasRules().some(x=>x[0]==="Copper"&&x[1]===100&&x[2]==="mg/kg"));
});
test("missing and changed Version IX article values fail closed with no legacy fallback",()=>{
 for(const change of ["removed","numeric","unit","default"]){
   const clone=structuredClone(db);
   const rows=clone.metal_article_rules_v9.Copper;
   const i=rows.findIndex(x=>x.article==="Tomato puree, paste, powder, and cocktails");
   assert.ok(i>=0);
   if(change==="removed")rows.splice(i,1);
   if(change==="numeric")rows[i].limit=9;
   if(change==="unit")rows[i].unit="mg/L";
   if(change==="default")rows[i].row_type="default";
   c.contaminantsDb=clone;
   assert.equal(aliasRules().some(x=>x[0]==="Copper"),false,change);
 }
 c.contaminantsDb=db;
 assert.equal(aliasRules().some(x=>x[0]==="Copper"),true);
});
test("wrong product title or id cannot borrow verified numeric article aliases",()=>{
 assert.deepEqual(aliasRules({...p,name:"Tomato Ketchup and Tomato Sauce"}),[]);
 assert.deepEqual(aliasRules({...p,id:"12-12-6-tomato-ketchup-and-tomato-sauce"}),[]);
});
