"use strict";
/* Official FSSAI Chapter 2.4 + CTR IX; six ingredient-qualified crop-composite source branches. Never apply limits or PASS to unverified lots. */
var pmsv463Manifest=null,pmsv463Ledger=null,pmsv70Queue=null;
const pmsv463Digests=Object.freeze({"manifest":"1ec9ebbd9b39f25e","ledger":"dde7c60b12ce5e5c","queue":"e4dffa987e71ceb5"});
const pmsv463Ids=Object.freeze(["07-07-2-biscuit","07-07-2-wafer-biscuit","06-06-4-macaroni-products-pasta-products","06-06-4-macaroni-products-instant-noodle","06-06-7-papad","15-15-1-papad"]);
function pmsv463Valid(){
 if(typeof pmsv457Valid!=="function"||!pmsv457Valid()||typeof pmsvReviewSnapshotDigest!=="function")return false;
 const m=pmsv463Manifest,d=pmsv463Ledger,q=pmsv70Queue,o=pmsv457Ledger,p=pmsv76Queue;
 if(!m||!d||!q||!o||!p||
 pmsvReviewSnapshotDigest(m)!==pmsv463Digests.manifest||
 pmsvReviewSnapshotDigest(d)!==pmsv463Digests.ledger||
 pmsvReviewSnapshotDigest(q)!==pmsv463Digests.queue||
 m.source_policy!=="OFFICIAL_FSSAI_ONLY"||
 m.official_ctr!==o.official_contaminants_source||
 m.source_class!=="SIX_POSITIVE_INGREDIENT_COMPOSITE_AFLATOXIN_BRANCHES"||
 m.baseline?.partial_exact!==457||m.baseline?.first_source_pending!==76||
 m.latest?.partial_exact!==463||m.latest?.first_source_pending!==70||
 m.latest?.full_compliance_approvals!==0||
 m.named_conditionally_qualified_routes!==6||m.products?.length!==6||
 m.auto_apply_finished_limits!==false||m.finished_lot_identity_unverified!==true||
 m.any_lab_pass!==false||m.any_full_compliance_pass!==false||
 d.catalogue!==533||d.partial_exact!==463||d.first_source_pending!==70||
 d.full_compliance_approvals!==0||d.positive_delta_count!==6||
 d.previous_archived_pending!==76||d.records?.length!==533||
 q.catalogue!==533||q.partial_exact!==463||q.first_source_pending!==70||
 q.archive_76_count!==76||q.review_records?.length!==70||
 q.subsequent_promotions!==46||q.promoted_catalog_ids?.length!==46||
 q.completed_compliance!==0||p.review_records?.length!==76)return false;
 const byId=new Map(m.products.map(x=>[x.catalog_id,x]));
 if(byId.size!==6||pmsv463Ids.some(id=>!byId.has(id)))return false;
 const isOfficial=x=>typeof x==="string"&&
 (x.startsWith("https://fssai.gov.in/")||x.startsWith("https://www.fssai.gov.in/"));
 const named="Food product containing any of the above mentioned food articles";
 for(const x of m.products){
  if(!isOfficial(x.official_standard_url)||!isOfficial(x.official_ctr)||
   x.official_standard_url!==m.official_fssr_chapter_24||x.official_ctr!==m.official_ctr||
   !["2.4.10","2.4.15(1)","2.4.40"].includes(x.conditional_fssr_subroute)||
   x.named_qualified_finished_article!==named||
   x.conditional_named_article_verified!==true||
   x.actual_finished_lot_identity_verified!==false||
   x.actual_recipe_or_ingredient_identity_verified!==false||
   x.processing_equivalence_confirmed!==false||x.source_limits_auto_applied!==false||
   x.actual_laboratory_results_verified!==false||x.all_contaminants_reviewed!==false||
   x.full_compliance_pass!==false||
   x.positive_source_basis?.length!==5||x.negative_transfer_controls?.length!==6||
   x.source_article_candidates?.length!==2)return false;
  for(const [n,v]of [["Total Aflatoxins",20],["Aflatoxin B1",10]]){
   if(!x.source_article_candidates.some(z=>z.contaminant===n&&z.limit===v&&z.unit==="µg/kg"&&z.article===named))return false;
  }
 }
 let good=0,pending=0,changed=0;const outstanding=new Set();
 for(let i=0;i<533;i++){
  const a=o.records[i],b=d.records[i];
  if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
  String(a.fssr||"")!==String(b.fssr||"")||String(a.fcs||"")!==String(b.fcs||"")||
  b.sample_lab_pass!==false||b.product_compliance_approval!==false||b.complete_contaminant_panel!==false)return false;
  const x=byId.get(a.catalog_id);
  if(!x){if(JSON.stringify(a)!==JSON.stringify(b))return false;}
  else{
   const v=b.regulatory_source_verified_delta;
   if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
   b.missing_first_exact_evidence!==false||x.product_name!==b.product_name||
   x.fssr!==b.fssr||x.fcs!==b.fcs||
   v?.evidence_class!=="CONDITIONALLY_NAMED_FSSR_CTR_ARTICLE_ONLY"||
   v.source_family!==x.source_family||v.conditional_named_article!==named||
   JSON.stringify(v.article_source_values)!==
   JSON.stringify(x.source_article_candidates.map(y=>({contaminant:y.contaminant,article:y.article,limit:y.limit,unit:y.unit,analytical_basis:y.analytical_basis})))||
   v.actual_finished_lot_identity_verified!==false||
   v.recipe_and_source_ingredient_identity_verified!==false||
   v.processing_equivalence_confirmed!==false||
   v.numeric_finished_food_limit_auto_applied!==false||
   v.lab_pass!==false||v.full_compliance_pass!==false)return false;
   changed++;
  }
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")good++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING"){pending++;outstanding.add(b.catalog_id);}
  else return false;
 }
 if(good!==463||pending!==70||changed!==6)return false;
 const oldPending=new Map(p.review_records.map(x=>[x.catalog_id,x])),seen=new Set();
 for(const x of q.review_records){
  if(!outstanding.has(x.catalog_id)||seen.has(x.catalog_id)||
  JSON.stringify(x)!==JSON.stringify(oldPending.get(x.catalog_id))||
  x.first_exact_source_verified!==false||
  x.numeric_finished_food_limit_auto_applied!==false||
  x.finished_food_laboratory_pass!==false||
  x.full_regulatory_compliance_approval!==false)return false;
  seen.add(x.catalog_id);
 }
 return seen.size===70&&pmsv463Ids.every(id=>q.promoted_catalog_ids.includes(id)&&!seen.has(id))&&
 q.promoted_catalog_ids.every(id=>!seen.has(id));
}
var pmsvBefore463Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore463Load();pmsv463Manifest=null;pmsv463Ledger=null;pmsv70Queue=null;
 try{
  const paths=["fssai-six-bakery-pasta-papad-composite-2026-10-12.json","fssai-current-first-source-533-live-ledger-463-70-2026-10-12.json","fssai-current-70-first-exact-source-proof-worklist-2026-10-12.json"];
  const rs=await Promise.all(paths.map(s=>fetch("./data/rules/"+s+"?v=20261012-46370",{cache:"reload"})));
  if(rs.some(s=>!s.ok))throw Error("Latest first-source files unavailable");
  [pmsv463Manifest,pmsv463Ledger,pmsv70Queue]=await Promise.all(rs.map(s=>s.json()));
  if(!pmsv463Valid())throw Error("Current 463/70 source invalid");
 }catch(_){pmsv463Manifest=null;pmsv463Ledger=null;pmsv70Queue=null;}
};
function pmsv463Html(p){
 if(!p)return "";
 if(!pmsv463Valid())return '<div class="notice">Authenticated 463/70 evidence unavailable. No automatic contaminant limit or PASS.</div>';
 const r=pmsv463Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||String(r.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Latest FSSAI source identity does not reconcile. No PASS.</div>';
 const e=s=>typeof esc==="function"?esc(String(s)):String(s);
 let h='<details class="card" style="margin-top:12px"><summary><b>Latest FSSAI first-source ledger — 463 partial / 70 pending</b> · '+
 e(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL CONDITIONAL SOURCE":"FIRST EXACT SOURCE PENDING")+
 '</summary><div class="notice">533 identities · 463 partial source matches · 70 awaiting a first named source · ZERO lot or compliance PASS.</div>';
 const x=pmsv463Manifest.products.find(y=>y.catalog_id===p.id);
 if(x){
  h+='<p><b>New Chapter '+e(x.conditional_fssr_subroute)+' named conditional source:</b> '+e(x.product_name)+
  '. Actual finished lot ingredients have NOT been verified.</p>'+
  '<p><b>CTR IX finished-food source values, NOT automatically applied:</b></p><ul>'+
  x.source_article_candidates.map(z=>'<li>'+e(z.contaminant)+' — '+e(z.limit)+' '+e(z.unit)+' ('+e(z.article)+')</li>').join("")+'</ul>'+
  '<p><b>Affirmative finished-food evidence needed:</b></p><ul>'+
  x.positive_source_basis.map(z=>'<li>'+e(z)+'</li>').join("")+'</ul>'+
  '<p><b>Prohibited automatic inheritance:</b> '+x.negative_transfer_controls.map(e).join("; ")+'</p>'+
  '<div class="notice"><b>NO AUTOMATIC CONTAMINANT ASSIGNMENT OR LABORATORY PASS.</b></div>'+
  '<small><a href="'+e(x.official_standard_url)+'" target="_blank" rel="noopener noreferrer">Official FSSR Chapter 2.4</a> · '+
  '<a href="'+e(x.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official FSSAI CTR IX</a></small>';
 }else if(r.source_status==="FIRST_EXACT_SOURCE_PENDING"){
  h+='<p>Positive named finished-product article is still not established. Individual historic evidence proof packet remains active.</p>';
 }else h+='<p>Previous exact named partial source retained. No tested-lot or full compliance decision.</p>';
 return h+'</details>';
}
// Existing wrapper calls pmsv457Html dynamically; substitute the reconciled current panel.
pmsv457Html=pmsv463Html;
var pmsvBefore463Checklist=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(!pmsv463Valid())return '<div class="notice">Authenticated current evidence unavailable. No PASS.</div>';
 const r=pmsv463Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||String(r.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Current product identity mismatch. No PASS.</div>';
 if(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH")return "";
 return pmsvBefore463Checklist(p);
};
