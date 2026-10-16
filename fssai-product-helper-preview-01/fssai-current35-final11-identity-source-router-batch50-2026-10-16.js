"use strict";
/* B50: eleven category/source reviews, four published named identity/recipe outcomes. No CTR/pass. */
var pmsvB50Data=null,pmsvB50Filter="ALL",pmsvB50Search="",pmsvB50Picked="";
const pmsvB50Path="./data/rules/fssai-current35-final11-identity-source-router-batch50-2026-10-16.json";
const pmsvB50Expected="68384891664328fc";
function pmsvB50Valid(){
 if(typeof pmsvB49Valid!=="function"||!pmsvB49Valid()||typeof pmsvB14Digest!=="function"||
 !pmsvB50Data||pmsvB14Digest(pmsvB50Data)!==pmsvB50Expected)return false;
 const d=pmsvB50Data,c=d.status_counts,n=pmsvB49Data.identity_screens;
 if(d.kind!=="PMSV_BATCH50_11_REMAINDER_PRIMARY_SOURCE_AND_LEGAL_IDENTITY_ROUTING"||
 d.as_of!=="2026-10-16"||d.environment!=="GH_PAGES_PREVIEW_ONLY"||
 c.total_catalogue!==533||c.conditional_first_source!==498||c.pending_exact_ctr_legal_article!==35||
 c.previously_named_published_product_identity!==24||c.new_named_product_or_recipe_positive!==4||
 c.cumulative_named_official_identities!==28||c.still_no_named_identity_after_review!==7||
 c.new_case_source_reviews!==11||c.new_special_closed_register_caution!==1||
 JSON.stringify(c.named_new_cases_rank_list)!==JSON.stringify([3,23,33,34])||
 c.individual_signed_legal_ctr_limits!==0||c.actual_lot_lab_passes!==0||
 c.current_175_legal_source_and_lot_gates_unchanged!==175||
 c.previous_280_lab_advice_unchanged!==280||c.previous_210_future_method_checks_unchanged!==210||
 c.wordpress_mutated!==false||
 d.new_remnant_case_reviews?.length!==11||d.current_35_case_crosswalk?.length!==35||
 d.key_cautions?.length!==9||d.sources?.length!==8||
 Object.values(d.no_pass_guards||{}).some(v=>v!==true))return false;
 const previous=new Map(n.map(x=>[x.catalogue_id,x]));
 const seen=new Set();let yes=0,no=0,closed=0;
 for(const x of d.new_remnant_case_reviews){
  const p=previous.get(x.catalogue_id);
  if(!p||seen.has(x.catalogue_id)||p.rank!==x.rank||
  p.product_name!==x.product_name||p.analyte!==x.analyte||
  p.verified_published_identity_sources_count!==0||
  x.previous_legal_gate!==p.unchanged_legal_article_gate||
  JSON.stringify(x.previous_all_gates)!==JSON.stringify(p.unchanged_five_gate_ids)||
  x.legal_source_limit_approved!==false||x.sold_product_verified!==false||x.lab_pass!==false||
  x.previous_catalogue_is_still_open!==true||x.unsent_review_draft!==true||
  !d.sources.some(z=>z.url===x.source_url)||!x.inspected_source_statement||
  !x.no_automatic_ctr_mapping||!x.needed_real_product_evidence)return false;
  if(x.authoritative_product_identity_known){yes++;if(![3,23,33,34].includes(x.rank))return false;}
  else no++;
  if(x.source_resolution==="CLOSED_APPLICATION_NOT_GENERAL_AUTHORITY"){closed++;if(x.rank!==24)return false;}
  seen.add(x.catalogue_id);
 }
 if(seen.size!==11||yes!==4||no!==7||closed!==1)return false;
 let truth=0;
 for(const x of d.current_35_case_crosswalk){
  const p=previous.get(x.catalogue_id),q=d.new_remnant_case_reviews.find(z=>z.catalogue_id===x.catalogue_id);
  if(!p||x.rank!==p.rank||x.product_name!==p.product_name||
  x.prior_legal_gate!==p.unchanged_legal_article_gate||
  x.current_ctr_legal_case_pending!==true||
  x.actual_commercial_product_verified!==false||
  x.ctr_limit_approved!==false||x.representative_lot_pass!==false||
  x.known_published_named_identity!==(!!p.verified_published_identity_sources_count||!!q?.authoritative_product_identity_known))return false;
  if(x.known_published_named_identity)truth++;
 }
 return truth===28;
}
function pmsvB50Rows(){
 if(!pmsvB50Valid())return [];
 const q=pmsvB50Search.toLowerCase().trim();
 return pmsvB50Data.new_remnant_case_reviews.filter(x=>
 (pmsvB50Filter==="ALL"||(pmsvB50Filter==="NAMED"&&x.authoritative_product_identity_known)||
 (pmsvB50Filter==="NOT_NAMED"&&!x.authoritative_product_identity_known))&&
 (!q||[x.catalogue_id,x.product_name,x.analyte,x.inspected_source_statement,x.needed_real_product_evidence].some(v=>String(v).toLowerCase().includes(q))));
}
function pmsvB50RowsHTML(){
 if(!pmsvB50Valid())return "";
 const e=pmsvB14Esc;
 return pmsvB50Rows().map(x=>'<tr><td><b>'+e(x.product_name)+'</b><small> '+e(x.catalogue_id)+'</small></td>'+
 '<td>'+e(x.analyte)+'</td><td>'+e(x.authoritative_product_identity_known?"Named standard/recipe":"Identity still needs evidence")+'</td>'+
 '<td><b>CTR open</b></td><td><button type="button" data-pmsv-b50-inspect="'+e(x.catalogue_id)+'">Inspect</button></td></tr>').join("");
}
function pmsvB50Detail(){
 const x=pmsvB50Data?.new_remnant_case_reviews?.find(c=>c.catalogue_id===pmsvB50Picked);
 const e=pmsvB14Esc;if(!x)return "";
 return '<div class="notice"><b>No current CTR lead/nickel/mycotoxin threshold or lot PASS approved.</b></div>'+
 '<p><b>Primary source finding:</b> '+e(x.inspected_source_statement)+'</p>'+
 '<p><b>Evidence class:</b> '+e(x.evidence_kind)+'</p>'+
 '<p><b>Source caution:</b> '+e(x.source_disposition)+'</p>'+
 '<p><b>Do not transfer:</b> '+e(x.no_automatic_ctr_mapping)+'</p>'+
 '<p><b>Next evidence:</b> '+e(x.needed_real_product_evidence)+'</p>'+
 '<p><a href="'+e(x.source_url)+'" rel="noopener noreferrer" target="_blank">Official FSSAI primary source</a> · '+
 '<a href="'+e(x.supporting_url)+'" rel="noopener noreferrer" target="_blank">Official context source</a></p>'+
 '<p><button type="button" data-pmsv-b50-copy="'+e(x.catalogue_id)+'">Copy UNSENT evidence request</button></p>'+
 '<div data-pmsv-b50-copy-status></div>';
}
function pmsvB50Draft(x){
 if(!pmsvB50Valid()||!pmsvB50Data.new_remnant_case_reviews.includes(x))return "";
 return ["UNSENT DRAFT — NOT VERIFIED COMPLIANCE",
 "Product: "+x.product_name,"Analyte: "+x.analyte,
 "Official document: "+x.source_authority,"Source: "+x.source_url,
 "Evidence and caveat: "+x.inspected_source_statement,"Do not automatically map: "+x.no_automatic_ctr_mapping,
 "Specific actual food/lot proof required: "+x.needed_real_product_evidence,
 "Current unresolved legal CTR evidence gate: "+x.previous_legal_gate,
 "Please provide operative exact regulation/commodity mapping, named impurity or residue, sample matrix/LOQ and legally signed result.",
 "No emails sent. No actual lab PASS or confirmed applicable legal CTR limit."].join("\n");
}
function pmsvB50CSV(rows){
 if(!pmsvB50Valid())return "";
 const esc=v=>{let s=String(v??"");if(/^\s*[+\-=@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const cols=["catalogue_id","product_name","analyte","source_resolution","named_source_verified","evidence_kind","source_url","source_page_1_based_if_available","primary_source_finding","nontransfer_caution","next_evidence","legal_article_gate","ctr_limit_approved","lot_pass"];
 const body=rows.map(x=>[x.catalogue_id,x.product_name,x.analyte,x.source_resolution,x.authoritative_product_identity_known,
 x.evidence_kind,x.source_url,x.pdf_page_zero_based!==null?x.pdf_page_zero_based+1:"",
 x.inspected_source_statement,x.no_automatic_ctr_mapping,x.needed_real_product_evidence,
 x.previous_legal_gate,x.legal_source_limit_approved,x.lab_pass]);
 return [cols.map(esc).join(","),...body.map(a=>a.map(esc).join(","))].join("\r\n")+"\r\n";
}
function pmsvB50Export(all){
 if(!pmsvB50Valid())return;
 const rows=all?pmsvB50Data.new_remnant_case_reviews:pmsvB50Rows();if(!rows.length)return;
 const u=URL.createObjectURL(new Blob(["\uFEFF",pmsvB50CSV(rows)],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=u;a.download="PMSV-B50-11-identity-and-legal-scope-"+(all?"all":"filtered")+".csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1200);
}
function pmsvB50Panel(){
 if(!pmsvB50Valid())return "";
 return '<details class="card" id="pmsv-b50-source-dispositions" style="margin-bottom:12px">'+
 '<summary><b>Batch50 · Remaining 11 cases: official identity or special permission?</b> — 28/35 named source reviews</summary>'+
 '<div class="notice"><b>Still 35 CTR legal/lot holds.</b> Four newly named product/recipe official sources: children’s supplements, trehalose and two Ayurveda recipes. Seven other umbrella/permission pathways lack exact actual identity, including Sajji Khar (closed application records do not establish a ban or approval). No unverified limit or false PASS.</div>'+
 '<p><button type="button" data-pmsv-b50-export="ALL">Export all 11</button> <button type="button" data-pmsv-b50-export="FILTERED">Export filtered</button></p>'+
 '<p><label>Search <input data-pmsv-b50-search type="search" placeholder="trehalose, enzyme, Ayurveda" /></label> '+
 '<label>Source class <select data-pmsv-b50-group><option value="ALL">All 11</option>'+
 '<option value="NAMED">4 named official identities</option>'+
 '<option value="NOT_NAMED">7 requiring specific identity</option></select></label></p>'+
 '<p data-pmsv-b50-count>11 cases, 0 CTR approvals</p>'+
 '<div class="tablewrap" style="max-height:480px;overflow:auto"><table><thead><tr>'+
 '<th>Product or regulatory category</th><th>Analyte</th><th>Source status</th><th>Legal</th><th>Action</th></tr></thead>'+
 '<tbody data-pmsv-b50-rows>'+pmsvB50RowsHTML()+'</tbody></table></div><div data-pmsv-b50-detail></div></details>';
}
function pmsvB50Refresh(){
 if(typeof document==="undefined"||!pmsvB50Valid())return;
 const host=document.getElementById("pmsv-b49-identity-additions")||document.getElementById("pmsv-b48-primary-identity");
 if(!host)return;
 const p=document.getElementById("pmsv-b50-source-dispositions");
 if(!p){host.insertAdjacentHTML("beforebegin",pmsvB50Panel());return;}
 const rows=p.querySelector("[data-pmsv-b50-rows]"),count=p.querySelector("[data-pmsv-b50-count]"),detail=p.querySelector("[data-pmsv-b50-detail]");
 if(rows)rows.innerHTML=pmsvB50RowsHTML();
 if(count)count.textContent=pmsvB50Rows().length+" shown; zero CTR legal approvals";
 if(detail)detail.innerHTML=pmsvB50Detail();
}
function pmsvB50Product(p){
 if(!p||!pmsvB50Valid())return "";
 const x=pmsvB50Data.new_remnant_case_reviews.find(z=>z.catalogue_id===p.id);
 if(!x||x.product_name!==p.name)return "";
 const e=pmsvB14Esc;
 return '<div class="notice"><b>Batch50 official-source status:</b> '+e(x.source_resolution)+
 '. '+e(x.inspected_source_statement)+
 ' <a target="_blank" rel="noopener noreferrer" href="'+e(x.source_url)+'">Official source</a>. '+
 '<b>Actual product / CTR / lab proof open; no PASS.</b></div>';
}
const pmsvB50EarlierLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB50EarlierLoad();pmsvB50Data=null;
 try{const r=await fetch(pmsvB50Path+"?v=20261016-b50",{cache:"reload"});if(!r.ok)throw Error("B50 source missing");
 pmsvB50Data=await r.json();if(!pmsvB50Valid())throw Error("B50 source integrity mismatch");
 pmsvB50Refresh();
 }catch(_){pmsvB50Data=null;}
};
const pmsvB50EarlierProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB50Product(p)+pmsvB50EarlierProduct(p);};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{if(ev.target?.matches?.("[data-pmsv-b50-search]")){
 pmsvB50Search=String(ev.target.value||"").slice(0,130);pmsvB50Picked="";pmsvB50Refresh();}});
 document.addEventListener("change",ev=>{if(ev.target?.matches?.("[data-pmsv-b50-group]")&&["ALL","NAMED","NOT_NAMED"].includes(ev.target.value)){
 pmsvB50Filter=ev.target.value;pmsvB50Picked="";pmsvB50Refresh();}});
 document.addEventListener("click",async ev=>{
 const view=ev.target?.closest?.("[data-pmsv-b50-inspect]");
 if(view){pmsvB50Picked=view.getAttribute("data-pmsv-b50-inspect");pmsvB50Refresh();return;}
 const exp=ev.target?.closest?.("[data-pmsv-b50-export]");
 if(exp){pmsvB50Export(exp.getAttribute("data-pmsv-b50-export")==="ALL");return;}
 const btn=ev.target?.closest?.("[data-pmsv-b50-copy]");
 if(!btn||!pmsvB50Valid())return;
 const x=pmsvB50Data.new_remnant_case_reviews.find(z=>z.catalogue_id===btn.getAttribute("data-pmsv-b50-copy"));
 const box=document.querySelector("#pmsv-b50-source-dispositions [data-pmsv-b50-copy-status]");
 if(!x||!box)return;
 try{if(!navigator.clipboard?.writeText)throw Error("Clipboard unavailable");
 await navigator.clipboard.writeText(pmsvB50Draft(x));box.textContent="Unsent draft copied.";
 }catch(_){box.textContent="Copy unavailable; unsent draft below:";
 const pre=document.createElement("pre");pre.style.whiteSpace="pre-wrap";pre.textContent=pmsvB50Draft(x);box.appendChild(pre);}
 });
}
