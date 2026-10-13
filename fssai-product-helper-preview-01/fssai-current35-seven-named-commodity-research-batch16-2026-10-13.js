"use strict";
/* PMSV Batch 16: seven NEW commodity-specific named CTR research hypotheses.
 * Previous three documented conditional source branches remain distinct.
 * Neither hypothesis nor any published reference value is an active legal limit.
 */
var pmsvB16Data=null;
const pmsvB16Path="./data/rules/fssai-current35-seven-named-commodity-research-batch16-2026-10-13.json";
const pmsvB16Expected="9dce8f98f4d16883";
const pmsvB16Ctr="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
function pmsvB16Digest(obj){
 const s=JSON.stringify(obj);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function pmsvB16Valid(){
 if(typeof pmsvB15Valid!=="function"||!pmsvB15Valid()||
 !pmsvB16Data||!pmsvB14Data||!pmsvB15Data||!pmsv35Queue||!pmsv498Ledger)return false;
 const d=pmsvB16Data;
 if(pmsvB16Digest(d)!==pmsvB16Expected||
 d.kind!=="PMSV_CURRENT35_NEW7_NAMED_COMMODITY_RESEARCH_BATCH16"||
 d.schema_version!=="1.0"||
 d.policy!=="ONLY_OFFICIAL_FSSAI_FOSCOS_RESEARCH_HYPOTHESES_NOT_APPROVAL"||
 d.current_ctr_source!==pmsvB16Ctr||
 d.catalogue!==533||d.conditional_first_source_matches!==498||
 d.first_exact_pending!==35||
 d.existing_3_prior_conditional_candidates!==3||
 d.new_distinct_research_hypotheses!==7||
 d.remaining_without_specific_candidate!==25||
 d.new_hypothesis_proof_items!==28||
 d.hypotheses?.length!==7||d.cases?.length!==35||
 d.future_rule_commencement!=="2026-12-01"||d.future_rule_auto_applied!==false||
 d.results?.new_first_source_promotions!==0||d.results?.new_numeric_thresholds_applied!==0||
 d.results?.new_lot_lab_passes!==0||d.results?.new_compliance_approvals!==0||
 d.results?.complete_contaminant_panel_clearances!==0||
 d.results?.canonical_ledger_modified!==false||
 d.results?.wordpress_production_modified!==false||
 pmsv498Ledger.first_source_pending!==35||pmsv35Queue.review_records?.length!==35)return false;
 const live=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x]));
 const prior=new Map(pmsvB15Data.candidate_routes.map(x=>[x.catalog_id,x]));
 const named=new Map(),ids=new Set();let proofs=0,counts={PRIOR_NAMED_CONDITIONAL:0,NEW_RESEARCH_COMMODITY_HYPOTHESIS:0,NO_ADDITIONAL_NAMED_ARTICLE_PROVEN:0};
 for(let i=0;i<7;i++){
  const x=d.hypotheses[i],p=pmsvB14Data.cases.find(y=>y.catalog_id===x?.catalog_id);
  if(!x||!p||named.has(x.catalog_id)||prior.has(x.catalog_id)||
   !x.id||!x.contaminant||!x.named_article||!x.positive_article_evidence||
   x.gates?.length!==4||x.published?.length<1||x.ctr_pdf_page_zero_based<0||
   x.ctr_pdf_page_zero_based>15||!/^https:\/\/(?:www\.)?fssai\.gov\.in\//.test(x.fssr)||
   !x.legal_risk)return false;
  for(const v of x.published){
   if(!Number.isFinite(v.value)||v.value<=0||!["mg/kg","µg/kg"].includes(v.unit)||
    !v.sample_basis||!v.analyte)return false;
  }
  proofs+=x.gates.length;named.set(x.catalog_id,x);
 }
 for(let i=0;i<35;i++){
  const x=d.cases[i],b=pmsvB14Data.cases[i],q=pmsv35Queue.review_records[i],
        l=live.get(x?.catalog_id),r=named.get(x?.catalog_id),priorRoute=prior.get(x?.catalog_id);
  if(!x||!b||!q||!l||ids.has(x.catalog_id)||x.rank!==i+1||
   x.catalog_id!==b.catalog_id||x.catalog_id!==q.catalog_id||
   x.product_name!==b.product_name||String(x.fssr||"")!==String(q.fssr||"")||
   String(x.fcs||"")!==String(q.fcs||"")||
   x.prior_source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   l.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   x.route_state!==(priorRoute?"PRIOR_NAMED_CONDITIONAL":r?"NEW_RESEARCH_COMMODITY_HYPOTHESIS":"NO_ADDITIONAL_NAMED_ARTICLE_PROVEN")||
   x.existing_prior_route_id!==(priorRoute?.route_id||null)||
   x.new_hypothesis_id!==(r?.id||null)||
   x.matched_legal_commodity_article_unconditionally!==false||
   x.numeric_finished_limit_assigned!==false||x.lot_pass!==false||
   x.full_compliance_approved!==false)return false;
  ids.add(x.catalog_id);counts[x.route_state]++;
 }
 return ids.size===35&&named.size===7&&prior.size===3&&proofs===28&&
 counts.PRIOR_NAMED_CONDITIONAL===3&&counts.NEW_RESEARCH_COMMODITY_HYPOTHESIS===7&&
 counts.NO_ADDITIONAL_NAMED_ARTICLE_PROVEN===25;
}
function pmsvB16Html(p){
 if(!p||!pmsv35Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvB16Valid())return '<div class="notice">Batch 16 research article panel unavailable. Source still pending.</div>';
 const route=pmsvB16Data.hypotheses.find(x=>x.catalog_id===p.id);
 if(!route)return "";
 const known=pmsvB14Data.cases.find(x=>x.catalog_id===p.id);
 if(!known||known.product_name!==p.name||
 String(known.fssr||"")!==String(p.fssr||"")||
 String(known.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Finished product identity mismatch: no named article applied.</div>';
 const e=pmsvB14Esc;
 return '<details class="card" style="margin-top:12px">'+
 '<summary><b>Batch 16 · newly researched specific CTR article</b> — unverified category match</summary>'+
 '<div class="notice"><b>FIRST EXACT SOURCE STILL PENDING.</b> The named regulatory commodity and reference value below are NOT activated for this product. Documentary and legal proof is required.</div>'+
 '<p><b>Positive official evidence:</b> '+e(route.positive_article_evidence)+'</p>'+
 '<p><b>Named CTR article to adjudicate:</b> '+e(route.named_article)+' · '+e(route.contaminant)+'</p>'+
 '<div class="tablewrap"><table><thead><tr><th>Contaminant</th><th>Published reference only</th><th>Basis not yet proven</th></tr></thead><tbody>'+
 route.published.map(row=>'<tr><td>'+e(row.analyte)+'</td><td>'+e(row.value)+' '+e(row.unit)+'</td><td>'+e(row.sample_basis)+'</td></tr>').join("")+
 '</tbody></table></div>'+
 '<p><b>Scope conflict:</b> '+e(route.legal_risk)+'</p>'+
 '<p><b>Four decisive verification conditions:</b></p><ol>'+
 route.gates.map(x=>'<li>'+e(x)+'</li>').join("")+'</ol>'+
 '<small><a href="'+e(route.fssr)+'" target="_blank" rel="noopener noreferrer">Official product-standard definition</a> · '+
 '<a href="'+e(pmsvB16Ctr)+'" target="_blank" rel="noopener noreferrer">CTR IX, PDF page '+(route.ctr_pdf_page_zero_based+1)+'</a>. No FSSAI PASS or lab result.</small></details>';
}
function pmsvB16MatrixHtml(){
 if(!pmsvB16Valid())return "";
 const e=pmsvB14Esc,claimed=new Set(pmsvB16Data.hypotheses.map(x=>x.catalog_id));
 return '<details class="card" id="pmsv-b16-source-matrix" style="margin-bottom:12px">'+
 '<summary><b>Batch 16 · named article source-decision matrix</b> — 35 pending, 7 new hypotheses</summary>'+
 '<div class="notice"><b>No source matches promoted.</b> Three earlier candidates remain conditional, seven further legal commodity comparisons require written proof, and 25 have no additional named article established. Every case stays FIRST EXACT SOURCE PENDING.</div>'+
 '<p><b>7 newly researched articles:</b> '+pmsvB16Data.hypotheses.map(x=>e(pmsvB14Data.cases.find(c=>c.catalog_id===x.catalog_id)?.product_name||x.catalog_id)).join("; ")+'</p>'+
 '<div class="tablewrap"><table><thead><tr><th>Pending food</th><th>Article research status</th><th>What is needed next</th></tr></thead><tbody>'+
 pmsvB16Data.cases.map(x=>'<tr><td>'+e(x.product_name)+'</td><td>'+e(x.route_state.replaceAll("_"," "))+'</td><td>'+e(x.recommended_next_action)+'</td></tr>').join("")+
 '</tbody></table></div>'+
 '<small><a href="'+e(pmsvB16Ctr)+'" target="_blank" rel="noopener noreferrer">FSSAI operative Contaminants, Toxins and Residues Version IX</a> · The 01.12.2026 future amendment has not been imported into this source review.</small></details>';
}
function pmsvB16EnsureMatrix(){
 if(typeof document==="undefined"||!pmsvB16Valid())return;
 const target=document.getElementById("selectedProductStandardContent");
 if(target&&!document.getElementById("pmsv-b16-source-matrix"))
  target.insertAdjacentHTML("beforebegin",pmsvB16MatrixHtml());
}
const pmsvB16PriorLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB16PriorLoad();pmsvB16Data=null;
 try{
  const res=await fetch(pmsvB16Path+"?v=20261013-b16",{cache:"reload"});
  if(!res.ok)throw Error("Batch16 official-source candidate data missing");
  pmsvB16Data=await res.json();
  if(!pmsvB16Valid())throw Error("Batch16 35-product first-source integrity check failed");
  pmsvB16EnsureMatrix();
 }catch(_){pmsvB16Data=null;}
};
const pmsvB16PriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 return pmsvB16Html(p)+pmsvB16PriorHtml(p);
};
