"use strict";
/* FSSAI finished-product QUALITY only, for 16 of the current 76 contaminant-first-source
   pending identities. Does not promote source status, apply metal limits or issue PASS. */
var pmsvQuality16Data=null;
const pmsvQuality16Hash="0960523f1be287e6";
function pmsvQuality16Valid(){
 if(typeof pmsv457Valid!=="function"||!pmsv457Valid()||
    typeof pmsvReviewSnapshotDigest!=="function")return false;
 const d=pmsvQuality16Data,l=pmsv457Ledger,q=pmsv76Queue;
 if(!d||!l||!q||
 pmsvReviewSnapshotDigest(d)!==pmsvQuality16Hash||
 d.schema_version!=="1.0"||
 d.source_policy!=="OFFICIAL_FSSAI_ONLY"||
 d.source_scope!=="FINISHED_PRODUCT_QUALITY_STANDARDS_DISTINCT_FROM_CONTAMINANTS"||
 d.official_ctr!==l.official_contaminants_source||
 d.official_fssr!=="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_3_Fruit%20%20Vegetable%20products.pdf"||
 d.catalogue!==533||d.partial_named_contaminant_sources!==457||
 d.first_source_pending!==76||d.reviewed_pending_products!==16||
 d.full_regulatory_passes!==0||d.auto_contaminant_limit_assignment!==false||
 d.records?.length!==16||l.records?.length!==533||
 l.partial_exact!==457||l.first_source_pending!==76||
 q.review_records?.length!==76)return false;
 const remaining=new Map(q.review_records.map(x=>[x.catalog_id,x]));
 const current=new Map(l.records.map(x=>[x.catalog_id,x])),seen=new Set();
 let criteria=0;
 for(const r of d.records){
  const qrow=remaining.get(r.catalog_id),lrow=current.get(r.catalog_id);
  if(seen.has(r.catalog_id)||!qrow||!lrow||
    r.product_name!==qrow.product_name||r.product_name!==lrow.product_name||
    r.fssr!==qrow.fssr||r.fssr!==lrow.fssr||
    String(r.fcs||"")!==String(qrow.fcs||"")||
    String(r.fcs||"")!==String(lrow.fcs||"")||
    r.official_ctr!==d.official_ctr||
    r.official_product_standard!==d.official_fssr||
    !Number.isInteger(r.source_pdf_page_zero_index)||
    r.source_pdf_page_zero_index<0||r.source_pdf_page_zero_index>105||
    r.verified_quality_source_only!==true||
    r.first_named_contaminant_source_still_pending!==true||
    lrow.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    r.actual_lot_testing_verified!==false||
    r.product_compliance_approval!==false||
    r.contaminant_numeric_limit_auto_applied!==false||
    !r.positive_product_identification_to_verify||
    !r.forbidden_contaminant_transfer||
    !Array.isArray(r.quality_criteria)||r.quality_criteria.length<1)return false;
  for(const c of r.quality_criteria){
   if(!["min","max","absent","negative","equal-to-standard"].includes(c.op)||
      typeof c.name!=="string"||!c.name||!Number.isFinite(c.value)||
      !c.unit||!c.basis||typeof c.condition!=="string")return false;
   criteria++;
  }
  seen.add(r.catalog_id);
 }
 return criteria===46&&d.quality_criteria_count===46&&seen.size===16;
}
var pmsvBeforeQuality16Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBeforeQuality16Load();
 pmsvQuality16Data=null;
 try{
  const res=await fetch("./data/rules/fssai-16-current-pending-finished-product-quality-source-audit-2026-10-12.json?v=20261012-quality16",{cache:"reload"});
  if(!res.ok)throw Error("Official finished-quality source data missing");
  pmsvQuality16Data=await res.json();
  if(!pmsvQuality16Valid())throw Error("Finished-quality source identity mismatch");
 }catch(_){pmsvQuality16Data=null;}
};
function pmsvQuality16Html(p){
 if(!p||!pmsv76Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvQuality16Valid())
  return '<div class="notice">Current FSSAI product-quality evidence withheld pending source validation. No contaminant limit or PASS.</div>';
 const r=pmsvQuality16Data.records.find(x=>x.catalog_id===p.id);
 if(!r)return "";
 if(r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
 String(r.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">Finished-product identity mismatch. Quality evidence withheld; no PASS.</div>';
 const safe=x=>typeof esc==="function"?esc(String(x)):String(x).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[z]));
 const action={min:"≥",max:"≤",absent:"Absent (0)",negative:"Negative", "equal-to-standard":"Standard specifies"};
 let rows="";
 for(const x of r.quality_criteria){
  let formatted=x.op==="absent"||x.op==="negative"?action[x.op]:
   action[x.op]+" "+safe(x.value)+" "+safe(x.unit);
  rows+='<tr><td>'+safe(x.name)+'</td><td>'+formatted+'</td><td>'+
   safe(x.basis)+(x.condition?"; "+safe(x.condition):"")+'</td></tr>';
 }
 return '<details class="card" style="margin-top:12px"><summary><b>Exact FSSAI finished-product QUALITY standard</b> · '+safe(r.fssr)+
 '</summary><div class="notice"><b>QUALITY SOURCE ONLY — FIRST CONTAMINANT ARTICLE STILL PENDING.</b> Not a tested-lot result, full safety assessment, or compliance PASS.</div>'+
 '<table><thead><tr><th>Quality parameter</th><th>FSSR criterion</th><th>Analytical basis / subtype</th></tr></thead><tbody>'+rows+'</tbody></table>'+
 '<p><b>Verify product identity:</b> '+safe(r.positive_product_identification_to_verify)+'</p>'+
 '<p><b>Do not inherit a contaminant article:</b> '+safe(r.forbidden_contaminant_transfer)+'</p>'+
 '<small><a target="_blank" rel="noopener noreferrer" href="'+safe(r.official_product_standard)+'">Official FSSAI FSSR Chapter 2.3 (PDF page '+safe(r.source_pdf_page_zero_index+1)+')</a> · '+
 '<a target="_blank" rel="noopener noreferrer" href="'+safe(r.official_ctr)+'">Official CTR Version IX</a></small></details>';
}
var pmsvBeforeQuality16Panel=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 const quality=pmsvQuality16Html(p);
 return quality+pmsvBeforeQuality16Panel(p);
};
