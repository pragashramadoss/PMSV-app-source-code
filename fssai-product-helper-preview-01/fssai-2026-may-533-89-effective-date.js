"use strict";
/* Gazette 272840 enters into force 01-12-2026. Source-only prospective review.
 All 533 catalogued entries and all 89 pending finished-article decisions, no
 numeric activation and no substitute for legally verified current amendments. */
var pmsvMay2026Scope=null,pmsv89FinalProof=null,pmsvMay2026Register=null;
const pmsvMay2026ScopeHashes=Object.freeze({"watch":"bc10cfc31752bf46","docket":"a59d0b0ec4dcc767","register":"af3bb37ca8c89adb"});
function pmsvMay2026SourceValid(){
 if(typeof pmsv444Valid!=="function"||!pmsv444Valid()||
    typeof pmsvReviewSnapshotDigest!=="function")return false;
 const w=pmsvMay2026Scope,d=pmsv89FinalProof,g=pmsvMay2026Register,
 l=pmsv444Ledger,q=pmsv89Queue,c=contaminantsDb;
 if(!w||!d||!g||!l||!q||!c||
    pmsvReviewSnapshotDigest(w)!==pmsvMay2026ScopeHashes.watch||
    pmsvReviewSnapshotDigest(d)!==pmsvMay2026ScopeHashes.docket||
    pmsvReviewSnapshotDigest(g)!==pmsvMay2026ScopeHashes.register||
    w.official_gazette!==g.source?.url||
    w.official_gazette!=="https://www.fssai.gov.in/upload/uploadfiles/files/272840.pdf"||
    w.gazette_reference!==g.gazette_id||
    w.effective_date!=="2026-12-01"||g.effective_date!=="2026-12-01"||
    w.current_assessment_date!=="2026-10-12"||
    w.amendment_effective_on_current_assessment_date!==false||
    w.active_v9_numerical_articles_mutated!==false||
    w.post_effective_silent_activation!==false||
    w.after_effective_date_requires_human_legal_review!==true||
    w.current_compendium_source!==c.official_sources?.[0]?.url||
    w.current_active_compendium!==c.source_version||
    w.catalogue_count!==533||w.current_source_first_match_count!==444||
    w.current_first_source_pending_count!==89||
    w.full_compliance_approvals!==0||w.future_watch_count!==31||
    w.watch_change_families?.length!==5||w.watch_points?.length!==533||
    d.catalogue!==533||d.partial_exact!==444||d.first_source_pending!==89||
    d.case_review_count!==89||d.cases?.length!==89||
    d.existing_detailed_prior_review_count!==37||
    d.automatic_full_compliance_pass!==false||
    d.no_future_limit_auto_apply!==true||d.no_unverified_numeric_limit!==true||
    l.catalogue!==533||l.partial_exact!==444||l.first_source_pending!==89||
    q.review_records?.length!==89||g.changes?.length!==5)return false;
 const watchChanges=new Map();
 for(const x of g.changes){
   if(watchChanges.has(x.id)||!Array.isArray(x.catalog_ids)||
      x.catalog_ids.length===0)return false;
   watchChanges.set(x.id,new Set(x.catalog_ids));
 }
 const expectedQ=new Map(q.review_records.map(x=>[x.catalog_id,x])),
 seen=new Set(),seenW=new Set();let matchedW=0;
 for(let i=0;i<533;i++){
  const a=l.records[i],b=w.watch_points[i];
  if(!a||!b||a.catalog_id!==b.catalog_id||a.product_name!==b.product_name||
     a.source_status!==b.current_first_source_state||
     String(a.fssr||"")!==String(b.fssr||"")||
     String(a.fcs||"")!==String(b.fcs||"")||
     b.amendment_applies_on_current_date!==false||
     b.auto_apply_may_amendment_limit!==false||
     b.current_compendium_article_unchanged_by_this_audit!==true||
     b.full_regulatory_pass!==false||b.lab_pass!==false)return false;
  const correct=g.changes.filter(z=>z.catalog_ids.includes(a.catalog_id)).map(z=>z.id);
  if(JSON.stringify(correct)!==JSON.stringify(b.may_2026_amendment_watch_ids))return false;
  if(correct.length){matchedW++;seenW.add(a.catalog_id);}
 }
 if(matchedW!==31||seenW.size!==31)return false;
 for(const x of d.cases){
  const a=expectedQ.get(x.catalog_id);
  if(!a||seen.has(x.catalog_id)||x.product_name!==a.product_name||
     String(x.fssr||"")!==String(a.fssr||"")||
     String(x.food_category||"")!==String(a.fcs||"")||
     x.application_mode!=="SPECIFIC_FINISHED_ARTICLE_POSITIVE_EVIDENCE_REQUIRED"||
     x.source_status!=="FIRST_EXACT_SOURCE_PENDING"||
     x.product_specific_decision?.length!==3||
     !x.product_specific_decision[0]?.includes(x.product_name)||
     x.required_supplier_packet?.length!==3||
     x.current_source_match_verified!==false||
     x.current_amendment_applicable_date!=="2026-10-12"||
     x.may_2026_amendment_effective_currently!==false||
     x.numeric_limit_auto_apply!==false||
     x.complete_product_regulatory_pass!==false||
     x.measured_lot_pass!==false||
     seenW.has(x.catalog_id))return false;seen.add(x.catalog_id);
 }
 return seen.size===89&&expectedQ.size===89;
}
var pmsvBeforeMay2026Load=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBeforeMay2026Load();
 pmsvMay2026Scope=null;pmsv89FinalProof=null;pmsvMay2026Register=null;
 try{
  const names=["fssai-2026-may-gazette-533-effective-date-controls-2026-10-12.json",
   "fssai-89-current-exact-finished-article-evidence-packets-2026-10-12.json",
   "contaminants-2026-deferred-amendment-v1.json"];
  const res=await Promise.all(names.map(x=>fetch("./data/rules/"+x+"?v=20261012-may533",{cache:"reload"})));
  if(res.some(x=>!x.ok))throw Error("Gazette effective-date evidence unavailable");
  [pmsvMay2026Scope,pmsv89FinalProof,pmsvMay2026Register]=await Promise.all(res.map(x=>x.json()));
  if(!pmsvMay2026SourceValid())throw Error("Gazette source audit integrity failure");
 }catch(_){pmsvMay2026Scope=null;pmsv89FinalProof=null;pmsvMay2026Register=null;}
};
function pmsvMay2026EffectiveLabel(){
 const today=new Date().toISOString().slice(0,10);
 return today<"2026-12-01"?"Gazetted but NOT YET EFFECTIVE (from 1 December 2026)":
   "Nominal commencement date reached; fresh legal and product applicability verification required before use";
}
function pmsvMay2026Panel(p){
 if(!p)return "";
 if(!pmsvMay2026SourceValid())
  return '<div class="notice">FSSAI 2026 future-amendment integrity unavailable. No numeric source or PASS from this update.</div>';
 const meta=pmsvMay2026Scope.watch_points.find(x=>x.catalog_id===p.id);
 if(!meta||meta.product_name!==p.name||String(meta.fssr||"")!==String(p.fssr||"")||
    String(meta.fcs||"")!==String(p.fcs||""))
  return '<div class="notice">Future amendment catalogue identity mismatch; evidence withheld.</div>';
 const entry=pmsv89FinalProof.cases.find(x=>x.catalog_id===p.id);
 // Historical 89-case dossier is for context; never show its stale pending label over live 498/35.
 const currentLive=(typeof pmsv498Ledger!=="undefined"&&
   pmsv498Ledger?.records?.length===533&&pmsv498Ledger?.first_source_pending===35)?
   pmsv498Ledger.records.find(x=>x.catalog_id===p.id):null;
 const promotedNew=(typeof pmsv457Valid==="function"&&pmsv457Valid()&&pmsv457PromotedIds.includes(p.id))||
   (typeof pmsv450Valid==="function"&&pmsv450Valid()&&pmsv450Ids.includes(p.id))||
   (typeof pmsv446Valid==="function"&&pmsv446Valid()&&pmsv446PromotedIds.includes(p.id));
 const activePending=currentLive?currentLive.source_status==="FIRST_EXACT_SOURCE_PENDING":!promotedNew;
 if((!entry||!activePending)&&!meta.may_2026_amendment_watch_ids.length)return "";
 let h='<details class="card" style="margin-top:12px"><summary><b>FSSAI 2026 legal-effective-date & exact-source audit</b></summary>';
 if(meta.may_2026_amendment_watch_ids.length){
  const a=pmsvMay2026Register.changes.filter(x=>meta.may_2026_amendment_watch_ids.includes(x.id));
  h+='<p><b>'+esc(pmsvMay2026EffectiveLabel())+'</b>. Gazette 272840 has a scheduled effective date of <b>1 December 2026</b>; it does not automatically activate a new product limit.</p>'+
   '<p><b>Future scope candidates only:</b> '+a.map(x=>esc(x.change)).join("; ")+'</p>'+
   '<p>Current Version IX limits remain unchanged by this audit. On or after the effective date, reverify exact finished article, sampling conditions, official amendments and laboratory evidence.</p>'+
   '<p><a href="'+esc(pmsvMay2026Scope.official_gazette)+'" target="_blank" rel="noopener noreferrer">Official FSSAI May 2026 Gazette PDF</a></p>';
 }
 if(entry&&activePending){
  h+='<p><b>Current source status: FIRST EXACT SOURCE PENDING.</b> No new first-source clearance.</p>'+
     '<p><b>Finished-product decision:</b> '+entry.product_specific_decision.map(esc).join("; ")+'</p>'+
     '<p><b>Required evidence:</b> '+entry.required_supplier_packet.map(esc).join("; ")+'</p>'+
     '<p><b>Transfer excluded:</b> '+esc(entry.prohibited_blanket_transfer)+'</p>'+
     '<p>Research candidate articles are not compliance limits. Complete food safety and tested-lot PASS remain blocked.</p>';
 }
 return h+'</details>';
}
var pmsvBeforeMay2026Proof=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 const older=pmsvBeforeMay2026Proof(p);
 return pmsvMay2026Panel(p)+older;
};
