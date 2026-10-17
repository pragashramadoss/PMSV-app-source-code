(function(){
"use strict";
/* B66: five open P1 additives, enzymes and nutraceutical ingredients.
   Research-only, with no request sending, no automatic legal limit, no PASS. */
let data=null,family="ALL",search="";
const file="./data/rules/fssai-current35-nutra-ingredient-scope-batch66-2026-10-17.json";
const pinned="00a67ba10f24fee2";
const groups={LEAD_INDIVIDUAL_CHEMICAL:"Additives: specific substance and purity",
 LEGACY_SCHEDULE_IDENTITY:"Nutraceutical additives: old vs 2022 schedules",
 ENZYME_USE_AND_CARRIER:"Enzyme: activity, source and preparation",
 AFLATOXIN_RAW_INGREDIENT:"Aflatoxins: source crop ingredient",
 AFLATOXIN_PREMIX:"Aflatoxins: actual mixed ingredient BOM"};
function valid(){
 if(!window.pmsvB65FourFoodMatrices?.valid()||
  !window.pmsvB59CTRSourceCrosswalk?.valid()||
  !window.pmsvB60LegalScope?.valid()||
  typeof window.pmsvB59CTRSourceCrosswalk.getAllCases!=="function"||
  typeof pmsvB14Digest!=="function"||!data||pmsvB14Digest(data)!==pinned)return false;
 const t=data.totals,flags=data.control_flags,originals=window.pmsvB59CTRSourceCrosswalk.getAllCases();
 if(data.kind!=="PMSV_BATCH66_FIVE_NUTRA_ADDITIVE_ENZYME_AFLATOXIN_SUBSTANCE_GATE"||
  data.as_of!=="2026-10-17"||data.surface!=="GITHUB_PAGES_PREVIEW_ONLY"||
  data.ancestor_b59_digest!=="6791743a07c12e4f"||
  data.ancestor_b60_digest!=="9cbb73557870ed10"||
  data.ancestor_b65_digest!=="aea2fe212e9c998e"||
  t.catalogue!==533||t.conditional_first_source_matched!==498||
  t.original_held_cases!==35||t.p0!==13||t.p1!==22||
  t.batch66_P1_cases!==5||t.batch66_lead_cases!==3||t.batch66_aflatoxin_cases!==2||
  t.prior_batch65_P0_cases!==4||t.other_held_cases_untouched!==30||
  t.total_immutable_175_requests!==175||t.immovable_case_requests_in_scope!==25||
  t.signed_named_ingredient_identities!==0||t.signed_original_case_gazettes!==0||
  t.final_nutra_2022_draft_gazette_proven!==0||
  t.operational_2022_interim_direction_examined!==1||
  t.case_specific_numeric_ctr_limits_approved!==0||
  t.case_accredited_lab_analyte_scope_approvals!==0||
  t.original_lot_coas_received!==0||t.lot_passes!==0||t.wordpress_changed!==false||
  flags?.all_35_open!==true||flags?.allow_cross_class_inheritance!==false||
  flags?.allow_use_of_2022_draft_as_final_gazette!==false||
  flags?.allow_2016_2022_schedule_auto_map!==false||
  flags?.allow_total_and_B1_merge!==false||
  flags?.allow_containing_food_numbers_as_approved_limits!==false||
  flags?.allow_lab_pass!==false||flags?.allow_product_release!==false||
  flags?.owner_requests_sent!==0||flags?.working_preview_only!==true||
  data.cases?.length!==5||data.source_register?.length!==7||
  originals?.length!==35||
  data.regulatory_comparison_data_not_case_limits?.automatically_applied!==false||
  data.regulatory_comparison_data_not_case_limits?.named_crop_containing_product_compendium_ug_per_kg!==20||
  data.regulatory_comparison_data_not_case_limits?.named_crop_containing_product_B1_compendium_ug_per_kg!==10)return false;
 const prev=new Map(originals.map(c=>[c.rank,c])),ranks=new Set(),requests=new Set();
 const sources=new Map(data.source_register.map(s=>[s.id,s]));
 if(sources.size!==7||
   sources.get("FSSAI_NUTRA_DRAFT_2022")?.type!=="OFFICIAL_2022_DRAFT_GAZETTE_NOT_FINAL_NOTIFICATION"||
   sources.get("FSSAI_NUTRA_OPERATIONAL_DIRECTION_2022")?.type!=="OFFICIAL_FSSAI_SIGNED_OPERATIONAL_DIRECTION")return false;
 for(const c of data.cases){
  const p=prev.get(c.rank);
  if(!p||ranks.has(c.rank)||c.priority!=="P1"||
     c.catalogue_id!==p.catalogue_id||c.product_name!==p.product_name||
     c.analyte!==p.analyte||c.original_ctr_gate_id!==p.original_legal_gate||
     JSON.stringify(c.original_five_gate_ids)!==JSON.stringify(p.original_request_ids)||
     !Object.hasOwn(groups,c.legal_research_family)||c.source_ids?.length<2||
     !c.source_ids.every(x=>sources.has(x))||!c.official_text_findings_not_case_approval||
     !c.forbidden_automatic_transfer||!c.next_original_documents||
     c.actual_named_chemical_or_ingredient_proven!==false||
     c.original_current_gazette_commodity_application_authenticated!==false||
     c.legal_case_numeric_contaminant_limit_approved!==false||
     c.nabl_method_analyte_matrix_scope_verified!==false||
     c.actual_lot_coa_received!==false||c.lot_pass!==false||c.case_released!==false)return false;
  ranks.add(c.rank);
  for(const id of c.original_five_gate_ids){if(requests.has(id))return false;requests.add(id);}
 }
 return ranks.size===5&&requests.size===25&&[25,26,27,28,29].every(x=>ranks.has(x))&&
  data.cases.filter(c=>c.analyte==="Lead").length===3&&
  data.cases.filter(c=>c.analyte==="Aflatoxins").length===2;
}
const safe=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function filtered(){
 if(!valid())return[];
 const q=search.trim().toLowerCase();
 return data.cases.filter(c=>(family==="ALL"||c.legal_research_family===family)&&
  (!q||[c.rank,c.product_name,c.analyte,c.official_text_findings_not_case_approval,
   c.forbidden_automatic_transfer,c.next_original_documents].some(x=>String(x).toLowerCase().includes(q))));
}
function row(c){
 return '<tr><td><b>P1 #'+safe(c.rank)+'</b></td>'+
  '<td><b>'+safe(c.product_name)+'</b><small>'+safe(c.analyte)+' · '+safe(c.original_ctr_gate_id)+'</small></td>'+
  '<td>'+safe(c.official_text_findings_not_case_approval)+'<small>'+c.source_ids.map(id=>{
    const s=data.source_register.find(x=>x.id===id);
    return '<a href="'+safe(s.url)+'" rel="noopener noreferrer" target="_blank">'+safe(id.replaceAll("_"," "))+'</a>';
   }).join(" · ")+'</small></td>'+
  '<td><b>Transfer blocked:</b> '+safe(c.forbidden_automatic_transfer)+
   '<small><b>Required original proof:</b> '+safe(c.next_original_documents)+'</small></td>'+
  '<td><b>HELD</b><small>0 CTR signoffs<br>0 accredited matrix and lot PASS</small></td></tr>';
}
function panel(){
 return '<details id="pmsv-b66-nutra-source-audit" class="card" style="margin-bottom:12px">'+
  '<summary><b>Batch66 · Five P1 additive/enzyme/nutraceutical source audits</b> — 0 cases approved</summary>'+
  '<div class="notice"><b>2016 schedule category ≠ 2022 draft or operative approval.</b> FSSAI’s signed October 2022 direction re-operationalized interim nutraceutical provisions from 1 October 2022. The June 2022 Gazette is expressly a DRAFT. Exact later regulations, named ingredient and intended use must be checked.</div>'+
  '<p><b>CTR published comparator only:</b> For a product containing the specified named food articles, the February 2026 CTR compendium lists <b>Total Aflatoxins 20 µg/kg</b> and <b>Aflatoxin B1 10 µg/kg</b>. These are <b>not approved limits for these five unidentified products</b>. Do not confuse total aflatoxins, B1, or M1; assess original notified law and actual crop ingredients separately.</p>'+
  '<p><b>Lead/additive class safeguards:</b> Appendix A food categories address additive use, not one contaminant limit for all chemicals. Named additives need INS/CAS, intended function, grade and monograph. Enzyme preparations need EC number, organism/source, carrier and ingredient-versus-processing-aid identity. An FSSAI FPIVS ingredient statement is explicitly not a licence or legal compliance ruling.</p>'+
  '<div class="checker-grid"><div class="field"><label>Regulatory distinction</label><select data-pmsv-b66-family>'+
   '<option value="ALL">All five open dossiers</option>'+
   Object.entries(groups).map(([k,v])=>'<option value="'+safe(k)+'">'+safe(v)+'</option>').join("")+'</select></div>'+
   '<div class="field"><label>Search products and legal findings</label><input maxlength="130" data-pmsv-b66-search placeholder="e.g. premix, enzyme, lead"/></div></div>'+
  '<p><b data-pmsv-b66-count>5 unapproved original-source reviews</b> · 25 unchanged case evidence gates.</p>'+
  '<div style="max-height:600px;overflow:auto"><table><thead><tr><th>Held case</th><th>Catalogue product</th><th>What official sources establish</th><th>Forbidden transfer and needed original proof</th><th>Status</th></tr></thead>'+
   '<tbody data-pmsv-b66-rows></tbody></table></div>'+
  '<p><button type="button" data-pmsv-b66-export>Export evidence-only CSV (all unapproved)</button></p>'+
  '<p class="countline">All 35 original CTR cases remain OPEN and all 175 original evidence request IDs remain intact; no source emails sent, original product BOMs received, signed legal numeric maxima, accredited lab scopes or lots approved.</p></details>';
}
function refresh(){
 if(!valid())return;
 const anchor=document.getElementById("pmsv-b65-four-matrix-classifications");
 if(!anchor)return;
 let root=document.getElementById("pmsv-b66-nutra-source-audit");
 if(!root){anchor.insertAdjacentHTML("afterend",panel());root=document.getElementById("pmsv-b66-nutra-source-audit");}
 root.querySelector("[data-pmsv-b66-rows]").innerHTML=filtered().map(row).join("");
 root.querySelector("[data-pmsv-b66-count]").textContent=filtered().length+" P1 source dossier(s), 0 CTR approvals";
}
function csv(){
 if(!valid())return"";
 const cols=["rank","priority","product","analyte","family","official_source_findings_not_case_approval",
 "forbidden_transfer","missing_case_identity_and_evidence","official_source_links",
 "exact_named_identity_received","operative_original_case_article_signed","case_numeric_ctr_limit_approved",
 "accredited_analyte_matrix_method","representative_lot_coa_pass"];
 const quote=v=>{let x=String(v??"");if(/^\s*[=+\-@]/.test(x))x="'"+x;return '"'+x.replaceAll('"','""')+'"';};
 const records=filtered().map(c=>[c.rank,c.priority,c.product_name,c.analyte,c.legal_research_family,
   c.official_text_findings_not_case_approval,c.forbidden_automatic_transfer,c.next_original_documents,
   c.source_ids.map(id=>data.source_register.find(s=>s.id===id).url).join(" ; "),
   false,false,false,false,false]);
 return [cols.map(quote).join(","),...records.map(r=>r.map(quote).join(","))].join("\r\n")+"\r\n";
}
function exportCsv(){
 const blob=new Blob(["\uFEFF"+csv()],{type:"text/csv;charset=utf-8"}),u=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=u;a.download="PMSV-B66-NUTRA-ADDITIVE-ENZYME-AFLATOXIN-HELD.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),900);
}
const prev=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await prev();data=null;
 try{const res=await fetch(file+"?v=20261017-b66",{cache:"reload"});
  if(!res.ok)throw Error("Batch66 source not found");
  data=await res.json();if(!valid())throw Error("Batch66 source ancestry/holds invalid");refresh();
 }catch(_){data=null;}
};
document.addEventListener("change",e=>{
 if(e.target?.matches("[data-pmsv-b66-family]")&&
 (e.target.value==="ALL"||Object.hasOwn(groups,e.target.value))){family=e.target.value;refresh();}
});
document.addEventListener("input",e=>{
 if(e.target?.matches("[data-pmsv-b66-search]")){search=String(e.target.value||"").slice(0,130);refresh();}
});
document.addEventListener("click",e=>{if(e.target?.closest("[data-pmsv-b66-export]")&&valid())exportCsv();});
window.pmsvB66NutraIngredientAudit={valid,filtered,csv,getCounts:()=>({
 cases:data?.cases?.length||0,lead:data?.cases?.filter(x=>x.analyte==="Lead").length||0,
 aflatoxin:data?.cases?.filter(x=>x.analyte==="Aflatoxins").length||0,
 originalRequestIds:25,numberOfCaseApprovals:0,lotPasses:0,all35Held:true})};
})();