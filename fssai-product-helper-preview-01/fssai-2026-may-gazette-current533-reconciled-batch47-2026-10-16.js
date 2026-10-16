"use strict";
/* B47: source-verified May 2026 CTR 1 Dec 2026; reconcile 533/498/35. Never silently amend present limits. */
var pmsvB47Data=null,pmsvB47Query="",pmsvB47Family="ALL",pmsvB47Status="ALL",pmsvB47Selected="";
const pmsvB47Path="./data/rules/fssai-2026-may-gazette-current533-reconciled-batch47-2026-10-16.json";
const pmsvB47Expected="a1fb4652b9c859cf";
const pmsvB47FamilyCodes=["pulse_metal_article_expansion","fish_oil_inorganic_arsenic","oilseed_aflatoxin_article_wording","mace_nutmeg_saffrole","seafood_veterinary_drug_residues"];
function pmsvB47Valid(){
 if(typeof pmsvB46Valid!=="function"||!pmsvB46Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB47Data||
 pmsvB14Digest(pmsvB47Data)!==pmsvB47Expected)return false;
 const d=pmsvB47Data,n=d.counts,s=d.source_chain;
 if(d.kind!=="PMSV_BATCH47_MAY2026_PRIMARY_GAZETTE_533_498_35_RECONCILIATION"||
 d.as_of!=="2026-10-16"||d.environment!=="GH_PAGES_PREVIEW_ONLY"||
 s?.official_gazette_pdf!=="https://www.fssai.gov.in/upload/uploadfiles/files/272840.pdf"||
 s.official_may_amendment_verified_from_original!==true||
 s.effective_date!=="2026-12-01"||s.review_date!=="2026-10-16"||
 s.in_force_on_review_date!==false||s.ledger_is_current_source_of_truth_for_status!==true||
 s.base_ctr_compendium_url!==pmsv498Ledger.official_contaminants_source||
 n?.catalogue!==533||n.partial_source_match!==498||n.first_source_pending!==35||
 n.historical_old_partial!==444||n.historical_old_pending!==89||n.historical_status_delta!==54||
 n.future_explicit_watch_products!==31||n.without_named_watch!==502||
 n.watch_pulses!==4||n.watch_fish_oil!==1||n.watch_oilseed!==2||
 n.watch_spice!==2||n.watch_seafood!==22||
 n.direct_overlap_watch_with_pending!==0||n.pending_without_direct_watch!==35||
 n.amendment_clause_changes!==9||n.amendment_families!==5||
 n.numeric_futures_available_only_as_reference!==4||
 n.new_regulatory_source_promotions!==0||n.legal_limits_auto_activated!==0||
 n.lot_passes!==0||n.full_compliance_approvals!==0||n.wordpress_changed!==false||
 d.families?.length!==5||d.amendment_provisions?.length!==9||
 d.catalogue_crosswalk?.length!==533||d.explicit_watches?.length!==31||
 d.current_pending?.length!==35||
 Object.values(d.results||{}).some(x=>x!==true))return false;
 if(d.families.some((x,i)=>x.code!==pmsvB47FamilyCodes[i]))return false;
 if(!Array.isArray(pmsv498Ledger?.records)||pmsv498Ledger.records.length!==533||pmsv498Ledger.first_source_pending!==35)return false;
 const byId=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x]));
 const currentPending=new Set(),watches=new Set();let matched=0,pending=0,freq={};
 for(const x of d.catalogue_crosswalk){
  const l=byId.get(x.catalogue_id);
  if(!l||l.product_name!==x.product_name||l.source_status!==x.current_source_status||
  l.fssr!==x.fssr||l.fcs!==x.fcs||
  x.zero_current_source_approval!==true||x.current_full_compliance_approved!==false||
  !Array.isArray(x.future_watch_families)||
  x.future_watch_families.some(id=>!pmsvB47FamilyCodes.includes(id)))return false;
  if(x.current_source_status==="FIRST_EXACT_SOURCE_PENDING"){pending++;currentPending.add(x.catalogue_id);}
  else if(x.current_source_status==="PARTIAL_EXACT_SOURCE_MATCH")matched++;
  else return false;
 }
 if(matched!==498||pending!==35)return false;
 for(const w of d.explicit_watches){
  const l=byId.get(w.catalogue_id);
  if(!l||watches.has(w.catalogue_id)||!w.family_ids?.length||
  w.current_source_status!==l.source_status||w.product_name!==l.product_name||
  w.article_decision_state!=="ARTICLE_APPLICABILITY_NOT_SIGNED"||
  w.review_packet_unsent!==true||w.component_lot_pass!==false||
  w.source_ledger_matched!==true||
  currentPending.has(w.catalogue_id))return false;
  const x=d.catalogue_crosswalk.find(c=>c.catalogue_id===w.catalogue_id);
  if(!x||JSON.stringify(x.future_watch_families)!==JSON.stringify(w.family_ids))return false;
  watches.add(w.catalogue_id);
  for(const id of w.family_ids)freq[id]=(freq[id]||0)+1;
 }
 if(watches.size!==31||pmsvB47FamilyCodes.some((z,i)=>freq[z]!==[4,1,2,2,22][i]))return false;
 for(const p of d.current_pending){
  const l=byId.get(p.catalogue_id);
  if(!l||l.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
  watches.has(p.catalogue_id)||p.direct_may2026_named_family_watch!==false||
  p.future_amendment_applied!==false||p.real_lab_pass!==false||
  p.current_status!=="FIRST_EXACT_SOURCE_PENDING")return false;
 }
 for(const z of d.amendment_provisions){
  if(z.future_value?.usable_on_review_date===true||![4,5,6].includes(z.pdf_page))return false;
 }
 return d.amendment_provisions.filter(x=>x.future_value!==null).length===4;
}
function pmsvB47Rows(){
 if(!pmsvB47Valid())return [];
 const q=pmsvB47Query.toLowerCase().trim();
 return pmsvB47Data.explicit_watches.filter(x=>
 (pmsvB47Family==="ALL"||x.family_ids.includes(pmsvB47Family))&&
 (pmsvB47Status==="ALL"||x.current_source_status===pmsvB47Status)&&
 (!q||[x.catalogue_id,x.product_name,x.note,x.family_ids.join(" ")].some(s=>String(s).toLowerCase().includes(q))));
}
function pmsvB47CSV(rows){
 if(!pmsvB47Valid())return "";
 const esc=v=>{let s=String(v??"");if(/^\s*[+\-=@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const h=["catalogue_id","product_name","fssr","fcs","current_source_status","family_ids","article_decision_state","source_pdf","original_page","effective_date","candidate_note","review_packet_unsent","component_lot_pass"];
 const data=rows.map(c=>[c.catalogue_id,c.product_name,c.fssr,c.fcs,c.current_source_status,c.family_ids.join(";"),
 c.article_decision_state,pmsvB47Data.source_chain.official_gazette_pdf,c.original_gazette_page_nums.join(";"),
 pmsvB47Data.source_chain.effective_date,c.note,c.review_packet_unsent,c.component_lot_pass]);
 return [h.map(esc).join(","),...data.map(a=>a.map(esc).join(","))].join("\r\n")+"\r\n";
}
function pmsvB47Download(all){
 if(!pmsvB47Valid())return;
 const rows=all?pmsvB47Data.explicit_watches:pmsvB47Rows();
 if(!rows.length)return;
 const url=URL.createObjectURL(new Blob(["\uFEFF",pmsvB47CSV(rows)],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="PMSV-B47-Dec2026-CTR-watch-"+(all?"31-all":"filtered")+".csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function pmsvB47Request(c){
 if(!pmsvB47Valid()||!pmsvB47Data.explicit_watches.includes(c))return "";
 return ["DRAFT ONLY — NOT SENT / NOT APPROVED","Product: "+c.product_name,
 "As sold catalogue identity: "+c.catalogue_id,"Present first-source status: "+c.current_source_status,
 "Future 1 December 2026 amendment families: "+c.family_ids.join(", "),
 "Legal eligibility questions: "+c.note,
 "Reference Gazette (PDF English pp 4–6): "+pmsvB47Data.source_chain.official_gazette_pdf,
 "Original Gazette relevant pages: "+c.original_gazette_page_nums.join(", "),
 "Obtain exact formulation, finished form, lawful article interpretation and sample/lab method evidence. Do not use December changes before commencement.",
 "No present CTR limit or actual tested lot approved."].join("\n");
}
function pmsvB47RowsHTML(){
 if(!pmsvB47Valid())return "";
 const e=pmsvB14Esc;
 return pmsvB47Rows().map(x=>'<tr><td><b>'+e(x.product_name)+'</b><small> '+e(x.catalogue_id)+'</small></td>'+
 '<td>'+e(x.family_ids.map(id=>id.replaceAll("_"," ")).join("; "))+'</td>'+
 '<td>'+e(x.current_source_status.replaceAll("_"," "))+'</td>'+
 '<td><button type="button" data-pmsv-b47-view="'+e(x.catalogue_id)+'">Inspect</button></td></tr>').join("");
}
function pmsvB47Detail(){
 const c=pmsvB47Data?.explicit_watches?.find(x=>x.catalogue_id===pmsvB47Selected),e=pmsvB14Esc;
 if(!c)return "";
 return '<div class="notice"><b>Prospective review only — NO current limit activated</b> · '+e(c.product_name)+'</div>'+
 '<p><b>Current catalogue state:</b> '+e(c.current_source_status)+'</p>'+
 '<p><b>Scope exclusions:</b> '+e(c.note)+'</p>'+
 '<p><b>Original Gazette English page:</b> '+e(c.original_gazette_page_nums.join(", "))+'</p>'+
 '<p><button type="button" data-pmsv-b47-copy="'+e(c.catalogue_id)+'">Copy UNSENT source query</button></p>'+
 '<div data-pmsv-b47-copy-state></div>';
}
function pmsvB47Panel(){
 if(!pmsvB47Valid())return "";
 const d=pmsvB47Data,e=pmsvB14Esc;
 return '<details class="card" id="pmsv-b47-may-gazette" style="margin-bottom:12px">'+
 '<summary><b>Batch47 · December 2026 CTR amendment</b> — 533 products reconciled, 31 watch candidates</summary>'+
 '<div class="notice"><b>16 Oct 2026: NOT YET IN FORCE.</b> Original official Gazette 272840 checked, English pp 4–6. Effective 1 Dec 2026. The old 444/89 May register is historical; <b>live 498 conditionally matched / 35 first-source pending</b> takes priority. 31 explicitly watched products are NOT cleared or automatically given amended limits. Other 502 are not certified unaffected.</div>'+
 '<p><a href="'+e(d.source_chain.official_gazette_pdf)+'" target="_blank" rel="noopener noreferrer">FSSAI official May 2026 Gazette</a> · '+
 '<a href="'+e(d.source_chain.base_ctr_compendium_url)+'" target="_blank" rel="noopener noreferrer">Present February 2026 CTR Version IX</a></p>'+
 '<details><summary><b>Nine separately audited amendment operations</b></summary><ol>'+
 d.amendment_provisions.map(z=>'<li><b>'+e(z.analyte)+'</b> — '+e(z.description)+' (Gazette p. '+e(z.pdf_page)+')'+
 (z.future_value?' <b>future reference only:</b> '+e(z.future_value.amount)+' '+e(z.future_value.unit):"")+'</li>').join("")+'</ol></details>'+
 '<p><b>Review caution:</b> Omitting CTR regulation 2.3.2(1) may have implications beyond the 31 named candidate products; independent regulatory assessment is needed. Do not treat a missing watch flag as an exemption.</p>'+
 '<p><button type="button" data-pmsv-b47-export="ALL">Export 31 watch cases</button> <button type="button" data-pmsv-b47-export="FILTERED">Export filtered</button></p>'+
 '<p><label>Search <input data-pmsv-b47-search type="search" placeholder="fish, pulse, nutmeg" /></label></p>'+
 '<p><label>Amendment family <select data-pmsv-b47-family><option value="ALL">All 31</option>'+
 d.families.map(x=>'<option value="'+e(x.code)+'">'+e(x.code.replaceAll("_"," "))+'</option>').join("")+
 '</select></label> <label>Current source status <select data-pmsv-b47-status>'+
 '<option value="ALL">All</option><option value="PARTIAL_EXACT_SOURCE_MATCH">Conditional first source (498)</option>'+
 '<option value="FIRST_EXACT_SOURCE_PENDING">Pending first source (35)</option></select></label></p>'+
 '<p data-pmsv-b47-count>'+pmsvB47Rows().length+' prospective candidate watches; zero auto approvals</p>'+
 '<div class="tablewrap" style="max-height:480px;overflow:auto"><table><thead><tr>'+
 '<th>Product</th><th>Potential amendment family</th><th>Current source state</th><th>Details</th></tr></thead>'+
 '<tbody data-pmsv-b47-rows>'+pmsvB47RowsHTML()+'</tbody></table></div>'+
 '<div data-pmsv-b47-detail></div></details>';
}
function pmsvB47Refresh(){
 if(typeof document==="undefined"||!pmsvB47Valid())return;
 const host=document.getElementById("pmsv-b46-future-law")||document.getElementById("pmsv-b45-lab-preflight");
 if(!host)return;
 let panel=document.getElementById("pmsv-b47-may-gazette");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB47Panel());return;}
 const rows=panel.querySelector("[data-pmsv-b47-rows]"),count=panel.querySelector("[data-pmsv-b47-count]"),
 detail=panel.querySelector("[data-pmsv-b47-detail]");
 if(rows)rows.innerHTML=pmsvB47RowsHTML();
 if(count)count.textContent=pmsvB47Rows().length+" future-only candidates; 0 approvals";
 if(detail)detail.innerHTML=pmsvB47Detail();
}
function pmsvB47Product(p){
 if(!p||!pmsvB47Valid())return "";
 const s=pmsvB47Data.catalogue_crosswalk.find(x=>x.catalogue_id===p.id);
 if(!s||s.product_name!==p.name||String(s.fssr||"")!==String(p.fssr||"")||
 String(s.fcs||"")!==String(p.fcs||""))return '<div class="notice">Batch47 identity mismatch: legal amendment source withheld.</div>';
 if(!s.future_watch_families.length)return "";
 const e=pmsvB14Esc,w=pmsvB47Data.explicit_watches.find(x=>x.catalogue_id===p.id);
 return '<div class="notice"><b>Batch47 future CTR watch:</b> '+e(w.family_ids.join(", "))+
 ' · from <b>1 Dec 2026</b>, not operative now. Current first-source status: '+e(w.current_source_status)+
 '. Product-specific legal applicability unapproved; no PASS.</div>';
}
const pmsvB47PreviousLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB47PreviousLoad();pmsvB47Data=null;
 try{const r=await fetch(pmsvB47Path+"?v=20261016-b47",{cache:"reload"});if(!r.ok)throw Error("B47 unavailable");
 pmsvB47Data=await r.json();if(!pmsvB47Valid())throw Error("B47 ledger/source integrity failure");
 pmsvB47Refresh();}catch(_){pmsvB47Data=null;}
};
const pmsvB47PreviousProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB47Product(p)+pmsvB47PreviousProduct(p);};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{if(ev.target?.matches?.("[data-pmsv-b47-search]")){
 pmsvB47Query=String(ev.target.value||"").slice(0,130);pmsvB47Selected="";pmsvB47Refresh();}});
 document.addEventListener("change",ev=>{
 if(ev.target?.matches?.("[data-pmsv-b47-family]")&&["ALL",...pmsvB47FamilyCodes].includes(ev.target.value)){
 pmsvB47Family=ev.target.value;pmsvB47Selected="";pmsvB47Refresh();}
 if(ev.target?.matches?.("[data-pmsv-b47-status]")&&["ALL","PARTIAL_EXACT_SOURCE_MATCH","FIRST_EXACT_SOURCE_PENDING"].includes(ev.target.value)){
 pmsvB47Status=ev.target.value;pmsvB47Selected="";pmsvB47Refresh();}
 });
 document.addEventListener("click",async ev=>{
 const view=ev.target?.closest?.("[data-pmsv-b47-view]");
 if(view){pmsvB47Selected=view.getAttribute("data-pmsv-b47-view");pmsvB47Refresh();return;}
 const exp=ev.target?.closest?.("[data-pmsv-b47-export]");
 if(exp){pmsvB47Download(exp.getAttribute("data-pmsv-b47-export")==="ALL");return;}
 const copy=ev.target?.closest?.("[data-pmsv-b47-copy]");
 if(!copy||!pmsvB47Valid())return;
 const c=pmsvB47Data.explicit_watches.find(x=>x.catalogue_id===copy.getAttribute("data-pmsv-b47-copy"));
 const label=document.querySelector("#pmsv-b47-may-gazette [data-pmsv-b47-copy-state]");
 if(!label||!c)return;
 try{if(!navigator.clipboard?.writeText)throw Error("No clipboard");
 await navigator.clipboard.writeText(pmsvB47Request(c));label.textContent="UNSENT source query copied.";
 }catch(_){label.textContent="Copy unavailable; query shown below:";
 const pre=document.createElement("pre");pre.style.whiteSpace="pre-wrap";pre.textContent=pmsvB47Request(c);label.appendChild(pre);}
 });
}
