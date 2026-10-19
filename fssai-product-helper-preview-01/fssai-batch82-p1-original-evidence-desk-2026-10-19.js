(function(){"use strict";
/* Batch82: read-only P1 documentary evidence desk; neither FSSR identity nor
 * published CTR comparators automatically approve a food, method or lot. */
const URL="./data/rules/fssai-batch82-p1-22-original-evidence-desk-2026-10-19.json";
const PIN="86a20e46b3333653";
const GROUPS=["ALL","TRACE_METALS","MYCOTOXINS","PESTICIDE_RESIDUES","UNSPECIFIED_RESIDUE"];
let data=null,busy=false,search="",group="ALL",identity="ALL",owner="ALL";
const fields=["source_version_and_method_authority","commercial_article_identity","legal_ctr_article_and_analyte","lab_matrix_method_and_loq","lot_coa_and_independent_signoff"];
const node=(tag,value)=>{const el=document.createElement(tag);if(value!==undefined)el.textContent=String(value);return el};
const legalSource=url=>/^https:\/\/(?:[a-z0-9-]+\.)?fssai\.gov\.in\/[^?#]+(?:[?#].*)?$/i.test(url||"");
const digest=o=>typeof pmsvB14Digest==="function"?pmsvB14Digest(o):"";
function ready(){
 return window.pmsvFinal35LegalReview?.verified?.()===true&&
 window.pmsvB59CTRSourceCrosswalk?.valid?.()===true&&
 typeof pmsvB54Valid==="function"&&pmsvB54Valid()===true&&
 typeof pmsvB56Valid==="function"&&pmsvB56Valid()===true;
}
function verified(){
 try{
  if(!data||!ready()||digest(data)!==PIN)return false;
  const t=data.totals,p=data.source_digests;
  if(data.kind!=="PMSV_BATCH82_P1_22_CASE_110_ORIGINAL_DOCUMENTARY_EVIDENCE_REVIEW_NO_APPROVAL"||
   data.assembled_on!=="2026-10-19"||data.source_research_as_of!=="2026-10-17"||
   data.environment!=="GH_PAGES_FSSAI_PREVIEW_ONLY"||
   p?.b54!=="9a53b132b9b292f1"||p.b59!=="6791743a07c12e4f"||
   p.final35!=="45d0bd4d38c6ceb8"||p.b56!=="005621e8f737f08d"||
   digest(pmsvB54Data)!==p.b54||digest(pmsvB56Data)!==p.b56||
   !t||t.catalogue!==533||t.conditional_sources!==498||t.original_held_cases!==35||
   t.p0_unchanged!==13||t.p1_cases!==22||t.p1_original_request_ids!==110||
   t.p0_original_request_ids!==65||t.all_original_request_ids!==175||
   t.published_identity_only!==16||t.unspecified_formulation!==6||
   t.requested!==0||t.documents_received!==0||t.legal_limits_approved!==0||
   t.laboratory_methods_approved!==0||t.lot_coas!==0||t.releases!==0||
   t.wordpress_changed!==false||data.rows?.length!==22)return false;
  const previous=window.pmsvB59CTRSourceCrosswalk.getAllCases();
  if(previous.length!==35)return false;
  const cases=new Map(previous.map(x=>[x.catalogue_id,x]));
  const d54=new Map(pmsvB54Data.p1_dossiers.map(x=>[x.catalogue_id,x]));
  const d56=new Map(pmsvB56Data.cases.map(x=>[x.catalogue_id,x]));
  const allIDs=new Set(pmsvB56Data.cases.flatMap(x=>x.gates.map(g=>g.request_id)));
  if(allIDs.size!==175||d54.size!==22||d56.size!==35)return false;
  let names=0,unidentified=0;const seen=new Set(),requests=new Set();
  for(const x of data.rows){
   const old=cases.get(x.case_id),a=d54.get(x.case_id),b=d56.get(x.case_id);
   if(!old||!a||!b||seen.has(x.case_id)||x.priority!=="P1"||old.priority!=="P1"||
    !a.priority.startsWith("P1")||x.rank!==old.rank||x.rank!==a.rank||x.rank!==b.rank||
    x.product!==old.product_name||x.product!==a.product_name||x.product!==b.product_name||
    x.analyte!==old.analyte||x.analyte!==a.analyte||x.analyte_family!==a.analyte_family||
    x.identity_status!==a.identity_status||x.identity_source_class!==a.source_evidence.evidence_class||
    x.identity_standard_url!==a.source_evidence.source_url||x.identity_clause!==(a.source_evidence.standard_clause??"")||
    x.identity_research_note!==a.source_evidence.summary||
    x.identity_is_only_published_reference!==a.source_evidence.primary_product_identity_source_only||
    x.marketed_identity_proof_needed!==a.actual_market_identity_and_composition_needed||
    x.legal_scope_nontransfer_reason!==a.cTR_comparator_exclusion||
    x.laboratory_matrix_method_proof_needed!==a.required_accredited_assay_proof||
    !legalSource(x.identity_standard_url)||!legalSource(x.current_research_url)||
    !x.exact_legal_question||!x.first_missing_commercial_proof||
    x.documentary_requests?.length!==5||x.source_comparator_is_not_a_case_limit!==true||
    x.marketed_identity_authenticated!==false||x.legal_article_signed!==false||
    x.method_and_nabl_scope_signed!==false||x.actual_lot_coa_received!==false||
    x.release!=="HELD")return false;
   seen.add(x.case_id);
   if(x.identity_status==="PUBLISHED_PRODUCT_STANDARD_ONLY_COMMERCIAL_COMPLIANCE_UNVERIFIED")names++;
   else if(x.identity_status==="SUBSTANCE_OR_FORMULATION_UNSPECIFIED")unidentified++;
   else return false;
   const expected=old.original_request_ids;
   if(expected.length!==5||JSON.stringify(expected)!==JSON.stringify(b.gates.map(g=>g.request_id)))return false;
   for(let i=0;i<5;i++){
    const g=x.documentary_requests[i],aGate=a.original_five_documentary_requests[i],bGate=b.gates[i];
    if(!g||!aGate||!bGate||g.request_id!==expected[i]||g.request_id!==aGate.request_id||
     g.request_id!==bGate.request_id||g.gate_code!==aGate.gate_code||
     g.owner_role!==aGate.owner_role||g.required_evidence!==aGate.evidence_required||
     g.request_state!=="NOT_SENT"||g.document_state!=="NOT_RECEIVED"||
     g.authentication_state!=="NOT_AUTHENTICATED"||requests.has(g.request_id)||!allIDs.has(g.request_id))return false;
    requests.add(g.request_id);
   }
  }
  return seen.size===22&&requests.size===110&&names===16&&unidentified===6;
 }catch(_){return false}
}
function install(){
 const root=document.getElementById("pmsv-final35-legal-review");
 if(!root)return false;
 if(document.getElementById("pmsv-b82-p1-workbench"))return true;
 const host=root.querySelector(".tablewrap");if(!host)return false;
 const d=node("details");d.id="pmsv-b82-p1-workbench";d.className="card";
 d.style.maxWidth="100%";d.style.boxSizing="border-box";d.style.margin="12px 0";
 d.appendChild(node("summary","P1 · 22 unresolved products / 110 original documentary requests"));
 d.appendChild(node("p","Source-checked P1 product identity and contaminant-scope research. Every legal applicability question, FSSAI method, commercial formulation, accredited lab matrix and lot disposition remains HELD. This is NOT an approved legal contaminant limit."));
 const actions=node("div");actions.style.display="flex";actions.style.flexWrap="wrap";actions.style.gap="8px";
 const loadButton=node("button","Verify 22 P1 evidence dossiers");loadButton.type="button";loadButton.dataset.pmsvB82Load="";actions.appendChild(loadButton);
 const casesButton=node("button","Export 22-case CSV");casesButton.type="button";casesButton.disabled=true;casesButton.dataset.pmsvB82Export="CASES";actions.appendChild(casesButton);
 const gatesButton=node("button","Export 110-request CSV");gatesButton.type="button";gatesButton.disabled=true;gatesButton.dataset.pmsvB82Export="REQUESTS";actions.appendChild(gatesButton);d.appendChild(actions);
 const status=node("p","Load extended FSSAI evidence and verify the 35-case legal desk review first.");
 status.dataset.pmsvB82Status="";status.setAttribute("role","status");status.setAttribute("aria-live","polite");d.appendChild(status);
 const controls=node("div");controls.style.display="flex";controls.style.flexWrap="wrap";controls.style.gap="8px";
 function select(label,kind,opts){
  const wrapper=node("label",label+" ");wrapper.style.flex="1 1 170px";
  const sel=node("select");sel.dataset.pmsvB82Filter=kind;sel.style.maxWidth="100%";
  for(const [value,txt]of opts){const o=node("option",txt);o.value=value;sel.appendChild(o)}
  wrapper.appendChild(sel);controls.appendChild(wrapper);
 }
 select("Analyte family","group",[["ALL","All four groups"],["TRACE_METALS","Trace metals (15)"],["MYCOTOXINS","Mycotoxins (3)"],["PESTICIDE_RESIDUES","Named pesticide residues (3)"],["UNSPECIFIED_RESIDUE","Unspecified residue (1)"]]);
 select("Product identity","identity",[["ALL","All P1 cases"],["NAMED","Named FSSR reference (16)"],["UNSPECIFIED","Unspecified ingredient/formulation (6)"]]);
 select("Document owner","owner",[["ALL","All owner roles"],["FSSAI_QA_DIVISION_AND_LAB_DIRECTOR","FSSAI QA / lab director"],["MANUFACTURER_OR_SUPPLIER_QA","Manufacturer / supplier QA"],["REGULATORY_AFFAIRS_LEGAL","Regulatory / legal"],["LABORATORY_TECHNICAL_MANAGER","Laboratory manager"],["SITE_QA_AND_INDEPENDENT_REGULATORY_REVIEWER","Independent QA reviewer"]]);
 const label=node("label","Search product, analyte, legal question ");label.style.flex="2 1 180px";
 const input=node("input");input.type="search";input.placeholder="e.g. coffee, aflatoxin, lead";input.maxLength=140;input.dataset.pmsvB82Search="";input.style.maxWidth="100%";label.appendChild(input);controls.appendChild(label);
 d.appendChild(controls);
 const scroller=node("div");scroller.style.width="100%";scroller.style.maxWidth="100%";scroller.style.maxHeight="560px";scroller.style.overflow="auto";scroller.tabIndex=0;scroller.setAttribute("aria-label","P1 review table, horizontally scrollable");
 const table=node("table");table.style.minWidth="960px";const thead=node("thead"),tr=node("tr");
 for(const s of ["P1 original case / analyte","Identity reference (not sold-product approval)","Commercial/legal proof still missing","Laboratory proof still missing","Original five documentary requests"])tr.appendChild(node("th",s));
 thead.appendChild(tr);table.appendChild(thead);
 const tbody=node("tbody");tbody.dataset.pmsvB82Rows="";table.appendChild(tbody);scroller.appendChild(table);d.appendChild(scroller);
 d.appendChild(node("p","Research snapshot assembled 19 Oct 2026 from previously reviewed sources. No document requests sent, receipts, legally signed CTR limits, validated laboratory releases or lot CoAs. Do not upload confidential commercial dossiers to this public preview."));
 host.insertAdjacentElement("beforebegin",d);
 return true;
}
function fail(message){
 const d=document.getElementById("pmsv-b82-p1-workbench");if(!d)return;
 d.querySelector("[data-pmsv-b82-status]").textContent=message||"Original P1 source integrity unavailable. All 22 P1 cases remain HELD.";
 d.querySelector("[data-pmsv-b82-rows]").replaceChildren();
 d.querySelectorAll("[data-pmsv-b82-export]").forEach(x=>x.disabled=true);
}
function visibleRequests(x){return owner==="ALL"?x.documentary_requests:x.documentary_requests.filter(g=>g.owner_role===owner)}
function filtered(){
 if(!verified())return[];
 const term=search.toLocaleLowerCase().trim();
 return data.rows.filter(x=>
 (group==="ALL"||x.analyte_family===group)&&
 (identity==="ALL"||(identity==="NAMED"&&x.identity_status.startsWith("PUBLISHED_"))||
 (identity==="UNSPECIFIED"&&x.identity_status==="SUBSTANCE_OR_FORMULATION_UNSPECIFIED"))&&
 (owner==="ALL"||x.documentary_requests.some(g=>g.owner_role===owner))&&
 (!term||[x.product,x.case_id,x.analyte,x.legal_scope_nontransfer_reason,x.exact_legal_question,
 x.identity_research_note,x.marketed_identity_proof_needed].some(x=>String(x||"").toLocaleLowerCase().includes(term))));
}
function link(label,url){const a=node("a",label);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a}
function render(){
 if(!install())return false;
 if(!verified()){fail();return false}
 const d=document.getElementById("pmsv-b82-p1-workbench"),body=d.querySelector("[data-pmsv-b82-rows]");
 body.replaceChildren();
 for(const x of filtered()){
  const tr=node("tr"),a=node("td"),identityCell=node("td"),legal=node("td"),method=node("td"),requests=node("td");
  a.appendChild(node("b","P1 #"+x.rank+" · "+x.product));
  a.appendChild(node("small",x.analyte+" · "+x.analyte_family));
  identityCell.appendChild(node("div",x.identity_research_note));
  identityCell.appendChild(node("small",x.identity_status+" · "+x.identity_clause));
  identityCell.appendChild(link("FSSAI source context (not CTR approval)",x.identity_standard_url));
  legal.appendChild(node("div",x.marketed_identity_proof_needed));
  legal.appendChild(node("small","CTR row NOT transferable: "+x.legal_scope_nontransfer_reason));
  legal.appendChild(node("small","Open legal question: "+x.exact_legal_question));
  legal.appendChild(link("FSSAI research URL (not signed applicability)",x.current_research_url));
  method.appendChild(node("div",x.laboratory_matrix_method_proof_needed));
  method.appendChild(node("small","0 accredited scope / 0 lab results / 0 signed legal limits"));
  const chosen=visibleRequests(x);
  const details=node("details"),summary=node("summary",chosen.length+" original evidence ID"+(chosen.length===1?"":"s")+" · 0 sent · 0 received");details.appendChild(summary);
  const list=node("ol");
  for(const g of chosen){
   const li=node("li"),name=node("b",g.request_id+" · "+g.gate_code);li.appendChild(name);
   li.appendChild(node("small","Owner: "+g.owner_role+" · NOT_SENT / NOT_RECEIVED / NOT_AUTHENTICATED"));
   li.appendChild(node("div",g.required_evidence));list.appendChild(li);
  }
  details.appendChild(list);requests.appendChild(details);
  for(const item of [a,identityCell,legal,method,requests])tr.appendChild(item);
  body.appendChild(tr);
 }
 const shown=filtered(),visibleRequestCount=shown.reduce((n,x)=>n+visibleRequests(x).length,0);
 d.querySelector("[data-pmsv-b82-status]").textContent=shown.length+
  " P1 cases shown / 22 held · "+visibleRequestCount+" unsent requests in this view (110 original IDs in full dataset) · "+
  "0 requests sent · 0 legal/lab approvals · 0 CoAs or lot releases.";
 d.querySelectorAll("[data-pmsv-b82-export]").forEach(b=>b.disabled=false);
 return true;
}
async function load(){
 if(busy)return false;
 if(!install()||!ready()){data=null;fail("Load the original 35-case legal review and signed source checks before opening P1 evidence.");return false}
 busy=true;data=null;fail("Crosschecking P1 sources and 110 immutable original requests...");
 try{
  const resp=await fetch(URL+"?v=20261019-b82",{cache:"no-store"});
  if(!resp.ok)throw Error("P1 source not found");
  data=await resp.json();
  if(!verified())throw Error("P1 original source integrity blocked");
  return render();
 }catch(_){data=null;fail("P1 evidence dataset unavailable or failed ancestry verification. No approvals.");return false}
 finally{busy=false}
}
const quote=v=>{
 let s=String(v??"");if(/^\s*[=+@\-\t\r]/.test(s))s="'"+s;
 return '"'+s.replaceAll('"','""')+'"';
};
function csv(kind="CASES"){
 if(!verified()||!["CASES","REQUESTS"].includes(kind))return "";
 const cases=filtered();
 let rows;
 if(kind==="CASES"){
  rows=[["rank","case_id","product","analyte","analyte_family","identity_research_only","market_identity_missing",
  "CTR_SCOPE_NOT_ASSIGNED","exact_legal_question","lab_method_matrix_missing","five_original_request_IDs",
  "request_status","documents_received","legal_limit_signed","lab_method_signed","lot_CoA_received","release"]];
  for(const c of cases)rows.push([c.rank,c.case_id,c.product,c.analyte,c.analyte_family,
   c.identity_standard_url,c.marketed_identity_proof_needed,c.legal_scope_nontransfer_reason,
   c.exact_legal_question,c.laboratory_matrix_method_proof_needed,
   c.documentary_requests.map(g=>g.request_id).join(" | "),"NOT_SENT",false,false,false,false,"HELD"]);
 }else{
  rows=[["rank","case_id","product","analyte","original_request_id","gate_code","owner_role",
   "required_document","request_sent","document_received","authentic_evidence","legal_limit_approved",
   "accredited_method_approved","original_lot_CoA_received","release"]];
  for(const c of cases)for(const g of visibleRequests(c))rows.push([
   c.rank,c.case_id,c.product,c.analyte,g.request_id,g.gate_code,g.owner_role,
   g.required_evidence,false,false,false,false,false,false,"HELD"]);
 }
 return rows.map(row=>row.map(quote).join(",")).join("\r\n")+"\r\n";
}
function exportCSV(kind){
 if(!render())return false;
 const value=csv(kind);if(!value)return false;
 const u=window.URL.createObjectURL(new Blob(["\uFEFF"+value],{type:"text/csv;charset=utf-8"}));
 const a=node("a");a.href=u;a.download=kind==="CASES"?
  "PMSV-B82-P1-22-CASES-HELD.csv":"PMSV-B82-P1-110-ORIGINAL-UNSENT-EVIDENCE.csv";
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>window.URL.revokeObjectURL(u),1000);return true;
}
document.addEventListener("click",e=>{
 if(e.target?.closest?.("[data-pmsv-b82-load]"))void load();
 const exp=e.target?.closest?.("[data-pmsv-b82-export]");if(exp)exportCSV(exp.dataset.pmsvB82Export);
});
document.addEventListener("change",e=>{
 const s=e.target?.dataset?.pmsvB82Filter;if(!s)return;
 if(s==="group"&&GROUPS.includes(e.target.value))group=e.target.value;
 else if(s==="identity"&&["ALL","NAMED","UNSPECIFIED"].includes(e.target.value))identity=e.target.value;
 else if(s==="owner"&&(e.target.value==="ALL"||
  data?.rows?.some(x=>x.documentary_requests.some(g=>g.owner_role===e.target.value))))owner=e.target.value;
 else return;
 render();
});
document.addEventListener("input",e=>{
 if(e.target?.matches?.("[data-pmsv-b82-search]")){
  search=String(e.target.value??"").slice(0,140);render();
 }
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
window.pmsvB82P1Evidence=Object.freeze({install,load,verified,render,csv,filtered});
})();