"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const dir="fssai-product-helper-preview-01/";
const source=fs.readFileSync(dir+"pmsv-batch98-source-authentication-handoff-2026-10-25.js","utf8");
const downstream=fs.readFileSync(dir+"pmsv-batch99-downstream-evidence-dependency-audit-2026-10-25.js","utf8");
const reviewer=fs.readFileSync(dir+"pmsv-batch100-independent-review-exception-register-2026-10-25.js","utf8");
const b56=JSON.parse(fs.readFileSync(dir+"data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
const frozen=b56.cases.flatMap(c=>c.gates.map(g=>({
 rank:c.rank,priority:c.priority,product:c.product_name,analyte:c.analyte,
 case_id:c.catalogue_id,request_id:g.request_id,role:g.owner_role,gate:g.gate_code,
 evidence:g.required_evidence,dependencies:g.dependency_codes.join(", "),
 routing:g.dependency_codes.length?"WAIT_FOR_UPSTREAM_EVIDENCE":"REQUEST_PREPARATION_POSSIBLE",
 original_request_status:g.immutable_request_state,
 original_document_status:g.immutable_document_state
})));
assert.equal(frozen.length,175);
const summary={catalogue:533,public_source_desk_research_closed:35,
 public_source_desk_research_open:0,external_legal_and_lot_verification_held:35,
 signed_product_limits:0,validated_lab_lot_pass:0,product_releases:0};
const doc={readyState:"loading",addEventListener(){},getElementById(){return null}};
function setup(coreState,alreadyLoaded=false){
 let calls=0,loaded=alreadyLoaded;
 const window={
  pmsvB58OwnerOutreach:{valid:()=>true,records:()=>frozen},
  pmsvB70ExtendedResearch:{getState:()=>({core:coreState()})},
  pmsvB87Catalogue:{
   closedResearchSummary:()=>loaded?summary:null,
   load:async()=>{calls++;loaded=true;return true}
  }
 };
 const context=vm.createContext({window,document:doc,console,
  setTimeout:(cb,_ms)=>setTimeout(cb,0)});
 vm.runInContext(source,context);
 return{api:window.pmsvB98Handoff,calls:()=>calls};
}
(async()=>{
 let probes=0;
 const waiting=setup(()=>++probes<3?"RUNNING":"READY");
 const first=waiting.api.load();
 assert.equal(waiting.calls(),0,"Click must yield; no B87 cold source load synchronously");
 assert.equal(await waiting.api.load(),false,"Duplicate source handoff suppressed while waiting");
 assert.equal(await first,true,"An eventually READY verified core permits original source handoff");
 assert.equal(waiting.calls(),1,"Only one cold B87 source load occurs");
 assert(probes>=3,"Review handoff must observe core READY, not assume it");
 assert.equal(waiting.api.cases().length,35);
 assert.equal(waiting.api.stats().reg,0);
 assert.equal(waiting.api.stats().lab,0);
 const blocked=setup(()=>"INTEGRITY_BLOCKED");
 assert.equal(await blocked.api.load(),false,"Blocked core cannot open original evidence review");
 assert.equal(blocked.calls(),0,"Do not invoke expensive B87 loader after blocked core");
 assert.equal(blocked.api.exportJSON(),"");
 let polls=0;
 const stuck=setup(()=>{polls++;return"RUNNING"});
 assert.equal(await stuck.api.load(),false,"Stuck core must time out fail-closed");
 assert.equal(polls,61,"Bounded wait probes core for at most 60 seconds");
 assert.equal(stuck.calls(),0,"No B87 load after timeout");
 assert.equal(stuck.api.cases().length,0);
 // A genuinely revalidated existing research summary keeps its previous fast path.
 const warm=setup(()=>"RUNNING",true);
 assert.equal(await warm.api.load(),true);
 assert.equal(warm.calls(),0);
 // User-visible downstream progress must identify the unresolved core prerequisite.
 assert(downstream.includes('data-pmsv-b70-core'));
 assert(reviewer.includes('data-pmsv-b70-core'));
 assert(source.includes("175 requests remain NOT RECEIVED"));
 assert(!source.includes("commercialStatus='APPROVED'"));
 assert(frozen.every(r=>r.original_request_status==="NOT_SENT"&&r.original_document_status==="NOT_RECEIVED"));
 console.log("Batch105 PASS: delayed B22 READY, blocked/timeout fail-closed, no premature B87 loader, 35/175 holds and visible reviewer prerequisite.");
})().catch(err=>{console.error(err);process.exitCode=1});
