"use strict";
/* 16 source-identity exclusions within the current 35 FIRST_EXACT_SOURCE_PENDING.
 * 2 direct statutory contradictions, 13 distinct finished forms, 1 definition-only.
 * NO promotion, numeric assignment, lab pass or regulatory compliance approval.
 */
var pmsvB7Data=null;
const pmsvB7Path="./data/rules/fssai-current35-fssr-vs-ctr-exclusion-batch7-2026-10-13.json";
const pmsvB7DigestExpected="48f5dd17509b807c";
const pmsvB7CTR="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
function pmsvB7Digest(o){
 const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){const v=s.charCodeAt(i);a=Math.imul(a^v,16777619);b=Math.imul(b^v,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function pmsvB7Valid(){
 if(typeof pmsvB6Valid!=="function"||!pmsvB6Valid()||
   !pmsvB7Data||!pmsvB6Evidence||!pmsv35Queue||!pmsv498Ledger)return false;
 const d=pmsvB7Data;
 if(pmsvB7Digest(d)!==pmsvB7DigestExpected||
   d.schema_version!=="1.0"||d.kind!=="FSSAI_CURRENT35_SUBTYPE_EXCLUSION_GATES_BATCH7"||
   d.base_ledger?.catalogue!==533||d.base_ledger?.partial_exact!==498||
   d.base_ledger?.pending!==35||d.total_cases!==16||
   d.classification_totals?.DIRECT_CONTRADICTION!==2||
   d.classification_totals?.DISTINCT_MARKETED_FORM!==13||
   d.classification_totals?.DEFINITION_ONLY_NO_CANDIDATE!==1||
   d.later_amendment_effective!=="2026-12-01"||
   d.current_ctr_source!==pmsvB7CTR||
   d.source_matches_promoted!==0||d.full_contaminant_panels_confirmed!==0||
   d.laboratory_results_confirmed!==0||d.compliance_approvals!==0||
   d.mutated_533_ledger!==false||d.cases?.length!==16||
   pmsv498Ledger.first_source_pending!==35||pmsv35Queue.review_records?.length!==35)return false;
 const named=new Set(pmsvB6Evidence.named_article_rows.map(r=>r.key)),
   queued=new Map(pmsv35Queue.review_records.map(x=>[x.catalog_id,x])),
   source=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x])),
   seen=new Set(),cnt={DIRECT_CONTRADICTION:0,DISTINCT_MARKETED_FORM:0,DEFINITION_ONLY_NO_CANDIDATE:0};
 for(const x of d.cases){
   const q=queued.get(x?.catalog_id),l=source.get(x?.catalog_id);
   if(!x||!q||!l||seen.has(x.catalog_id)||
     x.product_name!==q.product_name||x.source_status_after_review!=="FIRST_EXACT_SOURCE_PENDING"||
     l.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
     !Object.hasOwn(cnt,x.classification)||
     !x.official_fssr_clause||!x.identity_evidence||!x.excluded_auto_transfer_reason||
     !x.remaining_positive_evidence||
     !Number.isInteger(x.official_fssr_pdf_page_zero_based)||
     x.official_fssr_pdf_page_zero_based<0||
     !/^https:\/\/(?:[a-z0-9-]+\.)?fssai\.gov\.in\//i.test(x.official_fssr_pdf||"")||
     x.official_ctr_pdf!==pmsvB7CTR||
     !Array.isArray(x.excluded_direct_transfer_article_keys)||
     x.excluded_direct_transfer_article_keys.some(k=>!named.has(k))||
     x.raw_ingredient_limit_automatically_applied!==false||
     x.numeric_limit_assigned!==false||x.finished_lot_lab_pass!==false||
     x.regulatory_compliance_approved!==false)return false;
   if(x.classification==="DIRECT_CONTRADICTION"&&
     !["purified-vending-water","11-11-1-dried-glucose-syrup"].includes(x.catalog_id))return false;
   cnt[x.classification]++;seen.add(x.catalog_id);
 }
 return seen.size===16&&Object.keys(cnt).every(k=>cnt[k]===d.classification_totals[k]);
}
const pmsvB7OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
  await pmsvB7OldLoad();pmsvB7Data=null;
  try{
    const r=await fetch(pmsvB7Path+"?v=20261013-batch7",{cache:"reload"});
    if(!r.ok)throw Error("FSSAI direct article exclusions unavailable");
    pmsvB7Data=await r.json();
    if(!pmsvB7Valid())throw Error("Current-source subtype gate failed");
  }catch(_){pmsvB7Data=null}
};
function pmsvB7Html(p){
  if(!p||!pmsvB7Valid())return "";
  const x=pmsvB7Data.cases.find(z=>z.catalog_id===p.id);
  if(!x)return "";
  const q=pmsv35Queue.review_records.find(z=>z.catalog_id===p.id);
  if(!q||p.name!==q.product_name||
    String(p.fssr||"")!==String(q.fssr||"")||
    String(p.fcs||"")!==String(q.fcs||""))
    return '<div class="notice">Source-product identity mismatch. No contaminant article applied.</div>';
  const e=v=>String(v??"").replace(/[&<>"']/g,z=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[z]);
  const hard=x.classification==="DIRECT_CONTRADICTION",
   title=hard?"Direct statutory mismatch: proposed CTR article excluded":
     x.classification==="DISTINCT_MARKETED_FORM"?"Distinct finished-product identity: no automatic source transfer":
     "Separate FSSR definition: no named CTR candidate verified";
  return '<details class="card" style="margin-top:12px" open>'+
    '<summary><b>Batch 7 · FSSR versus CTR applicability</b> — '+e(title)+'</summary>'+
    '<div class="notice"><b>FIRST EXACT CTR SOURCE STILL PENDING.</b> This negative evidence blocks an unsupported article transfer, not food compliance. Other CTR provisions still require review.</div>'+
    '<p><b>Finished-food identity evidence:</b> '+e(x.identity_evidence)+'</p>'+
    '<p><b>Article transfer restriction:</b> '+e(x.excluded_auto_transfer_reason)+'</p>'+
    '<p><b>Required next proof:</b> '+e(x.remaining_positive_evidence)+'</p>'+
    '<small><a href="'+e(x.official_fssr_pdf)+'" target="_blank" rel="noopener noreferrer">Official FSSR '+e(x.official_fssr_clause)+'</a> · '+
    '<a href="'+e(x.official_ctr_pdf)+'" target="_blank" rel="noopener noreferrer">Official CTR IX</a>. '+
    'Published but future CTR amendment starts 01.12.2026.</small></details>';
}
const pmsvB7Prior=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB7Html(p)+pmsvB7Prior(p)};
