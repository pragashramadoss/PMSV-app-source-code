#!/usr/bin/env node
"use strict";
const test=require("node:test"), assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const db=read("data/rules/contaminants-v9-core.json");
const catalog=read("data/standard-search-index-v1.json").products;
const ui=fs.readFileSync(path.join(root,"index.html"),"utf8");
const start=ui.indexOf("function metalSubtypeRulesForProduct(p){");
const end=ui.indexOf("function sulphatedAshRulesForProduct(p){",start);
assert.ok(start>=0&&end>start);
const select={value:"",dataset:{},innerHTML:"",disabled:true};
const el={className:"",innerHTML:""};
const ctx=vm.createContext({contaminantsDb:db,standardSearchIndexDb:{products:catalog},
 document:{getElementById:id=>id==="contaminantMetalSubtype"?select:id==="metalSubtypeStatus"?el:null},
 normIngredient:s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),esc:s=>String(s||"")});
vm.runInContext(ui.slice(start,end),ctx);
const ids=["06-06-1-rice","06-06-1-basmati-rice"];
const product=id=>catalog.find(p=>p.id===id);
const chosen=p=>{ctx.syncMetalSubtypeInput(p);select.value="Polished rice";return ctx.selectedMetalSubtypeRule(p);};
test("two grain identities have exact, optional polished-rice cadmium rows; catalogue unchanged",()=>{
 assert.equal(catalog.length,533);
 const matched=db.product_subtype_conditional_metal_rules_v9.filter(x=>ids.includes(x.catalog_id));
 assert.equal(matched.length,2);
 for(const r of matched){
  const p=product(r.catalog_id);assert.ok(p);
  assert.equal(p.name,r.product_name);assert.equal(p.fssr,r.fssr);
  assert.equal(r.auto_apply,false);assert.equal(r.subtype,"Polished rice");
  assert.equal(r.contaminant,"Cadmium");assert.equal(r.article,"Rice, polished");
  assert.equal(r.limit,0.4);assert.equal(r.unit,"mg/kg");
  assert.equal(r.official_source_url,db.official_sources[0].url);
 }
});
test("no subtype selected means no numeric cadmium rule",()=>{
 const p=product(ids[0]);ctx.syncMetalSubtypeInput(p);
 assert.equal(ctx.selectedMetalSubtypeRule(p),null);
 assert.equal(chosen(p)?.limit,0.4);
});
test("source missing, changed numeric value, changed unit, or duplicate row fails closed",()=>{
 const p=product(ids[0]);chosen(p);
 for(const kind of ["missing","limit","unit","duplicate"]){
  const cloned=structuredClone(db);
  let rows=cloned.metal_article_rules_v9.Cadmium;
  const idx=rows.findIndex(x=>x.article==="Rice, polished");
  if(kind==="missing")rows.splice(idx,1);
  if(kind==="limit")rows[idx].limit=0.9;
  if(kind==="unit")rows[idx].unit="mg/L";
  if(kind==="duplicate")rows.push({...rows[idx]});
  ctx.contaminantsDb=cloned;
  assert.equal(ctx.selectedMetalSubtypeRule(p),null,kind);
 }
 ctx.contaminantsDb=db;
 assert.equal(ctx.selectedMetalSubtypeRule(p)?.limit,0.4);
});
test("wrong catalogue identity, stale product selection and source version fail closed",()=>{
 const p=product(ids[0]);chosen(p);
 assert.equal(ctx.selectedMetalSubtypeRule({...p,name:"Rice flour"}),null);
 assert.equal(ctx.selectedMetalSubtypeRule({...p,fssr:"2.4.1"}),null);
 assert.equal(ctx.selectedMetalSubtypeRule(product("06-06-1-blended-rice")),null);
 const next=product(ids[1]);ctx.syncMetalSubtypeInput(next);
 assert.equal(select.value,"","product switching must clear old confirmation");
 assert.equal(ctx.selectedMetalSubtypeRule(next),null);
 assert.equal(chosen(next)?.limit,0.4);
 ctx.contaminantsDb={...db,source_version:"Version X (pending review)"};
 assert.equal(ctx.selectedMetalSubtypeRule(next),null);
 ctx.contaminantsDb=db;
});
test("existing coffee subtype values are also checked against Version IX",()=>{
 const p=product("coffee");assert.ok(p);
 ctx.syncMetalSubtypeInput(p);select.value="Roasted coffee";
 assert.equal(ctx.selectedMetalSubtypeRule(p)?.contaminant,"Copper");
 const cloned=structuredClone(db);
 cloned.metal_article_rules_v9.Copper.find(x=>x.article==="Chicory-dried or roasted, coffee beans, flavourings/pectin liquid").limit=99;
 ctx.contaminantsDb=cloned;
 assert.equal(ctx.selectedMetalSubtypeRule(p),null);
 ctx.contaminantsDb=db;
});
