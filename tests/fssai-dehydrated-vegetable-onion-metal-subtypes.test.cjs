#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const base="fssai-product-helper-preview-01/data/";
const read=f=>JSON.parse(fs.readFileSync(path.join(root,base+f),"utf8"));
const db=read("rules/contaminants-v9-core.json");
const chapter=read("rules/chapter-2-3-fruit-vegetable-v1.json");
const products=read("standard-search-index-v1.json").products;
const ui=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const id="04-04-2-dehydrated-vegetables",p=products.find(z=>z.id===id);
const cfg=db.product_subtype_conditional_metal_rules_v9.filter(x=>x.catalog_id===id);
const norm=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();

test("Three conditional limits match actual grouped FSSAI Version IX source articles, without implying complete compliance",()=>{
 assert.ok(p);
 assert.equal(p.name,"Dehydrated Vegetables");
 assert.equal(p.fssr,"2.3.36");
 assert.equal(chapter.standards.find(x=>x.key==="2.3.36").name,p.name);
 assert.equal(cfg.length,3);
 const nonOnion=cfg.filter(x=>x.subtype==="Dehydrated vegetables other than onions");
 const onion=cfg.filter(x=>x.subtype==="Dehydrated onions");
 assert.equal(nonOnion.length,1);
 assert.deepEqual(nonOnion.map(x=>[x.contaminant,x.limit,x.unit]),[["Lead",5,"mg/kg"]]);
 assert.equal(onion.length,2);
 assert.deepEqual(onion.map(x=>[x.contaminant,x.limit,x.unit]).sort((a,b)=>a[0].localeCompare(b[0])),
   [["Arsenic",2,"mg/kg"],["Lead",10,"mg/kg"]]);
 assert.equal(onion.find(x=>x.contaminant==="Lead").source_condition,"On dry matter basis.");
 for(const row of cfg){
   assert.equal(row.auto_apply,false);
   assert.equal(row.requires_input,"product.exact_subtype");
   assert.equal(row.official_source_url,db.official_sources[0].url);
   const evidence=db.metal_article_rules_v9[row.contaminant].filter(x=>x.article===row.article);
   assert.equal(evidence.length,1);
   assert.equal(evidence[0].row_type,"exact");
   assert.equal(row.limit,evidence[0].limit);
   assert.equal(row.unit,evidence[0].unit);
   assert.equal(row.source_condition,evidence[0].condition);
 }
});

test("Confirmed dehydrated-onion subtype shows BOTH Lead and Arsenic, never a substituted non-onion rule",()=>{
 const at=ui.indexOf("function metalSubtypeRulesForProduct(p){");
 const end=ui.indexOf("function renderMetalSubtypeStatus(p){",at);
 assert.ok(at>=0&&end>at);
 assert.ok(ui.includes("const metalSubtypeRules=selectedMetalSubtypeRules(p);"));
 assert.ok(ui.includes("...metalSubtypeRules"));
 const sel={value:"",dataset:{catalogId:id}};
 const ctx={contaminantsDb:db,standardSearchIndexDb:{products},normIngredient:norm,
   document:{getElementById:()=>sel},esc:String};
 vm.runInNewContext(ui.slice(at,end),ctx);
 const got=()=>Array.from(ctx.selectedMetalSubtypeRules(p));
 assert.equal(got().length,0,"No automatic limits from generic product name");
 sel.value="Dehydrated onions";
 assert.deepEqual(got().map(x=>x.contaminant).sort(),["Arsenic","Lead"]);
 assert.equal(ctx.selectedMetalSubtypeRule(p),null,"Single-row accessor must not mask a second applicable metal");
 sel.value="Dehydrated vegetables other than onions";
 assert.deepEqual(got().map(x=>[x.contaminant,x.limit]),[["Lead",5]]);
 sel.value="Dehydrated onion-containing mixed vegetables";
 assert.equal(got().length,0,"Mixed/uncertain onion products need further review");
 sel.value="Dehydrated onions";
 sel.dataset.catalogId="04-04-2-frozen-vegetables";
 assert.equal(got().length,0,"Stale dropdown from a different product cannot leak");
 sel.dataset.catalogId=id;
 const tampered=structuredClone(db);
 tampered.metal_article_rules_v9.Arsenic.find(x=>x.article==="Dehydrated onions, edible gelatin, liquid pectin").limit=20;
 ctx.contaminantsDb=tampered;
 assert.equal(got().length,0,"Tampering with ONE source must withhold the entire 2-metal selection");
 ctx.contaminantsDb=db;
 const changedBasis=structuredClone(db);
 changedBasis.metal_article_rules_v9.Lead.find(x=>x.article.startsWith("Dehydrated onions, dried herbs")).condition="as consumed";
 ctx.contaminantsDb=changedBasis;
 assert.equal(got().length,0,"Loss of Lead dry-matter basis must fail closed");
 ctx.contaminantsDb=db;
 assert.equal(got().length,2);
});
