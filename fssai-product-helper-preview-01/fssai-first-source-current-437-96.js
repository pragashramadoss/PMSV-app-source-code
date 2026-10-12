"use strict";
/* Current 437/96, nine conditional edible mushroom and mushroom-pickle subtypes,
   NOT verified marketed lots, lab clearance, or universal fungi article. */
var pmsv2026Current437Manifest=null,pmsv2026Current437Ledger=null,pmsv2026Current96Queue=null,pmsv2026Current437SourceCrosswalk=null;
const pmsv2026Current437Digests=Object.freeze({"manifest":"80b089d687094493","ledger":"66c8fa2abc68f153","queue":"b07d4ac8eb7badf3"});
const pmsv2026Current437Ids=Object.freeze(["04-04-2-quick-frozen-fungi","04-04-2-dried-fungi","04-04-2-fungi-grits-and-fungi-powder","04-04-2-pickles-made-from-vegetables-or-other-edible-plant-material-including-mushrooms","04-04-2-pickles-made-from-combination-of-fruits-or-vegetables-or-other-edible-plant-materi","04-04-2-fungi-in-olive-oil-and-other-vegetable-oils","04-04-2-salted-fungi-semi-processed-products","04-04-2-pickled-fungi","04-04-2-fermented-fungi"]);
const pmsv2026Current437RemainPending=Object.freeze(["04-04-2-fungi-extract-and-fungi-concentrate","04-04-2-dried-fungi-concentrate"]);
function pmsv2026Current437Valid(){
 if(typeof pmsv2026Current428Valid!=="function"||!pmsv2026Current428Valid()||
    typeof pmsvReviewSnapshotDigest!=="function")return false;
 const m=pmsv2026Current437Manifest,d=pmsv2026Current437Ledger,q=pmsv2026Current96Queue,
   old=pmsv2026Current428Ledger,prev=pmsv2026Current105Queue,s=pmsv2026Current437SourceCrosswalk,c=contaminantsDb;
 if(!m||!d||!q||!old||!prev||!s||!c||
    pmsvReviewSnapshotDigest(m)!==pmsv2026Current437Digests.man||
    pmsvReviewSnapshotDigest(d)!==pmsv2026Current437Digests.ledger||
    pmsvReviewSnapshotDigest(q)!==pmsv2026Current437Digests.queue||
    m.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
    m.official_ctr!==c.official_sources?.[0]?.url||
    m.date_source_version!==c.source_version||
    m.official_ctr_named_article!=="Food containing mushrooms"||m.official_contaminant!=="Agaric acid"||
    m.official_maximum!==100||m.official_unit!=="ppm"||
    s.official_ctr!==m.official_ctr||s.official_fssr!==m.official_fssr||
    s.source_version!==m.date_source_version||
    s.source_articles?.filter(x=>x.key==="agaric_mushroom"&&x.metal===m.official_contaminant&&
       x.article===m.official_ctr_named_article&&x.unit==="ppm"&&x.value===100).length!==1||
    m.promotions?.length!==9||m.no_lab_passes!==true||m.no_numeric_auto_application!==true||
    m.no_unconditional_species_match!==true||
    m.excluded_still_pending?.length!==2||m.latest?.catalogue!==533||
    m.baseline?.catalogue!==533||m.baseline?.partial_exact!==428||m.baseline?.first_source_pending!==105||
    m.latest?.partial_exact!==437||m.latest?.first_source_pending!==96||m.latest?.full_approvals!==0||
    d.catalogue!==533||d.partial_exact!==437||d.first_source_pending!==96||d.records?.length!==533||
    d.full_compliance_approvals!==0||d.previous_archived_pending!==105||d.positive_delta_count!==9||
    d.baseline_file!=="fssai-current-first-source-533-live-ledger-428-105-2026-10-12.json"||
    d.promotion_manifest!=="fssai-nine-mushroom-containing-exact-named-subroutes-2026-10-12.json"||
    q.catalogue!==533||q.partial_exact!==437||q.first_source_pending!==96||q.completed_compliance!==0||
    q.archive_105_count!==105||q.current_ledger_file!=="fssai-current-first-source-533-live-ledger-437-96-2026-10-12.json"||
    q.review_records?.length!==96||q.subsequent_promotions!==20||
    q.promoted_catalog_ids?.length!==20||
    old.partial_exact!==428||old.first_source_pending!==105||prev.review_records?.length!==105)return false;
 const pids=new Set(pmsv2026Current437Ids),map=new Map(m.promotions.map(x=>[x.catalog_id,x]));
 if(pids.size!==9||map.size!==9)return false;
 if(m.promotions.some(x=>!pids.has(x.catalog_id)||x.source_article!==m.official_ctr_named_article||
    x.substance!==m.official_contaminant||x.maximum!==100||x.unit!=="ppm"||
    x.product_source!==m.official_fssr||x.contaminant_source!==m.official_ctr||
    !["2.3.43","2.3.62"].includes(x.fssr)||x.official_subtype_identity_supported!==true||
    x.actual_lot_mushroom_species_confirmed!==false||
    x.actual_finished_product_mushroom_content_confirmed!==false||
    x.source_limit_numeric_auto_application!==false||x.complete_contaminant_panel!==false||
    x.full_regulatory_compliance_pass!==false||x.laboratory_pass!==false||
    !x.mandatory_checks?.length||!x.prohibited_transfers?.length||
    x.conditional_source_only!==true))return false;
 let matched=0,pending=0,changed=0;
 for(let i=0;i<533;i++){
  const a=old.records[i],b=d.records[i];
  if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
     String(a.fssr||"")!==String(b.fssr||"")||String(a.fcs||"")!==String(b.fcs||"")||
     b.complete_contaminant_panel!==false||b.product_compliance_approval!==false||
     b.sample_lab_pass!==false)return false;
  if(!pids.has(a.catalog_id)){if(JSON.stringify(a)!==JSON.stringify(b))return false;}
  else{
    const z=map.get(a.catalog_id),delta=b.regulatory_source_verified_delta;
    if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
       b.missing_first_exact_evidence!==false||b.regulatory_coverage!=="PARTIAL_CONDITIONAL_MUSHROOM_SUBTYPE_ONLY"||
       z.product_name!==b.product_name||String(z.fssr||"")!==String(b.fssr||"")||
       String(z.fcs||"")!==String(b.fcs||"")||
       delta?.evidence_class!=="FSSR_2_3_62_OR_2_3_43_CONFIRMED_MUSHROOM_FOOD_CONDITIONAL_NOT_LOT"||
       delta?.source_article!==z.source_article||delta?.substance!==z.substance||
       delta?.maximum!==100||delta?.unit!=="ppm"||delta?.strict_subtype!==z.strict_subtype||
       delta?.actual_lot_mushroom_species_confirmed!==false||
       delta?.actual_finished_product_mushroom_content_confirmed!==false||
       delta?.numeric_finished_food_limit_auto_applied!==false||delta?.complete_panel_verified!==false||
       delta?.full_compliance_pass!==false)return false;
    changed++;
  }
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")matched++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING")pending++;
  else return false;
 }
 if(matched!==437||pending!==96||changed!==9)return false;
 const oldQ=new Map(prev.review_records.map(x=>[x.catalog_id,x]));
 const expected=new Set(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id)),current=new Set();
 for(const x of q.review_records){
  if(current.has(x.catalog_id)||!expected.has(x.catalog_id)||
     JSON.stringify(x)!==JSON.stringify(oldQ.get(x.catalog_id))||
     x.first_exact_source_verified!==false||
     x.numeric_finished_food_limit_auto_applied!==false||
     x.finished_food_laboratory_pass!==false||
     x.full_regulatory_compliance_approval!==false)return false;
  current.add(x.catalog_id);
 }
 return expected.size===96&&current.size===96&&
   pmsv2026Current437RemainPending.every(x=>current.has(x)&&!pids.has(x))&&
   pmsv2026Current437Ids.every(x=>!current.has(x)&&q.promoted_catalog_ids.includes(x));
}
var pmsvBefore437Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore437Load();
 pmsv2026Current437Manifest=null;pmsv2026Current437Ledger=null;
 pmsv2026Current96Queue=null;pmsv2026Current437SourceCrosswalk=null;
 try{
  const files=["fssai-nine-mushroom-containing-exact-named-subroutes-2026-10-12.json",
    "fssai-current-first-source-533-live-ledger-437-96-2026-10-12.json",
    "fssai-current-96-first-exact-source-proof-worklist-2026-10-12.json",
    "fssai-20-fungi-fruit-tomato-exact-article-branches-2026-10-11.json"];
  const a=await Promise.all(files.map(x=>fetch("./data/rules/"+x+"?v=20261012-43796",{cache:"reload"})));
  if(a.some(x=>!x.ok))throw Error("437/96 source evidence unavailable");
  [pmsv2026Current437Manifest,pmsv2026Current437Ledger,pmsv2026Current96Queue,
   pmsv2026Current437SourceCrosswalk]=await Promise.all(a.map(x=>x.json()));
  if(!pmsv2026Current437Valid())throw Error("437/96 evidence integrity check failed");
 }catch(_){
  pmsv2026Current437Manifest=null;pmsv2026Current437Ledger=null;
  pmsv2026Current96Queue=null;pmsv2026Current437SourceCrosswalk=null;
 }
};
function pmsv2026Current437Html(p){
 if(!p)return "";
 if(!pmsv2026Current437Valid())
  return '<div class="notice">Latest 437/96 official FSSAI source evidence unavailable; no numeric compliance or PASS.</div>';
 const r=pmsv2026Current437Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
   String(r.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Current official catalogue identity mismatch. Withholding evidence.</div>';
 let h='<details class="card" style="margin-top:12px"><summary><b>Current FSSAI exact-source ledger — 437/96</b> · '+
    esc(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL EXACT SOURCE MATCH":"FIRST EXACT SOURCE PENDING")+'</summary>'+
    '<div class="notice"><b>533 products · 437 partial exact named-source matches · 96 still pending · 0 full laboratory or regulatory PASS.</b></div>';
 const x=pmsv2026Current437Manifest.promotions.find(x=>x.catalog_id===p.id);
 if(x){
  h+='<p><b>Positive legal source only when exact finished food is:</b> '+esc(x.strict_subtype)+'</p>'+
   '<p><b>FSSAI Contaminants Version IX §2.2:</b> <b>Agaric acid 100 ppm</b>, named article <b>Food containing mushrooms</b>. Actual mushroom content and species are NOT yet verified.</p>'+
   '<p><b>Identity/analytical evidence still needed:</b> '+x.mandatory_checks.map(esc).join("; ")+'</p>'+
   '<p><b>Never inherit from:</b> '+x.prohibited_transfers.map(esc).join("; ")+'</p>'+
   '<p>Other fungi, fungal extracts without confirmed regulatory classification, and canned mushroom metals are not cleared. No limit is auto-applied or laboratory PASS given.</p>'+
   '<small><a href="'+esc(x.product_source)+'" target="_blank" rel="noopener noreferrer">Official FSSR '+esc(x.fssr)+'</a> · '+
   '<a href="'+esc(x.contaminant_source)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX Agaric acid article</a></small>';
 }else h+='<p>No additional positive finished-product CTR source established in this batch. Previous requirements remain.</p>';
 return h+'</details>';
}
var pmsvBefore437Proof=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 const current=pmsv2026Current437Html(p);
 if(!p||!pmsv2026Current437Valid())return current;
 let archived=pmsvBefore437Proof(p);
 archived=archived.replace(/<details class="card" style="margin-top:12px"><summary><b>Current FSSAI evidence ledger — 428\/105<\/b>[\s\S]*?<\/details>/,"");
 if(pmsv2026Current437Ids.includes(p.id)){
  archived=archived.replace(/<details class="card" style="margin-top:12px"><summary><b>Archived 111-item source decision<\/b>[\s\S]*?<\/details>/,"");
 }
 return current+archived;
};
var pmsvBefore437Local=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(!pmsv2026Current437Valid())
   return '<div class="notice">Latest current 437/96 source ledger unavailable; no PASS.</div>';
 if(pmsv2026Current437Ids.includes(p.id))return "";
 return pmsvBefore437Local(p);
};
