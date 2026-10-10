#!/usr/bin/env node
"use strict";
/* Source-locked Version IX fruit nectar Lead mapping. Partial evidence only. */
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,base,p),"utf8"));
const db=read("data/rules/contaminants-v9-core.json"),idx=read("data/standard-search-index-v1.json").products;
const chapter=read("data/rules/chapter-2-3-fruit-vegetable-v1.json");
const html=fs.readFileSync(path.join(root,base,"index.html"),"utf8");
const id="fruit-nectars",article="Fruit Juices (including nectars; ready to drink)";
const product=idx.find(p=>p.id===id),profile=db.profiles.find(x=>x.id==="exact-fruit-nectar-ready-to-drink-lead-v9");
const start=html.indexOf("function sourcePinnedVersionIxProfileMetalRule(p,rule){");
const end=html.indexOf("function productBaselineContaminantRules(p){",start);
assert.ok(start>=0&&end>start,"Version IX source gate missing");
const ctx={contaminantsDb:db,normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()};
vm.runInNewContext(html.slice(start,end),ctx);
const gate=ctx.sourcePinnedVersionIxProfileMetalRule;
test("Fruit nectar is exact finished ready-to-drink FSSAI 2.3.9 identity with Lead 0.05 mg/kg",()=>{
 assert.ok(product&&profile);assert.equal(product.name,"Thermally Processed Fruit Nectars");
 assert.equal(product.fssr,"2.3.9");assert.deepEqual(profile.catalog_ids,[id]);
 assert.deepEqual(profile.match_fssr,["2.3.9"]);
 assert.equal(chapter.standards.find(x=>x.key===product.fssr)?.name,product.name);
 assert.ok(chapter.official_sources.some(x=>/^https:\/\/(?:www\.)?fssai\.gov\.in\//.test(x.url)));
 assert.equal(profile.rules.length,1);
 const row=profile.rules[0];
 assert.equal(row.contaminant,"Lead");assert.equal(row.article,article);
 assert.equal(row.limit,0.05);assert.equal(row.unit,"mg/kg");
 assert.match(row.source_basis,/Section 2\.1 .* Version IX/);
 const matched=db.metal_article_rules_v9.Lead.filter(x=>x.article===article&&x.limit===0.05&&x.unit==="mg/kg");
 assert.equal(matched.length,1);assert.equal(matched[0].row_type,"exact");
 assert.equal(gate(product,row),true);
});
test("Changed limit, unit, article or missing current official metal row must fail closed",()=>{
 const row=profile.rules[0];
 assert.equal(gate(product,{...row,limit:1}),false);
 assert.equal(gate(product,{...row,unit:"mg/L"}),false);
 assert.equal(gate(product,{...row,article:"Fruit and vegetable juice (including tomato juice, but not including lime juice and lemon juice)"}),false);
 const copy=JSON.parse(JSON.stringify(db));
 copy.metal_article_rules_v9.Lead=copy.metal_article_rules_v9.Lead.filter(x=>x.article!==article);
 ctx.contaminantsDb=copy;
 assert.equal(gate(product,row),false);
 ctx.contaminantsDb=db;
});
test("Nectar source cannot be assigned to non-nectar finished products",()=>{
 const forbidden=["fruit-drink-rts","fruit-juice-preserved-industrial","concentrated-fruit-juice-industrial",
 "vegetable-juices","concentrated-fruit-pulp-puree","carbonated-fruit-beverages","fruit-juices"];
 for(const other of forbidden){
  const p=idx.find(x=>x.id===other);assert.ok(p,other+" not in catalogue");
  assert.equal(db.profiles.some(g=>g.id===profile.id&&g.catalog_ids?.includes(other)),false,other);
 }
 assert.equal(profile.rules.some(x=>x.limit===1),false,"Generic juice 1.0 mg/kg is not substituted for nectar lead");
 assert.match(profile.rules[0].condition,/not fruit drink\/RTS/i);
});
