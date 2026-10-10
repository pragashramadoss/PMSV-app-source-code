"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),helper=path.join(root,"fssai-product-helper-preview-01");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const index=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const standards=read("fssai-product-helper-preview-01/data/rules/chapter-2-2-fats-oils-v1.json").standards;
const html=fs.readFileSync(path.join(helper,"index.html"),"utf8");
const route=db.chapter_2_2_solvent_crude_vegetable_oil_lead_v9;
const product=index.find(x=>x.id===route.catalog_id);
const start=html.indexOf("function productBaselineContaminantRules(p){"),end=html.indexOf("\nfunction ",start+25);
assert.ok(start>=0&&end>start);
const ctx=vm.createContext({contaminantsDb:db,chapterRuleDbs:[],ruleDbStandards:()=>[],exactFinishedProductContaminantLock:()=>null,exactRawMeatMetalLock:()=>null,normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),isVerifiedFermentedMilkProduct:()=>false});
vm.runInContext(html.slice(start,end),ctx);
const matches=p=>Array.from(vm.runInContext("productBaselineContaminantRules("+JSON.stringify(p)+")",ctx)).filter(x=>String(x.source_basis||"").includes("verified FSSR 2.2.9 crude vegetable oil identity"));
test("Version IX source and FSSR 2.2.9 exact crude vegetable oil Lead evidence",()=>{
 assert.ok(product);assert.equal(product.name,route.product_name);assert.equal(product.fssr,route.fssr);
 assert.equal(standards.filter(x=>x.key===route.fssr&&x.name===product.name).length,1);
 assert.equal(db.metal_article_rules_v9.Lead.filter(x=>x.article===route.official_article&&x.row_type==="exact"&&x.limit===0.1&&x.unit==="mg/kg").length,1);
 assert.match(route.official_article,/other oils but excluding cocoa butter/);
 assert.deepEqual(matches(product).map(x=>[x.contaminant,x.limit,x.unit]),[["Lead",0.1,"mg/kg"]]);
 assert.equal(route.arsenic_automatic_application,false);assert.equal(route.full_product_compliance_verified,false);
});
test("Crude category never inherits arsenic; mismatched IDs, changed source values or units fail closed",()=>{
 for(const variant of [{...product,name:"Cocoa butter"},{...product,fssr:"2.2.1(16)"},{...product,id:"02-02-2-fat-spread"}])
    assert.deepEqual(matches(variant),[]);
 assert.ok(!matches(product).some(x=>x.contaminant==="Arsenic"));
 const bad=structuredClone(db);bad.metal_article_rules_v9.Lead.find(x=>x.article===route.official_article).limit=0.4;
 ctx.contaminantsDb=bad;assert.deepEqual(matches(product),[]);
 const badUnit=structuredClone(db);badUnit.metal_article_rules_v9.Lead.find(x=>x.article===route.official_article).unit="mg/L";
 ctx.contaminantsDb=badUnit;assert.deepEqual(matches(product),[]);
 ctx.contaminantsDb=db;
});
