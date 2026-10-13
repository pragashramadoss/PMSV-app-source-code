"use strict";
/* FSSAI official CTR IX pages 12 and 51 (zero indexed 11 and 50):
 * Melamine powdered infant formula / liquid infant formula / other foods;
 * methylmercury all foods. Conditional source evidence only, not a PASS.
 */
var pmsv40MelamineUniversalData=null;
const pmsv40MelamineUniversalDigest="a6aa467280fed505";
const pmsv40MelamineUniversalFixed=Object.freeze({
 "melamine-powdered-infant":{article:"Powdered infant formula",limit:1,page0:50,contaminant:"Melamine",reg:"2.5.1"},
 "melamine-liquid-infant":{article:"Liquid infant formula",limit:0.15,page0:50,contaminant:"Melamine",reg:"2.5.1"},
 "melamine-other-foods":{article:"Other foods",limit:2.5,page0:50,contaminant:"Melamine",reg:"2.5.1"},
 "methylmercury-all-foods":{article:"All foods",limit:0.25,page0:11,contaminant:"Methyl Mercury (Calculated as the element)",reg:"2.1.1"}
});
function pmsv40MelamineUniversalValid(){
 if(typeof pmsv493Valid!=="function"||!pmsv493Valid()||
 typeof pmsvCurrent40FallbackValid!=="function"||!pmsvCurrent40FallbackValid()||
 typeof pmsvReviewSnapshotDigest!=="function"||
 !pmsv40MelamineUniversalData||!pmsv40Queue||!pmsv493Ledger||
 pmsvReviewSnapshotDigest(pmsv40MelamineUniversalData)!==pmsv40MelamineUniversalDigest)return false;
 const d=pmsv40MelamineUniversalData,u="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
 if(d.schema_version!=="1.0"||d.source_policy!=="OFFICIAL_FSSAI_CTR_IX_ONLY"||
 d.source_url!==u||d.regulatory_version!=="IX (03.02.2026)"||
 d.scope!=="FSSAI_CURRENT40_MELAMINE_OTHER_FOODS_VS_INFANT_FORMULA_AND_METHYLMERCURY_ALL_FOODS"||
 d.total_catalogue!==533||d.partial_named_source_routes!==493||
 d.pending_exact_named_source_routes!==40||d.reviewed_identities!==40||
 d.source_article_comparisons!==80||d.infant_formula_exclusions_reviewed!==80||
 d.actual_finished_lot_verifications!==0||d.auto_numeric_limit_assignments!==0||
 d.lab_passes!==0||d.named_article_promotions!==0||d.full_compliance_approvals!==0||
 d.official_crosscutting_rows?.length!==4||d.identity_specific_crosschecks?.length!==40||
 pmsv40Queue.review_records?.length!==40||pmsv493Ledger.records?.length!==533||
 pmsv493Ledger.partial_exact!==493||pmsv493Ledger.first_source_pending!==40)return false;
 const seenRows=new Set();
 for(const s of d.official_crosscutting_rows){
  const f=pmsv40MelamineUniversalFixed[s.id];
  if(!f||seenRows.has(s.id)||s.article!==f.article||s.limit!==f.limit||
    s.contaminant!==f.contaminant||s.reg!==f.reg||s.page0!==f.page0||
    s.unit!=="mg/kg"||
    s.classification!==({"melamine-powdered-infant":"EXCLUDED_UNLESS_EXACT_INFANT_FORMULA_IDENTITY_PROVEN","melamine-liquid-infant":"EXCLUDED_UNLESS_EXACT_INFANT_FORMULA_IDENTITY_PROVEN","melamine-other-foods":"CONDITIONAL_LEGAL_FOOD_SCOPE_AND_NON_INFANT_IDENTITY","methylmercury-all-foods":"CONDITIONAL_LEGAL_FOOD_SCOPE"}[s.id]))return false;
  seenRows.add(s.id);
 }
 if(seenRows.size!==4)return false;
 const pending=new Map(pmsv40Queue.review_records.map(x=>[x.catalog_id,x]));
 const ledger=new Map(pmsv493Ledger.records.map(x=>[x.catalog_id,x]));const seen=new Set();
 for(const x of d.identity_specific_crosschecks){
  const p=pending.get(x.catalog_id),l=ledger.get(x.catalog_id);
  if(seen.has(x.catalog_id)||!p||!l||x.product_name!==p.product_name||
    x.product_name!==l.product_name||String(x.fssr||"")!==String(p.fssr||"")||
    String(x.fcs||"")!==String(p.fcs||"")||
    x.original_review_group!==p.current_review_group||
    l.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    !x.legal_scope_track||!x.decisive_existing_question||
    !x.affirmative_melamine_other_food_proof||
    !x.affirmative_methylmercury_all_food_proof||
    !x.infant_formula_evidence_required||
    x.original_named_article_still_pending!==true||
    x.current_named_ctr_source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    x.exact_finished_legal_food_scope_verified!==false||
    x.exact_infant_formula_status_verified!==false||
    x.laboratory_melamine_result_verified!==false||
    x.laboratory_methylmercury_result_verified!==false||
    x.numeric_limit_automatically_assigned!==false||
    x.named_finished_article_promoted!==false||
    x.regulatory_compliance_pass!==false)return false;
  seen.add(x.catalog_id);
 }
 return seen.size===40;
}
var pmsvBefore40MelamineLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore40MelamineLoad();
 pmsv40MelamineUniversalData=null;
 try{
  const res=await fetch("./data/rules/fssai-current40-melamine-methylmercury-2026-10-13.json?v=20261013-melamine40",{cache:"reload"});
  if(!res.ok)throw Error("Missing FSSAI melamine crosscutting source");
  pmsv40MelamineUniversalData=await res.json();
  if(!pmsv40MelamineUniversalValid())throw Error("Invalid 40 identity legal source mapping");
 }catch(_){pmsv40MelamineUniversalData=null;}
};
function pmsv40MelamineUniversalHtml(p){
 if(!p||!pmsv40Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsv40MelamineUniversalValid())
  return '<div class="notice">FSSAI melamine/methylmercury source evidence unavailable or invalid. No limits assigned or PASS.</div>';
 const d=pmsv40MelamineUniversalData,x=d.identity_specific_crosschecks.find(y=>y.catalog_id===p.id);
 if(!x||x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
    String(x.fcs||"")!==String(p.fcs||""))return '<div class="notice">Identity mismatch: no source inheritance or approval.</div>';
 const e=v=>String(v).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",[String.fromCharCode(34)]:"&quot;",[String.fromCharCode(39)]:"&#39;"}[z]));
 return '<details class="card" style="margin-top:12px"><summary><b>Further official CTR contaminant evidence: melamine and methylmercury</b></summary>'+
 '<div class="notice"><b>Legal source comparison only.</b> The separate named finished-product CTR article remains PENDING. These provisions are not a lot test, assigned product limit, or compliance approval.</div>'+
 '<div class="tablewrap"><table><thead><tr><th>Official FSSAI CTR IX provision</th><th>Regulatory threshold (conditional scope)</th></tr></thead><tbody>'+
 d.official_crosscutting_rows.map(r=>'<tr><td>'+e(r.contaminant)+' — '+e(r.article)+'</td><td>'+e(r.limit)+' '+e(r.unit)+' · PDF p.'+e(r.page0+1)+
 ' <b>'+(r.id.includes("infant")?"ONLY IF EXACT INFANT FORMULA":r.id.includes("other-foods")?"OTHER FOODS ONLY":"ALL FOODS LEGAL SCOPE")+'</b></td></tr>').join("")+
 '</tbody></table></div>'+
 '<p><b>Individual finished-product proof still required:</b> '+e(x.decisive_existing_question)+'</p>'+
 '<p><b>Melamine decision:</b> '+e(x.affirmative_melamine_other_food_proof)+'</p>'+
 '<p><b>Infant-formula distinction:</b> '+e(x.infant_formula_evidence_required)+'</p>'+
 '<p><b>Methylmercury decision:</b> '+e(x.affirmative_methylmercury_all_food_proof)+'</p>'+
 '<p><b>Analytical warning:</b> A result for total mercury does not establish the methylmercury result. A product containing milk is not automatically infant formula. No laboratory result has been supplied.</p>'+
 '<small><a href="'+e(d.source_url)+'" target="_blank" rel="noopener noreferrer">Official FSSAI CTR Version IX: §§2.1.1 and 2.5.1, PDF pp.12, 51</a></small></details>';
}
var pmsvBefore40MelamineHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 return pmsv40MelamineUniversalHtml(p)+pmsvBefore40MelamineHtml(p);
};
