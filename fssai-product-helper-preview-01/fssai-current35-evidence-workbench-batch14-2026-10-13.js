"use strict";
/* PMSV Batch 14: full 35-case documentary adjudication workbench.
 * Browser-local evidence drafts only. NO lab results, law approval, source promotion or thresholds.
 */
var pmsvB14Data=null;
const pmsvB14Path="./data/rules/fssai-current35-adjudication-workbench-batch14-2026-10-13.json";
const pmsvB14Expected="e602f37fbdf3562e";
const pmsvB14StorageKey="pmsv:ctr:current35:article-review-packets:v1";
const pmsvB14Fields=Object.freeze({
  finished_identity:600,source_article:250,source_url:550,analyte:150,
  analytical_basis:600,document_reference:450,reviewer:140,lot_reference:160
});
function pmsvB14Digest(v){
 const s=JSON.stringify(v);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function pmsvB14Esc(v){
 const m={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
 return String(v??"").replace(/[&<>"']/g,ch=>m[ch]);
}
function pmsvB14Valid(){
 if(typeof pmsvB13Valid!=="function"||!pmsvB13Valid()||!pmsvB14Data||
 !pmsvB12Data||!pmsvB13Data||!pmsv35Queue||!pmsvB5Data||!pmsvB9Data||
 !pmsv498Ledger)return false;
 const d=pmsvB14Data;
 if(pmsvB14Digest(d)!==pmsvB14Expected||
  d.schema_version!=="1.0"||d.kind!=="PMSV_CURRENT35_DOCUMENTARY_ADJUDICATION_WORKBENCH_BATCH14"||
  d.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
  d.CTR_source!=="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf"||
  d.baseline?.catalogue!==533||d.baseline?.conditional_first_source!==498||
  d.baseline?.first_source_pending!==35||d.source_coverage?.total_pending!==35||
  d.source_coverage?.batch12_cases!==22||d.source_coverage?.batch13_cases!==13||
  d.source_coverage?.conditional_named_article_candidates!==3||
  d.source_coverage?.not_yet_with_positive_named_article_candidates!==32||
  d.source_coverage?.original_document_receipt_slots!==140||
  d.source_coverage?.case_specific_evidence_questions!==153||
  d.future_amendment_commencement!=="2026-12-01"||d.future_amendment_not_applied!==true||
  d.cases?.length!==35||pmsv35Queue.review_records?.length!==35||
  pmsvB5Data.cases?.length!==35||pmsvB9Data.conditional_subroutes?.length!==3||
  pmsv498Ledger.first_source_pending!==35||
  d.results?.new_source_promotions!==0||d.results?.new_assigned_thresholds!==0||
  d.results?.new_lab_passes!==0||d.results?.new_regulatory_approvals!==0||
  d.results?.canonical_ledger_modified!==false||
  d.results?.WordPress_production_modified!==false)return false;
 const map12=new Map(pmsvB12Data.cases.map(x=>[x.catalog_id,x])),
       map13=new Map(pmsvB13Data.cases.map(x=>[x.catalog_id,x])),
       b5=new Map(pmsvB5Data.cases.map(x=>[x.catalog_id,x])),
       b9=new Map(pmsvB9Data.conditional_subroutes.map(x=>[x.catalog_id,x])),
       live=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x])),
       seen=new Set();
 let slots=0,questions=0,positive=0;
 for(let i=0;i<35;i++){
  const x=d.cases[i],q=pmsv35Queue.review_records[i],r=b5.get(x?.catalog_id),
        a=map12.get(x?.catalog_id),b=map13.get(x?.catalog_id),c=b9.get(x?.catalog_id),
        original=live.get(x?.catalog_id);
  if(!x||!q||!r||!original||seen.has(x.catalog_id)||
   x.rank!==i+1||x.catalog_id!==q.catalog_id||x.product_name!==q.product_name||
   x.product_name!==r.product_name||String(x.fssr||"")!==String(q.fssr||"")||
   String(x.fcs||"")!==String(q.fcs||"")||!x.first_decisive_question||
   x.document_slots?.length!==4||
   JSON.stringify(x.document_slots)!==JSON.stringify(r.evidence_documents.map(y=>y.title))||
   x.questions?.length!==(a?4:5)||!!a===!!b||
   x.source_review_tier!==(a?"FSSR_CTR_ARTICLE_COMPARISON":"IDENTITY_AND_RECIPE_DOCUMENTATION")||
   x.official_contaminant_url!==d.CTR_source||
   x.first_source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   original.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   x.approved_finished_numeric_limit!==false||x.lot_test_result_verified!==false||
   x.full_legal_approval!==false||
   (c?x.named_ctr_candidate?.route_id!==c.id:x.named_ctr_candidate!==null))return false;
  if(c)positive++;slots+=4;questions+=x.questions.length;seen.add(x.catalog_id);
 }
 return seen.size===35&&slots===140&&questions===153&&positive===3;
}
function pmsvB14Fresh(){return Object.fromEntries(Object.keys(pmsvB14Fields).map(k=>[k,""]))}
function pmsvB14Read(){
 if(!pmsvB14Data)return {};
 try{
  const raw=JSON.parse(window.localStorage.getItem(pmsvB14StorageKey)||"{}");
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return {};
  const out={};
  for(const c of pmsvB14Data.cases){
   const r=raw[c.catalog_id];
   if(!r||typeof r!=="object"||Array.isArray(r))continue;
   out[c.catalog_id]=Object.fromEntries(Object.entries(pmsvB14Fields).map(([k,max])=>
     [k,String(r[k]||"").slice(0,max)]));
  }
  return out;
 }catch(_){return {}}
}
function pmsvB14Persist(v){
 try{window.localStorage.setItem(pmsvB14StorageKey,JSON.stringify(v));return true}
 catch(_){return false}
}
function pmsvB14OfficialUrl(v){
 try{const u=new URL(String(v||"").trim());
  return u.protocol==="https:"&&["fssai.gov.in","www.fssai.gov.in","foscos.fssai.gov.in"].includes(u.hostname.toLowerCase());
 }catch(_){return false}
}
function pmsvB14Packet(id){
 if(!pmsvB14Valid())return null;
 const x=pmsvB14Data.cases.find(x=>x.catalog_id===id);
 if(!x)return null;
 const v=pmsvB14Read()[id]||pmsvB14Fresh();
 const receipts=typeof pmsvB5Read==="function"?(pmsvB5Read()[id]||{}):{};
 const received=Array.from({length:4},(_,i)=>receipts.received?.[i]===true);
 const verified=Object.keys(pmsvB14Fields).filter(k=>k!=="lot_reference")
  .every(k=>String(v[k]||"").trim().length>0)&&pmsvB14OfficialUrl(v.source_url);
 const ready=received.every(Boolean)&&verified;
 return {
  kind:"PMSV_FIRST_SOURCE_UNVERIFIED_REVIEW_PACKET",schema_version:"1.0",
  product:{catalog_id:x.catalog_id,name:x.product_name,fssr:x.fssr,fcs:x.fcs},
  original_status:"FIRST_EXACT_SOURCE_PENDING",priority:x.priority,primary_blocker:x.primary_blocker,
  source_identity_evidence:x.positive_identity_finding,existing_conditional_source_route:x.named_ctr_candidate,
  evidence_receipts:x.document_slots.map((label,i)=>({label,received_for_review:received[i],source_verified:false})),
  proof_questions:x.questions,
  reviewer_record:v,
  official_reference:x.official_contaminant_url,
  review_preparation_status:ready?"DOCUMENTARY_PACKET_READY_FOR_INDEPENDENT_REVIEW_UNVERIFIED":
    (received.some(Boolean)||Object.values(v).some(z=>z.trim())?"PARTIAL_DRAFT_UNVERIFIED":"NOT_STARTED"),
  source_article_legally_confirmed:false,numeric_limit_activated:false,
  valid_laboratory_result_proven:false,finished_product_compliance_approved:false,
  warning:"Receipts, narrative, URLs and user entries are unverified assertions. No current legal contaminant limit or product PASS is assigned."
 };
}
function pmsvB14ExportAll(){
 if(!pmsvB14Valid())return null;
 return {kind:"PMSV_35_INDEPENDENT_FIRST_SOURCE_REVIEW_QUEUE_UNVERIFIED",
  CTR_source:pmsvB14Data.CTR_source,catalogue:533,first_source_partial:498,first_exact_pending:35,
  legal_approvals:0,records:pmsvB14Data.cases.map(x=>pmsvB14Packet(x.catalog_id))};
}
function pmsvB14CaseHtml(id){
 if(!pmsvB14Valid())return '<div class="notice">Adjudication workbench unavailable; source remains pending.</div>';
 const c=pmsvB14Data.cases.find(x=>x.catalog_id===id);
 if(!c)return "";
 const e=pmsvB14Esc;
 const p=pmsvB14Packet(id),v=p.reviewer_record;
 const candidate=c.named_ctr_candidate?'<div class="notice"><b>Conditional candidate only:</b> '+e(c.named_ctr_candidate.contaminant)+" — "+e(c.named_ctr_candidate.exact_named_article)+
   '.<p>Require all qualifying facts, independent legal interpretation and lot evidence. Do not prefill or approve the source automatically.</p></div>':"";
 const field=(name,label,rows,placeholder)=>{
  const max=pmsvB14Fields[name],value=e(v[name]);
  const ctrl=rows?'<textarea rows="'+rows+'" maxlength="'+max+'" data-pmsv-b14-field="'+name+'" placeholder="'+e(placeholder)+'">'+value+'</textarea>':
    '<input type="text" maxlength="'+max+'" data-pmsv-b14-field="'+name+'" value="'+value+'" placeholder="'+e(placeholder)+'">';
  return '<label style="display:block;margin:8px 0"><b>'+e(label)+'</b>'+ctrl+'</label>';
 };
 return '<div data-pmsv-b14-case="'+e(id)+'">'+
  '<div class="notice"><b>Canonical status: FIRST EXACT SOURCE PENDING.</b> Nothing typed or checked here can approve a product. All evidence stays in this browser unless manually exported.</div>'+
  '<p><b>'+e(c.product_name)+'</b> — '+e(c.fssr||c.fcs||"FoSCoS category")+
  ' · '+e(c.primary_blocker.replace(/_/g," "))+'</p>'+
  '<p><b>First positive source question:</b> '+e(c.first_decisive_question)+'</p>'+
  candidate+
  '<p><b>Documents received for review (not checked for truth):</b></p>'+
  c.document_slots.map((name,i)=>'<label style="display:block;margin:6px 0"><input type="checkbox" data-pmsv-b14-receipt="'+i+'" '+(p.evidence_receipts[i].received_for_review?"checked ":"")+'/> '+e(name)+'</label>').join("")+
  '<details><summary><b>Product-specific regulatory questions ('+c.questions.length+')</b></summary><ol>'+
  c.questions.map(x=>'<li>'+e(x)+'</li>').join("")+'</ol></details>'+
  field("finished_identity","Actual as-sold product and processing facts",3,"Record exact commodity, recipe and pack; cite supporting document")+
  field("source_article","Proposed exact legal CTR article (NOT approved)",0,"Transcribe named finished article, not a generic analogy")+
  field("source_url","Exact official FSSAI/FoSCoS article URL",0,"https://fssai.gov.in/...")+
  field("analyte","Named analyte / contaminant for this article",0,"e.g., lead, aflatoxin B1, tin")+
  field("analytical_basis","Sampling / analytical basis required by the named article",3,"Matrix, units, processing factors and test scope")+
  field("document_reference","Document numbers / revisions for identity and source evidence",2,"FSSR clause, formula revision, CoA, reviewer workpaper")+
  field("reviewer","Person preparing the packet (NOT independent legal signoff)",0,"Reviewer name or initials")+
  field("lot_reference","Optional lot/sample reference — not a PASS",0,"Lot ID / lab reference")+
  '<p><b data-pmsv-b14-status>'+e(p.review_preparation_status.replace(/_/g," "))+'</b></p>'+
  '<p><button type="button" data-pmsv-b14-export="case">Download this review packet (JSON)</button> '+
  '<button type="button" data-pmsv-b14-export="all">Download all 35 (JSON)</button></p>'+
  '<small data-pmsv-b14-msg>Document receipts and typed drafts are unverified; no source promotion or compliance PASS.</small>'+
  '<p><small><a href="'+e(c.official_finished_identity_url)+'" target="_blank" rel="noopener noreferrer">Official identity source</a> · '+
  '<a href="'+e(c.official_contaminant_url)+'" target="_blank" rel="noopener noreferrer">CTR IX legal source</a></small></p>'+
  '</div>';
}
function pmsvB14Html(product){
 if(!product||!pmsv35Queue?.review_records?.some(x=>x.catalog_id===product.id))return "";
 if(!pmsvB14Valid())return '<div class="notice">Batch 14 source-review workbench is unavailable. First exact source remains pending.</div>';
 const q=pmsvB14Data.cases.find(x=>x.catalog_id===product.id);
 if(!q||q.product_name!==product.name||String(q.fssr||"")!==String(product.fssr||"")||
 String(q.fcs||"")!==String(product.fcs||""))return '<div class="notice">Identity mismatch. No legal contaminant source applied.</div>';
 return '<details class="card" style="margin-top:12px">'+
 '<summary><b>Batch 14 · actual source evidence & independent review packet</b></summary>'+
 pmsvB14CaseHtml(q.catalog_id)+'</details>';
}
function pmsvB14DashboardHtml(){
 const e=pmsvB14Esc;
 return '<details class="card" id="pmsv-b14-review-index" style="margin-bottom:12px">'+
  '<summary><b>35 pending FSSAI source cases — documentary review queue</b> (3 conditional CTR routes; no product approvals)</summary>'+
  '<div class="notice"><b>All 35 are still FIRST EXACT SOURCE PENDING.</b> The workbench collects supporting records and exports review packets; it does not verify facts or approve a finished-food limit.</div>'+
  '<p><label>Select case to prepare source review: <select data-pmsv-b14-select>'+
  '<option value="">Select a pending product</option>'+
  pmsvB14Data.cases.map(x=>'<option value="'+e(x.catalog_id)+'">'+
   e(x.priority.slice(0,2))+' · '+e(x.product_name)+'</option>').join("")+
  '</select></label></p>'+
  '<p><b>Priority P1:</b> 3 conditional named-source candidates. <b>P2:</b> 24 identity/scope questions. <b>P3:</b> 8 unidentified chemical/substance cases.</p>'+
  '<p>Each file is browser-local until explicitly downloaded. No email login, no server-side upload and no published lab PASS.</p>'+
  '<div data-pmsv-b14-selected></div>'+
  '<p><button type="button" data-pmsv-b14-export="all">Download complete 35-case queue (JSON)</button></p>'+
  '</details>';
}
function pmsvB14EnsureDashboard(){
 if(typeof document==="undefined"||!pmsvB14Valid())return;
 const target=document.getElementById("selectedProductStandardContent");
 if(target&&!document.getElementById("pmsv-b14-review-index"))
   target.insertAdjacentHTML("beforebegin",pmsvB14DashboardHtml());
}
const pmsvB14OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB14OldLoad();pmsvB14Data=null;
 try{
  const r=await fetch(pmsvB14Path+"?v=20261013-b14",{cache:"reload"});
  if(!r.ok)throw Error("Missing Batch14 source packets");
  pmsvB14Data=await r.json();
  if(!pmsvB14Valid())throw Error("35-case source evidence identity guard failed");
  pmsvB14EnsureDashboard();
 }catch(_){pmsvB14Data=null}
};
const pmsvB14OldHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB14Html(p)+pmsvB14OldHtml(p)};
function pmsvB14RefreshVisible(id,saved){
 const p=pmsvB14Packet(id);
 if(!p)return;
 document.querySelectorAll("[data-pmsv-b14-case]").forEach(el=>{
  if(el.getAttribute("data-pmsv-b14-case")!==id)return;
  const label=el.querySelector("[data-pmsv-b14-status]"),
        msg=el.querySelector("[data-pmsv-b14-msg]");
  if(label)label.textContent=p.review_preparation_status.replace(/_/g," ");
  if(msg)msg.textContent=(saved?"Saved locally. ":"Storage unavailable. ")+
   "Independent legal review still required; no PASS.";
 });
}
function pmsvB14HandleInput(event){
 if(!pmsvB14Valid())return;
 const t=event?.target;
 if(t?.matches?.("[data-pmsv-b14-select]")){
  const box=t.closest("#pmsv-b14-review-index")?.querySelector("[data-pmsv-b14-selected]");
  if(box)box.innerHTML=pmsvB14CaseHtml(t.value);
  return;
 }
 const card=t?.closest?.("[data-pmsv-b14-case]");
 if(!card)return;
 const id=card.getAttribute("data-pmsv-b14-case");
 if(!pmsvB14Data.cases.some(x=>x.catalog_id===id))return;
 const field=t.getAttribute("data-pmsv-b14-field"),slot=t.getAttribute("data-pmsv-b14-receipt");
 if(field&&Object.hasOwn(pmsvB14Fields,field)){
  const all=pmsvB14Read(),x=all[id]||pmsvB14Fresh();
  x[field]=String(t.value||"").slice(0,pmsvB14Fields[field]);
  all[id]=x;
  pmsvB14RefreshVisible(id,pmsvB14Persist(all));
 }else if(slot!==null&&slot!==undefined&&typeof pmsvB5Read==="function"&&typeof pmsvB5Persist==="function"){
  const i=Number(slot);if(!Number.isInteger(i)||i<0||i>3)return;
  const all=pmsvB5Read(),x=all[id]||{received:[false,false,false,false],reference:"",notes:""};
  x.received[i]=t.checked===true;all[id]=x;
  pmsvB14RefreshVisible(id,pmsvB5Persist(all));
 }
}
function pmsvB14Download(data,name){
 if(typeof document==="undefined"||typeof URL==="undefined"||typeof Blob==="undefined"||!data)return false;
 let url="";
 try{
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"});
  url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=name;
  document.body.appendChild(a);a.click();a.remove();
  URL.revokeObjectURL(url);return true;
 }catch(_){if(url)URL.revokeObjectURL(url);return false}
}
function pmsvB14HandleClick(event){
 if(!pmsvB14Valid())return;
 const t=event?.target?.closest?.("[data-pmsv-b14-export]");
 if(!t)return;
 const mode=t.getAttribute("data-pmsv-b14-export");
 const card=t.closest("[data-pmsv-b14-case]");
 if(mode==="case"&&card){
  const id=card.getAttribute("data-pmsv-b14-case");
  if(!pmsvB14Data.cases.some(x=>x.catalog_id===id))return;
  pmsvB14Download(pmsvB14Packet(id),"PMSV-CTR-UNVERIFIED-"+id+".json");
 }else if(mode==="all"){
  pmsvB14Download(pmsvB14ExportAll(),"PMSV-35-CTR-REVIEW-UNVERIFIED.json");
 }
}
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",pmsvB14HandleInput);
 document.addEventListener("change",pmsvB14HandleInput);
 document.addEventListener("click",pmsvB14HandleClick);
}
