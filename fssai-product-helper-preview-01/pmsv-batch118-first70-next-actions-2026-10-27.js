(function(){"use strict";
/* Batch118: read-only next-action queue for the 70 original, still UNSENT
 * source requests. Local operator notes never become approved evidence.
 * No messaging, localStorage, network, backend, uploads or product releases. */
const ID="pmsv-b118-first70-next-actions";
const SOURCE="FSSAI_QA_DIVISION_AND_LAB_DIRECTOR",MAKER="MANUFACTURER_OR_SUPPLIER_QA";
const STATES=["NOT_PREPARED","DRAFT_READY","SENT_SELF_REPORTED","RESPONSE_SELF_REPORTED"];
const SCHEMA=["case_id","request_id","priority","rank","role","gate","source_request_status",
 "source_document_status","operator_followup_state","outbound_reference","sent_date",
 "response_reference","response_date","next_followup_date"];
const PRIORITY={OVERDUE_FOLLOWUP:1,DUE_TODAY:2,REPORTED_RESPONSE_NEEDS_REVIEW:3,
 SENT_NEEDS_FOLLOWUP_DATE:4,DRAFT_READY_FOR_EXTERNAL_SEND:5,
 NOT_PREPARED:6,FUTURE_FOLLOWUP:7};
function localToday(){
 const t=new Date(),p=x=>String(x).padStart(2,"0");
 return t.getFullYear()+"-"+p(t.getMonth()+1)+"-"+p(t.getDate());
}
function compute(today=localToday()){
 const api=window.pmsvB97Followup;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(today)||
    Number.isNaN(new Date(today+"T00:00:00Z").getTime())||
    new Date(today+"T00:00:00Z").toISOString().slice(0,10)!==today||
    !api?.sourceValid?.()||!api?.csv||!api?.parseCSV||!api?.validNote||!api?.records)
  return{valid:false,error:"First-70 source validation or calendar date unavailable",rows:[]};
 try{
  const all=api.parseCSV(api.csv());
  if(all.length!==71||all[0].length!==SCHEMA.length||
     !SCHEMA.every((k,i)=>all[0][i]===k))
    throw Error("Original 70-request CSV schema mismatch");
  /* Batch124: derive every immutable identity and evidence gate from the
   * source-verified B97 records, not only from the operator-imported CSV.
   * Otherwise a mismatched product, case or gate could reach a handoff sheet. */
  const originals=api.records();
  if(!Array.isArray(originals)||originals.length!==70)
   throw Error("Original first-70 identity source unavailable");
  const byOriginalId=new Map();
  const immutable=["case_id","request_id","priority","rank","role","gate",
   "source_request_status","source_document_status"];
  for(const x of originals){
   if(!x||typeof x.request_id!=="string"||!x.request_id||
      byOriginalId.has(x.request_id)||!immutable.every(k=>typeof x[k]==="string")||
      x.source_request_status!=="NOT_SENT"||
      x.source_document_status!=="NOT_RECEIVED")
    throw Error("Invalid or duplicate original immutable identity");
   byOriginalId.set(x.request_id,x);
  }
  const seen=new Set(),rows=[];let p0=0,p1=0,method=0,maker=0;
  for(const cells of all.slice(1)){
   if(cells.length!==SCHEMA.length)throw Error("Incomplete original request row");
   const r=Object.fromEntries(SCHEMA.map((k,i)=>[k,cells[i]]));
   if(!r.request_id||seen.has(r.request_id)||!/^PMSV44-\d{2}-0[12]$/.test(r.request_id)||
      r.source_request_status!=="NOT_SENT"||r.source_document_status!=="NOT_RECEIVED"||
      !STATES.includes(r.operator_followup_state)||!["P0","P1"].includes(r.priority)||
      ![SOURCE,MAKER].includes(r.role))throw Error("Changed original request source, ID, or role");
   const expected="PMSV44-"+String(r.rank).padStart(2,"0")+"-"+(r.role===SOURCE?"01":"02");
   if(r.request_id!==expected||!api.validNote({
      operator_followup_state:r.operator_followup_state,outbound_reference:r.outbound_reference,
      sent_date:r.sent_date,response_reference:r.response_reference,
      response_date:r.response_date,next_followup_date:r.next_followup_date
   }))throw Error("Original ID, role rank or self-reported note validation failed");
   const original=byOriginalId.get(r.request_id);
   if(!original||!immutable.every(k=>r[k]===original[k]))
    throw Error("Original case, priority, rank, role or evidence gate mismatch");
   seen.add(r.request_id);
   if(r.priority==="P0")p0++;else p1++;
   if(r.role===SOURCE)method++;else maker++;
   let action;
   if(r.operator_followup_state==="NOT_PREPARED")action="NOT_PREPARED";
   else if(r.operator_followup_state==="DRAFT_READY")action="DRAFT_READY_FOR_EXTERNAL_SEND";
   else if(r.operator_followup_state==="RESPONSE_SELF_REPORTED")action="REPORTED_RESPONSE_NEEDS_REVIEW";
   else if(!r.next_followup_date)action="SENT_NEEDS_FOLLOWUP_DATE";
   else if(r.next_followup_date<today)action="OVERDUE_FOLLOWUP";
   else if(r.next_followup_date===today)action="DUE_TODAY";
   else action="FUTURE_FOLLOWUP";
   rows.push(Object.freeze({...r,action}));
  }
  if(seen.size!==70||seen.size!==byOriginalId.size||p0!==26||p1!==44||method!==35||maker!==35)
   throw Error("35+35 original requests and 13 P0 / 22 P1 cases did not reconcile");
  rows.sort((a,b)=>PRIORITY[a.action]-PRIORITY[b.action]||
   (a.priority==="P0"?0:1)-(b.priority==="P0"?0:1)||
   Number(a.rank)-Number(b.rank)||a.request_id.localeCompare(b.request_id));
  const counts=Object.fromEntries(Object.keys(PRIORITY).map(k=>[k,0]));
  rows.forEach(x=>counts[x.action]++);
  return{valid:true,asOf:today,rows,counts,
   status:"ORIGINAL_SOURCE_UNSENT_AND_NOT_RECEIVED_ALL35_HELD"};
 }catch(err){return{valid:false,error:String(err?.message||err),rows:[]};}
}
function node(tag,value){
 const el=document.createElement(tag);
 if(value!==undefined)el.textContent=String(value);
 return el;
}
function host(){return document.getElementById(ID)}
function install(){
 if(host())return true;
 const anchor=document.getElementById("pmsv-b97-first70-followup");
 if(!anchor)return false;
 const h=node("details");h.id=ID;h.className="card";
 h.style.marginBottom="12px";
 h.appendChild(node("summary","Batch118 · First-70 evidence-owner next actions (unverified, local only)"));
 const info=node("p","Follow-up planning only: all 35 original legal cases remain HELD, 175 immutable requests remain NOT_SENT / NOT_RECEIVED. Local notes about external sending or responses are not evidence authentication, legal or laboratory approval.");
 h.appendChild(info);
 const control=node("div");control.style.display="flex";control.style.gap="8px";control.style.flexWrap="wrap";
 const refresh=node("button","Refresh next actions");refresh.type="button";refresh.dataset.b118Refresh="";
 const download=node("button","Download next-action CSV");download.type="button";download.dataset.b118Csv="";
 const assign=node("button","Download 70-request owner assignment worksheet");assign.type="button";assign.dataset.b118Assignment="";
 const brief=node("button","Download detailed evidence requirements CSV");brief.type="button";brief.dataset.b121Brief="";
 const p0=node("button","Download P0 urgent evidence packet (13 cases · 26 requests)");p0.type="button";p0.dataset.b122P0="";
 const drafts=node("button","Download all 70 UNSENT evidence-request drafts");drafts.type="button";drafts.dataset.b125Drafts="";
 const urgentDrafts=node("button","Download 26 urgent P0 UNSENT request drafts");urgentDrafts.type="button";urgentDrafts.dataset.b125P0Drafts="";
 control.appendChild(refresh);control.appendChild(download);control.appendChild(assign);control.appendChild(brief);control.appendChild(p0);control.appendChild(drafts);control.appendChild(urgentDrafts);h.appendChild(control);
 h.appendChild(node("p","Assignment worksheet: 35 method-authority and 35 manufacturer/supplier requests, with blank fields for an internal coordinator, verified recipient, target date, approval and channel. The detailed evidence CSV additionally includes the source-verified product, analyte, gate and exact documentary request text. All downloads are local planning copies only. The P0 packet narrows this to the 13 highest-priority cases (26 original preparatory requests); none establishes evidence receipt, independent approval or product release."));
 h.appendChild(node("p","Batch125 request drafts are OFFLINE templates only, with source-specific original evidence text and separate prompts for method-source and manufacturer/supplier owners. Recipients, internal coordinators and approval fields remain blank. PMSV does not send a request or verify its receipt."));
 const summary=node("p","Select Refresh to verify the current 70 local follow-up records.");
 summary.setAttribute("data-b118-summary","");summary.setAttribute("role","status");
 summary.setAttribute("aria-live","polite");h.appendChild(summary);
 const scroller=node("div");scroller.style.maxHeight="370px";scroller.style.overflow="auto";
 const table=node("table"),thead=node("thead"),tr=node("tr");
 ["Priority","Original request","Functional owner","Next action","Local follow-up due"].forEach(label=>tr.appendChild(node("th",label)));
 thead.appendChild(tr);table.appendChild(thead);
 const tbody=node("tbody");tbody.setAttribute("data-b118-rows","");table.appendChild(tbody);
 scroller.appendChild(table);h.appendChild(scroller);anchor.insertAdjacentElement("afterend",h);
 return true;
}
function render(){
 if(!install())return false;
 const result=compute(),h=host(),sum=h.querySelector("[data-b118-summary]"),
  rows=h.querySelector("[data-b118-rows]");
 rows.replaceChildren();
 if(!result.valid){sum.textContent="Blocked: "+result.error+"; original 35 compliance cases HELD.";return false;}
 for(const r of result.rows){
  const tr=node("tr");
  [r.priority+" #"+r.rank,r.request_id+" · "+r.case_id,
   r.role===SOURCE?"Method authority":"Manufacturer / supplier",
   r.action.replaceAll("_"," "),r.next_followup_date||"—"]
  .forEach(v=>tr.appendChild(node("td",v)));
  rows.appendChild(tr);
 }
 const c=result.counts;
 sum.textContent="As of "+result.asOf+" (device date): "+
  c.OVERDUE_FOLLOWUP+" overdue; "+c.DUE_TODAY+" due today; "+
  c.SENT_NEEDS_FOLLOWUP_DATE+" sent without follow-up date; "+
  c.DRAFT_READY_FOR_EXTERNAL_SEND+" drafts; "+
  c.REPORTED_RESPONSE_NEEDS_REVIEW+" responses SELF-REPORTED requiring independent review; "+
  c.NOT_PREPARED+" not prepared; "+c.FUTURE_FOLLOWUP+" scheduled. "+
  "70 original requests; 105 dependent evidence gates; 35 cases HELD. Export original follow-up CSV from Batch97 to preserve your notes.";
 h.open=true;return true;
}
function csv(result=compute()){
 if(!result.valid)return"";
 const headings=["priority","case_id","request_id","owner_role","self_reported_stage","next_action",
  "due_date","original_request_status","original_document_status","compliance_gate"];
 const quote=v=>{
  let s=String(v??"");if(/^\s*[=+@-]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';
 };
 const rows=result.rows.map(r=>[r.priority,r.case_id,r.request_id,r.role,
  r.operator_followup_state,r.action,r.next_followup_date,r.source_request_status,
  r.source_document_status,"ALL35_HELD_NO_LEGAL_LAB_LOT_APPROVAL"]);
 return[headings,...rows].map(x=>x.map(quote).join(",")).join("\r\n")+"\r\n";
}
/* Batch120: separate, offline-only owner-allocation worksheet. Deliberately leave
 * personal names, recipient details and approval fields blank; never persist them
 * to this public preview, and never modify the immutable 175 original requests. */
function assignmentCSV(result=compute()){
 if(!result.valid)return"";
 const headings=["priority","case_id","request_id","owner_role","next_action",
  "named_internal_coordinator","verified_external_recipient","planned_dispatch_date",
  "approved_dispatch_channel","internal_approval_reference",
  "original_request_status","original_document_status","compliance_gate"];
 const quote=v=>{
  let s=String(v??"");if(/^\s*[=+@-]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';
 };
 const rows=result.rows.map(r=>[r.priority,r.case_id,r.request_id,r.role,r.action,
  "","","","","",r.source_request_status,r.source_document_status,
  "ALL35_HELD_NO_LEGAL_LAB_LOT_APPROVAL"]);
 return[headings,...rows].map(x=>x.map(quote).join(",")).join("\r\n")+"\r\n";
}

/* Batch121: source-verified, detailed original evidence-brief CSV for allocation.
 * Treat the B97 source records as immutable; reject missing/mutated joins.
 * All recipient/approval fields remain blank and no data is persisted or sent. */
/* Batch123: do not trust a caller-supplied queue snapshot merely because it
 * says valid. Re-derive action status and identity from the current, authenticated
 * B97 70-row source at the same validated as-of date. A local status note remains
 * SELF-REPORTED and never changes original documentary truth. */
function matchesVerifiedQueue(result){
 if(!result?.valid||typeof result.asOf!=="string"||
    !Array.isArray(result.rows)||result.rows.length!==70)return false;
 const fresh=compute(result.asOf);
 if(!fresh.valid||fresh.rows.length!==70)return false;
 const keys=["request_id","case_id","priority","rank","role","gate",
  "source_request_status","source_document_status","operator_followup_state",
  "outbound_reference","sent_date","response_reference","response_date",
  "next_followup_date","action"];
 return result.rows.every((r,i)=>r&&keys.every(k=>r[k]===fresh.rows[i][k]));
}
function evidenceBriefCSV(result=compute(),priorityFilter="ALL"){
 const api=window.pmsvB97Followup;
 if(!["ALL","P0"].includes(priorityFilter)||!matchesVerifiedQueue(result)||
    !api?.sourceValid?.()||!api?.records)return "";
 const source=api.records();
 if(!Array.isArray(source)||source.length!==70)return "";
 const byId=new Map();
 for(const x of source){
  if(!x||typeof x.request_id!=="string"||byId.has(x.request_id)||
     ![x.case_id,x.priority,x.rank,x.role,x.gate,x.product,x.analyte,x.evidence]
       .every(v=>typeof v==="string"&&v.trim())||
     x.source_request_status!=="NOT_SENT"||x.source_document_status!=="NOT_RECEIVED")
   return "";
  byId.set(x.request_id,x);
 }
 if(byId.size!==70)return "";
 const headings=["priority","case_id","request_id","owner_role","product_name",
  "analyte","evidence_gate","original_evidence_requirement","next_action",
  "named_internal_coordinator","verified_external_recipient","planned_dispatch_date",
  "approved_dispatch_channel","internal_approval_reference",
  "original_request_status","original_document_status","compliance_gate"];
 const quote=v=>{
  let s=String(v??"");if(/^\s*[=+@-]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';
 };
 const selected=priorityFilter==="P0"?result.rows.filter(r=>r.priority==="P0"):result.rows;
 if(priorityFilter==="P0"&&(
    selected.length!==26||new Set(selected.map(r=>r.case_id)).size!==13||
    selected.filter(r=>r.role===SOURCE).length!==13||
    selected.filter(r=>r.role===MAKER).length!==13))return "";
 const rows=[];
 for(const r of selected){
  const x=byId.get(r.request_id);
  if(!x||x.case_id!==r.case_id||x.priority!==r.priority||x.rank!==r.rank||
     x.role!==r.role||x.gate!==r.gate||
     x.source_request_status!==r.source_request_status||
     x.source_document_status!==r.source_document_status)return "";
  rows.push([r.priority,r.case_id,r.request_id,r.role,x.product,x.analyte,
   x.gate,x.evidence,r.action,"","","","","",
   "NOT_SENT","NOT_RECEIVED","ALL35_HELD_NO_LEGAL_LAB_LOT_APPROVAL"]);
 }
 return[headings,...rows].map(x=>x.map(quote).join(",")).join("\r\n")+"\r\n";
}
/* Batch125: prepare source-specific text for offline, separately authorised
 * external requests. Each template is derived through the already verified B121
 * detailed-source export. Nothing is sent, addressed, stored or approved here. */
function requestDraftCSV(result=compute(),priorityFilter="ALL"){
 if(!["ALL","P0"].includes(priorityFilter))return "";
 const api=window.pmsvB97Followup;
 const detail=evidenceBriefCSV(result,priorityFilter);
 if(!detail||!api?.parseCSV)return "";
 let sourceRows;
 try{sourceRows=api.parseCSV(detail)}catch(_){return ""}
 const expected=priorityFilter==="P0"?26:70;
 if(sourceRows.length!==expected+1||sourceRows[0].length!==17)return "";
 const headings=["priority","case_id","request_id","functional_recipient_role",
  "product_name","analyte","evidence_gate","original_evidence_requirement",
  "draft_email_subject","draft_email_body","named_internal_coordinator",
  "verified_external_recipient","approved_dispatch_channel",
  "internal_approval_reference","planned_dispatch_date",
  "original_request_status","original_document_status","compliance_gate"];
 const quote=v=>{
  let s=String(v??"");if(/^\s*[=+@-]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';
 };
 const rows=[];
 for(const x of sourceRows.slice(1)){
  if(x.length!==17||x[14]!=="NOT_SENT"||x[15]!=="NOT_RECEIVED"||
     x[16]!=="ALL35_HELD_NO_LEGAL_LAB_LOT_APPROVAL"||
     ![SOURCE,MAKER].includes(x[3])||
     ![x[0],x[1],x[2],x[4],x[5],x[6],x[7]].every(v=>typeof v==="string"&&v.trim()))
   return "";
  const [p,caseId,requestId,role,product,analyte,gate,evidence]=x;
  const recipient=role===SOURCE?"method/source authority":"manufacturer/supplier quality";
  const roleInstructions=role===SOURCE?
   "Please identify the operative original FSSAI legal publication, exact article and current amendment/effective-date chain; resolve any applicable method adoption, supersession or conflict; provide the original texts and matrix-appropriate analytical-method and laboratory-scope basis. If an article does not apply to this finished product, provide source-backed exclusion reasoning. Do not infer a numeric limit by analogy.":
   "Please provide approved, revision-controlled finished-product identity and formulation or composition, applicable processing/pack classification, specifications, batch and material traceability, original CoAs and the analytical method/laboratory scope relevant to the requested evidence. Explicitly identify documents that are unavailable; do not substitute a similar product's records.";
  const subject="PMSV FSSAI evidence request — UNSENT DRAFT — "+p+
   " — "+product+" / "+analyte+" — "+requestId;
  const body="Dear verified "+recipient+" recipient, "+
   "This is an UNSENT DRAFT requiring internal dispatch approval. "+
   "For original PMSV case "+caseId+" and request "+requestId+
   ", product "+product+", analyte "+analyte+", evidence gate "+gate+
   ", please provide the following original documentary evidence: "+evidence+" "+
   roleInstructions+" Please include document title, issuing entity, version/date, "+
   "verifiable source reference and any relevant annexures. Any response will undergo "+
   "independent Regulatory, Laboratory and QA review; no product compliance or lot "+
   "release is implied. Regards, [authorised internal coordinator].";
  rows.push([p,caseId,requestId,role,product,analyte,gate,evidence,
   subject,body,"","","","","","NOT_SENT","NOT_RECEIVED",
   "ALL35_HELD_NO_LEGAL_LAB_LOT_APPROVAL"]);
 }
 if(rows.length!==expected||new Set(rows.map(x=>x[2])).size!==expected)return "";
 return[headings,...rows].map(x=>x.map(quote).join(",")).join("\r\n")+"\r\n";
}
function downloadRequestDraftCSV(priorityFilter="ALL"){
 const contents=requestDraftCSV(compute(),priorityFilter);
 if(!contents){
  const sum=host()?.querySelector("[data-b118-summary]");
  if(sum)sum.textContent="Draft export blocked: original request identity or evidence source failed validation. All 35 cases HELD.";
  return false;
 }
 const url=URL.createObjectURL(new Blob(["\uFEFF"+contents],{type:"text/csv;charset=utf-8"}));
 const a=node("a");a.href=url;
 a.download=priorityFilter==="P0"?
  "PMSV-B125-P0-26-UNSENT-EVIDENCE-REQUEST-DRAFTS.csv":
  "PMSV-B125-ALL70-UNSENT-EVIDENCE-REQUEST-DRAFTS.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 return true;
}
/* Batch122: P0 subset is derived only after full 70-source reconciliation.
 * No evidence state, responsible person or approval is inferred. */
function downloadP0EvidenceBriefCSV(){
 const contents=evidenceBriefCSV(compute(),"P0");
 if(!contents){
  const sum=host()?.querySelector("[data-b118-summary]");
  if(sum)sum.textContent="P0 export blocked: verify the full original 70-request source first. All 35 compliance cases remain HELD.";
  return false;
 }
 const url=URL.createObjectURL(new Blob(["\uFEFF"+contents],{type:"text/csv;charset=utf-8"}));
 const a=node("a");a.href=url;
 a.download="PMSV-B122-P0-13-CASES-26-REQUESTS-OFFLINE-UNAPPROVED.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 return true;
}
function downloadEvidenceBriefCSV(){
 const contents=evidenceBriefCSV();if(!contents)return false;
 const url=URL.createObjectURL(new Blob(["\uFEFF"+contents],{type:"text/csv;charset=utf-8"}));
 const a=node("a");a.href=url;
 a.download="PMSV-B121-70-DETAILED-EVIDENCE-BRIEF-OFFLINE-UNAPPROVED.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 return true;
}
function downloadAssignmentCSV(){
 const contents=assignmentCSV();if(!contents)return false;
 const url=URL.createObjectURL(new Blob(["\uFEFF"+contents],{type:"text/csv;charset=utf-8"}));
 const a=node("a");a.href=url;
 a.download="PMSV-B120-70-OWNER-ASSIGNMENT-OFFLINE-NOT-APPROVAL.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 return true;
}
function downloadCSV(){
 const contents=csv();if(!contents)return false;
 const url=URL.createObjectURL(new Blob(["\uFEFF"+contents],{type:"text/csv;charset=utf-8"}));
 const a=node("a");a.href=url;a.download="PMSV-B118-70-FIRST-ACTION-QUEUE-UNVERIFIED.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 return true;
}
document.addEventListener("click",event=>{
 if(event.target?.closest?.("[data-b118-open]"))void render();
 else if(event.target?.closest?.("[data-b118-refresh]"))void render();
 else if(event.target?.closest?.("[data-b118-csv]"))void downloadCSV();
 else if(event.target?.closest?.("[data-b118-assignment]"))void downloadAssignmentCSV();
 else if(event.target?.closest?.("[data-b121-brief]"))void downloadEvidenceBriefCSV();
 else if(event.target?.closest?.("[data-b122-p0]"))void downloadP0EvidenceBriefCSV();
 else if(event.target?.closest?.("[data-b125-drafts]"))void downloadRequestDraftCSV("ALL");
 else if(event.target?.closest?.("[data-b125-p0-drafts]"))void downloadRequestDraftCSV("P0");
});
window.pmsvB118NextActions=Object.freeze({compute,install,render,csv,assignmentCSV,evidenceBriefCSV,requestDraftCSV,localToday});
})();