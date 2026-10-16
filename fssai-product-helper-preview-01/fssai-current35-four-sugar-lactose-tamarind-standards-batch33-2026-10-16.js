"use strict";
/* B33 positive product-standard source proof for four commodities.
 * FSSR composition parameters must never become automatic CTR limits or lot PASS. */
var pmsvB33Data=null,pmsvB33Search="";
const pmsvB33Path="./data/rules/fssai-current35-four-sugar-lactose-tamarind-standards-batch33-2026-10-16.json";
const pmsvB33Expected="171173f139ae9482";
function pmsvB33Valid(){
 if(typeof pmsvB32Valid!=="function"||!pmsvB32Valid()||!pmsvB33Data||
 typeof pmsvB14Digest!=="function"||
 pmsvB14Digest(pmsvB33Data)!==pmsvB33Expected)return false;
 const d=pmsvB33Data,n=d.counts;
 if(d.schema_version!=="1.0"||d.kind!=="PMSV_CURRENT35_SUGAR_LACTOSE_TAMARIND_PRODUCT_STANDARDS_BATCH33"||
 d.as_of!=="2026-10-16"||d.deployment!=="GH_PAGES_PREVIEW_NOT_WORDPRESS"||
 d.source_precedence!=="FSSAI_OFFICIAL_CHAPTER_COMPENDIA_RESEARCH_ORIGINAL_GAZETTE_PREVAILS"||
 d.official_ctr!==pmsvB26Data.source_reference||d.quality_evidence_only!==true||
 n?.catalogue!==533||n.conditional_first_source_matches!==498||
 n.ctr_exact_article_cases_pending!==35||n.existing_named_fssr_standards!==15||
 n.additional_named_product_standards!==4||n.total_named_product_standards!==19||
 n.quality_criteria!==17||n.source_comparator_exclusions_reviewed!==4||
 n.new_ctr_article_matches!==0||n.finished_ctr_limits_approved!==0||
 n.actual_lot_passes!==0||n.wordpress_changed!==false||
 d.cases?.length!==4||d.results?.canonical_ledger_modified!==false||
 d.results.wordpress_modified!==false||d.results.legal_ctr_scope_approvals!==0||
 d.results.real_lot_laboratory_passes!==0||
 pmsv498Ledger?.first_source_pending!==35)return false;
 const previously=new Set([...pmsvB29Data.cases,...pmsvB30Data.cases,
  ...pmsvB31Data.cases,...pmsvB32Data.cases].map(x=>x.catalog_id));
 const canon=new Map(pmsvB26Data.cases.map(x=>[x.catalog_id,x]));
 const expectedNames=new Map([
  ["04-04-1-seedless-tamarind","2.3.49"],
  ["11-11-1-dried-glucose-syrup","2.8.7"],
  ["11-11-1-edible-lactose","2.1.20"],
  ["11-11-1-misri","2.8.2"]
 ]);
 const seen=new Set();let qual=0;
 for(const x of d.cases){
  const b=canon.get(x.catalog_id);
  if(!b||seen.has(x.catalog_id)||previously.has(x.catalog_id)||
   x.product_name!==b.product_name||x.fssr!==b.fssr||x.fcs!==b.fcs||
   x.rank!==b.rank||x.clause!==expectedNames.get(x.catalog_id)||
   !/^https:\/\/(?:stg-old\.)?fssai\.gov\.in\/upload\/uploadfiles\/files\//.test(x.official_chapter_url)||
   !Number.isInteger(x.official_page_zero_based)||x.official_page_zero_based<0||
   x.official_page_zero_based>72||!x.chapter_compilation_date||
   !x.identity||!x.documentary_gate||!x.legal_ctr_nontransfer_reason||
   !Array.isArray(x.quality_criteria)||!x.quality_criteria.length||
   x.named_product_standard_found!==true||x.actual_lot_identity_verified!==false||
   x.actual_lab_result_verified!==false||x.ctr_exact_finished_article_approved!==false||
   x.finished_numeric_ctr_limit_assigned!==false||
   x.regulatory_compliance_pass!==false)return false;
  for(const q of x.quality_criteria){
   if(!q.name||!["min","max","qualitative"].includes(q.comparison)||
    !q.unit||!q.basis||!q.qualifier||
    (q.comparison==="qualitative"&&q.value!==null)||
    (q.comparison!=="qualitative"&&(!Number.isFinite(q.value)||q.value<0)))return false;
   qual++;
  }
  seen.add(x.catalog_id);
 }
 const glucose=d.cases.find(x=>x.catalog_id==="11-11-1-dried-glucose-syrup");
 const ash=glucose?.quality_criteria.find(x=>x.name==="Sulphated ash");
 const lactose=d.cases.find(x=>x.catalog_id==="11-11-1-edible-lactose");
 return seen.size===4&&qual===17&&
 ash?.comparison==="max"&&ash.value===1&&
 glucose.legal_ctr_nontransfer_reason.includes("excluded")&&
 lactose?.quality_criteria.find(x=>x.name==="Sulphated ash")?.value===0.3;
}
function pmsvB33Filtered(){
 if(!pmsvB33Valid())return [];
 const q=pmsvB33Search.toLowerCase().trim();
 return pmsvB33Data.cases.filter(x=>!q||
 [x.catalog_id,x.product_name,x.clause,x.identity,x.legal_ctr_nontransfer_reason,
 ...x.quality_criteria.map(z=>z.name+" "+z.basis)].some(s=>String(s).toLowerCase().includes(q)));
}
function pmsvB33Cell(c){
 const e=pmsvB14Esc;
 return '<tr><td><b>'+e(c.product_name)+'</b><div><small>FSSR '+e(c.clause)+'</small></div></td>'+
 '<td>'+e(c.identity)+'</td><td>'+c.quality_criteria.length+' published quality criteria</td>'+
 '<td>'+e(c.legal_ctr_nontransfer_reason)+'</td><td>'+
 '<a href="'+e(c.official_chapter_url)+'#page='+(c.official_page_zero_based+1)+
 '" target="_blank" rel="noopener noreferrer">Official chapter</a> '+
 '<button type="button" data-pmsv-b33-open="'+e(c.catalog_id)+'">Open evidence</button></td></tr>';
}
function pmsvB33Quality(c){
 const e=pmsvB14Esc;
 return '<div class="tablewrap"><table><thead><tr><th>FSSR quality parameter</th><th>Published maximum/minimum</th><th>Basis</th></tr></thead><tbody>'+
 c.quality_criteria.map(q=>'<tr><td>'+e(q.name)+'</td><td>'+
 (q.comparison==="qualitative"?"Specified visual class "+e(q.unit):
 (q.comparison==="min"?"≥ ":"≤ ")+e(q.value)+" "+e(q.unit))+
 '</td><td>'+e(q.basis)+'. '+e(q.qualifier)+'</td></tr>').join("")+
 '</tbody></table></div>';
}
function pmsvB33Dash(){
 if(!pmsvB33Valid())return "";
 return '<details class="card" id="pmsv-b33-product-source-proof" style="margin-bottom:12px">'+
 '<summary><b>Batch33 · four named FSSR quality standards</b> — sugar, lactose and seedless tamarind</summary>'+
 '<div class="notice"><b>Legally meaningful exclusion:</b> standard-compliant dried glucose syrup must contain ≤1% sulphated ash, so a CTR comparator that requires >1% cannot be assigned to it. Misri TOTAL ash is not sulphated ash. These do NOT approve any alternative contaminant limit or actual lot PASS. 19 named standards identified; all 35 CTR cases pending.</div>'+
 '<p><label>Search product/parameter <input type="search" data-pmsv-b33-search placeholder="sulphated ash, glucose, tamarind" /></label></p>'+
 '<p data-pmsv-b33-count>'+pmsvB33Filtered().length+' of 4 product-standard sources found, 0 legal CTR approvals</p>'+
 '<div class="tablewrap"><table><thead><tr><th>Named article</th><th>Official description</th><th>Quality parameters</th><th>CTR source limitation</th><th>Source</th></tr></thead>'+
 '<tbody data-pmsv-b33-rows>'+pmsvB33Filtered().map(pmsvB33Cell).join("")+'</tbody></table></div></details>';
}
function pmsvB33Refresh(){
 if(typeof document==="undefined"||!pmsvB33Valid())return;
 const host=document.getElementById("pmsv-b32-operative-gazette")||
 document.getElementById("pmsv-b31-commodity-standards")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!host)return;
 const el=document.getElementById("pmsv-b33-product-source-proof");
 if(!el){host.insertAdjacentHTML("beforebegin",pmsvB33Dash());return}
 const tbody=el.querySelector("[data-pmsv-b33-rows]"),count=el.querySelector("[data-pmsv-b33-count]");
 if(tbody)tbody.innerHTML=pmsvB33Filtered().map(pmsvB33Cell).join("");
 if(count)count.textContent=pmsvB33Filtered().length+" of 4 sources shown; 0 finished-product CTR limits approved.";
}
function pmsvB33Product(p){
 if(!p||!pmsvB33Valid())return "";
 const x=pmsvB33Data.cases.find(x=>x.catalog_id===p.id);
 if(!x||x.product_name!==p.name||
 String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))return "";
 const e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px"><summary>'+
 '<b>Batch33 · named FSSR product standard '+e(x.clause)+'</b> — no CTR or lot PASS</summary>'+
 '<p>'+e(x.identity)+'</p>'+pmsvB33Quality(x)+
 '<p><b>Do not transfer unrelated CTR article:</b> '+e(x.legal_ctr_nontransfer_reason)+'</p>'+
 '<p><b>Next documentary step:</b> '+e(x.documentary_gate)+'</p>'+
 '<p><a href="'+e(x.official_chapter_url)+'#page='+(x.official_page_zero_based+1)+
 '" target="_blank" rel="noopener noreferrer">Read official FSSR standard</a></p>'+
 '<div class="notice">Published quality standard found, but finished batch, exact CTR article, limits and laboratory conformity still unverified.</div></details>';
}
const pmsvB33PreviousLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB33PreviousLoad();pmsvB33Data=null;
 try{
  const r=await fetch(pmsvB33Path+"?v=20261016-b33",{cache:"reload"});
  if(!r.ok)throw Error("Batch33 product source unavailable");
  pmsvB33Data=await r.json();
  if(!pmsvB33Valid())throw Error("Batch33 exact-source integrity error");
  pmsvB33Refresh();
 }catch(_){pmsvB33Data=null;}
};
const pmsvB33PreviousHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB33Product(p)+pmsvB33PreviousHtml(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b33-search]")){
   pmsvB33Search=String(ev.target.value||"").slice(0,140);pmsvB33Refresh();
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b33-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b33-open"));
 });
}