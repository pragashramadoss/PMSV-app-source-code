"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const rd=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const data=rd("fssai-current36-source-and-december-amendment-guard-2026-10-13.json"),
q=rd("fssai-current-36-first-exact-source-proof-worklist-2026-10-13.json"),
l=rd("fssai-current-first-source-533-live-ledger-497-36-2026-10-13.json");
const js=fs.readFileSync(path.join(root,"fssai-current36-effective-source-triage-2026-10-13.js"),"utf8");
const dig=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){let c=s.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const c={console,Date,pmsv497Valid:()=>true,pmsvReviewSnapshotDigest:dig,
  pmsv497Ledger:l,pmsv36Queue:q,pmsvLoadPositiveSourceProof:async()=>{},
  sourcePinned121ResearchProofHtml:()=>"Previously verified research archived"};
 vm.createContext(c);vm.runInContext(js,c);
 c.pmsvCurrent36Triage=JSON.parse(JSON.stringify(data));return c;
}
test("36 pending cases reconcile exact official legal and 533-product effective source statuses",()=>{
 const c=ctx();assert.equal(c.pmsvCurrent36TriageValid(),true);
 assert.equal(data.catalogue,533);assert.equal(data.partial_conditional_routes,497);
 assert.equal(data.first_named_ctr_pending,36);
 assert.equal(data.records.length,36);assert.equal(data.reviewed_future_article_comparisons,180);
 assert.equal(data.original_document_requests,144);assert.equal(data.positive_evidence_gates,144);
 assert.equal(data.promotions_from_this_batch,0);assert.equal(data.finished_goods_lab_approvals,0);
});
test("Each pending identity has four evidence documents and five official Gazette conditions, all not active",()=>{
 const ids=new Set(),amended=new Set(data.published_but_not_effective_amendment.rule_families.map(x=>x.id));
 for(const x of data.records){
  assert.ok(!ids.has(x.catalog_id));ids.add(x.catalog_id);
  assert.equal(x.current_status,"FIRST_EXACT_SOURCE_PENDING");
  assert.equal(x.evidence_requests.length,4);assert.equal(x.future_may_article_comparisons.length,5);
  assert.ok(x.future_may_article_comparisons.every(y=>amended.has(y.amendment_id)&&y.source_limit_enabled===false));
  assert.ok(Object.values(x.positive_proof_gate).every(v=>v===false));
  assert.equal(x.current_source_promoted,false);assert.equal(x.full_regulatory_pass,false);
 }
 assert.equal(ids.size,36);
 assert.equal(data.published_but_not_effective_amendment.effective_date,"2026-12-01");
});
test("Chia oilseed requires identity, broad supplement recipe cannot assume nutmeg, no future application",()=>{
 const chia=data.records.find(x=>x.catalog_id==="06-06-1-chia-seeds");
 assert.deepEqual(chia.specific_future_only_watch_ids,["oilseed_aflatoxin_article_wording"]);
 const mixture=data.records.find(x=>x.catalog_id==="99-99-7-mixtures-preparations-premix-of-functional-ingredients");
 assert.ok(mixture.specific_future_only_watch_ids.includes("mace_nutmeg_saffrole"));
 assert.equal(mixture.future_may_article_comparisons.filter(x=>x.source_limit_enabled).length,0);
 assert.ok(data.records.every(x=>x.future_may_article_comparisons.every(y=>y.proven_legal_article===false)));
});
test("UI shows exactly effective status, previous 40 research collapsed for every product",()=>{
 const c=ctx(),row=l.records[0],x={id:row.catalog_id,name:row.product_name,fssr:row.fssr,fcs:row.fcs};
 const html=c.sourcePinned121ResearchProofHtml(x);
 assert.match(html,/Effective regulatory first-source status/);
 assert.match(html,/497 partial \/ 36 pending/);
 assert.match(html,/historical only/);
 assert.match(html,/Previously verified research archived/);
 const pending=data.records[0];
 const p=c.sourcePinned121ResearchProofHtml({id:pending.catalog_id,name:pending.product_name,fssr:pending.fssr,fcs:pending.fcs});
 assert.match(p,/FIRST SOURCE PENDING/);
 assert.match(p,/Required documentation/);
});
test("No false approval on source tampering, product removal, a future activation or amended date",()=>{
 for(const f of [
 c=>c.pmsvCurrent36Triage.records[0].catalog_id="arbitrary",
 c=>c.pmsvCurrent36Triage.records[0].future_may_article_comparisons[0].source_limit_enabled=true,
 c=>c.pmsvCurrent36Triage.records[1].full_regulatory_pass=true,
 c=>c.pmsvCurrent36Triage.first_named_ctr_pending=35,
 c=>c.pmsvCurrent36Triage.records.splice(10,1),
 c=>c.pmsvCurrent36Triage.published_but_not_effective_amendment.effective_date="2026-10-01"
 ]){const c=ctx();f(c);assert.equal(c.pmsvCurrent36TriageValid(),false);}
});
test("Current dossier script appears after the 497 source module before nutrition",()=>{
 const h=fs.readFileSync(path.join(root,"index.html"),"utf8");
 assert.ok(h.indexOf("fssai-current-first-source-497-36.js")<
 h.indexOf("fssai-current36-effective-source-triage-2026-10-13.js"));
 assert.ok(h.indexOf("fssai-current36-effective-source-triage-2026-10-13.js")<
 h.indexOf("fssai-nutrition-v476.js"));
});
