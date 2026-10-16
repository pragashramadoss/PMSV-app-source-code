"use strict";
/* Batch41: operational REQUEST TEMPLATES ONLY: neither assigned, sent nor PASS. */
var pmsvB41Data=null,pmsvB41Search="",pmsvB41Workstream="ALL",pmsvB41Priority="ALL",pmsvB41Selected=null;
const pmsvB41Path="./data/rules/fssai-current35-evidence-intake-handoff-batch41-2026-10-16.json";
const pmsvB41Expected="320276741bdf25b3";
const pmsvB41Streams=["PRODUCT_IDENTITY","LEGAL_CTR_APPLICABILITY","LAB_METHOD_AND_SCOPE","LOT_SAMPLE_AND_QA"];
function pmsvB41Valid(){
 if(typeof pmsvB40Valid!=="function"||!pmsvB40Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB41Data||
 pmsvB14Digest(pmsvB41Data)!==pmsvB41Expected)return false;
 const d=pmsvB41Data,n=d.counts;
 if(d.schema_version!=="1.0"||d.kind!=="PMSV_CURRENT35_EVIDENCE_INTAKE_HANDOFF_BATCH41"||
 d.as_of!=="2026-10-16"||d.deployment!=="GH_PAGES_PREVIEW_ONLY"||
 n?.catalogue!==533||n.conditional_first_source_matches!==498||
 n.exact_ctr_pending!==35||n.evidence_packets!==35||
 n.total_actionable_document_requests!==140||n.request_workstreams!==4||
 n.specific_method_exception_packets!==13||
 n.general_method_scope_packets!==22||
 n.identity_request_count!==35||n.legal_article_request_count!==35||
 n.laboratory_method_request_count!==35||n.lot_sample_request_count!==35||
 n.request_status_not_sent!==140||n.actual_assignees_confirmed!==0||
 n.actual_due_dates_confirmed!==0||n.legal_scope_approvals!==0||
 n.laboratory_reports_verified!==0||n.lab_passes!==0||n.wordpress_changed!==false||
 d.control_principles?.length!==5||d.workstream_definitions?.length!==4||
 d.csv_columns?.length!==17||d.evidence_packets!==undefined||
 d.packets?.length!==35||d.requests?.length!==140||
 d.results?.canonical_ledgers_unchanged!==true||
 d.results.actual_requests_sent!==0||d.results.actual_documents_received!==0||
 d.results.external_provider_contacted!==false||
 d.results.legal_limit_automatically_applied!==false||
 d.results.actual_lab_passes!==0||d.results.wordpress_modified!==false||
 pmsv498Ledger?.records?.length!==533||pmsv498Ledger.first_source_pending!==35)return false;
 const prev=new Map(pmsvB40Data.case_contrasts.map(x=>[x.catalog_id,x]));
 const methods=new Map(pmsvB39Data.case_gates.map(x=>[x.catalog_id,x]));
 const batches=new Map(pmsvB38Data.evidence_packets.map(x=>[x.catalog_id,x]));
 const index=new Map(d.packets.map(x=>[x.catalogue_id,x])),seen=new Set(),tallies={};
 if(prev.size!==35||methods.size!==35||batches.size!==35||index.size!==35||
 d.source_refs?.ctr!==pmsvB40Data.source.url||
 d.source_refs.methods!=="https://www.fssai.gov.in/food-testing/manuals-methods-analysis"||
 d.source_refs.laboratories!=="https://fssai.gov.in/food-testing/food-laboratories")return false;
 const expectedColumns=["request_id","catalogue_id","catalogue_product","priority","workstream",
 "owner_role","request_summary","required_evidence","source_url","sample_matrix",
 "analyte_to_confirm","method_candidate_or_validation_note","dependency",
 "completion_definition","status","assignee","due_date"];
 if(expectedColumns.some((x,i)=>d.csv_columns[i]!==x))return false;
 for(const p of d.packets){
  const v=prev.get(p.catalogue_id),m=methods.get(p.catalogue_id),b=batches.get(p.catalogue_id);
  if(!v||!m||!b||p.rank!==v.rank||p.product_name!==v.product_name||
   p.fssr!==v.fssr||p.fcs!==v.fcs||
   p.reviewed_analyte!==v.prior_ctr_reviewed_analyte||
   p.analyte_family!==b.analyte_family||
   p.regulatory_blocker!==v.blocking_class||
   p.product_scope_exception!==v.actual_vs_comparator_distinction||
   p.method_scope_exception!==m.specific_reason||
   p.matrix_exception!==(m.focus==="MATRIX_METHOD_EXCEPTION_OR_LEGAL_CATEGORY")||
   p.workstreams?.length!==4||
   p.catalogue_status!=="EXACT_CTR_ARTICLE_PENDING"||
   p.supplier_or_lot_documents_verified!==false||
   p.lab_method_accreditation_verified!==false||p.lab_report_verified!==false||
   p.signed_legal_decision!==false||p.pass!==false)return false;
  for(let i=0;i<4;i++){
   const item=p.workstreams[i];
   if(item.workstream!==pmsvB41Streams[i]||
    item.request_id!=="PMSV41-"+String(p.rank).padStart(2,"0")+"-"+String(i+1).padStart(2,"0"))return false;
  }
 }
 for(const t of d.requests){
  const p=index.get(t.catalogue_id);
  if(!p||seen.has(t.request_id)||t.catalogue_product!==p.product_name||
   !pmsvB41Streams.includes(t.workstream)||
   !p.workstreams.some(y=>y.request_id===t.request_id&&y.workstream===t.workstream)||
   t.priority!==p.case_priority||
   !t.owner_role||!t.request_summary||!t.required_evidence||
   !t.source_url||!t.completion_definition||!t.dependency||
   t.status!=="NOT_REQUESTED_RESEARCH_TEMPLATE"||
   t.assignee!==""||t.due_date!=="")return false;
  seen.add(t.request_id);tallies[t.workstream]=(tallies[t.workstream]||0)+1;
 }
 return seen.size===140&&pmsvB41Streams.every(s=>tallies[s]===35)&&
 d.packets.filter(p=>p.matrix_exception).length===13;
}
function pmsvB41Filtered(){
 if(!pmsvB41Valid())return [];
 const q=pmsvB41Search.trim().toLowerCase();
 return pmsvB41Data.requests.filter(x=>
 (pmsvB41Workstream==="ALL"||x.workstream===pmsvB41Workstream)&&
 (pmsvB41Priority==="ALL"||x.priority===pmsvB41Priority)&&
 (!q||[x.catalogue_product,x.catalogue_id,x.workstream,x.request_summary,
 x.required_evidence,x.analyte_to_confirm,x.request_id].some(z=>String(z).toLowerCase().includes(q))));
}
function pmsvB41CSV(data){
 if(!pmsvB41Valid())return "";
 const d=pmsvB41Data,c=d.csv_columns;
 const safe=value=>{
  let s=String(value==null?"":value);
  if(/^[\s]*[=+@\-]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';
 };
 return [c.map(safe).join(","),...data.map(r=>c.map(k=>safe(r[k])).join(","))].join("\r\n")+"\r\n";
}
function pmsvB41RequestText(t){
 if(!pmsvB41Valid()||!pmsvB41Data.requests.some(x=>x.request_id===t.request_id))return "";
 return ["Subject: Evidence request - "+t.catalogue_product+" / "+t.workstream,
 "Reference: "+t.request_id,
 "Proposed function: "+t.owner_role,
 "",
 "Please provide the following documentary evidence for independent technical review:",
 t.required_evidence,
 "",
 "Specific outstanding question: "+t.request_summary,
 "Analytical target under review (not approved): "+t.analyte_to_confirm,
 "Potential method or reason further method proof is needed: "+t.method_candidate_or_validation_note,
 "Dependency: "+t.dependency,
 "Completion evidence: "+t.completion_definition,
 "Source for reviewer: "+t.source_url,
 "",
 "This is a draft request, not a sent communication. No legal CTR applicability, laboratory result, or product compliance is confirmed."
 ].join("\n");
}
function pmsvB41Rows(){
 const e=pmsvB14Esc;
 return pmsvB41Filtered().map(t=>'<tr><td><b>'+e(t.catalogue_product)+
 '</b><div><small>'+e(t.request_id)+'</small></div></td>'+
 '<td>'+e(t.workstream.replaceAll("_"," "))+'</td>'+
 '<td>'+e(t.owner_role.replaceAll("_"," "))+'</td>'+
 '<td>'+e(t.request_summary)+'</td>'+
 '<td><button type="button" data-pmsv-b41-show="'+e(t.request_id)+'">Inspect draft</button></td></tr>').join("");
}
function pmsvB41Detail(){
 if(!pmsvB41Valid()||!pmsvB41Selected)return "";
 const t=pmsvB41Data.requests.find(x=>x.request_id===pmsvB41Selected);
 if(!t)return "";
 const e=pmsvB14Esc;
 return '<div class="notice"><b>Unsent request template:</b> '+e(t.request_id)+
 '</div><p><b>To approach:</b> '+e(t.owner_role.replaceAll("_"," "))+'</p>'+
 '<p><b>Required evidence:</b> '+e(t.required_evidence)+'</p>'+
 '<p><b>Dependency:</b> '+e(t.dependency)+'</p>'+
 '<p><a target="_blank" rel="noopener noreferrer" href="'+e(t.source_url)+'">Official source reference</a></p>'+
 '<p><button type="button" data-pmsv-b41-copy="'+e(t.request_id)+'">Copy request text</button> '+
 '<button type="button" data-pmsv-b41-export="'+e(t.request_id)+'">Export one CSV row</button></p>'+
 '<p data-pmsv-b41-copy-state></p>';
}
function pmsvB41Panel(){
 if(!pmsvB41Valid())return "";
 const e=pmsvB14Esc,d=pmsvB41Data;
 return '<details class="card" id="pmsv-b41-documentary-handoff" style="margin-bottom:12px">'+
 '<summary><b>Batch41 · Export 140 supplier / regulatory / lab / QA evidence requests</b> for 35 pending products</summary>'+
 '<div class="notice"><b>Research templates only:</b> None of these 140 requests has been sent. No assignee, due date, document receipt, legal CTR article, laboratory test result, or compliance PASS has been confirmed. Downloading/copying creates drafts only; it does not submit them.</div>'+
 '<p><a href="'+e(d.source_refs.laboratories)+'" target="_blank" rel="noopener noreferrer">Official FSSAI notified food laboratories</a> · '+
 '<a href="'+e(d.source_refs.methods)+'" target="_blank" rel="noopener noreferrer">Current FSSAI analytical method index</a> · '+
 '<a href="'+e(d.source_refs.ctr)+'" target="_blank" rel="noopener noreferrer">CTR Version IX comparator reference</a></p>'+
 '<p><button type="button" data-pmsv-b41-export="ALL">Download all 140 evidence requests (CSV)</button> '+
 '<button type="button" data-pmsv-b41-export="FILTERED">Download filtered requests (CSV)</button></p>'+
 '<p><label>Search SKU, substance, method or evidence <input data-pmsv-b41-query type="search" placeholder="cocoa, polyols, coffee, LOQ, lead" /></label></p>'+
 '<p><label>Document owner group <select data-pmsv-b41-stream>'+
 '<option value="ALL">All four workstreams (140)</option>'+
 '<option value="PRODUCT_IDENTITY">Product identity / supplier (35)</option>'+
 '<option value="LEGAL_CTR_APPLICABILITY">Regulatory legal article (35)</option>'+
 '<option value="LAB_METHOD_AND_SCOPE">Lab method and scope (35)</option>'+
 '<option value="LOT_SAMPLE_AND_QA">Site QA and sample report (35)</option>'+
 '</select></label> <label>Priority <select data-pmsv-b41-priority>'+
 '<option value="ALL">All 35 product priorities</option>'+
 '<option value="P0_SPECIFIC_METHOD_RISK">13 specific matrix method exceptions</option>'+
 '<option value="P1_ORDINARY_SCOPE_GATING">22 other source-evidence cases</option>'+
 '</select></label></p>'+
 '<p data-pmsv-b41-count>'+pmsvB41Filtered().length+' unsent request templates; 0 results / approvals</p>'+
 '<div class="tablewrap" style="max-height:540px;overflow:auto"><table><thead><tr>'+
 '<th>Product / Request ID</th><th>Workstream</th><th>Suggested function</th><th>Tailored outstanding question</th><th>Draft</th></tr></thead>'+
 '<tbody data-pmsv-b41-rows>'+pmsvB41Rows()+'</tbody></table></div>'+
 '<div data-pmsv-b41-detail></div></details>';
}
function pmsvB41Refresh(){
 if(typeof document==="undefined"||!pmsvB41Valid())return;
 const host=document.getElementById("pmsv-b40-current35-source-contrast")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!host)return;
 const panel=document.getElementById("pmsv-b41-documentary-handoff");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB41Panel());return}
 const body=panel.querySelector("[data-pmsv-b41-rows]");
 const detail=panel.querySelector("[data-pmsv-b41-detail]");
 const count=panel.querySelector("[data-pmsv-b41-count]");
 if(body)body.innerHTML=pmsvB41Rows();
 if(detail)detail.innerHTML=pmsvB41Detail();
 if(count)count.textContent=pmsvB41Filtered().length+" unsent draft requests, no confirmed tasks or compliance.";
}
function pmsvB41Export(which){
 if(typeof document==="undefined"||!pmsvB41Valid())return;
 let selected=which==="ALL"?pmsvB41Data.requests:
 which==="FILTERED"?pmsvB41Filtered():pmsvB41Data.requests.filter(t=>t.request_id===which);
 if(!selected.length)return;
 const csv=pmsvB41CSV(selected),blob=new Blob(["\uFEFF",csv],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="PMSV-Batch41-evidence-requests-"+(which==="ALL"?"all140":which==="FILTERED"?"filtered":which)+".csv";
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
async function pmsvB41Copy(id){
 const t=pmsvB41Data?.requests?.find(x=>x.request_id===id);
 const report=document.querySelector("#pmsv-b41-documentary-handoff [data-pmsv-b41-copy-state]");
 if(!t||!report)return;
 try{
  if(!navigator.clipboard?.writeText)throw Error("Clipboard API unavailable");
  await navigator.clipboard.writeText(pmsvB41RequestText(t));
  report.textContent="Draft request copied. Not sent to anyone.";
 }catch(_){
  report.textContent="Automatic copy not available here. Use the complete draft text below.";
  const pre=document.createElement("pre");pre.textContent=pmsvB41RequestText(t);
  pre.style.whiteSpace="pre-wrap";report.appendChild(pre);
 }
}
function pmsvB41Product(p){
 if(!p||!pmsvB41Valid())return "";
 const d=pmsvB41Data.packets.find(x=>x.catalogue_id===p.id);
 if(!d||d.product_name!==p.name||
 String(d.fssr||"")!==String(p.fssr||"")||
 String(d.fcs||"")!==String(p.fcs||""))return "";
 const e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px"><summary><b>Batch41 · Four real-evidence requests available</b> (unsent drafts)</summary>'+
 '<p><b>Current scope blocker:</b> '+e(d.product_scope_exception)+'</p>'+
 '<p><b>Method check:</b> '+e(d.method_scope_exception)+'</p><ol>'+
 d.workstreams.map(x=>'<li><b>'+e(x.workstream.replaceAll("_"," "))+'</b>: '+
 e(x.request_summary)+' <small>('+e(x.request_id)+')</small></li>').join("")+
 '</ol><div class="notice">None sent or assigned, no actual lot report, no CTR product article signed, no regulatory PASS.</div></details>';
}
const pmsvB41PriorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB41PriorLoad();pmsvB41Data=null;
 try{
  const r=await fetch(pmsvB41Path+"?v=20261016-b41",{cache:"reload"});
  if(!r.ok)throw Error("Batch41 exportable evidence-request register unavailable");
  pmsvB41Data=await r.json();
  if(!pmsvB41Valid())throw Error("Batch41 checksum or upstream pending-case mismatch");
  pmsvB41Refresh();
 }catch(_){pmsvB41Data=null;}
};
const pmsvB41OldProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB41Product(p)+pmsvB41OldProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b41-query]")){
   pmsvB41Search=String(ev.target.value||"").slice(0,130);pmsvB41Refresh();
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b41-stream]")&&
   ["ALL",...pmsvB41Streams].includes(ev.target.value)){
   pmsvB41Workstream=ev.target.value;pmsvB41Selected=null;pmsvB41Refresh();
  }else if(ev.target?.matches?.("[data-pmsv-b41-priority]")&&
  ["ALL","P0_SPECIFIC_METHOD_RISK","P1_ORDINARY_SCOPE_GATING"].includes(ev.target.value)){
   pmsvB41Priority=ev.target.value;pmsvB41Selected=null;pmsvB41Refresh();
  }
 });
 document.addEventListener("click",ev=>{
  const show=ev.target?.closest?.("[data-pmsv-b41-show]");
  if(show){pmsvB41Selected=show.getAttribute("data-pmsv-b41-show");pmsvB41Refresh();return}
  const copy=ev.target?.closest?.("[data-pmsv-b41-copy]");
  if(copy){pmsvB41Copy(copy.getAttribute("data-pmsv-b41-copy"));return}
  const exportButton=ev.target?.closest?.("[data-pmsv-b41-export]");
  if(exportButton)pmsvB41Export(exportButton.getAttribute("data-pmsv-b41-export"));
 });
}
