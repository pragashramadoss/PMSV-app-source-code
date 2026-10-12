"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),folder="fssai-product-helper-preview-01/";
const read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8"));
const old=read(folder+"data/rules/fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const latest=read(folder+"data/rules/fssai-current-first-source-533-live-ledger-420-113-2026-10-12.json");
const proof=read(folder+"data/rules/fssai-three-ayurveda-mandated-cereal-composite-aflatoxin-first-source-2026-10-12.json");
const db=read(folder+"data/rules/contaminants-v9-core.json");
const catalogue=read(folder+"data/standard-search-index-v1.json").products;
function make(){
 const ctx={console,esc:s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")
  .replace(/>/g,"&gt;").replace(/"/g,"&quot;")};
 vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(root,folder+"fssai-source-proof-panels.js"),"utf8"),ctx);
 // Mimic the legacy named ledger card and its archived pending warning.
 ctx.sourcePinned121ResearchProofHtml=()=>'<details class="card" style="margin-top:12px"><summary><b>Current FSSAI source-status ledger</b> — old</summary><p>533 identities; 417 partial first-source matches; 116 pending.</p></details><div>Historic pending evidence panel</div>';
 vm.runInContext(fs.readFileSync(path.join(root,folder+"fssai-first-source-current-420-113.js"),"utf8"),ctx);
 ctx.pmsvCurrent533SourceLedger=old;
 ctx.pmsv2026CurrentFirstSourceLedger=latest;
 ctx.pmsv2026FirstSourcePromotionManifest=proof;
 ctx.contaminantsDb=db;
 return ctx;
}
test("new official first-source ledger is 533=420+113, promotes only three, and never awards PASS",()=>{
 assert.equal(latest.records.length,533);
 assert.equal(latest.partial_exact,420);assert.equal(latest.first_source_pending,113);
 assert.equal(proof.records.length,3);
 const promoted=new Set(proof.records.map(x=>x.catalog_id));
 assert.equal(promoted.size,3);
 for(let i=0;i<old.records.length;i++){
  const before=old.records[i],now=latest.records[i];
  assert.equal(before.catalog_id,now.catalog_id);
  assert.equal(before.product_name,now.product_name);
  assert.equal(now.product_compliance_approval,false);
  assert.equal(now.sample_lab_pass,false);
  assert.equal(now.complete_contaminant_panel,false);
  if(promoted.has(now.catalog_id)){
   assert.equal(before.source_status,"FIRST_EXACT_SOURCE_PENDING");
   assert.equal(now.source_status,"PARTIAL_EXACT_SOURCE_MATCH");
   assert.equal(now.regulatory_source_verified_delta.evidence_count,2);
   assert.equal(now.regulatory_source_verified_delta.applicable_article,proof.source_composite_article);
  }else assert.deepEqual(now,before);
 }
 assert.equal(latest.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,420);
 assert.equal(latest.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,113);
});
test("three recipe proofs and source analyte rows match canonical FSSAI Version IX table",()=>{
 const cases=new Map([
  ["12.1 Lajadi Kashaya",["Parched Rice",/Oryza sativa|parched rice/i]],
  ["14.4 Yava Ksheera",["Barley Milk",/barley flour/i]],
  ["14.5 Dugdha Kupika",["Cottage Cheese Dumplings",/rice flour/i]]
 ]);
 for(const p of proof.records){
  const [label,pattern]=cases.get(p.recipe_section)||[];
  assert.ok(label,p.recipe_section);assert.ok(p.product_name.includes(label.split(" ").slice(1).join(" ")),p.product_name);
  assert.match(p.recipe_proof,pattern);assert.equal(p.first_exact_source_verified,true);
  assert.equal(p.lab_pass,false);assert.equal(p.regulatory_compliance_pass,false);
  assert.equal(p.exact_article,"Food product containing any of the above mentioned food articles");
 }
 for(const [key,limit] of [["total_aflatoxins",20],["aflatoxin_b1",10]]){
  const c=db.crop_contaminants[key],v=proof.source_analytes.find(x=>x.key===key);
  assert.equal(c.unit,"µg/kg");assert.equal(v.limit,limit);assert.equal(v.unit,"µg/kg");
  assert.equal(c.rules.filter(x=>x.article===proof.source_composite_article&&x.limit===limit).length,1);
 }
 assert.match(proof.ctr_source,/^https:\/\/fssai\.gov\.in\//);
 assert.match(proof.recipe_source,/^https:\/\/fssai\.gov\.in\//);
});
test("the updated UI is canonical 420/113 and cannot show old pending status for the three positive matches",()=>{
 const ctx=make();
 assert.equal(ctx.pmsv2026FirstSourceValid(),true);
 for(const row of proof.records){
  const p=catalogue.find(x=>x.id===row.catalog_id);assert.ok(p);
  const html=ctx.sourcePinned121ResearchProofHtml(p);
  assert.match(html,/420 partial exact source/);
  assert.match(html,/113 first-source pending/);
  assert.match(html,/PARTIAL EXACT SOURCE MATCH/);
  assert.match(html,/Total Aflatoxins 20 µg\/kg/);
  assert.match(html,/Aflatoxin B1 10 µg\/kg/);
  assert.doesNotMatch(html,/Historic pending evidence panel/);
  assert.doesNotMatch(html,/417 partial first-source matches/);
  assert.doesNotMatch(html,/compliance certificate awarded/);
 }
 const pending=latest.records.find(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING");
 const html=ctx.sourcePinned121ResearchProofHtml(catalogue.find(x=>x.id===pending.catalog_id));
 assert.match(html,/FIRST EXACT SOURCE PENDING/);assert.match(html,/113 first-source pending/);
 assert.match(html,/Historic pending evidence panel/);
 assert.doesNotMatch(html,/417 partial first-source matches/);
});
test("mutations to number, product identity or source proofs fail closed",()=>{
 const ctx=make();
 const p=catalogue.find(x=>x.id===proof.records[0].catalog_id);
 const tampered=JSON.parse(JSON.stringify(proof));
 tampered.source_analytes[0].limit=999;
 ctx.pmsv2026FirstSourcePromotionManifest=tampered;
 assert.equal(ctx.pmsv2026FirstSourceValid(),false);
 assert.match(ctx.sourcePinned121ResearchProofHtml(p),/ledger withheld/);
 ctx.pmsv2026FirstSourcePromotionManifest=proof;
 const altered=JSON.parse(JSON.stringify(latest));
 altered.records.find(x=>x.catalog_id===p.id).sample_lab_pass=true;
 ctx.pmsv2026CurrentFirstSourceLedger=altered;
 assert.equal(ctx.pmsv2026FirstSourceValid(),false);
 assert.doesNotMatch(ctx.sourcePinned121ResearchProofHtml(p),/420 partial exact source/);
});
test("latest canonical UI is linked after baseline, and CI checks it",()=>{
 const html=fs.readFileSync(path.join(root,folder+"index.html"),"utf8");
 assert.ok(html.indexOf("fssai-first-source-current-420-113.js")>html.indexOf("fssai-source-proof-panels.js"));
 const workflow=fs.readFileSync(path.join(root,".github/workflows/verify-fssai-standard-nutrition.yml"),"utf8");
 assert.match(workflow,/node --test tests\/fssai-first-source-current-420-113-2026-10-12\.test\.cjs/);
});