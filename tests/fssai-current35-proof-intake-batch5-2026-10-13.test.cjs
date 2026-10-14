"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"../fssai-product-helper-preview-01");
const rule=f=>JSON.parse(fs.readFileSync(path.join(root,"data/rules",f),"utf8"));
const batch=rule("fssai-current35-proof-intake-batch5-2026-10-13.json");
const parent=rule("fssai-current35-exact-ctr-article-gates-batch4-2026-10-13.json");
const queue=rule("fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json");
const ledger=rule("fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json");
const source=fs.readFileSync(path.join(root,"fssai-current35-proof-intake-batch5-2026-10-13.js"),"utf8");
function environment(data=structuredClone(batch)){
  const state=new Map();
  const c={
    pmsvCurrent35Batch4:parent,
    pmsv35Queue:queue,
    pmsv498Ledger:ledger,
    pmsvCurrent35Batch4Valid:()=>true,
    pmsvLoadPositiveSourceProof:async()=>{},
    sourcePinned121ResearchProofHtml:()=>"<span>prior source card</span>",
    window:{localStorage:{getItem:k=>state.get(k)||null,setItem:(k,v)=>state.set(k,v)}},
    listeners:{}
  };
  c.document={addEventListener:(k,fn)=>{c.listeners[k]=fn}};
  vm.createContext(c);
  vm.runInContext(source,c);
  c.pmsvB5Data=data;
  return {c,state};
}
const product=x=>({id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs});
test("all 35 IDs correspond exactly to 498/35 source ledger, triage and 140 original slots",()=>{
 const {c}=environment();
 assert.equal(c.pmsvB5Valid(),true);
 assert.equal(batch.cases.length,35);
 assert.equal(queue.review_records.length,35);
 assert.equal(batch.document_slots,140);
 assert.deepEqual(batch.category_counts,{LEGAL_SCOPE:11,PRODUCT_IDENTITY:9,PROCESS_MATRIX:7,SUBSTANCE_ID:8});
 for(let i=0;i<35;i++){
   const x=batch.cases[i],q=queue.review_records[i],b=parent.cases[i];
   assert.equal(x.catalog_id,q.catalog_id);
   assert.equal(x.catalog_id,b.catalog_id);
   assert.equal(ledger.records.find(z=>z.catalog_id===x.catalog_id).source_status,"FIRST_EXACT_SOURCE_PENDING");
   assert.equal(x.evidence_documents.length,4);
   assert.equal(x.legal_source_approved,false);
   assert.equal(x.numeric_limit_assigned,false);
   assert.equal(x.full_product_compliance_approved,false);
 }
});
test("each pending product gets four receipt controls and unambiguous no-PASS language",()=>{
 const {c}=environment();
 for(const x of batch.cases){
   const html=c.pmsvB5Html(product(x));
   assert.match(html,/Source status: FIRST EXACT ARTICLE PENDING/);
   assert.equal((html.match(/data-pmsv-b5-slot=/g)||[]).length,4);
   assert.match(html,/never validate a legal source/);
   assert.doesNotMatch(html,/data-pmsv-b5-slot="4"/);
 }
 const other=c.pmsvB5Html({id:"not-in-queue",name:"Unknown",fssr:"",fcs:""});
 assert.equal(other,"");
});
test("altered ID, status, documentary slot, official source and future date all fail closed",()=>{
 for(const kind of ["identity","status","slot","source","date","approval","duplicate"]){
   const altered=structuredClone(batch);
   if(kind==="identity")altered.cases[0].catalog_id="unauthorised-catalogue-id";
   if(kind==="status")altered.cases[0].exact_finished_source_status="PARTIAL_EXACT_SOURCE_MATCH";
   if(kind==="slot")altered.cases[0].evidence_documents[0].title="Not original";
   if(kind==="source")altered.cases[0].official_sources.contaminants="https://example.org/wrong.pdf";
   if(kind==="date")altered.future_amendment_effective_date="2026-10-13";
   if(kind==="approval")altered.cases[0].numeric_limit_assigned=true;
   if(kind==="duplicate")altered.cases[1].catalog_id=altered.cases[0].catalog_id;
   const {c}=environment(altered);
   assert.equal(c.pmsvB5Valid(),false,kind);
   const html=c.pmsvB5Html(product(batch.cases[0]));
   assert.match(html,/FIRST EXACT SOURCE PENDING status remains unchanged/);
 }
});
test("marking an original received changes only browser-local receipt state",()=>{
 const {c,state}=environment();
 const id=batch.cases[0].catalog_id;
 const label={textContent:""};
 const msg={textContent:""};
 const card={getAttribute:k=>k==="data-pmsv-b5-card"?id:null,querySelector:q=>q.includes("count")?label:msg};
 const target={closest:()=>card,getAttribute:k=>k==="data-pmsv-b5-slot"?"0":null,hasAttribute:()=>false,checked:true};
 c.pmsvB5Input({target});
 assert.equal(c.pmsvB5Read()[id].received[0],true);
 assert.match(label.textContent,/1\/4 documents received \(unverified\)/);
 const exportOne=c.pmsvB5ExportOne(id);
 assert.equal(exportOne.received_count,1);
 assert.equal(exportOne.source_status,"FIRST_EXACT_SOURCE_PENDING");
 assert.equal(exportOne.receipts[0].source_verified,false);
 assert.equal(exportOne.numeric_limit_assigned,false);
 assert.equal(exportOne.lab_pass,false);
 assert.equal(exportOne.product_compliance_pass,false);
 assert.equal(c.pmsvB5ExportAll().records.length,1);
 assert.ok(state.size===1);
 assert.equal(batch.cases[0].evidence_documents[0].receipt_status,"NOT_RECEIVED_OR_UNVERIFIED");
});
test("invalid markup in local reviewer notes is escaped in rendered cards",()=>{
 const {c}=environment();
 const x=batch.cases[3];
 c.window.localStorage.setItem("pmsv:ctr:current35:received-documents:v1",JSON.stringify({
 [x.catalog_id]:{received:[true,true,true,true],notes:'<img src=x onerror=alert(1)>',reference:'"><script>alert(1)</script>'}
 }));
 const rendered=c.pmsvB5Html(product(x));
 assert.equal((rendered.match(/data-pmsv-b5-slot=/g)||[]).length,4);
 assert.doesNotMatch(rendered,/<img src=x/);
 assert.doesNotMatch(rendered,/<script>alert/);
 assert.match(rendered,/&lt;img/);
 const exported=c.pmsvB5ExportOne(x.catalog_id);
 assert.equal(exported.received_count,4);
 assert.equal(exported.product_compliance_pass,false);
});
test("loads only after current 498/35 module and batch4 without duplicate scripts",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),
  earlier="fssai-current-first-source-498-35.js",
  parentJS="fssai-current35-ctr-legal-gates-batch4-2026-10-13.js",
  current="fssai-current35-proof-intake-batch5-2026-10-13.js";
 assert.ok(html.indexOf(earlier)<html.indexOf(parentJS));
 assert.ok(html.indexOf(parentJS)<html.indexOf(current));
 assert.ok(html.indexOf(current)<html.indexOf("fssai-nutrition-v476.js"));
 assert.equal(html.split(current).length-1,1);
 assert.equal((html.match(/<script\b/g)||[]).length,(html.match(/<\/script>/g)||[]).length);
});
