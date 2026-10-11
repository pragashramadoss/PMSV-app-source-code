"use strict";
const{test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const base=path.resolve(__dirname,"../fssai-product-helper-preview-01"),read=p=>JSON.parse(fs.readFileSync(path.join(base,p),"utf8")),code=p=>fs.readFileSync(path.join(base,p),"utf8");
const proof=read("data/rules/fssai-other-foodgrains-b1-first-source-2026-10-11.json"),chapter=read("data/rules/chapter-2-4-cereals-v1.json"),ctr=read("data/rules/contaminants-v9-core.json");
const inventory=read("data/standard-search-index-v1.json").products,byId=new Map(inventory.map(x=>[x.id,x]));
const pending=read("data/rules/fssai-next121-positive-subtype-proof-2026-10-11.json"),priority=read("data/rules/fssai-v9-metal-fallback-precedence-2026-10-11.json"),dossiers=read("data/rules/fssai-next29-no-source-proof-dossiers-2026-10-11.json");
const ctx=vm.createContext({contaminantsDb:ctr,sourcePriorityMetalDb:priority,chapterRuleDbs:[chapter],esc:x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))});
vm.runInContext(code("fssai-source-proof-panels.js")+"\n"+code("fssai-other-foodgrains-source.js"),ctx);
ctx.pmsvGrainProof=proof;ctx.pmsvNext121ProofDb=pending;ctx.pmsvNext29DossiersDb=dossiers;
const show=id=>vm.runInContext("pmsvGrainProofHtml("+JSON.stringify(byId.get(id))+")",ctx);
const old=id=>vm.runInContext("sourcePinned121ResearchProofHtml("+JSON.stringify(byId.get(id))+")",ctx);
test("Exact FSSR residual whole foodgrains match both legal aflatoxin families",()=>{
 assert.equal(proof.partial_after,415);assert.equal(proof.pending_after,118);assert.equal(proof.complete_compliance_pass,false);
 const item=byId.get(proof.catalog_id);assert.equal(item.fssr,"2.4.6");assert.equal(item.rule_key,"2.4.6(15)");
 for(const r of proof.matched_articles)for(const name of r.articles)
  assert.equal(ctr.crop_contaminants[r.source_group].rules.filter(x=>x.article===name&&x.limit===r.limit).length,1);
 assert.match(show(item.id),/Positive first-source evidence/);assert.equal(old(item.id),"");
});
test("Other products and botanical misclassification cannot inherit source",()=>{
 for(const id of ["06-06-1-chia-seeds","06-06-1-quinoa","06-06-2-arrowroot","07-07-2-biscuit","06-06-7-papad"])
  {assert.ok(byId.has(id));assert.equal(show(id),"");}
});
test("Tampered source or chapter is rejected; no compliance PASS",()=>{
 const id=proof.catalog_id,original=ctx.contaminantsDb;
 ctx.contaminantsDb=JSON.parse(JSON.stringify(ctr));
 ctx.contaminantsDb.crop_contaminants.total_aflatoxins.rules.find(x=>x.article==="Pulses").limit=999;
 assert.match(show(id),/withheld/);assert.match(old(id),/First exact-source evidence needed/);ctx.contaminantsDb=original;
 const prev=ctx.pmsvGrainProof;ctx.pmsvGrainProof=null;
 assert.match(old(id),/First exact-source evidence needed/);ctx.pmsvGrainProof=prev;
});
