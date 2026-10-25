"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const b56=JSON.parse(fs.readFileSync(root+
 "data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
const originals=b56.cases.flatMap(c=>c.gates.map(g=>({
 rank:c.rank,priority:c.priority,product:c.product_name,analyte:c.analyte,
 case_id:c.catalogue_id,request_id:g.request_id,role:g.owner_role,gate:g.gate_code,
 evidence:g.required_evidence,dependencies:g.dependency_codes.join(", "),
 routing:g.dependency_codes.length?"WAIT_FOR_UPSTREAM_EVIDENCE":"REQUEST_PREPARATION_POSSIBLE",
 original_request_status:g.immutable_request_state,
 original_document_status:g.immutable_document_state
})));
assert.equal(originals.length,175);
let closureChecks=0,ledgerChecks=0,sourceLoads=0,summaryAudits=0;
const window={
 pmsvB58OwnerOutreach:{
  valid:()=>{ledgerChecks++;return true},records:()=>originals
 },
 pmsvB87Catalogue:{
  closureVerified:()=>{closureChecks++;return true},
  load:async()=>{sourceLoads++;return true},
  closedResearchSummary:()=>{summaryAudits++;return ({
   catalogue:533,public_source_desk_research_closed:35,public_source_desk_research_open:0,
   external_legal_and_lot_verification_held:35,signed_product_limits:0,
   validated_lab_lot_pass:0,product_releases:0
  })}
 }
};
const document={readyState:"loading",addEventListener(){},getElementById(){return null}};
const ctx=vm.createContext({window,document,console,setTimeout});
for(const name of [
 "pmsv-batch98-source-authentication-handoff-2026-10-25.js",
 "pmsv-batch99-downstream-evidence-dependency-audit-2026-10-25.js",
 "pmsv-batch100-independent-review-exception-register-2026-10-25.js"
])vm.runInContext(fs.readFileSync(root+name,"utf8"),ctx);
(async()=>{
 const b98=window.pmsvB98Handoff,b99=window.pmsvB99DownstreamAudit,
  b100=window.pmsvB100Exceptions;
 assert.equal(await b100.load(),true);
 assert.equal(sourceLoads,0,"Ready B87 research should not be reloaded by downstream verifier");
 assert.equal(summaryAudits,1,"One Batch100 load must reuse the one fully verified B87 summary");
 assert(closureChecks<=5,"Single Batch100 load must not re-verify full legal-source graph >5 times: "+closureChecks);
 assert(ledgerChecks<=5,"Single load must not re-read frozen evidence ledger >5 times: "+ledgerChecks);
 const count=summaryAudits,held=b100.issues();
 assert.equal(held.length,105);
 assert.equal(summaryAudits,count+1,"A separate user-visible inquiry revalidates source fresh");
 assert.equal(new Set(held.map(r=>r.request_id)).size,105);
 assert(held.every(r=>r.original_evidence==="NOT_SENT_NOT_RECEIVED"&&
  r.commercial_decision==="HELD_NO_APPROVAL_OR_PASS"));
 assert.equal(b100.summary().approved,0);
 const r=held.find(x=>x.role==="REGULATORY_AFFAIRS_LEGAL");
 assert(r);
 const issue={
  issue_code:"SOURCE_ORIGIN_UNCONFIRMED",criticality:"BLOCKING",
  stage:"OPEN",ticket_ref:"FOLLOWUP-102",
  next_action:"Confirm current manufacturer source",review_by:"2026-11-02"
 };
 assert.equal(b100.save(r.request_id,issue,false).ok,true);
 assert.equal(b100.exportCSV().trim().split("\r\n").length,106);
 const maker={ref:"MANUFACTURER-102",version:"V1",issue_date:"2026-10-20",
  sha256:"e".repeat(64),origin_check_ref:"EXTERNAL-ISSUER-102"};
 const blank={ref:"",version:"",issue_date:"",sha256:"",origin_check_ref:""};
 const no={state:"NOT_PREPARED",reference:"",date:""};
 assert.equal(b98.save(r.case_id,{manufacturer:maker,method:blank,
  regulatory:no,laboratory:no}).ok,true);
 assert.equal(b100.issues().find(x=>x.request_id===r.request_id).source_binding,
  "STALE_RECHECK_REQUIRED");
 assert.equal(b100.save(r.request_id,issue,false).ok,false);
 assert.equal(b100.save(r.request_id,issue,true).reanchored,true);
 originals[0].original_document_status="RECEIVED";
 assert.equal(b98.cases().length,0);
 assert.equal(b99.rows().length,0);
 assert.equal(b100.sourceValid(),false);
 assert.equal(b100.issues().length,0);
 assert.equal(b100.exportCSV(),"");
 assert.equal(b100.exportJSON(),"");
 originals[0].original_document_status="NOT_RECEIVED";
 assert.equal(b100.sourceValid(),true);
 assert(originals.every(x=>x.original_request_status==="NOT_SENT"&&
  x.original_document_status==="NOT_RECEIVED"));
 console.log("Batch102/103 PASS: full source summary verifications reduced to "+count+
  " per review load, 105 original HELD requests, renewed verification on each action, stale-source hold and tamper fail-closed.");
})().catch(err=>{console.error(err);process.exitCode=1});
