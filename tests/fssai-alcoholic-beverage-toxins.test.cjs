"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const db=JSON.parse(fs.readFileSync(path.join(root,"data/rules/contaminants-v9-core.json"),"utf8"));
const products=JSON.parse(fs.readFileSync(path.join(root,"data/standard-search-index-v1.json"),"utf8")).products;
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const begin=html.indexOf("function productBaselineContaminantRules(p){");
assert.ok(begin>=0);
const end=html.indexOf("\nfunction ",begin+25);assert.ok(end>begin);
const context=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],
 exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,
 normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
 isVerifiedFermentedMilkProduct:()=>false});
vm.runInContext(html.slice(begin,end),context);
function assess(p){return Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",context)).filter(x=>x.source_basis?.includes("exact finished alcoholic beverage category")).map(x=>({name:x.contaminant,limit:x.limit,unit:x.unit}));}
const expected=[{name:"Agaric acid",limit:100,unit:"ppm"},{name:"Hydrocyanic acid",limit:5,unit:"ppm"},{name:"Hypericine",limit:1,unit:"ppm"},{name:"Saffrole",limit:10,unit:"ppm"}];
test("FSSAI Version IX complete grouped alcoholic beverage NOTS article transcribed and pinned to 27 FCS 14.2 finished identities",()=>{
 const family=db.chapter_14_2_verified_alcoholic_beverage_nots_v9;
 assert.equal(family.verified_finished_product_identities.length,27);
 assert.deepEqual(new Set(family.verified_finished_product_identities.map(x=>x.catalog_id)),new Set(products.filter(x=>String(x.fcs||"").startsWith("14.2.")).map(x=>x.id)));
 assert.equal(db.naturally_occurring_toxic_substances.agaric_acid.find(x=>x.article==="Alcoholic beverages")?.limit,100);
 for(const r of family.rules)assert.ok(db.naturally_occurring_toxic_substances[r.key].some(x=>x.article===family.article&&x.limit===r.limit&&x.unit===r.unit));
 for(const row of family.verified_finished_product_identities){
   const product=products.find(x=>x.id===row.catalog_id);assert.ok(product);
   assert.equal(row.product_name,product.name);assert.equal(row.fcs,product.fcs);
   assert.deepEqual(assess(product),expected,product.name);
 }
});
test("nonalcoholic related forms and identity tampering cannot inherit four alcoholic NOTS rows",()=>{
 for(const id of ["non-carbonated-water-based-beverages","barley-water","coffee","coffee-chicory-mixture","carbonated-caffeinated-beverage"]){
   const p=products.find(x=>x.id===id);if(p)assert.deepEqual(assess(p),[],p.name);
 }
 const wine=products.find(x=>x.id==="14-14-2-red-wine");assert.ok(wine);
 assert.deepEqual(assess({...wine,fcs:"14.1.4"}),[],"FCS category drift must fail closed");
 assert.deepEqual(assess({...wine,name:"Red Wine Based Syrup"}),[],"Identity name drift must fail closed");
 const mutated=structuredClone(db);mutated.naturally_occurring_toxic_substances.agaric_acid.find(x=>x.article==="Alcoholic beverages").limit=1000;
 context.contaminantsDb=mutated;
 assert.deepEqual(assess(wine),expected.slice(1),"Agaric source drift must suppress affected rule only");
 mutated.naturally_occurring_toxic_substances.saffrole.find(x=>x.article==="Alcoholic beverages").article="Non-alcoholic beverages";
 assert.deepEqual(assess(wine),expected.slice(1,3),"Saffrole source article drift must fail closed");
 context.contaminantsDb=db;
});
