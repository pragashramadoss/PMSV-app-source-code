"use strict";
/* Batch116: two role-specific first actions cannot bypass 35-case source hold. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const source=fs.readFileSync(root+"pmsv-batch116-owner-handoff-2026-10-27.js","utf8");
const b58Source=fs.readFileSync(root+"fssai-current35-owner-outreach-batch58-2026-10-17.js","utf8");
const b56=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
const SOURCE="FSSAI_QA_DIVISION_AND_LAB_DIRECTOR",MAKER="MANUFACTURER_OR_SUPPLIER_QA";
function setup(options={}){
 const notes={requests:0,rechecks:0,focus:[],buttons:[{disabled:false},{disabled:false}]};
 const status={textContent:""};
 const panel={querySelector:q=>q==="[data-b116-message]"?status:null,
  querySelectorAll:()=>notes.buttons};
 const review={getState:()=>({extended:options.extended||"READY"}),
  request:async()=>{notes.requests++;return options.requestResult!==false},
  recheck:()=>{notes.rechecks++;return options.recheckResult!==false}};
 const packets={valid:()=>options.valid!==false,
  focusRole:role=>{notes.focus.push(role);return options.focusResult!==false},
  filtered:()=>options.rows||Array.from({length:35},(_,n)=>({
   request_id:"PMSV44-"+String(n+1).padStart(2,"0")+"-01",
   role:notes.focus.at(-1),routing:"REQUEST_PREPARATION_POSSIBLE",
   original_request_status:"NOT_SENT",original_document_status:"NOT_RECEIVED"}))};
 const document={readyState:"loading",addEventListener:()=>{},
  getElementById:id=>id==="pmsv-b116-first70-handoff"?panel:null};
 const window={pmsvB70ExtendedResearch:review,pmsvB58OwnerOutreach:packets};
 vm.runInNewContext(source,{window,document,console});
 return {notes,status,api:window.pmsvB116First70Handoff};
}
test("preparatory source / method packet opens 35 originals without sending",async()=>{
 const s=setup();assert.equal(await s.api.open(SOURCE),true);
 assert.deepEqual(s.notes.focus,[SOURCE]);assert.equal(s.notes.requests,0);
 assert.equal(s.notes.rechecks,1);assert.match(s.status.textContent,/35 verified, UNSENT/);
 assert.ok(s.notes.buttons.every(x=>x.disabled===false));
});
test("manufacturer owner selection explicitly loads extended evidence only on demand",async()=>{
 const s=setup({extended:"NOT_REQUESTED"});
 assert.equal(await s.api.open(MAKER),true);
 assert.equal(s.notes.requests,1);
 assert.deepEqual(s.notes.focus,[MAKER]);
});
test("source recheck failure and invalid owner fail closed",async()=>{
 const s=setup({recheckResult:false});
 assert.equal(await s.api.open(SOURCE),false);
 assert.equal(s.notes.focus.length,0);
 assert.match(s.status.textContent,/Blocked:/);
 assert.equal(await s.api.open("UNKNOWN_ROLE"),false);
 assert.equal(s.notes.requests,0);
});
test("35 wrong-role or apparently sent records are refused",async()=>{
 const invalid=Array.from({length:35},()=>({role:MAKER,routing:"REQUEST_PREPARATION_POSSIBLE",
  original_request_status:"NOT_SENT",original_document_status:"NOT_RECEIVED"}));
 invalid[0].original_request_status="SENT";
 const s=setup({rows:invalid});
 assert.equal(await s.api.open(MAKER),false);
 assert.match(s.status.textContent,/does not reconcile/);
 assert.equal(s.notes.focus.length,1);
});
test("no double-load from simultaneous clicks",async()=>{
 let release;
 const s=setup({extended:"NOT_REQUESTED"});
 const c=s.api;
 // The normal load path is intentionally asynchronous; overlapping calls must fail.
 const pending=c.open(SOURCE);
 assert.equal(await c.open(MAKER),false);
 assert.equal(await pending,true);
 assert.equal(s.notes.requests,1);
});
test("Batch58 owner filtering: exactly 35 requests per role, 13 P0 and 22 P1",()=>{
 const fields=new Map();
 const view={id:"standard"};
 const panel={open:false,closest:()=>view,scrollIntoView:()=>{},
  querySelector:q=>{
   if(!fields.has(q))fields.set(q,{value:"",innerHTML:"",textContent:""});
   return fields.get(q);
  }};
 let clicked=0;
 const document={addEventListener:()=>{},
  getElementById:id=>id==="pmsv-b58-owner-packets"?panel:
   id==="pmsv-b57-source-lab-authentication"?{}:null,
  querySelector:q=>q==='nav.tabs .tab[data-tab="standard"]'?{click:()=>clicked++}:null};
 const mirror=b56.cases.map(c=>({catalogue_id:c.catalogue_id,rank:c.rank,priority:c.priority,
  product_name:c.product_name,analyte:c.analyte,
  gates:c.gates.map(g=>({request_id:g.request_id,owner_role:g.owner_role,gate_code:g.gate_code}))}));
 const context={document,window:{},pmsvLoadPositiveSourceProof:async()=>{},
  pmsvB56Data:structuredClone(b56),pmsvB57PlusData:{totals:{authentication_points:1470,
  actual_tested_lot_passes:0},case_dossiers:mirror},pmsvB56Valid:()=>true,
  pmsvB57Valid:()=>true,pmsvB57PlusValid:()=>true};
 vm.runInNewContext(b58Source,context);
 const api=context.window.pmsvB58OwnerOutreach;
 assert.equal(api.valid(),true);
 for(const role of [SOURCE,MAKER]){
  assert.equal(api.focusRole(role),true);
  const rows=api.filtered();
  assert.equal(rows.length,35);assert.equal(rows.filter(x=>x.priority==="P0").length,13);
  assert.equal(rows.filter(x=>x.priority==="P1").length,22);
  assert.ok(rows.every(x=>x.role===role&&x.original_request_status==="NOT_SENT"));
  assert.equal(fields.get("[data-pmsv-b58-role]").value,role);
 }
 assert.equal(panel.open,true);assert.equal(clicked,2);
 assert.equal(api.focusRole("REGULATORY_AFFAIRS_LEGAL"),false);
 context.pmsvB56Data.cases[0].gates[0].immutable_request_state="SENT";
 assert.equal(api.valid(),false);assert.equal(api.focusRole(SOURCE),false);
});
test("immutable 175-source ledger and page wiring unchanged",()=>{
 assert.equal(b56.cases.length,35);assert.equal(b56.totals.open_evidence_gates,175);
 assert.equal(b56.totals.received_documents,0);assert.equal(b56.totals.lot_passes,0);
 assert.equal(b56.cases.flatMap(c=>c.gates).filter(g=>g.dependency_codes.length===0).length,70);
 assert.equal(b56.cases.flatMap(c=>c.gates).filter(g=>g.dependency_codes.length!==0).length,105);
 assert.equal(b56.cases.flatMap(c=>c.gates).filter(g=>g.owner_role===SOURCE).length,35);
 assert.equal(b56.cases.flatMap(c=>c.gates).filter(g=>g.owner_role===MAKER).length,35);
 const html=fs.readFileSync(root+"index.html","utf8");
 assert.equal(html.split("pmsv-batch116-owner-handoff-2026-10-27.js").length,2);
 assert.ok(!source.includes("fetch("),"No network transmissions should be introduced");
});