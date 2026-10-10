#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8"));
const d="fssai-product-helper-preview-01/data/";
const idx=read(d+"standard-search-index-v1.json");
const ch=read(d+"rules/chapter-2-10-beverages-v1.json");
const ct=read(d+"rules/contaminants-v9-core.json");
const ui=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const cfg=ct.water_product_standard_pesticide_limits_v1;
const ids=["mineral-water","packaged-drinking-water"];
const targetKeys={"mineral-water":"2.10.7","packaged-drinking-water":"2.10.8"};
function makeCheck(contaminantsDb=ct,chapter=ch){
 const start=ui.indexOf("function sourcePinnedWaterPesticideEvidence(p){");
 const end=ui.indexOf("function productBaselineContaminantRules(p){",start);
 assert.ok(start>=0&&end>start,"Source-pinned water pesticide gate missing");
 const ctx={
   contaminantsDb,standardSearchIndexDb:idx,chapterRuleDbs:[chapter],
   normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),
   ruleDbStandards:db=>db.standards||[]
 };
 vm.runInNewContext(ui.slice(start,end),ctx);
 return {check:ctx.sourcePinnedWaterPesticideEvidence,ctx};
}
test("Official direct water pesticide tables have identical FSSAI per-pesticide and total-residue values",()=>{
 assert.equal(idx.products.length,533);
 assert.equal(cfg.routes.length,2);
 assert.equal(cfg.source_version,ch.source_version);
 assert.ok(ch.official_sources.some(z=>z.url===cfg.official_source_url));
 assert.equal(cfg.inference_to_other_beverages,false);
 const expected=[["Individual pesticide residue",0.0001],["Total pesticide residue",0.0005]];
 for(const id of ids){
  const p=idx.products.find(x=>x.id===id);
  const route=cfg.routes.find(x=>x.catalog_id===id);
  const standard=ch.standards.find(x=>x.key===targetKeys[id]);
  assert.ok(p&&route&&standard,id);
  assert.equal(route.product_name,p.name);
  assert.equal(route.fssr,p.fssr);
  assert.equal(route.source_chapter_key,standard.key);
  assert.equal(route.rules.length,2);
  assert.equal(standard.pesticide.length,2);
  for(const [name,value] of expected){
   const row=route.rules.find(x=>x.parameter===name);
   const source=standard.pesticide.find(x=>x.parameter===name);
   assert.ok(row&&source,id+" "+name);
   assert.equal(source.operator,"<=");
   assert.equal(source.value,value);
   assert.equal(row.limit,source.value);
   assert.equal(row.unit,"mg/L");
   assert.equal(row.unit,source.unit);
  }
 }
});
test("Water pesticide gate verifies only the two matching finished-water identities",()=>{
 const {check}=makeCheck();
 for(const id of ids){
  const p=idx.products.find(x=>x.id===id);
  const r=check(p);
  assert.equal(r.relevant,true,id);
  assert.equal(r.verified,true,id);
  assert.equal(r.rows.length,2);
 }
 for(const id of ["carbonated-water","purified-vending-water","non-carbonated-water-based-beverages","tea"]){
  const p=idx.products.find(x=>x.id===id);
  assert.ok(p,id);
  const r=check(p);
  assert.equal(r.relevant,false,id);
  assert.equal(r.rows.length,0);
 }
});
test("Water pesticide gate withholds both numeric values on source, unit, clause or URL drift",()=>{
 const p=idx.products.find(x=>x.id==="mineral-water");
 const {check,ctx}=makeCheck();
 assert.equal(check(p).verified,true);
 for(const newValue of [0.001,0.00005]){
  ctx.chapterRuleDbs=[{...ch,standards:ch.standards.map(s=>s.key!==p.fssr?s:{
   ...s,pesticide:s.pesticide.map(r=>r.parameter==="Individual pesticide residue"?{...r,value:newValue}:r)
  })}];
  assert.equal(check(p).verified,false,"Changed source value must hide both rows");
 }
 ctx.chapterRuleDbs=[ch];
 let tampered=structuredClone(ct);
 tampered.water_product_standard_pesticide_limits_v1.routes.find(x=>x.catalog_id===p.id).rules[0].unit="mg/kg";
 ctx.contaminantsDb=tampered;
 assert.equal(check(p).verified,false,"Units must not be converted");
 ctx.contaminantsDb={...ct,water_product_standard_pesticide_limits_v1:{...cfg,official_source_url:"https://example.com/fake.pdf"}};
 assert.equal(check(p).verified,false,"Untrusted source URL must fail");
 ctx.contaminantsDb=ct;
 ctx.chapterRuleDbs=[];
 assert.equal(check(p).verified,false,"Missing source table must withhold all numeric values");
 assert.equal(check({...p,id:"packaged-drinking-water"}).verified,false,"Catalog identity mismatch");
});
test("Water pesticide rendering is separated from CTR commodity MRL display and has fail-closed notice",()=>{
 assert.ok(ui.includes("const waterPesticides=sourcePinnedWaterPesticideEvidence(p);"));
 assert.ok(ui.includes("const waterPesticideHtml="));
 assert.ok(ui.includes("waterPesticides.verified"));
 assert.ok(ui.includes("+waterPesticideHtml"));
 assert.ok(ui.includes("Numeric"+"al values are withheld"));
 assert.ok(ui.includes("different from named commodity pesticide MRLs"));
 assert.equal((ct.water_product_standard_pesticide_limits_v1.routes||[]).length,2);
});
