"use strict";
/* B42: fail-closed safety correction for contradictory FSSAI-hosted 09.xxx:2024 methods. */
var pmsvB42Data=null,pmsvB42Search="",pmsvB42View="ALL";
const pmsvB42Path="./data/rules/fssai-current35-dual-manual-method-conflict-batch42-2026-10-16.json";
const pmsvB42Expected="3ae26a20e1c30661";
const pmsvB42ConflictNotice="METHOD IDENTITY ON HOLD: Two FSSAI-hosted 2024 metals manuals assign different tests to the same method numbers 09.001 through 09.007. Require exact PDF title/URL, full test title, applicable adoption order, analyte, actual sample matrix, accredited laboratory scope and validated LOQ. No automatic method number, legal CTR limit or lot PASS.";
function pmsvB42Valid(){
 if(typeof pmsvB41Valid!=="function"||!pmsvB41Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB42Data||
 pmsvB14Digest(pmsvB42Data)!==pmsvB42Expected)return false;
 const d=pmsvB42Data,n=d.counts;
 if(d.schema_version!=="1.0"||
 d.kind!=="PMSV_CURRENT35_DUAL_OFFICIAL_TRACE_MANUAL_COLLISION_B42"||
 d.as_of!=="2026-10-16"||d.environment!=="GH_PAGES_PREVIEW_ONLY"||
 d.research_disposition!=="MANUAL_METHOD_IDENTITY_CONFLICT_NOT_A_FINAL_METHOD_SELECTION"||
 n?.catalogue!==533||n.conditional_first_source_matches!==498||
 n.exact_ctr_cases_pending!==35||n.method_ids_colliding_across_official_hosted_manuals!==7||
 n.additional_trace_only_method_numbers!==3||
 n.trace_metals_on_method_version_hold!==27||
 n.other_cases_on_compound_matrix_evidence_hold!==8||
 n.all_cases_touched!==35||n.linked_document_requests!==140||
 n.lab_request_rows_sanitized_on_export!==35||
 n.source_manually_selected_or_superseded!==false||
 n.legally_approved_ctr_articles!==0||n.real_laboratory_lot_passes!==0||
 n.wordpress_changed!==false||
 d.source_evidence?.length!==3||d.conflict_method_cards?.length!==7||
 d.one_sided_trace_method_cards?.length!==3||
 d.product_method_holds?.length!==35||
 d.control_rules?.length!==5||
 d.results?.master_ledger_unchanged!==true||
 d.results.existing_batch39_41_sources_preserved!==true||
 d.results.source_competition_unresolved!==true||
 d.results.csv_method_footnotes_required!==true||
 d.results.no_unqualified_method_id_in_exported_requests!==true||
 d.results.zero_current_ctr_approvals!==true||
 d.results.no_regulatory_pass!==true||
 d.results.wordpress_unchanged!==true||
 pmsv498Ledger?.records?.length!==533||
 pmsv498Ledger?.first_source_pending!==35)return false;
 const old="https://fssai.gov.in/upload/uploadfiles/files/MANUAL_FOR_ANALYSIS_OF_METALS_dt_18_04_2024.pdf";
 const newer="https://www.fssai.gov.in/upload/uploadfiles/files/Manual%20of%20Methods%20of%20Analysis%20of%20Foods-%20Metals%20and%20Minerals.pdf";
 if(d.source_evidence[0].url!==old||d.source_evidence[1].url!==newer||
 d.source_evidence[0].pdf_page_count!==61||
 d.source_evidence[1].pdf_page_count!==52||
 d.source_evidence[0].table_of_contents_pdf_page_zero_based!==1||
 d.source_evidence[1].table_of_contents_pdf_page_zero_based!==1)return false;
 for(let i=0;i<7;i++){
  const x=d.conflict_method_cards[i];
  if(x.method_number!=="FSSAI 09."+String(i+1).padStart(3,"0")+":2024"||
   x.trace_elements_manual?.url!==old||
   x.metals_and_minerals_manual?.url!==newer||
   x.trace_elements_manual.title===x.metals_and_minerals_manual.title||
   x.method_identity_consistent_across_manuals!==false||
   x.source_priority_established!==false||
   x.allow_method_number_only!==false||
   x.require_full_pdf_title_method_title_version_scope_and_lab_confirmation!==true)return false;
 }
 const oldCases=new Map(pmsvB41Data.packets.map(x=>[x.catalogue_id,x]));
 const seen=new Set();let metals=0,others=0;
 if(oldCases.size!==35)return false;
 for(const x of d.product_method_holds){
  const p=oldCases.get(x.catalog_id);
  if(!p||seen.has(x.catalog_id)||x.rank!==p.rank||
   x.product_name!==p.product_name||x.fssr!==p.fssr||x.fcs!==p.fcs||
   x.analyte!==p.reviewed_analyte||x.analyte_family!==p.analyte_family||
   x.catalogue_priority!==p.case_priority||
   x.four_request_ids?.length!==4||
   x.four_request_ids.some((v,i)=>v!==p.workstreams[i].request_id)||
   x.manual_version_confirmed!==false||
   x.applicable_manual_adoption_order_verified!==false||
   x.laboratory_method_and_scope_verified!==false||
   x.commercial_sample_tested!==false||
   x.legal_ctr_article_pass!==false||!x.hold_reason)return false;
  seen.add(x.catalog_id);
  if(x.analyte_family==="TRACE_METALS"){
   metals++;
   if(x.hold!=="MANUAL_METHOD_NUMBER_CONFLICT_HOLD"||
    x.old_manual_source_url!==old||x.second_official_hosted_manual_source_url!==newer)return false;
  }else{
   others++;
   if(x.hold!=="MATRIX_AND_COMPOUND_DOCUMENTARY_HOLD")return false;
  }
 }
 return seen.size===35&&metals===27&&others===8&&d.one_sided_trace_method_cards.every(x=>
 x.requires_independent_current_adoption_verification===true);
}
/* Sanitize all exports and all draft copy text, including legacy Batch41 templates. */
function pmsvB42Scrub(value){
 let s=String(value==null?"":value);
 s=s.replace(/FSSAI_09_\d{3}_2024/g,"[conflicted 2024 FSSAI method code; verify both source PDFs]");
 s=s.replace(/\bFSSAI\s+09\.\d{3}:2024\b/g,"[conflicted 2024 FSSAI method code; verify both source PDFs]");
 s=s.replace(/\b09\.\d{3}(?::2024)?\b/g,"[conflicted 2024 method ID; request full original source title]");
 return s;
}
function pmsvB42SanitizeRequests(rows){
 if(!pmsvB42Valid())return [];
 return rows.map(r=>{
  const o={...r};
  for(const key of ["request_summary","required_evidence","sample_matrix","method_candidate_or_validation_note","completion_definition"]){
   o[key]=pmsvB42Scrub(o[key]);
  }
  if(o.workstream==="LAB_METHOD_AND_SCOPE"){
   o.method_candidate_or_validation_note="UNRESOLVED FSSAI 2024 METHOD-NUMBER COLLISION: method number only is not an instruction. Require both official source PDFs, full procedure title, formal source-priority/adoption evidence, target analyte, matrix, lab scope and validated LOQ.";
   o.required_evidence+=" Provide both FSSAI-hosted 2024 manuals or relevant official method adoption order and expressly identify which full PDF and method title the laboratory used. Ambiguous method numbers are quarantined.";
  }
  return o;
 });
}
const pmsvB42OldCSV=pmsvB41CSV;
pmsvB41CSV=function(rows){return pmsvB42Valid()?pmsvB42OldCSV(pmsvB42SanitizeRequests(rows)):""};
const pmsvB42OldRequestText=pmsvB41RequestText;
pmsvB41RequestText=function(row){
 if(!pmsvB42Valid())return "BLOCKED: Official method-version cross-check unavailable. Do not send laboratory method number requests.";
 const safe=pmsvB42SanitizeRequests([row])[0];
 return pmsvB42OldRequestText(safe)+"\n\n"+pmsvB42ConflictNotice;
};
const pmsvB42OldExport=pmsvB41Export;
pmsvB41Export=function(which){if(!pmsvB42Valid())return;return pmsvB42OldExport(which)};
const pmsvB42OldCopy=pmsvB41Copy;
pmsvB41Copy=async function(id){if(!pmsvB42Valid())return;return pmsvB42OldCopy(id)};
const pmsvB42OldB41Rows=pmsvB41Rows;
pmsvB41Rows=function(){
 if(!pmsvB42Valid())return "<tr><td colspan='5'>Method identity audit must load before evidence requests are displayed.</td></tr>";
 const raw=pmsvB42OldB41Rows();
 return raw.replace(/FSSAI_09_\d{3}_2024|\b09\.\d{3}(?::2024)?\b/g,"[method-code conflict]");
};
const pmsvB42OldB41Detail=pmsvB41Detail;
pmsvB41Detail=function(){
 if(!pmsvB42Valid())return "Await method identity source cross-check.";
 return pmsvB42OldB41Detail().replace(/FSSAI_09_\d{3}_2024|\b09\.\d{3}(?::2024)?\b/g,"[method-code conflict]");
};
/* Historical source panel still exists in code/data for verification, but the UI is deliberately
 * quarantined so obsolete/conflicting source numbers cannot be read as an approved recipe. */
pmsvB39Product=function(p){
 if(!p||!pmsvB39Valid())return "";
 const r=pmsvB39Data.case_gates.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name)return "";
 return '<div class="notice"><b>Batch39 historical method suggestions quarantined by Batch42:</b> the same 2024 numbers identify different procedures in two FSSAI-hosted manuals. Check the Batch42 dual-source analysis and obtain signed source-version confirmation. No method or lot PASS.</div>';
};
function pmsvB42Rows(){
 if(!pmsvB42Valid())return [];
 const q=pmsvB42Search.toLowerCase().trim();
 return pmsvB42Data.product_method_holds.filter(x=>
 (pmsvB42View==="ALL"||
 (pmsvB42View==="METALS"&&x.hold==="MANUAL_METHOD_NUMBER_CONFLICT_HOLD")||
 (pmsvB42View==="OTHER"&&x.hold==="MATRIX_AND_COMPOUND_DOCUMENTARY_HOLD"))&&
 (!q||[x.catalog_id,x.product_name,x.analyte,x.hold_reason,...x.four_request_ids].some(y=>
 String(y).toLowerCase().includes(q))));
}
function pmsvB42Panel(){
 if(!pmsvB42Valid())return "";
 const e=pmsvB14Esc,d=pmsvB42Data;
 const old=d.source_evidence[0],newer=d.source_evidence[1];
 return '<details class="card" open id="pmsv-b42-dual-manual-conflict" style="margin-bottom:12px">'+
 '<summary><b>Batch42 · FSSAI method-number collision and 27 metal-case holds</b> — 7 conflicting 2024 IDs</summary>'+
 '<div class="notice"><b>CRITICAL SOURCE CORRECTION:</b> '+e(pmsvB42ConflictNotice)+
 ' Historical Batch39 method suggestions are quarantined; Batch41 CSV and draft texts are sanitized on export/copy, without changing the canonical source datasets. The currently operative FSSAI manual precedence is NOT yet proven.</div>'+
 '<p><a href="'+e(old.url)+'" target="_blank" rel="noopener noreferrer">FSSAI 61-page Trace Elements manual</a> · '+
 '<a href="'+e(newer.url)+'" target="_blank" rel="noopener noreferrer">FSSAI 52-page Metals and Minerals manual</a> · '+
 '<a href="'+e(d.source_evidence[2].url)+'" target="_blank" rel="noopener noreferrer">Official methods index</a></p>'+
 '<details><summary><b>Compare all seven conflicting method IDs</b></summary>'+
 '<div class="tablewrap"><table><thead><tr><th>Shared 2024 number</th><th>61-page Trace Elements PDF</th><th>52-page Metals & Minerals PDF</th></tr></thead>'+
 '<tbody>'+d.conflict_method_cards.map(x=>'<tr><td><b>'+e(x.method_number)+'</b></td>'+
 '<td>'+e(x.trace_elements_manual.title)+'</td><td>'+e(x.metals_and_minerals_manual.title)+'</td></tr>').join("")+'</tbody></table></div></details>'+
 '<p><label>Search cases <input type="search" data-pmsv-b42-search placeholder="cocoa, water, lead, polyol, Misri" /></label></p>'+
 '<p><label>Hold class <select data-pmsv-b42-view>'+
 '<option value="ALL">All 35 source identity checks</option>'+
 '<option value="METALS">27 metal method-version holds</option>'+
 '<option value="OTHER">8 other substance/matrix holds</option>'+
 '</select></label></p>'+
 '<p data-pmsv-b42-count>'+pmsvB42Rows().length+' of 35 pending</p>'+
 '<div class="tablewrap" style="max-height:450px;overflow:auto"><table><thead><tr><th>Product</th><th>Analyte</th><th>Risk</th><th>Required proof</th></tr></thead>'+
 '<tbody data-pmsv-b42-rows>'+pmsvB42Rows().map(x=>'<tr><td><b>'+e(x.product_name)+'</b></td>'+
 '<td>'+e(x.analyte)+'</td><td>'+e(x.hold==="MANUAL_METHOD_NUMBER_CONFLICT_HOLD"?"Method identity collision":"Compound / matrix unverified")+'</td>'+
 '<td>'+e(x.hold_reason)+'</td></tr>').join("")+'</tbody></table></div></details>';
}
function pmsvB42Refresh(){
 if(typeof document==="undefined"||!pmsvB42Valid())return;
 const old=document.getElementById("pmsv-b39-method-exceptions");
 if(old)old.remove();
 const host=document.getElementById("pmsv-b41-documentary-handoff")||
 document.getElementById("pmsv-b40-current35-source-contrast")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!host)return;
 let el=document.getElementById("pmsv-b42-dual-manual-conflict");
 if(!el){host.insertAdjacentHTML("beforebegin",pmsvB42Panel());el=document.getElementById("pmsv-b42-dual-manual-conflict")}
 if(!el)return;
 const tbody=el.querySelector("[data-pmsv-b42-rows]"),count=el.querySelector("[data-pmsv-b42-count]");
 const e=pmsvB14Esc;
 if(tbody)tbody.innerHTML=pmsvB42Rows().map(x=>'<tr><td><b>'+e(x.product_name)+'</b></td><td>'+e(x.analyte)+'</td>'+
 '<td>'+e(x.hold==="MANUAL_METHOD_NUMBER_CONFLICT_HOLD"?"Method identity collision":"Compound / matrix unverified")+'</td>'+
 '<td>'+e(x.hold_reason)+'</td></tr>').join("");
 if(count)count.textContent=pmsvB42Rows().length+" of 35 unapproved method/source dossiers";
 if(typeof pmsvB41Refresh==="function")pmsvB41Refresh();
}
function pmsvB42Product(p){
 if(!p||!pmsvB42Valid())return "";
 const x=pmsvB42Data.product_method_holds.find(r=>r.catalog_id===p.id);
 if(!x||x.product_name!==p.name)return "";
 const e=pmsvB14Esc;
 return '<details class="card" open style="margin-top:12px"><summary><b>Batch42 · '+e(x.hold)+
 '</b></summary><div class="notice">'+e(x.hold_reason)+'</div>'+
 '<p><b>Linked unsent requests:</b> '+x.four_request_ids.map(e).join(", ")+'</p>'+
 '<p><a href="'+e(pmsvB42Data.source_evidence[0].url)+'" target="_blank" rel="noopener noreferrer">Trace Elements manual</a> · '+
 '<a href="'+e(pmsvB42Data.source_evidence[1].url)+'" target="_blank" rel="noopener noreferrer">Metals and Minerals manual</a></p>'+
 '<div class="notice">Method version unconfirmed. No original laboratory report, legal CTR article signoff, or finished lot PASS.</div></details>';
}
const pmsvB42OldLoader=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB42OldLoader();pmsvB42Data=null;
 try{
  const r=await fetch(pmsvB42Path+"?v=20261016-b42",{cache:"reload"});
  if(!r.ok)throw Error("Dual-manual source conflict register unavailable");
  pmsvB42Data=await r.json();
  if(!pmsvB42Valid())throw Error("Dual manual conflict or upstream ledger integrity mismatch");
  pmsvB42Refresh();
 }catch(_){pmsvB42Data=null;}
};
const pmsvB42OldProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB42Product(p)+pmsvB42OldProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b42-search]")){pmsvB42Search=String(ev.target.value||"").slice(0,130);pmsvB42Refresh()}
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b42-view]")&&["ALL","METALS","OTHER"].includes(ev.target.value)){
   pmsvB42View=ev.target.value;pmsvB42Refresh()
  }
 });
}
