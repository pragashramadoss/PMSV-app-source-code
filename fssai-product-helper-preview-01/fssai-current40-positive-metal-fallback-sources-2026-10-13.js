"use strict";
/* Official positive FSSAI CTR IX §2.1.1 last-resort 'Foods not specified' entries.
 * Evidence branch is not applicable until legal finished-form/source hierarchy is
 * documented. No automatic numerical assignment, laboratory pass or promotion.
 */
var pmsvCurrent40FallbackData=null;
const pmsvCurrent40FallbackDigest="b1030936e53a1bb9";
const pmsvCurrent40FallbackFixed=Object.freeze({
 "Lead":2.5,"Copper":30,"Arsenic":1.1,
 "Tin":250,"Cadmium":1.5,"Mercury":1
});
function pmsvCurrent40FallbackValid(){
 if(typeof pmsv493Valid!=="function"||!pmsv493Valid()||
 typeof pmsv40LegalGatesValid!=="function"||!pmsv40LegalGatesValid()||
 typeof pmsv40CtrComparisonsValid!=="function"||!pmsv40CtrComparisonsValid()||
 typeof pmsvReviewSnapshotDigest!=="function"||
 !pmsvCurrent40FallbackData||!pmsv40Queue||!pmsv493Ledger||
 pmsvReviewSnapshotDigest(pmsvCurrent40FallbackData)!==pmsvCurrent40FallbackDigest)return false;
 const d=pmsvCurrent40FallbackData,u="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
 if(d.schema_version!=="1.0"||d.source_policy!=="OFFICIAL_FSSAI_CTR_IX_ONLY"||
 d.scope!=="SIX_POSITIVE_FOODS_NOT_SPECIFIED_METAL_ROWS_WITH_40_INDIVIDUAL_LEGAL_HIERARCHY_GATES"||
 d.source_url!==u||d.catalogue!==533||d.partial_named_sources!==493||
 d.pending_first_named_sources!==40||d.fallback_source_row_count!==6||
 d.pending_identity_count!==40||d.conditional_candidate_links!==240||
 d.named_ctr_source_promotions!==0||d.actual_recipe_or_finished_lot_verified!==false||
 d.any_numerical_limit_auto_assigned!==false||d.any_complete_lab_pass!==false||
 d.any_regulatory_approval!==false||!d.use_rule||
 d.fallback_metal_rows?.length!==6||d.reviewed_pending_products?.length!==40||
 pmsv493Ledger.records?.length!==533||pmsv493Ledger.partial_exact!==493||
 pmsv493Ledger.first_source_pending!==40||pmsv40Queue.review_records?.length!==40)return false;
 const urow=d.universal_methylmercury;
 if(urow?.name!=="Methyl Mercury (Calculated as the element)"||
 urow.article!=="All foods"||urow.limit!==0.25||urow.unit!=="mg/kg"||
 urow.page0!==11||urow.source_url!==u||
 urow.not_a_named_article_promotion!==true)return false;
 const actual=new Set(),expected=new Set(Object.keys(pmsvCurrent40FallbackFixed));
 const pdfPages={Lead:3,Copper:6,Arsenic:8,Tin:10,Cadmium:11,Mercury:11};
 for(const r of d.fallback_metal_rows){
  if(actual.has(r.metal)||!expected.has(r.metal)||
  r.limit!==pmsvCurrent40FallbackFixed[r.metal]||
  r.page0!==pdfPages[r.metal]||r.unit!=="mg/kg"||
  r.exact_official_article!=="Foods not specified"||
  r.official_pdf!==u||
  r.regulation!=="FSSAI CTR Version IX (03.02.2026), §2.1.1 metal contaminants"||
  r.article_text_verified!==true||
  r.decision_type!=="CONDITIONAL_NON_SPECIFIED_FOOD_FALLBACK"||
  r.not_applicable_without_legal_category_decision!==true||
  r.numeric_automatically_assigned!==false)return false;
  actual.add(r.metal);
 }
 if(actual.size!==6)return false;
 const q=new Map(pmsv40Queue.review_records.map(x=>[x.catalog_id,x])),
   l=new Map(pmsv493Ledger.records.map(x=>[x.catalog_id,x])),
   seen=new Set(),forms=new Set();
 for(const r of d.reviewed_pending_products){
  const p=q.get(r.catalog_id),s=l.get(r.catalog_id),z=r.named_article_hierarchy;
  if(seen.has(r.catalog_id)||forms.has(r.finished_form_class)||
   !p||!s||r.product_name!==p.product_name||r.product_name!==s.product_name||
   String(r.fssr||"")!==String(p.fssr||"")||
   String(r.fcs||"")!==String(p.fcs||"")||
   r.review_group!==p.current_review_group||
   s.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   r.official_ctr_pdf!==u||
   r.official_foscos!=="https://foscos.fssai.gov.in/standard-product"||
   !r.finished_form_class||
   r.source_specific_article_unresolved!==true||
   r.source_fallback_rows?.length!==6||
   new Set(r.source_fallback_rows).size!==6||
   r.source_fallback_rows.some(t=>!actual.has(t))||
   r.source_comparisons_already_pinned?.length>4||
   r.first_exact_named_finished_article_still_pending!==true||
   r.positive_article_evidence_to_obtain?.length<70||
   r.named_article_non_transfer?.length<40||
   r.disambiguation_evidence?.length<1||
   !z||z.screen_named_food_article_first!==true||
   z.confirm_actual_finished_marketed_food!==true||
   z.review_ingredient_and_processing_form!==true||
   z.check_applicable_fssr_quality_and_ctr_source!==true||
   typeof z.if_individual_chemical_check_current_indian_pharmacopoeia_monograph!=="boolean"||
   z.reject_unverified_raw_ingredient_transfer!==true||
   z.last_resort_fallback_only_if_no_named_metal_article_matches!==true||
   r.documentary_evidence_submitted!==false||
   r.named_ctr_article_exclusion_fully_checked!==false||
   r.actual_form_and_recipe_verified!==false||
   r.fallback_fully_adjudicated!==false||
   r.numerical_contaminant_limit_auto_applied!==false||
   r.complete_contaminant_panel_pass!==false||
   r.regulatory_approval!==false)return false;
  seen.add(r.catalog_id);forms.add(r.finished_form_class);
 }
 return seen.size===40&&forms.size===40;
}
var pmsvBeforeCurrent40FallbackLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBeforeCurrent40FallbackLoad();
 pmsvCurrent40FallbackData=null;
 try{
  const r=await fetch("./data/rules/fssai-current40-generic-metal-positive-source-gates-2026-10-13.json?v=20261013-40fallback",{cache:"reload"});
  if(!r.ok)throw Error("Six FSSAI fallback source rows missing");
  pmsvCurrent40FallbackData=await r.json();
  if(!pmsvCurrent40FallbackValid())throw Error("Official fallback source and forty pending identities mismatch");
 }catch(_){pmsvCurrent40FallbackData=null;}
};
function pmsvCurrent40FallbackHtml(p){
 if(!p||!pmsv40Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvCurrent40FallbackValid())
 return '<div class="notice">Current official FSSAI positive fallback sources unavailable or invalid. No numeric limit or PASS.</div>';
 const d=pmsvCurrent40FallbackData,r=d.reviewed_pending_products.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
 String(r.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">Fallback evidence product ID mismatch — no numeric assignment.</div>';
 const escf=v=>typeof esc==="function"?esc(String(v)):String(v).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[z]));
 const rows=d.fallback_metal_rows;
 let h='<details class="card" style="margin-top:12px"><summary><b>Official positive source pathway — Foods not specified</b> · '+escf(r.product_name)+'</summary>'+
 '<div class="notice"><b>Six real CTR IX source rows, but NO limits assigned to this product.</b> Article-specific exclusion, chemical monographs and actual finished form must be adjudicated first. Current named finished article is STILL PENDING.</div>'+
 '<p><b>Product-specific unmet proof:</b> '+escf(r.positive_article_evidence_to_obtain)+'</p>'+
 '<p><b>Why a different named source cannot be transferred:</b> '+escf(r.named_article_non_transfer)+'</p>'+
 '<p><b>Mandatory decision order:</b> (1) confirm the exact marketed finished food and chemical identity, '+
 '(2) screen all relevant named CTR articles and any applicable Indian Pharmacopoeia monograph, '+
 '(3) only then decide whether each individual metal belongs under its "Foods not specified" entry.</p>'+
 '<div class="tablewrap"><table><thead><tr><th>CTR source entry</th><th>Official fallback value — not yet assigned</th></tr></thead><tbody>'+
 rows.map(x=>'<tr><td>'+escf(x.metal)+' — '+escf(x.exact_official_article)+'</td><td>'+escf(x.limit)+' '+escf(x.unit)+
 ' (official PDF p.'+escf(x.page0+1)+') · <b>CONDITIONAL ONLY</b></td></tr>').join("")+
 '</tbody></table></div>'+
 '<p><b>Distinct universal wording:</b> FSSAI separately lists Methyl Mercury (calculated as the element) — All foods: 0.25 mg/kg. Neither provision gives a product laboratory PASS.</p>'+
 '<small><a href="'+escf(d.source_url)+'" target="_blank" rel="noopener noreferrer">FSSAI CTR Version IX, §§2.1.1, official PDF</a></small></details>';
 return h;
}
var pmsvBeforeCurrent40FallbackHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 return pmsvCurrent40FallbackHtml(p)+pmsvBeforeCurrent40FallbackHtml(p);
};
