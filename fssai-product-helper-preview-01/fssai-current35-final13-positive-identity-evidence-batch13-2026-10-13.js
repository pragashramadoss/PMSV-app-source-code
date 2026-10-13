"use strict";
/* PMSV Batch 13: remaining 13 exact source-pending identities x 5 documentary gates.
 * No legal article approvals or numeric contaminant limits are assigned. */
var pmsvB13Data=null;
const pmsvB13Path="./data/rules/fssai-current35-final13-positive-identity-evidence-batch13-2026-10-13.json";
const pmsvB13Expected="2bdd481bb263fdf8";
function pmsvB13Digest(obj){
 const s=JSON.stringify(obj);let x=0x811c9dc5,y=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);x=Math.imul(x^z,16777619);y=Math.imul(y^z,2246822519)}
 return(x>>>0).toString(16).padStart(8,"0")+(y>>>0).toString(16).padStart(8,"0");
}
function pmsvB13Valid(){
 if(typeof pmsvB12Valid!=="function"||!pmsvB12Valid()||!pmsvB13Data||!pmsvB12Data||!pmsv35Queue||!pmsv498Ledger)return false;
 const d=pmsvB13Data,q=pmsv35Queue.review_records,l=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x]));
 if(pmsvB13Digest(d)!==pmsvB13Expected||d.kind!=="PMSV_CURRENT35_FINAL13_POSITIVE_IDENTITY_DOCUMENTARY_GATES_BATCH13"||
 d.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||d.legal_basis!=="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf"||
 d.prior_completed_batch12_cases!==22||d.pending_case_count!==13||d.evidence_gates!==65||
 d.catalogue!==533||d.conditional_first_source!==498||d.first_source_pending!==35||
 d.identity_tiers?.EXACT_FSSR_STANDARD!==4||d.identity_tiers?.FOSCOS_CATEGORY_GROUP!==7||
 d.identity_tiers?.OFFICIAL_AYURVEDA_RECIPE!==2||d.cases?.length!==13||
 d.future_rule_effective_date!=="2026-12-01"||d.future_rule_auto_applied!==false||
 d.results?.new_source_promotions!==0||d.results?.new_applied_finished_numeric_limits!==0||
 d.results?.new_verified_lot_results!==0||d.results?.new_regulatory_approvals!==0||
 d.results?.prior_ledger_mutated!==false||d.results?.wordpress_production_modified!==false||
 pmsv498Ledger.first_source_pending!==35||q?.length!==35)return false;
 const covered=new Set(pmsvB12Data.cases.map(x=>x.catalog_id)),out=new Set(),all=new Map(q.map(x=>[x.catalog_id,x]));let n=0;
 for(let i=0;i<13;i++){
  const x=d.cases[i],r=all.get(x?.catalog_id),live=l.get(x?.catalog_id);
  if(!x||!r||!live||covered.has(x.catalog_id)||out.has(x.catalog_id)||x.rank!==i+1||
  x.product_name!==r.product_name||String(x.fssr||"")!==String(r.fssr||"")||
  String(x.fcs||"")!==String(r.fcs||"")||live.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
  x.status!=="FIRST_EXACT_SOURCE_PENDING"||!x.positive_official_identity_finding||
  x.current_CTR_source!==d.legal_basis||!x.official_source_url||
  !["EXACT_FSSR_STANDARD","FOSCOS_CATEGORY_GROUP","OFFICIAL_AYURVEDA_RECIPE"].includes(x.source_tier)||
  x.documentary_evidence_gates?.length!==5||!x.blocking_legal_scope||!x.forbidden_source_transfer||
  x.first_exact_named_CTR_source_verified!==false||x.finished_food_numeric_limit_applied!==false||
  x.verified_lot_lab_result!==false||x.complete_food_compliance_pass!==false)return false;
  out.add(x.catalog_id);
  for(let g=0;g<5;g++){
   const e=x.documentary_evidence_gates[g];
   if(e?.gate!==g+1||!e.question||e.received!==false||e.officially_verified!==false)return false;n++;
  }
 }
 return covered.size===22&&out.size===13&&new Set([...covered,...out]).size===35&&n===65;
}
const pmsvB13OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB13OldLoad();pmsvB13Data=null;
 try{
  const response=await fetch(pmsvB13Path+"?v=20261013-b13",{cache:"reload"});
  if(!response.ok)throw Error("Missing remaining 13 exact-identity evidence");
  pmsvB13Data=await response.json();
  if(!pmsvB13Valid())throw Error("Remaining-13 evidence chain integrity guard failed");
 }catch(_){pmsvB13Data=null}
};
function pmsvB13Html(p){
 if(!p||!pmsv35Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvB13Valid())
  return '<div class="notice">Batch 13 official evidence unavailable. First exact legal source is still pending.</div>';
 const x=pmsvB13Data.cases.find(z=>z.catalog_id===p.id);
 if(!x)return "";
 if(x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
    String(x.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Product identity mismatch. No contaminant limit or legal PASS.</div>';
 const e=v=>String(v??"").replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;":"&quot;","'":"&#39;"}[z]));
 return '<details class="card" style="margin-top:12px">'+
 '<summary><b>Batch 13 · final 13 positive identity evidence</b> — '+e(x.source_tier.replace(/_/g," ").toLowerCase())+'</summary>'+
 '<div class="notice"><b>Exact CTR source still pending.</b> Official product identity is not a legal contaminant limit, laboratory result or finished-lot PASS.</div>'+
 '<p><b>Official source finding:</b> '+e(x.positive_official_identity_finding)+'</p>'+
 '<p><b>First legal article blocker:</b> '+e(x.blocking_legal_scope)+'</p>'+
 '<p><b>No-transfer condition:</b> '+e(x.forbidden_source_transfer)+'</p>'+
 '<p><b>Five case-specific evidence gates:</b></p><ol>'+x.documentary_evidence_gates.map(g=>'<li>'+e(g.question)+'</li>').join("")+'</ol>'+
 '<small><a href="'+e(x.official_source_url)+'" target="_blank" rel="noopener noreferrer">Official FSSAI/FoSCoS identity source'+(Number.isInteger(x.official_pdf_page_zero_based)?' · PDF p.'+(x.official_pdf_page_zero_based+1):'')+'</a> · <a href="'+e(x.current_CTR_source)+'" target="_blank" rel="noopener noreferrer">CTR Version IX</a>.</small></details>';
}
const pmsvB13PriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB13Html(p)+pmsvB13PriorHtml(p)};
