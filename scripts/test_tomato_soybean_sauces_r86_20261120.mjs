import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const helper = require('../fssai-helper/culinary-sauces.js');
const {validateReview} = require('../fssai-helper/review-status.js');
const read = file => fs.readFileSync(new URL('../fssai-helper/' + file,import.meta.url),'utf8');
const context = vm.createContext({window:{}});
for (const file of ['full-catalogue-533.js','review-status-data.js']) vm.runInContext(read(file),context);
const register = JSON.parse(JSON.stringify(context.window.PMSV_REVIEW_REGISTER));
const catalogue = context.window.PMSV_CATALOGUE;
const review = register.tomatoSoybeanReview;
const [tomato,soybean] = review.products;
const report = read(review.report);
assert.equal(validateReview(register,catalogue).ok,true);
assert(register.latestRound >= review.round && review.round === 86);
assert(register.sourceFiles.includes(review.report.replace('.md','.json')));
assert.equal(register.records.filter(r=>r.legalArticleDecision==='OPEN').length,137);
assert.equal(register.ayurvedaIngredientCoverage.candidateLinks,112);
assert.deepEqual(review.products.map(p=>[p.clause,p.originalMinima,p.minima]),[
 ['2.3.27',{solids:25,acidity:1},{solids:25,acidity:0.2}],
 ['2.3.29',{solids:25,acidity:0.6},{solids:15,acidity:0.6,nitrogen:1}]
]);

for (const [p,priority,chapterPage,gazettePage,amendmentPage] of [[tomato,424,33,61,29],[soybean,429,35,62,24]]) {
 const row = catalogue.find(c=>c.id===p.id);
 const a = helper.article(register,p.id);
 assert.equal(row.priority,priority);
 assert.equal(a.clause,row.fssr);
 assert(!register.records.some(r=>r.id===p.id));
 assert.deepEqual(a.criteria.map(c=>[c.key,c.minimum]),Object.entries(p.minima));
 assert.equal(a.sources.chapter.page,chapterPage);
 assert.equal(a.sources.gazette.page,gazettePage);
 assert.equal(a.sources.amendment.page,amendmentPage);
 assert.equal(a.sources.proposal,undefined);
 assert.equal(a.tableRow,undefined);
 const html = helper.markup(a);
 assert(html.includes('FSSAI '+p.clause+'(2)') && html.includes('FSSAI '+p.clause+'(3)'));
 assert(html.includes(p.change));
 assert.doesNotMatch(html,/retort|aseptic|2\.3\.28|added colour|caramel/i);
 for (const source of Object.values(a.sources)) {
  assert(new URL(source.url).hostname==='fssai.gov.in');
  assert(report.includes(source.sha256));
  assert(html.includes(source.url+'#page='+source.page+'"') && report.includes(source.url+'#page='+source.page));
 }
 assert.match(helper.fillOutcome(a.fill,'rigid','270','300'),/^90\.0% · Meets/);
 assert.match(helper.fillOutcome(a.fill,'rigid','269.999999999999999999','300'),/Below/);
 assert.match(helper.fillOutcome(a.fill,'flexible','',''),/does not apply/);
 for (const c of a.criteria) {
  assert.equal(helper.compare(c,'stated',c.minimum.toFixed(1)),'Meets this minimum');
  assert.equal(helper.compare(c,'other','8'),'Different reporting basis · cannot compare');
  assert.equal(helper.compare(c,'','8'),'Confirm the reporting basis');
  assert.equal(helper.compare(c,'stated',''),'Awaiting a result');
 }
 assert.equal(helper.compare(a.criteria[1],'stated',p===tomato?'0.19999999999999999':'0.59999999999999999'),'Below this minimum');
}
const nitrogen = helper.article(register,soybean.id).criteria[2];
assert.equal(nitrogen.basis,'% (m/m) as nitrogen');
assert.match(nitrogen.otherBasis,/Protein.*amino nitrogen.*g\/100 mL/);
assert.equal(helper.compare(nitrogen,'stated','.999999999999999999999'),'Below this minimum');
assert.equal(helper.compare(nitrogen,'stated','1.000000000000000000000'),'Meets this minimum');
assert.equal(catalogue.filter(c=>helper.article(register,c.id)?.round===86).length,2);
assert.equal(helper.article(register,register.gingerPasteReview.productId).round,85);

for (const mutate of [
 r=>{r.products.pop();}, r=>{r.products.reverse();}, r=>{r.products[0].clause='2.3.28';},
 r=>{r.products[0].id=r.products[1].id;}, r=>{r.products[0].aliases=[];},
 r=>{r.products[0].minima.acidity=1;}, r=>{r.products[0].minima.nitrogen=1;},
 r=>{r.products[1].minima.solids=25;}, r=>{delete r.products[1].minima.nitrogen;},
 r=>{r.products[1].originalMinima.nitrogen=1;}, r=>{r.products[0].amendment.date='2018-11-27';},
 r=>{r.products[1].amendment.page=23;}, r=>{r.products[1].chapterPage=34;},
 r=>{r.products[1].amendment.sha256=r.sources.chapter.sha256;}, r=>{r.sources.gazette.url=r.sources.chapter.url;},
 r=>{r.nitrogenBasis.basis='Protein %';}, r=>{r.fill.minimumPercent=89;}, r=>{r.fill.waterTemperatureC=25;}
]) {
 const copy = structuredClone(register);
 mutate(copy.tomatoSoybeanReview);
 assert.equal(validateReview(copy,catalogue).ok,false);
}
console.log('R86 checked two amended sauce standards, five composition entries, basis, legal sources, pack fill and identity isolation.');
