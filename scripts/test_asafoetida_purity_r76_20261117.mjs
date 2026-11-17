import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),root=new URL('../fssai-helper/',import.meta.url);
const read=n=>fs.readFileSync(new URL(n,root),'utf8');
const a=JSON.parse(read('ctr-asafoetida-purity-r76-2026-11-17.json'));
const {select,gradeMarkup,markup}=require('../fssai-helper/asafoetida-purity-r76.js');
assert.equal(a.rows.length,11);
// Grade swaps and importing Hing's starch maximum into compounded Hing are material errors.
for(const [grade,limits] of [['hing',[15,2.5,12,1]],['hingra',[20,8,50,1]],['compounded',[10,1.5,5]]]){
 const chosen=select(a,grade);assert.deepEqual(chosen.rows.map(r=>r.limit),limits);
 assert.equal(chosen.legalProductApproval,false);assert.equal(chosen.batchRelease,false);
 assert(chosen.rows.every(r=>r.referenceOnly&&!r.autoApply&&!r.dryBasisSpecified));
 assert.equal(chosen.rows[2].operator,'>=');assert.equal(chosen.rows[2].solventAlcoholPercent,90);
 assert.equal(chosen.rows[2].methodReference,'U.S.P. 1936');
 assert.equal((gradeMarkup(a,grade).match(/<th scope="row">/g)||[]).length,limits.length);
}
assert(!select(a,'compounded').rows.some(r=>r.parameter==='starch'));
assert.match(gradeMarkup(a,'compounded'),/Do not copy the 1%/);
for(const grade of ['',null,undefined,'Hing','__proto__','constructor',[],{}])assert.equal(select(a,grade),null);
assert.equal(select(null,'hing'),null);
assert.match(gradeMarkup(a,''),/No grade is inferred/);
assert.match(markup({...a,report:'report.md'},true),/substitution is not established/);
assert(!markup({...a,report:'report.md'},false).includes('Recipe 13.1'));
const unsafe=structuredClone(a);unsafe.grades[0].label='<script>alert(1)</script>';
assert(!gradeMarkup(unsafe,'hing').includes('<script>'));
assert.equal(a.recipe.botanicalLiteral,'Asfoetida/ Ferula asfoetida Regel.');
const hashes={gazette2011:'bd31da71e3a3ea438d53e095187b72c337d89a0089bcfcc862ce252979e94f63',spices2024:'7f7cd2a3a5efd6f114299872d45ef2b1b50260818bf695be6cefe4430547a447',recipe2025:'498d6f579357e7bb8e8d7b9f7741db5863f6eea8d29ffd559ff9add7d32d7edc',ayurveda2022:'1ae8cfc632fad0a775316a84999a48adb6cf4b47d05bd4faa75f5190c511f699'};
for(const [key,hash] of Object.entries(hashes))assert.equal(a.sources[key].sha256,hash);
const ctx={window:{},URL};vm.createContext(ctx);
for(const n of ['full-catalogue-533.js','review-status-data.js'])vm.runInContext(read(n),ctx);
const data=JSON.parse(JSON.stringify(ctx.window.PMSV_REVIEW_REGISTER)),catalogue=JSON.parse(JSON.stringify(ctx.window.PMSV_CATALOGUE));
const {validateReview}=require('../fssai-helper/review-status.js');assert.equal(validateReview(data,catalogue).ok,true);
const recipe=data.records.find(r=>r.id===a.recipeProductId);
assert.equal(recipe.reports[0].round,76);assert(recipe.reports.some(r=>r.round===75));
assert.match(recipe.sourceReviewResult,/R76/);assert.match(recipe.sourceReviewResult,/IS 10500/);
assert.equal(data.asafoetidaReview.rows.length,11);assert.equal(data.legalProductApprovals,0);
const changes=[d=>delete d.asafoetidaReview,d=>d.asafoetidaReview.rows.pop(),d=>d.asafoetidaReview.rows[2].limit=50,d=>d.asafoetidaReview.rows[6].limit=12,d=>d.asafoetidaReview.rows[0].dryBasisSpecified=true,d=>d.asafoetidaReview.rows[2].solventAlcoholPercent=95,d=>d.asafoetidaReview.rows[2].operator='<=',d=>d.asafoetidaReview.rows[0].autoApply=true,d=>d.asafoetidaReview.rows[0].originalSource.pdfPage=115,d=>d.asafoetidaReview.recipe.partUsed='Flower',d=>d.asafoetidaReview.recipe.automaticGrade='compounded',d=>d.asafoetidaReview.recipeSubstitutionApproved=true,d=>d.asafoetidaReview.ingredientGapsClosed=1,d=>d.asafoetidaReview.fullCurrentLawComplete=true,d=>d.asafoetidaReview.batchRelease=true,d=>d.asafoetidaReview.sources.gazette2011.url='https://example.com/source.pdf'];
for(const change of changes){const damaged=structuredClone(data);change(damaged);assert.equal(validateReview(damaged,catalogue).ok,false);}
console.log(`R76 PASS: 11 original-source limits, three separate grades, Hingu identity and water preservation, four fingerprints and ${changes.length} altered-evidence refusals.`);
