"use strict";
/* Authenticated CURRENT 111 pending proof packets, no obsolete 116/121 product
 * warnings. Official positive definition is not a finished-product CTR match.
 * Preserve local notes and never assign numeric limits or compliance PASS. */
var pmsv2026Decision111Db=null;
const pmsv2026Decision111Digest="f186347402562c05";
function pmsv2026Decision111Valid(){
 const d=pmsv2026Decision111Db,q=pmsv2026Current111Queue,ledger=pmsv2026Current422Ledger;
 if(typeof pmsv2026Current422Valid!=="function"||!pmsv2026Current422Valid()||
   typeof pmsvLive111ReferenceValid!=="function"||!pmsvLive111ReferenceValid()||
   typeof pmsvReviewSnapshotDigest!=="function"||!d||!q||!ledger||
   pmsvReviewSnapshotDigest(d)!==pmsv2026Decision111Digest||
   d.policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
   d.official_ctr!==contaminantsDb?.official_sources?.[0]?.url||
   d.original_worklist!=="fssai-current-111-first-exact-source-proof-worklist-2026-10-12.json"||
   d.original_ledger!=="fssai-current-first-source-533-live-ledger-422-111-2026-10-12.json"||
   d.catalogue!==533||d.partial_exact!==422||d.pending!==111||
   d.verified_full_compliance!==0||d.affirmatively_matched_new_products!==0||
   d.old_116_and_121_cards_are_archives!==true||
   d.preserve_current_111_local_notes!==true||
   d.same_111_catalog_ids!==true||d.proof_is_documentary_not_operator_checkbox!==true||
   d.records?.length!==111||q.review_records?.length!==111||
   ledger.records?.length!==533||
   new Set(d.records.map(x=>x.catalog_id)).size!==111)return false;
 const orig=new Map(q.review_records.map(x=>[x.catalog_id,x]));
 for(const r of d.records){
  const x=orig.get(r.catalog_id);
  const y=ledger.records.find(v=>v.catalog_id===r.catalog_id);
  if(!x||!y||x.catalog_id!==r.catalog_id||
    x.product_name!==r.product_name||
    String(x.fssr||"")!==String(r.fssr||"")||
    String(x.fcs||"")!==String(r.fcs||"")||
    x.current_review_group!==r.current_group||
    y.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    r.exact_first_source_verified!==false||
    r.finished_food_numeric_limit_auto_applied!==false||
    r.full_compliance_pass!==false||r.lab_pass!==false||
    r.official_ctr_source!==d.official_ctr||
    !/^https:\/\/(?:www\.)?fssai\.gov\.in\//.test(r.official_product_source)||
    typeof r.positive_official_definition_or_limitation!=="string"||
    r.positive_official_definition_or_limitation.length<45||
    typeof r.missing_positive_evidence!=="string"||
    r.missing_positive_evidence.length<40||
    r.branch_count!==x.proof_branches.length||
    JSON.stringify(r.named_reference_labels)!==JSON.stringify(x.referenced_articles_review_only)||
    JSON.stringify(r.proof_branches)!==JSON.stringify(x.proof_branches.map(b=>({
      branch:b.branch,required_evidence:b.required_evidence,article_names:b.source_article_candidates
    })))||
    r.named_regulatory_rows_research_only!==
      x.referenced_articles_review_only.filter(k=>
       pmsvLive111ReferenceDb.references.some(ref=>ref.key===k&&!!ref.source_id)).length)return false;
 }
 return true;
}
var pmsv2026Before111DecisionLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsv2026Before111DecisionLoad();
 pmsv2026Decision111Db=null;
 try{
  const response=await fetch("./data/rules/fssai-current-111-positive-proof-gates-2026-10-12.json?v=20261012-precise111",{cache:"reload"});
  if(!response.ok)throw Error("Current 111 documentary proof file missing");
  pmsv2026Decision111Db=await response.json();
  if(!pmsv2026Decision111Valid())throw Error("Pending source proof data changed");
 }catch(_){pmsv2026Decision111Db=null}
};
function pmsv2026Current111ProofHtml(p){
 const q=pmsv2026Current111Queue?.review_records?.find(x=>x.catalog_id===p?.id);
 if(!q)return "";
 if(!pmsv2026Decision111Valid())
  return '<div class="notice"><b>Current 111-product source proof withheld.</b> Official source or identity integrity failed; no numerical limit or PASS.</div>';
 const r=pmsv2026Decision111Db.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
   String(r.fcs||"")!==String(p.fcs||""))return '<div class="notice">Current product identity mismatch; no source assignment.</div>';
 return '<details class="card" style="margin-top:12px" open><summary><b>Current first-source decision — 111 remaining</b></summary>'+
  '<div class="notice"><b>FIRST EXACT FINISHED-ARTICLE SOURCE PENDING; NO COMPLIANCE PASS.</b> '+
  'FSSR product identity, an official CTR source row and applicable finished-food limits are separate evidence steps.</div>'+
  '<p><b>Verified definition / limitation:</b> '+esc(r.positive_official_definition_or_limitation)+'</p>'+
  '<p><b>Required affirmative evidence:</b> '+esc(r.missing_positive_evidence)+'</p>'+
  '<p><small>There are '+r.branch_count+' legal product form hypothesis/hypotheses and '+
  r.named_regulatory_rows_research_only+' checked named CTR reference row(s); <b>none applied</b>.</small></p>'+
  '<ul>'+r.proof_branches.map(b=>'<li><b>'+esc(b.branch)+'</b>: '+
      b.required_evidence.map(esc).join("; ")+
      (b.article_names.length?'. CTR research candidate(s): '+b.article_names.map(esc).join("; "):"")+
     ' — NOT YET PROVEN</li>').join("")+'</ul>'+
  '<small><a href="'+esc(r.official_product_source)+'" target="_blank" rel="noopener noreferrer">Official product/identity source</a> · '+
  '<a href="'+esc(r.official_ctr_source)+'" target="_blank" rel="noopener noreferrer">CTR Version IX</a></small></details>';
}
var pmsv2026PreDecisionProof=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 if(!p)return "";
 if(typeof pmsv2026Current422Valid!=="function"||!pmsv2026Current422Valid())
  return '<div class="notice"><b>Current FSSAI evidence withheld.</b> Latest source ledger unavailable.</div>';
 const active=pmsv2026Current111Queue.review_records.some(r=>r.catalog_id===p.id);
 if(active)return pmsv2026Current111ProofHtml(p)+pmsvLive111ReferencesHtml(p);
 // Historical archive panels must not describe the five promoted products as pending.
 if(pmsv2026Current111Queue.promoted_catalog_ids.includes(p.id))
   return pmsv2026Current422Html(p);
 return pmsv2026PreDecisionProof(p);
};
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(typeof pmsv2026Current422Valid!=="function"||!pmsv2026Current422Valid())
  return '<div class="notice"><b>Local evidence withheld.</b> Current source ledger unavailable.</div>';
 const r=pmsv2026Current111Queue.review_records.find(x=>x.catalog_id===p.id);
 if(!r)return "";
 if(!pmsv2026Decision111Valid())
  return '<div class="notice"><b>Local evidence withheld.</b> Current 111 proof file failed verification.</div>';
 if(r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
    String(r.fcs||"")!==String(p.fcs||""))return "";
 return typeof pmsv116LocalEvidenceHtml==="function"?pmsv116LocalEvidenceHtml(p):
  '<div class="notice">Local checklist unavailable. No compliance PASS.</div>';
};
