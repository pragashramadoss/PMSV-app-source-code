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
