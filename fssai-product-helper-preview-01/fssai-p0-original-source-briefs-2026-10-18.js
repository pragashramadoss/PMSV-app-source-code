(function(){"use strict";
/* Batch79 evidence annex for original 13 P0 held products; original-source
 * scope/negative rulings only, not assignment of contaminant ceilings. */
const PATH="./data/rules/fssai-final35-p0-original-notice-briefs-2026-10-18.json";
const PIN="e34faa108ef56619";let data=null,working=false;
function ready(){return window.pmsvFinal35LegalReview?.verified?.()===true&&window.pmsvB59CTRSourceCrosswalk?.valid?.()===true}
function verified(){
 try{
  if(!ready()||!data||typeof pmsvB14Digest!=="function"||pmsvB14Digest(data)!==PIN)return false;
  const t=data.totals,prior=window.pmsvB59CTRSourceCrosswalk.getAllCases?.(),m=new Map(prior.map(x=>[x.catalogue_id,x]));
  if(data.kind!=="PMSV_P0_13_ORIGINAL_GAZETTE_SCOPE_NEGATIVE_DECISIONS_ONLY"||data.as_of!=="2026-10-18"||data.parent_audit_digest!=="45d0bd4d38c6ceb8"||data.original_source_legal_disposition!=="ORIGINAL_NOTICE_ARTICLE_FOUND_BUT_CASE_APPLICABILITY_NOT_SIGNED"||t.catalogue!==533||t.pending!==35||t.p0!==13||t.p1!==22||t.original_requests_open!==175||t.product_approvals!==0||t.legal_applicability_signoffs!==0||t.lab_method_signoffs!==0||t.lot_coas!==0||t.releases!==0||data.rows?.length!==13||m.size!==35)return false;
  let count=0;const ids=new Set(),gates=new Set();
  for(const x of data.rows){
   const old=m.get(x.case_id);
   if(!old||old.priority!=="P0"||x.priority!=="P0"||ids.has(x.case_id)||x.rank!==old.rank||x.product!==old.product_name||x.analyte!==old.analyte||x.original_documentary_request_IDs!==old.original_request_ids.join(" | ")||x.exact_case_applicability_signed!==false||x.method_and_matrix_scope_signed!==false||x.original_representative_lot_CoA_received!==false||x.release!=="HELD"||!x.source_level_finding||!x.specific_external_material_needed||!x.independent_legal_or_laboratory_next_decision||!/^https:\/\/(?:[a-z0-9-]+\.)?fssai\.gov\.in\/.+\.pdf#page=\d+$/i.test(x.original_source_pdf_page))return false;
   ids.add(x.case_id);count++;
   for(const req of old.original_request_ids){if(gates.has(req))return false;gates.add(req)}
  }
  return count===13&&gates.size===65;
 }catch(_){return false}
}
function node(tag,str){const e=document.createElement(tag);if(str!==undefined)e.textContent=String(str);return e}
function install(){
 const parent=document.getElementById("pmsv-final35-legal-review");if(!parent)return false;
 if(document.getElementById("pmsv-p0-original-notices"))return true;
 const box=node("details");box.id="pmsv-p0-original-notices";box.style.margin="14px 0";box.style.padding="12px";box.style.border="1px solid #c9d6e8";box.style.borderRadius="12px";
 box.appendChild(node("summary","P0 · 13 exact original-notification scope decisions and first missing documents"));
 box.appendChild(node("p","Historical original legal rows are source research, NOT product-specific applicable contaminant maxima. Read the exact source passage and request the commercial documentary proof before any legal/lab/lot decision."));
 const btn=node("button","Verify 13 original-source briefs");btn.type="button";btn.dataset.p0OriginalLoad="";box.appendChild(btn);
 const csv=node("button","Export unsent P0 evidence-request briefs");csv.type="button";csv.disabled=true;csv.dataset.p0OriginalExport="";csv.style.marginLeft="8px";box.appendChild(csv);
 const status=node("p","Load and verify the 35-case product desk review first.");status.dataset.p0OriginalStatus="";status.setAttribute("role","status");status.setAttribute("aria-live","polite");box.appendChild(status);
 const scroll=node("div");scroll.style.maxWidth="100%";scroll.style.maxHeight="520px";scroll.style.overflow="auto";scroll.tabIndex=0;
 const table=node("table"),head=node("thead"),headrow=node("tr");table.style.minWidth="930px";
 for(const text of ["P0 original case","Published original legal source & non-transfer ruling","First missing manufacturer/market evidence","Legal or laboratory question that remains OPEN"])headrow.appendChild(node("th",text));
 head.appendChild(headrow);table.appendChild(head);const body=node("tbody");body.dataset.p0OriginalRows="";table.appendChild(body);scroll.appendChild(table);box.appendChild(scroll);
 box.appendChild(node("p","No supplier evidence was received here. No correspondence sent; no case approvals, validated methods, original lot CoAs, PASS or releases. This public prototype must not host supplier confidential records."));
 const target=parent.querySelector(".tablewrap");if(!target)return false;target.insertAdjacentElement("beforebegin",box);return true;
}
function fail(msg){const box=document.getElementById("pmsv-p0-original-notices");if(!box)return;box.querySelector("[data-p0-original-status]").textContent=msg||"Source integrity blocked. 13 P0 remain HELD.";box.querySelector("[data-p0-original-rows]").replaceChildren();box.querySelector("[data-p0-original-export]").disabled=true}
function render(){
 if(!install())return false;if(!verified()){fail();return false}
 const box=document.getElementById("pmsv-p0-original-notices"),body=box.querySelector("[data-p0-original-rows]");body.replaceChildren();
 for(const x of data.rows){
  const tr=node("tr"),caseCell=node("td",x.priority+" #"+x.rank+" · "+x.product),law=node("td",x.source_level_finding);
  caseCell.appendChild(node("small",x.analyte));
  law.appendChild(node("small",x.original_clause_reference));
  const a=node("a","View original FSSAI notification page");a.href=x.original_source_pdf_page;a.target="_blank";a.rel="noopener noreferrer";law.appendChild(a);
  for(const cell of [caseCell,law,node("td",x.specific_external_material_needed),node("td",x.independent_legal_or_laboratory_next_decision)])tr.appendChild(cell);
  body.appendChild(tr);
 }
 box.querySelector("[data-p0-original-status]").textContent="13 of 13 P0 original source-research briefs verified against 65 immutable evidence request IDs · 0 approvals · 0 CoAs · 0 releases.";
 box.querySelector("[data-p0-original-export]").disabled=false;return true
}
async function load(){
 if(working)return false;if(!ready()){data=null;fail("Verify the existing 35-case review and extended source integrity before this P0 audit.");return false}
 working=true;fail("Checking original source briefs against immutable first-source cases…");
 try{const r=await fetch(PATH+"?v=20261018-b79",{cache:"no-store"});if(!r.ok)throw Error("Missing source");data=await r.json();if(!verified())throw Error("Original source integrity failed");return render()}
 catch(_){data=null;fail("P0 original-source package unavailable or tampered: no approval.");return false}
 finally{working=false}
}
function csv(){
 if(!verified())return"";
 const e=x=>{let s=String(x??"");if(/^\s*[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
 const table=[["rank","case_id","product","analyte","original_five_document_request_ids","source_level_finding_NOT_CASE_LIMIT","FSSAI_original_source_page","first_missing_manufacturer_evidence","next_legal_laboratory_question","request_sent","evidence_received","case_legal_approved","lab_method_approved","representative_lot_CoA","release"]];
 for(const x of data.rows)table.push([x.rank,x.case_id,x.product,x.analyte,x.original_documentary_request_IDs,x.source_level_finding,x.original_source_pdf_page,x.specific_external_material_needed,x.independent_legal_or_laboratory_next_decision,"NOT_SENT","NOT_RECEIVED",false,false,false,"HELD"]);
 return table.map(line=>line.map(e).join(",")).join("\r\n")+"\r\n"
}
function exportCSV(){if(!render())return false;const value=csv();if(!value)return false;const u=URL.createObjectURL(new Blob(["\uFEFF"+value],{type:"text/csv;charset=utf-8"}));const a=node("a");a.href=u;a.download="PMSV-P0-13-ORIGINAL-SOURCE-UNSENT-EVIDENCE.csv";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);return true}
document.addEventListener("click",e=>{if(e.target?.closest?.("[data-p0-original-load]"))load();else if(e.target?.closest?.("[data-p0-original-export]"))exportCSV()});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
window.pmsvP0OriginalSourceBriefs=Object.freeze({install,load,render,csv,verified});
})();