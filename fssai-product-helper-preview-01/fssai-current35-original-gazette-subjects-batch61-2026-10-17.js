(function(){
"use strict";
/* Batch61: primary source provenance, original effective dates and distinct
   product-identity vs CTR applicability. No case limit, lab scope or PASS. */
let doc=null,priority="ALL",scope="ALL",query="";
const source="./data/rules/fssai-current35-original-gazette-subjects-batch61-2026-10-17.json";
const digest="6150a34a1cdf8019";
const allowedScope=["ALL","CTR","IDENTITY","PENDING"];
function valid(){
 /* B72: ancestor required by the immediate validated predecessor; no gate bypass. */
 if(!window.pmsvB60LegalScope?.valid()||
  typeof window.pmsvB59CTRSourceCrosswalk.getAllCases!=="function"||
  typeof pmsvB14Digest!=="function"||!doc||pmsvB14Digest(doc)!==digest)return false;
 const t=doc.totals,ps=window.pmsvB59CTRSourceCrosswalk.getAllCases();
 if(doc.kind!=="PMSV_BATCH61_ORIGINAL_GAZETTE_TIME_AND_SUBJECT_AUDIT"||
  doc.as_of!=="2026-10-17"||doc.environment!=="GITHUB_PAGES_PREVIEW_ONLY"||
  doc.pinned_b59_digest!=="6791743a07c12e4f"||
  doc.pinned_b60_digest!=="9cbb73557870ed10"||
  t.catalogue!==533||t.conditional_source_matched!==498||t.open_cases!==35||
  t.p0!==13||t.p1!==22||t.original_notice_documents!==5||
  t.original_english_pdf_direct_inspected!==2||
  t.original_official_indexed_not_full_page_inspected!==3||
  t.documented_source_subjects!==8||t.identity_standard_subjects!==6||
  t.related_ctr_articles_not_exact_commodities!==2||
  t.other_cases_no_primary_topic_anchor!==27||t.original_request_ids!==175||
  t.b59_related_source_comparison_cases!==15||t.b60_researched_pending_cases!==20||
  t.operative_2024_ctr_confirmed!==true||t.future_2026_ctr_excluded!==true||
  t.product_specific_legal_limits_approved!==0||t.actually_signed_case_applicability!==0||
  t.manufacturer_lot_identities_confirmed!==0||t.lab_method_scope_approved!==0||
  t.original_lot_coas_received!==0||t.product_passes!==0||t.owner_requests_sent!==0||
  t.wordpress_changed!==false||doc.cases?.length!==35||
  doc.original_notices?.length!==5||ps.length!==35||
  doc.hold_rules?.hold_all_35!==true||doc.hold_rules?.allow_product_pass!==false||
  doc.hold_rules?.allow_numerical_comparator_transfer!==false||
  doc.hold_rules?.may_2026_ctr_effective_at_snapshot!==false||
  doc.hold_rules?.october_2024_ctr_effective_at_snapshot!==true)return false;
 const gazettes=new Map(doc.original_notices.map(x=>[x.id,x]));
 if(gazettes.size!==5||gazettes.get("CTR24")?.commencement_status_or_date!=="2025-04-01"||
  gazettes.get("CTR24")?.effective_as_of_2026_10_17!==true||
  gazettes.get("CTR26")?.commencement_status_or_date!=="2026-12-01"||
  gazettes.get("CTR26")?.effective_as_of_2026_10_17!==false)return false;
 const originals=new Map(ps.map(x=>[x.catalogue_id,x]));
 const codes=new Set(),known=new Set();let p0=0,p1=0,topic=0,identity=0,ctr=0,b60=0;
 for(const c of doc.cases){
  const old=originals.get(c.catalogue_id);
  if(!old||known.has(c.catalogue_id)||c.rank!==old.rank||
   c.priority!==old.priority||c.product_name!==old.product_name||
   c.analyte!==old.analyte||c.original_legal_gate!==old.original_legal_gate||
   JSON.stringify(c.original_request_ids)!==JSON.stringify(old.original_request_ids)||
   c.b59_research_state!==old.source_row_state||
   c.was_in_b60_pending20!==(old.reference===null)||
   c.actual_as_sold_identity_authenticated!==false||
   c.legal_case_article_approved!==false||c.numeric_ctr_comparator_approved!==false||
   c.method_lab_scope_approved!==false||c.lot_pass!==false||c.product_released!==false||
   !c.source_text_finding||!c.next_document)return false;
  known.add(c.catalogue_id);c.priority==="P0"?p0++:p1++;
  if(c.was_in_b60_pending20)b60++;
  if(c.original_source_topic_identified){
   topic++;
   if(!gazettes.has(c.original_gazette_subject_source_id))return false;
   if(c.source_review_status==="ORIGINAL_FPSFA_PRODUCT_IDENTITY_SUBJECT_ONLY")identity++;
   else if(c.source_review_status==="ORIGINAL_CTR_COFFEE_ROW_NOT_MIXTURE"||
    c.source_review_status==="ORIGINAL_CTR_HONEY_MRPL_NOT_ROYAL_JELLY")ctr++;
   else return false;
  }else if(c.original_gazette_subject_source_id!==null||
   c.source_review_status!=="ORIGINAL_FRAMEWORK_KNOWN_EXACT_CASE_ARTICLE_NOT_CONFIRMED")return false;
  for(const k of c.original_request_ids){if(codes.has(k))return false;codes.add(k);}
 }
 return known.size===35&&p0===13&&p1===22&&b60===20&&codes.size===175&&
  topic===8&&identity===6&&ctr===2&&doc.source_text_findings?.length===3&&
  doc.source_text_findings.every(c=>c.exact_product_application===false);
}
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const scopeOf=c=>c.source_review_status.startsWith("ORIGINAL_CTR_")?"CTR":c.source_review_status==="ORIGINAL_FPSFA_PRODUCT_IDENTITY_SUBJECT_ONLY"?"IDENTITY":"PENDING";
function filtered(){
 if(!valid())return[];
 const q=query.trim().toLowerCase();
 return doc.cases.filter(c=>(priority==="ALL"||c.priority===priority)&&
  (scope==="ALL"||scopeOf(c)===scope)&&
  (!q||[c.rank,c.product_name,c.analyte,c.source_text_finding,c.next_document,c.source_review_status]
   .some(x=>String(x??"").toLowerCase().includes(q))));
}
function options(items,current){return items.map(([k,v])=>'<option value="'+esc(k)+'"'+(k===current?" selected":"")+'>'+esc(v)+'</option>').join("");}
function row(c){
 const notice=doc.original_notices.find(n=>n.id===c.original_gazette_subject_source_id);
 const link=notice?'<small><a href="'+esc(notice.official_url)+'" target="_blank" rel="noopener noreferrer">Official original Gazette · '+esc(notice.id)+'</a> · '+esc(notice.verification.replaceAll("_"," "))+'</small>':
 '<small>Exact case-specific original clause still pending; original framework references above.</small>';
 return '<tr><td><b>'+esc(c.priority)+' #'+esc(c.rank)+'</b></td><td>'+
 esc(c.product_name)+'<small>'+esc(c.analyte)+' · '+esc(c.original_legal_gate)+'</small></td><td>'+
 esc(c.source_text_finding)+link+'</td><td>'+esc(c.next_document)+'</td>'+
 '<td><b>HELD</b><small>0 approvals · 0 PASS</small></td></tr>';
}
function panel(){
 return '<details class="card" id="pmsv-b61-original-gazette-audit" style="margin-bottom:12px">'+
 '<summary><b>Batch61 · Original Gazette + effective-date audit</b> — 35 cases retained, 8 source topics identified</summary>'+
 '<div class="notice"><b>0 case-specific regulatory approvals.</b> Official original Gazette verified ≠ actual as-sold product applicability. All 35 remain held.</div>'+
 '<p><b>Legal dates now established:</b> Original <a href="https://fssai.gov.in/upload/uploadfiles/files/2_Notification%20dt%2017_10_2024.pdf#page=17" target="_blank" rel="noopener noreferrer">2024 CTR Gazette</a> effective 1 April 2025. Original <a href="https://fssai.gov.in/upload/uploadfiles/files/272840.pdf#page=4" target="_blank" rel="noopener noreferrer">2026 CTR Gazette</a> starts 1 December 2026 — <b>not effective</b> for this review.</p>'+
 '<p><b>Verified source-subjects:</b> 6 FPSFA product-standard names (not CTR contaminant limits) plus 2 operative CTR related clauses: coffee OTA is not automatically a coffee–chicory mixture limit; honey-production antibiotic MRPL is not automatically a royal-jelly limit. Other 27 cases still need exact primary article mapping.</p>'+
 '<p><b>Source provenance:</b> 2 original FSSAI Gazette PDFs were directly inspected (2024, 2026); 3 older 2020 FSSAI original Gazette documents have indexed official titles/excerpts but their complete pages were not inspected in this batch. They must not be marked clause-verified.</p>'+
 '<div class="checker-grid"><div class="field"><label>Priority</label><select data-pmsv-b61-priority>'+
 options([["ALL","All 35"],["P0","P0 (13)"],["P1","P1 (22)"]],priority)+'</select></div>'+
 '<div class="field"><label>Original source topic</label><select data-pmsv-b61-scope>'+
 options([["ALL","All 35"],["CTR","Operative related CTR (2)"],["IDENTITY","FPSFA identity topics (6)"],["PENDING","Exact article not located (27)"]],scope)+'</select></div>'+
 '<div class="field"><label>Search source conclusion or product</label><input data-pmsv-b61-search maxlength="130" placeholder="e.g. honey, chia, cocoa"/></div></div>'+
 '<p><b data-pmsv-b61-count>35 held source reviews</b> · 175 inherited unsent original evidence gates.</p>'+
 '<div style="max-height:520px;overflow:auto"><table><thead><tr><th>Case</th><th>Commodity</th><th>What the original law/source actually establishes</th><th>Missing legal/manufacturer proof</th><th>Status</th></tr></thead><tbody data-pmsv-b61-rows></tbody></table></div>'+
 '<p><button type="button" data-pmsv-b61-export>Export original Gazette review (research only)</button></p>'+
 '<p class="countline">No numerical limit auto-applied, no CoA or lab accreditation inferred, no original document or signed legal decision received and no product released.</p></details>';
}
function refresh(){
 if(!valid()||typeof document==="undefined")return;
 let anchor=document.getElementById("pmsv-b60-operative-text-review");
 if(!anchor)return;
 let root=document.getElementById("pmsv-b61-original-gazette-audit");
 if(!root){anchor.insertAdjacentHTML("afterend",panel());root=document.getElementById("pmsv-b61-original-gazette-audit");}
 root.querySelector("[data-pmsv-b61-rows]").innerHTML=filtered().map(row).join("");
 root.querySelector("[data-pmsv-b61-count]").textContent=filtered().length+" case(s) held";
}
function csv(){
 if(!valid())return"";
 const col=["rank","priority","catalogue_product","analyte","original_ctr_gate","original_source_topic",
  "source_text_finding_not_case_limit","missing_proof","gazette_source","exact_case_legal_article_signed",
  "numerical_limit_approved","lab_scope_verified","lot_coa_pass","product_released"];
 const quote=x=>{let v=String(x??"");if(/^\s*[=+\-@]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';};
 const rows=filtered().map(c=>[c.rank,c.priority,c.product_name,c.analyte,c.original_legal_gate,
  c.source_review_status,c.source_text_finding,c.next_document,
  doc.original_notices.find(s=>s.id===c.original_gazette_subject_source_id)?.official_url||"",false,false,false,false,false]);
 return [col.map(quote).join(","),...rows.map(r=>r.map(quote).join(","))].join("\r\n")+"\r\n";
}
function download(){
 const url=URL.createObjectURL(new Blob(["\uFEFF"+csv()],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="PMSV-B61-ORIGINAL-GAZETTE-SCOPE-NO-RELEASE.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const previous=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await previous();doc=null;
 try{const r=await fetch(source+"?v=20261017-b61",{cache:"reload"});
  if(!r.ok)throw Error("B61 source missing");
  doc=await r.json();if(!valid())throw Error("B61 lineage invalid");refresh();
 }catch(_){doc=null;}
};
document.addEventListener("change",e=>{
 const t=e.target;
 if(t?.matches("[data-pmsv-b61-priority]")&&["ALL","P0","P1"].includes(t.value))priority=t.value;
 else if(t?.matches("[data-pmsv-b61-scope]")&&allowedScope.includes(t.value))scope=t.value;
 else return;refresh();
});
document.addEventListener("input",e=>{
 if(e.target?.matches("[data-pmsv-b61-search]")){query=String(e.target.value||"").slice(0,130);refresh();}
});
document.addEventListener("click",e=>{
 if(e.target?.closest("[data-pmsv-b61-export]")&&valid())download();
});
window.pmsvB61OriginalGazette={valid,filtered,csv,
 getCounts:()=>({cases:doc?.cases?.length||0,subjects:doc?.cases?.filter(c=>c.original_source_topic_identified).length||0,
  identity:doc?.cases?.filter(c=>scopeOf(c)==="IDENTITY").length||0,
  ctr:doc?.cases?.filter(c=>scopeOf(c)==="CTR").length||0,
  pending:doc?.cases?.filter(c=>scopeOf(c)==="PENDING").length||0,caseLimits:0,lotPasses:0})
};
})();