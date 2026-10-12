"use strict";
/* Current 438/95 source-only fat-spread nickel promotion; 95 individual legal
   identity packets. Never assign a numeric limit to unverified manufactured lots. */
var pmsv2026Current438Manifest=null,pmsv2026Current438Ledger=null,pmsv2026Current95Queue=null,pmsv2026Current95Dossiers=null;
const pmsv2026Current438Digests=Object.freeze({"manifest":"45538a7038708c21","ledger":"3b35cdeddcfddbd6","queue":"39dc2a3264472d4f","dossier":"ed3f00d37b5d9634"});
const pmsv2026Current438Fat="02-02-2-fat-spread";
function pmsv2026Current438Valid(){
 if(typeof pmsv2026Current437Valid!=="function"||!pmsv2026Current437Valid()||
    typeof pmsvReviewSnapshotDigest!=="function")return false;
 const m=pmsv2026Current438Manifest,d=pmsv2026Current438Ledger,q=pmsv2026Current95Queue,
       w=pmsv2026Current95Dossiers,old=pmsv2026Current437Ledger,prev=pmsv2026Current96Queue,c=contaminantsDb;
 if(!m||!d||!q||!w||!old||!prev||!c||
    pmsvReviewSnapshotDigest(m)!==pmsv2026Current438Digests.manifest||
    pmsvReviewSnapshotDigest(d)!==pmsv2026Current438Digests.ledger||
    pmsvReviewSnapshotDigest(q)!==pmsv2026Current438Digests.queue||
    pmsvReviewSnapshotDigest(w)!==pmsv2026Current438Digests.dossier||
    m.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
    m.promotion?.ctr_source!==c.official_sources?.[0]?.url||
    m.promotion?.source_version!==c.source_version||
    m.promotion?.fssr!=="2.2.5(3)"||
    m.promotion?.fssr_source!=="https://www.fssai.gov.in/upload/uploadfiles/files/Chapter%202_2_Fats%20oils%20and%20fat%20emulsions.pdf"||
    m.promotion?.contaminant!=="Nickel"||m.promotion?.maximum!==1.5||
    m.promotion?.unit!=="mg/kg"||!m.promotion?.ctr_article?.includes("fat spread")||
    m.promotion?.confirmed_qualifying_actual_lot!==false||
    m.promotion?.processing_qualifier_confirmed!==false||
    m.promotion?.numeric_finished_food_limit_auto_applied!==false||
    m.promotion?.full_legal_compliance_pass!==false||
    m.current?.catalogue!==533||m.current?.partial_exact!==438||
    m.current?.first_source_pending!==95||m.current?.full_approvals!==0||
    d.catalogue!==533||d.partial_exact!==438||d.first_source_pending!==95||
    d.full_compliance_approvals!==0||d.previous_archived_pending!==96||
    d.positive_delta_count!==1||d.records?.length!==533||
    d.baseline_file!=="fssai-current-first-source-533-live-ledger-437-96-2026-10-12.json"||
    d.promotion_manifest!=="fssai-fat-spread-nickel-first-source-2026-10-12.json"||
    q.catalogue!==533||q.partial_exact!==438||q.first_source_pending!==95||
    q.completed_compliance!==0||q.review_records?.length!==95||q.archive_96_count!==96||
    q.promoted_catalog_ids?.length!==21||q.subsequent_promotions!==21||
    q.current_ledger_file!=="fssai-current-first-source-533-live-ledger-438-95-2026-10-12.json"||
    w.source_policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||w.catalogue!==533||w.partial_exact!==438||
    w.first_source_pending!==95||w.complete_regulatory_passes!==0||
    w.records?.length!==95||w.high_priority_count<40||!w.every_remaining_identity_reviewed||
    old.partial_exact!==437||old.first_source_pending!==96||prev.review_records?.length!==96)return false;
 let partial=0,pending=0,diff=0;
 const p=m.promotion,oldProof=new Map(prev.review_records.map(x=>[x.catalog_id,x]));
 for(let i=0;i<533;i++){
  const a=old.records[i],b=d.records[i];
  if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
     String(a.fssr||"")!==String(b.fssr||"")||String(a.fcs||"")!==String(b.fcs||"")||
     b.sample_lab_pass!==false||b.product_compliance_approval!==false||
     b.complete_contaminant_panel!==false)return false;
  if(a.catalog_id!==pmsv2026Current438Fat){
    if(JSON.stringify(a)!==JSON.stringify(b))return false;
  }else{
    const v=b.regulatory_source_verified_delta;
    if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
       b.missing_first_exact_evidence!==false||p.catalog_id!==b.catalog_id||
       p.product_name!==b.product_name||p.fssr!==b.fssr||p.fcs!==b.fcs||
       v?.evidence_class!=="official_fssr_named_fat_spread_ctr_nickel_process_conditional"||
       v?.source_contaminant!=="Nickel"||v?.source_maximum!==1.5||
       v?.named_source_match_conditional!==true||
       v?.qualifying_process_verified_for_actual_lot!==false||
       v?.numeric_finished_food_limit_auto_applied!==false||
       v?.Minarine_lead_arsenic_transfer_prohibited!==true||
       v?.complete_contaminant_panel!==false||v?.full_compliance_pass!==false)return false;
    diff++;
  }
  if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")partial++;
  else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING")pending++;
  else return false;
 }
 if(partial!==438||pending!==95||diff!==1)return false;
 const expected=new Set(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 const qs=new Set(),ds=new Set();
 for(const x of q.review_records){
  if(qs.has(x.catalog_id)||!expected.has(x.catalog_id)||JSON.stringify(x)!==JSON.stringify(oldProof.get(x.catalog_id))||
     x.first_exact_source_verified!==false||x.numeric_finished_food_limit_auto_applied!==false||
     x.finished_food_laboratory_pass!==false||x.full_regulatory_compliance_approval!==false)return false;
  qs.add(x.catalog_id);
 }
 for(const x of w.records){
  const y=oldProof.get(x.catalog_id);
  if(ds.has(x.catalog_id)||!expected.has(x.catalog_id)||!y||
     x.product_name!==y.product_name||String(x.fssr||"")!==String(y.fssr||"")||
     String(x.fcs||"")!==String(y.fcs||"")||
     x.current_evidence_status!=="FIRST_EXACT_FINISHED_ARTICLE_SOURCE_PENDING"||
     x.first_positive_finished_article_proof_missing!==true||
     x.actual_lot_identity_verified!==false||x.numeric_finished_food_limit_auto_applied!==false||
     x.laboratory_pass!==false||x.full_regulatory_compliance_approval!==false||
     x.source_article_candidates_are_not_compliance_claims!==true||
     x.post_compendium_amendments_current_effectivity_not_cleared!==true||
     !x.recorded_required_evidence?.length||!x.specialist_identity_gate||
     !x.prohibited_analogy)return false;
  ds.add(x.catalog_id);
 }
 return expected.size===95&&qs.size===95&&ds.size===95&&
   q.promoted_catalog_ids.includes(pmsv2026Current438Fat)&&!qs.has(pmsv2026Current438Fat);
}
var pmsvBefore438Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore438Load();
 pmsv2026Current438Manifest=null;pmsv2026Current438Ledger=null;
 pmsv2026Current95Queue=null;pmsv2026Current95Dossiers=null;
 try{
  const files=["fssai-fat-spread-nickel-first-source-2026-10-12.json",
   "fssai-current-first-source-533-live-ledger-438-95-2026-10-12.json",
   "fssai-current-95-first-exact-source-proof-worklist-2026-10-12.json",
   "fssai-95-current-pending-finished-food-evidence-dossiers-2026-10-12.json"];
  const res=await Promise.all(files.map(n=>fetch("./data/rules/"+n+"?v=20261012-43895",{cache:"reload"})));
  if(res.some(x=>!x.ok))throw Error("Source-only 438/95 dataset missing");
  [pmsv2026Current438Manifest,pmsv2026Current438Ledger,pmsv2026Current95Queue,pmsv2026Current95Dossiers]=
    await Promise.all(res.map(x=>x.json()));
  if(!pmsv2026Current438Valid())throw Error("FSSAI source-only digest failure");
 }catch(_){pmsv2026Current438Manifest=null;pmsv2026Current438Ledger=null;
   pmsv2026Current95Queue=null;pmsv2026Current95Dossiers=null;}
};
function pmsv2026Current438Html(p){
 if(!p)return "";
 if(!pmsv2026Current438Valid())return '<div class="notice">438/95 FSSAI source integrity not verified; no contaminant PASS.</div>';
 const r=pmsv2026Current438Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||
    String(r.fcs||"")!==String(p.fcs||""))
    return '<div class="notice">Latest catalogue identity mismatch. Source withheld.</div>';
 const pfx='<details class="card" style="margin-top:12px"><summary><b>Current verified FSSAI source ledger — 438/95</b> · '+
 esc(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL EXACT SOURCE MATCH":"FIRST EXACT SOURCE PENDING")+
 '</summary><div class="notice"><b>533 catalogue products · 438 partial exact-source matches · 95 first-source pending · 0 complete legal or lab PASS.</b></div>';
 if(p.id===pmsv2026Current438Fat){
  const f=pmsv2026Current438Manifest.promotion;
  return pfx+'<p><b>Positive conditional source:</b> FSSR '+esc(f.fssr)+' '+esc(f.product_name)+
   '; CTR Version IX Nickel <b>1.5 mg/kg</b> for qualified hydrogenated/interesterified vegetable-fat spreads, NOT all fat spreads.</p>'+
   '<p><b>Required lot evidence:</b> '+f.manufacturer_evidence_needed.map(esc).join("; ")+'</p>'+
   '<p><b>Excluded:</b> '+f.excluded.map(esc).join("; ")+'</p>'+
   '<p><b>Separate Minarine rule:</b> '+esc(f.other_article_condition)+'</p>'+
   '<p>Actual processing qualification, laboratory result, completeness of contaminants and latest amendments remain unverified. Numeric limits are NOT applied or passed.</p>'+
   '<small><a href="'+esc(f.fssr_source)+'" target="_blank" rel="noopener noreferrer">Official FSSR 2.2.5(3)</a> · '+
   '<a href="'+esc(f.ctr_source)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX Nickel</a></small></details>';
 }
 const x=pmsv2026Current95Dossiers.records.find(x=>x.catalog_id===p.id);
 if(!x)return pfx+'<p>Not individually source-reviewed in this version.</p></details>';
 return pfx+'<p><b>Outstanding exact finished-article identity evidence:</b> '+x.recorded_required_evidence.map(esc).join("; ")+'</p>'+
  '<p><b>Detailed product-specific regulator decision gate:</b> '+esc(x.specialist_identity_gate)+'</p>'+
  '<p><b>Do not transfer:</b> '+esc(x.prohibited_analogy)+'</p>'+
  '<p><b>Earlier case warning:</b> '+esc(x.inherited_nontransfer_warning)+'</p>'+
  '<p><b>Research candidates, NOT an approved article:</b> '+esc(x.source_article_candidate_keys_for_research_only.join(", ")||"None")+'</p>'+
  '<p>Version IX is dated 3 February 2026; subsequent amendment effectivity still requires checking. No numerical assignment or regulatory PASS.</p>'+
  '<small><a href="'+esc(x.official_product_standard)+'" target="_blank" rel="noopener noreferrer">FSSAI/FoSCoS product identity</a> · '+
  '<a href="'+esc(x.official_ctr)+'" target="_blank" rel="noopener noreferrer">CTR Version IX</a></small></details>';
}
var pmsvBefore438Proof=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 const current=pmsv2026Current438Html(p);
 if(!p||!pmsv2026Current438Valid())return current;
 let older=pmsvBefore438Proof(p);
 older=older.replace(/<details class="card" style="margin-top:12px"><summary><b>Current FSSAI exact-source ledger — 437\/96<\/b>[\s\S]*?<\/details>/,"");
 return current+older;
};
var pmsvBefore438Local=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(!pmsv2026Current438Valid())return '<div class="notice">438/95 ledger unavailable. No PASS.</div>';
 if(p.id===pmsv2026Current438Fat)return "";
 return pmsvBefore438Local(p);
};
