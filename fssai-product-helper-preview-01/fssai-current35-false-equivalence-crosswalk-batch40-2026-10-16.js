"use strict";
/* Batch 40 current35 new crosswalk, separate from historical fssai-batch40 catalog source file. */
var pmsvB40Data=null,pmsvB40Query="",pmsvB40Filter="ALL",pmsvB40ComparatorQuery="";
const pmsvB40Path="./data/rules/fssai-current35-false-equivalence-article-crosswalk-batch40-2026-10-16.json";
const pmsvB40Expected="e15767a9a4eb0016";
const pmsvB40Types=["LEGAL_SCOPE","PRODUCT_IDENTITY","PROCESS_MATRIX","SUBSTANCE_ID"];
function pmsvB40Valid(){
 if(typeof pmsvB39Valid!=="function"||!pmsvB39Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB40Data||
 pmsvB14Digest(pmsvB40Data)!==pmsvB40Expected)return false;
 const d=pmsvB40Data,n=d.counts;
 if(d.schema_version!=="1.0"||d.kind!=="PMSV_CURRENT35_EXACT_ARTICLE_FALSE_EQUIVALENCE_BATCH40"||
 d.as_of!=="2026-10-16"||d.deployment!=="GH_PAGES_PREVIEW_ONLY"||
 d.preexisting_historical_batch40_file_preserved!==true||
 n?.catalogue!==533||n.conditional_first_source_matches!==498||
 n.pending_ctr_article_decisions!==35||n.adjudicated_comparator_contrasts!==35||
 n.primary_ctr_source_rows!==23||n.legal_scope_blocks!==11||
 n.product_identity_blocks!==9||n.process_matrix_blocks!==7||
 n.substance_identity_blocks!==8||
 n.commercial_products_verified!==0||
 n.source_comparator_numeric_limits_transferred!==0||
 n.actual_signed_legal_article_decisions!==0||n.lab_lot_passes!==0||
 n.wordpress_changed!==false||
 d.source?.url!==pmsvB26Data.source_reference||
 d.source?.compendium_not_legal_instrument!==true||
 d.source?.original_gazette_amendment_controls_precedence!==true||
 d.source?.scope_rows_source_checked_against_primary_pdf!==true||
 d.results?.historical_batch40_not_overwritten!==true||
 d.results?.canonical_533_ledger_unchanged!==true||
 d.results?.source_limits_not_auto_applied!==true||
 d.results?.legal_approval_count!==0||
 d.results?.lab_passes!==0||d.results?.wordpress_changed!==false||
 d.key_findings?.length!==6||
 d.comparator_rows?.length!==23||d.case_contrasts?.length!==35||
 pmsv498Ledger?.records?.length!==533||
 pmsv498Ledger?.first_source_pending!==35)return false;
 const anchors=new Map();
 for(const s of d.comparator_rows){
  if(!s.id||anchors.has(s.id)||s.source_url!==d.source.url||
   !Number.isInteger(s.pdf_page_zero_based)||s.pdf_page_zero_based<0||
   s.pdf_page_zero_based>55||!s.analyte||!s.named_article||
   !s.basis||!s.difference||s.finished_article_scope_confirmed!==false||
   s.numeric_limit_applied_to_pending_case!==false||
   s.laboratory_compliance_pass!==false||
   (s.candidate_value!==null&&!(typeof s.candidate_value==="number"&&s.candidate_value>=0)))return false;
  anchors.set(s.id,s);
 }
 const previous=new Map(pmsvB26Data.cases.map(x=>[x.catalog_id,x]));
 const method=new Map(pmsvB39Data.case_gates.map(x=>[x.catalog_id,x]));
 if(previous.size!==35||method.size!==35)return false;
 const seen=new Set(),blocks={LEGAL_SCOPE:0,PRODUCT_IDENTITY:0,PROCESS_MATRIX:0,SUBSTANCE_ID:0};
 for(const c of d.case_contrasts){
  const p=previous.get(c.catalog_id),s=anchors.get(c.source_row_id),m=method.get(c.catalog_id);
  if(!p||!s||!m||seen.has(c.catalog_id)||
   c.rank!==p.rank||c.product_name!==p.product_name||
   c.fssr!==p.fssr||c.fcs!==p.fcs||
   c.prior_ctr_reviewed_analyte!==p.reviewed_analyte||
   c.prior_ctr_comparator!==p.reviewed_comparator_article||
   c.blocking_class!==p.primary_blocker||
   !pmsvB40Types.includes(c.blocking_class)||
   !c.contrast_code||!c.actual_vs_comparator_distinction||
   c.comparator_source_url!==d.source.url||
   c.comparator_source_page_zero_based!==s.pdf_page_zero_based||
   c.original_comparator_limit_for_research_only!==s.candidate_value||
   c.original_comparator_unit!==s.unit||
   c.must_collect?.length!==5||
   c.exact_ctr_article_applicability_signed!==false||
   c.lab_validated_for_this_matrix!==false||
   c.commercial_identity_verified!==false||
   c.candidate_limit_transferred!==false||
   c.legal_pass!==false||c.lot_lab_pass!==false||
   m.regulatory_pass!==false)return false;
  seen.add(c.catalog_id);blocks[c.blocking_class]++;
 }
 const rel=d.case_contrasts.find(x=>x.catalog_id==="100-100-royal-jelly");
 const cocoa=d.case_contrasts.find(x=>x.catalog_id==="05-05-1-cocoa-mass-or-cocoa-chocolate-liquor-and-cocoa-cake");
 const nickel=d.case_contrasts.find(x=>x.catalog_id.startsWith("11-11-6-polyols"));
 const coffee=d.case_contrasts.find(x=>x.catalog_id==="coffee-chicory-mixture");
 return seen.size===35&&blocks.LEGAL_SCOPE===11&&blocks.PRODUCT_IDENTITY===9&&
 blocks.PROCESS_MATRIX===7&&blocks.SUBSTANCE_ID===8&&
 rel?.source_row_id==="POTENTIAL_HONEY_VET"&&rel.comparator_source_page_zero_based===39&&
 cocoa?.source_row_id==="LEAD_COCOA_POWDER"&&
 nickel?.source_row_id==="NICKEL_SORBITOL"&&
 coffee?.source_row_id==="OCHRATOXIN_COFFEE";
}
function pmsvB40Cases(){
 if(!pmsvB40Valid())return [];
 const q=pmsvB40Query.trim().toLowerCase();
 return pmsvB40Data.case_contrasts.filter(x=>
 (pmsvB40Filter==="ALL"||x.blocking_class===pmsvB40Filter)&&
 (!q||[x.product_name,x.catalog_id,x.contrast_code,
 x.actual_vs_comparator_distinction,x.prior_ctr_comparator,
 x.prior_ctr_reviewed_analyte].some(z=>String(z).toLowerCase().includes(q))));
}
function pmsvB40Rows(){
 if(!pmsvB40Valid())return [];
 const q=pmsvB40ComparatorQuery.trim().toLowerCase();
 return pmsvB40Data.comparator_rows.filter(x=>!q||
 [x.id,x.analyte,x.named_article,x.difference,x.kind].some(s=>
 String(s).toLowerCase().includes(q)));
}
function pmsvB40CaseHtml(c){
 const e=pmsvB14Esc;
 const s=pmsvB40Data.comparator_rows.find(x=>x.id===c.source_row_id);
 return '<tr><td><b>'+e(c.product_name)+'</b><div><small>'+e(c.catalog_id)+'</small></div></td>'+
 '<td>'+e(c.blocking_class.replaceAll("_"," "))+'</td>'+
 '<td><b>'+e(s.analyte)+'</b>: '+e(s.named_article)+'</td>'+
 '<td>'+e(c.actual_vs_comparator_distinction)+'</td>'+
 '<td><button type="button" data-pmsv-b40-open="'+e(c.catalog_id)+'">Inspect scope</button></td></tr>';
}
function pmsvB40SourceHtml(s){
 const e=pmsvB14Esc;
 return '<tr><td>'+e(s.analyte)+'</td><td>'+e(s.named_article)+'</td>'+
 '<td>'+e(s.candidate_value===null?"Substance-specific":String(s.candidate_value)+" "+s.unit)+
 ' <b>— NOT APPLIED</b></td><td>'+e(s.basis)+'</td>'+
 '<td><a href="'+e(s.source_url)+'#page='+String(s.pdf_page_zero_based+1)+
 '" target="_blank" rel="noopener noreferrer">FSSAI PDF page '+String(s.pdf_page_zero_based+1)+'</a></td></tr>';
}
function pmsvB40Panel(){
 if(!pmsvB40Valid())return "";
 const d=pmsvB40Data,e=pmsvB14Esc;
 return '<details class="card" id="pmsv-b40-current35-source-contrast" style="margin-bottom:12px">'+
 '<summary><b>Batch40 · 35 exact CTR article identity contrasts</b> — 23 official source rows, zero transfers</summary>'+
 '<div class="notice"><b>Legal article safeguard:</b> FSSAI CTR IX is a reference compendium, not the controlling Gazette. The published comparator rows do NOT establish applicability or an approved numeric limit for any of these 35 real product identities. Form, substance, process, analytical basis and current amendments must be independently signed off.</div>'+
 '<p><a href="'+e(d.source.url)+'" target="_blank" rel="noopener noreferrer">FSSAI CTR Version IX primary official table</a></p>'+
 '<details><summary><b>23 original regulatory comparator rows — not applied</b></summary>'+
 '<p><label>Search source row <input type="search" data-pmsv-b40-comparator-search placeholder="lead, sorbitol, aflatoxin, cocoa" /></label></p>'+
 '<div class="tablewrap" style="max-height:430px;overflow:auto"><table><thead><tr><th>Analyte</th><th>Exact named legal row</th><th>Source value only</th><th>Basis</th><th>Source</th></tr></thead>'+
 '<tbody data-pmsv-b40-source-rows>'+pmsvB40Rows().map(pmsvB40SourceHtml).join("")+'</tbody></table></div></details>'+
 '<p><label>Search catalogue case <input type="search" data-pmsv-b40-case-search placeholder="coffee-chicory, cocoa, milk, enzyme, Misri" /></label></p>'+
 '<p><label>Outstanding blocker <select data-pmsv-b40-filter>'+
 '<option value="ALL">All 35</option>'+
 '<option value="LEGAL_SCOPE">11 legal article scope</option>'+
 '<option value="PRODUCT_IDENTITY">9 product identity</option>'+
 '<option value="PROCESS_MATRIX">7 process / matrix</option>'+
 '<option value="SUBSTANCE_ID">8 exact substance</option>'+
 '</select></label></p>'+
 '<p data-pmsv-b40-count>'+pmsvB40Cases().length+' of 35 pending decisions; 0 CTR approvals</p>'+
 '<div class="tablewrap" style="max-height:610px;overflow:auto"><table><thead><tr>'+
 '<th>Actual catalogue article</th><th>Current blocker</th><th>Official comparator source</th><th>Why comparison cannot be transferred</th><th>Open</th></tr></thead>'+
 '<tbody data-pmsv-b40-case-rows>'+pmsvB40Cases().map(pmsvB40CaseHtml).join("")+'</tbody></table></div></details>';
}
function pmsvB40Refresh(){
 if(typeof document==="undefined"||!pmsvB40Valid())return;
 const host=document.getElementById("pmsv-b39-method-exceptions")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!host)return;
 const panel=document.getElementById("pmsv-b40-current35-source-contrast");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB40Panel());return}
 const cases=panel.querySelector("[data-pmsv-b40-case-rows]");
 const src=panel.querySelector("[data-pmsv-b40-source-rows]");
 const count=panel.querySelector("[data-pmsv-b40-count]");
 if(cases)cases.innerHTML=pmsvB40Cases().map(pmsvB40CaseHtml).join("");
 if(src)src.innerHTML=pmsvB40Rows().map(pmsvB40SourceHtml).join("");
 if(count)count.textContent=pmsvB40Cases().length+" of 35 pending; zero numerical limits auto-applied.";
}
function pmsvB40Product(p){
 if(!p||!pmsvB40Valid())return "";
 const c=pmsvB40Data.case_contrasts.find(x=>x.catalog_id===p.id);
 if(!c||c.product_name!==p.name||
 String(c.fssr||"")!==String(p.fssr||"")||
 String(c.fcs||"")!==String(p.fcs||""))return "";
 const s=pmsvB40Data.comparator_rows.find(x=>x.id===c.source_row_id),e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px"><summary><b>Batch40 · exact legal-article identity safeguard</b></summary>'+
 '<p><b>Named row in official CTR:</b> '+e(s.analyte)+" — "+e(s.named_article)+'</p>'+
 '<p><b>Named row value for source inspection ONLY:</b> '+
 e(s.candidate_value===null?"No single comparator number":String(s.candidate_value)+" "+s.unit)+"; "+e(s.basis)+'</p>'+
 '<p><b>Why it cannot be applied:</b> '+e(c.actual_vs_comparator_distinction)+'</p>'+
 '<p><b>Evidence required before actual product approval:</b></p><ol>'+
 c.must_collect.map(x=>'<li>'+e(x)+'</li>').join("")+'</ol>'+
 '<p><a href="'+e(s.source_url)+'#page='+String(s.pdf_page_zero_based+1)+
 '" target="_blank" rel="noopener noreferrer">Official FSSAI CTR reference table</a></p>'+
 '<div class="notice"><b>NOT APPLIED.</b> No commercial formula verification, no legal CTR scope signoff, no lab validation and no actual lot PASS.</div></details>';
}
const pmsvB40PreviousLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB40PreviousLoad();pmsvB40Data=null;
 try{
  const r=await fetch(pmsvB40Path+"?v=20261016-b40",{cache:"reload"});
  if(!r.ok)throw Error("Batch40 current35 source comparators unavailable");
  pmsvB40Data=await r.json();
  if(!pmsvB40Valid())throw Error("B40 current35 comparator source/integrity mismatch");
  pmsvB40Refresh();
 }catch(_){pmsvB40Data=null;}
};
const pmsvB40OldProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB40Product(p)+pmsvB40OldProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b40-case-search]")){
   pmsvB40Query=String(ev.target.value||"").slice(0,130);pmsvB40Refresh();
  }else if(ev.target?.matches?.("[data-pmsv-b40-comparator-search]")){
   pmsvB40ComparatorQuery=String(ev.target.value||"").slice(0,130);pmsvB40Refresh();
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b40-filter]")&&
   ["ALL",...pmsvB40Types].includes(ev.target.value)){
   pmsvB40Filter=ev.target.value;pmsvB40Refresh();
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b40-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b40-open"));
 });
}
