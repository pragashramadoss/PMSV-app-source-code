"use strict";
/* Batch39: verified analytical manual scope gates; NO method approval or CTR PASS. */
var pmsvB39Data=null,pmsvB39Query="",pmsvB39Filter="ALL";
const pmsvB39Path="./data/rules/fssai-current35-method-scope-exceptions-batch39-2026-10-16.json";
const pmsvB39Expected="a2d60cc030180bfb";
function pmsvB39Valid(){
 if(typeof pmsvB38Valid!=="function"||!pmsvB38Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB39Data||
 pmsvB14Digest(pmsvB39Data)!==pmsvB39Expected)return false;
 const d=pmsvB39Data,n=d.counts,prior=pmsvB38Data.evidence_packets;
 if(d.schema_version!=="1.0"||d.kind!=="PMSV_CURRENT35_ANALYTICAL_METHOD_SCOPE_EXCEPTIONS_BATCH39"||
 d.as_of!=="2026-10-16"||d.deployment!=="GITHUB_PAGES_PREVIEW_ONLY"||
 n?.catalogue!==533||n.conditional_first_source_matches!==498||
 n.exact_ctr_cases_pending!==35||n.screened_analytical_packets!==35||
 n.metal_records!==27||n.other_records!==8||
 n.specific_exception_records!==13||n.generic_method_validation_records!==22||
 n.verified_primary_method_cards!==5||
 n.method_select_approved!==0||n.legal_ctr_approvals!==0||
 n.lot_laboratory_passes!==0||n.wordpress_changed!==false||
 d.results?.canonical_ledger_unchanged!==true||
 d.results.b38_packet_count_retained!==35||d.results.method_approvals_auto_added!==0||
 d.results.legal_scope_pass_auto_added!==0||d.results.actual_lot_pass_auto_added!==0||
 d.results.wordpress_unchanged!==true||
 d.source_provenance?.scope_checked!==true||
 d.source_provenance.all_lab_results_unknown!==true||
 d.source_provenance.source_is_not_product_ctr_approval!==true||
 d.method_cards?.length!==5||d.case_gates?.length!==35||
 d.key_conclusions?.length!==5||prior.length!==35||
 pmsv498Ledger?.records?.length!==533||pmsv498Ledger.first_source_pending!==35)return false;
 const methodIds=new Set(d.method_cards.map(x=>x.id));
 if(methodIds.size!==5||!["FSSAI_09_001_2024","FSSAI_09_003_2024","FSSAI_09_005_2024","FSSAI_09_006_2024","FSSAI_0_010_2023"].every(x=>methodIds.has(x)))return false;
 const m1=d.method_cards.find(x=>x.id==="FSSAI_09_001_2024");
 const m5=d.method_cards.find(x=>x.id==="FSSAI_09_005_2024");
 const m6=d.method_cards.find(x=>x.id==="FSSAI_09_006_2024");
 if(m1?.documented_approx_capability_mg_per_kg?.Lead!==0.4||
 m1.documented_approx_capability_mg_per_kg.Copper!==3||
 !m1.exclusions.includes("Fat content >=40%")||
 !m1.exclusions.includes("Milk powder")||
 m5?.documented_approx_capability_mg_per_kg?.Lead!==0.04||
 !m6?.matrix_scope.includes("nickel and tellurium are internal standards")||
 m6.target_analytes.includes("Nickel")||
 d.method_cards.some(x=>x.source_pdf!==d.official_primary_manual||
 x.primary_text_and_page_verified!==true||
 x.capability_is_not_verified_lab_loq!==true||
 x.automatic_method_assignment!==false||
 x.actual_lab_validation_confirmed!==false))return false;
 const previous=new Map(prior.map(x=>[x.catalog_id,x])),seen=new Set();
 let special=0,metal=0;
 for(const c of d.case_gates){
  const v=previous.get(c.catalog_id);
  if(!v||seen.has(c.catalog_id)||
   c.rank!==v.rank||c.product_name!==v.product_name||
   c.fssr!==v.fssr||c.fcs!==v.fcs||
   c.reviewed_analyte!==v.reviewed_analyte||
   c.analyte_family!==v.analyte_family||
   c.prior_blocker!==v.primary_blocker||
   c.source_ctr_comparator!==v.prior_ctr_comparator||
   c.check_tags?.length<1||!c.specific_reason||
   c.lab_request?.length!==5||
   c.method_candidate_not_approval!==true||
   c.candidate_method_ids_for_manual_check_only?.some(id=>!methodIds.has(id)||id==="FSSAI_09_006_2024")||
   c.marketed_matrix_documents_received!==false||
   c.legal_article_approved!==false||c.method_selected_and_validated!==false||
   c.measured_quantitative_result_entered!==false||c.regulatory_pass!==false)return false;
  seen.add(c.catalog_id);
  if(c.analyte_family==="TRACE_METALS")metal++;
  if(c.focus==="MATRIX_METHOD_EXCEPTION_OR_LEGAL_CATEGORY")special++;
  else if(c.focus!=="STANDARD_METHOD_VALIDATION_STILL_REQUIRED")return false;
  if(c.analyte_family!=="TRACE_METALS"&&c.candidate_method_ids_for_manual_check_only.length)return false;
 }
 const nickel=d.case_gates.find(c=>c.catalog_id.startsWith("11-11-6-polyols")),
 cocoa=d.case_gates.find(c=>c.catalog_id.includes("cocoa-mass-or-cocoa")),
 misri=d.case_gates.find(c=>c.catalog_id==="11-11-1-misri");
 return seen.size===35&&metal===27&&special===13&&
 nickel?.check_tags.includes("NICKEL_INTERNAL_STANDARD_TRAP")&&
 nickel?.candidate_method_ids_for_manual_check_only.length===1&&
 cocoa?.check_tags.includes("POTENTIAL_HIGH_FAT")&&
 misri?.check_tags.includes("CHROMIUM_SCOPE_NOT_MISRI");
}
function pmsvB39Filtered(){
 if(!pmsvB39Valid())return [];
 const q=pmsvB39Query.toLowerCase().trim();
 return pmsvB39Data.case_gates.filter(x=>
 (pmsvB39Filter==="ALL"||
 (pmsvB39Filter==="SPECIAL"&&x.focus==="MATRIX_METHOD_EXCEPTION_OR_LEGAL_CATEGORY")||
 (pmsvB39Filter==="ROUTINE"&&x.focus==="STANDARD_METHOD_VALIDATION_STILL_REQUIRED")||
 (pmsvB39Filter==="METALS"&&x.analyte_family==="TRACE_METALS"))&&
 (!q||[x.product_name,x.catalog_id,x.reviewed_analyte,x.specific_reason,
 x.analyte_family,...x.check_tags].some(y=>String(y).toLowerCase().includes(q))));
}
function pmsvB39Row(x){
 const e=pmsvB14Esc;
 return '<tr><td><b>'+e(x.product_name)+'</b></td><td>'+e(x.reviewed_analyte)+'</td>'+
 '<td>'+e(x.focus==="MATRIX_METHOD_EXCEPTION_OR_LEGAL_CATEGORY"?
 "Specific method/scope exception":"Matrix and sensitivity check")+'</td>'+
 '<td>'+e(x.specific_reason)+'</td>'+
 '<td><button type="button" data-pmsv-b39-open="'+e(x.catalog_id)+'">Evidence</button></td></tr>';
}
function pmsvB39Panel(){
 if(!pmsvB39Valid())return "";
 const d=pmsvB39Data,e=pmsvB14Esc;
 return '<details class="card" id="pmsv-b39-method-exceptions" style="margin-bottom:12px">'+
 '<summary><b>Batch39 · 35 method-scope and LOQ gates</b> — 13 specific exclusions / 5 official methods</summary>'+
 '<div class="notice"><b>Important:</b> Published FSSAI method sensitivity is not a lab-validated LOQ or contaminant limit. Method 09.001 excludes foods with at least 40% fat and milk powder; 09.006 uses nickel as an internal standard, not as a nickel result. No original lot results, method validations or legal CTR assignments are confirmed.</div>'+
 '<p><a href="'+e(d.official_primary_manual)+'" target="_blank" rel="noopener noreferrer">Read the official 2024 FSSAI trace elements method manual</a></p>'+
 '<details><summary><b>Five verified primary method scope cards</b></summary><ol>'+
 d.method_cards.map(x=>'<li><b>'+e(x.method_no)+'</b>: '+e(x.matrix_scope)+
 ' <a href="'+e(x.source_pdf)+'#page='+String(x.manual_page_zero_based+1)+'" target="_blank" rel="noopener noreferrer">Official manual page</a></li>').join("")+
 '</ol></details>'+
 '<p><label>Search commodity/analyte <input type="search" data-pmsv-b39-query placeholder="cocoa, Misri, nickel, polyols, milk, fat" /></label></p>'+
 '<p><label>Scope review <select data-pmsv-b39-filter><option value="ALL">All 35</option>'+
 '<option value="SPECIAL">13 specific exceptions</option>'+
 '<option value="ROUTINE">22 routine evidence gates</option>'+
 '<option value="METALS">27 trace metals screens</option>'+
 '</select></label></p>'+
 '<p data-pmsv-b39-count>'+pmsvB39Filtered().length+' of 35 reviewed, zero method approvals</p>'+
 '<div class="tablewrap" style="max-height:580px;overflow:auto"><table><thead><tr>'+
 '<th>Catalogue product</th><th>Analyte</th><th>Priority</th><th>Source-specific block</th><th>Review</th></tr></thead>'+
 '<tbody data-pmsv-b39-rows>'+pmsvB39Filtered().map(pmsvB39Row).join("")+'</tbody></table></div></details>';
}
function pmsvB39Refresh(){
 if(typeof document==="undefined"||!pmsvB39Valid())return;
 const host=document.getElementById("pmsv-b38-evidence-packets")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!host)return;
 const node=document.getElementById("pmsv-b39-method-exceptions");
 if(!node){host.insertAdjacentHTML("beforebegin",pmsvB39Panel());return}
 const body=node.querySelector("[data-pmsv-b39-rows]"),stat=node.querySelector("[data-pmsv-b39-count]");
 if(body)body.innerHTML=pmsvB39Filtered().map(pmsvB39Row).join("");
 if(stat)stat.textContent=pmsvB39Filtered().length+" of 35 pending; zero automatic method/CTR approvals.";
}
function pmsvB39Product(p){
 if(!p||!pmsvB39Valid())return "";
 const r=pmsvB39Data.case_gates.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||
 String(r.fssr||"")!==String(p.fssr||"")||
 String(r.fcs||"")!==String(p.fcs||""))return "";
 const e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px"><summary><b>Batch39 · '+e(r.reviewed_analyte)+
 ' analytical scope gate</b></summary>'+
 '<p><b>Specific unresolved issue:</b> '+e(r.specific_reason)+'</p>'+
 '<p><b>Candidate published methods to investigate, not approved:</b> '+
 (r.candidate_method_ids_for_manual_check_only.length?
 r.candidate_method_ids_for_manual_check_only.map(e).join(", "):"Exact substance-specific method not identified")+'</p>'+
 '<p><b>Lab / legal evidence required:</b></p><ol>'+
 r.lab_request.map(y=>'<li>'+e(y)+'</li>').join("")+'</ol>'+
 '<p><a href="'+e(r.official_method_index)+'" target="_blank" rel="noopener noreferrer">FSSAI method manuals index</a></p>'+
 '<div class="notice">No method selection, actual LOQ, legal finished article, quantitative lot result or regulatory PASS approved. Do not treat method sensitivity as a legal limit.</div></details>';
}
const pmsvB39PreviousLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB39PreviousLoad();pmsvB39Data=null;
 try{
  const r=await fetch(pmsvB39Path+"?v=20261016-b39",{cache:"reload"});
  if(!r.ok)throw Error("B39 source manual exception register unavailable");
  pmsvB39Data=await r.json();
  if(!pmsvB39Valid())throw Error("B39 official scope/integrity failed");
  pmsvB39Refresh();
 }catch(_){pmsvB39Data=null;}
};
const pmsvB39OldProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB39Product(p)+pmsvB39OldProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b39-query]")){
   pmsvB39Query=String(ev.target.value||"").slice(0,130);pmsvB39Refresh();
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b39-filter]")&&
   ["ALL","SPECIAL","ROUTINE","METALS"].includes(ev.target.value)){
   pmsvB39Filter=ev.target.value;pmsvB39Refresh();
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b39-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b39-open"));
 });
}
