"use strict";
/* B49: 10 exact FSSR product identity pages. NO CTR threshold, authority or lot pass. */
var pmsvB49Data=null,pmsvB49Search="",pmsvB49Group="NEW",pmsvB49Selected="";
const pmsvB49Path="./data/rules/fssai-current35-additional10-fssr-identity-batch49-2026-10-16.json";
const pmsvB49Expected="3857b93aeeaf737d";
function pmsvB49Valid(){
 if(typeof pmsvB48Valid!=="function"||!pmsvB48Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB49Data||
 pmsvB14Digest(pmsvB49Data)!==pmsvB49Expected)return false;
 const d=pmsvB49Data,r=d.research_counts,n=d.live_counts,prior=pmsvB48Data.case_dossiers;
 if(d.kind!=="PMSV_CURRENT35_ADDITIONAL10_FSSR_IDENTITY_NO_CTR_PROMOTION_BATCH49"||
 d.as_of!=="2026-10-16"||d.environment!=="GH_PAGES_PREVIEW_ONLY"||
 n.catalogue!==533||n.conditional_first_source!==498||n.first_exact_ctr_pending!==35||
 n.full_compliance_approvals!==0||r.batch48_verified_identity!==14||r.batch49_new_identity!==10||
 r.cumulative_distinct_published_identities!==24||r.remaining_new_identity_source_pending!==11||
 r.new_pdf_chapter_families!==6||r.all35_ctr_cases_still_open!==35||
 r.current_regulatory_ctr_maxima_approved!==0||r.real_sold_product_formulations_received!==0||
 r.validated_analytical_methods_approved!==0||r.representative_lot_passes!==0||
 r.previous_175_unsent_documentary_gates_preserved!==175||
 r.previous_280_advisory_lab_checks_preserved!==280||
 r.previous_210_future_law_review_prompts_preserved!==210||
 r.wordpress_mutated!==false||d.directly_inspected_fssai_chapters?.length!==6||
 d.identity_screens?.length!==35||d.nine_high_value_boundaries?.length!==9||
 Object.values(d.results||{}).some(v=>v!==true)||
 Object.values(d.verification_policy||{}).some(v=>v!==true))return false;
 const byId=new Map(prior.map(x=>[x.catalogue_id,x]));let new10=0,retained14=0,untouched11=0;
 const seen=new Set();
 for(const x of d.identity_screens){
  const p=byId.get(x.catalogue_id);
  if(!p||seen.has(x.catalogue_id)||p.rank!==x.rank||p.product_name!==x.product_name||
  p.fssr!==x.fssr||p.fcs!==x.fcs||p.analyte!==x.analyte||
  x.unchanged_legal_article_gate!==p.inherited_legal_gate||
  JSON.stringify(x.unchanged_five_gate_ids)!==JSON.stringify(p.linked_prior_documentary_gates)||
  x.manufacturer_identity_and_recipe_received!==false||
  x.legal_ctr_article_and_maximum_verified!==false||
  x.validated_lab_method_confirmed!==false||
  x.actual_tested_lot_pass!==false||x.identity_only_not_compliance!==true||
  x.source_classification!=="PUBLISHED_PRODUCT_STANDARD_ONLY_NOT_CTR_AUTHORITY")return false;
  const b48=p.identity_primary_clauses?.[0],s=x.new_batch49_source;
  if(!!b48!==!!x.retained_batch48_reference)return false;
  if(b48){
   retained14++;
   if(x.retained_batch48_reference?.source_url!==b48.source_url||
   x.retained_batch48_reference?.pdf_page_zero_based!==b48.pdf_page_zero_based||
   x.safe_review_status!=="B48_FSSR_IDENTITY_RETAINED_CTR_STILL_OPEN")return false;
  }
  if(s){
   new10++;
   if(b48||x.safe_review_status!=="FSSR_IDENTITY_VERIFIED_CTR_STILL_OPEN"||
   s.authority!=="FSSAI"||s.official_source_page_visually_checked!==true||
   !s.source_url.startsWith("https://")||!s.product_identity_clause||
   !s.published_product_identity_fact||!s.contaminant_comparator_not_automatically_applicable||
   !s.missing_actual_documentary_evidence||
   !d.directly_inspected_fssai_chapters.some(z=>z.url===s.source_url)||
   x.verified_published_identity_sources_count!==1)return false;
  }else if(!b48){
   untouched11++;
   if(x.safe_review_status!=="PENDING_PRODUCT_IDENTITY_PRIMARY_SOURCE"||
   x.verified_published_identity_sources_count!==0)return false;
  }
  seen.add(x.catalogue_id);
 }
 return seen.size===35&&new10===10&&retained14===14&&untouched11===11;
}
function pmsvB49Rows(){
 if(!pmsvB49Valid())return [];
 const q=pmsvB49Search.trim().toLowerCase();
 return pmsvB49Data.identity_screens.filter(x=>
 (pmsvB49Group==="ALL"||(pmsvB49Group==="NEW"&&!!x.new_batch49_source)||
 (pmsvB49Group==="PRIOR"&&!!x.retained_batch48_reference)||
 (pmsvB49Group==="OPEN"&&x.verified_published_identity_sources_count===0))&&
 (!q||[x.catalogue_id,x.product_name,x.analyte,x.new_batch49_source?.published_product_identity_fact||""].some(z=>String(z).toLowerCase().includes(q))));
}
function pmsvB49RowsHTML(){
 if(!pmsvB49Valid())return "";
 const e=pmsvB14Esc;
 return pmsvB49Rows().map(x=>'<tr><td><b>'+e(x.product_name)+'</b><small> '+e(x.catalogue_id)+'</small></td><td>'+
 e(x.analyte)+'</td><td>'+
 e(x.new_batch49_source?"New verified FSSR":x.retained_batch48_reference?"Earlier FSSR":"Not newly sourced")+
 '</td><td><b>CTR OPEN</b></td><td><button type="button" data-pmsv-b49-view="'+e(x.catalogue_id)+'">Review</button></td></tr>').join("");
}
function pmsvB49Detail(){
 const x=pmsvB49Data?.identity_screens?.find(y=>y.catalogue_id===pmsvB49Selected),e=pmsvB14Esc;if(!x)return "";
 const s=x.new_batch49_source;
 return '<div class="notice"><b>FSSR identity is not a verified CTR analyte maximum or PASS.</b></div>'+
 (s?'<p><b>FSSR '+e(s.product_identity_clause)+':</b> '+e(s.published_product_identity_fact)+'</p>'+
 '<p><a href="'+e(s.source_url)+'" target="_blank" rel="noopener noreferrer">FSSAI source · PDF p. '+e(s.pdf_page_zero_based+1)+'</a></p>'+
 '<p><b>Invalid transfer:</b> '+e(s.contaminant_comparator_not_automatically_applicable)+'</p>'+
 '<p><b>Needed:</b> '+e(s.missing_actual_documentary_evidence)+'</p>':
 x.retained_batch48_reference?'<p>Retained direct published source from Batch 48. No new claim this batch.</p>':
 '<p>Published identity source not newly verified; preserve open CTR case.</p>')+
 '<p><button type="button" data-pmsv-b49-copy="'+e(x.catalogue_id)+'">Copy UNSENT documentary request</button></p><div data-pmsv-b49-copy-status></div>';
}
function pmsvB49Draft(x){
 if(!pmsvB49Valid()||!pmsvB49Data.identity_screens.includes(x))return "";
 const s=x.new_batch49_source;return [
 "DRAFT / NOT SENT / NOT A REGULATORY APPROVAL",
 "Product: "+x.product_name,"Analyte: "+x.analyte,"Exact FSSR clause: "+(s?.product_identity_clause||"no new verified source"),
 "Published PDF source: "+(s?.source_url||x.retained_batch48_reference?.source_url||"pending"),
 "Published commodity standard: "+(s?.published_product_identity_fact||"retain earlier evidence"),
 "Forbidden automatic legal mapping: "+(s?.contaminant_comparator_not_automatically_applicable||"any unverified CTR commodity transfer"),
 "Need actual commercial evidence: "+(s?.missing_actual_documentary_evidence||"manufacturer formulation / source and exact commodity"),
 "Unresolved CTR legal article gate: "+x.unchanged_legal_article_gate,
 "Request signed current legal CTR commodity/limit assessment and accredited matrix method; representative sampled lot test required.",
 "NO actual lot PASS, NO automatic legal article approved."].join("\n");
}
function pmsvB49CSV(rows){
 if(!pmsvB49Valid())return "";
 const esc=z=>{let s=String(z??"");if(/^\s*[+\-=@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const headers=["catalogue_id","product_name","analyte","fssr","fcs","source_state","fssr_clause","fssr_pdf","fssr_pdf_page","published_product_identity","invalid_ctr_analogy","needed_commercial_evidence","legal_gate_id","commercial_identity_verified","ctr_article_approved","lot_pass"];
 const body=rows.map(x=>{const s=x.new_batch49_source;
 return [x.catalogue_id,x.product_name,x.analyte,x.fssr,x.fcs,x.safe_review_status,s?.product_identity_clause||x.retained_batch48_reference?.fssr_clause,
 s?.source_url||x.retained_batch48_reference?.source_url,
 s?s.pdf_page_zero_based+1:x.retained_batch48_reference?x.retained_batch48_reference.pdf_page_zero_based+1:"",
 s?.published_product_identity_fact||x.retained_batch48_reference?.identity_finding,
 s?.contaminant_comparator_not_automatically_applicable,s?.missing_actual_documentary_evidence,
 x.unchanged_legal_article_gate,x.manufacturer_identity_and_recipe_received,x.legal_ctr_article_and_maximum_verified,x.actual_tested_lot_pass]});
 return [headers.map(esc).join(","),...body.map(row=>row.map(esc).join(","))].join("\r\n")+"\r\n";
}
function pmsvB49Export(all){
 if(!pmsvB49Valid())return;
 const rows=all?pmsvB49Data.identity_screens:pmsvB49Rows();if(!rows.length)return;
 const u=URL.createObjectURL(new Blob(["\uFEFF",pmsvB49CSV(rows)],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=u;a.download="PMSV-B49-35-CTR-FSSR-identity-"+(all?"all":"filtered")+".csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1700);
}
function pmsvB49Panel(){
 if(!pmsvB49Valid())return "";
 return '<details id="pmsv-b49-identity-additions" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch49 · Ten more published FSSR identity proofs</b> — 24/35 sourced, CTR still open</summary>'+
 '<div class="notice"><b>Important:</b> 14 prior + 10 new named FSSR product clauses checked on actual FSSAI PDF pages. 11 still without a new direct identity citation. None of these are a CTR contaminant maximum, commercial sample proof or lab PASS. Total current first-source status remains <b>498 conditional / 35 pending</b>.</div>'+
 '<p><button type="button" data-pmsv-b49-export="ALL">Export all 35</button> '+
 '<button type="button" data-pmsv-b49-export="FILTERED">Export filtered</button></p>'+
 '<p><label>Search <input data-pmsv-b49-search type="search" placeholder="cocoa, egg, salt" /></label> '+
 '<label>Source group <select data-pmsv-b49-group><option value="NEW">10 newly verified</option>'+
 '<option value="PRIOR">14 from prior batch</option><option value="OPEN">11 still missing direct source</option>'+
 '<option value="ALL">All 35 legal holds</option></select></label></p>'+
 '<p data-pmsv-b49-count>10 cases; zero new legal clearances</p>'+
 '<div class="tablewrap" style="max-height:510px;overflow:auto"><table><thead><tr>'+
 '<th>Commodity</th><th>Analyte</th><th>Product-source state</th><th>Legal limit</th><th>Source</th></tr></thead>'+
 '<tbody data-pmsv-b49-rows>'+pmsvB49RowsHTML()+'</tbody></table></div>'+
 '<div data-pmsv-b49-detail></div></details>';
}
function pmsvB49Refresh(){
 if(typeof document==="undefined"||!pmsvB49Valid())return;
 const host=document.getElementById("pmsv-b48-primary-identity")||document.getElementById("pmsv-b47-may-gazette");
 if(!host)return;
 let el=document.getElementById("pmsv-b49-identity-additions");
 if(!el){host.insertAdjacentHTML("beforebegin",pmsvB49Panel());return;}
 const rows=el.querySelector("[data-pmsv-b49-rows]"),ct=el.querySelector("[data-pmsv-b49-count]"),detail=el.querySelector("[data-pmsv-b49-detail]");
 if(rows)rows.innerHTML=pmsvB49RowsHTML();
 if(ct)ct.textContent=pmsvB49Rows().length+" shown; 35 still open CTR; zero PASS";
 if(detail)detail.innerHTML=pmsvB49Detail();
}
function pmsvB49Product(p){
 if(!p||!pmsvB49Valid())return "";
 const x=pmsvB49Data.identity_screens.find(z=>z.catalogue_id===p.id);
 if(!x||x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||"")||!x.new_batch49_source)return "";
 const s=x.new_batch49_source,e=pmsvB14Esc;
 return '<div class="notice"><b>Batch49 FSSR '+e(s.product_identity_clause)+'</b> '+e(s.published_product_identity_fact)+
 ' <a href="'+e(s.source_url)+'" target="_blank" rel="noopener noreferrer">Official FSSAI PDF p. '+
 e(s.pdf_page_zero_based+1)+'</a>. <b>CTR limit / matrix / lot all unapproved.</b></div>';
}
const pmsvB49PreviousLoader=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB49PreviousLoader();pmsvB49Data=null;
 try{const r=await fetch(pmsvB49Path+"?v=20261016-b49",{cache:"reload"});if(!r.ok)throw Error("B49 unavailable");
 pmsvB49Data=await r.json();if(!pmsvB49Valid())throw Error("B49 integrity failed");
 pmsvB49Refresh();
 }catch(_){pmsvB49Data=null;}
};
const pmsvB49PreviousProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB49Product(p)+pmsvB49PreviousProduct(p);};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{if(ev.target?.matches?.("[data-pmsv-b49-search]")){
 pmsvB49Search=String(ev.target.value||"").slice(0,120);pmsvB49Selected="";pmsvB49Refresh();}});
 document.addEventListener("change",ev=>{if(ev.target?.matches?.("[data-pmsv-b49-group]")&&
 ["NEW","PRIOR","OPEN","ALL"].includes(ev.target.value)){
 pmsvB49Group=ev.target.value;pmsvB49Selected="";pmsvB49Refresh();}});
 document.addEventListener("click",async ev=>{
 const btn=ev.target?.closest?.("[data-pmsv-b49-view]");
 if(btn){pmsvB49Selected=btn.getAttribute("data-pmsv-b49-view");pmsvB49Refresh();return;}
 const exp=ev.target?.closest?.("[data-pmsv-b49-export]");
 if(exp){pmsvB49Export(exp.getAttribute("data-pmsv-b49-export")==="ALL");return;}
 const cp=ev.target?.closest?.("[data-pmsv-b49-copy]");
 if(!cp||!pmsvB49Valid())return;
 const x=pmsvB49Data.identity_screens.find(z=>z.catalogue_id===cp.getAttribute("data-pmsv-b49-copy"));
 const label=document.querySelector("#pmsv-b49-identity-additions [data-pmsv-b49-copy-status]");
 if(!x||!label)return;
 try{if(!navigator.clipboard?.writeText)throw Error("unavailable");
 await navigator.clipboard.writeText(pmsvB49Draft(x));label.textContent="Unsent review copied.";
 }catch(_){label.textContent="Clipboard unavailable; UNSENT review below:";
 const p=document.createElement("pre");p.textContent=pmsvB49Draft(x);p.style.whiteSpace="pre-wrap";label.appendChild(p);}
 });
}
