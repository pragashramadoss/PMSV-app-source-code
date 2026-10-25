"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const triage=JSON.parse(fs.readFileSync(root+
 "data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
const rows=triage.cases.flatMap(c=>c.gates.map(g=>({
 rank:c.rank,priority:c.priority,product:c.product_name,analyte:c.analyte,
 case_id:c.catalogue_id,request_id:g.request_id,role:g.owner_role,gate:g.gate_code,
 evidence:g.required_evidence,dependencies:g.dependency_codes.join(", "),
 routing:g.dependency_codes.length?"WAIT_FOR_UPSTREAM_EVIDENCE":"REQUEST_PREPARATION_POSSIBLE",
 original_request_status:g.immutable_request_state,
 original_document_status:g.immutable_document_state
})));
assert.equal(rows.length,175);
const index=fs.readFileSync(root+"index.html","utf8");
const loader=fs.readFileSync(root+"pmsv-batch99-downstream-evidence-dependency-audit-2026-10-25.js","utf8");
assert(index.includes("pmsv-batch99-downstream-evidence-dependency-audit-2026-10-25.js"));
assert(loader.includes("pmsv-batch100-independent-review-exception-register-2026-10-25.js"));
const MOCK_SUMMARY={
 catalogue:533,public_source_desk_research_closed:35,public_source_desk_research_open:0,
 external_legal_and_lot_verification_held:35,signed_product_limits:0,
 validated_lab_lot_pass:0,product_releases:0
};
function session(){
 const document={readyState:"loading",addEventListener(){},getElementById(){return null}};
 const window={
  pmsvB58OwnerOutreach:{valid:()=>true,records:()=>rows},
  pmsvB87Catalogue:{closureVerified:()=>true,load:async()=>true,
   closedResearchSummary:()=>MOCK_SUMMARY}
 };
 const ctx=vm.createContext({window,document,console,setTimeout});
 for(const script of [
  "pmsv-batch98-source-authentication-handoff-2026-10-25.js",
  "pmsv-batch99-downstream-evidence-dependency-audit-2026-10-25.js",
  "pmsv-batch100-independent-review-exception-register-2026-10-25.js"
 ])vm.runInContext(fs.readFileSync(root+script,"utf8"),ctx);
 return {window,b98:window.pmsvB98Handoff,b99:window.pmsvB99DownstreamAudit,
  b100:window.pmsvB100Exceptions};
}
const doc=(ref,version,sha)=>({
 ref,version,issue_date:"2026-10-20",sha256:sha.repeat(64),
 origin_check_ref:"EXTERNAL-ISSUER-CHECK-1"
});
const handoff={state:"NOT_PREPARED",reference:"",date:""};
const input={
 issue_code:"SOURCE_ORIGIN_UNCONFIRMED",criticality:"BLOCKING",stage:"OPEN",
 ticket_ref:"TRACKER-100",next_action:"Authenticate manufacturer source independently",
 review_by:"2026-11-01"
};
(async()=>{
 const {b98,b99,b100}=session();
 assert(b100&&b100.sourceValid());
 assert.equal(await b100.load(),true);
 assert.equal(b99.rows().length,105);
 let a=b100.issues(),s=b100.summary();
 assert.equal(a.length,105);
 assert.equal(new Set(a.map(x=>x.request_id)).size,105);
 assert.equal(s.held,105);assert.equal(s.recorded,0);assert.equal(s.approved,0);
 assert.equal(s.regulatory,35);assert.equal(s.laboratory,35);assert.equal(s.qa,35);
 assert(a.every(x=>x.commercial_decision==="HELD_NO_APPROVAL_OR_PASS"&&
  x.original_evidence==="NOT_SENT_NOT_RECEIVED"));
 assert.equal(b100.exportCSV().trim().split("\r\n").length,106);
 const reg=a.find(x=>x.role==="REGULATORY_AFFAIRS_LEGAL");
 const lab=a.find(x=>x.case_id===reg.case_id&&x.role==="LABORATORY_TECHNICAL_MANAGER");
 assert(reg&&lab);
 assert.equal(b100.save(reg.request_id,{...input,stage:"CLOSED"},false).ok,false);
 assert.equal(b100.save(reg.request_id,{...input,ticket_ref:"=SUM(A1)"},false).ok,false);
 assert.equal(b100.save(reg.request_id,input,false).ok,true);
 assert.equal(b100.save(lab.request_id,{...input,issue_code:"METHOD_MATRIX_SCOPE_LOQ_GAP"},false).ok,true);
 assert.equal(b100.save(reg.request_id,input,false).unchanged,true);
 assert.equal(b100.summary().recorded,2);
 const m1=doc("MFG-100","V1","a"),f1=doc("METHOD-100","V1","b");
 const first=b98.save(reg.case_id,{manufacturer:m1,method:f1,
  regulatory:handoff,laboratory:handoff});
 assert.equal(first.ok,true);
 assert.equal(b100.issues().filter(x=>x.source_binding==="STALE_RECHECK_REQUIRED").length,2);
 assert.equal(b100.save(reg.request_id,input,false).ok,false);
 assert.equal(b100.save(reg.request_id,input,true).reanchored,true);
 assert.equal(b100.save(lab.request_id,{...input,issue_code:"METHOD_MATRIX_SCOPE_LOQ_GAP"},true).reanchored,true);
 assert.equal(b100.summary().stale,0);
 // A method-only revision stales Laboratory and QA, not Regulatory source identity.
 const second=b98.save(reg.case_id,{manufacturer:m1,method:doc("METHOD-100","V2","c"),
  regulatory:handoff,laboratory:handoff});
 assert.equal(second.ok,true);
 assert.equal(b100.issues().find(x=>x.request_id===reg.request_id).source_binding,
  "LOCAL_SOURCE_MATCH");
 assert.equal(b100.issues().find(x=>x.request_id===lab.request_id).source_binding,
  "STALE_RECHECK_REQUIRED");
 assert.equal(b100.summary().approved,0);
 const json=b100.exportJSON();
 assert.equal(b100.exportCSV().trim().split("\r\n").length,106);
 assert(!b100.exportCSV().includes('"APPROVED"'));
 assert.equal(b100.importJSON(json).ok,false); // Never overwrite local entries.
 const restored=session();
 assert.equal(await restored.b100.load(),true);
 const broken=JSON.parse(json);broken.inventory[0].role="WRONG_ROLE";
 assert.equal(restored.b100.importJSON(JSON.stringify(broken)).ok,false);
 const approved=JSON.parse(json);approved.histories[0].entries[0].stage="APPROVED";
 assert.equal(restored.b100.importJSON(JSON.stringify(approved)).ok,false);
 const imported=restored.b100.importJSON(json);
 assert.equal(imported.ok,true);assert.equal(imported.requests,2);
 assert.equal(restored.b100.summary().recorded,2);
 // Without importing external Batch98 originals, previous issue versions are stale.
 assert.equal(restored.b100.summary().stale,2);
 rows[0].original_document_status="RECEIVED";
 assert.equal(b100.sourceValid(),false);
 assert.equal(b100.issues().length,0);
 assert.equal(b100.exportCSV(),"");
 assert.equal(b100.exportJSON(),"");
 rows[0].original_document_status="NOT_RECEIVED";
 assert.equal(b100.sourceValid(),true);
 assert(rows.every(x=>x.original_request_status==="NOT_SENT"&&
  x.original_document_status==="NOT_RECEIVED"));
 console.log("Batch100 PASS: original 105 HELD gates, role-specific source snapshots, staleness/re-anchor, fail-closed import, 0 approval or releases.");
})().catch(err=>{console.error(err);process.exitCode=1});
