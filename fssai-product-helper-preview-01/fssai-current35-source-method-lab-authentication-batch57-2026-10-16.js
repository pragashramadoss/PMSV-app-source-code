"use strict";
/* Batch57: 1470 documentary source and laboratory review prompts, NOT approved checks.
   Browser memory only; do not enter actual confidential contents or patient/individual data.
   Triaged flags are NEVER evidence authenticity, legal approval or lot PASS. */
var pmsvB57PlusData=null,pmsvB57PlusSelected="",pmsvB57PlusPriority="ALL",pmsvB57PlusGate="ALL",
 pmsvB57PlusReview="ALL",pmsvB57PlusSearch="",pmsvB57PlusDrafts=Object.create(null);
const pmsvB57PlusPath="./data/rules/fssai-current35-source-method-lab-authentication-batch57-2026-10-16.json";
const pmsvB57PlusExpected="baaae4be109a37db";
const pmsvB57PlusStatuses=["NOT_REVIEWED_NO_EVIDENCE","REFERENCE_TO_CHECK_NOT_AUTHENTICATED","GAP_OR_CONFLICT_REQUIRES_FOLLOWUP"];
const pmsvB57PlusExportFields=["check_key","triage_status","follow_up_note","regulatory_approval"];
function pmsvB57PlusValid(){
 if(typeof pmsvB56Valid!=="function"||!pmsvB56Valid()||
  typeof pmsvB14Digest!=="function"||!pmsvB57PlusData||
  pmsvB14Digest(pmsvB57PlusData)!==pmsvB57PlusExpected)return false;
 const d=pmsvB57PlusData,t=d.totals;
 if(d.kind!=="PMSV_BATCH57_ALL35_175_GATE_1470_POINT_SOURCE_LAB_AUTHENTICATION_WORKBENCH"||
  d.as_of!=="2026-10-16"||d.environment!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
  d.imported_batch56_source_digest!=="005621e8f737f08d"||
  d.gate_checkpoint_templates?.length!==5||d.case_dossiers?.length!==35||
  d.source_documents?.length!==8||d.allowed_draft_triage_statuses?.length!==3||
  d.prohibited_conclusions?.length!==7||
  pmsvB57PlusStatuses.some((s,i)=>d.allowed_draft_triage_statuses[i]?.code!==s)||
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
function pmsvB57PlusAllGates(){
 return pmsvB57PlusData?.case_dossiers?.flatMap(c=>c.gates.map(g=>({c,g})))||[];
}
function pmsvB57PlusFindGate(id){return pmsvB57PlusAllGates().find(x=>x.g.request_id===id);}
function pmsvB57PlusCheck(key){
 if(typeof key!=="string")return null;
 const slash=key.indexOf("/"),id=key.slice(0,slash),qid=key.slice(slash+1),v=pmsvB57PlusFindGate(id);
 if(slash<1||!v||!v.g.checkpoint_ids.includes(qid))return null;
 const q=pmsvB57PlusData.gate_checkpoint_templates.find(x=>x.gate_code===v.g.gate_code)?.checkpoints.find(x=>x.id===qid);
 return q?{...v,q,key}:null;
}
function pmsvB57PlusEntry(key){return pmsvB57PlusDrafts[key]||{check_key:key,triage_status:"NOT_REVIEWED_NO_EVIDENCE",follow_up_note:"",regulatory_approval:false};}
function pmsvB57PlusHasDraft(key){const x=pmsvB57PlusDrafts[key];return !!x&&(x.triage_status!=="NOT_REVIEWED_NO_EVIDENCE"||x.follow_up_note!=="");}
function pmsvB57PlusFiltered(){
 if(!pmsvB57PlusValid())return [];
 const q=pmsvB57PlusSearch.toLowerCase().trim();
 return pmsvB57PlusAllGates().filter(({c,g})=>
 (pmsvB57PlusPriority==="ALL"||c.priority===pmsvB57PlusPriority)&&
 (pmsvB57PlusGate==="ALL"||g.gate_code===pmsvB57PlusGate)&&
 (!q||[c.product_name,c.analyte,c.rank,c.catalogue_id,g.request_id,g.gate_code].some(t=>String(t).toLowerCase().includes(q)))&&
 (pmsvB57PlusReview==="ALL"||
  (pmsvB57PlusReview==="NOT_REVIEWED"&&g.checkpoint_ids.every(id=>!pmsvB57PlusHasDraft(g.request_id+"/"+id)))||
  (pmsvB57PlusReview==="DRAFT_ONLY"&&g.checkpoint_ids.some(id=>pmsvB57PlusHasDraft(g.request_id+"/"+id)))));
}
function pmsvB57PlusTable(){
 const e=pmsvB14Esc;
 return pmsvB57PlusFiltered().map(({c,g})=>{
 const num=g.checkpoint_ids.filter(id=>pmsvB57PlusHasDraft(g.request_id+"/"+id)).length;
 return'<tr><td>'+e(c.rank)+'</td><td>'+e(c.priority)+'</td><td><b>'+e(c.product_name)+'</b><small> · '+e(c.analyte)+'</small></td>'+
 '<td>'+e(g.request_id)+'</td><td>'+e(g.gate_code.replaceAll("_"," "))+'</td>'+
 '<td>'+e(num)+' / '+e(g.checkpoint_ids.length)+' triage draft(s) · 0 verified</td>'+
 '<td><button type="button" data-pmsv-b57plus-select="'+e(g.request_id)+'">Inspect checkpoints</button></td></tr>';
 }).join("");
}
function pmsvB57PlusDetail(){
 if(!pmsvB57PlusValid())return "";
 const e=pmsvB14Esc,found=pmsvB57PlusFindGate(pmsvB57PlusSelected);
 if(!found)return "";
 const {c,g}=found,template=pmsvB57PlusData.gate_checkpoint_templates.find(x=>x.gate_code===g.gate_code);
 const rows=template.checkpoints.map((x,i)=>{
  const key=g.request_id+"/"+x.id,entry=pmsvB57PlusEntry(key);
  return'<tr><td>'+e(i+1)+'</td><td><b>'+e(x.id.split("__").at(-1).replaceAll("_"," "))+'</b><small> '+e(x.question)+'</small></td>'+
   '<td><select data-pmsv-b57plus-key="'+e(key)+'" data-pmsv-b57plus-property="triage_status">'+
   pmsvB57PlusStatuses.map(s=>'<option value="'+e(s)+'"'+(entry.triage_status===s?" selected":"")+'>'+e(s.replaceAll("_"," "))+'</option>').join("")+
   '</select></td>'+
   '<td><input type="text" maxlength="160" data-pmsv-b57plus-key="'+e(key)+'" data-pmsv-b57plus-property="follow_up_note" placeholder="Non-sensitive reviewer follow-up" value="'+e(entry.follow_up_note)+'"></td></tr>';
 }).join("");
 return '<div class="notice"><b>'+e(g.request_id)+' · '+e(c.product_name)+'</b>. All checkpoints are preparatory. Triage cannot authenticate a source, approve a legal limit, validate laboratory scope or release a lot.</div>'+
 '<p><b>Legacy original documentary evidence needed:</b> '+e(g.inherited_original_evidence_request)+'</p>'+
 '<p><b>Specific laboratory matrix question:</b> '+e(c.laboratory_scope_question)+'</p>'+
 '<p><b>Exact CTR legal article question:</b> '+e(c.legal_article_question)+'</p>'+
 '<p><b>Owner role (not confirmed person):</b> '+e(g.owner_role)+' · <b>Dependencies:</b> '+e(g.dependencies.join(", ")||"Independent request may be prepared")+'</p>'+
 '<div class="notice">Any status or note below is temporary <b>review planning only</b>. Do not enter confidential BOMs, sensitive individual identifiers, test-report contents or proprietary method validation files. A reported reference is not authenticated. No PASS state is available.</div>'+
 '<div class="tablewrap" style="max-height:450px;overflow:auto"><table><thead><tr><th>#</th><th>Verification question</th><th>Planning triage (not PASS)</th><th>Short follow-up note</th></tr></thead><tbody>'+
 rows+'</tbody></table></div>'+
 '<p><button type="button" data-pmsv-b57plus-clear-gate>Clear only this gate\u2019s temporary triage</button></p>'+
 '<p><b>Applicable source pointers:</b> <a href="https://fssai.gov.in/food-law/notifications?notification=gazette-notification" target="_blank" rel="noopener noreferrer">FSSAI notification index (30 Sep 2026 lab Gazette)</a> · '+
 '<a href="https://nabl-india.org/faq/" target="_blank" rel="noopener noreferrer">NABL scope FAQ</a> · '+
 '<a href="https://nablwp.qci.org.in/laboratorysearchone" target="_blank" rel="noopener noreferrer">NABL laboratory search</a>. Verify exact sources rather than relying on the links alone.</p>';
}
function pmsvB57PlusPanel(){
 if(!pmsvB57PlusValid())return "";
 const e=pmsvB14Esc,options=pmsvB57PlusData.gate_checkpoint_templates;
 return '<details id="pmsv-b57-source-lab-authentication" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch57 · Original-source, lab-scope & signoff checks</b> — 1,470 unverified checkpoints across 175 gates</summary>'+
 '<div class="notice"><b>All 35 CTR cases OPEN.</b> 1,470 source/document/laboratory and lot verification questions; <b>0 actual authentications, CTR approvals, accredited method signoffs or lot passes.</b> These are checklists awaiting independent external evidence, not completed inspections.</div>'+
 '<p><b>Source freshness exception:</b> FSSAI lists a <b>30 September 2026</b> NABL-accredited laboratory Gazette in its notification index. The food laboratories page also references a 7 September laboratory list. Recheck the *named* lab and its current NABL certificate and specific matrix/analyte accreditation scope; neither list by itself validates testing capability.</p>'+
 '<p><label>Priority <select data-pmsv-b57plus-priority><option value="ALL">All priorities (175)</option><option value="P0">P0 (65 gates)</option><option value="P1">P1 (110 gates)</option></select></label> '+
 '<label>Gate focus <select data-pmsv-b57plus-gate><option value="ALL">All 175 evidence gates</option>'+
 options.map(x=>'<option value="'+e(x.gate_code)+'">'+e(x.gate_code.replaceAll("_"," "))+' ('+e(x.checkpoints.length*35)+' checks)</option>').join("")+
 '</select></label> '+
 '<label>Review drafts <select data-pmsv-b57plus-review><option value="ALL">All gates</option><option value="NOT_REVIEWED">No triage drafts</option><option value="DRAFT_ONLY">Has temporary triage drafts</option></select></label> '+
 '<label>Search <input type="search" data-pmsv-b57plus-search placeholder="Cocoa, Sajji, Lead, PMSV44-01-04" /></label></p>'+
 '<p><button type="button" data-pmsv-b57plus-export="BLANK">Download blank 1,470-checkpoint CSV</button> '+
 '<button type="button" data-pmsv-b57plus-export="JSON">Export session triage JSON</button> '+
 '<button type="button" data-pmsv-b57plus-export="CSV">Export reported triage CSV</button> '+
 '<button type="button" data-pmsv-b57plus-clear-all>Clear all temporary triage</button></p>'+
 '<p><label>Restore session triage metadata <input type="file" accept=".json,application/json" data-pmsv-b57plus-import /></label></p>'+
 '<p data-pmsv-b57plus-feedback>Local JSON imports accept only known checkpoints, unverified triage statuses and no legal approval flags. No automatic upload or persistence.</p>'+
 '<p data-pmsv-b57plus-count>175 gates · 1,470 checks · 0 authenticated results</p>'+
 '<div class="tablewrap" style="max-height:500px;overflow:auto"><table><thead><tr><th>#</th><th>Priority</th><th>Product</th><th>Original ID</th><th>Evidence area</th><th>Draft review</th><th>Actions</th></tr></thead>'+
 '<tbody data-pmsv-b57plus-rows>'+pmsvB57PlusTable()+'</tbody></table></div>'+
 '<div data-pmsv-b57plus-detail></div></details>';
}
function pmsvB57PlusRefresh(withDetail){
 if(!pmsvB57PlusValid()||typeof document==="undefined")return;
 const anchor=document.getElementById("pmsv-b56-evidence-reference-review")||document.getElementById("pmsv-b55-unified-closure");
 if(!anchor)return;
 let panel=document.getElementById("pmsv-b57-source-lab-authentication");
 if(!panel){anchor.insertAdjacentHTML("beforebegin",pmsvB57PlusPanel());return;}
 const rows=panel.querySelector("[data-pmsv-b57plus-rows]");if(rows)rows.innerHTML=pmsvB57PlusTable();
 const count=panel.querySelector("[data-pmsv-b57plus-count]");
 if(count)count.textContent=pmsvB57PlusFiltered().length+" gate(s) shown · "+
 Object.keys(pmsvB57PlusDrafts).filter(key=>pmsvB57PlusHasDraft(key)).length+
 " temporary check draft(s) · 0 independently authenticated / PASS";
 if(withDetail){const detail=panel.querySelector("[data-pmsv-b57plus-detail]");if(detail)detail.innerHTML=pmsvB57PlusDetail();}
}
function pmsvB57PlusExportObject(){
 if(!pmsvB57PlusValid())return null;
 const records=Object.keys(pmsvB57PlusDrafts).sort().map(key=>pmsvB57PlusDrafts[key]);
 return{kind:"PMSV_B57_DRAFT_ONLY_SOURCE_LAB_TRIAGE",
 version:"1.0",pinned_source_digest:pmsvB57PlusExpected,
 records,verified_cases:0,legal_approvals:0,validated_lab_methods:0,lot_passes:0};
}
function pmsvB57PlusImport(s){
 if(!pmsvB57PlusValid()||typeof s!=="string"||s.length>850000)return false;
 try{
  const o=JSON.parse(s),keys=["kind","version","pinned_source_digest","records",
   "verified_cases","legal_approvals","validated_lab_methods","lot_passes"];
  if(!o||typeof o!=="object"||Array.isArray(o)||
   Object.keys(o).length!==keys.length||keys.some(k=>!Object.prototype.hasOwnProperty.call(o,k))||
   o.kind!=="PMSV_B57_DRAFT_ONLY_SOURCE_LAB_TRIAGE"||o.version!=="1.0"||
   o.pinned_source_digest!==pmsvB57PlusExpected||!Array.isArray(o.records)||o.records.length>1470||
   o.verified_cases!==0||o.legal_approvals!==0||
   o.validated_lab_methods!==0||o.lot_passes!==0)return false;
  const drafts=Object.create(null);
  for(const x of o.records){
   if(!x||typeof x!=="object"||Array.isArray(x)||
    Object.keys(x).length!==pmsvB57PlusExportFields.length||
    pmsvB57PlusExportFields.some(k=>!Object.prototype.hasOwnProperty.call(x,k))||
    !pmsvB57PlusCheck(x.check_key)||Object.prototype.hasOwnProperty.call(drafts,x.check_key)||
    !pmsvB57PlusStatuses.includes(x.triage_status)||
    typeof x.follow_up_note!=="string"||x.follow_up_note.length>160||
    x.regulatory_approval!==false)return false;
   drafts[x.check_key]={...x};
  }
  pmsvB57PlusDrafts=drafts;pmsvB57PlusRefresh(true);return true;
 }catch(_){return false;}
}
function pmsvB57PlusCSV(mode){
 if(!pmsvB57PlusValid())return "";
 const quote=v=>{let s=String(v??"");if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const cols=["rank","priority","product","analyte","source_gate_id","gate_code",
  "owner_role_only","checkpoint_id","question","triage_planning_not_verified",
  "follow_up_note","evidence_authenticity_verified","legal_article_approved","lab_scope_approved","lot_pass"];
 const rows=[];
 for(const {c,g} of pmsvB57PlusAllGates()){
  const defs=pmsvB57PlusData.gate_checkpoint_templates.find(x=>x.gate_code===g.gate_code).checkpoints;
  for(const q of defs){
   const key=g.request_id+"/"+q.id,draft=pmsvB57PlusDrafts[key];
   if(mode==="CSV"&&!draft)continue;
   rows.push([c.rank,c.priority,c.product_name,c.analyte,g.request_id,g.gate_code,
   g.owner_role,q.id,q.question,
   mode==="BLANK"?"NOT_REVIEWED_NO_EVIDENCE":(draft?.triage_status||"NOT_REVIEWED_NO_EVIDENCE"),
   mode==="BLANK"?"":(draft?.follow_up_note||""),false,false,false,false]);
  }
 }
 return[cols.map(quote).join(","),...rows.map(row=>row.map(quote).join(","))].join("\r\n")+"\r\n";
}
function pmsvB57PlusDownload(mode){
 if(!pmsvB57PlusValid())return;
 const content=mode==="JSON"?JSON.stringify(pmsvB57PlusExportObject(),null,2)+"\n":pmsvB57PlusCSV(mode);
 const name=mode==="JSON"?"PMSV-B57-SESSION-UNVERIFIED-CHECK-TRIAGE.json":
  mode==="BLANK"?"PMSV-B57-1470-SOURCE-LAB-VERIFICATION-PROMPTS-BLANK.csv":
   "PMSV-B57-REPORTED-CHECK-TRIAGE-NOT-APPROVED.csv";
 const url=URL.createObjectURL(new Blob([mode==="JSON"?"":"\uFEFF",content],{
  type:mode==="JSON"?"application/json;charset=utf-8":"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);
 a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1100);
}
function pmsvB57PlusFeedback(msg){
 const el=document.querySelector("[data-pmsv-b57plus-feedback]");if(el)el.textContent=msg;
}
const pmsvB57PlusPriorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB57PlusPriorLoad();pmsvB57PlusData=null;
 try{
  const r=await fetch(pmsvB57PlusPath+"?v=20261016-b57",{cache:"reload"});
  if(!r.ok)throw Error("Batch57 data not found");
  pmsvB57PlusData=await r.json();
  if(!pmsvB57PlusValid())throw Error("B57 source digest/ancestor gate integrity mismatch");
  pmsvB57PlusRefresh(true);
 }catch(_){pmsvB57PlusData=null;}
};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{
  const t=ev.target;
  if(t?.matches?.("[data-pmsv-b57plus-search]")){
   pmsvB57PlusSearch=String(t.value||"").slice(0,140);pmsvB57PlusRefresh(false);
  }else if(t?.matches?.('[data-pmsv-b57plus-property="follow_up_note"]')){
   const key=t.getAttribute("data-pmsv-b57plus-key");
   if(!pmsvB57PlusCheck(key))return;
   const draft=pmsvB57PlusDrafts[key]||{...pmsvB57PlusEntry(key)};
   draft.follow_up_note=String(t.value||"").slice(0,160);pmsvB57PlusDrafts[key]=draft;
   pmsvB57PlusRefresh(false);
  }
 });
 document.addEventListener("change",async ev=>{
  const t=ev.target;if(!t)return;
  if(t.matches?.("[data-pmsv-b57plus-priority]")&&["ALL","P0","P1"].includes(t.value)){
   pmsvB57PlusPriority=t.value;pmsvB57PlusRefresh(false);
  }else if(t.matches?.("[data-pmsv-b57plus-gate]")&&
    (t.value==="ALL"||pmsvB57PlusData?.gate_checkpoint_templates.some(x=>x.gate_code===t.value))){
   pmsvB57PlusGate=t.value;pmsvB57PlusRefresh(false);
  }else if(t.matches?.("[data-pmsv-b57plus-review]")&&
   ["ALL","NOT_REVIEWED","DRAFT_ONLY"].includes(t.value)){
   pmsvB57PlusReview=t.value;pmsvB57PlusRefresh(false);
  }else if(t.matches?.('[data-pmsv-b57plus-property="triage_status"]')){
   const key=t.getAttribute("data-pmsv-b57plus-key");
   if(!pmsvB57PlusCheck(key)||!pmsvB57PlusStatuses.includes(t.value))return;
   const draft=pmsvB57PlusDrafts[key]||{...pmsvB57PlusEntry(key)};
   draft.triage_status=t.value;pmsvB57PlusDrafts[key]=draft;pmsvB57PlusRefresh(false);
  }else if(t.matches?.("[data-pmsv-b57plus-import]")){
   const f=t.files?.[0];if(!f)return;
   if(f.size>850000){pmsvB57PlusFeedback("Rejected: oversized source-review draft file. No change.");t.value="";return;}
   try{
    const yes=pmsvB57PlusImport(await f.text());
    pmsvB57PlusFeedback(yes?"Restored local review triage drafts only — zero legal/lot approvals.":
      "Rejected: invalid source ID, positive approval flag or unsupported schema. No changes.");
   }catch(_){pmsvB57PlusFeedback("Could not read the selected JSON file; no changes.");}
   t.value="";
  }
 });
 document.addEventListener("click",ev=>{
  const btn=ev.target?.closest?.("[data-pmsv-b57plus-select]");
  if(btn){pmsvB57PlusSelected=btn.getAttribute("data-pmsv-b57plus-select");pmsvB57PlusRefresh(true);return;}
  const exp=ev.target?.closest?.("[data-pmsv-b57plus-export]");
  if(exp){pmsvB57PlusDownload(exp.getAttribute("data-pmsv-b57plus-export"));return;}
  if(ev.target?.closest?.("[data-pmsv-b57plus-clear-gate]")){
   const v=pmsvB57PlusFindGate(pmsvB57PlusSelected);
   if(v)for(const id of v.g.checkpoint_ids)delete pmsvB57PlusDrafts[v.g.request_id+"/"+id];
   pmsvB57PlusRefresh(true);return;
  }
  if(ev.target?.closest?.("[data-pmsv-b57plus-clear-all]")){
   pmsvB57PlusDrafts=Object.create(null);pmsvB57PlusRefresh(true);
   pmsvB57PlusFeedback("All temporary source and lab check drafts cleared.");
  }
 });
}
