(function(){"use strict";
/* PMSV Batch100: role-bound LOCAL issue register, never a legal/method/lot approval.
 * Evidence and signatures are NOT received by this UI. Local version binding is
 * informational; it cannot authenticate issuer, content, external reviewer or CoA.
 */
const ID="pmsv-b100-exception-register",KIND="PMSV_B100_105_HELD_EXCEPTION_REGISTER_V1";
const ROLES=["REGULATORY_AFFAIRS_LEGAL","LABORATORY_TECHNICAL_MANAGER",
 "SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER"];
const ISSUES=["SOURCE_ORIGIN_UNCONFIRMED","CONTROLLED_VERSION_CONFLICT",
 "LEGAL_ARTICLE_APPLICABILITY_UNVERIFIED","METHOD_MATRIX_SCOPE_LOQ_GAP",
 "REPRESENTATIVE_LOT_OR_SAMPLING_GAP","DOCUMENT_OR_SIGNATURE_MISSING",
 "OTHER_EVIDENCE_CONFLICT"];
const STAGES=["OPEN","FOLLOW_UP_REQUESTED","REFERRED_TO_INDEPENDENT_REVIEW"];
const LEVELS=["BLOCKING","REVIEW_REQUIRED"];
const FIELDS=["issue_code","criticality","stage","ticket_ref","next_action","review_by"];
let loaded=false,chosen="",histories=new Map(),message="";
function n(tag,txt,attrs){
 const e=document.createElement(tag);
 if(txt!==undefined)e.textContent=String(txt);
 for(const [k,v] of Object.entries(attrs||{}))e.setAttribute(k,String(v));
 return e;
}
function host(){return document.getElementById(ID)}
function status(t){message=t;const h=host();const el=h?.querySelector("[data-b100-status]");if(el)el.textContent=t}
function originalRows(){
 // Batch99.rows() does its own strict source validation; no duplicate precheck.
 return window.pmsvB99DownstreamAudit?.rows?.()||[];
}
function validRows(a){
 return Array.isArray(a)&&a.length===105&&new Set(a.map(x=>x.request_id)).size===105&&
  a.every(r=>ROLES.includes(r.role)&&r.original_evidence==="NOT_SENT_NOT_RECEIVED"&&
   r.commercial_decision==="HELD_NO_APPROVAL_OR_PASS")&&
  ROLES.every(role=>a.filter(r=>r.role===role).length===35);
}
function verifiedRows(){
 try{const a=originalRows();return validRows(a)?a:[]}catch(_){return[]}
}
function sourceValid(){return verifiedRows().length===105}
function request(id,prechecked){return (prechecked||verifiedRows()).find(r=>r.request_id===id)}
function docTuple(d){
 return [d.ref||"",d.version||"",d.issue_date||"",d.sha256||"",d.origin_check_ref||""];
}
function snapshot(r){
 const v=window.pmsvB98Handoff.latest(r.case_id);
 const list=[docTuple(v.manufacturer)];
 if(r.role!==ROLES[0])list.push(docTuple(v.method));
 return JSON.stringify(list);
}
function validSnapshot(s,role){
 if(typeof s!=="string"||s.length>1200)return false;
 try{
  const a=JSON.parse(s);
  return Array.isArray(a)&&a.length===(role===ROLES[0]?1:2)&&
    a.every(b=>Array.isArray(b)&&b.length===5&&
      b.every(t=>typeof t==="string"&&t.length<=100&&
        (!t||/^[A-Za-z0-9][A-Za-z0-9 _./:#()-]*$/.test(t))&&
        !/^[=+@-]/.test(t)));
 }catch(_){return false}
}
function isDate(s){
 if(s==="")return true;
 if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const d=new Date(s+"T00:00:00Z");
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;
}
function safeRef(s,max){
 return typeof s==="string"&&s.length<=max&&
  (!s||/^[A-Za-z0-9][A-Za-z0-9 _./:#()-]*$/.test(s))&&
  !/^[=+@-]/.test(s);
}
function validInput(x){
 return x&&Object.keys(x).sort().join("|")===FIELDS.slice().sort().join("|")&&
  ISSUES.includes(x.issue_code)&&LEVELS.includes(x.criticality)&&
  STAGES.includes(x.stage)&&safeRef(x.ticket_ref,100)&&
  safeRef(x.next_action,180)&&!!x.next_action&&isDate(x.review_by);
}
function latest(id){const h=histories.get(id)||[];return h[h.length-1]||null}
function stale(r,x){return !!x&&x.source_snapshot!==snapshot(r)}
function issuesUnchecked(list){
 return list.map(r=>{
  const last=latest(r.request_id);
  return Object.freeze({...r,issue_revision:last?.entry_revision||0,
   issue_code:last?.issue_code||"NOT_RECORDED",
   issue_stage:last?.stage||"NOT_RECORDED",
   issue_criticality:last?.criticality||"NOT_RECORDED",
   ticket_ref:last?.ticket_ref||"",next_action:last?.next_action||"",
   review_by:last?.review_by||"",
   source_binding:last?(stale(r,last)?"STALE_RECHECK_REQUIRED":"LOCAL_SOURCE_MATCH"):"NO_LOCAL_ISSUE",
   commercial_decision:"HELD_NO_APPROVAL_OR_PASS"});
 });
}
function issues(){return loaded?issuesUnchecked(verifiedRows()):[]}
function summary(){
 const a=issues();return{held:a.length,recorded:a.filter(x=>x.issue_revision>0).length,
  stale:a.filter(x=>x.source_binding==="STALE_RECHECK_REQUIRED").length,
  regulatory:a.filter(x=>x.role===ROLES[0]).length,
  laboratory:a.filter(x=>x.role===ROLES[1]).length,
  qa:a.filter(x=>x.role===ROLES[2]).length,approved:0};
}
function save(id,x,acknowledgeNewSource){
 const checked=loaded?verifiedRows():[];
 if(!validRows(checked))return{ok:false,error:"Original 105-gate evidence integrity not verified"};
 const r=request(id,checked),prev=latest(id);
 if(!r)return{ok:false,error:"Unknown original independent review request"};
 if(!validInput(x))return{ok:false,error:"Issue type, unresolved state or limited reference/action text invalid"};
 if(prev&&stale(r,prev)&&acknowledgeNewSource!==true)
  return{ok:false,error:"Source document changed. Inspect current original and select explicit new-revision acknowledgement"};
 const rev=(prev?.entry_revision||0)+1;
 if(rev>15)return{ok:false,error:"Maximum 15 local entries per original request; export archive"};
 const entry=Object.freeze({
  request_id:r.request_id,case_id:r.case_id,role:r.role,
  source_snapshot:snapshot(r),entry_revision:rev,recorded_at:new Date().toISOString().slice(0,10),
  issue_code:x.issue_code,criticality:x.criticality,stage:x.stage,
  ticket_ref:x.ticket_ref,next_action:x.next_action,review_by:x.review_by
 });
 if(prev&&!stale(r,prev)&&FIELDS.every(k=>prev[k]===x[k]))
  return{ok:true,unchanged:true,revision:prev.entry_revision};
 histories.set(id,[...(histories.get(id)||[]),entry]);
 render(checked);
 status("Saved unresolved local issue revision "+rev+
  ". Original source remains NOT RECEIVED; no independent approval or release inferred.");
 return{ok:true,revision:rev,reanchored:!!prev&&prev.source_snapshot!==entry.source_snapshot};
}
function validEntry(x,r,i){
 const keys=["request_id","case_id","role","source_snapshot","entry_revision","recorded_at",...FIELDS];
 return x&&Object.keys(x).sort().join("|")===keys.sort().join("|")&&
  x.request_id===r.request_id&&x.case_id===r.case_id&&x.role===r.role&&
  x.entry_revision===i+1&&isDate(x.recorded_at)&&!!x.recorded_at&&
  validSnapshot(x.source_snapshot,r.role)&&validInput(Object.fromEntries(FIELDS.map(k=>[k,x[k]])));
}
function exportJSON(){
 const a=loaded?verifiedRows():[];
 if(!validRows(a))return"";
 return JSON.stringify({
  kind:KIND,original_status:"105_DEPENDENT_HELD_35_CASES_NO_APPROVAL",
  exported_at:new Date().toISOString().slice(0,10),
  inventory:a.map(r=>({request_id:r.request_id,case_id:r.case_id,role:r.role})),
  histories:[...histories].map(([id,entries])=>({request_id:id,entries}))
 },null,2)+"\n";
}
function importJSON(raw){
 const original=loaded?verifiedRows():[];
 if(!validRows(original))return{ok:false,error:"Trusted source unavailable"};
 try{
  if(typeof raw!=="string"||raw.length>400000)throw Error("Oversized or invalid issue manifest");
  if(histories.size)throw Error("Existing local entries present; export them first and reload before importing");
  const doc=JSON.parse(raw),ids=new Map(original.map(r=>[r.request_id,r]));
  if(doc?.kind!==KIND||
    doc.original_status!=="105_DEPENDENT_HELD_35_CASES_NO_APPROVAL"||
    !isDate(doc.exported_at)||!doc.exported_at||
    !Array.isArray(doc.inventory)||doc.inventory.length!==105||
    !Array.isArray(doc.histories)||doc.histories.length>105)
    throw Error("Not a 105-request Batch100 original evidence manifest");
  const observed=new Set();
  for(const r of doc.inventory){
   const src=ids.get(r?.request_id);
   if(!src||observed.has(r.request_id)||Object.keys(r).sort().join("|")!=="case_id|request_id|role"||
     r.case_id!==src.case_id||r.role!==src.role)
    throw Error("Original 105 evidence IDs or owner-role binding changed");
   observed.add(r.request_id);
  }
  if(observed.size!==105)throw Error("Incomplete original request inventory");
  const next=new Map();
  for(const block of doc.histories){
   const src=ids.get(block?.request_id);
   if(!src||next.has(block.request_id)||Object.keys(block).sort().join("|")!=="entries|request_id"||
     !Array.isArray(block.entries)||block.entries.length<1||block.entries.length>15||
     !block.entries.every((x,i)=>validEntry(x,src,i)))
    throw Error("Issue history changed or invalid request/role/source");
   next.set(block.request_id,block.entries.map(x=>Object.freeze(x)));
  }
  histories=next;render(original);
  status("Imported "+next.size+" local issue histories; all original evidence and commercial decisions remain HELD.");
  return{ok:true,requests:next.size};
 }catch(e){
  const error=String(e?.message||"Invalid import");
  status("Import rejected: "+error+". Existing records preserved.");
  return{ok:false,error};
 }
}
function q(v){
 let s=String(v??"");
 if(/^\s*[=+@-]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
}
function exportCSV(){
 const checked=loaded?verifiedRows():[];
 if(!validRows(checked))return"";
 const names=["rank","priority","case_id","product","analyte","request_id","role",
  "issue_revision","issue_code","issue_stage","issue_criticality",
  "ticket_ref","next_action","review_by","source_binding","commercial_decision"];
 return [names,...issuesUnchecked(checked).map(r=>names.map(k=>r[k]))]
  .map(a=>a.map(q).join(",")).join("\r\n")+"\r\n";
}
function download(s,name,type){
 if(!s)return false;
 const url=URL.createObjectURL(new Blob([s],{type:type+";charset=utf-8"}));
 const a=n("a",undefined,{href:url,download:name});document.body.appendChild(a);
 a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;
}
function render(prechecked){
 const list=prechecked|| (loaded?verifiedRows():[]);
 if(!loaded||!validRows(list))return status("Original source integrity failed; Batch100 unavailable.");
 const h=host();if(!h)return;
 const old=chosen;
 const pick=h.querySelector("[data-b100-case]");
 pick.replaceChildren();
 for(const r of list)pick.appendChild(n("option","#"+r.rank+" · "+r.product+
  " · "+(r.role===ROLES[0]?"Regulatory":r.role===ROLES[1]?"Laboratory":"QA"),{value:r.request_id}));
 if(!list.some(r=>r.request_id===old))chosen=list[0].request_id;
 pick.value=chosen;
 const r=request(chosen,list),x=latest(chosen),allIssues=issuesUnchecked(list);
 const s={held:list.length,recorded:allIssues.filter(y=>y.issue_revision>0).length,
  stale:allIssues.filter(y=>y.source_binding==="STALE_RECHECK_REQUIRED").length},
  gap=window.pmsvB99DownstreamAudit.rowStatus(r);
 h.querySelector("[data-b100-counts]").textContent=
  "105 HELD original requests · "+s.recorded+" local issue records · "+s.stale+
  " stale source-bound issues · 35 Regulatory / 35 Laboratory / 35 QA · 0 approved.";
 h.querySelector("[data-b100-case-note]").textContent=
  "Original ID "+r.request_id+" | "+r.role+" | "+r.priority+" | "+r.product+
  " | "+r.analyte+"\nCurrent upstream blocker: "+gap.blocker+
  "\nCurrent source snapshot: "+snapshot(r)+
  "\n"+(x?(stale(r,x)?"WARNING: prior issue record bound to superseded source metadata. Re-review actual original before a new entry.":"Local issue entry bound to current self-reported source metadata."):"No issue entered for this request.")+
  "\nIssuer authenticity, signed reviews and representative lot remain externally unverified.";
 const defaults={
  issue_code:x?.issue_code||ISSUES[0],criticality:x?.criticality||LEVELS[0],
  stage:x?.stage||STAGES[0],ticket_ref:x?.ticket_ref||"",
  next_action:x?.next_action||"",review_by:x?.review_by||""
 };
 for(const k of FIELDS){
  const f=h.querySelector("[data-b100-field='"+k+"']");
  if(f)f.value=defaults[k];
 }
 h.querySelector("[data-b100-history]").textContent=
  (histories.get(chosen)||[]).map(x=>"Local issue rev "+x.entry_revision+
  " / "+x.recorded_at+" / "+x.issue_code+
  (stale(r,x)?" / STALE SOURCE":"")).join(" · ")||"No recorded issue history.";
 status(message||"Private-to-this-tab issue triage. Export JSON to retain it. Never put personal data or document contents here.");
}
function form(){
 const x={};const h=host();
 for(const k of FIELDS)x[k]=h.querySelector("[data-b100-field='"+k+"']")?.value?.trim()||"";
 return x;
}
let loading=false;
function currentSourceStep(){
 const panel=document.getElementById("pmsv-b70-startup-gates");
 const step=panel?.querySelector("[data-pmsv-b70-state]")?.textContent?.trim()||
  "upstream research checks are still in progress";
 return step.slice(0,180);
}
function setLoading(enabled){
 const b=host()?.querySelector("[data-b100-load]");
 if(b){b.disabled=enabled;
  b.textContent=enabled?"Verifying official-source research…":"Verify frozen source and load issue register";}
}
async function load(){
 if(loading)return false;
 loading=true;setLoading(true);
 const start=Date.now();
 status("Starting source verification. The first extended-research load may take a minute; all 35 commercial decisions remain HELD.");
 const timer=typeof setInterval==="function"?setInterval(()=>{
  const elapsed=Math.floor((Date.now()-start)/1000);
  status("Verifying independent review source prerequisites: "+currentSourceStep()+
   " · "+elapsed+"s elapsed. No evidence or approval has been transferred.");
 },2000):null;
 try{
  const checked=await window.pmsvB99DownstreamAudit?.loadVerifiedRows?.();
  if(!validRows(checked)){
   loaded=false;
   const prior=document.getElementById("pmsv-b99-downstream-audit")
    ?.querySelector("[data-b99-status]")?.textContent?.trim()||"source not ready";
   status("Original source not verified ("+prior.slice(0,160)+
    "). Use the Batch70 extended-research loader, then retry. No issue entry/export.");return false;
  }
  loaded=true;render(checked);return true;
 }catch(_){loaded=false;status("Source verification unavailable; no issue review output.");return false}
 finally{if(timer!==null)clearInterval(timer);loading=false;setLoading(false)}
}
function field(h,key,text,tag,values){
 const label=n("label",text);let f;
 if(tag==="select"){
  f=n("select",undefined,{"data-b100-field":key});
  values.forEach(v=>f.appendChild(n("option",v.replaceAll("_"," "),{value:v})));
 }else{
  f=n("input",undefined,{"data-b100-field":key,type:tag||"text",
   maxlength:key==="next_action"?"180":"100"});
 }
 label.appendChild(f);h.appendChild(label);
}
function install(){
 if(host())return;
 const anchor=document.getElementById("pmsv-b99-downstream-audit");
 if(!anchor)return;
 const h=n("details",undefined,{id:ID,class:"card"});
 h.appendChild(n("summary","Batch100 · Independent reviewer exception and source-revision register"));
 h.appendChild(n("p","For the same 105 original HELD dependent requests. Record only short local evidence-gap ticket references and unresolved actions. Issues are version-bound: a changed manufacturer or method source makes a prior entry STALE until an explicit new-revision acknowledgement. This is not document authentication, signed review or product release."));
 h.appendChild(n("button","Verify frozen source and load issue register",{type:"button","data-b100-load":""}));
 h.appendChild(n("p","First use checks the extended FSSAI research sources and can take time; progress is shown here. Original evidence remains NOT RECEIVED.",{class:"notice"}));
 h.appendChild(n("p","Not loaded.",{role:"status","aria-live":"polite","data-b100-status":""}));
 h.appendChild(n("p","",{"data-b100-counts":""}));
 const choice=n("label","Original dependent evidence request");
 choice.appendChild(n("select",undefined,{"data-b100-case":""}));h.appendChild(choice);
 h.appendChild(n("p","",{"data-b100-case-note":"",style:"white-space:pre-wrap"}));
 field(h,"issue_code","Evidence-review exception","select",ISSUES);
 field(h,"criticality","Issue criticality (does not change commercial HOLD)","select",LEVELS);
 field(h,"stage","Unresolved follow-up stage","select",STAGES);
 field(h,"ticket_ref","External action-ticket reference only (no personal data)","text");
 field(h,"next_action","Short required next step (no source document text)","text");
 field(h,"review_by","Internal follow-up target date, if any","date");
 h.appendChild(n("button","Save unresolved issue for current source",{type:"button","data-b100-save":""}));
 h.appendChild(n("button","Acknowledge changed source and start NEW issue entry",{type:"button","data-b100-new-revision":""}));
 h.appendChild(n("p","",{"data-b100-history":"",style:"white-space:pre-wrap"}));
 h.appendChild(n("button","Export 105-request issue summary CSV",{type:"button","data-b100-csv":""}));
 h.appendChild(n("button","Export full local issue history JSON",{type:"button","data-b100-json":""}));
 const label=n("label","Restore a previously exported Batch100 JSON (only when register is empty)");
 label.appendChild(n("input",undefined,{type:"file",accept:".json,application/json","data-b100-import":""}));
 h.appendChild(label);
 h.appendChild(n("p","No documents are uploaded, no communication is sent, and there is no PASS, APPROVED, CLOSED or RELEASE state. The original 175 request records remain NOT_SENT / NOT_RECEIVED."));
 anchor.insertAdjacentElement("afterend",h);
 const style=n("style",undefined,{id:"pmsv-b100-css"});
 style.textContent="#pmsv-b100-exception-register{overflow-wrap:anywhere}#pmsv-b100-exception-register summary{font-weight:800;cursor:pointer}#pmsv-b100-exception-register label{display:block;margin:8px 0;font-weight:650}#pmsv-b100-exception-register select,#pmsv-b100-exception-register input{display:block;width:100%;max-width:100%;padding:9px;margin-top:4px;border:1px solid #b8c8e0;border-radius:7px}#pmsv-b100-exception-register button{margin:4px;white-space:normal}";
 document.head.appendChild(style);
}
document.addEventListener("click",e=>{
 const b=e.target?.closest?.("#"+ID+" button");if(!b)return;
 if(b.hasAttribute("data-b100-load")){void load();return}
 if(!loaded)return status("Load and verify original evidence first.");
 if(b.hasAttribute("data-b100-save")||b.hasAttribute("data-b100-new-revision")){
  const result=save(chosen,form(),b.hasAttribute("data-b100-new-revision"));
  if(!result.ok)status("Issue NOT saved: "+result.error);
 }else if(b.hasAttribute("data-b100-csv")){
  if(download(exportCSV(),"PMSV-B100-105-HELD-REVIEW-ISSUES.csv","text/csv"))
   status("Exported 105 original HELD requests; no commercial approvals.");
 }else if(b.hasAttribute("data-b100-json")){
  if(download(exportJSON(),"PMSV-B100-LOCAL-UNRESOLVED-REVIEW-HISTORY.json","application/json"))
   status("Exported local unresolved issue history; store it securely.");
 }
});
document.addEventListener("change",e=>{
 const f=e.target;
 if(f?.matches?.("#"+ID+" [data-b100-case]")){chosen=f.value;render()}
 if(f?.matches?.("#"+ID+" [data-b100-import]")){
  const file=f.files?.[0];if(!file)return;
  if(file.size>400000){status("Import refused: maximum 400 KB.");f.value="";return}
  void file.text().then(raw=>importJSON(raw)).catch(()=>status("Could not read local manifest.")).finally(()=>{f.value=""});
 }
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
window.pmsvB100Exceptions=Object.freeze({sourceValid,issues,summary,latest,snapshot,stale,save,exportCSV,exportJSON,importJSON,load,install});
})();