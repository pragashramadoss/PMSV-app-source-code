"use strict";
/* Current 111: 65 authentic conditional finished-food source decisions.
 * Additional research only: never assign a numeric legal limit or PASS. */
var pmsvCurrent65Matrix=null;
const pmsvCurrent65Digest="3f24602f5996ea42";
function pmsvCurrent65Valid(){
 const m=pmsvCurrent65Matrix,q=pmsv2026Current111Queue,ledger=pmsv2026Current422Ledger;
 if(typeof pmsv2026Current422Valid!=="function"||!pmsv2026Current422Valid()||
    typeof pmsv2026Decision111Valid!=="function"||!pmsv2026Decision111Valid()||
    typeof pmsvReviewSnapshotDigest!=="function"||
    !m||!q||!ledger||pmsvReviewSnapshotDigest(m)!==pmsvCurrent65Digest||
    m.policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
    m.current_queue!=="fssai-current-111-first-exact-source-proof-worklist-2026-10-12.json"||
    m.current_ledger!=="fssai-current-first-source-533-live-ledger-422-111-2026-10-12.json"||
    m.official_ctr!==contaminantsDb?.official_sources?.[0]?.url||
    m.catalogue!==533||m.partial_exact_source!==422||m.still_pending!==111||
    m.individually_reviewed!==65||m.records?.length!==65||
    m.first_source_promotions!==0||m.complete_compliance_approvals!==0||
    m.automated_numeric_compliance!==false||
    m.documentary_source_review_not_finish_product_pass!==true||
    q.review_records?.length!==111||ledger.records?.length!==533)return false;
 const identities=new Set(), qmap=new Map(q.review_records.map(x=>[x.catalog_id,x]));
 const lmap=new Map(ledger.records.map(x=>[x.catalog_id,x]));
 for(const x of m.records){
  const current=qmap.get(x.catalog_id),s=lmap.get(x.catalog_id);
  if(identities.has(x.catalog_id)||!current||!s||
    x.catalog_id!==s.catalog_id||x.product_name!==current.product_name||
    String(x.fssr||"")!==String(current.fssr||"")||
    String(x.fcs||"")!==String(current.fcs||"")||
    JSON.stringify(x.candidate_reference_keys_not_applied)!==
      JSON.stringify(current.referenced_articles_review_only||[])||
    s.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    x.exact_finished_article_first_source_verified!==false||
    x.numeric_finished_limit_auto_applied!==false||
    x.full_regulatory_compliance_pass!==false||x.tested_lot_pass!==false||
    typeof x.identity_and_source_boundary!=="string"||x.identity_and_source_boundary.length<65||
    typeof x.missing_affirmative_proof!=="string"||x.missing_affirmative_proof.length<55||
    !/^https:\/\/([a-z0-9-]+\.)*fssai\.gov\.in\//.test(x.official_finished_product_source)||
    x.official_contaminant_source!==m.official_ctr)return false;
  identities.add(x.catalog_id);
 }
 return identities.size===65;
}
var pmsvPre65SourceLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvPre65SourceLoad();
 pmsvCurrent65Matrix=null;
 try{
  const r=await fetch("./data/rules/fssai-65-current-111-finished-source-decision-matrix-2026-10-12.json?v=20261012-65source",{cache:"reload"});
  if(!r.ok)throw Error("65 source dossier unavailable");
  pmsvCurrent65Matrix=await r.json();
  if(!pmsvCurrent65Valid())throw Error("65 source dossier failed authentication");
 }catch(_){pmsvCurrent65Matrix=null}
};
var pmsvBefore65Proof=pmsv2026Current111ProofHtml;
pmsv2026Current111ProofHtml=function(p){
 const original=pmsvBefore65Proof(p);
 if(!p||!pmsv2026Current111Queue?.review_records?.some(x=>x.catalog_id===p.id))return original;
 if(!pmsvCurrent65Matrix?.records?.some(x=>x.catalog_id===p.id))return original;
 if(!pmsvCurrent65Valid())return original+
  '<div class="notice"><b>65-product source dossier withheld:</b> product or source changed. No compliance PASS.</div>';
 const x=pmsvCurrent65Matrix.records.find(x=>x.catalog_id===p.id);
 if(!x||x.product_name!==p.name||
    String(x.fssr||"")!==String(p.fssr||"")||
    String(x.fcs||"")!==String(p.fcs||""))return original+
  '<div class="notice">Exact product identity conflict. No numeric source assignment.</div>';
 return original+'<details class="card" style="margin-top:12px"><summary><b>Additional individually verified source boundary (65-product matrix)</b></summary>'+
  '<div class="notice"><b>RESEARCH ONLY — FIRST FINISHED-ARTICLE SOURCE PENDING. NO NUMERIC LIMIT OR COMPLIANCE PASS.</b></div>'+
  '<p><b>Article scope:</b> '+esc(x.identity_and_source_boundary)+'</p>'+
  '<p><b>Required positive regulatory / formulation proof:</b> '+esc(x.missing_affirmative_proof)+'</p>'+
  '<p><small>Candidate CTR source references: '+x.candidate_reference_keys_not_applied.length+
  ' (all research-only). Source identity: '+esc(x.evidence_group)+'.</small></p>'+
  '<small><a href="'+esc(x.official_finished_product_source)+'" target="_blank" rel="noopener noreferrer">Official FSSAI product standard</a> · '+
  '<a href="'+esc(x.official_contaminant_source)+'" target="_blank" rel="noopener noreferrer">FSSAI CTR Version IX</a></small></details>';
};
