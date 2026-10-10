#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/data/";
const get=n=>JSON.parse(fs.readFileSync(path.join(root,base+n),"utf8"));
const d=get("rules/contaminants-v9-core.json");
const chap=get("rules/chapter-2-10-beverages-v1.json");
const list=get("standard-search-index-v1.json").products;
const ui=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const official="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_10_BEVERAGES_Other%20than%20Dairy%20and%20Fruits%20Vegetables%20based.pdf";
const normIngredient=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const start=ui.indexOf("function sourcePinnedDirectStandardLimit(p,group,rule){");
const end=ui.indexOf("function sourcePinnedWaterPesticideEvidence(p){",start);
assert.ok(start>0&&end>start);
const ctx={standardSearchIndexDb:{products:list},chapterRuleDbs:[chap],ruleDbStandards:db=>db.standards||[],normIngredient};
vm.runInNewContext(ui.slice(start,end),ctx);
const check=ctx.sourcePinnedDirectStandardLimit;
const targets=[["tea","Tea","2.10.1(1)"],["kangra-tea","Kangra Tea","2.10.1(2)"]];

test("Only exact Tea and Kangra Tea source clauses permit iron filings 125 mg/kg",()=>{
 assert.ok(chap.official_sources.some(s=>s.url===official));
 for(const [id,name,key] of targets){
  const product=list.find(x=>x.id===id),mapping=d.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===id);
  assert.ok(product&&mapping);assert.equal(product.name,name);
  assert.equal(product.rule_key,key);assert.equal(mapping.fssr,key);
  assert.equal(mapping.product_name,name);assert.equal(mapping.official_source_url,official);
  assert.equal(mapping.rules.length,1);
  const r=mapping.rules[0];assert.equal(r.contaminant,"Iron filings");
  assert.equal(r.limit,125);assert.equal(r.unit,"mg/kg");
  assert.equal(r.verification,"official_fssai_direct_product_standard");
  assert.match(r.source_note,/not total nutrient iron/i);
  const st=chap.standards.find(s=>s.key===key);
  const source=st.composition.filter(x=>x.parameter==="Iron filings");
  assert.equal(source.length,1);assert.equal(source[0].operator,"<=");
  assert.equal(source[0].value,125);assert.equal(source[0].unit,"mg/kg");
  assert.equal(check(product,mapping,r),true);
 }
});

test("Altered iron contamination limit, labels, source table or neighboring tea product cannot inherit",()=>{
 for(const [id,,key] of targets){
  const product=list.find(x=>x.id===id),mapping=d.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===id),r=mapping.rules[0];
  for(const changed of [{...r,limit:126},{...r,unit:"ppm"},{...r,contaminant:"Iron"}])
   assert.equal(check(product,mapping,changed),false,id+" changed value/units/analyte");
  for(const otherId of ["green-tea","instant-tea-solid"])
   assert.equal(check({...product,id:otherId},mapping,r),false,"Wrong finished product inherited Tea iron filings");
  assert.equal(check(product,{...mapping,official_source_url:"https://example.org/fake.pdf"},r),false);
  ctx.chapterRuleDbs=[{...chap,standards:chap.standards.map(s=>s.key===key
    ?{...s,composition:s.composition.map(x=>x.parameter==="Iron filings"?{...x,value:120}:x)}:s)}];
  assert.equal(check(product,mapping,r),false,"Updated official chapter source must block stale value");
  ctx.chapterRuleDbs=[chap];
 }
});
