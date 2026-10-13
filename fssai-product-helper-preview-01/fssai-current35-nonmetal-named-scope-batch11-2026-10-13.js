"use strict";
/* Batch 11: 35 pending named-article cases x 8 nonmetal source scopes = 280
   evidence-gated screens. All are REVIEW-ONLY; no finished-product thresholds. */
var pmsvB11Data=null;
const pmsvB11Path="./data/rules/fssai-current35-nonmetal-named-scope-batch11-2026-10-13.json";
const pmsvB11DigestFixed="94819a77e5e10546";
const pmsvB11IDs=["AF_TOTAL","AF_B1","AF_M1","OCHRATOXIN_A","PATULIN","DON","AGARIC_ACID","HYDROCYANIC_ACID"];
function pmsvB11Digest(o){
 const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const z=s.charCodeAt(i);a=Math.imul(a^z,16777619);b=Math.imul(b^z,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function pmsvB11Valid(){
 if(typeof pmsvB10Valid!=="function"||!pmsvB10Valid()||
 !pmsvB11Data||!pmsv35Queue||!pmsv498Ledger)return false;
 const d=pmsvB11Data;
 if(pmsvB11Digest(d)!==pmsvB11DigestFixed||
 d.kind!=="PMSV_CURRENT35_NONMETAL_CTR_NAMED_SCOPE_REVIEW_BATCH11"||
 d.schema_version!=="1.0"||
 d.official_ctr_source!=="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf"||
 d.baseline?.catalogue!==533||d.baseline?.conditional_first_source_matches!==498||
 d.baseline?.first_exact_source_pending!==35||
 d.future_amendment_effective_on!=="2026-12-01"||d.future_amendment_auto_applied!==false||
 d.rule_count!==8||d.product_count!==35||d.scope_reviews!==280||
 d.source_rows?.length!==8||d.cases?.length!==35||
 d.summary?.new_named_article_source_promotions!==0||
 d.summary?.applied_finished_product_contaminant_limits!==0||
 d.summary?.verified_laboratory_results!==0||
 d.summary?.full_regulatory_approvals!==0||
 d.summary?.canonical_ledger_modified!==false||
 d.summary?.wordpress_modified!==false)return false;
 const ledger=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x]));
 let found=new Set(),total=0;
 for(let i=0;i<35;i++){
  const q=pmsv35Queue.review_records[i],x=d.cases[i],live=ledger.get(x?.catalog_id);
  if(!q||!x||!live||found.has(x.catalog_id)||x.rank!==i+1||
  x.catalog_id!==q.catalog_id||x.product_name!==q.product_name||
  String(x.fssr||"")!==String(q.fssr||"")||String(x.fcs||"")!==String(q.fcs||"")||
  live.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
  x.source_state!=="FIRST_EXACT_SOURCE_PENDING"||
  x.review_checks?.length!==8||x.verified_finished_article!==false||
  x.compliance_approved!==false)return false;
  found.add(x.catalog_id);
  for(let j=0;j<8;j++){
   const z=x.review_checks[j],r=d.source_rows[j];
   if(z?.row!==pmsvB11IDs[j]||r?.id!==z.row||
     !z.gate||!z.evidence_question||
     r.official_source!==d.official_ctr_source||
     r.finished_article_application_approved!==false||
     z.finished_product_article_match_verified!==false||
     z.lot_analytical_pass!==false||z.numeric_limit_applied!==false)return false;
   total++;
  }
 }
 return total===280&&found.size===35&&pmsv498Ledger.first_source_pending===35;
}
const pmsvB11OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB11OldLoad();pmsvB11Data=null;
 try{
  const r=await fetch(pmsvB11Path+"?v=20261013-b11",{cache:"reload"});
  if(!r.ok)throw Error("Missing nonmetal named-scope review");
  pmsvB11Data=await r.json();
  if(!pmsvB11Valid())throw Error("35-product CTR nonmetal scope guard failed");
 }catch(_){pmsvB11Data=null}
};
function pmsvB11Html(p){
 if(!p||!pmsv35Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvB11Valid())return '<div class="notice">Nonmetal source-review evidence unavailable. First exact source remains pending.</div>';
 const x=pmsvB11Data.cases.find(v=>v.catalog_id===p.id);
 if(!x||p.name!==x.product_name||String(p.fssr||"")!==String(x.fssr||"")||
  String(p.fcs||"")!==String(x.fcs||""))
  return '<div class="notice">Identity mismatch. No source or limit transferred.</div>';
 const esc=v=>String(v??"").replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[z]));
 return '<details class="card" style="margin-top:12px">'+
  '<summary><b>Batch 11 · nonmetal source specificity</b> — eight official CTR article families (review only)</summary>'+
  '<div class="notice"><b>First exact source remains pending.</b> These are NOT applied limits, sample results, or legal approvals. Only the named FSSAI article and actual finished recipe/form can establish applicability.</div>'+
  '<div class="tablewrap"><table><thead><tr><th>Contaminant</th><th>Exact source scope</th><th>Case-specific evidence needed</th></tr></thead><tbody>'+
  x.review_checks.map(c=>{const r=pmsvB11Data.source_rows.find(v=>v.id===c.row);
   return '<tr><td>'+esc(r.name)+'</td><td>'+esc(r.scope)+'</td><td><b>'+esc(c.gate.replace(/_/g," "))+'</b>: '+esc(c.evidence_question)+'</td></tr>';
  }).join("")+'</tbody></table></div>'+
  '<p><b>Additional no-transfer rule:</b> '+esc(x.prohibition_on_transfer)+'</p>'+
  '<small><a href="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf" target="_blank" rel="noopener noreferrer">Official FSSAI CTR IX, PDF pages 14–15</a> · 01.12.2026 amendment not yet effective.</small></details>';
}
const pmsvB11PriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB11Html(p)+pmsvB11PriorHtml(p)};
