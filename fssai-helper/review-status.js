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
