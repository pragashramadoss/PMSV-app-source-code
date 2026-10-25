"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const b56=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
const rows=b56.cases.flatMap(c=>c.gates.map(g=>({
 rank:c.rank,priority:c.priority,product:c.product_name,analyte:c.analyte,
 case_id:c.catalogue_id,request_id:g.request_id,role:g.owner_role,gate:g.gate_code,
 evidence:g.required_evidence,dependencies:g.dependency_codes.join(", "),
 routing:g.dependency_codes.length?"WAIT_FOR_UPSTREAM_EVIDENCE":"REQUEST_PREPARATION_POSSIBLE",
 original_request_status:g.immutable_request_state,original_document_status:g.immutable_document_state
})));
assert.equal(rows.length,175);
const document={readyState:"loading",addEventListener(){},getElementById(){return null}};
const window={
 pmsvB58OwnerOutreach:{valid:()=>true,records:()=>rows},
 pmsvB87Catalogue:{closureVerified:()=>true,load:async()=>true,
  closedResearchSummary:()=>({catalogue:533,public_source_desk_research_closed:35,
   public_source_desk_research_open:0,external_legal_and_lot_verification_held:35,
   signed_product_limits:0,validated_lab_lot_pass:0,product_releases:0})}
};
const js=fs.readFileSync(root+"pmsv-batch98-source-authentication-handoff-2026-10-25.js","utf8");
vm.runInNewContext(js,{window,document,console,setTimeout});
const api=window.pmsvB98Handoff;
assert(api&&api.sourceValid());
const cases=api.cases();
assert.equal(cases.length,35);
assert.equal(new Set(cases.map(x=>x.id)).size,35);
const all=cases.flatMap(c=>Object.values(c.requests).map(r=>r.id));
assert.equal(new Set(all).size,175);
assert.equal(cases.filter(x=>x.priority==="P0").length,13);
assert.equal(cases.filter(x=>x.priority==="P1").length,22);
assert(js.includes('crypto.subtle.digest'));
assert(!js.includes("localStorage"));
assert(!js.includes("sessionStorage"));
const doc=(ref="MFG-DOC-001",revision="V1")=>({
 ref,version:revision,issue_date:"2026-10-20",
 sha256:"a".repeat(64),origin_check_ref:"ISSUER-CONFIRM-01"
});
const none={ref:"",version:"",issue_date:"",sha256:"",origin_check_ref:""};
const no={state:"NOT_PREPARED",reference:"",date:""};
const draft={state:"DRAFT_READY",reference:"",date:""};
(async()=>{
 assert.equal(await api.load(),true);
 const id=cases[0].id;
 assert.equal(api.stats().revised,0);
 // Manufacturer controlled metadata can be staged without implying authenticity.
 const r1=api.save(id,{manufacturer:doc(),method:none,regulatory:draft,laboratory:no});
 assert.equal(r1.ok,true);assert.equal(r1.revision,1);
 assert(api.packet(id,"regulatory").includes("UNSENT, UNAUTHENTICATED"));
 assert.equal(api.packet(id,"laboratory"),"");
 // First method version after a reviewer handoff must invalidate that earlier handoff.
 const r2=api.save(id,{manufacturer:doc(),method:doc("METHOD-DOC-001"),
  regulatory:draft,laboratory:draft});
 assert.equal(r2.ok,true);assert.equal(r2.reset,true);
 assert.equal(api.latest(id).regulatory.state,"NOT_PREPARED");
 assert.equal(api.latest(id).laboratory.state,"NOT_PREPARED");
 assert(api.packet(id,"laboratory").includes("NABL scope"));
 // Same sources with freshly prepared reviewer draft can be saved as new revision.
 const r3=api.save(id,{manufacturer:doc(),method:doc("METHOD-DOC-001"),
  regulatory:draft,laboratory:draft});
 assert.equal(r3.ok,true);assert.equal(r3.revision,3);
 assert.equal(api.latest(id).laboratory.state,"DRAFT_READY");
 // Source revision change automatically resets BOTH, preserving prior revision.
 const r4=api.save(id,{manufacturer:doc("MFG-DOC-001","V2"),method:doc("METHOD-DOC-001"),
  regulatory:draft,laboratory:draft});
 assert.equal(r4.ok,true);assert.equal(r4.reset,true);
 assert.equal(api.latest(id).regulatory.state,"NOT_PREPARED");
 assert.equal(api.latest(id).laboratory.state,"NOT_PREPARED");
 assert.equal(api.latest(id).revision,4);
 // A hash alone is never enough to prepare a handoff.
 assert.equal(api.save(cases[1].id,{manufacturer:{...doc(),origin_check_ref:""},
  method:none,regulatory:draft,laboratory:no}).ok,false);
 assert.equal(api.save(cases[1].id,{manufacturer:{...doc(),sha256:"XYZ"},
  method:none,regulatory:no,laboratory:no}).ok,false);
 const original=api.exportJSON();
 const parsed=JSON.parse(original);
 assert.equal(parsed.cases.length,35);
 assert.equal(parsed.cases[0].versions.length,4);
 assert.equal(api.importJSON(original).ok,true);
 assert.equal(api.latest(id).revision,4);
 // Altering original role request IDs rejects the entire transfer without loss.
 const changed=JSON.parse(original);
 changed.cases[0].requests[0]="FAKE-PROOF-ID";
 assert.equal(api.importJSON(JSON.stringify(changed)).ok,false);
 assert.equal(api.exportJSON().includes("FAKE-PROOF-ID"),false);
 // Forged approval flag or unreset reviewer state in version history rejects.
 const falseApproval=JSON.parse(original);
 falseApproval.cases[0].versions[0].approved=true;
 assert.equal(api.importJSON(JSON.stringify(falseApproval)).ok,false);
 const forged=JSON.parse(original);
 forged.cases[0].versions[3].laboratory.state="DRAFT_READY";
 assert.equal(api.importJSON(JSON.stringify(forged)).ok,false);
 assert.equal(api.latest(id).revision,4);
 // Source tampering fails closed; existing original evidence remains UNRECEIVED.
 const prior=rows[0].original_document_status;
 rows[0].original_document_status="RECEIVED";
 assert.equal(api.sourceValid(),false);
 assert.equal(api.exportJSON(),"");
 rows[0].original_document_status=prior;
 assert.equal(api.sourceValid(),true);
 assert(rows.every(x=>x.original_request_status==="NOT_SENT"&&
  x.original_document_status==="NOT_RECEIVED"));
 console.log("Batch98 PASS: 35 HELD source identities, 175 requests, SHA/version metadata, source-change reset, isolated Regulatory/Lab drafts, atomic tamper-proof import.");
})().catch(e=>{console.error(e);process.exitCode=1;});
