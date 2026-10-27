(function(){
"use strict";
/* Batch58: owner-facing evidence request packets for the existing 35 held FSSAI cases.
   No sends, no receipt assertions, no compliance approvals. All data read from B56/B57
   integrity-gated immutable preview datasets. No storage, backend or WordPress changes. */
var priority="ALL",role="ALL",phase="READY",search="";
var roleOrder=[
 "FSSAI_QA_DIVISION_AND_LAB_DIRECTOR",
 "MANUFACTURER_OR_SUPPLIER_QA",
 "REGULATORY_AFFAIRS_LEGAL",
 "LABORATORY_TECHNICAL_MANAGER",
 "SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER"
];
function valid(){
 if(typeof pmsvB56Valid!=="function"||!pmsvB56Valid()||
    typeof pmsvB57Valid!=="function"||!pmsvB57Valid()||
    typeof pmsvB57PlusValid!=="function"||!pmsvB57PlusValid()||
    !pmsvB56Data||!pmsvB57PlusData)return false;
 var t=pmsvB56Data.totals,bt=pmsvB57PlusData.totals;
 if(t.catalogue!==533||t.conditional_first_source_matches!==498||
    t.open_ctr_cases!==35||t.open_evidence_gates!==175||
    t.priority_p0!==13||t.priority_p1!==22||
    t.preparatory_requests!==70||t.dependent_evidence_gates!==105||
    t.received_documents!==0||t.evidence_authenticated!==0||
    t.approved_ctr_articles!==0||t.lab_method_scope_approved!==0||
    t.lot_passes!==0||t.wordpress_changed!==false||
    bt.authentication_points!==1470||bt.actual_tested_lot_passes!==0)return false;
 var ids=new Set(),p0=0,p1=0,ready=0,blocked=0,roles=new Map();
 var b57=new Map(pmsvB57PlusData.case_dossiers.map(c=>[c.catalogue_id,c]));
 for(var c of pmsvB56Data.cases){
   if(c.priority==="P0")p0++;else if(c.priority==="P1")p1++;else return false;
   var other=b57.get(c.catalogue_id);
   if(!other||other.rank!==c.rank||other.priority!==c.priority||
     other.analyte!==c.analyte||other.product_name!==c.product_name||
     c.gates.length!==5)return false;
   for(var g of c.gates){
     var mirror=other.gates.find(x=>x.request_id===g.request_id);
     if(!mirror||ids.has(g.request_id)||mirror.owner_role!==g.owner_role||
       mirror.gate_code!==g.gate_code||!roleOrder.includes(g.owner_role)||
       g.immutable_request_state!=="NOT_SENT"||
       g.immutable_document_state!=="NOT_RECEIVED"||
       g.immutable_compliance_state!=="NO_APPROVED_LIMIT_METHOD_OR_PASS")return false;
     ids.add(g.request_id);roles.set(g.owner_role,(roles.get(g.owner_role)||0)+1);
     if(g.dependency_codes.length===0)ready++;else blocked++;
   }
 }
 return p0===13&&p1===22&&ids.size===175&&ready===70&&blocked===105&&
    roleOrder.every(r=>roles.get(r)===35);
}
function data(){
 return pmsvB56Data.cases.flatMap(c=>c.gates.map(g=>({
   rank:c.rank,priority:c.priority,product:c.product_name,analyte:c.analyte,
   case_id:c.catalogue_id,request_id:g.request_id,role:g.owner_role,
   gate:g.gate_code,evidence:g.required_evidence,
   dependencies:g.dependency_codes.join(", "),
   routing:g.dependency_codes.length===0?"REQUEST_PREPARATION_POSSIBLE":"WAIT_FOR_UPSTREAM_EVIDENCE",
   original_request_status:g.immutable_request_state,
   original_document_status:g.immutable_document_state
 })));
}
function filtered(){
 var q=search.trim().toLowerCase();
 return data().filter(x=>
  (priority==="ALL"||x.priority===priority)&&
  (role==="ALL"||x.role===role)&&
  (phase==="ALL"||(phase==="READY"&&x.routing==="REQUEST_PREPARATION_POSSIBLE")||
                        (phase==="DEPENDENT"&&x.routing==="WAIT_FOR_UPSTREAM_EVIDENCE"))&&
  (!q||[x.product,x.analyte,x.request_id,x.evidence,x.gate,x.role,x.case_id]
   .some(v=>String(v).toLowerCase().includes(q))));
}
function esc(v){
 return String(v??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));
}
function option(value,label,current){
 return '<option value="'+esc(value)+'"'+(value===current?" selected":"")+'>'+esc(label)+'</option>';
}
function table(){
 return filtered().map(x=>'<tr><td>'+esc(x.priority)+' #'+esc(x.rank)+'</td>'+
 '<td><b>'+esc(x.product)+'</b><small> · '+esc(x.analyte)+'</small></td>'+
 '<td>'+esc(x.request_id)+'<small> · '+esc(x.gate.replaceAll("_"," "))+'</small></td>'+
 '<td>'+esc(x.routing==="REQUEST_PREPARATION_POSSIBLE"?"Prepare request (not sent)":"Upstream proof required")+'</td></tr>').join("");
}
function letter(){
 var rows=filtered();
 var lines=["DRAFT ONLY — NOT SENT — NOT A REGULATORY OR LABORATORY APPROVAL",
 "PMSV FSSAI · Batch58 · 17 October 2026",
 "Functional owner: "+(role==="ALL"?"All five owner roles — split by owner before sending":role.replaceAll("_"," ")),
 "Coverage: "+rows.length+" unsent evidence requests across the current selection.",
 "Priority: "+priority+" | Stage: "+phase,
 "No case has received authenticated evidence, a signed current CTR article, a verified lab/matrix/method, or a tested-lot PASS.",
 "",
 "Action requested: Please provide ORIGINAL controlled supporting documents and the relevant competent review/signoff outside this public helper.",
 "Do not place confidential BOMs, test reports or personal information into the preview tool. Verify correct addressees, effective law and authorization independently.",
 ""];
 for(var x of rows){
  lines.push("["+x.priority+" #"+x.rank+" · "+x.request_id+"] "+x.product+" | "+x.analyte);
  lines.push("Responsible function: "+x.role.replaceAll("_"," "));
  lines.push("Work sequence: "+(x.routing==="REQUEST_PREPARATION_POSSIBLE"?
   "Request may be prepared now; delivery has NOT occurred":
   "DEPENDENT: obtain "+x.dependencies+" before approval assessment"));
  lines.push("Documentary request: "+x.evidence);
  lines.push("State: NOT SENT / DOCUMENT NOT RECEIVED / NO APPROVAL","");
 }
 lines.push("End of preparatory draft. No requests have been transmitted by PMSV.");
 return lines.join("\n");
}
function panel(){
 var roles='<option value="ALL">All 5 roles (175 requests)</option>'+
  roleOrder.map(r=>option(r,r.replaceAll("_"," "),role)).join("");
 return '<details id="pmsv-b58-owner-packets" class="card" style="margin-bottom:12px">'+
  '<summary><b>Batch58 · Owner outreach packets</b> — 35 held cases · 70 preparatory + 105 dependent requests</summary>'+
  '<div class="notice"><b>Strict hold: 35/35 cases unresolved.</b> These are unsent documentary request drafts, not a notification to the supplier, verified CTR article, lab approval or product release. Source: existing Batch56 and both Batch57 workbenches.</div>'+
  '<p>Start with the <b>70 independent preparatory requests</b> (source/method authority and manufacturer identity; 35 each). The other 105 requests require upstream evidence before a decision. Download or copy only after checking the recipient and confidential-information rules.</p>'+
  '<div class="checker-grid">'+
  '<div class="field"><label>Priority</label><select data-pmsv-b58-priority>'+option("ALL","P0 + P1 (35 cases)",priority)+option("P0","P0 (13 cases)",priority)+option("P1","P1 (22 cases)",priority)+'</select></div>'+
  '<div class="field"><label>Functional owner</label><select data-pmsv-b58-role>'+roles+'</select></div>'+
  '<div class="field"><label>Dependency stage</label><select data-pmsv-b58-phase>'+option("READY","Preparatory requests (70)",phase)+option("DEPENDENT","Upstream-dependent requests (105)",phase)+option("ALL","Both stages (175)",phase)+'</select></div>'+
  '<div class="field"><label>Find product / analyte / request ID</label><input data-pmsv-b58-search maxlength="120" value="'+esc(search)+'" placeholder="e.g. cocoa, lead, PMSV44-08"/></div>'+
  '</div>'+
  '<p><b data-pmsv-b58-count>0 unsent requests</b> · 0 delivered · 0 verified · 0 PASS</p>'+
  '<div style="max-height:370px;overflow:auto"><table><thead><tr><th>Priority</th><th>Product</th><th>Gate</th><th>Next action</th></tr></thead><tbody data-pmsv-b58-rows></tbody></table></div>'+
  '<p><button type="button" data-pmsv-b58-export="CSV">Download selected requests CSV</button> '+
  '<button type="button" data-pmsv-b58-export="TXT">Download selected outreach text</button> '+
  '<button type="button" data-pmsv-b58-copy>Copy outreach text</button></p>'+
  '<p><label>Preview unsent outreach draft (read-only)<textarea data-pmsv-b58-letter readonly rows="8"></textarea></label></p>'+
  '<p data-pmsv-b58-feedback aria-live="polite">No requests sent. Review recipient, source and legal scope before using.</p>'+
 '</details>';
}
function refresh(){
 if(!valid()||typeof document==="undefined")return;
 var anchor=document.getElementById("pmsv-b57-source-lab-authentication")||
  document.getElementById("pmsv-b57-source-scope-preflight")||
  document.getElementById("pmsv-b56-evidence-reference-review");
 if(!anchor)return;
 var el=document.getElementById("pmsv-b58-owner-packets");
 if(!el){anchor.insertAdjacentHTML("afterend",panel());el=document.getElementById("pmsv-b58-owner-packets");}
 var current=filtered();
 el.querySelector("[data-pmsv-b58-rows]").innerHTML=table();
 el.querySelector("[data-pmsv-b58-count]").textContent=current.length+" unsent request(s) in selection";
 el.querySelector("[data-pmsv-b58-letter]").value=letter();
}
function csv(){
 var cols=["rank","priority","product","analyte","request_id","functional_owner",
  "evidence_gate","routing","upstream_dependency","original_request_status",
  "original_document_status","required_evidence","regulatory_approval","lab_approval","lot_pass"];
 function quote(v){
  var s=String(v??"");if(/^[\s]*[=+@\-]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';
 }
 var rows=filtered().map(x=>[x.rank,x.priority,x.product,x.analyte,x.request_id,x.role,
  x.gate,x.routing,x.dependencies,x.original_request_status,x.original_document_status,
  x.evidence,false,false,false]);
 return [cols.map(quote).join(","),...rows.map(x=>x.map(quote).join(","))].join("\r\n")+"\r\n";
}
function download(kind){
 if(!valid())return;
 var content=kind==="CSV"?"\uFEFF"+csv():letter(),extension=kind==="CSV"?"csv":"txt";
 var blob=new Blob([content],{type:kind==="CSV"?"text/csv;charset=utf-8":"text/plain;charset=utf-8"});
 var url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="PMSV-B58-UNSENT-"+phase+"-"+priority+"-"+role+"."+extension;
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function feedback(s){
 var t=document.querySelector("#pmsv-b58-owner-packets [data-pmsv-b58-feedback]");
 if(t)t.textContent=s;
}
var priorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){await priorLoad();refresh();};
document.addEventListener("change",function(ev){
 var t=ev.target;if(!t)return;
 if(t.matches("[data-pmsv-b58-priority]")&&["ALL","P0","P1"].includes(t.value))priority=t.value;
 else if(t.matches("[data-pmsv-b58-role]")&&(t.value==="ALL"||roleOrder.includes(t.value)))role=t.value;
 else if(t.matches("[data-pmsv-b58-phase]")&&["READY","DEPENDENT","ALL"].includes(t.value))phase=t.value;
 else return;refresh();
});
document.addEventListener("input",function(ev){
 var t=ev.target;if(t?.matches("[data-pmsv-b58-search]")){
  search=String(t.value||"").slice(0,120);
  refresh();
 }
});
document.addEventListener("click",function(ev){
 var b=ev.target?.closest("[data-pmsv-b58-export]");
 if(b){if(["CSV","TXT"].includes(b.dataset.pmsvB58Export))download(b.dataset.pmsvB58Export);return;}
 if(ev.target?.closest("[data-pmsv-b58-copy]")){
  var t=letter();
  if(navigator.clipboard?.writeText){
   navigator.clipboard.writeText(t).then(()=>feedback("Draft copied locally. NOT sent or verified."),
    ()=>feedback("Clipboard unavailable. Select text in the read-only draft and copy manually."));
  }else feedback("Clipboard unavailable. Select text in the read-only draft and copy manually.");
 }
});
/* Batch116: owner-directed, same-data navigation; never changes immutable evidence. */
function focusRole(requestedRole){
 if(requestedRole!=="FSSAI_QA_DIVISION_AND_LAB_DIRECTOR"&&
    requestedRole!=="MANUFACTURER_OR_SUPPLIER_QA")return false;
 if(!valid())return false;
 role=requestedRole;priority="ALL";phase="READY";search="";
 refresh();
 var el=document.getElementById("pmsv-b58-owner-packets");
 if(!el)return false;
 var rows=filtered();
 if(rows.length!==35||rows.some(x=>x.role!==role||
    x.routing!=="REQUEST_PREPARATION_POSSIBLE"||
    x.original_request_status!=="NOT_SENT"||
    x.original_document_status!=="NOT_RECEIVED"))return false;
 for(var pair of [["role",role],["priority",priority],["phase",phase],["search",search]]){
  var field=el.querySelector("[data-pmsv-b58-"+pair[0]+"]");
  if(field)field.value=pair[1];
 }
 var view=el.closest?.("section.view");
 if(view&&/^[a-z]+$/.test(view.id)){
  var tab=document.querySelector('nav.tabs .tab[data-tab="'+view.id+'"]');
  if(tab)tab.click();
 }
 el.open=true;
 if(typeof el.scrollIntoView==="function")el.scrollIntoView({block:"start",behavior:"smooth"});
 return true;
}
window.pmsvB58OwnerOutreach={valid:valid,records:data,filtered:filtered,generateCSV:csv,focusRole:focusRole,
 getCounts:function(){return{cases:35,preparatory:data().filter(x=>x.routing==="REQUEST_PREPARATION_POSSIBLE").length,
 dependent:data().filter(x=>x.routing==="WAIT_FOR_UPSTREAM_EVIDENCE").length,
 actual_documents_received:0,approvals:0,lot_passes:0};}};
})();
