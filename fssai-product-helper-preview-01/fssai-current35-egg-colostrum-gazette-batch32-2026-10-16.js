"use strict";
/* PMSV Batch32: 2024 notified Gazette operative 01 May 2025. Published
 * FSSR quality rules ≠ CTR legal article match ≠ real laboratory PASS. */
var pmsvB32Data=null,pmsvB32Text="";
const pmsvB32Path="./data/rules/fssai-current35-egg-colostrum-gazette-batch32-2026-10-16.json";
const pmsvB32Expected="75b562f5b1b295f2";
function pmsvB32Valid(){
 if(typeof pmsvB31Valid!=="function"||!pmsvB31Valid()||
 typeof pmsvB14Digest!=="function"||!pmsvB32Data||
 pmsvB14Digest(pmsvB32Data)!==pmsvB32Expected)return false;
 const d=pmsvB32Data,c=d.counts;
 if(d.schema_version!=="1.0"||
 d.kind!=="PMSV_CURRENT35_OPERATIVE_2024_GAZETTE_EGG_COLOSTRUM_BATCH32"||
 d.as_of!=="2026-10-16"||d.environment!=="GH_PAGES_PREVIEW_ONLY"||
 d.official_gazette_url!=="https://fssai.gov.in/upload/uploadfiles/files/GAZETTE%20NOTIFICATION%20DATED%2021_10_2024_ammendments.pdf"||
 d.gazette_publication!=="2024-10-21"||d.operative_effective!=="2025-05-01"||
 c?.canonical_catalogue!==533||c.conditional_references!==498||
 c.first_exact_ctr_pending!==35||c.prior_named_fssr_product_standards!==13||
 c.new_named_fssr_product_standards!==2||
 c.total_named_fssr_product_standards!==15||
 c.amended_composition_criteria!==8||c.approved_ctr_promotions!==0||
 c.lot_pass!==0||c.wordpress_mutated!==false||
 d.results?.canonical_ledger_modified!==false||
 d.results.wordpress_modified!==false||
 d.results.valid_product_standard_sources!==2||
 d.results.actual_lot_labs_verified!==0||d.results.legal_ctr_source_approvals!==0||
 d.future_ctr_amendment_applied!==false||d.cases?.length!==2||
 pmsv498Ledger?.first_source_pending!==35)return false;
 const ledger=new Map(pmsvB26Data.cases.map(x=>[x.catalog_id,x]));
 const old=new Set([...pmsvB29Data.cases,...pmsvB30Data.cases,
 ...pmsvB31Data.cases].map(x=>x.catalog_id)),seen=new Set();
 for(const x of d.cases){
  const expected=ledger.get(x.catalog_id);
  if(!expected||seen.has(x.catalog_id)||old.has(x.catalog_id)||
   x.product_name!==expected.product_name||x.fssr!==expected.fssr||
   x.fcs!==expected.fcs||x.official_amendment_url!==d.official_gazette_url||
   !["2.5.3(5)","2.1.23"].includes(x.clause)||
   !Array.isArray(x.source_pdf_pages_zero_based)||
   x.source_pdf_pages_zero_based.some(p=>!Number.isInteger(p)||p<0||p>30)||
   !x.operative_since||x.operative_since!=="2025-05-01"||
   !x.identity||!x.amendment_precedence_note||
   !Array.isArray(x.process_evidence)||x.process_evidence.length<3||
   !Array.isArray(x.quality_requirements)||
   x.quality_requirements.length!==(x.clause==="2.5.3(5)"?6:2)||
   x.positive_fssr_standard_located!==true||
   x.finished_lot_variant_confirmed!==false||
   x.real_lab_report_verified!==false||
   x.ctr_contaminant_scope_approved!==false||x.compliance_pass!==false)return false;
  for(const q of x.quality_requirements){
   if(!q.variant||!q.parameter||!["min","max"].includes(q.relation)||
    !Number.isFinite(q.value)||q.value<0||!q.unit||!q.basis)return false;
  }
  if(x.clause==="2.5.3(5)"){
   const p=x.quality_requirements.filter(z=>z.parameter==="Pickling solution pH");
   if(p.length!==2||p.find(z=>z.variant==="VINEGAR_BASED")?.value!==3.2||
      p.find(z=>z.variant==="OIL_BASED")?.value!==3.6||
      p.some(z=>z.relation!=="max"))return false;
  }else{
   const m=x.quality_requirements;
   if(m[0].variant!=="LIQUID_COLOSTRUM"||m[0].value!==1.8||
    m[1].variant!=="COLOSTRUM_POWDER"||m[1].value!==8.5||
    m.some(z=>z.parameter!=="Immunoglobulins-G (IgG)"||z.relation!=="min"))return false;
  }
  seen.add(x.catalog_id);
 }
 return seen.size===2;
}
function pmsvB32Filtered(){
 if(!pmsvB32Valid())return [];
 const q=pmsvB32Text.trim().toLowerCase();
 return pmsvB32Data.cases.filter(x=>!q||
 [x.catalog_id,x.product_name,x.clause,x.identity,
 ...x.quality_requirements.map(r=>r.parameter+" "+r.variant)].some(z=>String(z).toLowerCase().includes(q)));
}
function pmsvB32Requirements(c){
 const e=pmsvB14Esc;
 return '<div class="tablewrap"><table><thead><tr><th>Finished variant</th><th>Parameter</th><th>Published requirement</th><th>Testing scope</th></tr></thead><tbody>'+
 c.quality_requirements.map(x=>'<tr><td>'+e(x.variant.replaceAll("_"," "))+
 '</td><td>'+e(x.parameter)+'</td><td>'+(x.relation==="min"?"≥ ":"≤ ")+e(x.value)+" "+e(x.unit)+
 '</td><td>'+e(x.basis)+'</td></tr>').join("")+'</tbody></table></div>';
}
function pmsvB32Rows(){
 const e=pmsvB14Esc;
 return pmsvB32Filtered().map(x=>'<tr><td><b>'+e(x.product_name)+'</b>'+
 '<div><small>FSSR '+e(x.clause)+'</small></div></td>'+
 '<td>'+e(x.identity)+'</td><td>'+e(x.amendment_precedence_note)+'</td>'+
 '<td>'+e(x.process_evidence[0])+'</td><td><a href="'+e(x.official_amendment_url)+
 '#page='+(x.source_pdf_pages_zero_based[0]+1)+
 '" target="_blank" rel="noopener noreferrer">Operative FSSAI Gazette</a> '+
 '<button type="button" data-pmsv-b32-open="'+e(x.catalog_id)+'">Evidence form</button></td></tr>').join("");
}
function pmsvB32Dash(){
 if(!pmsvB32Valid())return "";
 return '<details class="card" id="pmsv-b32-operative-gazette" style="margin-bottom:12px">'+
 '<summary><b>Batch32 · May 2025 operative FSSR amendment</b> — pickled eggs / IgG colostrum</summary>'+
 '<div class="notice"><b>Updated Gazette overrides outdated consolidated figures.</b> Egg pickle pH is a maximum per variant (3.2 vinegar; 3.6 oil), not the older shared pH range. Colostrum IgG minimum: liquid 1.8%, powder 8.5%; powder 12.5% legacy total-immunoglobulins is superseded for this row. These are product standards, not a CTR contaminant or tested-lot PASS. All 35 CTR-source cases remain pending.</div>'+
 '<p><label>Search amended commodity / criterion <input type="search" data-pmsv-b32-search placeholder="egg, pH, IgG, colostrum" /></label></p>'+
 '<p data-pmsv-b32-count>'+pmsvB32Filtered().length+' of 2 FSSR amendment dossiers, 0 legal CTR matches</p>'+
 '<div class="tablewrap"><table><thead><tr><th>Article</th><th>Identity</th><th>What changed</th><th>Required proof</th><th>Source</th></tr></thead>'+
 '<tbody data-pmsv-b32-rows>'+pmsvB32Rows()+'</tbody></table></div></details>';
}
function pmsvB32Refresh(){
 if(typeof document==="undefined"||!pmsvB32Valid())return;
 const host=document.getElementById("pmsv-b31-commodity-standards")||
 document.getElementById("pmsv-b29-exact-fssr-product-standards")||
 document.getElementById("pmsv-b14-review-index")||
 document.getElementById("selectedProductStandardContent");
 if(!host)return;
 let panel=document.getElementById("pmsv-b32-operative-gazette");
 if(!panel){host.insertAdjacentHTML("beforebegin",pmsvB32Dash());return}
 const body=panel.querySelector("[data-pmsv-b32-rows]"),stat=panel.querySelector("[data-pmsv-b32-count]");
 if(body)body.innerHTML=pmsvB32Rows();
 if(stat)stat.textContent=pmsvB32Filtered().length+" of 2 Gazette clauses displayed; zero approved CTR articles or tested lots.";
}
function pmsvB32PerProduct(p){
 if(!p||!pmsvB32Valid())return "";
 const x=pmsvB32Data.cases.find(c=>c.catalog_id===p.id);
 if(!x||x.product_name!==p.name||
 String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))return "";
 const e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px"><summary>'+
 '<b>Batch32 · operative FSSR amendment ('+e(x.clause)+')</b> — CTR still pending</summary>'+
 '<p>'+e(x.identity)+'</p>'+pmsvB32Requirements(x)+
 '<p><b>Which previous text was superseded?</b> '+e(x.amendment_precedence_note)+'</p>'+
 '<p><b>Evidence to collect:</b></p><ol>'+x.process_evidence.map(s=>'<li>'+e(s)+'</li>').join("")+'</ol>'+
 '<p><a target="_blank" rel="noopener noreferrer" href="'+e(x.official_amendment_url)+
 '#page='+(x.source_pdf_pages_zero_based[0]+1)+'">Official FSSAI Gazette PDF</a></p>'+
 '<div class="notice">No verified actual finished lot, no CTR heavy-metal/toxin applicability decision, no compliance PASS.</div></details>';
}
const pmsvB32PreviousLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB32PreviousLoad();pmsvB32Data=null;
 try{
  const r=await fetch(pmsvB32Path+"?v=20261016-b32",{cache:"reload"});
  if(!r.ok)throw Error("B32 operative Gazette record unavailable");
  pmsvB32Data=await r.json();
  if(!pmsvB32Valid())throw Error("B32 exact identity/integrity check failed");
  pmsvB32Refresh();
 }catch(_){pmsvB32Data=null;}
};
const pmsvB32OldHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB32PerProduct(p)+pmsvB32OldHtml(p)};
if(typeof document!=="undefined"&&document.addEventListener){
 document.addEventListener("input",ev=>{
  if(ev.target?.matches?.("[data-pmsv-b32-search]")){
   pmsvB32Text=String(ev.target.value||"").slice(0,130);pmsvB32Refresh();
  }
 });
 document.addEventListener("click",ev=>{
  const b=ev.target?.closest?.("[data-pmsv-b32-open]");
  if(b&&typeof pmsvB21Open==="function")pmsvB21Open(b.getAttribute("data-pmsv-b32-open"));
 });
}