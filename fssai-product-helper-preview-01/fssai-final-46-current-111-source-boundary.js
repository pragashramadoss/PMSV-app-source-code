"use strict";
/* 46 final pending current 111 product-specific official boundaries, no auto PASS. */
var pmsvCurrent46BoundaryDb=null;
const pmsvCurrent46BoundaryDigest="b0c210194198e4d2";
function pmsvCurrent46BoundaryValid(){
 const m=pmsvCurrent46BoundaryDb,q=pmsv2026Current111Queue,p=pmsvCurrent65Matrix;
 if(typeof pmsv2026Current422Valid!=="function"||!pmsv2026Current422Valid()||
    typeof pmsv2026Decision111Valid!=="function"||!pmsv2026Decision111Valid()||
    typeof pmsvCurrent65Valid!=="function"||!pmsvCurrent65Valid()||
    typeof pmsvReviewSnapshotDigest!=="function"||
    !m||!q||!p||pmsvReviewSnapshotDigest(m)!==pmsvCurrent46BoundaryDigest||
    m.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
    m.current_ledger!=="fssai-current-first-source-533-live-ledger-422-111-2026-10-12.json"||
    m.current_proof_queue!=="fssai-current-111-first-exact-source-proof-worklist-2026-10-12.json"||
    m.preceding_65_dossier!=="fssai-65-current-111-finished-source-decision-matrix-2026-10-12.json"||
    m.official_contaminants!==contaminantsDb?.official_sources?.[0]?.url||
    m.catalogue!==533||m.partial_exact_evidence!==422||m.first_source_pending!==111||
    m.earlier_individual_dossiers!==65||m.new_individual_dossiers!==46||
    m.combined_unique_current_pending_reviewed!==111||
    m.new_first_source_promotions!==0||m.full_regulatory_approvals!==0||
    m.automatic_numeric_finished_food_limits!==false||
    m.records?.length!==46||q.review_records?.length!==111||p.records?.length!==65)return false;
 const old=new Set(p.records.map(x=>x.catalog_id));
 const now=new Set(),pending=new Map(q.review_records.map(x=>[x.catalog_id,x]));
 for(const r of m.records){
  const x=pending.get(r.catalog_id);
  if(!x||old.has(r.catalog_id)||now.has(r.catalog_id)||
     r.product_name!==x.product_name||
     String(r.fssr||"")!==String(x.fssr||"")||
     String(r.fcs||"")!==String(x.fcs||"")||
     JSON.stringify(r.known_named_article_candidates_research_only)!==
       JSON.stringify(x.referenced_articles_review_only||[])||
     r.official_finished_ctr_article_verified!==false||
     r.numeric_compliance_limit_auto_applied!==false||
     r.regulatory_clearance!==false||r.analytical_lot_pass!==false||
     !/^https:\/\/([a-z0-9-]+\.)*fssai\.gov\.in\//.test(r.fssai_source)||
     r.contaminant_source!==m.official_contaminants||
     typeof r.affirmative_product_identity_or_scope!=="string"||
     r.affirmative_product_identity_or_scope.length<35||
     typeof r.prohibited_inheritance!=="string"||r.prohibited_inheritance.length<29||
     typeof r.missing_affirmative_ctr_evidence!=="string"||
     r.missing_affirmative_ctr_evidence.length<30)return false;
  now.add(r.catalog_id);
 }
 return now.size===46&&new Set([...old,...now]).size===111&&
   q.review_records.every(x=>old.has(x.catalog_id)||now.has(x.catalog_id));
}
var pmsvBefore46Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore46Load();pmsvCurrent46BoundaryDb=null;
 try{
  const res=await fetch("./data/rules/fssai-final-46-current-111-source-boundary-2026-10-12.json?v=20261012-current46",{cache:"reload"});
  if(!res.ok)throw Error("Current 46 documentary record unavailable");
  pmsvCurrent46BoundaryDb=await res.json();
  if(!pmsvCurrent46BoundaryValid())throw Error("Current source evidence drift");
 }catch(_){pmsvCurrent46BoundaryDb=null}
};
var pmsvPrevious46Proof=pmsv2026Current111ProofHtml;
pmsv2026Current111ProofHtml=function(prod){
 const old=pmsvPrevious46Proof(prod);
 if(!prod||!pmsv2026Current111Queue?.review_records?.some(x=>x.catalog_id===prod.id))return old;
 const x=pmsvCurrent46BoundaryDb?.records?.find(x=>x.catalog_id===prod.id);
 if(!x)return old;
 if(!pmsvCurrent46BoundaryValid())
  return old+'<div class="notice"><b>46-product FSSAI source boundary withheld.</b> Identity/digest mismatch. No compliance PASS.</div>';
 if(x.product_name!==prod.name||String(x.fssr||"")!==String(prod.fssr||"")||
    String(x.fcs||"")!==String(prod.fcs||""))
  return old+'<div class="notice">Pending product identity changed; regulatory evidence withheld.</div>';
 return old+'<details class="card" style="margin-top:12px"><summary><b>Further official identity review (remaining 46)</b></summary>'+
 '<div class="notice"><b>CURRENTLY UNRESOLVED — NO FINISHED CTR NUMERIC SOURCE OR LABORATORY PASS.</b></div>'+
 '<p><b>Official definition scope:</b> '+esc(x.affirmative_product_identity_or_scope)+'</p>'+
 '<p><b>Forbidden limit transfer:</b> '+esc(x.prohibited_inheritance)+'</p>'+
 '<p><b>Needed first-source evidence:</b> '+esc(x.missing_affirmative_ctr_evidence)+'</p>'+
 '<p><small>'+x.known_named_article_candidates_research_only.length+
 ' research-only CTR candidate(s) — none assigned; '+esc(x.group)+'.</small></p>'+
 '<small><a href="'+esc(x.fssai_source)+'" target="_blank" rel="noopener noreferrer">Official FSSAI identity source</a> · '+
 '<a href="'+esc(x.contaminant_source)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX</a></small></details>';
};
