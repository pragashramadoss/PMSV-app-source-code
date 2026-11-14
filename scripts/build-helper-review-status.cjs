'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),dir=path.join(root,'fssai-helper');
const read=p=>JSON.parse(fs.readFileSync(path.join(dir,p),'utf8'));
const register=read('ctr-137-evidence-readiness-r50-2026-11-04.json');
const ids=new Set(register.records.map(x=>x.id));
assert.equal(ids.size,137);
const focusedRounds=new Set([45,46,47,48,...Array.from({length:16},(_,i)=>54+i)]);
const followup=read('ctr-remaining-source-scope-r69-2026-11-14.json');
const gazetteFile='ctr-original-gazette-concordance-r70-2026-11-14.json';
const gazette=read(gazetteFile);
const residueFile='ctr-residue-gazette-concordance-r71-2026-11-14.json';
const residue=read(residueFile);
const followupById=new Map(followup.records.map(x=>[x.id,x]));
assert.equal(followupById.size,70);
const reports=new Map([...ids].map(id=>[id,[]]));
const sourceFiles=[];
for(const file of fs.readdirSync(dir).sort()){
 const match=file.match(/-r(\d+)-.*\.json$/);if(!match||!focusedRounds.has(Number(match[1])))continue;
 const found=new Set();
 function walk(value){
  if(typeof value==='string'&&ids.has(value))found.add(value);
  else if(Array.isArray(value))value.forEach(walk);
  else if(value&&typeof value==='object')Object.values(value).forEach(walk);
 }
 walk(read(file));const report=file.replace(/\.json$/,'.md');
 assert(fs.existsSync(path.join(dir,report)),report);
 sourceFiles.push(file);
 for(const id of found)reports.get(id).push({round:Number(match[1]),file:report});
}
const records=register.records.map(row=>({
 id:row.id,name:row.name,fssr:row.fssr,fcs:row.fcs,priority:row.priority,route:row.route,
 reports:reports.get(row.id).sort((a,b)=>b.round-a.round),
 legalArticleDecision:'OPEN',
 sourceReviewResult:followupById.get(row.id)?.sourceReviewResult||'See the linked focused source review for confirmed wording and scope conditions.',
 sourceReviewNextAction:followupById.get(row.id)?.sourceReviewNextAction||'Reconcile the exact applicable article, original Gazette and effective amendments, qualifiers, units and analytical-method scope. '+
  (row.blocker==='WRONG_COCOA_POWDER_ARTICLE'?'Do not substitute the cocoa-powder article.':
   row.blocker==='OFFICIAL_AYURVEDA_RECIPE_14_6_14_7_METHOD_ALIGNMENT'?'Resolve the published recipe title/method discrepancy.':
   row.route==='CONDITIONAL_FPC18_DIRECTION'?'Check eligibility and the direction’s applicable base-food references.':
   row.route==='FOSCOS_CLASSIFICATION_ROUTE_NOT_CTR_DECISION'?'FoSCoS classification alone does not establish a numeric limit.':
   row.route==='AYURVEDA_CATEGORY_A_RECIPE_SOURCE_ANCHORED'?'Reconcile the source recipe, Schedule D and ingredient-purity requirements.':
   'Keep product-form and competing-article conditions explicit.'),
 lotReleaseEvidence:'Actual SKU identity and recipe, process and pack, traceable lot reports and authorized QA assessment are separate from source-text verification.'
}));
const focusedCount=records.filter(x=>x.reports.length).length;
assert.equal(focusedCount,137,'Selected R45–R69 coverage must be derived from original IDs.');
const data={schemaVersion:1,checkpointDate:'2026-11-14',latestSourceReviewDate:'2026-11-14',latestRound:71,
 catalogueCount:533,queueCount:records.length,focusedCount,remainingFocusedCount:records.length-focusedCount,
 legalProductApprovals:0,batchReleases:0,
 scope:'Selected earlier focused reviews cover 67 identities; R69 adds source-wording and scope checks for the remaining 70. All 137 queue identities have a linked review, while all 137 exact CTR article decisions remain OPEN. This is not complete regulatory verification of the 533 products.',
 sourceVerificationRequiresLotReport:false,
 softwareVerification:'Automated data, browser and audit results are documented in verification-2026-11-14.md. These software checks are separate from complete current-law verification, which remains open.',
 sourceFiles:[...sourceFiles,gazetteFile,residueFile],records,
 residueGazetteReview:{round:71,report:residueFile.replace(/\.json$/,'.md'),checkedOn:residue.reviewedOn,
  pesticideRows:residue.counts.pesticideRows,veterinaryRows:residue.counts.veterinaryRows,
  honeyRows:residue.counts.honeyRows,prohibitedClasses:residue.counts.prohibitedClasses,
  numericMismatches:0,numericRulesChanged:false,fullCurrentLawComplete:false,productApprovals:0,
  summary:'1,098 pesticide entries and 358 veterinary entries were compared with original Gazette tables, plus 12 honey entries and 14 prohibited substance classes. No stored numerical limit changed. Article wording, chemical names, sample basis and repeated rows retain explicit safeguards.',
  findings:residue.findings},
 originalGazetteReview:{round:70,report: gazetteFile.replace(/\.json$/,'.md'),checkedOn:gazette.reviewedOn,
  metalRows:gazette.counts.metalRows,cropRows:gazette.counts.cropRows,
  fullCurrentLawComplete:false,numericRulesChanged:false,productApprovals:0,
  summary:'382 metal entries and 27 crop-contaminant entries match the original notifications, including the changes effective from April 2025. Packaging, analytical basis, unusual source literals and overlapping article descriptions remain explicit. Exact product applicability still requires review.',
  futureChanges:gazette.futureChanges.map(({id,title,effectiveFrom,scopeNote})=>({id,title,effectiveFrom,scopeNote,autoApply:false,operativeOnReviewDate:false}))},
 currencyWatch:[
  {title:'May 2026 contaminants amendment',source:gazette.sources.ctr2026.url,sourceSha256:gazette.sources.ctr2026.sha256,checked:'2026-11-14',effectiveFrom:'2026-12-01',status:'Nine changes checked against the original notification: pulse flours, fish-oil arsenic, oil/oilseed aflatoxin wording, saffrole scope and seafood drug provisions. Future on this review date; no changes activated.'},
  {title:'Milk-logo graphic specifications notification',source:followup.sources.milk_logo.url,sourceSha256:followup.sources.milk_logo.sha256,checked:'2026-11-14',listed:'2026-11-06',effectiveFrom:'2028-07-01',status:'Original Gazette clause 1(2) and graphic table checked. The new specifications commence on 1 July 2028; no dimensions activated. Earlier milk-logo obligations require their own direction-chain review.'},
  {title:'Original metal and crop-contaminant tables',source:gazette.sources.ctr2020.url,sourceSha256:gazette.sources.ctr2020.sha256,checked:'2026-11-14',status:'All 382 metal entries reconciled with the original 2020 replacement table. Crop entries were checked with the later operative replacements. A source match does not resolve competing article scopes or approve a product.'},
  {title:'Operative 2024 crop-contaminant replacements',source:gazette.sources.ctr2024.url,sourceSha256:gazette.sources.ctr2024.sha256,checked:'2026-11-14',effectiveFrom:'2025-04-01',status:'The original Ochratoxin A and Deoxynivalenol replacements match the stored source rows. The listed commodities and µg/kg units are retained; no automatic assignment to processed or composite foods.'}
 ]};
const output='/* Generated by scripts/build-helper-review-status.cjs; review coverage only. */\nwindow.PMSV_REVIEW_REGISTER = '+JSON.stringify(data,null,2)+';\n';
const target=path.join(dir,'review-status-data.js');
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),output,'Regenerate the review register');
else fs.writeFileSync(target,output);
console.log('Review register: 533 catalogue entries, 137 open cases, 137 source reviews, 0 outside selected rounds.');
