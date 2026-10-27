"use strict";
/* Batch117: on-demand first-70 handoff to local follow-up register. */
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");
const root="fssai-product-helper-preview-01/";
const b116=fs.readFileSync(root+"pmsv-batch116-owner-handoff-2026-10-27.js","utf8");
const b97=fs.readFileSync(root+"pmsv-batch97-first70-followup-2026-10-25.js","utf8");
const b56=JSON.parse(fs.readFileSync(root+"data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json","utf8"));
const SRC="FSSAI_QA_DIVISION_AND_LAB_DIRECTOR",MAKER="MANUFACTURER_OR_SUPPLIER_QA";
class N{
 constructor(tag){this.tag=tag;this.attr={};this.children=[];this.value="";this.textContent="";}
 setAttribute(k,v){this.attr[k]=v}appendChild(x){this.children.push(x);return x}
 replaceChildren(...xs){this.children=xs}closest(){return{id:"standard"}}
 scrollIntoView(){}
}
function sourceRows(){
 return b56.cases.flatMap(c=>c.gates.map(g=>({
 rank:c.rank,priority:c.priority,product:c.product_name,analyte:c.analyte,
 case_id:c.catalogue_id,request_id:g.request_id,role:g.owner_role,
 gate:g.gate_code,evidence:g.required_evidence,
 dependencies:g.dependency_codes.join(", "),
 routing:g.dependency_codes.length===0?"REQUEST_PREPARATION_POSSIBLE":"WAIT_FOR_UPSTREAM_EVIDENCE",
 original_request_status:g.immutable_request_state,
 original_document_status:g.immutable_document_state})));
}
function b97Harness(){
 const all=sourceRows(),values=new Map(),panel=new N("details");let navigations=0;
 panel.querySelector=q=>{if(!values.has(q))values.set(q,new N(q));return values.get(q)};
 const document={readyState:"loading",addEventListener:()=>{},
  createElement:x=>new N(x),getElementById:id=>id==="pmsv-b97-first70-followup"?panel:null,
  querySelector:q=>q.includes("data-tab")?{click:()=>navigations++}:null};
 const window={pmsvB58OwnerOutreach:{valid:()=>true,records:()=>all},
  pmsvB87Catalogue:{load:async()=>true,closureVerified:()=>true,
   closedResearchSummary:()=>({catalogue:533,public_source_desk_research_closed:35,
    external_legal_and_lot_verification_held:35,product_releases:0,
    signed_product_limits:0,validated_lab_lot_pass:0})}};
 vm.runInNewContext(b97,{window,document,console});
 return {api:window.pmsvB97Followup,all,values,panel,getNavigations:()=>navigations};
}
function handoffHarness(options={}){
 const message={textContent:""},buttons=[{disabled:false},{disabled:false},{disabled:false}];
 const panel={querySelector:()=>message,querySelectorAll:()=>buttons};
 let requestCount=0,loadCount=0,focusCount=0;
 const document={readyState:"loading",addEventListener:()=>{},
  getElementById:id=>id==="pmsv-b116-first70-handoff"?panel:null};
 const window={pmsvB70ExtendedResearch:{
  getState:()=>({extended:options.extended||"READY"}),
  request:async()=>{requestCount++;return options.requestResult!==false},
  recheck:()=>options.recheckResult!==false},
  pmsvB97Followup:{install:()=>{},
   load:async()=>{loadCount++;return options.followupLoad!==false},
   sourceValid:()=>options.sourceValid!==false,
   focusRole:x=>{focusCount++;return x==="ALL"&&options.focusResult!==false},
   summary:()=>options.counts||{NOT_PREPARED:70,DRAFT_READY:0,
    SENT_SELF_REPORTED:0,RESPONSE_SELF_REPORTED:0}}};
 vm.runInNewContext(b116,{window,document,console});
 return {api:window.pmsvB116First70Handoff,message,buttons,
  stats:()=>({requestCount,loadCount,focusCount})};
}
test("real 175-gate source reconciles to 70 first-action records and two groups of 35",async()=>{
 const h=b97Harness();
 assert.equal(h.api.sourceValid(),true);assert.equal(await h.api.load(),true);
 assert.equal(h.api.records().length,70);
 assert.equal(h.api.focusRole("ALL"),true);
 assert.equal(h.values.get("[data-b97-rows]").children.length,70);
 assert.equal(h.values.get("[data-b97-role]").value,"ALL");
 assert.equal(h.panel.open,true);assert.equal(h.getNavigations(),1);
 const s=h.api.summary();assert.equal(s.NOT_PREPARED,70);
 for(const role of [SRC,MAKER]){
  assert.equal(h.api.focusRole(role),true);
  assert.equal(h.values.get("[data-b97-role]").value,role);
  assert.equal(h.values.get("[data-b97-rows]").children.length,35);
 }
 assert.equal(h.api.focusRole("LABORATORY_TECHNICAL_MANAGER"),false);
 assert.equal(h.getNavigations(),3);
});
test("tamper of original unsent state blocks new follow-up navigation",async()=>{
 const h=b97Harness();assert.equal(await h.api.load(),true);
 h.all[0].original_request_status="SENT";
 assert.equal(h.api.sourceValid(),false);
 assert.equal(h.api.focusRole("ALL"),false);
 assert.equal(h.api.csv(), "");
});
test("70 follow-ups open without sending and expose local-only counts",async()=>{
 const h=handoffHarness({extended:"NOT_REQUESTED",counts:{
  NOT_PREPARED:68,DRAFT_READY:2,SENT_SELF_REPORTED:0,RESPONSE_SELF_REPORTED:0}});
 assert.equal(await h.api.track(),true);
 assert.equal(h.stats().requestCount,1);assert.equal(h.stats().loadCount,1);
 assert.equal(h.stats().focusCount,1);
 assert.match(h.message.textContent,/68 not prepared; 2 drafts/);
 assert.match(h.message.textContent,/35 cases remain HELD/);
 assert.ok(h.buttons.every(x=>!x.disabled));
});
test("integrity failures, missing follow-up records and bogus 70 counts block",async()=>{
 for(const options of [{recheckResult:false},{followupLoad:false},{sourceValid:false},
  {counts:{NOT_PREPARED:35,DRAFT_READY:0,SENT_SELF_REPORTED:0,RESPONSE_SELF_REPORTED:0}}]){
  const h=handoffHarness(options);
  assert.equal(await h.api.track(),false);
  assert.match(h.message.textContent,/Blocked:/);
  assert.ok(h.buttons.every(x=>!x.disabled));
 }
});
test("concurrent user taps cannot create two source loads",async()=>{
 const h=handoffHarness({extended:"NOT_REQUESTED"});
 const pending=h.api.track();
 assert.equal(await h.api.track(),false);
 assert.equal(await pending,true);
 assert.equal(h.stats().requestCount,1);
 assert.equal(h.stats().loadCount,1);
});
test("first-70 tracking is wired exactly once and original source gates remain HELD",()=>{
 const index=fs.readFileSync(root+"index.html","utf8");
 assert.equal(index.split("pmsv-batch116-owner-handoff-2026-10-27.js").length,2);
 assert.equal(index.split("pmsv-batch97-first70-followup-2026-10-25.js").length,2);
 assert.ok(b116.includes("Track all 70 follow-ups"));
 assert.ok(!b116.includes("fetch("));
 assert.equal(b56.totals.open_ctr_cases,35);
 assert.equal(b56.totals.received_documents,0);
 assert.equal(b56.totals.approved_ctr_articles,0);
 assert.equal(b56.totals.lot_passes,0);
 assert.equal(sourceRows().filter(r=>r.routing==="REQUEST_PREPARATION_POSSIBLE").length,70);
});
