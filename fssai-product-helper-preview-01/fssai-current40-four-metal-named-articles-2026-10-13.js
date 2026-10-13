"use strict";
/* FSSAI CTR Version IX 03.02.2026 §2.1.1, PDF page 13:
 * chromium / nickel / selenium / antimony named legal articles;
 * 40x22 comparison records. NO automatic compliance decisions.
 */
var pmsv40FourMetalProofData=null;
const pmsv40FourMetalDigest="cc8823a9f12e852e";
const pmsv40FourMetalRowsFixed=Object.freeze({"chromium-fishery":{"metal":"Chromium","article":"All fishery products","limit":12,"unit":"mg/kg"},"chromium-brilliant-blue":{"metal":"Chromium","article":"Brilliant blue FCF","limit":50,"unit":"mg/kg"},"chromium-fast-green":{"metal":"Chromium","article":"Fast green FCF","limit":50,"unit":"mg/kg"},"chromium-gelatin":{"metal":"Chromium","article":"Gelatin","limit":10,"unit":"mg/kg"},"chromium-mineral-water":{"metal":"Chromium","article":"Mineral water","limit":0.05,"unit":"mg/L"},"chromium-packaged-water":{"metal":"Chromium","article":"Packaged drinking water (other than mineral water)","limit":0.05,"unit":"mg/L"},"chromium-refined-sugar":{"metal":"Chromium","article":"Refined sugar","limit":0.02,"unit":"mg/kg"},"chromium-vegetables":{"metal":"Chromium","article":"Vegetables","limit":1,"unit":"mg/kg"},"nickel-hydrogenated-fats":{"metal":"Nickel","article":"All hydrogenated, partially hydrogenated, interesterified vegetable oils and fats as named in CTR IX","limit":1.5,"unit":"mg/kg"},"nickel-mineral-water":{"metal":"Nickel","article":"Mineral water","limit":0.02,"unit":"mg/L"},"nickel-packaged-water":{"metal":"Nickel","article":"Packaged drinking water (other than mineral water)","limit":0.02,"unit":"mg/L"},"nickel-sorbitol":{"metal":"Nickel","article":"Sorbitol","limit":2,"unit":"mg/kg"},"nickel-vegetables":{"metal":"Nickel","article":"Vegetables","limit":1,"unit":"mg/kg"},"selenium-mineral-water":{"metal":"Selenium","article":"Mineral water","limit":0.05,"unit":"mg/L"},"selenium-packaged-water":{"metal":"Selenium","article":"Packaged drinking water (other than mineral water)","limit":0.01,"unit":"mg/L"},"selenium-potassium-metabisulphite":{"metal":"Selenium","article":"Potassium metabisulphite","limit":5,"unit":"mg/kg"},"selenium-sodium-metabisulphite":{"metal":"Selenium","article":"Sodium metabisulphite","limit":5,"unit":"mg/kg"},"selenium-sulphur-dioxide":{"metal":"Selenium","article":"Sulphur dioxide","limit":20,"unit":"mg/kg"},"antimony-mineral-water":{"metal":"Antimony","article":"Mineral water","limit":0.005,"unit":"mg/L"},"antimony-packaged-water":{"metal":"Antimony","article":"Packaged drinking water (other than mineral water)","limit":0.005,"unit":"mg/L"},"antimony-titanium-dioxide":{"metal":"Antimony","article":"Titanium dioxide","limit":2,"unit":"mg/kg"},"antimony-vegetables":{"metal":"Antimony","article":"Vegetables","limit":1,"unit":"mg/kg"}});
function pmsv40FourMetalProofValid(){
 if(typeof pmsv493Valid!=="function"||!pmsv493Valid()||
 typeof pmsv40MelamineUniversalValid!=="function"||!pmsv40MelamineUniversalValid()||
 typeof pmsvReviewSnapshotDigest!=="function"||
 !pmsv40FourMetalProofData||!pmsv40Queue||!pmsv493Ledger||
 pmsvReviewSnapshotDigest(pmsv40FourMetalProofData)!==pmsv40FourMetalDigest)return false;
 const d=pmsv40FourMetalProofData,u="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
 if(d.schema_version!=="1.0"||d.source_policy!=="OFFICIAL_FSSAI_CTR_IX_ONLY"||
 d.review_purpose!=="40_CURRENT_PENDING_FOUR_METAL_NAMED_ARTICLE_MATRIX_OFFICIAL_CTR_IX_PAGE_13"||
 d.source_pdf!==u||d.source_pdf_page_number!==13||d.current_catalogue!==533||
 d.current_partial_routes!==493||d.current_first_named_article_pending!==40||
 d.products_reviewed!==40||d.metals_reviewed_per_product!==4||d.official_named_rows!==22||
 d.row_by_product_comparisons!==880||d.metal_by_product_checks!==160||
 d.confirmed_product_named_article_matches!==0||d.source_routes_promoted!==0||
 d.numeric_limits_automatically_assigned!==0||d.actual_laboratory_results_verified!==0||
 d.complete_compliance_approvals!==0||d.source_rows?.length!==22||d.records?.length!==40||
 pmsv493Ledger.partial_exact!==493||pmsv493Ledger.first_source_pending!==40||
 pmsv493Ledger.records?.length!==533||pmsv40Queue.review_records?.length!==40)return false;
 const seenRow=new Set(),metals=new Set(["Chromium","Nickel","Selenium","Antimony"]);
 for(const s of d.source_rows){
  const f=pmsv40FourMetalRowsFixed[s.row_id];
  if(!f||seenRow.has(s.row_id)||s.contaminant!==f.metal||s.exact_named_article!==f.article||
  s.threshold!==f.limit||s.unit!==f.unit||s.source_pdf_page!==13||
  s.source_pdf_page_index!==12||s.official_source!==u||
  s.applicability_to_pending_food_established!==false||s.reference_only!==true)return false;
  seenRow.add(s.row_id);
 }
 if(seenRow.size!==22)return false;
 const queue=new Map(pmsv40Queue.review_records.map(x=>[x.catalog_id,x])),
 ledger=new Map(pmsv493Ledger.records.map(x=>[x.catalog_id,x])),seen=new Set();
 let totalComparisons=0,totalConditional=0,metalChecks=0;
 for(const x of d.records){
  const q=queue.get(x.catalog_id),l=ledger.get(x.catalog_id);
  if(seen.has(x.catalog_id)||!q||!l||l.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   x.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   x.product_name!==q.product_name||x.product_name!==l.product_name||
   String(x.fssr||"")!==String(q.fssr||"")||String(x.fcs||"")!==String(q.fcs||"")||
   x.original_review_group!==q.current_review_group||
   !x.source_question_preserved||!x.critical_nontransfer||!x.decision_group||
   !["HIGH","MEDIUM"].includes(x.research_priority)||
   x.metal_reviews?.length!==4||x.individual_row_comparisons?.length!==22||
   !Array.isArray(x.conditional_identity_hypotheses)||
   x.evidence_of_actual_formula!==false||x.evidence_of_actual_finished_form!==false||
   x.evidence_of_analytical_results!==false||x.regulatory_approval!==false)return false;
  const matches=new Set(),mseen=new Set();
  for(const t of x.metal_reviews){
   if(!metals.has(t.metal)||mseen.has(t.metal)||
    t.official_source_rows_checked!==d.source_rows.filter(y=>y.contaminant===t.metal).length||
    t.named_finished_article_proven!==false||t.source_limit_applied!==false)return false;
   metalChecks++;mseen.add(t.metal);
  }
  for(const v of x.individual_row_comparisons){
   if(!seenRow.has(v.row_id)||matches.has(v.row_id)||
    !["NO_AFFIRMATIVE_NAMED_ARTICLE_MATCH_FROM_CURRENT_PRODUCT_IDENTITY","LEGAL_IDENTITY_EVIDENCE_REQUIRED_NOT_APPLICABLE_YET"].includes(v.decision)||
    v.auto_limit_applied!==false)return false;
   matches.add(v.row_id);totalComparisons++;
  }
  const hypSeen=new Set();
  for(const t of x.conditional_identity_hypotheses){
   if(!matches.has(t.row_id)||hypSeen.has(t.row_id)||
   x.individual_row_comparisons.find(y=>y.row_id===t.row_id)?.decision!=="LEGAL_IDENTITY_EVIDENCE_REQUIRED_NOT_APPLICABLE_YET"||
   !t.mandatory_positive_proof||t.confirmed_article_match!==false||
   t.lab_sample_verified!==false||t.source_limit_assigned!==false)return false;
   hypSeen.add(t.row_id);totalConditional++;
  }
  if(x.individual_row_comparisons.filter(y=>y.decision==="LEGAL_IDENTITY_EVIDENCE_REQUIRED_NOT_APPLICABLE_YET").length!==hypSeen.size)return false;
  seen.add(x.catalog_id);
 }
 return totalComparisons===880&&metalChecks===160&&totalConditional===d.conditional_article_hypotheses&&seen.size===40;
}
var pmsvBefore40FourMetalLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore40FourMetalLoad();pmsv40FourMetalProofData=null;
 try{
  const res=await fetch("./data/rules/fssai-current40-four-metal-named-articles-2026-10-13.json?v=20261013-fourmetal40",{cache:"reload"});
  if(!res.ok)throw Error("Missing official four-metal legal source matrix");
  pmsv40FourMetalProofData=await res.json();
  if(!pmsv40FourMetalProofValid())throw Error("Four-metal source matrix identity or integrity mismatch");
 }catch(_){pmsv40FourMetalProofData=null;}
};
function pmsv40FourMetalProofHtml(p){
 if(!p||!pmsv40Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsv40FourMetalProofValid())
 return '<div class="notice">Four-metal CTR named-article comparison unavailable or invalid; no limits applied or compliance PASS.</div>';
 const d=pmsv40FourMetalProofData,x=d.records.find(y=>y.catalog_id===p.id);
 if(!x||x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))return '<div class="notice">Four-metal evidence identity mismatch; no numeric assignment.</div>';
 const e=v=>String(v).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",[String.fromCharCode(34)]:"&quot;",[String.fromCharCode(39)]:"&#39;"}[z]));
 const sourceRows=new Map(d.source_rows.map(y=>[y.row_id,y]));
 let body='<details class="card" style="margin-top:12px"><summary><b>Four more official metals — 22 named legal articles checked</b> · '+e(x.product_name)+'</summary>'+
 '<div class="notice"><b>40 pending identities × 22 official source rows. NOT A REGULATORY PASS.</b> The general “Foods not specified” route used for some other metals does not appear for chromium, nickel, selenium or antimony in the reviewed CTR table. Their actual applicable rules require positive finished-food legal proof.</div>'+
 '<p><b>Original pending evidence:</b> '+e(x.source_question_preserved)+'</p>'+
 '<p><b>Transfer blocked:</b> '+e(x.critical_nontransfer)+'</p>'+
 '<p><b>Current metal-by-metal status:</b> '+x.metal_reviews.map(v=>e(v.metal)+' ('+e(v.official_source_rows_checked)+' named entries) — <b>unconfirmed</b>').join('; ')+'</p>';
 if(x.conditional_identity_hypotheses.length){
 body+='<p><b>Candidate article only if additional proof is obtained:</b></p><div class="tablewrap"><table><thead><tr><th>Named FSSAI article</th><th>Source numeric value — NOT assigned</th><th>Missing positive evidence</th></tr></thead><tbody>'+
 x.conditional_identity_hypotheses.map(t=>{const r=sourceRows.get(t.row_id);return '<tr><td>'+e(r.contaminant)+' / '+e(r.exact_named_article)+'</td><td>'+e(r.threshold)+' '+e(r.unit)+'</td><td>'+e(t.mandatory_positive_proof)+'</td></tr>';}).join("")+'</tbody></table></div>';
 }else body+='<p>No named chromium/nickel/selenium/antimony row can be affirmatively matched from this broad FoSCoS identity alone. This is <b>not an exemption</b>.</p>';
 return body+'<small><a href="'+e(d.source_pdf)+'" target="_blank" rel="noopener noreferrer">FSSAI CTR Version IX, §2.1.1, PDF p.13</a></small></details>';
}
var pmsvBefore40FourMetalHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 return pmsv40FourMetalProofHtml(p)+pmsvBefore40FourMetalHtml(p);
};
