"use strict";
var pmsv442Source=null,pmsv442Ledger=null,pmsv91Queue=null,pmsv91Dossiers=null;
const pmsv442Digests=Object.freeze({"source":"2bd40d0023e73889","ledger":"afc2c46630ef8987","queue":"c3cabdbb12233248","dossiers":"c1f1db4a88e90e4f"});
const pmsv442Ids=Object.freeze(["11-11-1-khandsari-sugar","11-11-1-bura-sugar","11-11-1-plantation-white-sugar","11-11-3-golden-syrup"]);
function pmsv442Valid(){
 if(typeof pmsv2026Current438Valid!=="function"||!pmsv2026Current438Valid()||typeof pmsvReviewSnapshotDigest!=="function")return false;
 const s=pmsv442Source,d=pmsv442Ledger,q=pmsv91Queue,w=pmsv91Dossiers,
 o=pmsv2026Current438Ledger,p=pmsv2026Current95Queue,c=contaminantsDb;
 if(!s||!d||!q||!w||!o||!p||!c||
    pmsvReviewSnapshotDigest(s)!==pmsv442Digests.source||
    pmsvReviewSnapshotDigest(d)!==pmsv442Digests.ledger||
    pmsvReviewSnapshotDigest(q)!==pmsv442Digests.queue||
    pmsvReviewSnapshotDigest(w)!==pmsv442Digests.dossiers||
    s.source_policy!=="OFFICIAL_FSSAI_ONLY"||s.official_ctr!==c.official_sources?.[0]?.url||
    s.source_version!==c.source_version||s.lead_mgkg!==5||
    s.required_sulphated_ash_percent_gt!==1||s.no_total_ash_or_HCl_insoluble_equivalence!==true||
    s.actual_lot_assay_verified!==false||s.no_auto_numeric_application!==true||
    s.no_compliance_pass!==true||s.promotions?.length!==4||s.pending_sugar_exclusions?.length!==4||
    d.catalogue!==533||d.partial_exact!==442||d.first_source_pending!==91||d.records?.length!==533||
    d.full_compliance_approvals!==0||d.previous_archived_pending!==95||d.positive_delta_count!==4||
    q.catalogue!==533||q.partial_exact!==442||q.first_source_pending!==91||q.review_records?.length!==91||
    q.completed_compliance!==0||q.archive_95_count!==95||q.subsequent_promotions!==25||
    q.promoted_catalog_ids?.length!==25||
    w.catalogue!==533||w.partial_exact!==442||w.first_source_pending!==91||
    w.complete_regulatory_passes!==0||w.remaining_records?.length!==91||
    o.partial_exact!==438||o.first_source_pending!==95||p.review_records?.length!==95)return false;
 const ids=new Set(pmsv442Ids),prom=new Map(s.promotions.map(x=>[x.catalog_id,x]));
 if(ids.size!==4||prom.size!==4||s.promotions.some(x=>!ids.has(x.catalog_id)||
   x.ctr_article!==s.ctr_article||x.official_ctr!==s.official_ctr||
   x.official_product_standard!==s.official_product_standard||
   x.verified_sugar_article_subtype_source_only!==true||
   x.contaminant!=="Lead"||x.source_limit!==5||x.unit!=="mg/kg"||
   x.lot_sulphated_ash_assayed!==false||x.numeric_limit_auto_applied!==false||
   x.lab_pass!==false||x.full_compliance_pass!==false))return false;
 let exact=0,pending=0,changed=0;
 for(let i=0;i<533;i++){
   const a=o.records[i],b=d.records[i];
   if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
      String(a.fssr||"")!==String(b.fssr||"")||String(a.fcs||"")!==String(b.fcs||"")||
      b.sample_lab_pass!==false||b.product_compliance_approval!==false||b.complete_contaminant_panel!==false)return false;
   if(!ids.has(a.catalog_id)){if(JSON.stringify(a)!==JSON.stringify(b))return false;}
   else{
    const z=prom.get(a.catalog_id),v=b.regulatory_source_verified_delta;
    if(a.source_status!=="FIRST_EXACT_SOURCE_PENDING"||b.source_status!=="PARTIAL_EXACT_SOURCE_MATCH"||
       z.product_name!==b.product_name||z.fssr!==b.fssr||b.missing_first_exact_evidence!==false||
       v?.evidence_class!=="OFFICIAL_SUGAR_HIGH_SULPHATED_ASH_GT1_NAMED_SOURCE"||
       v?.source_limit_mgkg!==5||v?.actual_finished_lot_sulphated_ash_verified!==false||
       v?.numeric_finished_food_limit_auto_applied!==false||v?.lab_pass!==false||
       v?.complete_regulatory_pass!==false)return false;changed++;
   }
   if(b.source_status==="PARTIAL_EXACT_SOURCE_MATCH")exact++;
   else if(b.source_status==="FIRST_EXACT_SOURCE_PENDING")pending++;
   else return false;
 }
 if(exact!==442||pending!==91||changed!==4)return false;
 const prev=new Map(p.review_records.map(x=>[x.catalog_id,x]));
 const expected=new Set(d.records.filter(x=>x.source_status==="FIRST_EXACT_SOURCE_PENDING").map(x=>x.catalog_id));
 const seen=new Set(),seen2=new Set();
 for(const x of q.review_records){
  if(seen.has(x.catalog_id)||!expected.has(x.catalog_id)||JSON.stringify(x)!==JSON.stringify(prev.get(x.catalog_id))||
     x.first_exact_source_verified!==false||x.numeric_finished_food_limit_auto_applied!==false||
     x.finished_food_laboratory_pass!==false||x.full_regulatory_compliance_approval!==false)return false;
  seen.add(x.catalog_id);
 }
 for(const x of w.remaining_records){
  if(seen2.has(x.catalog_id)||!expected.has(x.catalog_id)||x.still_first_source_pending!==true||
     x.no_new_numeric_product_pass!==true||x.first_positive_finished_article_proof_missing!==true||
     x.actual_lot_identity_verified!==false||x.laboratory_pass!==false||
     x.full_regulatory_compliance_approval!==false)return false;
  seen2.add(x.catalog_id);
 }
 return expected.size===91&&seen.size===91&&seen2.size===91&&
   pmsv442Ids.every(x=>!expected.has(x)&&q.promoted_catalog_ids.includes(x))&&
   s.pending_sugar_exclusions.every(x=>expected.has(x.catalog_id));
}
var pmsvBefore442Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBefore442Load();
 pmsv442Source=null;pmsv442Ledger=null;pmsv91Queue=null;pmsv91Dossiers=null;
 try{
  const names=["fssai-four-sugar-high-ash-conditional-source-2026-10-12.json",
  "fssai-current-first-source-533-live-ledger-442-91-2026-10-12.json",
  "fssai-current-91-first-exact-source-proof-worklist-2026-10-12.json",
  "fssai-91-remaining-sugar-ash-evidence-decisions-2026-10-12.json"];
  const res=await Promise.all(names.map(n=>fetch("./data/rules/"+n+"?v=20261012-44291",{cache:"reload"})));
  if(res.some(r=>!r.ok))throw Error("442/91 source data missing");
  [pmsv442Source,pmsv442Ledger,pmsv91Queue,pmsv91Dossiers]=await Promise.all(res.map(r=>r.json()));
  if(!pmsv442Valid())throw Error("FSSAI 442/91 evidence integrity failure");
 }catch(_){pmsv442Source=null;pmsv442Ledger=null;pmsv91Queue=null;pmsv91Dossiers=null;}
};
function pmsv442Html(p){
 if(!p)return "";
 if(!pmsv442Valid())return '<div class="notice">442/91 official FSSAI evidence not verified. No numeric limit or PASS.</div>';
 const r=pmsv442Ledger.records.find(x=>x.catalog_id===p.id);
 if(!r||r.product_name!==p.name||String(r.fssr||"")!==String(p.fssr||"")||String(r.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">Current source catalogue identity mismatch. Evidence withheld.</div>';
 const intro='<details class="card" style="margin-top:12px"><summary><b>Current FSSAI first-source ledger — 442/91</b> · '+
 esc(r.source_status==="PARTIAL_EXACT_SOURCE_MATCH"?"PARTIAL EXACT SOURCE MATCH":"FIRST EXACT SOURCE PENDING")+'</summary>'+
 '<div class="notice">533 identities · 442 partial first sources · 91 pending · 0 full laboratory/compliance PASS.</div>';
 const x=pmsv442Source.promotions.find(x=>x.catalog_id===p.id);
 if(x)return intro+'<p><b>Conditional official sugar article:</b> '+esc(x.subtype)+'</p>'+
 '<p><b>CTR Version IX Lead 5 mg/kg</b> requires finished-product <b>sulphated ash greater than 1%</b>; this lot's ash, identity and lead result are NOT verified and no numeric limit was assigned.</p>'+
 '<p><b>Required evidence:</b> '+x.proof.map(esc).join('; ')+'</p>'+
 '<p><b>Never substitute:</b> '+esc(x.distinct)+'</p>'+
 '<small><a href="'+esc(x.official_product_standard)+'" target="_blank" rel="noopener noreferrer">Official FSSR 2.8</a> · '+
 '<a href="'+esc(x.official_ctr)+'" target="_blank" rel="noopener noreferrer">Official CTR Version IX</a></small></details>';
 const ex=pmsv442Source.pending_sugar_exclusions.find(x=>x.catalog_id===p.id);
 if(ex)return intro+'<p><b>High-ash lead source remains unmatched:</b> '+esc(ex.reason)+
 '</p><p>Further source checks needed; no compliance PASS.</p></details>';
 return intro+'<p>Current first named source remains unverified. Historical individual product proof gate still applies.</p></details>';
}
var pmsvBefore442Proof=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 const current=pmsv442Html(p);
 if(!p||!pmsv442Valid())return current;
 let old=pmsvBefore442Proof(p);
 old=old.replace(/<details class="card" style="margin-top:12px"><summary><b>Current verified FSSAI source ledger — 438\/95<\/b>[\s\S]*?<\/details>/,"");
 return current+old;
};
var pmsvBefore442Local=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(!pmsv442Valid())return '<div class="notice">Current 442/91 verified source not available; no PASS.</div>';
 if(pmsv442Ids.includes(p.id))return "";
 return pmsvBefore442Local(p);
};
