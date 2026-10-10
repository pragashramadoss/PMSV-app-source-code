#!/usr/bin/env node
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,".."),base="fssai-product-helper-preview-01/data/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const db=read(base+"rules/contaminants-v9-core.json");
const index=read(base+"standard-search-index-v1.json").products;
const helper=fs.readFileSync(path.join(root,"fssai-product-helper-preview-01/index.html"),"utf8");
const at=helper.indexOf("function sourcePinnedVersionIxProfileMetalRule(p,rule){");
const end=helper.indexOf("function productBaselineContaminantRules(p){",at);
assert.ok(at>0&&end>at,"UI must include versioned profile source gate");
assert.ok(helper.includes("const exact=rawProfileRules.filter(rule=>sourcePinnedVersionIxProfileMetalRule(p,rule));"));
assert.ok(helper.includes("Version IX metal source-check required"));
const normIngredient=x=>String(x||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const ctx={contaminantsDb:db,normIngredient};
vm.runInNewContext(helper.slice(at,end),ctx);
const checked=ctx.sourcePinnedVersionIxProfileMetalRule;
const profileRules=[];
for(const group of db.profiles){
 for(const rule of group.rules||[]){
  if(!/^section 2\.1(?:\s|·|$)/i.test(String(rule.source_basis||"")))continue;
  const ids=group.catalog_ids?.length
   ?group.catalog_ids
   :index.filter(x=>(group.match_fssr||[]).includes(x.fssr)).map(x=>x.id);
  assert.ok(ids.length>0,"Unresolved catalogue scope: "+group.id);
  for(const id of ids){
   const identity=index.find(x=>x.id===id);
   assert.ok(identity,"Missing product identity "+id);
   profileRules.push({id,group:group.id,rule});
  }
 }
}
test("All existing Section 2.1 metal profile rows have source-backed numeric evidence",()=>{
 const distinct=new Set(profileRules.map(x=>x.group+"|"+x.rule.contaminant+"|"+x.rule.article+"|"+x.rule.limit+"|"+x.rule.unit));
 assert.ok(distinct.size>=298,"Lost known Version IX profile evidence");
 for(const {id,group,rule} of profileRules)
   assert.equal(checked({id},rule),true,group+" "+id+" "+rule.contaminant+" "+rule.article);
});
test("Edible gelatin and canned fish grouped articles require exact whitelisted identities",()=>{
 const gelatin=db.profiles.find(x=>x.id==="gelatin");
 const lead=gelatin.rules.find(x=>x.contaminant==="Lead");
 const arsenic=gelatin.rules.find(x=>x.contaminant==="Arsenic");
 const canned=db.profiles.find(x=>x.id==="canned-fishery-products");
 const cannedLead=canned.rules.find(x=>x.contaminant==="Lead");
 for(const id of ["99-99-1-gelatin","99-99-1-gelatin-from-fish-processing-waste"]){
  assert.equal(checked({id},lead),true);
  assert.equal(checked({id},arsenic),true);
 }
 assert.equal(checked({id:"09-09-4-canned-fishery-products"},cannedLead),true);
 assert.equal(checked({id:"99-99-1-gelatin"},cannedLead),false);
 assert.equal(checked({id:"11-11-6-sucralose"},lead),false);
});
test("Tampered limit, units and missing grouped official article must fail closed",()=>{
 const p=db.profiles.find(x=>x.id==="exact-metal-11-11-6-sucralose");
 const rule=p.rules.find(x=>x.contaminant==="Lead");
 assert.ok(rule);
 assert.equal(checked({id:"11-11-6-sucralose"},rule),true);
 assert.equal(checked({id:"11-11-6-sucralose"},{...rule,limit:100}),false);
 assert.equal(checked({id:"11-11-6-sucralose"},{...rule,unit:"mg/L"}),false);
 assert.equal(checked({id:"11-11-6-sucralose"},{...rule,article:"Chocolate"}),false);
 const copy=JSON.parse(JSON.stringify(db));
 copy.metal_article_rules_v9.Lead=copy.metal_article_rules_v9.Lead.filter(x=>normIngredient(x.article)!=="sucralose");
 ctx.contaminantsDb=copy;
 assert.equal(checked({id:"11-11-6-sucralose"},rule),false);
 const g=db.profiles.find(x=>x.id==="gelatin");
 const gelLead=g.rules.find(x=>x.contaminant==="Lead");
 const grouped="Canned fish, canned meats, edible gelatin, meat extracts and hydrolysed protein, dried or dehydrated vegetables (other than onions)";
 copy.metal_article_rules_v9.Lead=copy.metal_article_rules_v9.Lead.filter(x=>x.article!==grouped);
 assert.equal(checked({id:"99-99-1-gelatin"},gelLead),false);
 ctx.contaminantsDb=db;
});
test("Non-Section 2.1 profile rules remain unaffected; no blanket numeric fallback is introduced",()=>{
 assert.equal(checked({id:"anything"},{contaminant:"Histamine",limit:200,source_basis:"Section 2.5.2 · Histamine"}),true);
 assert.equal(checked({id:"anything"},{contaminant:"Lead",limit:5,unit:"mg/kg",article:"Unknown product",source_basis:"Section 2.1 · Lead"}),false);
});

// A nominal article/value match is not enough: the source row itself must be
// classified as an exact named product article, never a catch-all/default or
// flagged literal anomaly that requires official regulatory interpretation.
test("Generic metal fallback and anomaly rows cannot prove an exact product profile",()=>{
 const candidate=(metal,row)=>({
   contaminant:metal,limit:row.limit,unit:row.unit,article:row.article,
   source_basis:"Section 2.1 · "+metal+" · Version IX (03.02.2026)"
 });
 const leadDefault=db.metal_article_rules_v9.Lead.find(r=>r.row_type==="default");
 assert.ok(leadDefault,"Expected separately stored foods-not-specified fallback");
 assert.equal(checked({id:"11-11-6-sucralose"},candidate("Lead",leadDefault)),false);
 const allFoods=db.metal_article_rules_v9["Methyl Mercury"].find(r=>r.row_type==="all_foods");
 assert.ok(allFoods,"Expected separate all-foods row");
 assert.equal(checked({id:"11-11-6-sucralose"},candidate("Methyl Mercury",allFoods)),false);
 const anomalies=db.metal_article_rules_v9.Arsenic.filter(r=>r.row_type==="exact_source_literal_anomaly");
 assert.ok(anomalies.length>=2,"Expected literal anomaly safeguards");
 for(const row of anomalies){
   assert.equal(checked({id:"09-09-2-frozen-shrimp"},candidate("Arsenic",row)),false,row.article);
 }
 const exactSucralose=db.profiles.find(p=>p.id==="exact-metal-11-11-6-sucralose").rules.find(r=>r.contaminant==="Lead");
 assert.equal(checked({id:"11-11-6-sucralose"},exactSucralose),true,"Verified exact metal row still works");
 assert.match(helper,/sameLimit=row=>row\\.row_type==='exact'/);
 assert.match(helper,/if\\(r\\.row_type==='exact' &&normIngredient\\(r\\.article\\|\\|''\\)===n\\)/,
   "Direct name matching must exclude generic/default/anomalous metal rows too");
});
