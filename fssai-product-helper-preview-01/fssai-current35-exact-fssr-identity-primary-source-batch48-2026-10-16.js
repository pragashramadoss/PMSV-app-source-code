"use strict";
/* Batch48: FSSR product identity positive source is NOT a CTR legal article or tested-lot PASS. */
var pmsvB48Data=null,pmsvB48Term="",pmsvB48SourceGroup="VERIFIED",pmsvB48Selected="";
const pmsvB48Path="./data/rules/fssai-current35-exact-fssr-identity-primary-source-batch48-2026-10-16.json";
const pmsvB48Expected="5d11719448fdfe05";
function pmsvB48Valid(){
 if(typeof pmsvB47Valid!=="function"||!pmsvB47Valid()||typeof pmsvB14Digest!=="function"||!pmsvB48Data||
 pmsvB14Digest(pmsvB48Data)!==pmsvB48Expected)return false;
 const d=pmsvB48Data,n=d.counts;
 if(d.kind!=="PMSV_CURRENT35_FSSR_IDENTITY_CTR_NONTRANSFER_PRIMARY_SOURCE_BATCH48"||
 d.as_of!=="2026-10-16"||d.environment!=="GH_PAGES_PREVIEW_ONLY"||
 n.catalog!==533||n.conditional_source_matches!==498||n.first_exact_ctr_pending!==35||
 n.direct_published_identity_clauses!==14||n.untouched_pending_cases!==21||
 n.distinct_pdf_chapters!==5||
 n.verified_sold_product_documents_received!==0||
 n.exact_ctr_metal_toxin_residue_limits_approved!==0||n.matrix_validated_lab_reports_received!==0||
 n.actual_lot_passes!==0||n.older_175_unsent_gates_preserved!==175||
 n.older_280_lab_prompts_preserved!==280||n.older_210_future_law_review_prompts_preserved!==210||
 n.wordpress_changed!==false||d.case_dossiers?.length!==35||
 d.critical_findings?.length!==6||d.source_docs?.length!==6||
 Object.values(d.results||{}).some(x=>x!==true))return false;
 const byId=new Map(pmsvB44Data.case_gate_dossiers.map(x=>[x.catalogue_id,x]));
 const seen=new Set();let verified=0;
 for(const c of d.case_dossiers){
  const p=byId.get(c.catalogue_id);
  if(!p||seen.has(c.catalogue_id)||c.rank!==p.rank||c.product_name!==p.product_name||
  c.fssr!==p.fssr||c.fcs!==p.fcs||c.analyte!==p.analyte||c.analyte_family!==p.analyte_family||
  c.inherited_product_gate!==p.new_five_gate_ids[1]||
  c.inherited_legal_gate!==p.new_five_gate_ids[2]||c.inherited_lab_gate!==p.new_five_gate_ids[3]||
  c.commercial_product_identity_verified!==false||c.actual_legal_ctr_article_verified!==false||
  c.lot_lab_pass!==false||c.advisory_only!==true)return false;
  const s=c.identity_primary_clauses;
  if(!Array.isArray(s)||s.length>1)return false;
  if(s.length){
   verified++;
   const x=s[0];
   if(c.identity_source_status!=="NAMED_PUBLISHED_FSSR_CLAUSE_DIRECTLY_CHECKED"||
   c.identity_source_pdf_page_verified!==true||!x.source_verified_published_text||
   !d.source_docs.some(z=>z.url===x.source_url&&z.key!=="ctr")||
   x.fssr_clause!==c.fssr||x.pdf_page_zero_based<0||
   !x.primary_identity_finding||!x.false_ctr_analogy_to_block||
   !x.real_sample_evidence_needed)return false;
  }else if(c.identity_source_status!=="PREVIOUS_REVIEW_ONLY_NOT_SOURCE_PROMOTED_IN_BATCH48"||
  c.identity_source_pdf_page_verified!==false)return false;
  seen.add(c.catalogue_id);
 }
 const pending=new Set(pmsvB47Data.current_pending.map(x=>x.catalogue_id));
 return seen.size===35&&verified===14&&[...seen].every(id=>pending.has(id));
}
function pmsvB48Rows(){
 if(!pmsvB48Valid())return [];
 const q=pmsvB48Term.toLowerCase().trim();
 return pmsvB48Data.case_dossiers.filter(c=>
 (pmsvB48SourceGroup==="ALL"||
 (pmsvB48SourceGroup==="VERIFIED"&&c.identity_primary_clauses.length===1)||
 (pmsvB48SourceGroup==="REMAINING"&&c.identity_primary_clauses.length===0))&&
 (!q||[c.catalogue_id,c.product_name,c.analyte,c.existing_legal_question,c.evidence_required].some(x=>String(x).toLowerCase().includes(q))));
}
function pmsvB48CSV(rows){
 if(!pmsvB48Valid())return "";
 const enc=v=>{let s=String(v??"");if(/^\s*[+\-=@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const cols=["catalogue_id","product_name","analyte","fssr","fcs","identity_source_status","identity_fssr_pdf_url","identity_pdf_page_1based","primary_fssr_identity_finding","false_ctr_comparator_to_block","commercial_evidence_required","legacy_legal_ctr_gate","commercial_identity_verified","ctr_limit_verified","lot_pass"];
 const rows2=rows.map(c=>{const x=c.identity_primary_clauses[0];
 return [c.catalogue_id,c.product_name,c.analyte,c.fssr,c.fcs,c.identity_source_status,x?.source_url,
 x?x.pdf_page_zero_based+1:"",x?.primary_identity_finding,c.remaining_nontransfer_scope,c.evidence_required,
 c.inherited_legal_gate,c.commercial_product_identity_verified,c.actual_legal_ctr_article_verified,c.lot_lab_pass];});
 return [cols.map(enc).join(","),...rows2.map(row=>row.map(enc).join(","))].join("\r\n")+"\r\n";
}
function pmsvB48Download(all){
 if(!pmsvB48Valid())return;
 const rows=all?pmsvB48Data.case_dossiers:pmsvB48Rows();if(!rows.length)return;
 const u=URL.createObjectURL(new Blob(["\uFEFF",pmsvB48CSV(rows)],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=u;a.download="PMSV-B48-FSSR-identity-CTR-open-"+(all?"all35":"filtered")+".csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1200);
}
function pmsvB48Draft(c){
 if(!pmsvB48Valid()||!pmsvB48Data.case_dossiers.includes(c))return "";
 const x=c.identity_primary_clauses[0];
 return ["UNSENT / UNAPPROVED — no product release authority","Product: "+c.product_name,"Analyte: "+c.analyte,
 "Known FSSR identity clause: "+(x?.fssr_clause||"none new in this batch"),
 "Official FSSR product identity source: "+(x?.source_url||"not newly reviewed"),
 "Published product identity: "+(x?.primary_identity_finding||"no positive new source this batch"),
 "Misleading CTR analogy to avoid: "+c.remaining_nontransfer_scope,
 "Actual manufacturer/product evidence required: "+c.evidence_required,
 "Underlying legal gate: "+c.inherited_legal_gate,
 "Obtain current CTR precise legal article and limit, correct analytical sample basis, validated lab method and signed representative lot CoA.",
 "Zero signed CTR article decisions, zero current lot compliance PASS."].join("\n");
}
function pmsvB48RowsHTML(){
 if(!pmsvB48Valid())return "";
 const e=pmsvB14Esc;return pmsvB48Rows().map(c=>
 '<tr><td><b>'+e(c.product_name)+'</b><small> '+e(c.catalogue_id)+'</small></td>'+
 '<td>'+e(c.analyte)+'</td><td>'+e(c.identity_primary_clauses.length?"FSSR clause checked":"Not new source")+'</td>'+
 '<td><b>CTR still open</b></td>'+
 '<td><button type="button" data-pmsv-b48-inspect="'+e(c.catalogue_id)+'">Inspect</button></td></tr>').join("");
}
function pmsvB48Details(){
 const c=pmsvB48Data?.case_dossiers?.find(x=>x.catalogue_id===pmsvB48Selected),e=pmsvB14Esc;if(!c)return "";
 const x=c.identity_primary_clauses[0];
 return '<div class="notice"><b>Identity source verified ≠ actual product verified ≠ CTR limit approved.</b></div>'+
 (x?'<p><b>Published FSSR '+e(x.fssr_clause)+':</b> '+e(x.primary_identity_finding)+'</p>'+
 '<p><a target="_blank" rel="noopener noreferrer" href="'+e(x.source_url)+'">FSSAI published product standard · PDF page '+e(x.pdf_page_zero_based+1)+'</a></p>':'<p>No new positive primary clause in this batch.</p>')+
 '<p><b>Invalid comparator:</b> '+e(c.remaining_nontransfer_scope)+'</p>'+
 '<p><b>Still need:</b> '+e(c.evidence_required)+'</p>'+
 '<p><button type="button" data-pmsv-b48-copy="'+e(c.catalogue_id)+'">Copy UNSENT evidence review</button></p>'+
 '<div data-pmsv-b48-copy-status></div>';
}
function pmsvB48Panel(){
 if(!pmsvB48Valid())return "";
 return '<details id="pmsv-b48-primary-identity" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch48 · Original FSSR identity clauses</b> — 14 source-verified, 21 still need primary search</summary>'+
 '<div class="notice"><b>No compliance clearance:</b> The published food standard is an identity/quality document, NOT proof of the actual marketed formulation, legal CTR article, laboratory qualification or representative lot PASS. All 35 CTR cases remain blocked. If a compiled chapter conflicts with notified Gazette, the operative gazette prevails.</div>'+
 '<p><button type="button" data-pmsv-b48-export="ALL">Export all 35 dossiers</button> '+
 '<button type="button" data-pmsv-b48-export="FILTERED">Export filtered</button></p>'+
 '<p><label>Search <input type="search" data-pmsv-b48-search placeholder="cocoa, lactose, lead" /></label> '+
 '<label>Source review <select data-pmsv-b48-group><option value="VERIFIED">14 direct FSSR clauses</option>'+
 '<option value="REMAINING">21 remaining for new source research</option><option value="ALL">All 35 pending</option></select></label></p>'+
 '<p data-pmsv-b48-count>'+pmsvB48Rows().length+' legal CTR decisions still pending</p>'+
 '<div class="tablewrap" style="max-height:480px;overflow:auto"><table><thead><tr>'+
 '<th>Product</th><th>Analyte</th><th>FSSR source</th><th>CTR</th><th>Review</th></tr></thead>'+
 '<tbody data-pmsv-b48-rows>'+pmsvB48RowsHTML()+'</tbody></table></div>'+
 '<div data-pmsv-b48-detail></div></details>';
}
function pmsvB48Refresh(){
 if(typeof document==="undefined"||!pmsvB48Valid())return;
 const host=document.getElementById("pmsv-b47-may-gazette")||document.getElementById("pmsv-b46-future-law");if(!host)return;
 let panel=document.getElementById("pmsv-b48-primary-identity");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB48Panel());return;}
 const rows=panel.querySelector("[data-pmsv-b48-rows]"),ct=panel.querySelector("[data-pmsv-b48-count]"),detail=panel.querySelector("[data-pmsv-b48-detail]");
 if(rows)rows.innerHTML=pmsvB48RowsHTML();
 if(ct)ct.textContent=pmsvB48Rows().length+" pending legal CTR cases; zero source/lab approvals";
 if(detail)detail.innerHTML=pmsvB48Details();
}
function pmsvB48Product(p){
 if(!p||!pmsvB48Valid())return "";
 const c=pmsvB48Data.case_dossiers.find(x=>x.catalogue_id===p.id);
 if(!c||c.product_name!==p.name||String(c.fssr||"")!==String(p.fssr||"")||
 String(c.fcs||"")!==String(p.fcs||""))return "";
 const x=c.identity_primary_clauses[0];if(!x)return "";
 const e=pmsvB14Esc;
 return '<div class="notice"><b>Batch48 official FSSR '+e(x.fssr_clause)+'</b> · '+e(x.primary_identity_finding)+
 ' <a href="'+e(x.source_url)+'" target="_blank" rel="noopener noreferrer">FSSAI published chapter</a>. '+
 '<b>Actual product, CTR and lab decision all remain OPEN.</b></div>';
}
const pmsvB48OldLoader=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB48OldLoader();pmsvB48Data=null;
 try{const r=await fetch(pmsvB48Path+"?v=20261016-b48",{cache:"reload"});
 if(!r.ok)throw Error("B48 data unavailable");pmsvB48Data=await r.json();
 if(!pmsvB48Valid())throw Error("B48 source/ledger digest invalid");
 pmsvB48Refresh();
 }catch(_){pmsvB48Data=null;}
};
const pmsvB48OldProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB48Product(p)+pmsvB48OldProduct(p);};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{if(ev.target?.matches?.("[data-pmsv-b48-search]")){
 pmsvB48Term=String(ev.target.value||"").slice(0,120);pmsvB48Selected="";pmsvB48Refresh();}});
 document.addEventListener("change",ev=>{if(ev.target?.matches?.("[data-pmsv-b48-group]")&&["VERIFIED","REMAINING","ALL"].includes(ev.target.value)){
 pmsvB48SourceGroup=ev.target.value;pmsvB48Selected="";pmsvB48Refresh();}});
 document.addEventListener("click",async ev=>{
 const b=ev.target?.closest?.("[data-pmsv-b48-inspect]");
 if(b){pmsvB48Selected=b.getAttribute("data-pmsv-b48-inspect");pmsvB48Refresh();return;}
 const exp=ev.target?.closest?.("[data-pmsv-b48-export]");
 if(exp){pmsvB48Download(exp.getAttribute("data-pmsv-b48-export")==="ALL");return;}
 const copy=ev.target?.closest?.("[data-pmsv-b48-copy]");
 if(!copy||!pmsvB48Valid())return;
 const c=pmsvB48Data.case_dossiers.find(x=>x.catalogue_id===copy.getAttribute("data-pmsv-b48-copy"));
 const status=document.querySelector("#pmsv-b48-primary-identity [data-pmsv-b48-copy-status]");
 if(!c||!status)return;
 try{if(!navigator.clipboard?.writeText)throw Error("No clipboard");
 await navigator.clipboard.writeText(pmsvB48Draft(c));status.textContent="UNSENT review copied.";
 }catch(_){status.textContent="Copy unavailable; UNSENT review follows.";
 const pre=document.createElement("pre");pre.textContent=pmsvB48Draft(c);pre.style.whiteSpace="pre-wrap";status.appendChild(pre);}
 });
}
