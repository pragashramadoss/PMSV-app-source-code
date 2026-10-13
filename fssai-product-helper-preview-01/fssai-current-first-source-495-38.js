"use strict";
/* Effective 495/38 source-level-only ledger. Archived 493/40 remains immutable.
 * No lot result, numeric limit auto-application, or legal product approval. */
var pmsv495Manifest=null,pmsv495Ledger=null,pmsv38Queue=null;
const pmsv495FixedHashes=Object.freeze({"manifest":"b99f7591d698c0b4","ledger":"814eb03c9d3c847b","queue":"791a96f47bfc7ad9"});
const pmsv495ExactRows=Object.freeze({"06-06-1-quinoa":{"name":"Quinoa","family":"STANDARDIZED_CEREAL_CHAPTER_QUINOA_CONDITIONAL_AFLATOXIN","fssr":"2.4.6","fcs":"06.1","values":[["Total Aflatoxins","Cereal and cereal products",15,"µg/kg"],["Aflatoxin B1","Cereal and cereal products",10,"µg/kg"]]},"04-04-2-frozen-vegetables":{"name":"Frozen Vegetables","family":"PLAIN_FROZEN_WHOLE_VEGETABLE_CONDITIONAL_METAL","fssr":"2.3.38","fcs":"04.2.2.1","values":[["Copper","Vegetables",30,"mg/kg"],["Arsenic","Vegetables",1.1,"mg/kg"],["Chromium","Vegetables",1,"mg/kg"],["Nickel","Vegetables",1,"mg/kg"],["Antimony","Vegetables",1,"mg/kg"]]}});
const pmsv495PromotionIds=Object.freeze(["06-06-1-quinoa","04-04-2-frozen-vegetables"]);
function pmsv495Valid(){
 if(typeof pmsv493Valid!=="function"||!pmsv493Valid()||
 typeof pmsvReviewSnapshotDigest!=="function"||
 !pmsv495Manifest||!pmsv495Ledger||!pmsv38Queue||
 pmsvReviewSnapshotDigest(pmsv495Manifest)!==pmsv495FixedHashes.manifest||
 pmsvReviewSnapshotDigest(pmsv495Ledger)!==pmsv495FixedHashes.ledger||
 pmsvReviewSnapshotDigest(pmsv38Queue)!==pmsv495FixedHashes.queue)return false;
 const m=pmsv495Manifest,l=pmsv495Ledger,q=pmsv38Queue,old=pmsv493Ledger,p=pmsv40Queue;
 if(m.schema_version!=="1.0"||m.policy!=="ONLY_OFFICIAL_FSSAI_POSITIVE_FINISHED_CLASS_SOURCE"||
 m.route_count!==2||m.latest?.partial_exact!==495||m.latest?.first_source_pending!==38||
 m.baseline?.partial_exact!==493||m.baseline?.first_source_pending!==40||
 m.actual_market_form_verified!==false||m.auto_limit_application!==false||
 m.actual_lot_lab_passes!==0||m.full_compliance_approvals!==0||
 m.routes?.length!==2||
 l.catalogue!==533||l.partial_exact!==495||l.first_source_pending!==38||
 l.positive_delta_count!==2||l.full_compliance_approvals!==0||
 l.records?.length!==533||
 q.catalogue!==533||q.partial_exact!==495||q.first_source_pending!==38||
 q.review_records?.length!==38||q.promoted_catalog_ids?.length!==78||
 p.review_records?.length!==40||old.records?.length!==533)return false;
 const wanted=new Map(m.routes.map(x=>[x.catalog_id,x])),pending=new Set();
 if(wanted.size!==2||pmsv495PromotionIds.some(x=>!wanted.has(x)))return false;
 for(const x of m.routes){
  const fixed=pmsv495ExactRows[x.catalog_id];
  if(!fixed||x.product_name!==fixed.name||x.source_family!==fixed.family||
   x.fssr!==fixed.fssr||x.fcs!==fixed.fcs||x.source_article_candidates?.length!==fixed.values.length||
   x.source_article_candidates.some((v,i)=>v.contaminant!==fixed.values[i][0]||
    v.article!==fixed.values[i][1]||v.limit!==fixed.values[i][2]||
    v.unit!==fixed.values[i][3]||!v.analytical_basis)||
   x.positive_source_basis?.length!==5||x.negative_transfer_controls?.length!==6||
   !x.official_standard_url?.startsWith("https://www.fssai.gov.in/")||
   x.official_ctr!==m.official_ctr||
   x.physical_marketed_identity_verified!==false||x.recipe_or_ingredient_verified!==false||
   x.legal_scope_fully_adjudicated!==false||x.processing_equivalence_confirmed!==false||
   x.lab_results_verified!==false||x.automatic_limit_application!==false||
   x.complete_compliance_pass!==false)return false;
 }
 let numPartial=0,numPending=0,delta=0;
 for(let i=0;i<533;i++){
  const a=old.records[i],b=l.records[i],x=wanted.get(a?.catalog_id);
  if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
   String(a.fssr||"")!==String(b.fssr||"")||String(a.fcs||"")!==String(b.fcs||"")||
   b.product_compliance_approval!==false||b.sample_lab_pass!==false||
   b.complete_contaminant_panel!==false)return false;
  if(!x){if(JSON.stringify(a)!==JSON.stringify(b))return false;}
  else{
   if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
    b.missing_first_exact_evidence!==false||b.regulatory_source_verified_delta?.evidence_class!==
    "CONDITIONALLY_NAMED_FSSR_CTR_ARTICLE_ONLY"||
    b.regulatory_source_verified_delta.source_family!==x.source_family||
    b.regulatory_source_verified_delta.conditional_named_article!==x.named_qualified_finished_article||
    JSON.stringify(b.regulatory_source_verified_delta.article_source_values)!==
    JSON.stringify(x.source_article_candidates)||
    b.regulatory_source_verified_delta.actual_finished_lot_identity_verified!==false||
    b.regulatory_source_verified_delta.recipe_and_source_ingredient_identity_verified!==false||
    b.regulatory_source_verified_delta.legal_scope_fully_adjudicated!==false||
    b.regulatory_source_verified_delta.processing_equivalence_confirmed!==false||
    b.regulatory_source_verified_delta.numeric_finished_food_limit_auto_applied!==false||
    b.regulatory_source_verified_delta.lab_pass!==false||
    b.regulatory_source_verified_delta.full_compliance_pass!==false)return false;
   delta++;
  }
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")numPartial++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING"){numPending++;pending.add(b.catalog_id);}
  else return false;
 }
 if(delta!==2||numPartial!==495||numPending!==38)return false;
 const oldPending=new Set(p.review_records.map(x=>x.catalog_id)),newPending=new Set();
 for(const x of q.review_records){
  if(!oldPending.has(x.catalog_id)||wanted.has(x.catalog_id)||newPending.has(x.catalog_id)||
   !pending.has(x.catalog_id)||
   JSON.stringify(x)!==JSON.stringify(p.review_records.find(y=>y.catalog_id===x.catalog_id)))return false;
  newPending.add(x.catalog_id);
 }
 if(newPending.size!==38||q.subsequent_promotions!==p.subsequent_promotions+2||
  q.promoted_catalog_ids.some(x=>!p.promoted_catalog_ids.includes(x)&&!wanted.has(x)))return false;
 return true;
}
var pmsv495BeforeLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsv495BeforeLoad();pmsv495Manifest=null;pmsv495Ledger=null;pmsv38Queue=null;
 try{
  const names=["fssai-two-quinoa-frozen-conditional-named-source-2026-10-13.json",
   "fssai-current-first-source-533-live-ledger-495-38-2026-10-13.json",
   "fssai-current-38-first-exact-source-proof-worklist-2026-10-13.json"];
  const rr=await Promise.all(names.map(x=>fetch("./data/rules/"+x+"?v=20261013-49538",{cache:"reload"})));
  if(rr.some(x=>!x.ok))throw Error("New 495/38 source unavailable");
  [pmsv495Manifest,pmsv495Ledger,pmsv38Queue]=await Promise.all(rr.map(x=>x.json()));
  if(!pmsv495Valid())throw Error("New 495/38 source integrity invalid");
 }catch(_){pmsv495Manifest=null;pmsv495Ledger=null;pmsv38Queue=null;}
};
function pmsv495Html(p){
 if(!p)return "";
 if(!pmsv495Valid())return '<div class="notice">Effective 495/38 FSSAI source ledger unavailable. No source limit or PASS.</div>';
 const row=pmsv495Ledger.records.find(x=>x.catalog_id===p.id);
 if(!row||row.product_name!==p.name||String(row.fssr||"")!==String(p.fssr||"")||
 String(row.fcs||"")!==String(p.fcs||""))return '<div class="notice">Latest source identity mismatch. No PASS.</div>';
 const e=v=>String(v).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",[String.fromCharCode(34)]:"&quot;",[String.fromCharCode(39)]:"&#39;"}[z]));
 const x=pmsv495Manifest.routes.find(v=>v.catalog_id===row.catalog_id);
 let body='<details class="card" style="margin-top:12px"><summary><b>Latest source ledger — 495 partial / 38 pending</b> · '+
 (row.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"CONDITIONAL SOURCE":"SOURCE PENDING")+'</summary>'+
 '<div class="notice">533 identities · 495 partial conditional source routes · 38 first-source gaps · NO finished-lot results or compliance PASS.</div>';
 if(x){
  body+='<p><b>New positive conditional source:</b> '+e(x.named_qualified_finished_article)+'</p>'+
  '<p><b>Finished subroute restrictions:</b> '+e(x.finished_subroute_identity)+'</p>'+
  '<p><b>Official documentary basis:</b> '+e(x.primary_official_evidence)+'</p>'+
  '<div class="tablewrap"><table><thead><tr><th>Contaminant</th><th>Named legal article</th><th>Official value — NOT assigned</th></tr></thead><tbody>'+
  x.source_article_candidates.map(t=>'<tr><td>'+e(t.contaminant)+'</td><td>'+e(t.article)+'</td><td>'+e(t.limit)+' '+e(t.unit)+'</td></tr>').join("")+
  '</tbody></table></div><p><b>Still unverified:</b> actual marketed lot, ingredients, process, legally qualified subroute, all other contaminants and testing.</p>'+
  '<p><b>Prohibited transfer:</b> '+x.negative_transfer_controls.map(e).join("; ")+'</p>'+
  '<small><a href="'+e(x.official_standard_url)+'" target="_blank" rel="noopener noreferrer">Official FSSR</a> · '+
  '<a href="'+e(x.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX</a></small>';
 }else if(row.source_status==="FIRST_EXACT_SOURCE_PENDING")
  body+='<p>No verified specific conditional legal source route yet; continue official product-specific evidence collection.</p>';
 else body+='<p>Earlier conditional source route remains partially verified; no complete compliance decision.</p>';
 return body+'</details>';
}
var pmsv495OldHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 if(!p)return "";
 const latest=pmsv495Html(p);
 if(!pmsv495Valid())return latest;
 const x=pmsv495Manifest.routes.find(y=>y.catalog_id===p.id);
 if(!x)return latest+pmsv495OldHtml(p);
 return latest+'<details class="card" style="margin-top:12px"><summary>Archived 493/40 pending-source research (superseded for this conditional subroute)</summary>'+
 pmsv495OldHtml(p)+'</details>';
};
var pmsv495OldPendingChecklist=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(pmsv495Valid()&&pmsv495Manifest.routes.some(x=>x.catalog_id===p?.id))return "";
 return pmsv495OldPendingChecklist(p);
};
