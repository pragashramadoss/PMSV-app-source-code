"use strict";
/* Batch31 official identity/quality standards: coconut, Trapa flour and chia.
 * NO CTR metal transfer or actual laboratory/regulatory verdict is permitted. */
var pmsvB31Data=null,pmsvB31Search="";
const pmsvB31Path="./data/rules/fssai-current35-three-commodity-standards-batch31-2026-10-16.json";
const pmsvB31Expected="8e324e3a677712df";
function pmsvB31Valid(){
 if(typeof pmsvB30Valid!=="function"||!pmsvB30Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB31Data||
 pmsvB14Digest(pmsvB31Data)!==pmsvB31Expected)return false;
 const d=pmsvB31Data;
 if(d.schema_version!=="1.0"||
 d.kind!=="PMSV_CURRENT35_POSITIVE_COCONUT_CHESTNUT_CHIA_STANDARDS_BATCH31"||
 d.as_of!=="2026-10-16"||d.deployment!=="GH_PAGES_PREVIEW_ONLY"||
 d.source_version!=="CHAPTER_2_3_VERSION_3_07_05_2025_AND_CHAPTER_2_4_VERSION_4_07_05_2025"||
 d.master_ledger!==533||d.conditional_first_source_references!==498||
 d.pending_exact_ctr_article_scope!==35||d.earlier_named_fssr_standards!==10||
 d.additional_named_fssr_standards!==3||d.total_positive_product_standards!==13||
 d.exact_quality_items!==20||d.new_ctr_article_match_count!==0||
 d.approved_finished_numeric_ctr_limit_count!==0||
 d.real_laboratory_pass_count!==0||d.wordpress_modified!==false||
 d.future_ctr_amendment_auto_applied!==false||
 d.official_ctr_pdf!==pmsvB26Data.source_reference||
 d.cases?.length!==3||pmsv498Ledger?.first_source_pending!==35||
 pmsv498Ledger?.records?.length!==533)return false;
 const prior=new Set([...pmsvB29Data.cases,...pmsvB30Data.cases].map(x=>x.catalog_id));
 const known=new Map(pmsvB26Data.cases.map(x=>[x.catalog_id,x]));
 const ids=new Set();let count=0;
 const allowed=new Map([
  ["04-04-1-coconut-milk-powder","2.3.63"],
  ["06-06-2-water-chestnut-flour-singhare-ka-atta","2.3.64"],
  ["06-06-1-chia-seeds","2.4.6 (clause 25: Chia Seeds)"]
 ]);
 for(const x of d.cases){
  const y=known.get(x.catalog_id);
  if(!y||prior.has(x.catalog_id)||ids.has(x.catalog_id)||
   x.product_name!==y.product_name||x.fssr!==y.fssr||x.fcs!==y.fcs||
   x.legal_product_standard!==allowed.get(x.catalog_id)||
   !/^https:\/\/www\.fssai\.gov\.in\/upload\/uploadfiles\/files\/Chapter%202_[34]_/.test(x.source_pdf)||
   !Array.isArray(x.pdf_pages_zero_based)||!x.pdf_pages_zero_based.length||
   x.pdf_pages_zero_based.some(n=>!Number.isInteger(n)||n<0||n>105)||
   !x.official_description||!x.documentary_evidence_required||
   !Array.isArray(x.checks)||!x.checks.length||
   x.published_standard_located!==true||
   x.finished_product_identity_confirmed!==false||
   x.laboratory_coa_verified!==false||
   x.ctr_contaminant_article_approved!==false||
   x.compliance_approved!==false)return false;
  for(const c of x.checks){
   if(!c.name||!["minimum","maximum"].includes(c.relation)||
    !Number.isFinite(c.value)||c.value<0||!c.unit||!c.analytical_basis||
    !c.applicable_product||!(c.annotation===null||typeof c.annotation==="string"))return false;
   count++;
  }
  ids.add(x.catalog_id);
 }
 return ids.size===3&&count===20;
}
function pmsvB31Filtered(){
 if(!pmsvB31Valid())return [];
 const q=pmsvB31Search.trim().toLowerCase();
 return pmsvB31Data.cases.filter(x=>!q||
 [x.catalog_id,x.product_name,x.official_description,x.documentary_evidence_required,
  ...x.checks.map(r=>r.name+" "+r.analytical_basis)].some(y=>String(y).toLowerCase().includes(q)));
}
function pmsvB31Rules(c){
 const e=pmsvB14Esc;
 return '<div class="tablewrap"><table><thead><tr><th>Published quality parameter</th><th>FSSR value</th><th>Basis / caveat</th></tr></thead><tbody>'+
 c.checks.map(z=>'<tr><td>'+e(z.name)+'</td><td>'+
 (z.relation==="maximum"?"≤ ":"≥ ")+e(z.value)+" "+e(z.unit)+
 '</td><td>'+e(z.analytical_basis)+(z.annotation?"; "+e(z.annotation):"")+
 '</td></tr>').join("")+'</tbody></table></div>';
}
function pmsvB31Rows(){
 const e=pmsvB14Esc;
 return pmsvB31Filtered().map(c=>'<tr><td><b>'+e(c.product_name)+'</b>'+
 '<div><small>FSSR '+e(c.legal_product_standard)+'</small></div></td>'+
 '<td>'+e(c.official_description)+'</td>'+
 '<td>'+c.checks.length+' official product-quality rules. No actual lot results.</td>'+
 '<td>'+e(c.documentary_evidence_required)+'</td>'+
 '<td><a href="'+e(c.source_pdf)+'#page='+(c.pdf_pages_zero_based[0]+1)+
 '" target="_blank" rel="noopener noreferrer">Official PDF</a> '+
 '<button type="button" data-pmsv-b31-open="'+e(c.catalog_id)+'">Review evidence</button></td></tr>').join("");
}
function pmsvB31Dashboard(){
 if(!pmsvB31Valid())return "";
 return '<details class="card" id="pmsv-b31-commodity-standards" style="margin-bottom:12px">'+
 '<summary><b>Batch31 · coconut, chestnut and chia FSSR standards</b> — 20 checks, no CTR promotions</summary>'+
 '<div class="notice"><b>Named FSSR quality standards identified, NOT sample conformity or contaminant-limit applicability.</b> Coconut fat is on a dry basis, chestnut flour comes from Trapa nuts, and chia impurity limits have nested sublimits. 13 product standards identified over three batches; 35 separate contaminant-source cases remain pending.</div>'+
 '<p><label>Search product and requirement <input type="search" data-pmsv-b31-search placeholder="fat, moisture, uric acid, chia" /></label></p>'+
 '<p data-pmsv-b31-count>'+pmsvB31Filtered().length+' of 3 source-identified products shown; 0 tested lots</p>'+
 '<div class="tablewrap"><table><thead><tr><th>Finished product</th><th>Official identity</th><th>Criteria</th><th>Documentary action</th><th>Source</th></tr></thead>'+
 '<tbody data-pmsv-b31-rows>'+pmsvB31Rows()+'</tbody></table></div></details>';
}
function pmsvB31Refresh(){
 if(typeof document==="undefined"||!pmsvB31Valid())return;
 const target=document.getElementById("pmsv-b30-fssr-cocoa-salt-variants")||
 document.getElementById("pmsv-b29-exact-fssr-product-standards")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!target)return;
 const panel=document.getElementById("pmsv-b31-commodity-standards");
 if(!panel){target.insertAdjacentHTML("beforebegin",pmsvB31Dashboard());return}
 const rows=panel.querySelector("[data-pmsv-b31-rows]"),stat=panel.querySelector("[data-pmsv-b31-count]");
 if(rows)rows.innerHTML=pmsvB31Rows();
 if(stat)stat.textContent=pmsvB31Filtered().length+" of 3 standards found; no CTR approval or lab PASS.";
}
function pmsvB31PerProduct(p){
 if(!p||!pmsvB31Valid())return "";
 const x=pmsvB31Data.cases.find(c=>c.catalog_id===p.id);
 if(!x||x.product_name!==p.name||
 String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))return "";
 const e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px"><summary>'+
 '<b>Batch31 · FSSR '+e(x.legal_product_standard)+'</b> — product and CTR verification pending</summary>'+
 '<p>'+e(x.official_description)+'</p>'+pmsvB31Rules(x)+
 '<p><b>Next real evidence:</b> '+e(x.documentary_evidence_required)+'</p>'+
 '<p><a target="_blank" rel="noopener noreferrer" href="'+e(x.source_pdf)+
 '#page='+(x.pdf_pages_zero_based[0]+1)+'">Read the FSSAI standard</a></p>'+
 '<div class="notice">Published FSSR product criteria are not CTR heavy-metal or toxin maxima. No finished-product laboratory result or regulatory PASS.</div></details>';
}
const pmsvB31PriorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB31PriorLoad();pmsvB31Data=null;
 try{
  const r=await fetch(pmsvB31Path+"?v=20261016-b31",{cache:"reload"});
  if(!r.ok)throw Error("Batch31 product standard unavailable");
  pmsvB31Data=await r.json();
  if(!pmsvB31Valid())throw Error("Batch31 product identity or integrity mismatch");
  pmsvB31Refresh();
 }catch(_){pmsvB31Data=null;}
};
const pmsvB31PriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB31PerProduct(p)+pmsvB31PriorHtml(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b31-search]")){
   pmsvB31Search=String(ev.target.value||"").slice(0,140);pmsvB31Refresh();
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b31-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b31-open"));
 });
}