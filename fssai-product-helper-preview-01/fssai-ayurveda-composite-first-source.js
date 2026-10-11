"use strict";
var pmsvAyurvedaCompositeB1Db=null;
async function pmsvLoadAyurvedaCompositeB1(){
 try{
  const r=await fetch('./data/rules/fssai-2-ayurveda-composite-first-source-2026-10-11.json?v=20261011-plus2',{cache:'reload'});
  if(!r.ok)throw new Error('Ayurveda exact source evidence not found');
  const data=await r.json();
  if(data.original_catalogue!==533||data.original_partial_exact_evidence!==412||data.original_pending_first_exact!==121||
     data.newly_source_matched_product_count!==2||data.current_partial_exact_after_supplement!==414||
     data.current_unresolved_after_supplement!==119||data.full_compliance_approvals!==0||
     data.records?.length!==2)throw new Error('Source-ledger delta mismatch');
  pmsvAyurvedaCompositeB1Db=data;
 }catch(e){pmsvAyurvedaCompositeB1Db=null;}
}
function sourcePinnedAyurvedaCompositeB1Html(p){
 if(!p||!['102-102-1-13-1-krishara-khichdi','102-102-1-15-1-kulmasha-barley-savory-discs'].includes(p.id))return '';
 const fail='<div class="notice"><b>Ayurveda Aahara composite Aflatoxin source withheld:</b> positive ingredient evidence, source table or exact FoSCoS product identity failed verification. No numeric limit or PASS assigned.</div>';
 const db=pmsvAyurvedaCompositeB1Db,ref=contaminantsDb,recipes=ayurvedaRecipeReviewDb;
 const source='https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf';
 const recipeUrl='https://fssai.gov.in/upload/uploadfiles/files/Order%20dated%2025-07-2025%20enclosing%20Ayurveda%20Aahara.pdf';
 if(!db||db.records?.length!==2||db.original_catalogue!==533||
    db.current_partial_exact_after_supplement!==414||db.current_unresolved_after_supplement!==119||
    db.newly_source_matched_product_count!==2||db.full_compliance_approvals!==0||
    db.official_recipe_source!==recipeUrl||db.official_contaminants_source!==source||
    ref?.source_version!=='Version IX (03.02.2026)'||ref.official_sources?.[0]?.url!==source||
    recipes?.official_recipe_order!==recipeUrl||recipes?.official_ctr_version_ix!==source)return fail;
 const rec=db.records.find(x=>x.catalog_id===p.id),underlying=recipes.records?.find(x=>x.catalog_id===p.id);
 if(!rec||!underlying||rec.product_name!==p.name||rec.fssr!==p.fssr||rec.fcs!==p.fcs||
    underlying.product_name!==p.name||underlying.recipe_ingredient_evidence!==rec.ingredient_proof||
    underlying.official_recipe_id!==rec.recipe_id||underlying.has_b1_recipe_candidate!==true||
    rec.source_identity_positive!==true||rec.source_rows_verified!==true||
    rec.complete_contaminant_panel!==false||rec.regulatory_sample_pass!==false||
    rec.not_a_finished_lot_compliance_pass!==true||
    rec.processing_loss_or_concentration_and_current_amendment_review_needed!==true||
    rec.applicable_source_rows?.length!==2)return fail;
 const good=rec.applicable_source_rows.every(x=>{
  const row=ref.crop_contaminants?.[x.source_group];
  return row?.unit===x.unit&&Number.isFinite(x.limit)&&
    (row.rules||[]).filter(z=>z.article===rec.source_product_article&&Number(z.limit)===x.limit).length===1;
 });
 if(!good)return fail;
 const rows=rec.applicable_source_rows.map(x=>'<tr><td>'+esc(x.contaminant)+'</td><td><b>'+esc(x.limit)+' '+esc(x.unit)+'</b></td><td>'+esc(rec.source_product_article)+'</td></tr>').join('');
 return '<div class="card"><div class="section-title"><h3>Positive FSSAI first-source match — Ayurveda Aahara recipe</h3><span>Partial contaminant evidence only</span></div>'+
  '<div class="notice"><b>Mandatory ingredient confirmed by official recipe:</b> '+esc(rec.ingredient_proof)+
  '. This product contains rice/lentils or barley/gram, so the current FSSAI composite-food aflatoxin article has affirmative ingredient evidence. No finished-product laboratory result or complete compliance PASS is claimed.</div>'+
  '<div class="tablewrap"><table><thead><tr><th>Contaminant</th><th>Maximum</th><th>Named official article</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
  '<p><b>Other sources still to review:</b> effective amendments; analytical dry/as-sold basis; sampling and processing effects; metals, pesticides and other residues.</p>'+
  '<small><a href="'+esc(recipeUrl)+'" target="_blank" rel="noopener noreferrer">Official Ayurveda Aahara recipe order</a> · '+
  '<a href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">FSSAI Version IX crop contaminant table</a></small></div>';
}
