(function(){"use strict";
/* Batch76: evidence dossier builder for existing 35 HELD cases.
 * Preview-only. Never records proof receipt, routes messages, or approves a law,
 * laboratory method, test lot or product. Reverify on every explicit action.
 */
const OWNER_LABELS=Object.freeze({
 FSSAI_QA_DIVISION_AND_LAB_DIRECTOR:"FSSAI QA division / lab director",
 MANUFACTURER_OR_SUPPLIER_QA:"Manufacturer / supplier QA",
 REGULATORY_AFFAIRS_LEGAL:"Regulatory affairs / legal",
 LABORATORY_TECHNICAL_MANAGER:"Laboratory technical manager",
 SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER:"Site QA / independent reviewer"
});
const STATUSES=Object.freeze({REQUEST_PREPARATION_POSSIBLE:"Request preparation possible — NOT SENT",
 WAIT_FOR_UPSTREAM_EVIDENCE:"Await upstream documentary proof — NOT SENT"});
const keys=Object.keys(OWNER_LABELS);
let selected="",lastValid=false,lastRows=null;
const dom=(tag,attributes={},value)=>{
 const el=document.createElement(tag);
 for(const [key,v] of Object.entries(attributes))el.setAttribute(key,v);
 if(value!==undefined)el.textContent=String(value);
 return el;
};
function verify(){
 try{
  const state=window.pmsvB70ExtendedResearch?.getState?.();
  if(state?.core!=="READY"||state.extended!=="READY"||state.all35Held!==true||
     state.caseApprovals!==0||state.labPasses!==0||state.productReleases!==0||
     !window.pmsvB58OwnerOutreach?.valid?.()||!window.pmsvB59CTRSourceCrosswalk?.valid?.())
   return null;
  const cases=window.pmsvB59CTRSourceCrosswalk.getAllCases?.();
  const requests=window.pmsvB58OwnerOutreach.records?.();
  if(!Array.isArray(cases)||cases.length!==35||!Array.isArray(requests)||requests.length!==175)
   return null;
  const byId=new Map(),allIds=new Set(),counts=new Map();
  let p0=0,p1=0,now=0,later=0;
  for(const c of cases){
   if(!c||typeof c.catalogue_id!=="string"||byId.has(c.catalogue_id)||
     !Array.isArray(c.original_request_ids)||c.original_request_ids.length!==5||
     new Set(c.original_request_ids).size!==5||
     c.case_signed_legal_applicability!==false||
     c.actual_market_material_authenticated!==false||
     c.method_and_lab_scope_approved!==false||
     c.representative_lot_pass!==false)return null;
   if(c.priority==="P0")p0++;else if(c.priority==="P1")p1++;else return null;
   byId.set(c.catalogue_id,{case:c,gates:[]});
  }
  if(byId.size!==35||p0!==13||p1!==22)return null;
  for(const r of requests){
   const entry=byId.get(r?.case_id);
   if(!entry||entry.case.rank!==r.rank||entry.case.priority!==r.priority||
      entry.case.product_name!==r.product||entry.case.analyte!==r.analyte||
      !entry.case.original_request_ids.includes(r.request_id)||
      allIds.has(r.request_id)||!Object.hasOwn(OWNER_LABELS,r.role)||
      !r.gate||!r.evidence||r.original_request_status!=="NOT_SENT"||
      r.original_document_status!=="NOT_RECEIVED")return null;
   const ready=r.routing==="REQUEST_PREPARATION_POSSIBLE"&&r.dependencies==="";
   const dependent=r.routing==="WAIT_FOR_UPSTREAM_EVIDENCE"&&
     typeof r.dependencies==="string"&&r.dependencies.trim()!=="";
   if(!ready&&!dependent)return null;
   ready?now++:later++;
   allIds.add(r.request_id);counts.set(r.role,(counts.get(r.role)||0)+1);
   entry.gates.push(Object.freeze({...r}));
  }
  if(allIds.size!==175||now!==70||later!==105||keys.some(k=>counts.get(k)!==35))return null;
  for(const entry of byId.values()){
   if(entry.gates.length!==5||new Set(entry.gates.map(g=>g.role)).size!==5||
      entry.gates.filter(g=>g.routing==="REQUEST_PREPARATION_POSSIBLE").length!==2||
      entry.gates.filter(g=>g.routing==="WAIT_FOR_UPSTREAM_EVIDENCE").length!==3||
      !entry.case.original_request_ids.every(id=>entry.gates.some(g=>g.request_id===id)))
    return null;
   entry.gates.sort((a,b)=>keys.indexOf(a.role)-keys.indexOf(b.role));
  }
  return [...byId.values()].sort((a,b)=>
   a.case.priority.localeCompare(b.case.priority)||a.case.rank-b.case.rank);
 }catch(_){return null;}
}
function install(){
 const base=document.getElementById("pmsv-b75-workqueue");
 if(!base)return false;
 if(document.getElementById("pmsv-b76-case-dossier"))return true;
 const details=dom("details",{id:"pmsv-b76-case-dossier",class:"pmsv-b76-case-dossier"});
 details.appendChild(dom("summary",{},"Batch76 · Individual case evidence dossier — 35 HELD cases"));
 details.appendChild(dom("p",{},"Select a case to review its original five source requests and the next preparatory versus dependent actions. Unsent drafts are not evidence that a document was received, verified or approved."));
 const controls=dom("div",{class:"pmsv-b76-controls"});
 const priority=dom("label",{},"Priority");
 const priorityInput=dom("select",{"data-pmsv-b76-priority":""});
 [["ALL","All 35 HELD"],["P0","P0 · 13"],["P1","P1 · 22"]].forEach(([id,label])=>priorityInput.appendChild(dom("option",{value:id},label)));
 priority.appendChild(priorityInput);controls.appendChild(priority);
 const search=dom("label",{},"Find by product, analyte or case ID");
 search.appendChild(dom("input",{type:"search",maxlength:"100","data-pmsv-b76-search":"","placeholder":"Search HELD cases"}));
 controls.appendChild(search);
 const select=dom("label",{},"Case");
 const selectInput=dom("select",{"data-pmsv-b76-case":"","aria-label":"Choose one of the verified HELD cases"});
 selectInput.appendChild(dom("option",{value:""},"Verify source records first"));
 select.appendChild(selectInput);controls.appendChild(select);
 details.appendChild(controls);
 const buttons=dom("div",{class:"pmsv-b76-buttons"});
 [["refresh","Verify and load cases"],["csv","Export this case CSV (unsent)"],["txt","Export case handoff TXT (unsent)"]]
  .forEach(([kind,label])=>{
   const b=dom("button",{type:"button","data-pmsv-b76-action":kind},label);
   if(kind!=="refresh")b.disabled=true;buttons.appendChild(b);
  });
 details.appendChild(buttons);
 details.appendChild(dom("p",{"data-pmsv-b76-status":"","role":"status","aria-live":"polite"},
  "Open the extended source-review panels, then verify to select one of 35 HELD cases."));
 const summary=dom("div",{"data-pmsv-b76-summary":""});details.appendChild(summary);
 const scroll=dom("div",{class:"pmsv-b76-scroll",role:"region",tabindex:"0","aria-label":"Five original case documentary requests"});
 const table=dom("table");
 const head=dom("tr");
 ["Original proof ID / gate","Responsible function","Requested documentary evidence","Dependency","Immutable status"].forEach(h=>head.appendChild(dom("th",{},h)));
 const thead=dom("thead");thead.appendChild(head);table.appendChild(thead);
 table.appendChild(dom("tbody",{"data-pmsv-b76-body":""}));
 scroll.appendChild(table);details.appendChild(scroll);
 details.appendChild(dom("p",{class:"pmsv-b76-caution"},
  "No original Gazette signed applicability, manufacturer material authentication, accredited method/matrix sign-off, tested-lot PASS or product release. Do not upload confidential files into this public preview."));
 base.insertAdjacentElement("afterend",details);
 if(!document.getElementById("pmsv-b76-style")){
  const style=dom("style",{id:"pmsv-b76-style"});
  style.textContent=`.pmsv-b76-case-dossier{margin:12px 0;padding:13px;border:1px solid #c9d6e8;border-radius:12px;background:#fff;max-width:100%;min-width:0}.pmsv-b76-case-dossier summary{font-weight:750;line-height:1.45;cursor:pointer;overflow-wrap:anywhere}.pmsv-b76-case-dossier p{line-height:1.55;overflow-wrap:anywhere}.pmsv-b76-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pmsv-b76-controls label{font-size:12px;font-weight:700}.pmsv-b76-controls input,.pmsv-b76-controls select{display:block;width:100%;max-width:100%;min-height:44px;padding:8px;border-radius:8px;border:1px solid #c9d6e8;margin-top:5px}.pmsv-b76-buttons{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.pmsv-b76-buttons button{min-height:44px;white-space:normal}.pmsv-b76-buttons button:disabled{opacity:.45}.pmsv-b76-scroll{max-width:100%;max-height:540px;overflow:auto;overscroll-behavior-inline:contain}.pmsv-b76-scroll table{min-width:760px}.pmsv-b76-case-dossier :focus-visible{outline:3px solid #3155d9;outline-offset:2px}.pmsv-b76-caution{font-size:12px;color:#68758c}@media(max-width:700px){.pmsv-b76-controls{grid-template-columns:minmax(0,1fr)}.pmsv-b76-buttons button{flex:1 1 100%}}`;
  document.head.appendChild(style);
 }
 return true;
}
function choices(entries){
 const root=document.getElementById("pmsv-b76-case-dossier");
 const pr=root.querySelector("[data-pmsv-b76-priority]").value,
  q=root.querySelector("[data-pmsv-b76-search]").value.trim().toLowerCase();
 return entries.filter(x=>(pr==="ALL"||x.case.priority===pr)&&
  (!q||[x.case.catalogue_id,x.case.product_name,x.case.analyte,x.case.priority,x.case.rank]
  .some(v=>String(v).toLowerCase().includes(q))));
}
function inactive(reason){
 const root=document.getElementById("pmsv-b76-case-dossier");
 if(!root)return;
 lastValid=false;lastRows=null;selected="";
 root.querySelector("[data-pmsv-b76-status]").textContent=reason||
 "INTEGRITY BLOCKED or research not loaded. No export is available. All case decisions remain HELD.";
 root.querySelector("[data-pmsv-b76-summary]").replaceChildren();
 root.querySelector("[data-pmsv-b76-body]").replaceChildren();
 const select=root.querySelector("[data-pmsv-b76-case]");
 select.replaceChildren(dom("option",{value:""},"No validated case available"));
 root.querySelectorAll('[data-pmsv-b76-action="csv"],[data-pmsv-b76-action="txt"]')
  .forEach(b=>b.disabled=true);
}
function populate(data){
 const root=document.getElementById("pmsv-b76-case-dossier");
 const options=choices(data),selector=root.querySelector("[data-pmsv-b76-case]");
 if(!options.length){inactive("No case matches the current filter. The original 35 remain HELD.");return null;}
 if(!options.some(x=>x.case.catalogue_id===selected))selected=options[0].case.catalogue_id;
 selector.replaceChildren(...options.map(x=>
  dom("option",{value:x.case.catalogue_id},
  x.case.priority+" #"+x.case.rank+" · "+x.case.product_name+" ("+x.case.analyte+")")));
 selector.value=selected;
 const picked=options.find(x=>x.case.catalogue_id===selected);
 const first=picked.case;
 root.querySelector("[data-pmsv-b76-summary]").textContent=
  first.priority+" · Case #"+first.rank+" · "+first.product_name+" / "+first.analyte+
  " — 2 requests can be prepared; 3 depend on upstream documentary evidence. None has been sent or approved.";
 const body=root.querySelector("[data-pmsv-b76-body]");body.replaceChildren();
 for(const row of picked.gates){
  const tr=dom("tr");
  [row.request_id+" · "+row.gate,OWNER_LABELS[row.role],row.evidence,
   row.dependencies||"No upstream dependency for request preparation",
   STATUSES[row.routing]+" / document NOT RECEIVED"].forEach(v=>tr.appendChild(dom("td",{},v)));
  body.appendChild(tr);
 }
 root.querySelector("[data-pmsv-b76-status]").textContent=
  options.length+" selectable HELD cases under current filter · five original unsent requests in selected dossier · 0 approvals.";
 root.querySelectorAll('[data-pmsv-b76-action="csv"],[data-pmsv-b76-action="txt"]')
  .forEach(b=>b.disabled=false);
 lastValid=true;lastRows=picked;
 return {case_id:first.catalogue_id,priority:first.priority,gates:picked.gates.length,
  preparatory:picked.gates.filter(x=>x.routing==="REQUEST_PREPARATION_POSSIBLE").length,
  dependent:picked.gates.filter(x=>x.routing==="WAIT_FOR_UPSTREAM_EVIDENCE").length,
  totalCases:35,originalRequestIDs:175,sent:0,approvals:0,releases:0};
}
function refresh(){
 if(!install())return null;
 const data=verify();
 if(!data){inactive();return null;}
 return populate(data);
}
function escapeCSV(v){
 let s=String(v??"");
 if(/^\s*[=+@\-\t\r]/.test(s))s="'"+s;
 return '"'+s.replaceAll('"','""')+'"';
}
function output(kind){
 const data=verify(),root=document.getElementById("pmsv-b76-case-dossier");
 if(!data){inactive();return "";}
 const summary=populate(data);
 if(!summary)return "";
 const dossier=data.find(x=>x.case.catalogue_id===summary.case_id);
 if(!dossier)return "";
 const c=dossier.case;
 if(kind==="csv"){
  const head=["case_id","priority","rank","product","analyte","original_request_id","owner_role","gate","evidence_needed","upstream_dependencies","immutable_request_state","immutable_document_state","legal_approval","lab_scope_approval","lot_pass","release"];
  const rows=dossier.gates.map(x=>[c.catalogue_id,c.priority,c.rank,c.product_name,c.analyte,
   x.request_id,x.role,x.gate,x.evidence,x.dependencies,"NOT_SENT","NOT_RECEIVED",false,false,false,false]);
  return [head.map(escapeCSV).join(","),...rows.map(r=>r.map(escapeCSV).join(","))].join("\r\n")+"\r\n";
 }
 if(kind==="txt"){
  const lines=["UNSENT DRAFT — NOT A REGULATORY / LABORATORY / LOT APPROVAL",
   "PMSV FSSAI · Batch76 · 17 October 2026",
   "Original case: "+c.catalogue_id+" | "+c.priority+" #"+c.rank,
   "Product: "+c.product_name,"Analyte: "+c.analyte,
   "Status: HELD. 0 signed applicable legal rules, method approvals, lot CoAs or releases.",
   "This local review pack has NOT been sent. Owner routing and original document authenticity require independent confirmation.",""];
  dossier.gates.forEach((g,i)=>{
   lines.push("REQUEST "+(i+1)+": "+g.request_id);
   lines.push("Owner function: "+OWNER_LABELS[g.role]);
   lines.push("Document needed: "+g.evidence);
   lines.push("Dependency: "+(g.dependencies||"No upstream prerequisite to PREPARE request"));
   lines.push("Routing: "+STATUSES[g.routing]);
   lines.push("Immutable repository status: NOT_SENT | NOT_RECEIVED","");
  });
  lines.push("DO NOT treat published comparator figures or draft law as signed applicability.",
   "Do not include confidential supplier/lot files in this public prototype.");
  return lines.join("\n")+"\n";
 }
 return "";
}
function exportFile(kind){
 const content=output(kind);if(!content)return false;
 const selectedCase=lastRows?.case;
 if(!selectedCase)return false;
 const suffix=String(selectedCase.rank).padStart(2,"0"),type=kind==="csv"?"text/csv":"text/plain";
 const safe=new Blob([kind==="csv"?"\uFEFF"+content:content],{type:type+";charset=utf-8"});
 const url=URL.createObjectURL(safe),a=dom("a",{href:url,
  download:"PMSV-B76-CASE-"+suffix+"-UNSENT-HELD."+kind});
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 return true;
}
document.addEventListener("click",e=>{
 const action=e.target?.closest?.("[data-pmsv-b76-action]")?.dataset.pmsvB76Action;
 if(action==="refresh")refresh();
 else if(action==="csv"||action==="txt")exportFile(action);
});
document.addEventListener("change",e=>{
 if(e.target?.matches("[data-pmsv-b76-case]")){
  selected=String(e.target.value);refresh();
 }else if(e.target?.matches("[data-pmsv-b76-priority]"))refresh();
});
document.addEventListener("input",e=>{
 if(e.target?.matches("[data-pmsv-b76-search]"))refresh();
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
window.pmsvB76CaseDossier=Object.freeze({install,refresh,preview:output,
 read:()=>lastValid&&lastRows?{id:lastRows.case.catalogue_id,gates:lastRows.gates.length,held:true}:null});
})();