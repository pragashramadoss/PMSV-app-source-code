"use strict";
/* Current 493/40 Source labels ONLY. Historic 457/76 quality numeric rows remain unchanged. */
var pmsvQuality24CurrentStatusData=null;
const pmsvQuality24StatusDigest="c7838cf5d666929c";
function pmsvQuality24CurrentStatusValid(){
 if(typeof pmsv493Valid!=="function"||!pmsv493Valid()||
    typeof pmsvQuality16Valid!=="function"||!pmsvQuality16Valid()||
    typeof pmsvQuality8Valid!=="function"||!pmsvQuality8Valid()||
    typeof pmsvReviewSnapshotDigest!=="function")return false;
 const d=pmsvQuality24CurrentStatusData,l=pmsv493Ledger,
 a=pmsvQuality16Data,b=pmsvQuality8Data;
 if(!d||!l||!a||!b||pmsvReviewSnapshotDigest(d)!==pmsvQuality24StatusDigest||
 d.schema_version!=="1.0"||d.date!=="2026-10-12"||
 d.purpose!=="RECONCILE_24_ARCHIVED_FSSR_QUALITY_PANELS_WITH_CURRENT_493_40_CTR_FIRST_SOURCE_STATUSES"||
 d.official_ctr!==l.official_contaminants_source||
 d.catalogue!==533||d.current_partial!==493||d.current_pending!==40||
 d.quality16_source_snapshots!==16||d.quality8_source_snapshots!==8||
 d.quality_panels_reconciled!==24||d.legacy_pending_mislabels_corrected!==13||
 d.truly_pending_quality_panels!==11||d.regulatory_passes!==0||
 d.numeric_contaminant_assignments!==0||
 d.records?.length!==24||l.records?.length!==533||l.partial_exact!==493||
 l.first_source_pending!==40||a.records?.length!==16||b.records?.length!==8)return false;
 const referenced=new Map([...a.records.map(x=>[x.catalog_id,{x,module:"QUALITY16"}]),
 ...b.records.map(x=>[x.catalog_id,{x,module:"QUALITY8"}])]);
 const current=new Map(l.records.map(x=>[x.catalog_id,x])),seen=new Set();
 let partial=0,pending=0;
 for(const r of d.records){
  const hist=referenced.get(r.catalog_id),live=current.get(r.catalog_id);
  if(seen.has(r.catalog_id)||!hist||!live||
    r.product_name!==hist.x.product_name||r.product_name!==live.product_name||
    String(r.fssr||"")!==String(hist.x.fssr||"")||
    String(r.fcs||"")!==String(hist.x.fcs||"")||
    r.quality_source_module!==hist.module||
    r.current_ctr_first_source_status!==live.source_status||
    r.quality_evidence_only!==true||r.no_lab_pass!==true||
    r.no_compliance_approval!==true||
    live.sample_lab_pass!==false||live.product_compliance_approval!==false)return false;
  if(live.source_status==="PARTIAL_EXACT_SOURCE_MATCH")partial++;
  else if(live.source_status==="FIRST_EXACT_SOURCE_PENDING")pending++;
  else return false;
  seen.add(r.catalog_id);
 }
 return seen.size===24&&partial===13&&pending===11;
}
var pmsvBeforeQuality24CurrentLoad=pmsvLoadPositiveSourceProof;
pmsvLoadPositiveSourceProof=async function(){
 await pmsvBeforeQuality24CurrentLoad();pmsvQuality24CurrentStatusData=null;
 try{
  const r=await fetch("./data/rules/fssai-current-24-quality-panel-source-status-reconciliation-2026-10-12.json?v=20261012-quality24",{cache:"reload"});
  if(!r.ok)throw Error("Current 24-quality source status unavailable");
  pmsvQuality24CurrentStatusData=await r.json();
  if(!pmsvQuality24CurrentStatusValid())throw Error("Archived quality status conflicts with current 493/40 ledger");
 }catch(_){pmsvQuality24CurrentStatusData=null;}
};
function pmsvQuality24ReconcileHtml(p,html,module){
 if(!html)return html;
 if(!pmsvQuality24CurrentStatusValid())
   return '<div class="notice">Current 493/40 FSSAI quality/status cross-check unavailable; historical contaminant status withheld. No PASS.</div>';
 const x=pmsvQuality24CurrentStatusData.records.find(y=>y.catalog_id===p?.id&&y.quality_source_module===module);
 if(!x)return html;
 if(x.product_name!==p.name||String(x.fssr||"")!==String(p.fssr||"")||
    String(x.fcs||"")!==String(p.fcs||""))
 return '<div class="notice">Current product source status mismatch. Historical warning withheld. No PASS.</div>';
 if(x.current_ctr_first_source_status==="FIRST_EXACT_SOURCE_PENDING")return html;
 if(module==="QUALITY16"){
  const marker="QUALITY SOURCE ONLY — FIRST CONTAMINANT ARTICLE STILL PENDING.";
  if(!html.includes(marker))return '<div class="notice">Historical quality warning changed. No legal PASS.</div>';
  return html.replace(marker,"QUALITY SOURCE ONLY — CURRENTLY PARTIAL CONDITIONAL FIRST-SOURCE EVIDENCE. Full contaminant panel and finished-product applicability NOT confirmed.");
 }
 const marker="QUALITY SOURCE ONLY — CONTAMINANT ARTICLE STILL PENDING.";
 if(!html.includes(marker))return '<div class="notice">Historical quality warning changed. No legal PASS.</div>';
 return html.replace(marker,"QUALITY SOURCE ONLY — CURRENTLY PARTIAL CONDITIONAL FIRST-SOURCE EVIDENCE. Full contaminant panel and finished-product applicability NOT confirmed.");
}
var pmsvBefore24Quality16Html=pmsvQuality16Html;
pmsvQuality16Html=function(p){return pmsvQuality24ReconcileHtml(p,pmsvBefore24Quality16Html(p),"QUALITY16");};
var pmsvBefore24Quality8Html=pmsvQuality8Html;
pmsvQuality8Html=function(p){return pmsvQuality24ReconcileHtml(p,pmsvBefore24Quality8Html(p),"QUALITY8");};
