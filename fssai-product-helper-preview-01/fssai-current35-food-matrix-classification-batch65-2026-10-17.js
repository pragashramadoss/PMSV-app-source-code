(function(){
"use strict";
/* B65: four P0 product-identity distinctions. Do not infer legal CTR
   limits, laboratory accreditations, true BOMs, case releases or food PASS. */
let data=null,type="ALL",search="";
const source="./data/rules/fssai-current35-food-matrix-classification-batch65-2026-10-17.json";
const pin="aea2fe212e9c998e";
const groups={TAMARIND_WHOLE_SEEDLESS_NOT_PROCESSED_PULP:"Whole seedless fruit vs processed tamarind pulp",
 COLOSTRUM_DISTINCT_FROM_NORMAL_MILK:"Colostrum vs ordinary milk",
 NARIKELA_2025_CLASSICAL_COW_MILK_COCONUT_COMPOSITE:"Ayurveda Recipe 14.3 — coconut + cow milk",
 KSHEERAPAKA_2025_BUFFALO_MILK_FLOWER_INFUSION_SUGAR:"Ayurveda Recipe 14.7 — buffalo milk + flowers"};
function valid(){
 if(!window.pmsvB59CTRSourceCrosswalk?.valid()||
  typeof window.pmsvB59CTRSourceCrosswalk.getAllCases!=="function"||
  typeof pmsvB14Digest!=="function"||!data||pmsvB14Digest(data)!==pin)return false;
 const t=data.totals;
 if(data.kind!=="PMSV_BATCH65_FOUR_P0_EXACT_FOOD_ARTICLE_COMPOSITE_NONTRANSFER"||
  data.as_of!=="2026-10-17"||data.environment!=="GITHUB_PAGES_FSSAI_PREVIEW_ONLY"||
  data.ancestor_b59_digest!=="6791743a07c12e4f"||
  data.ancestor_b64_digest!=="49f3f66b4e31f0e0"||
  t.catalogue!==533||t.conditional_first_source_matched!==498||
  t.original_open_ctr_cases!==35||t.p0_open!==13||t.p1_open!==22||
  t.researched_p0_cases!==4||t.other_held_cases_unmodified!==31||
  t.original_requests_all!==175||t.original_requests_in_this_batch!==20||
  t.exact_fssai_identity_clauses_or_order_entries!==4||
  t.distinct_colostrum_from_plain_milk!==1||
  t.ayurveda_composite_recipe_distinctions!==2||
  t.earlier_vs_newer_ayurveda_recipe_presentation_difference!==1||
  t.validated_case_ctr_numeric_limits!==0||t.confirmed_commercial_products!==0||
  t.actual_coas!==0||t.approved_lab_scopes!==0||t.lot_passes!==0||
  t.wordpress_modified!==false||data.cases?.length!==4||
  data.holds?.all_35_retained!==true||
  data.holds?.no_copper_fruit_pulp_limit_transferred_to_seedless_tamarind!==true||
  data.holds?.no_regular_milk_lead_limit_transferred_to_colostrum!==true||
  data.holds?.no_plain_milk_lead_limit_transferred_to_ayurveda_recipes!==true||
  data.holds?.no_recipe_order_interpreted_as_ctr_compliance!==true||
  data.holds?.no_actual_lots_approved!==true||
  data.published_version_conflict?.treated_as_legal_approval!==false)return false;
 const originals=window.pmsvB59CTRSourceCrosswalk.getAllCases();
 if(originals?.length!==35)return false;
 const p=new Map(originals.map(c=>[c.rank,c])),codes=new Set(),ranks=new Set();
 for(const c of data.cases){
  const o=p.get(c.rank);
  if(!o||ranks.has(c.rank)||c.priority!=="P0"||
    c.catalogue_id!==o.catalogue_id||c.product_name!==o.product_name||
    c.original_legal_gate!==o.original_legal_gate||c.analyte!==o.analyte||
    JSON.stringify(c.original_five_request_ids)!==JSON.stringify(o.original_request_ids)||
    !Object.hasOwn(groups,c.code)||!c.confirmed_identity||!c.scope_exclusion||
    !c.source||!c.specific_next_proof||
    c.numeric_quality_not_contaminant_limits!==true||
    c.operative_case_ctr_gazette_authenticated!==false||
    c.actual_manufacturer_product_confirmed!==false||
    c.signed_analyte_commodity_numeric_maximum!==false||
    c.lab_scope_and_method_approved!==false||
    c.representative_lot_coa_pass!==false||c.commercial_product_released!==false)return false;
  ranks.add(c.rank);
  for(const id of c.original_five_request_ids){if(codes.has(id))return false;codes.add(id);}
 }
 return ranks.size===4&&codes.size===20&&[6,30,33,34].every(x=>ranks.has(x))&&
   data.cases.find(c=>c.rank===30)?.confirmed_identity.includes("free from colostrum")&&
   data.cases.find(c=>c.rank===33)?.confirmed_identity.includes("cow milk")&&
   data.cases.find(c=>c.rank===34)?.confirmed_identity.includes("buffalo milk");
}
function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function filtered(){
 if(!valid())return[];
 const q=search.trim().toLowerCase();
 return data.cases.filter(c=>(type==="ALL"||type===c.code)&&
   (!q||[c.rank,c.product_name,c.confirmed_identity,c.scope_exclusion,c.specific_next_proof]
    .some(v=>String(v).toLowerCase().includes(q))));
}
function tr(c){
 return '<tr><td><b>P0 #'+esc(c.rank)+'</b></td>'+
 '<td><b>'+esc(c.product_name)+'</b><small>'+esc(c.analyte)+' / '+esc(c.product_clause)+'</small></td>'+
 '<td>'+esc(c.confirmed_identity)+
 '<small><a target="_blank" rel="noopener noreferrer" href="'+esc(c.source)+'">Official FSSAI source</a> · '+esc(c.source_type.replaceAll("_"," "))+'</small></td>'+
 '<td><b>Wrong article blocked:</b> '+esc(c.scope_exclusion)+
 '<small><b>Missing manufacturer and legal evidence:</b> '+esc(c.specific_next_proof)+'</small></td>'+
 '<td><b>HELD</b><small>No signed limit, lab matrix or tested lot</small></td></tr>';
}
function panel(){
 return '<details class="card" id="pmsv-b65-four-matrix-classifications" style="margin-bottom:12px">'+
 '<summary><b>Batch65 · Four exact food matrices: tamarind, colostrum, Ayurveda</b> — all 35 CTR cases held</summary>'+
 '<div class="notice"><b>Do not transfer food-metal maxima between unlike matrices.</b> Seedless Tamarind is not manufactured tamarind puree; colostrum is explicitly excluded from ordinary milk under FPSFA 2.1.1; two Ayurveda recipes are prepared multi-ingredient foods, not plain milk.</div>'+
 '<p>New source finding: 2025 FSSAI Ayurveda recipe list specifies Narikela Ksheerika as an <b>eatable cow-milk/coconut preparation</b> and Ksheerapaka as a <b>buffalo-milk, flower-water, sugar preparation</b>. A prior Ayurveda compendium shows a different presentation for Narikela; do not merge outdated recipe descriptions. The original 2022 Ayurveda Aahara regulation governs categories, not a named CTR lead limit.</p>'+
 '<p>FSSAI product-standard quality values such as Seedless Tamarind moisture ≤20% or colostrum powder composition are <b>not heavy-metal limits or laboratory PASS evidence</b>. Actual recipe, finished form, source amendment and accredited laboratory scope remain missing.</p>'+
 '<div class="checker-grid"><div class="field"><label>Food matrix</label><select data-pmsv-b65-type>'+
 '<option value="ALL">All 4 P0 cases</option>'+
 Object.entries(groups).map(([k,v])=>'<option value="'+esc(k)+'">'+esc(v)+'</option>').join("")+
 '</select></div><div class="field"><label>Search product, clause or source concern</label>'+
 '<input maxlength="130" data-pmsv-b65-search placeholder="colostrum, tamarind, cow, buffalo"/></div></div>'+
 '<p><b data-pmsv-b65-count>4 source-review cases</b> / 20 original evidence request IDs / 0 case approvals.</p>'+
 '<div style="max-height:550px;overflow:auto"><table><thead><tr><th>Priority</th><th>Food article</th><th>Source-supported product identity</th><th>Disallowed CTR inference / needed proof</th><th>Outcome</th></tr></thead>'+
 '<tbody data-pmsv-b65-rows></tbody></table></div>'+
 '<p><button type="button" data-pmsv-b65-export>Export four unapproved legal-route records</button></p>'+
 '<p class="countline">All 175 historical source evidence requests unchanged; 31 other cases not modified. No legal/lot approvals, no commercial recipe verification, no emails sent or WordPress production changes.</p></details>';
}
function refresh(){
 if(!valid()||typeof document==="undefined")return;
 const anchor=document.getElementById("pmsv-b64-three-originals")||
  document.getElementById("pmsv-b63-cocoa-sugar-specifics")||
  document.getElementById("pmsv-b59-ctr-nontransfer");
 if(!anchor)return;
 let el=document.getElementById("pmsv-b65-four-matrix-classifications");
 if(!el){anchor.insertAdjacentHTML("afterend",panel());el=document.getElementById("pmsv-b65-four-matrix-classifications");}
 el.querySelector("[data-pmsv-b65-rows]").innerHTML=filtered().map(tr).join("");
 el.querySelector("[data-pmsv-b65-count]").textContent=filtered().length+" P0 food matrix(s) held · 0 case limits approved";
}
function csv(){
 if(!valid())return"";
 const cols=["rank","priority","marketed_product","analyte","identity_clause","source",
  "source_supported_identity","related_article_limit_not_transferred","needed_original_proof",
  "current_ctr_case_limit_signed","manufacturer_identity_authenticated",
  "lab_method_scope_approved","representative_lot_PASS"];
 const quote=x=>{let s=String(x??"");if(/^\s*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const lines=filtered().map(c=>[c.rank,c.priority,c.product_name,c.analyte,c.product_clause,c.source,
  c.confirmed_identity,c.scope_exclusion,c.specific_next_proof,false,false,false,false]);
 return [cols.map(quote).join(","),...lines.map(l=>l.map(quote).join(","))].join("\r\n")+"\r\n";
}
function download(){
 const u=URL.createObjectURL(new Blob(["\uFEFF"+csv()],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=u;a.download="PMSV-B65-FOUR-P0-FOOD-MATRICES-UNVERIFIED.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
}
const previous=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await previous();data=null;
 try{const r=await fetch(source+"?v=20261017-b65",{cache:"reload"});
  if(!r.ok)throw Error("B65 source unavailable");
  data=await r.json();if(!valid())throw Error("B65 heritage invalid");refresh();
 }catch(_){data=null;}
};
document.addEventListener("change",e=>{
 if(e.target?.matches("[data-pmsv-b65-type]")&&
  (e.target.value==="ALL"||Object.hasOwn(groups,e.target.value))){type=e.target.value;refresh();}
});
document.addEventListener("input",e=>{
 if(e.target?.matches("[data-pmsv-b65-search]")){search=String(e.target.value||"").slice(0,130);refresh();}
});
document.addEventListener("click",e=>{
 if(e.target?.closest("[data-pmsv-b65-export]")&&valid())download();
});
window.pmsvB65FourFoodMatrices={valid,filtered,csv,getCounts:()=>({
 cases:data?.cases?.length||0,colostrum:data?.cases?.filter(c=>c.rank===30).length||0,
 tamarind:data?.cases?.filter(c=>c.rank===6).length||0,
 ayurveda:data?.cases?.filter(c=>c.rank>=33).length||0,
 originalRequests:20,approvedLegalMaxima:0,testedLotPasses:0,all35Held:true
})};
})();