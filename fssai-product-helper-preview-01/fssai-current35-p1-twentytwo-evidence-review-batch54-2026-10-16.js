"use strict";
/* Batch54: read-only P1 22-case source/evidence reconciliation. Identity is not a CTR approval.
   No storage, form submission, case approvals or private product information in this module. */
var pmsvB54Data=null,pmsvB54Selected="",pmsvB54Filter="ALL",pmsvB54Search="";
const pmsvB54Path="./data/rules/fssai-current35-p1-twentytwo-evidence-review-batch54-2026-10-16.json";
const pmsvB54Expected="9a53b132b9b292f1";
function pmsvB54Valid(){
 if(typeof pmsvB53Valid!=="function"||!pmsvB53Valid()||
   typeof pmsvB14Digest!=="function"||!pmsvB54Data||
   pmsvB14Digest(pmsvB54Data)!==pmsvB54Expected)return false;
 const d=pmsvB54Data,n=d.counts;
 if(d.kind!=="PMSV_BATCH54_P1_TWENTYTWO_110_LEGAL_ARTICLE_SOURCE_AND_EVIDENCE_CLOSURE_DOSSIERS"||
 d.as_of!=="2026-10-16"||d.environment!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
 n.catalogue!==533||n.conditional_first_source_matches!==498||
 n.current_exact_ctr_cases_pending!==35||n.p0_unchanged!==13||n.p1_in_scope!==22||
 n.p1_published_named_identity_sources!==16||n.p1_missing_individual_substance_identity!==6||
 n.p1_original_5_gate_requests!==110||n.all_prior_5_gate_requests_unchanged!==175||
 n.prior_advisory_lab_points!==280||n.prior_future_law_prompts!==210||
 n.p1_trace_metals!==15||n.p1_mycotoxins!==3||
 n.p1_named_pesticides!==3||n.p1_residue_unspecified!==1||
 n.evidence_documents_received!==0||n.requests_sent!==0||
 n.exact_ctr_articles_approved!==0||n.signed_mrl_or_metal_limits_assigned!==0||
 n.matrix_methods_approved!==0||n.lot_passes!==0||n.wordpress_changed!==false||
 d.source_boundaries?.length!==7||d.p1_dossiers?.length!==22||
 Object.values(d.results||{}).some(x=>x!==true))return false;
 const old=new Map(pmsvB52Data.cases.map(x=>[x.catalogue_id,x]));
 const seen=new Set(),seenGates=new Set();let p1=0,named=0,unnamed=0,metals=0,toxins=0,pest=0,unspec=0;
 for(const x of d.p1_dossiers){
  const prev=old.get(x.catalogue_id);
  if(!prev||!prev.priority.startsWith("P1")||seen.has(x.catalogue_id)||
  prev.rank!==x.rank||prev.product_name!==x.product_name||
  prev.analyte!==x.analyte||prev.upstream_legal_gate!==x.original_legal_gate||
  prev.product_standard_identity_source_known!==x.source_evidence.primary_product_identity_source_only||
  prev.seven_material_intake!==(x.identity_status==="SUBSTANCE_OR_FORMULATION_UNSPECIFIED")||
  x.original_five_documentary_requests?.length!==5||x.specific_document_checklist?.length!==4||
  !x.source_evidence?.source_url||!x.actual_market_identity_and_composition_needed||
  !x.cTR_comparator_exclusion||!x.required_accredited_assay_proof||
  x.latest_applicant_status_unverified!==(x.rank===24)||
  x.current_effective_ctr_article_signed!==false||x.actual_manufacturer_product_verified!==false||
  x.analytical_method_approved!==false||x.legal_limit_assigned_for_case!==null||
  x.actual_lot_pass!==false||x.current_2026_may_ctr_amendment_in_force!==false||
  x.on_or_after_2027_method_rule_applied_as_current!==false)return false;
  for(let j=0;j<5;j++){
   const g=x.original_five_documentary_requests[j],p=prev.gates[j];
   if(!g||!p||g.request_id!==p.request_id||g.gate_code!==p.gate_code||
   !g.evidence_required||g.sent!==false||g.received!==false||g.signed!==false||
   seenGates.has(g.request_id))return false;
   seenGates.add(g.request_id);
  }
  if(x.identity_status==="SUBSTANCE_OR_FORMULATION_UNSPECIFIED"){unnamed++;if(x.identity_intake_fields_existing?.length!==4)return false;}
  else {named++;if(x.identity_intake_fields_existing?.length!==0)return false;}
  if(x.analyte_family==="TRACE_METALS")metals++;
  else if(x.analyte_family==="MYCOTOXINS")toxins++;
  else if(x.analyte_family==="PESTICIDE_RESIDUES")pest++;
  else if(x.analyte_family==="UNSPECIFIED_RESIDUE")unspec++;
  else return false;
  p1++;seen.add(x.catalogue_id);
 }
 const p1Older=pmsvB52Data.cases.filter(x=>x.priority.startsWith("P1"));
 return p1===22&&named===16&&unnamed===6&&seenGates.size===110&&
 metals===15&&toxins===3&&pest===3&&unspec===1&&
 p1Older.length===22&&p1Older.every(x=>seen.has(x.catalogue_id))&&
 d.p1_dossiers.find(x=>x.rank===24)?.latest_applicant_status_unverified===true;
}
function pmsvB54Rows(){
 if(!pmsvB54Valid())return [];
 const q=pmsvB54Search.trim().toLowerCase();
 return pmsvB54Data.p1_dossiers.filter(x=>
 (pmsvB54Filter==="ALL"||
 (pmsvB54Filter==="METAL"&&x.analyte_family==="TRACE_METALS")||
 (pmsvB54Filter==="MYCO"&&x.analyte_family==="MYCOTOXINS")||
 (pmsvB54Filter==="PEST"&&["PESTICIDE_RESIDUES","UNSPECIFIED_RESIDUE"].includes(x.analyte_family))||
 (pmsvB54Filter==="MATERIAL"&&x.identity_status==="SUBSTANCE_OR_FORMULATION_UNSPECIFIED")||
 (pmsvB54Filter==="NAMED"&&x.source_evidence.primary_product_identity_source_only)||
 (pmsvB54Filter==="SAJJI"&&x.rank===24))&&
 (!q||[x.product_name,x.analyte,x.rank,x.catalogue_id,x.review_lane,
   x.cTR_comparator_exclusion].some(v=>String(v).toLowerCase().includes(q))));
}
function pmsvB54Table(){
 const e=pmsvB14Esc;
 return pmsvB54Rows().map(x=>'<tr><td>'+e(x.rank)+'</td><td><b>'+e(x.product_name)+'</b></td>'+
 '<td>'+e(x.analyte)+'</td><td>'+
 e(x.source_evidence.primary_product_identity_source_only?"Published identity / no commercial proof":"Named individual material missing")+
 '</td><td>5/5 UNSENT · no lot PASS</td><td><button type="button" data-pmsv-b54-case="'+
 e(x.catalogue_id)+'">Review evidence</button></td></tr>').join("");
}
function pmsvB54Details(){
 if(!pmsvB54Valid())return "";
 const e=pmsvB14Esc,x=pmsvB54Data.p1_dossiers.find(v=>v.catalogue_id===pmsvB54Selected);
 if(!x)return "";
 const s=x.source_evidence;
 return '<div class="notice"><b>'+e(x.product_name)+'</b> · '+e(x.analyte)+
 '. Five original statutory/laboratory evidence gates remain UNSENT; product identity and CTR applicability are NOT approved.</div>'+
 '<p><b>Prior official identity/category source only:</b> <a href="'+e(s.source_url)+
 '" target="_blank" rel="noopener noreferrer">FSSAI '+e(s.standard_clause||"category/authority")+" — "+
 e(s.evidence_class)+(Number.isInteger(s.pdf_page_zero_based)?" · source PDF page "+e(s.pdf_page_zero_based+1):"")+
 '</a>. '+e(s.summary)+'</p>'+
 '<p><b>Why the comparator does not transfer:</b> '+e(x.cTR_comparator_exclusion)+'</p>'+
 '<p><b>Manufacturer / supplier must supply:</b> '+e(x.actual_market_identity_and_composition_needed)+'</p>'+
 '<p><b>Laboratory and legal reviewer must verify:</b> '+e(x.required_accredited_assay_proof)+'</p>'+
 '<p><b>Four case-specific intake categories:</b> '+x.specific_document_checklist.map(e).join(" · ")+'</p>'+
 (x.rank===24?'<div class="notice"><b>Sajji Khar register freshness:</b> June 2026 closed/withdrawn cases are not the current individual approval. FSSAI indexes a 1 September 2026 status register; the exact applicant rows still need verification. <a href="https://www.fssai.gov.in/standards/non-specified-food" target="_blank" rel="noopener noreferrer">Latest official register index</a>.</div>':"")+
 '<div class="tablewrap"><table><thead><tr><th>Original gate</th><th>Assigned reviewer role</th><th>Exact source/document requested</th><th>Status</th></tr></thead><tbody>'+
 x.original_five_documentary_requests.map(g=>'<tr><td>'+e(g.request_id)+'</td><td>'+e(g.owner_role)+
 '</td><td>'+e(g.evidence_required)+'</td><td>UNSENT / no document</td></tr>').join("")+'</tbody></table></div>'+
 '<p><b>Legal hold:</b> '+e(x.original_legal_gate)+'. May 2026 CTR amendment is future-effective 1 December 2026; no future provisions promoted. No actual lot test/CoA or signed CTR article received.</p>';
}
function pmsvB54Panel(){
 if(!pmsvB54Valid())return "";
 return '<details id="pmsv-b54-p1-complete-review" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch54 · All 22 remaining P1 cases</b> — 110 UNSENT statutory/method evidence requests</summary>'+
 '<div class="notice"><b>35 total CTR cases remain OPEN.</b> Batch53: 13 P0 dossiers. This Batch54: all 22 P1 dossiers (15 metals, 3 mycotoxins, 4 pesticide/unspecified residues). 16 published product-identity sources, 6 missing individual material identities. All 110 original evidence requests still UNSENT; zero approved limits, methods or lot PASS.</div>'+
 '<p><b>Legal scope:</b> FSSAI published CTR version IX includes distinct contaminant-commodity rows, pesticide analyte MRLs, and mycotoxin crop definitions. Related/fallback article names are not automatic limits for an actual product. <a href="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf" target="_blank" rel="noopener noreferrer">Official CTR compendium</a>.</p>'+
 '<p><button type="button" data-pmsv-b54-export>Download 110-row BLANK documentary evidence request CSV</button></p>'+
 '<p><label>Search <input type="search" data-pmsv-b54-search placeholder="Coffee, chia, egg, lead, premix" /></label> '+
 '<label>Evidence group <select data-pmsv-b54-filter>'+
 '<option value="ALL">All P1 (22)</option><option value="METAL">Trace metals (15)</option>'+
 '<option value="MYCO">Mycotoxins (3)</option><option value="PEST">Pesticide/residue (4)</option>'+
 '<option value="NAMED">Published identity source (16)</option>'+
 '<option value="MATERIAL">Missing individual material (6)</option>'+
 '<option value="SAJJI">Sajji Khar latest-source exception (1)</option></select></label></p>'+
 '<p data-pmsv-b54-count>22 P1 cases · 110 original requests awaiting evidence</p>'+
 '<div class="tablewrap" style="max-height:500px;overflow:auto"><table><thead><tr>'+
 '<th>Rank</th><th>Finished product/ingredient</th><th>Target analyte</th><th>Identity evidence</th><th>Current status</th><th>Review</th></tr></thead>'+
 '<tbody data-pmsv-b54-rows>'+pmsvB54Table()+'</tbody></table></div>'+
 '<div data-pmsv-b54-detail></div></details>';
}
function pmsvB54Refresh(withDetails){
 if(!pmsvB54Valid()||typeof document==="undefined")return;
 const anchor=document.getElementById("pmsv-b53-p0-matrix-review")||
 document.getElementById("pmsv-b52-legal-gate-queue");
 if(!anchor)return;
 let el=document.getElementById("pmsv-b54-p1-complete-review");
 if(!el){anchor.insertAdjacentHTML("beforebegin",pmsvB54Panel());return;}
 const table=el.querySelector("[data-pmsv-b54-rows]");
 if(table)table.innerHTML=pmsvB54Table();
 const count=el.querySelector("[data-pmsv-b54-count]");
 if(count)count.textContent=pmsvB54Rows().length+" cases shown · zero approved legal CTR limits or lot passes";
 if(withDetails){const detail=el.querySelector("[data-pmsv-b54-detail]");if(detail)detail.innerHTML=pmsvB54Details();}
}
function pmsvB54CSV(){
 if(!pmsvB54Valid())return "";
 const esc=v=>{let x=String(v??"");if(/^\s*[=+@-]/.test(x))x="'"+x;return '"'+x.replaceAll('"','""')+'"';};
 const cols=["rank","catalogue_id","product_name","analyte","case_gate","source_classification","official_source_url",
 "identity_or_formulation_needed","comparator_nontransfer","case_specific_lab_proof",
 "legacy_request_id","gate_code","owner_role","specific_document_required","document_sent","document_received","signed","legal_ctr_approved","lot_pass"];
 const rows=pmsvB54Data.p1_dossiers.flatMap(x=>x.original_five_documentary_requests.map(g=>[
 x.rank,x.catalogue_id,x.product_name,x.analyte,x.original_legal_gate,x.source_evidence.evidence_class,
 x.source_evidence.source_url,x.actual_market_identity_and_composition_needed,
 x.cTR_comparator_exclusion,x.required_accredited_assay_proof,g.request_id,g.gate_code,
 g.owner_role,g.evidence_required,false,false,false,false,false]));
 return[cols.map(esc).join(","),...rows.map(r=>r.map(esc).join(","))].join("\r\n")+"\r\n";
}
function pmsvB54Export(){
 if(!pmsvB54Valid())return;
 const blob=new Blob(["\uFEFF",pmsvB54CSV()],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="PMSV-B54-22-P1-110-UNSENT-EVIDENCE-REQUESTS-BLANK.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1100);
}
const pmsvB54PreviousLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB54PreviousLoad();pmsvB54Data=null;
 try{const r=await fetch(pmsvB54Path+"?v=20261016-b54",{cache:"reload"});
  if(!r.ok)throw Error("Batch54 source missing");pmsvB54Data=await r.json();
  if(!pmsvB54Valid())throw Error("Batch54 integrity/lineage failure");
  pmsvB54Refresh(true);
 }catch(_){pmsvB54Data=null;}
};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b54-search]")){
   pmsvB54Search=String(ev.target.value||"").slice(0,140);pmsvB54Refresh(false);
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b54-filter]")&&
    ["ALL","METAL","MYCO","PEST","NAMED","MATERIAL","SAJJI"].includes(ev.target.value)){
   pmsvB54Filter=ev.target.value;pmsvB54Refresh(false);
  }
 });
 document.addEventListener("click",ev=>{
  const choose=ev.target?.closest?.("[data-pmsv-b54-case]");
  if(choose){pmsvB54Selected=choose.getAttribute("data-pmsv-b54-case");pmsvB54Refresh(true);return;}
  if(ev.target?.closest?.("[data-pmsv-b54-export]"))pmsvB54Export();
 });
}
