"use strict";
/* Current 475 partial / 58 pending; 12 FSSAI exact conditional mushroom/canned/crop named source subroutes. No lot verified and no automatic PASS. */
var pmsv475Manifest=null,pmsv475Ledger=null,pmsv58Queue=null;
const pmsv475Digests=Object.freeze({"manifest":"50c488f2f3b23049","ledger":"bd1ca07b7a6b0c8a","queue":"a3d361193f684112"});
const pmsv475Ids=Object.freeze(["04-04-2-fungi-extract-and-fungi-concentrate","04-04-2-dried-fungi-concentrate","04-04-1-coconut-milk-non-dairy","04-04-1-coconut-cream-non-dairy","04-04-2-frozen-curried-vegetables-ready-to-eat-vegetables","04-04-2-thermally-processed-curried-vegetables-ready-to-eat-vegetables","04-04-1-pickles-made-from-fruits","05-05-2-dried-fruits-vegetables-nut-based-mouth-fresheners","05-05-2-other-traditional-mouth-fresheners-not-covered-under-5-2-4-1-and-5-2-4-2","18-18-2-fruit-and-vegetable-based-snacks-and-savouries","04-04-2-quick-frozen-fried-potatoes","12-12-6-culinary-pastes"]);
function pmsv475Valid(){
 if(typeof pmsv463Valid!=="function"||!pmsv463Valid()||typeof pmsvReviewSnapshotDigest!=="function")return false;
 const m=pmsv475Manifest,d=pmsv475Ledger,q=pmsv58Queue,o=pmsv463Ledger,p=pmsv70Queue;
 if(!m||!d||!q||!o||!p||
 pmsvReviewSnapshotDigest(m)!==pmsv475Digests.manifest||
 pmsvReviewSnapshotDigest(d)!==pmsv475Digests.ledger||
 pmsvReviewSnapshotDigest(q)!==pmsv475Digests.queue||
 m.schema_version!=="1.0"||m.source_policy!=="OFFICIAL_FSSAI_ONLY"||
 m.source_version!==o.source_version||m.official_ctr!==o.official_contaminants_source||
 m.source_class!=="TWELVE_EXPLICIT_MUSHROOM_CANNED_OR_CROP_FINISHED_SUBROUTES"||
 m.baseline?.partial_exact!==463||m.baseline?.first_source_pending!==70||
 m.latest?.partial_exact!==475||m.latest?.first_source_pending!==58||
 m.named_conditionally_qualified_routes!==12||m.products?.length!==12||
 m.route_count_by_family?.mushroom!==2||m.route_count_by_family?.canned!==2||
 m.route_count_by_family?.qualifying_crop!==8||
 m.auto_apply_finished_limits!==false||m.finished_lot_identity_unverified!==true||
 m.any_lab_pass!==false||m.any_full_compliance_pass!==false||
 d.catalogue!==533||d.partial_exact!==475||d.first_source_pending!==58||
 d.full_compliance_approvals!==0||d.previous_archived_pending!==70||
 d.positive_delta_count!==12||d.records?.length!==533||
 q.catalogue!==533||q.partial_exact!==475||q.first_source_pending!==58||
 q.archive_70_count!==70||q.subsequent_promotions!==58||
 q.review_records?.length!==58||q.promoted_catalog_ids?.length!==58||
 q.completed_compliance!==0||p.review_records?.length!==70)return false;
 const proof=new Map(m.products.map(x=>[x.catalog_id,x]));
 if(proof.size!==12||pmsv475Ids.some(id=>!proof.has(id)))return false;
 const official=u=>typeof u==="string"&&
 (u.startsWith("https://fssai.gov.in/")||u.startsWith("https://www.fssai.gov.in/")||
 u.startsWith("https://foscos.fssai.gov.in/"));
 for(const x of m.products){
  if(!official(x.official_standard_url)||!official(x.official_ctr)||
   x.official_ctr!==m.official_ctr||
   x.conditional_named_article_verified!==true||
   x.actual_finished_lot_identity_verified!==false||
   x.actual_recipe_or_ingredient_identity_verified!==false||
   x.processing_equivalence_confirmed!==false||
   x.source_limits_auto_applied!==false||
   x.actual_laboratory_results_verified!==false||
   x.all_contaminants_reviewed!==false||x.full_compliance_pass!==false||
   x.positive_source_basis?.length!==5||x.negative_transfer_controls?.length!==6||
   !x.finished_subroute_identity||!Array.isArray(x.source_article_candidates))return false;
  const z=x.source_article_candidates;
  if(x.source_family==="VERIFIED_MUSHROOM_SPECIES_ONLY_NOTS"){
   if(x.conditional_fssr_subroute!=="2.3.62"||z.length!==1||
    z[0].contaminant!=="Agaric acid"||z[0].article!=="Food containing mushrooms"||
    z[0].limit!==100||z[0].unit!=="ppm")return false;
  }else if(x.source_family==="VERIFIED_COMMERCIAL_CAN_FINISHED_TIN"){
   if(!["2.3.51","2.3.52"].includes(x.conditional_fssr_subroute)||
    z.length!==1||z[0].contaminant!=="Tin"||
    z[0].article!=="Canned foods other than beverages"||
    z[0].limit!==250||z[0].unit!=="mg/kg")return false;
  }else if(x.source_family==="VERIFIED_LISTED_CROP_FINISHED_COMPOSITE"){
   if(z.length!==2||!z.some(a=>a.contaminant==="Total Aflatoxins"&&
    a.article==="Food product containing any of the above mentioned food articles"&&
    a.limit===20&&a.unit==="µg/kg")||
    !z.some(a=>a.contaminant==="Aflatoxin B1"&&
    a.article==="Food product containing any of the above mentioned food articles"&&
    a.limit===10&&a.unit==="µg/kg"))return false;
  }else return false;
 }
 let matched=0,pending=0,changed=0;const remaining=new Set();
 for(let i=0;i<533;i++){
  const a=o.records[i],b=d.records[i];
  if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
   String(a.fssr||"")!==String(b.fssr||"")||
   String(a.fcs||"")!==String(b.fcs||"")||
   b.complete_contaminant_panel!==false||b.product_compliance_approval!==false||
   b.sample_lab_pass!==false)return false;
  const x=proof.get(a.catalog_id);
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
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")matched++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING"){pending++;remaining.add(b.catalog_id);}
  else return false;
 }
 if(matched!==475||pending!==58||changed!==12)return false;
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
 return seen.size===58&&pmsv475Ids.every(id=>q.promoted_catalog_ids.includes(id)&&!seen.has(id))&&
 q.promoted_catalog_ids.every(id=>!seen.has(id));
}
var pmsvBefore475Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore475Load();pmsv475Manifest=null;pmsv475Ledger=null;pmsv58Queue=null;
 try{
  const files=["fssai-twelve-positive-mushroom-canned-composite-subroutes-2026-10-12.json",
   "fssai-current-first-source-533-live-ledger-475-58-2026-10-12.json",
   "fssai-current-58-first-exact-source-proof-worklist-2026-10-12.json"];
  const rr=await Promise.all(files.map(x=>fetch("./data/rules/"+x+"?v=20261012-47558",{cache:"reload"})));
  if(rr.some(x=>!x.ok))throw Error("Latest 475/58 FSSAI files missing");
  [pmsv475Manifest,pmsv475Ledger,pmsv58Queue]=await Promise.all(rr.map(x=>x.json()));
  if(!pmsv475Valid())throw Error("Current FSSAI source integrity invalid");
 }catch(_){pmsv475Manifest=null;pmsv475Ledger=null;pmsv58Queue=null;}
};
function pmsv475Html(p){
 if(!p)return "";
 if(!pmsv475Valid())
  return '<div class="notice">Current 475/58 FSSAI source evidence unavailable; numeric contaminant and PASS withheld.</div>';
 const r=pmsv475Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
  String(r.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Latest source identity mismatch. No PASS.</div>';
 const e=s=>typeof esc==="function"?esc(String(s)):String(s);
 let h='<details class="card" style="margin-top:12px"><summary><b>Latest FSSAI first-source ledger — 475 partial / 58 pending</b> · '+
  e(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL CONDITIONAL NAMED SOURCE":"FIRST EXACT SOURCE PENDING")+
  '</summary><div class="notice">533 identities · 475 partial named sources · 58 first-source pending · ZERO tested-lot or compliance PASS.</div>';
 const x=pmsv475Manifest.products.find(y=>y.catalog_id===p.id);
 if(x){
  h+='<p><b>Source-verified CONDITIONAL subroute:</b> '+e(x.finished_subroute_identity)+
   '</p><p><b>Actual lot, recipe/species/packaging remain unverified.</b></p>'+
   '<p><b>CTR IX source references ONLY (not automatically applied):</b></p><ul>'+
   x.source_article_candidates.map(a=>'<li>'+e(a.contaminant)+': '+e(a.limit)+' '+
   e(a.unit)+' — '+e(a.article)+'</li>').join("")+'</ul>'+
   '<p><b>Affirmative legal and physical evidence required:</b></p><ul>'+
   x.positive_source_basis.map(z=>'<li>'+e(z)+'</li>').join("")+'</ul>'+
   '<p><b>Forbidden transfer:</b> '+x.negative_transfer_controls.map(e).join("; ")+'</p>'+
   '<div class="notice"><b>NO AUTOMATIC SOURCE LIMIT / SAMPLE PASS / COMPLIANCE APPROVAL.</b></div>'+
   '<small><a href="'+e(x.official_standard_url)+'" target="_blank" rel="noopener noreferrer">Official FSSR / FoSCoS identity</a> · '+
   '<a href="'+e(x.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official CTR IX</a></small>';
 }else if(r.source_status==="FIRST_EXACT_SOURCE_PENDING"){
  h+='<p>No positive first named article yet. Existing individual proof packet remains active.</p>';
 }else{
  h+='<p>Earlier named partial source retained, without a complete product compliance decision.</p>';
 }
 return h+'</details>';
}
// The original source-pinned wrapper invokes pmsv457Html dynamically at display time.
pmsv457Html=pmsv475Html;
var pmsvBefore475Local=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(!pmsv475Valid())return '<div class="notice">Latest 475/58 source integrity invalid. No PASS.</div>';
 const r=pmsv475Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
   String(r.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Source/product identity mismatch. No PASS.</div>';
 if(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH")return "";
 return pmsvBefore475Local(p);
};
