"use strict";
/* Batch 28: 20 exact official CTR table rows, 22 as-sold forms not confirmed.
 * Research comparators only: never assign threshold or conformity PASS. */
var pmsvB28Data=null,pmsvB28Query="",pmsvB28Filter="ALL";
const pmsvB28Path="./data/rules/fssai-current35-remaining22-source-compare-batch28-2026-10-16.json";
const pmsvB28Expected="b4505b25c4ecffac";
function pmsvB28Valid(){
 if(typeof pmsvB27Valid!=="function"||!pmsvB27Valid()||!pmsvB28Data||
 typeof pmsvB14Digest!=="function"||
 pmsvB14Digest(pmsvB28Data)!==pmsvB28Expected)return false;
 const d=pmsvB28Data,n=d.reconciliation;
 if(d.kind!=="PMSV_CURRENT35_REMAINING22_STATUTORY_COMPARATOR_MATRIX_BATCH28"||
 d.schema_version!=="1.0"||d.as_of!=="2026-10-16"||
 d.environment!=="GH_PAGES_PREVIEW_ONLY"||
 d.source_pdf!==pmsvB26Data.source_reference||
 d.publication_date!=="2026-02-03"||
 d.future_amendment_date!=="2026-12-01"||
 d.future_amendment_applied!==false||
 n?.catalogue!==533||n.conditional_first_source!==498||
 n.first_exact_source_pending!==35||n.previously_linked_case_count!==13||
 n.remaining_case_count!==22||n.official_comparator_rows_checked!==20||
 n.remaining_case_comparisons!==22||n.official_article_promotions!==0||
 n.auto_limits!==0||n.legal_approvals!==0||n.lot_passes!==0||
 n.wordpress_modified!==false||d.rows?.length!==20||d.cases?.length!==22||
 pmsv498Ledger?.first_source_pending!==35)return false;
 const prev=new Set(pmsvB27Data.rows.flatMap(x=>x.catalog_ids));
 const known=new Map(pmsvB26Data.cases.map(x=>[x.catalog_id,x]));
 const rows=new Map(),used=new Set(),cases=new Set();
 for(const z of d.rows){
  if(!z?.id||rows.has(z.id)||!z.analyte||!z.official_article||
   !Number.isFinite(z.source_limit)||z.source_limit<0||
   !["mg/kg","mg/L"].includes(z.unit)||!Number.isInteger(z.pdf_page_zero_based)||
   z.pdf_page_zero_based<0||z.pdf_page_zero_based>11||
   z.official_url!==d.source_pdf+"#page="+(z.pdf_page_zero_based+1)||
   !z.transfer_disqualifier||!Array.isArray(z.related_case_ids)||
   z.official_table_text_checked!==true||z.finished_product_scope_proven!==false||
   z.limit_applied!==false||z.lot_pass!==false)return false;
  rows.set(z.id,z);
  for(const id of z.related_case_ids){
   if(!known.has(id)||prev.has(id))return false;
   used.add(id);
  }
 }
 for(const c of d.cases){
  const x=known.get(c.catalog_id);
  if(!x||prev.has(c.catalog_id)||cases.has(c.catalog_id)||
   c.rank!==x.rank||c.product_name!==x.product_name||
   c.fssr!==x.fssr||c.fcs!==x.fcs||
   c.primary_blocker!==x.primary_blocker||
   c.documentary_action!==x.specific_document_to_obtain||
   c.observed_mismatch!==x.legal_scope_obstacle||
   !["SPECIFIC_NAMED_COMPARATOR_FINISHED_FOOD_DIFFERS",
     "GENERIC_OR_CONTAINER_COMPARATOR_NOT_AN_EXACT_NAMED_FINISHED_FOOD"].includes(c.decision_class)||
   c.exact_article_status!=="INDEPENDENT_ADJUDICATION_PENDING"||
   !Array.isArray(c.official_comparator_row_ids)||
   c.official_comparator_row_ids.some(id=>!rows.has(id)||
      !rows.get(id).related_case_ids.includes(c.catalog_id))||
   c.direct_applicability_approved!==false||
   c.numeric_limit_applied!==false||c.lab_pass!==false)return false;
  cases.add(c.catalog_id);
 }
 return rows.size===20&&used.size===22&&cases.size===22&&
 d.cases.filter(x=>x.decision_class.startsWith("GENERIC_OR_CONTAINER")).length===3;
}
function pmsvB28Filtered(){
 if(!pmsvB28Valid())return [];
 const q=pmsvB28Query.trim().toLowerCase();
 return pmsvB28Data.cases.filter(x=>
 (pmsvB28Filter==="ALL"||pmsvB28Filter===x.decision_class)&&
 (!q||[x.catalog_id,x.product_name,x.documentary_action,x.observed_mismatch,
 ...x.official_comparator_row_ids].some(s=>String(s).toLowerCase().includes(q))));
}
function pmsvB28Row(c){
 const e=pmsvB14Esc,lookup=new Map(pmsvB28Data.rows.map(z=>[z.id,z]));
 return '<tr><td><b>'+e(c.product_name)+'</b><div><small>'+e(c.catalog_id)+'</small></div></td>'+
 '<td>'+c.official_comparator_row_ids.map(id=>{
  const z=lookup.get(id);
  return '<div><b>'+e(z.analyte)+'</b> · '+e(z.official_article)+' · '+
   e(z.source_limit)+' '+e(z.unit)+' '+
   '<a target="_blank" rel="noopener noreferrer" href="'+e(z.official_url)+
   '">FSSAI PDF p.'+(z.pdf_page_zero_based+1)+'</a></div>';
 }).join("")+'</td>'+
 '<td><b>Not approved:</b> '+e(c.observed_mismatch)+
 '<div><small>'+e(c.decision_class.startsWith("GENERIC_OR_CONTAINER")?
 "Generic / container comparator — no exact finished article proven":"Named commodity comparator differs from marketed food")+'</small></div></td>'+
 '<td>'+e(c.documentary_action)+'</td>'+
 '<td><button type="button" data-pmsv-b28-open="'+e(c.catalog_id)+'">Open evidence</button></td></tr>';
}
function pmsvB28PanelHtml(){
 if(!pmsvB28Valid())return "";
 const e=pmsvB14Esc;
 return '<details class="card" id="pmsv-b28-remaining22-panel" style="margin-bottom:12px">'+
 '<summary><b>Batch28 · 22 remaining product-article decisions</b> — 20 verified CTR rows, no approved limits</summary>'+
 '<div class="notice"><b>Publication confirmed ≠ finished product matched.</b> All 22 still require documentary proof and independent article selection. Three have only a generic/container comparator, not a directly named finished-product row. No lot PASS or regulatory approval.</div>'+
 '<p><label>Search product, issue or source row <input type="search" data-pmsv-b28-search placeholder="e.g. colostrum, egg, salt" /></label></p>'+
 '<p><label>Evidence class <select data-pmsv-b28-filter><option value="ALL">All 22 unresolved cases</option>'+
 '<option value="SPECIFIC_NAMED_COMPARATOR_FINISHED_FOOD_DIFFERS">Named comparator differs</option>'+
 '<option value="GENERIC_OR_CONTAINER_COMPARATOR_NOT_AN_EXACT_NAMED_FINISHED_FOOD">Generic/container comparator only</option>'+
 '</select></label></p>'+
 '<p data-pmsv-b28-count>'+pmsvB28Filtered().length+' pending cases shown, 0 exact-article approvals</p>'+
 '<div class="tablewrap" style="max-height:550px;overflow:auto"><table><thead><tr>'+
 '<th>Finished product</th><th>Published source comparators (NOT assigned)</th>'+
 '<th>Why legal transfer is blocked</th><th>Required evidence</th><th>Action</th>'+
 '</tr></thead><tbody data-pmsv-b28-rows>'+
 pmsvB28Filtered().map(pmsvB28Row).join("")+
 '</tbody></table></div></details>';
}
function pmsvB28Refresh(){
 if(typeof document==="undefined"||!pmsvB28Valid())return;
 const target=document.getElementById("pmsv-b27-current-source-rows")||
 document.getElementById("pmsv-b26-exact-article-adjudication")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!target)return;
 const old=document.getElementById("pmsv-b28-remaining22-panel");
 if(!old){target.insertAdjacentHTML("beforebegin",pmsvB28PanelHtml());return}
 const out=old.querySelector("[data-pmsv-b28-rows]");
 if(out)out.innerHTML=pmsvB28Filtered().map(pmsvB28Row).join("");
 const count=old.querySelector("[data-pmsv-b28-count]");
 if(count)count.textContent=pmsvB28Filtered().length+" of 22 unresolved cases shown. No legal or laboratory PASS.";
}
function pmsvB28PerProduct(p){
 if(!p||!pmsvB28Valid())return "";
 const x=pmsvB28Data.cases.find(x=>x.catalog_id===p.id);
 if(!x||x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))return "";
 const e=pmsvB14Esc,lookup=new Map(pmsvB28Data.rows.map(z=>[z.id,z]));
 return '<details class="card" style="margin-top:12px"><summary>'+
 '<b>Batch 28 · exact article evidence decision</b> — still pending</summary>'+
 '<div class="notice">Reference-only CTR article comparisons below. NO selected finished-product numeric maximum, legal sign-off, or sample PASS.</div>'+
 '<p><b>Article scope obstacle:</b> '+e(x.observed_mismatch)+'</p>'+
 '<p><b>Decisive documentary requirement:</b> '+e(x.documentary_action)+'</p>'+
 '<ul>'+x.official_comparator_row_ids.map(id=>{
  const z=lookup.get(id);
  return '<li>'+e(z.analyte)+' · '+e(z.official_article)+' · '+
   e(z.source_limit)+' '+e(z.unit)+' ('+
   '<a target="_blank" rel="noopener noreferrer" href="'+e(z.official_url)+'">Official PDF p.'+
   (z.pdf_page_zero_based+1)+'</a>): '+e(z.transfer_disqualifier)+'</li>';
 }).join("")+'</ul></details>';
}
const pmsvB28OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB28OldLoad();pmsvB28Data=null;
 try{
  const r=await fetch(pmsvB28Path+"?v=20261016-b28",{cache:"reload"});
  if(!r.ok)throw Error("Missing Batch28 source comparison register");
  pmsvB28Data=await r.json();
  if(!pmsvB28Valid())throw Error("Batch28 source and catalogue crosswalk integrity unavailable");
  pmsvB28Refresh();
 }catch(_){pmsvB28Data=null;}
};
const pmsvB28OldPerProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB28PerProduct(p)+pmsvB28OldPerProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b28-search]")){
   pmsvB28Query=String(ev.target.value||"").slice(0,140);
   pmsvB28Refresh();
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b28-filter]")){
   const x=ev.target.value;
   if(x==="ALL"||pmsvB28Data?.cases.some(c=>c.decision_class===x)){
    pmsvB28Filter=x;pmsvB28Refresh();
   }
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b28-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b28-open"));
 });
}