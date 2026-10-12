"use strict";
/* 493 / 40 current source-only evidence. NO LOT, AUTOMATIC MRL, LAB OR LEGAL PASS. */
var pmsv493Manifest=null,pmsv493Ledger=null,pmsv40Queue=null;
const pmsv493Digests=Object.freeze({"manifest":"b21a910e90c6c6f1","ledger":"0e29db18a98d473b","queue":"7948873ed5a6b7e3"});
const pmsv493Ids=Object.freeze(["01-01-3-analogue-in-the-dairy-context","01-01-4-analogue-in-the-dairy-context","01-01-5-analogue-in-the-dairy-context","01-01-6-analogue-in-the-dairy-context","01-01-7-analogue-in-the-dairy-context","02-02-2-analogue-in-the-dairy-context","02-02-3-analogue-in-the-dairy-context","02-02-4-analogue-in-the-dairy-context","04-04-1-murabba","04-04-1-candied-crystallised-and-glazed-fruit-vegetable-rhizome-fruit-peel","04-04-1-date-paste","04-04-2-ginger-paste","04-04-1-edible-dried-seeds-obtained-from-fruits","04-04-2-edible-dried-seeds-obtained-from-vegetables","06-06-2-custard-powder","04-04-1-fruit-bar-toffee","11-11-1-icing-sugar","04-04-1-desiccated-coconut"]);
function pmsv493Valid(){
 if(typeof pmsv475Valid!=="function"||!pmsv475Valid()||
    typeof pmsvReviewSnapshotDigest!=="function")return false;
 const m=pmsv493Manifest,d=pmsv493Ledger,q=pmsv40Queue,o=pmsv475Ledger,p=pmsv58Queue;
 if(!m||!d||!q||!o||!p||
 pmsvReviewSnapshotDigest(m)!==pmsv493Digests.manifest||
 pmsvReviewSnapshotDigest(d)!==pmsv493Digests.ledger||
 pmsvReviewSnapshotDigest(q)!==pmsv493Digests.queue||
 m.schema_version!=="1.0"||m.source_policy!=="OFFICIAL_FSSAI_ONLY"||
 m.official_ctr!==o.official_contaminants_source||
 m.source_version!==o.source_version||
 m.named_conditionally_qualified_routes!==18||m.products?.length!==18||
 m.route_count_by_family?.listed_crop!==14||m.route_count_by_family?.canned!==4||
 m.baseline?.partial_exact!==475||m.baseline?.first_source_pending!==58||
 m.latest?.partial_exact!==493||m.latest?.first_source_pending!==40||
 m.any_lab_pass!==false||m.any_full_compliance_pass!==false||
 m.finished_lot_identity_unverified!==true||m.auto_apply_finished_limits!==false||
 d.catalogue!==533||d.partial_exact!==493||d.first_source_pending!==40||
 d.full_compliance_approvals!==0||d.previous_archived_pending!==58||d.positive_delta_count!==18||
 d.records?.length!==533||q.catalogue!==533||q.partial_exact!==493||
 q.first_source_pending!==40||q.archive_58_count!==58||
 q.subsequent_promotions!==76||q.completed_compliance!==0||
 q.review_records?.length!==40||q.promoted_catalog_ids?.length!==76||
 p.review_records?.length!==58)return false;
 const proof=new Map(m.products.map(x=>[x.catalog_id,x])),remaining=new Set();
 if(proof.size!==18||pmsv493Ids.some(id=>!proof.has(id)))return false;
 const official=u=>typeof u==="string"&&(u.startsWith("https://fssai.gov.in/")||
 u.startsWith("https://www.fssai.gov.in/")||u.startsWith("https://foscos.fssai.gov.in/"));
 for(const x of m.products){
  if(!official(x.official_standard_url)||x.official_ctr!==m.official_ctr||
    x.conditional_named_article_verified!==true||x.actual_finished_lot_identity_verified!==false||
    x.actual_recipe_or_ingredient_identity_verified!==false||
    x.processing_equivalence_confirmed!==false||x.source_limits_auto_applied!==false||
    x.actual_laboratory_results_verified!==false||x.all_contaminants_reviewed!==false||
    x.full_compliance_pass!==false||x.positive_source_basis?.length!==5||
    x.negative_transfer_controls?.length!==6||!x.finished_subroute_identity)return false;
  const z=x.source_article_candidates;
  if(x.source_family==="COMMERCIAL_CANNED_FINISHED_FOOD"){
   if(z?.length!==1||z[0].contaminant!=="Tin"||
     z[0].article!=="Canned foods other than beverages"||
     z[0].limit!==250||z[0].unit!=="mg/kg")return false;
  }else if(x.source_family==="LISTED_CROP_FINISHED_COMPOSITE"){
   if(z?.length!==2||z[0].contaminant!=="Total Aflatoxins"||
    z[0].article!=="Food product containing any of the above mentioned food articles"||
    z[0].limit!==20||z[0].unit!=="µg/kg"||
    z[1].contaminant!=="Aflatoxin B1"||
    z[1].article!=="Food product containing any of the above mentioned food articles"||
    z[1].limit!==10||z[1].unit!=="µg/kg")return false;
  }else return false;
 }
 let partial=0,pending=0,changed=0;
 for(let i=0;i<533;i++){
  const a=o.records[i],b=d.records[i],x=proof.get(a?.catalog_id);
  if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
   String(a.fssr||"")!==String(b.fssr||"")||
   String(a.fcs||"")!==String(b.fcs||"")||
   b.complete_contaminant_panel!==false||b.product_compliance_approval!==false||
   b.sample_lab_pass!==false)return false;
  if(!x){if(JSON.stringify(a)!==JSON.stringify(b))return false;}
  else{
   const v=b.regulatory_source_verified_delta;
   if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
    b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
    b.missing_first_exact_evidence!==false||
    x.product_name!==b.product_name||x.fssr!==b.fssr||x.fcs!==b.fcs||
    v?.evidence_class!=="CONDITIONALLY_NAMED_FSSR_CTR_ARTICLE_ONLY"||
    v.source_family!==x.source_family||
    v.conditional_named_article!==x.named_qualified_finished_article||
    JSON.stringify(v.article_source_values)!==
    JSON.stringify(x.source_article_candidates.map(z=>({contaminant:z.contaminant,article:z.article,limit:z.limit,unit:z.unit,analytical_basis:z.analytical_basis})))||
    v.actual_finished_lot_identity_verified!==false||
    v.recipe_and_source_ingredient_identity_verified!==false||
    v.processing_equivalence_confirmed!==false||
    v.numeric_finished_food_limit_auto_applied!==false||
    v.lab_pass!==false||v.full_compliance_pass!==false)return false;
   changed++;
  }
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")partial++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING"){pending++;remaining.add(b.catalog_id);}
  else return false;
 }
 if(partial!==493||pending!==40||changed!==18)return false;
 const old=new Map(p.review_records.map(x=>[x.catalog_id,x])),seen=new Set();
 for(const x of q.review_records){
  if(seen.has(x.catalog_id)||!remaining.has(x.catalog_id)||
   JSON.stringify(x)!==JSON.stringify(old.get(x.catalog_id))||
   x.first_exact_source_verified!==false||
   x.numeric_finished_food_limit_auto_applied!==false||
   x.finished_food_laboratory_pass!==false||
   x.full_regulatory_compliance_approval!==false)return false;
  seen.add(x.catalog_id);
 }
 return seen.size===40&&pmsv493Ids.every(id=>q.promoted_catalog_ids.includes(id)&&!seen.has(id))&&
 new Set(q.promoted_catalog_ids).size===76;
}
var pmsvBefore493Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore493Load();pmsv493Manifest=null;pmsv493Ledger=null;pmsv40Queue=null;
 try{
  const files=["fssai-eighteen-finished-canned-listed-crop-conditional-source-2026-10-12.json","fssai-current-first-source-533-live-ledger-493-40-2026-10-12.json","fssai-current-40-first-exact-source-proof-worklist-2026-10-12.json"];
  const rr=await Promise.all(files.map(x=>fetch("./data/rules/"+x+"?v=20261012-49340",{cache:"reload"})));
  if(rr.some(x=>!x.ok))throw Error("493/40 evidence missing");
  [pmsv493Manifest,pmsv493Ledger,pmsv40Queue]=await Promise.all(rr.map(x=>x.json()));
  if(!pmsv493Valid())throw Error("493/40 evidence integrity invalid");
 }catch(_){pmsv493Manifest=null;pmsv493Ledger=null;pmsv40Queue=null;}
};
function pmsv493Html(p){
 if(!p)return "";
 if(!pmsv493Valid())return '<div class="notice">Latest 493/40 FSSAI source integrity invalid. No numeric limit or PASS.</div>';
 const r=pmsv493Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
 String(r.fcs||"")!==String(p.fcs||""))return '<div class="notice">Source identity mismatch. No PASS.</div>';
 const e=s=>typeof esc==="function"?esc(String(s)):String(s);
 let h='<details class="card" style="margin-top:12px"><summary><b>Current FSSAI first-source ledger — 493 partial / 40 pending</b> · '+
 e(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL CONDITIONAL SOURCE":"FIRST EXACT SOURCE PENDING")+
 '</summary><div class="notice">533 catalogue identities · 493 partial named conditional sources · 40 pending · ZERO finished-lot or compliance PASS.</div>';
 const x=pmsv493Manifest.products.find(y=>y.catalog_id===p.id),prior=(typeof pmsv475Manifest!=="undefined"&&pmsv475Manifest?.products||[]).find(y=>y.catalog_id===p.id);
 const review=x||prior;
 if(review){
  h+='<p><b>CONDITIONAL legal source (not a batch conclusion):</b> '+e(review.finished_subroute_identity)+
   '</p><p><b>Actual source ingredient, marketed form, species, processing, and packaging NOT checked.</b></p><ul>'+
   review.source_article_candidates.map(z=>'<li>'+e(z.contaminant)+': '+e(z.limit)+' '+e(z.unit)+
   ' — '+e(z.article)+'</li>').join("")+'</ul>'+
   '<p><b>Positive physical/recipe proof still required:</b></p><ul>'+
   review.positive_source_basis.map(t=>'<li>'+e(t)+'</li>').join("")+'</ul>'+
   '<p><b>Forbidden transfer:</b> '+review.negative_transfer_controls.map(e).join("; ")+'</p>'+
   '<div class="notice"><b>NO AUTOMATIC SOURCE LIMIT / SAMPLE PASS / REGULATORY APPROVAL.</b></div>'+
   '<small><a href="'+e(review.official_standard_url)+'" target="_blank" rel="noopener noreferrer">Official FSSR / FoSCoS</a> · '+
   '<a href="'+e(review.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official FSSAI CTR IX</a></small>';
 }else if(r.source_status==="FIRST_EXACT_SOURCE_PENDING")
  h+='<p>Exact named source application still pending; use the product-specific official proof checklist. No assumed transfer from ingredients or neighbouring food categories.</p>';
 else h+='<p>Earlier partial named source evidence retained; no complete contaminant panel or tested-lot conclusion.</p>';
 return h+'</details>';
}
pmsv457Html=pmsv493Html;
var pmsvBefore493Local=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(!pmsv493Valid())return '<div class="notice">Current 493/40 first-source integrity unavailable. No PASS.</div>';
 const r=pmsv493Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
 String(r.fcs||"")!==String(p.fcs||""))return '<div class="notice">Current product ID mismatch. No PASS.</div>';
 if(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH")return "";
 return pmsvBefore493Local(p);
};
