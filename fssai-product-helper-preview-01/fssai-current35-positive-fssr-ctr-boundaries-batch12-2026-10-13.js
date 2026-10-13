"use strict";
/* Batch 12: 22 precise official FSSR versus CTR legal-article decisions. No automatic thresholds. */
var pmsvB12Data=null;
const pmsvB12Path="./data/rules/fssai-current35-positive-fssr-ctr-boundaries-batch12-2026-10-13.json";
const pmsvB12Expected="e1d50b69105d96b6";
function pmsvB12Digest(v){let a=0x811c9dc5,b=0x9747b28c;for(const k of JSON.stringify(v)){let z=k.charCodeAt(0);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0")}
function pmsvB12Valid(){
 if(typeof pmsvB11Valid!=="function"||!pmsvB11Valid()||!pmsvB12Data||!pmsv35Queue||!pmsv498Ledger)return false;
 const d=pmsvB12Data;
 if(pmsvB12Digest(d)!==pmsvB12Expected||d.kind!=="PMSV_CURRENT35_SPECIFIC_FSSR_CTR_DECISIVE_BOUNDARIES_BATCH12"||
 d.baseline?.total!==533||d.baseline?.first_source_conditional!==498||d.baseline?.first_exact_source_pending!==35||
 d.official_clauses_checked!==22||d.evidence_specific_proof_questions!==88||d.unreviewed_in_this_batch!==13||
 d.current_CTR_source!=="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf"||d.cases?.length!==22||d.future_amendment_auto_applied!==false||
 d.may_2026_amendment_effective!=="2026-12-01"||
 d.conclusions?.promotions!==0||d.conclusions?.auto_assigned_numeric_finished_limits!==0||
 d.conclusions?.verified_lot_lab_passes!==0||d.conclusions?.full_finished_product_compliance_approvals!==0||
 d.conclusions?.wordpress_modified!==false||d.conclusions?.canonical_ledger_changed!==false)return false;
 const known=new Map(pmsv35Queue.review_records.map(x=>[x.catalog_id,x]));
 const ledger=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x]));
 const seen=new Set();
 for(let i=0;i<22;i++){
  const x=d.cases[i],q=known.get(x?.catalog_id),l=ledger.get(x?.catalog_id);
  if(!x||!q||!l||seen.has(x.catalog_id)||x.rank!==i+1||
  x.product_name!==q.product_name||String(x.fssr||"")!==String(q.fssr||"")||
  String(x.fcs||"")!==String(q.fcs||"")||l.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
  x.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
  !x.official_fssr_product_identity_clause||!x.competing_named_CTR_source||
  !x.first_product_specific_positive_proof||!x.product_standard_source||
  x.current_CTR_source!==d.current_CTR_source||x.four_independent_proof_questions?.length!==4||
  x.article_exclusion_confirmed_as_research!==true||
  x.product_specific_CTR_first_source_positively_verified!==false||
  x.finished_food_numeric_limit_applied!==false||x.real_lot_lab_pass!==false||
  x.finished_food_legal_approval!==false)return false;
  seen.add(x.catalog_id);
 }
 return seen.size===22&&pmsv498Ledger.first_source_pending===35&&pmsv35Queue.review_records.length===35;
}
const pmsvB12OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB12OldLoad();pmsvB12Data=null;
 try{
  const r=await fetch(pmsvB12Path+"?v=20261013-b12",{cache:"reload"});
  if(!r.ok)throw Error("Positive FSSR evidence unavailable");
  pmsvB12Data=await r.json();
  if(!pmsvB12Valid())throw Error("FSSR/CTR exact article guard failed");
 }catch(_){pmsvB12Data=null}
};
function pmsvB12Html(p){
 if(!p||!pmsv35Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvB12Valid())return '<div class="notice">Batch 12 official product-standard evidence unavailable. First exact source remains pending.</div>';
 const x=pmsvB12Data.cases.find(x=>x.catalog_id===p.id);
 if(!x)return "";
 if(x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))return '<div class="notice">Finished identity mismatch. No source limit assigned.</div>';
 const e=v=>String(v??"").replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[z]));
 return '<details class="card" style="margin-top:12px">'+
 '<summary><b>Batch 12 · decisive FSSR vs CTR comparison</b> — official product evidence, no limit transfer</summary>'+
 '<div class="notice"><b>Source still pending.</b> A product-definition finding is not an independently verified finished-product contaminant limit, assay or PASS.</div>'+
 '<p><b>Official product-standard identity:</b> '+e(x.official_fssr_product_identity_clause)+'</p>'+
 '<p><b>Other named CTR article requiring separate legal proof:</b> '+e(x.competing_named_CTR_source)+'</p>'+
 '<p><b>Decisive next question:</b> '+e(x.first_product_specific_positive_proof)+'</p>'+
 '<p><b>Product-specific evidence to collect:</b></p><ol>'+x.four_independent_proof_questions.map(q=>'<li>'+e(q)+'</li>').join("")+'</ol>'+
 '<small><a target="_blank" rel="noopener noreferrer" href="'+e(x.product_standard_source)+'">Official FSSR product source'+(Number.isInteger(x.verified_FSSR_pdf_page_zero_based)?', PDF p.'+(x.verified_FSSR_pdf_page_zero_based+1):"")+'</a> · '+
 '<a target="_blank" rel="noopener noreferrer" href="'+e(x.current_CTR_source)+'">CTR Version IX (03.02.2026)</a>. Changes commencing 01.12.2026 are not applied.</small></details>';
}
const pmsvB12PriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB12Html(p)+pmsvB12PriorHtml(p)};
