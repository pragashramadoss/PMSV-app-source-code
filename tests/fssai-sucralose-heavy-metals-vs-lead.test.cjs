#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,".."), base="fssai-product-helper-preview-01/data/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read(base+"rules/contaminants-v9-core.json");
const chapter=read(base+"rules/chapter-2-8-sweetening-honey-v1.json");
const catalog=read(base+"standard-search-index-v1.json").products;
const ui=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const id="11-11-6-sucralose",key="2.8.11";
const official="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_8%20(Sweetening%20agents%20including%20Honey).pdf";

test("Sucralose 2.8.11 heavy metals as Pb 10 ppm matches its exact official chapter source",()=>{
 const product=catalog.find(p=>p.id===id), standard=chapter.standards.find(s=>s.key===key);
 assert.ok(product&&standard);
 assert.equal(product.name,"Sucralose");assert.equal(product.rule_key,key);assert.equal(product.fssr,key);
 assert.equal(standard.name,product.name);
 assert.ok(chapter.official_sources.some(s=>s.url===official));
 const origin=standard.composition.filter(x=>x.parameter==="Heavy metals as Pb");
 assert.equal(origin.length,1);
 assert.equal(origin[0].operator,"<=");assert.equal(origin[0].value,10);assert.equal(origin[0].unit,"ppm");
 const groups=db.direct_product_standard_contaminant_rules_v1.filter(g=>g.catalog_id===id);
 assert.equal(groups.length,1);const group=groups[0];
 assert.equal(group.product_name,product.name);assert.equal(group.fssr,key);assert.equal(group.official_source_url,official);
 assert.equal(group.rules.length,1);const direct=group.rules[0];
 assert.equal(direct.contaminant,"Heavy metals as Pb");
 assert.equal(direct.limit,origin[0].value);assert.equal(direct.unit,origin[0].unit);
 assert.equal(direct.verification,"official_fssai_direct_product_standard");
 assert.ok(group.policy.includes("not a replacement"));
});
test("Version IX elemental Lead and Arsenic stay separate from the Chapter 2.8 heavy metals test",()=>{
 const baseline=db.profiles.filter(x=>x.catalog_ids?.includes(id)).flatMap(x=>x.rules||[]);
 assert.ok(baseline.some(x=>x.contaminant==="Lead"&&x.limit===10&&x.unit==="mg/kg"&&x.source_basis.includes("Lead")));
 assert.ok(baseline.some(x=>x.contaminant==="Arsenic"&&x.limit===3&&x.unit==="mg/kg"));
 assert.equal(db.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===id).rules.some(x=>x.contaminant==="Lead"),false);
 assert.equal(db.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===id).rules.some(x=>x.contaminant==="Arsenic"),false);
 assert.equal(db.direct_product_standard_contaminant_rules_v1.some(x=>x.catalog_id==="11-11-6-calcium-saccharin-food-grade"),false);
});
test("Sucralose direct impurity matches current source on render and fails closed under tampering",()=>{
 const at=ui.indexOf("function sourcePinnedDirectStandardLimit(p,group,rule){");
 const end=ui.indexOf("function productBaselineContaminantRules(p){",at);
 assert.ok(at>=0&&end>at);
 assert.ok(ui.includes("if(sourcePinnedDirectStandardLimit(p,group,r))pushRule({...r});"));
 assert.ok(ui.includes("Numeric limit withheld for"));
 const p=catalog.find(x=>x.id===id),g=db.direct_product_standard_contaminant_rules_v1.find(x=>x.catalog_id===id),rule=g.rules[0];
 const ctx={
   standardSearchIndexDb:{products:catalog},chapterRuleDbs:[chapter],
   ruleDbStandards:db=>db.standards||[],
   normIngredient:x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()
 };
 vm.runInNewContext(ui.slice(at,end),ctx);
 const check=(p0=p,g0=g,r0=rule)=>ctx.sourcePinnedDirectStandardLimit(p0,g0,r0);
 assert.equal(check(),true);
 assert.equal(check(p,g,{...rule,contaminant:"Lead"}),false);
 assert.equal(check(p,g,{...rule,limit:100}),false);
 assert.equal(check(p,g,{...rule,unit:"mg/kg"}),false);
 assert.equal(check(p,{...g,fssr:"2.8.10"}),false);
 assert.equal(check({...p,id:"11-11-6-acesulfame-potassium"}),false);
 ctx.chapterRuleDbs=[{...chapter,standards:chapter.standards.map(s=>s.key===key?{...s,
   composition:s.composition.map(v=>v.parameter==="Heavy metals as Pb"?{...v,value:12}:v)}:s)}];
 assert.equal(check(),false,"Drift in copied official standard must withhold numeric value");
 ctx.chapterRuleDbs=[];
 assert.equal(check(),false,"Missing source chapter must withhold numeric value");
});
