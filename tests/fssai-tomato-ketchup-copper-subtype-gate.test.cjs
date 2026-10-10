#!/usr/bin/env node
"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8"));
const db=read("data/rules/contaminants-v9-core.json"),ps=read("data/standard-search-index-v1.json").products;
const ui=fs.readFileSync(path.join(root,"index.html"),"utf8");
const id="12-12-6-tomato-ketchup-and-tomato-sauce",p=ps.find(x=>x.id===id),cfg=db.product_subtype_conditional_metal_rules_v9.find(x=>x.catalog_id===id);
assert.ok(p&&cfg);
const pos=ui.indexOf("function metalSubtypeRulesForProduct(p){"),end=ui.indexOf("function sulphatedAshRulesForProduct(p){",pos);
assert.ok(pos>=0&&end>pos);
const select={value:"",dataset:{},innerHTML:"",disabled:true};
const status={className:"",innerHTML:""};
const ctx=vm.createContext({contaminantsDb:db,standardSearchIndexDb:{products:ps},document:{
 getElementById:id=>id==="contaminantMetalSubtype"?select:id==="metalSubtypeStatus"?status:null},
 normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(),esc:x=>String(x||"")});
vm.runInContext(ui.slice(pos,end),ctx);
const selected=()=>ctx.selectedMetalSubtypeRule(p);
const choose=()=>{ctx.syncMetalSubtypeInput(p);select.value="Tomato ketchup";return selected();};
test("FSSAI 2.3.27 keeps combined identity but conditional Copper article applies only to confirmed ketchup",()=>{
 assert.equal(ps.length,533);
 assert.equal(p.fssr,"2.3.27");assert.equal(p.name,cfg.product_name);assert.equal(cfg.subtype,"Tomato ketchup");
 assert.equal(cfg.article,"Tomato ketchup");assert.equal(cfg.contaminant,"Copper");
 assert.equal(cfg.limit,50);assert.equal(cfg.unit,"mg/kg");
 assert.equal(cfg.source_condition,"On dried total solids basis.");
 assert.equal(cfg.auto_apply,false);
 assert.equal(cfg.official_source_url,db.official_sources[0].url);
 assert.equal(selected(),null);
 assert.equal(choose()?.limit,50);
});
test("wrong product, unspecified subtype and sauce cannot receive ketchup Copper",()=>{
 choose();assert.equal(ctx.selectedMetalSubtypeRule({...p,name:"Tomato Sauce"}),null);
 assert.equal(ctx.selectedMetalSubtypeRule({...p,fssr:"2.3.28"}),null);
 assert.equal(ctx.selectedMetalSubtypeRule(ps.find(x=>x.id==="12-12-6-chilli-sauce")),null);
 select.value="Tomato sauce";assert.equal(selected(),null);
 select.value="";assert.equal(selected(),null);
});
test("source numeric limit, unit, article, dried solids basis or version mismatch withholds values",()=>{
 choose();
 for(const what of ["numeric","unit","article","condition","deleted"]){
  const copy=structuredClone(db),rows=copy.metal_article_rules_v9.Copper,i=rows.findIndex(x=>x.article==="Tomato ketchup");
  if(what==="numeric")rows[i].limit=99;
  if(what==="unit")rows[i].unit="mg/L";
  if(what==="article")rows[i].article="Tomato sauce";
  if(what==="condition")rows[i].condition="";
  if(what==="deleted")rows.splice(i,1);
  ctx.contaminantsDb=copy;assert.equal(selected(),null,what);
 }
 ctx.contaminantsDb={...db,source_version:"Version X"};assert.equal(selected(),null);
 ctx.contaminantsDb=db;assert.equal(selected()?.limit,50);
});
test("subtype choice is cleared when switching finished products",()=>{
 choose();
 const rice=ps.find(x=>x.id==="06-06-1-rice");
 assert.ok(rice);ctx.syncMetalSubtypeInput(rice);
 assert.equal(select.value,"");assert.equal(ctx.selectedMetalSubtypeRule(rice),null);
 ctx.syncMetalSubtypeInput(p);assert.equal(select.value,"");
});
test("conditional review card distinguishes inactive ketchup reference from subtype-verified application",()=>{
 const at=ui.indexOf("function productFruitVegCommodityMrlReviewHtml(p){"),end=ui.indexOf("\nfunction ",at+28);
 assert.ok(at>=0&&end>at);
 const block=ui.slice(at,end);
 assert.match(block,/selectedMetalSubtypeRule\(p\)/);
 assert.match(block,/APPLIED ONLY TO CONFIRMED SUBTYPE/);
 assert.match(block,/NOT APPLIED · REVIEW ONLY/);
});
