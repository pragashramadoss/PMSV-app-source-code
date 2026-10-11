"use strict";
// Source-research aid. Never promotes an FSSAI article to a finished-food limit.
var pmsvNext121ProofDb=null;
var pmsvNext29DossiersDb=null;
async function pmsvLoadPositiveSourceProof(){
 const base='./data/rules/';
 try{
  const r=await fetch(base+'fssai-next121-positive-subtype-proof-2026-10-11.json?v=20261011-live121',{cache:'reload'});
  if(!r.ok)throw new Error('121-product evidence checklist unavailable');
  const d=await r.json();
  if(d.catalogue_count!==533||d.prior_partial_exact!==412||d.unresolved_first_source!==121||
     d.full_compliance_approvals!==0||d.exact_source_promotions!==0||
     d.records?.length!==121||d.verified_source_rows?.length!==20||
     d.review_summary?.without_candidates!==29)throw new Error('121-product source checklist mismatch');
  pmsvNext121ProofDb=d;
 }catch(e){pmsvNext121ProofDb=null;}
 try{
  const r=await fetch(base+'fssai-next29-no-source-proof-dossiers-2026-10-11.json?v=20261011-live29',{cache:'reload'});
  if(!r.ok)throw new Error('29-product extra research dossiers unavailable');
  const d=await r.json();
  if(d.catalogue!==533||d.partial_exact!==412||d.pending_exact!==121||
     d.unmatched!==29||d.exact_promotions!==0||d.finished_food_compliance_passes!==0||
     d.records?.length!==29)throw new Error('29-product source dossier mismatch');
  pmsvNext29DossiersDb=d;
 }catch(e){pmsvNext29DossiersDb=null;}
}
function pmsvProofSourceMatch(r,db){
 const norm=x=>String(x??'').toLowerCase().replace(/[^a-z0-9]+/g,'');
 if(r.type==='metal')return (db.metal_article_rules_v9?.[r.analyte]||[]).filter(x=>
    x.row_type==='exact'&&x.limit===r.limit&&x.unit===r.unit&&
    (norm(x.article)===norm(r.article)||r.id==='lead-packaged-water'&&norm(x.article).startsWith(norm(r.article)))&&
    (r.id!=='lead-milks'||x.condition===r.official_condition)).length===1;
 if(r.type==='crop'){
  const code=r.id==='aflatoxin-b1-composite'?'aflatoxin_b1':'total_aflatoxins', group=db.crop_contaminants?.[code];
  return group?.unit===r.unit&&(group.rules||[]).filter(x=>norm(x.article)===norm(r.article)&&Number(x.limit)===r.limit).length===1;
 }
 if(r.type==='nots')return (db.naturally_occurring_toxic_substances?.agaric_acid||[]).filter(x=>
    norm(x.article)===norm(r.article)&&Number(x.limit)===r.limit&&x.unit===r.unit).length===1;
 if(r.type==='pesticide')return (db.residue_mrls?.pesticides||[]).filter(x=>norm(x.name)===norm(r.analyte))
    .flatMap(x=>x.rows||[]).filter(x=>norm(x.food)===norm(r.article)&&Number(x.mrl)===r.limit&&x.unit===r.unit).length===1;
 return false;
}
function sourcePinned121ResearchProofHtml(p){
 const queue=sourcePriorityMetalDb?.unresolved_first_exact_catalog_ids;
 if(!p||!Array.isArray(queue)||!queue.includes(p.id))return '';
 if(p.id==='06-06-1-any-other-foodgrains'&&typeof pmsvGrainProofValid==='function'&&pmsvGrainProofValid(p))return '';
 // A historic first-source queue is still archived at 121. A positively
 // source-matched Ayurveda recipe must not be shown as currently unresolved
 // if its independent official article/recipe source gate validates.
 if(typeof sourcePinnedAyurvedaCompositeB1Html==='function' &&
    typeof pmsvAyurvedaCompositeB1Db!=='undefined' &&
    pmsvAyurvedaCompositeB1Db?.records?.some(x=>x.catalog_id===p.id)){
   const exact=sourcePinnedAyurvedaCompositeB1Html(p);
   if(exact.includes('Positive FSSAI first-source match'))return '';
 }

 const withheld='<div class="notice"><b>First-source research withheld:</b> the identity, source table, or review manifest is unavailable or inconsistent. No finished-product contaminant limit, exemption or PASS is inferred.</div>';
 const a=pmsvNext121ProofDb,b=pmsvNext29DossiersDb,c=contaminantsDb;
 const source='https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf';
 if(!a||!b||!c||a.catalogue_count!==533||a.prior_partial_exact!==412||
  a.unresolved_first_source!==121||a.full_compliance_approvals!==0||a.exact_source_promotions!==0||
  a.official_sources_only!==true||a.official_contaminants_url!==source||
  a.article_references_are_legal_source_rows_not_finished_food_limit_assignments!==true||
  a.records?.length!==121||a.verified_source_rows?.length!==20||
  a.review_summary?.identities!==121||a.review_summary?.with_candidates!==92||
  a.review_summary?.without_candidates!==29||a.review_summary?.conditional_article_links!==153||
  b.catalogue!==533||b.partial_exact!==412||b.pending_exact!==121||b.unmatched!==29||
  b.exact_promotions!==0||b.finished_food_compliance_passes!==0||b.records?.length!==29||
  b.official_source!==source||c.source_version!=='Version IX (03.02.2026)'||
  c.official_sources?.[0]?.url!==source||
  sourcePriorityMetalDb.partial_exact_count!==412||
  sourcePriorityMetalDb.pending_first_exact_count!==121||queue.length!==121)return withheld;
 const ids=new Set(a.records.map(x=>x.catalog_id)),noCandidate=a.records.filter(x=>x.named_article_references_review_only?.length===0);
 const outlierIds=new Set(b.records.map(x=>x.catalog_id)),references=new Map(a.verified_source_rows.map(x=>[x.id,x]));
 if(ids.size!==121||queue.some(x=>!ids.has(x))||noCandidate.length!==29||
  noCandidate.some(x=>!outlierIds.has(x.catalog_id))||outlierIds.size!==29||
  references.size!==20||
  b.records.some(x=>!noCandidate.some(y=>y.catalog_id===x.catalog_id)||
   x.status!=='IDENTITY_AND_ARTICLE_PROOF_UNRESOLVED'||x.candidate_article_currently_safely_identified!==false||
   x.number_auto_applied!==false||x.compliance_pass!==false)||
  a.verified_source_rows.some(x=>x.official_source!==source||
   x.automatic_finished_product_application!==false||x.laboratory_compliance_pass!==false||
   !pmsvProofSourceMatch(x,c)))return withheld;
 const row=a.records.find(x=>x.catalog_id===p.id),detail=b.records.find(x=>x.catalog_id===p.id);
 if(!row||row.product_name!==p.name||String(row.fssr||'')!==String(p.fssr||'')||
    String(row.fcs||'')!==String(p.fcs||'')||
    row.status!=='FIRST_EXACT_SOURCE_PENDING_REVIEW_ONLY'||row.signed_product_article_match!==false||
    row.source_references_auto_applied!==false||row.lab_compliance_pass!==false||
    !Array.isArray(row.exact_finished_form_questions)||row.exact_finished_form_questions.length<3||
    !Array.isArray(row.named_article_references_review_only)||
    row.named_article_references_review_only.some(x=>!references.has(x))||
    new Set(row.named_article_references_review_only).size!==row.named_article_references_review_only.length||
    (row.named_article_references_review_only.length===0)!==Boolean(detail)||
    detail&&(detail.product_name!==p.name||String(detail.fssr||'')!==String(p.fssr||'')||
     String(detail.fcs||'')!==String(p.fcs||'')))return withheld;
 const list=x=>x.map(z=>'<li>'+esc(z)+'</li>').join('');
 const names=row.named_article_references_review_only.map(id=>{
   const x=references.get(id);
   return '<li><b>'+esc(x.analyte)+'</b> — '+esc(x.article)+' <small>(reference article only; NOT APPLIED)</small></li>';
 }).join('');
 return '<details class="card" style="margin-top:12px"><summary><b>First exact-source evidence needed — '+esc(p.name)+
   '</b> · NOT APPLIED</summary><div class="notice"><b>Unresolved FSSAI article applicability.</b> This is a research checklist, not an assigned contaminant MRL, exemption, sample result or compliance PASS.</div>'+
   (detail?'<div><b>Additional product-specific identity proof</b><p>'+esc(detail.positive_regulatory_source_evidence_to_obtain)+
    '</p><p><b>Prohibited inheritance:</b> '+esc(detail.risk_of_wrong_article_transfer)+'</p></div>':'')+
   '<p><b>Evidence to establish before choosing a regulatory article:</b></p><ul>'+list(row.exact_finished_form_questions.slice(0,8))+'</ul>'+
   (names?'<p><b>Official named-article references — NOT APPLIED:</b></p><ul>'+names+'</ul>':
   '<p><b>No safe named contaminant article has been identified.</b> Product/form-specific source research remains necessary.</p>')+
   '<small><a href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">FSSAI Version IX primary source</a>. Operative amendments, true product article and analytical basis still require independent assessment.</small></details>';
}

/* October 11 large-batch cross-form exclusions: 56 current unresolved identities.
 * Additional read-only scope panels; never infer an applicable limit or PASS. */
var pmsvCrossFormNonTransferDb=null;
var pmsvOriginalLoadPositiveSourceProof=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvOriginalLoadPositiveSourceProof();
 try{
  const response=await fetch('./data/rules/fssai-2026-10-11-cross-form-nontransfer-large-batch.json?v=20261011-large56',{cache:'reload'});
  if(!response.ok)throw Error('Cross-form review unavailable');
  const d=await response.json();
  if(d.product_catalogue!==533||d.current_source_partial!==415||d.current_source_pending!==118||
     d.historical_unresolved_queue!==121||d.previously_source_matched_products!==3||
     d.first_source_promotions!==0||d.finished_food_compliance_passes!==0||
     d.source_proof_kind!=='PRIMARY_SOURCE_CONFIRMED_BUT_FINISHED_PRODUCT_LINK_BLOCKED'||
     d.scoped_out_prior_twenty_and_fourteen!==true||d.reviewed!==56||
     d.groups?.length!==9||d.records?.length!==56||
     d.source_url!==pmsvNext121ProofDb?.official_contaminants_url||
     d.source_version!==contaminantsDb?.source_version||
     new Set(d.records.map(x=>x.catalog_id)).size!==56||
     d.groups.reduce((n,g)=>n+g.reviewed,0)!==56)
     throw Error('Cross-form identity/source metadata inconsistent');
  pmsvCrossFormNonTransferDb=d;
 }catch(e){pmsvCrossFormNonTransferDb=null;}
};
function pmsvCrossFormSourceVerified(p){
 const d=pmsvCrossFormNonTransferDb;
 const base=pmsvNext121ProofDb;
 const source=contaminantsDb;
 if(!p||!d||!base||!source||d.source_url!==source.official_sources?.[0]?.url||
   d.source_version!==source.source_version||d.current_source_partial!==415||
   d.current_source_pending!==118||d.first_source_promotions!==0||
   d.finished_food_compliance_passes!==0||d.records?.length!==56||
   d.groups.reduce((n,g)=>n+g.reviewed,0)!==56)return false;
 const old=base.records.find(x=>x.catalog_id===p.id);
 const r=d.records.find(x=>x.catalog_id===p.id);
 if(!old||!r||!sourcePriorityMetalDb?.unresolved_first_exact_catalog_ids?.includes(p.id)||
    r.product_name!==p.name||String(r.fssr||'')!==String(p.fssr||'')||
    String(r.fcs||'')!==String(p.fcs||'')||
    r.exact_finished_article_source_verified!==false||r.automatic_numeric_limit!==false||
    r.regulatory_sample_pass!==false||r.complete_regulatory_compliance!==false||
    r.review_result!=='NAMED_REFERENCE_ONLY_NOT_AN_EXACT_FINISHED_PRODUCT_MATCH'||
    !r.positive_matrix_proof_required||!r.why_reference_must_not_transfer)return false;
 const refs=new Map(base.verified_source_rows.map(x=>[x.id,x]));
 return r.source_reference_ids.every(id=>refs.has(id)&&pmsvProofSourceMatch(refs.get(id),source));
}
function pmsvCrossFormNonTransferHtml(p){
 const d=pmsvCrossFormNonTransferDb;
 if(!p||!d?.records?.some(x=>x.catalog_id===p.id))return '';
 if(!pmsvCrossFormSourceVerified(p))return '<div class="notice"><b>Product-specific cross-form review withheld:</b> source or identity check failed; no numerical limit is assigned.</div>';
 const r=d.records.find(x=>x.catalog_id===p.id);
 const refs=new Map(pmsvNext121ProofDb.verified_source_rows.map(x=>[x.id,x]));
 const articles=r.source_reference_ids.map(id=>refs.get(id));
 const names=articles.length?'<ul>'+articles.map(x=>'<li>'+esc(x.analyte)+' — '+esc(x.article)+' <b>(reference only; not applied)</b></li>').join('')+'</ul>':
  '<p>No validated named reference article established for the precise finished food.</p>';
 return '<details class="card" style="margin-top:12px"><summary><b>Additional FSSAI product-form non-transfer check</b> — '+esc(r.review_label)+
   '</summary><div class="notice"><b>FIRST EXACT-SOURCE STILL PENDING — NOT A COMPLIANCE PASS.</b> '+esc(r.why_reference_must_not_transfer)+'</div>'+
   '<p><b>Verified official articles considered for scope:</b></p>'+names+
   '<p><b>Positive finished-product evidence needed:</b> '+esc(r.positive_matrix_proof_required)+'</p>'+
   '<small><a href="'+esc(d.source_url)+'" target="_blank" rel="noopener noreferrer">Official FSSAI Contaminants Version IX</a> · '+
   '<a href="https://foscos.fssai.gov.in/" target="_blank" rel="noopener noreferrer">Official FoSCoS</a></small></details>';
}
var pmsvOriginalSourcePinned121ResearchProofHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 const base=pmsvOriginalSourcePinned121ResearchProofHtml(p);
 return base+pmsvCrossFormNonTransferHtml(p);
};

/* Final 28-product exact-source adjudication (2 independently source-proven
 * rabbit veterinary-tissue matches; other 26 remain incomplete). The 415/118
 * counts in preceding historical review datasets are previous checkpoints. */
var pmsvFinalTwentyEightDb=null;
var pmsvLoadBeforeFinalTwentyEight=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvLoadBeforeFinalTwentyEight();
 try{
  const r=await fetch('./data/rules/fssai-28-final-remainder-and-two-rabbit-veterinary-first-source-2026-10-11.json?v=20261011-final28',{cache:'reload'});
  if(!r.ok)throw Error('Final 28-product review source unavailable');
  const d=await r.json();
  if(d.catalogue!==533||d.historic_first_source_partial!==415||d.historic_first_source_pending!==118||
     d.prior_covered_recent_groups!==90||d.newly_reviewed!==28||
     d.new_positive_first_source!==2||d.new_still_unresolved!==26||
     d.updated_partial!==417||d.updated_pending!==116||
     d.complete_regulatory_compliance_approvals!==0||d.official_sources_only!==true||
     d.positive_records?.length!==2||d.pending_records?.length!==26||
     d.source_version!==contaminantsDb?.source_version||
     d.official_contaminants_source!==contaminantsDb?.official_sources?.[0]?.url||
     new Set([...d.positive_records,...d.pending_records].map(x=>x.catalog_id)).size!==28)
     throw Error('Current exact-source position out of sync');
  pmsvFinalTwentyEightDb=d;
 }catch(e){pmsvFinalTwentyEightDb=null;}
};
function pmsvFinalTwentyEightSourceValid(p){
 const d=pmsvFinalTwentyEightDb,c=contaminantsDb;
 if(!p||!d||!c||d.updated_partial!==417||d.updated_pending!==116||
    d.new_positive_first_source!==2||d.new_still_unresolved!==26||
    d.complete_regulatory_compliance_approvals!==0||
    d.source_version!==c.source_version||d.official_contaminants_source!==c.official_sources?.[0]?.url)return false;
 const r=[...d.positive_records,...d.pending_records].find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||'')!==String(p.fssr||'')||
    String(r.fcs||'')!==String(p.fcs||'')||
    !sourcePriorityMetalDb?.unresolved_first_exact_catalog_ids?.includes(p.id))return false;
 if(r.source_status==='PARTIAL_EXACT_VETERINARY_EDIBLE_TISSUE_ARTICLE'){
  if(r.official_product_standard!==d.official_rabbit_source||r.official_product_clause!=='2.5.2(6)'||
    r.veterinary_table_serial!==48||r.analyte!=='Xylazine'||r.limit!==0.01||
    r.unit!=='mg/kg'||r.automatic_lot_compliance_pass!==false||
    r.complete_source_panel!==false)return false;
  const chapter=(Array.isArray(chapterRuleDbs)?chapterRuleDbs:[]).find(x=>x?.chapter==='2.5');
  if(!chapter||chapter.official_sources?.[0]?.url!==r.official_product_standard||
    !chapter.standards?.some(x=>x.key==='2.5.2(6)'&&/Rabbit/i.test(x.name)))return false;
  const vet=c.antibiotic_and_pharmacological_substances?.veterinary_tolerance_limits;
  const xylazine=vet?.rows?.find(x=>x.serial===48&&x.name==='Xylazine');
  return !!xylazine&&vet.completeness==='complete'&&vet.auto_apply===false&&
    xylazine.rows?.filter(x=>x.article===r.article&&Number(x.limit)===r.limit&&x.unit===r.unit).length===1;
 }
 return Boolean(r.first_exact_contaminant_source_found===false&&r.numeric_limit_auto_applied===false&&
  r.finished_lot_compliance_pass===false&&r.positive_proof_needed&&r.do_not_inherit);
}
function pmsvFinalTwentyEightEvidenceHtml(p){
 if(!p||!pmsvFinalTwentyEightDb?.positive_records?.concat(pmsvFinalTwentyEightDb.pending_records||[]).some(x=>x.catalog_id===p.id))return '';
 if(!pmsvFinalTwentyEightSourceValid(p))return '<div class="notice"><b>Final review source withheld.</b> Official article identity or source data failed verification; no limit or PASS assigned.</div>';
 const d=pmsvFinalTwentyEightDb,positive=d.positive_records.find(x=>x.catalog_id===p.id);
 const standard=positive?.official_product_standard||d.pending_records.find(x=>x.catalog_id===p.id).source_standard;
 if(positive){
  return '<details class="card" open style="margin-top:12px"><summary><b>Positive FSSAI first-source match — veterinary tissue</b></summary>'+
  '<div class="notice"><b>PARTIAL SOURCE ONLY — NOT A COMPLIANCE PASS.</b> FSSR '+esc(positive.official_product_clause)+
  ' establishes edible domestic rabbit meat (fresh/chilled/frozen). Version IX veterinary serial 48 names <b>'+esc(positive.analyte)+
  '</b> '+esc(positive.limit)+' '+esc(positive.unit)+' for '+esc(positive.article)+
  '. This named residue applies to edible rabbit tissue; the rabbit-specific Lead metal article remains unverified.</div>'+
  '<p><b>Outstanding:</b> '+esc(positive.unverified)+'</p>'+
  '<small><a href="'+esc(d.official_rabbit_source)+'" target="_blank" rel="noopener noreferrer">FSSAI Chapter 2.5</a> · '+
  '<a href="'+esc(d.official_contaminants_source)+'" target="_blank" rel="noopener noreferrer">Version IX veterinary residue table</a></small></details>';
 }
 const r=d.pending_records.find(x=>x.catalog_id===p.id);
 return '<details class="card" style="margin-top:12px"><summary><b>Current unresolved first-source evidence — '+esc(r.gate_type.replaceAll('_',' '))+
  '</b></summary><div class="notice"><b>NO EXACT CONTAMINANT ARTICLE ASSIGNED.</b> '+esc(r.do_not_inherit)+'</div>'+
  '<p><b>Positive proof needed:</b> '+esc(r.positive_proof_needed)+'</p>'+
  '<small><a href="'+esc(standard)+'" target="_blank" rel="noopener noreferrer">FSSAI product-standard / FoSCoS source</a> · '+
  '<a href="'+esc(d.official_contaminants_source)+'" target="_blank" rel="noopener noreferrer">Official Version IX</a></small></details>';
}
var pmsvBeforeFinalTwentyEightProofHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 if(pmsvFinalTwentyEightDb?.positive_records?.some(x=>x.catalog_id===p?.id)){
  return pmsvFinalTwentyEightEvidenceHtml(p);
 }
 return pmsvBeforeFinalTwentyEightProofHtml(p)+pmsvFinalTwentyEightEvidenceHtml(p);
};
