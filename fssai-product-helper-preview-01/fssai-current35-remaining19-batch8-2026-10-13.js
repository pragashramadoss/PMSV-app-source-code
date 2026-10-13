"use strict";
/* B8: Source-only identity review for the remaining 19 out of the 35 pending
 * named CTR article cases. These 19 are not new legal approvals.
 */
var pmsvB8Data=null;
const pmsvB8DataUrl="./data/rules/fssai-remaining19-product-identity-gates-batch8-2026-10-13.json";
const pmsvB8DigestExpected="3353d07d93f2f9a2";
const pmsvB8CTR="https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf";
function pmsvB8Digest(o){
 const s=JSON.stringify(o);let a=0x811c9dc5,b=0x9747b28c;
 for(let i=0;i<s.length;i++){let v=s.charCodeAt(i);a=Math.imul(a^v,16777619);b=Math.imul(b^v,2246822519)}
 return(a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function pmsvB8Valid(){
 if(typeof pmsvB7Valid!=="function"||!pmsvB7Valid()||
   !pmsvB8Data||!pmsvB7Data||!pmsvB5Data||!pmsv498Ledger||!pmsv35Queue)return false;
 const d=pmsvB8Data;
 if(pmsvB8Digest(d)!==pmsvB8DigestExpected||
   d.schema_version!=="1.0"||d.kind!=="PMSV_CURRENT35_REMAINING19_PRODUCT_IDENTITY_BATCH8"||
   d.baseline?.catalogue!==533||d.baseline?.partial_first_source!==498||
   d.baseline?.first_source_pending!==35||
   d.cases_count!==19||d.by_evidence_class?.EXACT_FSSR_DEFINED!==9||
   d.by_evidence_class?.FOSCOS_CATEGORY_ONLY!==10||
   d.ctr_primary_source!==pmsvB8CTR||
   d.original_ledger_modified!==false||d.source_promotions!==0||
   d.finished_limits_activated!==0||d.lab_passes!==0||
   d.product_compliance_approvals!==0||d.cases?.length!==19||
   pmsv498Ledger.first_source_pending!==35||pmsv35Queue.review_records?.length!==35)return false;
 const prior=new Set(pmsvB7Data.cases.map(x=>x.catalog_id)),
    map=new Map(pmsv35Queue.review_records.map(x=>[x.catalog_id,x])),
    live=new Map(pmsv498Ledger.records.map(x=>[x.catalog_id,x])),
    allowed={EXACT_FSSR_DEFINED:0,FOSCOS_CATEGORY_ONLY:0},
    seen=new Set();
 for(let i=0;i<19;i++){
  const x=d.cases[i],q=map.get(x?.catalog_id),l=live.get(x?.catalog_id),
    original=pmsvB5Data.cases.find(z=>z.catalog_id===x?.catalog_id);
  if(!x||!q||!l||!original||prior.has(x.catalog_id)||seen.has(x.catalog_id)||
    x.rank!==i+1||x.product_name!==q.product_name||
    x.primary_blocker!==original.primary_blocker||
    !Object.hasOwn(allowed,x.identity_evidence_tier)||
    !x.source_clause||!x.source_positive_finding||
    !x.excluded_unproved_source_transfer||!x.decisive_next_proof||
    !/^https:\/\/(?:[a-z0-9-]+\.)?fssai\.gov\.in\//i.test(x.official_identity_source||"")||
    x.regulatory_contaminant_source!==pmsvB8CTR||
    x.current_first_source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    l.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    x.legal_named_CTR_source_proven!==false||
    x.actual_finished_product_verified!==false||
    x.analytical_processing_basis_verified!==false||
    x.numeric_limit_assigned!==false||x.lot_lab_pass!==false||
    x.product_compliance_pass!==false||
    (x.identity_evidence_tier==="EXACT_FSSR_DEFINED"?!Number.isInteger(x.identity_pdf_page_zero_based):x.identity_pdf_page_zero_based!==null))return false;
  allowed[x.identity_evidence_tier]++;seen.add(x.catalog_id);
 }
 return seen.size===19&&Object.keys(allowed).every(k=>allowed[k]===d.by_evidence_class[k])&&
    new Set([...seen,...prior]).size===35;
}
const pmsvB8OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvB8OldLoad();pmsvB8Data=null;
 try{
  const res=await fetch(pmsvB8DataUrl+"?v=20261013-batch8",{cache:"reload"});
  if(!res.ok)throw Error("Missing remaining 19 source identity review");
  pmsvB8Data=await res.json();
  if(!pmsvB8Valid())throw Error("Current 35 product IDs do not match signed source data");
 }catch(_){pmsvB8Data=null}
};
function pmsvB8Html(p){
 if(!p)return "";
 const pending=pmsv35Queue?.review_records?.some(r=>r.catalog_id===p.id);
 if(!pending)return "";
 if(!pmsvB8Valid())return '<div class="notice">Current identity-source research unavailable; source status remains pending.</div>';
 const x=pmsvB8Data.cases.find(r=>r.catalog_id===p.id);
 if(!x)return "";
 const original=pmsv35Queue.review_records.find(r=>r.catalog_id===p.id);
 if(p.name!==x.product_name||String(p.fssr||"")!==String(original.fssr||"")||
   String(p.fcs||"")!==String(original.fcs||""))
   return '<div class="notice">Source identity mismatch. No compliance approval or CTR limit.</div>';
 const e=v=>String(v??"").replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[z]));
 const statutory=x.identity_evidence_tier==="EXACT_FSSR_DEFINED";
 return '<details class="card" style="margin-top:12px" open>'+
   '<summary><b>Batch 8 · exact identity proof</b> — '+(statutory?"Specific FSSR standard":"FoSCoS category only")+'</summary>'+
   '<div class="notice"><b>FIRST EXACT NAMED CTR ARTICLE STILL PENDING.</b> Identity evidence does not prove legal contaminant scope. No numerical limit, lot laboratory pass or product compliance approval.</div>'+
   '<p><b>Positive official-source finding:</b> '+e(x.source_positive_finding)+'</p>'+
   '<p><b>Do not transfer:</b> '+e(x.excluded_unproved_source_transfer)+'</p>'+
   '<p><b>Decisive original evidence required:</b> '+e(x.decisive_next_proof)+'</p>'+
   '<p><b>Source identity classification:</b> '+e(x.source_clause)+
   (statutory?" · FSSR standard":" · product-catalogue entry, not a single chemical standard")+'</p>'+
   '<small><a target="_blank" rel="noopener noreferrer" href="'+e(x.official_identity_source)+'">Official FSSAI / FoSCoS identity</a> · '+
   '<a target="_blank" rel="noopener noreferrer" href="'+e(x.regulatory_contaminant_source)+'">Official CTR Version IX</a></small>'+
   '</details>';
}
const pmsvB8Prior=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsvB8Html(p)+pmsvB8Prior(p)};
