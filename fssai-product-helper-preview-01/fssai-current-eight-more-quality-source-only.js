"use strict";
/* Source-only FSSR QUALITY evidence for eight of the still-unresolved 76 foods.
   No finished contaminant article, automatic numeric limits, sample or compliance PASS. */
var pmsvQuality8Data=null;
const pmsvQuality8Digest="879445df47c8b3d4";
function pmsvQuality8Valid(){
 if(typeof pmsvQuality16Valid!=="function"||!pmsvQuality16Valid()||
 typeof pmsv457Valid!=="function"||!pmsv457Valid()||
 typeof pmsvReviewSnapshotDigest!=="function")return false;
 const d=pmsvQuality8Data,q=pmsv76Queue,l=pmsv457Ledger,k=pmsvQuality16Data;
 if(!d||!q||!l||!k||
 pmsvReviewSnapshotDigest(d)!==pmsvQuality8Digest||
 d.schema_version!=="1.0"||d.source_policy!=="OFFICIAL_FSSAI_ONLY"||
 d.quality_type!=="ADDITIONAL_EIGHT_FINISHED_FSSR_QUALITY_ONLY"||
 d.current_catalogue!==533||d.current_partial_first_named_contaminants!==457||
 d.current_pending_first_named_contaminants!==76||d.prior_quality_dossiers!==16||
 d.quality_products_in_this_batch!==8||d.quality_parameter_rows!==56||
 d.source_contaminant_compliance_passes!==0||d.automatic_contaminant_values_applied!==false||
 d.records?.length!==8||q.review_records?.length!==76||
 l.records?.length!==533||l.partial_exact!==457||l.first_source_pending!==76||
 k.records?.length!==16||d.official_ctr!==l.official_contaminants_source)return false;
 const waiting=new Map(q.review_records.map(x=>[x.catalog_id,x]));
 const latest=new Map(l.records.map(x=>[x.catalog_id,x]));
 const older=new Set(k.records.map(x=>x.catalog_id)),seen=new Set();let rows=0;
 for(const x of d.records){
  const p=waiting.get(x.catalog_id),z=latest.get(x.catalog_id);
  if(!p||!z||older.has(x.catalog_id)||seen.has(x.catalog_id)||
  x.product_name!==p.product_name||x.product_name!==z.product_name||
  x.fssr!==p.fssr||x.fssr!==z.fssr||
  String(x.fcs||"")!==String(p.fcs||"")||
  String(x.fcs||"")!==String(z.fcs||"")||
  z.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
  x.official_ctr!==d.official_ctr||
  !/^https:\/\/www\.fssai\.gov\.in\/upload\/uploadfiles\/files\/Chapter%202_(?:5|8|10)/.test(x.official_product_source)||
  x.source_type!=="OFFICIAL_FSSR_QUALITY_ONLY"||
  !Number.isInteger(x.pdf_page_zero_index)||x.pdf_page_zero_index<0||x.pdf_page_zero_index>30||
  x.finished_product_contaminant_article_still_pending!==true||
  x.lot_identity_confirmed!==false||x.actual_lot_lab_results_verified!==false||
  x.numeric_contaminant_limit_applied!==false||x.full_compliance_pass!==false||
  !x.regulatory_qualifier||!x.prohibited_contaminant_transfer||
  !Array.isArray(x.quality_criteria)||!x.quality_criteria.length)return false;
  for(const c of x.quality_criteria){
   if(!["min","max"].includes(c.op)||!Number.isFinite(c.value)||
    !c.name||!c.unit||!c.basis||typeof c.condition!=="string")return false;
   rows++;
  }
  seen.add(x.catalog_id);
 }
 return seen.size===8&&rows===56;
}
var pmsvQuality8PreviousLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvQuality8PreviousLoad();pmsvQuality8Data=null;
 try{
  const r=await fetch("./data/rules/fssai-eight-extra-pending-quality-standards-2026-10-12.json?v=20261012-more8",{cache:"reload"});
  if(!r.ok)throw Error("FSSR quality eight unavailable");
  pmsvQuality8Data=await r.json();
  if(!pmsvQuality8Valid())throw Error("FSSR quality eight source invalid");
 }catch(_){pmsvQuality8Data=null;}
};
function pmsvQuality8Html(p){
 if(!p||!pmsv76Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvQuality8Valid())return '<div class="notice">FSSR quality evidence not authenticated. No contaminant article or PASS.</div>';
 const x=pmsvQuality8Data.records.find(x=>x.catalog_id===p.id);
 if(!x)return "";
 if(x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">Finished-quality identity mismatch; no PASS.</div>';
 const safe=v=>typeof esc==="function"?esc(String(v)):String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
 const rows=x.quality_criteria.map(c=>'<tr><td>'+safe(c.name)+'</td><td>'+
  (c.op==="min"?"≥":"≤")+' '+safe(c.value)+' '+safe(c.unit)+'</td><td>'+
  safe(c.basis)+(c.condition?"; "+safe(c.condition):"")+'</td></tr>').join("");
 return '<details class="card" style="margin-top:12px"><summary><b>Additional official FSSR QUALITY standard</b> · '+
 safe(x.fssr)+'</summary><div class="notice"><b>QUALITY SOURCE ONLY — CONTAMINANT ARTICLE STILL PENDING.</b> No lot test or full regulatory PASS.</div>'+
 '<table><thead><tr><th>Quality test</th><th>FSSR</th><th>Subtype and basis</th></tr></thead><tbody>'+
 rows+'</tbody></table><p><b>Positive identity required:</b> '+safe(x.regulatory_qualifier)+'</p>'+
 '<p><b>Do not transfer:</b> '+safe(x.prohibited_contaminant_transfer)+'</p>'+
 '<small><a href="'+safe(x.official_product_source)+'" target="_blank" rel="noopener noreferrer">Official FSSR (page '+safe(x.pdf_page_zero_index+1)+')</a> · '+
 '<a href="'+safe(x.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official CTR IX</a></small></details>';
}
var pmsvQuality8PreviousPanel=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 return pmsvQuality8Html(p)+pmsvQuality8PreviousPanel(p);
};
