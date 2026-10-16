"use strict";
/* Batch43: primary FSSAI signed June2024 letter proves 52p Metals & Minerals file
   was distributed for consultation BEFORE finalisation, not final adoption.
   A later order may exist; no assertion of permanent invalidity. */
var pmsvB43Data=null,pmsvB43Query="",pmsvB43Group="ALL";
const pmsvB43Path="./data/rules/fssai-current35-metals-consultation-provenance-batch43-2026-10-16.json";
const pmsvB43DigestExpected="08049182550dbc31";
const pmsvB43StatusCodes=["AMBIGUOUS_FSSAI_2024_METHOD_NUMBER","NO_METALS_NUMBER_AUTOMATICALLY_SELECTED"];
function pmsvB43Valid(){
 if(typeof pmsvB42Valid!=="function"||!pmsvB42Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB43Data||
 pmsvB14Digest(pmsvB43Data)!==pmsvB43DigestExpected)return false;
 const d=pmsvB43Data,n=d.counts;
 if(d.schema_version!=="1.0"||
 d.kind!=="PMSV_CURRENT35_FSSAI_MANUAL_PUBLIC_CONSULTATION_PROVENANCE_BATCH43"||
 d.as_of!=="2026-10-16"||d.environment!=="GH_PAGES_PREVIEW_ONLY"||
 d.status_2024_publication_of_52_page_manual!=="PANEL_APPROVED_FOR_PUBLIC_COMMENT_BEFORE_FINALISATION"||
 d.status_2026_10_16_52_page_final_adoption!=="NOT_ESTABLISHED_BY_REVIEWED_SOURCES"||
 d.status_2026_10_16_61_page_operational_precedence!=="NOT_ESTABLISHED_BY_REVIEWED_SOURCES"||
 d.manual_priority_auto_selected!==false||
 n?.catalogue!==533||n.conditional_first_source_matches!==498||
 n.pending_ctr_cases!==35||n.colliding_2024_method_numbers!==7||
 n.consultation_2024_manual_pages!==52||n.separate_trace_manual_pages!==61||
 n.manual_source_status_classifications!==2||
 n.primary_official_provenance_checks!==5||
 n.unresolved_finalisation_adoption_decisions!==2||
 n.metals_cases_kept_on_hold!==27||
 n.nonmetal_cases_kept_on_hold!==8||
 n.existing_document_requests_guarded!==140||
 n.laboratory_method_requests_requiring_addendum!==35||
 n.specific_metals_notice_requests!==27||
 n.actual_outreach_sent!==0||
 n.formal_lab_method_adoptions_verified!==0||
 n.legal_ctr_article_approvals!==0||n.real_lab_lot_passes!==0||
 n.wordpress_changed!==false||
 d.primary_source_chain?.length!==5||
 d.colliding_method_ids?.length!==7||
 d.closure_evidence_requirements?.length!==6||
 d.affected_cases?.length!==35||
 d.controls?.length!==5||
 d.results?.baseline_533_498_35_unchanged!==true||
 d.results.b42_conflict_still_applies!==true||
 d.results.historical_data_unedited!==true||
 d.results.consultation_publication_status_evidence_added!==true||
 d.results.final_adoption_not_yet_proved!==true||
 d.results.no_lab_number_approvals!==true||
 d.results.no_automatic_compliance_pass!==true||
 d.results.wordpress_untouched!==true||
 d.csv_export_amendment?.original_rows_and_csv_schema_preserved!==true||
 d.csv_export_amendment.all_request_statuses_remain_unsent!==true||
 pmsv498Ledger?.records?.length!==533||pmsv498Ledger.first_source_pending!==35)return false;
 const notice="https://fssai.gov.in/upload/uploadfiles/files/Notice%20for%20comments_26062024.pdf";
 const refs=d.primary_source_chain;
 if(refs[0].url!==notice||refs[0].page!==1||
 !refs[0].exact_key_meaning.includes("BEFORE_FINALISATION")&&
 !refs[0].exact_key_meaning.includes("before its finalisation")||
 refs[0].verified_primary_pdf!==true||
 refs[1].verified_official_listing!==true||
 refs[2].url!==pmsvB42Data.source_evidence[1].url||
 refs[3].url!==pmsvB42Data.source_evidence[0].url||
 refs[4].url!=="https://www.fssai.gov.in/food-testing/manuals-methods-analysis"||
 d.csv_export_amendment.source_notice!==notice||
 !d.csv_export_amendment.proposed_lab_method_disclaimer.includes("before finalisation"))return false;
 for(let i=0;i<7;i++){
  const z=d.colliding_method_ids[i],old=pmsvB42Data.conflict_method_cards[i];
  if(z.method_number!==old.method_number||
   z.consultation_52p_name!==old.metals_and_minerals_manual.title||
   z.trace_61p_name!==old.trace_elements_manual.title||
   z.consultation_source_url!==refs[2].url||
   z.standalone_trace_source_url!==refs[3].url||
   z.fssai_consultation_notice!==notice||
   z.consultation_classification_proven_as_at_2024_06_26!==true||
   z.consultation_manual_adopted_after_2024!==null||
   z.consultation_manual_adoption_status_after_2024!=="UNKNOWN_NOT_VERIFIED"||
   z.source_supersession_resolved!==false||z.per_lab_approved_method!==false)return false;
 }
 const refCases=new Map(pmsvB42Data.product_method_holds.map(x=>[x.catalog_id,x]));
 const seen=new Set();let metals=0,other=0;
 for(const c of d.affected_cases){
  const v=refCases.get(c.catalog_id);
  if(!v||seen.has(c.catalog_id)||
   c.rank!==v.rank||c.product_name!==v.product_name||
   c.analyte!==v.analyte||c.family!==v.analyte_family||
   c.fssr!==v.fssr||c.fcs!==v.fcs||
   c.existing_hold!==v.hold||c.case_priority!==v.catalogue_priority||
   !pmsvB43StatusCodes.includes(c.consultation_source_relevance)||
   c.linked_four_request_ids?.length!==4||
   c.linked_four_request_ids.some((x,i)=>x!==v.four_request_ids[i])||
   c.lab_scope_confirmation_needed!==true||
   c.consultation_stage_record_proven!==true||
   c.finalised_consultation_attachment_proven!==false||
   c.trace_manual_approved_current_for_case!==false||
   c.actual_lab_method_verified!==false||
   c.ctr_legal_article_signed!==false||
   c.real_lot_approved!==false||
   c.request_draft_not_sent!==true)return false;
  seen.add(c.catalog_id);
  if(c.family==="TRACE_METALS"){metals++;if(c.consultation_source_relevance!==pmsvB43StatusCodes[0])return false}
  else{other++;if(c.consultation_source_relevance!==pmsvB43StatusCodes[1])return false}
 }
 return seen.size===35&&metals===27&&other===8;
}
function pmsvB43Cases(){
 if(!pmsvB43Valid())return [];
 const q=pmsvB43Query.toLowerCase().trim();
 return pmsvB43Data.affected_cases.filter(c=>
 (pmsvB43Group==="ALL"||c.family===pmsvB43Group)&&
 (!q||[c.catalog_id,c.product_name,c.analyte,c.statement_for_lab].some(s=>String(s).toLowerCase().includes(q))));
}
function pmsvB43Panel(){
 if(!pmsvB43Valid())return "";
 const d=pmsvB43Data,e=pmsvB14Esc;
 return '<details class="card" open id="pmsv-b43-consultation-provenance" style="margin-bottom:12px">'+
 '<summary><b>Batch43 · Primary proof of FSSAI 2024 metals-manual consultation status</b> — 27 method holds protected</summary>'+
 '<div class="notice"><b>Important source-status correction:</b> On 26 June 2024 FSSAI published the 52-page Metals & Minerals manual for public comments BEFORE finalisation. Its subsequent adoption is <b>not established</b> by the sources reviewed. The separately hosted 61-page Trace Elements manual has different 2024 method-number assignments, but its operational precedence is also unconfirmed. Neither source can be auto-selected. No CTR/legal or actual laboratory PASS.</div>'+
 '<p><a href="'+e(d.primary_source_chain[0].url)+'" target="_blank" rel="noopener noreferrer">Signed FSSAI public consultation notice (page 1)</a> · '+
 '<a href="'+e(d.primary_source_chain[1].url)+'" target="_blank" rel="noopener noreferrer">FSSAI consultation listings</a> · '+
 '<a href="'+e(d.primary_source_chain[2].url)+'" target="_blank" rel="noopener noreferrer">52-page consultation attachment</a> · '+
 '<a href="'+e(d.primary_source_chain[3].url)+'" target="_blank" rel="noopener noreferrer">61-page Trace Elements manual</a></p>'+
 '<details><summary><b>What official documentary evidence is still needed?</b> (6 requests)</summary>'+
 '<ol>'+d.closure_evidence_requirements.map(z=>'<li><b>'+e(z.owner_role.replaceAll("_"," "))+'</b>: '+
 e(z.needed)+' <a href="'+e(z.public_source)+'" target="_blank" rel="noopener noreferrer">Source</a></li>').join("")+'</ol></details>'+
 '<details><summary><b>Seven conflicting method codes and their publication status</b></summary>'+
 '<div class="tablewrap"><table><thead><tr><th>Method number</th><th>52-page consultation attachment</th><th>61-page independent hosted source</th><th>Regulatory status</th></tr></thead><tbody>'+
 d.colliding_method_ids.map(x=>'<tr><td><b>'+e(x.method_number)+'</b></td>'+
 '<td>'+e(x.consultation_52p_name)+'</td><td>'+e(x.trace_61p_name)+'</td>'+
 '<td>52p issued for comments; later adoption unverified</td></tr>').join("")+
 '</tbody></table></div></details>'+
 '<p><label>Search commodity / analyte <input type="search" data-pmsv-b43-search placeholder="cocoa, milk, Misri, lead, nickel" /></label></p>'+
 '<p><label>Method/commodity group <select data-pmsv-b43-group>'+
 '<option value="ALL">All 35 cases</option>'+
 '<option value="TRACE_METALS">27 trace-metal cases</option>'+
 '<option value="NONMETAL">8 non-metal cases</option>'+
 '</select></label></p>'+
 '<p data-pmsv-b43-count>'+pmsvB43Cases().length+' of 35 on documentary hold</p>'+
 '<div class="tablewrap" style="max-height:500px;overflow:auto"><table><thead>'+
 '<tr><th>Product</th><th>Analyte</th><th>Documentary hold</th><th>Evidence ask</th></tr></thead>'+
 '<tbody data-pmsv-b43-rows>'+pmsvB43RowHtml()+'</tbody></table></div>'+
 '<div class="notice">Batch41 CSV/clipboard exports now carry the FSSAI consultation provenance warning in all 35 laboratory-method requests. Nothing is sent automatically.</div></details>';
}
function pmsvB43RowHtml(){
 if(!pmsvB43Valid())return "";
 const e=pmsvB14Esc;
 return pmsvB43Cases().map(x=>'<tr><td><b>'+e(x.product_name)+'</b></td><td>'+e(x.analyte)+'</td>'+
 '<td>'+e(x.family==="TRACE_METALS"?"Official method-number consultation / version":"Specific chemical/matrix identity")+'</td>'+
 '<td>'+e(x.statement_for_lab)+'</td></tr>').join("");
}
function pmsvB43Refresh(){
 if(typeof document==="undefined"||!pmsvB43Valid())return;
 const host=document.getElementById("pmsv-b42-dual-manual-conflict")||
 document.getElementById("pmsv-b41-documentary-handoff")||
 document.getElementById("pmsv-b14-review-index");
 if(!host)return;
 let panel=document.getElementById("pmsv-b43-consultation-provenance");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB43Panel());panel=document.getElementById("pmsv-b43-consultation-provenance")}
 if(!panel)return;
 const body=panel.querySelector("[data-pmsv-b43-rows]"),count=panel.querySelector("[data-pmsv-b43-count]");
 if(body)body.innerHTML=pmsvB43RowHtml();
 if(count)count.textContent=pmsvB43Cases().length+" pending evidence cases; zero approved laboratory methods.";
}
const pmsvB43OldCSV=pmsvB41CSV;
pmsvB41CSV=function(rows){
 if(!pmsvB43Valid())return "";
 const disclaimer=pmsvB43Data.csv_export_amendment.proposed_lab_method_disclaimer;
 const adjusted=rows.map(r=>{
  if(r.workstream!=="LAB_METHOD_AND_SCOPE")return r;
  return {...r,
   method_candidate_or_validation_note:disclaimer+" "+String(r.method_candidate_or_validation_note||""),
   required_evidence:String(r.required_evidence||"")+" "+disclaimer};
 });
 return pmsvB43OldCSV(adjusted);
};
const pmsvB43OldDraft=pmsvB41RequestText;
pmsvB41RequestText=function(r){
 if(!pmsvB43Valid())return "BLOCKED: primary FSSAI manual publication status has not loaded.";
 return pmsvB43OldDraft(r)+"\n\n"+pmsvB43Data.csv_export_amendment.proposed_lab_method_disclaimer+
 "\nFSSAI evidence: "+pmsvB43Data.csv_export_amendment.source_notice;
};
const pmsvB43OldExport=pmsvB41Export;
pmsvB41Export=function(which){if(!pmsvB43Valid())return;return pmsvB43OldExport(which)};
const pmsvB43OldCopy=pmsvB41Copy;
pmsvB41Copy=async function(id){if(!pmsvB43Valid())return;return pmsvB43OldCopy(id)};
function pmsvB43Product(p){
 if(!p||!pmsvB43Valid())return "";
 const c=pmsvB43Data.affected_cases.find(x=>x.catalog_id===p.id);
 if(!c||c.product_name!==p.name)return "";
 const e=pmsvB14Esc;
 return '<details class="card" open style="margin-top:12px"><summary><b>Batch43 · source-status evidence and laboratory hold</b></summary>'+
 '<div class="notice">'+e(c.statement_for_lab)+'</div>'+
 '<p><b>Mandatory clarification:</b> Final adoption of the 52-page consultation attachment and current precedence of the 61-page independent source both remain unverified.</p>'+
 '<p><a href="'+e(pmsvB43Data.primary_source_chain[0].url)+'" target="_blank" rel="noopener noreferrer">Original signed FSSAI consultation letter</a></p>'+
 '<p><b>Unsent requests:</b> '+c.linked_four_request_ids.map(e).join(", ")+'</p>'+
 '<div class="notice">No legal CTR finished article, validated method, commercial lot test or PASS has been approved.</div></details>';
}
const pmsvB43PreviousLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB43PreviousLoad();pmsvB43Data=null;
 try{
  const r=await fetch(pmsvB43Path+"?v=20261016-b43",{cache:"reload"});
  if(!r.ok)throw Error("Batch43 FSSAI consultation provenance unavailable");
  pmsvB43Data=await r.json();
  if(!pmsvB43Valid())throw Error("Batch43 primary signed notice or ledger provenance mismatch");
  pmsvB43Refresh();
 }catch(_){pmsvB43Data=null}
};
const pmsvB43PriorProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB43Product(p)+pmsvB43PriorProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b43-search]")){pmsvB43Query=String(ev.target.value||"").slice(0,130);pmsvB43Refresh()}
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b43-group]")&&["ALL","TRACE_METALS","NONMETAL"].includes(ev.target.value)){
   pmsvB43Group=ev.target.value;pmsvB43Refresh()
  }
 });
}
