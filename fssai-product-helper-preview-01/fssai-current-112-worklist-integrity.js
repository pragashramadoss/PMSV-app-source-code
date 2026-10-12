"use strict";
/* Canonical outstanding source checklist: 112 identities, not historical 116.
 * Preserve earlier locally stored research notes, but bind their access
 * to the latest authenticated pending ledger. */
var pmsv2026Current112Worklist=null;
const pmsv2026Current112Digest="076450a70d89504e";
function pmsv2026Current112Valid(){
 const d=pmsv2026Current112Worklist,l=pmsv2026Current421Ledger,
  old=pmsvCurrent116ProofWorklist,m=pmsv2026GolakaManifest;
 if(!d||!old||!l||!m||
   typeof pmsv2026GolakaFirstSourceValid!=="function"||
   !pmsv2026GolakaFirstSourceValid()||
   typeof pmsvCurrent116DocumentaryIntegrity!=="function"||
   !pmsvCurrent116DocumentaryIntegrity()||
   typeof pmsvReviewSnapshotDigest!=="function"||
   pmsvReviewSnapshotDigest(d)!==pmsv2026Current112Digest||
   d.schema_version!=="2.0"||
   d.catalogue!==533||d.partial_exact!==421||d.first_source_pending!==112||
   d.completed_compliance!==0||d.archive_116_count!==116||
   d.subsequent_promotions!==4||
   d.source_version!==contaminantsDb.source_version||
   d.official_contaminants_source!==contaminantsDb.official_sources?.[0]?.url||
   d.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
   d.no_finished_numeric_auto_application!==true||
   d.no_sample_lab_pass!==true||d.no_complete_regulatory_clearance!==true||
   d.review_records?.length!==112||d.promoted_catalog_ids?.length!==4||
   old.records?.length!==116)return false;
 const promoted=new Set(d.promoted_catalog_ids);
 const original=new Map(old.records.map(x=>[x.catalog_id,x]));
 if(promoted.size!==4||!promoted.has(m.product.catalog_id)||
   !pmsv2026FirstSourcePromotionManifest?.records?.every(x=>promoted.has(x.catalog_id))||
   original.size!==116)return false;
 const pending=l.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING");
 const pendingIds=new Set(pending.map(x=>x.catalog_id));
 if(pendingIds.size!==112||new Set(d.review_records.map(x=>x.catalog_id)).size!==112||
    pending.some(x=>!original.has(x.catalog_id))||
    d.promoted_catalog_ids.some(id=>pendingIds.has(id)||!original.has(id)))return false;
 for(const r of d.review_records){
   if(!pendingIds.has(r.catalog_id)||
      JSON.stringify(r)!==JSON.stringify(original.get(r.catalog_id))||
      r.first_exact_source_verified!==false||
      r.numeric_finished_food_limit_auto_applied!==false||
      r.finished_food_laboratory_pass!==false||
      r.full_regulatory_compliance_approval!==false||
      !r.proof_branches?.length||
      !r.proof_branches.every(x=>x.required_evidence?.length>0)||
      !/^https:\/\/(?:www\.)?(?:fssai\.gov\.in|foscos\.fssai\.gov\.in|fcstraining\.fssai\.gov\.in)\//.test(r.official_finished_product_source)||
      r.official_contaminant_source!==d.official_contaminants_source)return false;
 }
 return true;
}
var pmsv2026Before112Loader=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsv2026Before112Loader();
 pmsv2026Current112Worklist=null;
 try{
  const r=await fetch("./data/rules/fssai-current-112-first-exact-source-proof-worklist-2026-10-12.json?v=20261012-current112",{cache:"reload"});
  if(!r.ok)throw Error("Current 112 source proof worklist unavailable");
  pmsv2026Current112Worklist=await r.json();
  if(!pmsv2026Current112Valid())throw Error("Current 112 source proof count or finished-product record mismatch");
 }catch(e){pmsv2026Current112Worklist=null;}
};
/* Prevent archive-based local evidence export/selection for all four
 * recently promoted identities; 112 outstanding cases retain their
 * existing storage fingerprints and notes. */
var pmsv2026Prior116Valid=pmsv116Valid;
pmsv116Valid=function(p){
 return pmsv2026Current112Valid()&&
  pmsv2026Current112Worklist.review_records.some(r=>r.catalog_id===p?.id)&&
  pmsv2026Current421Ledger.records.some(r=>r.catalog_id===p?.id&&
    r.source_status==="FIRST_EXACT_SOURCE_PENDING")&&
  pmsv2026Prior116Valid(p);
};