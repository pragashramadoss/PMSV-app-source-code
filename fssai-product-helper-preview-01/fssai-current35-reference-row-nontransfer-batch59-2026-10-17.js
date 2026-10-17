(function(){
"use strict";
/* B59: 35 held cases / 15 official compiled-CTR comparator references.
   Non-transfer is essential: a source row is NOT a case-specific binding standard.
   No email, API write, browser storage, source documents, specimen or release recorded. */
var data=null,priority="ALL",research="ALL",search="";
const endpoint="./data/rules/fssai-current35-reference-row-nontransfer-batch59-2026-10-17.json";
const pinned="6791743a07c12e4f";
function valid(){
 if(typeof pmsvB56Valid!=="function"||!pmsvB56Valid()||
    typeof pmsvB57PlusValid!=="function"||!pmsvB57PlusValid()||
    typeof pmsvB57Valid!=="function"||!pmsvB57Valid()||
    !window.pmsvB58OwnerOutreach||!window.pmsvB58OwnerOutreach.valid()||
    typeof pmsvB14Digest!=="function"||!data||pmsvB14Digest(data)!==pinned)return false;
 const t=data.totals,prior=new Map(pmsvB56Data.cases.map(c=>[c.catalogue_id,c]));
 if(data.kind!=="PMSV_BATCH59_OFFICIAL_CTR_REFERENCE_EXCERPT_CROSSWALK_NONTRANSFER"||
  data.as_of!=="2026-10-17"||data.environment!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
  t.catalogue!==533||t.first_source_conditional!==498||t.open_ctr_cases!==35||
  t.p0!==13||t.p1!==22||t.original_five_gate_request_ids!==175||
  t.preparatory_unsent_requests!==70||t.dependent_unsent_requests!==105||
  t.comparator_research_rows!==15||t.pending_case_research!==20||
  t.legally_signed_case_limits!==0||t.lab_validated_lot_passes!==0||
  t.original_gazette_authenticated_for_case!==0||t.documents_received!==0||
  t.wordpress_changed!==false||data.cases?.length!==35||
  data.official_compendium_url!=="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf"||
  data.future_gazette_source?.commencement_date!=="2026-12-01"||
  data.future_gazette_source?.effective_as_of_review!==false||
  data.future_gazette_source?.case_specific_limit_signed!==false||
  data.immutable_safety?.zero_product_pass!==true||
  data.immutable_safety?.no_numeric_comparator_applied_to_case!==true)return false;
 const seen=new Set();let compare=0,pending=0,p0=0,p1=0,gates=new Set();
 for(const c of data.cases){
  const orig=prior.get(c.catalogue_id);
  if(!orig||seen.has(c.catalogue_id)||c.rank!==orig.rank||
    c.priority!==orig.priority||c.product_name!==orig.product_name||
    c.analyte!==orig.analyte||c.original_legal_gate!==orig.original_legal_gate||
    JSON.stringify(c.original_request_ids)!==JSON.stringify(orig.gates.map(g=>g.request_id))||
    c.case_signed_legal_applicability!==false||
    c.actual_market_material_authenticated!==false||
    c.method_and_lab_scope_approved!==false||c.representative_lot_pass!==false)return false;
  seen.add(c.catalogue_id);c.priority==="P0"?p0++:p1++;
  c.original_request_ids.forEach(id=>gates.add(id));
  if(c.source_row_state==="SOURCE_ROW_FOUND_BUT_COMMODITY_OR_SUBTYPE_NOT_VERIFIED"){
   compare++;
   const r=c.reference;
   if(!r||r.source_url!==data.official_compendium_url||r.source_analyte!==c.analyte||
    !r.source_article||!r.nontransfer_reason||!r.quoted_comparator_value_only||
    !Number.isInteger(r.pdf_page_1_based)||r.pdf_page_1_based<1||
    r.current_original_gazette_authenticated!==false||
    r.exact_as_sold_commodity_applies!==false||r.case_specific_signed_limit!==false)return false;
  }else if(c.source_row_state==="NO_COMPARATOR_SELECTED_THIS_BATCH"&&c.reference===null)pending++;
  else return false;
 }
 return seen.size===35&&gates.size===175&&compare===15&&pending===20&&p0===13&&p1===22;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[a]));}
function filtered(){
 if(!valid())return[];
 const q=search.trim().toLowerCase();
 return data.cases.filter(c=>(priority==="ALL"||c.priority===priority)&&
  (research==="ALL"||(research==="REFERENCED"&&!!c.reference)||
    (research==="PENDING"&&!c.reference))&&
  (!q||[c.rank,c.product_name,c.analyte,c.original_legal_gate,c.reference?.source_article,c.reference?.nontransfer_reason]
   .some(v=>String(v??"").toLowerCase().includes(q))));
}
function options(sel,array){return array.map(x=>'<option value="'+esc(x[0])+'"'+(sel===x[0]?" selected":"")+'>'+esc(x[1])+'</option>').join("");}
function row(c){
 let r=c.reference,summary=r?
   '<b>Source row: '+esc(r.source_article)+'</b><small>CTR compendium PDF page '+esc(r.pdf_page_1_based)+
   ' · Comparator-only '+esc(r.quoted_comparator_value_only)+
   ' · <a target="_blank" rel="noopener noreferrer" href="'+esc(r.source_url)+'#page='+esc(r.pdf_page_1_based)+'">View quoted page</a></small>'+
   '<small>Why not transferable: '+esc(r.nontransfer_reason)+'</small>':
   '<span>No case-specific comparator selected in Batch59.</span><small>Legal/source research remains incomplete; absence of a selected row does not prove that no rule exists.</small>';
 return '<tr><td><b>'+esc(c.priority)+' #'+esc(c.rank)+'</b></td>'+
  '<td>'+esc(c.product_name)+'<small>'+esc(c.analyte)+' · '+esc(c.original_legal_gate)+'</small></td>'+
  '<td>'+summary+'</td><td><b>OPEN</b><small>0 signed legal article / 0 lot PASS</small></td></tr>';
}
function panel(){
 return '<details id="pmsv-b59-ctr-nontransfer" class="card" style="margin-bottom:12px">'+
  '<summary><b>Batch59 · Exact CTR source-row non-transfer</b> — 35 open cases / 15 research comparators</summary>'+
  '<div class="notice"><b>All 35 cases remain on hold.</b> Official FSSAI compendium references are not substitute legal approvals. The numerical figures below are the published <b>other-article comparison values only</b>, never the approved maximum for the selected product.</div>'+
  '<p>Version IX (3 February 2026) of the official FSSAI CTR compendium was compared against 15 potentially confusing catalogue entries. In all 15, actual as-sold article identity or original operative Gazette is unresolved. The remaining 20 records have no comparator selected <b>in this batch</b>, not a negative legal finding.</p>'+
  '<p>The <a target="_blank" rel="noopener noreferrer" href="https://fssai.gov.in/upload/uploadfiles/files/272840.pdf#page=4">original 2026 CTR amendment Gazette (page 4)</a> expressly starts <b>1 December 2026</b>, and is therefore <b>not applied</b> to this 17 October 2026 review. Check other original operative notifications through the <a target="_blank" rel="noopener noreferrer" href="https://fssai.gov.in/food-law/regulations/amendments/contaminants-toxins">FSSAI amendment archive</a> before applying any case limit. Individual lab/NABL scope and lot controls remain required.</p>'+
  '<div class="checker-grid">'+
  '<div class="field"><label>Priority</label><select data-pmsv-b59-priority>'+
  options(priority,[["ALL","All 35 cases"],["P0","P0 (13)"],["P1","P1 (22)"]])+'</select></div>'+
  '<div class="field"><label>Source research state</label><select data-pmsv-b59-research>'+
  options(research,[["ALL","All open cases (35)"],["REFERENCED","Comparator cautions (15)"],["PENDING","No source comparator selected (20)"]])+'</select></div>'+
  '<div class="field"><label>Search case / analyte / quoted article</label><input maxlength="120" data-pmsv-b59-search value="'+esc(search)+'" placeholder="cocoa, misri, coffee..."/></div>'+
  '</div><p><b data-pmsv-b59-count>35 held cases</b> · 0 verified direct legal comparator · 0 selected accredited lab / 0 lot PASS.</p>'+
  '<div style="max-height:480px;overflow:auto"><table><thead><tr><th>Priority</th><th>Selected catalogue product</th><th>Official source-row comparison, NOT applicable to case</th><th>Current case</th></tr></thead>'+
  '<tbody data-pmsv-b59-rows></tbody></table></div>'+
  '<p><button type="button" data-pmsv-b59-export>Download 35-case research-only CSV</button></p>'+
  '<p class="countline">Research is informational, non-final and pending original Gazette, manufacturer identity, source adoption, laboratory scope, CoA and independent signoff.</p></details>';
}
function refresh(){
 if(!valid()||typeof document==="undefined")return;
 const anchor=document.getElementById("pmsv-b58-owner-packets")||
  document.getElementById("pmsv-b57-source-lab-authentication");
 if(!anchor)return;
 let el=document.getElementById("pmsv-b59-ctr-nontransfer");
 if(!el){anchor.insertAdjacentHTML("afterend",panel());el=document.getElementById("pmsv-b59-ctr-nontransfer");}
 el.querySelector("[data-pmsv-b59-rows]").innerHTML=filtered().map(row).join("");
 el.querySelector("[data-pmsv-b59-count]").textContent=filtered().length+" legally open case(s)";
}
function csv(){
 if(!valid())return "";
 const headings=["rank","priority","catalogue_product","analyte","original_legal_gate",
   "source_research_status","official_compendium_url","pdf_page_one_based",
   "different_source_article","comparator_as_published_NOT_case_limit",
   "why_source_row_cannot_be_transferred","signed_original_legal_limit","actual_lab_scope_approved",
   "representative_lot_pass"];
 const qs=v=>{let s=String(v??"");if(/^\s*[=+@\-]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';};
 const entries=filtered().map(c=>[c.rank,c.priority,c.product_name,c.analyte,c.original_legal_gate,
  c.source_row_state,c.reference?.source_url||"",c.reference?.pdf_page_1_based||"",
  c.reference?.source_article||"",c.reference?.quoted_comparator_value_only||"",
  c.reference?.nontransfer_reason||"",false,false,false]);
 return [headings.map(qs).join(","),...entries.map(e=>e.map(qs).join(","))].join("\r\n")+"\r\n";
}
function exportCSV(){
 const content="\uFEFF"+csv();
 const a=document.createElement("a"),u=URL.createObjectURL(new Blob([content],{type:"text/csv;charset=utf-8"}));
 a.href=u;a.download="PMSV-B59-CTR-RESEARCH-COMPARATORS-NOT-LEGAL-LIMITS.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1100);
}
const earlier=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await earlier();data=null;
 try{
  const response=await fetch(endpoint+"?v=20261017-b59",{cache:"reload"});
  if(!response.ok)throw Error("B59 source crosswalk unavailable");
  data=await response.json();
  if(!valid())throw Error("B59 source crosswalk invalid");refresh();
 }catch(_){data=null;}
};
document.addEventListener("change",ev=>{
 const t=ev.target;if(!t)return;
 if(t.matches("[data-pmsv-b59-priority]")&&["ALL","P0","P1"].includes(t.value))priority=t.value;
 else if(t.matches("[data-pmsv-b59-research]")&&["ALL","REFERENCED","PENDING"].includes(t.value))research=t.value;
 else return;refresh();
});
document.addEventListener("input",ev=>{
 const t=ev.target;if(t?.matches("[data-pmsv-b59-search]")){search=String(t.value||"").slice(0,120);refresh();}
});
document.addEventListener("click",ev=>{
 if(ev.target?.closest("[data-pmsv-b59-export]")&&valid())exportCSV();
});
window.pmsvB59CTRSourceCrosswalk={valid,filtered,csv,getAllCases:()=>valid()?data.cases.map(c=>({...c,original_request_ids:[...c.original_request_ids]})):[],getCounts:()=>({
 cases:data?.cases?.length||0,referenced:data?.cases?.filter(c=>!!c.reference).length||0,
 pending:data?.cases?.filter(c=>!c.reference).length||0,approved:0,lot_pass:0
})};
})();
