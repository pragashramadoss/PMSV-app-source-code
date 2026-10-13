"use strict";
var pmsv40ClosureIntake=null;
const pmsv40ClosureIntakeDigest="a713258fd3fc32e4";
function pmsv40ClosureIntakeValid(){
 if(typeof pmsv493Valid!=="function"||!pmsv493Valid()||
 typeof pmsv40DecisiveReviewValid!=="function"||!pmsv40DecisiveReviewValid()||
 typeof pmsvReviewSnapshotDigest!=="function"||
 !pmsv40ClosureIntake||!pmsv40Queue||!pmsv493Ledger||
 pmsvReviewSnapshotDigest(pmsv40ClosureIntake)!==pmsv40ClosureIntakeDigest)return false;
 const d=pmsv40ClosureIntake;
 if(d.schema_version!=="1.0"||d.purpose!=="40_PENDING_DOCUMENTARY_EVIDENCE_INTAKE_NOT_REGULATORY_APPROVAL"||
 d.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
 d.catalogue!==533||d.partial_named_source_routes!==493||
 d.pending_exact_named_article_routes!==40||d.products_with_intake!==40||
 d.minimum_document_requests!==160||d.first_source_promotions!==0||
 d.lab_passes!==0||d.regulatory_approvals!==0||d.word_press_deployed!==false||
 d.intake_records?.length!==40||pmsv40Queue.review_records?.length!==40||
 pmsv493Ledger.records?.length!==533||pmsv493Ledger.first_source_pending!==40)return false;
 const q=new Map(pmsv40Queue.review_records.map(x=>[x.catalog_id,x])),
 l=new Map(pmsv493Ledger.records.map(x=>[x.catalog_id,x])),seen=new Set();
 for(const x of d.intake_records){
  const a=q.get(x.catalog_id),b=l.get(x.catalog_id);
  if(!a||!b||seen.has(x.catalog_id)||x.product_name!==a.product_name||
   x.product_name!==b.product_name||String(x.fssr||"")!==String(a.fssr||"")||
   String(x.fcs||"")!==String(a.fcs||"")||
   b.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   x.evidence_documents?.length!==4||!x.evidence_documents.every(y=>typeof y==="string"&&y.length>15)||
   !x.document_owner_role||!x.positive_source_question||
   x.current_first_named_ctr_status!=="FIRST_EXACT_SOURCE_PENDING"||
   x.evidence_received!==false||x.legal_applicability_determined!==false||
   x.numeric_ctr_limit_assigned!==false||x.laboratory_result_verified!==false||
   x.regulatory_pass!==false||!x.close_only_if||
   !Object.values(x.close_only_if).every(y=>y===true))return false;
  seen.add(x.catalog_id);
 }
 return seen.size===40;
}
var pmsvBefore40ClosureIntakeLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore40ClosureIntakeLoad();pmsv40ClosureIntake=null;
 try{
  const res=await fetch("./data/rules/fssai-current40-evidence-intake-2026-10-13.json?v=20261013-intake40",{cache:"reload"});
  if(!res.ok)throw Error("Missing source intake");
  pmsv40ClosureIntake=await res.json();
  if(!pmsv40ClosureIntakeValid())throw Error("Source intake mismatch");
 }catch(_){pmsv40ClosureIntake=null;}
};
function pmsv40ClosureIntakeHtml(p){
 if(!p||!pmsv40Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsv40ClosureIntakeValid())return '<div class="notice">Closure evidence checklist unavailable. No product approval.</div>';
 const x=pmsv40ClosureIntake.intake_records.find(t=>t.catalog_id===p.id);
 if(!x||x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
 String(x.fcs||"")!==String(p.fcs||""))return '<div class="notice">Evidence identity mismatch.</div>';
 const e=v=>String(v).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",[String.fromCharCode(34)]:"&quot;",[String.fromCharCode(39)]:"&#39;"}[z]));
 return '<details class="card" style="margin-top:12px"><summary><b>Required evidence to close this unresolved case</b></summary>'+
 '<div class="notice"><b>OPEN — no finished-product legal applicability demonstrated.</b> This is a documentary request, not an exemption or lot PASS.</div>'+
 '<p><b>Evidence owner:</b> '+e(x.document_owner_role.replaceAll("_"," "))+'</p>'+
 '<ol>'+x.evidence_documents.map(s=>'<li>'+e(s)+'</li>').join("")+'</ol>'+
 '<p><b>Decisive question:</b> '+e(x.positive_source_question)+'</p>'+
 '<p><b>Closure gate:</b> signed current source applicability, actual marketed form, correct test basis; retain pending until independently verified.</p>'+
 '<small><a href="'+e(pmsv40ClosureIntake.ctr_url)+'" target="_blank" rel="noopener noreferrer">Official FSSAI CTR IX source</a></small></details>';
}
var pmsvBefore40ClosureIntakeHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){return pmsv40ClosureIntakeHtml(p)+pmsvBefore40ClosureIntakeHtml(p)};
