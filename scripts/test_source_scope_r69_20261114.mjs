import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=n=>fs.readFileSync(new URL('../fssai-helper/'+n,import.meta.url),'utf8');
const r=JSON.parse(read('ctr-remaining-source-scope-r69-2026-11-14.json'));
const queue=JSON.parse(read('ctr-137-evidence-readiness-r50-2026-11-04.json'));
const ids=new Set(queue.records.map(x=>x.id));
assert.equal(r.records.length,70);assert.equal(new Set(r.records.map(x=>x.id)).size,70);
assert.equal(r.exact_article_decisions_closed,0);
assert.equal(r.original_gazette_chain_complete,false);
assert.equal(r.full_product_approvals,0);assert.equal(r.batch_releases,0);
for(const record of r.records){
 assert(ids.has(record.id));assert.equal(record.source_wording_checked,true);
 assert.equal(record.source_verification_requires_lot_report,false);
 assert.equal(record.exact_article_decision,'OPEN');
 for(const flag of ['full_current_law_verified','auto_apply_numeric_rules','legalProductApproval','batchRelease'])assert.equal(record[flag],false);
 assert(record.sourceReviewResult.length>70);assert(record.sourceReviewNextAction.length>70);
 assert(record.source_evidence.length>0);assert(record.ctr_source_pages.includes(12));
 for(const evidence of record.source_evidence){
  assert(r.sources[evidence.source]);assert(evidence.pdf_pages.length>0);
  assert(evidence.pdf_pages.every(n=>Number.isInteger(n)&&n>0));
  assert(evidence.clause);assert(evidence.finding);
 }
}
for(const s of Object.values(r.sources)){
 const url=new URL(s.url);assert.equal(url.protocol,'https:');
 assert(/(^|\.)fssai\.gov\.in$/.test(url.hostname));
 assert(/^[a-f0-9]{64}$/.test(s.sha256));assert.equal(s.retrieved_on,'2026-11-14');
}
// Verified primary PDF bytes, not hashes of an altered helper rule file.
assert.equal(r.sources.ctr.sha256,'8300ea34f1e88680ae4bbef52e0ec49331dbbfd1d5d6aa2612852bcb8779b26d');
assert.equal(r.sources.ayurveda_order.sha256,'498d6f579357e7bb8e8d7b9f7741db5863f6eea8d29ffd559ff9add7d32d7edc');
assert.equal(r.sources.milk_logo.sha256,'a2148db8da75e68f66065510bcbd7d17e48a82256f8d58689ecec6a35d2c737b');
const six=r.records.find(x=>x.id.startsWith('102-102-1-14-6-'));
const seven=r.records.find(x=>x.id.startsWith('102-102-1-14-7-'));
assert.deepEqual(six.source_evidence[0].pdf_pages,[96,97]);
assert.deepEqual(six.printed_recipe_pages,[60,61]);
assert.deepEqual(seven.source_evidence[0].pdf_pages,[98]);
assert.deepEqual(seven.printed_recipe_pages,[62]);
assert.equal(r.ayurveda_visual_resolution.earlier_r53_image_unavailable_limitation_resolved,true);
assert.equal(r.ayurveda_visual_resolution.recipe_14_6_14_7_discrepancy_resolved,false);
assert.equal(r.ayurveda_visual_resolution.ingredient_ctr_source_gaps_remaining,14);
const milk=r.currency_watch[0];
assert.equal(milk.commencement,'2028-07-01');
assert.equal(milk.operative_on_review_date,false);assert.equal(milk.numeric_rule_activated,false);
assert.equal(milk.automatic_boundary_interpretation,false);
assert.deepEqual(milk.graphic_rows.map(x=>x.square_mm),[6,8,12,16]);
assert.deepEqual(milk.graphic_rows.map(x=>x.drop_height_mm),[4.56,6.08,9.12,12.16]);
// Active links use the retrieved original at its current official location.
for(const name of ['index.html','full-catalogue-533.js']){
 assert(!read(name).includes('https://fssai.gov.in/upload/notifications/2022/05/62789a20b54bd'));
 assert(read(name).includes(r.sources.ayurveda_reg.url));
}
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(read('review-status-data.js'),ctx);
const register=JSON.parse(JSON.stringify(ctx.window.PMSV_REVIEW_REGISTER));
assert.equal(register.focusedCount,137);assert.equal(register.remainingFocusedCount,0);
assert.equal(register.records.filter(x=>x.reports.some(r=>r.round===69)).length,70);
assert.equal(register.records.filter(x=>x.reports.some(r=>r.round!==69)).length,67);
for(const record of r.records){
 const linked=register.records.find(x=>x.id===record.id);
 assert.equal(linked.sourceReviewResult,record.sourceReviewResult);
 assert.equal(linked.sourceReviewNextAction,record.sourceReviewNextAction);
 assert.equal(linked.legalArticleDecision,'OPEN');
}
assert.equal(register.currencyWatch[1].effectiveFrom,milk.commencement);
assert.equal(register.currencyWatch[1].source,r.sources.milk_logo.url);
console.log('R69 PASS: 70 unique source reviews, original source fingerprints, image-page mapping, unresolved decisions and future-only milk-logo specifications.');
