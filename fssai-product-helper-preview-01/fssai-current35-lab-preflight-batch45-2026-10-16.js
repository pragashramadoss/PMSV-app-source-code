"use strict";
/* Batch45: guidance-scoped lab preflight; eight suggested subchecks per pending CTR case, not new statutory legal gates. */
var pmsvB45Data=null,pmsvB45Term="",pmsvB45Family="ALL",pmsvB45Selected="";
const pmsvB45Path="./data/rules/fssai-current35-lab-preflight-batch45-2026-10-16.json";
const pmsvB45Expected="42264cc38aeeda44";
const pmsvB45Codes=["EXACT_METHOD_AUTHORITY","SALE_FORM_AND_MATRIX","TARGET_ANALYTE_IDENTITY","SELECTIVITY_AND_INTERFERENCES","CALIBRATION_AND_RANGE","MATRIX_LOD_LOQ","RECOVERY_PRECISION_QC","ACCREDITED_SCOPE_AND_LOT_TRACE"];
function pmsvB45Valid(){
 if(typeof pmsvB44Valid!=="function"||!pmsvB44Valid()||!pmsvB45Data||typeof pmsvB14Digest!=="function"||pmsvB14Digest(pmsvB45Data)!==pmsvB45Expected)return false;
 const d=pmsvB45Data,n=d.counts,p=pmsvB44Data;
 if(d.kind!=="PMSV_CURRENT35_NONSTATUTORY_LAB_PREFLIGHT_BATCH45"||d.environment!=="GH_PAGES_PREVIEW_ONLY"||
 d.review_state!=="DOCUMENTARY_PREFLIGHT_ONLY_ALL_OPEN"||d.as_of!=="2026-10-16"||
 d.official_raft_guidance?.published_guidance_is_legal_adoption!==false||
 d.official_raft_guidance?.published_guidance_is_lab_validation!==false||
 d.current_metal_methods_index!==p.official_source_urls.methodsIndex||
 d.method_consultation_notice!==p.official_source_urls.notice||
 d.legal_ctr_source!==p.official_source_urls.ctr||
 n?.catalogue!==533||n.conditional_matches!==498||n.pending_ctr!==35||
 n.metal_cases!==27||n.nonmetal_cases!==8||n.laboratory_preflight_dossiers!==35||
 n.suggested_points_per_dossier!==8||n.suggested_points_total!==280||
 n.existing_five_gate_requests_unchanged!==175||
 n.evidence_received!==0||n.laboratories_contacted!==0||
 n.lab_matrix_validation_confirmed!==0||n.ctr_legal_limit_signed!==0||
 n.lot_passes!==0||n.wordpress_changed!==false||
 d.cases?.length!==35||d.checks?.length!==8||
 d.checks.some((x,i)=>x.code!==pmsvB45Codes[i]||x.guide_only!==true)||
 Object.values(d.results||{}).some(x=>x!==true))return false;
 const map=new Map(p.case_gate_dossiers.map(x=>[x.catalogue_id,x])), ids=new Set();
 let met=0;
 for(const c of d.cases){
  const prev=map.get(c.catalogue_id);
  if(!prev||ids.has(c.catalogue_id)||c.rank!==prev.rank||c.product_name!==prev.product_name||
   c.analyte!==prev.analyte||c.analyte_family!==prev.analyte_family||c.fssr!==prev.fssr||
   c.fcs!==prev.fcs||c.inherited_lab_gate_id!==prev.new_five_gate_ids[3]||
   c.inherited_lot_gate_id!==prev.new_five_gate_ids[4]||
   c.matrix_context!==prev.matrix_exception_context||
   c.legal_scope_context!==prev.legal_article_context||
   c.status!=="NOT_RECEIVED_NOT_REVIEWED"||c.real_laboratory_contacted!==false||
   c.method_approved!==false||c.ctr_article_approved!==false||c.lot_pass!==false||
   c.checklist?.length!==8)return false;
  ids.add(c.catalogue_id);
  if(c.analyte_family==="TRACE_METALS")met++;
  for(let j=0;j<8;j++){const k=c.checklist[j];if(k.code!==pmsvB45Codes[j]||
   k.id!=="PMSV45-"+String(c.rank).padStart(2,"0")+"-"+String(j+1).padStart(2,"0")||
   k.state!=="NOT_RECEIVED_NOT_REVIEWED"||k.approved!==false||
   k.guide_only!==true||!k.requested_proof||!k.label)return false;}
 }
 return ids.size===35&&met===27;
}
function pmsvB45Rows(){
 if(!pmsvB45Valid())return [];
 const q=pmsvB45Term.trim().toLowerCase();
 return pmsvB45Data.cases.filter(c=>(pmsvB45Family==="ALL"||
  (pmsvB45Family==="METALS"&&c.analyte_family==="TRACE_METALS")||
  (pmsvB45Family==="NONMETALS"&&c.analyte_family!=="TRACE_METALS"))&&
  (!q||[c.catalogue_id,c.product_name,c.analyte,c.matrix_context,c.legal_scope_context].some(v=>String(v).toLowerCase().includes(q))));
}
function pmsvB45CSV(rows){
 if(!pmsvB45Valid())return "";
 const esc=v=>{let s=String(v??"");if(/^\s*[+\-=@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const keys=["catalogue_id","product_name","analyte","analyte_family","inherited_lab_gate_id","inherited_lot_gate_id","matrix_context","legal_scope_context","status"];
 const heads=[...keys,...pmsvB45Codes,"guidance_source","guidance_scope"];
 const body=rows.map(c=>[...keys.map(k=>c[k]),...c.checklist.map(k=>k.requested_proof),pmsvB45Data.official_raft_guidance.url,pmsvB45Data.official_raft_guidance.scope]);
 return [heads.map(esc).join(","),...body.map(r=>r.map(esc).join(","))].join("\r\n")+"\r\n";
}
function pmsvB45Download(all){
 if(!pmsvB45Valid()||typeof document==="undefined")return;
 const rows=all?pmsvB45Data.cases:pmsvB45Rows();if(!rows.length)return;
 const blob=new Blob(["\uFEFF",pmsvB45CSV(rows)],{type:"text/csv;charset=utf-8"});
 const href=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=href;a.download="PMSV-B45-lab-preflight-"+(all?"all35":"filtered")+".csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1500);
}
function pmsvB45Request(c){
 if(!pmsvB45Valid()||!pmsvB45Data.cases.includes(c))return "";
 return ["UNSENT LAB REVIEW DRAFT — NOT A PASS","Product: "+c.product_name,"Analyte: "+c.analyte,
  "Existing lab gate: "+c.inherited_lab_gate_id,"Existing lot gate: "+c.inherited_lot_gate_id,
  "Matrix issue: "+c.matrix_context,"Legal article issue: "+c.legal_scope_context,
  ...c.checklist.map((k,i)=>(i+1)+". "+k.label+": "+k.requested_proof),
  "Supplemental guidance (RAFT approval context, not mandatory test method): "+pmsvB45Data.official_raft_guidance.url,
  "No documents, approved method, CTR limit, or lot PASS is represented by this draft."].join("\n");
}
function pmsvB45RowHtml(){
 if(!pmsvB45Valid())return "";
 const e=pmsvB14Esc;
 return pmsvB45Rows().map(c=>'<tr><td><b>'+e(c.product_name)+'</b><small> '+e(c.catalogue_id)+'</small></td>'+
 '<td>'+e(c.analyte)+'</td><td>'+e(c.analyte_family)+'</td>'+
 '<td>'+e(c.inherited_lab_gate_id)+'</td><td><button type="button" data-pmsv-b45-inspect="'+e(c.catalogue_id)+'">8 checks</button></td></tr>').join("");
}
function pmsvB45Detail(){
 const c=pmsvB45Data?.cases?.find(x=>x.catalogue_id===pmsvB45Selected),e=pmsvB14Esc;
 if(!c)return "";
 return '<div class="notice"><b>OPEN / NOT RECEIVED:</b> '+e(c.product_name)+' · '+e(c.analyte)+'</div>'+
 '<p><b>Matrix:</b> '+e(c.matrix_context)+'</p><p><b>Legal applicability:</b> '+e(c.legal_scope_context)+'</p>'+
 '<ol>'+c.checklist.map(k=>'<li><b>'+e(k.label)+'</b><p>'+e(k.requested_proof)+'</p></li>').join("")+'</ol>'+
 '<p><button type="button" data-pmsv-b45-copy="'+e(c.catalogue_id)+'">Copy unsent lab checklist</button></p>'+
 '<div data-pmsv-b45-copy-state></div>';
}
function pmsvB45Panel(){
 if(!pmsvB45Valid())return "";
 const e=pmsvB14Esc,d=pmsvB45Data;
 return '<details class="card" id="pmsv-b45-lab-preflight" style="margin-bottom:12px">'+
 '<summary><b>Batch45 · Laboratory preflight</b> — 35 cases, 8 suggested checks each</summary>'+
 '<div class="notice"><b>Source-scope warning:</b> 2025 FSSAI RAFT handbook guides validation of methods and rapid kits seeking RAFT approval; it is NOT a statutory lab method adoption, CTR maximum, matrix accreditation, or release instruction. All 35 preflights remain NOT RECEIVED / NOT REVIEWED. The prior 175 evidence gates remain unsent.</div>'+
 '<p><a target="_blank" rel="noopener noreferrer" href="'+e(d.official_raft_guidance.url)+'">Official FSSAI validation handbook (2025)</a> · '+
 '<a target="_blank" rel="noopener noreferrer" href="'+e(d.current_metal_methods_index)+'">Official manuals and orders index</a></p>'+
 '<p><button data-pmsv-b45-export="ALL" type="button">Export 35 lab checklists (CSV)</button> '+
 '<button data-pmsv-b45-export="FILTERED" type="button">Export filtered</button></p>'+
 '<p><label>Search <input data-pmsv-b45-search type="search" placeholder="lead, cocoa, residues, water" /></label> '+
 '<label>Group <select data-pmsv-b45-family><option value="ALL">All 35</option>'+
 '<option value="METALS">27 metals</option><option value="NONMETALS">8 nonmetals</option></select></label></p>'+
 '<p data-pmsv-b45-count>'+pmsvB45Rows().length+' unverified cases</p>'+
 '<div class="tablewrap" style="max-height:460px;overflow:auto"><table><thead><tr>'+
 '<th>As sold</th><th>Analyte</th><th>Group</th><th>Existing lab gate</th><th>Review</th></tr></thead>'+
 '<tbody data-pmsv-b45-rows>'+pmsvB45RowHtml()+'</tbody></table></div>'+
 '<div data-pmsv-b45-detail></div></details>';
}
function pmsvB45Refresh(){
 if(typeof document==="undefined"||!pmsvB45Valid())return;
 const host=document.getElementById("pmsv-b44-five-gate-readiness")||
 document.getElementById("pmsv-b43-consultation-provenance");
 if(!host)return;
 const panel=document.getElementById("pmsv-b45-lab-preflight");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB45Panel());return}
 const rows=panel.querySelector("[data-pmsv-b45-rows]"),count=panel.querySelector("[data-pmsv-b45-count]"),detail=panel.querySelector("[data-pmsv-b45-detail]");
 if(rows)rows.innerHTML=pmsvB45RowHtml();
 if(count)count.textContent=pmsvB45Rows().length+" unverified cases; zero approvals";
 if(detail)detail.innerHTML=pmsvB45Detail();
}
function pmsvB45Product(p){
 if(!p||!pmsvB45Valid())return "";
 const c=pmsvB45Data.cases.find(x=>x.catalogue_id===p.id);
 if(!c||c.product_name!==p.name||String(c.fssr||"")!==String(p.fssr||"")||
 String(c.fcs||"")!==String(p.fcs||""))return "";
 const e=pmsvB14Esc;
 return '<div class="notice"><b>Batch45 laboratory preflight:</b> '+e(c.analyte)+
 ' · 8 nonbinding validation prompts open · no method authority or lot PASS.'+
 ' <small>Existing lab evidence gate: '+e(c.inherited_lab_gate_id)+'</small></div>';
}
const pmsvB45EarlierLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB45EarlierLoad();pmsvB45Data=null;
 try{const r=await fetch(pmsvB45Path+"?v=20261016-b45",{cache:"reload"});
  if(!r.ok)throw Error("Batch45 preflight missing");
  pmsvB45Data=await r.json();if(!pmsvB45Valid())throw Error("Batch45 integrity failure");
  pmsvB45Refresh();
 }catch(_){pmsvB45Data=null;}
};
const pmsvB45EarlierProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB45Product(p)+pmsvB45EarlierProduct(p);};
if(typeof document!=="undefined"){
 document.addEventListener("input",ev=>{if(ev.target?.matches?.("[data-pmsv-b45-search]")){
   pmsvB45Term=String(ev.target.value||"").slice(0,130);pmsvB45Selected="";pmsvB45Refresh();}
 });
 document.addEventListener("change",ev=>{if(ev.target?.matches?.("[data-pmsv-b45-family]")&&
   ["ALL","METALS","NONMETALS"].includes(ev.target.value)){pmsvB45Family=ev.target.value;pmsvB45Selected="";pmsvB45Refresh();}
 });
 document.addEventListener("click",async ev=>{
  const inspect=ev.target?.closest?.("[data-pmsv-b45-inspect]");
  if(inspect){pmsvB45Selected=inspect.getAttribute("data-pmsv-b45-inspect");pmsvB45Refresh();return;}
  const exportBtn=ev.target?.closest?.("[data-pmsv-b45-export]");
  if(exportBtn){pmsvB45Download(exportBtn.getAttribute("data-pmsv-b45-export")==="ALL");return;}
  const copy=ev.target?.closest?.("[data-pmsv-b45-copy]");
  if(copy&&pmsvB45Valid()){
   const c=pmsvB45Data.cases.find(x=>x.catalogue_id===copy.getAttribute("data-pmsv-b45-copy"));
   const label=document.querySelector("#pmsv-b45-lab-preflight [data-pmsv-b45-copy-state]");
   if(!c||!label)return;
   try{if(!navigator.clipboard?.writeText)throw Error("No clipboard");
     await navigator.clipboard.writeText(pmsvB45Request(c));label.textContent="Unsent review copied.";
   }catch(_){label.textContent="Copy unavailable. Draft shown below:";
     const pre=document.createElement("pre");pre.style.whiteSpace="pre-wrap";pre.textContent=pmsvB45Request(c);label.appendChild(pre);}
  }
 });
}
