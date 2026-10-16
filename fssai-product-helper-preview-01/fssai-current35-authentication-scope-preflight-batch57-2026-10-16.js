"use strict";
/* B57: 1,295 unverified evidence requirements covering all 35 × five historic gates.
   This is a preparatory workbench, not laboratory accreditation, legal sign-off or lot release.
   Session drafts are private in memory; no automatic network send or browser persistence. */
var pmsvB57Data=null,pmsvB57Case="FIRST",pmsvB57Gate="ALL",pmsvB57Priority="ALL",pmsvB57Search="";
var pmsvB57Selected="",pmsvB57Drafts=Object.create(null);
var pmsvB57Path="./data/rules/fssai-current35-authentication-scope-preflight-batch57-2026-10-16.json";
var pmsvB57Expected="9f64e82f4bb7e85a";
var pmsvB57Stages=["UNASSESSED","REFERENCE_REPORTED_UNVERIFIED","SOURCE_OR_SCOPE_GAP_IDENTIFIED","NOT_APPLICABLE_REQUIRES_SIGNED_REASON"];
function pmsvB57Valid(){
 if(typeof pmsvB56Valid!=="function"||!pmsvB56Valid()||typeof pmsvB14Digest!=="function"||
 !pmsvB57Data||pmsvB14Digest(pmsvB57Data)!==pmsvB57Expected)return false;
 const d=pmsvB57Data,t=d.baseline_totals;
 if(d.kind!=="PMSV_BATCH57_ALL35_FIVE_GATE_1295_SOURCE_AUTHENTICITY_LAB_SCOPE_PREFLIGHT"||
 d.as_of!=="2026-10-16"||d.environment!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
 d.inherited_batch56_digest!=="005621e8f737f08d"||
 t.catalogue!==533||t.conditional_source_matches!==498||t.open_ctr_cases!==35||
 t.p0!==13||t.p1!==22||t.published_named_identity_references!==28||
 t.unidentified_individual_materials!==7||t.original_five_gate_requests!==175||
 t.preparatory_source_and_identity_gates!==70||t.dependent_gates!==105||
 t.additional_preflight_check_items!==1295||t.each_case_preflight_check_items!==37||
 t.each_case_lab_scope_checks!==8||t.each_case_lot_adjudication_checks!==8||
 t.actual_received_documents!==0||t.authenticated_preflight_documents!==0||
 t.signed_current_ctr_values!==0||t.accredited_selected_lab_scope_approvals!==0||
 t.representative_coa_results_pass!==0||t.regulatory_cases_released!==0||
 t.wordpress_changed!==false||d.definitions?.length!==5||
 d.source_refs?.length!==6||d.cases?.length!==35||
 JSON.stringify(d.draft_user_triage_stages)!==JSON.stringify(pmsvB57Stages)||
 !d.release_control?.no_approved_stage_available||
 Object.values(d.results||{}).some(x=>x!==true))return false;
 const prior=new Map(pmsvB56Data.cases.map(x=>[x.catalogue_id,x]));
 const reqIds=new Set(),checks=new Set(),codes=new Map();
 let p0=0,p1=0,items=0,lab=0,lot=0;
 for(const c of d.cases){
  const old=prior.get(c.catalogue_id);
  if(!old||c.catalogue_id!==old.catalogue_id||c.rank!==old.rank||
   c.product_name!==old.product_name||c.priority!==old.priority||
   c.analyte!==old.analyte||c.ctr_legal_gate!==old.original_legal_gate||
   c.source_url!==old.source_url||c.preflight_count!==37||
   c.lab_check_count!==8||c.lot_check_count!==8||
   c.laboratory_selected!==false||c.nabl_scope_authenticated!==false||
   c.current_ctr_article_and_value_signed!==false||
   c.actual_product_identity_signed!==false||c.representative_lot_coa_authenticated!==false||
   c.independent_decision_signed!==false||c.case_approved!==false||
   c.gates?.length!==5)return false;
  if(c.priority==="P0")p0++;else p1++;
  let local=0;
  for(let gi=0;gi<5;gi++){
   const g=c.gates[gi],og=old.gates[gi],definition=d.definitions[gi];
   if(!g||!og||!definition||reqIds.has(g.request_id)||
     g.request_id!==og.request_id||g.gate_code!==og.gate_code||
     g.gate_code!==definition.gate_code||g.role!==og.owner_role||
     g.old_documentary_requirement!==og.required_evidence||
     JSON.stringify(g.dependency_codes)!==JSON.stringify(og.dependency_codes)||
     g.old_document_state!=="NOT_RECEIVED"||g.signed_review_state!=="NOT_SIGNED"||
     g.analysis_pass_state!=="NO_LOT_PASS"||
     g.preflight_checks?.length!==definition.number_of_checks_per_case)return false;
   reqIds.add(g.request_id);
   for(let j=0;j<g.preflight_checks.length;j++){
    const p=g.preflight_checks[j];
    if(!p||checks.has(p.check_id)||
     p.check_id!=="PMSV57-"+String(c.rank).padStart(2,"0")+"-"+String(gi+1).padStart(2,"0")+"-"+String(j+1).padStart(2,"0")||
     p.checklist_code!==definition.check_codes[j]||
     !p.checkpoint||!p.what_to_request||
     p.stage!=="NOT_REQUESTED_OR_CHECKED"||
     p.authenticated!==false||p.independent_reviewer_signature!==false||
     p.legal_case_approved!==false||p.lot_pass!==false)return false;
    checks.add(p.check_id);items++;local++;
    codes.set(g.gate_code,(codes.get(g.gate_code)||0)+1);
    if(gi===3)lab++;if(gi===4)lot++;
   }
  }
  if(local!==37)return false;
 }
 if(reqIds.size!==175||checks.size!==1295||p0!==13||p1!==22||
  items!==1295||lab!==280||lot!==280||codes.size!==5)return false;
 return Object.entries(d.preflight_counts_by_gate||{}).every(([k,v])=>codes.get(k)===v)&&
 Object.values(d.preflight_counts_by_gate).reduce((a,v)=>a+v,0)===1295;
}
function pmsvB57All(){
 return pmsvB57Data?.cases?.flatMap(c=>c.gates.flatMap(g=>
  g.preflight_checks.map(p=>({c,g,p}))))||[];
}
function pmsvB57Index(id){return pmsvB57All().find(x=>x.p.check_id===id);}
function pmsvB57Draft(id){
 return pmsvB57Drafts[id]||{check_id:id,stage:"UNASSESSED",note:"",evidence_reference:""};
}
function pmsvB57Filtered(){
 if(!pmsvB57Valid())return [];
 const q=pmsvB57Search.trim().toLowerCase();
 const first=pmsvB57Data.cases[0]?.catalogue_id;
 return pmsvB57All().filter(({c,g,p})=>
 (pmsvB57Case==="ALL"||c.catalogue_id===(pmsvB57Case==="FIRST"?first:pmsvB57Case))&&
 (pmsvB57Priority==="ALL"||c.priority===pmsvB57Priority)&&
 (pmsvB57Gate==="ALL"||g.gate_code===pmsvB57Gate)&&
 (!q||[c.product_name,c.analyte,c.rank,p.checklist_code,p.check_id,p.checkpoint,g.request_id].some(
  v=>String(v).toLowerCase().includes(q))));
}
function pmsvB57Rows(){
 const e=pmsvB14Esc;
 return pmsvB57Filtered().map(({c,g,p})=>{
 const x=pmsvB57Draft(p.check_id);
 return '<tr><td>'+e(c.priority)+' #'+e(c.rank)+'</td><td>'+e(c.product_name)+'</td>'+
 '<td>'+e(g.gate_code.replaceAll("_"," "))+'<small> · '+e(g.request_id)+'</small></td>'+
 '<td><b>'+e(p.checklist_code)+'</b> '+e(p.checkpoint)+'</td>'+
 '<td>'+e(x.stage.replaceAll("_"," "))+'</td>'+
 '<td><button type="button" data-pmsv-b57-select="'+e(p.check_id)+'">Review check</button></td></tr>';
 }).join("");
}
function pmsvB57Detail(){
 const e=pmsvB14Esc,v=pmsvB57Index(pmsvB57Selected);
 if(!v)return "";
 const {c,g,p}=v,x=pmsvB57Draft(p.check_id);
 return '<div class="notice"><b>'+e(p.check_id)+'</b> · '+e(c.product_name)+' · '+e(c.analyte)+
 '. This is an evidence preflight item. Draft triage does not establish authentication, statutory applicability, accreditation or lot PASS.</div>'+
 '<p><b>Checkpoint:</b> '+e(p.checkpoint)+'</p>'+
 '<p><b>Evidence to request:</b> '+e(p.what_to_request)+'</p>'+
 '<p><b>Original request:</b> '+e(g.request_id)+' · '+e(g.old_documentary_requirement)+'</p>'+
 '<p><b>Responsible function:</b> '+e(g.role.replaceAll("_"," "))+'</p>'+
 '<p><b>Preceding legal/technical gates:</b> '+e(g.dependency_codes.join(", ")||"None for initial evidence preparation")+'</p>'+
 '<p><b>Product-specific lab scope concern:</b> '+e(c.case_specific_lab_validation)+'</p>'+
 '<p><label>Draft triage (not approval) <select data-pmsv-b57-field="stage">'+
 pmsvB57Stages.map(s=>'<option value="'+e(s)+'"'+(x.stage===s?" selected":"")+'>'+e(s.replaceAll("_"," "))+'</option>').join("")+
 '</select></label></p>'+
 '<p><label>Non-sensitive evidence reference <input type="text" maxlength="120" data-pmsv-b57-field="evidence_reference" value="'+e(x.evidence_reference)+'" placeholder="Only document ID, not underlying content" /></label></p>'+
 '<p><label>Follow-up note <textarea rows="3" maxlength="240" data-pmsv-b57-field="note">'+e(x.note)+'</textarea></label></p>'+
 '<p><button type="button" data-pmsv-b57-clear-one>Clear this draft</button></p>'+
 '<div class="notice"><b>All 35 cases remain OPEN.</b> No evidence source, selected laboratory, legal CTR article, matrix scope or lot result has been independently authenticated. Never paste confidential formulations or actual CoAs here.</div>';
}
function pmsvB57Panel(){
 if(!pmsvB57Valid())return "";
 const e=pmsvB14Esc;
 const opts=[{value:"FIRST",label:"First priority case (37 checks)"},
 {value:"ALL",label:"All 35 cases (1,295 checks)"},
 ...pmsvB57Data.cases.map(c=>({value:c.catalogue_id,label:c.priority+" #"+c.rank+" · "+c.product_name}))];
 const definitions=pmsvB57Data.definitions;
 return '<details id="pmsv-b57-source-scope-preflight" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch57 · 1,295 source-authenticity, lab-scope and lot signoff checks</b> — 35 unresolved cases</summary>'+
 '<div class="notice"><b>Preflight requirements, NOT verified outcomes.</b> 35 product cases × 37 documentary checks = 1,295 unsatisfied requirements. 175 original evidence gates unchanged. 0 laboratory selected, 0 lab scope authenticated, 0 legal maximum signed, 0 actual lot PASS.</div>'+
 '<p><b>Source safeguards:</b> verify full FSSAI/Gazette document provenance, current official effective dates, distinct laboratory FSSAI notification and NABL accreditation, and exact analyte + matrix + LOQ. <a href="https://fssai.gov.in/food-testing/food-laboratories" target="_blank" rel="noopener noreferrer">FSSAI notified laboratories</a> · <a href="https://www.fssai.gov.in/food-testing/manuals-methods-analysis" target="_blank" rel="noopener noreferrer">Official methods index</a>.</p>'+
 '<p><label>Case <select data-pmsv-b57-case>'+opts.map(o=>'<option value="'+e(o.value)+'">'+e(o.label)+'</option>').join("")+'</select></label> '+
 '<label>Priority <select data-pmsv-b57-priority><option value="ALL">Both</option><option value="P0">P0</option><option value="P1">P1</option></select></label> '+
 '<label>Evidence gate <select data-pmsv-b57-gate><option value="ALL">All five (37 checks/case)</option>'+
 definitions.map(x=>'<option value="'+e(x.gate_code)+'">'+e(x.gate_code.replaceAll("_"," "))+
 ' · '+e(x.number_of_checks_per_case)+'/case</option>').join("")+'</select></label> '+
 '<label>Find checkpoint <input type="search" data-pmsv-b57-search placeholder="LOQ, effective, cocoa, scope" /></label></p>'+
 '<p><button type="button" data-pmsv-b57-download="ALL">Export all 1,295 blank verification requests CSV</button> '+
 '<button type="button" data-pmsv-b57-download="SESSION">Export temporary review notes CSV</button> '+
 '<button type="button" data-pmsv-b57-download="JSON">Save temporary draft metadata JSON</button> '+
 '<button type="button" data-pmsv-b57-clear-all>Clear all drafts</button></p>'+
 '<p><label>Import prior temporary review metadata JSON locally <input type="file" accept=".json,application/json" data-pmsv-b57-import /></label></p>'+
 '<p data-pmsv-b57-feedback>Imported metadata cannot contain approvals, unknown check IDs or extra fields. Nothing is sent or persisted remotely.</p>'+
 '<p data-pmsv-b57-count>37 checkpoints shown · 1,295 total · no verified evidence</p>'+
 '<div class="tablewrap" style="max-height:480px;overflow:auto"><table><thead><tr>'+
 '<th>Priority</th><th>Commodity</th><th>Original gate</th><th>Verification checkpoint</th><th>Draft disposition</th><th>Action</th></tr></thead>'+
 '<tbody data-pmsv-b57-rows>'+pmsvB57Rows()+'</tbody></table></div>'+
 '<div data-pmsv-b57-detail></div></details>';
}
function pmsvB57Refresh(detail){
 if(!pmsvB57Valid()||typeof document==="undefined")return;
 const anchor=document.getElementById("pmsv-b56-evidence-reference-review")||
 document.getElementById("pmsv-b55-unified-closure");
 if(!anchor)return;
 let panel=document.getElementById("pmsv-b57-source-scope-preflight");
 if(!panel){anchor.insertAdjacentHTML("beforebegin",pmsvB57Panel());return;}
 const rows=panel.querySelector("[data-pmsv-b57-rows]");if(rows)rows.innerHTML=pmsvB57Rows();
 const count=panel.querySelector("[data-pmsv-b57-count]");
 if(count)count.textContent=pmsvB57Filtered().length+" checkpoints shown · "+Object.keys(pmsvB57Drafts).length+
  " local unverified notes · 1,295 source requirements / 0 verified or approved";
 if(detail){
  const el=panel.querySelector("[data-pmsv-b57-detail]");if(el)el.innerHTML=pmsvB57Detail();
 }
}
function pmsvB57ValidDraft(x){
 if(!x||typeof x!=="object"||Array.isArray(x)||
  Object.keys(x).length!==4||
  ["check_id","stage","note","evidence_reference"].some(k=>!Object.prototype.hasOwnProperty.call(x,k)||typeof x[k]!=="string")||
  !pmsvB57Index(x.check_id)||!pmsvB57Stages.includes(x.stage)||
  x.note.length>240||x.evidence_reference.length>120)return false;
 return true;
}
function pmsvB57Export(){
 if(!pmsvB57Valid())return null;
 const entries=pmsvB57All().filter(({p})=>pmsvB57Drafts[p.check_id])
  .map(({p})=>({...pmsvB57Drafts[p.check_id]}));
 return {schema_version:"1.0",kind:"PMSV_BATCH57_UNVERIFIED_PREFLIGHT_DRAFTS",
  source_digest:pmsvB57Expected,entries,authenticated_documents:0,legal_article_approvals:0,
  accredited_lab_method_approvals:0,lot_passes:0};
}
function pmsvB57Import(s){
 if(!pmsvB57Valid()||typeof s!=="string"||s.length>750000)return false;
 try{
  const v=JSON.parse(s),head=["schema_version","kind","source_digest","entries","authenticated_documents",
   "legal_article_approvals","accredited_lab_method_approvals","lot_passes"];
  if(!v||typeof v!=="object"||Array.isArray(v)||
   Object.keys(v).length!==head.length||head.some(k=>!Object.prototype.hasOwnProperty.call(v,k))||
   v.schema_version!=="1.0"||v.kind!=="PMSV_BATCH57_UNVERIFIED_PREFLIGHT_DRAFTS"||
   v.source_digest!==pmsvB57Expected||
   v.authenticated_documents!==0||v.legal_article_approvals!==0||
   v.accredited_lab_method_approvals!==0||v.lot_passes!==0||
   !Array.isArray(v.entries)||v.entries.length>1295)return false;
  const temp=Object.create(null);
  for(const x of v.entries){
   if(!pmsvB57ValidDraft(x)||Object.prototype.hasOwnProperty.call(temp,x.check_id))return false;
   temp[x.check_id]={...x};
  }
  pmsvB57Drafts=temp;pmsvB57Refresh(true);return true;
 }catch(_){return false;}
}
function pmsvB57CSV(mode){
 if(!pmsvB57Valid())return "";
 const esc=v=>{let s=String(v??"");if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const cols=["rank","product","priority","analyte","original_gate_id","owner_role","preflight_check_id","check_code",
  "checkpoint","requested_proof","dependency_codes","draft_stage_not_verification","draft_reference","draft_note",
  "document_authenticated","method_scope_approved","legal_ctr_article_approved","lot_pass"];
 const records=pmsvB57All().filter(({p})=>mode==="ALL"||!!pmsvB57Drafts[p.check_id]);
 const rows=records.map(({c,g,p})=>{
  const draft=pmsvB57Draft(p.check_id);
  return[c.rank,c.product_name,c.priority,c.analyte,g.request_id,g.role,p.check_id,p.checklist_code,
   p.checkpoint,p.what_to_request,g.dependency_codes.join(" | "),
   mode==="ALL"?"UNASSESSED":draft.stage,mode==="ALL"?"":draft.evidence_reference,
   mode==="ALL"?"":draft.note,false,false,false,false];
 });
 return[cols.map(esc).join(","),...rows.map(row=>row.map(esc).join(","))].join("\r\n")+"\r\n";
}
function pmsvB57Download(mode){
 if(!pmsvB57Valid())return;
 const data=mode==="JSON"?JSON.stringify(pmsvB57Export(),null,2)+"\n":pmsvB57CSV(mode);
 const url=URL.createObjectURL(new Blob([mode==="JSON"?"":"\uFEFF",data],{
  type:mode==="JSON"?"application/json;charset=utf-8":"text/csv;charset=utf-8"
 }));
 const a=document.createElement("a");a.href=url;
 a.download=mode==="JSON"?"PMSV-B57-PREFLIGHT-LOCAL-UNVERIFIED.json":
 mode==="ALL"?"PMSV-B57-1295-SOURCE-LAB-LOT-CHECKS-BLANK.csv":"PMSV-B57-UNVERIFIED-TRIAGE-NOTES.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function pmsvB57Feedback(v){
 const el=document.querySelector("[data-pmsv-b57-feedback]");if(el)el.textContent=v;
}
/* Freeze the prior loader in a private closure: duplicate module evaluations
   must not overwrite one shared global and recursively call themselves. */
(function(){
 const previousLoader=pmsvLoadPositiveSourceProof;
 pmsvLoadPositiveSourceProof=async function(){
  await previousLoader();pmsvB57Data=null;
  try{
   const r=await fetch(pmsvB57Path+"?v=20261016-b57",{cache:"reload"});
   if(!r.ok)throw Error("Missing B57 dataset");pmsvB57Data=await r.json();
   if(!pmsvB57Valid())throw Error("Batch57 immutable source/lineage check failed");
   pmsvB57Refresh(true);
  }catch(_){pmsvB57Data=null;}
 };
})();
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{
  const t=ev.target;
  if(t?.matches?.("[data-pmsv-b57-search]")){
   pmsvB57Search=String(t.value||"").slice(0,120);pmsvB57Refresh(false);
  }
 });
 document.addEventListener("change",async ev=>{
  const t=ev.target;if(!t)return;
  if(t.matches?.("[data-pmsv-b57-case]")){
   if(["ALL","FIRST"].includes(t.value)||pmsvB57Data?.cases.some(c=>c.catalogue_id===t.value)){
    pmsvB57Case=t.value;pmsvB57Refresh(false);
   }
  }else if(t.matches?.("[data-pmsv-b57-gate]")){
   if(t.value==="ALL"||pmsvB57Data?.definitions.some(g=>g.gate_code===t.value)){
    pmsvB57Gate=t.value;pmsvB57Refresh(false);
   }
  }else if(t.matches?.("[data-pmsv-b57-priority]")){
   if(["ALL","P0","P1"].includes(t.value)){pmsvB57Priority=t.value;pmsvB57Refresh(false);}
  }else if(t.matches?.("[data-pmsv-b57-field]")){
   if(!pmsvB57Index(pmsvB57Selected))return;
   const key=t.getAttribute("data-pmsv-b57-field");
   if(!["stage","note","evidence_reference"].includes(key))return;
   const d={...pmsvB57Draft(pmsvB57Selected)};
   d[key]=String(t.value||"").slice(0,key==="note"?240:key==="evidence_reference"?120:80);
   if(pmsvB57ValidDraft(d)){pmsvB57Drafts[pmsvB57Selected]=d;pmsvB57Refresh(true);}
  }else if(t.matches?.("[data-pmsv-b57-import]")){
   const file=t.files?.[0];if(!file)return;
   if(file.size>750000){pmsvB57Feedback("Rejected: JSON exceeds import size limit. No changes.");t.value="";return;}
   try{
    const ok=pmsvB57Import(await file.text());
    pmsvB57Feedback(ok?"Restored unverified session notes only. Zero legal, lab, or lot approvals.":
    "Rejected: changed source, unknown checkpoint, malformed metadata or attempted approval. No changes.");
   }catch(_){pmsvB57Feedback("Rejected unreadable JSON. No changes.");}
   t.value="";
  }
 });
 document.addEventListener("click",ev=>{
  const c=ev.target?.closest?.("[data-pmsv-b57-select]");
  if(c){pmsvB57Selected=c.getAttribute("data-pmsv-b57-select");pmsvB57Refresh(true);return;}
  const dl=ev.target?.closest?.("[data-pmsv-b57-download]");
  if(dl){pmsvB57Download(dl.getAttribute("data-pmsv-b57-download"));return;}
  if(ev.target?.closest?.("[data-pmsv-b57-clear-one]")){
   delete pmsvB57Drafts[pmsvB57Selected];pmsvB57Refresh(true);return;
  }
  if(ev.target?.closest?.("[data-pmsv-b57-clear-all]")){
   pmsvB57Drafts=Object.create(null);pmsvB57Refresh(true);
   pmsvB57Feedback("Temporary session notes cleared. No actual evidence altered.");
  }
 });
}
