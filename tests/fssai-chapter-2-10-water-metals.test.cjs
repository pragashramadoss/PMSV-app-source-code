#!/usr/bin/env node
"use strict";
/* Source-pinned finished Packaged Drinking Water metal/toxic limits.
 * This checks partial product-standard evidence, never complete compliance. */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const folder=path.join(root,"fssai-product-helper-preview-01");
const read=p=>JSON.parse(fs.readFileSync(path.join(folder,p),"utf8"));
const db=read("data/rules/contaminants-v9-core.json");
const chapter=read("data/rules/chapter-2-10-beverages-v1.json");
const products=read("data/standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(folder,"index.html"),"utf8");
const url="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_10_BEVERAGES_Other%20than%20Dairy%20and%20Fruits%20Vegetables%20based.pdf";
const p=products.find(x=>x.id==="packaged-drinking-water");
const group=db.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id==="packaged-drinking-water");
const standard=chapter.standards.find(x=>x.key==="2.10.8");
const expected=[
 ["Copper",0.05,"physical_chemical","Table 3"],
 ["Selenium",0.01,"physical_chemical","Table 3"],
 ["Mercury",0.001,"toxic_substances","Table 4"],
 ["Cadmium",0.003,"toxic_substances","Table 4"],
 ["Arsenic",0.01,"toxic_substances","Table 4"],
 ["Lead",0.01,"toxic_substances","Table 4"],
 ["Chromium",0.05,"toxic_substances","Table 4"],
 ["Nickel",0.02,"toxic_substances","Table 4"],
 ["Barium",0.7,"physical_chemical","Table 3"],
 ["Iron",0.1,"physical_chemical","Table 3"],
 ["Manganese",0.1,"physical_chemical","Table 3"],
 ["Zinc",5,"physical_chemical","Table 3"],
 ["Silver",0.01,"physical_chemical","Table 3"],
 ["Aluminium",0.03,"physical_chemical","Table 3"],
 ["Antimony",0.005,"physical_chemical","Table 3"]
];
const begin=html.indexOf("function sourcePinnedDirectStandardLimit(p,group,rule){");
const end=html.indexOf("function sourcePinnedWaterPesticideEvidence(p){",begin);
assert.ok(begin>=0&&end>begin,"Missing runtime source gate");
const ctx={
 standardSearchIndexDb:{products},
 chapterRuleDbs:[chapter],
 ruleDbStandards:document=>document.standards||[],
 normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()
};
vm.runInNewContext(html.slice(begin,end),ctx);
const check=ctx.sourcePinnedDirectStandardLimit;

test("All fifteen water metal rows exactly match one FSSAI Chapter 2.10 Table 3 or 4 source value",()=>{
 assert.equal(p.name,"Packaged Drinking Water (other than Mineral Water)");
 assert.equal(p.fssr,"2.10.8");assert.equal(p.rule_key,"2.10.8");
 assert.equal(group.fssr,p.fssr);assert.equal(group.product_name,p.name);
 assert.equal(group.official_source_url,url);
 assert.ok(chapter.official_sources.some(src=>src.url===url));
 assert.equal(standard.name,p.name);
 for(const [analyte,limit,field,table] of expected){
   const matches=group.rules.filter(r=>r.contaminant===analyte);
   assert.equal(matches.length,1,"Absent or duplicate impurity mapping "+analyte);
   const r=matches[0];
   assert.equal(r.limit,limit,analyte);
   assert.equal(r.unit,"mg/L",analyte);
   assert.equal(r.article,p.name,analyte);
   assert.equal(r.verification,"official_fssai_direct_product_standard");
   assert.ok(r.source_basis.includes(table),analyte+" table provenance");
   const sourceRows=(standard[field]||[]).filter(x=>x.parameter===analyte);
   assert.equal(sourceRows.length,1,analyte+" source count");
   assert.equal(sourceRows[0].operator,"<=");
   assert.equal(sourceRows[0].value,limit);
   assert.equal(sourceRows[0].unit,"mg/L");
   assert.equal(check(p,group,r),true,analyte+" source gate");
 }
 assert.equal(expected.length,15);
});

test("Every metal rule fails closed for changed value, unit, parameter, document or provenance",()=>{
 for(const [analyte,,field] of expected){
  const r=group.rules.find(x=>x.contaminant===analyte);
  assert.equal(check(p,group,{...r,limit:r.limit*2+1}),false,analyte+" altered limit");
  assert.equal(check(p,group,{...r,unit:"mg/kg"}),false,analyte+" altered unit");
  assert.equal(check(p,group,{...r,contaminant:"Unrelated metal"}),false,analyte+" altered analyte");
  assert.equal(check(p,{...group,fssr:"2.10.7"},r),false,analyte+" altered clause");
  assert.equal(check(p,{...group,official_source_url:"https://fssai.gov.in/not-current-source.pdf"},r),false,analyte+" altered source");
  ctx.chapterRuleDbs=[{...chapter,standards:chapter.standards.map(x=>
   x.key!=="2.10.8"?x:{...x,[field]:x[field].map(t=>t.parameter===analyte?{...t,value:t.value+1}:t)}
  )}];
  assert.equal(check(p,group,r),false,analyte+" changed source table");
  ctx.chapterRuleDbs=[];
  assert.equal(check(p,group,r),false,analyte+" missing source table");
  ctx.chapterRuleDbs=[chapter];
 }
});

test("Mineral, vending, carbonated and ingredient water cannot inherit finished packaged-water metal limits",()=>{
 for(const id of ["mineral-water","purified-vending-water","carbonated-water","coffee"]){
  const other=products.find(x=>x.id===id);
  for(const [analyte] of expected){
   const r=group.rules.find(x=>x.contaminant===analyte);
   assert.equal(check(other||{...p,id},group,r),false,"Wrong product "+id+" "+analyte);
  }
 }
 assert.match(group.policy,/No inheritance/i);
 assert.match(group.policy,/effective amendments/i);
});
