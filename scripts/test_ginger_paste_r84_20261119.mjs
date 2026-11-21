import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const helper = require('../fssai-helper/ginger-paste.js');
const {validateReview} = require('../fssai-helper/review-status.js');
const read = file => fs.readFileSync(new URL('../fssai-helper/' + file,import.meta.url),'utf8');
const ctx = vm.createContext({window:{}});
for (const f of ['full-catalogue-533.js','review-status-data.js']) vm.runInContext(read(f),ctx);
const catalogue = ctx.window.PMSV_CATALOGUE;
const register = JSON.parse(JSON.stringify(ctx.window.PMSV_REVIEW_REGISTER));
const review = register.gingerPasteReview;
const [solids,acidity] = review.criteria;
const krishara = review.recipe.productId;
assert.equal(validateReview(register,catalogue).ok,true);
assert.equal(review.round,84);
assert(register.latestRound >= review.round);
assert.equal(register.records.filter(row => row.legalArticleDecision === 'OPEN').length,137);
assert.equal(register.ayurvedaIngredientCoverage.candidateLinks,112);
assert.equal(register.records.find(row => row.id === review.productId),undefined);
assert.deepEqual(register.records.filter(row => row.reports.some(r => r.round === 84)).map(row => row.id),[krishara]);
assert.deepEqual(review.criteria.map(c => [c.label,c.basis,c.minimum]),[
  ['Total soluble solids','Salt-free, % (m/m)',3],['Acidity','% as acetic acid',1]
]);
const src = JSON.parse(read('ctr-remaining-source-scope-r69-2026-11-14.json')).sources;
assert.equal(review.sources.chapter.sha256,src.fruit.sha256);
assert(read(review.report).includes(review.sources.gazette.sha256));
assert.deepEqual(review.acidityProposal,{date:'2024-06-05',status:'draft',exemptionApplied:false});
assert(read(review.report).includes(review.sources.chapter.url + '#page=34'));
for (const [criterion,raw,basis,expected] of [
  [solids,'3','stated','Meets this minimum'],[acidity,'1.000','stated','Meets this minimum'],
  [solids,'2.9999999999999999999','stated','Below this minimum'],[acidity,'.99','stated','Below this minimum'],
  [solids,'0','stated','Below this minimum'],[solids,'99.999','stated','Meets this minimum'],
  [acidity,'100.0001','stated','Enter a percentage from 0 to 100'],[solids,'100.0','stated','Meets this minimum'],
  [solids,'0','','Confirm the reporting basis'],[acidity,'7.5','other','Different reporting basis · cannot compare'],
  [solids,'','stated','Awaiting a result'],[acidity,'  ',null,'Awaiting a result'],
  ...['-1','NaN','Infinity','3x','100.00000000000000000001','1e2','<1','3%'].map(v => [solids,v,'stated','Enter a percentage from 0 to 100'])
]) assert.equal(helper.compare(criterion,basis,raw),expected, String(raw));
for (const id of [review.productId,krishara]) {
  const html = helper.markup(review,id);
  assert.equal((html.match(/class="paste-criterion"/g)||[]).length,2);
  assert.equal(html.includes('id="paste-lot"'), id === review.productId);
  for (const s of [review.sources.chapter,review.sources.gazette,review.sources.proposal]) assert(html.includes(s.url + '#page=' + s.page + '"'));
}
for (const p of catalogue.filter(p => p.id !== krishara && p.id !== review.productId)) {
  assert.equal(helper.markup(review,p.id),'');
  assert.deepEqual(helper.briefLines(review,p.id,{querySelector:() => {throw Error('Unrelated product');}}),[]);
}
for (const key of ['ginger','turmeric']) {
  for (const form of ['paste','juice','onsite','whole','fresh','other','',null]) {
    const detail = helper.supplyMarkup(review,krishara,key,form);
    assert.equal(detail.includes('class="paste-criterion"'),key === 'ginger' && form === 'paste');
  }
}
assert.match(helper.supplyNote(review,register.rhizomeSpiceReview.recipes[1].productId,'ginger','paste'),/pieces of ginger/);
for (const mutate of [
  r=>{r.criteria[0].minimum=8;},r=>{r.criteria[1].basis='pH';},r=>{r.criteria.reverse();},r=>{r.tableRow=3;},
  r=>{r.sources.gazette.page=61;},r=>{r.sources.chapter.sha256=src.fruit.sha256.slice(1);},r=>{r.sources.recipe.page=97;},
  r=>{r.recipe.serial=8;},r=>{r.recipe.productId=register.rhizomeSpiceReview.recipes[1].productId;},
  r=>{r.productId='12-12-6-culinary-pastes';},r=>{r.rigidFillMinimumPercent=100;},
  r=>{r.acidityProposal.exemptionApplied=true;},r=>{r.acidityProposal.status='in force';}
]) {
  const copy=structuredClone(register);
  mutate(copy.gingerPasteReview);
  assert.equal(validateReview(copy,catalogue).ok,false);
}
console.log('R84 checked both ginger-paste minima, reporting bases, exact boundary values, two official editions, recipe and catalogue isolation, and 13 altered source records.');
