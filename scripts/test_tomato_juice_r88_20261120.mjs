import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const {validateReview}=require('../fssai-helper/review-status.js');
const shared=require('../fssai-helper/culinary-sauces.js');
const juice=require('../fssai-helper/tomato-juice.js');
const read=name=>fs.readFileSync(new URL('../fssai-helper/'+name,import.meta.url),'utf8');
const context=vm.createContext({window:{}});
for (const name of ['full-catalogue-533.js','review-status-data.js']) vm.runInContext(read(name),context);
const register=JSON.parse(JSON.stringify(context.window.PMSV_REVIEW_REGISTER)), catalogue=context.window.PMSV_CATALOGUE;
const r=register.tomatoJuiceReview, report=read(r.report);
assert.equal(validateReview(register,catalogue).ok,true);
assert.equal(r.round,88);
assert(register.latestRound>=88 && register.sourceFiles.includes(r.report.replace('.md','.json')));
assert.equal(register.records.filter(c=>c.legalArticleDecision==='OPEN').length,137);
assert.equal(register.records.some(c=>c.id===r.id),false);
assert.equal(catalogue.find(c=>c.id===r.id).priority,7);
assert.equal(shared.article(register,r.id),null);
const rules=[...r.criteria,r.can.headspace];
const expected=[
 ['solids','minimum',5,3,'4.999999999999999999'],['salt','maximum',3,4,'3.000000000000000001'],
 ['titratable','maximum',10,5,'10.00000000000000001'],['volatile','maximum',0.4,6,'0.40000000000000001'],
 ['ph','maximum',4.5,7,'4.500000000000000001'],['sugar','maximum',42,8,'42.000000000000000001'],
 ['impurities','maximum',0.1,undefined,'0.100000000000000001'],['headspace','maximum',7,2,'7.000000000000000001']
];
for (const [i,[key,direction,threshold,row,outside]] of expected.entries()) {
 const c=rules[i];
 assert.equal(c.key,key); assert.equal(c[direction],threshold); assert.equal(c.row,row);
 assert.equal(shared.compare(c,'stated',String(threshold)),'Meets this '+direction);
 assert.equal(shared.compare(c,'stated',outside),direction==='minimum'?'Below this minimum':'Above this maximum');
 assert.equal(shared.compare(c,'other',String(threshold)),'Different reporting basis · cannot compare');
 assert.equal(shared.compare(c,'',String(threshold)),'Confirm the reporting basis');
 assert.equal(shared.compare(c,'stated',''),'Awaiting a result');
 assert(!/Meets|Above|Below/.test(shared.compare(c,'stated','unreadable')));
}
assert.equal(shared.compare(r.can.headspace,'stated','101'),'Above this maximum');
assert.equal(shared.compare(r.can.headspace,'stated','-1'),'Enter a non-negative measurement in mm');
assert.equal(shared.compare(r.criteria[4],'stated','4.50'),'Meets this maximum');
assert.equal(shared.compare(r.criteria[0],'stated','102'),'Enter a percentage from 0 to 100');
assert.equal(r.criteria[6].paragraph,2);
for (const [sign,outcome] of [['negative','Meets the negative-vacuum requirement'],['nonnegative','Does not meet the negative-vacuum requirement'],
 ['unknown','Confirm the gauge sign convention'],['','Awaiting a vacuum observation']]) assert.equal(juice.vacuumOutcome(sign),outcome);
const fill=(pack,amount,capacity,basis='stated')=>juice.fillAssessment(r.fill,pack,basis,amount,capacity);
assert.deepEqual(fill('glass','252','300'),{referenceMl:'280',minimumMl:'252',outcome:'90.0% · Meets this minimum'});
assert.deepEqual(fill('can','252','300'),{referenceMl:'300',minimumMl:'270',outcome:'84.0% · Below this minimum'});
assert.deepEqual(fill('other','270','300'),{referenceMl:'300',minimumMl:'270',outcome:'90.0% · Meets this minimum'});
assert.match(fill('glass','251.999999999999999999','300').outcome,/Below/);
assert.match(fill('glass','280.00000000000000001','300').outcome,/Meets/);
assert.match(fill('glass','301','300').outcome,/exceeds the full measured/);
assert.match(fill('glass','290','300').outcome,/103.57…% · Meets/);
assert.deepEqual(fill('glass','.009','20.01'),{referenceMl:'0.01',minimumMl:'0.009',outcome:'90.0% · Meets this minimum'});
for (const capacity of ['20','19.99','0.001']) assert.match(fill('glass','0',capacity).outcome,/exceed the 20 mL/);
assert.match(fill('can','-1','300').outcome,/non-negative/);
assert.match(fill('can','50','0').outcome,/positive/);
assert.match(fill('other','50','').outcome,/Enter the full/);
assert.deepEqual(fill('glass','','300'),{referenceMl:'280',minimumMl:'252',outcome:'Enter the volume occupied by juice'});
for (const basis of ['other','','20c','adjusted']) assert.deepEqual(fill('glass','252','300',basis),{outcome:'Confirm the full distilled-water capacity at 27 °C'});
for (const type of ['','unknown','invalid']) assert.deepEqual(fill(type,'300','300'),{outcome:'Confirm the container material'});
for (const source of [r.amendment,...Object.values(r.sources)]) {
 assert(report.includes(source.sha256));
 assert(report.includes(source.url+'#page='+source.page));
}
assert(report.includes(r.amendment.url+'#page=11'));
assert(juice.markup(r).includes('FSSAI 2.3.8(2)') && juice.markup(r).includes('FSSAI 2.3.8(5), row 8'));
const copy=()=>structuredClone(register);
for (const tamper of [
 j=>{j.id='04-04-2-canned-tomatoes';}, j=>{j.clause='2.3.14';}, j=>{j.criteria.reverse();}, j=>{j.criteria[0].minimum=4;},
 j=>{j.criteria[2].basis=j.criteria[3].basis;}, j=>{j.criteria[4].unit='%';}, j=>{j.criteria[6].paragraph=5;},
 j=>{j.criteria[5].minimum=42;}, j=>{j.can.headspace.maximum=10;}, j=>{j.can.vacuum.requirement='Positive';},
 j=>{j.fill.glassDeductionMl=0;}, j=>{j.fill.waterTemperatureC=20;}, j=>{j.amendment.fillPage=10;},
 j=>{j.amendment.date='2017-11-21';}, j=>{j.amendment.sha256=j.sources.chapter.sha256;}, j=>{j.sources.method.page=9;}
]) {
 const corrupted=copy();tamper(corrupted.tomatoJuiceReview);
 assert.equal(validateReview(corrupted,catalogue).ok,false);
}
console.log('R88 verified seven laboratory checks, two can-specific requirements, glass and non-glass volume calculations, source history and basis isolation.');
