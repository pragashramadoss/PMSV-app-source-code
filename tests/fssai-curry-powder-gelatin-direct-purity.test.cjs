#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const contaminants=read(base+"rules/contaminants-v9-core.json");
const catalog=read(base+"standard-search-index-v1.json").products;
const spice=read(base+"rules/chapter-2-9-salt-spices-condiments-v1.json");
const other=read(base+"rules/chapter-2-11-other-food-products-v1.json");
const ui=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const cases=[
 {id:"12-12-2-curry-powder",name:"Curry Powder",fssr:"2.9.19",
  contaminant:"Lead — dry basis",limit:10,unit:"ppm",chapter:spice,
  official:"https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_9_Salt_Spices_Condiments%20and%20related%20products.pdf",
  excluded:"12-12-2-mixed-masala"},
 {id:"99-99-1-gelatin",name:"Gelatin",fssr:"2.11.3",
  contaminant:"Sulphur dioxide",limit:1000,unit:"ppm",chapter:other,
  official:"https://fssai.gov.in/upload/uploadfiles/files/12_%20Chapter%202_11%20(Other%20food%20product%20and%20%20ingredients).pdf",
  excluded:"99-99-1-gelatin-from-fish-processing-waste"}
];
const beginning=ui.indexOf("function sourcePinnedDirectStandardLimit(p,group,rule){");
const ending=ui.indexOf("function sourcePinnedWaterPesticideEvidence(p){",beginning);
assert.ok(beginning>0&&ending>beginning,"Exact current FSSAI chapter source gate must be available");
const normIngredient=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const ctx={standardSearchIndexDb:{products:catalog},chapterRuleDbs:[spice,other],
  ruleDbStandards:db=>db.standards||[],normIngredient};
vm.runInNewContext(ui.slice(beginning,ending),ctx);
const check=ctx.sourcePinnedDirectStandardLimit;

test("Curry Powder and Gelatin direct limits are supported by their exact official chapter tables",()=>{
 for(const c of cases){
  const identity=catalog.find(p=>p.id===c.id);
  assert.ok(identity,c.id);
  assert.equal(identity.name,c.name);
  assert.equal(identity.fssr,c.fssr);
  assert.equal(identity.rule_key,c.fssr);
  const chapterRule=c.chapter.standards.find(s=>s.key===c.fssr);
  assert.equal(chapterRule.name,c.name);
  const raw=(chapterRule.composition||[]).filter(x=>x.parameter===c.contaminant);
  assert.equal(raw.length,1);
  assert.equal(raw[0].operator,"<=");
  assert.equal(raw[0].value,c.limit);
  assert.equal(raw[0].unit,c.unit);
  assert.ok(c.chapter.official_sources.some(x=>x.url===c.official));
  const mapping=contaminants.direct_product_standard_contaminant_rules_v1.filter(x=>x.catalog_id===c.id);
  assert.equal(mapping.length,1);
  assert.equal(mapping[0].fssr,c.fssr);
  assert.equal(mapping[0].product_name,c.name);
  assert.equal(mapping[0].official_source_url,c.official);
  assert.equal(mapping[0].rules.length,1);
  const rule=mapping[0].rules[0];
  assert.equal(rule.contaminant,c.contaminant);
  assert.equal(rule.limit,c.limit);
  assert.equal(rule.unit,c.unit);
  assert.equal(rule.verification,"official_fssai_direct_product_standard");
  assert.equal(check(identity,mapping[0],rule),true);
 }
});

test("Curry Lead is dry-basis only; Gelatin sulphur dioxide remains separate from Version IX metals",()=>{
 const curry=contaminants.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===cases[0].id);
 assert.match(curry.policy,/dry-weight analytical basis/i);
 assert.match(curry.rules[0].source_basis,/dry basis/i);
 const metals=contaminants.profiles.find(x=>x.catalog_ids?.includes(cases[0].id));
 assert.ok(metals?.rules.some(r=>r.contaminant==="Lead"&&r.unit==="mg/kg"),
  "The existing Version IX Lead row must not be overwritten by the independent direct chapter rule");
 const gelatin=contaminants.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===cases[1].id);
 assert.match(gelatin.policy,/separate Version IX Lead and Arsenic/i);
 assert.ok(gelatin.rules.every(r=>r.contaminant!=="Lead"&&r.contaminant!=="Arsenic"));
});

test("Chapter-source drift, altered units and neighboring finished foods all fail closed",()=>{
 for(const c of cases){
  const identity=catalog.find(p=>p.id===c.id);
  const group=contaminants.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===c.id);
  const rule=group.rules[0];
  assert.equal(check(identity,group,{...rule,limit:c.limit+1}),false,c.id+" tampered numeric");
  assert.equal(check(identity,group,{...rule,unit:"mg/L"}),false,c.id+" tampered unit");
  assert.equal(check(identity,group,{...rule,contaminant:"Lead"}),false,c.id+" tampered parameter");
  assert.equal(check({...identity,id:c.excluded},group,rule),false,c.id+" inherited into different identity");
  assert.equal(check(identity,{...group,fssr:c.fssr+".1"},rule),false,c.id+" wrong clause");
  ctx.chapterRuleDbs=([spice,other]).map(db=>db===c.chapter
   ?{...db,standards:db.standards.map(s=>s.key===c.fssr
    ?{...s,composition:s.composition.map(x=>x.parameter===c.contaminant
     ?{...x,value:c.limit+1}:x)}:s)}:db);
  assert.equal(check(identity,group,rule),false,c.id+" changed chapter table");
  ctx.chapterRuleDbs=([spice,other]).filter(db=>db!==c.chapter);
  assert.equal(check(identity,group,rule),false,c.id+" missing chapter source");
  ctx.chapterRuleDbs=[spice,other];
 }
});
