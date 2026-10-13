"use strict";
/* Forty exact identity comparisons to CTR IX legal ROWS. Numbers are comparison-only:
 * no numeric finish-food assignment; independent universal reference is not a named route.
 */
var pmsv40CtrComparisons=null;
const pmsv40CtrDigest="07cc38ca651063bf";
function pmsv40CtrComparisonsValid(){
 if(typeof pmsv493Valid!=="function"||!pmsv493Valid()||
    typeof pmsv40LegalGatesValid!=="function"||!pmsv40LegalGatesValid()||
    typeof pmsvReviewSnapshotDigest!=="function"||
    !pmsv40CtrComparisons||!pmsv40Queue||!pmsv493Ledger||
    pmsvReviewSnapshotDigest(pmsv40CtrComparisons)!==pmsv40CtrDigest)return false;
 const d=pmsv40CtrComparisons;
 if(d.schema_version!=="1.0"||
    d.policy!=="OFFICIAL_FSSAI_ONLY_NAMED_FINISHED_ARTICLE_MATCH_NOT_INFERRED"||
    d.purpose!=="COMPARED_OFFICIAL_CTR_ROWS_NOT_FINISHED_FOOD_LIMITS"||
    d.catalogue!==533||d.conditional_partial!==493||d.first_named_pending!==40||
    d.quality_dossiers_linked!==31||d.full_regulatory_approvals!==0||
    d.auto_numeric_limits!==false||
    d.source_url!=="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf"||
    d.records?.length!==40||d.source_rows?.length!==28||
    pmsv493Ledger.partial_exact!==493||pmsv493Ledger.first_source_pending!==40||
    pmsv40Queue.review_records?.length!==40||
    pmsv493Ledger.records?.length!==533)return false;
 const u=d.universal_regulation_reference;
 if(u?.key!=="methylmercury-all-foods"||
    u.contaminant!=="Methyl Mercury (calculated as the element)"||
    u.article!=="All foods"||u.limit!==0.25||u.unit!=="mg/kg"||
    u.pdf_page_index!==11||!u.universal_scope_note)return false;
 const rows=new Map(),queue=new Map(pmsv40Queue.review_records.map(x=>[x.catalog_id,x])),
    ledger=new Map(pmsv493Ledger.records.map(x=>[x.catalog_id,x]));
 for(const x of d.source_rows){
   if(!x.key||rows.has(x.key)||x.official_ctr_url!==d.source_url||
      typeof x.limit!=="number"||x.limit<0||!x.unit||!x.article||
      !x.contaminant||!Number.isInteger(x.pdf_page_index)||
      x.pdf_page_index<0||x.pdf_page_index>55||
      x.applies_to_current_pending_catalogue_without_finished_article_proof!==false)return false;
   rows.set(x.key,x);
 }
 let comparisons=0,withRow=0,noRow=0;const seen=new Set();
 for(const x of d.records){
   const q=queue.get(x.catalog_id),l=ledger.get(x.catalog_id);
   if(seen.has(x.catalog_id)||!q||!l||
      x.product_name!==q.product_name||x.product_name!==l.product_name||
      String(x.fssr||"")!==String(q.fssr||"")||
      String(x.fcs||"")!==String(q.fcs||"")||
      x.review_group!==q.current_review_group||
      l.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
      x.official_ctr_url!==d.source_url||
      x.universal_reference_key!==u.key||
      x.named_finished_article_source_status!=="FIRST_EXACT_SOURCE_PENDING"||
      !x.negative_finished_article_rule||!x.positive_evidence_required||
      x.contrasted_ctr_rows?.length>4||
      x.laboratory_pass!==false||x.regulatory_approval!==false)return false;
   if(x.contrasted_ctr_rows.length)withRow++;else noRow++;
   const keys=new Set();
   for(const t of x.contrasted_ctr_rows){
     if(!rows.has(t.source_row_key)||keys.has(t.source_row_key)||
        t.comparison_only!==true||
        t.numeric_limit_auto_assigned!==false)return false;
     keys.add(t.source_row_key);comparisons++;
   }
   const mustHave=new Set(["11-11-1-cube-sugar","11-11-1-misri","04-04-1-frozen-fruits-fruit-products","04-04-2-frozen-vegetables","coffee-chicory-mixture"]);
   const s=x.finished_standard_evidence;
   if(mustHave.has(x.catalog_id)){
     if(!s||s.evidence_type!=="EXACT_FSSR_FINISHED_STANDARD_NOT_CTR_MATCH"||
        !s.official_fssr_url?.startsWith("https://www.fssai.gov.in/upload/")||
        !s.standard_clause||!s.printed_page||!s.finished_identity_statement||
        !Array.isArray(s.documented_requirements)||s.documented_requirements.length<2||
        !s.ctr_transfer_gate||s.independently_verified_lot!==false||
        s.automatic_contaminant_limit!==false||s.first_named_ctr_promoted!==false)return false;
   }else if(s)return false;
   seen.add(x.catalog_id);
 }
 return comparisons===50&&withRow===36&&noRow===4&&seen.size===40;
}
var pmsvBefore40CtrComparisonsLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore40CtrComparisonsLoad();pmsv40CtrComparisons=null;
 try{
   const r=await fetch("./data/rules/fssai-40-current-named-ctr-crossform-comparisons-2026-10-13.json?v=20261013-40ctr",{cache:"reload"});
   if(!r.ok)throw Error("40 current CTR comparison evidence absent");
   pmsv40CtrComparisons=await r.json();
   if(!pmsv40CtrComparisonsValid())throw Error("40 identity CTR source comparison failed integrity");
 }catch(_){pmsv40CtrComparisons=null;}
};
function pmsv40CtrComparisonsHtml(p){
 if(!p||!pmsv40Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsv40CtrComparisonsValid())
  return '<div class="notice">40 pending legal article comparisons unavailable or invalid; no numerical CTR limit or compliance PASS.</div>';
 const d=pmsv40CtrComparisons,x=d.records.find(y=>y.catalog_id===p.id);
 if(!x||x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
    String(x.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Product identity mismatch; no numerical CTR assignment or laboratory PASS.</div>';
 const e=v=>typeof esc==="function"?esc(String(v)):String(v).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[z]));
 const keys=new Map(d.source_rows.map(y=>[y.key,y]));
 let h='<details class="card" style="margin-top:12px"><summary><b>Official CTR IX cross-form rows — not automatically transferable</b> · '+e(x.product_name)+'</summary>'+
 '<div class="notice"><b>COMPARISON ONLY — NO PRODUCT LIMIT ASSIGNED.</b> Named finished-article matching remains pending. These are thresholds written for DIFFERENT legal food forms; they are not test results or approvals.</div>';
 if(x.contrasted_ctr_rows.length){
   h+='<div class="tablewrap"><table><thead><tr><th>CTR named article, not the current finished form</th><th>Official row for comparison only</th></tr></thead><tbody>'+
   x.contrasted_ctr_rows.map(z=>{
      const t=keys.get(z.source_row_key);
      return '<tr><td>'+e(t.article)+'</td><td>'+e(t.contaminant)+': '+e(t.limit)+' '+e(t.unit)+
       ' · PDF p.'+e(t.pdf_page_index+1)+' — <b>NOT APPLIED</b></td></tr>';
   }).join("")+'</tbody></table></div>';
 }else h+='<p>No safely comparable individually named numeric row is pinned for this broad legal identity. This is not an exemption.</p>';
 h+='<p><b>Why transfer is blocked:</b> '+e(x.negative_finished_article_rule)+'</p>'+
    '<p><b>Positive evidence required:</b> '+e(x.positive_evidence_required)+'</p>'+
    (x.finished_standard_evidence ? '<div class="notice"><b>Direct FSSR finished-product evidence (not a CTR article or test result)</b>'+
      '<p>FSSR '+e(x.finished_standard_evidence.standard_clause)+' · printed p.'+e(x.finished_standard_evidence.printed_page)+': '+e(x.finished_standard_evidence.finished_identity_statement)+'</p>'+
      '<p><b>Regulatory quality conditions:</b> '+x.finished_standard_evidence.documented_requirements.map(e).join('; ')+'</p>'+
      '<p><b>Legal contaminant matching still required:</b> '+e(x.finished_standard_evidence.ctr_transfer_gate)+'</p>'+
      '<small><a target="_blank" rel="noopener noreferrer" href="'+e(x.finished_standard_evidence.official_fssr_url)+'">Official FSSAI FSSR finished-product standard</a></small></div>' : '')+
    '<p><b>Universal rule is not the missing named product article:</b> CTR IX §2.1.1 lists '+e(d.universal_regulation_reference.contaminant)+
    ' for '+e(d.universal_regulation_reference.article)+': '+e(d.universal_regulation_reference.limit)+
    ' '+e(d.universal_regulation_reference.unit)+' (PDF p.12). Review actual food scope and analytical requirements separately; no auto-application or laboratory PASS.</p>'+
    '<small><a href="'+e(d.source_url)+'" target="_blank" rel="noopener noreferrer">Official FSSAI Contaminants Regulations Version IX (03.02.2026)</a></small></details>';
 return h;
}
var pmsvBefore40CtrHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 return pmsv40CtrComparisonsHtml(p)+pmsvBefore40CtrHtml(p);
};
