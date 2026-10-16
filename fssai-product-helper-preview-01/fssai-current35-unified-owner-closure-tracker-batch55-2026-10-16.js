"use strict";
/* Batch55: unified 35-case/175-gate review. Named coordinator and date are optional
   browser-memory DRAFTS; no storage, posting, evidence approval or lot release. */
var pmsvB55Data=null,pmsvB55Selected="",pmsvB55Filter="ALL",pmsvB55Query="",pmsvB55Role="ALL";
var pmsvB55Drafts=Object.create(null);
const pmsvB55Path="./data/rules/fssai-current35-unified-owner-closure-tracker-batch55-2026-10-16.json";
const pmsvB55Expected="783ed3e1c3ec37c2";
const pmsvB55RoleCodes=["FSSAI_QA_DIVISION_AND_LAB_DIRECTOR","MANUFACTURER_OR_SUPPLIER_QA",
 "REGULATORY_AFFAIRS_LEGAL","LABORATORY_TECHNICAL_MANAGER","SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER"];
function pmsvB55Valid(){
 if(typeof pmsvB54Valid!=="function"||!pmsvB54Valid()||
    typeof pmsvB14Digest!=="function"||!pmsvB55Data||
    pmsvB14Digest(pmsvB55Data)!==pmsvB55Expected)return false;
 const d=pmsvB55Data,n=d.totals;
 if(d.kind!=="PMSV_BATCH55_INTEGRATED_35_CASE_175_GATE_OWNER_CLOSURE_WORKBENCH"||
 d.as_of!=="2026-10-16"||d.environment!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
 n.catalogue!==533||n.conditional_first_source_matches!==498||
 n.ctr_cases_open!==35||n.cases_P0!==13||n.cases_P1!==22||
 n.named_published_identity_references!==28||n.individual_material_identity_unknown!==7||
 n.original_gate_ids!==175||n.independent_request_preparation_gates!==70||
 n.dependent_approval_gates!==105||n.gate_codes!==5||n.requests_per_case!==5||
 n.prior_lab_advisory_questions_retained!==280||n.prior_future_law_prompts_retained!==210||
 n.signed_legal_approvals!==0||n.received_documents!==0||
 n.assigned_named_people_in_repository!==0||n.user_due_dates_recorded_in_repository!==0||
 n.accredited_methods_approved!==0||n.actual_lot_passes!==0||n.wordpress_changed!==false||
 d.cases?.length!==35||d.workflow?.rules?.length!==5||
 d.official_source_pointers?.length!==5||d.evidence_policy?.actual_documentary_requests_sent!==0||
 Object.values(d.no_pass_assertions||{}).some(x=>x!==true))return false;
 const b52=new Map(pmsvB52Data.cases.map(x=>[x.catalogue_id,x]));
 const b53=new Map(pmsvB53Data.dockets.map(x=>[x.catalogue_id,x]));
 const b54=new Map(pmsvB54Data.p1_dossiers.map(x=>[x.catalogue_id,x]));
 let nP0=0,nP1=0,ready=0,dependent=0,unknown=0,sourced=0;
 const cases=new Set(),ids=new Set(),roles=new Map();
 for(const c of d.cases){
  const old=b52.get(c.catalogue_id),prior=c.priority==="P0"?b53.get(c.catalogue_id):b54.get(c.catalogue_id);
  if(!old||!prior||cases.has(c.catalogue_id)||
   old.rank!==c.rank||old.product_name!==c.product_name||
   old.analyte!==c.analyte||!old.priority.startsWith(c.priority)||
   old.product_standard_identity_source_known!==c.published_identity_source_known||
   old.seven_material_intake!==c.individual_material_identity_missing||
   old.upstream_legal_gate!==c.original_legal_gate||
   !c.evidence_source?.url?.startsWith("https://")||
   !c.plan?.product_identity_to_request||!c.plan?.legal_article_to_review||
   !c.plan?.laboratory_scope_to_confirm||
   c.historical_five_gates?.length!==5||c.open_proof_count!==5||
   c.planned_person_owner!==null||c.planned_due_date!==null||
   c.requests_sent!==0||c.evidence_documents_received!==0||
   c.signed_current_ctr_limit!==false||c.accredited_matrix_method_validated!==false||
   c.representative_lot_pass!==false||c.regulatory_status!=="OPEN_NOT_LEGALLY_ADJUDICATED")
   return false;
  cases.add(c.catalogue_id);
  if(c.priority==="P0"){nP0++;if(!b53.has(c.catalogue_id))return false;}
  else {nP1++;if(!b54.has(c.catalogue_id))return false;}
  if(c.individual_material_identity_missing)unknown++;
  if(c.published_identity_source_known)sourced++;
  for(let i=0;i<5;i++){
   const g=c.historical_five_gates[i],before=old.gates[i],
    def=d.workflow.rules.find(x=>x.gate_code===g.gate_code);
   if(!before||!def||g.request_id!==before.request_id||
     g.gate_code!==before.gate_code||g.owner_role!==before.owner_role||
     !g.evidence_requested||ids.has(g.request_id)||
     g.actual_assignee!=="UNASSIGNED"||g.target_date!==null||
     g.initial_outreach_state!=="NOT_SENT"||g.document_state!=="NOT_RECEIVED"||
     g.signed_regulatory_approval!==false||g.received_document_reference!==null||
     g.reviewer_signoff!==false||
     JSON.stringify(g.must_verify_first)!==JSON.stringify(def.dependencies))return false;
   if(g.must_verify_first.length===0){
    if(g.request_preparation_lane!=="CAN_PREPARE_REQUEST_NOW")return false;ready++;
   }else{
    if(g.request_preparation_lane!=="UPSTREAM_EVIDENCE_REQUIRED_FOR_APPROVAL")return false;dependent++;
   }
   ids.add(g.request_id);roles.set(g.owner_role,(roles.get(g.owner_role)||0)+1);
  }
 }
 return nP0===13&&nP1===22&&ready===70&&dependent===105&&unknown===7&&
  sourced===28&&cases.size===35&&ids.size===175&&roles.size===5&&
  pmsvB55RoleCodes.every(x=>roles.get(x)===35);
}
function pmsvB55Draft(c){
 return pmsvB55Drafts[c.catalogue_id]||{owner:"",due:""};
}
function pmsvB55Rows(){
 if(!pmsvB55Valid())return [];
 const q=pmsvB55Query.trim().toLowerCase();
 return pmsvB55Data.cases.filter(c=>
 (pmsvB55Filter==="ALL"||pmsvB55Filter===c.priority||
  (pmsvB55Filter==="MATERIAL"&&c.individual_material_identity_missing)||
  (pmsvB55Filter==="NAMED"&&c.published_identity_source_known)||
  (pmsvB55Filter==="DRAFT"&&!!(pmsvB55Draft(c).owner||pmsvB55Draft(c).due))||
  (pmsvB55Filter==="NO_OWNER"&&!pmsvB55Draft(c).owner))&&
 (!q||[c.rank,c.product_name,c.analyte,c.analyte_family,c.catalogue_id,
  c.plan.product_identity_to_request,c.plan.legal_article_to_review].some(x=>String(x).toLowerCase().includes(q))));
}
function pmsvB55Table(){
 const e=pmsvB14Esc;
 return pmsvB55Rows().map(c=>{
 const draft=pmsvB55Draft(c);
 return '<tr><td>'+e(c.rank)+'</td><td><b>'+e(c.product_name)+'</b></td>'+
 '<td>'+e(c.priority)+'</td><td>'+e(c.analyte)+'</td>'+
 '<td>'+e(c.individual_material_identity_missing?"Named material missing":"Commercial identity not verified")+'</td>'+
 '<td>'+e(draft.owner||"Not assigned")+
 (draft.due?' <small> · target '+e(draft.due)+'</small>':"")+'</td>'+
 '<td>0/5 cleared</td><td><button type="button" data-pmsv-b55-case="'+
 e(c.catalogue_id)+'">Review / assign draft</button></td></tr>'}).join("");
}
function pmsvB55Detail(){
 if(!pmsvB55Valid())return "";
 const e=pmsvB14Esc,c=pmsvB55Data.cases.find(x=>x.catalogue_id===pmsvB55Selected);
 if(!c)return "";
 const draft=pmsvB55Draft(c);
 return '<div class="notice"><b>'+e(c.product_name)+'</b> · '+e(c.analyte)+
 ' · '+e(c.priority)+'. All 5 documentary and regulatory gates OPEN. Assigning a coordinator or date does NOT constitute submission, receipt or compliance.</div>'+
 '<p><b>1. Commercial product / manufacturer evidence:</b> '+e(c.plan.product_identity_to_request)+'</p>'+
 '<p><b>2. Regulatory article to adjudicate:</b> '+e(c.plan.legal_article_to_review)+'</p>'+
 '<p><b>3. Laboratory matrix/method evidence:</b> '+e(c.plan.laboratory_scope_to_confirm)+'</p>'+
 '<p><b>Official review source:</b> <a href="'+e(c.evidence_source.url)+
 '" target="_blank" rel="noopener noreferrer">Open previous FSSAI source (not a case approval)</a></p>'+
 '<div class="notice"><b>Optional planning draft only — stays in this browser tab until reload.</b> No server storage and no change to legal review status. Session CSV can contain the owner text below, so check before sharing.</div>'+
 '<p><label>Proposed coordination contact (unverified) <input type="text" maxlength="120" data-pmsv-b55-owner placeholder="Optional — person/team name" value="'+e(draft.owner)+'"></label> '+
 '<label>Proposed follow-up date (not scheduled) <input type="date" data-pmsv-b55-date value="'+e(draft.due)+'"></label> '+
 '<button type="button" data-pmsv-b55-clear-case>Clear draft for this case</button></p>'+
 '<div class="tablewrap"><table><thead><tr><th>Gate & request ID</th><th>Owner/authority ROLE only</th><th>Evidence required</th><th>Dependency / evidence status</th></tr></thead><tbody>'+
 c.historical_five_gates.map(g=>'<tr><td><b>'+e(g.gate_name)+'</b><small> '+e(g.request_id)+'</small></td>'+
 '<td>'+e(g.owner_role.replaceAll("_"," "))+'</td><td>'+e(g.evidence_requested)+'</td>'+
 '<td>'+e(g.must_verify_first.length?
  "DEPENDENT: "+g.must_verify_first.join(", "):"Independent: request can be prepared now")+
 '<small> · NOT SENT / NO EVIDENCE RECEIVED</small></td></tr>').join("")+'</tbody></table></div>'+
 '<p><b>Legal hold:</b> '+e(c.original_legal_gate)+'. No signed current CTR article, accredited matrix method or representative lot PASS.</p>';
}
function pmsvB55Panel(){
 if(!pmsvB55Valid())return "";
 return '<details id="pmsv-b55-unified-closure" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch55 · Unified 35-case FSSAI closure register</b> — 175 original evidence gates and role-based preparation</summary>'+
 '<div class="notice"><b>35/35 cases OPEN — no release.</b> P0 13, P1 22. All 175 original proof requests UNSENT; no real QA contacts assigned, due dates, received documents, signed legal articles, accredited test methods or lot passes. 70 independent gate requests can be prepared in parallel; 105 approval gates are dependent on prior evidence.</div>'+
 '<p><b>Five functional source/approval roles, each with 35 requests:</b> method authority; manufacturer/supplier QA; regulatory affairs/legal; lab technical manager; site QA/independent regulatory reviewer. These are responsible role categories, NOT identified people or confirmed external agreements.</p>'+
 '<p><label>Owner-role worklist <select data-pmsv-b55-role>'+
 '<option value="ALL">All five roles — 175 gates</option>'+
 pmsvB55RoleCodes.map(role=>'<option value="'+role+'">'+pmsvB14Esc(role.replaceAll("_"," "))+' — 35 gates</option>').join("")+
 '</select></label> <button type="button" data-pmsv-b55-export="GATES">Download blank gate request CSV</button> '+
 '<button type="button" data-pmsv-b55-export="SESSION">Export 35-case planner CSV (contains optional typed drafts)</button> '+
 '<button type="button" data-pmsv-b55-clear-all>Clear all temporary planner drafts</button></p>'+
 '<p><b>Case worklist:</b> <label>Search <input type="search" data-pmsv-b55-search placeholder="Cocoa, water, enzyme, lead" /></label> '+
 '<label>Focus <select data-pmsv-b55-filter><option value="ALL">All 35</option>'+
 '<option value="P0">P0 high priority (13)</option><option value="P1">P1 (22)</option>'+
 '<option value="MATERIAL">Seven individual material identity gaps</option>'+
 '<option value="NAMED">28 published product identity references</option>'+
 '<option value="DRAFT">With temporary coordinator/date draft</option>'+
 '<option value="NO_OWNER">Without coordinator draft</option></select></label></p>'+
 '<p data-pmsv-b55-count>35 cases · 175 UNSENT proof requests · 0 approved</p>'+
 '<div class="tablewrap" style="max-height:500px;overflow:auto"><table><thead><tr>'+
 '<th>#</th><th>Commodity</th><th>Urgency</th><th>Analyte</th><th>First blocker</th>'+
 '<th>Planning-only contact</th><th>Review</th><th>Next</th></tr></thead>'+
 '<tbody data-pmsv-b55-rows>'+pmsvB55Table()+'</tbody></table></div>'+
 '<div data-pmsv-b55-detail></div></details>';
}
function pmsvB55Refresh(withDetail){
 if(!pmsvB55Valid()||typeof document==="undefined")return;
 const anchor=document.getElementById("pmsv-b54-p1-complete-review")||
 document.getElementById("pmsv-b53-p0-matrix-review");
 if(!anchor)return;
 let panel=document.getElementById("pmsv-b55-unified-closure");
 if(!panel){anchor.insertAdjacentHTML("beforebegin",pmsvB55Panel());return;}
 const rows=panel.querySelector("[data-pmsv-b55-rows]");
 if(rows)rows.innerHTML=pmsvB55Table();
 const count=panel.querySelector("[data-pmsv-b55-count]");
 if(count)count.textContent=pmsvB55Rows().length+" cases displayed · 0 signed CTR approvals or lot PASS";
 if(withDetail){
  const detail=panel.querySelector("[data-pmsv-b55-detail]");
  if(detail)detail.innerHTML=pmsvB55Detail();
 }
}
function pmsvB55EscCSV(v){
 let x=String(v??"");
 if(/^\s*[=+@-]/.test(x))x="'"+x;
 return '"'+x.replaceAll('"','""')+'"';
}
function pmsvB55CSV(mode){
 if(!pmsvB55Valid())return "";
 const esc=pmsvB55EscCSV;
 if(mode==="SESSION"){
  const head=["rank","catalogue_id","product","analyte","priority","proposed_coordinator_unverified","proposed_target_date_not_scheduled",
   "evidence_gate_ids","evidence_received","ctr_legal_limit_approved","lot_pass"];
  const rows=pmsvB55Data.cases.map(c=>[c.rank,c.catalogue_id,c.product_name,c.analyte,c.priority,
   pmsvB55Draft(c).owner,pmsvB55Draft(c).due,
   c.historical_five_gates.map(g=>g.request_id).join(" | "),0,false,false]);
  return [head.map(esc).join(","),...rows.map(r=>r.map(esc).join(","))].join("\r\n")+"\r\n";
 }
 const head=["rank","catalogue_id","product","analyte","priority","legal_gate",
  "request_id","functional_role_not_person","request_preparation_lane","upstream_dependencies",
  "evidence_requested","proposed_assignee","proposed_due_date","request_sent","document_received",
  "signed_legal_ctr_approval","actual_lot_pass"];
 const rows=pmsvB55Data.cases.flatMap(c=>c.historical_five_gates.filter(g=>
  pmsvB55Role==="ALL"||g.owner_role===pmsvB55Role).map(g=>[
  c.rank,c.catalogue_id,c.product_name,c.analyte,c.priority,c.original_legal_gate,
  g.request_id,g.owner_role,g.request_preparation_lane,g.must_verify_first.join(" | "),
  g.evidence_requested,"","",false,false,false,false]));
 return [head.map(esc).join(","),...rows.map(r=>r.map(esc).join(","))].join("\r\n")+"\r\n";
}
function pmsvB55Download(mode){
 if(!pmsvB55Valid())return;
 const contents=pmsvB55CSV(mode);
 const filename=mode==="SESSION"?"PMSV-B55-35-case-COORDINATOR-DRAFT-REVIEW-BEFORE-SHARING.csv":
 (pmsvB55Role==="ALL"?"PMSV-B55-175-UNSENT-EVIDENCE-GATES-BLANK.csv":
 "PMSV-B55-35-UNSENT-ROLE-GATES-BLANK.csv");
 const url=URL.createObjectURL(new Blob(["\uFEFF",contents],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download=filename;
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1100);
}
const pmsvB55EarlierLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB55EarlierLoad();pmsvB55Data=null;
 try{
  const r=await fetch(pmsvB55Path+"?v=20261016-b55",{cache:"reload"});
  if(!r.ok)throw Error("B55 source missing");
  pmsvB55Data=await r.json();
  if(!pmsvB55Valid())throw Error("B55 ancestry or immutable gate failure");
  pmsvB55Refresh(true);
 }catch(_){pmsvB55Data=null;}
};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{
  const t=ev.target;
  if(t?.matches?.("[data-pmsv-b55-search]")){
   pmsvB55Query=String(t.value||"").slice(0,140);pmsvB55Refresh(false);
  }
  if(t?.matches?.("[data-pmsv-b55-owner]")){
   const c=pmsvB55Data?.cases.find(c=>c.catalogue_id===pmsvB55Selected);
   if(!c)return;
   if(!pmsvB55Drafts[c.catalogue_id])pmsvB55Drafts[c.catalogue_id]={owner:"",due:""};
   pmsvB55Drafts[c.catalogue_id].owner=String(t.value||"").slice(0,120);
   pmsvB55Refresh(false);
  }
 });
 document.addEventListener("change",ev=>{
  const t=ev.target;
  if(t?.matches?.("[data-pmsv-b55-filter]")&&
    ["ALL","P0","P1","MATERIAL","NAMED","DRAFT","NO_OWNER"].includes(t.value)){
   pmsvB55Filter=t.value;pmsvB55Refresh(false);
  }
  if(t?.matches?.("[data-pmsv-b55-role]")&&
    (t.value==="ALL"||pmsvB55RoleCodes.includes(t.value)))pmsvB55Role=t.value;
  if(t?.matches?.("[data-pmsv-b55-date]")){
   const c=pmsvB55Data?.cases.find(c=>c.catalogue_id===pmsvB55Selected);
   if(!c)return;
   if(!pmsvB55Drafts[c.catalogue_id])pmsvB55Drafts[c.catalogue_id]={owner:"",due:""};
   pmsvB55Drafts[c.catalogue_id].due=/^\d{4}-\d{2}-\d{2}$/.test(t.value)?t.value:"";
   pmsvB55Refresh(false);
  }
 });
 document.addEventListener("click",ev=>{
  const c=ev.target?.closest?.("[data-pmsv-b55-case]");
  if(c){pmsvB55Selected=c.getAttribute("data-pmsv-b55-case");pmsvB55Refresh(true);return;}
  const dl=ev.target?.closest?.("[data-pmsv-b55-export]");
  if(dl){pmsvB55Download(dl.getAttribute("data-pmsv-b55-export"));return;}
  if(ev.target?.closest?.("[data-pmsv-b55-clear-case]")){
   if(pmsvB55Selected)delete pmsvB55Drafts[pmsvB55Selected];
   pmsvB55Refresh(true);return;
  }
  if(ev.target?.closest?.("[data-pmsv-b55-clear-all]")){
   pmsvB55Drafts=Object.create(null);pmsvB55Refresh(true);
  }
 });
}
