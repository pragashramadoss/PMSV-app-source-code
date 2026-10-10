#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const base="fssai-product-helper-preview-01/data/";
const read=x=>JSON.parse(fs.readFileSync(path.join(root,base+x),"utf8"));
const db=read("rules/contaminants-v9-core.json");
const oils=read("rules/chapter-2-2-fats-oils-v1.json");
const index=read("standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const id="02-02-2-fat-spread";
const product=index.find(x=>x.id===id),standard=oils.standards.find(x=>x.key==="2.2.5(3)");
const family=db.chapter_2_2_verified_oil_metal_articles_v9.hydrogenated_interesterified_nickel;
const conditional=db.product_subtype_conditional_metal_rules_v9.filter(x=>x.catalog_id===id&&x.contaminant==="Nickel");
const original=db.metal_article_rules_v9.Nickel.find(x=>x.article===family.article);
test("FSSAI 2.2.5(3) has three Fat spread types, making the CTR vegetable processing qualifier essential",()=>{
 assert.ok(product&&standard);
 assert.equal(product.fssr,"2.2.5(3)");
 assert.equal(standard.name,"Fat Spread");
 assert.ok(standard.types.includes("Milk fat spread"));
 assert.ok(standard.types.includes("Mixed fat spread"));
 assert.ok(standard.types.includes("Vegetable fat spread"));
 assert.ok(original);
 assert.equal(original.row_type,"exact");
 assert.equal(original.limit,1.5);
 assert.equal(original.unit,"mg/kg");
 assert.match(original.article,/hydrogenated, partially hydrogenated, interesterified vegetable oils and fats/);
 assert.equal(family.verified_identities.some(x=>x.catalog_id===id),false);
 assert.equal(conditional.length,1);
 const selected=conditional[0];
 assert.equal(selected.product_name,product.name);
 assert.equal(selected.fssr,product.fssr);
 assert.equal(selected.auto_apply,false);
 assert.equal(selected.requires_input,"product.exact_subtype");
 assert.match(selected.subtype,/Vegetable fat spread made with hydrogenated\/interesterified vegetable fat/);
 assert.match(selected.condition,/Do not apply to unspecified, milk-fat, or mixed-fat spreads/);
 assert.equal(selected.limit,original.limit);
 assert.equal(selected.unit,original.unit);
 assert.equal(selected.article,original.article);
 assert.equal(selected.official_source_url,db.official_sources[0].url);
});

test("Fat spread applies nickel only after exact processing subtype selection and current source match",()=>{
 const at=html.indexOf("function metalSubtypeRulesForProduct(p){");
 const end=html.indexOf("function renderMetalSubtypeStatus(p){",at);
 assert.ok(at>0&&end>at);
 const sel={value:"",dataset:{catalogId:id}};
 const ctx={
  contaminantsDb:db,standardSearchIndexDb:{products:index},
  normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
  document:{getElementById:()=>sel},
  esc:x=>String(x)
 };
 vm.runInNewContext(html.slice(at,end),ctx);
 const get=()=>ctx.selectedMetalSubtypeRule(product);
 assert.equal(get(),null,"Default/no subtype cannot show a numeric Nickel limit");
 sel.value="Milk fat spread";
 assert.equal(get(),null);
 sel.value="Mixed fat spread";
 assert.equal(get(),null);
 sel.value="Vegetable fat spread";
 assert.equal(get(),null,"Generic vegetable-fat type alone does not prove hydrogenation/interesterification");
 sel.value=conditional[0].subtype;
 assert.equal(get()?.limit,1.5,"Explicit confirmed processed vegetable spread and exact source may show Nickel");
 sel.dataset.catalogId="02-02-2-butter";
 assert.equal(get(),null,"Stale selection from another product must fail closed");
 sel.dataset.catalogId=id;
 assert.equal(ctx.selectedMetalSubtypeRule({...product,fssr:"2.2.6(2)"}),null);
 const tampered=structuredClone(db);
 tampered.metal_article_rules_v9.Nickel.find(x=>x.article===original.article).limit=2.5;
 ctx.contaminantsDb=tampered;
 assert.equal(get(),null,"Source numeric mismatch must withhold limit");
 ctx.contaminantsDb=db;
 const wrongUnit=structuredClone(db);
 wrongUnit.product_subtype_conditional_metal_rules_v9.find(x=>x.catalog_id===id&&x.contaminant==="Nickel").unit="mg/L";
 ctx.contaminantsDb=wrongUnit;
 assert.equal(get(),null,"Source unit mismatch must withhold limit");
 ctx.contaminantsDb=db;
 const wrongArticle=structuredClone(db);
 wrongArticle.product_subtype_conditional_metal_rules_v9.find(x=>x.catalog_id===id&&x.contaminant==="Nickel").article="Foods not specified";
 ctx.contaminantsDb=wrongArticle;
 assert.equal(get(),null,"Generic source-article substitution cannot bypass exact guard");
});
