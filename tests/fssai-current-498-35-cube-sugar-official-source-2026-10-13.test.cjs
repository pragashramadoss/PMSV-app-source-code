"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const load=n=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",n),"utf8"));
const m=load("fssai-cube-sugar-refined-chromium-conditional-2026-10-13.json"),
l=load("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json"),
q=load("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json"),
t=load("fssai-current-35-decisive-source-open-cases-2026-10-13.json"),
prior=load("fssai-current-first-source-533-live-ledger-497-36-2026-10-13.json"),
priorQ=load("fssai-current-36-first-exact-source-proof-worklist-2026-10-13.json");
const script=fs.readFileSync(path.join(root,"fssai-current-first-source-498-35.js"),"utf8");
const hash=o=>{let s=JSON.stringify(o),a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){let c=s.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")};
function ctx(){
 const v={console,pmsvCurrent36TriageValid:()=>true,pmsvReviewSnapshotDigest:hash,
 pmsv497Ledger:prior,pmsv36Queue:priorQ,pmsvLoadPositiveSourceProof:async()=>{},
 sourcePinned121ResearchProofHtml:()=>"Archive",pmsvCurrent116ProofChecklistHtml:()=>"Older required proof"};
 vm.createContext(v);vm.runInContext(script,v);
 v.pmsv498Manifest=JSON.parse(JSON.stringify(m));v.pmsv498Ledger=JSON.parse(JSON.stringify(l));
 v.pmsv35Queue=JSON.parse(JSON.stringify(q));v.pmsv35Triage=JSON.parse(JSON.stringify(t));return v;
}
test("533 records, 498 conditionally named routes, 35 outstanding source cases and zero PASS",()=>{
 const c=ctx();assert.equal(c.pmsv498Valid(),true);
 assert.equal(l.records.length,533);assert.equal(l.partial_exact,498);assert.equal(l.first_source_pending,35);
 assert.equal(q.review_records.length,35);assert.equal(t.cases.length,35);
 assert.equal(l.records.filter(x=>x.source_status==="PARTIAL_EXACT_SOURCE_MATCH").length,498);
 assert.equal(l.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").length,35);
 assert.equal(m.product_compliance_approvals,0);assert.equal(m.automatically_assigned_limits,0);
 assert.ok(l.records.every(x=>x.sample_lab_pass===false&&x.product_compliance_approval===false));
});
test("Only cube sugar changes from 497/36; 532 previous product records unchanged",()=>{
 const touched=[];
 for(let i=0;i<533;i++)if(JSON.stringify(prior.records[i])!==JSON.stringify(l.records[i]))touched.push(l.records[i].catalog_id);
 assert.deepEqual(touched,["11-11-1-cube-sugar"]);
 assert.ok(q.review_records.every(x=>x.catalog_id!=="11-11-1-cube-sugar"));
 assert.equal(q.promoted_catalog_ids.at(-1),"11-11-1-cube-sugar");
});
test("Cube sugar strict chromium source, no total-ash substitution for lead",()=>{
 const x=m.routes[0];
 assert.equal(x.fssr_identity_clause,"2.8.1(5) CUBE SUGAR");
 assert.deepEqual(x.article_source_values.map(v=>[v.contaminant,v.exact_ctr_article,v.limit,v.unit]),
 [["Chromium","Refined sugar",0.02,"mg/kg"]]);
 assert.match(x.specific_prohibited_transfers.join(" "),/total ash 0.03% with CTR lead sulphated ash/);
 assert.equal(x.finished_sulphated_ash_measured,false);
 assert.equal(x.numeric_limits_auto_assigned,false);
});
test("35 remaining source dossiers preserve four original requests each and zero future activation",()=>{
 assert.equal(t.source_document_requests,140);assert.equal(t.future_amendment_still_not_effective_until,"2026-12-01");
 assert.equal(t.future_rule_automatic_application,false);
 for(const x of t.cases){
  assert.equal(x.source_documents_needed.length,4);
  assert.equal(x.source_status,"FIRST_EXACT_SOURCE_PENDING");
  assert.equal(x.actual_finished_article_confirmed,false);assert.equal(x.numeric_limit_assigned,false);
  assert.equal(x.laboratory_test_verified,false);assert.equal(x.regulatory_approved,false);
 }
});
test("Source tampering, invalid identity, approved lab lot and missing pending cases fail closed",()=>{
 const changes=[
  c=>c.pmsv498Manifest.routes[0].article_source_values[0].limit=0.5,
  c=>c.pmsv498Manifest.routes[0].finished_sulphated_ash_measured=true,
  c=>c.pmsv498Ledger.records.find(x=>x.catalog_id==="11-11-1-cube-sugar").sample_lab_pass=true,
  c=>c.pmsv35Queue.review_records.pop(),
  c=>c.pmsv35Triage.cases[4].regulatory_approved=true,
  c=>c.pmsv498Manifest.product_compliance_approvals=1
 ];
 for(const mutate of changes){const c=ctx();mutate(c);assert.equal(c.pmsv498Valid(),false);}
});
test("Effective 498/35 panel first, earlier historical research accessible but collapsed",()=>{
 const c=ctx();const x=m.routes[0];
 const p={id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs};
 const h=c.sourcePinned121ResearchProofHtml(p);
 assert.match(h,/533\/533 reviewed · 35 cases researched/);
 assert.match(h,/Chromium/);assert.match(h,/Historical FSSAI source research/);
 assert.match(h,/Archive/);
 assert.equal(c.pmsvCurrent116ProofChecklistHtml(p),"");
 const y=t.cases[0];
 assert.match(c.pmsv498LatestHtml({id:y.catalog_id,name:y.product_name,fssr:y.fssr,fcs:y.fcs}),/Missing exact named finished-article evidence/);
});
test("Module load order after effective 497 and legacy 36 triage but before nutrition",()=>{
 const h=fs.readFileSync(path.join(root,"index.html"),"utf8");
 assert.ok(h.indexOf("fssai-current36-effective-source-triage-2026-10-13.js")<h.indexOf("fssai-current-first-source-498-35.js"));
 assert.ok(h.indexOf("fssai-current-first-source-498-35.js")<h.indexOf("fssai-nutrition-v476.js"));
});
