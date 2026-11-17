import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const data=JSON.parse(read('fssai-helper/ctr-fibre-claims-source-r73-2026-11-17.json'));
const {compare}=require('../fssai-helper/fibre-claims-r73.js');
const core=JSON.parse(read('fssai-product-helper-preview-01/data/rules/chapter-2-11-other-food-products-v1.json'));
const refs=core.standards.find(x=>x.key==='2.11.8').claim_reconciliation_r12;
let comparisons=0;
function check(input){comparisons++;const r=compare(input);assert.equal(r.labelApproved,false);assert.equal(r.legalProductApproval,false);assert.equal(r.batchRelease,false);assert.equal(r.sourceDecision,'CONFLICT_OPEN');return r;}
assert.equal(data.thresholdRows.length,6);
for(const row of data.thresholdRows){
 assert.equal(refs[row.claim==='source'?'source_minimums':'high_or_rich_minimums'][row.basis],row.minimum);
 for(const [delta,expected] of [[-.001,false],[0,true],[.001,true]]){
  const r=check({basis:row.basis,claim:row.claim,fibre:row.minimum+delta});assert.equal(r.status,'ARITHMETIC_ONLY');assert.equal(r.thresholdMet,expected);assert.equal(r.minimum,row.minimum);
 }
}
const valid={basis:'g_per_100g_solids',claim:'high',fibre:4};
assert.equal(check(valid).thresholdMet,false,'Legacy 3–6 range must not qualify a high claim');
assert.equal(check({...valid,fibre:9}).thresholdMet,true,'No legacy upper ceiling in the generic minimum comparison');
for(const patch of [{basis:'g_per_serving'},{basis:'g_per_100ml_solids'},{basis:'__proto__'},{basis:null},{claim:'rich'},{claim:'health'},{fibre:''},{fibre:'6'},{fibre:null},{fibre:false},{fibre:NaN},{fibre:Infinity},{fibre:-1}])assert.equal(check({...valid,...patch}).status,'INPUT_REQUIRED');
assert.equal(check(null).status,'INPUT_REQUIRED');assert.equal(check({}).status,'INPUT_REQUIRED');
assert.equal(check({...valid,basis:'g_per_100ml_liquids',fibre:3}).thresholdMet,true);
assert.equal(check({...valid,basis:'g_per_100g_solids',fibre:3}).thresholdMet,false);
assert.equal(check({...valid,basis:'g_per_100kcal',fibre:3}).thresholdMet,true);
assert.equal(Object.keys(data.sources).length,7);
for(const s of Object.values(data.sources)){assert.match(s.sha256,/^[a-f0-9]{64}$/);assert(s.bytes>100000);assert(s.pdfPages.length);assert.match(new URL(s.url).hostname,/(^|\.)fssai\.gov\.in$/);}
assert.equal(data.numericMismatchesWithR12,0);assert.equal(data.sourceDecision,'CONFLICT_OPEN');assert.equal(data.fullCurrentLawComplete,false);
const context={window:{},URL};vm.createContext(context);
for(const name of ['full-catalogue-533.js','review-status-data.js'])vm.runInContext(read('fssai-helper/'+name),context);
const register=JSON.parse(JSON.stringify(context.window.PMSV_REVIEW_REGISTER));
const catalogue=JSON.parse(JSON.stringify(context.window.PMSV_CATALOGUE));
const api=require('../fssai-helper/review-status.js');assert.equal(api.validateReview(register,catalogue).ok,true);
assert.equal(register.records.find(r=>r.id===data.productId).reports[0].round,73);
for(const mutate of [d=>delete d.fibreClaimsReview,d=>d.fibreClaimsReview.thresholdRows[0].minimum=6,d=>d.fibreClaimsReview.thresholdRows[1].basis='g_per_100g_solids',d=>d.fibreClaimsReview.labelApproved=true,d=>d.fibreClaimsReview.sourceDecision='RESOLVED',d=>d.fibreClaimsReview.source='javascript:alert(1)',d=>d.fibreClaimsReview.findings.pop()]){
 const bad=structuredClone(register);mutate(bad);assert.equal(api.validateReview(bad,catalogue).ok,false);
}
console.log(`R73 PASS: 6 original-source thresholds, ${comparisons} arithmetic/basis/invalid-input comparisons, source conflict preserved and tampered review rejected.`);
