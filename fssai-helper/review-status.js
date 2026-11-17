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
  if(!toxin||toxin.round!==72||toxin.checkedOn!=='2026-11-17'||data.latestSourceReviewDate!==toxin.checkedOn||data.latestRound!==74||
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
  const fibre=data.fibreClaimsReview;
  if(!fibre||fibre.round!==73||fibre.checkedOn!==data.latestSourceReviewDate||
     fibre.productId!=='99-99-7-dietary-fibre-dextrin-soluble-fibre'||fibre.sourceDecision!=='CONFLICT_OPEN'||
     fibre.report!=='ctr-fibre-claims-source-r73-2026-11-17.md'||!Array.isArray(fibre.thresholdRows)||fibre.thresholdRows.length!==6||
     fibre.legalProductApproval!==false||fibre.labelApproved!==false||fibre.batchRelease!==false||
     !Array.isArray(fibre.findings)||fibre.findings.length!==4)return denied('Fibre source review is incomplete.');
  const expectedFibre=[['source','g_per_100g_solids',3],['source','g_per_100ml_liquids',1.5],['source','g_per_100kcal',1.5],['high','g_per_100g_solids',6],['high','g_per_100ml_liquids',3],['high','g_per_100kcal',3]];
  if(!fibre.thresholdRows.every((r,i)=>r&&r.claim===expectedFibre[i][0]&&r.basis===expectedFibre[i][1]&&r.minimum===expectedFibre[i][2]&&r.operator==='>='&&r.sourceId==='claims2022dec'&&r.pdfPage===13))return denied('Fibre thresholds or bases are inconsistent.');
  for(const source of [fibre.source,fibre.originalDextrinSource]){
   try{const url=new URL(source);if(url.protocol!=='https:'||!/(^|\.)fssai\.gov\.in$/i.test(url.hostname))return denied('Fibre source URL is invalid.');}
   catch(error){return denied('Fibre source URL is invalid.');}
  }
  if(!fibre.findings.every(f=>f&&typeof f.title==='string'&&f.title.trim()&&typeof f.detail==='string'&&f.detail.trim()))return denied('Fibre findings are incomplete.');
  const water=data.waterSourceReview;
  if(!water||water.round!==74||water.checkedOn!==data.latestSourceReviewDate||
    water.report!=='ctr-water-source-review-r74-2026-11-17.md'||
    water.fullCurrentLawComplete!==false||water.legalProductApproval!==false||water.batchRelease!==false||water.autoApplyLimits!==false||
    water.bisStandard?.number!=='IS 10500:2012'||water.bisStandard.amendmentCount!==4||water.bisStandard.completeNormativeTextVerified!==false||
    water.draftReplacement?.status!=='DRAFT_SOURCE_ONLY'||water.draftReplacement.autoApply!==false||water.draftReplacement.finalReplacementEstablished!==false||
    water.counts?.waterGapsClosed!==0||water.counts.remainingAyurvedaIngredientGaps!==14||water.counts.numericRulesAdded!==0||
    !Array.isArray(water.records)||water.records.length!==5)return denied('Water source review is incomplete.');
  const waterIds=['purified-vending-water','102-102-1-12-1-lajadi-kashaya-parched-rice-tea','102-102-1-13-1-krishara-khichdi','102-102-1-14-7-ksheerapaka-mystic-milk-quartet','102-102-1-15-1-kulmasha-barley-savory-discs'];
  if(!water.records.every((r,i)=>r&&r.id===waterIds[i]&&ids.has(r.id)&&r.use===(i===0?'vending':'ingredient')&&
    typeof r.sourceReviewResult==='string'&&r.sourceReviewResult.trim()&&typeof r.sourceReviewNextAction==='string'&&r.sourceReviewNextAction.trim())||
    water.records[3].recipeTitleMethodHold!==true)return denied('Water source coverage is inconsistent.');
  for(const key of ['vending','ingredient','bis','draft']){
   try{const url=new URL(water.sources?.[key]);const host=key==='bis'?/(^|\.)bis\.gov\.in$/i:/(^|\.)fssai\.gov\.in$/i;
    if(url.protocol!=='https:'||!host.test(url.hostname))return denied('Water source URL is invalid.');}
   catch(error){return denied('Water source URL is invalid.');}
  }
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
