#!/usr/bin/env node
"use strict";
/**
 * Reconcile every direct numeric impurity/contaminant mapping against:
 * - one exact local FoSCoS product identity and its FSSR clause
 * - that identity's currently loaded official FSSAI chapter document
 * - one numeric source row, not just a copied limit or a product family
 * - the same client-side fail-closed source gate that renders limits
 *
 * Passing this proves partial direct-clause source consistency, NOT full
 * contaminant assessment, effective-amendment reconciliation or compliance.
 */
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const folder=path.join(root,"fssai-product-helper-preview-01");
const read=(p)=>JSON.parse(fs.readFileSync(path.join(folder,p),"utf8"));
const db=read("data/rules/contaminants-v9-core.json");
const products=read("data/standard-search-index-v1.json").products;
const html=fs.readFileSync(path.join(folder,"index.html"),"utf8");
const groups=db.direct_product_standard_contaminant_rules_v1;
const normIngredient=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const at=html.indexOf("function sourcePinnedDirectStandardLimit(p,group,rule){");
const end=html.indexOf("function sourcePinnedWaterPesticideEvidence(p){",at);
assert.ok(at>0&&end>at,"UI direct-standard numeric source validation must exist");
const chapterCache=new Map();
const chapterFor=p=>{
 assert.ok(typeof p.rule_file==="string"&&/^\.\/data\/rules\//.test(p.rule_file),"Missing product chapter source "+p.id);
 if(!chapterCache.has(p.rule_file))chapterCache.set(p.rule_file,read(p.rule_file.replace(/^\.\//,"")));
 return chapterCache.get(p.rule_file);
};
const ctx={
 standardSearchIndexDb:{products},
 chapterRuleDbs:[],
 ruleDbStandards:doc=>doc.standards||[],
 normIngredient
};
vm.runInNewContext(html.slice(at,end),ctx);
const gate=ctx.sourcePinnedDirectStandardLimit;

test("All direct impurity groups have exact catalogue identities, official provenance and matching chapter source values",()=>{
 assert.ok(groups.length>=14,"Previously verified direct product-standard groups were lost");
 const seen=new Set();
 let checks=0,untethered=0;
 for(const group of groups){
  assert.ok(!seen.has(group.catalog_id),"Duplicated direct evidence group "+group.catalog_id);
  seen.add(group.catalog_id);
  const p=products.find(x=>x.id===group.catalog_id);
  assert.ok(p,"Missing exact catalogue identity "+group.catalog_id);
  assert.equal(group.product_name,p.name,"Wrong product identity "+p.id);
  assert.equal(group.fssr,p.fssr,"Wrong FSSR clause "+p.id);
  assert.equal(group.source_chapter_key||group.fssr,p.rule_key,"Wrong source chapter subclause "+p.id);
  const chapter=chapterFor(p);
  assert.ok(chapter.official_sources.some(src=>/^https:\/\/(?:www\.)?fssai\.gov\.in\//.test(src.url)),
   "Unverified FSSAI source authority "+p.id);
  if(group.official_source_url)assert.ok(chapter.official_sources.some(src=>src.url===group.official_source_url),
   "Group has an official URL that is absent from the active chapter "+p.id);
  assert.ok(Array.isArray(group.rules)&&group.rules.length>0,"Empty direct evidence "+p.id);
  ctx.chapterRuleDbs=[chapter];
  const unique=new Set();
  for(const rule of group.rules){
    const key=rule.contaminant+"|"+(rule.source_cross_cutting_key||"");
    assert.ok(!unique.has(key),"Duplicated analyte "+p.id+" "+key);
    unique.add(key);
    assert.equal(rule.verification,"official_fssai_direct_product_standard");
    assert.ok(Number.isFinite(rule.limit)&&rule.limit>=0);
    assert.ok(typeof rule.unit==="string"&&rule.unit.length>0);
    assert.equal(gate(p,group,rule),true,"Direct rule is not traceable to the exact loaded FSSAI source: "+p.id+" "+rule.contaminant);
    checks++;
  }
 }
 assert.ok(checks>=23,"Previously documented direct numeric source checks were lost");
 assert.equal(untethered,0);
});

test("Every exact direct source row rejects altered value, units, source clause and missing document",()=>{
 for(const group of groups){
  const p=products.find(x=>x.id===group.catalog_id),chapter=chapterFor(p);
  ctx.chapterRuleDbs=[chapter];
  for(const rule of group.rules){
   assert.equal(gate(p,group,{...rule,limit:rule.limit+1}),false,group.catalog_id+" altered limit");
   assert.equal(gate(p,group,{...rule,unit:rule.unit+" X"}),false,group.catalog_id+" altered unit");
   assert.equal(gate(p,{...group,source_chapter_key:"INVALID"},rule),false,group.catalog_id+" altered FSSR source key");
   assert.equal(gate(p,{...group,official_source_url:"https://fake.example.invalid/official.pdf"},rule),false,group.catalog_id+" altered provenance");
   ctx.chapterRuleDbs=[];
   assert.equal(gate(p,group,rule),false,group.catalog_id+" missing source");
   ctx.chapterRuleDbs=[chapter];
  }
 }
});

test("No direct numeric criterion may be inherited by unrelated finished food",()=>{
 const byId=new Map(products.map(p=>[p.id,p]));
 const otherIds=["green-tea","instant-tea-solid","purified-vending-water",
  "non-carbonated-water-based-beverages","05-05-1-chocolate","99-99-1-gelatin-from-fish-processing-waste"];
 for(const group of groups){
   const p=byId.get(group.catalog_id),chapter=chapterFor(p);
   ctx.chapterRuleDbs=[chapter];
   for(const rule of group.rules)for(const otherId of otherIds){
     if(otherId===group.catalog_id)continue;
     assert.equal(gate({...p,id:otherId},group,rule),false,
       "Cross-product impurity inheritance: "+group.catalog_id+" > "+otherId);
   }
 }
});
