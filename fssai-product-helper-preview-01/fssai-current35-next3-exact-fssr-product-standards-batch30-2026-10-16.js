"use strict";
/* Batch30 official named finished article standard; NOT CTR applicability or
 * actual laboratory sample approval. Supports conditional product variants. */
var pmsvB30Data=null,pmsvB30Search="";
const pmsvB30Path="./data/rules/fssai-current35-next3-exact-fssr-product-standards-batch30-2026-10-16.json";
const pmsvB30Expected="aa0ab14009455159";
function pmsvB30Valid(){
 if(typeof pmsvB29Valid!=="function"||!pmsvB29Valid()||!pmsvB30Data||
 typeof pmsvB14Digest!=="function"||
 pmsvB14Digest(pmsvB30Data)!==pmsvB30Expected)return false;
 const d=pmsvB30Data,c=d.counts;
 if(d.schema_version!=="1.0"||
 d.kind!=="PMSV_CURRENT35_ADDITIONAL_THREE_EXACT_FSSR_STANDARDS_BATCH30"||
 d.as_of!=="2026-10-16"||d.stage!=="GH_PAGES_PREVIEW_ONLY"||
 d.current_official_fssr_compendium_version!=="CH_2_7_V1_2023_09_01_AND_CH_2_9_V4_2025_08_01"||
 d.ctr_reference!==pmsvB26Data.source_reference||
 c?.catalogue!==533||c.conditional_source_references!==498||
 c.pending_exact_ctr_first_sources!==35||c.previous_b29_named_fssr_standards!==7||
 c.new_named_fssr_standards!==3||c.total_named_fssr_research_standards!==10||
 c.source_quality_rules_checked!==25||c.ctr_source_promotions!==0||
 c.actual_lot_passes!==0||c.wordPress_mutations!==0||
 d.rules_fallible_if_variant_unknown!==true||
 d.cases?.length!==3||d.results?.legal_product_identity_reference_found_for!==3||
 d.results.independent_ctr_scope_decisions!==0||
 d.results.verified_actual_lots!==0||
 d.results.canonical_ledger_modified!==false||
 d.results.wordpress_modified!==false||
 pmsv498Ledger?.first_source_pending!==35)return false;
 const known=new Map(pmsvB26Data.cases.map(x=>[x.catalog_id,x]));
 const named=new Set(pmsvB29Data.cases.map(x=>x.catalog_id)),ids=new Set();
 let criteria=0;
 for(const x of d.cases){
  const y=known.get(x.catalog_id);
  if(!y||ids.has(x.catalog_id)||named.has(x.catalog_id)||
   x.product_name!==y.product_name||x.fssr!==y.fssr||x.fcs!==y.fcs||
   !["2.7.6","2.7.8","2.9.30(6)"].includes(x.official_clause)||
   !/^https:\/\/stg-old\.fssai\.gov\.in\/upload\/uploadfiles\/files\//.test(x.official_fssr_source)||
   !Array.isArray(x.official_pdf_pages_zero_based)||
   x.official_pdf_pages_zero_based.length<2||
   x.official_pdf_pages_zero_based.some(p=>!Number.isInteger(p)||p<0||p>40)||
   !x.identity_note||!x.follow_up_evidence||!Array.isArray(x.requirements)||
   !x.requirements.length||
   x.exactly_named_fssr_standard_identified!==true||
   x.finished_product_identity_verified!==false||
   x.actual_batch_test_pass!==false||
   x.ctr_scope_verified!==false||
   x.approved_finished_ctr_limit!==false)return false;
  for(const r of x.requirements){
   if(!r.parameter||!["min","max","max_exclusive","required"].includes(r.comparison)||
    !r.unit||!r.finished_form||!r.analytical_basis||!r.qualification||
    (r.value!==null&&(!Number.isFinite(r.value)||r.value<0))||
    (r.comparison==="required"&&r.value!==null)||
    (r.comparison!=="required"&&r.value===null))return false;
   criteria++;
  }
  ids.add(x.catalog_id);
 }
 return ids.size===3&&criteria===25;
}
function pmsvB30Selected(){
 if(!pmsvB30Valid())return [];
 const q=pmsvB30Search.trim().toLowerCase();
 return pmsvB30Data.cases.filter(x=>!q||
 [x.catalog_id,x.product_name,x.official_clause,x.identity_note,x.follow_up_evidence,
 ...x.requirements.map(r=>r.parameter+" "+r.finished_form+" "+r.qualification)].some(s=>String(s).toLowerCase().includes(q)));
}
function pmsvB30SpecValue(r){
 const e=pmsvB14Esc;
 return r.comparison==="required"?"Required "+e(r.unit):
 (r.comparison==="min"?"≥ ":r.comparison==="max"?"≤ ":"< ")+e(r.value)+" "+e(r.unit);
}
function pmsvB30Specs(c){
 const e=pmsvB14Esc;
 return '<div class="tablewrap"><table><thead><tr><th>Standard-quality property</th><th>Published criterion</th><th>Only applies to</th><th>Legal analytical basis / exception</th></tr></thead><tbody>'+
 c.requirements.map(r=>'<tr><td>'+e(r.parameter)+'</td>'+
 '<td>'+pmsvB30SpecValue(r)+'</td>'+
 '<td>'+e(r.finished_form)+'</td>'+
 '<td>'+e(r.analytical_basis)+'. '+e(r.qualification)+'</td></tr>').join("")+
 '</tbody></table></div>';
}
function pmsvB30Rows(){
 const e=pmsvB14Esc;
 return pmsvB30Selected().map(c=>'<tr><td><b>'+e(c.product_name)+'</b>'+
 '<p><small>FSSR '+e(c.official_clause)+'</small></p></td>'+
 '<td>'+e(c.identity_note)+'</td>'+
 '<td>'+c.requirements.length+' separate quality/variant requirements. No lab results.</td>'+
 '<td>'+e(c.follow_up_evidence)+'</td>'+
 '<td><a href="'+e(c.official_fssr_source)+
 '#page='+(c.official_pdf_pages_zero_based[0]+1)+
 '" target="_blank" rel="noopener noreferrer">Official FSSR chapter</a> '+
 '<button type="button" data-pmsv-b30-open="'+e(c.catalog_id)+'">Open review</button></td></tr>').join("");
}
function pmsvB30Dash(){
 if(!pmsvB30Valid())return "";
 return '<details class="card" id="pmsv-b30-fssr-cocoa-salt-variants" style="margin-bottom:12px">'+
 '<summary><b>Batch30 · 3 additional named FSSR standards</b> — 25 variant-specific requirements</summary>'+
 '<div class="notice"><b>Identity/quality text, not a finished-product CTR contaminant PASS.</b> Cocoa mass versus cocoa cake, sweetened cocoa powder versus mixes and salt substitutes have different conditions. 7 earlier plus 3 additional product standards found; all 35 CTR first-source cases remain pending. Compendia are for reference and original Gazette takes priority.</div>'+
 '<p><label>Filter named product / property <input type="search" data-pmsv-b30-search placeholder="cocoa butter, sodium, magnesium" /></label></p>'+
 '<p data-pmsv-b30-count>'+pmsvB30Selected().length+' of 3 official FSSR standards · 0 CTR approved</p>'+
 '<div class="tablewrap"><table><thead><tr><th>Finished article</th><th>Legal identity</th><th>Conditional FSSR rules</th><th>Evidence needed</th><th>Source/review</th></tr></thead>'+
 '<tbody data-pmsv-b30-rows>'+pmsvB30Rows()+'</tbody></table></div>'+
 '</details>';
}
function pmsvB30Refresh(){
 if(typeof document==="undefined"||!pmsvB30Valid())return;
 const host=document.getElementById("pmsv-b29-exact-fssr-product-standards")||
 document.getElementById("pmsv-b28-remaining22-panel")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!host)return;
 const old=document.getElementById("pmsv-b30-fssr-cocoa-salt-variants");
 if(!old){host.insertAdjacentHTML("beforebegin",pmsvB30Dash());return}
 const tbl=old.querySelector("[data-pmsv-b30-rows]"),cnt=old.querySelector("[data-pmsv-b30-count]");
 if(tbl)tbl.innerHTML=pmsvB30Rows();
 if(cnt)cnt.textContent=pmsvB30Selected().length+" of 3 officially named product standards, none lot-tested or CTR-approved.";
}
function pmsvB30ProductHtml(p){
 if(!p||!pmsvB30Valid())return "";
 const c=pmsvB30Data.cases.find(x=>x.catalog_id===p.id);
 if(!c||c.product_name!==p.name||String(c.fssr||"")!==String(p.fssr||"")||
 String(c.fcs||"")!==String(p.fcs||""))return "";
 const e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px"><summary><b>Batch30 · FSSR '+e(c.official_clause)+
 '</b> — source identified; product/lot evidence missing</summary>'+
 '<p>'+e(c.identity_note)+'</p>'+pmsvB30Specs(c)+
 '<p><b>To verify applicability:</b> '+e(c.follow_up_evidence)+'</p>'+
 '<p><a href="'+e(c.official_fssr_source)+
 '#page='+(c.official_pdf_pages_zero_based[0]+1)+
 '" target="_blank" rel="noopener noreferrer">Open official FSSR published chapter</a></p>'+
 '<div class="notice">These numbers belong to condition-specific FSSR identity/quality specifications. They are NOT the CTR contaminant maximum for this product. No actual product identification, test PASS or regulatory-source promotion.</div></details>';
}
const pmsvB30OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB30OldLoad();pmsvB30Data=null;
 try{
  const r=await fetch(pmsvB30Path+"?v=20261016-b30",{cache:"reload"});
  if(!r.ok)throw Error("Batch30 quality source unavailable");
  pmsvB30Data=await r.json();
  if(!pmsvB30Valid())throw Error("Batch30 source identity integrity mismatch");
  pmsvB30Refresh();
 }catch(_){pmsvB30Data=null;}
};
const pmsvB30OldProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB30ProductHtml(p)+pmsvB30OldProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b30-search]")){
   pmsvB30Search=String(ev.target.value||"").slice(0,160);pmsvB30Refresh();
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b30-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b30-open"));
 });
}