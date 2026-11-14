import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const report=JSON.parse(read('fssai-helper/ctr-original-gazette-concordance-r70-2026-11-14.json'));
const raw=read(report.coreSnapshot.path),core=JSON.parse(raw);
const norm=s=>s.toLowerCase().replace(/expressed in mg\/l|in mg\/l/g,'').replace(/[^a-z0-9]/g,'');
assert.equal(createHash('sha256').update(raw).digest('hex'),report.coreSnapshot.sha256,'Audited core snapshot changed');
assert.equal(report.sources.ctr2020.sha256,'5d376f55999049e7272b84294b3b5e5bfc228c3ef772754bfbd328045212c3dd');
assert.equal(report.sources.ctr2024.sha256,'7f677539c1bd4adbe524e998b7e81d81f712e2d3dd6568282aae21b14ec49dd6');
assert.equal(report.sources.ctr2026.sha256,'f625a2629d2eb28a6dcc9e1035920228f4592be5589232cdcbd2bab22bc573ea');
assert.equal(report.sources.ctr2024.effectiveFrom,'2025-04-01');
assert.equal(report.sources.ctr2026.notificationDate,'2026-05-14');
assert.equal(report.sources.ctr2026.listedUploadDate,'2026-05-25');
assert.equal(report.sources.ctr2026.effectiveFrom,'2026-12-01');
assert.equal(report.metalRows.length,382);
const seen=new Set();let direct=0,separateCondition=0;
for(const r of report.metalRows){
 const key=r.metal+':'+r.coreIndex;
 assert(!seen.has(key),'Duplicate source/core mapping');seen.add(key);
 const row=core.metal_article_rules_v9[r.metal]?.[r.coreIndex];assert(row,key);
 assert.deepEqual([r.article,r.coreLimit,r.coreUnit,r.coreCondition],[row.article,row.limit,row.unit,row.condition]);
 assert.equal(r.sourceId,'ctr2020');assert(r.sourcePdfPage>=18&&r.sourcePdfPage<=28);
 assert.equal(Number(r.originalLimit.match(/^\d+(?:\.\d+)?/)[0]),row.limit);
 assert.equal(/mg\/l/i.test(r.originalArticle)?'mg/L':'mg/kg',row.unit);
 let article=row.article;
 if(norm(article)===norm(r.originalArticle))direct++;
 else{
  assert((r.metal==='Tin'&&/containers/.test(row.condition))||(r.metal==='Lead'&&article==='Milks'));
  article+=' '+row.condition;separateCondition++;
 }
 assert.equal(norm(article),norm(r.originalArticle),'Original article/qualifier mismatch: '+key);
 assert.equal(r.numericRuleChanged,false);assert.equal(r.automaticProductApplication,false);
}
assert.equal(seen.size,Object.values(core.metal_article_rules_v9).reduce((sum,rows)=>sum+rows.length,0));
assert.equal(direct,371);assert.equal(separateCondition,11);
// Preserve source issues that a simple matching-number check would conceal.
for(const [article,value] of [['Fish and Crustaceans',76],['Molluscs',86]]){
 const r=report.metalRows.find(r=>r.metal==='Arsenic'&&r.article===article);
 assert.equal(r.originalLimit,String(value));assert.match(r.coreCondition,/does not infer a correction/);
}
const copper=report.metalRows.find(r=>r.metal==='Copper'&&r.article==='Infant milk substitute and Infant foods');
assert.match(copper.originalLimit,/not less than 2\.8/);assert.match(copper.coreCondition,/not less than 2\.8/);
const cocoa=report.metalRows.find(r=>r.metal==='Lead'&&r.article==='Cocoa powder');
assert.match(cocoa.originalLimit,/dry fat free substance/);assert.match(cocoa.coreCondition,/dry fat-free substance/);
assert.equal(report.metalRows.filter(r=>r.article==='Foods not specified').length,6);
assert.equal(report.metalRows.filter(r=>r.article==='Foods not specified').every(r=>!r.automaticProductApplication),true);

const cropSeen=new Set();assert.equal(report.cropRows.length,27);
for(const r of report.cropRows){
 const key=r.group+':'+r.article;assert(!cropSeen.has(key));cropSeen.add(key);
 const rows=core.crop_contaminants[r.group].rules.filter(row=>row.article===r.article);
 assert.equal(rows.length,1);assert.equal(rows[0].limit,r.originalLimit);
 assert.equal(r.unit,'µg/kg');assert.equal(core.crop_contaminants[r.group].unit,r.unit);
 assert.equal(r.numericRuleChanged,false);assert.equal(r.automaticProductApplication,false);
 if(r.group==='ochratoxin_a'||r.group==='deoxynivalenol'){
  assert.equal(r.sourceId,'ctr2024');assert.equal(r.sourcePdfPage,17);assert.equal(r.effectiveFrom,'2025-04-01');
 }else assert.equal(r.sourceId,'ctr2020');
}
assert.equal(report.cropRows.filter(r=>r.originalArticleCell.startsWith('Oilseeds or oil:')).length,4);
const ota=report.cropRows.find(r=>r.group==='ochratoxin_a');
assert.equal(ota.replaced2020Limit,20);assert.equal(ota.originalLimit,5);
assert.equal(ota.article,'Wheat, wheat bran, rye, barley, coffee');
const don=report.cropRows.find(r=>r.group==='deoxynivalenol');
assert.equal(don.replaced2020Article,'Wheat');assert.equal(don.article,'Wheat, wheat bran, barley');

assert.equal(new Set(report.futureChanges.map(x=>x.id)).size,9);
for(const r of report.futureChanges){
 assert.equal(r.effectiveFrom,'2026-12-01');assert(r.effectiveFrom>report.reviewedOn);
 assert.equal(r.autoApply,false);assert.equal(r.operativeOnReviewDate,false);
 assert.equal(r.sourceId,'ctr2026');assert(r.sourcePdfPage>=4&&r.sourcePdfPage<=6);
}
assert.match(report.futureChanges.find(r=>r.id==='arsenic-fish-oils').scopeNote,/exactly equal/);
assert.match(report.futureChanges.find(r=>r.id==='cadmium-pulse-flours').after,/excluding soybean dry/);
assert.match(report.futureChanges.find(r=>r.id==='saffrole-scope').scopeNote,/whole serial-number-4 entry/);
assert.equal(report.reviewBoundary.fullCurrentLawComplete,false);
assert.equal(report.reviewBoundary.openExactArticleDecisions,137);
assert.equal(report.reviewBoundary.originalAyurvedaIngredientGaps,14);
assert.equal(report.reviewBoundary.waterQualityEntriesWithin14+report.reviewBoundary.botanicalEntriesWithin14,14);
assert.equal(report.reviewBoundary.ayurvedaRecipe146147Resolved,false);
assert.equal(report.reviewBoundary.futureProvisionsActivated,false);

const context={window:{}};vm.createContext(context);
for(const p of ['full-catalogue-533.js','review-status-data.js'])vm.runInContext(read('fssai-helper/'+p),context);
const data=JSON.parse(JSON.stringify(context.window.PMSV_REVIEW_REGISTER));
const catalogue=JSON.parse(JSON.stringify(context.window.PMSV_CATALOGUE));
const require=createRequire(import.meta.url),api=require('../fssai-helper/review-status.js');
assert.equal(api.validateReview(data,catalogue).ok,true);
assert.equal(data.originalGazetteReview.metalRows,382);assert.equal(data.originalGazetteReview.cropRows,27);
for(const mutate of [
 d=>delete d.originalGazetteReview,
 d=>d.originalGazetteReview.metalRows=381,
 d=>d.originalGazetteReview.fullCurrentLawComplete=true,
 d=>d.originalGazetteReview.numericRulesChanged=true,
 d=>d.originalGazetteReview.productApprovals=1,
 d=>d.originalGazetteReview.report='../index.html',
 d=>d.originalGazetteReview.futureChanges.pop(),
 d=>d.originalGazetteReview.futureChanges[0].effectiveFrom='2026-11-14',
 d=>d.originalGazetteReview.futureChanges[0].operativeOnReviewDate=true,
 d=>d.originalGazetteReview.futureChanges[0].autoApply=true,
 d=>d.originalGazetteReview.futureChanges[1].id=d.originalGazetteReview.futureChanges[0].id
]){
 const bad=structuredClone(data);mutate(bad);assert.equal(api.validateReview(bad,catalogue).ok,false);
}
console.log('R70 PASS: 382 metal rows, 27 crop rows, original source qualifiers, nine future-only changes, complete export data and invalid-evidence rejection.');
