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
const chapter=read("fssai-product-helper-preview-01/data/rules/chapter-2-8-sweetening-honey-v1.json");
const identities=read("fssai-product-helper-preview-01/data/standard-search-index-v1.json").products;
const helper=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const source="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf";
const routes=[
 ["11-11-6-sodium-saccharin-food-grade","Sodium Saccharin (Food Grade)","2.8.8"],
 ["11-11-6-calcium-saccharin-food-grade","Calcium Saccharin (Food Grade)","2.8.12"]
];
const start=helper.indexOf("function sourcePinnedDirectStandardLimit(p,group,rule){");
const end=helper.indexOf("function sourcePinnedWaterPesticideEvidence(p){",start);
assert.ok(start>=0 && end>start,"Exact chapter-table impurity guard is required");
const normIngredient=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const ctx={standardSearchIndexDb:{products:identities},chapterRuleDbs:[chapter],normIngredient,ruleDbStandards:d=>d.standards||[]};
vm.runInNewContext(helper.slice(start,end),ctx);
const gate=ctx.sourcePinnedDirectStandardLimit;
test("Both saccharin salts have distinct exact FSSAI Chapter 2.8 impurity evidence",()=>{
 assert.equal(chapter.chapter,"2.8");
 assert.ok(chapter.official_sources.some(x=>x.url===source));
 for(const [id,name,clause] of routes){
  const p=identities.find(x=>x.id===id),g=db.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===id);
  assert.ok(p&&g,name+" identity and gate");
  assert.equal(p.name,name);
  assert.equal(p.fssr,clause);
  assert.equal(p.rule_key,clause);
  assert.equal(g.product_name,name);
  assert.equal(g.fssr,clause);
  assert.equal(g.official_source_url,source);
  assert.equal(g.rules.length,1);
  const r=g.rules[0],st=chapter.standards.find(x=>x.key===clause&&x.name===name);
  assert.ok(st,name+" official standard");
  assert.deepEqual(st.composition.filter(x=>x.parameter==="Toluene sulfonamides"),[
   {parameter:"Toluene sulfonamides",operator:"<=",value:25,unit:"ppm"}
  ]);
  assert.equal(r.contaminant,"Toluene sulfonamides");
  assert.equal(r.limit,25);
  assert.equal(r.unit,"ppm");
  assert.equal(r.verification,"official_fssai_direct_product_standard");
  assert.match(r.source_basis,new RegExp(clause.replaceAll(".","\\.")));
  assert.match(r.source_note,/not a Section 2\\.1 elemental-metal limit/i);
  assert.equal(gate(p,g,r),true);
 }
});
test("Fail closed: tampered impurity number/units/missing chapter or changed source row",()=>{
 for(const [id] of routes){
  const p=identities.find(x=>x.id===id),g=db.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===id),r=g.rules[0];
  assert.equal(gate(p,g,{...r,limit:250}),false);
  assert.equal(gate(p,g,{...r,unit:"mg/L"}),false);
  assert.equal(gate(p,g,{...r,contaminant:"Lead"}),false);
  assert.equal(gate(p,{...g,fssr:"2.8.11"},r),false);
 }
 const [id]=routes[1];
 const p=identities.find(x=>x.id===id),g=db.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===id);
 ctx.chapterRuleDbs=[];
 assert.equal(gate(p,g,g.rules[0]),false);
 ctx.chapterRuleDbs=[{...chapter,standards:chapter.standards.map(x=>x.key!=="2.8.12"?x:
 {...x,composition:x.composition.map(r=>r.parameter!=="Toluene sulfonamides"?r:{...r,value:26})})}];
 assert.equal(gate(p,g,g.rules[0]),false);
 ctx.chapterRuleDbs=[chapter];
});
test("Different salts, sweeteners and finished foods cannot inherit the 25 ppm impurity",()=>{
 const [sId,cId]=routes.map(x=>x[0]);
 const s=identities.find(x=>x.id===sId),c=identities.find(x=>x.id===cId);
 const sg=db.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===sId);
 const cg=db.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===cId);
 assert.equal(gate(s,cg,cg.rules[0]),false);
 assert.equal(gate(c,sg,sg.rules[0]),false);
 for(const id of ["11-11-6-sucralose","11-11-6-acesulfame-potassium","11-11-6-aspartyl-phenyl-alanine-methyl-ester-aspartame","05-05-1-chocolate"]){
  const other=identities.find(x=>x.id===id);
  assert.ok(other);
  assert.equal(gate(other,sg,sg.rules[0]),false);
  assert.equal(gate(other,cg,cg.rules[0]),false);
 }
 const newDirectIds=routes.map(x=>x[0]);
 assert.ok(db.direct_product_standard_contaminant_rules_v1.filter(x=>newDirectIds.includes(x.catalog_id)).every(
  x=>x.rules.every(r=>r.contaminant!=="Lead"&&r.contaminant!=="Arsenic"&&r.contaminant!=="Heavy metals")));
});
