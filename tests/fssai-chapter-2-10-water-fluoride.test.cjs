#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="fssai-product-helper-preview-01/data/";
const db=read(base+"rules/contaminants-v9-core.json");
const chapter=read(base+"rules/chapter-2-10-beverages-v1.json");
const index=read(base+"standard-search-index-v1.json");
const helper=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const targets=[["mineral-water","2.10.7"],["packaged-drinking-water","2.10.8"]];
const source="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_10_BEVERAGES_Other%20than%20Dairy%20and%20Fruits%20Vegetables%20based.pdf";

test("Both water fluoride rules stay identical to official Chapter 2.10 source and exact catalogue identities",()=>{
 assert.equal(index.products.length,533);
 assert.ok(chapter.official_sources.some(s=>s.url===source));
 for(const [id,key] of targets){
  const product=index.products.find(p=>p.id===id), standard=chapter.standards.find(x=>x.key===key);
  assert.ok(product&&standard,"Missing water product identity or source clause");
  assert.equal(product.fssr,key);
  assert.equal(product.rule_key,key);
  const sourceRules=(standard.physical_chemical||[]).filter(r=>r.parameter==="Fluoride");
  assert.equal(sourceRules.length,1);
  const fromStandard=sourceRules[0];
  assert.equal(fromStandard.operator,"<=");
  assert.equal(fromStandard.value,1);
  assert.equal(fromStandard.unit,"mg/L");
  const groups=db.direct_product_standard_contaminant_rules_v1.filter(r=>r.catalog_id===id);
  assert.equal(groups.length,1,"Duplicate or missing direct water rule");
  const group=groups[0];
  assert.equal(group.fssr,key);
  assert.equal(group.product_name,product.name);
  assert.equal(group.official_source_url,source);
  assert.match(group.source_basis,new RegExp(key.replaceAll(".","\\.")));
  assert.equal(group.rules.length,id==="packaged-drinking-water"?2:1);
  const r=group.rules[0];
  assert.equal(r.contaminant,"Fluoride");
  assert.equal(r.limit,fromStandard.value);
  assert.equal(r.unit,fromStandard.unit);
  assert.equal(r.verification,"official_fssai_direct_product_standard");
  assert.ok(r.source_basis.includes("physical/chemical water product-standard"));
 }
});
test("No fluoride inheritance to carbonated water, vending water or other beverage products",()=>{
 const expected=new Set(targets.map(x=>x[0]));
 const waterGroups=db.direct_product_standard_contaminant_rules_v1.filter(r=>r.rules?.some(z=>z.contaminant==="Fluoride"&&z.unit==="mg/L"));
 assert.equal(waterGroups.length,2);
 for(const group of waterGroups)assert.ok(expected.has(group.catalog_id),group.catalog_id);
 for(const id of ["carbonated-water","purified-vending-water","non-carbonated-water-based-beverages","synthetic-syrup-dispenser"]){
  assert.equal(db.direct_product_standard_contaminant_rules_v1.some(r=>r.catalog_id===id),false,id+" must not inherit water fluoride rule");
 }
 for(const [id] of targets){
  const prof=db.profiles.filter(p=>p.catalog_ids?.includes(id));
  assert.ok(prof.length>0,id+" lost its existing CTR profile");
  assert.equal(prof.some(p=>p.rules?.some(r=>r.contaminant==="Fluoride")),false,"Duplicate fluoride in CTR profile");
 }
});
test("Helper UI source-pin checks both exact water clauses and withholds edited fluoride values",()=>{
 const vm=require("node:vm");
 const at=helper.indexOf("function sourcePinnedDirectStandardLimit(p,group,rule){");
 const end=helper.indexOf("function productBaselineContaminantRules(p){",at);
 assert.ok(at>=0&&end>at,"Source checking function required");
 assert.ok(helper.includes("if(sourcePinnedDirectStandardLimit(p,group,r))pushRule({...r});"),"Direct limits must pass source check before display");
 assert.ok(helper.includes("Numeric limit withheld for"),"Unverified direct limit must get a review notice");
 const ctx={
  standardSearchIndexDb:index,
  chapterRuleDbs:[chapter],
  ruleDbStandards:db=>db.standards||[],
  normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()
 };
 vm.runInNewContext(helper.slice(at,end),ctx);
 for(const [id] of targets){
  const product=index.products.find(x=>x.id===id);
  const group=db.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===id);
  const rule=group.rules[0];
  const check=(p=product,g=group,r=rule)=>ctx.sourcePinnedDirectStandardLimit(p,g,r);
  assert.equal(check(),true,id+" source-pinned fluoride should appear");
  assert.equal(check(product,group,{...rule,limit:2}),false,"Tampered fluoride value must be withheld");
  assert.equal(check(product,group,{...rule,unit:"mg/kg"}),false,"Tampered fluoride units must be withheld");
  assert.equal(check(product,{...group,fssr:"2.10.6(1)"}),false,"Incorrect legal clause must be rejected");
  assert.equal(check({...product,id:"carbonated-water"}),false,"Different product cannot inherit fluoride");
 }
 ctx.chapterRuleDbs=[];
 const id=targets[0][0], product=index.products.find(x=>x.id===id);
 const group=db.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===id);
 assert.equal(ctx.sourcePinnedDirectStandardLimit(product,group,group.rules[0]),false,"Missing source table must fail closed");
 ctx.chapterRuleDbs=[{...chapter,standards:chapter.standards.map(s=>
  s.key!==product.fssr?s:{...s,physical_chemical:s.physical_chemical.map(v=>
   v.parameter!=="Fluoride"?v:{...v,value:2})})}];
 assert.equal(ctx.sourcePinnedDirectStandardLimit(product,group,group.rules[0]),false,"Modified official source table must fail closed");
});

test("Packaged Drinking Water bromates come from exact FSSAI 2.10.8 Table 3, not an inherited article",()=>{
 const id="packaged-drinking-water",product=index.products.find(x=>x.id===id);
 const chapterStandard=chapter.standards.find(x=>x.key==="2.10.8");
 const expected=(chapterStandard.physical_chemical||[]).filter(x=>x.parameter==="Bromates as BrO3");
 assert.equal(expected.length,1);
 assert.equal(expected[0].operator,"<=");
 assert.equal(expected[0].value,0.01);
 assert.equal(expected[0].unit,"mg/L");
 const group=db.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===id);
 const bromate=group.rules.filter(x=>x.contaminant==="Bromates as BrO3");
 assert.equal(bromate.length,1);
 assert.equal(bromate[0].limit,expected[0].value);
 assert.equal(bromate[0].unit,expected[0].unit);
 assert.equal(bromate[0].verification,"official_fssai_direct_product_standard");
 assert.equal(bromate[0].article,chapterStandard.name);
 const other=db.direct_product_standard_contaminant_rules_v1.filter(x=>x.catalog_id!==id);
 assert.equal(other.some(x=>x.rules?.some(r=>r.contaminant==="Bromates as BrO3")),false,"Bromates cannot be transferred to other products");
 const vm=require("node:vm");
 const at=helper.indexOf("function sourcePinnedDirectStandardLimit(p,group,rule){");
 const end=helper.indexOf("function productBaselineContaminantRules(p){",at);
 assert.ok(at>=0&&end>at);
 const ctx={
  standardSearchIndexDb:index,chapterRuleDbs:[chapter],
  ruleDbStandards:db=>db.standards||[],
  normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()
 };
 vm.runInNewContext(helper.slice(at,end),ctx);
 assert.equal(ctx.sourcePinnedDirectStandardLimit(product,group,bromate[0]),true);
 assert.equal(ctx.sourcePinnedDirectStandardLimit(product,group,{...bromate[0],limit:0.1}),false,"10× source drift must fail closed");
 assert.equal(ctx.sourcePinnedDirectStandardLimit(product,group,{...bromate[0],unit:"mg/kg"}),false,"No arbitrary mg/kg conversion");
 assert.equal(ctx.sourcePinnedDirectStandardLimit({...product,id:"mineral-water"},group,bromate[0]),false);
 ctx.chapterRuleDbs=[{...chapter,standards:chapter.standards.map(st=>st.key!=="2.10.8"?st:{
  ...st,physical_chemical:st.physical_chemical.map(v=>v.parameter==="Bromates as BrO3"?{...v,value:0.1}:v)
 })}];
 assert.equal(ctx.sourcePinnedDirectStandardLimit(product,group,bromate[0]),false,"Changed chapter table must fail closed");
});
