import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const canned=require('../fssai-helper/canned-tomatoes.js');
const shared=require('../fssai-helper/culinary-sauces.js');
const containers=require('../fssai-helper/tomato-containers.js');
const {validateReview}=require('../fssai-helper/review-status.js');
const read=file=>fs.readFileSync(new URL('../fssai-helper/'+file,import.meta.url),'utf8');
const ctx=vm.createContext({window:{}});
for (const name of ['full-catalogue-533.js','review-status-data.js']) vm.runInContext(read(name),ctx);
const all=ctx.window.PMSV_CATALOGUE, register=JSON.parse(JSON.stringify(ctx.window.PMSV_REVIEW_REGISTER));
const r=register.cannedTomatoReview;
assert(validateReview(register,all).ok);
assert.equal(r.round,89);
assert(register.latestRound>=89 && register.sourceFiles.includes(r.report.replace('.md','.json')));
assert.equal(all.find(item=>item.id===r.id).priority,186);
assert.equal(register.records.filter(x=>x.legalArticleDecision==='OPEN').length,137);
assert(!register.records.some(x=>x.id===r.id));
const checks=(style,peel,medium,agent)=>canned.styleRules(r,style,peel,medium,agent);
for (const form of ['whole','diced','sliced','wedges','pulp','crushed','chopped']) {
  for (const peel of ['peeled','unpeeled']) {
    const {calcium,peel:area}=checks(form,peel,'water','yes');
    const whole=form==='whole';
    assert.equal(calcium.maximum,whole?0.045:0.080);
    assert.equal(area.maximum,whole?30:125);
    assert.equal(area.provision,peel==='peeled'?'(7)(2)':'(7)(3)');
    assert.equal(shared.compare(area,'stated',String(area.maximum)),'Meets this maximum');
    assert.equal(shared.compare(area,'stated',area.maximum+'.000000000001'),'Above this maximum');
    const cutoff=whole?'0.045':'0.080';
    assert(shared.criterionCard(calcium,'ct').includes(cutoff+'%'));
    assert(shared.criterionLines(calcium,{querySelector:()=>({value:''})})[0].includes(cutoff+'%'));
    assert.equal(shared.compare(calcium,'stated',cutoff),'Meets this maximum');
    assert.equal(shared.compare(calcium,'stated',cutoff+'0000000001'),'Above this maximum');
  }
}
for (const m of ['juice','puree','water']) assert(checks('whole','peeled',m,'yes').calcium);
for (const m of ['','solid','other']) assert(!checks('whole','peeled',m,'yes').calcium);
for (const a of ['','unknown','no']) assert(!checks('whole','peeled','water',a).calcium);
assert.deepEqual(checks('','peeled','water','yes'),{});
assert.equal(checks('whole','','water','yes').peel,undefined);
for (const [rule,input] of [[r.salt,'3'],[r.ph,'4.5'],[r.blemish,'3.5']]) {
  assert.equal(shared.compare(rule,'stated',input),'Meets this maximum');
  assert.equal(shared.compare(rule,'other',input),'Different reporting basis · cannot compare');
}
assert.equal(shared.compare(r.blemish,'stated','125.05'),'Above this maximum');
assert.equal(shared.compare(r.blemish,'stated','-2'),'Enter a non-negative measurement in cm²/kg');
const drain=(d,n)=>canned.drainedOutcome(r.can.drainedMinimumPercent,d,n);
assert.equal(drain('224','400'),'56.0% · Meets this minimum');
assert.equal(drain('223.99999999999999999','400'),'55.99…% · Below this minimum');
assert.equal(drain('.056','.1'),'56.0% · Meets this minimum');
assert.equal(drain('227','400'),'56.75% · Meets this minimum');
for (const n of ['0','-2','1e3']) assert.match(drain('1',n),/positive/);
assert.match(drain('401','400'),/exceeds/);
assert.match(drain('', '400'),/Enter/);
assert.equal(drain('0','400'),'0.0% · Below this minimum');
for (const [pack,volume] of [['glass','252'],['can','270'],['other','270']]) {
  const v=containers.fillAssessment(r.fill,pack,'stated',volume,'300','product');
  assert.equal(v.minimumMl,volume);
  assert.equal(v.outcome,'90.0% · Meets this minimum');
}
const doc=read(r.report);
for (const src of Object.values(r.sources)) assert(doc.includes(src.sha256) && doc.includes(src.url+'#page='+src.page));
for (const tamper of [
  x=>x.id='tomato-juice',x=>x.clause='2.3.8',x=>x.can.drainedMinimumPercent=50,x=>x.can.vacuum='Positive',
  x=>x.can.headspaceMaximumMm=8,x=>x.fill.waterTemperatureC=20,x=>x.fill.glassDeductionMl=0,
  x=>x.calcium.whole=0.08,x=>x.calcium.nonwhole=0.045,x=>x.calcium.precision=1,x=>x.peel.nonwhole=30,
  x=>x.peel.unpeeledProvision='(7)(2)',x=>x.blemish.maximum=35,x=>x.salt.basis='Total salt',x=>x.ph.maximum=5,
  x=>x.calcium.unit='mm',x=>x.naturalChloridesPercentOfDryWeight=0,x=>x.sources.amendment.page=10,x=>x.sources.method.sha256=''
]) {
  const copy=structuredClone(register);tamper(copy.cannedTomatoReview);assert.equal(validateReview(copy,all).ok,false);
}
console.log('R89 verified canned tomato identity, style and peel limits, conditional covering liquid results, drained weight, fill and source pages.');
