"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/",dir=root+"data/rules/";
const read=n=>JSON.parse(fs.readFileSync(dir+n,"utf8"));
const q=read("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=read("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const b5=read("fssai-current35-proof-intake-batch5-2026-10-13.json");
const b9=read("fssai-current35-positive-named-ctr-candidate-gates-batch9-2026-10-13.json");
const b12=read("fssai-current35-positive-fssr-ctr-boundaries-batch12-2026-10-13.json");
const b13=read("fssai-current35-final13-positive-identity-evidence-batch13-2026-10-13.json");
const b14=read("fssai-current35-adjudication-workbench-batch14-2026-10-13.json");
const b15=read("fssai-current35-review-transfer-conditional-claims-batch15-2026-10-13.json");
const mod14=fs.readFileSync(root+"fssai-current35-evidence-workbench-batch14-2026-10-13.js","utf8");
const mod15=fs.readFileSync(root+"fssai-current35-review-transfer-conditional-claims-batch15-2026-10-13.js","utf8");
function memoryStore(init={}){
 let data={...init},failKey=null;
 return {
  getItem(k){return Object.hasOwn(data,k)?data[k]:null},
  setItem(k,v){if(failKey===k)throw Error("quota or write blocked");data[k]=String(v)},
  removeItem(k){delete data[k]},
  entries(){return {...data}},
  failOn(k){failKey=k}
 };
}
function sandbox(store=memoryStore()){
 const sb={
 pmsvB13Valid:()=>true,pmsvB12Data:b12,pmsvB13Data:b13,pmsv35Queue:q,
 pmsvB5Data:b5,pmsvB9Data:b9,pmsv498Ledger:ledger,
 pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"",
 pmsvB5Read:()=>JSON.parse(store.getItem("pmsv:ctr:current35:received-documents:v1")||"{}"),
 pmsvB5Persist:v=>{try{store.setItem("pmsv:ctr:current35:received-documents:v1",JSON.stringify(v));return true}catch(_){return false}},
 window:{localStorage:store},URL
 };
 vm.createContext(sb);
 vm.runInContext(mod14,sb);vm.runInContext(mod15,sb);
 sb.pmsvB14Data=b14;sb.pmsvB15Data=b15;
 assert.equal(sb.pmsvB14Valid(),true);
 assert.equal(sb.pmsvB15Valid(),true);
 return sb;
}
test("35 identities / 3 named conditional routes / 12 documentary evidence claims / 498-35 unchanged",()=>{
 const s=sandbox();
 assert.equal(b15.all_cases.length,35);assert.equal(b15.candidate_routes.length,3);
 assert.equal(b15.candidate_routes.reduce((n,x)=>n+x.conditions.length,0),12);
 assert.deepEqual(b15.all_cases.map(x=>x.catalog_id),b14.cases.map(x=>x.catalog_id));
 for(const x of b15.candidate_routes){
  const ref=b9.conditional_subroutes.find(y=>y.catalog_id===x.catalog_id);
  assert.ok(ref);assert.equal(x.CTR_named_article,ref.named_article);
  assert.deepEqual(x.conditions.map(y=>y.documentary_question),ref.qualifying_conditions);
 }
 assert.equal(ledger.records.length,533);
 assert.equal(ledger.first_source_pending,35);
 assert.equal(b15.results.source_promotions,0);
 assert.equal(b15.results.auto_assigned_limits,0);
 assert.equal(b15.results.legal_compliance_approvals,0);
 assert.equal(s.pmsvB15Stats().not_started,35);
});
test("35-case export import roundtrip preserves drafts but cannot issue any PASS",()=>{
 const store=memoryStore(),s=sandbox(store);
 const id=b15.all_cases[0].catalog_id;
 store.setItem("pmsv:ctr:current35:article-review-packets:v1",JSON.stringify({
  [id]:{
   finished_identity:"Verified? No, for review only",source_article:"Named water article",
   source_url:b15.CTR_source,analyte:"Lead",analytical_basis:"Finished outlet sample, as sold",
   document_reference:"Document revision",reviewer:"Reviewer ID",lot_reference:"LAB-SAMPLE-ABC"
  }
 }));
 store.setItem("pmsv:ctr:current35:received-documents:v1",JSON.stringify({
  [id]:{received:[true,true,true,true],reference:"Spec",notes:"Pending legal adjudication"}
 }));
 const transfer=s.pmsvB15PacketForTransfer();
 assert.equal(transfer.review_queue.records.length,35);
 assert.equal(transfer.review_queue.records[0].review_preparation_status,
 "DOCUMENTARY_PACKET_READY_FOR_INDEPENDENT_REVIEW_UNVERIFIED");
 assert.equal(transfer.legal_approvals,0);
 const imported=s.pmsvB15ParseTransfer(JSON.stringify(transfer));
 assert.equal(imported.unverified,true);
 assert.equal(imported.records.length,35);
 assert.equal(s.pmsvB15CommitTransfer(imported),true);
 const out=s.pmsvB15PacketForTransfer();
 assert.equal(out.review_queue.records[0].reviewer_record.finished_identity,
 "Verified? No, for review only");
 assert.equal(out.review_queue.records[0].numeric_limit_activated,false);
 assert.equal(out.review_queue.records[0].valid_laboratory_result_proven,false);
 assert.equal(out.review_queue.records[0].finished_product_compliance_approved,false);
});
test("Reject falsified legal/laboratory approvals and forged extra approval fields",()=>{
 const s=sandbox(),src=s.pmsvB15PacketForTransfer();
 const invalids=[
  x=>x.review_queue.records[0].source_article_legally_confirmed=true,
  x=>x.review_queue.records[0].valid_laboratory_result_proven=true,
  x=>x.review_queue.records[0].finished_product_compliance_approved=true,
  x=>x.review_queue.records[0].numeric_limit_activated=true,
  x=>x.review_queue.records[0].legal_approval=true,
  x=>x.review_queue.records[0].evidence_receipts[0].source_verified=true,
  x=>x.candidate_claims[0].legal_article_approved=true,
  x=>x.candidate_claims[0].batch_lot_pass=true,
  x=>x.legal_approvals=1,
  x=>x.manifest_digest="forged",
  x=>x.review_queue.records[0].product.catalog_id="forged-product",
  x=>x.review_queue.records[1].product.catalog_id=x.review_queue.records[0].product.catalog_id
 ];
 for(const mutate of invalids){
  const obj=JSON.parse(JSON.stringify(src));
  mutate(obj);
  assert.throws(()=>s.pmsvB15ParseTransfer(JSON.stringify(obj)));
 }
 assert.throws(()=>s.pmsvB15ParseTransfer('{"bad": true}'));
 assert.throws(()=>s.pmsvB15ParseTransfer("x".repeat(2000001)));
});
test("Case-only and legacy 35-case JSON accepted; hostile external source URL rejected",()=>{
 const s=sandbox(),pack=s.pmsvB15PacketForTransfer();
 const one=pack.review_queue.records[0];
 assert.equal(s.pmsvB15ParseTransfer(JSON.stringify(one)).records.length,1);
 assert.equal(s.pmsvB15ParseTransfer(JSON.stringify(pack.review_queue)).records.length,35);
 const bad=JSON.parse(JSON.stringify(one));
 bad.reviewer_record.source_url="https://fssai.gov.in.evil.example/reference";
 assert.throws(()=>s.pmsvB15ParseTransfer(JSON.stringify(bad)));
});
test("12 conditional documentary claims are not legal CTR source approvals",()=>{
 const s=sandbox(),claims=s.pmsvB15ClaimsRead();
 for(const arr of Object.values(claims))assert.deepEqual(Array.from(arr),[false,false,false,false]);
 for(const k of Object.keys(claims))claims[k]=[true,true,true,true];
 assert.equal(s.pmsvB15ClaimsSave(claims),true);
 const status=s.pmsvB15Stats();assert.equal(status.candidate_claims_recorded,12);
 assert.equal(status.source_approved,0);
 const file=s.pmsvB15PacketForTransfer();
 assert.equal(file.candidate_claims.length,3);
 for(const r of file.candidate_claims){
  assert.equal(r.all_claims_unverified,true);
  assert.equal(r.legal_article_approved,false);assert.equal(r.batch_lot_pass,false);
 }
});
test("Storage failure restores original drafts, no partial or false-success import",()=>{
 const store=memoryStore(),s=sandbox(store),tr=s.pmsvB15ParseTransfer(JSON.stringify(s.pmsvB15PacketForTransfer()));
 const k1="pmsv:ctr:current35:article-review-packets:v1",k2="pmsv:ctr:current35:received-documents:v1",k3="pmsv:ctr:current35:candidate-document-claims:v1";
 store.setItem(k1,'{"sentinel":true}');store.setItem(k2,'{"receipts":true}');
 const old1=store.getItem(k1);
 store.failOn(k2);
 assert.equal(s.pmsvB15CommitTransfer(tr),false);
 assert.equal(store.getItem(k1),old1);
 assert.equal(store.getItem(k3),null);
});
test("XSS-like reviewer draft is escaped in the UI and never treated as verified",()=>{
 const store=memoryStore(),s=sandbox(store),id=b15.candidate_routes[0].catalog_id;
 const original=s.pmsvB15PacketForTransfer();
 const record=original.review_queue.records.find(x=>x.product.catalog_id===id);
 record.reviewer_record.finished_identity='<img src=x onerror=alert(1)>';
 const draft=s.pmsvB15ParseTransfer(JSON.stringify(record));
 assert.equal(s.pmsvB15CommitTransfer(draft),true);
 const html=s.pmsvB14CaseHtml(id);
 assert.doesNotMatch(html,/<img src=x onerror/);
 assert.match(html,/&lt;img src=x onerror/);
 assert.match(s.pmsvB15CandidateHtml(id),/NOT an approved limit/);
});
test("Panel loads after Batch 14 and only uses official FSSAI/FoSCoS source",()=>{
 const html=fs.readFileSync(root+"index.html","utf8"),name="fssai-current35-review-transfer-conditional-claims-batch15-2026-10-13.js";
 assert.equal(html.split(name).length,2);
 assert.ok(html.indexOf(name)>html.indexOf("fssai-current35-evidence-workbench-batch14-2026-10-13.js"));
 const s=sandbox();
 assert.match(s.pmsvB15DashboardHtml(),/cross-device review/);
 assert.match(s.pmsvB15DashboardHtml(),/Restore reviewer drafts/);
 assert.equal(b15.CTR_source,b14.CTR_source);
 assert.equal(b15.future_regulations_automatically_enabled,false);
 assert.equal(b15.transfers.form_data_browser_local_only,true);
});
