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
 // This 121-item worklist is ARCHIVED. The most recent authenticated
 // 533-item ledger alone controls which products remain first-source pending.
 // Do not reproduce obsolete warnings for any of the 27 subsequent promotions.
 // The current application always loads pmsv444Valid before this panel renders.
 // In that browser case, an absent/invalid current verifier FAILS CLOSED.
 // Isolated Node/VM regression fixtures of the historic 121 archive do not load
 // the modern ledger; retain their historical checks *only* outside browsers.
 if(typeof pmsv444Valid==='function'){
  if(!pmsv444Valid())return '';
  const current=pmsv444Ledger?.records?.find(x=>x.catalog_id===p.id);
  if(!current||current.product_name!==p.name||
     String(current.fssr||'')!==String(p.fssr||'')||
     String(current.fcs||'')!==String(p.fcs||''))
     return '<div class="notice">Latest first-source identity mismatch: historical source proof withheld. No limit or PASS.</div>';
  if(current.source_status!=='FIRST_EXACT_SOURCE_PENDING')return '';
 }else if(typeof window!=='undefined')return '';
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

/* Source-pinned veterinary article expansion: 20 rows directly relevant to
 * fresh/frozen edible rabbit tissue, conditional-only finished casing and
 * processed-egg references. No laboratory or total compliance inference. */
var pmsvVet64SourceDb=null;
var pmsvVet64OriginalLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvVet64OriginalLoad();
 try{
  const res=await fetch('./data/rules/fssai-v9-21-vet-article-source-64-links-2026-10-11.json?v=20261011-vet64',{cache:'reload'});
  if(!res.ok)throw Error('FSSAI veterinary source expansion unavailable');
  const d=await res.json();
  if(d.products_total!==533||d.partial_first_source!==417||d.pending_first_source!==116||
    d.new_first_source_promotions!==0||d.finished_food_approvals!==0||
    d.scope_product_count!==7||d.records?.length!==7||
    d.distinct_analyte_source_rows!==21||d.source_rows?.length!==21||
    d.exact_rabbit_source_row_links!==40||d.conditional_casing_source_row_links!==20||
    d.conditional_processed_egg_source_row_links!==4||
    d.official_ctr!==contaminantsDb?.official_sources?.[0]?.url||
    d.source_version!==contaminantsDb?.source_version||
    new Set(d.records.map(r=>r.catalog_id)).size!==7)
    throw Error('Veterinary source metadata mismatch');
  pmsvVet64SourceDb=d;
 }catch(e){pmsvVet64SourceDb=null;}
};
function pmsvVet64SourceValid(p){
 const d=pmsvVet64SourceDb,c=contaminantsDb;
 if(!p||!d||!c||!pmsvNext121ProofDb||
    d.source_version!==c.source_version||
    d.official_ctr!==c.official_sources?.[0]?.url||
    d.partial_first_source!==417||d.pending_first_source!==116||
    d.new_first_source_promotions!==0||d.finished_food_approvals!==0||
    d.records?.length!==7||d.source_rows?.length!==21||
    d.exact_rabbit_source_row_links!==40||
    d.conditional_casing_source_row_links!==20||
    d.conditional_processed_egg_source_row_links!==4)return false;
 const r=d.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||'')!==String(p.fssr||'')||
    String(r.fcs||'')!==String(p.fcs||'')||
    r.numeric_auto_apply!==false||r.analytical_lot_pass!==false||
    r.full_contaminant_pass!==false||
    !sourcePriorityMetalDb?.unresolved_first_exact_catalog_ids?.includes(p.id))return false;
 const chapter=(Array.isArray(chapterRuleDbs)?chapterRuleDbs:[]).find(x=>x?.chapter==='2.5');
 if(!chapter||chapter.official_sources?.[0]?.url!==d.official_fssr||
    !chapter.standards?.some(x=>x.key===p.fssr))return false;
 const veterinary=c.antibiotic_and_pharmacological_substances?.veterinary_tolerance_limits;
 if(veterinary?.completeness!=='complete'||veterinary.auto_apply!==false)return false;
 if(new Set(d.source_rows.map(x=>x.key)).size!==21)return false;
 const keys=new Map(d.source_rows.map(x=>[x.key,x]));
 const direct=d.source_rows.filter(x=>x.key!=='vet-47-eggs');
 if(direct.length!==20||direct.some(x=>!x.source_article.startsWith('All edible animal tissues')))return false;
 if(r.route_type==='rabbit_exact_edible_tissue'){
  if(r.first_source_already_positive!==true||r.source_rows_finished_tissue_applicable!==true||
    r.source_article_keys.length!==20||p.fssr!=='2.5.2(6)'||
    pmsvFinalTwentyEightDb?.positive_records?.some(x=>x.catalog_id===p.id)!==true||
    !pmsvFinalTwentyEightSourceValid(p))return false;
 }else if(r.route_type==='casing_ingredient_conditional'){
  if(r.first_source_already_positive!==false||r.source_rows_finished_tissue_applicable!==false||
    r.source_article_keys.length!==20||p.fssr!=='2.5.2(14)')return false;
 }else if(r.route_type==='processed_egg_conditional'){
  if(r.first_source_already_positive!==false||r.source_rows_finished_tissue_applicable!==false||
    r.source_article_keys.length!==1||r.source_article_keys[0]!=='vet-47-eggs'||
    !p.fssr?.startsWith('2.5.3('))return false;
 }else return false;
 return r.source_article_keys.every(key=>{
  const x=keys.get(key);
  const entry=veterinary.rows.find(z=>z.serial===x?.serial&&z.name===x.analyte);
  return !!x&&x.limit===0.01&&x.unit==='mg/kg'&&
    entry?.rows?.filter(y=>y.article===x.source_article&&Number(y.limit)===x.limit&&y.unit===x.unit).length===1;
 });
}
function pmsvVet64ProofHtml(p){
 const d=pmsvVet64SourceDb;
 if(!p||!d?.records?.some(x=>x.catalog_id===p.id))return '';
 if(!pmsvVet64SourceValid(p))return '<div class="notice"><b>Expanded veterinary reference withheld.</b> Product identity or official FSSAI numeric source does not match. No limit applied.</div>';
 const r=d.records.find(x=>x.catalog_id===p.id),byKey=new Map(d.source_rows.map(x=>[x.key,x]));
 const refs=r.source_article_keys.map(key=>byKey.get(key));
 const verified=r.route_type==='rabbit_exact_edible_tissue';
 const mode=verified?'Exact named veterinary source applicable to edible rabbit tissue — not a laboratory result':
  'CONDITIONAL SOURCE REFERENCE ONLY — processing and legal article applicability unproven';
 const bullets=refs.map(x=>'<li>'+esc(x.analyte)+': <b>'+esc(x.limit)+' '+esc(x.unit)+
  '</b> — FSSAI veterinary serial '+esc(x.serial)+
  ' <small>('+esc(x.source_article)+')</small></li>').join('');
 return '<details class="card" style="margin-top:12px"><summary><b>Expanded FSSAI veterinary table — '+esc(refs.length)+
  ' named references</b> · '+esc(r.route_type.replaceAll('_',' '))+'</summary>'+
  '<div class="notice"><b>NOT A FINISHED-FOOD COMPLIANCE PASS.</b> '+esc(mode)+
  '. Limits are displayed as authenticated statutory source evidence, not results of an analysis.</div>'+
  '<p><b>Article conditions still to establish:</b> '+esc(r.requires)+'</p>'+
  '<p><b>Prohibited transfer:</b> '+esc(r.forbidden_inheritance)+'</p>'+
  '<ul>'+bullets+'</ul>'+
  '<small><a href="'+esc(d.official_fssr)+'" target="_blank" rel="noopener noreferrer">Official FSSAI Chapter 2.5</a> · '+
  '<a href="'+esc(d.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official Version IX Veterinary Table</a></small></details>';
}
var pmsvVet64OriginalProofHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 return pmsvVet64OriginalProofHtml(p)+pmsvVet64ProofHtml(p);
};

/* 533-product current first-source status. The older 121/118 research queues
 * remain immutable historical evidence; this new ledger is authoritative
 * for CURRENT inventory totals (417 partial source / 116 pending).
 * A source match never means the tested finished-food lot is compliant. */
var pmsvCurrent533SourceLedger=null;
var pmsvPreviousLoadCurrent533=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvPreviousLoadCurrent533();
 try{
  const response=await fetch('./data/rules/fssai-current-first-source-533-live-ledger-417-116-2026-10-11.json?v=20261011-ledger533',{cache:'reload'});
  if(!response.ok)throw Error('Current first-source ledger unavailable');
  const d=await response.json();
  if(d.schema_version!=='1.0'||d.catalogue!==533||d.partial_exact!==417||
    d.first_source_pending!==116||d.full_compliance_approvals!==0||
    d.previous_archived_pending!==121||d.positive_delta_count!==5||
    d.group_reviewed_current_pending_count!==116||
    d.status_scope!=='CURRENT_FIRST_EXACT_SOURCE_LEDGER_NOT_FINISHED_FOOD_PASS'||
    d.official_contaminants_source!==contaminantsDb?.official_sources?.[0]?.url||
    d.source_version!==contaminantsDb?.source_version||d.records?.length!==533||
    d.records.filter(x=>x.source_status==='PARTIAL_EXACT_SOURCE_MATCH').length!==417||
    d.records.filter(x=>x.source_status==='FIRST_EXACT_SOURCE_PENDING').length!==116||
    d.records.some(x=>x.product_compliance_approval!==false||
      x.sample_lab_pass!==false||x.complete_contaminant_panel!==false||
      x.regulatory_coverage!=='PARTIAL_OR_PENDING')||
    new Set(d.records.map(x=>x.catalog_id)).size!==533)
    throw Error('Invalid current first-source ledger');
  const historic=new Map(pmsvNext121ProofDb?.records?.map(x=>[x.catalog_id,x])||[]);
  if(historic.size!==121||d.records.filter(x=>historic.has(x.catalog_id)&&
       x.source_status==='PARTIAL_EXACT_SOURCE_MATCH').length!==5||
     d.records.filter(x=>historic.has(x.catalog_id)&&
       x.source_status==='FIRST_EXACT_SOURCE_PENDING').length!==116)
     throw Error('Historical/current first-source source count mismatch');
  pmsvCurrent533SourceLedger=d;
 }catch(error){pmsvCurrent533SourceLedger=null;}
};
function pmsvCurrent533SourceProofValid(p){
 const d=pmsvCurrent533SourceLedger,c=contaminantsDb;
 if(!p||!d||!c||d.catalogue!==533||d.partial_exact!==417||
    d.first_source_pending!==116||d.full_compliance_approvals!==0||
    d.positive_delta_count!==5||d.source_version!==c.source_version||
    d.official_contaminants_source!==c.official_sources?.[0]?.url||
    d.records?.length!==533)return false;
 const rec=d.records.find(x=>x.catalog_id===p.id);
 if(!rec||rec.product_name!==p.name||
    String(rec.fssr||'')!==String(p.fssr||'')||
    String(rec.fcs||'')!==String(p.fcs||'')||
    rec.product_compliance_approval!==false||
    rec.sample_lab_pass!==false||rec.complete_contaminant_panel!==false||
    rec.regulatory_coverage!=='PARTIAL_OR_PENDING')return false;
 if(rec.source_status==='FIRST_EXACT_SOURCE_PENDING')
  return rec.missing_first_exact_evidence===true&&rec.regulatory_source_verified_delta===null;
 if(rec.source_status==='PARTIAL_EXACT_SOURCE_MATCH')
  return rec.missing_first_exact_evidence===false&&
    (rec.evidence_origin==='historical independently audited 412'&&rec.regulatory_source_verified_delta===null||
     rec.evidence_origin==='2026-10-11 positive delta'&&
      typeof rec.regulatory_source_verified_delta?.evidence_class==='string'&&
      rec.regulatory_source_verified_delta?.official===d.official_contaminants_source);
 return false;
}
function pmsvCurrent533SourceStatusHtml(p){
 if(!p)return '';
 if(!pmsvCurrent533SourceLedger)return ''; // Existing historic panels continue until the current ledger authenticates.
 if(!pmsvCurrent533SourceProofValid(p))return '<div class="notice"><b>Current FSSAI first-source status withheld.</b> Product identity, source or regulatory version mismatch. No automatic compliance result.</div>';
 const d=pmsvCurrent533SourceLedger,r=d.records.find(x=>x.catalog_id===p.id);
 const pending=r.source_status==='FIRST_EXACT_SOURCE_PENDING';
 const status=pending?'FIRST EXACT CONTAMINANT SOURCE STILL PENDING':'PARTIAL EXACT SOURCE EVIDENCE ONLY';
 const body=pending?'The current evidence review has not established an exact applicable contaminant article for this finished product. Source candidates displayed elsewhere are not automatically applicable.':
  'At least one exact applicable source article was verified. This does not show a complete contaminant panel, a tested sample, or finished-product compliance.';
 return '<details class="card" style="margin-top:12px"><summary><b>Current FSSAI source-status ledger</b> — '+esc(status)+'</summary>'+
  '<div class="notice"><b>NOT A COMPLIANCE PASS.</b> '+esc(body)+'</div>'+
  '<p><b>Review source:</b> '+esc(r.review_group)+'.</p>'+
  '<p><b>Catalogue reconciliation:</b> '+esc(d.catalogue)+' identities; '+esc(d.partial_exact)+
  ' partial first-source matches; '+esc(d.first_source_pending)+' without a first exact match; '+esc(d.full_compliance_approvals)+
  ' approved finished-product compliance outcomes.</p>'+
  '<small><a href="'+esc(d.official_contaminants_source)+'" target="_blank" rel="noopener noreferrer">Official FSSAI Version IX source</a></small></details>';
}
var pmsvOriginalCurrent533ProofHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 return pmsvCurrent533SourceStatusHtml(p)+pmsvOriginalCurrent533ProofHtml(p);
};


/* Current 116-case source-proof closure worklist, 12 Oct 2026.
 * Read-only operational evidence requests, NEVER an automatic contaminant
 * limit assignment, product regulatory clearance or laboratory PASS. */
var pmsvCurrent116ProofWorklist=null;
var pmsvPriorLoadCurrent116=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvPriorLoadCurrent116();
 pmsvCurrent116ProofWorklist=null;
 try{
  const response=await fetch('./data/rules/fssai-current-116-finished-article-proof-worklist-2026-10-12.json?v=20261012-proof116',{cache:'reload'});
  if(!response.ok)throw Error('Current 116 evidence requirements unavailable');
  const d=await response.json(),ledger=pmsvCurrent533SourceLedger,core=contaminantsDb;
  if(!ledger||!core||d.schema_version!=='1.0'||d.catalogue!==533||
    d.current_partial_exact!==417||d.current_pending_first_exact!==116||
    d.full_compliance_approvals!==0||d.new_first_exact_promotions!==0||
    d.numeric_auto_application!==false||d.records?.length!==116||
    d.regulatory_basis!==core.official_sources?.[0]?.url||
    d.source_version!==core.source_version||
    d.source_policy!=='OFFICIAL_FSSAI_FOSCOS_ONLY'||
    d.scope!=='OPERATIONAL_SOURCE_PROOF_WORKLIST_NOT_LEGAL_OR_LAB_COMPLIANCE')
    throw Error('Current evidence closure metadata invalid');
  const current=ledger.records.filter(x=>x.source_status==='FIRST_EXACT_SOURCE_PENDING');
  const byId=new Map(current.map(x=>[x.catalog_id,x]));
  if(byId.size!==116||new Set(d.records.map(x=>x.catalog_id)).size!==116||
    Object.entries({'20 fungal, fruit, tomato subtype matrix':20,
      '14 sugar, egg, confection subtype matrix':14,
      '56 cross-form transfer exclusions':56,
      '26 remaining product-specific evidence blockers':26})
      .some(([name,n])=>d.review_group_counts?.[name]!==n||
        d.records.filter(x=>x.current_review_group===name).length!==n)||
    d.records.some(x=>{
      const p=byId.get(x.catalog_id);
      return !p||p.product_name!==x.product_name||
        String(p.fssr||'')!==String(x.fssr||'')||
        String(p.fcs||'')!==String(x.fcs||'')||
        p.review_group!==x.current_review_group||
        x.official_contaminant_source!==d.regulatory_basis||
        !x.official_finished_product_source?.startsWith('https://')||
        !x.official_finished_product_source.includes('fssai.gov.in')||
        !x.source_evidence_manifest?.startsWith('fssai-product-helper-preview-01/data/rules/')||
        !x.forbidden_transfer||!Array.isArray(x.proof_branches)||
        x.proof_branches.length===0||
        x.proof_branches.some(b=>!b.branch||!Array.isArray(b.required_evidence)||
          b.required_evidence.length===0||b.required_evidence.some(v=>typeof v!=='string'||!v))||
        x.first_exact_source_verified!==false||
        x.numeric_finished_food_limit_auto_applied!==false||
        x.finished_food_laboratory_pass!==false||
        x.full_regulatory_compliance_approval!==false||
        x.evidence_state!=='FSSAI_EXACT_FINISHED_ARTICLE_PROOF_REQUIRED';
    }))throw Error('Source closure rows do not reconcile against live 533 identity ledger');
  pmsvCurrent116ProofWorklist=d;
 }catch(e){pmsvCurrent116ProofWorklist=null;}
};
function pmsvCurrent116ProofChecklistHtml(p){
 const d=pmsvCurrent116ProofWorklist,ledger=pmsvCurrent533SourceLedger;
 if(!p||!d||!ledger)return '';
 const item=d.records.find(x=>x.catalog_id===p.id);
 if(!item)return '';
 if(!pmsvCurrent533SourceProofValid(p)||item.product_name!==p.name||
    String(item.fssr||'')!==String(p.fssr||'')||
    String(item.fcs||'')!==String(p.fcs||'')||
    !ledger.records.some(x=>x.catalog_id===p.id&&x.source_status==='FIRST_EXACT_SOURCE_PENDING')||
    item.first_exact_source_verified!==false||
    item.numeric_finished_food_limit_auto_applied!==false||
    item.finished_food_laboratory_pass!==false||
    item.full_regulatory_compliance_approval!==false||
    !item.proof_branches?.length)
   return '<div class="notice"><b>Source-proof worklist withheld:</b> identity or verification state mismatch. No compliance result may be inferred.</div>';
 const tasks=item.proof_branches.map(b=>
   '<li><b>'+esc(b.branch)+'</b><ul>'+
   b.required_evidence.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>'+
   (b.source_article_candidates?.length?
    '<small>Possible official source articles / reference IDs — NOT APPLIED: '+
    b.source_article_candidates.map(esc).join('; ')+'</small>':
    '<small>No direct candidate source article has been established for this form.</small>')+
   '</li>').join('');
 return '<details class="card" style="margin-top:12px"><summary><b>Evidence needed to close this first-source gap</b> — '+
   esc(item.regulatory_case.replaceAll('_',' '))+'</summary>'+
   '<div class="notice"><b>FIRST EXACT MATCH UNRESOLVED — NO LIMIT OR PASS APPLIED.</b> '+
   'Product variant, species, processing and analytical matrix must be evidenced against the official finished-food article.</div>'+
   '<ol>'+tasks+'</ol><p><b>Do not transfer:</b> '+esc(item.forbidden_transfer)+'</p>'+
   '<p><small>The above is a research checklist only. Current FSSAI edition, actual batch documentation, sample basis, other contaminants and amendments require independent review.</small></p>'+
   '<small><a href="'+esc(item.official_finished_product_source)+'" target="_blank" rel="noopener noreferrer">Official FSSAI/FoSCoS product source</a> · '+
   '<a href="'+esc(item.official_contaminant_source)+'" target="_blank" rel="noopener noreferrer">FSSAI Version IX contaminant source</a></small></details>';
}
var pmsvBeforeProof116CurrentStatus=pmsvCurrent533SourceStatusHtml;
pmsvCurrent533SourceStatusHtml=function(p){
 return pmsvBeforeProof116CurrentStatus(p)+pmsvCurrent116ProofChecklistHtml(p);
};


/* Version IX source-article decision branches for 31 otherwise pending identities.
   Read-only operator declaration, never legal proof or a laboratory approval. */
var pmsvCerealFruitSpiceSourceDb=null;
var pmsvCerealFruitSpiceChoices=Object.create(null);
var pmsvPriorCerealFruitSpiceLoader=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvPriorCerealFruitSpiceLoader();
 pmsvCerealFruitSpiceSourceDb=null;
 try{
  const r=await fetch('./data/rules/fssai-2026-10-12-thirtytwo-cereal-fruit-spice-identity-source-branches.json?v=20261012-subtype31',{cache:'reload'});
  if(!r.ok)throw Error('FSSAI product subtype articles unavailable');
  const d=await r.json(),current=pmsvCurrent533SourceLedger,c=contaminantsDb;
  if(!current||!c||d.schema_version!=='1.0'||d.current_catalogue!==533||
    d.current_partial!==417||d.current_pending!==116||
    d.distinct_current_pending_reviewed!==32||d.records?.length!==32||
    d.source_article_rows?.length!==5||d.first_source_promotions!==0||
    d.full_compliance_passes!==0||
    d.official_contaminants_source!==c.official_sources?.[0]?.url||
    d.source_version!==c.source_version||
    d.study_scope!=='EXACT_ARTICLE_SOURCES_WITH_FINISHED_FORM_SELECTION_REQUIRED'||
    d.official_sources_only!==true||
    new Set(d.records.map(x=>x.catalog_id)).size!==32)throw Error('Regulatory subtype manifest mismatch');
  const keys=new Map(d.source_article_rows.map(x=>[x.key,x]));
  if(keys.size!==5||Object.entries({cereals:9,fruits:9,spice:3,source_exclusions:11})
    .some(([key,n])=>d.review_groups?.[key]!==n||
      d.records.filter(x=>x.article_family_review===key).length!==n))throw Error('Subtype group reconciliation failed');
  const v9=c.crop_contaminants,nots=c.naturally_occurring_toxic_substances;
  for(const x of keys.values()){
    if(!x.article||!x.refs?.length)throw Error('Malformed official source reference');
    for(const ref of x.refs){
      const arr=x.kind==='crop'?v9?.[ref.core_key]?.rules:nots?.[ref.core_key];
      if((arr||[]).filter(y=>y.article===x.article&&Number(y.limit)===ref.limit&&
        (x.kind!=='nots'||y.unit===ref.unit)).length!==1 ||
        (x.kind==='crop'&&v9[ref.core_key].unit!==ref.unit))
        throw Error('FSSAI source article changed');
    }
  }
  const unresolved=new Map(current.records.filter(x=>x.source_status==='FIRST_EXACT_SOURCE_PENDING').map(x=>[x.catalog_id,x]));
  for(const x of d.records){
    const p=unresolved.get(x.catalog_id);
    if(!p||p.product_name!==x.product_name||
      String(p.fssr||'')!==String(x.fssr||'')||
      String(p.fcs||'')!==String(x.fcs||'')||
      !x.official_product_source?.startsWith('https://')||
      !x.official_product_source.includes('fssai.gov.in')||
      x.official_contaminants_source!==d.official_contaminants_source||
      x.status!=='CONDITIONAL_ONLY_NO_FIRST_SOURCE_PROMOTION'||
      x.positive_finished_article_verified!==false||
      x.unconditional_limit_application!==false||
      x.complete_regulatory_pass!==false||x.analytical_lot_pass!==false||
      !x.explicit_exclusion||!x.selectable_branches?.length ||
      x.selectable_branches.some(b=>!b.label||!b.positive_proof?.length||
        !b.not_automatically_applicable||
        b.source_keys.some(k=>!keys.has(k))))throw Error('Product subtype must not inherit an unverified source');
  }
  pmsvCerealFruitSpiceSourceDb=d;
 }catch(e){pmsvCerealFruitSpiceSourceDb=null;}
};
function pmsvSelectCerealFruitSpiceBranch(v){
 const p=typeof selectedCatalogProductForContaminants==='function'?selectedCatalogProductForContaminants():null;
 const rec=pmsvCerealFruitSpiceSourceDb?.records?.find(x=>x.catalog_id===p?.id);
 if(!rec||!['unverified',...rec.selectable_branches.map(x=>x.id)].includes(v))return;
 pmsvCerealFruitSpiceChoices[p.id]=v;
 if(typeof renderProductContaminants==='function')renderProductContaminants();
}
function pmsvCerealFruitSpiceSourceHtml(p){
 const d=pmsvCerealFruitSpiceSourceDb;
 if(!p||!d?.records?.some(x=>x.catalog_id===p.id))return '';
 const rec=d.records.find(x=>x.catalog_id===p.id);
 if(!pmsvCurrent533SourceProofValid(p)||p.name!==rec.product_name||
    String(p.fssr||'')!==String(rec.fssr||'')||
    String(p.fcs||'')!==String(rec.fcs||'')||
    !pmsvCurrent533SourceLedger?.records?.some(x=>x.catalog_id===p.id&&x.source_status==='FIRST_EXACT_SOURCE_PENDING')||
    rec.positive_finished_article_verified!==false||
    rec.unconditional_limit_application!==false||
    rec.complete_regulatory_pass!==false||rec.analytical_lot_pass!==false)
   return '<div class="notice"><b>Conditional article withheld.</b> Finished identity or current source mismatch. No compliance decision.</div>';
 const selected=pmsvCerealFruitSpiceChoices[p.id]||'unverified',
   branch=rec.selectable_branches.find(x=>x.id===selected);
 if(selected!=='unverified'&&!branch)return '<div class="notice"><b>Conditional subtype withheld.</b> Invalid article classification.</div>';
 const options=[{id:'unverified',label:'Finished article, composition and source scope NOT VERIFIED'},...rec.selectable_branches]
   .map(x=>'<option value="'+esc(x.id)+'"'+(selected===x.id?' selected':'')+'>'+esc(x.label)+'</option>').join('');
 const byKey=new Map(d.source_article_rows.map(x=>[x.key,x]));
 const named=branch?.source_keys.flatMap(key=>{
    const x=byKey.get(key);return x?x.refs.map(v=>esc(v.analyte)+': '+esc(v.limit)+' '+esc(v.unit)+' ('+esc(x.article)+')'):[];
 })||[];
 const detail=branch?
   '<div class="notice"><b>UNVERIFIED OPERATOR SELECTION — OFFICIAL REFERENCE NOT APPLIED.</b> '+
   (named.length?named.join('; '):'No named source established for the finished form.')+'</div>'+
   '<ul>'+branch.positive_proof.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+
   '<p><b>Do not transfer:</b> '+esc(branch.not_automatically_applicable)+'</p>':
   '<div class="notice"><b>No source article selected.</b> Recipe, legal food article and analytical basis are not independently verified.</div>';
 return '<details class="card" style="margin-top:12px"><summary><b>Finished-food subtype: source article distinction</b> — '+
   esc(rec.article_family_review.replaceAll('_',' '))+'</summary>'+
   '<p><b>Source-locked conditional review only.</b> '+esc(rec.explicit_exclusion)+'</p>'+
   '<label for="pmsvCerealFruitSpiceBranch">Select a research hypothesis (NOT legal confirmation)</label>'+
   '<select id="pmsvCerealFruitSpiceBranch" onchange="pmsvSelectCerealFruitSpiceBranch(this.value)">'+options+'</select>'+
   detail+'<small><a href="'+esc(rec.official_product_source)+'" target="_blank" rel="noopener noreferrer">Official product identity</a> · '+
   '<a href="'+esc(rec.official_contaminants_source)+'" target="_blank" rel="noopener noreferrer">FSSAI Version IX source articles</a></small>'+
   '<p><small>No source reference is automatically a finished-product limit; no sample, laboratory result or compliance PASS is inferred.</small></p></details>';
}
var pmsvPreviousCerealFruitSpiceCurrentStatusHtml=pmsvCurrent533SourceStatusHtml;
pmsvCurrent533SourceStatusHtml=function(p){
 return pmsvPreviousCerealFruitSpiceCurrentStatusHtml(p)+pmsvCerealFruitSpiceSourceHtml(p);
};


/* Deep source-integrity check: source rows are checked AGAIN at rendering time.
 * A successful prior load is not sufficient when a loaded source row or
 * identity record changes. This is a documentary reference, never a PASS. */
const pmsvCanonicalNamedFssaiSourceRefs=[
 ['cereal','crop','Cereal and cereal products','total_aflatoxins',15,'µg/kg'],
 ['cereal','crop','Cereal and cereal products','aflatoxin_b1',10,'µg/kg'],
 ['composite','crop','Food product containing any of the above mentioned food articles','total_aflatoxins',20,'µg/kg'],
 ['composite','crop','Food product containing any of the above mentioned food articles','aflatoxin_b1',10,'µg/kg'],
 ['nuts','crop','Nuts, ready to eat','total_aflatoxins',15,'µg/kg'],
 ['nuts','crop','Nuts, ready to eat','aflatoxin_b1',10,'µg/kg'],
 ['spices','crop','Spices/Spice Mix','total_aflatoxins',30,'µg/kg'],
 ['spices','crop','Spices/Spice Mix','aflatoxin_b1',15,'µg/kg'],
 ['cassava','nots','Sago, Cassava flour, Tapioca flour, Manihot flour and their products','hydrocyanic_acid',10,'ppm']
];
function pmsvValidOfficialFssaiUrl(url){
 return typeof url==='string'&&/^https:\/\/(?:[a-z0-9-]+\.)*fssai\.gov\.in\/[^<>"'\s]+$/i.test(url);
}
function pmsvCurrent116DocumentaryIntegrity(){
 const d=pmsvCurrent116ProofWorklist,l=pmsvCurrent533SourceLedger,c=contaminantsDb;
 if(!d||!l||!c||d.catalogue!==533||d.current_partial_exact!==417||
    d.current_pending_first_exact!==116||d.records?.length!==116||
    l.records?.length!==533||l.partial_exact!==417||l.first_source_pending!==116||
    d.full_compliance_approvals!==0||d.new_first_exact_promotions!==0||
    d.numeric_auto_application!==false||
    d.scope!=='OPERATIONAL_SOURCE_PROOF_WORKLIST_NOT_LEGAL_OR_LAB_COMPLIANCE'||
    d.regulatory_basis!==c.official_sources?.[0]?.url||
    d.source_version!==c.source_version||
    !pmsvValidOfficialFssaiUrl(d.regulatory_basis))return false;
 const pending=new Map(l.records.filter(x=>x.source_status==='FIRST_EXACT_SOURCE_PENDING')
   .map(x=>[x.catalog_id,x]));
 const groups={'20 fungal, fruit, tomato subtype matrix':20,
  '14 sugar, egg, confection subtype matrix':14,
  '56 cross-form transfer exclusions':56,
  '26 remaining product-specific evidence blockers':26};
 if(pending.size!==116||new Set(d.records.map(x=>x.catalog_id)).size!==116||
    Object.entries(groups).some(([g,n])=>d.review_group_counts?.[g]!==n||
      d.records.filter(x=>x.current_review_group===g).length!==n))return false;
 return d.records.every(x=>{
  const p=pending.get(x.catalog_id);
  return !!p&&p.product_name===x.product_name&&
   String(p.fssr||'')===String(x.fssr||'')&&
   String(p.fcs||'')===String(x.fcs||'')&&
   p.review_group===x.current_review_group&&
   x.official_contaminant_source===d.regulatory_basis&&
   pmsvValidOfficialFssaiUrl(x.official_finished_product_source)&&
   x.source_evidence_manifest?.startsWith('fssai-product-helper-preview-01/data/rules/')&&
   x.first_exact_source_verified===false&&
   x.numeric_finished_food_limit_auto_applied===false&&
   x.finished_food_laboratory_pass===false&&
   x.full_regulatory_compliance_approval===false&&
   x.evidence_state==='FSSAI_EXACT_FINISHED_ARTICLE_PROOF_REQUIRED'&&
   typeof x.forbidden_transfer==='string'&&x.forbidden_transfer.length>0&&
   Array.isArray(x.proof_branches)&&x.proof_branches.length>0&&
   x.proof_branches.every(b=>typeof b.branch==='string'&&b.branch.length>0&&
    Array.isArray(b.required_evidence)&&b.required_evidence.length>0&&
    b.required_evidence.every(t=>typeof t==='string'&&t.length>0)&&
    Array.isArray(b.source_article_candidates)&&
    b.source_article_candidates.every(v=>typeof v==='string'));
 });
}
function pmsvCurrent32DocumentaryIntegrity(){
 const d=pmsvCerealFruitSpiceSourceDb,l=pmsvCurrent533SourceLedger,c=contaminantsDb;
 if(!d||!l||!c||d.records?.length!==32||d.distinct_current_pending_reviewed!==32||
    d.current_catalogue!==533||d.current_partial!==417||d.current_pending!==116||
    d.first_source_promotions!==0||d.full_compliance_passes!==0||
    d.source_version!==c.source_version||
    d.official_contaminants_source!==c.official_sources?.[0]?.url||
    d.study_scope!=='EXACT_ARTICLE_SOURCES_WITH_FINISHED_FORM_SELECTION_REQUIRED'||
    d.official_sources_only!==true||
    !pmsvValidOfficialFssaiUrl(d.official_contaminants_source)||
    d.source_article_rows?.length!==5||
    new Set(d.records.map(x=>x.catalog_id)).size!==32)return false;
 const source=new Map(d.source_article_rows.map(x=>[x.key,x]));
 if(source.size!==5)return false;
 // Independent canonical numbers and articles, not merely matching two
 // altered copies of the same JSON file.
 for(const [key,kind,article,coreKey,limit,unit] of pmsvCanonicalNamedFssaiSourceRefs){
  const x=source.get(key);
  const saved=x?.refs?.find(v=>v.core_key===coreKey);
  if(!x||x.kind!==kind||x.article!==article||
     x.refs.length!==(key==='cassava'?1:2)||
     !saved||saved.limit!==limit||saved.unit!==unit||
     (kind==='crop'&&!['Aflatoxin B1','Total Aflatoxins'].includes(saved.analyte))||
     (kind==='nots'&&saved.analyte!=='Hydrocyanic acid'))return false;
  const core=kind==='crop'?c.crop_contaminants?.[coreKey]:c.naturally_occurring_toxic_substances?.[coreKey];
  const rows=kind==='crop'?core?.rules:core;
  if(kind==='crop'&&core?.unit!==unit)return false;
  if(!Array.isArray(rows)||rows.filter(y=>y.article===article&&
       Number(y.limit)===limit&&(kind==='crop'||y.unit===unit)).length!==1)return false;
 }
 const pending=new Map(l.records.filter(x=>x.source_status==='FIRST_EXACT_SOURCE_PENDING')
   .map(x=>[x.catalog_id,x]));
 if(pending.size!==116||
    Object.entries({cereals:9,fruits:9,spice:3,source_exclusions:11})
      .some(([g,n])=>d.review_groups?.[g]!==n||
        d.records.filter(x=>x.article_family_review===g).length!==n))return false;
 return d.records.every(x=>{
  const p=pending.get(x.catalog_id);
  return !!p&&p.product_name===x.product_name&&
    String(p.fssr||'')===String(x.fssr||'')&&
    String(p.fcs||'')===String(x.fcs||'')&&
    x.official_contaminants_source===d.official_contaminants_source&&
    pmsvValidOfficialFssaiUrl(x.official_product_source)&&
    x.status==='CONDITIONAL_ONLY_NO_FIRST_SOURCE_PROMOTION'&&
    x.positive_finished_article_verified===false&&
    x.unconditional_limit_application===false&&
    x.complete_regulatory_pass===false&&x.analytical_lot_pass===false&&
    typeof x.explicit_exclusion==='string'&&x.explicit_exclusion.length>0&&
    Array.isArray(x.selectable_branches)&&x.selectable_branches.length>0&&
    new Set(x.selectable_branches.map(b=>b.id)).size===x.selectable_branches.length&&
    x.selectable_branches.every(b=>b.id&&b.id.endsWith('_UNVERIFIED')||
      b.id==='related_articles_explicitly_excluded')&&
    x.selectable_branches.every(b=>b.label&&b.positive_proof?.length>0&&
      b.positive_proof.every(t=>typeof t==='string'&&t.length>0)&&
      b.not_automatically_applicable&&Array.isArray(b.source_keys)&&
      b.source_keys.every(k=>source.has(k)));
 });
}
var pmsvPreIntegrity116ProofHtml=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p||!pmsvCurrent116ProofWorklist?.records?.some(x=>x.catalog_id===p.id))return '';
 if(!pmsvCurrent116DocumentaryIntegrity())
   return '<div class="notice"><b>Source-proof worklist withheld.</b> One or more current 116-product identities, source URLs, review branches, totals or compliance flags are inconsistent. No values applied.</div>';
 return pmsvPreIntegrity116ProofHtml(p);
};
var pmsvPreIntegrity32Html=pmsvCerealFruitSpiceSourceHtml;
pmsvCerealFruitSpiceSourceHtml=function(p){
 if(!p||!pmsvCerealFruitSpiceSourceDb?.records?.some(x=>x.catalog_id===p.id))return '';
 if(!pmsvCurrent32DocumentaryIntegrity())
   return '<div class="notice"><b>Conditional article withheld.</b> A named official FSSAI value, unit, source identity, review branch or non-PASS safeguard changed. No values applied.</div>';
 return pmsvPreIntegrity32Html(p);
};

/* PMSV 2026-10-12 681-record audit lock: 533 ledger + 116 outstanding
 * evidence packets + 32 conditional source branches. These fingerprints
 * detect altered/reordered local review records after load; they are NOT
 * a digital signature, official-source verification, or regulatory PASS. */
const pmsvReviewSnapshotDigests=Object.freeze({
 ledger:'1cf824cba2bc4000',
 work:'59abdc38eeafd59f',
 branches:'dbfcd1896fe71720'
});
function pmsvReviewSnapshotDigest(x){
 const s=JSON.stringify(x);
 if(typeof s!=='string')return '';
 let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){
  const ch=s.charCodeAt(i);
  a=Math.imul(a^ch,16777619);
  b=Math.imul(b^ch,2246822519);
 }
 return (a>>>0).toString(16).padStart(8,'0')+
   (b>>>0).toString(16).padStart(8,'0');
}
function pmsvReviewSnapshotIntact(kind,document){
 const expected=pmsvReviewSnapshotDigests[kind];
 return typeof expected==='string'&&expected.length===16&&
   !!document&&pmsvReviewSnapshotDigest(document)===expected;
}
var pmsvBeforeSnapshotLedgerProof=pmsvCurrent533SourceProofValid;
pmsvCurrent533SourceProofValid=function(p){
 return pmsvReviewSnapshotIntact('ledger',pmsvCurrent533SourceLedger)&&
   pmsvBeforeSnapshotLedgerProof(p);
};
var pmsvBeforeSnapshotWorkProof=pmsvCurrent116DocumentaryIntegrity;
pmsvCurrent116DocumentaryIntegrity=function(){
 return pmsvReviewSnapshotIntact('ledger',pmsvCurrent533SourceLedger)&&
   pmsvReviewSnapshotIntact('work',pmsvCurrent116ProofWorklist)&&
   pmsvBeforeSnapshotWorkProof();
};
var pmsvBeforeSnapshot32Proof=pmsvCurrent32DocumentaryIntegrity;
pmsvCurrent32DocumentaryIntegrity=function(){
 return pmsvReviewSnapshotIntact('ledger',pmsvCurrent533SourceLedger)&&
   pmsvReviewSnapshotIntact('branches',pmsvCerealFruitSpiceSourceDb)&&
   pmsvBeforeSnapshot32Proof();
};
