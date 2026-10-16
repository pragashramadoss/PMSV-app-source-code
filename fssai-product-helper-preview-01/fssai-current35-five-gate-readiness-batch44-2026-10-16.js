"use strict";
/* Batch44: 175 UNSENT evidence gates, not legal clearance, not persistent task tracking. */
var pmsvB44Data=null,pmsvB44Term="",pmsvB44Gate="ALL",pmsvB44Family="ALL",pmsvB44CurrentId="";
const pmsvB44Path="./data/rules/fssai-current35-five-gate-readiness-batch44-2026-10-16.json";
const pmsvB44Expected="e01c1d41f7da11b4";
const pmsvB44GateCodes=["SOURCE_VERSION_AND_METHOD_AUTHORITY","COMMERCIAL_ARTICLE_IDENTITY","LEGAL_CTR_ARTICLE_AND_ANALYTE","LAB_MATRIX_METHOD_AND_LOQ","LOT_COA_AND_INDEPENDENT_SIGNOFF"];
function pmsvB44Valid(){
 if(typeof pmsvB43Valid!=="function"||!pmsvB43Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB44Data||
 pmsvB14Digest(pmsvB44Data)!==pmsvB44Expected)return false;
 const d=pmsvB44Data,n=d.counts,src=d.method_authority_status;
 if(d.kind!=="PMSV_CURRENT35_EVIDENCE_GATES_AFTER_METHOD_AUTHORITY_CHECK_BATCH44"||
 d.schema_version!=="1.0"||d.as_of!=="2026-10-16"||
 d.environment!=="GH_PAGES_PREVIEW_ONLY"||
 n?.catalogue!==533||n.conditional_first_source_matches!==498||
 n.exact_ctr_pending!==35||n.gated_cases!==35||
 n.documentary_readiness_gates!==175||n.gates_per_case!==5||
 n.authority_gate_requests!==35||n.market_identity_gate_requests!==35||
 n.ctr_article_gate_requests!==35||n.laboratory_method_gate_requests!==35||
 n.lot_signoff_gate_requests!==35||
 n.trace_metal_cases_with_consultation_hold!==27||
 n.nonmetal_cases_with_analyte_hold!==8||n.seven_ambiguous_2024_methods!==7||
 n.official_method_source_findings!==5||
 n.current_confirmed_final_adoption_of_draft!==0||
 n.method_authority_selected!==0||n.evidence_request_sent!==0||
 n.supplier_documents_verified!==0||n.signed_legal_ctr_approvals!==0||
 n.actual_lot_lab_passes!==0||n.wordpress_changed!==false||
 src?.official_2024_consultation_document_verified!==true||
 src.draft_52_page_notified_for_stakeholder_comments!==true||
 src.finalisation_order_for_52_page_pdf_verified!==false||
 src.supersession_precedence_between_52p_and_61p_verified!==false||
 src.listed_generic_manual_on_metals_in_current_FSSAI_methods_index!==true||
 src.mandatory_adoption_orders_listed_separately_in_official_index!==true||
 src.not_found_means_does_not_exist!==false||
 d.primary_source_findings?.length!==5||
 d.gate_definitions?.length!==5||
 d.case_gate_dossiers?.length!==35||
 d.request_rows?.length!==175||
 d.controls?.length!==6||
 d.results?.legacy_B41_B43_unchanged!==true||
 d.results.new_actual_documents_received!==0||
 d.results.real_laboratories_contacted!==0||
 d.results.no_source_adoption_inferred!==true||
 d.results.no_lab_pass_inferred!==true||
 d.results.no_ctr_limit_transferred!==true||
 d.results.wordpress_unchanged!==true||
 d.official_source_urls?.notice!==pmsvB43Data.primary_source_chain[0].url||
 d.official_source_urls?.draft!==pmsvB43Data.primary_source_chain[2].url||
 d.official_source_urls?.trace!==pmsvB43Data.primary_source_chain[3].url||
 pmsv498Ledger?.records?.length!==533||
 pmsv498Ledger.first_source_pending!==35)return false;
 if(d.gate_definitions.some((x,i)=>x.code!==pmsvB44GateCodes[i]))return false;
 const p43=new Map(pmsvB43Data.affected_cases.map(x=>[x.catalog_id,x]));
 const p41=new Map(pmsvB41Data.packets.map(x=>[x.catalogue_id,x]));
 const present=new Set(),tallies={};
 let metals=0,nonmetals=0;
 for(const c of d.case_gate_dossiers){
  const o=p43.get(c.catalogue_id),q=p41.get(c.catalogue_id);
  if(!o||!q||present.has(c.catalogue_id)||
   c.rank!==o.rank||c.product_name!==o.product_name||
   c.fssr!==o.fssr||c.fcs!==o.fcs||c.analyte!==o.analyte||
   c.analyte_family!==o.family||c.priority!==o.case_priority||
   c.existing_four_request_ids?.length!==4||
   c.existing_four_request_ids.some((z,i)=>z!==o.linked_four_request_ids[i])||
   c.new_five_gate_ids?.length!==5||
   c.new_five_gate_ids.some((z,i)=>z!=="PMSV44-"+String(c.rank).padStart(2,"0")+"-"+String(i+1).padStart(2,"0"))||
   c.method_authority_hold!==o.existing_hold||
   c.matrix_exception_context!==q.method_scope_exception||
   c.legal_article_context!==q.product_scope_exception||
   c.source_version_approved!==false||c.commercial_identity_verified!==false||
   c.legal_ctr_article_signed!==false||c.matrix_lab_method_validated!==false||
   c.actual_lot_approved!==false||
   c.gate_status!=="FIVE_INDEPENDENT_EVIDENCE_GATES_OPEN")return false;
  present.add(c.catalogue_id);
  if(c.analyte_family==="TRACE_METALS")metals++;else nonmetals++;
 }
 if(present.size!==35||metals!==27||nonmetals!==8)return false;
 const unique=new Set();
 for(const r of d.request_rows){
  if(!present.has(r.catalogue_id)||unique.has(r.request_id)||
   !pmsvB44GateCodes.includes(r.gate_code)||
   !d.case_gate_dossiers.some(x=>x.catalogue_id===r.catalogue_id&&x.new_five_gate_ids.includes(r.request_id))||
   !r.owner_role||!r.exact_evidence_required||!r.source_url||
   r.task_state!=="UNSENT_REVIEW_TEMPLATE"||
   r.lab_or_supplier_assignee!==""||r.due_date!==""||
   r.document_received!==false||r.signed_review_completed!==false||
   r.approved_method_selected!==false||r.numeric_ctr_applied!==false||
   r.lot_compliance_pass!==false)return false;
  unique.add(r.request_id);tallies[r.gate_code]=(tallies[r.gate_code]||0)+1;
 }
 return unique.size===175&&pmsvB44GateCodes.every(x=>tallies[x]===35);
}
function pmsvB44Rows(){
 if(!pmsvB44Valid())return [];
 const q=pmsvB44Term.toLowerCase().trim();
 return pmsvB44Data.request_rows.filter(r=>
 (pmsvB44Gate==="ALL"||r.gate_code===pmsvB44Gate)&&
 (pmsvB44Family==="ALL"||
 (pmsvB44Family==="METALS"&&r.analyte_family==="TRACE_METALS")||
 (pmsvB44Family==="NONMETALS"&&r.analyte_family!=="TRACE_METALS"))&&
 (!q||[r.catalogue_id,r.product_name,r.analyte,r.gate_label,r.exact_evidence_required,r.owner_role].some(s=>String(s).toLowerCase().includes(q))));
}
function pmsvB44CSV(rows){
 if(!pmsvB44Valid())return "";
 const fields=["request_id","catalogue_id","product_name","analyte","analyte_family","gate_code","gate_label","owner_role","source_url","source_status","exact_evidence_required","predecessor_gate_codes","priority","task_state","lab_or_supplier_assignee","due_date","document_received","signed_review_completed","approved_method_selected","numeric_ctr_applied","lot_compliance_pass"];
 const csvSafe=v=>{
  let s=String(v===undefined||v===null?"":v);
  if(/^\s*[+\-=@]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';
 };
 return [fields.map(csvSafe).join(","),...rows.map(r=>fields.map(k=>csvSafe(r[k])).join(","))].join("\r\n")+"\r\n";
}
function pmsvB44Download(group){
 if(typeof document==="undefined"||!pmsvB44Valid())return;
 const rows=group==="ALL"?pmsvB44Data.request_rows:pmsvB44Rows();
 if(!rows.length)return;
 const content=pmsvB44CSV(rows),blob=new Blob(["\uFEFF",content],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob),node=document.createElement("a");
 node.href=url;node.download="PMSV-B44-unsent-5-gate-evidence-"+(group==="ALL"?"all175":"filtered")+".csv";
 document.body.appendChild(node);node.click();node.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function pmsvB44RequestText(r){
 if(!pmsvB44Valid()||!pmsvB44Data.request_rows.some(x=>x.request_id===r.request_id))return "";
 return ["DRAFT ONLY — NOT SENT / NOT APPROVED",
  "Reference: "+r.request_id,
  "Product: "+r.product_name+" | Analyte: "+r.analyte,
  "Function: "+r.owner_role,
  "Gate: "+r.gate_label,
  "Required evidence: "+r.exact_evidence_required,
  "Dependency: "+r.predecessor_gate_codes,
  "Original official source: "+r.source_url,
  "FSSAI method authority caveat: The June 26, 2024 52-page Metals and Minerals PDF was sent for public comment before finalisation. The competing 61-page Trace Elements PDF has conflicting method IDs; neither has been approved for this sample. Obtain proof of applicable adopted method and laboratory scope.",
  "No actual samples, supplier documents, method validation, legal CTR approval or lot PASS are confirmed."
 ].join("\n");
}
function pmsvB44Panel(){
 if(!pmsvB44Valid())return "";
 const d=pmsvB44Data,e=pmsvB14Esc;
 const warn='<div class="notice"><b>Source authority remains unresolved:</b> 52-page metals manual was a June 2024 consultation attachment. Official index currently lists a separate generic Metals manual and a separate list of mandatory adoption orders, but does NOT itself resolve these 2024 method numbers. 61-page Trace Elements precedence is also unverified. All requests here are UNSENT, with zero laboratory/CTR approvals.</div>';
 return '<details open class="card" id="pmsv-b44-five-gate-readiness" style="margin-bottom:12px">'+
 '<summary><b>Batch44 · Five-gate evidence readiness</b> — 175 draft requests across 35 pending cases</summary>'+
 warn+
 '<p><a target="_blank" rel="noopener noreferrer" href="'+e(d.official_source_urls.methodsIndex)+'">FSSAI methods and adoption orders index</a> · '+
 '<a target="_blank" rel="noopener noreferrer" href="'+e(d.official_source_urls.notice)+'">FSSAI June 2024 signed consultation notice</a></p>'+
 '<details><summary><b>Five independent documentary gates</b></summary><ol>'+
 d.gate_definitions.map(g=>'<li><b>'+e(g.label)+'</b> — '+e(g.basis)+'</li>').join("")+'</ol></details>'+
 '<p><button type="button" data-pmsv-b44-export="ALL">Export all 175 unsent gates (CSV)</button> '+
 '<button type="button" data-pmsv-b44-export="FILTERED">Export filtered CSV</button></p>'+
 '<p><label>Search product, analyte, evidence <input data-pmsv-b44-search type="search" placeholder="cocoa, lead, LOQ, chicory, royal jelly" /></label></p>'+
 '<p><label>Gate <select data-pmsv-b44-gate><option value="ALL">All five (175)</option>'+
 d.gate_definitions.map(g=>'<option value="'+e(g.code)+'">'+e(g.label)+' (35)</option>').join("")+
 '</select></label> <label>Matrix group <select data-pmsv-b44-family>'+
 '<option value="ALL">All 35 products</option><option value="METALS">27 trace-metal cases</option>'+
 '<option value="NONMETALS">8 other analyte cases</option></select></label></p>'+
 '<p data-pmsv-b44-count>'+pmsvB44Rows().length+' unsent review requests; zero approved methods</p>'+
 '<div class="tablewrap" style="max-height:530px;overflow:auto"><table><thead><tr>'+
 '<th>Product / request</th><th>Analyte</th><th>Gate</th><th>Specific document needed</th><th>Draft</th></tr></thead><tbody data-pmsv-b44-rows>'+
 pmsvB44RowHtml()+'</tbody></table></div><div data-pmsv-b44-detail></div></details>';
}
function pmsvB44RowHtml(){
 if(!pmsvB44Valid())return "";
 const e=pmsvB14Esc;
 return pmsvB44Rows().map(r=>'<tr><td><b>'+e(r.product_name)+'</b><div><small>'+e(r.request_id)+'</small></div></td>'+
 '<td>'+e(r.analyte)+'</td><td>'+e(r.gate_label)+'</td>'+
 '<td>'+e(r.exact_evidence_required)+'</td>'+
 '<td><button type="button" data-pmsv-b44-select="'+e(r.request_id)+'">Inspect</button></td></tr>').join("");
}
function pmsvB44DetailHtml(){
 if(!pmsvB44Valid()||!pmsvB44CurrentId)return "";
 const t=pmsvB44Data.request_rows.find(r=>r.request_id===pmsvB44CurrentId),e=pmsvB14Esc;
 if(!t)return "";
 return '<div class="notice"><b>UNSENT DRAFT:</b> '+e(t.request_id)+'</div>'+
 '<p><b>Suggested function:</b> '+e(t.owner_role)+'</p>'+
 '<p><b>Needed proof:</b> '+e(t.exact_evidence_required)+'</p>'+
 '<p><b>Dependencies:</b> '+e(t.predecessor_gate_codes)+'</p>'+
 '<p><a href="'+e(t.source_url)+'" target="_blank" rel="noopener noreferrer">Original official reference</a></p>'+
 '<p><button type="button" data-pmsv-b44-copy="'+e(t.request_id)+'">Copy unsent request text</button></p>'+
 '<p data-pmsv-b44-copy-state></p>';
}
function pmsvB44Refresh(){
 if(typeof document==="undefined"||!pmsvB44Valid())return;
 const host=document.getElementById("pmsv-b43-consultation-provenance")||
 document.getElementById("pmsv-b41-documentary-handoff")||
 document.getElementById("pmsv-b14-review-index");
 if(!host)return;
 let panel=document.getElementById("pmsv-b44-five-gate-readiness");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB44Panel());return}
 const table=panel.querySelector("[data-pmsv-b44-rows]"),count=panel.querySelector("[data-pmsv-b44-count]"),
 detail=panel.querySelector("[data-pmsv-b44-detail]");
 if(table)table.innerHTML=pmsvB44RowHtml();
 if(count)count.textContent=pmsvB44Rows().length+" unsent requests; zero approvals.";
 if(detail)detail.innerHTML=pmsvB44DetailHtml();
}
function pmsvB44Product(p){
 if(!p||!pmsvB44Valid())return "";
 const c=pmsvB44Data.case_gate_dossiers.find(x=>x.catalogue_id===p.id);
 if(!c||c.product_name!==p.name||String(c.fssr||"")!==String(p.fssr||"")||
 String(c.fcs||"")!==String(p.fcs||""))return "";
 const e=pmsvB14Esc;
 return '<details class="card" open style="margin-top:12px"><summary><b>Batch44 · five open documentary gates</b></summary>'+
 '<p><b>Method authority:</b> '+e(c.method_authority_hold)+'</p>'+
 '<p><b>Legal article identity blocker:</b> '+e(c.legal_article_context)+'</p>'+
 '<ol>'+c.new_five_gate_ids.map((id,i)=>'<li><b>'+e(pmsvB44Data.gate_definitions[i].label)+'</b> · '+e(id)+' — evidence pending</li>').join("")+'</ol>'+
 '<div class="notice">None of the five steps is verified or signed; no actual lab data or finished product PASS.</div></details>';
}
const pmsvB44EarlierLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB44EarlierLoad();pmsvB44Data=null;
 try{
  const r=await fetch(pmsvB44Path+"?v=20261016-b44",{cache:"reload"});
  if(!r.ok)throw Error("Batch44 documentary gate register unavailable");
  pmsvB44Data=await r.json();
  if(!pmsvB44Valid())throw Error("Batch44 source adoption or ledger integrity mismatch");
  pmsvB44Refresh();
 }catch(_){pmsvB44Data=null}
};
const pmsvB44EarlierProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB44Product(p)+pmsvB44EarlierProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b44-search]")){
   pmsvB44Term=String(ev.target.value||"").slice(0,130);pmsvB44Refresh()
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b44-gate]")&&["ALL",...pmsvB44GateCodes].includes(ev.target.value)){
   pmsvB44Gate=ev.target.value;pmsvB44CurrentId="";pmsvB44Refresh()
  }
  if(ev.target?.matches?.("[data-pmsv-b44-family]")&&["ALL","METALS","NONMETALS"].includes(ev.target.value)){
   pmsvB44Family=ev.target.value;pmsvB44CurrentId="";pmsvB44Refresh()
  }
 });
 document.addEventListener("click",async ev=>{
  const inspect=ev.target?.closest?.("[data-pmsv-b44-select]");
  if(inspect){pmsvB44CurrentId=inspect.getAttribute("data-pmsv-b44-select");pmsvB44Refresh();return}
  const exportBtn=ev.target?.closest?.("[data-pmsv-b44-export]");
  if(exportBtn){pmsvB44Download(exportBtn.getAttribute("data-pmsv-b44-export"));return}
  const copy=ev.target?.closest?.("[data-pmsv-b44-copy]");
  if(!copy||!pmsvB44Valid())return;
  const r=pmsvB44Data.request_rows.find(x=>x.request_id===copy.getAttribute("data-pmsv-b44-copy"));
  const label=document.querySelector("#pmsv-b44-five-gate-readiness [data-pmsv-b44-copy-state]");
  if(!r||!label)return;
  try{
   if(!navigator.clipboard?.writeText)throw Error("No clipboard access");
   await navigator.clipboard.writeText(pmsvB44RequestText(r));
   label.textContent="Draft text copied. Not sent.";
  }catch(_){
   label.textContent="Copy unavailable. Full draft follows:";
   const pre=document.createElement("pre");
   pre.style.whiteSpace="pre-wrap";pre.textContent=pmsvB44RequestText(r);label.appendChild(pre);
  }
 });
}
