"use strict";
/* B37 future CTR and Ayurveda licensing: research only, no legal threshold promotion. */
var pmsvB37Data=null,pmsvB37Find="",pmsvB37Tab="ALL",pmsvB37FutureSearch="";
const pmsvB37Path="./data/rules/fssai-current35-future-amendment-and-ayurveda-license-batch37-2026-10-16.json";
const pmsvB37Expected="ff243ede854cc91f";
function pmsvB37Valid(){
 if(typeof pmsvB36Valid!=="function"||!pmsvB36Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB37Data||
 pmsvB14Digest(pmsvB37Data)!==pmsvB37Expected)return false;
 const d=pmsvB37Data,n=d.counts,s=d.statutory_source;
 if(d.schema_version!=="1.0"||d.as_of!=="2026-10-16"||
 d.kind!=="PMSV_CURRENT35_CTR_2026_FUTURE_COMMENCEMENT_AND_AYU_LICENSE_BATCH37"||
 d.environment!=="GH_PAGES_PREVIEW_ONLY"||d.quality_research_only!==true||
 n?.catalogue!==533||n.conditional_first_source_matches!==498||
 n.exact_ctr_scope_pending!==35||n.forward_scoped_cases_reviewed!==35||
 n.unresolved_formula_or_chemical_identity!==9||
 n.future_amendment_named_article_changes!==8||
 n.current_named_article_approvals!==0||n.future_articles_promoted_to_current!==0||
 n.ayurveda_manufacturer_licensing_routes!==2||n.confirmed_real_licenses!==0||
 n.laboratory_lot_passes!==0||n.wordpress_changed!==false||
 s?.effective_from!=="2026-12-01"||s.operative_as_of_review!==false||
 s.published_on!=="2026-05-25"||
 s.gazette_id!=="CG-DL-E-25052026-272840"||
 s.original_gazette_pdf!=="https://egazette.gov.in/WriteReadData/2026/272840.pdf"||
 s.original_pdf_directly_inspected!==false||
 s.current_consolidation!==pmsvB26Data.source_reference||
 d.results?.master_ledger_modified!==false||
 d.results?.wordpress_modified!==false||
 d.results?.added_current_ctr_articles!==0||
 d.results?.added_future_approvals!==0||
 d.results?.verified_lot_conformity!==0||
 d.amendment_rows?.length!==8||d.ayurveda_licensing?.length!==2||
 d.case_screening?.length!==35||
 pmsv498Ledger?.records?.length!==533||
 pmsv498Ledger?.first_source_pending!==35)return false;
 const full=new Map(pmsvB26Data.cases.map(x=>[x.catalog_id,x]));
 const unknown=new Set(pmsvB36Data.cases.map(x=>x.catalog_id));
 if(full.size!==35||unknown.size!==9)return false;
 let unseen=new Set(),unknownCount=0;
 for(const x of d.case_screening){
  const p=full.get(x.catalog_id);
  if(!p||unseen.has(x.catalog_id)||x.product_name!==p.product_name||
   x.rank!==p.rank||x.previous_ctr_article!==p.reviewed_comparator_article||
   x.previous_ctr_analyte!==p.reviewed_analyte||
   x.future_amendment_article_ids_assigned?.length!==0||
   x.does_not_prove_future_scope_not_applicable!==true||
   x.present_ctr_scope_approved!==false||x.future_ctr_auto_applied!==false||
   x.current_ctr_numeric_limit_from_future_gazette!==false||
   x.regulatory_lot_pass!==false||!x.next_review_action)return false;
  const isUnknown=unknown.has(x.catalog_id);
  if(isUnknown)unknownCount++;
  if(x.future_amendment_review!==(isUnknown?
   "ACTUAL_FORMULA_OR_SUBSTANCE_NOT_KNOWN_SCREENER":
   "NO_DIRECT_MATCH_OF_PENDING_CATALOGUE_NAME_TO_EIGHT_CHANGED_ARTICLES"))return false;
  unseen.add(x.catalog_id);
 }
 let changed=new Set();
 for(const r of d.amendment_rows){
  if(!r.id||changed.has(r.id)||!r.analyte||!r.future_named_scope||
   !r.change||!r.requires||r.source_original_gazette!==s.original_gazette_pdf||
   r.effective_from!=="2026-12-01"||
   r.in_force_as_of_review!==false||
   r.numeric_auto_application!==false||
   r.finished_product_scope_approved!==false||
   r.compliance_pass!==false)return false;
  changed.add(r.id);
 }
 const originalAyurveda=new Set(pmsvB36Data.cases.filter(x=>
 x.legal_review_class==="AYURVEDA_RECIPE_WITHOUT_LOT_OR_LICENCE").map(x=>x.catalog_id));
 for(const x of d.ayurveda_licensing){
  if(!originalAyurveda.has(x.catalog_id)||x.reference_subcategory!=="102.1 AYURVEDA_AAHARA_CATEGORY_A"||
   x.manufacturing_kind_of_business!=="Ayurveda Aahara (Manufacturer)"||
   x.manufacturer_license_route!=="CENTRAL_LICENCE"||
   x.standardized_list_product_reference!=="CATEGORY_A_LIST_IDENTITY_REQUIRES_CONFIRMATION"||
   x.standardized_list_product_no_extra_approval_letter_if_exact_identity!==true||
   x.additional_hq_approval_for_category_b!==true||
   x.claim_related_hq_approval_required_if_disease_risk_reduction!==true||
   x.actual_fo_scos_license_verified!==false||
   x.actual_standardized_product_selection_verified!==false||
   x.actual_commercial_recipe_verified!==false||
   x.health_claim_approval_verified!==false||
   x.approved_ctr_limit!==false||
   x.lab_compliance_pass!==false||
   x.documentary_evidence_required?.length!==4)return false;
 }
 return unseen.size===35&&unknownCount===9&&changed.size===8&&
 new Set(d.ayurveda_licensing.map(x=>x.catalog_id)).size===2&&
 d.amendment_rows.find(x=>x.id==="ARSENIC_FISH_OIL")?.future_level_inorganic_arsenic_mg_per_kg===0.1;
}
function pmsvB37Cases(){
 if(!pmsvB37Valid())return [];
 const q=pmsvB37Find.toLowerCase().trim();
 return pmsvB37Data.case_screening.filter(x=>
 (pmsvB37Tab==="ALL"||
 (pmsvB37Tab==="UNKNOWN"&&x.future_amendment_review==="ACTUAL_FORMULA_OR_SUBSTANCE_NOT_KNOWN_SCREENER")||
 (pmsvB37Tab==="OTHER"&&x.future_amendment_review!=="ACTUAL_FORMULA_OR_SUBSTANCE_NOT_KNOWN_SCREENER"))&&
 (!q||[x.product_name,x.catalog_id,x.previous_ctr_article,x.previous_ctr_analyte,
 x.next_review_action].some(z=>String(z).toLowerCase().includes(q))));
}
function pmsvB37Future(){
 if(!pmsvB37Valid())return [];
 const q=pmsvB37FutureSearch.toLowerCase().trim();
 return pmsvB37Data.amendment_rows.filter(x=>!q||
 [x.id,x.family,x.analyte,x.future_named_scope,x.requires].some(z=>
 String(z).toLowerCase().includes(q)));
}
function pmsvB37CaseRow(c){
 const e=pmsvB14Esc;
 return '<tr><td><b>'+e(c.product_name)+'</b><div><small>'+e(c.catalog_id)+'</small></div></td>'+
 '<td>'+e(c.future_amendment_review==="ACTUAL_FORMULA_OR_SUBSTANCE_NOT_KNOWN_SCREENER"?
 "Actual composition unknown; screen after dossier":"No directly named changed article — NOT a legal exclusion")+'</td>'+
 '<td>'+e(c.next_review_action)+'</td><td>'+
 '<button type="button" data-pmsv-b37-open="'+e(c.catalog_id)+'">Open product</button></td></tr>';
}
function pmsvB37Article(r){
 const e=pmsvB14Esc;
 return '<tr><td><b>'+e(r.analyte)+'</b><div><small>'+e(r.regulation)+
 '</small></div></td><td>'+e(r.future_named_scope)+'</td>'+
 '<td>'+e(r.change)+'</td><td>'+e(r.requires)+
 '</td><td><b>1 Dec 2026 only; not current</b></td></tr>';
}
function pmsvB37Panel(){
 if(!pmsvB37Valid())return "";
 const d=pmsvB37Data,e=pmsvB14Esc;
 return '<details class="card" id="pmsv-b37-future-ctr-review" style="margin-bottom:12px">'+
 '<summary><b>Batch37 · future CTR Gazette 2026 and Ayurveda manufacturer licensing</b> — 35 pending review paths</summary>'+
 '<div class="notice"><b>LEGAL DATE LOCK:</b> The final CTR amendment was notified in May 2026 but becomes operative 1 December 2026. This October 2026 preview must use the currently effective law. The eight future changes below are for forward planning ONLY. The Gazette original PDF link could not be independently rendered; verify it before a signed legal opinion. No automatic compliance PASS.</div>'+
 '<p>Sources: <a href="'+e(d.statutory_source.fssai_notification_index)+'" target="_blank" rel="noopener noreferrer">FSSAI notification listing</a> · '+
 '<a href="'+e(d.statutory_source.original_gazette_pdf)+'" target="_blank" rel="noopener noreferrer">Original Gazette link</a> · '+
 '<a href="'+e(d.statutory_source.current_consolidation)+'" target="_blank" rel="noopener noreferrer">Current CTR Version IX</a></p>'+
 '<details><summary><b>Eight future-effective article changes</b> (not Oct 2026 thresholds)</summary>'+
 '<p><label>Search future article <input type="search" data-pmsv-b37-future placeholder="fish oil, saffrole, pulses, seafood" /></label></p>'+
 '<div class="tablewrap"><table><thead><tr><th>Analyte</th><th>Future named legal scope</th><th>Amendment</th><th>Evidence required</th><th>Effective</th></tr></thead>'+
 '<tbody data-pmsv-b37-future-rows>'+pmsvB37Future().map(pmsvB37Article).join("")+'</tbody></table></div></details>'+
 '<details><summary><b>Two Ayurveda Aahara licence-gate decisions</b></summary>'+
 '<div class="notice">FSSAI 1 Sep 2025 order: manufacturer KoB Ayurveda Aahara requires Central Licence. Category A standardized-list product selection needs no additional product-approval letter, but only when that exact listed product identity is verified. Category B requires FSSAI HQ product approval; regulated claims can require HQ approval.</div>'+
 d.ayurveda_licensing.map(x=>'<p><b>'+e(x.product_name)+'</b> — central manufacturing licence and standardized Category A selection remain unverified. <a target="_blank" rel="noopener noreferrer" href="'+e(x.official_licensing_order)+'">Official FoSCoS order</a></p>').join("")+
 '</details>'+
 '<p><label>Search pending catalogue case <input type="search" data-pmsv-b37-find placeholder="cocoa, enzyme, milk, polyol" /></label></p>'+
 '<p><label>Evidence status <select data-pmsv-b37-tab>'+
 '<option value="ALL">All 35</option><option value="UNKNOWN">9 with unknown substance/formula</option>'+
 '<option value="OTHER">26 requiring article/ingredient review</option></select></label></p>'+
 '<p data-pmsv-b37-count>'+pmsvB37Cases().length+' of 35 reviewed; 0 source promotions</p>'+
 '<div class="tablewrap" style="max-height:540px;overflow:auto"><table><thead><tr>'+
 '<th>Pending product</th><th>2026 forward assessment</th><th>Required next evidence</th><th>Open</th></tr></thead>'+
 '<tbody data-pmsv-b37-cases>'+pmsvB37Cases().map(pmsvB37CaseRow).join("")+
 '</tbody></table></div></details>';
}
function pmsvB37Refresh(){
 if(typeof document==="undefined"||!pmsvB37Valid())return;
 const target=document.getElementById("pmsv-b36-legal-precedence")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!target)return;
 const panel=document.getElementById("pmsv-b37-future-ctr-review");
 if(!panel){target.insertAdjacentHTML("beforebegin",pmsvB37Panel());return}
 const c=panel.querySelector("[data-pmsv-b37-cases]");
 const a=panel.querySelector("[data-pmsv-b37-future-rows]");
 const n=panel.querySelector("[data-pmsv-b37-count]");
 if(c)c.innerHTML=pmsvB37Cases().map(pmsvB37CaseRow).join("");
 if(a)a.innerHTML=pmsvB37Future().map(pmsvB37Article).join("");
 if(n)n.textContent=pmsvB37Cases().length+" of 35 pending; 0 legal CTR approvals.";
}
function pmsvB37Product(p){
 if(!p||!pmsvB37Valid())return "";
 const x=pmsvB37Data.case_screening.find(x=>x.catalog_id===p.id);
 if(!x||x.product_name!==p.name)return "";
 const e=pmsvB14Esc;
 const a=pmsvB37Data.ayurveda_licensing.find(z=>z.catalog_id===p.id);
 return '<details class="card" style="margin-top:12px"><summary>'+
 '<b>Batch37 · future CTR amendment and licensing screen</b> — no legal threshold change</summary>'+
 '<p><b>Future CTR:</b> '+e(x.future_amendment_review.replaceAll("_"," "))+'</p>'+
 '<p>'+e(x.next_review_action)+'</p>'+
 (a?'<p><b>Ayurveda licensing:</b> manufacturer Central Licence required; verify exact Category A standardized-list selection and any applicable claims. <a href="'+
 e(a.official_licensing_order)+'" target="_blank" rel="noopener noreferrer">Official FSSAI order</a></p>':'')+
 '<div class="notice">Future CTR Gazette is NOT operative before 1 December 2026; no verified commercial licence, exact article, current numeric limit or lot PASS has been assigned.</div></details>';
}
const pmsvB37OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB37OldLoad();pmsvB37Data=null;
 try{
  const r=await fetch(pmsvB37Path+"?v=20261016-b37",{cache:"reload"});
  if(!r.ok)throw Error("Batch37 Gazette/KoB source unavailable");
  pmsvB37Data=await r.json();
  if(!pmsvB37Valid())throw Error("Batch37 source or catalogue checksum mismatch");
  pmsvB37Refresh();
 }catch(_){pmsvB37Data=null;}
};
const pmsvB37OldProduct=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB37Product(p)+pmsvB37OldProduct(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b37-find]")){
   pmsvB37Find=String(ev.target.value||"").slice(0,140);pmsvB37Refresh();
  }else if(ev.target?.matches?.("[data-pmsv-b37-future]")){
   pmsvB37FutureSearch=String(ev.target.value||"").slice(0,140);pmsvB37Refresh();
  }
 });
 document.addEventListener("change",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b37-tab]")&&
   ["ALL","UNKNOWN","OTHER"].includes(ev.target.value)){
   pmsvB37Tab=ev.target.value;pmsvB37Refresh();
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b37-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b37-open"));
 });
}
