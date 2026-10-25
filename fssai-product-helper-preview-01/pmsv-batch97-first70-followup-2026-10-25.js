(function(){"use strict";
/* Batch97: temporary local 70-request follow-up notes; no automatic sending,
 * proof authentication, data upload, persistent storage, legal signoff or release.
 * The verified original 175 source requests remain immutable NOT_SENT/NOT_RECEIVED.
 */
const ID="pmsv-b97-first70-followup";
const ROLE_SOURCE="FSSAI_QA_DIVISION_AND_LAB_DIRECTOR";
const ROLE_MAKER="MANUFACTURER_OR_SUPPLIER_QA";
const STATES=["NOT_PREPARED","DRAFT_READY","SENT_SELF_REPORTED","RESPONSE_SELF_REPORTED"];
const COLS=["case_id","request_id","priority","rank","role","gate","source_request_status",
 "source_document_status","operator_followup_state","outbound_reference","sent_date",
 "response_reference","response_date","next_followup_date"];
let source=[],loaded=false,chosen="",priority="ALL",role="ALL",q="",notes=new Map();
function node(tag,txt,attributes){
 const x=document.createElement(tag);
 if(txt!==undefined)x.textContent=String(txt);
 for(const [k,v] of Object.entries(attributes||{}))x.setAttribute(k,String(v));
 return x;
}
function host(){return document.getElementById(ID)}
function status(t){const x=host()?.querySelector("[data-b97-status]");if(x)x.textContent=t}
function sourceValid(){
 try{
  const b58=window.pmsvB58OwnerOutreach,b87=window.pmsvB87Catalogue;
  if(!b58?.valid?.()||!b87?.closureVerified?.())return false;
  const s=b87.closedResearchSummary?.();
  if(s?.catalogue!==533||s.public_source_desk_research_closed!==35||
     s.external_legal_and_lot_verification_held!==35||
     s.product_releases!==0||s.signed_product_limits!==0||
     s.validated_lab_lot_pass!==0)return false;
  const rows=b58.records();
  if(!Array.isArray(rows)||rows.length!==175)return false;
  let all=new Set(),ready=new Set(),blocked=0,p0=new Set(),p1=new Set();
  let sourceRole=0,makerRole=0,perCase=new Map();
  for(const r of rows){
   if(!r||all.has(r.request_id)||r.original_request_status!=="NOT_SENT"||
      r.original_document_status!=="NOT_RECEIVED"||
      !r.case_id||!r.request_id)return false;
   all.add(r.request_id);
   if(r.priority==="P0")p0.add(r.case_id);
   else if(r.priority==="P1")p1.add(r.case_id);
   else return false;
   const g=perCase.get(r.case_id)||{ready:0,blocked:0,roles:new Set(),rank:r.rank,product:r.product};
   if(g.rank!==r.rank||g.product!==r.product)return false;
   g.roles.add(r.role);
   if(r.routing==="REQUEST_PREPARATION_POSSIBLE"){
    if(![ROLE_SOURCE,ROLE_MAKER].includes(r.role))return false;
    g.ready++;ready.add(r.request_id);
    if(r.role===ROLE_SOURCE)sourceRole++;
    else makerRole++;
   }else if(r.routing==="WAIT_FOR_UPSTREAM_EVIDENCE"){g.blocked++;blocked++}
   else return false;
   perCase.set(r.case_id,g);
  }
  return all.size===175&&ready.size===70&&blocked===105&&
   p0.size===13&&p1.size===22&&perCase.size===35&&
   sourceRole===35&&makerRole===35&&
   [...perCase.values()].every(g=>g.ready===2&&g.blocked===3&&g.roles.size===5);
 }catch(_){return false}
}
function records(){
 if(!sourceValid())return [];
 return window.pmsvB58OwnerOutreach.records()
  .filter(x=>x.routing==="REQUEST_PREPARATION_POSSIBLE")
  .map(x=>Object.freeze({case_id:x.case_id,request_id:x.request_id,
   priority:x.priority,rank:String(x.rank),role:x.role,gate:x.gate,
   product:x.product,analyte:x.analyte,evidence:x.evidence,
   source_request_status:"NOT_SENT",source_document_status:"NOT_RECEIVED"}))
  .sort((a,b)=>Number(a.rank)-Number(b.rank)||a.role.localeCompare(b.role));
}
function empty(){return {operator_followup_state:"NOT_PREPARED",
 outbound_reference:"",sent_date:"",response_reference:"",response_date:"",next_followup_date:""}}
function noteFor(id){return notes.get(id)||empty()}
function safeRef(v){return typeof v==="string"&&v.length<=80&&
 (!v||/^[A-Za-z0-9][A-Za-z0-9 _./:#()-]*$/.test(v))&&
 !/^[=+@-]/.test(v)&&!/[<>"'\n\r\t]/.test(v)}
function safeDate(v){
 if(v==="")return true;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
 const d=new Date(v+"T00:00:00Z");
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===v;
}
function validNote(n){
 if(!n||!STATES.includes(n.operator_followup_state))return false;
 const fields=["outbound_reference","sent_date","response_reference","response_date","next_followup_date"];
 if(fields.some(k=>typeof n[k]!=="string"))return false;
 if(!safeRef(n.outbound_reference)||!safeRef(n.response_reference)||
    ![n.sent_date,n.response_date,n.next_followup_date].every(safeDate))return false;
 if(n.operator_followup_state==="NOT_PREPARED"||n.operator_followup_state==="DRAFT_READY")
  return fields.every(k=>n[k]==="");
 if(!n.outbound_reference||!n.sent_date)return false;
 if(n.operator_followup_state==="SENT_SELF_REPORTED"&&
    (n.response_reference||n.response_date))return false;
 if(n.operator_followup_state==="RESPONSE_SELF_REPORTED"&&
    (!n.response_reference||!n.response_date||n.response_date<n.sent_date))return false;
 if(n.next_followup_date&&n.next_followup_date<n.sent_date)return false;
 return true;
}
function capture(id,n){
 if(!loaded||!sourceValid()||!source.some(r=>r.request_id===id)||!validNote(n))return false;
 if(n.operator_followup_state==="NOT_PREPARED")notes.delete(id);
 else notes.set(id,Object.freeze({...n}));
 render();
 status("Locally recorded as SELF-REPORTED follow-up only; no request was sent or document authenticated by PMSV. Export your CSV before leaving.");
 return true;
}
function summary(){
 let counts=Object.fromEntries(STATES.map(k=>[k,0]));
 if(!loaded||!sourceValid())return counts;
 for(const r of source)counts[noteFor(r.request_id).operator_followup_state]++;
 return counts;
}
function selectedRows(){
 const query=q.toLowerCase();
 return source.filter(r=>(priority==="ALL"||r.priority===priority)&&
 (role==="ALL"||r.role===role)&&
 (!query||[r.product,r.analyte,r.request_id,r.case_id].some(v=>String(v).toLowerCase().includes(query))));
}
function quote(v){const str=String(v??"");return '"'+str.replace(/"/g,'""')+'"'}
function csv(blank=false){
 if(!loaded||!sourceValid())return "";
 const rows=[COLS];
 for(const r of source){
  const n=blank?empty():noteFor(r.request_id);
  if(!validNote(n))return "";
  rows.push([r.case_id,r.request_id,r.priority,r.rank,r.role,r.gate,
   r.source_request_status,r.source_document_status,
   n.operator_followup_state,n.outbound_reference,n.sent_date,
   n.response_reference,n.response_date,n.next_followup_date]);
 }
 if(rows.length!==71)return "";
 return rows.map(row=>row.map(quote).join(",")).join("\r\n")+"\r\n";
}
function parseCSV(raw){
 if(typeof raw!=="string"||raw.length>150000||raw.includes("\0"))throw Error("Invalid or oversized CSV");
 const text=raw.replace(/^\uFEFF/,"");
 let out=[],row=[],field="",inside=false,closed=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(inside){
   if(ch==='"'&&text[i+1]==='"'){field+='"';i++}
   else if(ch==='"'){inside=false;closed=true}
   else field+=ch;
  }else if(ch==='"'&&!field&&!closed)inside=true;
  else if(ch===","){row.push(field);field="";closed=false}
  else if(ch==="\n"||ch==="\r"){
   if(ch==="\r"&&text[i+1]==="\n")i++;
   row.push(field);out.push(row);row=[];field="";closed=false;
  }else{
   if(closed||ch==='"')throw Error("Malformed CSV quoting");
   field+=ch;
  }
 }
 if(inside)throw Error("Unclosed CSV quote");
 if(field||row.length){row.push(field);out.push(row)}
 return out;
}
function importCSV(raw){
 if(!loaded||!sourceValid())return {ok:false,error:"Trusted source unavailable"};
 try{
  const rows=parseCSV(raw);
  if(rows.length!==71||rows[0].length!==COLS.length||
     !COLS.every((k,i)=>rows[0][i]===k))throw Error("Expected the exact 70-request Batch97 schema");
  const known=new Map(source.map(r=>[r.request_id,r])),next=new Map(),seen=new Set();
  for(const cells of rows.slice(1)){
   if(cells.length!==COLS.length)throw Error("Column count mismatch");
   const r=known.get(cells[1]);
   if(!r||seen.has(cells[1]))throw Error("Unknown or duplicate original request ID");
   const fixed=[r.case_id,r.request_id,r.priority,r.rank,r.role,r.gate,
     r.source_request_status,r.source_document_status];
   if(!fixed.every((v,i)=>v===cells[i]))throw Error("Immutable case, owner, source state or gate altered");
   const n=Object.fromEntries(COLS.slice(8).map((k,i)=>[k,cells[i+8]]));
   if(!validNote(n))throw Error("Invalid progress, reference or date sequence");
   seen.add(r.request_id);
   if(n.operator_followup_state!=="NOT_PREPARED")next.set(r.request_id,Object.freeze(n));
  }
  if(seen.size!==70)throw Error("All original 70 requests are required");
  notes=next;
  render();
  status("Imported "+notes.size+" self-reported workflow notes. No original evidence receipt, legal approval or lot release was verified.");
  return {ok:true,count:notes.size};
 }catch(err){
  const message=String(err.message||"Invalid CSV");
  status("IMPORT REJECTED: "+message+". Existing notes preserved.");
  return {ok:false,error:message};
 }
}
function download(contents,name){
 if(!contents)return false;
 const url=URL.createObjectURL(new Blob(["\uFEFF"+contents],{type:"text/csv;charset=utf-8"}));
 const a=node("a",undefined,{href:url,download:name});document.body.appendChild(a);
 a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;
}
function render(){
 if(!loaded||!sourceValid())return status("Source integrity unavailable. Follow-up changes and exports are blocked.");
 const h=host();if(!h)return;
 const rows=selectedRows(),table=h.querySelector("[data-b97-rows]");
 table.replaceChildren();
 for(const r of rows){
  const tr=node("tr");
  tr.appendChild(node("td",r.priority+" #"+r.rank));
  tr.appendChild(node("td",r.product));
  tr.appendChild(node("td",r.role===ROLE_SOURCE?"FSSAI method source":"Manufacturer identity"));
  tr.appendChild(node("td",noteFor(r.request_id).operator_followup_state.replaceAll("_"," ")));
  table.appendChild(tr);
 }
 const sel=h.querySelector("[data-b97-request]");
 sel.replaceChildren();
 for(const r of rows)sel.appendChild(node("option",r.product+" — "+(r.role===ROLE_SOURCE?"Method":"Manufacturer"),{value:r.request_id}));
 if(!rows.some(r=>r.request_id===chosen))chosen=rows[0]?.request_id||"";
 sel.value=chosen;
 const counts=summary();
 h.querySelector("[data-b97-counts]").textContent=
  "70 original actions: "+counts.NOT_PREPARED+" not prepared · "+
  counts.DRAFT_READY+" drafts · "+counts.SENT_SELF_REPORTED+
  " sent (self-reported) · "+counts.RESPONSE_SELF_REPORTED+
  " responses (self-reported) · 105 downstream still blocked · 35 commercial cases HELD.";
 const item=source.find(r=>r.request_id===chosen);
 const controls=h.querySelector("[data-b97-editor]");
 controls.hidden=!item;
 if(!item){h.querySelector("[data-b97-description]").textContent="No matching request";return}
 const n=noteFor(item.request_id);
 h.querySelector("[data-b97-description]").textContent=
  item.request_id+" · "+item.product+" / "+item.analyte+" · "+item.evidence+
  " Original source request: NOT SENT, document: NOT RECEIVED. Your notes do not revise these source facts.";
 for(const k of Object.keys(empty())){
  const input=h.querySelector("[data-b97-field='"+k+"']");
  if(input)input.value=n[k];
 }
 status("Temporary in-memory operator follow-up notes only. No backend storage, transmission, authentic evidence check or approvals.");
}
async function load(){
 status("Verifying 533 catalogue / 35 held cases / 175 original evidence IDs…");
 try{
  if(!await window.pmsvB87Catalogue?.load?.()||!sourceValid()){
   loaded=false;source=[];status("Trusted sources did not verify. No entry or export permitted.");return false;
  }
  source=records();
  loaded=source.length===70&&new Set(source.map(r=>r.request_id)).size===70;
  if(!loaded){status("Original first-70 reconciliation failed.");return false}
  render();return true;
 }catch(_){loaded=false;source=[];status("Source verification error; entries blocked.");return false}
}
function install(){
 if(host())return;
 const anchor=document.getElementById("pmsv-b96-method-preflight")||
              document.getElementById("pmsv-b93-legal-lab")||
              document.getElementById("pmsv-b87-catalogue");
 if(!anchor)return;
 const h=node("details",undefined,{id:ID,class:"card"});
 h.appendChild(node("summary","Batch97 · First 70 requests: local follow-up register / CSV handoff"));
 h.appendChild(node("p","Track preparation and externally performed follow-ups for the 35 manufacturer-identity and 35 method-authority requests. PMSV NEVER sends requests, receives or authenticates proof, approves a method/limit, passes a tested lot or releases a product. All operator status entries are SELF-REPORTED and stay in this browser tab until exported."));
 h.appendChild(node("button","Verify and load 70 original requests",{type:"button","data-b97-load":""}));
 h.appendChild(node("p","Not loaded; original requests all NOT SENT.",{role:"status","aria-live":"polite","data-b97-status":""}));
 h.appendChild(node("p","",{"data-b97-counts":""}));
 const filters=node("div",undefined,{class:"checker-grid"});
 const lab=node("label","Priority");
 const p=node("select",undefined,{"data-b97-priority":""});
 [["ALL","All 35 cases"],["P0","13 P0 cases"],["P1","22 P1 cases"]].forEach(([v,t])=>p.appendChild(node("option",t,{value:v})));
 lab.appendChild(p);filters.appendChild(lab);
 const lab2=node("label","Functional owner");
 const o=node("select",undefined,{"data-b97-role":""});
 [["ALL","Both owner roles"],[ROLE_MAKER,"Manufacturer identity"],[ROLE_SOURCE,"Method source authority"]].forEach(([v,t])=>o.appendChild(node("option",t,{value:v})));
 lab2.appendChild(o);filters.appendChild(lab2);
 const lab3=node("label","Search product or request ID");
 lab3.appendChild(node("input",undefined,{type:"search",maxlength:"100","data-b97-search":""}));
 filters.appendChild(lab3);h.appendChild(filters);
 const scroll=node("div",undefined,{style:"max-height:330px;overflow:auto"});
 const table=node("table"),thead=node("thead"),tr=node("tr");
 ["Case","Product","Evidence owner","Local follow-up note"].forEach(x=>tr.appendChild(node("th",x)));
 thead.appendChild(tr);table.appendChild(thead);
 table.appendChild(node("tbody",undefined,{"data-b97-rows":""}));scroll.appendChild(table);h.appendChild(scroll);
 const edit=node("div",undefined,{"data-b97-editor":"",hidden:""});
 const picker=node("label","Choose an original documentary request");
 picker.appendChild(node("select",undefined,{"data-b97-request":""}));edit.appendChild(picker);
 edit.appendChild(node("p","",{"data-b97-description":""}));
 const fieldInfo=[
  ["operator_followup_state","Self-reported activity stage","select"],
  ["outbound_reference","Outgoing request reference (not confidential contents)","text"],
  ["sent_date","Date sent externally (required if reported sent)","date"],
  ["response_reference","Response reference (not the document contents)","text"],
  ["response_date","Date response reported (required if response reported)","date"],
  ["next_followup_date","Next follow-up date (optional, after sent date)","date"]
 ];
 for(const [key,label,type] of fieldInfo){
  const wrap=node("label",label);
  let field;
  if(type==="select"){
   field=node("select",undefined,{"data-b97-field":key});
   [["NOT_PREPARED","Not prepared"],["DRAFT_READY","Draft ready locally"],
    ["SENT_SELF_REPORTED","Sent externally — self-reported"],
    ["RESPONSE_SELF_REPORTED","Response received — self-reported, not verified"]]
    .forEach(([v,t])=>field.appendChild(node("option",t,{value:v})));
  }else{
   field=node("input",undefined,{type,maxlength:type==="text"?"80":"10",
    placeholder:type==="text"?"Reference ID only":"",autocomplete:"off","data-b97-field":key});
  }
  wrap.appendChild(field);edit.appendChild(wrap);
 }
 edit.appendChild(node("button","Save self-reported follow-up note",{type:"button","data-b97-save":""}));
 h.appendChild(edit);
 h.appendChild(node("p","For Sent or Response stages, an outbound ID and date are required. A response additionally requires its own ID and date. These declarations do NOT update the original FSSAI evidence register or unblock the 105 downstream compliance requirements."));
 const actions=node("div");
 actions.appendChild(node("button","Export 70 follow-up notes CSV",{type:"button","data-b97-export":""}));
 actions.appendChild(document.createTextNode(" "));
 actions.appendChild(node("button","Download 70-row blank template",{type:"button","data-b97-template":""}));
 h.appendChild(actions);
 const importLabel=node("label","Import a previously exported 70-row CSV, entirely on this device");
 importLabel.appendChild(node("input",undefined,{type:"file",accept:".csv,text/csv","data-b97-import":""}));
 h.appendChild(importLabel);
 h.appendChild(node("p","Privacy: this public prototype does not store or upload notes. Export before navigating away, and keep confidential BOMs, original CoAs and personal details out of the form."));
 const css=node("style",undefined,{id:"pmsv-b97-css"});
 css.textContent="#pmsv-b97-first70-followup{overflow-wrap:anywhere}#pmsv-b97-first70-followup summary{font-weight:800;cursor:pointer}#pmsv-b97-first70-followup label{display:block;margin:8px 0;font-weight:650}#pmsv-b97-first70-followup input,#pmsv-b97-first70-followup select{display:block;width:100%;max-width:100%;padding:8px;margin-top:4px;border:1px solid #b8c8e0;border-radius:7px}#pmsv-b97-first70-followup button{white-space:normal;margin:5px 0}#pmsv-b97-first70-followup [data-b97-editor]{border:1px solid #d6dfe9;border-radius:10px;padding:12px;margin:10px 0;background:#f7f9fd}";
 anchor.insertAdjacentElement("afterend",h);document.head.appendChild(css);
}
document.addEventListener("click",event=>{
 const b=event.target?.closest?.("#"+ID+" button");if(!b)return;
 if(b.hasAttribute("data-b97-load")){void load();return}
 if(!loaded||!sourceValid())return status("Source verification required before changes or export.");
 if(b.hasAttribute("data-b97-save")){
  const r=source.find(x=>x.request_id===chosen);if(!r)return;
  const next={};
  for(const k of Object.keys(empty()))next[k]=host().querySelector("[data-b97-field='"+k+"']")?.value||"";
  if(!capture(r.request_id,next))status("Invalid status/date/reference sequence. No change saved. Use reference IDs only; dates must be real, with sent date before response/follow-up.");
 }else if(b.hasAttribute("data-b97-export"))
  download(csv(),"PMSV-B97-70-SELF-REPORTED-FOLLOWUP-UNVERIFIED.csv");
 else if(b.hasAttribute("data-b97-template"))
  download(csv(true),"PMSV-B97-70-BLANK-FOLLOWUP-TEMPLATE.csv");
});
document.addEventListener("change",event=>{
 const t=event.target;
 if(t?.matches?.("#"+ID+" [data-b97-priority]")){priority=t.value;render()}
 else if(t?.matches?.("#"+ID+" [data-b97-role]")){role=t.value;render()}
 else if(t?.matches?.("#"+ID+" [data-b97-request]")){chosen=t.value;render()}
 else if(t?.matches?.("#"+ID+" [data-b97-import]")){
  const f=t.files?.[0];t.value="";
  if(!f)return;
  if(f.size>150000)return status("Import rejected: exceeds 150 KB.");
  f.text().then(importCSV).catch(()=>status("Import rejected: file could not be read."));
 }
});
document.addEventListener("input",event=>{
 if(event.target?.matches?.("#"+ID+" [data-b97-search]")){
  q=String(event.target.value||"").slice(0,100);render();
 }
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
window.pmsvB97Followup=Object.freeze({sourceValid,records,validNote,capture,summary,
 csv,parseCSV,importCSV,load,install});
})();