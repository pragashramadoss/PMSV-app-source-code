"use strict";
/* Batch119: preserve temporary 70 original request notes by warning only when
 * true unsaved local self-reported edits exist. No server or persistent storage. */
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const code=fs.readFileSync(root+"pmsv-batch97-first70-followup-2026-10-25.js","utf8");
const b56=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
function setup(){
 const rows=b56.cases.flatMap(c=>c.gates.map(g=>({
  rank:c.rank,priority:c.priority,product:c.product_name,analyte:c.analyte,
  case_id:c.catalogue_id,request_id:g.request_id,role:g.owner_role,gate:g.gate_code,
  evidence:g.required_evidence,
  routing:g.dependency_codes.length?"WAIT_FOR_UPSTREAM_EVIDENCE":"REQUEST_PREPARATION_POSSIBLE",
  original_request_status:g.immutable_request_state,
  original_document_status:g.immutable_document_state
 })));
 const documentHandlers={},windowHandlers={};let clicks=0;
 const document={readyState:"loading",getElementById:()=>null,
  addEventListener:(t,fn)=>{documentHandlers[t]=fn},
  createElement:()=>({setAttribute(){},click(){clicks++},remove(){}}),
  body:{appendChild(){}}
 };
 const window={addEventListener:(t,fn)=>{windowHandlers[t]=fn},
  pmsvB58OwnerOutreach:{valid:()=>true,records:()=>rows},
  pmsvB87Catalogue:{closureVerified:()=>true,load:async()=>true,
   closedResearchSummary:()=>({catalogue:533,public_source_desk_research_closed:35,
    external_legal_and_lot_verification_held:35,product_releases:0,
    signed_product_limits:0,validated_lab_lot_pass:0})}};
 const URL={createObjectURL:()=>"blob:local-draft",revokeObjectURL(){}};
 vm.runInNewContext(code,{document,window,URL,Blob,setTimeout:fn=>fn(),console});
 const api=window.pmsvB97Followup;
 const act=which=>{
  const button={hasAttribute:k=>k==="data-b97-"+which};
  documentHandlers.click({target:{closest:q=>q==="#pmsv-b97-first70-followup button"?button:null}});
 };
 const exit=()=>{
  let prevented=false,event={returnValue:null,preventDefault(){prevented=true}};
  windowHandlers.beforeunload(event);return{prevented,returnValue:event.returnValue};
 };
 return{api,rows,act,exit,getClicks:()=>clicks};
}
function note(state="DRAFT_READY"){
 const details={operator_followup_state:state,outbound_reference:"",
  sent_date:"",response_reference:"",response_date:"",next_followup_date:""};
 if(state==="SENT_SELF_REPORTED"){
  details.outbound_reference="REQ-1";details.sent_date="2026-10-27";
 }
 return details;
}
test("source-verified empty state does not trigger exit warning",async()=>{
 const h=setup();assert.equal(await h.api.load(),true);
 assert.equal(h.api.sourceValid(),true);
 assert.equal(h.api.needsExport(),false);
 assert.equal(h.exit().prevented,false);
 assert.equal(h.api.records().length,70);
});
test("draft edit triggers warning; exporting actual 70-row notes clears it",async()=>{
 const h=setup();await h.api.load();
 const id=h.api.records()[0].request_id;
 assert.equal(h.api.capture(id,note()),true);
 assert.equal(h.api.needsExport(),true);
 assert.equal(h.exit().prevented,true);
 assert.equal(h.exit().returnValue,"");
 h.act("export");
 assert.equal(h.getClicks(),1);
 assert.equal(h.api.needsExport(),false);
 assert.equal(h.exit().prevented,false);
 assert.equal(h.api.capture(id,note("SENT_SELF_REPORTED")),true);
 assert.equal(h.api.needsExport(),true);
});
test("blank template never falsely marks unsaved changes as exported",async()=>{
 const h=setup();await h.api.load();const id=h.api.records()[0].request_id;
 h.api.capture(id,note());
 h.act("template");
 assert.equal(h.getClicks(),1);
 assert.equal(h.api.needsExport(),true);
 assert.equal(h.exit().prevented,true);
});
test("trusted 70-row CSV import becomes the backed-up baseline; changes are dirty",async()=>{
 const h=setup();await h.api.load();const id=h.api.records()[0].request_id;
 h.api.capture(id,note());const csv=h.api.csv();
 assert.equal(h.api.importCSV(csv).ok,true);
 assert.equal(h.api.needsExport(),false);
 h.api.capture(id,note("SENT_SELF_REPORTED"));
 assert.equal(h.api.needsExport(),true);
 const tampered=csv.replace('"NOT_SENT"','"SENT"');
 assert.equal(h.api.importCSV(tampered).ok,false);
 assert.equal(h.api.needsExport(),true,"Failed import cannot silently mark notes saved");
});
test("reset of every note to NOT_PREPARED clears warning, never original 35 holds",async()=>{
 const h=setup();await h.api.load();const id=h.api.records()[0].request_id;
 h.api.capture(id,note());
 assert.equal(h.api.capture(id,note("NOT_PREPARED")),true);
 assert.equal(h.api.needsExport(),false);
 assert.equal(h.exit().prevented,false);
 assert.equal(b56.totals.open_ctr_cases,35);
 assert.equal(b56.totals.received_documents,0);
 assert.equal(b56.totals.approved_ctr_articles,0);
 assert.equal(b56.totals.lot_passes,0);
});
test("all backup is local, no automatic message or persistence",()=>{
 assert.ok(code.includes('window.addEventListener?.("beforeunload"'));
 assert.ok(code.includes("data-b119-backup"));
 assert.ok(!code.includes("localStorage"));
 assert.ok(!code.includes("sessionStorage"));
 assert.ok(!code.includes("fetch("));
});
