import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const helper = require('../fssai-helper/culinary-sauces.js');
const {validateReview} = require('../fssai-helper/review-status.js');
const read = f => fs.readFileSync(new URL('../fssai-helper/'+f,import.meta.url),'utf8');
const c = vm.createContext({window:{}});
for (const name of ['full-catalogue-533.js','review-status-data.js']) vm.runInContext(read(name),c);
const catalogue = c.window.PMSV_CATALOGUE;
const register = JSON.parse(JSON.stringify(c.window.PMSV_REVIEW_REGISTER));
const review = register.culinarySauceReview;
const ginger = register.gingerPasteReview;
assert.equal(validateReview(register,catalogue).ok,true);
assert.equal(review.round,85);
assert(register.latestRound >= review.round);
assert.equal(register.sourceFiles.includes('ctr-culinary-sauces-r85-2026-11-20.json'),true);
assert.equal(register.records.filter(x=>x.legalArticleDecision==='OPEN').length,137);
assert.equal(register.ayurvedaIngredientCoverage.candidateLinks,112);
const rows = review.rows;
assert.deepEqual(rows.map(r=>[r.number,r.solids,r.acidity,r.products.length]),[[1,8,1,1],[2,15,1.2,1],[3,8,1,2],[4,3,1,1]]);
const eligible = new Set(catalogue.filter(p=>p.fssr==='2.3.28').map(p=>p.id));
assert.deepEqual([...eligible].sort(),rows.flatMap(r=>r.products.map(p=>p.id)).sort());
for (const p of catalogue) {
 const a = helper.article(register,p.id);
 if (['2.3.14','2.3.27','2.3.29'].includes(p.fssr)) {
  assert.equal(a.clause,p.fssr);
  assert.equal(a.tableRow,undefined);
  assert(a.round > review.round);
  continue;
 }
 if (!eligible.has(p.id) && p.id !== ginger.recipe.productId) {
  assert.equal(a,null);
  assert.equal(helper.markup(a),'');
  assert.deepEqual(helper.briefLines(a,{querySelector:()=>{throw Error('Unrelated product');}}),[]);
  continue;
 }
 assert.equal(a.id,p.id);
 assert.equal(a.ingredient===true,p.id===ginger.recipe.productId);
 assert.equal(Boolean(a.fill),eligible.has(p.id));
 const html = helper.markup(a);
 assert.equal(html.includes('Check container fill'),eligible.has(p.id));
 assert.equal((html.match(/class="paste-criterion"/g)||[]).length,2);
 for (const source of [review.sources.gazette,review.sources.chapter,review.sources.proposal]) {
  assert(html.includes(source.url+'#page='+source.page+'"'));
  assert(read(review.report).includes(source.sha256));
 }
 assert(a.criteria.every(t=>helper.compare(t,'stated',t.minimum.toFixed(1))==='Meets this minimum'));
}
const fruit = helper.article(register,rows[1].products[0].id);
for (const [raw,expected] of [['1.19999999999999999999999','Below this minimum'],['1.2','Meets this minimum'],
 ['0001.2000','Meets this minimum'],['1.200000000000001','Meets this minimum'],['.99','Below this minimum'],
 ['0','Below this minimum'],['100.0000000000000001','Enter a percentage from 0 to 100']]) {
 assert.equal(helper.compare(fruit.criteria[1],'stated',raw),expected);
}
const fill=review.fill;
for (const [pack,product,water,match] of [
 ['rigid','270','300',/^90\.0% · Meets this minimum$/],
 ['rigid','270.0000','300',/^90\.0% · Meets this minimum$/],
 ['rigid','27','30.0000000000000001',/^89\.99…% · Below this minimum$/],
 ['rigid','0.09','0.1',/^90\.0% · Meets this minimum$/],
 ['rigid','271','300',/^90\.33…% · Meets this minimum$/],
 ['rigid','0','300',/^0\.0% · Below this minimum$/],['rigid','300','300',/^100\.0% · Meets this minimum$/],
 ['rigid','300.000000000000000001','300',/exceeds/],['rigid','-23','300',/valid volumes/],
 ['rigid','270','0',/greater than zero/],['rigid','','50',/Enter both volumes/],['rigid','10','',/Enter both volumes/],
 ['rigid','7 g','100',/valid volumes/],['rigid','100','1e2',/valid volumes/],
 ['unknown','270','300',/Confirm the container/],['','270','300',/Confirm the container/],
 ['flexible','270','300',/does not apply/]
]) assert.match(helper.fillOutcome(fill,pack,product,water),match);
for (const alter of [
 r=>{r.rows[1].acidity=1;},r=>{r.rows[2].products.reverse();},r=>{r.rows[0].number=3;},
 r=>{r.rows[2].products[1].id='12-12-6-tomato-ketchup-and-tomato-sauce';},
 r=>{r.rows[0].products[0].label='Tomato sauce';},r=>{r.rows[3].solids=8;},r=>{r.fill.pack='flexible';},r=>{r.fill.volumeUnit='g';},
 r=>{r.fill.minimumPercent=85;},r=>{r.fill.waterTemperatureC=25;},r=>{r.sources.gazette.page=61;},
 r=>{r.sources.proposal.sha256=r.sources.chapter.sha256;}
]) {
 const copy=structuredClone(register);
 alter(copy.culinarySauceReview);
 assert.equal(validateReview(copy,catalogue).ok,false);
}
console.log('R85 checked four official rows, five product mappings, the purchased-ginger recipe, exact thresholds, package scope and cross-product isolation.');
