#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json");
const master=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const ui=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const begin=ui.indexOf("function sourcePinnedVersionIxProfileCropAndNotsRule(p,rule){");
const end=ui.indexOf("function productBaselineContaminantRules(p){",begin);
assert.ok(begin>=0&&end>begin,"Source-validation gates missing in live UI");
const ctx={contaminantsDb:db,normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()};
vm.runInNewContext(ui.slice(begin,end),ctx);
const rows=db.profiles.flatMap(g=>(g.rules||[])
 .filter(r=>/^section 2\.2\.1(?:\s|·|$)/i.test(String(r.source_basis||"")))
 .flatMap(rule=>(g.catalog_ids||[]).map(id=>({g,id,rule}))));
const check=(id,rule)=>ctx.sourcePinnedVersionIxProfileMetalRule({id},rule);

test("All copied Section 2.2.1 toxin profile rows match exact official Version IX source evidence",()=>{
 assert.equal(rows.length,77,"unexpected scope drift: reverify new crop profiles");
 for(const {g,id,rule} of rows){
   assert.ok(master.some(p=>p.id===id),"Absent catalogue identity "+id);
   assert.equal(check(id,rule),true,
     g.id+" / "+id+" / "+rule.contaminant+" / "+rule.article);
 }
});
test("Mutated limits, units, articles, fake contaminants and missing source are rejected",()=>{
 for(const {id,rule} of rows){
   assert.equal(check(id,{...rule,limit:999999}),false,rule.contaminant+" / limit");
   assert.equal(check(id,{...rule,unit:"mg/L"}),false,rule.contaminant+" / unit");
   assert.equal(check(id,{...rule,article:"Foods not specified"}),false,rule.contaminant+" / article");
 }
 assert.equal(check("06-06-1-wheat",{
   contaminant:"Unknown toxin",article:"Cereal and cereal products",
   limit:15,unit:"µg/kg",source_basis:"Section 2.2.1 · Crop contaminants"
 }),false);
});
test("Generic Nuts must match both processing categories; grouped wheat requires explicit identity evidence",()=>{
 const nuts=rows.find(x=>x.rule.article==="Nuts"&&x.rule.contaminant==="Total Aflatoxins");
 assert.ok(nuts);
 const wheat=rows.find(x=>x.rule.article==="Wheat"&&x.rule.contaminant==="Ochratoxin A");
 assert.ok(wheat);
 const altered=JSON.parse(JSON.stringify(db));
 altered.crop_contaminants.total_aflatoxins.rules=
   altered.crop_contaminants.total_aflatoxins.rules.filter(x=>x.article!=="Nuts, ready to eat");
 ctx.contaminantsDb=altered;
 assert.equal(check(nuts.id,nuts.rule),false);
 ctx.contaminantsDb=db;
 const noMapping=JSON.parse(JSON.stringify(db));
 noMapping.explicit_crop_contaminant_article_mappings_v9=
   noMapping.explicit_crop_contaminant_article_mappings_v9.filter(x=>x.catalog_id!==wheat.id);
 ctx.contaminantsDb=noMapping;
 assert.equal(check(wheat.id,wheat.rule),false);
 ctx.contaminantsDb=db;
});
test("Official fish and naturally occurring toxin source tampering cannot bypass profile evidence",()=>{
 for(const contaminant of ["Saffrole","Hydrocyanic acid","Benzo(a)pyrene"]){
   const {id,rule}=rows.find(x=>x.rule.contaminant===contaminant)||{};
   assert.ok(rule,contaminant);
   assert.equal(check(id,rule),true);
   const altered=JSON.parse(JSON.stringify(db));
   if(contaminant==="Benzo(a)pyrene")altered.fish_pcb_pah.rules=
      altered.fish_pcb_pah.rules.filter(x=>x.contaminant!==contaminant);
   else altered.naturally_occurring_toxic_substances[
      contaminant==="Saffrole"?"saffrole":"hydrocyanic_acid"
   ]=[];
   ctx.contaminantsDb=altered;
   assert.equal(check(id,rule),false);
   ctx.contaminantsDb=db;
 }
});

test("Missing toxin evidence produces a distinct fail-closed UI warning, not a metal label",()=>{
 assert.match(ui,/withheldProfileToxinRules=rawProfileRules\.filter/);
 assert.match(ui,/Version IX toxin source-check required/);
 assert.match(ui,/Version IX metal source-check required/);
 assert.match(ui,/const exact=rawProfileRules\.filter\(rule=>sourcePinnedVersionIxProfileMetalRule\(p,rule\)\);/);
});
