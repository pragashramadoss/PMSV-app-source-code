(function(){"use strict";
// B67: 5 P1 + 1 P0 hold-specific official CTR source distinctions; no PASS, no send.
let data=null,family="ALL",search="";
const source="./data/rules/fssai-current35-six-matrix-evidence-batch67-2026-10-17.json";
const pinned="05ddea87850b1e3e";
const groups={OTA_COFFEE_BLEND:"Ochratoxin: coffee/chicory",PESTICIDE_FROZEN_FRUIT:"Residues: frozen fruits",PESTICIDE_ARROWROOT:"MRL: arrowroot starch",PESTICIDE_EGG_POWDER:"MRL: dehydrated eggs",PESTICIDE_PICKLED_EGGS:"MRL: pickled eggs",ANTIBIOTIC_ROYAL_JELLY:"Antibiotics: royal jelly"};
function valid(){
 /* B72: ancestor required by the immediate validated predecessor; no gate bypass. */
 if(!window.pmsvB66NutraIngredientAudit?.valid()||typeof window.pmsvB59CTRSourceCrosswalk.getAllCases!=="function"||
 typeof pmsvB14Digest!=="function"||!data||pmsvB14Digest(data)!==pinned)return false;
 const t=data.totals,c=data.controls,originals=window.pmsvB59CTRSourceCrosswalk.getAllCases();
 if(data.kind!=="PMSV_BATCH67_6_EXACT_ANALYTE_MATRIX_NONTRANSFER"||data.surface!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
 data.as_of!=="2026-10-17"||data.b59_digest!=="6791743a07c12e4f"||data.b60_digest!=="9cbb73557870ed10"||data.b66_digest!=="00a67ba10f24fee2"||
 t?.catalogue!==533||t.conditional_first_sources!==498||t.held_ctr_cases!==35||t.p0!==13||t.p1!==22||
 t.batch67_cases!==6||t.batch67_p0!==1||t.batch67_p1!==5||t.ota!==1||t.pesticides!==4||t.antibiotics!==1||
 t.immutable_original_request_ids!==30||t.all_original_requests!==175||
 t.original_case_gazettes_received!==0||t.signed_case_numeric_limits!==0||
 t.lab_matrix_scope_approvals!==0||t.original_lot_coas_received!==0||t.lot_passes!==0||t.wordpress_changed!==false||
 c?.all_35_open!==true||c.allow_named_food_cross_product_transfer!==false||
 c.allow_shell_free_or_dry_process_auto_conversion!==false||
 c.allow_comparator_as_legal_case_limit!==false||c.allow_honey_royal_jelly_inheritance!==false||
 c.allow_lab_pass!==false||c.allow_product_release!==false||c.owner_evidence_emails_sent!==0||
 data.source?.url!=="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf"||
 originals?.length!==35||data.cases?.length!==6)return false;
 const baseline=new Map(originals.map(x=>[x.rank,x])),ids=new Set(),ranks=new Set();
 for(const x of data.cases){
 const old=baseline.get(x.rank);
 if(!old||ranks.has(x.rank)||x.priority!==old.priority||x.catalogue_id!==old.catalogue_id||
 x.product_name!==old.product_name||x.analyte!==old.analyte||x.original_legal_gate!==old.original_legal_gate||
 JSON.stringify(x.original_request_ids)!==JSON.stringify(old.original_request_ids)||
 !Object.hasOwn(groups,x.source_group)||x.official_compendium_url!==data.source.url||
 !Number.isInteger(x.source_page)||x.source_page<1||!x.source_quotation_scope||!x.blocked_transfer||
 x.next_required_originals?.length!==4||x.next_required_originals.some(s=>!s)||
 x.identity_verified!==false||x.operative_case_rule_signed!==false||
 x.case_numeric_limit_approved!==false||x.lab_analyte_matrix_scope_approved!==false||
 x.lot_coa_received!==false||x.lot_pass!==false||x.case_released!==false)return false;
 ranks.add(x.rank);
 for(const id of x.original_request_ids){if(ids.has(id))return false;ids.add(id);}
 }
 return ranks.size===6&&ids.size===30&&[2,4,13,16,17,31].every(x=>ranks.has(x))&&
 data.cases.find(x=>x.rank===31).priority==="P0"&&
 data.cases.find(x=>x.rank===2).research_only_number?.includes("UNAPPROVED");
}
function filtered(){
 if(!valid())return[];
 const q=search.trim().toLowerCase();
 return data.cases.filter(x=>(family==="ALL"||x.source_group===family)&&(!q||
 [x.rank,x.product_name,x.analyte,x.source_quotation_scope,x.blocked_transfer,x.next_required_originals.join(" ")]
 .some(v=>String(v).toLowerCase().includes(q))));
}
function td(tr,s){const x=document.createElement("td");x.textContent=String(s);tr.appendChild(x);return x;}
function makeRow(c){
 const tr=document.createElement("tr");
 td(tr,c.priority+" #"+c.rank+" · "+c.analyte);td(tr,c.product_name);
 const sourceCell=td(tr,c.article+" — "+c.source_quotation_scope);
 const a=document.createElement("a");a.href=c.official_compendium_url;a.target="_blank";a.rel="noopener noreferrer";
 a.textContent="Official CTR IX · PDF p."+c.source_page;sourceCell.appendChild(document.createElement("br"));sourceCell.appendChild(a);
 td(tr,(c.research_only_number?c.research_only_number+" — ":"")+c.blocked_transfer);
 td(tr,c.next_required_originals.map((s,i)=>(i+1)+". "+s).join("\n"));
 td(tr,"HELD · 5 original requests intact; no numerical approval, CoA or lot PASS");return tr;
}
function panel(){
 return '<details id="pmsv-b67-six-matrix-review" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch67 · Six matrix-specific OTA, pesticide & antibiotic source checks</b> — all HELD</summary>'+
 '<div class="notice"><b>Official reference ≠ legal case approval:</b> CTR IX coffee-only OTA, named pesticide × food and honey-production antibiotic provisions cannot automatically transfer to coffee/chicory, frozen fruit, arrowroot, dried/pickled eggs or royal jelly. Original operative Gazette, authenticated material and NABL analyte/matrix method remain outstanding.</div>'+
 '<div class="checker-grid"><div class="field"><label>Regulatory source group</label><select data-pmsv-b67-family><option value="ALL">All six open cases</option>'+
 Object.entries(groups).map(x=>'<option value="'+x[0]+'">'+x[1]+'</option>').join("")+
 '</select></div><div class="field"><label>Search exact review</label><input data-pmsv-b67-search maxlength="130" placeholder="e.g. honey, egg, OTA"/></div></div>'+
 '<p><b data-pmsv-b67-count>6 HELD cases</b> · original 30 evidence IDs kept.</p>'+
 '<div style="max-height:580px;overflow:auto"><table><thead><tr><th>Case</th><th>Product</th><th>Official named source — reference only</th><th>Why not transferred</th><th>Four next original proof items</th><th>Decision</th></tr></thead><tbody data-pmsv-b67-rows></tbody></table></div>'+
 '<p><button type="button" data-pmsv-b67-export>Export evidence-only CSV (unsent)</button></p>'+
 '<p class="countline">All 35 CTR cases remain HELD and all 175 original evidence IDs unchanged. No source owner communication, signed legal maximum, laboratory method signoff or original lot CoA received. Isolated UI test is NOT complete-preview startup certification.</p></details>';
}
function refresh(){
 if(!valid())return;
 const anchor=document.getElementById("pmsv-b66-nutra-source-audit");if(!anchor)return;
 let el=document.getElementById("pmsv-b67-six-matrix-review");
 if(!el){anchor.insertAdjacentHTML("afterend",panel());el=document.getElementById("pmsv-b67-six-matrix-review");}
 const f=filtered();
 el.querySelector("[data-pmsv-b67-rows]").replaceChildren(...f.map(makeRow));
 el.querySelector("[data-pmsv-b67-count]").textContent=f.length+" HELD cases, 0 approved limits/lots";
}
function csv(){
 if(!valid())return"";
 const quote=v=>{let s=String(v??"");if(/^\s*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const header=["rank","priority","product","analyte","official_comparator_scope","why_transfer_blocked","proof_still_needed","source_url","original_five_evidence_ids","named_identity_approved","operative_gazette_signed","numeric_limit_approved","lab_matrix_approved","original_lot_coa_received","lot_pass","product_released"];
 const lines=filtered().map(c=>[c.rank,c.priority,c.product_name,c.analyte,c.source_quotation_scope,
 c.blocked_transfer,c.next_required_originals.join(" | "),c.official_compendium_url,c.original_request_ids.join(" | "),
 false,false,false,false,false,false,false]);
 return [header.map(quote).join(","),...lines.map(r=>r.map(quote).join(","))].join("\r\n")+"\r\n";
}
function exportCsv(){
 const s=csv();if(!s)return;
 const u=URL.createObjectURL(new Blob(["\uFEFF"+s],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=u;a.download="PMSV-B67-SIX-ANALYTE-MATRIX-HELD.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),900);
}
const prior=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await prior();data=null;
 try{const r=await fetch(source+"?v=20261017-b67",{cache:"reload"});if(!r.ok)throw Error("B67 source missing");
 data=await r.json();if(!valid())throw Error("B67 ancestry / evidence invalid");refresh();}catch(_){data=null;}
};
document.addEventListener("change",e=>{
 if(e.target?.matches("[data-pmsv-b67-family]")&&(e.target.value==="ALL"||Object.hasOwn(groups,e.target.value))){
 family=e.target.value;refresh();}
});
document.addEventListener("input",e=>{
 if(e.target?.matches("[data-pmsv-b67-search]")){search=String(e.target.value||"").slice(0,130);refresh();}
});
document.addEventListener("click",e=>{if(e.target?.closest("[data-pmsv-b67-export]")&&valid())exportCsv();});
window.pmsvB67SixMatrixEvidence={valid,filtered,csv,getCounts:()=>({
 reviewed:data?.cases?.length||0,p0:1,p1:5,originalRequestIds:30,unapproved:6,all35Held:true
})};
})();