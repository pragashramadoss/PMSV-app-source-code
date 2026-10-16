"use strict";
/* Batch46: future law is NOT operative on 16 Oct 2026; zero approvals and zero sent items. */
var pmsvB46Data=null,pmsvB46Search="",pmsvB46Family="ALL",pmsvB46Method="ALL",pmsvB46Selected="";
const pmsvB46Path="./data/rules/fssai-current35-2027-effective-method-guard-batch46-2026-10-16.json";
const pmsvB46Expected="b82284cf2e94d30e";
const pmsvB46Codes=["CURRENT_RULES_LOCK","SUBSTANCE_AND_SALE_FORM","CURRENT_METHOD_AUTHORITY","FUTURE_METHOD_PRECEDENCE","FUTURE_REPORTING_RULES","INDEPENDENT_LAB_AND_LOT"];
function pmsvB46Valid(){
 if(typeof pmsvB45Valid!=="function"||!pmsvB45Valid()||typeof pmsvB14Digest!=="function"||!pmsvB46Data||
 pmsvB14Digest(pmsvB46Data)!==pmsvB46Expected)return false;
 const d=pmsvB46Data,n=d.counts,a=d.amendment,b44=pmsvB44Data,b45=pmsvB45Data;
 if(d.kind!=="PMSV_CURRENT35_LAB_LAW_EFFECTIVE_DATE_AND_SOURCE_ROUTING_BATCH46"||
 d.as_of!=="2026-10-16"||d.environment!=="GH_PAGES_PREVIEW_ONLY"||
 a?.effective_date!=="2027-04-01"||a.current_date!=="2026-10-16"||
 a.in_force_on_review_date!==false||a.new_regulation_2_5_in_force!==false||a.new_regulation_2_6_in_force!==false||
 a.manual_2024_number_collision_resolved_by_future_amendment!==false||
 a.private_industry_certificate_timeline_automatically_set!==false||a.official_pdf_direct_contents_inspected!==false||
 a.prior_existing_rules_can_have_similar_requirements!=="MUST_CHECK_INDEPENDENTLY"||
 n?.catalogue!==533||n.conditionally_sourced!==498||n.remaining_ctr!==35||
 n.metal_cases!==27||n.nonmetal_cases!==8||n.dated_legal_case_screens!==35||
 n.review_prompts_per_case!==6||n.review_prompts_total!==210||n.methods_manual_families!==5||
 n.previous_five_gate_requests_unchanged!==175||n.previous_lab_preflight_checks_unchanged!==280||
 n.future_rule_applied_as_current!==0||n.methods_assigned!==0||
 n.actual_legal_ctr_limit_approved!==0||n.actual_lab_passes!==0||n.documents_sent!==0||
 n.wordpress_changed!==false||
 d.methods_inventory?.length!==5||d.decision_prompts?.length!==6||
 d.cases?.length!==35||Object.values(d.results||{}).some(v=>v!==true))return false;
 if(d.decision_prompts.some((x,i)=>x.code!==pmsvB46Codes[i]))return false;
 const m=new Map(b44.case_gate_dossiers.map(x=>[x.catalogue_id,x]));
 const m45=new Map(b45.cases.map(x=>[x.catalogue_id,x]));
 const ids=new Set();let met=0;
 for(const c of d.cases){
  const old=m.get(c.catalogue_id),x=m45.get(c.catalogue_id);
  if(!old||!x||ids.has(c.catalogue_id)||c.rank!==old.rank||
   c.product_name!==old.product_name||c.analyte!==old.analyte||
   c.analyte_family!==old.analyte_family||c.sale_form_and_ctr_exception!==old.legal_article_context||
   c.lab_method_exception!==old.matrix_exception_context||
   c.inherited_authority_gate!==old.new_five_gate_ids[0]||
   c.inherited_legal_gate!==old.new_five_gate_ids[2]||
   c.inherited_lab_gate!==old.new_five_gate_ids[3]||
   c.inherited_lot_gate!==old.new_five_gate_ids[4]||
   c.amendment_in_force_for_case!==false||c.official_method_selected!==false||
   c.legal_ctr_limit_verified!==false||c.lot_compliance_pass!==false||
   !d.methods_inventory.some(z=>z.code===c.method_family)||
   c.method_family_status!=="REFERENCE_ONLY_NOT_A_METHOD_SELECTION"||
   c.decision_points?.length!==6)return false;
  ids.add(c.catalogue_id);
  if(c.analyte_family==="TRACE_METALS")met++;
  for(let i=0;i<6;i++){const z=c.decision_points[i];
    if(z.code!==pmsvB46Codes[i]||z.approved!==false||z.state!==d.decision_prompts[i].state||
    z.id!=="PMSV46-"+String(c.rank).padStart(2,"0")+"-"+String(i+1).padStart(2,"0")||
    !z.check)return false;
  }
 }
 return ids.size===35&&met===27;
}
function pmsvB46Rows(){
 if(!pmsvB46Valid())return [];
 const q=pmsvB46Search.trim().toLowerCase();
 return pmsvB46Data.cases.filter(c=>
 (pmsvB46Family==="ALL"||(pmsvB46Family==="METALS"&&c.analyte_family==="TRACE_METALS")||
 (pmsvB46Family==="OTHERS"&&c.analyte_family!=="TRACE_METALS"))&&
 (pmsvB46Method==="ALL"||c.method_family===pmsvB46Method)&&
 (!q||[c.catalogue_id,c.product_name,c.analyte,c.method_routing_guidance,c.sale_form_and_ctr_exception].some(x=>String(x).toLowerCase().includes(q))));
}
function pmsvB46CSV(rows){
 if(!pmsvB46Valid())return "";
 const esc=v=>{let x=String(v??"");if(/^\s*[+\-=@]/.test(x))x="'"+x;return '"'+x.replaceAll('"','""')+'"';};
 const cols=["catalogue_id","product_name","analyte","analyte_family","method_family","chemical_identity_caution","sale_form_and_ctr_exception","lab_method_exception","inherited_authority_gate","inherited_legal_gate","inherited_lab_gate","inherited_lot_gate","amendment_in_force_for_case","official_method_selected","legal_ctr_limit_verified","lot_compliance_pass"];
 const head=[...cols,"2027_effective_date","future_law_pdf","future_law_text_mirror","methods_index",...pmsvB46Codes];
 const body=rows.map(c=>[...cols.map(k=>c[k]),pmsvB46Data.amendment.effective_date,pmsvB46Data.official_source_urls.gazetteDirect,
 pmsvB46Data.official_source_urls.fullTextMirror,pmsvB46Data.official_source_urls.methodsIndex,...c.decision_points.map(z=>z.check)]);
 return [head.map(esc).join(","),...body.map(a=>a.map(esc).join(","))].join("\r\n")+"\r\n";
}
function pmsvB46Download(all){
 if(!pmsvB46Valid()||typeof document==="undefined")return;
 const r=all?pmsvB46Data.cases:pmsvB46Rows();if(!r.length)return;
 const u=URL.createObjectURL(new Blob(["\uFEFF",pmsvB46CSV(r)],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=u;a.download="PMSV-B46-future-law-routing-"+(all?"all35":"filtered")+".csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1600);
}
function pmsvB46Request(c){
 if(!pmsvB46Valid()||!pmsvB46Data.cases.includes(c))return "";
 return ["DRAFT LEGAL/METHOD REVIEW — NOT SENT / NOT APPROVED",
 "As of 16 October 2026: the 2026 lab-analysis amendment has NOT entered into force. Effective date: 1 April 2027.",
 "Product: "+c.product_name+"; analyte: "+c.analyte,"Method research family: "+c.method_family,
 "Current source guidance: "+c.method_routing_guidance,
 "Exact commodity question: "+c.sale_form_and_ctr_exception,
 "Laboratory question: "+c.lab_method_exception,
 ...c.decision_points.map(z=>z.label+": "+z.check),
 "Official notification registry: "+pmsvB46Data.official_source_urls.gazetteIndex,
 "Official Gazette PDF (not downloaded in this review): "+pmsvB46Data.official_source_urls.gazetteDirect,
 "FSSAI methods index: "+pmsvB46Data.official_source_urls.methodsIndex,
 "No regulatory method, CTR maximum, representative lot or laboratory pass approved."].join("\n");
}
function pmsvB46RowsHTML(){
 if(!pmsvB46Valid())return "";
 const e=pmsvB14Esc;
 return pmsvB46Rows().map(c=>'<tr><td><b>'+e(c.product_name)+'</b><small> '+e(c.catalogue_id)+'</small></td>'+
 '<td>'+e(c.analyte)+'</td><td>'+e(c.method_family.replaceAll("_"," "))+'</td>'+
 '<td><b>Oct 2026: not in force</b><small> · from 01 Apr 2027</small></td>'+
 '<td><button type="button" data-pmsv-b46-inspect="'+e(c.catalogue_id)+'">Review</button></td></tr>').join("");
}
function pmsvB46Detail(){
 const c=pmsvB46Data?.cases?.find(x=>x.catalogue_id===pmsvB46Selected),e=pmsvB14Esc;
 if(!c)return "";
 return '<div class="notice"><b>Still pending:</b> '+e(c.product_name)+' — '+e(c.analyte)+'</div>'+
 '<p><b>Method source route:</b> '+e(c.method_routing_guidance)+'</p>'+
 '<p><b>Article:</b> '+e(c.sale_form_and_ctr_exception)+'</p>'+
 '<ol>'+c.decision_points.map(k=>'<li><b>'+e(k.label)+'</b> — '+e(k.check)+'</li>').join("")+'</ol>'+
 '<p><button type="button" data-pmsv-b46-copy="'+e(c.catalogue_id)+'">Copy unsent review</button></p>'+
 '<div data-pmsv-b46-copy-state></div>';
}
function pmsvB46Panel(){
 if(!pmsvB46Valid())return "";
 const d=pmsvB46Data,e=pmsvB14Esc;
 return '<details id="pmsv-b46-future-law" class="card" style="margin-bottom:12px"><summary><b>Batch46 · Future laboratory regulation guard</b> — 35 legal/method review routes</summary>'+
 '<div class="notice"><b>IMPORTANT — NOT IN FORCE (16 Oct 2026):</b> FSSAI Laboratory and Sample Analysis Amendment Regulations, 2026 take effect <b>1 April 2027</b>. Do not retroactively impose its new method precedence or the new 14-day regulatory/5-day import reporting timelines. Some similar obligations may exist under earlier rules: check independently. It does not resolve the conflicting 2024 metals manual IDs.</div>'+
 '<p><a target="_blank" rel="noopener noreferrer" href="'+e(d.official_source_urls.gazetteIndex)+'">FSSAI official notification registry</a> · '+
 '<a target="_blank" rel="noopener noreferrer" href="'+e(d.official_source_urls.gazetteDirect)+'">Official Gazette (PDF)</a> · '+
 '<a target="_blank" rel="noopener noreferrer" href="'+e(d.official_source_urls.methodsIndex)+'">FSSAI methods index</a> · '+
 '<a target="_blank" rel="noopener noreferrer" href="'+e(d.official_source_urls.fullTextMirror)+'">Accessible text reproduction (secondary)</a></p>'+
 '<p><small>The official Gazette PDF was identified but not downloadable for direct text comparison in this batch. FSSAI publication list and two secondary full-text sources corroborate the date; current method authority remains an independent open question.</small></p>'+
 '<p><button type="button" data-pmsv-b46-export="ALL">Export all 35 source routes</button> '+
 '<button type="button" data-pmsv-b46-export="FILTERED">Export filtered</button></p>'+
 '<p><label>Search <input type="search" data-pmsv-b46-search placeholder="cocoa, ochratoxin, egg, metals" /></label> '+
 '<label>Group <select data-pmsv-b46-family><option value="ALL">All 35</option><option value="METALS">27 metal cases</option><option value="OTHERS">8 other cases</option></select></label></p>'+
 '<p><label>Official methods area <select data-pmsv-b46-method><option value="ALL">All five families</option>'+
 d.methods_inventory.map(x=>'<option value="'+e(x.code)+'">'+e(x.name)+'</option>').join("")+'</select></label></p>'+
 '<p data-pmsv-b46-count>'+pmsvB46Rows().length+' pending; zero current-method approvals</p>'+
 '<div class="tablewrap" style="max-height:460px;overflow:auto"><table><thead><tr>'+
 '<th>As-sold product</th><th>Analyte</th><th>Methods area</th><th>2026 effective-date status</th><th>Inspect</th></tr></thead>'+
 '<tbody data-pmsv-b46-rows>'+pmsvB46RowsHTML()+'</tbody></table></div>'+
 '<div data-pmsv-b46-detail></div></details>';
}
function pmsvB46Refresh(){
 if(typeof document==="undefined"||!pmsvB46Valid())return;
 const host=document.getElementById("pmsv-b45-lab-preflight")||document.getElementById("pmsv-b44-five-gate-readiness");
 if(!host)return;
 const panel=document.getElementById("pmsv-b46-future-law");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB46Panel());return}
 const table=panel.querySelector("[data-pmsv-b46-rows]"),count=panel.querySelector("[data-pmsv-b46-count]"),detail=panel.querySelector("[data-pmsv-b46-detail]");
 if(table)table.innerHTML=pmsvB46RowsHTML();
 if(count)count.textContent=pmsvB46Rows().length+" pending; zero method approvals";
 if(detail)detail.innerHTML=pmsvB46Detail();
}
function pmsvB46Product(p){
 if(!p||!pmsvB46Valid())return "";
 const c=pmsvB46Data.cases.find(x=>x.catalogue_id===p.id);
 if(!c||c.product_name!==p.name)return "";
 const e=pmsvB14Esc;
 return '<div class="notice"><b>Batch46 statutory date guard:</b> '+e(c.analyte)+' · '+e(c.method_family.replaceAll("_"," "))+
 ' · Amendment 2026 <b>NOT operative until 1 April 2027</b>. No legal or laboratory PASS.</div>';
}
const pmsvB46OlderLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB46OlderLoad();pmsvB46Data=null;
 try{const r=await fetch(pmsvB46Path+"?v=20261016-b46",{cache:"reload"});
  if(!r.ok)throw Error("Batch46 unavailable");
  pmsvB46Data=await r.json();
  if(!pmsvB46Valid())throw Error("Batch46 source/case integrity failure");
  pmsvB46Refresh();
 }catch(_){pmsvB46Data=null;}
};
const pmsvB46OlderProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB46Product(p)+pmsvB46OlderProduct(p);};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{if(ev.target?.matches?.("[data-pmsv-b46-search]")){pmsvB46Search=String(ev.target.value||"").slice(0,140);pmsvB46Selected="";pmsvB46Refresh();}});
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b46-family]")&&["ALL","METALS","OTHERS"].includes(ev.target.value)){
   pmsvB46Family=ev.target.value;pmsvB46Selected="";pmsvB46Refresh();
  }
  if(ev.target?.matches?.("[data-pmsv-b46-method]")&&["ALL",...pmsvB46Data?.methods_inventory?.map(x=>x.code)||[]].includes(ev.target.value)){
   pmsvB46Method=ev.target.value;pmsvB46Selected="";pmsvB46Refresh();
  }
 });
 document.addEventListener("click",async ev=>{
  const c=ev.target?.closest?.("[data-pmsv-b46-inspect]");
  if(c){pmsvB46Selected=c.getAttribute("data-pmsv-b46-inspect");pmsvB46Refresh();return;}
  const exp=ev.target?.closest?.("[data-pmsv-b46-export]");
  if(exp){pmsvB46Download(exp.getAttribute("data-pmsv-b46-export")==="ALL");return;}
  const btn=ev.target?.closest?.("[data-pmsv-b46-copy]");
  if(!btn||!pmsvB46Valid())return;
  const c2=pmsvB46Data.cases.find(x=>x.catalogue_id===btn.getAttribute("data-pmsv-b46-copy"));
  const label=document.querySelector("#pmsv-b46-future-law [data-pmsv-b46-copy-state]");
  if(!c2||!label)return;
  try{if(!navigator.clipboard?.writeText)throw Error("no clipboard");
   await navigator.clipboard.writeText(pmsvB46Request(c2));label.textContent="Unsent draft copied.";
  }catch(_){label.textContent="Copy unavailable; draft printed below:";
   const pre=document.createElement("pre");pre.style.whiteSpace="pre-wrap";pre.textContent=pmsvB46Request(c2);label.appendChild(pre);}
 });
}
