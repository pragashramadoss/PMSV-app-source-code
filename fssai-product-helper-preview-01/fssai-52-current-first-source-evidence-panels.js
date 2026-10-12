"use strict";
/* 52 exact product-identity blockers not covered by the earlier 37 dossiers.
   Read-only, official-source-only. Never auto-assign numerical limits or PASS. */
var pmsv52Dossiers=null;
const pmsv52Digest="93ebfbc69cd3d98b";
function pmsv52Valid(){
 const d=pmsv52Dossiers,q=pmsv89Queue,old=pmsv89Dossier,l=pmsv444Ledger;
 if(typeof pmsv444Valid!=="function"||!pmsv444Valid()||
    typeof pmsvReviewSnapshotDigest!=="function"||!d||!q||!old||!l||
    pmsvReviewSnapshotDigest(d)!==pmsv52Digest||
    d.schema_version!=="1.0"||d.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
    d.regulatory_version!=="Version IX (03.02.2026)"||
    d.source_kind!=="FIRST_NAMED_FINISHED_PRODUCT_ARTICLE_PROOF_STILL_REQUIRED"||
    d.catalogue!==533||d.partial_exact!==444||d.first_source_pending!==89||
    d.prior_individually_audited!==37||d.new_individually_reviewed!==52||
    d.complete_regulatory_approvals!==0||d.automatic_numeric_product_limits!==0||
    d.records?.length!==52||l.records?.length!==533||
    d.official_ctr!==q.official_contaminants_source)return false;
 const waiting=new Map(l.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>[x.catalog_id,x]));
 const work=new Map(q.review_records.map(x=>[x.catalog_id,x]));
 const audited=new Set(old.audited_records.map(x=>x.catalog_id)),seen=new Set();
 if(waiting.size!==89||work.size!==89||audited.size!==37||
    [...audited].some(id=>!waiting.has(id)))return false;
 const official=url=>typeof url==="string"&&
  /^https:\/\/(?:(?:www|foscos|fcstraining)\.)?fssai\.gov\.in\//i.test(url);
 for(const r of d.records){
  const p=waiting.get(r.catalog_id),w=work.get(r.catalog_id);
  if(!p||!w||audited.has(r.catalog_id)||seen.has(r.catalog_id)||
   r.product_name!==w.product_name||r.product_name!==p.product_name||
   String(r.fssr||"")!==String(p.fssr||"")||
   String(r.fcs||"")!==String(p.fcs||"")||
   r.current_review_group!==w.current_review_group||
   r.source_packet!==w.source_packet||
   r.official_product_source!==w.official_finished_product_source||
   r.official_contaminant_source!==w.official_contaminant_source||
   !official(r.official_product_source)||!official(r.official_contaminant_source)||
   r.official_contaminant_source!==d.official_ctr||
   r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"||
   r.status!=="FIRST_EXACT_SOURCE_PENDING"||
   !r.source_qualifier_decision||r.source_qualifier_decision.length<60||
   r.forbidden_transfer!==w.forbidden_transfer||
   JSON.stringify(r.positive_proof_to_obtain)!==
     JSON.stringify(w.proof_branches.flatMap(x=>x.required_evidence))||
   JSON.stringify(r.reference_articles_comparison_only)!==
     JSON.stringify(w.referenced_articles_review_only)||
   r.first_exact_source_verified!==false||r.actual_finished_matrix_verified!==false||
   r.operative_amendments_rechecked!==false||
   r.automatic_numeric_limit_applied!==false||r.laboratory_pass!==false||
   r.full_regulatory_compliance!==false)return false;
  seen.add(r.catalog_id);
 }
 return seen.size===52&&[...waiting.keys()].every(id=>audited.has(id)||seen.has(id));
}
var pmsvBefore52Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore52Load();
 pmsv52Dossiers=null;
 try{
  const response=await fetch("./data/rules/fssai-52-current-first-source-finished-product-dossiers-2026-10-12.json?v=20261012-current52",{cache:"reload"});
  if(!response.ok)throw Error("Current 52 finished-product source blockers unavailable");
  pmsv52Dossiers=await response.json();
  if(!pmsv52Valid())throw Error("Current 52 FSSAI source dossiers do not reconcile");
 }catch(_){pmsv52Dossiers=null;}
};
function pmsv52Html(p){
 if(p&&typeof pmsv457Valid==="function"&&pmsv457Valid()&&pmsv457PromotedIds.includes(p.id))return "";
 if(p&&typeof pmsv450Valid==="function"&&pmsv450Valid()&&pmsv450Ids.includes(p.id))return "";
 if(p&&typeof pmsv446Valid==="function"&&pmsv446Valid()&&pmsv446PromotedIds.includes(p.id))return "";
 if(!p||!pmsv89Queue?.review_records?.some(x=>x.catalog_id===p.id)||
  pmsv89Dossier?.audited_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsv52Valid())
  return '<div class="notice"><b>Current source dossier withheld.</b> Authenticated first-source evidence is unavailable; no numeric limit or PASS is assigned.</div>';
 const r=pmsv52Dossiers.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||
    String(r.fssr||"")!==String(p.fssr||"")||
    String(r.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Current finished-product identity mismatch; first-source research withheld.</div>';
 const safe=x=>typeof esc==="function"?esc(String(x)):String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
 const list=r.positive_proof_to_obtain.map(x=>"<li>"+safe(x)+"</li>").join("");
 const compare=r.reference_articles_comparison_only.length?
 "<p><b>Named official article references for comparison only — NOT APPLIED:</b> "+
 r.reference_articles_comparison_only.map(safe).join("; ")+"</p>":
 "<p><b>No unique named contaminant article identified.</b> Official first-source match is still required.</p>";
 return '<details class="card" style="margin-top:12px"><summary><b>Product-specific FSSAI first-source gap — '+safe(r.product_name)+
 '</b> · Pending evidence</summary><div class="notice"><b>EXACT FINISHED-ARTICLE SOURCE NOT YET VERIFIED.</b> No contaminant limit, laboratory approval or compliance PASS is assigned.</div>'+
 '<p><b>Finished-product scope decision:</b> '+safe(r.source_qualifier_decision)+'</p>'+
 '<p><b>Positive evidence required:</b></p><ul>'+list+'</ul>'+
 '<p><b>Prohibited inheritance:</b> '+safe(r.forbidden_transfer)+'</p>'+compare+
 '<small><a target="_blank" rel="noopener noreferrer" href="'+safe(r.official_product_source)+'">Official FSSAI/FoSCoS product source</a> · '+
 '<a target="_blank" rel="noopener noreferrer" href="'+safe(r.official_contaminant_source)+'">Official CTR Version IX</a></small></details>';
}
var pmsvBefore52ProofHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 return pmsvBefore52ProofHtml(p)+pmsv52Html(p);
};
