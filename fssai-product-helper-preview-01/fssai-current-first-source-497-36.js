"use strict";
/* Source-only 497/36 effective ledger after 495/38 archive; no lab or
 * regulatory PASS; candidate finished-article scope requires legal proof. */
var pmsv497Manifest=null,pmsv497Ledger=null,pmsv36Queue=null;
const pmsv497Hashes=Object.freeze({"manifest":"0797a52879d2a923","ledger":"f6048139fd8a5b56","queue":"b351d463f6e24daa"});
const pmsv497RowFixed=Object.freeze({"04-04-1-fruit-cheese":{"name":"Fruit Cheese","fssr":"2.3.33","fcs":"04.1.2.5","article":"Pulp and pulp products of any fruit","metalValues":[["Copper","Pulp and pulp products of any fruit",5,"mg/kg",7],["Arsenic","Pulp and pulp products of any fruit",0.2,"mg/kg",10],["Tin","Pulp and pulp products of any fruit",250,"mg/kg",11]]},"99-99-1-colouring-foods":{"name":"Colouring foods","fssr":"2.3.65","fcs":"99.1","article":"Food colouring other than synthetic colouring","metalValues":[["Arsenic","Food colouring other than synthetic colouring",5,"mg/kg",9]]}});
const pmsv497Promoted=Object.freeze(["04-04-1-fruit-cheese","99-99-1-colouring-foods"]);
function pmsv497Valid(){
 if(typeof pmsv495Valid!=="function"||!pmsv495Valid()||
 typeof pmsvReviewSnapshotDigest!=="function"||
 !pmsv497Manifest||!pmsv497Ledger||!pmsv36Queue||
 pmsvReviewSnapshotDigest(pmsv497Manifest)!==pmsv497Hashes.manifest||
 pmsvReviewSnapshotDigest(pmsv497Ledger)!==pmsv497Hashes.ledger||
 pmsvReviewSnapshotDigest(pmsv36Queue)!==pmsv497Hashes.queue)return false;
 const m=pmsv497Manifest,d=pmsv497Ledger,q=pmsv36Queue,old=pmsv495Ledger,prev=pmsv38Queue;
 if(m.schema_version!=="1.0"||m.source_policy!=="FSSAI_OFFICIAL_ONLY"||
 m.promoted_source_routes!==2||m.prior_snapshot!=="495/38"||m.new_snapshot!=="497/36"||
 m.kind!=="CONDITIONALLY_NAMED_FSSR_CTR_FINISHED_ARTICLE_ONLY"||
 m.physical_finished_products_verified!==false||m.formal_legal_applicability_adjudicated!==false||
 m.laboratory_pass_count!==0||m.automatically_applied_limits!==0||m.full_compliance_approvals!==0||
 m.routes?.length!==2||d.catalogue!==533||d.partial_exact!==497||d.first_source_pending!==36||
 d.full_compliance_approvals!==0||d.records?.length!==533||d.positive_delta_count!==2||
 q.catalogue!==533||q.partial_exact!==497||q.first_source_pending!==36||
 q.review_records?.length!==36||q.promoted_catalog_ids?.length!==80||
 old.records?.length!==533||old.partial_exact!==495||prev.review_records?.length!==38)return false;
 const changed=new Map(m.routes.map(x=>[x.catalog_id,x])),remain=new Set();
 if(changed.size!==2||pmsv497Promoted.some(id=>!changed.has(id)))return false;
 for(const x of m.routes){
  const fix=pmsv497RowFixed[x.catalog_id];
  if(!fix||x.product_name!==fix.name||x.fssr!==fix.fssr||x.fcs!==fix.fcs||
   x.named_ctr_finished_article!==fix.article||x.article_values?.length!==fix.metalValues.length||
   x.article_values.some((v,i)=>v.contaminant!==fix.metalValues[i][0]||
    v.article!==fix.metalValues[i][1]||v.limit!==fix.metalValues[i][2]||
    v.unit!==fix.metalValues[i][3]||v.pdf_page!==fix.metalValues[i][4]||
    !v.analytical_basis)||
   x.positive_product_evidence?.length!==5||x.forbidden_transfers?.length!==6||
   !x.official_product_standard?.startsWith("https://www.fssai.gov.in/")||
   x.official_ctr!==m.official_ctr||
   x.verified_fssr_description!==true||x.finished_ctr_article_identification_conditional!==true||
   x.applicability_to_actual_finished_product_verified!==false||
   x.qualifying_fruit_species_verified!==false||x.recipe_and_thermal_process_verified!==false||
   x.numeric_limit_applied!==false||x.finished_lot_verified!==false||
   x.lab_test_pass!==false||x.complete_compliance_approval!==false)return false;
 }
 let partial=0,pending=0,promotions=0;
 for(let i=0;i<533;i++){
  const a=old.records[i],b=d.records[i],x=changed.get(a?.catalog_id);
  if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
   String(a.fssr||"")!==String(b.fssr||"")||String(a.fcs||"")!==String(b.fcs||"")||
   b.complete_contaminant_panel!==false||b.product_compliance_approval!==false||
   b.sample_lab_pass!==false)return false;
  if(!x){if(JSON.stringify(a)!==JSON.stringify(b))return false;}
  else{
   const v=b.regulatory_source_verified_delta;
   if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||b.missing_first_exact_evidence!==false||
    v?.evidence_class!=="CONDITIONALLY_NAMED_FSSR_CTR_ARTICLE_ONLY"||
    v.source_family!==x.route_group||
    v.conditional_named_article!==x.named_ctr_finished_article||
    JSON.stringify(v.article_source_values)!==
    JSON.stringify(x.article_values.map(w=>({contaminant:w.contaminant,article:w.article,limit:w.limit,unit:w.unit,analytical_basis:w.analytical_basis})))||
    v.actual_finished_lot_identity_verified!==false||
    v.recipe_and_source_ingredient_identity_verified!==false||
    v.legal_scope_fully_adjudicated!==false||
    v.processing_equivalence_confirmed!==false||
    v.numeric_finished_food_limit_auto_applied!==false||v.lab_pass!==false||
    v.full_compliance_pass!==false)return false;
   promotions++;
  }
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")partial++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING"){pending++;remain.add(b.catalog_id);}
  else return false;
 }
 if(partial!==497||pending!==36||promotions!==2)return false;
 const previouslyPending=new Map(prev.review_records.map(x=>[x.catalog_id,x])),seen=new Set();
 for(const x of q.review_records){
  if(seen.has(x.catalog_id)||changed.has(x.catalog_id)||!remain.has(x.catalog_id)||
   JSON.stringify(x)!==JSON.stringify(previouslyPending.get(x.catalog_id)))return false;
  seen.add(x.catalog_id);
 }
 if(seen.size!==36||q.subsequent_promotions!==prev.subsequent_promotions+2||
  q.promoted_catalog_ids.length!==80||new Set(q.promoted_catalog_ids).size!==80||
  q.promoted_catalog_ids.some(x=>!prev.promoted_catalog_ids.includes(x)&&!changed.has(x)))return false;
 return true;
}
var pmsv497OldLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsv497OldLoad();pmsv497Manifest=null;pmsv497Ledger=null;pmsv36Queue=null;
 try{
  const paths=["fssai-two-fruit-cheese-colouring-foods-conditional-source-2026-10-13.json",
   "fssai-current-first-source-533-live-ledger-497-36-2026-10-13.json",
   "fssai-current-36-first-exact-source-proof-worklist-2026-10-13.json"];
  const r=await Promise.all(paths.map(x=>fetch("./data/rules/"+x+"?v=20261013-49736",{cache:"reload"})));
  if(r.some(x=>!x.ok))throw Error("Missing official source");
  [pmsv497Manifest,pmsv497Ledger,pmsv36Queue]=await Promise.all(r.map(x=>x.json()));
  if(!pmsv497Valid())throw Error("497/36 identity integrity mismatch");
 }catch(_){pmsv497Manifest=null;pmsv497Ledger=null;pmsv36Queue=null;}
};
function pmsv497Html(p){
 if(!p)return "";
 if(!pmsv497Valid())return '<div class="notice">Latest source verification unavailable. 497/36 cannot be trusted. No PASS.</div>';
 const a=pmsv497Ledger.records.find(x=>x.catalog_id===p.id);
 if(!a||a.product_name!==p.name||String(a.fssr||"")!==String(p.fssr||"")||
 String(a.fcs||"")!==String(p.fcs||""))return '<div class="notice">Latest product identity mismatch, no approval.</div>';
 const e=v=>String(v).replace(/[&<>"']/g,z=>({"&":"&amp;","<":"&lt;",">":"&gt;",[String.fromCharCode(34)]:"&quot;",[String.fromCharCode(39)]:"&#39;"}[z]));
 const x=pmsv497Manifest.routes.find(z=>z.catalog_id===p.id);
 let h='<details class="card" style="margin-top:12px"><summary><b>Current first named-source ledger: 497 partial / 36 pending</b> · '+
 (a.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"CONDITIONAL PARTIAL":"FIRST SOURCE PENDING")+'</summary>'+
 '<div class="notice">533 product identities · 497 conditional partial source routes · 36 exact first-source pending. No actual lot testing or full compliance PASS.</div>';
 if(x){
  h+='<p><b>Named legal source candidate:</b> '+e(x.named_ctr_finished_article)+'</p>'+
  '<p><b>Standardised finished food:</b> '+e(x.standard_definition)+'</p>'+
  '<p><b>Reason for conditional link:</b> '+e(x.positive_named_source_basis)+'</p>'+
  '<div class="tablewrap"><table><thead><tr><th>Contaminant</th><th>Official named food article</th><th>Published source value, not assigned</th></tr></thead><tbody>'+
  x.article_values.map(v=>'<tr><td>'+e(v.contaminant)+'</td><td>'+e(v.article)+'</td><td>'+e(v.limit)+' '+e(v.unit)+'</td></tr>').join("")+
  '</tbody></table></div>'+
  '<p><b>Affirmative evidence required:</b></p><ol>'+x.positive_product_evidence.map(v=>'<li>'+e(v)+'</li>').join("")+'</ol>'+
  '<p><b>Forbidden transfers:</b> '+x.forbidden_transfers.map(e).join("; ")+'</p>'+
  '<small><a href="'+e(x.official_product_standard)+'" target="_blank" rel="noopener noreferrer">Official FSSR</a> · '+
  '<a href="'+e(x.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official CTR IX</a></small>';
 }else if(a.source_status==="FIRST_EXACT_SOURCE_PENDING")h+='<p>Exact named legal-source proof is still pending; do not apply raw ingredient or neighbouring food category limits.</p>';
 else h+='<p>Earlier partial conditional source remains archived and unchanged; no complete product compliance determination.</p>';
 return h+'</details>';
}
var pmsv497PriorHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 if(!p)return "";
 const current=pmsv497Html(p);
 if(!pmsv497Valid())return current;
 if(!pmsv497Manifest.routes.some(x=>x.catalog_id===p.id))return current+pmsv497PriorHtml(p);
 return current+'<details class="card" style="margin-top:12px"><summary>Archived 493/40 and 495/38 source reviews (historical, superseded for this conditional route)</summary>'+
 pmsv497PriorHtml(p)+'</details>';
};
var pmsv497PreviousPendingChecklist=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(pmsv497Valid()&&pmsv497Manifest.routes.some(x=>x.catalog_id===p?.id))return "";
 return pmsv497PreviousPendingChecklist(p);
};
