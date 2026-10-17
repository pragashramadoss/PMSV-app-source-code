(function(){"use strict";
// Batch68: the remaining 12 P1 Lead identity and material-basis reviews. Research/exports only.
let data=null,family="ALL",search="";
const source="./data/rules/fssai-current35-remaining12-p1-lead-batch68-2026-10-17.json";
const pinned="9ffd03963c2d186f",prior59="6791743a07c12e4f",prior60="9cbb73557870ed10",prior67="05ddea87850b1e3e";
const groups={BOTANICAL_EXTRACT_SEEDS:"Botanical extracts / seeds",
POWDER_FLOUR_MATRICES:"Powder and flour identity",
ANIMAL_MILK_DERIVATIVES:"Animal and dairy derived",
CONDITIONAL_SUGAR_SALT_CHEMICAL:"Specific sugar / salt / chemical",
EDIBLE_METAL_FIBRE:"Edible silver and dietary fibre"};
const expected=[5,11,12,14,15,18,19,22,23,24,32,35];
function valid(){
 /* B72: ancestor required by the immediate validated predecessor; no gate bypass. */
 if(!window.pmsvB67SixMatrixEvidence?.valid()||
 typeof window.pmsvB59CTRSourceCrosswalk.getAllCases!=="function"||
 typeof pmsvB14Digest!=="function"||!data||pmsvB14Digest(data)!==pinned)return false;
 const t=data.totals,f=data.control_flags,originals=window.pmsvB59CTRSourceCrosswalk.getAllCases();
 if(data.kind!=="PMSV_BATCH68_REMAINING_12_P1_LEAD_IDENTITY_SOURCE_MATRIX_HELD"||
 data.as_of!=="2026-10-17"||data.surface!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
 data.b59_digest!==prior59||data.b60_digest!==prior60||data.b67_digest!==prior67||
 t?.catalogue!==533||t.conditional_first_source_matches!==498||t.held_ctr_cases!==35||
 t.p0!==13||t.p1!==22||t.reviewed_b66_p1!==5||t.reviewed_b67_p1!==5||
 t.batch68_remaining_p1!==12||t.research_routed_all_p1!==22||
 t.regulatory_approved_p1!==0||t.original_immutable_requests_for_batch!==60||
 t.original_immutable_requests_all35!==175||t.all35_source_gazettes_approved!==0||
 t.approved_case_specific_numeric_lead_maxima!==0||
 t.accredited_laboratory_matrix_approvals!==0||t.actual_original_lot_coas_received!==0||
 t.lot_passes!==0||t.wordpress_changed!==false||t.main_changed!==false||
 f?.all_35_held!==true||f.all_22_p1_still_open!==true||
 f.do_not_inherit_lead_row!==true||f.do_not_treat_product_identity_as_lead_limit!==true||
 f.do_not_use_compendium_as_signed_product_specific_gazette!==true||
 f.do_not_auto_use_generic_fallback!==true||f.do_not_auto_apply_conditional_ash_rule!==true||
 f.do_not_approve_lab_result!==true||f.do_not_release_product!==true||
 f.outreach_sent!==0||f.read_only_preview!==true||
 data.cases?.length!==12||originals?.length!==35||data.source_register?.length!==4)return false;
 const map=new Map(originals.map(c=>[c.rank,c])),seen=new Set(),seenRanks=new Set();
 if(map.size!==35)return false;
 const sources=new Map(data.source_register.map(s=>[s.id,s]));
 if(sources.size!==4||sources.get("FSSAI_CTR_2026_COMPENDIUM_IX")?.url!=="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf")return false;
 for(const c of data.cases){
 const p=map.get(c.rank);
 if(!p||!expected.includes(c.rank)||seenRanks.has(c.rank)||
 c.priority!=="P1"||c.analyte!=="Lead"||c.priority!==p.priority||
 c.catalogue_id!==p.catalogue_id||c.product_name!==p.product_name||
 c.analyte!==p.analyte||c.original_legal_gate!==p.original_legal_gate||
 JSON.stringify(c.original_request_ids)!==JSON.stringify(p.original_request_ids)||
 !Object.hasOwn(groups,c.scope_family)||
 !c.specific_nontransfer_rule||!c.original_material_identity_needed||
 !c.source_research_only_finding||c.next_original_evidence?.length!==4||
 c.next_original_evidence.some(x=>!x)||
 !c.source_ids?.includes("FSSAI_CTR_2026_COMPENDIUM_IX")||
 !c.source_ids.every(id=>sources.has(id))||
 c.authenticated_as_sold_material!==false||c.operative_exact_article_legal_signoff!==false||
 c.case_specific_numeric_lead_limit_approved!==false||c.nabl_lead_method_matrix_scope_verified!==false||
 c.original_lot_coa_received!==false||c.lot_pass!==false||c.case_released!==false)return false;
 if(c.rank===18||c.rank===22){
 if(!c.reference_only_comparator||c.reference_only_comparator.source_page<1||
 !c.reference_only_comparator.quoted_reference_not_limit)return false;
 }else if(c.reference_only_comparator!==null)return false;
 seenRanks.add(c.rank);
 if(c.original_request_ids.length!==5)return false;
 for(const id of c.original_request_ids){if(seen.has(id))return false;seen.add(id);}
 }
 return seen.size===60&&seenRanks.size===12&&expected.every(k=>seenRanks.has(k));
}
function filtered(){
 if(!valid())return[];
 const q=search.trim().toLocaleLowerCase("en");
 return data.cases.filter(c=>(family==="ALL"||c.scope_family===family)&&
 (!q||[c.rank,c.product_name,c.analyte,c.scope_family,c.specific_nontransfer_rule,
 c.original_material_identity_needed,c.source_research_only_finding,
 c.next_original_evidence.join(" ")].some(x=>String(x).toLocaleLowerCase("en").includes(q))));
}
function cell(tr,val){
 const td=document.createElement("td");td.textContent=String(val??"");tr.appendChild(td);return td;
}
function row(c){
 const tr=document.createElement("tr");
 cell(tr,"P1 #"+c.rank+" · Lead");cell(tr,c.product_name);
 cell(tr,c.specific_nontransfer_rule+" "+c.source_research_only_finding);
 cell(tr,c.original_material_identity_needed);
 const src=cell(tr,c.reference_only_comparator
 ? "Reference ONLY: "+c.reference_only_comparator.source_article+" — "+
 c.reference_only_comparator.quoted_reference_not_limit+" (NOT case limit). "
 : "Published identity/source references only; NO approved case number. ");
 for(const id of c.source_ids){
 const s=data.source_register.find(x=>x.id===id);
 const a=document.createElement("a");a.href=s.url;a.textContent=id.replaceAll("_"," ");
 a.target="_blank";a.rel="noopener noreferrer";src.appendChild(a);
 src.appendChild(document.createElement("br"));
 }
 cell(tr,c.next_original_evidence.map((v,i)=>(i+1)+". "+v).join("\n"));
 cell(tr,"HELD · "+c.original_request_ids.join(", ")+" · 0 approvals/lots");
 return tr;
}
function panel(){
 return '<details id="pmsv-b68-lead-source-review" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch68 · Remaining 12 P1 Lead source / matrix reviews</b> — all HELD</summary>'+
 '<div class="notice"><b>All 22 P1 source categories now researched, none signed off.</b> An FSSAI product identity entry, a published comparator for another food, and an original operative Gazette are three distinct things. Do not inherit a number from cocoa, cereal flour, milk, salt, sugars, animal tissue, or a conditional ash-based chemical row.</div>'+
 '<p>Zero product-specific regulatory limits, zero original lots, zero lab scope approvals. All 35 CTR cases stay open (13 P0 + 22 P1), and all 175 original evidence request IDs remain unchanged.</p>'+
 '<div class="checker-grid"><div class="field"><label>Source and material family</label><select data-pmsv-b68-family><option value="ALL">All 12 P1 cases</option>'+
 Object.entries(groups).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join("")+
 '</select></div><div class="field"><label>Search commodity or hold</label><input data-pmsv-b68-search maxlength="130" placeholder="e.g. carob, ash, lactose"/></div></div>'+
 '<p><b data-pmsv-b68-count>12 HELD research dossiers</b> · 60 original evidence requests.</p>'+
 '<div style="max-height:600px;overflow:auto"><table><thead><tr><th>Case</th><th>Product</th><th>Non-transfer boundary</th><th>Identity proof</th><th>Official research source (not product approval)</th><th>Four next original evidence actions</th><th>Decision</th></tr></thead><tbody data-pmsv-b68-rows></tbody></table></div>'+
 '<p><button type="button" data-pmsv-b68-export>Export 12 held dossiers (unsent CSV)</button></p>'+
 '<p class="countline">Read-only GitHub preview; no email transmitted, no regulatory/legal approval, no laboratory PASS and no product release. Isolated component checks are not an end-to-end startup certification.</p></details>';
}
function refresh(){
 if(!valid())return;
 const anchor=document.getElementById("pmsv-b67-six-matrix-review");if(!anchor)return;
 let el=document.getElementById("pmsv-b68-lead-source-review");
 if(!el){anchor.insertAdjacentHTML("afterend",panel());el=document.getElementById("pmsv-b68-lead-source-review");}
 const list=filtered();el.querySelector("[data-pmsv-b68-rows]").replaceChildren(...list.map(row));
 el.querySelector("[data-pmsv-b68-count]").textContent=list.length+" unapproved P1 dossier(s) · "+(list.length*5)+" original IDs";
}
function csv(){
 if(!valid())return"";
 const cols=["rank","priority","product","analyte","scope_family","product_identity_missing",
 "published_reference_only","forbidden_transfer","required_original_proofs",
 "original_immutable_evidence_ids","source_urls","identity_authenticated","operative_article_signed",
 "lead_case_limit_approved","nabl_matrix_approved","lot_coa_received","lot_pass","case_released"];
 const q=v=>{let s=String(v??"");if(/^\s*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const lines=filtered().map(c=>[c.rank,c.priority,c.product_name,c.analyte,c.scope_family,
 c.original_material_identity_needed,c.reference_only_comparator
 ? c.reference_only_comparator.source_article+" "+c.reference_only_comparator.quoted_reference_not_limit+" NOT APPROVED":"none",
 c.specific_nontransfer_rule,c.next_original_evidence.join(" | "),c.original_request_ids.join(" | "),
 c.source_ids.map(id=>data.source_register.find(x=>x.id===id).url).join(" | "),
 false,false,false,false,false,false,false]);
 return [cols.map(q).join(","),...lines.map(x=>x.map(q).join(","))].join("\r\n")+"\r\n";
}
function download(){
 const s=csv();if(!s)return;
 const url=URL.createObjectURL(new Blob(["\uFEFF"+s],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="PMSV-B68-12-P1-LEAD-IDENTITY-ALL-HELD.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),900);
}
const prior=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await prior();data=null;
 try{
 const r=await fetch(source+"?v=20261017-b68",{cache:"reload"});
 if(!r.ok)throw Error("Batch68 registry missing");
 data=await r.json();if(!valid())throw Error("Batch68 ancestry/case constraints invalid");refresh();
 }catch(_){data=null;}
};
document.addEventListener("change",e=>{
 if(e.target?.matches("[data-pmsv-b68-family]")&&
 (e.target.value==="ALL"||Object.hasOwn(groups,e.target.value))){family=e.target.value;refresh();}
});
document.addEventListener("input",e=>{
 if(e.target?.matches("[data-pmsv-b68-search]")){search=String(e.target.value||"").slice(0,130);refresh();}
});
document.addEventListener("click",e=>{
 if(e.target?.closest("[data-pmsv-b68-export]")&&valid())download();
});
window.pmsvB68RemainingLeadP1={valid,filtered,csv,getCounts:()=>({
 cases:data?.cases.length||0,leadP1:12,sourceRoutedP1:22,originalRequestIds:60,
 approvedP1:0,approvedLimits:0,lotPasses:0,all35Held:true
})};
})();
