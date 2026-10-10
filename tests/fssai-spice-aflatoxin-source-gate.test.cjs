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
const products=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const ui=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const start=ui.indexOf("function sourcePinnedSpiceAflatoxinRule(p,rule){");
const stop=ui.indexOf("function productBaselineContaminantRules(p){",start);
assert.ok(start>0&&stop>start,"Source-backed spice gate must be loaded by the helper");
const ctx={
 contaminantsDb:db,
 normIngredient:s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()
};
vm.runInNewContext(ui.slice(start,stop),ctx);
const check=ctx.sourcePinnedSpiceAflatoxinRule;
const keys=[
 ["Total Aflatoxins","total_aflatoxins_limit"],
 ["Aflatoxin B1","aflatoxin_b1_limit"]
];
const selected=(m,key)=>({
 contaminant:key[0],article:m.article,limit:m[key[1]],unit:m.unit
});
test("Every reviewed spice identity has two live Version IX source-checked aflatoxin rows",()=>{
 assert.ok(db.spice_crop_contaminant_identity_mappings_v9.length>=25);
 for(const mapping of db.spice_crop_contaminant_identity_mappings_v9){
  const p=products.find(x=>x.id===mapping.catalog_id);
  assert.ok(p,"Missing spice "+mapping.catalog_id);
  assert.equal(p.name,mapping.product_name);
  for(const key of keys)assert.equal(check(p,selected(mapping,key)),true,
    mapping.catalog_id+" "+key[0]+" should match official source");
 }
});
test("Changed limit, missing source article, changed unit and wrong product fail closed",()=>{
 const mapping=db.spice_crop_contaminant_identity_mappings_v9.find(x=>x.catalog_id==="12-12-2-curry-powder");
 assert.ok(mapping);
 const p=products.find(x=>x.id===mapping.catalog_id);
 for(const key of keys){
  const original=selected(mapping,key);
  assert.equal(check(p,original),true);
  assert.equal(check(p,{...original,limit:Number(original.limit)+1}),false);
  assert.equal(check(p,{...original,unit:"mg/kg"}),false);
  assert.equal(check(p,{...original,article:"Nuts, ready to eat"}),false);
  assert.equal(check({...p,id:"12-12-2-seasoning"},original),false);
  assert.equal(check({...p,name:"Seasoning"},original),false);
  const cloned=JSON.parse(JSON.stringify(db));
  const sourceKey=key[0]==="Total Aflatoxins"?"total_aflatoxins":"aflatoxin_b1";
  cloned.crop_contaminants[sourceKey].rules=
    cloned.crop_contaminants[sourceKey].rules.filter(x=>x.article!==mapping.article);
  ctx.contaminantsDb=cloned;
  assert.equal(check(p,original),false,"Missing source must withhold rule");
  ctx.contaminantsDb=db;
 }
});
test("Profile and baseline numbers are BOTH routed through the same source verification",()=>{
 assert.match(ui,/const cropGatedExact=exact\.filter\(rule=>sourcePinnedVersionIxProfileCropRule\(p,rule\)\)/);
 assert.match(ui,/const rawRules=\[\.\.\.cropGatedExact,\.\.\.baseline/);
 assert.match(ui,/if\(sourcePinnedSpiceAflatoxinRule\(p,candidate\)\)pushRule\(candidate\)/);
 assert.match(ui,/Version IX spice aflatoxin source-check required/);
 const mapping=db.spice_crop_contaminant_identity_mappings_v9.find(x=>x.catalog_id==="12-12-2-curry-powder");
 const p=products.find(x=>x.id===mapping.catalog_id);
 assert.equal(ctx.sourcePinnedVersionIxProfileCropRule(p,selected(mapping,keys[0])),true);
 assert.equal(ctx.sourcePinnedVersionIxProfileCropRule(p,{...selected(mapping,keys[0]),limit:31}),false);
 assert.equal(ctx.sourcePinnedVersionIxProfileCropRule(p,{...selected(mapping,keys[0]),article:"Nuts, ready to eat"}),false,
   "Changed article label must not disable source verification for a mapped spice");
 assert.equal(ctx.sourcePinnedVersionIxProfileCropRule(p,{...selected(mapping,keys[1]),article:"Tampered article"}),false);
 assert.equal(ctx.sourcePinnedVersionIxProfileCropRule({id:"fake",name:"Unknown"},
   {contaminant:"Aflatoxin B1",article:"Spices/Spice Mix",limit:15,unit:"µg/kg"}),false,
   "Unmapped spice-article claims must be withheld");
 assert.equal(ctx.sourcePinnedVersionIxProfileCropRule(p,{contaminant:"Lead",article:"Spices/Spice Mix",limit:10,unit:"mg/kg"}),true,
   "Non-aflatoxin rules retain their separate source-validation gates");
});
