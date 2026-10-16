"use strict";
/* Batch36: current-source precedence research overlays B35. No CTR limits. */
var pmsvB36Data=null,pmsvB36Query="",pmsvB36Filter="ALL";
const pmsvB36Path="./data/rules/fssai-current35-operative-precedence-batch36-2026-10-16.json";
const pmsvB36Expected="4f2502f52d2fe210";
const pmsvB36ExactCodes=[
"APPENDIX_A_CHEMICAL_ID","CLOSED_APPLICATION_IS_NOT_AUTHORITY",
"FPSFA_APP_A_ID_AND_FUNCTION","LEGACY_NUTRA_VA_VF_REMAP_REQUIRED",
"NAMED_ENZYME_PRODUCER_USE_REQUIRED","LEGACY_NUTRA_IV_VI_VIII_REMAP_REQUIRED",
"PREMIX_DEFINED_NOT_AUTOMATICALLY_AUTHORISED","AYURVEDA_RECIPE_WITHOUT_LOT_OR_LICENCE"
];
function pmsvB36Valid(){
 if(typeof pmsvB35Valid!=="function"||!pmsvB35Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB36Data||
 pmsvB14Digest(pmsvB36Data)!==pmsvB36Expected)return false;
 const d=pmsvB36Data,n=d.counts;
 if(d.schema_version!=="1.0"||
 d.kind!=="PMSV_CURRENT35_NUTRA_PRECEDENCE_AND_NINE_CASE_REMAP_BATCH36"||
 d.as_of!=="2026-10-16"||d.deployment!=="GH_PAGES_PREVIEW_ONLY"||
 d.official_ctr!==pmsvB26Data.source_reference||
 d.quality_research_only!==true||d.legal_documentation_research_only!==true||
 n?.catalogue!==533||n.conditional_first_source_matches!==498||
 n.exact_ctr_cases_pending!==35||n.nine_prior_documentary_cases!==9||
 n.precedence_rechecked_cases!==9||n.legacy_nutra_schedule_revisions!==2||
 n.ayurveda_recipe_checks!==2||n.sajji_application_not_approval!==1||
 n.unique_finished_lot_identifications!==0||
 n.finished_ctr_article_scope_approvals!==0||
 n.finished_numeric_ctr_limits_approved!==0||
 n.actual_lot_lab_passes!==0||n.wordpress_changed!==false||
 d.results?.canonical_ledger_modified!==false||d.results.wordpress_modified!==false||
 d.results.auto_legal_permission_changes!==0||
 d.results.ctr_scope_approvals!==0||d.results.lab_conformity_signoffs!==0||
 d.legal_history?.length!==4||d.verified_regulatory_principles?.length!==5||
 d.cases?.length!==9||pmsv498Ledger?.records?.length!==533||
 pmsv498Ledger?.first_source_pending!==35)return false;
 const previous=new Map(pmsvB35Data.records.map(r=>[r.catalog_id,r]));
 if(previous.size!==9)return false;
 const seen=new Set();let remaps=0,ayurveda=0,app=0;
 const history=d.legal_history;
 if(history[0].role!=="LEGACY_COMPENDIUM"||
 history[1].role!=="SECTION_16_5_INITIAL_OPERATIONAL_DIRECTION"||
 history[1].effective_from!=="2022-04-01"||
 history[2].role!=="REOPERATIONAL_DIRECTION_WITH_CODEX_GMP"||
 history[3].effective_from!=="2024-07-01"||
 history.some(x=>!/^https:\/\/(?:www\.)?fssai\.gov\.in\//.test(x.source)))return false;
 for(const r of d.cases){
  const old=previous.get(r.catalog_id);
  if(!old||seen.has(r.catalog_id)||r.product_name!==old.product_name||
   r.rank!==old.rank||r.fssr!==old.fssr||r.fcs!==old.fcs||
   r.prior_source_class!==old.source_class||
   !pmsvB36ExactCodes.includes(r.legal_review_class)||
   !r.current_source_interpretation||!r.legal_article_nontransfer_reason||
   !r.guard||!Array.isArray(r.documentary_actions)||
   r.documentary_actions.length!==3||!Array.isArray(r.source_refs)||
   r.source_refs.length<2||r.source_refs.some(s=>!s.key||!s.url||
    !/^https:\/\/(?:www\.)?(?:fssai\.gov\.in|fpas\.fssai\.gov\.in)\//.test(s.url))||
   r.actual_lot_identity_verified!==false||
   r.complete_formula_verified!==false||
   r.source_precedence_signed_off!==false||
   r.current_final_notification_checked_through_2026!==false||
   r.ctr_exact_finished_article_approved!==false||
   r.finished_ctr_numeric_limit_assigned!==false||
   r.lot_lab_pass!==false||r.regulatory_pass!==false)return false;
  seen.add(r.catalog_id);
  if(r.legal_review_class.startsWith("LEGACY_NUTRA_"))remaps++;
  if(r.legal_review_class==="AYURVEDA_RECIPE_WITHOUT_LOT_OR_LICENCE")ayurveda++;
  if(r.legal_review_class==="CLOSED_APPLICATION_IS_NOT_AUTHORITY"){app++;
   if(r.catalog_id!=="99-99-1-sajji-khar")return false;
  }
 }
 const one=d.cases.find(r=>r.catalog_id.includes("ingredients-listed-under-schedule"));
 const two=d.cases.find(r=>r.catalog_id.includes("additives-va-vf"));
 const milk=d.cases.find(r=>r.catalog_id.includes("ksheerapaka"));
 return seen.size===9&&remaps===2&&ayurveda===2&&app===1&&
 one?.guard==="NO_OLD_IV_VI_VIII_DIRECT_MAPPING"&&
 two?.guard==="NO_LEGACY_SCHEDULE_AUTO_TRANSFER"&&
 milk?.guard==="NO_INVENTED_FOUR_MILK_FORMULA"&&
 d.verified_regulatory_principles.find(x=>x.id==="2022_SCHEDULE_I_IV")?.page_zero_based===3;
}
function pmsvB36Filtered(){
 if(!pmsvB36Valid())return [];
 const q=pmsvB36Query.trim().toLowerCase();
 return pmsvB36Data.cases.filter(x=>
 (pmsvB36Filter==="ALL"||
 (pmsvB36Filter==="LEGACY"&&x.legal_review_class.startsWith("LEGACY_NUTRA_"))||
 (pmsvB36Filter==="AYURVEDA"&&x.legal_review_class==="AYURVEDA_RECIPE_WITHOUT_LOT_OR_LICENCE")||
 (pmsvB36Filter==="OTHER"&&!x.legal_review_class.startsWith("LEGACY_NUTRA_")&&x.legal_review_class!=="AYURVEDA_RECIPE_WITHOUT_LOT_OR_LICENCE"))&&
 (!q||[x.catalog_id,x.product_name,x.legal_review_class,x.current_source_interpretation,
 ...x.documentary_actions].some(s=>String(s).toLowerCase().includes(q))));
}
function pmsvB36Article(x){
 const e=pmsvB14Esc;
 return '<tr><td><b>'+e(x.product_name)+'</b><div><small>'+e(x.catalog_id)+'</small></div></td>'+
 '<td><b>'+e(x.legal_review_class.replaceAll("_"," "))+'</b></td>'+
 '<td>'+e(x.current_source_interpretation)+'</td>'+
 '<td>'+e(x.legal_article_nontransfer_reason)+'</td>'+
 '<td><button type="button" data-pmsv-b36-open="'+e(x.catalog_id)+'">Review evidence</button></td></tr>';
}
function pmsvB36Panel(){
 if(!pmsvB36Valid())return "";
 const d=pmsvB36Data,e=pmsvB14Esc;
 return '<details class="card" id="pmsv-b36-legal-precedence" style="margin-bottom:12px">'+
 '<summary><b>Batch36 · FSSAI operative-source precedence and nine legacy identity gates</b> — all 35 CTR matches pending</summary>'+
 '<div class="notice"><b>Correction:</b> The 2016/2021 Nutra compendium is not sufficient alone. The 2022 Section 16(5) direction operationalised Schedules I–IV and Annexure 3, then FSSAI re-operationalised it in 2024. Old Schedules VI/VIII and VA–VF cannot be silently carried forward. Subsequent Gazette checks through Oct 2026 remain required before any final legal sign-off.</div>'+
 '<details><summary>Primary legal instrument timeline (historical directions, not signed 2026 legal status)</summary><ol>'+
 d.legal_history.map(x=>'<li><b>'+e(x.date)+'</b>: '+e(x.finding)+
 ' <a href="'+e(x.source)+'" target="_blank" rel="noopener noreferrer">FSSAI primary document</a></li>').join("")+
 '</ol></details>'+
 '<p><label>Search source/commodity <input type="search" data-pmsv-b36-query placeholder="VA-VF, Schedule VIII, enzyme, Ayurveda" /></label></p>'+
 '<p><label>Review gate <select data-pmsv-b36-filter>'+
 '<option value="ALL">All nine</option><option value="LEGACY">2 legacy Nutra remaps</option>'+
 '<option value="AYURVEDA">2 Ayurveda recipe gates</option>'+
 '<option value="OTHER">5 other identity/legal gates</option></select></label></p>'+
 '<p data-pmsv-b36-count>'+pmsvB36Filtered().length+' of 9 source decisions; 0 CTR limits approved</p>'+
 '<div class="tablewrap" style="max-height:580px;overflow:auto"><table><thead><tr>'+
 '<th>Actual product class</th><th>Required legal route</th><th>Positive regulatory evidence</th>'+
 '<th>Why no auto-approval</th><th>Action</th></tr></thead>'+
 '<tbody data-pmsv-b36-rows>'+pmsvB36Filtered().map(pmsvB36Article).join("")+'</tbody></table></div></details>';
}
function pmsvB36Refresh(){
 if(typeof document==="undefined"||!pmsvB36Valid())return;
 const host=document.getElementById("pmsv-b35-nine-source-routes")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!host)return;
 const panel=document.getElementById("pmsv-b36-legal-precedence");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB36Panel());return}
 const body=panel.querySelector("[data-pmsv-b36-rows]"),count=panel.querySelector("[data-pmsv-b36-count]");
 if(body)body.innerHTML=pmsvB36Filtered().map(pmsvB36Article).join("");
 if(count)count.textContent=pmsvB36Filtered().length+" of 9 reviewed; 35 exact CTR scope decisions still pending.";
}
function pmsvB36PerProduct(p){
 if(!p||!pmsvB36Valid())return "";
 const x=pmsvB36Data.cases.find(c=>c.catalog_id===p.id);
 if(!x||x.product_name!==p.name||
 String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))return "";
 const e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px"><summary>'+
 '<b>Batch36 · updated operative source gate: '+e(x.legal_review_class.replaceAll("_"," "))+'</b></summary>'+
 '<p>'+e(x.current_source_interpretation)+'</p>'+
 '<p><b>Why cannot transfer a numeric CTR threshold:</b> '+e(x.legal_article_nontransfer_reason)+'</p>'+
 '<p><b>Next documentary actions:</b></p><ol>'+
 x.documentary_actions.map(s=>'<li>'+e(s)+'</li>').join("")+'</ol>'+
 '<p><b>Primary FSSAI source links:</b> '+
 x.source_refs.map(z=>'<a href="'+e(z.url)+'" target="_blank" rel="noopener noreferrer">'+e(z.key)+'</a>').join(" · ")+
 '</p><div class="notice">Review only. No verified commercial lot, final 2026 amendment reconciliation, approved finished CTR article, numeric limit, COA or regulatory PASS.</div></details>';
}
const pmsvB36OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB36OldLoad();pmsvB36Data=null;
 try{
  const r=await fetch(pmsvB36Path+"?v=20261016-b36",{cache:"reload"});
  if(!r.ok)throw Error("Batch36 precedence research unavailable");
  pmsvB36Data=await r.json();
  if(!pmsvB36Valid())throw Error("Batch36 legal version/source mismatch");
  pmsvB36Refresh();
 }catch(_){pmsvB36Data=null;}
};
const pmsvB36OldProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB36PerProduct(p)+pmsvB36OldProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b36-query]")){
   pmsvB36Query=String(ev.target.value||"").slice(0,140);pmsvB36Refresh();
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b36-filter]")){
   const v=ev.target.value;if(["ALL","LEGACY","AYURVEDA","OTHER"].includes(v)){
    pmsvB36Filter=v;pmsvB36Refresh();
   }
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b36-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b36-open"));
 });
}
