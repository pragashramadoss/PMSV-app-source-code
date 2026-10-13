"use strict";
/* Forty official, positive finished-product legal-source questions.
 * FSSR quality standards are not named CTR first-source matches.
 * No numeric contaminant limits, analytical passes or approvals.
 */
var pmsv40DecisiveReviewData=null;
function pmsv40DecisiveReviewValid(){
 if(typeof pmsv493Valid!=="function"||!pmsv493Valid()||
 typeof pmsv40FourMetalProofValid!=="function"||!pmsv40FourMetalProofValid()||
 typeof pmsvPending40QualityCoverage!=="function"||
 !pmsv40DecisiveReviewData||!pmsv40Queue||!pmsv493Ledger)return false;
 const d=pmsv40DecisiveReviewData,ctr="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
 if(d.schema_version!=="1.0"||d.policy!=="ONLY_OFFICIAL_FSSAI_FOSCOS"||
 d.purpose!=="40_DISCRIMINATING_FINISHED_ARTICLE_PROOF_DECISIONS"||
 d.catalogue!==533||d.partial_first_ctr_routes!==493||
 d.exact_named_first_ctr_pending!==40||d.quality_dossiers_linked!==31||
 d.unlinked_quality_dossiers!==9||d.targeted_product_distinctions!==22||
 d.confirmed_named_source_promotions!==0||d.automatically_applied_numeric_limits!==0||
 d.verified_laboratory_results!==0||d.full_compliance_approvals!==0||
 d.records?.length!==40||pmsv493Ledger.partial_exact!==493||
 pmsv493Ledger.first_source_pending!==40||
 pmsv40Queue.review_records?.length!==40||pmsv493Ledger.records?.length!==533)return false;
 const quality=pmsvPending40QualityCoverage();
 if(!quality||quality.size!==40)return false;
 const q=new Map(pmsv40Queue.review_records.map(x=>[x.catalog_id,x]));
 const l=new Map(pmsv493Ledger.records.map(x=>[x.catalog_id,x]));
 const seen=new Set();let linked=0;
 const official=/^https:\/\/(?:[a-z0-9-]+\.)?fssai\.gov\.in\//i;
 for(const x of d.records){
   const p=q.get(x.catalog_id),r=l.get(x.catalog_id),z=quality.get(x.catalog_id);
   if(seen.has(x.catalog_id)||!p||!r||!z||
     p.product_name!==x.product_name||r.product_name!==x.product_name||
     String(p.fssr||"")!==String(x.fssr||"")||
     String(p.fcs||"")!==String(x.fcs||"")||
     r.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
     !official.test(x.official_fssai_product_source)||
     x.official_fssai_ctr_source!==ctr||
     x.separately_linked_fssr_quality_module!==(z.quality_module||null)||
     !x.decisive_positive_evidence||!x.decision_track||
     !Array.isArray(x.prior_missing_source_proof)||
     x.correct_named_contaminant_article_not_yet_evidenced!==true||
     x.lab_data_not_verified!==true||x.source_numeric_limit_not_auto_applied!==true||
     x.full_regulatory_approval!==false)return false;
   seen.add(x.catalog_id);if(x.separately_linked_fssr_quality_module)linked++;
 }
 return seen.size===40&&linked===31;
}
var pmsv40DecisivePriorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsv40DecisivePriorLoad();pmsv40DecisiveReviewData=null;
 try{
  const r=await fetch("./data/rules/fssai-current40-decisive-positive-article-review-2026-10-13.json?v=20261013-decisive40",{cache:"reload"});
  if(!r.ok)throw Error("Source review missing");
  pmsv40DecisiveReviewData=await r.json();
  if(!pmsv40DecisiveReviewValid())throw Error("Source decision identity mismatch");
 }catch(_){pmsv40DecisiveReviewData=null;}
};
function pmsv40DecisiveReviewHtml(p){
 if(!p||!pmsv40Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsv40DecisiveReviewValid())return '<div class="notice">Current decisive official source evidence unavailable. No numeric CTR limit or PASS.</div>';
 const x=pmsv40DecisiveReviewData.records.find(y=>y.catalog_id===p.id);
 if(!x||x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">Product source identity mismatch: no CTR article promoted.</div>';
 const e=v=>String(v).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",[String.fromCharCode(34)]:"&quot;",[String.fromCharCode(39)]:"&#39;"}[z]));
 return '<details class="card" style="margin-top:12px"><summary><b>Exact source closure — decisive evidence still required</b></summary>'+
 '<div class="notice"><b>FIRST EXACT NAMED CTR ARTICLE STILL PENDING.</b> This is a targeted evidence request, not a product clearance.</div>'+
 '<p><b>Finished-product legal distinction:</b> '+e(x.decision_track)+'</p>'+
 '<p><b>Positive evidence needed:</b> '+e(x.decisive_positive_evidence)+'</p>'+
 '<p><b>Original unresolved legal source questions:</b> '+e(x.prior_missing_source_proof.join("; "))+'</p>'+
 '<p><b>Separate FSSR quality dossier:</b> '+(x.separately_linked_fssr_quality_module?"Linked; not a contaminant article":"Not directly linked")+'</p>'+
 '<small><a href="'+e(x.official_fssai_product_source)+'" target="_blank" rel="noopener noreferrer">Official FSSAI finished-food source</a> · '+
 '<a href="'+e(x.official_fssai_ctr_source)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX</a></small></details>';
}
var pmsv40DecisivePriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsv40DecisiveReviewHtml(p)+pmsv40DecisivePriorHtml(p)};
