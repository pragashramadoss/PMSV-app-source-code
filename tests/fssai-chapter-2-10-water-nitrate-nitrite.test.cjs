#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/data/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,base+p),"utf8"));
const db=read("rules/contaminants-v9-core.json");
const chapter=read("rules/chapter-2-10-beverages-v1.json");
const catalogue=read("standard-search-index-v1.json").products;
const ui=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const url="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_10_BEVERAGES_Other%20than%20Dairy%20and%20Fruits%20Vegetables%20based.pdf";
const cases=[
 {id:"mineral-water",fssr:"2.10.7",nitrate:50,nitrite:0.02},
 {id:"packaged-drinking-water",fssr:"2.10.8",nitrate:45,nitrite:0.02}
];
const normIngredient=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const a=ui.indexOf("function sourcePinnedDirectStandardLimit(p,group,rule){");
const b=ui.indexOf("function sourcePinnedWaterPesticideEvidence(p){",a);
assert.ok(a>0&&b>a,"Exact official water product standard source gate missing");
const ctx={standardSearchIndexDb:{products:catalogue},chapterRuleDbs:[chapter],
ruleDbStandards:db=>db.standards||[],normIngredient};
vm.runInNewContext(ui.slice(a,b),ctx);
const check=ctx.sourcePinnedDirectStandardLimit;
const groups=db.direct_product_standard_contaminant_rules_v1;

test("Each finished-water identity has source-pinned nitrate as NO3 and nitrite as NO2",()=>{
 assert.ok(chapter.official_sources.some(s=>s.url===url));
 for(const t of cases){
  const p=catalogue.find(p=>p.id===t.id),group=groups.find(x=>x.catalog_id===t.id);
  assert.ok(p&&group);
  assert.equal(p.rule_key,t.fssr);assert.equal(p.fssr,t.fssr);
  assert.equal(group.fssr,t.fssr);assert.equal(group.product_name,p.name);
  assert.equal(group.official_source_url,url);
  const standard=chapter.standards.find(s=>s.key===t.fssr);
  const checks=[["Nitrate as NO3",t.nitrate],["Nitrite as NO2",t.nitrite]];
  for(const [analyte,limit] of checks){
    const rows=group.rules.filter(r=>r.contaminant===analyte);
    assert.equal(rows.length,1,p.name+" "+analyte);
    const r=rows[0];
    assert.equal(r.limit,limit);assert.equal(r.unit,"mg/L");
    assert.equal(r.verification,"official_fssai_direct_product_standard");
    const original=(standard.physical_chemical||[]).filter(x=>x.parameter===analyte);
    assert.equal(original.length,1);
    assert.equal(original[0].operator,"<=");
    assert.equal(original[0].value,limit);assert.equal(original[0].unit,"mg/L");
    assert.equal(check(p,group,r),true);
  }
 }
});

test("Mineral Water and Packaged Drinking Water must not inherit each other's nitrate limits",()=>{
 const left=cases[0],right=cases[1];
 const p=catalogue.find(x=>x.id===left.id),g=groups.find(x=>x.catalog_id===left.id);
 const nitrate=g.rules.find(x=>x.contaminant==="Nitrate as NO3");
 assert.notEqual(left.nitrate,right.nitrate);
 assert.equal(check(p,g,{...nitrate,limit:right.nitrate}),false);
 assert.equal(check({...p,id:right.id},g,nitrate),false);
 assert.equal(check({...p,id:"purified-vending-water"},g,nitrate),false);
});

test("Changing units, analyte, product clause, or loaded official source fails closed",()=>{
 for(const t of cases){
   const p=catalogue.find(x=>x.id===t.id),g=groups.find(x=>x.catalog_id===t.id);
   for(const analyte of ["Nitrate as NO3","Nitrite as NO2"]){
     const r=g.rules.find(x=>x.contaminant===analyte);
     assert.equal(check(p,g,{...r,limit:r.limit+1}),false);
     assert.equal(check(p,g,{...r,unit:"mg/kg"}),false);
     assert.equal(check(p,g,{...r,contaminant:"Fluoride"}),false);
     assert.equal(check(p,{...g,fssr:t.fssr+".1"},r),false);
     assert.equal(check(p,{...g,official_source_url:"https://other.example/test.pdf"},r),false);
     ctx.chapterRuleDbs=[{...chapter,standards:chapter.standards.map(s=>s.key!==t.fssr?s:
       {...s,physical_chemical:s.physical_chemical.map(x=>x.parameter===analyte?{...x,value:x.value+1}:x)})}];
     assert.equal(check(p,g,r),false,"Source number drift must suppress copied value");
     ctx.chapterRuleDbs=[chapter];
   }
 }
});
