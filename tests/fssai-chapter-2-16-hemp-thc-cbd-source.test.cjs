#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/data/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read(base+"rules/contaminants-v9-core.json");
const chapter=read(base+"rules/chapter-2-16-hemp-v1.json");
const catalog=read(base+"standard-search-index-v1.json").products;
const ui=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const specs=[
 ["fssai-2-16-hemp-seed","Hemp seed","2.16(2)(i)",5],
 ["fssai-2-16-hemp-seed-oil","Hemp seed oil","2.16(2)(ii)",10],
 ["fssai-2-16-hemp-seed-flour","Hemp seed flour","2.16(2)(iii)",5]
];
const source="https://fssai.gov.in/upload/uploadfiles/files/17_%20Chapter%202_16%20(Hemp%20seeds%20and%20seed%20products).pdf";
const normIngredient=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const beginning=ui.indexOf("function sourcePinnedDirectStandardLimit(p,group,rule){");
const ending=ui.indexOf("function sourcePinnedWaterPesticideEvidence(p){",beginning);
assert.ok(beginning>0&&ending>beginning,"Source-pinned chapter requirement gate missing");
const ctx={standardSearchIndexDb:{products:catalog},chapterRuleDbs:[chapter],
  ruleDbStandards:db=>db.standards||[],normIngredient};
vm.runInNewContext(ui.slice(beginning,ending),ctx);
const verify=ctx.sourcePinnedDirectStandardLimit;
const find=id=>db.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===id);

test("Exactly three Chapter 2.16 food identities have separate 5/10/5 mg/kg THC limits",()=>{
 assert.ok(chapter.official_sources.some(x=>x.url===source));
 const mapped=db.direct_product_standard_contaminant_rules_v1.filter(x=>x.catalog_id.startsWith("fssai-2-16-hemp-"));
 assert.equal(mapped.length,3);
 for(const [id,name,key,limit] of specs){
  const identity=catalog.find(x=>x.id===id),mapping=find(id);
  assert.ok(identity&&mapping);
  assert.equal(identity.name,name);
  assert.equal(identity.fssr,"2.16");
  assert.equal(identity.rule_key,key);
  assert.equal(mapping.fssr,"2.16");
  assert.equal(mapping.source_chapter_key,key);
  assert.equal(mapping.product_name,name);
  assert.equal(mapping.official_source_url,source);
  const clause=chapter.standards.find(x=>x.key===key);
  assert.equal(clause.name,name);
  const original=clause.composition.filter(x=>x.parameter==="Total THC");
  assert.equal(original.length,1);
  assert.equal(original[0].operator,"<=");
  assert.equal(original[0].value,limit);
  assert.equal(original[0].unit,"mg/kg");
  const thc=mapping.rules.filter(x=>x.contaminant==="Total THC");
  assert.equal(thc.length,1);
  assert.equal(thc[0].limit,limit);
  assert.equal(thc[0].unit,"mg/kg");
  assert.equal(verify(identity,mapping,thc[0]),true,id);
 }
});

test("CBD 75 mg/kg remains an independent cross-cutting 2.16(3) food criterion",()=>{
 const sourceRule=chapter.cross_cutting_limits.find(x=>x.key==="2.16(3)");
 assert.equal(sourceRule.parameter,"Cannabidiol (CBD)");
 assert.equal(sourceRule.operator,"<=");
 assert.equal(sourceRule.value,75);
 assert.equal(sourceRule.unit,"mg/kg");
 for(const [id] of specs){
  const p=catalog.find(x=>x.id===id),mapping=find(id);
  const cbd=mapping.rules.filter(x=>x.contaminant==="Cannabidiol (CBD)");
  assert.equal(cbd.length,1);
  assert.equal(cbd[0].source_cross_cutting_key,"2.16(3)");
  assert.equal(cbd[0].limit,75);
  assert.equal(cbd[0].unit,"mg/kg");
  assert.equal(verify(p,mapping,cbd[0]),true,id);
 }
 const beverage=chapter.cross_cutting_limits.find(x=>x.key==="2.16(2)(iv)");
 const otherFood=chapter.cross_cutting_limits.find(x=>x.key==="2.16(2)(v)");
 assert.equal(beverage.value,0.2);
 assert.equal(otherFood.value,5);
 assert.ok(specs.every(([id])=>find(id).rules.every(r=>r.source_cross_cutting_key!=="2.16(2)(iv)")));
});

test("Numeric tampering, cross-product swaps, missing chapter and altered source evidence fail closed",()=>{
 for(const [id,,key,limit] of specs){
  const p=catalog.find(x=>x.id===id),group=find(id);
  for(const rule of group.rules){
   assert.equal(verify(p,group,{...rule,limit:rule.limit+1}),false,id+" changed numeric");
   assert.equal(verify(p,group,{...rule,unit:"mg/L"}),false,id+" changed unit");
   assert.equal(verify(p,{...group,source_chapter_key:key+"-wrong"},rule),false,id+" wrong subclause");
   assert.equal(verify({...p,id:"fssai-2-16-other-product"},group,rule),false,id+" false identity");
   assert.equal(verify(p,{...group,official_source_url:"https://other.example/not-fssai.pdf"},rule),false,
     id+" changed official provenance");
  }
  const thc=group.rules.find(x=>x.contaminant==="Total THC");
  ctx.chapterRuleDbs=[{...chapter,standards:chapter.standards.map(st=>st.key===key
   ?{...st,composition:st.composition.map(row=>row.parameter==="Total THC"?{...row,value:limit+1}:row)}:st)}];
  assert.equal(verify(p,group,thc),false,id+" missing original THC source number");
  ctx.chapterRuleDbs=[];
  assert.equal(verify(p,group,thc),false,id+" chapter removed");
  ctx.chapterRuleDbs=[chapter];
 }
 const id=specs[0][0],p=catalog.find(x=>x.id===id),g=find(id);
 const cbd=g.rules.find(x=>x.contaminant==="Cannabidiol (CBD)");
 ctx.chapterRuleDbs=[{...chapter,cross_cutting_limits:chapter.cross_cutting_limits.map(x=>
  x.key==="2.16(3)"?{...x,value:76}:x)}];
 assert.equal(verify(p,g,cbd),false,"Cross-cutting source drift must withhold CBD");
 ctx.chapterRuleDbs=[chapter];
});
