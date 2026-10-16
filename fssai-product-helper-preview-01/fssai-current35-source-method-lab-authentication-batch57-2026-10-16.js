"use strict";
/* Batch57: 1470 documentary source and laboratory review prompts, NOT approved checks.
   Browser memory only; do not enter actual confidential contents or patient/individual data.
   Triaged flags are NEVER evidence authenticity, legal approval or lot PASS. */
var pmsvB57Data=null,pmsvB57Selected="",pmsvB57Priority="ALL",pmsvB57Gate="ALL",
 pmsvB57Review="ALL",pmsvB57Search="",pmsvB57Drafts=Object.create(null);
const pmsvB57Path="./data/rules/fssai-current35-source-method-lab-authentication-batch57-2026-10-16.json";
const pmsvB57Expected="baaae4be109a37db";
const pmsvB57Statuses=["NOT_REVIEWED_NO_EVIDENCE","REFERENCE_TO_CHECK_NOT_AUTHENTICATED","GAP_OR_CONFLICT_REQUIRES_FOLLOWUP"];
const pmsvB57ExportFields=["check_key","triage_status","follow_up_note","regulatory_approval"];
function pmsvB57Valid(){
 if(typeof pmsvB56Valid!=="function"||!pmsvB56Valid()||
  typeof pmsvB14Digest!=="function"||!pmsvB57Data||
  pmsvB14Digest(pmsvB57Data)!==pmsvB57Expected)return false;
 const d=pmsvB57Data,t=d.totals;
 if(d.kind!=="PMSV_BATCH57_ALL35_175_GATE_1470_POINT_SOURCE_LAB_AUTHENTICATION_WORKBENCH"||
  d.as_of!=="2026-10-16"||d.environment!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
  d.imported_batch56_source_digest!=="005621e8f737f08d"||
  d.gate_checkpoint_templates?.length!==5||d.case_dossiers?.length!==35||
  d.source_documents?.length!==8||d.allowed_draft_triage_statuses?.length!==3||
  d.prohibited_conclusions?.length!==7||
  pmsvB57Statuses.some((s,i)=>d.allowed_draft_triage_statuses[i]?.code!==s)||
  t.catalogue!==533||t.conditional_source_matches!==498||t.open_ctr_legal_cases!==35||
  t.p0!==13||t.p1!==22||t.gate_count!==175||t.gate_templates!==5||
  t.per_case_checkpoint_count!==42||t.authentication_points!==1470||
  t.method_source_checks!==280||t.commercial_identity_checks!==280||
  t.ctr_legal_checks!==280||t.lab_scope_checks!==350||t.actual_lot_checks!==280||
  t.latest_notification_recheck_required!==35||t.actual_named_labs_selected!==0||
  t.original_evidence_requests_sent!==0||t.original_documents_received!==0||
  t.source_documents_authenticity_verified_for_specific_case!==0||
  t.current_ctr_articles_approved!==0||t.accredited_matrix_methods_signed!==0||
  t.actual_tested_lot_passes!==0||t.wordpress_changed!==false||
  !Object.values(d.assertions||{}).every(x=>x===true)||
  !Object.values(d.policy||{}).every(x=>x===true))return false;
 const originals=new Map(pmsvB56Data.cases.map(x=>[x.catalogue_id,x]));
 const defs=new Map(d.gate_checkpoint_templates.map(x=>[x.gate_code,x.checkpoints]));
 if(defs.size!==5)return false;
 const checkIDs=new Set();let checkCount=0,gateCount=0,p0=0,p1=0,lab=0;
 for(const [code,questions] of defs){
  if(!Array.isArray(questions)||questions.length!==(code==="LAB_MATRIX_METHOD_AND_LOQ"?10:8))return false;
  for(const question of questions){
   if(question.id.indexOf(code+"__")!==0||
    !question.question||question.default_verdict!=="NOT_REVIEWED_NO_EVIDENCE"||
    question.independence_required!==true||!question.reference_type)return false;
  }
 }
 for(const c of d.case_dossiers){
  const before=originals.get(c.catalogue_id);
  if(!before||c.rank!==before.rank||c.priority!==before.priority||
   c.product_name!==before.product_name||c.analyte!==before.analyte||
   c.legal_gate!==before.original_legal_gate||c.source_url!==before.source_url||
   !c.laboratory_scope_question||!c.legal_article_question||
   c.actual_market_identity_approved!==false||c.method_adoption_verified!==false||
   c.lab_scope_verified!==false||c.signed_case_specific_ctr_article!==false||
   c.representative_tested_lot_pass!==false||c.gates?.length!==5)return false;
  if(c.priority==="P0")p0++;else p1++;
  for(let i=0;i<5;i++){
   const g=c.gates[i],prior=before.gates[i],template=defs.get(g.gate_code);
   if(!prior||!template||g.request_id!==prior.request_id||
    g.gate_code!==prior.gate_code||g.owner_role!==prior.owner_role||
    g.inherited_original_evidence_request!==prior.required_evidence||
    JSON.stringify(g.dependencies)!==JSON.stringify(prior.dependency_codes)||
    JSON.stringify(g.checkpoint_ids)!==JSON.stringify(template.map(x=>x.id))||
    g.source_version_approved!==false||g.product_or_sample_approved!==false||
    g.actual_document_received!==false||g.independent_reviewer_signed!==false)return false;
   if(g.gate_code==="LAB_MATRIX_METHOD_AND_LOQ")lab++;
   gateCount++;
   for(const id of g.checkpoint_ids){
    const key=g.request_id+"/"+id;
    if(checkIDs.has(key))return false;
    checkIDs.add(key);checkCount++;
   }
  }
 }
 return checkCount===1470&&gateCount===175&&p0===13&&p1===22&&lab===35&&
  d.source_documents.some(s=>s.id==="FSSAI_GAZETTE_NOTIFICATION_INDEX"&&s.notice_date==="2026-09-30")&&
  d.source_documents.some(s=>s.id==="NABL_SCOPE_FAQ");
}
function pmsvB57AllGates(){
 return pmsvB57Data?.case_dossiers?.flatMap(c=>c.gates.map(g=>({c,g})))||[];
}
function pmsvB57FindGate(id){return pmsvB57AllGates().find(x=>x.g.request_id===id);}
function pmsvB57Check(key){
 if(typeof key!=="string")return null;
 const slash=key.indexOf("/"),id=key.slice(0,slash),qid=key.slice(slash+1),v=pmsvB57FindGate(id);
 if(slash<1||!v||!v.g.checkpoint_ids.includes(qid))return null;
 const q=pmsvB57Data.gate_checkpoint_templates.find(x=>x.gate_code===v.g.gate_code)?.checkpoints.find(x=>x.id===qid);
 return q?{...v,q,key}:null;
}
function pmsvB57Entry(key){return pmsvB57Drafts[key]||{check_key:key,triage_status:"NOT_REVIEWED_NO_EVIDENCE",follow_up_note:"",regulatory_approval:false};}
function pmsvB57HasDraft(key){const x=pmsvB57Drafts[key];return !!x&&(x.triage_status!=="NOT_REVIEWED_NO_EVIDENCE"||x.follow_up_note!=="");}
function pmsvB57Filtered(){
 if(!pmsvB57Valid())return [];
 const q=pmsvB57Search.toLowerCase().trim();
 return pmsvB57AllGates().filter(({c,g})=>
 (pmsvB57Priority==="ALL"||c.priority===pmsvB57Priority)&&
 (pmsvB57Gate==="ALL"||g.gate_code===pmsvB57Gate)&&
 (!q||[c.product_name,c.analyte,c.rank,c.catalogue_id,g.request_id,g.gate_code].some(t=>String(t).toLowerCase().includes(q)))&&
 (pmsvB57Review==="ALL"||
  (pmsvB57Review==="NOT_REVIEWED"&&g.checkpoint_ids.every(id=>!pmsvB57HasDraft(g.request_id+"/"+id)))||
  (pmsvB57Review==="DRAFT_ONLY"&&g.checkpoint_ids.some(id=>pmsvB57HasDraft(g.request_id+"/"+id)))));
}
function pmsvB57Table(){
 const e=pmsvB14Esc;
 return pmsvB57Filtered().map(({c,g})=>{
 const num=g.checkpoint_ids.filter(id=>pmsvB57HasDraft(g.request_id+"/"+id)).length;
 return'<tr><td>'+e(c.rank)+'</td><td>'+e(c.priority)+'</td><td><b>'+e(c.product_name)+'</b><small> · '+e(c.analyte)+'</small></td>'+
 '<td>'+e(g.request_id)+'</td><td>'+e(g.gate_code.replaceAll("_"," "))+'</td>'+
 '<td>'+e(num)+' / '+e(g.checkpoint_ids.length)+' triage draft(s) · 0 verified</td>'+
 '<td><button type="button" data-pmsv-b57-select="'+e(g.request_id)+'">Inspect checkpoints</button></td></tr>';
 }).join("");
}
function pmsvB57Detail(){
 if(!pmsvB57Valid())return "";
 const e=pmsvB14Esc,found=pmsvB57FindGate(pmsvB57Selected);
 if(!found)return "";
 const {c,g}=found,template=pmsvB57Data.gate_checkpoint_templates.find(x=>x.gate_code===g.gate_code);
 const rows=template.checkpoints.map((x,i)=>{
  const key=g.request_id+"/"+x.id,entry=pmsvB57Entry(key);
  return'<tr><td>'+e(i+1)+'</td><td><b>'+e(x.id.split("__").at(-1).replaceAll("_"," "))+'</b><small> '+e(x.question)+'</small></td>'+
   '<td><select data-pmsv-b57-key="'+e(key)+'" data-pmsv-b57-property="triage_status">'+
   pmsvB57Statuses.map(s=>'<option value="'+e(s)+'"'+(entry.triage_status===s?" selected":"")+'>'+e(s.replaceAll("_"," "))+'</option>').join("")+
   '</select></td>'+
   '<td><input type="text" maxlength="160" data-pmsv-b57-key="'+e(key)+'" data-pmsv-b57-property="follow_up_note" placeholder="Non-sensitive reviewer follow-up" value="'+e(entry.follow_up_note)+'"></td></tr>';
 }).join("");
 return '<div class="notice"><b>'+e(g.request_id)+' · '+e(c.product_name)+'</b>. All checkpoints are preparatory. Triage cannot authenticate a source, approve a legal limit, validate laboratory scope or release a lot.</div>'+
 '<p><b>Legacy original documentary evidence needed:</b> '+e(g.inherited_original_evidence_request)+'</p>'+
 '<p><b>Specific laboratory matrix question:</b> '+e(c.laboratory_scope_question)+'</p>'+
 '<p><b>Exact CTR legal article question:</b> '+e(c.legal_article_question)+'</p>'+
 '<p><b>Owner role (not confirmed person):</b> '+e(g.owner_role)+' · <b>Dependencies:</b> '+e(g.dependencies.join(", ")||"Independent request may be prepared")+'</p>'+
 '<div class="notice">Any status or note below is temporary <b>review planning only</b>. Do not enter confidential BOMs, sensitive individual identifiers, test-report contents or proprietary method validation files. A reported reference is not authenticated. No PASS state is available.</div>'+
 '<div class="tablewrap" style="max-height:450px;overflow:auto"><table><thead><tr><th>#</th><th>Verification question</th><th>Planning triage (not PASS)</th><th>Short follow-up note</th></tr></thead><tbody>'+
 rows+'</tbody></table></div>'+
 '<p><button type="button" data-pmsv-b57-clear-gate>Clear only this gate\u2019s temporary triage</button></p>'+
 '<p><b>Applicable source pointers:</b> <a href="https://fssai.gov.in/food-law/notifications?notification=gazette-notification" target="_blank" rel="noopener noreferrer">FSSAI notification index (30 Sep 2026 lab Gazette)</a> · '+
 '<a href="https://nabl-india.org/faq/" target="_blank" rel="noopener noreferrer">NABL scope FAQ</a> · '+
 '<a href="https://nablwp.qci.org.in/laboratorysearchone" target="_blank" rel="noopener noreferrer">NABL laboratory search</a>. Verify exact sources rather than relying on the links alone.</p>';
}
function pmsvB57Panel(){
 if(!pmsvB57Valid())return "";
 const e=pmsvB14Esc,options=pmsvB57Data.gate_checkpoint_templates;
 return '<details id="pmsv-b57-source-lab-authentication" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch57 · Original-source, lab-scope & signoff checks</b> — 1,470 unverified checkpoints across 175 gates</summary>'+
 '<div class="notice"><b>All 35 CTR cases OPEN.</b> 1,470 source/document/laboratory and lot verification questions; <b>0 actual authentications, CTR approvals, accredited method signoffs or lot passes.</b> These are checklists awaiting independent external evidence, not completed inspections.</div>'+
 '<p><b>Source freshness exception:</b> FSSAI lists a <b>30 September 2026</b> NABL-accredited laboratory Gazette in its notification index. The food laboratories page also references a 7 September laboratory list. Recheck the *named* lab and its current NABL certificate and specific matrix/analyte accreditation scope; neither list by itself validates testing capability.</p>'+
 '<p><label>Priority <select data-pmsv-b57-priority><option value="ALL">All priorities (175)</option><option value="P0">P0 (65 gates)</option><option value="P1">P1 (110 gates)</option></select></label> '+
 '<label>Gate focus <select data-pmsv-b57-gate><option value="ALL">All 175 evidence gates</option>'+
 options.map(x=>'<option value="'+e(x.gate_code)+'">'+e(x.gate_code.replaceAll("_"," "))+' ('+e(x.checkpoints.length*35)+' checks)</option>').join("")+
 '</select></label> '+
 '<label>Review drafts <select data-pmsv-b57-review><option value="ALL">All gates</option><option value="NOT_REVIEWED">No triage drafts</option><option value="DRAFT_ONLY">Has temporary triage drafts</option></select></label> '+
 '<label>Search <input type="search" data-pmsv-b57-search placeholder="Cocoa, Sajji, Lead, PMSV44-01-04" /></label></p>'+
 '<p><button type="button" data-pmsv-b57-export="BLANK">Download blank 1,470-checkpoint CSV</button> '+
 '<button type="button" data-pmsv-b57-export="JSON">Export session triage JSON</button> '+
 '<button type="button" data-pmsv-b57-export="CSV">Export reported triage CSV</button> '+
 '<button type="button" data-pmsv-b57-clear-all>Clear all temporary triage</button></p>'+
 '<p><label>Restore session triage metadata <input type="file" accept=".json,application/json" data-pmsv-b57-import /></label></p>'+
 '<p data-pmsv-b57-feedback>Local JSON imports accept only known checkpoints, unverified triage statuses and no legal approval flags. No automatic upload or persistence.</p>'+
 '<p data-pmsv-b57-count>175 gates · 1,470 checks · 0 authenticated results</p>'+
 '<div class="tablewrap" style="max-height:500px;overflow:auto"><table><thead><tr><th>#</th><th>Priority</th><th>Product</th><th>Original ID</th><th>Evidence area</th><th>Draft review</th><th>Actions</th></tr></thead>'+
 '<tbody data-pmsv-b57-rows>'+pmsvB57Table()+'</tbody></table></div>'+
 '<div data-pmsv-b57-detail></div></details>';
}
function pmsvB57Refresh(withDetail){
 if(!pmsvB57Valid()||typeof document==="undefined")return;
 const anchor=document.getElementById("pmsv-b56-evidence-reference-review")||document.getElementById("pmsv-b55-unified-closure");
 if(!anchor)return;
 let panel=document.getElementById("pmsv-b57-source-lab-authentication");
 if(!panel){anchor.insertAdjacentHTML("beforebegin",pmsvB57Panel());return;}
 const rows=panel.querySelector("[data-pmsv-b57-rows]");if(rows)rows.innerHTML=pmsvB57Table();
 const count=panel.querySelector("[data-pmsv-b57-count]");
 if(count)count.textContent=pmsvB57Filtered().length+" gate(s) shown · "+
 Object.keys(pmsvB57Drafts).filter(key=>pmsvB57HasDraft(key)).length+
 " temporary check draft(s) · 0 independently authenticated / PASS";
 if(withDetail){const detail=panel.querySelector("[data-pmsv-b57-detail]");if(detail)detail.innerHTML=pmsvB57Detail();}
}
function pmsvB57ExportObject(){
 if(!pmsvB57Valid())return null;
 const records=Object.keys(pmsvB57Drafts).sort().map(key=>pmsvB57Drafts[key]);
 return{kind:"PMSV_B57_DRAFT_ONLY_SOURCE_LAB_TRIAGE",
 version:"1.0",pinned_source_digest:pmsvB57Expected,
 records,verified_cases:0,legal_approvals:0,validated_lab_methods:0,lot_passes:0};
}
function pmsvB57Import(s){
 if(!pmsvB57Valid()||typeof s!=="string"||s.length>850000)return false;
 try{
  const o=JSON.parse(s),keys=["kind","version","pinned_source_digest","records",
   "verified_cases","legal_approvals","validated_lab_methods","lot_passes"];
  if(!o||typeof o!=="object"||Array.isArray(o)||
   Object.keys(o).length!==keys.length||keys.some(k=>!Object.prototype.hasOwnProperty.call(o,k))||
   o.kind!=="PMSV_B57_DRAFT_ONLY_SOURCE_LAB_TRIAGE"||o.version!=="1.0"||
   o.pinned_source_digest!==pmsvB57Expected||!Array.isArray(o.records)||o.records.length>1470||
   o.verified_cases!==0||o.legal_approvals!==0||
   o.validated_lab_methods!==0||o.lot_passes!==0)return false;
  const drafts=Object.create(null);
  for(const x of o.records){
   if(!x||typeof x!=="object"||Array.isArray(x)||
    Object.keys(x).length!==pmsvB57ExportFields.length||
    pmsvB57ExportFields.some(k=>!Object.prototype.hasOwnProperty.call(x,k))||
    !pmsvB57Check(x.check_key)||Object.prototype.hasOwnProperty.call(drafts,x.check_key)||
    !pmsvB57Statuses.includes(x.triage_status)||
    typeof x.follow_up_note!=="string"||x.follow_up_note.length>160||
    x.regulatory_approval!==false)return false;
   drafts[x.check_key]={...x};
  }
  pmsvB57Drafts=drafts;pmsvB57Refresh(true);return true;
 }catch(_){return false;}
}
function pmsvB57CSV(mode){
 if(!pmsvB57Valid())return "";
 const quote=v=>{let s=String(v??"");if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const cols=["rank","priority","product","analyte","source_gate_id","gate_code",
  "owner_role_only","checkpoint_id","question","triage_planning_not_verified",
  "follow_up_note","evidence_authenticity_verified","legal_article_approved","lab_scope_approved","lot_pass"];
 const rows=[];
 for(const {c,g} of pmsvB57AllGates()){
  const defs=pmsvB57Data.gate_checkpoint_templates.find(x=>x.gate_code===g.gate_code).checkpoints;
  for(const q of defs){
   const key=g.request_id+"/"+q.id,draft=pmsvB57Drafts[key];
   if(mode==="CSV"&&!draft)continue;
   rows.push([c.rank,c.priority,c.product_name,c.analyte,g.request_id,g.gate_code,
   g.owner_role,q.id,q.question,
   mode==="BLANK"?"NOT_REVIEWED_NO_EVIDENCE":(draft?.triage_status||"NOT_REVIEWED_NO_EVIDENCE"),
   mode==="BLANK"?"":(draft?.follow_up_note||""),false,false,false,false]);
  }
 }
 return[cols.map(quote).join(","),...rows.map(row=>row.map(quote).join(","))].join("\r\n")+"\r\n";
}
function pmsvB57Download(mode){
 if(!pmsvB57Valid())return;
 const content=mode==="JSON"?JSON.stringify(pmsvB57ExportObject(),null,2)+"\n":pmsvB57CSV(mode);
 const name=mode==="JSON"?"PMSV-B57-SESSION-UNVERIFIED-CHECK-TRIAGE.json":
  mode==="BLANK"?"PMSV-B57-1470-SOURCE-LAB-VERIFICATION-PROMPTS-BLANK.csv":
   "PMSV-B57-REPORTED-CHECK-TRIAGE-NOT-APPROVED.csv";
 const url=URL.createObjectURL(new Blob([mode==="JSON"?"":"\uFEFF",content],{
  type:mode==="JSON"?"application/json;charset=utf-8":"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);
 a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1100);
}
function pmsvB57Feedback(msg){
 const el=document.querySelector("[data-pmsv-b57-feedback]");if(el)el.textContent=msg;
}
const pmsvB57PriorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB57PriorLoad();pmsvB57Data=null;
 try{
  const r=await fetch(pmsvB57Path+"?v=20261016-b57",{cache:"reload"});
  if(!r.ok)throw Error("Batch57 data not found");
  pmsvB57Data=await r.json();
  if(!pmsvB57Valid())throw Error("B57 source digest/ancestor gate integrity mismatch");
  pmsvB57Refresh(true);
 }catch(_){pmsvB57Data=null;}
};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{
  const t=ev.target;
  if(t?.matches?.("[data-pmsv-b57-search]")){
   pmsvB57Search=String(t.value||"").slice(0,140);pmsvB57Refresh(false);
  }else if(t?.matches?.('[data-pmsv-b57-property="follow_up_note"]')){
   const key=t.getAttribute("data-pmsv-b57-key");
   if(!pmsvB57Check(key))return;
   const draft=pmsvB57Drafts[key]||{...pmsvB57Entry(key)};
   draft.follow_up_note=String(t.value||"").slice(0,160);pmsvB57Drafts[key]=draft;
   pmsvB57Refresh(false);
  }
 });
 document.addEventListener("change",async ev=>{
  const t=ev.target;if(!t)return;
  if(t.matches?.("[data-pmsv-b57-priority]")&&["ALL","P0","P1"].includes(t.value)){
   pmsvB57Priority=t.value;pmsvB57Refresh(false);
  }else if(t.matches?.("[data-pmsv-b57-gate]")&&
    (t.value==="ALL"||pmsvB57Data?.gate_checkpoint_templates.some(x=>x.gate_code===t.value))){
   pmsvB57Gate=t.value;pmsvB57Refresh(false);
  }else if(t.matches?.("[data-pmsv-b57-review]")&&
   ["ALL","NOT_REVIEWED","DRAFT_ONLY"].includes(t.value)){
   pmsvB57Review=t.value;pmsvB57Refresh(false);
  }else if(t.matches?.('[data-pmsv-b57-property="triage_status"]')){
   const key=t.getAttribute("data-pmsv-b57-key");
   if(!pmsvB57Check(key)||!pmsvB57Statuses.includes(t.value))return;
   const draft=pmsvB57Drafts[key]||{...pmsvB57Entry(key)};
   draft.triage_status=t.value;pmsvB57Drafts[key]=draft;pmsvB57Refresh(false);
  }else if(t.matches?.("[data-pmsv-b57-import]")){
   const f=t.files?.[0];if(!f)return;
   if(f.size>850000){pmsvB57Feedback("Rejected: oversized source-review draft file. No change.");t.value="";return;}
   try{
    const yes=pmsvB57Import(await f.text());
    pmsvB57Feedback(yes?"Restored local review triage drafts only — zero legal/lot approvals.":
      "Rejected: invalid source ID, positive approval flag or unsupported schema. No changes.");
   }catch(_){pmsvB57Feedback("Could not read the selected JSON file; no changes.");}
   t.value="";
  }
 });
 document.addEventListener("click",ev=>{
  const btn=ev.target?.closest?.("[data-pmsv-b57-select]");
  if(btn){pmsvB57Selected=btn.getAttribute("data-pmsv-b57-select");pmsvB57Refresh(true);return;}
  const exp=ev.target?.closest?.("[data-pmsv-b57-export]");
  if(exp){pmsvB57Download(exp.getAttribute("data-pmsv-b57-export"));return;}
  if(ev.target?.closest?.("[data-pmsv-b57-clear-gate]")){
   const v=pmsvB57FindGate(pmsvB57Selected);
   if(v)for(const id of v.g.checkpoint_ids)delete pmsvB57Drafts[v.g.request_id+"/"+id];
   pmsvB57Refresh(true);return;
  }
  if(ev.target?.closest?.("[data-pmsv-b57-clear-all]")){
   pmsvB57Drafts=Object.create(null);pmsvB57Refresh(true);
   pmsvB57Feedback("All temporary source and lab check drafts cleared.");
  }
 });
}
