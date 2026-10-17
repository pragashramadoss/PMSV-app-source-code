(function(){
"use strict";
/* Batch60 read-only legal source-scope adjudication for remaining B59 20.
   Historical IDs remain identical; no actual commercial identity, CoA,
   law signoff, product approval or backend transmitted by this workbench. */
var dataset=null,priority="ALL",group="ALL",search="";
const source="./data/rules/fssai-current35-remaining20-legal-scope-review-batch60-2026-10-17.json";
const expected="9cbb73557870ed10";
const categories={
 PESTICIDE_EXACT_FOOD:"Pesticides: exact analyte + commodity (4)",
 LEAD_COMMODITY_IDENTITY:"Lead: named food/product identity (9)",
 LEAD_CLASS_NEEDS_INDIVIDUAL:"Lead: unnamed chemical or additive class (4)",
 AFLATOXIN_NAMED_INGREDIENT:"Aflatoxins: individual ingredient vs premix (2)",
 ANTIBIOTIC_SCOPE_DIFFERENCE:"Antibiotics: royal jelly vs honey (1)"
};
function valid(){
 if(typeof pmsvB59CTRSourceCrosswalk==="undefined"&&
   !window.pmsvB59CTRSourceCrosswalk)return false;
 if(!window.pmsvB59CTRSourceCrosswalk?.valid()||
  typeof pmsvB14Digest!=="function"||!dataset||
  pmsvB14Digest(dataset)!==expected||!pmsvB56Valid())return false;
 const d=dataset,t=d.totals;
 if(d.kind!=="PMSV_BATCH60_PENDING20_OPERATIVE_SCOPE_TRIAGE_NO_APPROVAL"||
    d.as_of!=="2026-10-17"||d.environment!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
    d.prior_batch59_document_digest!=="6791743a07c12e4f"||
    t.catalogue!==533||t.conditional_source_matches!==498||t.open_ctr_cases!==35||
    t.previous_batch59_nontransfer_comparators!==15||
    t.reviewed_remaining_prior_no_comparator!==20||t.official_text_routing_research_completed!==20||
    t.covered_existing_immutable_gate_ids!==100||t.p0_open_covered!==1||t.p1_open_covered!==19||
    t.legacy_original_request_ids_all!==175||t.preparatory_unsent!==70||t.dependent_unsent!==105||
    t.original_documents_received!==0||t.original_authentic_case_gazettes!==0||
    t.case_specific_numeric_legal_approvals!==0||t.case_specific_original_coa_received!==0||
    t.laboratory_method_matrix_scope_approved!==0||t.lot_pass!==0||t.wordpress_changed!==false||
    d.original_gazette_boundary?.effective_on_review_date!==false||
    d.original_gazette_boundary?.commencement!=="2026-12-01"||
    d.controls?.automatic_legal_limits_disabled!==true||d.controls?.case_releases!==0||
    d.cases?.length!==20||Object.keys(categories).length!==5)return false;
 const orig=new Map(pmsvB59CTRSourceCrosswalkSource().filter(c=>!c.reference).map(c=>[c.catalogue_id,c]));
 const seen=new Set(),reqs=new Set(),found={};let p0=0,p1=0;
 for(const c of d.cases){
  const a=orig.get(c.catalogue_id);
  if(!a||seen.has(c.catalogue_id)||a.rank!==c.rank||a.priority!==c.priority||
     a.product_name!==c.product_name||a.analyte!==c.analyte||
     a.original_legal_gate!==c.original_legal_gate||
     JSON.stringify(c.immutable_five_original_request_ids)!==JSON.stringify(a.original_request_ids)||
     !Object.hasOwn(categories,c.group)||c.source_review_result!=="LEGAL_SCOPE_ROUTING_RESEARCH_ONLY"||
     !c.research_finding_not_compliance_decision||!c.next_exact_external_evidence_needed||
     c.authoritative_research_urls?.length<1||
     c.exact_case_specific_operative_gazette_verified!==false||
     c.exact_marketed_product_or_substance_identity_authenticated!==false||
     c.legally_applicable_numeric_maximum_signed!==false||
     c.original_method_and_nabl_scope_verified!==false||
     c.original_lot_coa_received!==false||c.case_released!==false)return false;
  seen.add(c.catalogue_id);c.priority==="P0"?p0++:p1++;
  found[c.group]=(found[c.group]||0)+1;
  c.immutable_five_original_request_ids.forEach(k=>{if(reqs.has(k))throw Error("B60 duplicate historical gate");reqs.add(k);});
 }
 return seen.size===20&&reqs.size===100&&p0===1&&p1===19&&
  Object.entries({PESTICIDE_EXACT_FOOD:4,LEAD_COMMODITY_IDENTITY:9,
   LEAD_CLASS_NEEDS_INDIVIDUAL:4,AFLATOXIN_NAMED_INGREDIENT:2,
   ANTIBIOTIC_SCOPE_DIFFERENCE:1}).every(([k,n])=>found[k]===n&&d.groups[k]===n);
}
function pmsvB59CTRSourceCrosswalkSource(){
 /* The underlying B59 source is validated via its existing read-only interface;
    the selected B60 ids must all exist in B56 and not be in B59 reference set.
    The B59 .filtered() method may reflect user filter state, so DO NOT rely on it. */
 const f=window.pmsvB59CTRSourceCrosswalk;
 return f.getAllCases ? f.getAllCases() : pmsvB56Data.cases.map(c=>({
  ...c,reference:dataset?.cases?.some(x=>x.catalogue_id===c.catalogue_id)?null:{in_prior_batch59:true},
  original_request_ids:c.gates.map(g=>g.request_id)
 }));
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function filtered(){
 if(!valid())return[];
 const q=search.trim().toLowerCase();
 return dataset.cases.filter(c=>(priority==="ALL"||c.priority===priority)&&
    (group==="ALL"||c.group===group)&&(!q||
     [c.rank,c.product_name,c.analyte,c.research_finding_not_compliance_decision,
      c.next_exact_external_evidence_needed,c.textually_supported_scope]
     .some(x=>String(x).toLowerCase().includes(q))));
}
function opt(value,label,selected){return '<option value="'+esc(value)+'"'+(selected===value?" selected":"")+'>'+esc(label)+'</option>';}
function rows(){
 return filtered().map(c=>'<tr><td><b>'+esc(c.priority)+' #'+esc(c.rank)+'</b></td>'+
 '<td><b>'+esc(c.product_name)+'</b><small>'+esc(c.analyte)+' | '+esc(c.original_legal_gate)+'</small></td>'+
 '<td>'+esc(c.research_finding_not_compliance_decision)+
 '<small>Source: '+esc(c.textually_supported_scope)+'</small>'+
 '<small>'+c.authoritative_research_urls.map((u,i)=>'<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">Official source '+(i+1)+'</a>').join(" · ")+'</small></td>'+
 '<td>'+esc(c.next_exact_external_evidence_needed)+'</td>'+
 '<td><b>OPEN</b><small>No legal limit or lot PASS.</small></td></tr>').join("");
}
function panel(){
 return '<details id="pmsv-b60-operative-text-review" class="card" style="margin-bottom:12px">'+
  '<summary><b>Batch60 · Remaining 20 source-scope decisions</b> — zero approvals; original 35-case hold</summary>'+
  '<div class="notice"><b>20/20 pending Batch59 cases now have a documented legal research route, not 20 validated products.</b> The original 15 Batch59 source comparisons and all 175 original evidence gates remain intact. The legal operative article, commercial identity, signed limit, accredited lab method and lot outcome remain unverified.</div>'+
  '<p>The source text distinguishes <b>pesticide × food MRLs</b>, <b>total vs B1 aflatoxin and containing-food rules</b>, <b>honey vs royal-jelly antibiotic scope</b>, and <b>generic chemical classes vs individually identified substances</b>. No source-category analogy is silently applied to a manufactured product.</p>'+
  '<p><b>Current source:</b> <a target="_blank" rel="noopener noreferrer" href="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf">FSSAI CTR version IX (3 Feb 2026)</a>. FSSAI also warns that consolidated compendia are guidance, not a substitute for the original operative Gazette.</p>'+
  '<div class="checker-grid"><div class="field"><label>Priority</label><select data-pmsv-b60-priority>'+
  opt("ALL","All 20",priority)+opt("P0","P0 (1)",priority)+opt("P1","P1 (19)",priority)+'</select></div>'+
  '<div class="field"><label>Legal research family</label><select data-pmsv-b60-group>'+
  opt("ALL","All five research families",group)+Object.entries(categories).map(([k,n])=>opt(k,n,group)).join("")+'</select></div>'+
  '<div class="field"><label>Search product, source finding or analyte</label><input maxlength="140" data-pmsv-b60-search value="'+esc(search)+'" placeholder="e.g. egg powder, carob, aflatoxin"/></div></div>'+
  '<p><b data-pmsv-b60-count>20 source-scope dossiers</b> · 0 signed numeric CTR limits · 0 validated lots</p>'+
  '<div style="max-height:540px;overflow:auto"><table><thead><tr><th>Priority</th><th>Selected food article</th><th>What official source text establishes</th><th>Specific documentary next step</th><th>Decision</th></tr></thead><tbody data-pmsv-b60-rows></tbody></table></div>'+
  '<p><button type="button" data-pmsv-b60-export>Export source routing CSV (unverified only)</button></p>'+
  '<p class="countline">No evidence automatically requested, received, attested or transmitted. No FSSAI/NABL methods selected. Only authorized reviewers with original commercial and statutory evidence can make case-specific release decisions.</p></details>';
}
function refresh(){
 if(!valid()||typeof document==="undefined")return;
 const anchor=document.getElementById("pmsv-b59-ctr-nontransfer");
 if(!anchor)return;
 let el=document.getElementById("pmsv-b60-operative-text-review");
 if(!el){anchor.insertAdjacentHTML("afterend",panel());el=document.getElementById("pmsv-b60-operative-text-review");}
 el.querySelector("[data-pmsv-b60-count]").textContent=filtered().length+" source-scope dossier(s) — legal application NOT verified";
 el.querySelector("[data-pmsv-b60-rows]").innerHTML=rows();
}
function csv(){
 if(!valid())return "";
 const fields=["rank","priority","case","analyte","original_ctr_evidence_gate","research_group",
 "official_source_text_not_case_approval","research_finding","missing_original_evidence",
 "fssai_official_urls","case_specific_original_gazette_verified","numeric_limit_legally_approved",
 "selected_lab_method_scope_verified","representative_lot_coa_received","lot_pass"];
 const quote=x=>{let s=String(x??"");if(/^\s*[=+\-@]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';};
 const list=filtered().map(c=>[c.rank,c.priority,c.product_name,c.analyte,c.original_legal_gate,
  c.group,c.textually_supported_scope,c.research_finding_not_compliance_decision,
  c.next_exact_external_evidence_needed,c.authoritative_research_urls.join(" ; "),
  false,false,false,false,false]);
 return [fields.map(quote).join(","),...list.map(l=>l.map(quote).join(","))].join("\r\n")+"\r\n";
}
function download(){
 const text="\uFEFF"+csv(),url=URL.createObjectURL(new Blob([text],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="PMSV-B60-20-LEGAL-SOURCE-ROUTING-NO-APPROVAL.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),900);
}
const priorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await priorLoad();dataset=null;
 try{const r=await fetch(source+"?v=20261017-b60",{cache:"reload"});
  if(!r.ok)throw Error("Batch60 source not found");
  dataset=await r.json();if(!valid())throw Error("Batch60 heritage/case integrity invalid");refresh();
 }catch(_){dataset=null;}
};
document.addEventListener("change",ev=>{
 const e=ev.target;if(!e)return;
 if(e.matches("[data-pmsv-b60-priority]")&&["ALL","P0","P1"].includes(e.value))priority=e.value;
 else if(e.matches("[data-pmsv-b60-group]")&&(e.value==="ALL"||Object.hasOwn(categories,e.value)))group=e.value;
 else return;refresh();
});
document.addEventListener("input",ev=>{
 if(ev.target?.matches("[data-pmsv-b60-search]")){search=String(ev.target.value||"").slice(0,140);refresh();}
});
document.addEventListener("click",ev=>{if(ev.target?.closest("[data-pmsv-b60-export]")&&valid())download();});
window.pmsvB60LegalScope={
 valid,filtered,csv,getCounts:()=>({cases:dataset?.cases?.length||0,
  pesticide:dataset?.groups?.PESTICIDE_EXACT_FOOD||0,
  leadNamed:dataset?.groups?.LEAD_COMMODITY_IDENTITY||0,
  leadClass:dataset?.groups?.LEAD_CLASS_NEEDS_INDIVIDUAL||0,
  aflatoxin:dataset?.groups?.AFLATOXIN_NAMED_INGREDIENT||0,
  antibiotic:dataset?.groups?.ANTIBIOTIC_SCOPE_DIFFERENCE||0,
  originalEvidence:0,caseApprovals:0,lotPasses:0})
 };
})();
