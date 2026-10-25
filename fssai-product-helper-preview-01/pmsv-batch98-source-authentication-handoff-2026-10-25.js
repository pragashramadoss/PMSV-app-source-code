(function(){"use strict";
/* PMSV Batch98: strictly local metadata/version registry and UNSENT reviewer handoff drafts.
 * SHA-256 protects bytes against silent changes; it cannot authenticate an issuer.
 * Never accept/upload document contents, approve legal limits, methods, lots or QA release.
 */
const ID="pmsv-b98-source-handoff",KIND="PMSV_B98_LOCAL_UNVERIFIED_SOURCE_HANDOFF_V1";
const ROLES=[
 "FSSAI_QA_DIVISION_AND_LAB_DIRECTOR",
 "MANUFACTURER_OR_SUPPLIER_QA",
 "REGULATORY_AFFAIRS_LEGAL",
 "LABORATORY_TECHNICAL_MANAGER",
 "SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER"
];
const STATES=["NOT_PREPARED","DRAFT_READY","SENT_SELF_REPORTED"];
const DOC_KEYS=["ref","version","issue_date","sha256","origin_check_ref"];
const H_KEYS=["state","reference","date"];
let profiles=[],loaded=false,selected="",history=new Map(),lastMessage="";
function node(tag,txt,attrs){
 const x=document.createElement(tag);if(txt!==undefined)x.textContent=String(txt);
 for(const [k,v] of Object.entries(attrs||{}))x.setAttribute(k,String(v));
 return x;
}
function host(){return document.getElementById(ID)}
function feedback(t){lastMessage=t;const x=host()?.querySelector("[data-b98-status]");if(x)x.textContent=t}
function sourceValid(){
 try{
  const b58=window.pmsvB58OwnerOutreach,b87=window.pmsvB87Catalogue;
  if(!b58?.valid?.()||!b87?.closureVerified?.())return false;
  const s=b87.closedResearchSummary?.();
  if(s?.catalogue!==533||s.public_source_desk_research_closed!==35||
     s.public_source_desk_research_open!==0||
     s.external_legal_and_lot_verification_held!==35||
     s.signed_product_limits!==0||s.validated_lab_lot_pass!==0||
     s.product_releases!==0)return false;
  const rows=b58.records();
  if(!Array.isArray(rows)||rows.length!==175)return false;
  const ids=new Set(),groups=new Map();let first=0,dependent=0,p0=new Set(),p1=new Set();
  for(const r of rows){
   if(!r||ids.has(r.request_id)||!r.case_id||!r.request_id||
      r.original_request_status!=="NOT_SENT"||
      r.original_document_status!=="NOT_RECEIVED"||!ROLES.includes(r.role))return false;
   ids.add(r.request_id);
   if(r.priority==="P0")p0.add(r.case_id);else if(r.priority==="P1")p1.add(r.case_id);else return false;
   const g=groups.get(r.case_id)||{rank:r.rank,product:r.product,analyte:r.analyte,
     priority:r.priority,roles:new Set(),ready:0,dependent:0};
   if(g.rank!==r.rank||g.product!==r.product||g.analyte!==r.analyte||
      g.priority!==r.priority||g.roles.has(r.role))return false;
   g.roles.add(r.role);
   if(r.routing==="REQUEST_PREPARATION_POSSIBLE"){
    if(![ROLES[0],ROLES[1]].includes(r.role))return false;
    first++;g.ready++;
   }else if(r.routing==="WAIT_FOR_UPSTREAM_EVIDENCE"){dependent++;g.dependent++}
   else return false;
   groups.set(r.case_id,g);
  }
  return ids.size===175&&groups.size===35&&first===70&&dependent===105&&
   p0.size===13&&p1.size===22&&[...groups.values()].every(g=>
     g.roles.size===5&&g.ready===2&&g.dependent===3);
 }catch(_){return false}
}
function casesUnchecked(){
 const groups=new Map();
 for(const r of window.pmsvB58OwnerOutreach.records()){
  let g=groups.get(r.case_id);
  if(!g){
   g={id:r.case_id,rank:Number(r.rank),priority:r.priority,
    product:r.product,analyte:r.analyte,requests:{}};
   groups.set(r.case_id,g);
  }
  g.requests[r.role]={id:r.request_id,gate:r.gate,evidence:r.evidence,
   dependency:r.dependencies||"",original_status:"NOT_SENT_NOT_RECEIVED"};
 }
 return [...groups.values()].sort((a,b)=>a.rank-b.rank).map(c=>{
  for(const role of ROLES)Object.freeze(c.requests[role]);
  Object.freeze(c.requests);return Object.freeze(c);
 });
}
function cases(){return sourceValid()?casesUnchecked():[]}
function emptyDoc(){return{ref:"",version:"",issue_date:"",sha256:"",origin_check_ref:""}}
function emptyHandoff(){return{state:"NOT_PREPARED",reference:"",date:""}}
function emptyEntry(){return{manufacturer:emptyDoc(),method:emptyDoc(),
 regulatory:emptyHandoff(),laboratory:emptyHandoff(),revision:0,recorded_at:"",
 revision_reset:false}}
function latest(id){const v=history.get(id);return v?.length?v[v.length-1]:emptyEntry()}
function safeText(s,max=100){
 return typeof s==="string"&&s.length<=max&&
 (!s||/^[A-Za-z0-9][A-Za-z0-9 _./:#()-]*$/.test(s))&&
 !/^[=+@-]/.test(s)&&!/[<>"'\r\n\t]/.test(s);
}
function validDate(s){
 if(s==="")return true;
 if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const d=new Date(s+"T00:00:00Z");
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;
}
function validDoc(d){
 if(!d||Object.keys(d).sort().join("|")!==[...DOC_KEYS].sort().join("|"))return false;
 if(!safeText(d.ref,100)||!safeText(d.version,35)||!safeText(d.origin_check_ref,100)||
    !validDate(d.issue_date)||typeof d.sha256!=="string"||
    d.sha256!==""&&!/^[a-f0-9]{64}$/.test(d.sha256))return false;
 return !!d.ref||!DOC_KEYS.some(k=>d[k]!=="");
}
function completeDoc(d){return validDoc(d)&&
 !!(d.ref&&d.version&&d.issue_date&&d.sha256&&d.origin_check_ref)}
function validHandoff(h,requiredDocs){
 if(!h||Object.keys(h).sort().join("|")!==[...H_KEYS].sort().join("|")||
    !STATES.includes(h.state)||!safeText(h.reference,100)||!validDate(h.date))return false;
 if(h.state==="NOT_PREPARED"||h.state==="DRAFT_READY")
  return !h.reference&&!h.date&&(h.state==="NOT_PREPARED"||requiredDocs);
 if(!requiredDocs||!h.reference||!h.date)return false;
 return true;
}
function validEntry(v){
 const expected=["manufacturer","method","regulatory","laboratory","revision","recorded_at","revision_reset"];
 if(!v||Object.keys(v).sort().join("|")!==expected.sort().join("|")||
    !validDoc(v.manufacturer)||!validDoc(v.method))return false;
 const regReady=completeDoc(v.manufacturer);
 const labReady=regReady&&completeDoc(v.method);
 if(!validHandoff(v.regulatory,regReady)||!validHandoff(v.laboratory,labReady))return false;
 if(!Number.isInteger(v.revision)||v.revision<1||v.revision>20||
    !validDate(v.recorded_at)||!v.recorded_at||typeof v.revision_reset!=="boolean")return false;
 if(v.regulatory.state==="SENT_SELF_REPORTED"&&v.regulatory.date<v.manufacturer.issue_date)return false;
 if(v.laboratory.state==="SENT_SELF_REPORTED"&&
    (v.laboratory.date<v.manufacturer.issue_date||v.laboratory.date<v.method.issue_date))return false;
 return true;
}
function sourceChanged(previous,next){
 return JSON.stringify(previous.manufacturer)!==JSON.stringify(next.manufacturer)||
        JSON.stringify(previous.method)!==JSON.stringify(next.method);
}
function sanitizeEntry(input,previous){
 const candidate={
  manufacturer:{...input.manufacturer},method:{...input.method},
  regulatory:{...input.regulatory},laboratory:{...input.laboratory},
  revision:previous.revision+1,recorded_at:new Date().toISOString().slice(0,10),
  revision_reset:false
 };
 const changed=previous.revision>0&&sourceChanged(previous,candidate);
 if(changed&&(previous.regulatory.state!=="NOT_PREPARED"||
              previous.laboratory.state!=="NOT_PREPARED")){
  candidate.regulatory=emptyHandoff();
  candidate.laboratory=emptyHandoff();
  candidate.revision_reset=true;
 }
 return candidate;
}
function save(id,input){
 if(!loaded||!sourceValid()||!profiles.some(c=>c.id===id))return{ok:false,error:"Trusted source unavailable"};
 const prev=latest(id),next=sanitizeEntry(input,prev);
 if(!validEntry(next))return{ok:false,error:"Invalid source metadata, checksum, review prerequisite or handoff reference/date"};
 if(prev.revision>0&&!sourceChanged(prev,next)&&
   JSON.stringify(prev.regulatory)===JSON.stringify(next.regulatory)&&
   JSON.stringify(prev.laboratory)===JSON.stringify(next.laboratory))return{ok:true,unchanged:true,revision:prev.revision};
 const versions=history.get(id)||[];
 if(versions.length>=20)return{ok:false,error:"Maximum 20 local revisions per case; export archive first"};
 history.set(id,[...versions,Object.freeze(next)]);
 render(true);
 const message=next.revision_reset?
  "Source revision changed: both reviewer handoffs RESET to NOT PREPARED. Older revisions retained in exported history.":
  "Saved local revision "+next.revision+". Metadata and checks remain SELF-REPORTED and UNAUTHENTICATED.";
 feedback(message);
 return{ok:true,revision:next.revision,reset:next.revision_reset};
}
function completeManufacturer(c){return completeDoc(latest(c.id).manufacturer)}
function completeMethod(c){const x=latest(c.id);return completeDoc(x.manufacturer)&&completeDoc(x.method)}
function packet(id,type){
 if(!loaded||!sourceValid())return"";
 const c=profiles.find(p=>p.id===id);
 if(!c||!["regulatory","laboratory"].includes(type))return"";
 const v=latest(id);
 if(type==="regulatory"&&!completeDoc(v.manufacturer))return"";
 if(type==="laboratory"&&!(completeDoc(v.manufacturer)&&completeDoc(v.method)))return"";
 const role=type==="regulatory"?ROLES[2]:ROLES[3];
 const m=c.requests[ROLES[1]],f=c.requests[ROLES[0]],target=c.requests[role];
 const lines=[
  "PMSV Batch98 — UNSENT, UNAUTHENTICATED "+type.toUpperCase()+" REVIEW HANDOFF",
  "This is a metadata-only draft for independent human review, NOT an authentication certificate, adopted legal limit, accredited method approval, lot PASS or QA release.",
  "Case "+c.rank+" · "+c.priority+" · "+c.product+" · "+c.analyte+" · "+c.id,
  "Original documentary ID: "+target.id+" | Original source status NOT_SENT / NOT_RECEIVED.",
  "Manufacturer evidence source request: "+m.id+" | Controlled ID: "+v.manufacturer.ref+
   " | revision: "+v.manufacturer.version+" | issue date: "+v.manufacturer.issue_date,
  "Manufacturer PDF/controlled-copy SHA-256: "+v.manufacturer.sha256,
  "Manufacturer issuer/custodian-check REFERENCE (SELF-REPORTED, NOT VERIFIED HERE): "+v.manufacturer.origin_check_ref,
  "Reference hashes establish byte comparison only, not document authenticity, legal applicability or truth of content."
 ];
 if(type==="regulatory"){
  lines.push("Regulatory reviewer needs independent original manufacturer confirmation, real commercial SKU and recipe/label identity, operative FSSAI Gazette article and effective date, exact finished-product analyte limit/unit/basis, signed classification and conflicts/supersession adjudication.",
   "Original review question: "+target.evidence,
   "Method source request "+f.id+" remains separate and cannot stand in for a signed current applicable food article.");
 }else{
  lines.push("Separate original method/source authority request: "+f.id,
   "Method source control ID: "+v.method.ref+" | revision: "+v.method.version+
   " | issue date: "+v.method.issue_date,
   "Method PDF SHA-256: "+v.method.sha256,
   "Method source custodian-check REFERENCE (SELF-REPORTED, NOT VERIFIED HERE): "+v.method.origin_check_ref,
   "Laboratory reviewer must independently establish current adopted version, exact analyte and commercial food matrix, NABL scope/method/range, LOQ relative to a separately confirmed legal limit, recovery, uncertainty and representative-lot sampling.",
   "Original review question: "+target.evidence);
 }
 lines.push("Source-control local revision: "+v.revision+" (may be superseded).",
  "External reviewer must check original controlled documents directly, not rely only on this form.",
  "No original documents uploaded or sent by PMSV. No approvals inferred.");
 return lines.join("\n\n")+"\n";
}
function exportJSON(){
 if(!loaded||!sourceValid())return"";
 const payload={
  kind:KIND,exported_at:new Date().toISOString().slice(0,10),
  original_status:"175_UNSENT_UNRECEIVED_35_HELD_NO_APPROVAL",
  cases:profiles.map(c=>({id:c.id,rank:c.rank,priority:c.priority,
   product:c.product,analyte:c.analyte,
   requests:ROLES.map(r=>c.requests[r].id),
   versions:history.get(c.id)||[]}))
 };
 return JSON.stringify(payload,null,2)+"\n";
}
function validateHistory(versions){
 if(!Array.isArray(versions)||versions.length>20)return false;
 for(let i=0;i<versions.length;i++){
  const v=versions[i];
  if(!validEntry(v)||v.revision!==i+1)return false;
  if(i>0){
   const prev=versions[i-1],changed=sourceChanged(prev,v);
   if(changed&&(prev.regulatory.state!=="NOT_PREPARED"||
                prev.laboratory.state!=="NOT_PREPARED")){
    if(!v.revision_reset||v.regulatory.state!=="NOT_PREPARED"||
       v.laboratory.state!=="NOT_PREPARED")return false;
   }else if(v.revision_reset)return false;
   if(!changed&&JSON.stringify(prev.regulatory)===JSON.stringify(v.regulatory)&&
      JSON.stringify(prev.laboratory)===JSON.stringify(v.laboratory))return false;
  }else if(v.revision_reset)return false;
 }
 return true;
}
function importJSON(raw){
 if(!loaded||!sourceValid())return{ok:false,error:"Trusted source unavailable"};
 try{
  if(typeof raw!=="string"||raw.length>240000)throw Error("Oversized or invalid JSON");
  const doc=JSON.parse(raw);
  if(doc?.kind!==KIND||doc.original_status!=="175_UNSENT_UNRECEIVED_35_HELD_NO_APPROVAL"||
     !validDate(doc.exported_at)||!Array.isArray(doc.cases)||doc.cases.length!==35)
    throw Error("Not an original 35-case Batch98 manifest");
  const matched=new Map(profiles.map(c=>[c.id,c])),next=new Map(),seen=new Set();
  for(const c of doc.cases){
   const orig=matched.get(c?.id);
   if(!orig||seen.has(c.id)||c.rank!==orig.rank||c.priority!==orig.priority||
      c.product!==orig.product||c.analyte!==orig.analyte||
      JSON.stringify(c.requests)!==JSON.stringify(ROLES.map(r=>orig.requests[r].id))||
      !validateHistory(c.versions))throw Error("Tampered source identity, proof IDs or revision chain");
   seen.add(c.id);
   if(c.versions.length)next.set(c.id,c.versions.map(v=>Object.freeze(v)));
  }
  if(seen.size!==35)throw Error("Incomplete case inventory");
  history=next;render(true);
  feedback("Imported "+next.size+" cases with locally recorded revisions. No original document, authentication or approval was imported.");
  return{ok:true,cases:next.size};
 }catch(err){
  const message=String(err.message||"Invalid manifest");
  feedback("IMPORT REJECTED: "+message+". Existing revision histories unchanged.");
  return{ok:false,error:message};
 }
}
function saveDownload(text,filename,mime){
 if(!text)return false;
 const url=URL.createObjectURL(new Blob([text],{type:mime+";charset=utf-8"}));
 const a=node("a",undefined,{href:url,download:filename});
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 return true;
}
function stats(alreadyVerified=false){
 if(!loaded||(!alreadyVerified&&!sourceValid()))return{revised:0,reg:0,lab:0};
 let revised=0,reg=0,lab=0;
 for(const c of profiles){
  const x=latest(c.id);if(x.revision)revised++;
  if(x.regulatory.state!=="NOT_PREPARED")reg++;
  if(x.laboratory.state!=="NOT_PREPARED")lab++;
 }
 return{revised,reg,lab};
}
function render(alreadyVerified=false){
 if(!loaded||(!alreadyVerified&&!sourceValid()))return feedback("Source verification failed; edits and handoffs blocked.");
 const h=host();if(!h)return;
 const pick=h.querySelector("[data-b98-case]");pick.replaceChildren();
 for(const c of profiles)pick.appendChild(node("option",
  "#"+c.rank+" "+c.priority+" · "+c.product+" / "+c.analyte,{value:c.id}));
 if(!profiles.some(c=>c.id===selected))selected=profiles[0].id;
 pick.value=selected;
 const c=profiles.find(x=>x.id===selected),v=latest(selected),s=stats(true);
 h.querySelector("[data-b98-counts]").textContent=
  "35 HELD cases · "+s.revised+" locally revised · "+s.reg+
  " Regulatory handoffs noted · "+s.lab+" Laboratory handoffs noted · 0 actual signed approvals.";
 h.querySelector("[data-b98-case-note]").textContent=
  "Case #"+c.rank+" | manufacturer proof "+c.requests[ROLES[1]].id+
  " → Regulatory "+c.requests[ROLES[2]].id+"; method source "+
  c.requests[ROLES[0]].id+" → Laboratory "+c.requests[ROLES[3]].id+
  ". Source remains NOT SENT / NOT RECEIVED. Local revision: "+v.revision;
 for(const group of ["manufacturer","method"]){
  for(const key of DOC_KEYS){
   const x=h.querySelector("[data-b98-field='"+group+"."+key+"']");
   if(x)x.value=v[group][key];
  }
 }
 for(const group of ["regulatory","laboratory"]){
  for(const key of H_KEYS){
   const x=h.querySelector("[data-b98-field='"+group+"."+key+"']");
   if(x)x.value=v[group][key];
  }
 }
 h.querySelector("[data-b98-versions]").textContent=
  (history.get(selected)||[]).map(x=>"Rev "+x.revision+" / "+x.recorded_at+
   (x.revision_reset?" / reviewer handoffs RESET after source change":"")).join(" · ")||
  "No local source metadata revision recorded.";
 h.querySelector("[data-b98-reg-ready]").textContent=completeManufacturer(c)?
   "Manufacturer metadata completed for a draft Regulatory handoff; issuer authenticity is still NOT VERIFIED here.":
   "Regulatory handoff draft blocked until manufacturer controlled ID, version, issue date, SHA-256 and external issuer-check reference are all entered.";
 h.querySelector("[data-b98-lab-ready]").textContent=completeMethod(c)?
   "Manufacturer and method-source metadata completed for a draft Laboratory handoff; accreditation/adoption remain NOT VERIFIED here.":
   "Laboratory handoff draft blocked until both manufacturer and method-authority metadata and external origin-check references are complete.";
 feedback(lastMessage||"Metadata-only in-memory review. Document hashes are byte fingerprints, not proof of issuer authenticity.");
}
async function load(){
 feedback("Verifying 35-case / 175-original-proof identities…");
 try{
  if(!await window.pmsvB87Catalogue?.load?.()||!sourceValid()){
   loaded=false;profiles=[];feedback("Source integrity failed: no version entry or packet export.");return false;
  }
  profiles=casesUnchecked();loaded=profiles.length===35;
  if(!loaded){feedback("Case reconciliation failed.");return false}
  lastMessage="Verified original case inventory. Controlled copies and issuer references still require independent human authentication.";
  render(true);return true;
 }catch(_){loaded=false;profiles=[];feedback("Source unavailable; outputs blocked.");return false}
}
function readForm(){
 const h=host();
 const entry={manufacturer:{},method:{},regulatory:{},laboratory:{}};
 for(const group of ["manufacturer","method"])
  for(const key of DOC_KEYS)entry[group][key]=h.querySelector("[data-b98-field='"+group+"."+key+"']")?.value?.trim()||"";
 for(const group of ["regulatory","laboratory"])
  for(const key of H_KEYS)entry[group][key]=h.querySelector("[data-b98-field='"+group+"."+key+"']")?.value?.trim()||"";
 return entry;
}
async function hashLocalFile(file,target){
 if(!loaded||!sourceValid())return feedback("Verify source before computing a fingerprint.");
 if(!file||file.size>30000000)return feedback("Select a local file no larger than 30 MB.");
 if(!globalThis.crypto?.subtle?.digest)return feedback("Secure local SHA-256 unavailable in this browser.");
 try{
  const digest=await globalThis.crypto.subtle.digest("SHA-256",await file.arrayBuffer());
  const hex=[...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,"0")).join("");
  const input=host()?.querySelector("[data-b98-field='"+target+".sha256']");
  if(!input)return;
  input.value=hex;
  feedback("SHA-256 computed entirely inside this browser. File not uploaded or stored; a fingerprint alone does not authenticate issuer or version.");
 }catch(_){feedback("Local hash failed; no document was uploaded.");}
}
function install(){
 if(host())return;
 const anchor=document.getElementById("pmsv-b97-first70-followup")||
              document.getElementById("pmsv-b96-method-preflight")||
              document.getElementById("pmsv-b93-legal-lab");
 if(!anchor)return;
 const h=node("details",undefined,{id:ID,class:"card"});
 h.appendChild(node("summary","Batch98 · Source authentication / revision control / independent review handoff"));
 h.appendChild(node("p","A private-in-this-tab, metadata-only workbench for the same 35 commercial HELD cases. It can calculate SHA-256 locally without uploading document bytes, track revisions, and prepare separate UNSENT reviewer packets. A checksum cannot prove that an issuer is genuine. No legal limits, laboratory methods, test lots or QA releases are approved."));
 h.appendChild(node("button","Verify original 35 cases and open revision register",{type:"button","data-b98-load":""}));
 h.appendChild(node("p","Not loaded.",{role:"status","aria-live":"polite","data-b98-status":""}));
 h.appendChild(node("p","",{"data-b98-counts":""}));
 const chooser=node("label","Select original held product case");
 chooser.appendChild(node("select",undefined,{"data-b98-case":""}));h.appendChild(chooser);
 h.appendChild(node("p","",{"data-b98-case-note":""}));
 const fields=[
  ["manufacturer","Manufacturer / supplier controlled original",DOC_KEYS],
  ["method","Official method-source controlled original",DOC_KEYS]
 ];
 for(const [group,title,keys] of fields){
  const fs=node("fieldset"),legend=node("legend",title);
  fs.appendChild(legend);
  for(const key of keys){
   const label=node("label",({
    ref:"Controlled document reference ID",
    version:"Controlled version / revision",
    issue_date:"Document issue date",
    sha256:"SHA-256 (64 hexadecimal characters)",
    origin_check_ref:"Issuer/custodian confirmation reference (self-reported)"
   })[key]);
   const input=node("input",undefined,{type:key==="issue_date"?"date":"text",
    maxlength:key==="sha256"?"64":key==="version"?"35":"100",
    autocomplete:"off",spellcheck:"false","data-b98-field":group+"."+key});
   label.appendChild(input);fs.appendChild(label);
   if(key==="sha256"){
    const pick=node("label","Optional: calculate SHA-256 from a local controlled copy (no upload)");
    pick.appendChild(node("input",undefined,{type:"file","data-b98-hash":group}));
    fs.appendChild(pick);
   }
  }
  h.appendChild(fs);
 }
 for(const [group,title] of [["regulatory","Independent Regulatory / Legal handoff"],
   ["laboratory","Independent Laboratory technical handoff"]]){
  const fs=node("fieldset");fs.appendChild(node("legend",title));
  const s=node("label","Operator follow-up state (never an approval)");
  const select=node("select",undefined,{"data-b98-field":group+".state"});
  [["NOT_PREPARED","Not prepared"],["DRAFT_READY","Draft ready locally"],
   ["SENT_SELF_REPORTED","Sent externally — self-reported"]]
   .forEach(([v,t])=>select.appendChild(node("option",t,{value:v})));
  s.appendChild(select);fs.appendChild(s);
  const ref=node("label","Outbound reference ID (required if sent)");
  ref.appendChild(node("input",undefined,{type:"text",maxlength:"100",
   "data-b98-field":group+".reference",autocomplete:"off"}));fs.appendChild(ref);
  const date=node("label","Externally sent date (required if sent)");
  date.appendChild(node("input",undefined,{type:"date",
   "data-b98-field":group+".date"}));fs.appendChild(date);
  h.appendChild(fs);
 }
 h.appendChild(node("p","",{"data-b98-reg-ready":""}));
 h.appendChild(node("p","",{"data-b98-lab-ready":""}));
 h.appendChild(node("button","Save new local evidence-metadata revision",{type:"button","data-b98-save":""}));
 h.appendChild(node("p","Revising manufacturer or method-source metadata after a handoff resets BOTH reviewer handoffs to NOT PREPARED and retains the old revision in the archive."));
 h.appendChild(node("p","",{"data-b98-versions":""}));
 const action=node("div");
 action.appendChild(node("button","Download UNSENT Regulatory review packet",{type:"button","data-b98-packet":"regulatory"}));
 action.appendChild(document.createTextNode(" "));
 action.appendChild(node("button","Download UNSENT Laboratory review packet",{type:"button","data-b98-packet":"laboratory"}));
 action.appendChild(document.createTextNode(" "));
 action.appendChild(node("button","Export version-controlled 35-case JSON",{type:"button","data-b98-export":""}));
 h.appendChild(action);
 const imp=node("label","Import previously exported 35-case JSON locally");
 imp.appendChild(node("input",undefined,{type:"file",accept:".json,application/json","data-b98-import":""}));h.appendChild(imp);
 h.appendChild(node("p","No confidential product formulations, full CoAs, PDFs, personal names or sensitive credentials belong in the text fields. Export before leaving this page; all local metadata and version history are lost on refresh unless exported."));
 const css=node("style",undefined,{id:"pmsv-b98-css"});
 css.textContent="#pmsv-b98-source-handoff{overflow-wrap:anywhere}#pmsv-b98-source-handoff summary{font-weight:800;cursor:pointer}#pmsv-b98-source-handoff label{display:block;margin:7px 0;font-weight:650}#pmsv-b98-source-handoff input,#pmsv-b98-source-handoff select{width:100%;max-width:100%;display:block;margin-top:4px;padding:8px;border:1px solid #b8c8e0;border-radius:7px}#pmsv-b98-source-handoff fieldset{border:1px solid #d6dfe9;border-radius:10px;margin:12px 0;padding:12px}#pmsv-b98-source-handoff legend{font-weight:800}#pmsv-b98-source-handoff button{margin:5px 2px;white-space:normal}";
 anchor.insertAdjacentElement("afterend",h);document.head.appendChild(css);
}
document.addEventListener("click",ev=>{
 const b=ev.target?.closest?.("#"+ID+" button");if(!b)return;
 if(b.hasAttribute("data-b98-load")){void load();return}
 if(!loaded||!sourceValid())return feedback("Verify source integrity before entry or export.");
 if(b.hasAttribute("data-b98-save")){
  const result=save(selected,readForm());
  if(!result.ok)feedback("SAVE REJECTED: "+result.error+". Previous local revisions preserved.");
  else if(result.unchanged)feedback("No new source or handoff change; retained existing revision "+result.revision+".");
 }else if(b.hasAttribute("data-b98-export"))
  saveDownload(exportJSON(),"PMSV-B98-35-EVIDENCE-VERSION-HISTORY-UNVERIFIED.json","application/json");
 else if(b.hasAttribute("data-b98-packet")){
  const type=b.dataset.b98Packet,text=packet(selected,type);
  if(!text)return feedback("Draft BLOCKED: current required document references, revisions, issue dates, SHA-256 and issuer-check references must first be saved.");
  const c=profiles.find(x=>x.id===selected);
  saveDownload(text,"PMSV-B98-CASE-"+String(c.rank).padStart(2,"0")+"-"+type.toUpperCase()+"-UNSENT-REVIEW.txt","text/plain");
  feedback("UNSENT draft generated locally. Independent documentary authentication, legal/method sign-off and QA release remain pending.");
 }
});
document.addEventListener("change",ev=>{
 const t=ev.target;
 if(t?.matches?.("#"+ID+" [data-b98-case]")){selected=t.value;lastMessage="";render()}
 else if(t?.matches?.("#"+ID+" [data-b98-hash]")){
  const file=t.files?.[0],target=t.dataset.b98Hash;t.value="";
  if(file&&["manufacturer","method"].includes(target))void hashLocalFile(file,target);
 }else if(t?.matches?.("#"+ID+" [data-b98-import]")){
  const file=t.files?.[0];t.value="";
  if(!file)return;
  if(file.size>240000)return feedback("Import rejected: 240KB maximum.");
  file.text().then(importJSON).catch(()=>feedback("Import failed: local file cannot be read."));
 }
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
window.pmsvB98Handoff=Object.freeze({sourceValid,cases,validDoc,completeDoc,validEntry,save,
 latest,packet,exportJSON,importJSON,validateHistory,stats,load,install});
})();