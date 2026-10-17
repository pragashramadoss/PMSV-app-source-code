(function(){"use strict";
/* PMSV Batch75: exactly the original 175 unsent evidence requests.
 * Read-only prioritization, not legal applicability, method sign-off or lot release.
 * Revalidate the full source graph on every explicit user action: no trust cache.
 */
const ROLES=Object.freeze([
 "FSSAI_QA_DIVISION_AND_LAB_DIRECTOR",
 "MANUFACTURER_OR_SUPPLIER_QA",
 "REGULATORY_AFFAIRS_LEGAL",
 "LABORATORY_TECHNICAL_MANAGER",
 "SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER"
]);
const READY="REQUEST_PREPARATION_POSSIBLE",BLOCKED="WAIT_FOR_UPSTREAM_EVIDENCE";
let lastResult=null;
function element(tag,props={},textValue){
 const el=document.createElement(tag);
 for(const [name,value] of Object.entries(props)){
  if(name==="className")el.className=value;
  else el.setAttribute(name,value);
 }
 if(textValue!==undefined)el.textContent=String(textValue);
 return el;
}
function srcVerified(){
 try{
  const s=window.pmsvB70ExtendedResearch?.getState?.();
  if(!s||s.core!=="READY"||s.extended!=="READY"||s.all35Held!==true||
     s.caseApprovals!==0||s.labPasses!==0||s.productReleases!==0||
     !window.pmsvB58OwnerOutreach?.valid?.()||!window.pmsvB59CTRSourceCrosswalk?.valid?.())
   return null;
  const original=window.pmsvB59CTRSourceCrosswalk.getAllCases();
  const rows=window.pmsvB58OwnerOutreach.records();
  if(!Array.isArray(original)||original.length!==35||!Array.isArray(rows)||rows.length!==175)
   return null;
  const rankMap=new Map(),ids=new Set(),roles=new Map();
  let p0=0,p1=0,prep=0,dep=0;
  for(const c of original){
   if(!c||rankMap.has(c.catalogue_id)||c.original_request_ids?.length!==5||
      c.case_signed_legal_applicability!==false||
      c.actual_market_material_authenticated!==false||
      c.method_and_lab_scope_approved!==false||
      c.representative_lot_pass!==false)return null;
   if(c.priority==="P0")p0++;else if(c.priority==="P1")p1++;else return null;
   rankMap.set(c.catalogue_id,c);
  }
  if(rankMap.size!==35||p0!==13||p1!==22)return null;
  const data=[];
  for(const x of rows){
   const c=rankMap.get(x.case_id);
   if(!c||x.priority!==c.priority||x.rank!==c.rank||
      x.product!==c.product_name||x.analyte!==c.analyte||
      !c.original_request_ids.includes(x.request_id)||
      ids.has(x.request_id)||!ROLES.includes(x.role)||
      x.original_request_status!=="NOT_SENT"||
      x.original_document_status!=="NOT_RECEIVED"||
      !x.evidence||!x.gate||!x.request_id)return null;
   const ready=x.routing===READY&&x.dependencies==="";
   const dependent=x.routing===BLOCKED&&x.dependencies!=="";
   if(!ready&&!dependent)return null;
   if(ready)prep++;else dep++;
   ids.add(x.request_id);roles.set(x.role,(roles.get(x.role)||0)+1);
   data.push(Object.freeze({...x}));
  }
  if(ids.size!==175||prep!==70||dep!==105||ROLES.some(r=>roles.get(r)!==35))return null;
  data.sort((a,b)=>a.priority.localeCompare(b.priority)||
    a.rank-b.rank||Number(b.routing===BLOCKED)-Number(a.routing===BLOCKED)||
    ROLES.indexOf(a.role)-ROLES.indexOf(b.role));
  return Object.freeze(data);
 }catch(_){return null;}
}
function shell(){
 const root=document.getElementById("pmsv-b70-startup-gates");
 if(!root)return false;
 if(document.getElementById("pmsv-b75-workqueue"))return true;
 const box=element("section",{id:"pmsv-b75-workqueue","aria-label":"35 held cases evidence request work queue"});
 box.className="pmsv-b75-workqueue";
 box.appendChild(element("h3",{},"Batch75 · Original evidence request work queue"));
 box.appendChild(element("p",{},"Exactly 35 HELD cases / 175 original documentary requests. Preparing a request is NOT sending it, receiving evidence, certifying compliance, or releasing a lot."));
 const fields=element("div",{className:"pmsv-b75-fields"});
 const priority=element("label",{},"Priority");
 const prioritySelect=element("select",{"data-pmsv-b75-priority":""});
 [["ALL","All priorities"],["P0","P0: 13 cases"],["P1","P1: 22 cases"]].forEach(([v,t])=>prioritySelect.appendChild(element("option",{value:v},t)));
 priority.appendChild(prioritySelect);fields.appendChild(priority);
 const role=element("label",{},"Responsible function");
 const roleSel=element("select",{"data-pmsv-b75-role":""});
 roleSel.appendChild(element("option",{value:"ALL"},"All 5 functions"));
 ROLES.forEach(r=>roleSel.appendChild(element("option",{value:r},r.replaceAll("_"," "))));
 role.appendChild(roleSel);fields.appendChild(role);
 const phase=element("label",{},"Request readiness");
 const phaseSel=element("select",{"data-pmsv-b75-phase":""});
 [["READY","Prepare now (70)"],["DEPENDENT","Wait for source (105)"],["ALL","All open requests (175)"]].forEach(([v,t])=>phaseSel.appendChild(element("option",{value:v},t)));
 phase.appendChild(phaseSel);fields.appendChild(phase);
 const search=element("label",{},"Search product, analyte, request ID or evidence");
 const input=element("input",{"data-pmsv-b75-search":"","maxlength":"100","placeholder":"Search all original requests","type":"search"});
 search.appendChild(input);fields.appendChild(search);
 box.appendChild(fields);
 const actions=element("div",{className:"pmsv-b75-actions"});
 actions.appendChild(element("button",{type:"button","data-pmsv-b75-apply":""},"Verify sources and show requests"));
 actions.appendChild(element("button",{type:"button","data-pmsv-b75-export":"","disabled":""},"Export unsent CSV"));
 box.appendChild(actions);
 const status=element("p",{"role":"status","aria-live":"polite","data-pmsv-b75-status":""},
  "Not loaded. Select Verify sources and show requests after extended evidence is READY.");
 box.appendChild(status);
 const scroll=element("div",{className:"pmsv-b75-tablewrap","role":"region","tabindex":"0",
  "aria-label":"Unsent regulatory evidence requests; scroll horizontally for all columns"});
 const table=element("table");
 const thead=element("thead"),headrow=element("tr");
 ["Priority","Product / analyte","Original request ID","Responsible function","Document needed","Preparation status"].forEach(x=>headrow.appendChild(element("th",{},x)));
 thead.appendChild(headrow);table.appendChild(thead);
 table.appendChild(element("tbody",{"data-pmsv-b75-rows":""}));scroll.appendChild(table);
 box.appendChild(scroll);
 box.appendChild(element("p",{}, "Local read-only review. Never upload confidential supplier files or assume that a source comparator is an applicable legal limit."));
 root.appendChild(box);
 if(!document.getElementById("pmsv-b75-style")){
  const css=element("style",{id:"pmsv-b75-style"});
  css.textContent=".pmsv-b75-workqueue{border:1px solid #dbe3ef;background:#fff;border-radius:12px;padding:12px;margin-top:12px;max-width:100%;min-width:0}.pmsv-b75-workqueue h3{font-size:16px;margin:0 0 8px}.pmsv-b75-workqueue p{overflow-wrap:anywhere;line-height:1.5}.pmsv-b75-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.pmsv-b75-fields label{font-weight:700;font-size:12px}.pmsv-b75-fields select,.pmsv-b75-fields input{display:block;width:100%;max-width:100%;min-height:44px;padding:9px;margin-top:5px;border:1px solid #c9d6e8;border-radius:8px}.pmsv-b75-actions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.pmsv-b75-actions button{min-height:44px;white-space:normal;line-height:1.3}.pmsv-b75-actions button:disabled{opacity:.48}.pmsv-b75-tablewrap{max-width:100%;max-height:540px;overflow:auto;overscroll-behavior-inline:contain}.pmsv-b75-tablewrap table{min-width:750px}.pmsv-b75-tablewrap th,.pmsv-b75-tablewrap td{overflow-wrap:anywhere}.pmsv-b75-workqueue :focus-visible{outline:3px solid #3155d9;outline-offset:2px}@media(max-width:700px){.pmsv-b75-fields{grid-template-columns:minmax(0,1fr)}.pmsv-b75-actions button{flex:1 1 100%}}";
  document.head.appendChild(css);
 }
 return true;
}
function selection(){
 const root=document.getElementById("pmsv-b75-workqueue");
 return {priority:root.querySelector("[data-pmsv-b75-priority]").value,
  role:root.querySelector("[data-pmsv-b75-role]").value,
  phase:root.querySelector("[data-pmsv-b75-phase]").value,
  search:root.querySelector("[data-pmsv-b75-search]").value.trim().toLocaleLowerCase("en")};
}
function filtered(data){
 const f=selection();
 return data.filter(x=>(f.priority==="ALL"||x.priority===f.priority)&&
  (f.role==="ALL"||x.role===f.role)&&
  (f.phase==="ALL"||(f.phase==="READY"&&x.routing===READY)||
   (f.phase==="DEPENDENT"&&x.routing===BLOCKED))&&
  (!f.search||[x.product,x.analyte,x.request_id,x.evidence,x.gate,x.role,x.case_id]
   .some(v=>String(v).toLocaleLowerCase("en").includes(f.search))));
}
function show(data){
 const root=document.getElementById("pmsv-b75-workqueue");
 const body=root.querySelector("[data-pmsv-b75-rows]");
 body.replaceChildren();
 const exportBtn=root.querySelector("[data-pmsv-b75-export]");
 exportBtn.disabled=!data;
 if(!data){
  root.querySelector("[data-pmsv-b75-status]").textContent=
   "INTEGRITY BLOCKED or source research not loaded. No requests or export available. No legal or lab approval granted.";
  lastResult=null;return null;
 }
 const rows=filtered(data);
 for(const x of rows){
  const tr=element("tr");
  [x.priority+" #"+x.rank,x.product+" · "+x.analyte,x.request_id,
   x.role.replaceAll("_"," "),x.evidence,
   x.routing===READY?"PREPARE ONLY — NOT SENT":"DEPENDENT — SOURCE PROOF MISSING"].forEach(v=>tr.appendChild(element("td",{},v)));
  body.appendChild(tr);
 }
 root.querySelector("[data-pmsv-b75-status]").textContent=
  rows.length+" unsent requests in view · 70 preparation possible / 105 evidence-dependent across original 175. 0 approvals or lot releases.";
 lastResult=Object.freeze({items:rows.length,ready:70,dependent:105,cases:35,ids:175,approvals:0,releases:0});
 return lastResult;
}
function csvValue(v){
 let t=String(v??"");
 if(/^\s*[=+@\-\t\r]/.test(t))t="'"+t;
 return '"'+t.replaceAll('"','""')+'"';
}
function buildCSV(data){
 const rows=filtered(data);
 const fields=["priority","rank","catalogue_id","product","analyte","original_request_id",
 "responsible_role","evidence_needed","upstream_dependencies","request_preparation_status",
 "original_request_state","original_document_state","signed_legal_limit","lab_scope_approved","lot_pass"];
 const body=rows.map(x=>[x.priority,x.rank,x.case_id,x.product,x.analyte,x.request_id,
 x.role,x.evidence,x.dependencies,x.routing,x.original_request_status,x.original_document_status,
 false,false,false].map(csvValue).join(","));
 return [fields.map(csvValue).join(","),...body].join("\r\n")+"\r\n";
}
function download(data){
 const file=new Blob(["\uFEFF"+buildCSV(data)],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(file),link=element("a",{href:url,download:"PMSV-B75-175-ORIGINAL-REQUESTS-UNSENT-HELD.csv"});
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function run(action){
 if(!shell())return null;
 const verified=srcVerified();
 const status=show(verified);
 if(verified&&action==="export")download(verified);
 return status;
}
document.addEventListener("click",event=>{
 if(event.target?.closest?.("[data-pmsv-b75-apply]"))run("show");
 if(event.target?.closest?.("[data-pmsv-b75-export]"))run("export");
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",shell,{once:true});
else shell();
window.pmsvB75EvidenceQueue=Object.freeze({install:shell,refresh:()=>run("show"),status:()=>lastResult,
 previewCSV:()=>{const data=srcVerified();return data?buildCSV(data):""}});
})();