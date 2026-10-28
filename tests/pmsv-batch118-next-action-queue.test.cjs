"use strict";
/* Batch118: original first-70 read-only next-action queue; self-reported ≠ verified. */
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const code=fs.readFileSync(root+"pmsv-batch118-first70-next-actions-2026-10-27.js","utf8");
const b97=fs.readFileSync(root+"pmsv-batch97-first70-followup-2026-10-25.js","utf8");
const b56=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
const C=["case_id","request_id","priority","rank","role","gate","source_request_status",
 "source_document_status","operator_followup_state","outbound_reference","sent_date",
 "response_reference","response_date","next_followup_date"];
function notesApi(){
 const doc={readyState:"loading",addEventListener:()=>{}},win={};
 vm.runInNewContext(b97,{window:win,document:doc,console});
 return win.pmsvB97Followup;
}
const original=b56.cases.flatMap(c=>c.gates.filter(g=>g.dependency_codes.length===0).map(g=>({c,g})));
function table(change=()=>{}){
 const rows=original.map(({c,g},i)=>{
  const fields=[c.catalogue_id,g.request_id,c.priority,String(c.rank),g.owner_role,g.gate_code,
   "NOT_SENT","NOT_RECEIVED","NOT_PREPARED","","","","",""];
  change(fields,i);return fields;
 });
 const q=v=>'"'+String(v).replaceAll('"','""')+'"';
 return[C,...rows].map(x=>x.map(q).join(",")).join("\r\n")+"\r\n";
}
function scenario(raw=table(),opts={}){
 const api=notesApi();
 class N{
  constructor(tag){this.tag=tag;this.children=[];this.style={};this.dataset={};this.textContent="";}
  setAttribute(k,v){this[k]=v}appendChild(x){this.children.push(x);return x}
  replaceChildren(...xs){this.children=xs}
  querySelector(selector){const key=selector.slice(1,-1);const find=n=>n[key]!==undefined?n:n.children.map(find).find(Boolean);return find(this)}
 }
 let panel=null;const anchor={insertAdjacentElement(_position,node){panel=node}};
 const document={addEventListener:()=>{},createElement:t=>new N(t),
  getElementById:id=>id==="pmsv-b97-first70-followup"?anchor:
   id==="pmsv-b118-first70-next-actions"?panel:null};
 const sourceRows=original.map(({c,g})=>({case_id:c.catalogue_id,request_id:g.request_id,
  priority:c.priority,rank:String(c.rank),role:g.owner_role,gate:g.gate_code,
  product:c.product_name,analyte:c.analyte,evidence:g.required_evidence,
  source_request_status:"NOT_SENT",source_document_status:"NOT_RECEIVED"}));
 const window={pmsvB97Followup:{
  sourceValid:()=>opts.sourceValid!==false,
  csv:()=>raw,parseCSV:api.parseCSV,validNote:api.validNote,
  records:()=>opts.records===undefined?sourceRows:opts.records
 }};
 vm.runInNewContext(code,{document,window,console,Date,Blob,setTimeout,URL});
 return {api:window.pmsvB118NextActions,getPanel:()=>panel};
}
test("original first 70 action rows are reconciled; 13+22 source cases remain held",()=>{
 const s=scenario(),out=s.api.compute("2026-10-27");
 assert.equal(out.valid,true);assert.equal(out.rows.length,70);
 assert.equal(out.counts.NOT_PREPARED,70);
 assert.equal(new Set(out.rows.map(x=>x.request_id)).size,70);
 assert.equal(out.status,"ORIGINAL_SOURCE_UNSENT_AND_NOT_RECEIVED_ALL35_HELD");
 assert.ok(out.rows.every(x=>x.source_request_status==="NOT_SENT"));
 assert.ok(out.rows.every(x=>x.source_document_status==="NOT_RECEIVED"));
});
test("all seven distinct next-action statuses and date order",()=>{
 const txt=table((r,i)=>{
  if(i===0)r.splice(8,6,"DRAFT_READY","","","","","");
  if(i===1)r.splice(8,6,"SENT_SELF_REPORTED","REQ-1","2026-10-20","","","2026-10-25");
  if(i===2)r.splice(8,6,"SENT_SELF_REPORTED","REQ-2","2026-10-20","","","2026-10-27");
  if(i===3)r.splice(8,6,"SENT_SELF_REPORTED","REQ-3","2026-10-20","","","2026-11-05");
  if(i===4)r.splice(8,6,"RESPONSE_SELF_REPORTED","REQ-4","2026-10-20","RESP-4","2026-10-25","");
  if(i===5)r.splice(8,6,"SENT_SELF_REPORTED","REQ-5","2026-10-20","","","");
 });
 const s=scenario(txt),out=s.api.compute("2026-10-27");assert.equal(out.valid,true);
 const c=out.counts;for(const k of ["OVERDUE_FOLLOWUP","DUE_TODAY",
  "REPORTED_RESPONSE_NEEDS_REVIEW","SENT_NEEDS_FOLLOWUP_DATE",
  "DRAFT_READY_FOR_EXTERNAL_SEND","FUTURE_FOLLOWUP"])assert.equal(c[k],1,k);
 assert.equal(c.NOT_PREPARED,64);
 assert.equal(out.rows[0].action,"OVERDUE_FOLLOWUP");
 assert.equal(out.rows[1].action,"DUE_TODAY");
 assert.equal(out.rows[2].action,"REPORTED_RESPONSE_NEEDS_REVIEW");
});
test("apparent external sends and responses do not alter original UNSENT facts",()=>{
 const txt=table((r,i)=>{if(i===0)r.splice(8,6,
  "RESPONSE_SELF_REPORTED","REQ-1","2026-10-20","RESP-1","2026-10-21","");});
 const s=scenario(txt),res=s.api.compute("2026-10-27");
 assert.equal(res.valid,true);
 const row=res.rows.find(x=>x.request_id==="PMSV44-01-01");
 assert.equal(row.action,"REPORTED_RESPONSE_NEEDS_REVIEW");
 assert.equal(row.source_request_status,"NOT_SENT");
 assert.equal(row.source_document_status,"NOT_RECEIVED");
 assert.match(s.api.csv(res),/ALL35_HELD_NO_LEGAL_LAB_LOT_APPROVAL/);
});
test("tamper, duplicate IDs, invalid dates, malformed notes, source outage are blocked",()=>{
 const cases=[
  table((r,i)=>{if(i===0)r[6]="SENT"}),
  table((r,i)=>{if(i===1)r[1]="PMSV44-01-01"}),
  table((r,i)=>{if(i===0)r[4]="LABORATORY_TECHNICAL_MANAGER"}),
  table((r,i)=>{if(i===0)r[8]="RESPONSE_SELF_REPORTED"}),
 ];
 for(const raw of cases){
  const s=scenario(raw);
  assert.equal(s.api.compute("2026-10-27").valid,false);
  assert.equal(s.api.csv(),"");
 }
 assert.equal(scenario().api.compute("2026-02-30").valid,false);
 assert.equal(scenario(undefined,{sourceValid:false}).api.compute("2026-10-27").valid,false);
});
test("read-only panel only displays source text safely and summarizes 70 actions",()=>{
 const s=scenario();
 assert.equal(s.api.render(),true);
 const panel=s.getPanel();assert.ok(panel);assert.equal(panel.open,true);
 const tbody=panel.children.filter(x=>x.tag==="div").at(-1).children[0].children[1];
 assert.equal(tbody.children.length,70);
 const summary=panel.children.find(x=>x["data-b118-summary"]!==undefined);
 assert.match(summary.textContent,/35 cases HELD/);
 const output=s.api.csv(s.api.compute("2026-10-27"));
 assert.equal(output.split("\r\n").length,72);
});
test("B97 action button and B118 script load only once",()=>{
 const index=fs.readFileSync(root+"index.html","utf8");
 assert.equal(index.split("pmsv-batch118-first70-next-actions-2026-10-27.js").length,2);
 assert.ok(b97.includes('data-b118-open'));
 assert.ok(!code.includes("fetch("));
 assert.ok(!/localStorage\.(?:getItem|setItem)/.test(code));
 assert.equal(b56.totals.open_ctr_cases,35);
 assert.equal(b56.totals.approved_ctr_articles,0);
 assert.equal(b56.totals.lot_passes,0);
});

test("Batch120 offline owner assignment template preserves 70 immutable requests with blank people and dispatch fields",()=>{
 const s=scenario(),result=s.api.compute("2026-10-27");
 const csv=s.api.assignmentCSV(result),parsed=notesApi().parseCSV(csv);
 assert.equal(parsed.length,71);
 assert.deepEqual(Array.from(parsed[0]),[
  "priority","case_id","request_id","owner_role","next_action",
  "named_internal_coordinator","verified_external_recipient","planned_dispatch_date",
  "approved_dispatch_channel","internal_approval_reference",
  "original_request_status","original_document_status","compliance_gate"
 ]);
 assert.equal(new Set(parsed.slice(1).map(row=>row[2])).size,70);
 assert.equal(parsed.slice(1).filter(row=>row[3]==="FSSAI_QA_DIVISION_AND_LAB_DIRECTOR").length,35);
 assert.equal(parsed.slice(1).filter(row=>row[3]==="MANUFACTURER_OR_SUPPLIER_QA").length,35);
 assert.ok(parsed.slice(1).every(row=>row.length===13&&row.slice(5,10).every(x=>x==="")));
 assert.ok(parsed.slice(1).every(row=>row[10]==="NOT_SENT"&&row[11]==="NOT_RECEIVED"));
 assert.ok(parsed.slice(1).every(row=>row[12]==="ALL35_HELD_NO_LEGAL_LAB_LOT_APPROVAL"));
 assert.ok(s.api.assignmentCSV().includes("PMSV44-01-01"));
 assert.equal(s.api.assignmentCSV({valid:false,rows:[]}),"");
});
test("Batch120 worksheet button is displayed and never persists recipients in preview",()=>{
 const s=scenario();assert.equal(s.api.render(),true);
 const panel=s.getPanel();
 const buttons=panel.children.filter(x=>x.tag==="div").flatMap(x=>x.children).filter(x=>x.tag==="button");
 assert.ok(buttons.some(x=>x.dataset.b118Assignment!==undefined));
 assert.ok(!code.includes("fetch("));
 assert.ok(!/localStorage\.(?:getItem|setItem)/.test(code));
 assert.ok(!code.includes("sendEmail"));
});

test("Batch121 detailed first-70 evidence brief carries exact product, analyte and request text without inventing approvals",()=>{
 const s=scenario(),out=s.api.compute("2026-10-27");
 const csv=s.api.evidenceBriefCSV(out),parsed=notesApi().parseCSV(csv);
 assert.equal(parsed.length,71);
 assert.deepEqual(Array.from(parsed[0]),[
  "priority","case_id","request_id","owner_role","product_name",
  "analyte","evidence_gate","original_evidence_requirement","next_action",
  "named_internal_coordinator","verified_external_recipient","planned_dispatch_date",
  "approved_dispatch_channel","internal_approval_reference",
  "original_request_status","original_document_status","compliance_gate"
 ]);
 const rows=parsed.slice(1);
 assert.equal(new Set(rows.map(x=>x[2])).size,70);
 assert.equal(rows.filter(x=>x[0]==="P0").length,26);
 assert.equal(rows.filter(x=>x[0]==="P1").length,44);
 assert.equal(rows.filter(x=>x[3]==="FSSAI_QA_DIVISION_AND_LAB_DIRECTOR").length,35);
 assert.equal(rows.filter(x=>x[3]==="MANUFACTURER_OR_SUPPLIER_QA").length,35);
 const source=new Map(original.map(({c,g})=>[g.request_id,{c,g}]));
 for(const r of rows){
  const x=source.get(r[2]);assert.ok(x);
  assert.equal(r[4],x.c.product_name);
  assert.equal(r[5],x.c.analyte);
  assert.equal(r[6],x.g.gate_code);
  assert.equal(r[7],x.g.required_evidence);
  assert.ok(r.slice(9,14).every(v=>v===""));
  assert.deepEqual(Array.from(r.slice(14)),[
   "NOT_SENT","NOT_RECEIVED","ALL35_HELD_NO_LEGAL_LAB_LOT_APPROVAL"
  ]);
 }
 assert.equal(s.api.evidenceBriefCSV({valid:false,rows:[]}),"");
});
test("Batch121 missing, duplicate or mismatched source record fails closed",()=>{
 const s=scenario(),source=original.map(({c,g})=>({case_id:c.catalogue_id,request_id:g.request_id,
  priority:c.priority,rank:String(c.rank),role:g.owner_role,gate:g.gate_code,
  product:c.product_name,analyte:c.analyte,evidence:g.required_evidence,
  source_request_status:"NOT_SENT",source_document_status:"NOT_RECEIVED"}));
 assert.equal(scenario(undefined,{records:source.slice(1)}).api.evidenceBriefCSV(),"");
 assert.equal(scenario(undefined,{records:[...source.slice(0,69),source[0]]}).api.evidenceBriefCSV(),"");
 const rankChanged=source.map(x=>({...x}));rankChanged[0].rank="99";
 assert.equal(scenario(undefined,{records:rankChanged}).api.evidenceBriefCSV(),"");
 const statusChanged=source.map(x=>({...x}));statusChanged[0].source_document_status="RECEIVED";
 assert.equal(scenario(undefined,{records:statusChanged}).api.evidenceBriefCSV(),"");
 assert.equal(scenario(undefined,{sourceValid:false}).api.evidenceBriefCSV(),"");
});
test("Batch121 detailed brief is a local-only download with no recipient capture",()=>{
 const s=scenario();assert.equal(s.api.render(),true);
 const panel=s.getPanel();
 const buttons=panel.children.filter(x=>x.tag==="div").flatMap(x=>x.children).filter(x=>x.tag==="button");
 assert.ok(buttons.some(x=>x.dataset.b121Brief!==undefined));
 assert.ok(!code.includes("fetch("));
 assert.ok(!code.includes("localStorage"));
 assert.ok(!code.includes("sessionStorage"));
 assert.ok(!code.includes("sendEmail"));
});
