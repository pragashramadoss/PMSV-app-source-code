"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const base="fssai-product-helper-preview-01/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const packet=read(base+"data/rules/fssai-current-116-finished-article-proof-worklist-2026-10-12.json");
const ledger=read(base+"data/rules/fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json");
const full=read(base+"data/standard-search-index-v1.json").products;
const byProduct=new Map(full.map(x=>[x.id,x]));
const nameCount={"20 fungal, fruit, tomato subtype matrix":20,"14 sugar, egg, confection subtype matrix":14,"56 cross-form transfer exclusions":56,"26 remaining product-specific evidence blockers":26};
const sources={
  "20 fungal, fruit, tomato subtype matrix":read(base+"data/rules/fssai-20-fungi-fruit-tomato-exact-article-branches-2026-10-11.json").records,
  "14 sugar, egg, confection subtype matrix":read(base+"data/rules/fssai-14-sugar-egg-confection-source-gates-2026-10-11.json").records,
  "56 cross-form transfer exclusions":read(base+"data/rules/fssai-2026-10-11-cross-form-nontransfer-large-batch.json").records,
  "26 remaining product-specific evidence blockers":read(base+"data/rules/fssai-28-final-remainder-and-two-rabbit-veterinary-first-source-2026-10-11.json").pending_records
};
test("all 116 real pending products have one unique source-specific proof packet, no fake clearance",()=>{
 assert.equal(packet.catalogue,533);assert.equal(packet.current_partial_exact,417);assert.equal(packet.current_pending_first_exact,116);
 assert.equal(packet.records.length,116);assert.equal(packet.full_compliance_approvals,0);assert.equal(packet.new_first_exact_promotions,0);
 assert.equal(packet.numeric_auto_application,false);
 const pending=new Set(ledger.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 assert.equal(pending.size,116);assert.equal(new Set(packet.records.map(x=>x.catalog_id)).size,116);
 assert.deepEqual(new Set(packet.records.map(x=>x.catalog_id)),pending);
 for(const [group,count] of Object.entries(nameCount)){
  assert.equal(packet.review_group_counts[group],count);
  const list=packet.records.filter(x=>x.current_review_group===group);
  assert.equal(list.length,count);
  assert.deepEqual(new Set(list.map(x=>x.catalog_id)),new Set(sources[group].map(x=>x.catalog_id)));
 }
 for(const x of packet.records){
  const p=byProduct.get(x.catalog_id);assert.ok(p,x.catalog_id);
  assert.equal(x.product_name,p.name);assert.equal(x.fssr,p.fssr);assert.equal(x.fcs,p.fcs);
  assert.ok(x.proof_branches.length>0);assert.ok(x.proof_branches.every(b=>b.required_evidence.length>0));
  assert.ok(x.forbidden_transfer);assert.match(x.official_finished_product_source,/^https:\/\/(?:[a-z0-9-]+\.)?fssai\.gov\.in\//);
  assert.equal(x.official_contaminant_source,packet.regulatory_basis);
  assert.equal(x.first_exact_source_verified,false);assert.equal(x.numeric_finished_food_limit_auto_applied,false);
  assert.equal(x.finished_food_laboratory_pass,false);assert.equal(x.full_regulatory_compliance_approval,false);
 }
});
test("live Helper shows actual blockers for all 116, not for 417; tampering fails closed",()=>{
 const ctx={console,esc:s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};
 vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(root,base+"fssai-source-proof-panels.js"),"utf8"),ctx);
 ctx.pmsvCurrent533SourceLedger=ledger;
 ctx.pmsvCurrent116ProofWorklist=packet;
 ctx.contaminantsDb={official_sources:[{url:packet.regulatory_basis}],source_version:packet.source_version};
 for(const x of packet.records){
  const html=ctx.pmsvCurrent116ProofChecklistHtml(byProduct.get(x.catalog_id));
  assert.match(html,/Evidence needed to close this first-source gap/);
  assert.match(html,/NO LIMIT OR PASS APPLIED/);assert.match(html,/Do not transfer/);
  assert.match(html,/Official FSSAI/);assert.doesNotMatch(html,/APPROVED COMPLIANCE/);
 }
 for(const x of ledger.records.filter(r=>r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"))
  assert.equal(ctx.pmsvCurrent116ProofChecklistHtml(byProduct.get(x.catalog_id)),"");
 const altered=structuredClone(packet);altered.records[0].full_regulatory_compliance_approval=true;
 ctx.pmsvCurrent116ProofWorklist=altered;
 assert.match(ctx.pmsvCurrent116ProofChecklistHtml(byProduct.get(altered.records[0].catalog_id)),/worklist withheld/);
 ctx.pmsvCurrent116ProofWorklist=null;
 assert.equal(ctx.pmsvCurrent116ProofChecklistHtml(byProduct.get(packet.records[0].catalog_id)),"");
});
test("the new source file is referenced by loader and one fresh-version index script",()=>{
 const js=fs.readFileSync(path.join(root,base+"fssai-source-proof-panels.js"),"utf8");
 const html=fs.readFileSync(path.join(root,base+"index.html"),"utf8");
 assert.match(js,/fssai-current-116-finished-article-proof-worklist-2026-10-12\.json/);
 assert.match(html,/fssai-source-proof-panels\.js\?v=20261012-116proof/);
});
