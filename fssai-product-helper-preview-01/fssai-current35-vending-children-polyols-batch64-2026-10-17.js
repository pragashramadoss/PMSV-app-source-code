(function(){
"use strict";
/* B64: three high-priority article classifications. Draft vs operative law
   source-authenticated on only documented pages. No PASS / no release. */
let data=null,focus="ALL",query="";
const path="./data/rules/fssai-current35-vending-children-polyols-batch64-2026-10-17.json";
const digest="49f3f66b4e31f0e0";
function valid(){
 if(!window.pmsvB63CocoaMisri?.valid()||!window.pmsvB59CTRSourceCrosswalk?.valid()||
  typeof pmsvB14Digest!=="function"||!data||pmsvB14Digest(data)!==digest)return false;
 const t=data.totals,prior=window.pmsvB59CTRSourceCrosswalk.getAllCases();
 if(data.kind!=="PMSV_BATCH64_THREE_P0_ACTUAL_ORIGINAL_LAW_AND_DRAFT_SEPARATION"||
  data.as_of!=="2026-10-17"||data.surface!=="GITHUB_PAGES_PREVIEW_ONLY"||
  data.predecessor_b59_digest!=="6791743a07c12e4f"||
  data.predecessor_b63_digest!=="140fc87db12ae89a"||
  t.catalogue!==533||t.conditionally_matched!==498||
  t.open_ctr_cases!==35||t.p0_total!==13||t.p1_total!==22||
  t.reviewed_p0_cases!==3||t.other_cases_unchanged!==32||
  t.unchanged_original_evidence_requests!==175||t.reviewed_original_request_ids!==15||
  t.original_2019_vending_water_class_clause_verified!==1||
  t.age_specific_children_standard_narrowed!==1||
  t.generic_polyol_class_versus_sorbitol_distinguished!==1||
  t.draft_water_lead_limits_activated!==0||
  t.packaged_water_lead_limits_transferred!==0||
  t.infant_food_lead_limits_transferred!==0||
  t.sorbitol_nickel_class_limits_transferred!==0||
  t.commercial_products_identified!==0||t.signed_case_ctr_legal_limits!==0||
  t.accredited_lab_scopes!==0||t.actual_lot_passes!==0||t.wordpress_modified!==false||
  data.controls?.final_2025_water_notice_authenticated!==false||
  data.controls?.preserve_all_35_holds!==true||
  data.controls?.no_draft_value_promoted!==true||
  data.controls?.no_related_article_comparator_promoted!==true||
  data.controls?.no_product_released!==true||
  data.cases?.length!==3||prior.length!==35)return false;
 const p=new Map(prior.map(c=>[c.rank,c])),gates=new Set(),ranks=new Set();
 for(const c of data.cases){
  const x=p.get(c.rank);
  if(!x||ranks.has(c.rank)||c.priority!=="P0"||
   c.catalogue_id!==x.catalogue_id||c.product_name!==x.product_name||
   c.original_legal_gate!==x.original_legal_gate||c.analyte!==x.analyte||
   JSON.stringify(c.original_five_gate_ids)!==JSON.stringify(x.original_request_ids)||
   !c.original_source||!c.original_source_status||!c.original_law_fact||
   !c.next_original_evidence||!c.prohibited_transfer||
   c.actual_manufacturer_article_authenticated!==false||
   c.signed_applicable_ctr_limit!==false||c.method_lab_scope_authenticated!==false||
   c.representative_lot_pass!==false||c.product_released!==false)return false;
  ranks.add(c.rank);for(const id of c.original_five_gate_ids){if(gates.has(id))return false;gates.add(id);}
 }
 const w=data.cases.find(c=>c.rank===1),k=data.cases.find(c=>c.rank===3),s=data.cases.find(c=>c.rank===21);
 return ranks.size===3&&gates.size===15&&[1,3,21].every(n=>ranks.has(n))&&
  w?.conflict_status==="2025_PROPOSAL_DRAFT_UNVERIFIED_AS_FINAL"&&
  w?.original_source_status==="ORIGINAL_2019_ENACTED_GAZETTE_PAGE_4_VISUALLY_VERIFIED"&&
  k?.source_specific_age_or_substance==="Above 24 months through 36 months"&&
  s?.source_specific_age_or_substance.includes("Sorbitol only");
}
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function selected(){
 if(!valid())return[];const q=query.trim().toLowerCase();
 return data.cases.filter(c=>(focus==="ALL"||String(c.rank)===focus)&&
  (!q||[c.rank,c.product_name,c.analyte,c.subject,c.original_law_fact,
    c.prohibited_transfer,c.next_original_evidence].some(x=>String(x||"").toLowerCase().includes(q))));
}
function rows(){
 return selected().map(c=>'<tr><td><b>P0 #'+esc(c.rank)+'</b></td><td><b>'+esc(c.product_name)+
 '</b><small>'+esc(c.analyte)+' · '+esc(c.original_legal_gate)+'</small></td>'+
 '<td><b>'+esc(c.subject)+'</b><small>'+esc(c.original_source_status.replaceAll("_"," "))+
 ' · <a href="'+esc(c.original_source)+'" target="_blank" rel="noopener noreferrer">Source document</a></small>'+
 esc(c.original_law_fact)+'</td><td><b>Blocked:</b> '+esc(c.prohibited_transfer)+
 '<small>Must obtain: '+esc(c.next_original_evidence)+'</small>'+
 (c.conflicting_nonapplicable_source?'<small><a href="'+esc(c.conflicting_nonapplicable_source)+
 '" target="_blank" rel="noopener noreferrer">Inspect NON-APPLICABLE comparison / proposal</a> · '+esc(c.conflict_status)+'</small>':"")+
 '</td><td><b>HELD</b><small>No signed CTR case limit · no lot PASS</small></td></tr>').join("");
}
function panel(){
 return '<details id="pmsv-b64-three-originals" class="card" style="margin-bottom:12px">'+
 '<summary><b>Batch64 · Original-law correction: vending water, child supplements, polyols</b> — 3 P0 held cases</summary>'+
 '<div class="notice"><b>2019 FSSAI Gazette enacts 2.10.9 Drinking Water (Purified).</b> Water sold through non-captive vending machines is expressly a distinct article from packaged drinking water and natural mineral water. The original provision refers to IS:10500; do not infer the packaged-water CTR lead maximum.</div>'+
 '<p><b>Critical draft guard:</b> FSSAI’s June 2025 proposed replacement of 2.10.9 includes a lead figure, but this is a <b>draft</b>, not authenticated final law. Do not import its 0.01 mg/L lead value into an operative product decision.</p>'+
 '<p><b>Age and analyte safeguards:</b> the standard “Formulated supplements for children” is scoped to children <b>above 24 through 36 months</b>, not all infant foods. FoSCoS’s generic polyol class is not the individually named <b>Sorbitol</b> CTR nickel article (2.0 mg/kg is a Sorbitol-only source reference, not a generic class limit).</p>'+
 '<div class="checker-grid"><div class="field"><label>Article</label><select data-pmsv-b64-focus>'+
 '<option value="ALL">All three P0 cases</option><option value="1">Drinking water through vending machine</option>'+
 '<option value="3">Formulated children supplements</option><option value="21">Unspecified polyols</option></select></div>'+
 '<div class="field"><label>Search legal source conclusions</label><input data-pmsv-b64-search maxlength="140" placeholder="water, lead, Sorbitol..."/></div></div>'+
 '<p><b data-pmsv-b64-count>3 high-priority source distinctions</b> · 0 approved case limits / 0 laboratory or lot releases</p>'+
 '<div style="max-height:610px;overflow:auto"><table><thead><tr><th>Priority</th><th>Case</th><th>Documented law / official source</th><th>Transfer barred and evidence needed</th><th>Decision</th></tr></thead><tbody data-pmsv-b64-rows></tbody></table></div>'+
 '<p><button type="button" data-pmsv-b64-export>Export unapproved source findings CSV</button></p>'+
 '<p class="countline">All original 175 evidence IDs remain unchanged; these three retain their 15 original unsent requests. No actual commercial composition, signed current legal limit or lab CoA received. Entire 35-case CTR hold retained.</p></details>';
}
function refresh(){
 if(!valid())return;
 const anchor=document.getElementById("pmsv-b63-cocoa-sugar-specifics");if(!anchor)return;
 let el=document.getElementById("pmsv-b64-three-originals");
 if(!el){anchor.insertAdjacentHTML("afterend",panel());el=document.getElementById("pmsv-b64-three-originals");}
 el.querySelector("[data-pmsv-b64-rows]").innerHTML=rows();
 el.querySelector("[data-pmsv-b64-count]").textContent=selected().length+" P0 case(s) held";
}
function csv(){
 if(!valid())return"";
 const cols=["rank","priority","product","analyte","original_law_subject","original_source_status",
  "official_source_link","actual_verified_article_text","nontransfer_warning",
  "next_evidence","signed_case_CTR_limit","approved_method_lab_scope","actual_lot_pass"];
 const quote=x=>{let v=String(x??"");if(/^\s*[=+\-@]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';};
 return [cols.map(quote).join(","),...selected().map(c=>[c.rank,c.priority,c.product_name,c.analyte,
  c.subject,c.original_source_status,c.original_source,c.original_law_fact,c.prohibited_transfer,
  c.next_original_evidence,false,false,false].map(quote).join(","))].join("\r\n")+"\r\n";
}
function download(){
 const u=URL.createObjectURL(new Blob(["\uFEFF"+csv()],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=u;a.download="PMSV-B64-THREE-P0-ORIGINAL-LAW-NO-PASS.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
}
const parent=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await parent();data=null;
 try{const r=await fetch(path+"?v=20261017-b64",{cache:"reload"});
  if(!r.ok)throw Error("B64 missing");data=await r.json();if(!valid())throw Error("B64 integrity");refresh();
 }catch(_){data=null;}
};
document.addEventListener("change",e=>{
 if(e.target?.matches("[data-pmsv-b64-focus]")&&["ALL","1","3","21"].includes(e.target.value)){focus=e.target.value;refresh();}
});
document.addEventListener("input",e=>{
 if(e.target?.matches("[data-pmsv-b64-search]")){query=String(e.target.value||"").slice(0,140);refresh();}
});
document.addEventListener("click",e=>{if(e.target?.closest("[data-pmsv-b64-export]")&&valid())download();});
window.pmsvB64OriginalLawCases={valid,selected,csv,getCounts:()=>({
 cases:data?.cases?.length||0,originalFinalWater:data?.cases?.filter(c=>c.rank===1).length||0,
 ageSpecificChildren:data?.cases?.filter(c=>c.rank===3).length||0,
 genericPolyolsGuard:data?.cases?.filter(c=>c.rank===21).length||0,
 draftApplied:0,legalPasses:0,lotPasses:0,originalIDs:15,all35Open:true})};
})();