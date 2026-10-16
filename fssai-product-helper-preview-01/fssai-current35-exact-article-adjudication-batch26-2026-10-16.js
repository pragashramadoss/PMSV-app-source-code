"use strict";
/* B26: 35 official CTR IX named-article comparator evaluations, all pending.
 * This research cannot activate contaminant limits or claim laboratory PASS. */
var pmsvB26Data=null,pmsvB26Text="",pmsvB26Filter="ALL";
const pmsvB26Path="./data/rules/fssai-current35-exact-article-adjudication-batch26-2026-10-16.json";
const pmsvB26Expected="202df59a7ff0ca3f";
function pmsvB26Valid(){
 if(!pmsvB26Data||typeof pmsvB21Valid!=="function"||!pmsvB21Valid()||
 typeof pmsvB14Digest!=="function"||pmsvB14Digest(pmsvB26Data)!==pmsvB26Expected||
 !pmsv498Ledger||!pmsvB14Data||!pmsv35Queue)return false;
 const d=pmsvB26Data,a=d.coverage;
 if(d.schema_version!=="1.0"||d.kind!=="PMSV_CURRENT35_EXACT_ARTICLE_SOURCE_DECISION_BATCH26"||
 d.as_of!=="2026-10-16"||d.deployment!=="GH_PAGES_PREVIEW_ONLY"||
 d.review_policy!=="OFFICIAL_FSSAI_SOURCES_RESEARCH_ONLY"||
 d.source_reference!=="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf"||
 d.reference_version!=="CTR_VERSION_IX_2026_02_03"||
 a?.catalogue!==533||a.conditional_first_source_matches!==498||
 a.finished_first_source_pending!==35||a.case_specific_comparisons!==35||
 a.direct_unconditional_article_matches_proven!==0||
 a.independent_finished_article_approvals!==0||a.lot_passes!==0||a.source_promotions!==0||
 d.future_amendment_date!=="2026-12-01"||d.future_amendment_applied!==false||
 d.cases?.length!==35||pmsv498Ledger.records?.length!==533||
 pmsv498Ledger.first_source_pending!==35||pmsv35Queue.review_records?.length!==35||
 d.results?.canonical_ledger_changed!==false||d.results.wordpress_modified!==false||
 d.results.source_promotions!==0||d.results.legal_approvals!==0||d.results.lot_passes!==0)return false;
 const ids=new Set(),legal=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x]));
 for(let i=0;i<35;i++){
  const x=d.cases[i],b=pmsvB14Data.cases[i],q=pmsv35Queue.review_records[i];
  if(!x||!b||!q||ids.has(x.catalog_id)||x.rank!==i+1||
   x.catalog_id!==b.catalog_id||x.catalog_id!==q.catalog_id||
   x.product_name!==b.product_name||x.product_name!==q.product_name||
   x.fssr!==b.fssr||x.fcs!==b.fcs||x.primary_blocker!==b.primary_blocker||
   x.official_finished_identity_url!==b.official_finished_identity_url||
   JSON.stringify(x.documentary_slots)!==JSON.stringify(b.document_slots)||
   x.official_ctr!==d.source_reference||
   !Number.isInteger(x.ctr_pdf_page_zero_based)||x.ctr_pdf_page_zero_based<0||
   x.ctr_pdf_page_zero_based>55||
   !x.reviewed_comparator_article||!x.reviewed_analyte||
   !x.legal_scope_obstacle||!x.specific_document_to_obtain||
   x.result!=="NO_EXACT_FINISHED_ARTICLE_APPROVAL"||
   x.confirmed_finished_numeric_limit!==false||
   x.independent_legal_signoff!==false||x.lot_lab_pass!==false||
   legal.get(x.catalog_id)?.source_status!=="FIRST_EXACT_SOURCE_PENDING")return false;
  if(x.related_official_product_source){
   const s=x.related_official_product_source;
   if(!/^https:\/\/(?:www\.)?fssai\.gov\.in\//.test(s.url)||!s.note)return false;
  }
  ids.add(x.catalog_id);
 }
 return ids.size===35;
}
function pmsvB26Cases(){
 if(!pmsvB26Valid())return [];
 const s=pmsvB26Text.trim().toLowerCase();
 return pmsvB26Data.cases.filter(x=>
  (pmsvB26Filter==="ALL"||pmsvB26Filter===x.primary_blocker)&&
  (!s||[x.product_name,x.catalog_id,x.reviewed_comparator_article,
  x.reviewed_analyte,x.legal_scope_obstacle,x.specific_document_to_obtain]
  .some(t=>String(t).toLowerCase().includes(s))));
}
function pmsvB26Rows(){
 const e=pmsvB14Esc;
 return pmsvB26Cases().map(x=>'<tr><td><b>'+e(x.product_name)+
  '</b><div><small>'+e(x.catalog_id)+'</small></div></td>'+
  '<td>'+e(x.reviewed_comparator_article)+' <small>('+e(x.reviewed_analyte)+
  ', PDF page '+(x.ctr_pdf_page_zero_based+1)+')</small></td>'+
  '<td>'+e(x.legal_scope_obstacle)+'</td>'+
  '<td>'+e(x.specific_document_to_obtain)+'</td>'+
  '<td><button type="button" data-pmsv-b26-open="'+e(x.catalog_id)+'">Open evidence</button> '+
  '<a href="'+e(x.official_ctr)+'#page='+(x.ctr_pdf_page_zero_based+1)+
  '" target="_blank" rel="noopener noreferrer">Official source</a></td></tr>').join("");
}
function pmsvB26Dashboard(){
 if(!pmsvB26Valid())return "";
 const e=pmsvB14Esc;
 const blockers=[...new Set(pmsvB26Data.cases.map(x=>x.primary_blocker))];
 return '<details class="card" id="pmsv-b26-exact-article-adjudication" style="margin-bottom:12px">'+
 '<summary><b>Batch 26 · 35 product-specific CTR article challenges</b> — 0 official source promotions</summary>'+
 '<div class="notice"><b>REVIEW ONLY.</b> 533 catalogue / 498 conditional source matches / 35 pending. Named comparator articles below are NOT verified as legally applicable to the finished product. No numeric limit, legal approval or test PASS is activated. Prospective December 2026 amendment is inactive.</div>'+
 '<p><label>Search the 35 remaining cases <input type="search" placeholder="e.g. cocoa, milk, ash, botanical" data-pmsv-b26-search /></label> '+
 '<label>Blocker <select data-pmsv-b26-filter><option value="ALL">All blockers</option>'+
 blockers.map(x=>'<option value="'+e(x)+'">'+e(x.replaceAll("_"," "))+'</option>').join("")+
 '</select></label></p>'+
 '<p data-pmsv-b26-total>35 unapproved comparisons. Each Open evidence action reaches the existing evidence-review form.</p>'+
 '<div class="tablewrap" style="max-height:480px;overflow:auto"><table><thead><tr><th>Exact food identity</th><th>Official comparator (not applied)</th><th>Why transfer is unsupported</th><th>Decisive next evidence</th><th>Review</th></tr></thead>'+
 '<tbody data-pmsv-b26-rows>'+pmsvB26Rows()+'</tbody></table></div>'+
 '</details>';
}
function pmsvB26Refresh(){
 if(typeof document==="undefined"||!pmsvB26Valid())return;
 const host=document.getElementById("pmsv-b21-readiness")||document.getElementById("pmsv-b14-review-index")||document.getElementById("selectedProductStandardContent");
 if(!host)return;
 let panel=document.getElementById("pmsv-b26-exact-article-adjudication");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB26Dashboard());return}
 const rows=panel.querySelector("[data-pmsv-b26-rows]"),summary=panel.querySelector("[data-pmsv-b26-total]");
 if(rows)rows.innerHTML=pmsvB26Rows();
 if(summary)summary.textContent=pmsvB26Cases().length+" of 35 unapproved comparators shown. No legal or laboratory approval.";
}
function pmsvB26Detail(product){
 if(!pmsvB26Valid()||!product)return "";
 const x=pmsvB26Data.cases.find(x=>x.catalog_id===product.id);
 if(!x||x.product_name!==product.name||String(x.fssr||"")!==String(product.fssr||"")||
 String(x.fcs||"")!==String(product.fcs||""))return "";
 const e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px">'+
 '<summary><b>Batch 26 · exact finished-article scope</b> — NOT APPROVED</summary>'+
 '<p>Published named comparator: <b>'+e(x.reviewed_comparator_article)+'</b> ('+e(x.reviewed_analyte)+
 ', official CTR PDF p.'+(x.ctr_pdf_page_zero_based+1)+'). This comparator is not an applicable assigned limit.</p>'+
 '<p><b>Blocker:</b> '+e(x.legal_scope_obstacle)+'</p>'+
 '<p><b>Next documentary proof:</b> '+e(x.specific_document_to_obtain)+'</p>'+
 '<p><a href="'+e(x.official_ctr)+'#page='+(x.ctr_pdf_page_zero_based+1)+
 '" target="_blank" rel="noopener noreferrer">Read official CTR IX source</a> · '+
 '<a href="'+e(x.official_finished_identity_url)+'" target="_blank" rel="noopener noreferrer">Read FSSR finished identity</a></p>'+
 (x.related_official_product_source?'<p><a href="'+e(x.related_official_product_source.url)+'" target="_blank" rel="noopener noreferrer">Additional official finished-product document</a>: '+e(x.related_official_product_source.note)+'</p>':'')+
 '<div class="notice">No source promotion, numeric limit assignment, legal confirmation, or lot laboratory PASS.</div></details>';
}
const pmsvB26BeforeLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB26BeforeLoad();pmsvB26Data=null;
 try{
  const r=await fetch(pmsvB26Path+"?v=20261016-b26",{cache:"reload"});
  if(!r.ok)throw Error("Missing current article adjudication");
  pmsvB26Data=await r.json();
  if(!pmsvB26Valid())throw Error("Batch26 case/source integrity failed");
  pmsvB26Refresh();
 }catch(_){pmsvB26Data=null;}
};
const pmsvB26OldHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB26Detail(p)+pmsvB26OldHtml(p);};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b26-search]")){
   pmsvB26Text=String(ev.target.value||"").slice(0,150);pmsvB26Refresh();
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b26-filter]")){
   const k=ev.target.value;
   if(k==="ALL"||pmsvB26Data?.cases?.some(x=>x.primary_blocker===k)){pmsvB26Filter=k;pmsvB26Refresh();}
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b26-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b26-open"));
 });
}
