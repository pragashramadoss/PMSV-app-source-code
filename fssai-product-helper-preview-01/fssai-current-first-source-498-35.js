"use strict";
/* New effective 498 / 35 source-only snapshot. Chromium for plain refined
 * sugar cubes remains conditional on documented finished product identity.
 * No numeric limit auto-activation or test/approval. */
var pmsv498Manifest=null,pmsv498Ledger=null,pmsv35Queue=null,pmsv35Triage=null;
const pmsv498Digests=Object.freeze({"manifest":"abdaaf575f2c901e","ledger":"d142be820899eac5","queue":"e87eda0b03d08b5e","remaining":"54165f8e9b1c1f5b"});
const pmsv498ExpectedRoute=Object.freeze({id:"11-11-1-cube-sugar",name:"Cube Sugar",fssr:"2.8.1(5)",fcs:"11.1.5",metal:"Chromium",article:"Refined sugar",limit:0.02,unit:"mg/kg"});
function pmsv498Valid(){
 if(typeof pmsvCurrent36TriageValid!=="function"||!pmsvCurrent36TriageValid()||
 typeof pmsvReviewSnapshotDigest!=="function"||!pmsv498Manifest||!pmsv498Ledger||
 !pmsv35Queue||!pmsv35Triage)return false;
 const m=pmsv498Manifest,l=pmsv498Ledger,q=pmsv35Queue,t=pmsv35Triage,
 old=pmsv497Ledger,oldq=pmsv36Queue;
 if(pmsvReviewSnapshotDigest(m)!==pmsv498Digests.manifest||
 pmsvReviewSnapshotDigest(l)!==pmsv498Digests.ledger||
 pmsvReviewSnapshotDigest(q)!==pmsv498Digests.queue||
 pmsvReviewSnapshotDigest(t)!==pmsv498Digests.remaining||
 m.schema_version!=="1.0"||m.source_policy!=="OFFICIAL_FSSAI_ONLY"||
 m.type!=="CONDITIONAL_CTR_CHROMIUM_REFINED_SUGAR_SOURCE_NOT_COMPLIANCE"||
 m.baseline?.partial!==497||m.baseline?.pending!==36||
 m.effective?.partial!==498||m.effective?.pending!==35||
 m.positive_first_named_source_routes!==1||m.routes?.length!==1||
 m.finished_lots_verified!==0||m.automatically_assigned_limits!==0||
 m.product_compliance_approvals!==0||
 l.catalogue!==533||l.partial_exact!==498||l.first_source_pending!==35||
 l.positive_delta_count!==1||l.records?.length!==533||
 l.full_compliance_approvals!==0||
 q.catalogue!==533||q.partial_exact!==498||q.first_source_pending!==35||
 q.review_records?.length!==35||q.promoted_catalog_ids?.length!==81||
 t.current_catalogue!==533||t.current_partial!==498||t.current_pending!==35||
 t.policy!=="OFFICIAL_FSSAI_ONLY"||t.reviewed_pending_records!==35||
 t.source_document_requests!==140||t.future_amendment_still_not_effective_until!=="2026-12-01"||
 t.future_rule_automatic_application!==false||t.lot_compliance_pass_count!==0||
 t.cases?.length!==35||old.records?.length!==533||oldq.review_records?.length!==36)return false;
 const x=m.routes[0],f=pmsv498ExpectedRoute,v=x?.article_source_values?.[0];
 if(x?.catalog_id!==f.id||x.product_name!==f.name||
 x.fssr!==f.fssr||x.fcs!==f.fcs||x.route_family!=="COMPRESSED_REFINED_CRYSTALLISED_SUGAR_CUBES"||
 x.legal_match_status!=="CONDITIONALLY_NAMED_REFINED_SUGAR_CHROMIUM_ONLY"||
 x.reference_legal_article!==f.article||
 x.article_source_values?.length!==1||v?.contaminant!==f.metal||
 v.exact_ctr_article!==f.article||v.limit!==f.limit||v.unit!==f.unit||
 v.official_pdf_page!==13||v.source_only_not_assigned!==true||
 x.fssr_pdf_page!==3||x.fssr_identity_clause!=="2.8.1(5) CUBE SUGAR"||
 x.required_positive_proofs?.length!==5||x.specific_prohibited_transfers?.length!==6||
 !x.official_product_standard?.startsWith("https://www.fssai.gov.in/")||
 x.official_contaminants!==m.official_ctr||
 x.actual_marketed_subroute_verified!==false||x.recipe_batch_verified!==false||
 x.legal_finished_article_scope_adjudicated!==false||
 x.finished_sulphated_ash_measured!==false||x.chromium_lab_result_verified!==false||
 x.numeric_limits_auto_assigned!==false||x.full_regulatory_approval!==false)return false;
 let partial=0,pending=0,changed=0;const pendingSet=new Set();
 for(let i=0;i<533;i++){
  const a=old.records[i],b=l.records[i];if(!a||!b||
   a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
   String(a.fssr||"")!==String(b.fssr||"")||String(a.fcs||"")!==String(b.fcs||"")||
   b.product_compliance_approval!==false||b.sample_lab_pass!==false||
   b.complete_contaminant_panel!==false)return false;
  if(a.catalog_id===f.id){
   const val=b.regulatory_source_verified_delta;
   if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
    b.missing_first_exact_evidence!==false||
    val?.evidence_class!=="CONDITIONALLY_NAMED_FSSR_CTR_ARTICLE_ONLY"||
    val.source_family!==x.route_family||
    val.article_source_values?.length!==1||
    val.article_source_values[0].contaminant!==f.metal||
    val.article_source_values[0].article!==f.article||
    val.article_source_values[0].limit!==f.limit||
    val.article_source_values[0].unit!==f.unit||
    val.actual_finished_lot_identity_verified!==false||
    val.recipe_and_source_ingredient_identity_verified!==false||
    val.legal_scope_fully_adjudicated!==false||
    val.processing_equivalence_confirmed!==false||
    val.numeric_finished_food_limit_auto_applied!==false||
    val.lab_pass!==false||val.full_compliance_pass!==false)return false;
   changed++;
  }else if(JSON.stringify(a)!==JSON.stringify(b))return false;
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")partial++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING"){pending++;pendingSet.add(b.catalog_id);}
  else return false;
 }
 if(partial!==498||pending!==35||changed!==1)return false;
 const archive=new Map(oldq.review_records.map(x=>[x.catalog_id,x])),seen=new Set();
 for(let i=0;i<35;i++){
  const y=q.review_records[i],z=t.cases[i],a=archive.get(y?.catalog_id);
  if(!y||!z||seen.has(y.catalog_id)||!pendingSet.has(y.catalog_id)||
   y.catalog_id===f.id||!a||JSON.stringify(y)!==JSON.stringify(a)||
   z.catalog_id!==y.catalog_id||z.product_name!==y.product_name||
   String(z.fssr||"")!==String(y.fssr||"")||
   String(z.fcs||"")!==String(y.fcs||"")||
   z.rank!==i+1||z.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
   !z.finished_article_proof_needed||!z.known_forbidden_transfer||
   z.source_documents_needed?.length!==4||
   z.actual_finished_article_confirmed!==false||
   z.numeric_limit_assigned!==false||z.laboratory_test_verified!==false||
   z.regulatory_approved!==false)return false;
  seen.add(y.catalog_id);
 }
 return seen.size===35&&q.subsequent_promotions===oldq.subsequent_promotions+1&&
 q.promoted_catalog_ids.length===81&&new Set(q.promoted_catalog_ids).size===81&&
 q.promoted_catalog_ids[80]===f.id;
}
var pmsv498BeforeLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsv498BeforeLoad();pmsv498Manifest=null;pmsv498Ledger=null;pmsv35Queue=null;pmsv35Triage=null;
 try{
  const names=["fssai-cube-sugar-refined-chromium-conditional-2026-10-13.json",
   "fssai-current-first-source-533-live-ledger-498-35-2026-10-13.json",
   "fssai-current-35-first-exact-source-proof-worklist-2026-10-13.json",
   "fssai-current-35-decisive-source-open-cases-2026-10-13.json"];
  const res=await Promise.all(names.map(n=>fetch("./data/rules/"+n+"?v=20261013-49835",{cache:"reload"})));
  if(res.some(x=>!x.ok))throw Error("Missing current source");
  [pmsv498Manifest,pmsv498Ledger,pmsv35Queue,pmsv35Triage]=await Promise.all(res.map(x=>x.json()));
  if(!pmsv498Valid())throw Error("Current source identity verification failed");
 }catch(_){pmsv498Manifest=null;pmsv498Ledger=null;pmsv35Queue=null;pmsv35Triage=null;}
};
function pmsv498LatestHtml(p){
 if(!p)return "";
 if(!pmsv498Valid())return '<div class="notice">498/35 latest source verification unavailable; historical evidence is not a legal PASS.</div>';
 const record=pmsv498Ledger.records.find(x=>x.catalog_id===p.id);
 if(!record||record.product_name!==p.name||String(record.fssr||"")!==String(p.fssr||"")||
 String(record.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">Product source identity mismatch. No regulatory approval.</div>';
 const e=v=>String(v).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",[String.fromCharCode(34)]:"&quot;",[String.fromCharCode(39)]:"&#39;"}[z]));
 const x=pmsv498Manifest.routes.find(y=>y.catalog_id===p.id);
 const y=pmsv35Triage.cases.find(y=>y.catalog_id===p.id);
 let out='<details open class="card" style="margin-top:12px"><summary><b>FSSAI source research: 498 conditional articles / 35 researched, exact applicability open</b> · '+
 (record.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL SOURCE":"RESEARCHED · EXACT CONTAMINANT ARTICLE PENDING")+'</summary>'+
 '<div class="notice"><b>533 catalogue identities reviewed at the first-source level (498 conditional reference matches, 35 with completed open-case desk research). Exact contaminant applicability still open for 35. No finished-lot identity, lab PASS or complete regulatory clearance.</div>';
 if(x){
  out+='<p><b>New conditional article:</b> Chromium — Refined sugar, 0.02 mg/kg (source reference only, not applied to this product).</p>'+
  '<p><b>Finished product restriction:</b> '+e(x.subroute)+'</p>'+
  '<p><b>Positive evidence still needed:</b></p><ol>'+x.required_positive_proofs.map(z=>'<li>'+e(z)+'</li>').join("")+'</ol>'+
  '<p><b>Do not transfer:</b> '+x.specific_prohibited_transfers.map(e).join("; ")+'</p>'+
  '<small><a target="_blank" rel="noopener noreferrer" href="'+e(x.official_product_standard)+'">Official FSSR sugar</a> · '+
  '<a target="_blank" rel="noopener noreferrer" href="'+e(x.official_contaminants)+'">Official CTR IX</a></small>';
 }else if(y){
  out+='<p><b>Missing exact named finished-article evidence:</b> '+e(y.finished_article_proof_needed)+'</p>'+
  '<p><b>Known excluded transfer:</b> '+e(y.known_forbidden_transfer)+'</p>'+
  '<p><b>Documentary evidence requests:</b></p><ol>'+y.source_documents_needed.map(t=>'<li>'+e(t)+'</li>').join("")+'</ol>';
 }else out+='<p>Earlier partial conditional source route retained; no actual finished-lot evidence or complete compliance pass.</p>';
 return out+'</details>';
}
var pmsv498PriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 if(!p)return "";
 const current=pmsv498LatestHtml(p);
 if(!pmsv498Valid())return current;
 return current+'<details class="card" style="margin-top:12px"><summary>Historical FSSAI source research, including earlier 497/36 and legacy reviews</summary>'+
 pmsv498PriorHtml(p)+'</details>';
};
var pmsv498PriorChecklist=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(pmsv498Valid()&&p?.id===pmsv498ExpectedRoute.id)return "";
 return pmsv498PriorChecklist(p);
};
