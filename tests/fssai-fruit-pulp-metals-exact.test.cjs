#!/usr/bin/env node
"use strict";
/** FSSAI CTR Version IX Section 2.1 source-pinned fruit pulp metals; partial only. */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=x=>JSON.parse(fs.readFileSync(path.join(root,base,x),"utf8"));
const db=read("data/rules/contaminants-v9-core.json");
const index=read("data/standard-search-index-v1.json").products;
const chapter=read("data/rules/chapter-2-3-fruit-vegetable-v1.json");
const ui=fs.readFileSync(path.join(root,base,"index.html"),"utf8");
const normIngredient=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const ctx={contaminantsDb:db,normIngredient};
const a=ui.indexOf("function sourcePinnedVersionIxProfileMetalRule(p,rule){");
const b=ui.indexOf("function productBaselineContaminantRules(p){",a);
assert.ok(a>=0&&b>a);
vm.runInNewContext(ui.slice(a,b),ctx);
const check=ctx.sourcePinnedVersionIxProfileMetalRule;
const article="Pulp and pulp products of any fruit";
const ids=[
 ["04-04-1-thermally-processed-mango-pulp-puree-and-sweetened-mango-pulp-puree","2.3.11"],
 ["04-04-1-thermally-processed-fruit-pulp-puree-and-sweetened-fruit-pulp-puree-other-than-man","2.3.12"]
];
const limitPairs=[["Copper",5],["Arsenic",0.2]];
const official="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
const standards="https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_3%20%28Fruit%20%26%20Vegetable%20products%29.pdf";

test("Pulp/puree identity and official article are source-backed and separately chapter-mapped",()=>{
 assert.ok(db.official_sources.some(s=>s.url===official));
 assert.ok(chapter.official_sources.some(s=>s.url.replace("://www.","://")===standards));
 for(const [id,key] of ids){
  const p=index.find(x=>x.id===id);
  assert.ok(p);
  assert.equal(p.fssr,key);
  assert.equal(p.rule_key,key);
  assert.ok(chapter.standards.some(x=>x.key===key));
  const alias=db.explicit_metal_alias_mappings_v9.filter(x=>x.product_id===id);
  const profile=db.profiles.filter(x=>x.catalog_ids?.includes(id));
  assert.equal(alias.length,1);
  assert.equal(profile.length,1);
  assert.ok(alias[0].verified_alias_basis.some(x=>x.metal==="Tin"&&x.article===article));
  for(const [metal,value] of limitPairs){
   const officialRows=db.metal_article_rules_v9[metal].filter(x=>x.article===article&&x.row_type==="exact");
   assert.equal(officialRows.length,1);
   assert.equal(officialRows[0].limit,value);
   assert.equal(officialRows[0].unit,"mg/kg");
   const row=alias[0].verified_alias_basis.filter(x=>x.metal===metal);
   assert.equal(row.length,1);
   assert.equal(row[0].limit,value);
   assert.equal(row[0].source_contaminant_url,official);
   assert.equal(row[0].source_standard_url,standards);
   assert.equal(row[0].complete_contaminant_review,false);
   const r=profile[0].rules.find(x=>x.contaminant===metal);
   assert.ok(r);
   assert.equal(check(p,r),true);
  }
 }
});

test("Neither juice, tomato puree nor industrial vegetable puree inherits the fruit-pulp limit",()=>{
 const positive=db.profiles.find(x=>x.catalog_ids?.includes(ids[0][0]));
 for(const [metal] of limitPairs){
  const rule=positive.rules.find(x=>x.contaminant===metal);
  for(const id of ["fruit-juices","fruit-nectars","fruit-drink-rts","tomato-juice",
     "04-04-2-thermally-processed-tomato-puree-and-paste",
     "concentrated-vegetable-pulp-puree"]){
   const other=index.find(x=>x.id===id);
   assert.ok(other,"Missing negative control "+id);
   assert.equal(check(other,rule),false,"Wrong identity inherited "+metal+": "+id);
  }
 }
});
test("Altered official numbers, article, units or missing source do not pass the UI gate",()=>{
 const product=index.find(x=>x.id===ids[0][0]);
 const profile=db.profiles.find(x=>x.catalog_ids?.includes(product.id));
 for(const [metal] of limitPairs){
  const rule=profile.rules.find(x=>x.contaminant===metal);
  assert.equal(check(product,{...rule,limit:rule.limit+1}),false);
  assert.equal(check(product,{...rule,unit:"mg/L"}),false);
  assert.equal(check(product,{...rule,article:"Fruit juice"}),false);
  const altered=JSON.parse(JSON.stringify(db));
  altered.metal_article_rules_v9[metal]=altered.metal_article_rules_v9[metal].filter(x=>x.article!==article);
  ctx.contaminantsDb=altered;
  assert.equal(check(product,rule),false);
  ctx.contaminantsDb=db;
 }
});
