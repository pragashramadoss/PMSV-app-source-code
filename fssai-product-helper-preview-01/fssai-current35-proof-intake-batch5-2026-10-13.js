"use strict";
/* Batch 5: receipt-only, browser-local original evidence for 35 CURRENT pending
 * finished-food CTR article questions. A receipt never means regulatory approval.
 * This module never writes to server, changes source ledger or computes limits.
 */
var pmsvB5Data=null;
const pmsvB5Source="./data/rules/fssai-current35-proof-intake-batch5-2026-10-13.json";
const pmsvB5StorageKey="pmsv:ctr:current35:received-documents:v1";
const pmsvB5Ctr="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
function pmsvB5Valid(){
  if(typeof pmsvCurrent35Batch4Valid!=="function"||!pmsvCurrent35Batch4Valid()||
    !pmsvB5Data||!pmsvCurrent35Batch4||!pmsv35Queue||!pmsv498Ledger)return false;
  const d=pmsvB5Data, baseline=pmsvCurrent35Batch4;
  if(d.schema_version!=="1.0"||d.kind!=="PMSV_35_PENDING_REGULATORY_EVIDENCE_INTAKE_B5"||
    d.current_snapshot?.catalogue!==533||d.current_snapshot?.partial_exact!==498||
    d.current_snapshot?.first_exact_pending!==35||d.current_snapshot?.approval_count!==0||
    d.case_count!==35||d.document_slots!==140||d.source_promotions!==0||
    d.actual_lab_tests_confirmed!==0||d.product_approvals!==0||
    d.future_amendment_effective_date!=="2026-12-01"||
    d.official_ctr_url!==pmsvB5Ctr||
    d.cases?.length!==35||baseline.cases?.length!==35||
    pmsv35Queue.review_records?.length!==35||
    pmsv498Ledger.first_source_pending!==35)return false;
  const counts={LEGAL_SCOPE:0,PRODUCT_IDENTITY:0,PROCESS_MATRIX:0,SUBSTANCE_ID:0};
  const ids=new Set(),live=new Map(pmsv498Ledger.records.map(z=>[z.catalog_id,z]));
  for(let i=0;i<35;i++){
    const x=d.cases[i],b=baseline.cases[i],q=pmsv35Queue.review_records[i],l=live.get(x?.catalog_id);
    if(!x||!b||!q||!l||ids.has(x.catalog_id)||x.rank!==i+1||
      x.catalog_id!==b.catalog_id||x.catalog_id!==q.catalog_id||
      x.product_name!==b.product_name||x.product_name!==q.product_name||
      String(x.fssr||"")!==String(q.fssr||"")||
      String(x.fcs||"")!==String(q.fcs||"")||
      l.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
      x.exact_finished_source_status!=="FIRST_EXACT_SOURCE_PENDING"||
      !Object.hasOwn(counts,x.primary_blocker)||
      !x.first_decisive_question||!x.triage_key||
      x.official_sources?.contaminants!==pmsvB5Ctr||
      x.official_sources?.product!==b.current_FSSR_document||
      x.receipt_is_not_verified_identity!==true||
      x.legal_source_approved!==false||x.numeric_limit_assigned!==false||
      x.full_product_compliance_approved!==false||
      x.evidence_documents?.length!==4)return false;
    for(let k=0;k<4;k++){
      const z=x.evidence_documents[k],o=b.documents_required[k];
      if(z?.slot!==k+1||z.title!==o||z.receipt_status!=="NOT_RECEIVED_OR_UNVERIFIED")return false;
    }
    ids.add(x.catalog_id);counts[x.primary_blocker]++;
  }
  return ids.size===35&&Object.keys(counts).every(k=>counts[k]===d.category_counts?.[k])&&
    Object.keys(d.category_counts||{}).length===4;
}
function pmsvB5Read(){
  try{
    const raw=JSON.parse(window.localStorage.getItem(pmsvB5StorageKey)||"{}"),out={};
    if(!raw||typeof raw!=="object"||Array.isArray(raw)||!pmsvB5Data)return {};
    for(const x of pmsvB5Data.cases){
      const r=raw[x.catalog_id];
      if(!r||typeof r!=="object"||Array.isArray(r))continue;
      out[x.catalog_id]={
        received:Array.from({length:4},(_,i)=>r.received?.[i]===true),
        reference:String(r.reference||"").slice(0,300),
        notes:String(r.notes||"").slice(0,500)
      };
    }
    return out;
  }catch(_){return {};}
}
function pmsvB5Persist(state){
  try{window.localStorage.setItem(pmsvB5StorageKey,JSON.stringify(state));return true}
  catch(_){return false}
}
function pmsvB5ExportOne(id){
  if(!pmsvB5Valid())return null;
  const x=pmsvB5Data.cases.find(z=>z.catalog_id===id);
  if(!x)return null;
  const r=pmsvB5Read()[id]||{received:[false,false,false,false],reference:"",notes:""};
  return {
    kind:"UNVERIFIED_DOCUMENT_RECEIPTS_NOT_COMPLIANCE",
    catalog_id:id,product_name:x.product_name,first_decisive_question:x.first_decisive_question,
    source_status:"FIRST_EXACT_SOURCE_PENDING",primary_blocker:x.primary_blocker,
    receipts:x.evidence_documents.map((z,i)=>({
      title:z.title,received_for_review:r.received[i]===true,source_verified:false
    })),
    reviewer_reference:r.reference,notes:r.notes,
    received_count:r.received.filter(Boolean).length,
    named_finished_CTR_article_legally_confirmed:false,
    numeric_limit_assigned:false,lab_pass:false,product_compliance_pass:false
  };
}
function pmsvB5ExportAll(){
  if(!pmsvB5Valid())return null;
  const saved=pmsvB5Read();
  return {kind:"35_PENDING_SOURCE_REVIEW_LOCAL_RECEIPTS_ONLY",catalogue:533,
    partial:498,pending:35,regulatory_approvals:0,
    records:pmsvB5Data.cases.filter(x=>Object.hasOwn(saved,x.catalog_id)).map(x=>pmsvB5ExportOne(x.catalog_id))
  };
}
const pmsvB5OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
  await pmsvB5OldLoad();pmsvB5Data=null;
  try{
    const r=await fetch(pmsvB5Source+"?v=20261013-batch5",{cache:"reload"});
    if(!r.ok)throw Error("Missing current positive evidence intake");
    pmsvB5Data=await r.json();
    if(!pmsvB5Valid())throw Error("Current evidence case ledger identity mismatch");
  }catch(_){pmsvB5Data=null}
};
function pmsvB5Html(p){
  if(!p)return "";
  const inQueue=pmsv35Queue?.review_records?.some(z=>z.catalog_id===p.id);
  if(!inQueue)return "";
  if(!pmsvB5Valid())
    return '<div class="notice">35-case evidence intake unavailable. Existing FIRST EXACT SOURCE PENDING status remains unchanged.</div>';
  const x=pmsvB5Data.cases.find(z=>z.catalog_id===p.id);
  if(!x||x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
    String(x.fcs||"")!==String(p.fcs||""))return '<div class="notice">Evidence intake identity mismatch: no source clearance.</div>';
  const escape=v=>String(v??"").replace(/[&<>"']/g,z=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[z]);
  const r=pmsvB5Read()[x.catalog_id]||{received:[false,false,false,false],reference:"",notes:""};
  return '<details class="card" style="margin-top:12px" data-pmsv-b5-card="'+escape(x.catalog_id)+'">'+
    '<summary><b>Current source evidence intake</b> · <span data-pmsv-b5-count>'+
    r.received.filter(Boolean).length+'/4 documents received (unverified)</span></summary>'+
    '<div class="notice"><b>Source status: FIRST EXACT ARTICLE PENDING.</b> Document receipts are stored on this browser only. They never validate a legal source, activate a CTR limit, or approve a food or lot.</div>'+
    '<p><b>Primary blocker:</b> '+escape(x.primary_blocker.replaceAll("_"," "))+'</p>'+
    '<p><b>Decisive first question:</b> '+escape(x.first_decisive_question)+'</p>'+
    '<p><b>Mark documents received for review (not verified):</b></p>'+
    x.evidence_documents.map((v,i)=>'<label style="display:block;margin:7px 0"><input type="checkbox" data-pmsv-b5-slot="'+i+'" '+(r.received[i]?'checked ':'')+'/> '+escape(v.title)+'</label>').join("")+
    '<p><label>Evidence references (optional)<textarea rows="2" maxlength="300" data-pmsv-b5-reference placeholder="Official link, document ID, revision">'+escape(r.reference)+'</textarea></label></p>'+
    '<p><label>Follow-up for regulatory review (optional)<textarea rows="2" maxlength="500" data-pmsv-b5-notes placeholder="Unresolved identity or finished article">'+escape(r.notes)+'</textarea></label></p>'+
    '<p><button type="button" data-pmsv-b5-copy="case">Copy case review JSON</button> <button type="button" data-pmsv-b5-copy="all">Copy all saved review receipts</button></p>'+
    '<small data-pmsv-b5-message>All four checkmarks still leave the product FIRST EXACT SOURCE PENDING.</small>'+
    '</details>';
}
const pmsvB5Previous=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB5Html(p)+pmsvB5Previous(p)};
function pmsvB5Input(event){
  if(!pmsvB5Valid())return;
  const t=event?.target,c=t?.closest?.("[data-pmsv-b5-card]");
  if(!c)return;
  const id=c.getAttribute("data-pmsv-b5-card");
  if(!pmsvB5Data.cases.some(x=>x.catalog_id===id))return;
  const slot=t.getAttribute?.("data-pmsv-b5-slot"),r=t.hasAttribute?.("data-pmsv-b5-reference"),
    n=t.hasAttribute?.("data-pmsv-b5-notes");
  if(slot===null&&!r&&!n)return;
  const state=pmsvB5Read(),v=state[id]||{received:[false,false,false,false],reference:"",notes:""};
  if(slot!==null){
    const i=Number(slot);
    if(!Number.isInteger(i)||i<0||i>3)return;
    v.received[i]=t.checked===true;
  }else if(r)v.reference=String(t.value||"").slice(0,300);
  else v.notes=String(t.value||"").slice(0,500);
  state[id]=v;
  const saved=pmsvB5Persist(state),count=c.querySelector?.("[data-pmsv-b5-count]"),
    m=c.querySelector?.("[data-pmsv-b5-message]");
  if(count)count.textContent=v.received.filter(Boolean).length+"/4 documents received (unverified)";
  if(m)m.textContent=saved?"Saved locally; first-source legal decision still PENDING.":"Browser storage unavailable; not saved.";
}
async function pmsvB5Copy(event){
  const t=event?.target,c=t?.closest?.("[data-pmsv-b5-card]"),mode=t?.getAttribute?.("data-pmsv-b5-copy");
  if(!c||!["case","all"].includes(mode)||!pmsvB5Valid())return;
  const v=mode==="all"?pmsvB5ExportAll():pmsvB5ExportOne(c.getAttribute("data-pmsv-b5-card"));
  const m=c.querySelector?.("[data-pmsv-b5-message]");
  if(!v||typeof navigator==="undefined"||!navigator.clipboard?.writeText){
    if(m)m.textContent="Clipboard not available. Review saved only in this browser.";return;
  }
  try{await navigator.clipboard.writeText(JSON.stringify(v,null,2));
    if(m)m.textContent="Unverified review receipts copied; no compliance status changed.";
  }catch(_){if(m)m.textContent="Clipboard copy failed. No regulatory status changed.";}
}
if(typeof document!=="undefined"&&document?.addEventListener){
  document.addEventListener("change",pmsvB5Input);
  document.addEventListener("input",pmsvB5Input);
  document.addEventListener("click",pmsvB5Copy);
}
