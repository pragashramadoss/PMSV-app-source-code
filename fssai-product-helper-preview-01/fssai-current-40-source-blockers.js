"use strict";
/* CURRENT 40 individually reviewed pending legal ARTICLE identity boundaries.
   No new contaminant article or value is automatically applied. */
var pmsv40LegalGatesData=null;
const pmsv40LegalGatesDigest="8e01beb8b8da8ebf";
function pmsv40LegalGatesValid(){
 if(typeof pmsv493Valid!=="function"||!pmsv493Valid()||
 typeof pmsvReviewSnapshotDigest!=="function")return false;
 const d=pmsv40LegalGatesData,q=pmsv40Queue,l=pmsv493Ledger;
 if(!d||!q||!l||pmsvReviewSnapshotDigest(d)!==pmsv40LegalGatesDigest||
 d.schema_version!=="1.0"||
 d.scope!=="CURRENT_40_FIRST_EXACT_CTR_ARTICLE_GAPS_FSSAI_ONLY_NO_AUTO_PASS"||
 d.catalogue!==533||d.previous_partial!==493||d.first_exact_source_pending!==40||
 d.full_compliance_passes!==0||d.source_promotions!==0||d.limits_auto_applied!==false||
 d.record_count!==40||d.records?.length!==40||q.review_records?.length!==40||
 l.records?.length!==533||l.partial_exact!==493||l.first_source_pending!==40||
 d.official_ctr!==l.official_contaminants_source||
 d.official_foscos!=="https://foscos.fssai.gov.in/standard-product")return false;
 const ids=new Set(),pending=new Map(q.review_records.map(x=>[x.catalog_id,x])),
 ledger=new Map(l.records.map(x=>[x.catalog_id,x])),groups={};
 for(const x of d.records){
  const a=pending.get(x.catalog_id),b=ledger.get(x.catalog_id);
  if(ids.has(x.catalog_id)||!a||!b||
     x.product_name!==a.product_name||x.product_name!==b.product_name||
     String(x.fssr||"")!==String(a.fssr||"")||
     String(x.fcs||"")!==String(a.fcs||"")||
     b.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
     x.current_first_source_state!=="FIRST_EXACT_SOURCE_PENDING"||
     x.source_scope!=="NAMED_CTR_ARTICLE_APPLICABILITY_NOT_ESTABLISHED"||
     x.previous_cohort!==a.current_review_group||
     JSON.stringify(x.prior_named_articles_review_only)!==JSON.stringify(a.referenced_articles_review_only??[])||
     !x.decision_id||!x.exact_finished_product_boundary||
     !x.positive_documentary_evidence_to_obtain||!x.prohibited_source_article_transfer||
     x.verified_complete_contaminant_panel!==false||
     x.numeric_limits_auto_applied!==false||
     x.actual_finished_lot_identity_verified!==false||
     x.any_regulatory_compliance_pass!==false||
     x.official_ctr!==d.official_ctr||x.official_identity!==d.official_foscos)return false;
  ids.add(x.catalog_id);groups[x.previous_cohort]=(groups[x.previous_cohort]||0)+1;
 }
 return ids.size===40&&
 JSON.stringify(groups)===JSON.stringify(d.cohort_counts)&&
 [...pending.keys()].every(k=>ids.has(k));
}
var pmsvBefore40LegalLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore40LegalLoad();
 pmsv40LegalGatesData=null;
 try{
  const response=await fetch("./data/rules/fssai-current-40-negative-article-proof-boundaries-2026-10-12.json?v=20261012-40legal",{cache:"reload"});
  if(!response.ok)throw Error("Current 40 proof boundaries missing");
  pmsv40LegalGatesData=await response.json();
  if(!pmsv40LegalGatesValid())throw Error("Current 40 source boundaries do not match authoritative ledger");
 }catch(_){pmsv40LegalGatesData=null;}
};
function pmsv40LegalGatesHtml(p){
 if(!p)return "";
 if(!pmsv40LegalGatesValid())
  return '<div class="notice">Latest 40 pending first-source decision dossiers unavailable or invalid. No numeric limit or PASS.</div>';
 const r=pmsv40LegalGatesData.records.find(x=>x.catalog_id===p.id);
 if(!r)return "";
 if(r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
    String(r.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Pending FSSAI identity mismatch; legal source decision withheld. No PASS.</div>';
 const e=s=>typeof esc==="function"?esc(String(s)):String(s).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[z]));
 return '<details class="card" style="margin-top:12px"><summary><b>Remaining exact FSSAI contaminant article — evidence still needed</b> · '+
 e(r.product_name)+'</summary>'+
 '<div class="notice"><b>FIRST NAMED FINISHED-ARTICLE SOURCE PENDING.</b> This is an individual proof blocker, not a regulatory exemption or laboratory result.</div>'+
 '<p><b>Why this article is not yet assigned:</b> '+e(r.exact_finished_product_boundary)+'</p>'+
 '<p><b>Positive evidence required:</b> '+e(r.positive_documentary_evidence_to_obtain)+'</p>'+
 '<p><b>Prohibited article transfer:</b> '+e(r.prohibited_source_article_transfer)+'</p>'+
 (r.prior_named_articles_review_only.length?'<p><b>Previously considered source-row keys — NOT APPLIED:</b> '+
 e(r.prior_named_articles_review_only.join(", "))+'</p>':"")+
 '<div class="notice"><b>No automatic metal, toxin, pesticide or veterinary MRL; no tested-lot / full compliance PASS.</b></div>'+
 '<small><a href="'+e(r.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official FSSAI CTR IX</a> · '+
 '<a href="'+e(r.official_identity)+'" target="_blank" rel="noopener noreferrer">Official FoSCoS product identity</a></small></details>';
}
var pmsvBefore40LegalHtml=pmsv457Html;
pmsv457Html=function(p){
 const base=typeof pmsvBefore40LegalHtml==="function"?pmsvBefore40LegalHtml(p):"";
 return base+pmsv40LegalGatesHtml(p);
};
