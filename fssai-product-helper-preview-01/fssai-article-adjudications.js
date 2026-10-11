"use strict";
var pmsvArticleAdjudicationDb=null;
async function pmsvLoadArticleAdjudications(){
 try{
  const r=await fetch('./data/rules/fssai-153-source-article-applicability-adjudications-2026-10-11.json?v=20261011-decisions153',{cache:'reload'});
  if(!r.ok)throw new Error('FSSAI product legal-article scope verdicts unavailable');
  const d=await r.json();
  if(d.prior_queue_total!==121||d.source_link_reviews!==153||d.distinct_unresolved_candidate_products!==92||
    d.source_article_count!==20||d.full_compliance_passes!==0||d.numeric_auto_apply!==false||
    d.records?.length!==153||d.current_first_source_status?.still_without_first_source!==119)
    throw new Error('FSSAI article adjudication metadata mismatch');
  pmsvArticleAdjudicationDb=d;
 }catch(e){pmsvArticleAdjudicationDb=null;}
}
function sourcePinnedLegalArticleAdjudicationHtml(p){
 if(!p||!sourcePriorityMetalDb?.unresolved_first_exact_catalog_ids?.includes(p.id))return '';
 const m=pmsvArticleAdjudicationDb,proof=pmsvNext121ProofDb,table=contaminantsDb;
 const fail='<div class="notice"><b>Article applicability reconciliation withheld:</b> legal source, source rows, product identity, or 153-case decision register could not be verified. No source limit is assumed.</div>';
 if(!m||!proof||!table||m.records?.length!==153||m.source_link_reviews!==153||
 m.prior_queue_total!==121||m.source_article_count!==20||m.full_compliance_passes!==0||
 m.numeric_auto_apply!==false||m.current_first_source_status?.still_without_first_source!==119||
 m.statuses_are_article_specific_not_whole_product_exemptions!==true||
 m.official_contaminants_source!==proof.official_contaminants_url||
 proof.verified_source_rows?.length!==20||
 proof.records?.length!==121||
 !sourcePriorityMetalDb?.unresolved_first_exact_catalog_ids?.includes(p.id))return fail;
 const all=new Map(proof.verified_source_rows.map(x=>[x.id,x]));
 const expected=proof.records.find(x=>x.catalog_id===p.id);
 const selected=m.records.filter(x=>x.catalog_id===p.id);
 if(!expected||expected.product_name!==p.name||expected.fssr!==p.fssr||expected.fcs!==p.fcs||
 selected.length!==expected.named_article_references_review_only.length)return fail;
 for(const x of selected){
  const z=all.get(x.source_row_id);
  if(!z||x.product_name!==p.name||x.fssr!==p.fssr||x.fcs!==p.fcs||
   x.contaminant!==z.analyte||x.source_article!==z.article||
   !expected.named_article_references_review_only.includes(x.source_row_id)||
   x.regulatory_contaminants_source!==proof.official_contaminants_url||
   !['CONFIRMED_NAMED_COMPOSITE_ARTICLE_POSITIVE','DIRECT_FINISHED_ARTICLE_EXCLUDED','SUBTYPE_PROCESSING_PROOF_REQUIRED'].includes(x.legal_article_applicability)||
   x.numeric_finished_product_auto_apply!==false||x.full_compliance_pass!==false||
   typeof pmsvProofSourceMatch!=='function'||!pmsvProofSourceMatch(z,table))return fail;
 }
 if(!selected.length)return '';
 const lines=selected.map(x=>{
   const state=x.legal_article_applicability==='DIRECT_FINISHED_ARTICLE_EXCLUDED'?'Named article does NOT directly describe this finished product':
    x.legal_article_applicability==='CONFIRMED_NAMED_COMPOSITE_ARTICLE_POSITIVE'?'Positive finished-product composite ingredient proof':'Needs positive subtype / process evidence';
   return '<tr><td>'+esc(x.contaminant)+'<br><small>'+esc(x.source_article)+'</small></td><td><b>'+
     esc(state)+'</b><br>'+esc(x.reason)+'</td><td>'+esc(x.positive_proof_to_establish)+'</td></tr>';
 }).join('');
 const excluded=selected.filter(x=>x.legal_article_applicability==='DIRECT_FINISHED_ARTICLE_EXCLUDED').length;
 return '<details class="card" style="margin-top:12px"><summary><b>Verified applicability of candidate named articles</b> · '+excluded+
  ' source article'+(excluded===1?'':'s')+' ruled out for direct use</summary><div class="notice">This finding concerns only the named article, not a blanket exemption from contaminants. Other product-specific limits, pesticide residues and sample compliance remain open. Nothing here issues a compliance PASS.</div>'+
  '<div class="tablewrap"><table><thead><tr><th>Source named article</th><th>Applicability decision</th><th>Positive proof / next action</th></tr></thead><tbody>'+lines+'</tbody></table></div></details>';
}
