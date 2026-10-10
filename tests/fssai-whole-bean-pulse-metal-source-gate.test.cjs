#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const catalog=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const ui=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const id="06-06-1-bean";
const official="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
const bean=catalog.find(p=>p.id===id);
const profile=db.profiles.find(p=>p.id==="exact-raw-bean-pulse-metal-06-06-1-bean");
const normIngredient=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const at=ui.indexOf("function sourcePinnedVersionIxProfileMetalRule(p,rule){");
const end=ui.indexOf("function productBaselineContaminantRules(p){",at);
assert.ok(at>=0&&end>at);
const ctx={contaminantsDb:db,normIngredient};
vm.runInNewContext(ui.slice(at,end),ctx);

test("Raw whole Bean 06.1 has precisely two exact Section 2.1 pulse metal articles",()=>{
 assert.ok(bean&&profile);
 assert.equal(bean.name,"Bean");
 assert.equal(bean.fssr,"2.4.6");
 assert.equal(bean.fcs,"06.1");
 assert.ok(db.official_sources.some(s=>s.url===official));
 assert.deepEqual(profile.catalog_ids,[id]);
 assert.equal(profile.rules.length,2);
 for(const [metal,article,limit,unit] of [
   ["Lead","Pulses",0.2,"mg/kg"],
   ["Cadmium","Pulses, excluding soybean dry",0.1,"mg/kg"]
 ]){
   const rule=profile.rules.find(x=>x.contaminant===metal);
   assert.ok(rule,metal);
   assert.equal(rule.article,article);
   assert.equal(rule.limit,limit);
   assert.equal(rule.unit,unit);
   assert.match(rule.condition,/Excludes fresh green beans, soybean, bean flour/);
   assert.ok(db.metal_article_rules_v9[metal].some(x=>
      x.row_type==="exact"&&x.article===article&&x.limit===limit&&x.unit===unit));
   assert.equal(ctx.sourcePinnedVersionIxProfileMetalRule(bean,rule),true);
 }
});
test("Copied bean limits fail closed if the loaded official source article, limit or unit drifts",()=>{
 for(const rule of profile.rules){
   assert.equal(ctx.sourcePinnedVersionIxProfileMetalRule(bean,{...rule,limit:100}),false);
   assert.equal(ctx.sourcePinnedVersionIxProfileMetalRule(bean,{...rule,unit:"mg/L"}),false);
   assert.equal(ctx.sourcePinnedVersionIxProfileMetalRule(bean,{...rule,article:"Foods not specified"}),false);
 }
 const copy=JSON.parse(JSON.stringify(db));
 copy.metal_article_rules_v9.Lead=copy.metal_article_rules_v9.Lead.filter(x=>x.article!=="Pulses");
 ctx.contaminantsDb=copy;
 assert.equal(ctx.sourcePinnedVersionIxProfileMetalRule(bean,profile.rules[0]),false);
 ctx.contaminantsDb=db;
});
test("Whole Bean evidence cannot be inherited by soybean, bean flour or unrelated vegetables",()=>{
 assert.equal(db.profiles.filter(g=>g.catalog_ids?.includes(id)).length,1);
 for(const other of ["06-06-1-soybean","04-04-2-yellow-pea-powder","06-06-2-besan"]){
   assert.equal(profile.catalog_ids.includes(other),false);
 }
 assert.equal(profile.rules.some(x=>x.contaminant==="Total Aflatoxins"||x.contaminant==="Aflatoxin B1"),false,
   "Crop toxin source applicability requires its own verified product mapping");
});
