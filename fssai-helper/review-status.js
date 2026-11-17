/* Review coverage only. No product standard, limit or release status is changed. */
(function(root){
 'use strict';
 const denied=reason=>({ok:false,reason,legalProductApproval:false,batchRelease:false});
 function catalogueStatus(rows){
  if(!Array.isArray(rows)||rows.length!==533)return denied('The complete 533-product catalogue is unavailable.');
  const ids=new Set();
  for(const row of rows){
   if(!row||typeof row.id!=='string'||!row.id.trim()||typeof row.product!=='string'||!row.product.trim()||ids.has(row.id))return denied('Catalogue identities are missing or duplicated.');
   ids.add(row.id);
  }
  return {ok:true,count:ids.size,legalProductApproval:false,batchRelease:false};
 }
 function validateReview(data,rows){
  const base=catalogueStatus(rows);if(!base.ok)return base;
  if(!data||data.schemaVersion!==1||!Array.isArray(data.records)||data.records.length!==137||
    data.catalogueCount!==533||data.queueCount!==137||data.legalProductApprovals!==0||data.batchReleases!==0||
    data.sourceVerificationRequiresLotReport!==false)return denied('Review register is incomplete.');
  const ids=new Set(rows.map(x=>x.id)),seen=new Set();let focused=0;
  for(const row of data.records){
   if(!row||!ids.has(row.id)||seen.has(row.id)||typeof row.name!=='string'||!Array.isArray(row.reports)||
    row.legalArticleDecision!=='OPEN'||typeof row.sourceReviewNextAction!=='string'||
    typeof row.sourceReviewResult!=='string'||!row.sourceReviewResult.trim())return denied('Review identities or decisions are inconsistent.');
   seen.add(row.id);
   for(const report of row.reports){
    if(!report||!/^ctr-[a-z0-9-]+-r\d+-\d{4}-\d{2}-\d{2}\.md$/.test(report.file)||
      !Number.isInteger(report.round))return denied('A review reference is invalid.');
   }
   if(row.reports.length)focused++;
  }
  if(focused!==data.focusedCount||data.remainingFocusedCount!==137-focused)return denied('Review counts do not reconcile.');
  const gazette=data.originalGazetteReview;
  if(!gazette||gazette.round!==70||gazette.metalRows!==382||gazette.cropRows!==27||
    gazette.checkedOn!==data.checkpointDate||gazette.fullCurrentLawComplete!==false||
    gazette.numericRulesChanged!==false||gazette.productApprovals!==0||
    gazette.report!=='ctr-original-gazette-concordance-r70-2026-11-14.md'||
    typeof gazette.summary!=='string'||!gazette.summary.trim()||
    !Array.isArray(gazette.futureChanges)||gazette.futureChanges.length!==9)return denied('Original Gazette evidence is incomplete.');
  const changes=new Set();
  for(const change of gazette.futureChanges){
   if(!change||typeof change.id!=='string'||!change.id.trim()||changes.has(change.id)||
     typeof change.title!=='string'||!change.title.trim()||typeof change.scopeNote!=='string'||!change.scopeNote.trim()||
     change.effectiveFrom!=='2026-12-01'||change.autoApply!==false||change.operativeOnReviewDate!==false)
    return denied('Future amendment scope is inconsistent.');
   changes.add(change.id);
  }
  const residue=data.residueGazetteReview;
  if(!residue||residue.round!==71||residue.checkedOn!==data.checkpointDate||
    residue.report!=='ctr-residue-gazette-concordance-r71-2026-11-14.md'||
    residue.pesticideRows!==1098||residue.veterinaryRows!==358||residue.honeyRows!==12||residue.prohibitedClasses!==14||
    residue.numericMismatches!==0||residue.numericRulesChanged!==false||residue.fullCurrentLawComplete!==false||
    residue.productApprovals!==0||typeof residue.summary!=='string'||!residue.summary.trim()||
    !Array.isArray(residue.findings)||residue.findings.length!==8)return denied('Residue source evidence is incomplete.');
  const findings=new Set();
  for(const finding of residue.findings){
   if(!finding||typeof finding.id!=='string'||!finding.id.trim()||findings.has(finding.id)||
     typeof finding.title!=='string'||!finding.title.trim()||typeof finding.detail!=='string'||!finding.detail.trim())
    return denied('Residue source findings are inconsistent.');
   findings.add(finding.id);
  }
  const toxin=data.toxinGazetteReview;
  if(!toxin||toxin.round!==72||toxin.checkedOn!=='2026-11-17'||data.latestSourceReviewDate!==toxin.checkedOn||data.latestRound!==72||
    toxin.report!=='ctr-toxin-gazette-concordance-r72-2026-11-17.md'||
    toxin.notsRows!==15||toxin.fishPcbPahRows!==3||toxin.biotoxinRows!==5||toxin.melamineRows!==3||
    toxin.histaminePlans!==11||toxin.histamineSpeciesEntries!==119||toxin.totalLimitOrPlanRows!==37||
    toxin.numericMismatches!==0||toxin.numericRulesChanged!==false||toxin.fullCurrentLawComplete!==false||toxin.productApprovals!==0||
    typeof toxin.summary!=='string'||!toxin.summary.trim()||typeof toxin.seafoodNote!=='string'||!toxin.seafoodNote.trim()||
    !Array.isArray(toxin.findings)||toxin.findings.length!==6)return denied('Toxin source evidence is incomplete.');
  const toxinFindings=new Set();
  for(const finding of toxin.findings){
   if(!finding||typeof finding.id!=='string'||!finding.id.trim()||toxinFindings.has(finding.id)||
      typeof finding.title!=='string'||!finding.title.trim()||typeof finding.detail!=='string'||!finding.detail.trim())
    return denied('Toxin source findings are inconsistent.');
   toxinFindings.add(finding.id);
  }
  const seafoodIds=rows.filter(x=>/^2\.6(?:\.|$)/.test(x.fssr)).map(x=>x.id);
  if(!Array.isArray(toxin.seafoodNoteIds)||toxin.seafoodNoteIds.length!==24||new Set(toxin.seafoodNoteIds).size!==24||
     seafoodIds.length!==24||!seafoodIds.every(id=>toxin.seafoodNoteIds.includes(id)))return denied('Seafood source-note coverage is inconsistent.');
  if(!Array.isArray(data.currencyWatch))return denied('Official-source watch is missing.');
  for(const source of data.currencyWatch){
   try{const url=new URL(source?.source);if(url.protocol!=='https:'||!/(^|\.)fssai\.gov\.in$/i.test(url.hostname))return denied('Official-source URL is invalid.');}
   catch(error){return denied('Official-source URL is invalid.');}
  }
  return {ok:true,catalogueCount:533,queueCount:137,focusedCount:focused,remainingFocusedCount:137-focused,legalProductApproval:false,batchRelease:false};
 }
 const api=Object.freeze({catalogueStatus,validateReview});
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PMSVReviewStatus=api;
})(typeof globalThis==='object'?globalThis:this);
