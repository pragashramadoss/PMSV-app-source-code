#!/usr/bin/env node
"use strict";
/* Exact official tomato juice Lead article. Partial contaminant evidence only. */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,base,p),"utf8"));
const db=read("data/rules/contaminants-v9-core.json");
const catalogue=read("data/standard-search-index-v1.json").products;
const chapter=read("data/rules/chapter-2-3-fruit-vegetable-v1.json");
const ui=fs.readFileSync(path.join(root,base,"index.html"),"utf8");
const id="tomato-juice",product=catalogue.find(p=>p.id===id);
const article="Fruit and vegetable juice (including tomato juice, but not including lime juice and lemon juice)";
const sourceUrl="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
const chapterUrl="https://fssai.gov.in/upload/uploadfiles/files/Chapter%202_3%20%28Fruit%20%26%20Vegetable%20products%29.pdf";
const chapterOfficialUrl="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3%20%28Fruit%20%26%20Vegetable%20products%29.pdf";
const aliases=db.explicit_metal_alias_mappings_v9.filter(x=>x.product_id===id);
const profile=db.profiles.find(x=>x.id==="alias-metal-tomato-juice");
const origin=db.metal_article_rules_v9.Lead.find(x=>x.article===article);
const normIngredient=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const begin=ui.indexOf("function sourcePinnedVersionIxProfileMetalRule(p,rule){");
const end=ui.indexOf("function productBaselineContaminantRules(p){",begin);
assert.ok(begin>0&&end>begin);
const ctx={contaminantsDb:db,normIngredient};
vm.runInNewContext(ui.slice(begin,end),ctx);
const check=ctx.sourcePinnedVersionIxProfileMetalRule;

test("Thermally processed tomato juice 2.3.8 has source-backed Lead 1 mg/kg only for its named article",()=>{
 assert.equal(product.name,"Thermally Processed Tomato Juice");
 assert.equal(product.fssr,"2.3.8");
 assert.ok((chapter.official_sources||[]).some(x=>x.url===chapterOfficialUrl));
 assert.ok(chapter.standards.some(x=>x.key==="2.3.8"));
 assert.ok(db.official_sources.some(x=>x.url===sourceUrl));
 assert.equal(origin.row_type,"exact");
 assert.equal(origin.limit,1);
 assert.equal(origin.unit,"mg/kg");
 assert.equal(aliases.length,1);
 const basis=aliases[0].verified_alias_basis.find(x=>x.metal==="Lead");
 assert.ok(basis);
 assert.equal(basis.article,article);
 assert.equal(basis.limit,origin.limit);
 assert.equal(basis.unit,origin.unit);
 assert.equal(basis.source_contaminant_url,sourceUrl);
 assert.equal(basis.source_standard_url,chapterUrl);
 const rule=profile.rules.find(x=>x.contaminant==="Lead");
 assert.ok(rule);
 assert.equal(rule.article,article);
 assert.equal(rule.limit,1);
 assert.equal(rule.unit,"mg/kg");
 assert.equal(check(product,rule),true);
 assert.equal(basis.complete_contaminant_review,false);
});
test("Other finished beverages, industrial ingredients and tomato puree do not inherit tomato juice Lead",()=>{
 const rule=profile.rules.find(x=>x.contaminant==="Lead");
 for(const other of ["fruit-nectars","fruit-drink-rts","fruit-juices","concentrated-fruit-juice-industrial",
   "04-04-2-thermally-processed-tomato-puree-and-paste","vegetable-juices"]){
  const p=catalogue.find(x=>x.id===other);
  assert.ok(p,"Missing negative-control identity "+other);
  assert.equal(check(p,rule),false,"Inappropriate 1 mg/kg inheritance: "+other);
 }
});
test("Copper 5 mg/kg and Arsenic 0.2 mg/kg use separately verified tomato-juice articles",()=>{
 const article="Juice of orange, grape, apple, tomato, pineapple and lemon";
 const group=aliases[0];
 for(const [metal,value] of [["Copper",5],["Arsenic",0.2]]){
  const official=db.metal_article_rules_v9[metal].filter(x=>
    x.article===article&&x.row_type==="exact"&&x.unit==="mg/kg");
  assert.equal(official.length,1);
  assert.equal(official[0].limit,value);
  const basis=group.verified_alias_basis.filter(x=>x.metal===metal);
  assert.equal(basis.length,1);
  assert.equal(basis[0].article,article);
  assert.equal(basis[0].limit,value);
  assert.equal(basis[0].unit,"mg/kg");
  const rule=profile.rules.find(x=>x.contaminant===metal);
  assert.ok(rule);
  assert.equal(check(product,rule),true);
  for(const other of ["fruit-nectars","fruit-juices","fruit-drink-rts",
      "04-04-2-thermally-processed-tomato-puree-and-paste"]){
    assert.equal(check(catalogue.find(x=>x.id===other),rule),false,
      "No tomato juice "+metal+" inheritance for "+other);
  }
  assert.equal(check(product,{...rule,limit:value+1}),false);
  assert.equal(check(product,{...rule,unit:"mg/L"}),false);
  assert.equal(check(product,{...rule,article:"Foods not specified"}),false);
  const tampered=JSON.parse(JSON.stringify(db));
  tampered.metal_article_rules_v9[metal]=tampered.metal_article_rules_v9[metal].filter(x=>x.article!==article);
  ctx.contaminantsDb=tampered;
  assert.equal(check(product,rule),false);
  ctx.contaminantsDb=db;
 }
});

test("Tampered article, value, units or missing official metal source are rejected",()=>{
 const rule=profile.rules.find(x=>x.contaminant==="Lead");
 assert.equal(check(product,{...rule,limit:0.05}),false);
 assert.equal(check(product,{...rule,unit:"mg/L"}),false);
 assert.equal(check(product,{...rule,article:"Fruit Juices (including nectars; ready to drink)"}),false);
 const mutated=JSON.parse(JSON.stringify(db));
 mutated.metal_article_rules_v9.Lead=mutated.metal_article_rules_v9.Lead.filter(x=>x.article!==article);
 ctx.contaminantsDb=mutated;
 assert.equal(check(product,rule),false);
 ctx.contaminantsDb=db;
});
