"use strict";
/* Batch53: 13 HIGH PRIORITY FSSAI source-article-comparator and method-scope blockers.
   Read-only: no statutory limit assigned to a case, no evidence submitted or lot released. */
var pmsvB53Data=null,pmsvB53Selected="",pmsvB53Filter="ALL",pmsvB53Search="";
const pmsvB53Path="./data/rules/fssai-current35-p0-thirteen-legal-method-evidence-batch53-2026-10-16.json";
const pmsvB53Expected="fbfaeb9a44158767";
function pmsvB53Valid(){
 if(typeof pmsvB52Valid!=="function"||!pmsvB52Valid()||
    typeof pmsvB14Digest!=="function"||!pmsvB53Data||
    pmsvB14Digest(pmsvB53Data)!==pmsvB53Expected)return false;
 const d=pmsvB53Data,n=d.counts;
 if(d.kind!=="PMSV_BATCH53_THIRTEEN_P0_CURRENT_CTR_PRIMARY_COMPARATOR_AND_MATRIX_METHOD_NONTRANSFER"||
 d.as_of!=="2026-10-16"||d.environment!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
 n.catalogue!==533||n.conditionally_matched!==498||n.remaining_ctr_article_cases!==35||
 n.priority_p0_dossiers!==13||n.p0_requested_receipts!==65||n.priority_p1_unchanged!==22||
 n.all_preexisting_requests_unchanged!==175||n.lab_preflight_unchanged!==280||
 n.future_prompts_unchanged!==210||n.new_ctr_exact_case_articles_verified!==0||
 n.current_signed_legal_limits!==0||n.commercial_identity_documents_received!==0||
 n.accredited_matrix_methods_confirmed!==0||n.representative_lot_pass!==0||
 n.may_future_provisions_in_force!==0||n.wordpress_changed!==false||
 d.dockets?.length!==13||d.official_sources?.length!==4||
 Object.values(d.results||{}).some(x=>x!==true))return false;
 const old=new Map(pmsvB52Data.cases.map(x=>[x.catalogue_id,x]));
 let p0=0;const ids=new Set(),gates=new Set();
 for(const x of d.dockets){
  const before=old.get(x.catalogue_id);
  if(!before||!before.priority.startsWith("P0")||ids.has(x.catalogue_id)||
   before.rank!==x.rank||before.product_name!==x.product_name||
   before.analyte!==x.analyte||before.upstream_legal_gate!==x.legal_gate||
   x.legal_comparator?.classification!=="RELATED_NAMED_COMPARATOR_ONLY_NOT_CASE_LEGAL_ARTICLE"||
   x.legal_comparator?.numeric_ctr_limit_selected_for_this_case!==null||
   !x.legal_comparator?.original_gazette_precedence_unresolved||
   x.legal_comparator?.source_id!=="CTR_COMPENDIUM_IX"||
   JSON.stringify(before.gates.map(g=>g.request_id))!==JSON.stringify(x.old_five_gate_requests)||
   !x.next_manufacturer_document||!x.next_regulatory_decision||!x.next_lab_method_document||
   x.amendment_2026_12_01_in_force_as_of_2026_10_16!==false||
   x.signed_actual_commercial_identity!==false||
   x.signed_ctr_article!==false||x.lab_method_with_suitable_matrix_and_LOQ_verified!==false||
   x.traceable_lot_test_pass!==false||x.reviewer_release_approved!==false)return false;
  ids.add(x.catalogue_id);p0++;
  for(const gate of x.old_five_gate_requests){
   if(!gate||gates.has(gate))return false;
   gates.add(gate);
  }
 }
 return p0===13&&gates.size===65&&pmsvB52Data.cases.filter(x=>x.priority.startsWith("P0")).length===13&&
  d.official_sources.some(s=>s.id==="GAZETTE_MAY_2026")&&
  d.dockets.find(x=>x.rank===31)?.legal_comparator.pdf_page_1based===null;
}
function pmsvB53Rows(){
 if(!pmsvB53Valid())return [];
 const q=pmsvB53Search.toLowerCase().trim();
 return pmsvB53Data.dockets.filter(x=>
 (pmsvB53Filter==="ALL"||
  (pmsvB53Filter==="COCOA"&&[8,9,10].includes(x.rank))||
  (pmsvB53Filter==="MILK"&&[3,7,30,33,34].includes(x.rank))||
  (pmsvB53Filter==="SUGAR"&&[20,21].includes(x.rank))||
  (pmsvB53Filter==="OTHER"&&[1,6,31].includes(x.rank)))&&
 (!q||[x.rank,x.product_name,x.analyte,x.pathway_id,x.legal_comparator.label].some(v=>String(v).toLowerCase().includes(q))));
}
function pmsvB53Table(){
 const e=pmsvB14Esc;
 return pmsvB53Rows().map(x=>'<tr><td>'+e(x.rank)+'</td><td><b>'+e(x.product_name)+'</b></td>'+
 '<td>'+e(x.analyte)+'</td>'+
 '<td>Published comparator only (not legal case approval)</td>'+
 '<td>0/5 verified · 0 PASS</td><td><button type="button" data-pmsv-b53-select="'+e(x.catalogue_id)+'">Review precise blockers</button></td></tr>').join("");
}
function pmsvB53Details(){
 if(!pmsvB53Valid())return "";
 const e=pmsvB14Esc,x=pmsvB53Data.dockets.find(c=>c.catalogue_id===pmsvB53Selected);
 if(!x)return "";
 const s=pmsvB53Data.official_sources.find(s=>s.id==="CTR_COMPENDIUM_IX");
 const page=x.legal_comparator.pdf_page_1based;
 return '<div class="notice"><b>'+e(x.product_name)+'</b> · '+e(x.analyte)+
 '. <b>No case-specific CTR legal maximum, validated method or actual lot PASS.</b> Published comparator does not transfer.</div>'+
 '<p><b>Official CTR named comparator, NOT approved for this case:</b> '+e(x.legal_comparator.label)+
 '. <a href="'+e(s.url)+'" target="_blank" rel="noopener noreferrer">FSSAI compiled CTR Version IX'+
 (page?(" · PDF page "+e(page)):" · exact named article still unresolved")+'</a>.</p>'+
 '<p><b>Manufacturer QA — obtain:</b> '+e(x.next_manufacturer_document)+'</p>'+
 '<p><b>Regulatory Affairs — independently determine:</b> '+e(x.next_regulatory_decision)+'</p>'+
 '<p><b>Accredited lab — verify before method/CoA reliance:</b> '+e(x.next_lab_method_document)+'</p>'+
 '<p><b>Prior risk interpretation retained:</b> '+e(x.historical_matrix_exception)+'</p>'+
 '<p><b>Original documentary requests:</b> '+e(x.old_five_gate_requests.join(", "))+'</p>'+
 '<div class="notice"><b>Effective-date hold:</b> The May 2026 CTR Gazette is not effective until 1 Dec 2026. The 2024 analytical manual needs method identity, adoption, matrix and LOQ verification. <a href="https://www.fssai.gov.in/upload/uploadfiles/files/272840.pdf" target="_blank" rel="noopener noreferrer">Original Gazette</a> · <a href="https://fssai.gov.in/upload/uploadfiles/files/MANUAL_FOR_ANALYSIS_OF_METALS_dt_18_04_2024.pdf" target="_blank" rel="noopener noreferrer">Method text</a>.</div>';
}
function pmsvB53Panel(){
 if(!pmsvB53Valid())return "";
 return '<details id="pmsv-b53-p0-matrix-review" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch53 · 13 priority legal-article/method exceptions</b> — 65 historical evidence gates remain open</summary>'+
 '<div class="notice"><b>35 legal CTR cases still unresolved; these 13 are the P0 subset.</b> FSSAI compiled Version IX is an official-hosted reference, NOT a signed classification of the sold product. All case-specific limits, laboratory method approvals and tested-lot PASS remain at zero.</div>'+
 '<p>Primary sources: <a href="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf" target="_blank" rel="noopener noreferrer">CTR IX (Feb 2026)</a> · <a href="https://www.fssai.gov.in/upload/uploadfiles/files/272840.pdf" target="_blank" rel="noopener noreferrer">May 2026 Gazette — effective 1 Dec 2026</a> · <a href="https://fssai.gov.in/upload/uploadfiles/files/MANUAL_FOR_ANALYSIS_OF_METALS_dt_18_04_2024.pdf" target="_blank" rel="noopener noreferrer">FSSAI-hosted 2024 metals manual</a>. The original effective Gazette governs if compiled text differs.</p>'+
 '<p><button type="button" data-pmsv-b53-export>Download blank 13-case specific evidence worklist CSV</button></p>'+
 '<p><label>Search <input type="search" data-pmsv-b53-search placeholder="Cocoa, milk, nickel, 21" /></label> '+
 '<label>Priority grouping <select data-pmsv-b53-filter>'+
 '<option value="ALL">All P0 (13)</option><option value="COCOA">Cocoa forms (3)</option>'+
 '<option value="MILK">Dairy / coconut / child / Ayurveda (5)</option>'+
 '<option value="SUGAR">Misri and polyols (2)</option>'+
 '<option value="OTHER">Water, tamarind and royal jelly (3)</option></select></label></p>'+
 '<p data-pmsv-b53-count>13 P0 cases · 65/65 requests UNSENT</p>'+
 '<div class="tablewrap" style="max-height:470px;overflow:auto"><table><thead><tr><th>#</th><th>Product</th><th>Analyte</th><th>Regulatory finding</th><th>Closure</th><th>Review</th></tr></thead>'+
 '<tbody data-pmsv-b53-rows>'+pmsvB53Table()+'</tbody></table></div>'+
 '<div data-pmsv-b53-detail></div></details>';
}
function pmsvB53Refresh(showDetails){
 if(!pmsvB53Valid()||typeof document==="undefined")return;
 const anchor=document.getElementById("pmsv-b52-legal-gate-queue")||document.getElementById("pmsv-b51-evidence-intake");
 if(!anchor)return;
 let panel=document.getElementById("pmsv-b53-p0-matrix-review");
 if(!panel){anchor.insertAdjacentHTML("beforebegin",pmsvB53Panel());return;}
 const rows=panel.querySelector("[data-pmsv-b53-rows]");
 if(rows)rows.innerHTML=pmsvB53Table();
 const count=panel.querySelector("[data-pmsv-b53-count]");
 if(count)count.textContent=pmsvB53Rows().length+" priority cases shown · 0 approved limits / PASS";
 if(showDetails){const detail=panel.querySelector("[data-pmsv-b53-detail]");if(detail)detail.innerHTML=pmsvB53Details();}
}
function pmsvB53CSV(){
 if(!pmsvB53Valid())return "";
 const esc=v=>{let x=String(v??"");if(/^\s*[=+@-]/.test(x))x="'"+x;return '"'+x.replaceAll('"','""')+'"';};
 const header=["rank","catalogue_id","product_name","analyte","case_ctr_gate","related_official_comparator_not_approval","manufacturer_document_needed","regulatory_decision_needed","matrix_lab_method_needed","original_five_request_ids","ctr_approved","actual_lot_pass"];
 const rows=pmsvB53Data.dockets.map(x=>[
 x.rank,x.catalogue_id,x.product_name,x.analyte,x.legal_gate,x.legal_comparator.label,
 x.next_manufacturer_document,x.next_regulatory_decision,x.next_lab_method_document,
 x.old_five_gate_requests.join(" | "),false,false]);
 return[header.map(esc).join(","),...rows.map(row=>row.map(esc).join(","))].join("\r\n")+"\r\n";
}
function pmsvB53Export(){
 if(!pmsvB53Valid())return;
 const blob=new Blob(["\uFEFF",pmsvB53CSV()],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="PMSV-B53-13-P0-LEGAL-METHOD-REQUESTS-BLANK.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1100);
}
const pmsvB53PreviousLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB53PreviousLoad();pmsvB53Data=null;
 try{const r=await fetch(pmsvB53Path+"?v=20261016-b53",{cache:"reload"});
  if(!r.ok)throw Error("Missing B53");pmsvB53Data=await r.json();
  if(!pmsvB53Valid())throw Error("B53 source/gate integrity failure");
  pmsvB53Refresh(true);
 }catch(_){pmsvB53Data=null;}
};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b53-search]")){
   pmsvB53Search=String(ev.target.value||"").slice(0,140);pmsvB53Refresh(false);
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b53-filter]")&&
   ["ALL","COCOA","MILK","SUGAR","OTHER"].includes(ev.target.value)){
   pmsvB53Filter=ev.target.value;pmsvB53Refresh(false);
  }
 });
 document.addEventListener("click",ev=>{
  const sel=ev.target?.closest?.("[data-pmsv-b53-select]");
  if(sel){pmsvB53Selected=sel.getAttribute("data-pmsv-b53-select");pmsvB53Refresh(true);return;}
  if(ev.target?.closest?.("[data-pmsv-b53-export]"))pmsvB53Export();
 });
}
