import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const review=JSON.parse(read('fssai-helper/ctr-water-source-review-r74-2026-11-17.json'));
const prior=JSON.parse(read('fssai-helper/ayurveda-unmapped-ingredient-source-review-r37-2026-11-04.json'));
const oldRows=prior.all_24_prior_no_reference_ingredient_rows.filter(r=>r.source_family==='water');
assert.equal(review.records.length,5);assert.equal(oldRows.length,4);
for(const row of oldRows){
 const current=review.records.find(r=>r.id===row.catalogue_id);assert(current);
 assert.equal(current.use,'ingredient');assert.equal(current.recipeNumber,row.recipe_number);
 assert.equal(current.ingredientSerial,row.source_ingredient_serial);assert.equal(current.ingredientName,row.source_name);
 assert.equal(current.ratio,row.source_ratio);assert.equal(current.recipeTitleMethodHold,row.recipe_title_method_alignment_lock);
}
assert.equal(review.bisStandard.amendmentCount,4);
assert.equal(review.bisStandard.completeNormativeTextVerified,false);
assert.equal(review.counts.waterGapsClosed,0);assert.equal(review.counts.remainingAyurvedaIngredientGaps,14);
assert.equal(review.draftReplacement.autoApply,false);assert.equal(review.draftReplacement.finalReplacementEstablished,false);
for(const source of Object.values(review.sources))assert.match(source.sha256,/^[a-f0-9]{64}$/);
const {documentGuide}=require('../fssai-helper/water-evidence-r74.js');
let cases=0;
function guide(input){
 cases++;const r=documentGuide(input);
 for(const flag of ['legalProductApproval','batchRelease','waterQualityApproved','autoApplyLimits'])assert.equal(r[flag],false);
 assert.equal(r.dueDate,null);return r;
}
for(const supplier of ['municipal','private','own']){
 const r=guide({use:'ingredient',supplier});assert.equal(r.status,'DOCUMENT_GUIDANCE_ONLY');
 assert.match(r.message,/21 July 2022/);assert.match(r.message,/No water-quality or product approval/);
}
assert.match(guide({use:'ingredient',supplier:'private'}).message,/no more than one year old/);
assert.match(guide({use:'ingredient',supplier:'private'}).message,/financial year.*six months/);
assert.match(guide({use:'ingredient',supplier:'municipal'}).message,/commercial-use water bills/);
assert.match(guide({use:'ingredient',supplier:'own'}).message,/No municipal documentation concession/);
for(const use of ['vending','packaged','mineral','captive','',null]){
 const r=guide({use,supplier:'municipal'});assert.equal(r.status,'OUTSIDE_INGREDIENT_FAQ');
 assert.doesNotMatch(r.message,/allows commercial|testing concession when/);
}
for(const supplier of ['mixed','unknown','__proto__','constructor','',null,1])assert.equal(guide({use:'ingredient',supplier}).status,'INPUT_REQUIRED');
for(const input of [null,undefined,1,'municipal',{}])assert.notEqual(guide(input).status,'DOCUMENT_GUIDANCE_ONLY');
const context={window:{},URL};vm.createContext(context);
for(const name of ['full-catalogue-533.js','review-status-data.js'])vm.runInContext(read('fssai-helper/'+name),context);
const register=JSON.parse(JSON.stringify(context.window.PMSV_REVIEW_REGISTER));
const catalogue=JSON.parse(JSON.stringify(context.window.PMSV_CATALOGUE));
const {validateReview}=require('../fssai-helper/review-status.js');
assert.equal(validateReview(register,catalogue).ok,true);
for(const row of review.records){assert(register.records.find(r=>r.id===row.id).reports.some(r=>r.round===74));}
for(const mutate of [d=>delete d.waterSourceReview,d=>d.waterSourceReview.records.pop(),d=>d.waterSourceReview.records[0].use='ingredient',d=>d.waterSourceReview.records[3].recipeTitleMethodHold=false,d=>d.waterSourceReview.draftReplacement.autoApply=true,d=>d.waterSourceReview.draftReplacement.finalReplacementEstablished=true,d=>d.waterSourceReview.bisStandard.completeNormativeTextVerified=true,d=>d.waterSourceReview.counts.waterGapsClosed=4,d=>d.waterSourceReview.legalProductApproval=true,d=>d.waterSourceReview.sources.bis='https://bis.gov.in.example.test/standard',d=>d.waterSourceReview.sources.ingredient='javascript:alert(1)']){
 const bad=structuredClone(register);mutate(bad);assert.equal(validateReview(bad,catalogue).ok,false);
}
console.log(`R74 PASS: 5 source routes, 4 unchanged recipe-water mappings, ${cases} document-guidance/invalid-input cases; draft activation, gap closure and tampered source rejected.`);
