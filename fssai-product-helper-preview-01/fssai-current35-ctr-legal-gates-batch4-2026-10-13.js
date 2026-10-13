"use strict";
/* PMSV current 35 first-source gap review batch 4.
 * Additive, fail-closed, source-only panel. This review never promotes a source,
 * assigns a contaminant threshold, changes the 498/35 ledger or grants PASS.
 */
var pmsvCurrent35Batch4 = null;
const pmsvCurrent35Batch4Source = "./data/rules/fssai-current35-exact-ctr-article-gates-batch4-2026-10-13.json";
const pmsvCurrent35Batch4Ctr = "https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
function pmsvCurrent35Batch4Valid(){
  if(typeof pmsv498Valid !== "function" || !pmsv498Valid() ||
    !pmsvCurrent35Batch4 || !pmsv35Queue || !pmsv498Ledger) return false;
  const d=pmsvCurrent35Batch4;
  if(d.schema_version!=="1.0"||d.kind!=="PMSV_CURRENT_35_FINISHED_CTR_ARTICLE_DECISION_BATCH4"||
    d.authoritative_snapshot?.total!==533||d.authoritative_snapshot?.partial!==498||
    d.authoritative_snapshot?.pending!==35||d.current_ctr_scope_checks_completed!==35||
    d.official_product_status_reviewed!==35||d.required_original_documents!==140||
    d.required_positive_evidence_flags!==140||d.reference_links_to_prior_179_routes!==18||
    d.named_finished_ctr_article_promotions!==0||d.finished_numeric_limits_activated!==0||
    d.finished_lab_tests_verified!==0||d.full_regulatory_passes!==0||
    d.master_ledger_mutated!==false||d.cases?.length!==35||
    pmsv35Queue.review_records?.length!==35||
    pmsv498Ledger.first_source_pending!==35)return false;
  const seen=new Set(),source=new Map(pmsv498Ledger.records.map(z=>[z.catalog_id,z]));
  for(let i=0;i<35;i++){
    const x=d.cases[i],q=pmsv35Queue.review_records[i],l=source.get(x?.catalog_id),v=x?.verification_gates,a=x?.current_ctr_article_test;
    if(!x||!q||!l||seen.has(x.catalog_id)||x.rank!==i+1||
      q.catalog_id!==x.catalog_id||q.product_name!==x.product_name||
      String(q.fssr||"")!==String(x.fssr||"")||
      String(q.fcs||"")!==String(x.fcs||"")||
      l.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
      x.latest_authoritative_status!=="FIRST_EXACT_SOURCE_PENDING"||
      x.current_CTR_document!==pmsvCurrent35Batch4Ctr||
      !/^https:\/\/(?:[a-z0-9-]+\.)?fssai\.gov\.in\//i.test(x.current_FSSR_document||"")||
      !a||!a.named_article_examined||!a.not_equivalent_because||
      !a.decisive_positive_proof||
      !Number.isInteger(a.pdf_page_zero_based)||a.pdf_page_zero_based<0||
      a.legal_scope_result!=="INSUFFICIENT_EVIDENCE_FOR_DIRECT_FINISHED_ARTICLE_MATCH"||
      a.limit_assigned!==false||a.reference_only!==true||
      x.documents_required?.length!==4||x.finished_compliance_pass!==false||
      !v||Object.values(v).length!==4||Object.values(v).some(z=>z!==false)||
      x.december_2026_amendment?.status_as_of_review!=="NOT_YET_EFFECTIVE"||
      x.december_2026_amendment?.automatic_application!==false)return false;
    seen.add(x.catalog_id);
  }
  return seen.size===35;
}
var pmsvCurrent35Batch4OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
  await pmsvCurrent35Batch4OldLoad();
  pmsvCurrent35Batch4=null;
  try{
    const r=await fetch(pmsvCurrent35Batch4Source+"?v=20261013-batch4",{cache:"reload"});
    if(!r.ok)throw Error("Current pending source review not available");
    pmsvCurrent35Batch4=await r.json();
    if(!pmsvCurrent35Batch4Valid())throw Error("Current source review failed identity integrity");
  }catch(_){pmsvCurrent35Batch4=null;}
};
function pmsvCurrent35Batch4Html(p){
  if(!p||!pmsvCurrent35Batch4Valid())return "";
  const x=pmsvCurrent35Batch4.cases.find(v=>v.catalog_id===p.id);
  if(!x||x.product_name!==p.name||
    String(x.fssr||"")!==String(p.fssr||"")||
    String(x.fcs||"")!==String(p.fcs||""))return "";
  const e=v=>String(v??"").replace(/[&<>"']/g,z=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[z]);
  const a=x.current_ctr_article_test;
  return '<details class="card" style="margin-top:12px" open>'+
    '<summary><b>Batch 4 · finished-article CTR verification</b> — FIRST EXACT SOURCE STILL PENDING</summary>'+
    '<div class="notice"><b>No compliance PASS.</b> The compared food article is not yet proven to cover this finished product. No numerical limit is assigned.</div>'+
    '<p><b>Official CTR article compared:</b> '+e(a.named_article_examined)+'</p>'+
    '<p><b>Reason not accepted automatically:</b> '+e(a.not_equivalent_because)+'</p>'+
    '<p><b>Decisive affirmative proof:</b> '+e(a.decisive_positive_proof)+'</p>'+
    '<p><b>Documents still required:</b></p><ol>'+x.documents_required.map(z=>'<li>'+e(z)+'</li>').join("")+'</ol>'+
    (x.research_crosslinks?.length?'<p><b>Earlier research routes:</b> '+x.research_crosslinks.map(y=>e(y.reference_identity)).join("; ")+' <small>(research only; not a CTR article clearance)</small></p>':"")+
    '<p><b>Future amendment:</b> Gazetted May 2026 changes take effect 1 December 2026; not applicable to this assessment date.</p>'+
    '<small><a href="'+e(x.current_FSSR_document)+'" target="_blank" rel="noopener noreferrer">Official FSSR / FoSCoS identity</a> · '+
    '<a href="'+e(x.current_CTR_document)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX</a> · '+
    '<a href="'+e(x.december_2026_amendment.original_gazette)+'" target="_blank" rel="noopener noreferrer">Future amendment Gazette</a></small>'+
    '</details>';
}
var pmsvCurrent35Batch4PriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
  return pmsvCurrent35Batch4Html(p)+pmsvCurrent35Batch4PriorHtml(p);
};
