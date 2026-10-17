(function(){
"use strict";
/* B62: source-specific identity caveats and operative 2024 Pickled Eggs
   supersession. No CTR limits, no allergen-free guarantee, no lot PASS. */
let data=null,search="",family="ALL";
const url="./data/rules/fssai-current35-identity-supersession-batch62-2026-10-17.json";
const pin="18f3e412e1b2c293";
const groups={
 DIRECT_ORIGINAL_2024_SUPERSESSION:"Current 2024 amendment replaces old standard",
 CURRENT_PRODUCT_STANDARD_INGREDIENT_CAUTION:"Ingredient / possible milk derivative",
 CURRENT_PRODUCT_STANDARD_BOTANICAL_ANCHOR:"Botanical identity vs metal article",
 ORIGINAL_GAZETTE_NATURAL_VS_ARTIFICIAL_SCOPE:"Natural vs artificial casing scope",
 ORIGINAL_GAZETTE_EGG_MATRIX_SCOPE:"Processed dry egg vs residue basis"
};
function valid(){
 if(!window.pmsvB61OriginalGazette?.valid()||typeof pmsvB14Digest!=="function"||
  !data||pmsvB14Digest(data)!==pin)return false;
 let t=data.totals;
 if(data.kind!=="PMSV_BATCH62_SUPERSESSION_AND_REAL_FOOD_IDENTITY_PROVENANCE"||
  data.as_of!=="2026-10-17"||data.environment!=="GITHUB_PAGES_PREVIEW_ONLY"||
  data.parent_b61_digest!=="6150a34a1cdf8019"||
  data.parent_b59_digest!=="6791743a07c12e4f"||
  data.parent_b60_digest!=="9cbb73557870ed10"||
  t.catalogue!==533||t.conditionally_matched!==498||t.held_ctr_cases!==35||
  t.source_specific_identity_review_cases!==6||t.identity_only_not_ctr_limit!==6||
  t.one_material_supersession_prevents_stale_standard!==1||
  t.material_possible_milk_derived_ingredient_cautions!==1||
  t.botanical_species_identity_anchors!==2||t.original_unchanged_request_ids_all!==175||
  t.six_case_original_request_ids!==30||t.original_case_specific_gazettes_for_ctr_limit!==0||
  t.approved_ctr_numeric_case_limits!==0||t.manufacturer_actual_boms_received!==0||
  t.lab_scope_approvals!==0||t.lot_releases!==0||t.wordpress_changed!==false||
  data.original_supersession?.commencement!=="2025-05-01"||
  data.original_supersession?.affected_case_rank!==17||
  data.original_supersession?.no_ctr_pesticide_mrl_provided!==true||
  data.fail_closed?.all_35_ctr_cases_remain_held!==true||
  data.fail_closed?.unverified_allergen_free_claim_must_not_be_made!==true||
  data.fail_closed?.no_pass_or_auto_release!==true||data.cases?.length!==6)return false;
 const prior=window.pmsvB61OriginalGazette.filtered();
 /* B61 may be filtered by user; only fail open if not all shown. The immutable
    6-case IDs must also be included in the verified B59 full 35-case source. */
 const parent=window.pmsvB59CTRSourceCrosswalk?.getAllCases?.();
 if(!Array.isArray(parent)||parent.length!==35)return false;
 const map=new Map(parent.map(c=>[c.rank,c])),got=new Set(),req=new Set();
 for(const c of data.cases){
  const o=map.get(c.rank);
  if(!o||got.has(c.rank)||c.original_gate!==o.original_legal_gate||
   c.product!==o.product_name||c.priority!==o.priority||
   JSON.stringify(c.immutable_five_request_ids)!==JSON.stringify(o.original_request_ids)||
   !Object.hasOwn(groups,c.type)||!c.source||!c.missing||
   c.source_read_is_product_identity_only!==true||
   c.signed_ctr_limit_received!==false||c.manufacturer_bom_received!==false||
   c.accredited_lab_scope_verified!==false||c.lot_pass!==false)return false;
  got.add(c.rank);
  for(const id of c.immutable_five_request_ids){if(req.has(id))return false;req.add(id);}
 }
 return got.size===6&&req.size===30&&
  [7,11,14,15,16,17].every(id=>got.has(id))&&
  data.cases.find(c=>c.rank===17)?.date==="2025-05-01"&&
  data.cases.find(c=>c.rank===7)?.current_substance.includes("sodium caseinate");
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function records(){
 if(!valid())return[];
 const q=search.toLowerCase().trim();
 return data.cases.filter(c=>(family==="ALL"||c.type===family)&&
  (!q||[c.rank,c.product,c.type,c.topic,c.current_substance,c.unsafe_prior_inference,c.missing]
     .some(v=>String(v??"").toLowerCase().includes(q))));
}
function options(){
 return [["ALL","All 6 critical identity checks"],...Object.entries(groups)].map(([v,label])=>
  '<option value="'+esc(v)+'"'+(v===family?" selected":"")+'>'+esc(label)+'</option>').join("");
}
function row(c){
 return '<tr><td><b>'+esc(c.priority)+' #'+esc(c.rank)+'</b></td>'+
 '<td><b>'+esc(c.topic)+'</b><small>'+esc(c.product)+'</small></td>'+
 '<td>'+esc(c.current_substance)+'<small>FPSFA source '+esc(c.current_section)+
 ' · <a href="'+esc(c.source)+'" target="_blank" rel="noopener noreferrer">Official FSSAI publication</a></small></td>'+
 '<td><b>Do not assume:</b> '+esc(c.unsafe_prior_inference)+
 '<small>Required next: '+esc(c.missing)+'</small></td>'+
 '<td><b>HELD</b><small>NO signed CTR maximum / no actual BOM or lab pass</small></td></tr>';
}
function panel(){
 return '<details class="card" id="pmsv-b62-supersession-review" style="margin-bottom:12px">'+
 '<summary><b>Batch62 · Current food-standard identity & supersession</b> — 6 specific safeguards / 35 CTR holds</summary>'+
 '<div class="notice"><b>2020 Pickled Eggs standard replaced on 1 May 2025.</b> Check original 21 October 2024 FPSFA First Amendment before using any old pH, formulation or process clause. This does not establish a pesticide MRL.</div>'+
 '<p><b>Coconut milk powder:</b> the official FSSAI 2025 chapter permits sodium caseinate in this product. The phrase “non-dairy” alone cannot establish a milk-protein-free formulation. Always obtain the exact signed manufacturer BOM and separate allergen/legal review.</p>'+
 '<p>Additional source distinctions: chia botanical species (<i>Salvia hispanica</i>), water chestnut flour from <i>Trapa</i> nuts, natural animal casings from specific organs, and processed egg powder needing a distinct residue-basis decision. None of these facts automatically supplies the CTR lead or pesticide limit.</p>'+
 '<div class="checker-grid"><div class="field"><label>Specific audit family</label><select data-pmsv-b62-family>'+options()+'</select></div>'+
 '<div class="field"><label>Search product or legal question</label><input maxlength="140" data-pmsv-b62-search placeholder="e.g. caseinate, Trapa, eggs"/></div></div>'+
 '<p><b data-pmsv-b62-count>6 critical source cautions</b> · 0 case approvals / 0 validated lots</p>'+
 '<div style="max-height:560px;overflow:auto"><table><thead><tr><th>Case</th><th>Topic</th><th>Current identity text</th><th>What remains prohibited or unverified</th><th>Release</th></tr></thead>'+
 '<tbody data-pmsv-b62-rows></tbody></table></div>'+
 '<p><button type="button" data-pmsv-b62-export>Export source-only cautions CSV</button></p>'+
 '<p class="countline">29 other cases remain unchanged from Batch61; original 35 product holds / 175 evidence gates remain unchanged. No emails sent; no product status or WordPress modifications.</p></details>';
}
function refresh(){
 if(!valid())return;const anchor=document.getElementById("pmsv-b61-original-gazette-audit");
 if(!anchor)return;
 let box=document.getElementById("pmsv-b62-supersession-review");
 if(!box){anchor.insertAdjacentHTML("afterend",panel());box=document.getElementById("pmsv-b62-supersession-review");}
 box.querySelector("[data-pmsv-b62-rows]").innerHTML=records().map(row).join("");
 box.querySelector("[data-pmsv-b62-count]").textContent=records().length+" current-law identity caveat(s), 0 CTR approvals";
}
function csv(){
 if(!valid())return "";
 const hdr=["rank","priority","food_product","identity_type","official_current_source","source_section",
 "current_product_identity_finding","incorrect_legal_inference_to_prevent","original_manufacturer_evidence_needed",
 "signed_CTR_case_limit","actual_supplier_BOM","lab_accreditation_scope","representative_lot_PASS"];
 const quote=x=>{let v=String(x??"");if(/^\s*[=+\-@]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';};
 const lines=records().map(c=>[c.rank,c.priority,c.product,c.type,c.source,c.current_section,
   c.current_substance,c.unsafe_prior_inference,c.missing,false,false,false,false]);
 return [hdr.map(quote).join(","),...lines.map(l=>l.map(quote).join(","))].join("\r\n")+"\r\n";
}
function download(){
 const url=URL.createObjectURL(new Blob(["\uFEFF"+csv()],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="PMSV-B62-LEGAL-SUPERSESSION-AND-IDENTITY-CAUTIONS.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),800);
}
const previous=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await previous();data=null;
 try{
  const r=await fetch(url+"?v=20261017-b62",{cache:"reload"});
  if(!r.ok)throw Error("Batch62 source unavailable");
  data=await r.json();if(!valid())throw Error("B62 original lineage or source integrity mismatch");
  refresh();
 }catch(_){data=null;}
};
document.addEventListener("change",ev=>{
 if(ev.target?.matches("[data-pmsv-b62-family]")&&
  (ev.target.value==="ALL"||Object.hasOwn(groups,ev.target.value))){
   family=ev.target.value;refresh();
 }
});
document.addEventListener("input",ev=>{
 if(ev.target?.matches("[data-pmsv-b62-search]")){search=String(ev.target.value||"").slice(0,140);refresh();}
});
document.addEventListener("click",ev=>{if(ev.target?.closest("[data-pmsv-b62-export]")&&valid())download();});
window.pmsvB62IdentitySupersession={
 valid,records,csv,getCounts:()=>({cases:data?.cases?.length||0,
    supersessions:data?.cases?.filter(c=>c.type==="DIRECT_ORIGINAL_2024_SUPERSESSION").length||0,
    potentialMilkProteinCautions:data?.cases?.filter(c=>c.rank===7).length||0,
    originalCTRApproved:0,lotReleased:0,all35Held:true})
};
})();