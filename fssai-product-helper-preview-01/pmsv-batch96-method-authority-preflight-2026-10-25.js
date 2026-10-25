(function(){"use strict";
/* Batch96: read-only official method-authority preflight, never a compliance approval.
   Original 35 held cases / 175 immutable unsent requests are read from verified B58.
   No confidential data entry, storage, upload or recipient-directed action. */
const ID="pmsv-b96-method-preflight";
const METAL=new Set(["Lead","Copper","Chromium","Nickel"]);
const EXPECTED={"Lead":24,"Copper":1,"Chromium":1,"Nickel":1,
  "Ochratoxin A":1,"Residues":1,"Pesticide MRLs":3,"Aflatoxins":2,"Antibiotics":1};
const SOURCES=Object.freeze({
 directory:"https://www.fssai.gov.in/food-testing/manuals-methods-analysis",
 consultation:"https://fssai.gov.in/upload/uploadfiles/files/Manual%20of%20Methods%20of%20Analysis%20of%20Foods-%20Metals%20and%20Minerals.pdf",
 trace:"https://fssai.gov.in/upload/uploadfiles/files/MANUAL_FOR_ANALYSIS_OF_METALS_dt_18_04_2024.pdf",
 notice:"https://www.fssai.gov.in/food-law/notifications?notification=notice-for-comments"
});
const CONSULT_LOQ=Object.freeze({"Lead":"6","Copper":"0.3","Chromium":"5","Nickel":"3"});
let cases=[],ready=false,filter="ALL",query="",selected="";
function e(tag,txt,attributes){
 const x=document.createElement(tag);
 if(txt!==undefined)x.textContent=String(txt);
 for(const [k,v] of Object.entries(attributes||{}))x.setAttribute(k,String(v));
 return x;
}
function host(){return document.getElementById(ID)}
function say(s){const x=host()?.querySelector("[data-b96-status]");if(x)x.textContent=s}
function valid(){
 try{
  const b58=window.pmsvB58OwnerOutreach,b87=window.pmsvB87Catalogue;
  if(!b58?.valid?.()||!b87?.closureVerified?.())return false;
  const summary=b87.closedResearchSummary?.();
  if(summary?.catalogue!==533||summary.public_source_desk_research_closed!==35||
     summary.external_legal_and_lot_verification_held!==35||
     summary.product_releases!==0||summary.signed_product_limits!==0||
     summary.validated_lab_lot_pass!==0)return false;
  const rows=b58.records();
  if(!Array.isArray(rows)||rows.length!==175)return false;
  const groups=new Map(),requestIds=new Set(),counts={};
  for(const r of rows){
   if(!r||!r.case_id||!r.request_id||requestIds.has(r.request_id)||
      r.original_request_status!=="NOT_SENT"||
      r.original_document_status!=="NOT_RECEIVED"||
      r.routing!=="REQUEST_PREPARATION_POSSIBLE"&&r.routing!=="WAIT_FOR_UPSTREAM_EVIDENCE")return false;
   requestIds.add(r.request_id);
   let c=groups.get(r.case_id);
   if(!c){c={id:r.case_id,rank:r.rank,priority:r.priority,
     product:r.product,analyte:r.analyte,ids:[],ready:0,blocked:0};
     groups.set(r.case_id,c);counts[r.analyte]=(counts[r.analyte]||0)+1;}
   if(c.rank!==r.rank||c.priority!==r.priority||
      c.product!==r.product||c.analyte!==r.analyte)return false;
   c.ids.push(r.request_id);
   if(r.routing==="REQUEST_PREPARATION_POSSIBLE")c.ready++;
   else c.blocked++;
  }
  if(groups.size!==35||requestIds.size!==175)return false;
  if(Object.keys(counts).length!==9||
     Object.entries(EXPECTED).some(([k,v])=>counts[k]!==v))return false;
  if([...groups.values()].some(c=>c.ids.length!==5||new Set(c.ids).size!==5||
    c.ready!==2||c.blocked!==3||!["P0","P1"].includes(c.priority)))return false;
  return true;
 }catch(_){return false}
}
function entries(){
 if(!valid())return [];
 const groups=new Map();
 for(const r of window.pmsvB58OwnerOutreach.records()){
  if(!groups.has(r.case_id))groups.set(r.case_id,{
    id:r.case_id,rank:Number(r.rank),priority:r.priority,product:r.product,
    analyte:r.analyte,method_family:METAL.has(r.analyte)?"METALS":"NON_METAL",
    consultation_09001_loq_mgkg:CONSULT_LOQ[r.analyte]||"",
    decision:"AUTHORITY_VERSION_AND_MATRIX_LOQ_UNVERIFIED",
    evidence_status:"UNSENT_UNRECEIVED",legal_approval:"NO",
    method_approval:"NO",lot_pass:"NO",release:"HELD"});
 }
 return [...groups.values()].sort((a,b)=>a.rank-b.rank);
}
function draft(c){
 if(!c||!cases.some(x=>x.id===c.id))return "";
 const lines=[
  "PMSV Batch96 — DRAFT METHOD AUTHORITY CLARIFICATION — NOT SENT",
  "Product: "+c.product+" | Analyte: "+c.analyte+" | Case: "+c.id+" | Priority: "+c.priority,
  "Research CLOSED. Commercial legal/method/lot approval: HELD.",
  "Please confirm, using a controlled document and FSSAI order, the CURRENT adopted manual, complete procedure name, publication/revision date, method identifier and effective/supersession status.",
  "FSSAI method directory: "+SOURCES.directory
 ];
 if(c.method_family==="METALS"){
  lines.push("Two FSSAI-hosted 2024 PDFs give DIFFERENT procedures under FSSAI 09.001:2024; do not specify the number alone.",
  "52-page Metals and Minerals document linked in the 26 June 2024 public-comments notice: "+SOURCES.consultation,
  "61-page Trace Elements document: "+SOURCES.trace,
  "The 52-page ICP-OES 09.001 table reports "+c.analyte+" LOQ "+c.consultation_09001_loq_mgkg+" mg/kg. This is SOURCE-SPECIFIC analytical information, not a product limit or an accredited laboratory LOQ.",
  "The 61-page 09.001 is an AAS procedure for Pb, Cd, Zn, Cu and Fe, not the same procedure; it excludes food fat content >=40% and milk powder. Verify actual matrix applicability and identity first.",
  "Check whether a DIFFERENT complete procedure (such as an ICP-MS method) is appropriate and current; never infer equivalence or accreditation.");
 }else{
  lines.push("This is a NON-METAL analyte; neither metals PDF establishes an applicable method for it.",
  "Identify the specific official analyte method, commodity/matrix, residue or toxin definition where relevant, and effective version.");
 }
 lines.push("Provide exact test laboratory and current NABL scope for analyte + sample matrix + method + range; validated sample preparation, recovery, uncertainty and LOQ; legal limit and measurement basis must be separately signed by competent Regulatory/Legal.",
 "No lab method can be approved unless its demonstrated matrix LOQ is fit for the legally applicable limit, when established.",
 "DO NOT send confidential formulations/CoAs through this publicly hosted research preview.",
 "This is an unsent research request, not proof of FSSAI adoption, laboratory suitability, sample results, product PASS or QA release.");
 return lines.join("\n\n")+"\n";
}
function csv(){
 if(!ready||!valid())return "";
 const cols=["rank","priority","catalogue_id","product","analyte","method_family",
 "consultation_09001_loq_mgkg","decision","evidence_status","legal_approval","method_approval","lot_pass","release"];
 const selectedRows=visible();
 const quote=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
 return [cols,...selectedRows.map(c=>cols.map(k=>c[k]))]
  .map(row=>row.map(quote).join(",")).join("\r\n")+"\r\n";
}
function visible(){return cases.filter(c=>
 (filter==="ALL"||filter===c.method_family)&&
 (!query||[c.product,c.id,c.analyte,c.priority].some(v=>String(v).toLowerCase().includes(query))));
}
function download(body,name,mime){
 if(!body)return false;
 const url=URL.createObjectURL(new Blob([mime==="text/csv"?"\uFEFF"+body:body],{type:mime+";charset=utf-8"}));
 const a=e("a",undefined,{href:url,download:name});document.body.appendChild(a);
 a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;
}
function render(){
 if(!ready||!valid())return say("Source integrity changed or unavailable. All method preflight outputs blocked.");
 const box=host(),table=box?.querySelector("[data-b96-rows]"),pick=box?.querySelector("[data-b96-case]");
 if(!table||!pick)return;
 table.replaceChildren();
 const matches=visible();
 for(const c of matches){
  const tr=e("tr");
  tr.appendChild(e("td",c.priority+" #"+c.rank));
  tr.appendChild(e("td",c.product));
  tr.appendChild(e("td",c.analyte));
  tr.appendChild(e("td",c.method_family==="METALS"?"2024 method ID collision; validate matrix / LOQ":"Separate analyte method required"));
  table.appendChild(tr);
 }
 const old=selected;
 pick.replaceChildren();
 for(const c of matches)pick.appendChild(e("option",c.product+" — "+c.analyte,{value:c.id}));
 selected=matches.some(c=>c.id===old)?old:matches[0]?.id||"";
 pick.value=selected;
 box.querySelector("[data-b96-count]").textContent=
  matches.length+" cases displayed · 27 metal / 8 other in verified baseline · 0 approved · 35 HELD";
 const active=cases.find(c=>c.id===selected);
 box.querySelector("[data-b96-detail]").textContent=active?
  (active.method_family==="METALS"?
  "2024 consultation ICP-OES 09.001 "+active.analyte+" LOQ: "+active.consultation_09001_loq_mgkg+
  " mg/kg (not a legal limit). Different 61-page Trace Elements 09.001 procedure. Confirm current adopted source, actual matrix, accredited method and fit-for-limit LOQ.":
  "No metal-manual substitution: obtain separate current analyte-specific method authority, matrix and accredited scope.")+
  " Requests remain NOT SENT/NOT RECEIVED; no legal approval, method approval or lot PASS.":
  "No matching case; no request available.";
 say("Read-only preflight ready. These are conflicting published method references, not approved laboratory methods or product releases.");
}
async function load(){
 say("Verifying existing 35-case original-source ledger…");
 try{
  if(!await window.pmsvB87Catalogue?.load?.()||!valid()){
   ready=false;cases=[];say("Source verification failed. No method review or export allowed.");return false;
  }
  cases=entries();ready=cases.length===35;
  if(!ready){say("Case reconciliation failed; outputs blocked.");return false}
  render();return true;
 }catch(_){ready=false;cases=[];say("Source unavailable; all outputs blocked.");return false}
}
function install(){
 if(host())return;
 const anchor=document.getElementById("pmsv-b93-legal-lab")||
              document.getElementById("pmsv-b87-catalogue");
 if(!anchor)return;
 const box=e("details",undefined,{id:ID,class:"card"});
 box.appendChild(e("summary","Batch96 · Official analytical method authority / LOQ preflight (35 HELD cases)"));
 box.appendChild(e("p","Official-source warning: two FSSAI-hosted 2024 PDFs reuse FSSAI 09.001:2024 for different techniques. The 52-page Metals and Minerals manual appeared with a public-comments notice, while a 61-page Trace Elements manual is also hosted. Neither a file name nor a method number alone establishes current adoption or matrix suitability."));
 const links=e("p");
 [["FSSAI method directory",SOURCES.directory],["52-page Metals and Minerals",SOURCES.consultation],
  ["61-page Trace Elements",SOURCES.trace],["2024 public-comments notice",SOURCES.notice]].forEach(([name,url],i)=>{
   if(i)links.appendChild(document.createTextNode(" · "));
   const a=e("a",name,{href:url,target:"_blank",rel:"noopener noreferrer"});links.appendChild(a);
  });
 box.appendChild(links);
 box.appendChild(e("p","The source-specific 52-page 09.001 ICP-OES table reports LOQs (mg/kg): Lead 6; Copper 0.3; Chromium 5; Nickel 3. These are NOT commercial legal limits or guaranteed laboratory LOQs. The separate 61-page 09.001 AAS procedure has matrix exclusions (fat ≥40%; milk powder). An independent technical authority must resolve source status and fit-for-purpose sensitivity."));
 box.appendChild(e("button","Verify and load 35 cases",{type:"button","data-b96-load":""}));
 box.appendChild(e("p","Not loaded; nothing approved.",{"data-b96-status":"",role:"status","aria-live":"polite"}));
 const row=e("div",undefined,{class:"checker-grid"});
 const lab=e("label","Review subset");
 const sel=e("select",undefined,{"data-b96-filter":""});
 [["ALL","All 35"],["METALS","27 metals cases"],["NON_METAL","8 other analyte cases"]].forEach(([v,s])=>sel.appendChild(e("option",s,{value:v})));
 lab.appendChild(sel);row.appendChild(lab);
 const lab2=e("label","Search product or analyte");lab2.appendChild(e("input",undefined,{type:"search",maxlength:"100","data-b96-search":""}));row.appendChild(lab2);
 box.appendChild(row);
 box.appendChild(e("p","",{"data-b96-count":""}));
 const scroll=e("div",undefined,{style:"max-height:360px;overflow:auto"});
 const t=e("table"),h=e("thead"),tr=e("tr");
 ["Case","Product","Analyte","Method authority blocker"].forEach(n=>tr.appendChild(e("th",n)));
 h.appendChild(tr);t.appendChild(h);t.appendChild(e("tbody",undefined,{"data-b96-rows":""}));
 scroll.appendChild(t);box.appendChild(scroll);
 const lab3=e("label","Select held case for a technical clarification draft");
 lab3.appendChild(e("select",undefined,{"data-b96-case":""}));box.appendChild(lab3);
 box.appendChild(e("p","",{"data-b96-detail":""}));
 box.appendChild(e("button","Download selected UNSENT method-clarification draft",{type:"button","data-b96-draft":""}));
 box.appendChild(document.createTextNode(" "));
 box.appendChild(e("button","Download filtered preflight CSV",{type:"button","data-b96-export":""}));
 box.appendChild(e("p","No attachments, confidential documents, signatures, automatic sends, numeric legal limit transfers, lot PASS or release are handled here."));
 anchor.insertAdjacentElement("afterend",box);
}
document.addEventListener("click",event=>{
 const b=event.target?.closest?.("#"+ID+" button");if(!b)return;
 if(b.hasAttribute("data-b96-load")){void load();return}
 if(!ready||!valid())return say("Verify trusted records before exporting.");
 if(b.hasAttribute("data-b96-export"))download(csv(),"PMSV-B96-METHOD-AUTHORITY-UNVERIFIED-HELD.csv","text/csv");
 else if(b.hasAttribute("data-b96-draft")){
  const c=cases.find(x=>x.id===selected);if(c)download(draft(c),
  "PMSV-B96-CASE-"+String(c.rank).padStart(2,"0")+"-UNSENT-METHOD-CLARIFICATION.txt","text/plain");
 }
});
document.addEventListener("input",event=>{
 if(event.target?.matches?.("#"+ID+" [data-b96-search]")){
  query=String(event.target.value).slice(0,100).trim().toLowerCase();render();
 }
});
document.addEventListener("change",event=>{
 const t=event.target;
 if(t?.matches?.("#"+ID+" [data-b96-filter]")){filter=t.value;render()}
 else if(t?.matches?.("#"+ID+" [data-b96-case]")){selected=t.value;render()}
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
window.pmsvB96MethodPreflight=Object.freeze({valid,entries,draft,csv,load,install,sources:SOURCES});
})();