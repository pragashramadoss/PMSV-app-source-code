"use strict";
/* 428/105 current first-source evidence. Five conditional exact-named subroutes.
   No numeric auto-application, lot PASS, or full-regulatory clearance. */
var pmsv2026Current428Manifest=null,pmsv2026Current428Ledger=null,pmsv2026Current105Queue=null;
const pmsv2026Current428Digests=Object.freeze({"manifest":"4dba27ea1fb5a40d","ledger":"28727abf269d178a","queue":"45de544e571f3479"});
const pmsv2026Current428Ids=Object.freeze(["04-04-1-thermally-processed-fruit-salad-cocktail-mix","04-04-2-thermally-processed-vegetables","04-04-1-fruits-and-vegetable-chutney","04-04-2-sterilized-fungi","99-99-1-acidity-regulators-l-tartaric-acid"]);
function pmsv2026Current428Valid(){
 if(typeof pmsv2026Current423Valid!=="function"||!pmsv2026Current423Valid()||
    typeof pmsvReviewSnapshotDigest!=="function")return false;
 const m=pmsv2026Current428Manifest,d=pmsv2026Current428Ledger,q=pmsv2026Current105Queue,
       old=pmsv2026Current423Ledger,prev=pmsv2026Current110Queue,c=contaminantsDb;
 if(!m||!d||!q||!old||!prev||!c||
    pmsvReviewSnapshotDigest(m)!==pmsv2026Current428Digests.man||
    pmsvReviewSnapshotDigest(d)!==pmsv2026Current428Digests.ledger||
    pmsvReviewSnapshotDigest(q)!==pmsv2026Current428Digests.queue||
    m.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
    m.ctr_source!==c.official_sources?.[0]?.url||m.source_version!==c.source_version||
    m.promotions?.length!==5||m.no_auto_numeric_application!==true||m.no_lot_approval!==true||
    m.nonqualifying_catalogue_variants_remain_unmatched!==true||
    m.baseline?.catalogue!==533||m.baseline?.partial_exact!==423||m.baseline?.first_source_pending!==110||
    m.latest?.catalogue!==533||m.latest?.partial_exact!==428||
    m.latest?.first_source_pending!==105||m.latest?.full_approvals!==0||
    d.catalogue!==533||d.partial_exact!==428||d.first_source_pending!==105||
    d.full_compliance_approvals!==0||d.previous_archived_pending!==110||
    d.positive_delta_count!==5||d.records?.length!==533||
    d.baseline_file!=="fssai-current-first-source-533-live-ledger-423-110-2026-10-12.json"||
    d.promotion_manifest!=="fssai-five-exact-conditional-finished-subroute-2026-10-12.json"||
    q.catalogue!==533||q.partial_exact!==428||q.first_source_pending!==105||
    q.completed_compliance!==0||q.archive_110_count!==110||
    q.review_records?.length!==105||q.promoted_catalog_ids?.length!==11||
    q.subsequent_promotions!==11||
    q.current_ledger_file!=="fssai-current-first-source-533-live-ledger-428-105-2026-10-12.json"||
    q.baseline_file!=="fssai-current-110-first-exact-source-proof-worklist-2026-10-12.json"||
    old.partial_exact!==423||old.first_source_pending!==110||prev.review_records?.length!==110)return false;
 const set=new Set(pmsv2026Current428Ids);
 if(set.size!==5||m.promotions.some(x=>!set.has(x.catalog_id)||x.ctr_source!==m.ctr_source||
   x.qualifying_conditional_subroute_only!==true||x.actual_lot_identity_verified!==false||
   x.numeric_finished_food_limit_auto_applied!==false||x.laboratory_pass!==false||
   x.complete_contaminant_panel!==false||x.full_compliance_approval!==false||
   !x.requirements?.length||!x.excluded?.length||!x.rows?.length||
   x.rows.some(y=>!["Lead","Arsenic","Tin"].includes(y.metal)||!Number.isFinite(y.max)||
     y.max<=0||y.unit!=="mg/kg"||!y.article||!y.ctr_page)))return false;
 const mp=new Map(m.promotions.map(x=>[x.catalog_id,x]));
 let partial=0,pending=0,delta=0;
 for(let i=0;i<533;i++){
  const a=old.records[i],b=d.records[i];
  if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
     String(a.fssr||"")!==String(b.fssr||"")||String(a.fcs||"")!==String(b.fcs||"")||
     b.sample_lab_pass!==false||b.product_compliance_approval!==false||
     b.complete_contaminant_panel!==false)return false;
  if(!set.has(a.catalog_id)){if(JSON.stringify(a)!==JSON.stringify(b))return false;}
  else{
   const z=mp.get(a.catalog_id),v=b.regulatory_source_verified_delta;
   if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
      b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
      b.missing_first_exact_evidence!==false||z.product_name!==b.product_name||
      String(z.fssr||"")!==String(b.fssr||"")||String(z.fcs||"")!==String(b.fcs||"")||
      v?.evidence_class!=="official_fssr_named_conditional_finished_subtype"||
      v?.conditional_subtype!==z.subtype||v?.source_article!==z.article||
      JSON.stringify(v?.source_rows)!==JSON.stringify(z.rows)||
      v?.only_if_specific_finished_subtype_confirmed!==true||
      v?.actual_lot_identity_verified!==false||
      v?.numeric_finished_food_limit_auto_applied!==false||
      v?.other_contaminants_cleared!==false||v?.full_compliance_pass!==false)return false;
   delta++;
  }
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")partial++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING")pending++;
  else return false;
 }
 if(delta!==5||partial!==428||pending!==105)return false;
 const expected=new Set(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 const oldProof=new Map(prev.review_records.map(x=>[x.catalog_id,x]));
 const current=new Set();
 for(const x of q.review_records){
  if(current.has(x.catalog_id)||!expected.has(x.catalog_id)||
     JSON.stringify(x)!==JSON.stringify(oldProof.get(x.catalog_id))||
     x.first_exact_source_verified!==false||
     x.numeric_finished_food_limit_auto_applied!==false||
     x.finished_food_laboratory_pass!==false||
     x.full_regulatory_compliance_approval!==false)return false;
  current.add(x.catalog_id);
 }
 return expected.size===105&&current.size===105&&
   pmsv2026Current428Ids.every(x=>!current.has(x)&&q.promoted_catalog_ids.includes(x));
}
var pmsvBefore428Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore428Load();
 pmsv2026Current428Manifest=null;pmsv2026Current428Ledger=null;pmsv2026Current105Queue=null;
 try{
  const files=["fssai-five-exact-conditional-finished-subroute-2026-10-12.json",
    "fssai-current-first-source-533-live-ledger-428-105-2026-10-12.json",
    "fssai-current-105-first-exact-source-proof-worklist-2026-10-12.json"];
  const res=await Promise.all(files.map(f=>fetch("./data/rules/"+f+"?v=20261012-428105",{cache:"reload"})));
  if(res.some(x=>!x.ok))throw Error("Current 428/105 evidence unavailable");
  [pmsv2026Current428Manifest,pmsv2026Current428Ledger,pmsv2026Current105Queue]=await Promise.all(res.map(x=>x.json()));
  if(!pmsv2026Current428Valid())throw Error("Source integrity check failed");
 }catch(_){pmsv2026Current428Manifest=null;pmsv2026Current428Ledger=null;pmsv2026Current105Queue=null;}
};
function pmsv2026Current428Html(p){
 if(!p)return "";
 if(!pmsv2026Current428Valid())
   return '<div class="notice">Current 428/105 FSSAI evidence unavailable. No numeric assignment or PASS.</div>';
 const r=pmsv2026Current428Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
   String(r.fcs||"")!==String(p.fcs||""))
   return '<div class="notice">Current FSSAI identity mismatch. Evidence withheld.</div>';
 const e=pmsv2026Current428Manifest.promotions.find(x=>x.catalog_id===p.id);
 let h='<details class="card" style="margin-top:12px"><summary><b>Current FSSAI evidence ledger — 428/105</b> · '+
   esc(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL EXACT SOURCE MATCH":"FIRST EXACT SOURCE PENDING")+'</summary>'+
   '<div class="notice"><b>533 identities · 428 partial exact-source matches · 105 pending · 0 full compliance or laboratory PASS.</b> A source match is not evidence of tested-lot compliance.</div>';
 if(e){
  h+='<p><b>Official source-matched SUBTYPE only:</b> '+esc(e.subtype)+'. Wider catalogue alternatives remain unverified.</p>'+
   '<p><b>Source article(s) requiring lot-specific identity confirmation:</b></p><ul>'+
    e.rows.map(v=>'<li>'+esc(v.metal)+': '+esc(v.article)+' — <b>'+esc(String(v.max))+' '+esc(v.unit)+'</b> (CTR PDF p'+esc(String(v.ctr_page))+')</li>').join('')+'</ul>'+
   '<p><b>Still required:</b> '+e.requirements.map(esc).join('; ')+'</p>'+
   '<p><b>Do not inherit:</b> '+e.excluded.map(esc).join('; ')+'</p>'+
   '<p><b>No limit is automatically applied to an actual lot; no complete contaminant, food safety or analytical PASS.</b></p>'+
   '<small><a href="'+esc(e.standard)+'" target="_blank" rel="noopener noreferrer">Official product identity</a> · '+
   '<a href="'+esc(e.ctr_source)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX</a></small>';
 }else h+='<p>No first exact named finished-product source has been established. Complete source, recipe, matrix and sample checks before assigning limits.</p>';
 return h+'</details>';
}
var pmsvBefore428Proof=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 const fresh=pmsv2026Current428Html(p);
 if(!p||!pmsv2026Current428Valid())return fresh;
 let old=pmsvBefore428Proof(p);
 old=old.replace(/<details class="card" style="margin-top:12px"><summary><b>Current verified FSSAI ledger — 423\/110<\/b>[\s\S]*?<\/details>/,"");
 old=old.replaceAll("Current first-source decision — 111 remaining","Archived 111-item source decision")
        .replaceAll("Current 111-queue source-row crosscheck","Archived 111-source crosswalk")
        .replaceAll("423 partial source matches / 110 pending / 0 compliance PASS.","Archived 423/110 source evidence; current 428/105 is shown above.");
 if(pmsv2026Current428Ids.includes(p.id))
   old=old.replace(/<details class="card" style="margin-top:12px"><summary><b>Archived 111-item source decision<\/b>[\s\S]*?<\/details>/,"");
 return fresh+old;
};
var pmsvBefore428Local=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(!pmsv2026Current428Valid())
   return '<div class="notice">Latest 428/105 first-source state not verified. No PASS.</div>';
 if(pmsv2026Current428Ids.includes(p.id))return "";
 return pmsvBefore428Local(p);
};
