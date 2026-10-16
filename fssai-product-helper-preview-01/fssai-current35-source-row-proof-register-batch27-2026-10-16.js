"use strict";
/* Batch27: pin exact official CTR IX rows, preserve named-product non-transfer.
 * Verified publication text is not a finished-food applicability approval. */
var pmsvB27Data=null,pmsvB27Search="",pmsvB27OnlyLinked=false;
const pmsvB27Path="./data/rules/fssai-current35-source-row-proof-register-batch27-2026-10-16.json";
const pmsvB27Expected="1c892b45c5a9b7ae";
function pmsvB27Valid(){
 if(typeof pmsvB26Valid!=="function"||!pmsvB26Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB27Data||
 pmsvB14Digest(pmsvB27Data)!==pmsvB27Expected)return false;
 const d=pmsvB27Data,n=d.coverage;
 if(d.schema_version!=="1.0"||d.kind!=="PMSV_CURRENT35_VERIFIED_OFFICIAL_CTR_TEXT_B27"||
 d.as_of!=="2026-10-16"||d.reference_regulation!=="CTR_2.1.1_AND_2.2.1_VERSION_IX_03_FEB_2026"||
 d.official_pdf!==pmsvB26Data.source_reference||
 d.publication_date!=="2026-02-03"||d.future_amendment_effective!=="2026-12-01"||
 d.future_amendment_active!==false||d.source_row_count!==17||d.rows?.length!==17||
 n?.canonical!==533||n.conditional_references!==498||n.pending_finished_source!==35||
 n.independent_legal_matches!==0||n.lab_lot_pass!==0||
 pmsv498Ledger?.first_source_pending!==35)return false;
 const allowed=new Set(pmsvB26Data.cases.map(x=>x.catalog_id)),unique=new Set(),linked=new Set();
 for(const x of d.rows){
  if(!x?.row_id||unique.has(x.row_id)||!x.analyte||!x.article||
  typeof x.value!=="number"||x.value<0||!["mg/kg","µg/kg"].includes(x.unit)||
  !Number.isInteger(x.pdf_page_zero_based)||x.pdf_page_zero_based<0||
  x.pdf_page_zero_based>14||!x.qualifier||!x.transfer_blocker||
  x.source_url!==d.official_pdf+"#page="+(x.pdf_page_zero_based+1)||
  x.row_verified_in_official_pdf!==true||
  x.finished_product_scope_verified!==false||
  x.regulatory_limit_auto_assigned!==false||x.lot_conformity_verified!==false||
  !Array.isArray(x.catalog_ids)||new Set(x.catalog_ids).size!==x.catalog_ids.length||
  x.catalog_ids.some(id=>!allowed.has(id)))return false;
  unique.add(x.row_id);x.catalog_ids.forEach(id=>linked.add(id));
 }
 return unique.size===17&&linked.size===13;
}
function pmsvB27Linked(id){
 return pmsvB27Valid()?pmsvB27Data.rows.filter(x=>x.catalog_ids.includes(id)):[];
}
function pmsvB27Cell(x){
 const e=pmsvB14Esc;
 return '<tr><td><b>'+e(x.analyte)+'</b> · '+e(x.article)+
 '</td><td>'+e(x.value)+' '+e(x.unit)+
 '<div><small>'+e(x.qualifier)+'</small></div></td>'+
 '<td>'+e(x.transfer_blocker)+'</td>'+
 '<td><a href="'+e(x.source_url)+'" target="_blank" rel="noopener noreferrer">Official FSSAI PDF p.'+
 (x.pdf_page_zero_based+1)+'</a></td></tr>';
}
function pmsvB27Found(){
 if(!pmsvB27Valid())return [];
 const q=pmsvB27Search.toLowerCase().trim();
 return pmsvB27Data.rows.filter(x=>(!pmsvB27OnlyLinked||x.catalog_ids.length>0)&&
 (!q||[x.row_id,x.analyte,x.article,x.qualifier,x.transfer_blocker,
 ...x.catalog_ids].some(t=>String(t).toLowerCase().includes(q))));
}
function pmsvB27Dashboard(){
 if(!pmsvB27Valid())return "";
 const table=pmsvB27Found().map(pmsvB27Cell).join("");
 return '<details class="card" id="pmsv-b27-current-source-rows" style="margin-bottom:12px">'+
 '<summary><b>Batch27 · 17 official CTR source rows cross-checked</b> — legal applicability pending</summary>'+
 '<div class="notice"><b>Two independent questions:</b> (1) Does the FSSAI PDF contain this named article, analyte and numeric value? <b>YES, source row verified.</b> (2) Is this a legally applicable finished-product maximum for your exact article? <b>NOT VERIFIED.</b> No finished-food threshold, lab PASS or compliance approval has been granted.</div>'+
 '<p><label>Find metal / product / scope <input type="search" data-pmsv-b27-search placeholder="cocoa, sorbitol, ash, milk" /></label></p>'+
 '<p data-pmsv-b27-count>'+pmsvB27Found().length+' rows · 13 potentially related pending products · 0 approved.</p>'+
 '<div class="tablewrap" style="max-height:400px;overflow:auto"><table><thead><tr><th>Official named article</th><th>Published value (source only)</th><th>Why cannot transfer</th><th>Official page</th></tr></thead><tbody data-pmsv-b27-rows>'+
 table+'</tbody></table></div></details>';
}
function pmsvB27Refresh(){
 if(typeof document==="undefined"||!pmsvB27Valid())return;
 const host=document.getElementById("pmsv-b26-exact-article-adjudication")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!host)return;
 const panel=document.getElementById("pmsv-b27-current-source-rows");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB27Dashboard());return}
 const list=panel.querySelector("[data-pmsv-b27-rows]"),stats=panel.querySelector("[data-pmsv-b27-count]");
 if(list)list.innerHTML=pmsvB27Found().map(pmsvB27Cell).join("");
 if(stats)stats.textContent=pmsvB27Found().length+" official rows · 13 related cases · 0 approved.";
}
function pmsvB27CaseHtml(product){
 if(!pmsvB27Valid()||!product)return "";
 const own=pmsvB26Data.cases.find(x=>x.catalog_id===product.id);
 if(!own||own.product_name!==product.name||
 String(own.fssr||"")!==String(product.fssr||"")||
 String(own.fcs||"")!==String(product.fcs||""))return "";
 const rows=pmsvB27Linked(product.id);
 if(!rows.length)return "";
 return '<details class="card" style="margin-top:12px">'+
 '<summary><b>Batch 27 · published CTR article evidence</b> — '+rows.length+' source-only reference(s)</summary>'+
 '<div class="notice"><b>Important:</b> Verified legal table row ≠ verified article applicability. All entries below are comparisons only, not selected product limits.</div>'+
 '<div class="tablewrap"><table><thead><tr><th>Source article</th><th>Published value</th><th>Unresolved condition</th><th>Source</th></tr></thead><tbody>'+
 rows.map(pmsvB27Cell).join("")+'</tbody></table></div></details>';
}
const pmsvB27LoadBefore=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB27LoadBefore();pmsvB27Data=null;
 try{
  const r=await fetch(pmsvB27Path+"?v=20261016-b27",{cache:"reload"});
  if(!r.ok)throw Error("Missing Batch27 official CTR proof register");
  pmsvB27Data=await r.json();
  if(!pmsvB27Valid())throw Error("Batch27 source-row integrity failed");
  pmsvB27Refresh();
 }catch(_){pmsvB27Data=null;}
};
const pmsvB27PreviousHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB27CaseHtml(p)+pmsvB27PreviousHtml(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b27-search]")){
   pmsvB27Search=String(ev.target.value||"").slice(0,150);pmsvB27Refresh();
  }
 });
}