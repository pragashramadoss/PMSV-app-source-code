"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/",rules=root+"data/rules/";
const read=n=>JSON.parse(fs.readFileSync(rules+n,"utf8"));
const d=read("fssai-current35-adjudication-workbench-batch14-2026-10-13.json");
const b12=read("fssai-current35-positive-fssr-ctr-boundaries-batch12-2026-10-13.json");
const b13=read("fssai-current35-final13-positive-identity-evidence-batch13-2026-10-13.json");
const b9=read("fssai-current35-positive-named-ctr-candidate-gates-batch9-2026-10-13.json");
const b5=read("fssai-current35-proof-intake-batch5-2026-10-13.json");
const work=read("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=read("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const src=fs.readFileSync(root+"fssai-current35-evidence-workbench-batch14-2026-10-13.js","utf8");
test("Canonical baseline and 35 product identities unchanged",()=>{
 assert.deepEqual(d.baseline,{catalogue:533,conditional_first_source:498,first_source_pending:35,complete_food_approvals:0});
 assert.equal(ledger.records.length,533);
 assert.equal(ledger.first_source_pending,35);
 assert.equal(d.cases.length,35);
 assert.deepEqual(d.cases.map(x=>x.catalog_id),work.review_records.map(x=>x.catalog_id));
 assert.equal(new Set(d.cases.map(x=>x.catalog_id)).size,35);
});
test("22 plus 13 original dossiers are complete and distinct",()=>{
 const former=new Set([...b12.cases,...b13.cases].map(x=>x.catalog_id));
 assert.equal(former.size,35);
 for(const x of d.cases)assert.ok(former.has(x.catalog_id));
 assert.equal(d.source_coverage.batch12_cases,22);
 assert.equal(d.source_coverage.batch13_cases,13);
});
test("Three conditional CTR articles, 32 with no newly confirmed named positive article",()=>{
 const expected=new Map(b9.conditional_subroutes.map(x=>[x.catalog_id,x]));
 assert.equal(expected.size,3);
 assert.equal(d.cases.filter(x=>x.named_ctr_candidate).length,3);
 for(const x of d.cases){
   assert.equal(x.named_ctr_candidate?.route_id,expected.get(x.catalog_id)?.id);
 }
 assert.equal(d.source_coverage.conditional_named_article_candidates,3);
 assert.equal(d.source_coverage.not_yet_with_positive_named_article_candidates,32);
});
test("140 original document evidence slots; 153 product specific proof questions",()=>{
 assert.equal(d.cases.reduce((n,x)=>n+x.document_slots.length,0),140);
 assert.equal(d.cases.reduce((n,x)=>n+x.questions.length,0),153);
 for(const x of d.cases){
   const base=b5.cases.find(v=>v.catalog_id===x.catalog_id);
   assert.deepEqual(x.document_slots,base.evidence_documents.map(v=>v.title));
   assert.ok([4,5].includes(x.questions.length));
   assert.ok(x.positive_identity_finding.length>18);
   assert.ok(x.no_transfer.length>20);
 }
});
test("No finished-product threshold, lot PASS or regulated approvals",()=>{
 const s=d.results;
 assert.equal(s.new_source_promotions,0);
 assert.equal(s.new_assigned_thresholds,0);
 assert.equal(s.new_lab_passes,0);
 assert.equal(s.new_regulatory_approvals,0);
 assert.equal(s.canonical_ledger_modified,false);
 assert.equal(s.WordPress_production_modified,false);
 assert.equal(d.future_amendment_commencement,"2026-12-01");
 assert.equal(d.future_amendment_not_applied,true);
 for(const x of d.cases){
  assert.equal(x.first_source_status,"FIRST_EXACT_SOURCE_PENDING");
  assert.equal(x.approved_finished_numeric_limit,false);
  assert.equal(x.lot_test_result_verified,false);
  assert.equal(x.full_legal_approval,false);
 }
});
function context(receipts={},stored={}){
 const c={
  pmsvB13Valid:()=>true,pmsvB12Data:b12,pmsvB13Data:b13,pmsv35Queue:work,
  pmsvB5Data:b5,pmsvB9Data:b9,pmsv498Ledger:ledger,
  pmsvLoadPositiveSourceProof:async()=>{},sourcePinned121ResearchProofHtml:()=>"",
  window:{localStorage:{getItem:()=>JSON.stringify(stored),setItem(){}}},
  pmsvB5Read:()=>receipts,
  pmsvB5Persist:()=>true,URL,
 };
 vm.createContext(c);vm.runInContext(src,c);
 c.pmsvB14Data=d;
 return c;
}
test("Worklist checksum matches and input rejects hostile URLs",()=>{
 const c=context();
 assert.equal(c.pmsvB14Valid(),true);
 assert.equal(c.pmsvB14OfficialUrl("https://fssai.gov.in/upload/uploadfiles/files/a.pdf"),true);
 assert.equal(c.pmsvB14OfficialUrl("https://foscos.fssai.gov.in/standard-product"),true);
 assert.equal(c.pmsvB14OfficialUrl("https://fssai.gov.in.evil.com/fake"),false);
 assert.equal(c.pmsvB14OfficialUrl("javascript:alert(1)"),false);
});
test("Received documents and authored draft are UNVERIFIED, NEVER regulatory PASS",()=>{
 const id=d.cases[0].catalog_id,blank=context(),p=blank.pmsvB14Packet(id);
 assert.equal(p.review_preparation_status,"NOT_STARTED");
 assert.equal(p.finished_product_compliance_approved,false);
 const fields={finished_identity:"Actual vending water at machine",
  source_article:"Named legal water article to confirm",source_url:d.CTR_source,
  analyte:"Lead",analytical_basis:"Sample at dispensing outlet",
  document_reference:"spec revision and chain of custody",
  reviewer:"QA reviewer",lot_reference:"Unverified sample"};
 const r=context({[id]:{received:[true,true,true,true]}},{[id]:fields});
 const x=r.pmsvB14Packet(id);
 assert.equal(x.review_preparation_status,"DOCUMENTARY_PACKET_READY_FOR_INDEPENDENT_REVIEW_UNVERIFIED");
 assert.equal(x.source_article_legally_confirmed,false);
 assert.equal(x.numeric_limit_activated,false);
 assert.equal(x.valid_laboratory_result_proven,false);
 assert.equal(x.finished_product_compliance_approved,false);
 const bad=context({[id]:{received:[true,true,true,true]}},{[id]:{...fields,source_url:"https://fake.example/"}});
 assert.notEqual(bad.pmsvB14Packet(id).review_preparation_status,"DOCUMENTARY_PACKET_READY_FOR_INDEPENDENT_REVIEW_UNVERIFIED");
});
test("All 35 packets are exportable locally, preview integrated",()=>{
 const c=context();
 const exported=c.pmsvB14ExportAll();
 assert.equal(exported.records.length,35);
 assert.equal(exported.legal_approvals,0);
 assert.equal(exported.records.filter(x=>x.numeric_limit_activated).length,0);
 const html=fs.readFileSync(root+"index.html","utf8");
 assert.equal(html.split("fssai-current35-evidence-workbench-batch14-2026-10-13.js").length,2);
 assert.ok(html.indexOf("fssai-current35-evidence-workbench-batch14-2026-10-13.js")>
   html.indexOf("fssai-current35-final13-positive-identity-evidence-batch13-2026-10-13.js"));
 assert.match(c.pmsvB14DashboardHtml(),/35 pending FSSAI source cases/);
 assert.match(c.pmsvB14CaseHtml(d.cases[0].catalog_id),/Download this review packet/);
});
