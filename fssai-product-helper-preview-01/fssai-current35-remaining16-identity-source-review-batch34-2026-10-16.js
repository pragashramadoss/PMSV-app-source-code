"use strict";
/* B34: Seven official product-identity sources and nine evidence blockers.
   Product-standard values must never be promoted to a CTR limit or lot PASS. */
var pmsvB34Data=null,pmsvB34Query="",pmsvB34Status="ALL";
const pmsvB34Path="./data/rules/fssai-current35-remaining16-identity-source-review-batch34-2026-10-16.json";
const pmsvB34Expected="0798d39cb0cd138d";
const pmsvB34Gaps=new Set([
"11-11-6-polyols-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-excluding-th",
"99-99-1-sajji-khar",
"99-99-1-additives-permitted-under-appendix-a-of-fss-fps-and-fa-regulations-2011-and-other-",
"99-99-1-additives-va-vf-of-nutraceutical-regulations-excluding-those-already-standardised",
"99-99-2-permitted-enzymes-and-their-preparations-excluding-those-already-listed-under-proc",
"99-99-7-ingredients-listed-under-schedule-iv-schedule-vi-and-schedule-viii-of-nutraceutica",
"99-99-7-mixtures-preparations-premix-of-functional-ingredients",
"102-102-1-14-3-narikela-ksheerika-milky-coconut-delight",
"102-102-1-14-7-ksheerapaka-mystic-milk-quartet"
]);
function pmsvB34Valid(){
 if(typeof pmsvB33Valid!=="function"||!pmsvB33Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB34Data||
 pmsvB14Digest(pmsvB34Data)!==pmsvB34Expected)return false;
 const d=pmsvB34Data,n=d.counts;
 if(d.schema_version!=="1.0"||
 d.kind!=="PMSV_CURRENT35_REMAINING16_OFFICIAL_PRODUCT_IDENTITY_REVIEW_BATCH34"||
 d.environment!=="GH_PAGES_PREVIEW_ONLY"||d.as_of!=="2026-10-16"||
 d.quality_evidence_only!==true||d.official_ctr!==pmsvB26Data.source_reference||
 n?.catalogue!==533||n.conditional_first_source_matches!==498||
 n.ctr_exact_article_cases_pending!==35||n.previous_named_product_dossiers!==19||
 n.reviewed_remaining_cases!==16||n.new_named_product_standard_sources!==7||
 n.named_product_dossier_total!==26||n.identity_material_gaps_remaining!==9||
 n.new_ctr_article_matches!==0||n.finished_ctr_limits_approved!==0||
 n.actual_lot_passes!==0||n.wordpress_changed!==false||
 d.results?.canonical_ledger_modified!==false||
 d.results?.wordpress_modified!==false||
 d.results?.legal_ctr_scope_approvals!==0||
 d.results?.finished_ctr_article_applicability_confirmations!==0||
 d.results?.real_lot_laboratory_passes!==0||
 pmsv498Ledger?.records?.length!==533||
 pmsv498Ledger?.first_source_pending!==35||d.cases?.length!==16)return false;
 const canon=new Map(pmsvB26Data.cases.map(x=>[x.catalog_id,x]));
 const prior=new Set([...pmsvB29Data.cases,...pmsvB30Data.cases,
 ...pmsvB31Data.cases,...pmsvB32Data.cases,...pmsvB33Data.cases].map(x=>x.catalog_id));
 if(prior.size!==19)return false;
 const seen=new Set();let named=0,gaps=0,quality=0;
 for(const x of d.cases){
  const c=canon.get(x.catalog_id);
  if(!c||prior.has(x.catalog_id)||seen.has(x.catalog_id)||
   x.rank!==c.rank||x.product_name!==c.product_name||
   x.fssr!==c.fssr||x.fcs!==c.fcs||
   x.primary_blocker!==c.primary_blocker||
   x.existing_ctr_comparator!==c.reviewed_comparator_article||
   x.existing_ctr_analyte!==c.reviewed_analyte||
   x.legal_scope_obstacle!==c.legal_scope_obstacle||
   x.old_documentary_gate!==c.specific_document_to_obtain||
   !x.identity||!x.next||!x.source_kind||x.quality_evidence_only!==true||
   !Array.isArray(x.qa)||
   x.finished_lot_identity_verified!==false||
   x.lab_report_verified!==false||
   x.ctr_exact_finished_article_approved!==false||
   x.approved_finished_numeric_ctr_limit!==false||
   x.regulatory_pass!==false)return false;
  seen.add(x.catalog_id);
  if(x.named_product_standard_found===true){
   named++;
   if(pmsvB34Gaps.has(x.catalog_id)||
    x.research_status!=="NAMED_FSSR_PRODUCT_STANDARD_FOUND_CTR_PENDING"||
    !x.clause||!/^https:\/\/(?:www\.|stg-old\.|foscos\.)?fssai\.gov\.in\//.test(x.source_url))return false;
  }else{
   gaps++;
   if(!pmsvB34Gaps.has(x.catalog_id)||x.clause!==null||x.source_url!==null||
    x.qa.length||x.research_status!=="CHEMICAL_FORMULA_OR_RECIPE_IDENTITY_STILL_PENDING")return false;
  }
  for(const q of x.qa){
   if(!q.name||!["maximum","minimum","greater_than"].includes(q.relation)||
    !Number.isFinite(q.value)||!q.unit||!q.basis||!q.scope)return false;
   quality++;
  }
 }
 const cocoa=d.cases.find(x=>x.catalog_id==="04-04-2-cocoa-beans");
 const fruit=d.cases.find(x=>x.catalog_id==="04-04-1-frozen-fruits-fruit-products");
 const arrow=d.cases.find(x=>x.catalog_id==="06-06-2-arrowroot");
 const child=d.cases.find(x=>x.catalog_id==="formulated-supplements-children");
 const egg=d.cases.find(x=>x.catalog_id==="10-10-2-egg-powder");
 return seen.size===16&&named===7&&gaps===9&&quality===9&&
 cocoa?.clause==="2.3.54"&&cocoa?.qa.length===5&&
 fruit?.qa[0]?.value===-18&&arrow?.qa.length===0&&
 child?.qa[0]?.relation==="greater_than"&&child?.qa[0]?.value===24&&
 egg?.clause==="2.5.3(3)"&&egg?.qa.length===0;
}
function pmsvB34Filtered(){
 if(!pmsvB34Valid())return [];
 const q=pmsvB34Query.trim().toLowerCase();
 return pmsvB34Data.cases.filter(x=>
  (pmsvB34Status==="ALL"||
    (pmsvB34Status==="NAMED"&&x.named_product_standard_found)||
    (pmsvB34Status==="GAPS"&&!x.named_product_standard_found))&&
  (!q||[x.catalog_id,x.product_name,x.clause||"",x.identity,x.next,x.primary_blocker,
   ...x.qa.map(v=>v.name)].some(s=>String(s).toLowerCase().includes(q))));
}
function pmsvB34Row(x){
 const e=pmsvB14Esc;
 return '<tr><td><b>'+e(x.product_name)+'</b><div><small>'+e(x.catalog_id)+'</small></div></td>'+
 '<td>'+(x.named_product_standard_found?
 '<b>Product standard found</b><div>FSSR '+e(x.clause)+'</div>':
 '<b>Not individually identified</b><div>Substance / recipe required</div>')+'</td>'+
 '<td>'+e(x.identity)+'</td><td>'+e(x.next)+'</td>'+
 '<td>'+(x.source_url?'<a href="'+e(x.source_url)+'" target="_blank" rel="noopener noreferrer">Official FSSAI source</a> ':'')+
 '<button type="button" data-pmsv-b34-open="'+e(x.catalog_id)+'">Open evidence</button></td></tr>';
}
function pmsvB34Dash(){
 if(!pmsvB34Valid())return "";
 return '<details class="card" id="pmsv-b34-remaining16-sources" style="margin-bottom:12px">'+
 '<summary><b>Batch34 · all 16 remaining identity cases</b> — 7 FSSR sources, 9 documentary blockers</summary>'+
 '<div class="notice"><b>Source found is NOT CTR approval.</b> All 35 exact finished-article contaminant source cases remain unresolved. No automatic metal/toxin limits, laboratory PASS, or WordPress production changes. Cocoa beans are not cocoa powder; frozen fruit is not frozen vegetables; arrowroot is not tapioca sago; egg powder is not frozen egg.</div>'+
 '<p><label>Find product, legal clause or action <input type="search" data-pmsv-b34-search placeholder="cocoa beans, arrowroot, enzyme, egg" /></label></p>'+
 '<p><label>Research classification <select data-pmsv-b34-status>'+
 '<option value="ALL">All 16</option><option value="NAMED">7 named FSSR product standards</option>'+
 '<option value="GAPS">9 still needing specific identity</option></select></label></p>'+
 '<p data-pmsv-b34-count>'+pmsvB34Filtered().length+' of 16 review dossiers; 0 CTR applicability sign-offs</p>'+
 '<div class="tablewrap" style="max-height:560px;overflow:auto"><table><thead><tr>'+
 '<th>Catalogue identity</th><th>Legal research status</th><th>Product scope</th>'+
 '<th>Specific missing evidence</th><th>Official source / inspect</th></tr></thead>'+
 '<tbody data-pmsv-b34-rows>'+pmsvB34Filtered().map(pmsvB34Row).join("")+'</tbody></table></div></details>';
}
function pmsvB34Refresh(){
 if(typeof document==="undefined"||!pmsvB34Valid())return;
 const host=document.getElementById("pmsv-b33-product-source-proof")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!host)return;
 let el=document.getElementById("pmsv-b34-remaining16-sources");
 if(!el){host.insertAdjacentHTML("beforebegin",pmsvB34Dash());return}
 const tbody=el.querySelector("[data-pmsv-b34-rows]");
 if(tbody)tbody.innerHTML=pmsvB34Filtered().map(pmsvB34Row).join("");
 const st=el.querySelector("[data-pmsv-b34-count]");
 if(st)st.textContent=pmsvB34Filtered().length+" of 16 source/identity dossiers; 35 legal CTR cases still pending.";
}
function pmsvB34Product(p){
 if(!p||!pmsvB34Valid())return "";
 const x=pmsvB34Data.cases.find(c=>c.catalog_id===p.id);
 if(!x||x.product_name!==p.name||
 String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))return "";
 const e=pmsvB14Esc;
 const qa=x.qa.length?'<div class="tablewrap"><table><thead><tr><th>FSSR quality or identity condition</th><th>Value</th><th>Applicable basis</th></tr></thead><tbody>'+
 x.qa.map(q=>'<tr><td>'+e(q.name)+'</td><td>'+
 (q.relation==="minimum"?"≥ ":q.relation==="maximum"?"≤ ":"> ")+e(q.value)+" "+e(q.unit)+
 '</td><td>'+e(q.basis)+" — "+e(q.scope)+'</td></tr>').join("")+
 '</tbody></table></div>':
 '<p>No source-validated transferable numeric criterion attached. Do not borrow adjacent variant figures.</p>';
 return '<details class="card" style="margin-top:12px"><summary>'+
 '<b>Batch34 · '+(x.named_product_standard_found?'FSSR '+e(x.clause)+' product identity':'source / recipe identity unresolved')+'</b> — contaminant scope pending</summary>'+
 '<p><b>Finished article:</b> '+e(x.identity)+'</p>'+qa+
 '<p><b>Documentary proof required:</b> '+e(x.next)+'</p>'+
 (x.source_url?'<p><a href="'+e(x.source_url)+'" rel="noopener noreferrer" target="_blank">Read official FSSAI source</a></p>':'')+
 (x.second_source_url?'<p><a href="'+e(x.second_source_url)+'" rel="noopener noreferrer" target="_blank">FoSCoS variant crosswalk (not original law)</a></p>':'')+
 '<div class="notice">This is research evidence only: actual lot identity, final CTR article selection, numeric contaminant limits, lab report and compliance PASS are NOT approved.</div></details>';
}
const pmsvB34OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB34OldLoad();pmsvB34Data=null;
 try{
  const r=await fetch(pmsvB34Path+"?v=20261016-b34",{cache:"reload"});
  if(!r.ok)throw Error("Batch34 remaining16 evidence unavailable");
  pmsvB34Data=await r.json();
  if(!pmsvB34Valid())throw Error("Batch34 catalogue/article integrity mismatch");
  pmsvB34Refresh();
 }catch(_){pmsvB34Data=null;}
};
const pmsvB34OldProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB34Product(p)+pmsvB34OldProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b34-search]")){
   pmsvB34Query=String(ev.target.value||"").slice(0,130);
   pmsvB34Refresh();
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b34-status]")){
   const v=ev.target.value;
   if(["ALL","NAMED","GAPS"].includes(v)){pmsvB34Status=v;pmsvB34Refresh();}
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b34-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b34-open"));
 });
}
