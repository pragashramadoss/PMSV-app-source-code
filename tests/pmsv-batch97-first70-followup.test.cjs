"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const b56=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
const rows=b56.cases.flatMap(c=>c.gates.map(g=>({
 rank:c.rank,priority:c.priority,product:c.product_name,analyte:c.analyte,
 case_id:c.catalogue_id,request_id:g.request_id,role:g.owner_role,gate:g.gate_code,
 evidence:g.required_evidence,
 routing:g.dependency_codes.length?"WAIT_FOR_UPSTREAM_EVIDENCE":"REQUEST_PREPARATION_POSSIBLE",
 original_request_status:g.immutable_request_state,
 original_document_status:g.immutable_document_state
})));
assert.equal(rows.length,175);
const document={readyState:"loading",addEventListener(){},getElementById(){return null}};
const window={
 pmsvB58OwnerOutreach:{valid:()=>true,records:()=>rows},
 pmsvB87Catalogue:{
  closureVerified:()=>true,load:async()=>true,
  closedResearchSummary:()=>({catalogue:533,public_source_desk_research_closed:35,
    external_legal_and_lot_verification_held:35,product_releases:0,
    signed_product_limits:0,validated_lab_lot_pass:0})
 }
};
const js=fs.readFileSync(root+"pmsv-batch97-first70-followup-2026-10-25.js","utf8");
vm.runInNewContext(js,{window,document,console,setTimeout});
const api=window.pmsvB97Followup;
assert(api&&api.sourceValid());
const original=api.records();
assert.equal(original.length,70);
assert.equal(new Set(original.map(r=>r.request_id)).size,70);
assert.equal(original.filter(r=>r.role==="FSSAI_QA_DIVISION_AND_LAB_DIRECTOR").length,35);
assert.equal(original.filter(r=>r.role==="MANUFACTURER_OR_SUPPLIER_QA").length,35);
assert(original.every(r=>r.source_request_status==="NOT_SENT"&&r.source_document_status==="NOT_RECEIVED"));
assert(!js.includes("localStorage"));
assert(!js.includes("sessionStorage"));
(async()=>{
 assert.equal(await api.load(),true);
 const blank=api.csv(true);
 assert.equal(blank.trim().split("\r\n").length,71);
 assert.equal(api.summary().NOT_PREPARED,70);
 const r=original[0];
 const outbound={operator_followup_state:"SENT_SELF_REPORTED",
  outbound_reference:"EMAIL-REQUEST-1",sent_date:"2026-10-25",
  response_reference:"",response_date:"",next_followup_date:"2026-10-30"};
 assert.equal(api.capture(r.request_id,outbound),true);
 assert.equal(api.summary().SENT_SELF_REPORTED,1);
 assert.equal(api.summary().NOT_PREPARED,69);
 const sentCSV=api.csv();
 assert.match(sentCSV,/SENT_SELF_REPORTED/);
 assert.equal(api.importCSV(sentCSV).ok,true);
 assert.equal(api.summary().SENT_SELF_REPORTED,1);
 // Stage can be upgraded only with a response reference and real ordered date.
 const receipt={...outbound,operator_followup_state:"RESPONSE_SELF_REPORTED",
  response_reference:"REPLY-1",response_date:"2026-10-26"};
 assert.equal(api.capture(r.request_id,receipt),true);
 assert.equal(api.summary().RESPONSE_SELF_REPORTED,1);
 assert.equal(api.capture(r.request_id,{...receipt,response_date:"2026-10-20"}),false);
 assert.equal(api.capture(r.request_id,{...receipt,response_reference:"=HYPERLINK(A1)"}),false);
 assert.equal(api.capture(r.request_id,{...outbound,sent_date:"2026-02-30"}),false);
 assert.equal(api.summary().RESPONSE_SELF_REPORTED,1);
 const before=api.csv();
 // Altering immutable source status in an imported CSV must reject atomically.
 const bad=before.replace('"NOT_SENT"','"SENT"');
 assert.equal(api.importCSV(bad).ok,false);
 assert.equal(api.csv(),before);
 // Duplicating a source proof ID in the live workbench also fails closed.
 const preserved=rows[1].request_id;
 rows[1].request_id=rows[0].request_id;
 assert.equal(api.sourceValid(),false);
 assert.equal(api.csv(),"");
 rows[1].request_id=preserved;
 assert.equal(api.sourceValid(),true);
 // Public research never changes its original unsent/unreceived facts.
 assert.equal(rows[0].original_request_status,"NOT_SENT");
 assert.equal(rows[0].original_document_status,"NOT_RECEIVED");
 console.log("Batch97 PASS: 70 original first-actions / 105 blocked, strict operator-only status notes, validated import/export and fail-closed immutable source checks.");
})().catch(e=>{console.error(e);process.exitCode=1;});
