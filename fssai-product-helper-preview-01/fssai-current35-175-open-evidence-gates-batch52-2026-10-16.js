"use strict";
/* Batch52: read-only crosswalk of 35 pending CTR cases and 175 UNSENT evidence requests.
   This panel creates no approvals, sends no requests, and stores no evidence. */
var pmsvB52Data=null,pmsvB52Filter="ALL",pmsvB52Search="",pmsvB52Selected="";
const pmsvB52Path="./data/rules/fssai-current35-175-open-evidence-gates-batch52-2026-10-16.json";
const pmsvB52Expected="777300b95342a6b4";
function pmsvB52Valid(){
 if(typeof pmsvB51Valid!=="function"||!pmsvB51Valid()||
    typeof pmsvB14Digest!=="function"||!pmsvB52Data||
    pmsvB14Digest(pmsvB52Data)!==pmsvB52Expected)return false;
 const d=pmsvB52Data,n=d.counts;
 if(d.kind!=="PMSV_BATCH52_35_CASE_175_UNSENT_GATE_REVIEW_AND_SOURCE_FRESHNESS"||
 d.as_of!=="2026-10-16"||d.environment!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
 d.latest_non_specified_register_date!=="2026-09-01"||
 d.prior_checked_sajji_register_date!=="2026-06-03"||
 n.catalogue!==533||n.conditional_first_source_matches!==498||
 n.current_ctr_article_cases_pending!==35||n.previously_sourced_named_identity_references!==28||
 n.umbrella_material_identity_cases!==7||n.five_gate_requests!==175||
 n.gate_requests_per_case!==5||n.requests_sent!==0||n.case_documents_received!==0||
 n.signed_ctr_article_approvals!==0||n.matrix_approved_methods!==0||n.lot_passes!==0||
 n.previously_retained_advisory_lab_points!==280||
 n.previously_retained_future_law_prompts!==210||n.wordpress_changed!==false||
 d.cases?.length!==35||d.gate_definitions?.length!==5||
 Object.values(d.results||{}).some(v=>v!==true))return false;
 const old=new Map(pmsvB51Data.full_35_ctr_worklist.map(x=>[x.catalogue_id,x]));
 const ids=new Set(),gates=new Set();let seven=0,published=0;
 for(const x of d.cases){
  const prev=old.get(x.catalogue_id);
  if(!prev||ids.has(x.catalogue_id)||prev.rank!==x.rank||
   prev.product_name!==x.product_name||x.upstream_legal_gate!==prev.legal_gate||
   x.product_standard_identity_source_known!==prev.source_identity_known||
   x.seven_material_intake!==prev.included_in_seven_intake||
   x.current_ctr_legal_article_signed!==false||x.matrix_method_validated!==false||
   x.real_commercial_identity_verified!==false||x.lot_pass!==false||
   x.gates?.length!==5)return false;
  if(x.seven_material_intake)seven++;
  else if(x.product_standard_identity_source_known)published++;
  ids.add(x.catalogue_id);
  for(const g of x.gates){
   if(!g.request_id||gates.has(g.request_id)||!g.requested_evidence||
    !d.gate_definitions.some(q=>q.code===g.gate_code)||
    g.document_received!==false||g.signed_review_completed!==false||
    g.task_state!=="UNSENT_NO_DOCUMENT_RECEIVED")return false;
   gates.add(g.request_id);
  }
 }
 return(ids.size===35&&gates.size===175&&seven===7&&published===28&&
  d.cases.find(x=>x.rank===24)?.status_register_row_unverified===true);
}
function pmsvB52Rows(){
 if(!pmsvB52Valid())return [];
 const q=pmsvB52Search.toLowerCase().trim();
 return pmsvB52Data.cases.filter(x=>
 (pmsvB52Filter==="ALL"||
  (pmsvB52Filter==="P0"&&x.priority.startsWith("P0"))||
  (pmsvB52Filter==="P1"&&x.priority.startsWith("P1"))||
  (pmsvB52Filter==="SEVEN"&&x.seven_material_intake)||
  (pmsvB52Filter==="PUBLISHED"&&x.product_standard_identity_source_known&&!x.seven_material_intake)||
  (pmsvB52Filter==="SAJJI"&&x.rank===24))&&
 (!q||[x.rank,x.product_name,x.analyte,x.catalogue_id,x.priority].some(s=>String(s).toLowerCase().includes(q))));
}
function pmsvB52Table(){
 const e=pmsvB14Esc;
 return pmsvB52Rows().map(x=>'<tr><td>'+e(x.rank)+'</td><td><b>'+e(x.product_name)+'</b>'+
 '<small> '+e(x.catalogue_id)+'</small></td><td>'+e(x.analyte)+'</td>'+
 '<td>'+e(x.seven_material_intake?"Specific material identity missing":"Published product identity reference only")+
 '</td><td>0/5 verified · UNSENT</td><td><button type="button" data-pmsv-b52-select="'+
 e(x.catalogue_id)+'">Review gates</button></td></tr>').join("");
}
function pmsvB52Details(){
 if(!pmsvB52Valid())return "";
 const e=pmsvB14Esc,x=pmsvB52Data.cases.find(c=>c.catalogue_id===pmsvB52Selected);
 if(!x)return "";
 return '<div class="notice"><b>'+e(x.product_name)+'</b> · '+e(x.analyte)+
 ' · 5/5 independent gate receipts still required. None has been received or approved.</div>'+
 (x.rank===24?'<p><b>Freshness exception:</b> Official non-specified-food index advertises a 1 Sep 2026 register, but its exact Sajji Khar rows have NOT been rechecked. June 2026 application outcomes do not determine this supplier\'s current lawful basis. <a target="_blank" rel="noopener noreferrer" href="https://www.fssai.gov.in/standards/non-specified-food">Official latest index</a>.</p>':"")+
 '<p><b>Immediate next evidence:</b> '+e(x.immediate_next_action)+'</p>'+
 '<p><b>Priority:</b> '+e(x.priority)+' · <b>Legacy CTR hold:</b> '+e(x.upstream_legal_gate)+'</p>'+
 '<div class="tablewrap"><table><thead><tr><th>Independent gate</th><th>Owner role</th><th>Specific evidence required</th><th>State</th></tr></thead><tbody>'+
 x.gates.map(g=>'<tr><td><b>'+e(g.label)+'</b><small> '+e(g.request_id)+'</small></td><td>'+e(g.owner_role)+
 '</td><td>'+e(g.requested_evidence)+'</td><td>UNSENT / not received</td></tr>').join("")+
 '</tbody></table></div><p><button type="button" data-pmsv-b52-copy>Copy UNSENT five-gate request</button></p>'+
 '<small>Evidence entry and review remain in pre-existing controlled workflows. This display does not accept, submit or validate confidential data.</small>';
}
function pmsvB52Panel(){
 if(!pmsvB52Valid())return "";
 return '<details class="card" id="pmsv-b52-legal-gate-queue" style="margin-bottom:12px">'+
 '<summary><b>Batch52 · All 35 unresolved legal cases</b> — 175 specific evidence gates, read-only</summary>'+
 '<div class="notice"><b>533 catalogue · 498 conditional source matches · 35 CTR legal holds.</b> 28 have published identity/recipe references; seven need named material identity. 175 previous gate requests are UNSENT; 0 documents received, 0 signed CTR limits, 0 approved laboratory methods and 0 lot PASS. A category standard is not regulatory clearance.</div>'+
 '<p><b>Source freshness:</b> FSSAI now indexes a 1 Sep 2026 non-specified-food applications register; exact Sajji Khar rows have not been independently verified. The June 2026 record cannot be treated as latest status. <a href="https://www.fssai.gov.in/standards/non-specified-food" target="_blank" rel="noopener noreferrer">FSSAI official index</a>.</p>'+
 '<p><button type="button" data-pmsv-b52-export>Download 175-row BLANK documentary request CSV (no commercial inputs)</button></p>'+
 '<p><label>Search <input type="search" data-pmsv-b52-search placeholder="e.g., cocoa, colostrum, lead, 24" /></label> '+
 '<label>Review focus <select data-pmsv-b52-filter><option value="ALL">All 35</option>'+
 '<option value="P0">P0 specific-method risk (13)</option><option value="P1">P1 legal scope hold (22)</option>'+
 '<option value="SEVEN">Seven material identity gaps</option><option value="PUBLISHED">28 published identity references</option>'+
 '<option value="SAJJI">Sajji Khar register freshness</option></select></label></p>'+
 '<p data-pmsv-b52-count>35 cases · 175 UNSENT requests</p>'+
 '<div class="tablewrap" style="max-height:480px;overflow:auto"><table><thead><tr><th>#</th><th>Commodity</th><th>Analyte</th><th>Identity evidence</th><th>Gate completion</th><th>Action</th></tr></thead>'+
 '<tbody data-pmsv-b52-rows>'+pmsvB52Table()+'</tbody></table></div>'+
 '<div data-pmsv-b52-detail></div></details>';
}
function pmsvB52Refresh(details){
 if(!pmsvB52Valid()||typeof document==="undefined")return;
 const anchor=document.getElementById("pmsv-b51-evidence-intake")||
 document.getElementById("pmsv-b50-source-dispositions");
 if(!anchor)return;
 let panel=document.getElementById("pmsv-b52-legal-gate-queue");
 if(!panel){anchor.insertAdjacentHTML("beforebegin",pmsvB52Panel());return;}
 const tbody=panel.querySelector("[data-pmsv-b52-rows]");
 if(tbody)tbody.innerHTML=pmsvB52Table();
 const count=panel.querySelector("[data-pmsv-b52-count]");
 if(count)count.textContent=pmsvB52Rows().length+" cases shown · zero reviewed gate receipts";
 if(details){const detail=panel.querySelector("[data-pmsv-b52-detail]");if(detail)detail.innerHTML=pmsvB52Details();}
}
function pmsvB52Request(x){
 if(!pmsvB52Valid()||!pmsvB52Data.cases.includes(x))return "";
 return ["UNSENT — NOT A LEGAL APPROVAL OR LOT RELEASE","Batch52 evidence requests: "+x.product_name,
 "Case "+x.rank+" / "+x.catalogue_id+" · analyte "+x.analyte,"Current legal hold "+x.upstream_legal_gate,
 ...x.gates.map(g=>g.request_id+" ["+g.owner_role+"] "+g.label+": "+g.requested_evidence+" — NOT RECEIVED"),
 "No source, sample, method, threshold or laboratory signoff has been approved."].join("\n");
}
function pmsvB52CSV(){
 if(!pmsvB52Valid())return "";
 const esc=v=>{let s=String(v??"");if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const header=["rank","catalogue_id","product_name","analyte","priority","identity_reference_known","request_id","owner_role","gate","evidence_required","sent","document_received","signed_review_completed","lot_pass"];
 const rows=pmsvB52Data.cases.flatMap(x=>x.gates.map(g=>[x.rank,x.catalogue_id,x.product_name,x.analyte,x.priority,x.product_standard_identity_source_known,
 g.request_id,g.owner_role,g.label,g.requested_evidence,false,false,false,false]));
 return [header.map(esc).join(","),...rows.map(row=>row.map(esc).join(","))].join("\r\n")+"\r\n";
}
function pmsvB52Export(){
 if(!pmsvB52Valid())return;
 const blob=new Blob(["\uFEFF",pmsvB52CSV()],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="PMSV-B52-175-UNSENT-REVIEW-GATES-BLANK.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1100);
}
const pmsvB52PreviousLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB52PreviousLoad();pmsvB52Data=null;
 try{const r=await fetch(pmsvB52Path+"?v=20261016-b52",{cache:"reload"});
  if(!r.ok)throw Error("Batch52 source missing");pmsvB52Data=await r.json();
  if(!pmsvB52Valid())throw Error("Batch52 integrity/lineage failure");
  pmsvB52Refresh(true);
 }catch(_){pmsvB52Data=null;}
};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b52-search]")){pmsvB52Search=String(ev.target.value||"").slice(0,140);pmsvB52Refresh(false);}
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b52-filter]")&&["ALL","P0","P1","SEVEN","PUBLISHED","SAJJI"].includes(ev.target.value)){
   pmsvB52Filter=ev.target.value;pmsvB52Refresh(false);
  }
 });
 document.addEventListener("click",ev=>{
  const selected=ev.target?.closest?.("[data-pmsv-b52-select]");
  if(selected){pmsvB52Selected=selected.getAttribute("data-pmsv-b52-select");pmsvB52Refresh(true);return;}
  if(ev.target?.closest?.("[data-pmsv-b52-export]")){pmsvB52Export();return;}
  if(ev.target?.closest?.("[data-pmsv-b52-copy]")){
   const x=pmsvB52Data?.cases.find(c=>c.catalogue_id===pmsvB52Selected);
   if(x&&navigator.clipboard?.writeText)navigator.clipboard.writeText(pmsvB52Request(x)).catch(()=>{});
  }
 });
}
