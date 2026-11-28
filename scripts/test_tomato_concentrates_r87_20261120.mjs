import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const helper = require('../fssai-helper/culinary-sauces.js');
const {validateReview} = require('../fssai-helper/review-status.js');
const read = file => fs.readFileSync(new URL('../fssai-helper/'+file,import.meta.url),'utf8');
const context = vm.createContext({window:{}});
for (const name of ['full-catalogue-533.js','review-status-data.js']) vm.runInContext(read(name),context);
const register = JSON.parse(JSON.stringify(context.window.PMSV_REVIEW_REGISTER));
const catalogue = context.window.PMSV_CATALOGUE, review = register.tomatoConcentrateReview;
const report = read(review.report);
assert.equal(validateReview(register,catalogue).ok,true);
assert.equal(review.round,87);
assert(register.latestRound>=review.round);
assert(register.sourceFiles.includes(review.report.replace('.md','.json')));
assert.equal(register.records.some(r=>r.id===review.id),false);
assert.equal(register.records.filter(r=>r.legalArticleDecision==='OPEN').length,137);
assert.deepEqual(Array.from(catalogue).filter(p=>helper.article(register,p.id)?.round===87).map(p=>p.priority),[189]);
for (const key of [undefined,'','unknown','tomato paste']) {
 const a = helper.article(register,review.id,key);
 assert.equal(a.form,undefined);
 assert.equal(a.criteria.length,0);
 assert.equal(a.tableRow,undefined);
 const html = helper.markup(a);
 assert(html.includes('Tomato purée 9.0%') && html.includes('Tomato paste 25.0%'));
 assert(!html.includes('paste-solids-result') && !html.includes('id="paste-lot"'));
}
for (const [key,row,minimum,below,expectedAt12] of [
 ['puree',1,9,'8.9999999999999999','Meets this minimum'],
 ['paste',2,25,'24.9999999999999999','Below this minimum']
]) {
 const a = helper.article(register,review.id,key);
 assert.equal(a.clause,'2.3.14');
 assert.equal(a.tableRow,row);
 assert.equal(a.form.key,key);
 assert.equal(a.criteria.length,1);
 const c = a.criteria[0];
 assert.equal(c.key,'solids');
 assert.equal(c.minimum,minimum);
 assert.equal(c.basis,'Finished product, % (w/w)');
 assert.equal(helper.compare(c,'stated',String(minimum)),'Meets this minimum');
 assert.equal(helper.compare(c,'stated',below),'Below this minimum');
 assert.equal(helper.compare(c,'stated','12.0'),expectedAt12);
 assert.equal(helper.compare(c,'stated','25.0'),'Meets this minimum');
 assert.equal(helper.compare(c,'other','32.0'),'Different reporting basis · cannot compare');
 assert.equal(helper.compare(c,'','32.0'),'Confirm the reporting basis');
 assert.equal(helper.compare(c,'stated',''),'Awaiting a result');
 assert.match(helper.fillOutcome(a.fill,'rigid','270','300'),/^90\.0% · Meets/);
 assert.match(helper.fillOutcome(a.fill,'rigid','269.99999999999999999','300'),/Below/);
 assert.match(helper.fillOutcome(a.fill,'flexible','270','300'),/does not apply/);
 const html = helper.markup(a);
 assert(html.includes('FSSAI 2.3.14(2), row '+row) && html.includes('FSSAI 2.3.14(3)'));
 assert(html.includes('paste-solids-result') && !html.includes('paste-acidity-result') && !html.includes('paste-nitrogen-result'));
 assert(!html.includes('Retort or aseptic process?'));
 for (const source of Object.values(a.sources)) {
  assert(html.includes(source.url+'#page='+source.page));
  assert(report.includes(source.sha256) && report.includes(source.url+'#page='+source.page));
 }
}
for (const p of register.tomatoSoybeanReview.products) {
 const a=helper.article(register,p.id,'paste');
 assert.equal(a.forms,undefined);
 assert.equal(a.criteria[0].basis,'Salt-free, % (m/m)');
}
for (const change of [
 r=>{r.id='tomato-juice';},r=>{r.clause='2.3.27';},r=>{r.forms.reverse();},r=>{r.forms[0].minimum=10;},
 r=>{r.forms[1].row=1;},r=>{r.forms[1].label='Ketchup';},r=>{r.forms.pop();},r=>{r.aliases=[];},
 r=>{r.criterion.basis='Salt-free, % (m/m)';},r=>{r.fill.waterTemperatureC=27;},r=>{r.fill.minimumPercent=85;},
 r=>{r.sources.gazette.page=57;},r=>{r.sourcePages.chapter=33;},r=>{r.sources.chapter.sha256=r.sources.gazette.sha256;},
 r=>{r.sources.method.page=35;},r=>{r.sources.method.url='https://example.com/manual.pdf';},r=>{r.method.sha256='';}
]) {
 const copy = structuredClone(register);
 change(copy.tomatoConcentrateReview);
 assert.equal(validateReview(copy,catalogue).ok,false);
}
console.log('R87 verified declared-form selection, both inclusive rows, finished-product basis, source pages and rigid fill.');
