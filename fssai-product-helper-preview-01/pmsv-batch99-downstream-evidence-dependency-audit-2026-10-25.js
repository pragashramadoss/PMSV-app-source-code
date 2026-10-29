(function(){"use strict";
/* Batch99: dynamic read-only audit of original 105 downstream evidence gates.
 * Source proofs remain NOT_SENT/NOT_RECEIVED and commercial approval/release HELD.
 * Locally entered Batch98 metadata or sent-status never authenticates a document.
 */
const ID="pmsv-b99-downstream-audit";
const ROLES=[
 "REGULATORY_AFFAIRS_LEGAL",
 "LABORATORY_TECHNICAL_MANAGER",
 "SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER"
];
let ready=false,filter="ALL",tier="ALL",q="",selected="",audit=[];
function el(tag,txt,attrs){
 const x=document.createElement(tag);
 if(txt!==undefined)x.textContent=String(txt);
 for(const [k,v] of Object.entries(attrs||{}))x.setAttribute(k,String(v));
 return x;
}
function host(){return document.getElementById(ID)}
function say(t){const x=host()?.querySelector("[data-b99-status]");if(x)x.textContent=t}
function sourceValidFromCases(b98cases){
 try{
  const b58=window.pmsvB58OwnerOutreach;
  // Caller must pass cases just freshly verified by B98.loadVerifiedCases().
  // Public sourceValid() never trusts caller-provided cases.
  if(!Array.isArray(b98cases)||b98cases.length!==35)return false;
  const originals=b58?.records?.();
  if(!Array.isArray(originals)||originals.length!==175)return false;
  const seen=new Set(),groups=new Map(),counts=new Map();
  let prep=0,dependent=0;
  for(const r of originals){
   if(!r||seen.has(r.request_id)||!r.case_id||!r.request_id||
      r.original_request_status!=="NOT_SENT"||
      r.original_document_status!=="NOT_RECEIVED")return false;
   seen.add(r.request_id);
   const g=groups.get(r.case_id)||{roles:new Set(),ready:0,blocked:0};
   if(g.roles.has(r.role))return false;
   g.roles.add(r.role);
   if(r.routing==="REQUEST_PREPARATION_POSSIBLE"){prep++;g.ready++}
   else if(r.routing==="WAIT_FOR_UPSTREAM_EVIDENCE"){
    if(!ROLES.includes(r.role))return false;
    dependent++;g.blocked++;
    counts.set(r.role,(counts.get(r.role)||0)+1);
   }else return false;
   groups.set(r.case_id,g);
  }
  const sourceIds=new Set(b98cases.map(c=>c.id));
  return seen.size===175&&groups.size===35&&sourceIds.size===35&&
   [...groups.keys()].every(id=>sourceIds.has(id))&&prep===70&&dependent===105&&
   ROLES.every(r=>counts.get(r)===35)&&
   [...groups.values()].every(g=>g.roles.size===5&&g.ready===2&&g.blocked===3);
 }catch(_){return false}
}
function sourceValid(){
 return sourceValidFromCases(window.pmsvB98Handoff?.cases?.());
}
function rowStatus(r){
 const b98=window.pmsvB98Handoff,v=b98.latest(r.case_id),m=b98.completeDoc(v.manufacturer),
  f=b98.completeDoc(v.method),reg=v.regulatory.state,lab=v.laboratory.state;
 let blocker="",next="";
 if(r.role===ROLES[0]){
  if(!m){blocker="MANUFACTURER_CONTROLLED_METADATA_MISSING";
   next="Obtain controlled manufacturer SKU/label/BOM identity, revision, issue date, SHA-256 and independently checked issuer origin; then request signed current legal product applicability."}
  else if(reg==="NOT_PREPARED"){blocker="REGULATORY_DRAFT_NOT_PREPARED";
   next="Prepare separate Regulatory/Legal review of real commercial identity and current operative FSSAI article; authenticate originals outside PMSV."}
  else{blocker="REGULATORY_HANDOFF_UNAUTHENTICATED";
   next="Independently authenticate actual manufacturer original and operative Gazette; obtain competent signed legal article/limit/unit/basis adjudication. A draft or reported send is not signoff."}
 }else if(r.role===ROLES[1]){
  if(!m||!f){blocker="MANUFACTURER_OR_METHOD_SOURCE_METADATA_MISSING";
   next="Obtain actual commercial matrix and current method-source controlled original, resolve FSSAI method number/version conflicts, and verify exact NABL method/matrix/range with fit-for-limit LOQ."}
  else if(lab==="NOT_PREPARED"){blocker="LABORATORY_DRAFT_NOT_PREPARED";
   next="Prepare separate accredited laboratory technical review; keep method adoption, matrix, LOQ and sampling as externally unverified."}
  else{blocker="LABORATORY_HANDOFF_UNAUTHENTICATED";
   next="Obtain signed laboratory technical and current accreditation evidence; independently resolve method version, matrix fit, LOQ and actual lot test plan."}
 }else{
  blocker="REPRESENTATIVE_LOT_AND_QA_RELEASE_PROOF_MISSING";
  next="Require independently reviewed legally applicable limit, accredited exact matrix method, representative-lot CoA and authorized QA decision. No PASS or release is available from research metadata.";
 }
 if(v.revision_reset&&(r.role===ROLES[0]||r.role===ROLES[1])){
  blocker="SOURCE_REVISION_RESET_REVIEW_REQUIRED";
  next="Controlled source revision changed after a handoff. Prior reviewer packets are STALE; reauthenticate current originals and regenerate reviewer handoff before any independent decision.";
 }
 return{blocker,next,source_revision:v.revision,
  manufacturer_metadata:m?"COMPLETE_SELF_REPORTED":"INCOMPLETE",
  method_metadata:f?"COMPLETE_SELF_REPORTED":"INCOMPLETE",
  regulatory_handoff:reg,laboratory_handoff:lab,
  original_evidence:"NOT_SENT_NOT_RECEIVED",commercial_decision:"HELD_NO_APPROVAL_OR_PASS"};
}
function rowsUnchecked(){
 const all=window.pmsvB58OwnerOutreach.records();
 return all.filter(r=>r.routing==="WAIT_FOR_UPSTREAM_EVIDENCE")
  .map(r=>Object.freeze({
   rank:Number(r.rank),priority:r.priority,product:r.product,analyte:r.analyte,
   case_id:r.case_id,request_id:r.request_id,role:r.role,
   gate:r.gate,evidence:r.evidence,dependency:r.dependencies,
   ...rowStatus(r)
  }))
  .sort((a,b)=>a.rank-b.rank||ROLES.indexOf(a.role)-ROLES.indexOf(b.role));
}
function rows(){return sourceValid()?rowsUnchecked():[]}
function selection(){
 const needle=q.toLowerCase();
 return audit.filter(r=>(filter==="ALL"||filter===r.role)&&
  (tier==="ALL"||tier===r.priority)&&
  (!needle||[r.product,r.analyte,r.request_id,r.case_id,r.blocker].some(v=>
   String(v).toLowerCase().includes(needle))));
}
function count(){
 const a=audit;return{
  total:a.length,reg:a.filter(r=>r.role===ROLES[0]).length,
  lab:a.filter(r=>r.role===ROLES[1]).length,
  qa:a.filter(r=>r.role===ROLES[2]).length,
  revision_resets:a.filter(r=>r.blocker==="SOURCE_REVISION_RESET_REVIEW_REQUIRED").length,
  source_missing:a.filter(r=>r.blocker.includes("METADATA_MISSING")).length
 }}
function quote(v){
 let s=String(v??"");if(/^[\s]*[=+@-]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
}
function csv(){
 if(!ready||!sourceValid())return"";
 audit=rowsUnchecked();
 const keys=["rank","priority","case_id","product","analyte","request_id","role","gate",
  "original_evidence","source_revision","manufacturer_metadata","method_metadata",
  "regulatory_handoff","laboratory_handoff","blocker","dependency","next","commercial_decision"];
 const a=[keys,...selection().map(r=>keys.map(k=>r[k]))];
 return a.map(x=>x.map(quote).join(",")).join("\r\n")+"\r\n";
}
/* Batch126: externally reviewed, entirely blank sign-off workpapers.
 * The 105 original downstream gates are still BLOCKED; neither metadata nor a
 * worksheet can constitute legal, laboratory, lot or QA approval. */
function reviewWorksheetCSV(priorityFilter="ALL"){
 if(!ready||!sourceValid()||!["ALL","P0"].includes(priorityFilter))return"";
 const original=rowsUnchecked();
 if(original.length!==105||new Set(original.map(x=>x.request_id)).size!==105||
    original.some(x=>x.original_evidence!=="NOT_SENT_NOT_RECEIVED"||
     x.commercial_decision!=="HELD_NO_APPROVAL_OR_PASS"))return"";
 const cases=new Map(),roles=new Map();
 for(const r of original){
  const group=cases.get(r.case_id)||{priority:r.priority,roles:new Set()};
  if(group.priority!==r.priority||group.roles.has(r.role))return"";
  group.roles.add(r.role);cases.set(r.case_id,group);
  roles.set(r.role,(roles.get(r.role)||0)+1);
 }
 if(cases.size!==35||ROLES.some(r=>roles.get(r)!==35)||
    [...cases.values()].some(g=>g.roles.size!==3))return"";
 const selected=priorityFilter==="P0"?original.filter(x=>x.priority==="P0"):original;
 if(priorityFilter==="P0"&&(selected.length!==39||
    new Set(selected.map(x=>x.case_id)).size!==13||
    ROLES.some(role=>selected.filter(x=>x.role===role).length!==13)))return"";
 const headings=["priority","rank","case_id","request_id","product_name","analyte",
  "review_function","original_evidence_gate","exact_documentary_requirement",
  "upstream_dependencies","local_source_revision_unverified","current_blocker",
  "next_human_action","original_gate_state",
  "authenticated_upstream_source_reference","signed_legal_applicability_reference",
  "accredited_method_matrix_scope_reference","representative_lot_coa_reference",
  "independent_reviewer_name","independent_review_date","signed_review_decision_reference",
  "authorised_qa_disposition_reference","immutable_compliance_hold"];
 const data=selected.map(r=>[r.priority,String(r.rank),r.case_id,r.request_id,r.product,
  r.analyte,r.role,r.gate,r.evidence,r.dependency,r.source_revision,r.blocker,r.next,
  "BLOCKED_ORIGINAL_NOT_SENT_NOT_RECEIVED","","","","","","","","",
  "ALL35_HELD_NO_LEGAL_LAB_LOT_APPROVAL"]);
 if(data.some(x=>x.length!==headings.length)||new Set(data.map(x=>x[3])).size!==data.length)
  return"";
 return[headings,...data].map(x=>x.map(quote).join(",")).join("\r\n")+"\r\n";
}
function downloadReviewWorksheet(priorityFilter="ALL"){
 const content=reviewWorksheetCSV(priorityFilter);
 if(!content){
  say("Worksheet blocked: the original 105 downstream gates did not reconcile. All 35 cases remain HELD.");
  return false;
 }
 return download(content,priorityFilter==="P0"?
  "PMSV-B126-P0-39-BLOCKED-DOWNSTREAM-REVIEW-WORKSHEET.csv":
  "PMSV-B126-ALL105-BLOCKED-DOWNSTREAM-REVIEW-WORKSHEET.csv");
}
function download(content,filename){
 if(!content)return false;
 const blob=new Blob(["\uFEFF"+content],{type:"text/csv;charset=utf-8"}),
  u=URL.createObjectURL(blob),a=el("a",undefined,{href:u,download:filename});
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),1000);return true;
}
function render(alreadyVerified=false){
 if(!ready||(!alreadyVerified&&!sourceValid()))return say("Immutable source verification failed; dashboard and export blocked.");
 audit=rowsUnchecked();
 if(audit.length!==105||new Set(audit.map(x=>x.request_id)).size!==105)
  return say("105-request reconciliation failed; outputs blocked.");
 const h=host();if(!h)return;
 const stats=count(),seen=selection(),t=h.querySelector("[data-b99-rows]");
 t.replaceChildren();
 for(const r of seen){
  const tr=el("tr");
  tr.appendChild(el("td",r.priority+" #"+r.rank));
  tr.appendChild(el("td",r.product));
  tr.appendChild(el("td",r.role===ROLES[0]?"Regulatory":r.role===ROLES[1]?"Laboratory":"Independent QA"));
  tr.appendChild(el("td",r.blocker.replaceAll("_"," ")));
  t.appendChild(tr);
 }
 h.querySelector("[data-b99-counts]").textContent=
  "105 original downstream requests HELD (35 Regulatory, 35 Laboratory, 35 QA). "+
  stats.source_missing+" metadata-gap rows · "+stats.revision_resets+
  " handoff-reset rows · 0 signed legal limits, verified accredited methods or lot releases.";
 const pick=h.querySelector("[data-b99-case]");pick.replaceChildren();
 for(const r of seen)pick.appendChild(el("option","#"+r.rank+" · "+r.product+" · "+
  (r.role===ROLES[0]?"Regulatory":r.role===ROLES[1]?"Laboratory":"QA"),
  {value:r.request_id}));
 if(!seen.some(r=>r.request_id===selected))selected=seen[0]?.request_id||"";
 pick.value=selected;
 const r=audit.find(x=>x.request_id===selected);
 h.querySelector("[data-b99-detail]").textContent=r?
  r.request_id+" | "+r.blocker+"\n"+r.evidence+"\nDependency: "+
  (r.dependency||"Original independent verification required")+
  "\nNext human action: "+r.next+
  "\nLocal source revision: "+r.source_revision+
  ". Document contents, signatures, legal/method approvals, lot PASS and QA release have not been verified.":
  "No matching case under current filters.";
 say("Read-only audit refreshed from original held evidence ledger and current Batch98 local metadata. No compliance status upgraded.");
}
let loading=false;
async function load(){
 if(loading)return false;
 loading=true;
 const button=host()?.querySelector("[data-b99-load]");
 if(button){button.disabled=true;button.textContent="Checking source prerequisites…";}
 const started=Date.now();
 say("Verifying 35 source cases and 105 downstream original request IDs. Extended research may take time; commercial decisions remain HELD.");
 const timer=typeof setInterval==="function"?setInterval(()=>{
  const p=document.getElementById("pmsv-b70-startup-gates");
  const core=p?.querySelector("[data-pmsv-b70-core]")?.textContent?.trim();
  const step=core&&core!=="READY"?"Core FSSAI source validation "+core+"; reviewer handoff waiting":
   p?.querySelector("[data-pmsv-b70-state]")?.textContent?.trim()||
   "official-source prerequisites in progress";
  say("Verifying upstream sources: "+step.slice(0,140)+" · "+
   Math.floor((Date.now()-started)/1000)+"s elapsed. No approvals or test PASS.");
 },2000):null;
 try{
  // Keep the click responsive even if the source graph needs a full cold check.
  await new Promise(resolve=>setTimeout(resolve,0));
  const verifiedCases=await window.pmsvB98Handoff?.loadVerifiedCases?.();
  if(!sourceValidFromCases(verifiedCases)){
   ready=false;audit=[];say("Trusted source data unavailable; load the Batch70 extended source panels and retry. 105 review gates stay HELD.");return false;
  }
  audit=rowsUnchecked();
  ready=audit.length===105&&new Set(audit.map(x=>x.request_id)).size===105;
  if(!ready){say("Original 105 request integrity failed.");return false}
  render(true);return true;
 }catch(_){ready=false;audit=[];say("Source verification failed; no export.");return false}
 finally{
  if(timer!==null)clearInterval(timer);
  loading=false;
  if(button){button.disabled=false;button.textContent="Verify and audit 105 downstream requests";}
 }
}
async function loadVerifiedRows(){
 return await load()?rowsUnchecked():[];
}
function openSource(){
 if(!ready||!sourceValid()||!selected)return false;
 const r=audit.find(x=>x.request_id===selected),h=document.getElementById("pmsv-b98-source-handoff");
 const pick=h?.querySelector("[data-b98-case]");
 if(!r||!pick||![...pick.options].some(o=>o.value===r.case_id))return false;
 pick.value=r.case_id;pick.dispatchEvent(new Event("change",{bubbles:true}));
 h.open=true;h.scrollIntoView({block:"start",behavior:"auto"});return true;
}
function install(){
 if(host())return;
 const anchor=document.getElementById("pmsv-b98-source-handoff")||
              document.getElementById("pmsv-b97-first70-followup");
 if(!anchor)return;
 const h=el("details",undefined,{id:ID,class:"card"});
 h.appendChild(el("summary","Batch99 · 105 original downstream evidence dependencies / stale-source audit"));
 h.appendChild(el("p","A source-verified, read-only dependency review linked to Batch98 controlled-copy revisions. Manufacturer and method metadata, and self-reported reviewer handoff stages, can help prepare follow-ups but NEVER substitute for authenticated originals, a signed legally applicable limit, accredited matrix method, tested lot CoA or QA release. All 105 original downstream requests remain HELD."));
 h.appendChild(el("button","Verify and audit 105 downstream requests",{type:"button","data-b99-load":""}));
 h.appendChild(el("p","On first use, the extended FSSAI source review may need to load; status is shown below. No document is treated as received.",{class:"notice"}));
 h.appendChild(el("p","Not loaded.",{role:"status","aria-live":"polite","data-b99-status":""}));
 h.appendChild(el("p","",{"data-b99-counts":""}));
 const controls=el("div",undefined,{class:"checker-grid"});
 const r=el("label","Review function"),sel=el("select",undefined,{"data-b99-role":""});
 [["ALL","All 105"],[ROLES[0],"Regulatory (35)"],[ROLES[1],"Laboratory (35)"],[ROLES[2],"QA (35)"]]
 .forEach(([v,t])=>sel.appendChild(el("option",t,{value:v})));
 r.appendChild(sel);controls.appendChild(r);
 const p=el("label","Priority"),pr=el("select",undefined,{"data-b99-tier":""});
 [["ALL","P0 and P1"],["P0","P0"],["P1","P1"]].forEach(([v,t])=>pr.appendChild(el("option",t,{value:v})));
 p.appendChild(pr);controls.appendChild(p);
 const search=el("label","Search product, analyte or blocker");
 search.appendChild(el("input",undefined,{type:"search",maxlength:"100","data-b99-search":""}));
 controls.appendChild(search);h.appendChild(controls);
 const scroll=el("div",undefined,{style:"max-height:340px;overflow:auto"}),
 table=el("table"),head=el("thead"),tr=el("tr");
 ["Case","Product","Function","Blocking evidence"].forEach(v=>tr.appendChild(el("th",v)));
 head.appendChild(tr);table.appendChild(head);
 table.appendChild(el("tbody",undefined,{"data-b99-rows":""}));
 scroll.appendChild(table);h.appendChild(scroll);
 const pick=el("label","Inspect exact original request");
 pick.appendChild(el("select",undefined,{"data-b99-case":""}));h.appendChild(pick);
 h.appendChild(el("p","",{"data-b99-detail":"",style:"white-space:pre-wrap"}));
 h.appendChild(el("button","Open controlled-source case in Batch98",{type:"button","data-b99-open":""}));
 h.appendChild(document.createTextNode(" "));
 h.appendChild(el("button","Export selected 105-gate audit CSV",{type:"button","data-b99-export":""}));
 h.appendChild(el("button","Download all 105 BLOCKED reviewer worksheets",{type:"button","data-b126-all":""}));
 h.appendChild(el("button","Download 39 P0 BLOCKED reviewer worksheets",{type:"button","data-b126-p0":""}));
 h.appendChild(el("p","Batch126 workpapers carry exact original evidence requirements and blockers. The eight offline source, reviewer, legal, laboratory, CoA and QA decision fields stay blank; no rows are approval-ready. Downloading does not dispatch a request, authenticate evidence, or close a case."));
 h.appendChild(el("p","No original document is uploaded, signed or verified here. This review cannot mark any of the 105 gates closed, and never changes the authoritative 175-request ledger."));
 const reviewTop=document.getElementById("pmsv-b70-startup-gates")||anchor;
 reviewTop.insertAdjacentElement("afterend",h);
 const css=el("style",undefined,{id:"pmsv-b99-css"});
 css.textContent="#pmsv-b99-downstream-audit{overflow-wrap:anywhere}#pmsv-b99-downstream-audit summary{font-weight:800;cursor:pointer}#pmsv-b99-downstream-audit label{display:block;margin:8px 0;font-weight:650}#pmsv-b99-downstream-audit input,#pmsv-b99-downstream-audit select{display:block;max-width:100%;width:100%;padding:9px;margin-top:4px;border:1px solid #b8c8e0;border-radius:7px}#pmsv-b99-downstream-audit button{margin:4px;white-space:normal}";
 document.head.appendChild(css);
}
document.addEventListener("click",e=>{
 const b=e.target?.closest?.("#"+ID+" button");if(!b)return;
 if(b.hasAttribute("data-b99-load")){void load();return}
 if(!ready||!sourceValid())return say("Source verification required before output.");
 if(b.hasAttribute("data-b126-all")){void downloadReviewWorksheet("ALL");return}
 if(b.hasAttribute("data-b126-p0")){void downloadReviewWorksheet("P0");return}
 if(b.hasAttribute("data-b99-export")){
  if(download(csv(),"PMSV-B99-105-DOWNSTREAM-HELD-EVIDENCE-AUDIT.csv"))
   say("CSV generated locally. All commercial approvals and releases remain HELD.");
 }else if(b.hasAttribute("data-b99-open")){
  if(!openSource())say("Could not open Batch98 source case; load and verify its panel first.");
 }
});
document.addEventListener("change",e=>{
 const t=e.target;
 if(t?.matches?.("#"+ID+" [data-b99-role]")){filter=t.value;render()}
 else if(t?.matches?.("#"+ID+" [data-b99-tier]")){tier=t.value;render()}
 else if(t?.matches?.("#"+ID+" [data-b99-case]")){selected=t.value;render()}
});
document.addEventListener("input",e=>{
 if(e.target?.matches?.("#"+ID+" [data-b99-search]")){
  q=String(e.target.value||"").slice(0,100);render();
 }
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
window.pmsvB99DownstreamAudit=Object.freeze({sourceValid,rows,rowStatus,count,csv,reviewWorksheetCSV,load,loadVerifiedRows,install});
/* Batch100 is loaded without editing the 900KB preview index or its original source ledger. */
if(typeof document.createElement==="function"&&document.head?.appendChild&&
   !document.getElementById("pmsv-b100-module")){
 const script=document.createElement("script");
 script.id="pmsv-b100-module";
 script.src="./pmsv-batch100-independent-review-exception-register-2026-10-25.js?v=20261025-b100";
 script.async=true;
 document.head.appendChild(script);
}
})();