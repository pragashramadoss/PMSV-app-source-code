"use strict";
/* Batch56: reference metadata triage for all 175 immutable legal evidence gates.
   IMPORTANT: references are SELF-REPORTED and UNSIGNED, not evidence validation or release.
   NO persistence, API calls, binary uploads, method approvals, legal limits or lot PASS. */
var pmsvB56Data=null,pmsvB56Selected="",pmsvB56Priority="ALL",pmsvB56Role="ALL",
 pmsvB56TriageFilter="ALL",pmsvB56Search="",pmsvB56Drafts=Object.create(null);
const pmsvB56Path="./data/rules/fssai-current35-175-proof-reference-triage-batch56-2026-10-16.json";
const pmsvB56Expected="005621e8f737f08d";
const pmsvB56Fields=["request_id","reference_text","issuer_or_custodian","document_type","reported_date","triage_stage","review_note","approval_status"];
function pmsvB56Valid(){
 if(typeof pmsvB55Valid!=="function"||!pmsvB55Valid()||typeof pmsvB14Digest!=="function"||
 !pmsvB56Data||pmsvB14Digest(pmsvB56Data)!==pmsvB56Expected)return false;
 const d=pmsvB56Data,t=d.totals;
 if(d.kind!=="PMSV_BATCH56_ALL35_175_GATE_METADATA_RECEIPT_TRIAGE_NO_APPROVAL"||
 d.as_of!=="2026-10-16"||d.environment!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
 d.origin_batch55_dataset_digest!=="783ed3e1c3ec37c2"||
 t.catalogue!==533||t.conditional_first_source_matches!==498||
 t.open_ctr_cases!==35||t.priority_p0!==13||t.priority_p1!==22||
 t.open_evidence_gates!==175||t.gate_roles!==5||t.requests_per_role!==35||
 t.preparatory_requests!==70||t.dependent_evidence_gates!==105||
 t.source_identity_known!==28||t.named_material_identity_pending!==7||
 t.received_documents!==0||t.document_references_reported_at_publication!==0||
 t.evidence_authenticated!==0||t.approved_ctr_articles!==0||
 t.lab_method_scope_approved!==0||t.lot_passes!==0||t.wordpress_changed!==false||
 d.cases?.length!==35||d.source_boundaries?.length!==5||
 d.document_type_keys?.length!==6||d.evidence_stage_keys?.length!==3||
 d.immutable_decision!=="OPEN_UNVERIFIED_NO_AUTO_PASS"||
 d.receipt_template?.approval_status!=="NOT_VERIFIED_DOES_NOT_RELEASE_PRODUCT"||
 Object.values(d.results||{}).some(x=>x!==true))return false;
 const previous=new Map(pmsvB55Data.cases.map(x=>[x.catalogue_id,x]));
 let p0=0,p1=0,total=0,independent=0,dependent=0;
 const known=new Set(),roles=new Map();
 for(const c of d.cases){
  const old=previous.get(c.catalogue_id);
  if(!old||old.rank!==c.rank||old.product_name!==c.product_name||
     old.analyte!==c.analyte||old.priority!==c.priority||
     old.original_legal_gate!==c.original_legal_gate||
     old.published_identity_source_known!==(c.identity_source_status==="PUBLISHED_PRODUCT_IDENTITY_REFERENCE_ONLY")||
     old.historical_five_gates?.length!==5||c.gates?.length!==5||
     !c.source_url?.startsWith("https://")||
     c.current_ctr_limit_signed!==false||
     c.actual_market_product_verified!==false||
     c.validated_laboratory_method!==false||
     c.actual_lot_approved!==false)return false;
  if(c.priority==="P0")p0++;else p1++;
  for(let i=0;i<5;i++){
   const g=c.gates[i],prev=old.historical_five_gates[i];
   if(!g||!prev||known.has(g.request_id)||
     g.request_id!==prev.request_id||g.gate_code!==prev.gate_code||
     g.owner_role!==prev.owner_role||
     JSON.stringify(g.dependency_codes)!==JSON.stringify(prev.must_verify_first)||
     g.first_action!==prev.request_preparation_lane||
     g.required_evidence!==prev.evidence_requested||
     g.immutable_request_state!=="NOT_SENT"||
     g.immutable_document_state!=="NOT_RECEIVED"||
     g.immutable_compliance_state!=="NO_APPROVED_LIMIT_METHOD_OR_PASS")return false;
   roles.set(g.owner_role,(roles.get(g.owner_role)||0)+1);
   if(g.dependency_codes.length)dependent++;else independent++;
   total++;known.add(g.request_id);
  }
 }
 return p0===13&&p1===22&&total===175&&independent===70&&dependent===105&&
  known.size===175&&roles.size===5&&[...roles.values()].every(x=>x===35)&&
  pmsvB56Data.evidence_stage_keys.every(x=>!/(^|_)APPROVED($|_)/.test(x.key));
}
function pmsvB56Gates(){
 return pmsvB56Data?.cases?.flatMap(c=>c.gates.map(g=>({case:c,gate:g})))||[];
}
function pmsvB56Known(id){return pmsvB56Gates().find(v=>v.gate.request_id===id);}
function pmsvB56Entry(id){return pmsvB56Drafts[id]||null;}
function pmsvB56Reported(id){
 const d=pmsvB56Entry(id);
 return !!(d&&(d.reference_text||d.issuer_or_custodian||d.reported_date||d.review_note));
}
function pmsvB56Filtered(){
 if(!pmsvB56Valid())return [];
 const q=pmsvB56Search.trim().toLowerCase();
 return pmsvB56Gates().filter(({case:c,gate:g})=>
 (pmsvB56Priority==="ALL"||c.priority===pmsvB56Priority)&&
 (pmsvB56Role==="ALL"||g.owner_role===pmsvB56Role)&&
 (pmsvB56TriageFilter==="ALL"||
  (pmsvB56TriageFilter==="REFERENCE_REPORTED"&&pmsvB56Reported(g.request_id))||
  (pmsvB56TriageFilter==="NOT_REPORTED"&&!pmsvB56Reported(g.request_id))||
  (pmsvB56TriageFilter==="PREPARABLE"&&g.dependency_codes.length===0)||
  (pmsvB56TriageFilter==="UPSTREAM_DEPENDENCY"&&g.dependency_codes.length>0))&&
 (!q||[c.rank,c.product_name,c.analyte,g.request_id,g.owner_role,g.gate_code].some(v=>
 String(v).toLowerCase().includes(q))));
}
function pmsvB56RowTable(){
 const e=pmsvB14Esc;
 return pmsvB56Filtered().map(({case:c,gate:g})=>{
 const reported=pmsvB56Reported(g.request_id);
 return '<tr><td>'+e(c.rank)+'</td><td>'+e(c.priority)+'</td>'+
 '<td><b>'+e(c.product_name)+'</b><small> · '+e(c.analyte)+'</small></td>'+
 '<td>'+e(g.request_id)+'<small> · '+e(g.gate_code.replaceAll("_"," "))+'</small></td>'+
 '<td>'+e(g.owner_role.replaceAll("_"," "))+'</td>'+
 '<td>'+e(g.dependency_codes.length?"Dependent approval gate":"Independent preparation")+'</td>'+
 '<td>'+e(reported?"REFERENCE LOGGED · UNVERIFIED":"NO REFERENCE LOGGED")+'</td>'+
 '<td><button type="button" data-pmsv-b56-select="'+e(g.request_id)+'">Log / review reference</button></td></tr>';
 }).join("");
}
function pmsvB56Detail(){
 if(!pmsvB56Valid())return "";
 const e=pmsvB14Esc,v=pmsvB56Known(pmsvB56Selected);
 if(!v)return "";
 const {case:c,gate:g}=v,d=pmsvB56Entry(g.request_id)||pmsvB56Default(g.request_id);
 const options=(list,selected)=>list.map(x=>'<option value="'+e(x)+'"'+(x===selected?" selected":"")+'>'+e(x.replaceAll("_"," "))+'</option>').join("");
 return '<div class="notice"><b>'+e(g.request_id)+' · '+e(c.product_name)+'</b>. All evidence references entered here are self-reported, unverified and unsent. Document metadata does not validate methods, establish a current CTR limit or approve a lot.</div>'+
 '<p><b>Required evidence:</b> '+e(g.required_evidence)+'</p>'+
 '<p><b>Functional review role:</b> '+e(g.owner_role.replaceAll("_"," "))+'</p>'+
 '<p><b>Gate depends on:</b> '+e(g.dependency_codes.length?g.dependency_codes.join(", "):"None — initial source request may be prepared immediately")+'</p>'+
 '<p><b>FSSAI published source for background only:</b> <a href="'+e(c.source_url)+
 '" target="_blank" rel="noopener noreferrer">Official-hosted reference (not a case approval)</a></p>'+
 '<div class="notice"><b>Reference register is session-only:</b> add document identifiers, non-sensitive custodians and preliminary questions. Never paste the confidential underlying BOM, legal opinion, test report, personal IDs or the document contents. All inputs disappear when the page reloads unless you explicitly export metadata.</div>'+
 '<p><label>Reported document/reference identifier <input type="text" maxlength="160" data-pmsv-b56-field="reference_text" placeholder="e.g., vendor document code" value="'+e(d.reference_text)+'"></label> '+
 '<label>Issuer or custodian (optional) <input type="text" maxlength="120" data-pmsv-b56-field="issuer_or_custodian" value="'+e(d.issuer_or_custodian)+'"></label></p>'+
 '<p><label>Reference type <select data-pmsv-b56-field="document_type">'+options(pmsvB56Data.document_type_keys,d.document_type)+'</select></label> '+
 '<label>Reference date (as reported) <input type="date" data-pmsv-b56-field="reported_date" value="'+e(d.reported_date)+'"></label></p>'+
 '<p><label>Preliminary triage only (no approved/verified status) <select data-pmsv-b56-field="triage_stage">'+
 options(pmsvB56Data.evidence_stage_keys.map(x=>x.key),d.triage_stage)+'</select></label></p>'+
 '<p><label>Follow-up note — no confidential document contents <textarea rows="3" maxlength="350" data-pmsv-b56-field="review_note" placeholder="Missing source, scope, actual chemical or product identity">'+e(d.review_note)+'</textarea></label></p>'+
 '<p><button type="button" data-pmsv-b56-clear-one>Clear this temporary reference</button></p>'+
 '<div class="notice"><b>Decision remains OPEN.</b> No document has been independently authenticated, no legal article/method/scope validated and no lot PASS established by this tool.</div>';
}
function pmsvB56Panel(){
 if(!pmsvB56Valid())return "";
 const roleOptions=[{role:"ALL",label:"All five roles (175)"},
 ...pmsvB55RoleCodes.map(x=>({role:x,label:x.replaceAll("_"," ")+" (35)"}))];
 const e=pmsvB14Esc;
 return '<details id="pmsv-b56-evidence-reference-review" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch56 · Evidence reference triage</b> — 175 historical gates; references are NOT approval</summary>'+
 '<div class="notice"><b>0 approved legal CTR articles · 0 approved laboratory methods · 0 lot passes.</b> Batch56 lets you log only temporary reference metadata for any of the 175 original requests, without changing official-case status. All 35 cases stay open; no file contents are uploaded to this site.</div>'+
 '<p><b>Lab due diligence:</b> FSSAI notifies NABL-accredited laboratories, but verify the selected lab’s exact analyte, product matrix, current accredited scope, method/LOQ, sample chain-of-custody and signed reviewer before any regulatory interpretation. <a href="https://fssai.gov.in/food-testing/food-laboratories" target="_blank" rel="noopener noreferrer">FSSAI notified food laboratories</a>.</p>'+
 '<p><label>Priority <select data-pmsv-b56-priority><option value="ALL">All 35 cases</option><option value="P0">P0 · 13</option><option value="P1">P1 · 22</option></select></label> '+
 '<label>Review role <select data-pmsv-b56-role>'+roleOptions.map(v=>'<option value="'+e(v.role)+'">'+e(v.label)+'</option>').join("")+'</select></label> '+
 '<label>Triage <select data-pmsv-b56-triage><option value="ALL">All 175 requests</option>'+
 '<option value="NOT_REPORTED">No reference logged</option><option value="REFERENCE_REPORTED">Reported reference — unverified</option>'+
 '<option value="PREPARABLE">70 independently preparable requests</option><option value="UPSTREAM_DEPENDENCY">105 dependent approvals</option></select></label> '+
 '<label>Search <input type="search" data-pmsv-b56-search placeholder="Sajji, chocolate, PMSV44-01-01" /></label></p>'+
 '<p><button type="button" data-pmsv-b56-export="GATES">Download 175-gate review worklist CSV</button> '+
 '<button type="button" data-pmsv-b56-export="JSON">Export temporary reference metadata JSON</button> '+
 '<button type="button" data-pmsv-b56-export="CSV">Export reference metadata CSV</button> '+
 '<button type="button" data-pmsv-b56-clear-all>Clear all temporary references</button></p>'+
 '<p><label>Restore previous reference metadata (from explicit local JSON only) <input type="file" accept=".json,application/json" data-pmsv-b56-import-file /></label></p>'+
 '<p data-pmsv-b56-feedback>Only request IDs from this 175-gate register can be imported. Any extraneous approval claims or unknown IDs are rejected before changes.</p>'+
 '<p data-pmsv-b56-count>175 UNSENT gate requests · no reported references in this browser session.</p>'+
 '<div class="tablewrap" style="max-height:540px;overflow:auto"><table><thead><tr>'+
 '<th>Rank</th><th>Priority</th><th>Product</th><th>Original gate</th><th>Role</th><th>Evidence dependency</th><th>Reference triage</th><th>Action</th></tr></thead>'+
 '<tbody data-pmsv-b56-rows>'+pmsvB56RowTable()+'</tbody></table></div>'+
 '<div data-pmsv-b56-detail></div></details>';
}
function pmsvB56Default(id){
 const t=pmsvB56Data.receipt_template;
 return{request_id:id,reference_text:t.reference_text,issuer_or_custodian:t.issuer_or_custodian,
 document_type:t.document_type,reported_date:t.reported_date,triage_stage:t.triage_stage,
 review_note:t.review_note,approval_status:t.approval_status};
}
function pmsvB56ValidEntry(x){
 if(!x||typeof x!=="object"||Array.isArray(x)||
  Object.keys(x).length!==pmsvB56Fields.length||
  pmsvB56Fields.some(k=>!Object.prototype.hasOwnProperty.call(x,k))||
  !pmsvB56Known(x.request_id)||
  !["request_id","reference_text","issuer_or_custodian","document_type","reported_date","triage_stage","review_note","approval_status"].every(k=>typeof x[k]==="string")||
  x.reference_text.length>160||x.issuer_or_custodian.length>120||x.review_note.length>350||
  !pmsvB56Data.document_type_keys.includes(x.document_type)||
  !pmsvB56Data.evidence_stage_keys.some(y=>y.key===x.triage_stage)||
  (x.reported_date!==""&&!/^\d{4}-\d{2}-\d{2}$/.test(x.reported_date))||
  x.approval_status!=="NOT_VERIFIED_DOES_NOT_RELEASE_PRODUCT")return false;
 return true;
}
function pmsvB56Refresh(withDetail){
 if(!pmsvB56Valid()||typeof document==="undefined")return;
 const anchor=document.getElementById("pmsv-b55-unified-closure")||
 document.getElementById("pmsv-b54-p1-complete-review");
 if(!anchor)return;
 let el=document.getElementById("pmsv-b56-evidence-reference-review");
 if(!el){anchor.insertAdjacentHTML("beforebegin",pmsvB56Panel());return;}
 const rows=el.querySelector("[data-pmsv-b56-rows]");
 if(rows)rows.innerHTML=pmsvB56RowTable();
 const count=el.querySelector("[data-pmsv-b56-count]");
 if(count){
  const n=pmsvB56Gates().filter(({gate:g})=>pmsvB56Reported(g.request_id)).length;
  count.textContent=pmsvB56Filtered().length+" requests displayed · "+n+
   " reference metadata record(s) reported, all UNVERIFIED · 0 legal approvals / lot PASS";
 }
 if(withDetail){
  const detail=el.querySelector("[data-pmsv-b56-detail]");
  if(detail)detail.innerHTML=pmsvB56Detail();
 }
}
function pmsvB56ExportObject(){
 if(!pmsvB56Valid())return null;
 const entries=pmsvB56Gates().filter(({gate:g})=>pmsvB56Drafts[g.request_id])
  .map(({gate:g})=>pmsvB56Drafts[g.request_id]);
 return{schema_version:"1.0",kind:"PMSV_B56_SESSION_REFERENCE_METADATA_UNVERIFIED",
  source_digest:pmsvB56Expected,entries,
  approved_legal_articles:0,actual_lot_passes:0};
}
function pmsvB56Import(raw){
 if(!pmsvB56Valid()||typeof raw!=="string"||raw.length>150000)return false;
 try{
  const obj=JSON.parse(raw),head=["schema_version","kind","source_digest","entries","approved_legal_articles","actual_lot_passes"];
  if(!obj||typeof obj!=="object"||Array.isArray(obj)||
   Object.keys(obj).length!==head.length||head.some(k=>!Object.prototype.hasOwnProperty.call(obj,k))||
   obj.schema_version!=="1.0"||obj.kind!=="PMSV_B56_SESSION_REFERENCE_METADATA_UNVERIFIED"||
   obj.source_digest!==pmsvB56Expected||obj.approved_legal_articles!==0||
   obj.actual_lot_passes!==0||!Array.isArray(obj.entries)||obj.entries.length>175)return false;
  const tmp=Object.create(null);
  for(const e of obj.entries){
   if(!pmsvB56ValidEntry(e)||Object.prototype.hasOwnProperty.call(tmp,e.request_id))return false;
   tmp[e.request_id]={...e};
  }
  pmsvB56Drafts=tmp;pmsvB56Refresh(true);return true;
 }catch(_){return false;}
}
function pmsvB56CSV(mode){
 if(!pmsvB56Valid())return "";
 const quote=v=>{let s=String(v??"");if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const cols=["rank","product","priority","analyte","original_gate_id","gate_code","owner_role",
 "dependencies","historical_evidence_request","reported_reference_id","reported_issuer",
 "reference_type","reported_date","preliminary_triage_ONLY","follow_up_note","legal_approval","lot_pass"];
 const rows=pmsvB56Gates().filter(({gate:g})=>mode!=="CSV"||!!pmsvB56Drafts[g.request_id])
  .map(({case:c,gate:g})=>{
   const x=pmsvB56Drafts[g.request_id]||pmsvB56Default(g.request_id);
   return[c.rank,c.product_name,c.priority,c.analyte,g.request_id,g.gate_code,g.owner_role,
    g.dependency_codes.join(" | "),g.required_evidence,
    mode==="GATES"?"":x.reference_text,
    mode==="GATES"?"":x.issuer_or_custodian,
    mode==="GATES"?"":x.document_type,
    mode==="GATES"?"":x.reported_date,
    mode==="GATES"?"NOT_VERIFIED":x.triage_stage,
    mode==="GATES"?"":x.review_note,false,false];
  });
 return[cols.map(quote).join(","),...rows.map(r=>r.map(quote).join(","))].join("\r\n")+"\r\n";
}
function pmsvB56Download(mode){
 if(!pmsvB56Valid())return;
 const content=mode==="JSON"?JSON.stringify(pmsvB56ExportObject(),null,2)+"\n":pmsvB56CSV(mode);
 const type=mode==="JSON"?"application/json;charset=utf-8":"text/csv;charset=utf-8";
 const name=mode==="JSON"?"PMSV-B56-175-GATE-REFERENCE-METADATA-UNVERIFIED.json":
 mode==="GATES"?"PMSV-B56-175-ORIGINAL-EVIDENCE-REQUESTS-BLANK.csv":"PMSV-B56-REPORTED-REFERENCE-METADATA-UNVERIFIED.csv";
 const url=URL.createObjectURL(new Blob([mode==="JSON"?"":"\uFEFF",content],{type}));
 const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);
 a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1100);
}
function pmsvB56Feedback(s){
 const el=document.querySelector("[data-pmsv-b56-feedback]");if(el)el.textContent=s;
}
const pmsvB56PriorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB56PriorLoad();pmsvB56Data=null;
 try{
  const r=await fetch(pmsvB56Path+"?v=20261016-b56",{cache:"reload"});
  if(!r.ok)throw Error("Missing B56");pmsvB56Data=await r.json();
  if(!pmsvB56Valid())throw Error("Batch56 historical data digest/lineage failed");
  pmsvB56Refresh(true);
 }catch(_){pmsvB56Data=null;}
};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{
  const t=ev.target;if(!t)return;
  if(t.matches?.("[data-pmsv-b56-search]")){
   pmsvB56Search=String(t.value||"").slice(0,140);pmsvB56Refresh(false);
  }else if(t.matches?.("[data-pmsv-b56-field]")){
   if(!pmsvB56Known(pmsvB56Selected))return;
   const name=t.getAttribute("data-pmsv-b56-field");
   if(!pmsvB56Fields.includes(name)||name==="request_id"||name==="approval_status")return;
   const draft=pmsvB56Drafts[pmsvB56Selected]||pmsvB56Default(pmsvB56Selected);
   draft[name]=String(t.value||"").slice(0,name==="review_note"?350:name==="reference_text"?160:120);
   if(pmsvB56ValidEntry(draft)){pmsvB56Drafts[pmsvB56Selected]=draft;pmsvB56Refresh(false);}
  }
 });
 document.addEventListener("change",async ev=>{
  const t=ev.target;if(!t)return;
  if(t.matches?.("[data-pmsv-b56-priority]")&&["ALL","P0","P1"].includes(t.value)){
   pmsvB56Priority=t.value;pmsvB56Refresh(false);
  }else if(t.matches?.("[data-pmsv-b56-role]")&&
   (t.value==="ALL"||pmsvB55RoleCodes.includes(t.value))){
   pmsvB56Role=t.value;pmsvB56Refresh(false);
  }else if(t.matches?.("[data-pmsv-b56-triage]")&&
   ["ALL","NOT_REPORTED","REFERENCE_REPORTED","PREPARABLE","UPSTREAM_DEPENDENCY"].includes(t.value)){
   pmsvB56TriageFilter=t.value;pmsvB56Refresh(false);
  }else if(t.matches?.("[data-pmsv-b56-field]")&&
   pmsvB56Known(pmsvB56Selected)){
   const name=t.getAttribute("data-pmsv-b56-field");
   if(!["document_type","reported_date","triage_stage"].includes(name))return;
   const d=pmsvB56Drafts[pmsvB56Selected]||pmsvB56Default(pmsvB56Selected);
   d[name]=String(t.value||"");
   if(pmsvB56ValidEntry(d)){pmsvB56Drafts[pmsvB56Selected]=d;pmsvB56Refresh(false);}
  }else if(t.matches?.("[data-pmsv-b56-import-file]")){
   const file=t.files?.[0];
   if(!file)return;
   if(file.size>150000){pmsvB56Feedback("Rejected: import file exceeds 150 KB. Nothing changed.");t.value="";return;}
   try{
    const raw=await file.text(),ok=pmsvB56Import(raw);
    pmsvB56Feedback(ok?"Imported reference metadata drafts only. ZERO evidence verified or released.":
     "Rejected: unknown gate, modified schema, duplicated ID or unsupported approval claim. No drafts changed.");
   }catch(_){pmsvB56Feedback("Unable to read local JSON. No drafts changed.");}
   t.value="";
  }
 });
 document.addEventListener("click",ev=>{
  const choose=ev.target?.closest?.("[data-pmsv-b56-select]");
  if(choose){pmsvB56Selected=choose.getAttribute("data-pmsv-b56-select");pmsvB56Refresh(true);return;}
  const dl=ev.target?.closest?.("[data-pmsv-b56-export]");
  if(dl){pmsvB56Download(dl.getAttribute("data-pmsv-b56-export"));return;}
  if(ev.target?.closest?.("[data-pmsv-b56-clear-one]")){
   delete pmsvB56Drafts[pmsvB56Selected];pmsvB56Refresh(true);return;
  }
  if(ev.target?.closest?.("[data-pmsv-b56-clear-all]")){
   pmsvB56Drafts=Object.create(null);pmsvB56Refresh(true);pmsvB56Feedback("All temporary reference metadata cleared from this browser session.");
  }
 });
}
