import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {checkR66} from '../fssai-helper/ctr-thermal-fruit-vegetable-source-gate-r66-20261111.mjs';
import {checkR67} from '../fssai-helper/ctr-rte-curried-vegetables-source-gate-r67-20261111.mjs';
import {checkR68} from '../fssai-helper/ctr-pulp-puree-source-gate-r68-20261111.mjs';
import {reviewR50Evidence} from '../fssai-helper/ctr-137-evidence-review-gate-r50-20261104.mjs';
const require=createRequire(import.meta.url),api=require('../fssai-helper/review-status.js');
const read=name=>fs.readFileSync(new URL('../fssai-helper/'+name,import.meta.url),'utf8');
const json=name=>JSON.parse(read(name));
const context={window:{}};vm.createContext(context);
vm.runInContext(read('full-catalogue-533.js'),context);
vm.runInContext(read('review-status-data.js'),context);
const rows=JSON.parse(JSON.stringify(context.window.PMSV_CATALOGUE));
const data=JSON.parse(JSON.stringify(context.window.PMSV_REVIEW_REGISTER));
assert.equal(api.catalogueStatus(rows).ok,true);
assert.deepEqual(api.validateReview(data,rows),{ok:true,catalogueCount:533,queueCount:137,focusedCount:67,remainingFocusedCount:70,legalProductApproval:false,batchRelease:false});
for(const invalid of [null,{},[],rows.slice(0,123),[...rows.slice(1),rows[1]],rows.map((x,i)=>i===10?null:x)]){
 assert.equal(api.catalogueStatus(invalid).ok,false);
 assert.equal(api.validateReview(data,invalid).ok,false);
}
for(const mutate of [d=>d.records.pop(),d=>d.records[0].id='missing',d=>d.records[1].id=d.records[0].id,
 d=>d.focusedCount++,d=>d.remainingFocusedCount--,d=>d.legalProductApprovals=1,
 d=>d.records[0].legalArticleDecision='APPROVED',d=>d.sourceVerificationRequiresLotReport=true,
 d=>d.records[0].reports=[{round:68,file:'../index.html'}],d=>d.currencyWatch[0].source='javascript:alert(1)',
 d=>d.currencyWatch[0].source='https://fssai.gov.in.example.com/']){
 const changed=structuredClone(data);mutate(changed);assert.equal(api.validateReview(changed,rows).ok,false);
}
const r66=json('ctr-thermally-processed-fruit-vegetable-r66-2026-11-11.json');
const r67=json('ctr-rte-curried-vegetables-r67-2026-11-11.json');
const r68=json('ctr-pulp-puree-industrial-concentrates-r68-2026-11-11.json');
for(const invalid of [null,undefined,false,0,'',[],{}]){
 const a=structuredClone(r66);a.product_records[0]=invalid;
 assert.equal(checkR66(a,r66.product_records[0].id).status,'INTEGRITY_HOLD');
 const b=structuredClone(r68);b.products[0]=invalid;
 assert.equal(checkR68(b,r68.products[0].id).status,'SOURCE_INTEGRITY_HOLD');
 const c=structuredClone(r67);c.record.source_optional_ingredients=invalid;
 assert.equal(checkR67(c).status,'SOURCE_INTEGRITY_HOLD');
 assert.equal(reviewR50Evidence(json('ctr-137-evidence-readiness-r50-2026-11-04.json').records[0],invalid).legalProductPASS,false);
}
for(const value of [1,'true',{},[],null]){
 const changed=structuredClone(r67);changed.record.permitted_additives_must_be_checked_under_regulations_and_appendices=value;
 assert.equal(checkR67(changed).status,'SOURCE_INTEGRITY_HOLD');
}
const html=read('index.html');
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(match[1].trim())new vm.Script(match[1]);
assert(html.includes("requested='overview'"));
assert(html.includes("window.PMSV_CATALOGUE=[]"));
console.log('Helper integrity PASS: full catalogue, review coverage, official URL safety, malformed records and script syntax.');
