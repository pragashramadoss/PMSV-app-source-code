"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const base="fssai-product-helper-preview-01/";
const b56=JSON.parse(fs.readFileSync(base+
 "data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
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
function setup(isWarm){
 const originals=frozen.map(r=>({...r}));
 let ready=isWarm,loads=0,audits=0;
 const window={
  pmsvB58OwnerOutreach:{valid:()=>true,records:()=>originals},
  pmsvB87Catalogue:{
   load:async()=>{loads++;ready=true;return true},
   closedResearchSummary:()=>{audits++;return ready?summary:null}
  }
 };
 const document={readyState:"loading",addEventListener(){},getElementById(){return null}};
 const ctx=vm.createContext({window,document,setTimeout,console});
 for(const name of [
  "pmsv-batch98-source-authentication-handoff-2026-10-25.js",
  "pmsv-batch99-downstream-evidence-dependency-audit-2026-10-25.js",
  "pmsv-batch100-independent-review-exception-register-2026-10-25.js"
 ])vm.runInContext(fs.readFileSync(base+name,"utf8"),ctx);
 return{window,originals,count:()=>({loads,audits})};
}
(async()=>{
 const warm=setup(true);
 assert.equal(await warm.window.pmsvB100Exceptions.load(),true);
 assert.equal(warm.count().loads,0,"Do not refetch already-authenticated B87 research");
 assert.equal(warm.count().audits,1,"One verified source summary per chained load");
 assert.equal(warm.window.pmsvB100Exceptions.issues().length,105);
 assert.equal(warm.count().audits,2,"Separate public issue inquiry revalidates independently");
 warm.originals[0].original_document_status="RECEIVED";
 assert.equal(warm.window.pmsvB100Exceptions.sourceValid(),false);
 assert.equal(warm.window.pmsvB100Exceptions.issues().length,0);
 const cold=setup(false);
 assert.equal(await cold.window.pmsvB100Exceptions.load(),true);
 assert.equal(cold.count().loads,1,"Cold B87 research must still be loaded and verified");
 assert.equal(cold.count().audits,2,"Cold path: missing check then verified summary");
 assert.equal(cold.window.pmsvB100Exceptions.summary().held,105);
 assert.equal(cold.window.pmsvB100Exceptions.summary().approved,0);
 assert(cold.originals.every(r=>r.original_request_status==="NOT_SENT"&&
  r.original_document_status==="NOT_RECEIVED"));
 console.log("Batch103 PASS: warm path 1 source graph, cold path 1 verified research load; 105 HELD requests, fresh public checks, no approvals.");
})().catch(e=>{console.error(e);process.exitCode=1});
