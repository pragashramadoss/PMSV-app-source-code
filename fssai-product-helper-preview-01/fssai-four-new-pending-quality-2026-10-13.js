"use strict";
/* Exact FSSR quality standards for FOUR still-CTR-pending products.
 * The FSSR quality dossier NEVER supplies CTR metal/toxin/pesticide applicability or PASS.
 */
var pmsvQ4Data=null;
const pmsvQ4Digest="adae41fcdbcd3fd3";
const pmsvQ4Expected=Object.freeze({
 "06-06-1-quinoa":8,"06-06-1-chia-seeds":9,
 "formulated-supplements-children":5,"08-08-4-animal-casings":4
});
function pmsvQ4Valid(){
 if(typeof pmsv493Valid!=="function"||!pmsv493Valid()||
 typeof pmsvReviewSnapshotDigest!=="function"||
 !pmsvQ4Data||!pmsv40Queue||!pmsv493Ledger||
 pmsvReviewSnapshotDigest(pmsvQ4Data)!==pmsvQ4Digest)return false;
 const d=pmsvQ4Data,queue=new Map(pmsv40Queue.review_records.map(x=>[x.catalog_id,x])),
 ledger=new Map(pmsv493Ledger.records.map(x=>[x.catalog_id,x]));
 if(d.schema_version!=="1.0"||d.official_policy!=="FSSAI_FSSR_ONLY"||
 d.scope!=="FOUR_ADDITIONAL_FINISHED_PRODUCT_QUALITY_STANDARDS_NOT_CTR_ARTICLE"||
 d.catalogue!==533||d.partial_ctr_sources!==493||d.first_ctr_source_pending!==40||
 d.previous_fssr_dossiers!==26||d.new_fssr_dossiers!==4||
 d.current_fssr_dossiers!==30||d.remaining_quality_dossiers_to_link!==10||
 d.numeric_ctr_limits_auto_applied!==false||d.any_lab_pass!==false||
 d.any_regulatory_clearance!==false||d.records?.length!==4||
 pmsv493Ledger.partial_exact!==493||pmsv493Ledger.first_source_pending!==40||
 pmsv40Queue.review_records?.length!==40)return false;
 const expected=new Set(Object.keys(pmsvQ4Expected)),seen=new Set();
 for(const x of d.records){
   const a=queue.get(x.catalog_id),b=ledger.get(x.catalog_id);
   if(!expected.has(x.catalog_id)||seen.has(x.catalog_id)||!a||!b||
     x.product_name!==a.product_name||x.product_name!==b.product_name||
     String(x.fssr||"")!==String(a.fssr||"")||
     String(x.fcs||"")!==String(a.fcs||"")||
     b.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
     !x.official_chapter||!x.source_pages||!x.identity_and_nontransfer_note||
     !/^https:\/\/(www\.)?fssai\.gov\.in\//.test(x.official_source_url)||
     x.quality_evidence_type!=="NUMERIC_STANDARD"&&
       x.quality_evidence_type!=="QUALITATIVE_STANDARD"||
     x.requirements?.length!==pmsvQ4Expected[x.catalog_id]||
     x.exact_fssr_quality_reference_linked!==true||
     x.current_ctr_first_source_status!=="FIRST_EXACT_SOURCE_PENDING"||
     x.finished_lot_identity_verified!==false||
     x.actual_laboratory_results_verified!==false||
     x.product_quality_compliance_pass!==false||
     x.ctr_named_finished_article_confirmed!==false||
     x.numeric_ctr_limits_auto_applied!==false||
     x.complete_regulatory_clearance!==false)return false;
   if(x.requirements.some(z=>!z.parameter||!z.relation||z.value===null||
     z.value===undefined||!z.unit))return false;
   seen.add(x.catalog_id);
 }
 return seen.size===4;
}
var pmsvBeforeQ4Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBeforeQ4Load();pmsvQ4Data=null;
 try{
   const r=await fetch("./data/rules/fssai-four-new-current-pending-quality-sources-2026-10-13.json?v=20261013-q4",{cache:"reload"});
   if(!r.ok)throw Error("Current exact FSSR Q4 evidence missing");
   pmsvQ4Data=await r.json();
   if(!pmsvQ4Valid())throw Error("Q4 source/CTR evidence fails closed");
 }catch(_){pmsvQ4Data=null;}
};
function pmsvQ4Html(p){
 if(!p||!Object.prototype.hasOwnProperty.call(pmsvQ4Expected,p.id))return "";
 if(!pmsvQ4Valid())return '<div class="notice">Four new official FSSR quality dossiers unavailable or invalid. No CTR limit or PASS.</div>';
 const r=pmsvQ4Data.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
 String(r.fcs||"")!==String(p.fcs||""))return '<div class="notice">FSSR quality identity mismatch; no result or PASS.</div>';
 const e=s=>typeof esc==="function"?esc(String(s)):String(s).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;":"&quot;","'":"&#39;"}[z]));
 return '<details class="card" style="margin-top:12px"><summary><b>Verified finished-product FSSR quality dossier</b> · '+e(r.official_chapter)+'</summary>'+
  '<div class="notice"><b>QUALITY STANDARD ONLY.</b> The exact CTR named contaminant article is still pending. No lot, laboratory PASS or full approval.</div>'+
  '<p><b>Official clause:</b> '+e(r.official_chapter)+' · '+e(r.source_pages)+'</p>'+
  '<p><b>Source identity / no transfer:</b> '+e(r.identity_and_nontransfer_note)+'</p><ul>'+
  r.requirements.map(t=>'<li>'+e(t.parameter)+' — '+e(t.relation)+' '+e(t.value)+' '+e(t.unit)+'</li>').join("")+'</ul>'+
  '<small><a href="'+e(r.official_source_url)+'" target="_blank" rel="noopener noreferrer">Read exact FSSAI chapter</a></small></details>';
}
