"use strict";
/* Batch29 FSSR product-quality standards are explicitly NOT applicable CTR
 * heavy-metal or toxin limits. No verification of actual product or lot. */
var pmsvB29Data=null,pmsvB29Query="";
const pmsvB29Path="./data/rules/fssai-current35-product-identity-first-sources-batch29-2026-10-16.json";
const pmsvB29Expected="569f0345c5bbc184";
function pmsvB29Valid(){
 if(typeof pmsvB28Valid!=="function"||!pmsvB28Valid()||!pmsvB29Data||
 typeof pmsvB14Digest!=="function"||
 pmsvB14Digest(pmsvB29Data)!==pmsvB29Expected)return false;
 const d=pmsvB29Data,c=d.coverage;
 if(d.schema_version!=="1.0"||d.kind!=="PMSV_CURRENT35_PRODUCT_STANDARDS_NOT_CTR_MATCHES_BATCH29"||
 d.as_of!=="2026-10-16"||d.environment!=="GH_PAGES_PREVIEW_NOT_WORDPRESS"||
 d.research_scope!=="POSITIVE_FINISHED_PRODUCT_STANDARDS_SEPARATE_FROM_CONTAMINANT_APPLICABILITY"||
 d.official_ctr!==pmsvB28Data.source_pdf||
 c?.catalogue!==533||c.conditional_first_source_matches!==498||
 c.first_exact_ctr_source_pending!==35||c.product_standards_found!==7||
 c.quality_spec_entries!==21||c.ctr_source_promotions!==0||
 c.regulatory_compliance_approvals!==0||c.lab_lot_pass!==0||
 d.cases?.length!==7||d.results?.original_ledger_modified!==false||
 d.results.wordpress_modified!==false||d.results.product_standard_sources_identified!==7||
 d.results.ctr_first_sources_resolved!==0||d.results.approved_numeric_ctr_limits!==0||
 d.results.compliance_approvals!==0||pmsv498Ledger?.first_source_pending!==35)return false;
 const ids=new Set(),truth=new Map(pmsvB26Data.cases.map(x=>[x.catalog_id,x]));
 let nr=0;
 for(const x of d.cases){
  const y=truth.get(x.catalog_id);
  if(!y||ids.has(x.catalog_id)||x.product_name!==y.product_name||
   x.fssr!==y.fssr||x.fcs!==y.fcs||!x.official_fssr_clause||
   !/^https:\/\/(?:www\.)?fssai\.gov\.in\/upload\/uploadfiles\/files\//.test(x.official_product_standard_source)||
   !Number.isInteger(x.official_pdf_page_zero_based)||x.official_pdf_page_zero_based<0||
   !x.finished_identity_description||!x.decision_evidence||
   !Array.isArray(x.product_standard_requirements)||!x.product_standard_requirements.length||
   x.published_identity_standard_found!==true||x.actual_lot_tested!==false||
   x.contaminant_article_verified!==false||x.first_exact_ctr_source_pending!==true||
   x.compliance_approved!==false)return false;
  nr+=x.product_standard_requirements.length;
  for(const spec of x.product_standard_requirements){
   if(!spec.parameter||!["min","max","required"].includes(spec.comparison)||
      !spec.unit||!spec.basis||
      (spec.value!==null&&(!Number.isFinite(spec.value)||spec.value<0))||
      (spec.comparison==="required"&&spec.value!==null)||
      (spec.comparison!=="required"&&spec.value===null))return false;
  }
  ids.add(x.catalog_id);
 }
 return ids.size===7&&nr===21;
}
function pmsvB29Filtered(){
 if(!pmsvB29Valid())return [];
 const q=pmsvB29Query.trim().toLowerCase();
 return pmsvB29Data.cases.filter(x=>!q||
 [x.product_name,x.catalog_id,x.official_fssr_clause,x.finished_identity_description,
 x.decision_evidence,...x.product_standard_requirements.map(z=>z.parameter)].some(z=>String(z).toLowerCase().includes(q)));
}
function pmsvB29SpecsTable(c){
 const e=pmsvB14Esc;
 return '<table><thead><tr><th>Product quality parameter</th><th>Published FSSR requirement</th><th>Test basis / exception</th></tr></thead><tbody>'+
 c.product_standard_requirements.map(z=>'<tr><td>'+e(z.parameter)+'</td><td>'+
 (z.comparison==="required"?"Required":z.comparison==="min"?"≥ ":"≤ ")+
 (z.value===null?"":e(z.value)+" ")+e(z.unit)+'</td><td>'+e(z.basis)+'</td></tr>').join("")+'</tbody></table>';
}
function pmsvB29CaseRow(c){
 const e=pmsvB14Esc;
 return '<tr><td><b>'+e(c.product_name)+'</b><small> FSSR '+e(c.official_fssr_clause)+'</small></td>'+
 '<td>'+e(c.finished_identity_description)+'</td>'+
 '<td>'+e(c.product_standard_requirements.map(x=>x.parameter).join("; "))+'</td>'+
 '<td>'+e(c.decision_evidence)+'</td>'+
 '<td><a href="'+e(c.official_product_standard_source)+"#page="+(c.official_pdf_page_zero_based+1)+
 '" target="_blank" rel="noopener noreferrer">Official FSSR PDF</a> '+
 '<button type="button" data-pmsv-b29-open="'+e(c.catalog_id)+'">Evidence form</button></td></tr>';
}
function pmsvB29DashboardHtml(){
 if(!pmsvB29Valid())return "";
 return '<details class="card" id="pmsv-b29-exact-fssr-product-standards" style="margin-bottom:12px">'+
 '<summary><b>Batch29 · 7 exact published FSSR product standards</b> — CTR limits still pending</summary>'+
 '<div class="notice"><b>Separate legal checks:</b> 7 named FSSR product definitions and 21 published quality criteria are identified. These are not heavy-metal/toxin contaminant maximums. For all 7 finished commodities, CTR article applicability and actual lot conformity remain unverified. 533 / 498 conditional / 35 pending unchanged.</div>'+
 '<p><label>Search product or FSSR parameter <input type="search" data-pmsv-b29-search placeholder="e.g. silver, trehalose, DP" /></label></p>'+
 '<p data-pmsv-b29-count>'+pmsvB29Filtered().length+' of 7 official product-standard dossiers · 0 compliance approvals</p>'+
 '<div class="tablewrap" style="max-height:420px;overflow:auto"><table><thead><tr><th>Named finished article</th><th>Official FSSR identity</th><th>Quality parameters in FSSR</th><th>Still needed</th><th>Source / reviewer</th></tr></thead><tbody data-pmsv-b29-rows>'+
 pmsvB29Filtered().map(pmsvB29CaseRow).join("")+'</tbody></table></div></details>';
}
function pmsvB29Refresh(){
 if(typeof document==="undefined"||!pmsvB29Valid())return;
 const target=document.getElementById("pmsv-b28-remaining22-panel")||
 document.getElementById("pmsv-b26-exact-article-adjudication")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!target)return;
 const el=document.getElementById("pmsv-b29-exact-fssr-product-standards");
 if(!el){target.insertAdjacentHTML("beforebegin",pmsvB29DashboardHtml());return}
 const table=el.querySelector("[data-pmsv-b29-rows]"),count=el.querySelector("[data-pmsv-b29-count]");
 if(table)table.innerHTML=pmsvB29Filtered().map(pmsvB29CaseRow).join("");
 if(count)count.textContent=pmsvB29Filtered().length+" of 7 source-identified products; no CTR source promotion or lab PASS.";
}
function pmsvB29PerProduct(p){
 if(!p||!pmsvB29Valid())return "";
 const c=pmsvB29Data.cases.find(x=>x.catalog_id===p.id);
 if(!c||c.product_name!==p.name||String(c.fssr||"")!==String(p.fssr||"")||
 String(c.fcs||"")!==String(p.fcs||""))return "";
 const e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px"><summary><b>Batch 29 · positive FSSR quality standard located</b> — no lot or CTR compliance PASS</summary>'+
 '<p><b>Published FSSR '+e(c.official_fssr_clause)+':</b> '+e(c.finished_identity_description)+'</p>'+
 '<div class="tablewrap">'+pmsvB29SpecsTable(c)+'</div>'+
 '<p><b>Needed for actual verification:</b> '+e(c.decision_evidence)+'</p>'+
 '<p><a target="_blank" rel="noopener noreferrer" href="'+e(c.official_product_standard_source)+
 '#page='+(c.official_pdf_page_zero_based+1)+'">Read official FSSR product-standard text</a></p>'+
 '<div class="notice">Published product-standard numbers shown above are NOT CTR contaminant maximums. No actual lot test, legal sign-off or contaminant article approval.</div></details>';
}
const pmsvB29OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB29OldLoad();pmsvB29Data=null;
 try{
  const r=await fetch(pmsvB29Path+"?v=20261016-b29",{cache:"reload"});
  if(!r.ok)throw Error("Missing exact FSSR standards");
  pmsvB29Data=await r.json();
  if(!pmsvB29Valid())throw Error("FSSR product-standard checksum or identity mismatch");
  pmsvB29Refresh();
 }catch(_){pmsvB29Data=null;}
};
const pmsvB29OldPerProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB29PerProduct(p)+pmsvB29OldPerProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b29-search]")){
   pmsvB29Query=String(ev.target.value||"").slice(0,130);
   pmsvB29Refresh();
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b29-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b29-open"));
 });
}