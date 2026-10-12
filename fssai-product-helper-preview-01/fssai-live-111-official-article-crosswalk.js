"use strict";
/* Current 111: official named-article source-row integrity crosswalk.
 * A valid source row IS NOT finished-product applicability. Never a numeric PASS.
 * Current records and their 422/111 digest remain the canonical legal status. */
var pmsvLive111ReferenceDb=null;
const pmsvLive111ReferenceDigest="4432cdcc6a208bf1";
function pmsvLive111ReferenceValid(){
 const m=pmsvLive111ReferenceDb,q=pmsv2026Current111Queue,c=contaminantsDb;
 if(typeof pmsv2026Current422Valid!=="function"||!pmsv2026Current422Valid()||
   !m||!q||!c||typeof pmsvReviewSnapshotDigest!=="function"||
   typeof pmsvProofSourceMatch!=="function"||
   pmsvReviewSnapshotDigest(m)!==pmsvLive111ReferenceDigest||
   m.policy!=="OFFICIAL_FSSAI_FOSCOS_ONLY"||
   m.source_version!==c.source_version||
   m.official_ctr!==c.official_sources?.[0]?.url||
   m.live_queue!=="fssai-current-111-first-exact-source-proof-worklist-2026-10-12.json"||
   m.live_ledger!=="fssai-current-first-source-533-live-ledger-422-111-2026-10-12.json"||
   m.catalogue!==533||m.partial_first_source!==422||m.pending_first_source!==111||
   m.reviewed_pending_products!==111||
   m.products_with_named_references!==87||
   m.products_without_named_references!==24||
   m.distinct_raw_candidate_labels!==29||
   m.distinct_named_source_rows!==32||
   m.ambiguous_reference_labels!==0||
   m.multi_analyte_reference_labels!==1||m.multi_analyte_source_rows!==4||
   m.article_reference_links!==114||
   m.new_automatic_product_promotions!==0||
   m.finished_product_numeric_auto_applied!==false||
   m.laboratory_pass!==false||m.compliance_pass!==false||
   m.read_only_crosswalk!==true||
   q.review_records?.length!==111||m.references?.length!==29)return false;
 const refs=new Map(m.references.map(x=>[x.key,x]));
 if(refs.size!==29)return false;
 let products=0,links=0,matched=0,blocked=0,rowCount=0;
 for(const r of q.review_records){
  if(r.first_exact_source_verified!==false||
    r.numeric_finished_food_limit_auto_applied!==false||
    r.finished_food_laboratory_pass!==false||
    r.full_regulatory_compliance_approval!==false)return false;
  if(r.referenced_articles_review_only?.length)products++;
  for(const k of r.referenced_articles_review_only||[]){
   if(!refs.has(k))return false;
   links++;
  }
 }
 for(const ref of m.references){
  if(ref.finished_article_applicability_verified!==false)return false;
  if(ref.state==="OFFICIAL_MULTI_ANALYTE_SOURCE_ROWS_REFERENCE_ONLY"){
   matched++;
   if(ref.key!=="Hard boiled sugar confectionery"||
      ref.numeric_reference_displayed!==true||ref.source_id!==undefined||
      ref.source_rows?.length!==4||
      JSON.stringify(ref.source_rows.map(x=>x.analyte))!==JSON.stringify(["Lead","Copper","Arsenic","Tin"])||
      JSON.stringify(ref.source_rows.map(x=>x.limit))!==JSON.stringify([2,5,1,5])||
      ref.source_rows.some(x=>x.finished_article_applicability_verified!==false||
        x.article!==ref.key||x.unit!=="mg/kg"||x.type!=="metal"||
        !pmsvProofSourceMatch(x,c)))return false;
   rowCount+=4;
  }else{
   matched++;
   if(ref.state!=="OFFICIAL_NAMED_ROW_REFERENCE_ONLY"||
      ref.numeric_reference_displayed!==true||
      !["metal","crop","nots","pesticide"].includes(ref.type)||
      !Number.isFinite(ref.limit)||ref.limit<0||
      !pmsvProofSourceMatch({
       id:ref.source_id,type:ref.type,analyte:ref.analyte,
       article:ref.article,limit:ref.limit,unit:ref.unit,
       official_condition:ref.official_condition
      },c))return false;
   rowCount++;
  }
 }
 return products===87&&111-products===24&&links===114&&
   matched===29&&blocked===0&&rowCount===32;
}
var pmsvLive111PreviousLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvLive111PreviousLoad();
 pmsvLive111ReferenceDb=null;
 try{
  const r=await fetch("./data/rules/fssai-live-111-official-article-crosswalk-2026-10-12.json?v=20261012-source111",{cache:"reload"});
  if(!r.ok)throw Error("Source crosswalk missing");
  pmsvLive111ReferenceDb=await r.json();
  if(!pmsvLive111ReferenceValid())throw Error("Source crosswalk drift or named article mismatch");
 }catch(_){pmsvLive111ReferenceDb=null}
};
function pmsvLive111ReferencesHtml(p){
 if(!p||!pmsv2026Current111Queue?.review_records?.some(x=>x.catalog_id===p.id))return "";
 if(!pmsvLive111ReferenceValid())
  return '<div class="notice"><b>Current source crosswalk withheld.</b> FSSAI article evidence is unavailable or inconsistent. No numeric limit or compliance PASS.</div>';
 const row=pmsv2026Current111Queue.review_records.find(x=>x.catalog_id===p.id);
 if(!row||row.product_name!==p.name||
    String(row.fssr||"")!==String(p.fssr||"")||
    String(row.fcs||"")!==String(p.fcs||""))return "";
 const refs=new Map(pmsvLive111ReferenceDb.references.map(x=>[x.key,x]));
 const names=row.referenced_articles_review_only||[];
 const body=names.length?'<ul>'+names.map(key=>{
  const x=refs.get(key);
  if(x.source_rows)return x.source_rows.map(r=>'<li><b>'+esc(r.analyte)+'</b> — '+
   esc(r.article)+': '+esc(String(r.limit))+' '+esc(r.unit)+
   ' <b>OFFICIAL SOURCE ROW ONLY — NOT APPLIED TO THIS FINISHED PRODUCT</b></li>').join("");
  if(!x.source_id)return '<li>'+esc(key)+' — <b>analyte not authenticated; numeric reference withheld</b>.</li>';
  const basis=key==="Eggs"?" (shell-free egg basis; not processed-egg powder)":x.analyte==="Copper"&&/Tomato puree/.test(x.article)?" (dried tomato solids basis)":"";
  return '<li><b>'+esc(x.analyte)+'</b> — '+esc(x.article)+
   ': '+esc(String(x.limit))+' '+esc(x.unit)+esc(basis)+
   ' <b>OFFICIAL SOURCE ROW ONLY — NOT APPLIED TO THIS FINISHED PRODUCT</b></li>';
 }).join("")+'</ul>':
 '<p>No finished-food-specific named reference is supported here; a regulator/source article and analytical matrix still require research.</p>';
 return '<details class="card" style="margin-top:12px"><summary><b>Current 111-queue source-row crosscheck</b> — '+
  names.length+' article reference(s), not applied</summary>'+
  '<div class="notice"><b>422 partial source matches / 111 pending / 0 compliance PASS.</b> These 114 indexed mentions across 87 products establish only that the cited FSSAI regulatory rows exist. They never establish that the articles govern this finished product.</div>'+
  body+'<p><b>Next:</b> Confirm the exact species, composition, processed form, container, legal article and analytical basis. Operator checklist ticks are not independent legal evidence.</p>'+
  '<small><a href="'+esc(pmsvLive111ReferenceDb.official_ctr)+
  '" target="_blank" rel="noopener noreferrer">FSSAI CTR Version IX source</a></small></details>';
}
var pmsvLive111PriorProofHtml=sourcePinned121ResearchProofHtml;
sourcePinned121ResearchProofHtml=function(p){
 if(!p)return "";
 if(typeof pmsv2026Current422Valid!=="function"||!pmsv2026Current422Valid())
   return pmsvLive111PriorProofHtml(p);
 const pending=pmsv2026Current111Queue.review_records.some(x=>x.catalog_id===p.id);
 if(!pending&&pmsv2026Current111Queue.promoted_catalog_ids?.includes(p.id)){
  return pmsv2026Current422Html(p);
 }
 return pmsvLive111PriorProofHtml(p)+(pending?pmsvLive111ReferencesHtml(p):"");
};
var pmsvLive111PriorLocalProofHtml=pmsvCurrent116ProofChecklistHtml;
pmsvCurrent116ProofChecklistHtml=function(p){
 if(!p)return "";
 if(typeof pmsv2026Current422Valid!=="function"||!pmsv2026Current422Valid())
  return '<div class="notice"><b>Current local evidence collector withheld.</b> Latest 422/111 source ledger not verified. No PASS.</div>';
 const now=pmsv2026Current111Queue.review_records.find(x=>x.catalog_id===p.id);
 if(!now)return "";
 if(now.product_name!==p.name||
    String(now.fssr||"")!==String(p.fssr||"")||
    String(now.fcs||"")!==String(p.fcs||""))return "";
 return pmsvLive111PriorLocalProofHtml(p);
};
