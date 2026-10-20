(function(){"use strict";
/* Batch93. Only a verified UI for the Batch92 35-product PRE-approval scopes.
 * No confidential files, signed limits, method approvals, PASS or releases. */
const FILE="./data/rules/pmsv-final35-legal-test-scope-review-batch92-2026-10-20.json";
const PIN="aa456a9cb3ca2d2b",ID="pmsv-b93-legal-lab";
const TESTS={"Lead":24,"Ochratoxin A":1,"Residues":1,"Copper":1,"Pesticide MRLs":3,"Chromium":1,"Nickel":1,"Aflatoxins":2,"Antibiotics":1};
let data=null,loaded=false,selected="";
function el(tag,text,attrs){
 const d=document.createElement(tag);
 if(text!==undefined)d.textContent=String(text);
 Object.entries(attrs||{}).forEach(([k,v])=>d.setAttribute(k,String(v)));
 return d;
}
const host=()=>document.getElementById(ID);
function say(t){const e=host()?.querySelector("[data-b93-status]");if(e)e.textContent=t}
function valid(v){
 try{
  if(!window.pmsvB87Catalogue?.closureVerified?.()||
     !window.pmsvB58OwnerOutreach?.valid?.()||
     !window.pmsvB59CTRSourceCrosswalk?.valid?.()||
     typeof pmsvB14Digest!=="function"||pmsvB14Digest(v)!==PIN)return false;
  const sum=window.pmsvB87Catalogue.closedResearchSummary?.();
  if(sum?.catalogue!==533||sum.public_source_desk_research_closed!==35||
     sum.public_source_desk_research_open!==0||
     sum.external_legal_and_lot_verification_held!==35||
     sum.signed_product_limits!==0||sum.validated_lab_lot_pass!==0||
     sum.product_releases!==0)return false;
  if(v?.kind!=="PMSV_35_INDIVIDUAL_LEGAL_AND_LAB_METHOD_TECHNICAL_SCOPE_NO_APPROVAL"||
     v.as_of!=="2026-10-20"||v.records?.length!==35)return false;
  const t=v.totals;
  if(t?.catalogue!==533||t.source_research_closed!==35||
     t.preliminary_legal_method_reviews_written!==35||
     t.original_documentary_requests!==175||
     t.signed_product_legal_limits!==0||t.approved_lab_methods!==0||
     t.actual_lot_COAs!==0||t.lot_PASS!==0||t.released_lots!==0||
     Object.keys(t.analyteCounts||{}).length!==Object.keys(TESTS).length||
     Object.entries(TESTS).some(([k,n])=>t.analyteCounts[k]!==n))return false;
  const cases=window.pmsvB59CTRSourceCrosswalk.getAllCases?.();
  const requests=window.pmsvB58OwnerOutreach.records?.();
  if(cases?.length!==35||requests?.length!==175||typeof productCatalog!=="function")return false;
  const past=new Map(cases.map(c=>[c.catalogue_id,c]));
  const proof=new Map(requests.map(r=>[r.request_id,r]));
  const standard=new Map(productCatalog().map(p=>[p.id,p]));
  if(past.size!==35||proof.size!==175||standard.size<533)return false;
  const seen=new Set(),seenIds=new Set(),counts={},tier={P0:0,P1:0};
  for(const r of v.records){
   const c=past.get(r?.catalogue_id),p=standard.get(r?.catalogue_id);
   if(!c||!p||seen.has(r.catalogue_id)||
      r.rank!==c.rank||r.priority!==c.priority||
      r.analyte!==c.analyte||r.product!==c.product_name||
      r.product!==p.name||
      r.FSSR_identity!==String(p.fssr??"")||
      r.FoSCoS_category!==String(p.fcs??"")||
      r.source_desk_review!=="CLOSED_2026_10_20"||
      r.preliminary_technical_scope!=="DOCUMENTED_NOT_SIGNED"||
      r.defined_commercial_SKU!=="NOT_AUTHENTICATED"||
      r.current_product_applicable_numeric_limit!=="NOT_SIGNED"||
      r.valid_lab_method_and_scope!=="NOT_SIGNED"||
      r.representative_lot_coa!=="NOT_RECEIVED"||
      r.independent_legal_review!=="NOT_SIGNED"||
      r.lot_regulatory_PASS!=="NOT_DETERMINED"||
      r.QA_lot_release!=="HELD"||r.product_approval!=="NO"||
      r.original_requests_state!=="NOT_SENT_NOT_RECEIVED"||
      !r.product_specific_legal_applicability_decision||
      !r.product_specific_lab_method_requirements||
      !r.proposed_named_test_family||
      !Array.isArray(r.original_evidence_request_ids)||
      r.original_evidence_request_ids.length!==5||
      r.original_evidence_request_ids.join("|")!==c.original_request_ids?.join("|")||
      !/^https:\/\/(?:[\w-]+\.)?fssai\.gov\.in\//i.test(r.official_legal_comparator_source))return false;
   seen.add(r.catalogue_id);
   tier[r.priority]++;counts[r.analyte]=(counts[r.analyte]||0)+1;
   for(const id of r.original_evidence_request_ids){
    const q=proof.get(id);
    if(!q||seenIds.has(id)||q.case_id!==r.catalogue_id||
       q.original_document_status!=="NOT_RECEIVED"||
       q.original_request_status!=="NOT_SENT")return false;
    seenIds.add(id);
   }
  }
  return seen.size===35&&seenIds.size===175&&tier.P0===13&&tier.P1===22&&
   Object.keys(counts).length===Object.keys(TESTS).length&&
   Object.entries(TESTS).every(([k,n])=>counts[k]===n);
 }catch(_){return false}
}
function install(){
 if(host())return true;
 const anchor=document.getElementById("pmsv-b91-evidence-register")||document.getElementById("pmsv-b87-catalogue");
 if(!anchor)return false;
 const box=el("details",undefined,{id:ID,class:"card"});
 box.appendChild(el("summary","35 product-specific legal and lab scopes · research CLOSED / commercial approval HELD"));
 box.appendChild(el("p","The 35 preliminary legal/test scopes have been written. No product-level applicable limit, approved laboratory method, representative lot CoA, PASS or release is supported by the current evidence. This is not an approval portal."));
 const controls=el("div",undefined,{class:"b93-controls"});
 controls.appendChild(el("button","Verify and open 35 product dossiers",{type:"button","data-b93-load":""}));
 controls.appendChild(el("button","Export filtered readiness CSV",{type:"button","data-b93-csv":"",disabled:"disabled"}));
 controls.appendChild(el("button","Download 175 original unsent evidence requests",{type:"button","data-b94-requests":"",disabled:"disabled"}));
 controls.appendChild(el("button","Download 35 held commercial signoff forms",{type:"button","data-b94-forms":"",disabled:"disabled"}));
 box.appendChild(controls);
 const filters=el("div",undefined,{class:"b93-filters"});
 for(const [attr,label,options] of [
  ["priority","Priority",[["ALL","All"],["P0","P0 · 13"],["P1","P1 · 22"]]],
  ["analyte","Analyte",[["ALL","All"],...Object.entries(TESTS).map(([k,n])=>[k,k+" ("+n+")"])]]]){
  const l=el("label",label),s=el("select",undefined,{"data-b93-filter":attr});
  options.forEach(([val,name])=>s.appendChild(el("option",name,{value:val})));
  l.appendChild(s);filters.appendChild(l);
 }
 const search=el("label","Search product / FSSR / FoSCoS / analyte");
 search.appendChild(el("input",undefined,{type:"search","data-b93-search":"",maxlength:"120",placeholder:"Cocoa mass, lead, 2.3..."}));
 filters.appendChild(search);box.appendChild(filters);
 box.appendChild(el("p","Click Verify to load the pinned 35-case dataset.",{"data-b93-status":"","role":"status","aria-live":"polite"}));
 const scroll=el("div",undefined,{class:"b93-scroll",role:"region",tabindex:"0"});
 const table=el("table"),thead=el("thead"),h=el("tr");
 ["Case","Product and test","Legal and laboratory","QA status","Details"].forEach(x=>h.appendChild(el("th",x)));
 thead.appendChild(h);table.appendChild(thead);
 table.appendChild(el("tbody",undefined,{"data-b93-rows":""}));
 scroll.appendChild(table);box.appendChild(scroll);
 box.appendChild(el("div",undefined,{"data-b93-details":""}));
 box.appendChild(el("p","All generated documents are UNSENT drafts. Do not upload commercial formulas, certificates or laboratory reports into a public prototype.",{class:"b93-caution"}));
 anchor.insertAdjacentElement("afterend",box);
 const style=el("style",undefined,{id:"pmsv-b93-style"});
 style.textContent="#"+ID+" summary{font-weight:800;line-height:1.5;cursor:pointer}#"+ID+" .b93-controls{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}#"+ID+" .b93-filters{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:9px;margin:10px 0}#"+ID+" .b93-filters label{display:block;font-weight:700}#"+ID+" .b93-filters select,#"+ID+" .b93-filters input{width:100%;display:block;padding:9px;margin-top:4px}#"+ID+" .b93-scroll{width:100%;overflow-x:auto}#"+ID+" table{min-width:690px;width:100%}#"+ID+" td,#"+ID+" th{padding:9px;vertical-align:top;border-bottom:1px solid #dce3ed}#"+ID+" [data-b93-details]{border:1px solid #dce3ed;padding:12px;margin:12px 0;border-radius:10px;overflow-wrap:anywhere}#"+ID+" [data-b93-details] p{line-height:1.5;margin:8px 0}#"+ID+" .b93-caution{font-size:12px;color:#934e04}@media(max-width:480px){#"+ID+" .b93-controls button{width:100%;white-space:normal}}";
 document.head.appendChild(style);return true;
}
function rows(){
 if(!loaded||!valid(data))return null;
 const h=host(),tier=h.querySelector('[data-b93-filter="priority"]').value,
 analyte=h.querySelector('[data-b93-filter="analyte"]').value,
 query=h.querySelector("[data-b93-search]").value.trim().toLowerCase();
 return data.records.filter(r=>(tier==="ALL"||r.priority===tier)&&
 (analyte==="ALL"||r.analyte===analyte)&&
 (!query||[r.product,r.analyte,r.catalogue_id,r.FSSR_identity,r.FoSCoS_category].some(v=>String(v).toLowerCase().includes(query))))
 .sort((a,b)=>a.priority.localeCompare(b.priority)||a.rank-b.rank);
}
function detail(id){
 if(!loaded||!valid(data))return false;
 const r=data.records.find(x=>x.catalogue_id===id),box=host()?.querySelector("[data-b93-details]");
 if(!r||!box)return false;
 selected=id;box.replaceChildren();
 box.appendChild(el("h3","#"+r.rank+" · "+r.product+" — "+r.analyte));
 box.appendChild(el("p","Source research CLOSED · Legal limit NOT SIGNED · Lab method NOT SIGNED · Lot CoA NOT RECEIVED · PASS NOT DETERMINED · QA release HELD"));
 for(const [title,value] of [
  ["Manufacturer evidence",r.precise_product_identity_to_request],
  ["Specific legal question",r.product_specific_legal_applicability_decision],
  ["Why other-article limits are not applied",r.source_desk_legal_conclusion],
  ["Proposed method (NOT approved)",r.proposed_named_test_family],
  ["Matrix/method scope to qualify",r.product_specific_lab_method_requirements],
  ["Special technical caveat",r.special_technical_warning],
  ["Sample/chain of custody",r.sample_plan],
  ["Result evaluation gate",r.legal_comparison_rule],
  ["Original five proof IDs",r.original_evidence_request_ids.join(" | ")]
 ]){
  const p=el("p");p.appendChild(el("b",title+": "));p.appendChild(el("span",value));box.appendChild(p);
 }
 box.appendChild(el("a","Official FSSAI comparator (NOT a product-approved limit)",{href:r.official_legal_comparator_source,target:"_blank",rel:"noopener noreferrer"}));
 const actions=el("div",undefined,{class:"b93-controls"});
 for(const [type,label] of [["checker","Open actual product checker"],["evidence","Open five original evidence requests"],["rfq","Download UNSENT legal and laboratory RFQ"]])
  actions.appendChild(el("button",label,{type:"button","data-b93-action":type}));
 box.appendChild(actions);return true;
}
function block(message){
 loaded=false;data=null;selected="";
 const h=host();
 h?.querySelector("[data-b93-rows]")?.replaceChildren();
 h?.querySelector("[data-b93-details]")?.replaceChildren();
 if(h?.querySelector("[data-b93-csv]"))h.querySelector("[data-b93-csv]").disabled=true;
 if(h?.querySelector("[data-b94-requests]"))h.querySelector("[data-b94-requests]").disabled=true;
 if(h?.querySelector("[data-b94-forms]"))h.querySelector("[data-b94-forms]").disabled=true;
 say(message||"Source integrity unavailable. Product approvals remain HELD.");return false;
}
function render(){
 if(!install())return false;
 const records=rows();if(!records)return block("Data tampered or source validation failed. No commercial release.");
 const h=host(),body=h.querySelector("[data-b93-rows]");body.replaceChildren();
 for(const r of records){
  const tr=el("tr");
  tr.appendChild(el("td",r.priority+" #"+r.rank));
  tr.appendChild(el("td",r.product+" · "+r.analyte));
  tr.appendChild(el("td","Technical scope drafted / NOT SIGNED"));
  tr.appendChild(el("td","HELD"));
  const t=el("td");t.appendChild(el("button","View details",{type:"button","data-b93-case":r.catalogue_id}));tr.appendChild(t);body.appendChild(tr);
 }
 if(!records.some(r=>r.catalogue_id===selected))selected=records[0]?.catalogue_id||"";
 if(selected)detail(selected);else h.querySelector("[data-b93-details]").replaceChildren();
 h.querySelector("[data-b93-csv]").disabled=false;
 h.querySelector("[data-b94-requests]").disabled=false;
 h.querySelector("[data-b94-forms]").disabled=false;
 say(records.length+" of 35 technical dossiers shown · research 35/35 CLOSED · 0/35 legal, method or lot approvals · all commercial cases HELD.");
 return true;
}
async function load(){
 if(!install())return false;
 if(loaded)return render();
 say("Verifying original source integrity and 35 specific product dossiers…");
 try{
  if(!await window.pmsvB87Catalogue?.load?.())return block("Original source checks failed.");
  const res=await fetch(FILE+"?v=20261020-b93",{cache:"no-store"});
  if(!res.ok)return block("Technical scope data unavailable.");
  const incoming=await res.json();
  if(!valid(incoming))return block("Product scope proof or status integrity failed.");
  data=incoming;loaded=true;selected=data.records[0].catalogue_id;
  host().open=true;return render();
 }catch(_){return block("Technical source loading failed. All approvals HELD.")}
}
const quote=v=>{let s=String(v??"");if(/^\s*[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
function csv(){
 const f=rows();if(!f)return "";
 const keys=["rank","priority","catalogue_id","product","analyte","source_desk_review","preliminary_technical_scope","defined_commercial_SKU","current_product_applicable_numeric_limit","valid_lab_method_and_scope","representative_lot_coa","lot_regulatory_PASS","QA_lot_release","original_evidence_request_ids"];
 const list=[keys,...f.map(r=>keys.map(k=>Array.isArray(r[k])?r[k].join(" | "):r[k]))];
 return list.map(x=>x.map(quote).join(",")).join("\r\n")+"\r\n";
}
function rfq(id){
 if(!loaded||!valid(data))return "";
 const r=data.records.find(x=>x.catalogue_id===id);if(!r)return "";
 return [
 "PMSV DRAFT ONLY · NOT SENT · NOT A SIGNED REGULATORY OR LABORATORY APPROVAL",
 "Product "+r.product+"; case #"+r.rank+"; catalogue "+r.catalogue_id+"; analyte "+r.analyte,
 "MANUFACTURER: Authenticate real finished commercial SKU, maker and lot. Request: "+r.first_authentic_manufacturer_document,
 "REGULATORY/LEGAL: Sign current operative original Gazette article, applicability, exact limit/unit/basis, effective date. Review: "+r.product_specific_legal_applicability_decision,
 "Source comparator only, NEVER transferred to the marketed product: "+r.official_legal_comparator_source,
 "ACCREDITED LAB: Provide current NABL exact analyte/matrix/method/range scope; LOQ, recovery, CRM/blank, uncertainty, sample plan. Proposed technique NOT SIGNED: "+r.proposed_named_test_family,
 "LAB MATRIX: "+r.product_specific_lab_method_requirements,
 "SAMPLE/LOT: "+r.sample_plan,
 "INDEPENDENT QA: Original proof IDs "+r.original_evidence_request_ids.join(" | "),
 "No authenticated original supplier documents, signed legal limits, approved methods, tested lot CoAs or QA release exist in the present PMSV research evidence.",
 "Current status: source research CLOSED, case-specific technical plan DRAFTED, product compliance HELD.",
 "This locally downloaded RFQ does not send any message or verify evidence."
 ].join("\n\n")+"\n";
}
function download(s,file,type){
 if(!s)return false;
 const blob=new Blob([type==="text/csv"?"\uFEFF"+s:s],{type:type+";charset=utf-8"});
 const u=URL.createObjectURL(blob),a=el("a",undefined,{href:u,download:file});
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),1000);return true;
}
async function evidence(){
 if(!loaded||!valid(data)||!selected)return false;
 const ok=await window.pmsvB91EvidenceRegister?.load?.();
 if(!ok)return say("Five-request evidence register unavailable; commercial product still HELD."),false;
 const h=document.getElementById("pmsv-b91-evidence-register");
 const select=h?.querySelector("[data-b91-case]");
 if(!select||![...select.options].some(o=>o.value===selected))return false;
 select.value=selected;select.dispatchEvent(new Event("change",{bubbles:true}));
 h.open=true;h.scrollIntoView({block:"start",behavior:"auto"});return true;
}
document.addEventListener("click",e=>{
 const b=e.target?.closest?.("#"+ID+" button");if(!b)return;
 if(b.hasAttribute("data-b93-load"))load();
 else if(b.hasAttribute("data-b93-csv"))download(csv(),"PMSV-B93-FILTERED-35-LEGAL-TEST-READINESS-HELD.csv","text/csv");
 else if(b.hasAttribute("data-b94-requests")&&loaded&&valid(data)){
  const a=el("a",undefined,{href:"./data/rules/PMSV-B94-175-ORIGINAL-UNSENT-EVIDENCE-REQUESTS-2026-10-20.csv",download:"PMSV-B94-175-ORIGINAL-UNSENT-EVIDENCE-REQUESTS-2026-10-20.csv"});
  document.body.appendChild(a);a.click();a.remove();
 }else if(b.hasAttribute("data-b94-forms")&&loaded&&valid(data)){
  const a=el("a",undefined,{href:"../PMSV-B94-35-COMMERCIAL-PRODUCT-APPROVAL-SIGNOFF-FORMS-HELD-2026-10-20.csv",download:"PMSV-B94-35-COMMERCIAL-PRODUCT-APPROVAL-SIGNOFF-FORMS-HELD-2026-10-20.csv"});
  document.body.appendChild(a);a.click();a.remove();
 }
 else if(b.hasAttribute("data-b93-case"))detail(b.dataset.b93Case);
 else if(b.hasAttribute("data-b93-action")){
  if(b.dataset.b93Action==="checker"&&valid(data))window.pmsvB87Catalogue?.openInProductChecker?.(selected);
  else if(b.dataset.b93Action==="evidence")setTimeout(()=>{void evidence()},0);
  else if(b.dataset.b93Action==="rfq"&&selected)
   download(rfq(selected),"PMSV-B93-CASE-"+String(data.records.find(r=>r.catalogue_id===selected)?.rank||0).padStart(2,"0")+"-UNSENT-LEGAL-LAB-RFQ.txt","text/plain");
 }
});
document.addEventListener("input",e=>{if(e.target?.matches?.("#"+ID+" [data-b93-search]"))render()});
document.addEventListener("change",e=>{if(e.target?.matches?.("#"+ID+" [data-b93-filter]"))render()});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
window.pmsvB93LegalLab=Object.freeze({install,load,render,csv,rfq,detail,valid:()=>loaded&&valid(data)});
})();