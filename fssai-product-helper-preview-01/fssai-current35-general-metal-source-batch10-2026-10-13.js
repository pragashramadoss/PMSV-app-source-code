"use strict";
/* PMSV Batch10: official CTR metal default/all-food distinction.
 * 35 pending source-article identities x 7 general regulatory rows = 245
 * scopes to consider. These references do not constitute sample results,
 * complete contaminant checks or legal compliance approval.
 */
var pmsvB10Data=null;
const pmsvB10Path="./data/rules/fssai-current35-default-metals-and-allfoods-batch10-2026-10-13.json";
const pmsvB10Hash="52033f4dad2ba0ca";
const pmsvB10Ctr="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
const pmsvB10FixedRules=Object.freeze([
 ["PB_DEFAULT","Lead","Foods not specified",2.5,3],
 ["CU_DEFAULT","Copper","Foods not specified",30,6],
 ["AS_DEFAULT","Arsenic","Foods not specified",1.1,8],
 ["SN_DEFAULT","Tin","Foods not specified",250,10],
 ["CD_DEFAULT","Cadmium","Foods not specified",1.5,11],
 ["HG_DEFAULT","Mercury","Foods not specified",1,11],
 ["MEHG_ALL","Methyl Mercury (calculated as the element)","All foods",0.25,11]
]);
function pmsvB10Digest(o){
 const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function pmsvB10Valid(){
 if(typeof pmsvB9Valid!=="function"||!pmsvB9Valid()||
 !pmsvB10Data||!pmsv35Queue||!pmsv498Ledger||!pmsvB9Data)return false;
 const d=pmsvB10Data;
 if(pmsvB10Digest(d)!==pmsvB10Hash||
 d.kind!=="PMSV_CURRENT35_CTR_UNIVERSAL_AND_DEFAULT_COVERAGE_BATCH10"||
 d.schema_version!=="1.0"||d.ctr_primary_source!==pmsvB10Ctr||
 d.baseline?.catalogue!==533||d.baseline?.partial_first_sources!==498||
 d.baseline?.pending_first_exact!==35||d.rule_count!==7||
 d.generic_defaults_count!==6||d.all_foods_clause_count!==1||
 d.cases_screened!==35||d.case_rule_checks_total!==245||
 d.official_rule_rows?.length!==7||d.product_checks?.length!==35||
 d.global_all_foods_scope_explicitly_stated_by_CTR!==true||
 d.generic_fallbacks_are_not_finished_product_specific_named_article_matches!==true||
 d.all_35_still_need_metal_specific_priority_review!==true||
 d.future_commencement!=="2026-12-01"||d.future_article_auto_applied!==false||
 d.full_contaminant_panels_cleared!==0||d.first_source_promotions!==0||
 d.automated_numeric_limit_assignments!==0||d.sample_lot_lab_passes!==0||
 d.finished_food_compliance_approvals!==0||
 d.original_ledger_mutated!==false||d.WordPress_production_mutated!==false||
 pmsv35Queue.review_records?.length!==35||
 pmsv498Ledger.first_source_pending!==35)return false;
 const rows=new Map();
 for(let i=0;i<7;i++){
   const r=d.official_rule_rows[i],v=pmsvB10FixedRules[i];
   if(!r||r.id!==v[0]||r.metal!==v[1]||
     r.legal_article!==v[2]||r.published_reference_value!==v[3]||
     r.pdf_page_zero_based!==v[4]||r.unit!=="mg/kg"||
     r.official_primary_source!==pmsvB10Ctr||
     r.scope_type!==(i===6?"EXPLICIT_ALL_FOODS_ARTICLE":"METAL_SPECIFIC_DEFAULT_AFTER_EXACT_ROW_CHECK")||
     r.numeric_finished_product_limit_automatically_assigned!==false||
     r.analytical_result_verified!==false)return false;
   rows.set(r.id,r);
 }
 const ledger=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x]));
 let seen=new Set(),count=0;
 for(let i=0;i<35;i++){
   const x=d.product_checks[i],q=pmsv35Queue.review_records[i],
       b=pmsvB9Data.cases[i],live=ledger.get(x?.catalog_id);
   if(!x||!q||!b||!live||seen.has(x.catalog_id)||
     x.rank!==i+1||x.catalog_id!==q.catalog_id||
     x.catalog_id!==b.catalog_id||x.product_name!==q.product_name||
     String(x.fssr||"")!==String(q.fssr||"")||
     String(x.fcs||"")!==String(q.fcs||"")||
     x.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
     live.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
     JSON.stringify(x.pending_named_ctr_routes)!==JSON.stringify(b.targeted_candidate_routes)||
     x.named_article_first_source_verified!==false||
     x.metal_specific_legal_reconciliation_completed!==false||
     x.current_laboratory_results_verified!==false||
     x.full_regulatory_compliance_approval!==false||
     x.rule_checks?.length!==7)return false;
   for(let j=0;j<7;j++){
     const test=x.rule_checks[j];
     if(test?.reference_row!==pmsvB10FixedRules[j][0]||
       test.source_status!==(j===6?"GENERAL_ALL_FOODS_SCOPE_VISIBLE_NOT_PRODUCT_CLEARANCE":"DEFAULT_ARTICLE_REQUIRES_METAL_SPECIFIC_SCOPE_REVIEW")||
       test.limit_active_as_product_threshold!==false||
       test.named_finished_product_match_approved!==false||
       test.finished_lot_lab_pass!==false||
       test.no_specific_competing_article_confirmed!==false)return false;
     count++;
   }
   seen.add(x.catalog_id);
 }
 return rows.size===7&&seen.size===35&&count===245;
}
const pmsvB10OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB10OldLoad();pmsvB10Data=null;
 try{
  const r=await fetch(pmsvB10Path+"?v=20261013-b10",{cache:"reload"});
  if(!r.ok)throw Error("Missing official metal scope check");
  pmsvB10Data=await r.json();
  if(!pmsvB10Valid())throw Error("35-ID official generic metal source guard failed");
 }catch(_){pmsvB10Data=null}
};
function pmsvB10Html(p){
 if(!p||!pmsv35Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvB10Valid())
  return '<div class="notice">General contaminant coverage check unavailable. Product stays FIRST EXACT SOURCE PENDING.</div>';
 const current=pmsvB10Data.product_checks.find(x=>x.catalog_id===p.id),
       q=pmsv35Queue.review_records.find(x=>x.catalog_id===p.id);
 if(!current||!q||q.product_name!==p.name||
   String(q.fssr||"")!==String(p.fssr||"")||
   String(q.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Identity mismatch: no legal source or limit applied.</div>';
 const esc=v=>String(v??"").replace(/[&<>"']/g,z=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
 })[z]);
 return '<details class="card" style="margin-top:12px">'+
  '<summary><b>Batch 10 · general contaminants scope</b> — six possible defaults + one all-foods rule</summary>'+
  '<div class="notice"><b>Named finished-product article still pending.</b> The rows below are from the official 2026 CTR, not approved limits or completed sample tests. Every metal-specific default requires its own search for competing, more specific entries.</div>'+
  '<div class="tablewrap"><table><thead><tr><th>Metal</th><th>Regulatory article</th><th>Reference value only</th><th>Decision required</th></tr></thead><tbody>'+
  pmsvB10Data.official_rule_rows.map(r=>
    '<tr><td>'+esc(r.metal)+'</td><td>'+esc(r.legal_article)+'</td>'+
    '<td>'+esc(r.published_reference_value)+' '+esc(r.unit)+' (PDF p.'+esc(r.pdf_page_zero_based+1)+')</td>'+
    '<td>'+(r.scope_type==="EXPLICIT_ALL_FOODS_ARTICLE"?
    'Express all-foods article; no finished lot result or complete PASS.':
    'Check all competing '+esc(r.metal)+' named food rows before considering this default.')+
    '</td></tr>').join("")+'</tbody></table></div>'+
  '<p><b>Pending product-specific candidate routes:</b> '+
  (current.pending_named_ctr_routes.length?current.pending_named_ctr_routes.map(esc).join("; "):"No new legal article candidate confirmed")+
  '</p><small><a href="'+esc(pmsvB10Ctr)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX (03.02.2026)</a> · The May 2026 amendment is not effective until 01.12.2026.</small></details>';
}
const pmsvB10Prior=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB10Html(p)+pmsvB10Prior(p)};
