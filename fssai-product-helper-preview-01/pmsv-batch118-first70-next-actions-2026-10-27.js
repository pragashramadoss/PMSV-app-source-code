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
    !api?.sourceValid?.()||!api?.csv||!api?.parseCSV||!api?.validNote)
  return{valid:false,error:"First-70 source validation or calendar date unavailable",rows:[]};
 try{
  const all=api.parseCSV(api.csv());
  if(all.length!==71||all[0].length!==SCHEMA.length||
     !SCHEMA.every((k,i)=>all[0][i]===k))
    throw Error("Original 70-request CSV schema mismatch");
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
  if(seen.size!==70||p0!==26||p1!==44||method!==35||maker!==35)
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
 control.appendChild(refresh);control.appendChild(download);control.appendChild(assign);h.appendChild(control);
 h.appendChild(node("p","Assignment worksheet: 35 method-authority and 35 manufacturer/supplier requests, with blank fields for an internal coordinator, verified recipient, target date, approval and channel. Complete offline; a plan or self-reported send is not evidence receipt, independent approval or product release."));
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
});
window.pmsvB118NextActions=Object.freeze({compute,install,render,csv,assignmentCSV,localToday});
})();