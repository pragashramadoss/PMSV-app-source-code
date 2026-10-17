(function(){
"use strict";
/* B63: four high-risk cocoa/Misri case identities. Source/quality and
 CTR metal analyte/method authority MUST remain separate; no case PASS. */
let data=null,family="ALL",query="";
const url="./data/rules/fssai-current35-cocoa-sugar-identity-batch63-2026-10-17.json";
const pin="140fc87db12ae89a";
function valid(){
 if(!window.pmsvB62IdentitySupersession?.valid()||
    !window.pmsvB59CTRSourceCrosswalk?.valid()||
    typeof pmsvB14Digest!=="function"||!data||pmsvB14Digest(data)!==pin)return false;
 const t=data.totals,held=window.pmsvB59CTRSourceCrosswalk.getAllCases(),
  old=new Map(held.map(c=>[c.rank,c]));
 if(data.kind!=="PMSV_BATCH63_COCOA_SUGAR_EXACT_IDENTITY_VS_CTR_TRANSFER_BLOCK"||
  data.as_of!=="2026-10-17"||data.environment!=="GITHUB_PAGES_PREVIEW_ONLY"||
  data.ancestor_b59_digest!=="6791743a07c12e4f"||
  data.ancestor_b62_digest!=="18f3e412e1b2c293"||
  t.catalogue!==533||t.conditionally_first_source_matched!==498||
  t.unchanged_open_ctr_cases!==35||t.open_p0!==13||t.open_p1!==22||
  t.original_evidence_requests_unchanged!==175||
  t.b59_related_ctr_comparators_unchanged!==15||t.b60_original_research_unchanged!==20||
  t.b61_primary_subject_findings_unchanged!==8||
  t.b62_specific_identity_reviews_unchanged!==6||
  t.newly_detailed_identity_cases!==4||t.cocoa_identity_cases!==3||
  t.misri_identity_cases!==1||t.unaffected_held_cases!==31||
  t.new_original_evidence_request_ids_covered!==20||
  t.signed_original_ctr_case_article_approvals!==0||
  t.actual_manufacturer_boms_received!==0||
  t.accredited_contaminant_lab_scope_approvals!==0||t.lot_passes!==0||
  t.original_2018_full_text_gazette_authentications!==0||
  t.wordpress_changed!==false||data.cases?.length!==4||
  data.strict_gates?.no_automatic_cocoa_powder_lead_limit_to_beans_mass_or_mixes!==true||
  data.strict_gates?.no_refined_sugar_chromium_limit_to_misri!==true||
  data.strict_gates?.no_cocoa_butter_method_as_lead_method!==true||
  data.strict_gates?.no_sulphur_dioxide_method_as_chromium_method!==true||
  data.strict_gates?.none_of_the_four_cases_approved!==true||
  data.strict_gates?.entire_thirty_five_held!==true||
  data.original_2018_cocoa_gazette_archive_entry?.case_specific_CTR_applicability!==false||
  held.length!==35)return false;
 const ids=new Set(),ranks=new Set();
 for(const c of data.cases){
  const x=old.get(c.rank);
  if(!x||ranks.has(c.rank)||c.priority!==x.priority||
   c.catalogue_id!==x.catalogue_id||c.product_name!==x.product_name||
   c.analyte!==x.analyte||c.original_legal_gate!==x.original_legal_gate||
   JSON.stringify(c.original_five_gate_ids)!==JSON.stringify(x.original_request_ids)||
   c.published_product_identity_source_verified!=="OFFICIAL_FSSAI_HOSTED_COMPILED_PRODUCT_STANDARD_SECTION"||
   c.primary_product_identity_gazette_original_fulltext_authenticated!==false||
   c.marketplace_product_form_evidenced!==false||
   c.signed_operative_ctr_case_limit!==false||
   c.selected_lab_scope_for_contaminant_verified!==false||
   c.representative_lot_pass!==false||c.product_released!==false||
   !c.identity_text_compiled_reference_only||!c.invalid_ctr_or_method_transfer||
   !c.next_document_request||!c.identity_source_url)return false;
  ranks.add(c.rank);
  for(const id of c.original_five_gate_ids){if(ids.has(id))return false;ids.add(id);}
 }
 return ranks.size===4&&ids.size===20&&[8,9,10,20].every(x=>ranks.has(x))&&
   data.method_sources?.length===2&&
   data.method_sources.every(x=>x.target!==x.not_target);
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function filtered(){
 if(!valid())return[];
 let q=query.trim().toLowerCase();
 return data.cases.filter(c=>(family==="ALL"||(family==="COCOA"&&c.rank!==20)||
  (family==="MISRI"&&c.rank===20))&&(!q||
  [c.rank,c.product_name,c.analyte,c.identity_clause,c.identity_text_compiled_reference_only,
   c.invalid_ctr_or_method_transfer,c.next_document_request].some(v=>String(v).toLowerCase().includes(q))));
}
function tr(c){
 return '<tr><td><b>'+esc(c.priority)+' #'+esc(c.rank)+'</b></td>'+
 '<td><b>'+esc(c.product_name)+'</b><small>Identity '+esc(c.identity_clause)+
 ' · <a href="'+esc(c.identity_source_url)+'" target="_blank" rel="noopener noreferrer">Official FSSAI chapter</a></small></td>'+
 '<td>'+esc(c.identity_text_compiled_reference_only)+'</td>'+
 '<td><b>Do not transfer:</b> '+esc(c.invalid_ctr_or_method_transfer)+
 '<small><b>Next evidence:</b> '+esc(c.next_document_request)+'</small></td>'+
 '<td><b>HELD</b><small>No approved CTR metal limit / lab scope / tested lot</small></td></tr>';
}
function panel(){
 return '<details class="card" id="pmsv-b63-cocoa-sugar-specifics" style="margin-bottom:12px">'+
 '<summary><b>Batch63 · Cocoa and Misri exact identity safeguards</b> — 4 P0 source reviews, 35 CTR holds</summary>'+
 '<div class="notice"><b>No cocoa-powder lead comparator transferred.</b> Beans, dry cocoa/sugar mixes, cocoa mass/liquor and cocoa cake are distinct articles with different sample composition and dry-fat-free bases. Misri is not automatically refined sugar for Chromium limits.</div>'+
 '<p>FSSAI quality standards describe cocoa-bean moisture and bean defects; dry mix cocoa-content subtypes; cocoa mass/cake fat and moisture; and Misri candy from sugar or palmyrah juice. <b>These are food-identity/quality parameters, not legal contaminants limits or observed product test results.</b></p>'+
 '<p><b>Method confusion blocked:</b> FSSAI 04C.018:2024 assesses cocoa butter in mass/cake, not lead. FSSAI 04C.045/046:2024 assess sulphur dioxide in Misri/sugar, not chromium. Neither method can substitute for an accredited matrix-scoped heavy-metal procedure.</p>'+
 '<p>Published official cocoa standards were listed under an enacted 2018 amendment in the FSSAI Gazette archive, but this review does <b>not</b> claim the full original Gazette has been authenticated. Original legal text prevails over chapter compilations.</p>'+
 '<div class="checker-grid">'+
 '<div class="field"><label>Product family</label><select data-pmsv-b63-family>'+
 '<option value="ALL">All four open cases</option><option value="COCOA">Three cocoa articles</option><option value="MISRI">Misri</option></select></div>'+
 '<div class="field"><label>Search source provisions</label><input data-pmsv-b63-search maxlength="120" placeholder="nib, fat, 2.7.6, chromium..."/></div></div>'+
 '<p><b data-pmsv-b63-count>4 identity source reviews</b> · 0 approved case limits · 0 lot PASS</p>'+
 '<div style="max-height:590px;overflow:auto"><table><thead><tr><th>Priority</th><th>Held product</th><th>Relevant product standard</th><th>Forbidden CTR inference and next evidence</th><th>Legal status</th></tr></thead><tbody data-pmsv-b63-rows></tbody></table></div>'+
 '<p><button type="button" data-pmsv-b63-export>Export research-only source distinctions</button></p>'+
 '<p class="countline">All five historical evidence requests per case preserved; no emails sent, signed Gazette applicability, live lab scope or manufacturer CoA received. Other 31 cases unchanged.</p></details>';
}
function refresh(){
 if(!valid())return;
 const anchor=document.getElementById("pmsv-b62-supersession-review");
 if(!anchor)return;
 let root=document.getElementById("pmsv-b63-cocoa-sugar-specifics");
 if(!root){anchor.insertAdjacentHTML("afterend",panel());root=document.getElementById("pmsv-b63-cocoa-sugar-specifics");}
 root.querySelector("[data-pmsv-b63-rows]").innerHTML=filtered().map(tr).join("");
 root.querySelector("[data-pmsv-b63-count]").textContent=filtered().length+" held source identity article(s)";
}
function csv(){
 if(!valid())return"";
 const columns=["rank","priority","product","analyte","identity_clause","identity_source","identity_quality_text",
  "CTR_or_method_transfer_not_allowed","original_supplier_evidence_needed",
  "signed_case_ctr_limit","original_commercial_identity","accredited_lab_scope","tested_lot_pass"];
 const quote=x=>{let v=String(x??"");if(/^\s*[=+\-@]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';};
 const rows=filtered().map(c=>[c.rank,c.priority,c.product_name,c.analyte,c.identity_clause,c.identity_source_url,
  c.identity_text_compiled_reference_only,c.invalid_ctr_or_method_transfer,c.next_document_request,
  false,false,false,false]);
 return [columns.map(quote).join(","),...rows.map(x=>x.map(quote).join(","))].join("\r\n")+"\r\n";
}
function download(){
 const u=URL.createObjectURL(new Blob(["\uFEFF"+csv()],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=u;a.download="PMSV-B63-COCOA-MISRI-LEGAL-IDENTITY-NOT-CTR-LIMITS.csv";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),900);
}
const previous=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await previous();data=null;
 try{let r=await fetch(url+"?v=20261017-b63",{cache:"reload"});
  if(!r.ok)throw Error("B63 data absent");data=await r.json();
  if(!valid())throw Error("B63 integrity fail");refresh();
 }catch(_){data=null;}
};
document.addEventListener("change",ev=>{
 if(ev.target?.matches("[data-pmsv-b63-family]")&&["ALL","COCOA","MISRI"].includes(ev.target.value)){
  family=ev.target.value;refresh();}
});
document.addEventListener("input",ev=>{
 if(ev.target?.matches("[data-pmsv-b63-search]")){query=String(ev.target.value||"").slice(0,120);refresh();}
});
document.addEventListener("click",ev=>{
 if(ev.target?.closest("[data-pmsv-b63-export]")&&valid())download();
});
window.pmsvB63CocoaMisri={valid,filtered,csv,getCounts:()=>({
 all:data?.cases?.length||0,cocoa:data?.cases?.filter(x=>x.rank!==20).length||0,
 misri:data?.cases?.filter(x=>x.rank===20).length||0,
 originalEvidence:0,approvedCTR:0,accreditedLab:0,lotPasses:0,all35Held:true
})};
})();