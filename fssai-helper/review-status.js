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
  if(!toxin||toxin.round!==72||toxin.checkedOn!=='2026-11-17'||data.latestSourceReviewDate!==toxin.checkedOn||data.latestRound!==77||
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
  const ws=data.waterStandardReview;
  if(!ws||ws.round!==75||ws.standard!=='IS 10500:2012'||ws.reviewedOn!==data.latestSourceReviewDate||
    ws.report!=='ctr-water-standard-concordance-r75-2026-11-17.md'||ws.requirementsTablesReconciled!==true||ws.allFourAmendmentsReviewed!==true||
    ws.allReferencedMethodsVerified!==false||ws.ironManganeseInterpretationResolved!==false||ws.fullCurrentLawComplete!==false||
    ws.waterQualityApproved!==false||ws.legalProductApproval!==false||ws.batchRelease!==false||ws.autoApplyLimits!==false||
    ws.remainingAyurvedaIngredientGaps!==14||!Array.isArray(ws.rows)||ws.rows.length!==74||
    !Array.isArray(ws.amendmentReview)||ws.amendmentReview.length!==4||!Array.isArray(ws.findings)||ws.findings.length!==6)
   return denied('IS 10500 source review is incomplete.');
  const waterRows=new Map();
  for(const r of ws.rows){
   if(!r||typeof r.id!=='string'||!r.id.trim()||waterRows.has(r.id)||!['max','min','range','qualitative','pointer','absence'].includes(r.operator)||
     r.referenceOnly!==true||r.autoApply!==false||!r.name||!r.unit||typeof r.acceptable!=='string'||!r.acceptable||typeof r.permissible!=='string'||!r.permissible||
     !ws.sources?.[r.source?.id]||!Number.isInteger(r.source.pdfPage)||r.source.pdfPage<1||r.source.pdfPage>ws.sources[r.source.id].pdfPages||
     !Array.isArray(r.amendments)||r.amendments.some(id=>!ws.sources[id]))return denied('IS 10500 reference rows are inconsistent.');
   waterRows.set(r.id,r);
  }
  for(const [key,count] of [[1,6],[2,24],[3,16],[4,2],[5,18],[6,5],['clauses',3]]){
   if(ws.rows.filter(r=>r.table===key).length!==count)return denied('IS 10500 table coverage is inconsistent.');
  }
  for(const [id,a,p] of [['iron','1','No relaxation'],['arsenic','0.01','No relaxation'],['boron','0.5','2.4'],['mineral-oil','1','No relaxation'],['uranium','0.03','No relaxation']]){
   const r=waterRows.get(id);if(!r||r.acceptable!==a||r.permissible!==p||r.unit!=='mg/L')return denied('IS 10500 amendment values are inconsistent.');
  }
  if(waterRows.get('free-chlorine')?.operator!=='min'||waterRows.get('pesticide-pointer')?.operator!=='pointer'||
     ws.rows.filter(r=>r.table===5).some(r=>r.unit!=='µg/L')||
     ws.rows.filter(r=>r.table===6).some(r=>r.sampleVolumeMl!==100)||
     waterRows.get('ms2')?.sampleVolumeMl!==1000||waterRows.get('cryptosporidium')?.sampleVolumeMl!==10000||waterRows.get('giardia')?.sampleVolumeMl!==10000)
   return denied('IS 10500 units or sample bases are inconsistent.');
  for(const [key,suffix] of [['is10500','S06/S06V01/10500.pdf'],['amendment1','S16/S16V01/10500A1.pdf'],['amendment2','S16/S16V01/10500A2.pdf'],['amendment3','S16/S16V01/10500A3.pdf'],['amendment4','S16/S16V01/10500A4.pdf']]){
   const s=ws.sources?.[key];
   if(!s||s.url!=='https://bmqsdqljvwgm.compat.objectstorage.ap-mumbai-1.oraclecloud.com/BisProd/bisProd/oldStandards/'+suffix||!(/^[a-f0-9]{64}$/).test(s.sha256))
    return denied('BIS source document is inconsistent.');
  }
  const a=data.asafoetidaReview;
  if(!a||a.round!==76||a.reviewedOn!==data.latestSourceReviewDate||a.clause!=='FPSFA 2.9.29'||
    a.report!=='ctr-asafoetida-purity-r76-2026-11-17.md'||a.productId!=='12-12-2-asafoetida-hing-or-hingra'||
    a.recipeProductId!=='102-102-1-13-1-krishara-khichdi'||!ids.has(a.productId)||!ids.has(a.recipeProductId)||
    a.numericRows!==11||a.numericMismatches!==0||a.puritySourceRowsReconciled!==true||
    a.fullCurrentLawComplete!==false||a.allReferencedMethodsVerified!==false||a.recipeSubstitutionApproved!==false||
    a.legalProductApproval!==false||a.batchRelease!==false||a.autoApplyLimits!==false||a.ctrRulesChanged!==false||
    a.ingredientGapsClosed!==0||a.remainingAyurvedaIngredientGaps!==14||!Array.isArray(a.rows)||a.rows.length!==11||
    !Array.isArray(a.grades)||a.grades.length!==3||!Array.isArray(a.findings)||a.findings.length!==6)
   return denied('Asafoetida purity evidence is incomplete.');
  const parameters=['total-ash','acid-insoluble-ash','alcoholic-extract','starch'];
  let ai=0;
  for(const [gi,grade] of ['hing','hingra','compounded'].entries()){
   const g=a.grades[gi];
   if(!g||g.id!==grade||!g.label||!g.definition||!g.exclusions||!g.extraNote)return denied('Asafoetida grade identity is incomplete.');
   for(const [pi,limit] of [[15,2.5,12,1],[20,8,50,1],[10,1.5,5]][gi].entries()){
    const r=a.rows[ai++],extract=pi===2;
    if(!r||r.id!==grade+'-'+parameters[pi]||r.grade!==grade||r.parameter!==parameters[pi]||!r.name||
      r.limit!==limit||r.operator!==(extract?'>=':'<=')||r.unit!=='%'||r.dryBasisSpecified!==false||
      r.basis!==(grade!=='compounded'&&!extract?'By weight':'Percent as stated in clause')||
      r.solventAlcoholPercent!==(extract?90:null)||r.methodReference!==(extract?'U.S.P. 1936':null)||
      r.referenceOnly!==true||r.autoApply!==false||r.originalSource?.id!=='gazette2011'||r.originalSource.pdfPage!==116||
      r.originalSource.printedPage!==402||r.compendiumSource?.id!=='spices2024'||r.compendiumSource.pdfPage!==(gi===0?34:35))
     return denied('Asafoetida grade limits or bases are inconsistent.');
   }
  }
  if(a.recipe?.number!=='13.1'||a.recipe.ingredientSerial!==5||a.recipe.partUsed!=='Oleoresin gum'||a.recipe.ratio!=='Q.S.'||
    a.recipe.pdfPage!==88||a.recipe.printedPage!==53||a.recipe.automaticGrade!==null||
    a.recipe.identityStatus!=='GRADE_AND_BOTANICAL_IDENTITY_OPEN')return denied('Hingu recipe identity is inconsistent.');
  for(const key of ['gazette2011','spices2024','recipe2025','ayurveda2022']){
   const s=a.sources?.[key];
   try{const url=new URL(s?.url);if(url.protocol!=='https:'||!/(^|\.)fssai\.gov\.in$/i.test(url.hostname)||
     !/^[a-f0-9]{64}$/.test(s.sha256)||s.retrievedOn!==data.latestSourceReviewDate)return denied('Asafoetida source document is invalid.');}
   catch(error){return denied('Asafoetida source document is invalid.');}
  }
  const cam=data.camphorReview;
  if(!cam||cam.round!==77||cam.reviewedOn!==data.latestSourceReviewDate||cam.report!=='ctr-camphor-source-r77-2026-11-17.md'||
     cam.sourceStatus!=='ARCHIVED_PRIMARY_MONOGRAPH_REFERENCE'||cam.publicationYear!==2008||cam.edition!=='First edition'||
     cam.editionEffectiveFrom!=='2009-01-01'||cam.sourceEntryCount!==5||cam.parsedNumericEntries!==3||cam.sourceLiteralEntries!==1||cam.referencePointerEntries!==1||
     cam.baseMonographRetrieved!==true||cam.baseMonographVisuallyChecked!==true||cam.fullCurrentLawComplete!==false||
     cam.allReferencedMethodsVerified!==false||cam.opticalRotationInterpretationResolved!==false||cam.recipeSafeDoseEstablished!==false||
     cam.therapeuticDoseImported!==false||cam.syntheticSubstitutionApproved!==false||cam.ocimumSubstitutionApproved!==false||
     cam.recipe146HoldResolved!==false||cam.legalProductApproval!==false||cam.batchRelease!==false||cam.autoApplyLimits!==false||
     cam.ctrRulesChanged!==false||cam.ingredientGapsClosed!==0||cam.remainingAyurvedaIngredientGaps!==14||
     !Array.isArray(cam.rows)||cam.rows.length!==5||!Array.isArray(cam.records)||cam.records.length!==2||!Array.isArray(cam.findings)||cam.findings.length!==6)
   return denied('Camphor source evidence is incomplete.');
  const camExpected=[['melting-range','range',174,179,'°C','174–179 °C'],['specific-optical-rotation','source-literal',null,null,'degrees','+41° +43° (as printed)'],['non-volatile-matter','maximum',null,0.05,'%','Maximum 0.05%'],['camphor-assay','minimum',96,null,'%','Minimum 96.0%'],['pesticide-residue','pointer',null,null,null,'API Appendix 2.5 reference']];
  if(!cam.rows.every((r,i)=>r&&[r.id,r.kind,r.minimum,r.maximum,r.unit,r.display].every((v,j)=>v===camExpected[i][j])&&
    r.sourceId==='monograph210'&&r.printedPage===210&&r.referenceOnly===true&&r.autoApply===false&&r.method&&r.note))
   return denied('Camphor source values or unresolved literals are inconsistent.');
  const camIds=['102-102-1-14-5-dugdha-kupika-stuffed-fried-cottage-cheese-dumplings','102-102-1-14-6-sugandhit-ksheera-aroma-infused-milk'];
  if(!cam.records.every((r,i)=>r&&r.id===camIds[i]&&ids.has(r.id)&&r.recipeNumber===(i===0?'14.5':'14.6')&&
    r.use===(i===0?'listed-ingredient':'method-only')&&r.ingredientSerial===(i===0?5:null)&&r.recipeAlignmentHold===(i===1)&&
    r.partLiteral===(i===0?'Sub. extract':null)&&r.ratio===(i===0?'Q.S.':null)&&r.sourceReviewResult&&r.sourceReviewNextAction))
   return denied('Camphor recipe mapping is inconsistent.');
  for(const [key,scan,page] of [['title',9,'III'],['publication',10,'IV'],['generalNotices',22,'XVI'],['monograph210',250,'210'],['monograph211',251,'211']]){
   const s=cam.sources?.[key];
   if(!s||s.url!==`https://iiif.wellcomecollection.org/image/b32220522_0006_${String(scan).padStart(4,'0')}.jp2/full/1400,/0/default.jpg`||
     s.assetType!=='page-image'||s.scanNumber!==scan||s.printedPage!==page||!/^[a-f0-9]{64}$/.test(s.sha256)||s.retrievedOn!==data.latestSourceReviewDate)
    return denied('Archived camphor source image is inconsistent.');
  }
  for(const key of ['recipe2025','ayurveda2022']){
   const s=cam.sources?.[key];
   try{const u=new URL(s?.url);if(u.protocol!=='https:'||!/(^|\.)fssai\.gov\.in$/i.test(u.hostname)||!/^[a-f0-9]{64}$/.test(s.sha256))return denied('Camphor food-source reference is invalid.');}
   catch(error){return denied('Camphor food-source reference is invalid.');}
  }
  if(cam.amendmentWatch?.completeAmendmentChain!==false||cam.amendmentWatch.pdfBytesVerified!==false||
    cam.amendmentWatch.url!=='https://www.pcimh.gov.in/assets/pdf/whatsnew/Amendment.pdf')return denied('Camphor amendment review is overstated.');
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
