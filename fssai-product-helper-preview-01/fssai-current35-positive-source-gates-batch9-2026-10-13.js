"use strict";
/* PMSV Batch 9: precisely 3 conditional new source branches out of current 35.
 * These are source-evidence pathways, NOT approved article matches, legal limits,
 * laboratory passes or product compliance. No source ledger writes.
 */
var pmsvB9Data=null;
const pmsvB9Path="./data/rules/fssai-current35-positive-named-ctr-candidate-gates-batch9-2026-10-13.json";
const pmsvB9DigestExpected="ced310b4d57d5425";
const pmsvB9CTR="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
const pmsvB9FixedIDs=Object.freeze([
 "10-10-3-pickled-eggs",
 "99-99-7-mixtures-preparations-premix-of-functional-ingredients",
 "formulated-supplements-children"
]);
function pmsvB9Digest(o){
 const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){let v=s.charCodeAt(i);a=Math.imul(a^v,16777619);b=Math.imul(b^v,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function pmsvB9Valid(){
 if(typeof pmsvB8Valid!=="function"||!pmsvB8Valid()||
   !pmsvB9Data||!pmsvB5Data||!pmsv35Queue||!pmsv498Ledger)return false;
 const d=pmsvB9Data;
 if(pmsvB9Digest(d)!==pmsvB9DigestExpected||
   d.schema_version!=="1.0"||d.kind!=="PMSV_CURRENT35_POSITIVE_CTR_BRANCH_SCREEN_BATCH9"||
   d.source_ledger?.catalogue!==533||d.source_ledger?.partial_first_source!==498||
   d.source_ledger?.pending_first_exact!==35||
   d.CTR_source!==pmsvB9CTR||d.future_effective_on!=="2026-12-01"||
   d.future_rule_auto_activation!==false||
   d.current_catalogue_pending_screened!==35||d.named_finished_subroutes_found_conditionally!==3||
   d.other_pending_not_given_new_source!==32||
   d.conditional_subroutes?.length!==3||d.cases?.length!==35||
   d.conditional_route_live_product_facts_confirmed!==0||
   d.first_named_CTR_source_promotions!==0||d.auto_numeric_limit_assignments!==0||
   d.verified_laboratory_results!==0||d.full_compliance_approvals!==0||
   d.ledger_unchanged!==true||d.wordpress_unchanged!==true||
   d.universal_article_note?.limit_auto_activated!==false||
   pmsv498Ledger.first_source_pending!==35||
   pmsv35Queue.review_records?.length!==35)return false;
 const source=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x]));
 const candidates=new Map(),seen=new Set();
 for(const route of d.conditional_subroutes){
   if(candidates.has(route?.catalog_id)||!pmsvB9FixedIDs.includes(route?.catalog_id)||
     !route.id||!route.named_article||
     route.ctr_pdf_page_zero_based!==(route.contaminant==="Tin"?10:13)||
     route.qualifying_conditions?.length!==4||
     !route.positive_basis||
     !/^https:\/\/(?:[a-z0-9-]+\.)?fssai\.gov\.in\//i.test(route.official_FSSR||"")||
     route.conditional_route_only!==true||
     route.exact_legal_scope_signed_off!==false||
     route.finished_limit_auto_assigned!==false||route.lab_pass!==false)return false;
   if(route.contaminant==="Tin"){
     if(route.published_reference_rows||route.limit!==250||route.unit!=="mg/kg"||
       route.production_variant_proven!==false)return false;
   }else{
     if(route.published_reference_rows?.length!==2||
       route.published_reference_rows[0]?.analyte!=="Total aflatoxins"||
       route.published_reference_rows[0]?.limit!==20||
       route.published_reference_rows[0]?.unit!=="µg/kg"||
       route.published_reference_rows[1]?.analyte!=="Aflatoxin B1"||
       route.published_reference_rows[1]?.limit!==10||
       route.published_reference_rows[1]?.unit!=="µg/kg"||
       route.formula_proven!==false)return false;
   }
   candidates.set(route.catalog_id,route);
 }
 let withRoute=0;
 for(let i=0;i<35;i++){
   const x=d.cases[i],q=pmsv35Queue.review_records[i],l=source.get(x?.catalog_id),
      r=candidates.get(x?.catalog_id);
   if(!x||!q||!l||seen.has(x.catalog_id)||
     x.rank!==i+1||x.catalog_id!==q.catalog_id||x.product_name!==q.product_name||
     l.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
     x.current_source_status!=="FIRST_EXACT_SOURCE_PENDING"||
     x.actual_finished_food_identity_verified!==false||
     x.legal_article_coverage_verified!==false||
     x.numeric_limit_assigned!==false||x.finished_sample_lab_pass!==false||
     x.regulatory_product_approval!==false||
     x.targeted_candidate_routes?.length!==(r?1:0)||
     x.outcome!==(r?"CONDITIONAL_NAMED_CTR_ARTICLE_BRANCH_REQUIRES_POSITIVE_EVIDENCE":"NO_ADDITIONAL_FINISHED_ARTICLE_CONFIRMED_IN_THIS_PASS")||
     (r&&x.targeted_candidate_routes[0]!==r.id))return false;
   if(r)withRoute++;seen.add(x.catalog_id);
 }
 return seen.size===35&&withRoute===3&&candidates.size===3;
}
const pmsvB9PriorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB9PriorLoad();pmsvB9Data=null;
 try{
  const r=await fetch(pmsvB9Path+"?v=20261013-b9",{cache:"reload"});
  if(!r.ok)throw Error("Conditional official source candidates missing");
  pmsvB9Data=await r.json();
  if(!pmsvB9Valid())throw Error("Batch9 35-product source integrity failure");
 }catch(_){pmsvB9Data=null}
};
function pmsvB9Html(p){
 if(!p||!pmsvB9FixedIDs.includes(p.id))return "";
 if(!pmsvB9Valid())
   return '<div class="notice">Conditional CTR route verification unavailable; source still pending and no contaminant limit assigned.</div>';
 const route=pmsvB9Data.conditional_subroutes.find(x=>x.catalog_id===p.id),
       x=pmsv35Queue.review_records.find(z=>z.catalog_id===p.id);
 if(!route||!x||p.name!==x.product_name||
    String(p.fssr||"")!==String(x.fssr||"")||
    String(p.fcs||"")!==String(x.fcs||""))
    return '<div class="notice">Product identity mismatch; first named CTR article remains pending.</div>';
 const e=v=>String(v??"").replace(/[&<>"']/g,z=>({
   "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
 })[z]);
 const table=route.published_reference_rows||[{analyte:"Tin",limit:route.limit,unit:route.unit}];
 return '<details class="card" style="margin-top:12px">'+
   '<summary><b>Batch 9 · positive CTR route to verify</b> — conditional only</summary>'+
   '<div class="notice"><b>FIRST NAMED CTR SOURCE STILL PENDING.</b> The identified FSSAI entry applies only if all legal article, recipe/packaging and sampling conditions are established. Published values below are references, not applied limits or PASS results.</div>'+
   '<p><b>Conditional finished-food article:</b> '+e(route.named_article)+'</p>'+
   '<table><thead><tr><th>Article contaminant</th><th>Published reference (NOT applied)</th></tr></thead><tbody>'+
     table.map(v=>'<tr><td>'+e(v.analyte)+'</td><td>'+e(v.limit)+' '+e(v.unit)+'</td></tr>').join("")+
   '</tbody></table>'+
   '<p><b>Evidence required before source promotion:</b></p><ol>'+
     route.qualifying_conditions.map(v=>'<li>'+e(v)+'</li>').join("")+'</ol>'+
   '<small><a href="'+e(route.official_FSSR)+'" target="_blank" rel="noopener noreferrer">FSSAI product standard</a> · '+
   '<a href="'+e(pmsvB9CTR)+'" target="_blank" rel="noopener noreferrer">CTR Version IX, PDF page '+e(route.ctr_pdf_page_zero_based+1)+'</a> · Future May amendment takes effect 1 December 2026.</small>'+
   '</details>';
}
const pmsvB9PriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB9Html(p)+pmsvB9PriorHtml(p)};
